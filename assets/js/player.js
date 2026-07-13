/* =====================================================================
   PLAYER (celular do aluno)
   ===================================================================== */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const C = window.QZ;

  const P = {
    room: null,
    name: "",
    peer: null,
    conn: null,
    connected: false,
    qIndex: -1,
    letters: [],
    answered: false,
    me: { score: 0, rank: 0, total: 0 },
    timerId: null,
    retry: 0,
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

  /* ------------------------------ Conexão ------------------------------ */
  function connect() {
    setStatus("Conectando…", "Entrando na sala " + P.room);
    show("wait");
    try { if (P.peer) P.peer.destroy(); } catch (e) {}

    const peer = new Peer(C.PEER_CONFIG);
    P.peer = peer;

    peer.on("open", () => {
      const conn = peer.connect(C.PREFIX + P.room, { reliable: true });
      P.conn = conn;
      conn.on("open", () => {
        P.connected = true; P.retry = 0;
        conn.send({ type: "join", name: P.name });
        setStatus("Conectado!", "Aguarde o professor iniciar…");
      });
      conn.on("data", onHostMessage);
      conn.on("close", () => onDrop());
      conn.on("error", () => onDrop());
    });

    peer.on("error", (err) => {
      const t = err && String(err.type);
      if (t === "peer-unavailable") {
        setStatus("Sala não encontrada", "Verifique o código e tente novamente.");
        setTimeout(retry, 2500);
      } else if (t === "network" || t === "server-error" || t === "socket-error" || t === "disconnected") {
        setStatus("Reconectando…", "Conexão instável, tentando de novo.");
        setTimeout(retry, 2000);
      } else {
        console.warn("peer error", err);
        setTimeout(retry, 2500);
      }
    });
  }

  function onDrop() {
    P.connected = false;
    setStatus("Reconectando…", "Perdemos a conexão, tentando voltar.");
    show("wait");
    setTimeout(retry, 1500);
  }

  function retry() {
    if (P.connected) return;
    P.retry++;
    connect();
  }

  function setStatus(big, muted) {
    if ($("#p-wait-big")) $("#p-wait-big").textContent = big;
    if ($("#p-wait-muted")) $("#p-wait-muted").textContent = muted || "";
  }

  /* --------------------------- Mensagens host --------------------------- */
  function onHostMessage(msg) {
    if (!msg || typeof msg !== "object") return;
    switch (msg.type) {
      case "welcome":   P.name = msg.name; renderMe(); break;
      case "lobby":     setStatus("Tudo pronto!", "Aguarde o professor iniciar…"); show("wait"); break;
      case "question":  onQuestion(msg); break;
      case "answered":  onAnswered(msg.letter); break;
      case "locked":    onLocked(); break;
      case "result":    onResult(msg); break;
      case "standings": setStatus("Confira o ranking!", "Olhe a tela do professor 👀"); show("wait"); break;
      case "final":     onFinal(); break;
    }
  }

  function onQuestion(msg) {
    P.qIndex = msg.index;
    P.letters = msg.letters || ["A", "B", "C", "D"];
    P.answered = false;

    $("#p-qn").textContent = `Questão ${msg.n} de ${msg.total}`;
    $("#p-qtema").textContent = msg.tema || "";
    renderMe();

    const box = $("#p-options"); box.innerHTML = "";
    P.letters.forEach((l) => {
      const b = document.createElement("button");
      b.className = "p-opt"; b.dataset.l = l;
      b.innerHTML = `${l}<span class="lbl">toque para responder</span>`;
      b.addEventListener("click", () => choose(l, b));
      box.appendChild(b);
    });
    startTimer(msg.time || C.DEFAULT_TIME);
    show("question");
  }

  function choose(letter, btn) {
    if (P.answered || !P.connected) return;
    P.answered = true;
    Array.from($("#p-options").children).forEach((b) => {
      b.classList.toggle("chosen", b === btn);
      b.classList.toggle("faded", b !== btn);
      b.disabled = true;
    });
    try { navigator.vibrate && navigator.vibrate(30); } catch (e) {}
    P.conn && P.conn.send({ type: "answer", index: P.qIndex, letter });
  }

  function onAnswered(letter) {
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
    $("#p-timer > i").style.width = "0%";
    Array.from($("#p-options").children).forEach((b) => (b.disabled = true));
    if (!P.answered) setStatus("Tempo esgotado!", "Você não respondeu a tempo.");
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
      const name = $("#p-name").value.trim();
      if (!name) { $("#p-name").focus(); return; }
      if (!P.room) {
        P.room = ($("#p-room").value || "").trim();
        if (!P.room) { $("#p-room").focus(); return; }
      }
      P.name = name.slice(0, 24);
      localStorage.setItem("qz_player_name", P.name);
      renderMe();
      connect();
    });

    $("#p-play-again") && $("#p-play-again").addEventListener("click", () => {
      setStatus("Aguarde…", "Esperando o professor iniciar uma nova rodada.");
      show("wait");
    });

    show("join");
  }

  document.addEventListener("DOMContentLoaded", init);
})();
