/* =====================================================================
   COMMON — constantes e utilidades compartilhadas entre host e player.
   ===================================================================== */
window.QZ = (function () {
  const PREFIX = "cesmacquiz-";          // prefixo do ID no broker PeerJS
  const DEFAULT_TIME = 30;               // segundos por questão (padrão)
  const MAX_POINTS = 1000;               // acerto instantâneo
  const MIN_POINTS = 500;                // acerto no limite do tempo

  // Pontuação estilo "mais rápido e certo ganha mais".
  // elapsedMs = tempo decorrido; timeSec = tempo total da questão.
  function score(correct, elapsedMs, timeSec) {
    if (!correct) return 0;
    const t = Math.max(1, timeSec) * 1000;
    const frac = Math.min(1, Math.max(0, elapsedMs / t));
    return Math.round(MIN_POINTS + (MAX_POINTS - MIN_POINTS) * (1 - frac));
  }

  const LETTERS = ["A", "B", "C", "D", "E"];

  function initials(name) {
    const p = String(name || "?").trim().split(/\s+/);
    return ((p[0] || "?")[0] + (p[1] ? p[1][0] : "")).toUpperCase();
  }

  function normName(n) {
    return String(n || "").trim().replace(/\s+/g, " ").toLowerCase();
  }

  // Config PeerJS (usa o broker público gratuito 0.peerjs.com por padrão).
  const PEER_CONFIG = {
    debug: 1,
    config: {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:global.stun.twilio.com:3478" }
      ]
    }
  };

  return {
    PREFIX, DEFAULT_TIME, MAX_POINTS, MIN_POINTS,
    score, LETTERS, initials, normName, PEER_CONFIG
  };
})();
