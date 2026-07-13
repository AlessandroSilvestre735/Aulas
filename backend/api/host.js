/* =====================================================================
   /api/host  — o APLICADOR (index.html) controla e acompanha a partida.

   GET  ?sala=XXXX
        -> estado da sala: jogadores (com online), quantos responderam a
           questão atual e o ranking. O host usa isso em polling.

   POST { sala, action, ... }
        action: "abrir"     -> cria/garante a sala no lobby
                "iniciar"   -> nova partida (zera placar, novo sessionId)
                "questao"   -> inicia uma questão (envia n/tema/correta/letters/time)
                "lock"      -> trava as respostas
                "revelar"   -> revela (devolve a distribuição das respostas)
                "ranking"   -> fase de ranking
                "discussao" -> fase de discussão
                "final"     -> encerra e grava o resumo em 'sessoes'

   O gabarito (correta) só existe no host (quiz-data.js) e é enviado por
   questão; o servidor coordena estado + pontuação. Nenhum segredo no cliente.
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
    console.error("host err:", e && e.message);
    return res.status(500).json({ ok: false, erro: "Falha no servidor" });
  }
};

/* ------------------------------ GET (poll) ------------------------------ */
async function estado(req, res) {
  const sala = Q.str(req.query.sala, 20);
  if (!sala) return res.status(400).json({ ok: false, erro: "sala obrigatória" });

  const { salas, jogadores, respostas } = await cols();
  const room = await salas.findOne({ sala });
  if (!room) return res.status(200).json({ ok: true, existe: false });

  const js = await jogadores.find({ sala }).toArray();

  // Ganho (pontos) da questão atual, por aluno.
  const gainByKey = {};
  let respondidos = 0;
  if (room.qIndex >= 0 && room.sessionId) {
    const ans = await respostas
      .find({ sessionId: room.sessionId, questaoIndex: room.qIndex })
      .toArray();
    respondidos = ans.length;
    ans.forEach((a) => (gainByKey[a.nomeKey] = a.pontos || 0));
  }

  const standings = js
    .map((p) => ({
      nome: p.nome,
      score: p.score || 0,
      gain: gainByKey[p.nomeKey] || 0,
      online: Q.online(p.lastSeen),
    }))
    .sort((a, b) => b.score - a.score || b.gain - a.gain);

  return res.status(200).json({
    ok: true,
    existe: true,
    fase: room.fase,
    qIndex: room.qIndex,
    sessionId: room.sessionId,
    locked: !!room.locked,
    totalQuestoes: room.totalQuestoes || 0,
    online: standings.filter((p) => p.online).length,
    respondidos,
    standings,
  });
}

/* ------------------------------ POST (ação) ----------------------------- */
async function acao(req, res) {
  const body = await readBody(req);
  if (!body) return res.status(400).json({ ok: false, erro: "JSON inválido" });

  const sala = Q.str(body.sala, 20);
  const action = Q.str(body.action, 20);
  if (!sala || !action) return res.status(400).json({ ok: false, erro: "sala e action obrigatórios" });

  const { salas, jogadores, respostas, sessoes } = await cols();
  const agora = new Date();

  if (action === "abrir") {
    const sessionId = Q.str(body.sessionId, 80) || `${sala}-${Date.now()}`;
    await salas.updateOne(
      { sala },
      {
        $setOnInsert: { sala, sessionId, fase: "lobby", qIndex: -1, questao: null, locked: false, criadoEm: agora },
        $set: { totalQuestoes: Q.num(body.totalQuestoes), atualizadoEm: agora },
      },
      { upsert: true }
    );
    const room = await salas.findOne({ sala });
    return res.status(200).json({ ok: true, sessionId: room.sessionId, fase: room.fase });
  }

  if (action === "iniciar") {
    const sessionId = Q.str(body.sessionId, 80) || `${sala}-${Date.now()}`;
    await salas.updateOne(
      { sala },
      { $set: { sessionId, fase: "lobby", qIndex: -1, questao: null, locked: false, atualizadoEm: agora } }
    );
    await jogadores.updateMany({ sala }, { $set: { score: 0 } });
    return res.status(200).json({ ok: true, sessionId });
  }

  if (action === "questao") {
    const q = body.questao || {};
    await salas.updateOne(
      { sala },
      {
        $set: {
          fase: "questao",
          qIndex: Q.num(q.index),
          locked: false,
          questao: {
            n: Q.num(q.n),
            tema: Q.str(q.tema, 200),
            correta: Q.str(q.correta, 4),
            letters: (Array.isArray(q.letters) ? q.letters : []).map((l) => Q.str(l, 4)),
            time: Q.num(q.time) || Q.DEFAULT_TIME,
            startAt: Date.now(),
          },
          atualizadoEm: agora,
        },
      }
    );
    return res.status(200).json({ ok: true });
  }

  if (action === "lock") {
    await salas.updateOne({ sala }, { $set: { locked: true, atualizadoEm: agora } });
    return res.status(200).json({ ok: true });
  }

  if (action === "revelar") {
    await salas.updateOne({ sala }, { $set: { fase: "revelado", locked: true, atualizadoEm: agora } });
    const room = await salas.findOne({ sala });
    const letters = (room.questao && room.questao.letters) || [];
    const dist = {};
    letters.forEach((l) => (dist[l] = 0));
    let corretas = 0;
    if (room.sessionId && room.qIndex >= 0) {
      const ans = await respostas.find({ sessionId: room.sessionId, questaoIndex: room.qIndex }).toArray();
      ans.forEach((a) => {
        dist[a.letra] = (dist[a.letra] || 0) + 1;
        if (a.acertou) corretas++;
      });
      return res.status(200).json({ ok: true, distribuicao: dist, total: ans.length, corretas, correta: room.questao.correta });
    }
    return res.status(200).json({ ok: true, distribuicao: dist, total: 0, corretas: 0 });
  }

  if (action === "ranking") {
    await salas.updateOne({ sala }, { $set: { fase: "ranking", atualizadoEm: agora } });
    return res.status(200).json({ ok: true });
  }

  if (action === "discussao") {
    await salas.updateOne({ sala }, { $set: { fase: "discussao", atualizadoEm: agora } });
    return res.status(200).json({ ok: true });
  }

  if (action === "final") {
    await salas.updateOne({ sala }, { $set: { fase: "final", atualizadoEm: agora } });
    const room = await salas.findOne({ sala });
    const js = await jogadores.find({ sala }).sort({ score: -1 }).toArray();
    const ranking = js.map((p, i) => ({ posicao: i + 1, aluno: p.nome, pontos: p.score || 0 }));
    if (room.sessionId) {
      await sessoes.updateOne(
        { sessionId: room.sessionId },
        {
          $set: { sessionId: room.sessionId, sala, fimEm: agora, totalQuestoes: room.totalQuestoes, ranking, atualizadoEm: agora },
          $setOnInsert: { criadoEm: agora },
        },
        { upsert: true }
      );
    }
    return res.status(200).json({ ok: true, ranking });
  }

  return res.status(400).json({ ok: false, erro: "action desconhecida" });
}
