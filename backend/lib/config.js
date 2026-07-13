/* =====================================================================
   CONFIG — lê TUDO de variáveis de ambiente. Nada de segredo hardcoded.
   - Produção: Vercel → Settings → Environment Variables.
   - Local:    arquivo .env na raiz (git-ignored), via `vercel dev`.
   ===================================================================== */
"use strict";

function required(name) {
  const v = process.env[name];
  if (!v || !String(v).trim()) {
    throw new Error(
      `Variável de ambiente ausente: ${name}. ` +
      `Configure na Vercel (Settings -> Environment Variables) ou no .env local.`
    );
  }
  return String(v).trim();
}

module.exports = {
  // Segredo — obrigatório, só do ambiente. Nunca no código nem no navegador.
  get mongoUri() { return required("MONGO_URI"); },

  // Nomes (não são segredos) — configuráveis por env, com padrão sensato.
  dbName: process.env.MONGO_DB || "cesmac_quiz",
  colSalas: process.env.MONGO_COL_SALAS || "salas",
  colJogadores: process.env.MONGO_COL_JOGADORES || "jogadores",
  colRespostas: process.env.MONGO_COL_RESPOSTAS || "respostas",
  colSessoes: process.env.MONGO_COL_SESSOES || "sessoes",
};
