/* =====================================================================
   HTTP — utilidades compartilhadas pelos endpoints (CORS, body, coleções).
   ===================================================================== */
"use strict";
const { getDb } = require("./db");
const config = require("./config");

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
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

async function cols() {
  const db = await getDb();
  return {
    db,
    salas: db.collection(config.colSalas),
    jogadores: db.collection(config.colJogadores),
    respostas: db.collection(config.colRespostas),
    sessoes: db.collection(config.colSessoes),
  };
}

module.exports = { cors, readBody, cols };
