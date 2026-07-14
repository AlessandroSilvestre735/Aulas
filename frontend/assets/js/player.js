/* =====================================================================
   PLAYER (celular do aluno)
   - Entra pelo BACKEND (/api/player): ao mandar o nome já fica cadastrado
     e a tela libera. Acompanha a partida por POLLING (sem P2P), então
     funciona em qualquer rede.
   ===================================================================== */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const C = window.QZ;

  const POLL_MS = 1500;

  const P = {
    room: null,
    name: "",
    sessionId: null,
    answered: false,
    renderedKey: "",      // sessionId:qIndex já renderizado
    shownResultKey: "",   // resultado já exibido
    me: { score: 0, rank: 0, total: 0 },
    timerId: null,
    pollId: null,
    joining: false,
  };

  function show(id) {
    ["join", "wait", "question", "result", "final"].forEach((s) =>
      $("#p-" + s).classList.toggle("active", s === id)
    );
    window.scrollTo({ top: 0 });
  }

  function qs(name) {
    const m = new RegExp("[?&]" + name + "=([^&]+)").exec(location.search);
    return m ? decodeURIComponent(m[1]) : null;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  }

  function setStatus(big, muted) {
    if ($("#p-wait-big")) $("#p-wait-big").textContent = big;
    if ($("#p-wait-muted")) $("#p-wait-muted").textContent = muted || "";
  }

  /* --------------------------- Backend --------------------------- */
  async function postPlayer(extra) {
    try {
      const r = await fetch("/api/player", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.assign({ sala: P.room }, extra)),
      });
      return await r.json().catch(() => null);
    } catch (e) { return null; }
  }

  async function getPlayer() {
    try {
      const r = await fetch("/api/player?sala=" + encodeURIComponent(P.room) + "&nome=" + encodeURIComponent(P.name));
      return await r.json().catch(() => null);
    } catch (e) { return null; }
  }

  /* ---------------------------- Entrar ---------------------------- */
  async function doJoin() {
    setStatus("Entrando…", "Sala " + P.room);
    show("wait");
    const j = await postPlayer({ action: "entrar", nome: P.name });
    if (!j || !j.ok) {
      // Sala ainda não aberta (ou instabilidade): tenta de novo sozinho.
      if (j && j.existe === false) setStatus("Procurando a sala…", "Aguardando o professor abrir a sala " + P.room);
      else setStatus("Reconectando…", "Tentando entrar de novo.");
      setTimeout(doJoin, 2500);
      return;
    }
    P.name = j.nome; // nome final (pode ter virado "Fulano (2)")
    localStorage.setItem("qz_player_name", P.name);
    P.sessionId = j.sessionId;
    renderMe();
    setStatus("Conectado!", "Aguarde o professor iniciar…");
    show("wait");
    startPolling();
  }

  function startPolling() {
    clearInterval(P.pollId);
    pollOnce();
    P.pollId = setInterval(pollOnce, POLL_MS);
  }

  async function pollOnce() {
    apply(await getPlayer());
  }

  /* ----------------------- Aplica o estado ----------------------- */
  function apply(s) {
    if (!s || !s.ok) { setStatus("Reconectando…", "Conexão instável, tentando de novo."); return; }
    if (!s.existe) { setStatus("Sala encerrada", "O professor fechou a sala."); show("wait"); return; }

    P.sessionId = s.sessionId;
    if (s.me) { P.me.score = s.me.score; P.me.rank = s.me.rank; P.me.total = s.me.total; renderMe(); }

    const fase = s.fase;

    if (fase === "questao" && s.questao) {
      const key = s.sessionId + ":" + s.questao.qIndex;
      if (P.renderedKey !== key) {
        onQuestion(s.questao);
        P.renderedKey = key;
        P.answered = !!s.jaRespondeu;
        if (s.jaRespondeu) markAnswered(s.minhaResposta);
      } else if (s.jaRespondeu && !P.answered) {
        P.answered = true; markAnswered(s.minhaResposta);
      }
      if (s.locked) onLocked();
      return;
    }

    if (fase === "final") { onFinal(); return; }

    if (s.resultado) { // revelado / ranking / discussao
      const rk = "res:" + s.sessionId + ":" + s.qIndex;
      if (P.shownResultKey !== rk) { onResult(s.resultado); P.shownResultKey = rk; }
      return;
    }

    // lobby (ou aguardando a primeira questão)
    setStatus("Tudo pronto!", "Aguarde o professor iniciar…");
    show("wait");
    P.renderedKey = "";
  }

  /* ---------------------------- Telas ---------------------------- */
  function onQuestion(q) {
    P.answered = false;
    $("#p-qn").textContent = `Questão ${q.n} de ${q.total}`;
    $("#p-qtema").textContent = q.tema || "";
    renderMe();

    // Preferimos as alternativas com texto; se não vierem, caímos nas letras.
    const alts = Array.isArray(q.alternativas) && q.alternativas.length
      ? q.alternativas
      : (q.letters && q.letters.length ? q.letters : ["A", "B", "C", "D"]).map((l) => ({ l, t: "" }));
    const box = $("#p-options"); box.innerHTML = "";
    box.classList.toggle("with-text", alts.some((a) => a.t));
    alts.forEach((a) => {
      const l = a.l;
      const b = document.createElement("button");
      b.className = "p-opt"; b.dataset.l = l;
      b.innerHTML = a.t
        ? `<span class="key">${l}</span><span class="txt">${escapeHtml(a.t)}</span>`
        : `${l}<span class="lbl">toque para responder</span>`;
      b.addEventListener("click", () => choose(l, b));
      box.appendChild(b);
    });
    startTimer(Math.max(1, Math.ceil((q.restanteMs || (q.time || C.DEFAULT_TIME) * 1000) / 1000)));
    show("question");
  }

  function choose(letter, btn) {
    if (P.answered) return;
    P.answered = true;
    Array.from($("#p-options").children).forEach((b) => {
      b.classList.toggle("chosen", b === btn);
      b.classList.toggle("faded", b !== btn);
      b.disabled = true;
    });
    try { navigator.vibrate && navigator.vibrate(30); } catch (e) {}
    postPlayer({ action: "responder", nome: P.name, qIndex: qIndexFromKey(), letra: letter });
  }

  function qIndexFromKey() {
    const parts = String(P.renderedKey).split(":");
    return parseInt(parts[parts.length - 1], 10);
  }

  function markAnswered(letter) {
    P.answered = true;
    Array.from($("#p-options").children).forEach((b) => {
      const isMine = b.dataset.l === letter;
      b.classList.toggle("chosen", isMine);
      b.classList.toggle("faded", !isMine);
      b.disabled = true;
    });
  }

  function onLocked() {
    clearInterval(P.timerId);
    const fill = $("#p-timer > i"); if (fill) fill.style.width = "0%";
    Array.from($("#p-options").children).forEach((b) => (b.disabled = true));
  }

  function onResult(msg) {
    clearInterval(P.timerId);
    P.me.score = msg.score; P.me.rank = msg.rank; P.me.total = msg.total;

    const ok = msg.answered && msg.correct;
    $("#p-emoji").textContent = !msg.answered ? "⏱️" : ok ? "🎉" : "😕";
    const v = $("#p-verdict");
    v.className = "verdict " + (ok ? "ok" : "no");
    v.textContent = !msg.answered ? "Sem resposta" : ok ? "Acertou!" : "Não foi dessa vez";

    $("#p-correct").innerHTML = `Resposta correta: <b>${msg.correctLetter}</b>`;
    $("#p-gain").textContent = ok ? `+${msg.points} pontos` : "+0 pontos";
    $("#p-gain").style.color = ok ? "var(--correct)" : "var(--muted)";
    $("#p-rankline").innerHTML = `Você está em <b>${msg.rank}º</b> de ${msg.total} · ${msg.score} pts`;
    renderMe();
    show("result");
  }

  function onFinal() {
    clearInterval(P.timerId);
    $("#p-final-av").textContent = C.initials(P.name);
    $("#p-final-name").textContent = P.name;
    $("#p-final-rank").innerHTML = P.me.rank ? `${P.me.rank}º lugar` : "Fim de jogo";
    $("#p-final-score").textContent = `${P.me.score} pontos`;
    $("#p-final-msg").textContent =
      P.me.rank === 1 ? "🏆 Campeão! Mandou muito bem!" :
      P.me.rank <= 3 ? "🥇 Pódio! Excelente desempenho!" :
      "👏 Parabéns por participar!";
    show("final");
  }

  function renderMe() {
    if ($("#p-me-name")) $("#p-me-name").textContent = P.name;
    if ($("#p-me-av")) $("#p-me-av").textContent = C.initials(P.name);
    if ($("#p-me-score")) $("#p-me-score").textContent = P.me.score;
  }

  function startTimer(sec) {
    clearInterval(P.timerId);
    const fill = $("#p-timer > i");
    let left = sec;
    fill.style.transition = "none"; fill.style.width = "100%";
    requestAnimationFrame(() => (fill.style.transition = "width 1s linear"));
    P.timerId = setInterval(() => {
      left--;
      fill.style.width = Math.max(0, (left / sec) * 100) + "%";
      if (left <= 0) clearInterval(P.timerId);
    }, 1000);
  }

  /* ------------------------------- Init ------------------------------- */
  function init() {
    P.room = qs("sala") || qs("room");
    const savedName = localStorage.getItem("qz_player_name") || "";

    if (P.room) $("#p-room-badge").textContent = "Sala " + P.room;
    else { $("#p-room-field").style.display = ""; $("#p-room-badge").textContent = "Digite o código da sala"; }
    if (savedName) $("#p-name").value = savedName;

    $("#p-join-form").addEventListener("submit", (e) => {
      e.preventDefault();
      if (P.joining) return;
      const name = $("#p-name").value.trim();
      if (!name) { $("#p-name").focus(); return; }
      if (!P.room) {
        P.room = ($("#p-room").value || "").trim();
        if (!P.room) { $("#p-room").focus(); return; }
      }
      P.name = name.slice(0, 24);
      P.joining = true;
      localStorage.setItem("qz_player_name", P.name);
      renderMe();
      doJoin();
    });

    $("#p-play-again") && $("#p-play-again").addEventListener("click", () => {
      setStatus("Aguarde…", "Esperando o professor iniciar uma nova rodada.");
      show("wait");
    });

    show("join");
  }

  document.addEventListener("DOMContentLoaded", init);
})();
