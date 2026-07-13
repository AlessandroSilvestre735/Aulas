/* =====================================================================
   POST /api/log  — grava as interações do quiz no MongoDB.

   Quem envia é o HOST (index.html / host.js), que já reúne resposta,
   acerto, tempo e pontos de todos os alunos. Nenhum segredo trafega
   pelo navegador — a URI do Mongo fica só no ambiente do servidor.

   Corpo (JSON):
     { tipo:"respostas", sessionId, sala,
       questao:{index,n,tema,correta},
       respostas:[{aluno,letra,acertou,tempoMs,pontos}], enviadoEm }

     { tipo:"sessao", sessionId, sala, inicioEm, fimEm,
       totalQuestoes, ranking:[{posicao,aluno,pontos}] }
   ===================================================================== */
"use strict";
const { getDb } = require("../lib/db");
const config = require("../lib/config");

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function readBody(req) {
  if (req.body && typeof req.body === "object") return Promise.resolve(req.body);
  return new Promise((resolve) => {
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", () => { try { resolve(raw ? JSON.parse(raw) : {}); } catch { resolve(null); } });
    req.on("error", () => resolve(null));
  });
}

const str = (v, max = 200) => (v == null ? "" : String(v)).slice(0, max);
const num = (v) => (Number.isFinite(+v) ? +v : 0);

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ ok: false, erro: "Use POST" });

  const body = await readBody(req);
  if (!body || typeof body !== "object") return res.status(400).json({ ok: false, erro: "JSON invalido" });

  const tipo = str(body.tipo, 20);
  const sessionId = str(body.sessionId, 80);
  const sala = str(body.sala, 20);
  if (!sessionId || !sala) return res.status(400).json({ ok: false, erro: "sessionId e sala sao obrigatorios" });

  try {
    const db = await getDb();
    const agora = new Date();

    if (tipo === "respostas") {
      const q = body.questao || {};
      const lista = Array.isArray(body.respostas) ? body.respostas : [];
      if (!lista.length) return res.status(200).json({ ok: true, inseridos: 0 });
      const docs = lista.slice(0, 500).map((r) => ({
        sessionId, sala,
        questaoIndex: num(q.index),
        questaoN: num(q.n),
        tema: str(q.tema, 200),
        correta: str(q.correta, 4),
        aluno: str(r.aluno, 60),
        letra: str(r.letra, 4),
        acertou: !!r.acertou,
        tempoMs: num(r.tempoMs),
        pontos: num(r.pontos),
        criadoEm: agora,
      }));
      const out = await db.collection(config.colRespostas).insertMany(docs, { ordered: false });
      return res.status(200).json({ ok: true, inseridos: out.insertedCount });
    }

    if (tipo === "sessao") {
      const ranking = (Array.isArray(body.ranking) ? body.ranking : []).slice(0, 500).map((r) => ({
        posicao: num(r.posicao),
        aluno: str(r.aluno, 60),
        pontos: num(r.pontos),
      }));
      await db.collection(config.colSessoes).updateOne(
        { sessionId },
        {
          $set: {
            sessionId, sala,
            inicioEm: body.inicioEm ? new Date(num(body.inicioEm)) : null,
            fimEm: agora,
            totalQuestoes: num(body.totalQuestoes),
            ranking,
            atualizadoEm: agora,
          },
          $setOnInsert: { criadoEm: agora },
        },
        { upsert: true }
      );
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ ok: false, erro: "tipo desconhecido (use 'respostas' ou 'sessao')" });
  } catch (e) {
    console.error("Erro ao gravar log:", e && e.message);
    return res.status(500).json({ ok: false, erro: "Falha ao gravar" });
  }
};
