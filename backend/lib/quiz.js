/* =====================================================================
   QUIZ — utilidades do backend (espelham a regra do frontend common.js).
   ===================================================================== */
"use strict";

const MAX_POINTS = 1000; // acerto instantâneo
const MIN_POINTS = 500;  // acerto no limite do tempo
const DEFAULT_TIME = 30; // segundos por questão (fallback)
const ONLINE_MS = 8000;  // aluno é "online" se foi visto nos últimos 8s

// Pontuação: mais rápido e certo ganha mais.
function score(correct, elapsedMs, timeSec) {
  if (!correct) return 0;
  const t = Math.max(1, timeSec) * 1000;
  const frac = Math.min(1, Math.max(0, elapsedMs / t));
  return Math.round(MIN_POINTS + (MAX_POINTS - MIN_POINTS) * (1 - frac));
}

function normName(n) {
  return String(n || "").trim().replace(/\s+/g, " ").toLowerCase();
}

const str = (v, max = 200) => (v == null ? "" : String(v)).slice(0, max);
const num = (v) => (Number.isFinite(+v) ? +v : 0);
const online = (lastSeen) => Date.now() - (lastSeen || 0) < ONLINE_MS;

module.exports = { MAX_POINTS, MIN_POINTS, DEFAULT_TIME, ONLINE_MS, score, normName, str, num, online };
