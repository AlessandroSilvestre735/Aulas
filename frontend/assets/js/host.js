/* =====================================================================
   HOST (apresentador / tela grande)
   - Cria o "quarto" no PeerJS, mostra o QR de entrada, recebe respostas
     dos celulares, calcula pontuação por velocidade e mostra ranking.
   ===================================================================== */
(function () {
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const QUIZ = window.QUIZ, C = window.QZ;
  const TOTAL = QUIZ.questoes.length;

  const H = {
    room: null,
    peer: null,
    phase: "lobby",
    qIndex: -1,
    time: C.DEFAULT_TIME,
    qStartAt: 0,
    locked: false,
    timerId: null,
    // players: Map nameKey -> {name, score, conn, online, answered}
    players: new Map(),
    answers: {}, // nameKey -> {letter, elapsed, points}
  };

  /* ----------------------------- Sala / Peer ----------------------------- */
  function newRoomCode() {
    // 4 dígitos, evitando começar com 0 para leitura fácil
    return String(Math.floor(1000 + (Date.now() % 9000))).slice(-4);
  }

  function joinURL() {
    const path = location.pathname.replace(/[^/]*$/, "play.html");
    return location.origin + path + "?sala=" + H.room;
  }

  function persist() {
    try {
      const scores = {};
      H.players.forEach((p, k) => (scores[k] = { name: p.name, score: p.score }));
      localStorage.setItem("qz_room", H.room);
      localStorage.setItem("qz_scores_" + H.room, JSON.stringify(scores));
    } catch (e) {}
  }

  function loadPersisted(room) {
    try {
      const raw = localStorage.getItem("qz_scores_" + room);
      if (!raw) return;
      const scores = JSON.parse(raw);
      Object.keys(scores).forEach((k) => {
        H.players.set(k, { name: scores[k].name, score: scores[k].score || 0, conn: null, online: false, answered: false });
      });
    } catch (e) {}
  }

  function startPeer() {
    // Reaproveita a sala anterior (sobrevive a um F5 do professor)
    H.room = localStorage.getItem("qz_room") || newRoomCode();
    loadPersisted(H.room);
    createPeerWith(H.room, /*retry*/ 0);
  }

  function createPeerWith(room, retry) {
    const id = C.PREFIX + room;
    const peer = new Peer(id, C.PEER_CONFIG);
    H.peer = peer;

    peer.on("open", () => {
      H.room = room;
      persist();
      renderLobbyStatic();
      setConn(true);
    });

    peer.on("connection", (conn) => {
      conn.on("data", (msg) => onPlayerMessage(conn, msg));
      conn.on("open", () => {});
      conn.on("close", () => markConnClosed(conn));
      conn.on("error", () => markConnClosed(conn));
    });

    peer.on("disconnected", () => { try { peer.reconnect(); } catch (e) {} });

    peer.on("error", (err) => {
      // ID já em uso (outra aba) → tenta nova sala
      if (err && String(err.type) === "unavailable-id" && retry < 3) {
        try { peer.destroy(); } catch (e) {}
        const nr = newRoomCode();
        localStorage.removeItem("qz_scores_" + room);
        localStorage.setItem("qz_room", nr);
        H.players.clear();
        createPeerWith(nr, retry + 1);
      } else if (err && String(err.type) === "network") {
        setConn(false);
      } else {
        console.warn("Peer error:", err);
      }
    });
  }

  function setConn(ok) {
    const dot = $("#conn-dot"), txt = $("#conn-text");
    if (dot) dot.classList.toggle("on", !!ok);
    if (txt) txt.textContent = ok ? "Conectado ao servidor de salas" : "Reconectando…";
  }

  /* --------------------------- Jogadores --------------------------- */
  function onPlayerMessage(conn, msg) {
    if (!msg || typeof msg !== "object") return;
    if (msg.type === "join") return handleJoin(conn, msg.name);
    if (msg.type === "answer") return handleAnswer(conn, msg);
  }

  function handleJoin(conn, rawName) {
    let name = String(rawName || "Aluno").trim().slice(0, 24) || "Aluno";
    let key = C.normName(name);
    const existing = H.players.get(key);

    if (existing && existing.online && existing.conn && existing.conn !== conn) {
      // nome em uso por alguém online → diferencia
      let i = 2, nk = key;
      while (H.players.get(nk) && H.players.get(nk).online) { name = name.replace(/\s*\(\d+\)$/, "") + " (" + i + ")"; nk = C.normName(name); i++; }
      key = nk;
    }

    let p = H.players.get(key);
    if (!p) p = { name, score: 0, conn, online: true, answered: false };
    p.conn = conn; p.online = true; p.name = name;
    conn._nameKey = key;
    H.players.set(key, p);

    send(conn, { type: "welcome", name, room: H.room });
    syncPlayerToPhase(conn, p);
    renderPlayers();
    persist();
  }

  function markConnClosed(conn) {
    const key = conn && conn._nameKey;
    if (key && H.players.get(key)) { H.players.get(key).online = false; }
    renderPlayers();
  }

  function syncPlayerToPhase(conn, p) {
    // Coloca um jogador que acabou de (re)entrar no estado atual do jogo
    if (H.phase === "question") {
      send(conn, questionPayload());
      if (p.answered || H.answers[conn._nameKey]) send(conn, { type: "answered", letter: (H.answers[conn._nameKey] || {}).letter });
      if (H.locked) send(conn, { type: "locked" });
    } else if (H.phase === "reveal" || H.phase === "ranking" || H.phase === "discussion") {
      sendResultTo(conn, conn._nameKey);
    } else {
      send(conn, { type: "lobby" });
    }
  }

  function send(conn, obj) { try { conn && conn.open && conn.send(obj); } catch (e) {} }
  function broadcast(obj) { H.players.forEach((p) => p.online && send(p.conn, obj)); }

  /* --------------------------- Respostas --------------------------- */
  function handleAnswer(conn, msg) {
    if (H.phase !== "question" || H.locked) return;
    const key = conn._nameKey; if (!key) return;
    if (H.answers[key]) return;                 // já respondeu
    const q = QUIZ.questoes[H.qIndex];
    const letter = String(msg.letter || "").toUpperCase();
    if (!q.alternativas.some((a) => a.letra === letter)) return;

    const elapsed = Date.now() - H.qStartAt;
    const correct = letter === q.correta;
    const points = C.score(correct, elapsed, H.time);
    H.answers[key] = { letter, elapsed, points, correct };
    const p = H.players.get(key); if (p) p.answered = true;

    send(conn, { type: "answered", letter });
    updateAnsweredCount();
    // Trava automática quando todos os on-line já responderam
    const online = countOnline();
    if (online > 0 && Object.keys(H.answers).length >= online) { /* mantém aberto até o professor revelar */ }
  }

  function countOnline() { let n = 0; H.players.forEach((p) => p.online && n++); return n; }

  /* --------------------------- Fluxo do jogo --------------------------- */
  function show(screen) {
    $$(".screen").forEach((s) => s.classList.remove("active"));
    $("#screen-" + screen).classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startGame() {
    H.qIndex = -1;
    // zera pontuação para novo jogo
    H.players.forEach((p) => { p.score = 0; p.answered = false; });
    nextQuestion();
  }

  function nextQuestion() {
    H.qIndex++;
    if (H.qIndex >= TOTAL) return showFinal();
    H.phase = "question";
    H.locked = false;
    H.answers = {};
    H.players.forEach((p) => (p.answered = false));
    H.time = parseInt($("#time-select").value, 10) || C.DEFAULT_TIME;
    renderQuestion();
    broadcast(questionPayload());
    H.qStartAt = Date.now();
    startTimer();
    show("question");
  }

  function questionPayload() {
    const q = QUIZ.questoes[H.qIndex];
    return {
      type: "question",
      index: H.qIndex,
      n: q.n, total: TOTAL, tema: q.tema,
      letters: q.alternativas.map((a) => a.letra),
      time: H.time,
    };
  }

  function startTimer() {
    clearInterval(H.timerId);
    const bar = $("#timer"), fill = $("#timer > i"), secsEl = $("#secs");
    let left = H.time;
    fill.style.width = "100%"; bar.classList.remove("warn");
    secsEl.textContent = left;
    H.timerId = setInterval(() => {
      left--;
      secsEl.textContent = Math.max(0, left);
      fill.style.width = Math.max(0, (left / H.time) * 100) + "%";
      if (left <= Math.ceil(H.time * 0.25)) bar.classList.add("warn");
      if (left <= 0) { clearInterval(H.timerId); lockAnswers(); }
    }, 1000);
  }

  function lockAnswers() {
    if (H.locked) return;
    H.locked = true;
    broadcast({ type: "locked" });
    $("#secs").textContent = "0";
  }

  function revealAnswer() {
    clearInterval(H.timerId);
    lockAnswers();
    H.phase = "reveal";
    const q = QUIZ.questoes[H.qIndex];

    // Soma pontos ao placar
    Object.keys(H.answers).forEach((key) => {
      const p = H.players.get(key); if (p) p.score += H.answers[key].points;
    });
    persist();

    // Distribuição de respostas
    const dist = {}; q.alternativas.forEach((a) => (dist[a.letra] = 0));
    let totalAns = 0;
    Object.values(H.answers).forEach((a) => { dist[a.letter] = (dist[a.letter] || 0) + 1; totalAns++; });

    // Marca a tela do host
    $("#options").classList.add("revealed");
    $$("#options .opt").forEach((el) => {
      const l = el.dataset.l;
      if (l === q.correta) el.classList.add("correct");
      else el.classList.add("dim");
      const n = dist[l] || 0;
      $(".count", el).textContent = n;
      $(".distbar > i", el).style.width = (totalAns ? (n / totalAns) * 100 : 0) + "%";
    });

    // Envia resultado individual
    H.players.forEach((p, key) => {
      if (p.online) sendResultTo(p.conn, key);
    });

    $("#btn-reveal").style.display = "none";
    $("#btn-ranking").style.display = "";
    const nCorr = Object.values(H.answers).filter((a) => a.correct).length;
    $("#answered-count").innerHTML = `<b>${totalAns}</b> respostas · <b>${nCorr}</b> acertos`;
  }

  function sendResultTo(conn, key) {
    const q = QUIZ.questoes[H.qIndex];
    const a = H.answers[key];
    const standings = sortedPlayers();
    const rank = standings.findIndex((s) => s.key === key) + 1;
    const p = H.players.get(key);
    send(conn, {
      type: "result",
      correctLetter: q.correta,
      answered: !!a,
      letter: a ? a.letter : null,
      correct: a ? a.correct : false,
      points: a ? a.points : 0,
      score: p ? p.score : 0,
      rank: rank || standings.length + 1,
      total: standings.length,
    });
  }

  function sortedPlayers() {
    return Array.from(H.players.entries())
      .map(([key, p]) => ({ key, name: p.name, score: p.score, gain: (H.answers[key] || {}).points || 0, online: p.online }))
      .sort((a, b) => b.score - a.score || b.gain - a.gain);
  }

  function showRanking() {
    H.phase = "ranking";
    const list = $("#rank-list"); list.innerHTML = "";
    const rows = sortedPlayers().slice(0, 12);
    if (!rows.length) { list.innerHTML = `<p class="empty-hint" style="text-align:center">Sem jogadores.</p>`; }
    rows.forEach((r, i) => {
      const pos = i + 1;
      const medal = pos === 1 ? "🥇" : pos === 2 ? "🥈" : pos === 3 ? "🥉" : "";
      const row = document.createElement("div");
      row.className = "rank-row" + (pos <= 3 ? " p" + pos : "");
      row.style.animationDelay = i * 0.05 + "s";
      row.innerHTML = `
        <div class="pos">${medal || pos}</div>
        <div class="who"><span class="av">${C.initials(r.name)}</span>${escapeHtml(r.name)}</div>
        <div class="gain ${r.gain ? "" : "zero"}">${r.gain ? "+" + r.gain : "—"}</div>
        <div class="score">${r.score}</div>`;
      list.appendChild(row);
    });
    broadcast({ type: "standings" });
    show("ranking");
  }

  function showDiscussion() {
    H.phase = "discussion";
    const q = QUIZ.questoes[H.qIndex];
    $("#disc-title").textContent = `Questão ${q.n} — ${q.tema}`;
    $("#disc-answer").innerHTML = `<span class="letter">${q.correta}</span> Resposta correta`;
    renderProgress($("#disc-progress"));

    const wrap = $("#cards"); wrap.innerHTML = "";
    q.cards.forEach((c) => wrap.appendChild(renderCard(c)));

    $("#btn-next").textContent = H.qIndex >= TOTAL - 1 ? "Ver resultado final →" : "Próxima questão →";
    show("discussion");
  }

  function renderCard(c) {
    const el = document.createElement("div");
    if (c.tipo === "imagem") {
      el.className = "card imagem";
      const src = /^https?:/.test(c.img) ? c.img : "assets/img/" + c.img;
      el.innerHTML = `<figure style="margin:0">
        <img src="${src}" alt="" onerror="var c=this.closest('.card'); if(c)c.style.display='none'">
        <figcaption>${escapeHtml(c.caption || "")}</figcaption></figure>`;
      return el;
    }
    el.className = "card " + (c.tipo === "resposta" ? "resposta" : "conceito");
    let body = "";
    if (c.itens && c.itens.length) body = "<ul>" + c.itens.map((i) => `<li>${escapeHtml(i)}</li>`).join("") + "</ul>";
    else body = `<p>${escapeHtml(c.texto || "")}</p>`;
    const icon = c.tipo === "resposta" ? "✓ " : "";
    el.innerHTML = `<h3>${icon}${escapeHtml(c.titulo || "")}</h3>${body}`;
    return el;
  }

  function showFinal() {
    H.phase = "final";
    if (H.ecg) H.ecg.set(1);
    const curEl = $("#ecg-cur"); if (curEl) curEl.textContent = String(TOTAL).padStart(2, "0");
    const rows = sortedPlayers();
    const top3 = rows.slice(0, 3);
    const order = [1, 0, 2]; // colunas: 2º, 1º, 3º
    const pod = $("#podium"); pod.innerHTML = "";
    order.forEach((idx, i) => {
      const r = top3[idx]; if (!r) return;
      const place = idx + 1;
      const col = document.createElement("div");
      col.className = "col c" + place;
      col.innerHTML = `
        <div class="av-lg">${C.initials(r.name)}</div>
        <div class="name">${escapeHtml(r.name)}</div>
        <div class="pts">${r.score} pts</div>
        <div class="stand">${place === 1 ? "🥇" : place === 2 ? "🥈" : "🥉"}</div>`;
      pod.appendChild(col);
    });
    const list = $("#final-list"); list.innerHTML = "";
    rows.slice(3, 15).forEach((r, i) => {
      const row = document.createElement("div");
      row.className = "rank-row";
      row.innerHTML = `<div class="pos">${i + 4}</div>
        <div class="who"><span class="av">${C.initials(r.name)}</span>${escapeHtml(r.name)}</div>
        <div class="gain zero"></div><div class="score">${r.score}</div>`;
      list.appendChild(row);
    });
    broadcast({ type: "final" });
    show("final");
  }

  /* ----------------------------- Render ----------------------------- */
  function renderLobbyStatic() {
    $("#room-code").textContent = H.room;
    $("#join-url").textContent = joinURL();
    $("#room-pill").innerHTML = `Sala <b>${H.room}</b>`;
    const qr = $("#qr"); qr.innerHTML = "";
    try {
      new QRCode(qr, { text: joinURL(), width: 220, height: 220, correctLevel: QRCode.CorrectLevel.M });
    } catch (e) { qr.textContent = joinURL(); }
    renderPlayers();
  }

  function renderPlayers() {
    const box = $("#players");
    const arr = Array.from(H.players.values());
    $("#count-pill").innerHTML = `<b>${arr.filter((p) => p.online).length}</b> conectados`;
    if (!arr.length) { box.innerHTML = `<span class="empty-hint">Aguardando alunos entrarem…</span>`; }
    else {
      box.innerHTML = "";
      arr.sort((a, b) => Number(b.online) - Number(a.online));
      arr.forEach((p) => {
        const c = document.createElement("span");
        c.className = "chip" + (p.online ? "" : " off");
        c.innerHTML = `<span class="av">${C.initials(p.name)}</span>${escapeHtml(p.name)}`;
        box.appendChild(c);
      });
    }
    $("#btn-start").disabled = arr.filter((p) => p.online).length < 1;
  }

  function renderQuestion() {
    const q = QUIZ.questoes[H.qIndex];
    $("#q-tag").textContent = `Questão ${q.n}/${TOTAL}`;
    $("#q-tema").textContent = q.tema;
    $("#q-title").textContent = q.enunciado;
    renderProgress($("#q-progress"));

    const imgWrap = $("#q-img");
    if (q.imgEnunciado) {
      imgWrap.style.display = "";
      imgWrap.innerHTML = `<img src="${q.imgEnunciado.src}" alt="" onerror="if(this.parentNode)this.parentNode.style.display='none'">`;
    } else { imgWrap.style.display = "none"; imgWrap.innerHTML = ""; }

    const opts = $("#options"); opts.className = "options"; opts.innerHTML = "";
    q.alternativas.forEach((a) => {
      const el = document.createElement("div");
      el.className = "opt"; el.dataset.l = a.letra;
      el.innerHTML = `
        <span class="letter">${a.letra}</span>
        <span class="txt">${escapeHtml(a.texto)}</span>
        <span class="bar reveal-only"><span class="distbar"><i></i></span><span class="count">0</span></span>`;
      opts.appendChild(el);
    });
    $("#btn-reveal").style.display = "";
    $("#btn-ranking").style.display = "none";
    updateAnsweredCount();
    paintEcg();
  }

  function updateAnsweredCount() {
    if (H.phase !== "question") return;
    $("#answered-count").innerHTML = `<b>${Object.keys(H.answers).length}</b> / ${countOnline()} responderam`;
  }

  function renderProgress(el) {
    if (!el) return;
    el.innerHTML = "";
    for (let i = 0; i < TOTAL; i++) {
      const d = document.createElement("i");
      if (i < H.qIndex) d.className = "done";
      else if (i === H.qIndex) d.className = "cur";
      el.appendChild(d);
    }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  }

  /* ------------------------------ Init ------------------------------ */
  function paintEcg() {
    if (H.ecg) H.ecg.set(H.qIndex < 0 ? 0 : (H.qIndex + 1) / TOTAL);
    const cur = $("#ecg-cur");
    if (cur) cur.textContent = H.qIndex < 0 ? "—" : String(H.qIndex + 1).padStart(2, "0");
  }

  function init() {
    $("#year-title").textContent = QUIZ.titulo;
    $("#year-sub").textContent = QUIZ.subtitulo;
    const totEl = $("#ecg-tot"); if (totEl) totEl.textContent = TOTAL;
    H.ecg = (window.ECG && $("#ecg-track")) ? ECG.mount($("#ecg-track"), $("#ecg-trace"), $("#ecg-dot"), TOTAL) : null;
    startPeer();

    $("#btn-start").addEventListener("click", startGame);
    $("#btn-reveal").addEventListener("click", revealAnswer);
    $("#btn-ranking").addEventListener("click", showRanking);
    $("#btn-discussion").addEventListener("click", showDiscussion);
    $("#btn-next").addEventListener("click", nextQuestion);
    $("#btn-again").addEventListener("click", () => { startGame(); });
    $("#btn-new-room").addEventListener("click", () => {
      const nr = newRoomCode();
      localStorage.setItem("qz_room", nr);
      localStorage.removeItem("qz_scores_" + H.room);
      location.reload();
    });
    $("#btn-copy").addEventListener("click", () => {
      navigator.clipboard && navigator.clipboard.writeText(joinURL());
      toast("Link copiado!");
    });
  }

  function toast(t) {
    const el = $("#toast"); if (!el) return;
    el.textContent = t; el.classList.add("show");
    setTimeout(() => el.classList.remove("show"), 1800);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
