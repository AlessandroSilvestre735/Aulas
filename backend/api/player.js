/* =====================================================================
   /api/player  — o ALUNO (play.html) entra, responde e acompanha.

   POST { sala, action:"entrar", nome }
        -> cadastra na hora (dedup de nome). Devolve o nome final + sessionId.
   POST { sala, action:"responder", nome, qIndex, letra }
        -> registra a resposta; o servidor calcula acerto e pontos.

   GET  ?sala=XXXX&nome=Fulano
        -> visão do aluno (fase, questão SEM gabarito, resultado após revelar).
           Também serve de "heartbeat" (marca presença/online).
   ===================================================================== */
"use strict";
const { cors, readBody, cols } = require("../lib/http");
const Q = require("../lib/quiz");

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  try {
    if (req.method === "GET") return await estado(req, res);
    if (req.method === "POST") return await acao(req, res);
    return res.status(405).json({ ok: false, erro: "Método não suportado" });
  } catch (e) {
    console.error("player err:", e && e.message);
    return res.status(500).json({ ok: false, erro: "Falha no servidor" });
  }
};

/* ------------------------------ GET (poll) ------------------------------ */
async function estado(req, res) {
  const sala = Q.str(req.query.sala, 20);
  const nome = Q.str(req.query.nome, 60);
  if (!sala) return res.status(400).json({ ok: false, erro: "sala obrigatória" });

  const { salas, jogadores, respostas } = await cols();
  const room = await salas.findOne({ sala });
  if (!room) return res.status(200).json({ ok: true, existe: false });

  const nomeKey = Q.normName(nome);
  if (nomeKey) await jogadores.updateOne({ sala, nomeKey }, { $set: { lastSeen: Date.now() } });

  const js = await jogadores.find({ sala }).sort({ score: -1 }).toArray();
  const total = js.length;
  const meIdx = js.findIndex((p) => p.nomeKey === nomeKey);
  const me = meIdx >= 0 ? js[meIdx] : null;
  const rank = meIdx >= 0 ? meIdx + 1 : total;

  let questao = null;
  if (room.fase === "questao" && room.questao) {
    const q = room.questao;
    questao = {
      qIndex: room.qIndex,
      n: q.n,
      total: room.totalQuestoes,
      tema: q.tema,
      letters: q.letters,
      time: q.time,
      restanteMs: Math.max(0, q.startAt + q.time * 1000 - Date.now()),
    };
  }

  let jaRespondeu = false, minhaResposta = null, resultado = null;
  if (nomeKey && room.qIndex >= 0 && room.sessionId) {
    const a = await respostas.findOne({ sessionId: room.sessionId, questaoIndex: room.qIndex, nomeKey });
    if (a) { jaRespondeu = true; minhaResposta = a.letra; }
    if (["revelado", "ranking", "discussao", "final"].includes(room.fase) && room.questao) {
      resultado = {
        correctLetter: room.questao.correta,
        answered: !!a,
        letter: a ? a.letra : null,
        correct: a ? !!a.acertou : false,
        points: a ? a.pontos : 0,
        score: me ? me.score : 0,
        rank,
        total,
      };
    }
  }

  return res.status(200).json({
    ok: true,
    existe: true,
    fase: room.fase,
    qIndex: room.qIndex,
    sessionId: room.sessionId,
    locked: !!room.locked,
    totalQuestoes: room.totalQuestoes || 0,
    questao,
    jaRespondeu,
    minhaResposta,
    resultado,
    me: { nome: me ? me.nome : nome, score: me ? me.score : 0, rank, total },
  });
}

/* ------------------------------ POST (ação) ----------------------------- */
async function acao(req, res) {
  const body = await readBody(req);
  if (!body) return res.status(400).json({ ok: false, erro: "JSON inválido" });

  const sala = Q.str(body.sala, 20);
  const action = Q.str(body.action, 20);
  if (!sala) return res.status(400).json({ ok: false, erro: "sala obrigatória" });

  const { salas, jogadores, respostas } = await cols();
  const room = await salas.findOne({ sala });
  if (!room) return res.status(200).json({ ok: false, existe: false, erro: "Sala não encontrada" });

  if (action === "entrar") {
    let nome = (Q.str(body.nome, 60).trim()) || "Aluno";
    let nomeKey = Q.normName(nome);
    const now = Date.now();

    // Se já existe alguém ONLINE com esse nome, diferencia (Fulano (2), (3)…).
    const existing = await jogadores.findOne({ sala, nomeKey });
    if (existing && Q.online(existing.lastSeen)) {
      const base = nome.replace(/\s*\(\d+\)$/, "");
      for (let i = 2; i <= 99; i++) {
        const cand = `${base} (${i})`;
        const ck = Q.normName(cand);
        const ex = await jogadores.findOne({ sala, nomeKey: ck });
        if (!ex || !Q.online(ex.lastSeen)) { nome = cand; nomeKey = ck; break; }
      }
    }

    await jogadores.updateOne(
      { sala, nomeKey },
      {
        $setOnInsert: { sala, nomeKey, score: 0, entrouEm: new Date(), sessionId: room.sessionId },
        $set: { nome, lastSeen: now },
      },
      { upsert: true }
    );
    return res.status(200).json({ ok: true, existe: true, nome, sessionId: room.sessionId, fase: room.fase });
  }

  if (action === "responder") {
    const nome = Q.str(body.nome, 60);
    const nomeKey = Q.normName(nome);
    const qIndex = Q.num(body.qIndex);
    const letra = Q.str(body.letra, 4).toUpperCase();
    if (!nomeKey) return res.status(400).json({ ok: false, erro: "nome obrigatório" });

    // Só aceita na fase certa, na questão certa, sem trava e no prazo.
    if (room.fase !== "questao" || room.locked || room.qIndex !== qIndex || !room.questao)
      return res.status(200).json({ ok: true, aceito: false });
    if (!(room.questao.letters || []).includes(letra))
      return res.status(200).json({ ok: true, aceito: false });

    const elapsed = Date.now() - room.questao.startAt;
    if (elapsed > room.questao.time * 1000 + 1500)
      return res.status(200).json({ ok: true, aceito: false });

    const correct = letra === room.questao.correta;
    const pontos = Q.score(correct, elapsed, room.questao.time);

    const r = await respostas.updateOne(
      { sessionId: room.sessionId, questaoIndex: qIndex, nomeKey },
      {
        $setOnInsert: {
          sessionId: room.sessionId, sala,
          questaoIndex: qIndex, questaoN: room.questao.n, tema: room.questao.tema, correta: room.questao.correta,
          aluno: nome, nomeKey, letra, acertou: correct, tempoMs: elapsed, pontos, criadoEm: new Date(),
        },
      },
      { upsert: true }
    );
    // Só soma pontos se foi a primeira resposta desta questão (idempotente).
    if (r.upsertedCount === 1) {
      await jogadores.updateOne({ sala, nomeKey }, { $inc: { score: pontos } });
    }
    return res.status(200).json({ ok: true, aceito: true, letra });
  }

  return res.status(400).json({ ok: false, erro: "action desconhecida" });
}
