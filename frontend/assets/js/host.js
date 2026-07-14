/* =====================================================================
   HOST (aplicador / tela grande)
   - Coordena a partida pelo BACKEND (/api/host): abre a sala, mostra o QR,
     envia cada questão, revela, ranking, discussão e final.
   - Acompanha os alunos por POLLING (não usa mais P2P/PeerJS), então
     funciona em qualquer rede.
   ===================================================================== */
(function () {
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const QUIZ = window.QUIZ, C = window.QZ;
  const TOTAL = QUIZ.questoes.length;

  const POLL_MS = 1500;

  const H = {
    room: null,
    sessionId: null,
    phase: "lobby",
    qIndex: -1,
    time: C.DEFAULT_TIME,
    locked: false,
    timerId: null,
    pollId: null,
    ecg: null,
    // vindos do poll do servidor:
    standings: [],   // [{nome, score, gain, online}]
    online: 0,
    respondidos: 0,
    // figuras em slide dedicado (tela cheia) da questão atual:
    figures: [],
    figIndex: 0,
  };

  /* ----------------------------- Sala ----------------------------- */
  function newRoomCode() {
    return String(Math.floor(1000 + (Date.now() % 9000))).slice(-4);
  }

  function joinURL() {
    const path = location.pathname.replace(/[^/]*$/, "play.html");
    return location.origin + path + "?sala=" + H.room;
  }

  /* --------------------------- Backend --------------------------- */
  async function hostPost(action, extra) {
    try {
      const r = await fetch("/api/host", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.assign({ sala: H.room, sessionId: H.sessionId, action }, extra || {})),
      });
      return await r.json().catch(() => null);
    } catch (e) { return null; }
  }

  async function hostGet() {
    try {
      const r = await fetch("/api/host?sala=" + encodeURIComponent(H.room));
      return await r.json().catch(() => null);
    } catch (e) { return null; }
  }

  async function startRoom() {
    // Reaproveita sala/sessão anteriores (sobrevive a um F5 do aplicador).
    H.room = localStorage.getItem("qz_room") || newRoomCode();
    H.sessionId = localStorage.getItem("qz_session") || (H.room + "-" + Date.now());
    localStorage.setItem("qz_room", H.room);
    localStorage.setItem("qz_session", H.sessionId);

    const r = await hostPost("abrir", { sessionId: H.sessionId, totalQuestoes: TOTAL });
    if (r && r.ok && r.sessionId) {
      H.sessionId = r.sessionId; // o servidor manda a sessão vigente
      localStorage.setItem("qz_session", H.sessionId);
    }
    renderLobbyStatic();
    setConn(!!(r && r.ok));
    startPolling();
  }

  function startPolling() {
    clearInterval(H.pollId);
    poll();
    H.pollId = setInterval(poll, POLL_MS);
  }

  async function poll() {
    const s = await hostGet();
    setConn(!!(s && s.ok));
    if (!s || !s.ok || !s.existe) return;
    H.standings = s.standings || [];
    H.online = s.online || 0;
    H.respondidos = s.respondidos || 0;
    renderPlayers();
    if (H.phase === "question") updateAnsweredCount();
    if (H.phase === "ranking") renderRankingList();
  }

  function setConn(ok) {
    const dot = $("#conn-dot"), txt = $("#conn-text");
    if (dot) dot.classList.toggle("on", !!ok);
    if (txt) txt.textContent = ok ? "Conectado ao servidor" : "Reconectando…";
  }

  /* --------------------------- Fluxo do jogo --------------------------- */
  function show(screen) {
    $$(".screen").forEach((s) => { s.classList.remove("active"); s.style.zoom = ""; });
    $("#screen-" + screen).classList.add("active");
    fitScreen();
  }

  async function startGame() {
    // Tempo escolhido AGORA, no lobby — trava até o fim da partida.
    H.time = parseInt($("#time-select").value, 10) || C.DEFAULT_TIME;
    lockTimeSelect(true);

    H.qIndex = -1;
    H.sessionId = H.room + "-" + Date.now(); // nova partida
    localStorage.setItem("qz_session", H.sessionId);
    await hostPost("iniciar", { sessionId: H.sessionId });
    nextQuestion();
  }

  async function nextQuestion() {
    H.qIndex++;
    if (H.qIndex >= TOTAL) return showFinal();
    H.phase = "question";
    H.locked = false;
    H.respondidos = 0;

    const q = QUIZ.questoes[H.qIndex];
    renderQuestion();
    show("question");

    await hostPost("questao", {
      questao: {
        index: H.qIndex,
        n: q.n,
        tema: q.tema,
        correta: q.correta,
        letters: q.alternativas.map((a) => a.letra),
        alternativas: q.alternativas.map((a) => ({ l: a.letra, t: a.texto })),
        time: H.time,
      },
    });
    startTimer();
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
    $("#secs").textContent = "0";
    hostPost("lock");
  }

  async function revealAnswer() {
    clearInterval(H.timerId);
    lockAnswers();
    H.phase = "reveal";
    const q = QUIZ.questoes[H.qIndex];

    const r = await hostPost("revelar");
    const dist = (r && r.distribuicao) || {};
    const totalAns = (r && r.total) || 0;
    const nCorr = (r && r.corretas) || 0;

    $("#options").classList.add("revealed");
    $$("#options .opt").forEach((el) => {
      const l = el.dataset.l;
      if (l === q.correta) el.classList.add("correct");
      else el.classList.add("dim");
      const n = dist[l] || 0;
      $(".count", el).textContent = n;
      $(".distbar > i", el).style.width = (totalAns ? (n / totalAns) * 100 : 0) + "%";
    });

    $("#btn-reveal").style.display = "none";
    $("#btn-ranking").style.display = "";
    $("#answered-count").innerHTML = `<b>${totalAns}</b> respostas · <b>${nCorr}</b> acertos`;
  }

  async function showRanking() {
    H.phase = "ranking";
    await hostPost("ranking");
    renderRankingList();
    show("ranking");
  }

  function renderRankingList() {
    const list = $("#rank-list"); if (!list) return;
    const rows = (H.standings || []).slice(0, 12);
    // Evita redesenhar (e re-disparar a animação) a cada poll se nada mudou.
    const sig = rows.map((r) => r.nome + ":" + r.score + ":" + (r.gain || 0)).join("|");
    if (sig === H._rankSig) return;
    H._rankSig = sig;
    list.innerHTML = "";
    if (!rows.length) { list.innerHTML = `<p class="empty-hint" style="text-align:center">Sem jogadores.</p>`; return; }
    rows.forEach((r, i) => {
      const pos = i + 1;
      const medal = pos === 1 ? "🥇" : pos === 2 ? "🥈" : pos === 3 ? "🥉" : "";
      const row = document.createElement("div");
      row.className = "rank-row" + (pos <= 3 ? " p" + pos : "");
      row.style.animationDelay = i * 0.05 + "s";
      row.innerHTML = `
        <div class="pos">${medal || pos}</div>
        <div class="who"><span class="av">${C.initials(r.nome)}</span>${escapeHtml(r.nome)}</div>
        <div class="gain ${r.gain ? "" : "zero"}">${r.gain ? "+" + r.gain : "—"}</div>
        <div class="score">${r.score}</div>`;
      list.appendChild(row);
    });
  }

  async function showDiscussion() {
    H.phase = "discussion";
    hostPost("discussao");
    const q = QUIZ.questoes[H.qIndex];
    $("#disc-title").textContent = `Questão ${q.n} — ${q.tema}`;
    $("#disc-answer").innerHTML = `<span class="letter">${q.correta}</span> Resposta correta`;
    renderProgress($("#disc-progress"));

    // Separa os cards em TEXTO e IMAGEM e escolhe o modo de layout. As imagens deixam de
    // ocupar a largura toda e empilhar (o que fazia o texto encolher no auto-ajuste):
    //  - "text"  : só texto, grid central de 2 colunas (como antes);
    //  - "split" : texto + imagens. 1 imagem vira "rail" (texto à esquerda, imagem à direita);
    //              2–3 imagens viram uma FAIXA lado a lado embaixo, com teto de altura.
    // Figuras marcadas com full:true viram slides dedicados (tela cheia), mostrados
    // DEPOIS da discussão. As demais imagens entram na faixa/rail normal.
    H.figures = q.cards.filter((c) => c.tipo === "imagem" && c.full);
    H.figIndex = 0;

    const wrap = $("#cards"); wrap.innerHTML = "";
    const texts = q.cards.filter((c) => c.tipo !== "imagem");
    const imgs  = q.cards.filter((c) => c.tipo === "imagem" && !c.full);

    const mode = imgs.length ? (texts.length ? "split" : "img") : "text";
    wrap.dataset.mode = mode;
    wrap.dataset.imgs = String(imgs.length);

    // Colunas de texto: manter poucas linhas (baixa altura => o auto-ajuste mantém o zoom alto).
    // Uma lista longa (<ul> com muitos itens) fica alta: nesse caso limita a 2 colunas.
    const hasLongList = texts.some((c) => c.itens && c.itens.length >= 5);
    let tcols;
    if (mode !== "split" || imgs.length === 1) tcols = Math.min(2, texts.length || 1);
    else tcols = hasLongList ? 2 : Math.min(3, Math.max(2, texts.length));
    wrap.style.setProperty("--tcols", tcols);

    if (texts.length) {
      const t = document.createElement("div"); t.className = "disc-text";
      texts.forEach((c) => t.appendChild(renderCard(c)));
      wrap.appendChild(t);
    }
    if (imgs.length) {
      const f = document.createElement("div"); f.className = "disc-figs";
      imgs.forEach((c) => f.appendChild(renderCard(c))); // .card.imagem chama __fit no onload
      wrap.appendChild(f);
    }

    $("#btn-next").textContent = H.figures.length
      ? "Ver figura →"
      : (H.qIndex >= TOTAL - 1 ? "Ver resultado final →" : "Próxima questão →");
    show("discussion");
  }

  // "Próxima" da discussão: se houver figuras dedicadas, mostra-as antes de avançar.
  function discussionNext() {
    if (H.figures && H.figures.length) { H.figIndex = 0; showFigure(); }
    else nextQuestion();
  }

  function showFigure() {
    H.phase = "figure";
    const q = QUIZ.questoes[H.qIndex];
    const fig = H.figures[H.figIndex];
    $("#fig-title").textContent = `Questão ${q.n} — ${q.tema}`;
    const src = /^https?:/.test(fig.img) ? fig.img : "assets/img/" + fig.img;
    $("#fig-wrap").innerHTML = `<img src="${src}" alt="" onload="window.__fit&&window.__fit()" onerror="if(this.parentNode)this.parentNode.style.display='none';window.__fit&&window.__fit()">`;
    $("#fig-cap").textContent = fig.caption || "";
    const last = H.figIndex >= H.figures.length - 1;
    $("#btn-fig-next").textContent = last
      ? (H.qIndex >= TOTAL - 1 ? "Ver resultado final →" : "Próxima questão →")
      : "Próxima figura →";
    show("figure");
  }

  function figureNext() {
    if (H.figIndex < H.figures.length - 1) { H.figIndex++; showFigure(); }
    else nextQuestion();
  }

  function renderCard(c) {
    const el = document.createElement("div");
    if (c.tipo === "imagem") {
      el.className = "card imagem";
      const src = /^https?:/.test(c.img) ? c.img : "assets/img/" + c.img;
      el.innerHTML = `<figure style="margin:0">
        <img src="${src}" alt="" onload="window.__fit&&window.__fit()" onerror="var c=this.closest('.card'); if(c)c.style.display='none';window.__fit&&window.__fit()">
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

  async function showFinal() {
    H.phase = "final";
    lockTimeSelect(false); // libera o tempo de novo (para uma nova rodada)
    const r = await hostPost("final");
    if (r && Array.isArray(r.ranking)) {
      H.standings = r.ranking.map((x) => ({ nome: x.aluno, score: x.pontos, gain: 0, online: true }));
    }
    if (H.ecg) H.ecg.set(1);
    const curEl = $("#ecg-cur"); if (curEl) curEl.textContent = String(TOTAL).padStart(2, "0");

    const rows = H.standings || [];
    const top3 = rows.slice(0, 3);
    const order = [1, 0, 2]; // colunas: 2º, 1º, 3º
    const pod = $("#podium"); pod.innerHTML = "";
    order.forEach((idx) => {
      const r2 = top3[idx]; if (!r2) return;
      const place = idx + 1;
      const col = document.createElement("div");
      col.className = "col c" + place;
      col.innerHTML = `
        <div class="av-lg">${C.initials(r2.nome)}</div>
        <div class="name">${escapeHtml(r2.nome)}</div>
        <div class="pts">${r2.score} pts</div>
        <div class="stand">${place === 1 ? "🥇" : place === 2 ? "🥈" : "🥉"}</div>`;
      pod.appendChild(col);
    });
    const list = $("#final-list"); list.innerHTML = "";
    rows.slice(3, 15).forEach((r2, i) => {
      const row = document.createElement("div");
      row.className = "rank-row";
      row.innerHTML = `<div class="pos">${i + 4}</div>
        <div class="who"><span class="av">${C.initials(r2.nome)}</span>${escapeHtml(r2.nome)}</div>
        <div class="gain zero"></div><div class="score">${r2.score}</div>`;
      list.appendChild(row);
    });
    show("final");
  }

  function backToLobby() {
    H.phase = "lobby";
    H.qIndex = -1;
    lockTimeSelect(false); // no lobby o tempo volta a ser ajustável
    if (H.ecg) H.ecg.set(0);
    paintEcg();
    show("lobby");
  }

  /* ----------------------------- Render ----------------------------- */
  function lockTimeSelect(locked) {
    const el = $("#time-select");
    if (el) {
      el.disabled = !!locked;
      el.title = locked ? "O tempo já foi definido para esta partida" : "Tempo por questão";
    }
  }

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
    const arr = (H.standings || []).slice();
    $("#count-pill").innerHTML = `<b>${H.online || 0}</b> conectados`;
    if (box) {
      arr.sort((a, b) => Number(b.online) - Number(a.online));
      // Só reconstrói o DOM quando a lista muda de fato — evita o "piscar" a cada poll.
      const sig = arr.map((p) => p.nome + ":" + (p.online ? 1 : 0)).join("|");
      if (sig !== H._playersSig) {
        H._playersSig = sig;
        if (!arr.length) { box.innerHTML = `<span class="empty-hint">Aguardando alunos entrarem…</span>`; }
        else {
          box.innerHTML = "";
          arr.forEach((p) => {
            const c = document.createElement("span");
            c.className = "chip" + (p.online ? "" : " off");
            c.innerHTML = `<span class="av">${C.initials(p.nome)}</span>${escapeHtml(p.nome)}`;
            box.appendChild(c);
          });
        }
        fitScreen();
      }
    }
    const startBtn = $("#btn-start");
    if (startBtn) startBtn.disabled = (H.online || 0) < 1;
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
      imgWrap.innerHTML = `<img src="${q.imgEnunciado.src}" alt="" onload="window.__fit&&window.__fit()" onerror="if(this.parentNode)this.parentNode.style.display='none';window.__fit&&window.__fit()">`;
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
    fitScreen();
  }

  function updateAnsweredCount() {
    if (H.phase !== "question") return;
    $("#answered-count").innerHTML = `<b>${H.respondidos || 0}</b> / ${H.online || 0} responderam`;
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

  function paintEcg() {
    if (H.ecg) H.ecg.set(H.qIndex < 0 ? 0 : (H.qIndex + 1) / TOTAL);
    const cur = $("#ecg-cur");
    if (cur) cur.textContent = H.qIndex < 0 ? "—" : String(H.qIndex + 1).padStart(2, "0");
  }

  /* ---------------------- Tela cheia / auto-ajuste ---------------------- */
  // Escala a tela ativa para caber na área visível, sem precisar rolar.
  let fitPending = false;
  function fitScreen() {
    if (fitPending) return;
    fitPending = true;
    requestAnimationFrame(() => {
      fitPending = false;
      const screen = $(".screen.active"); const wrap = $(".wrap");
      if (!screen || !wrap) return;
      // zoom (não transform) para o texto crescer NÍTIDO no telão, sem borrar.
      screen.style.zoom = "1";
      // Espaço REAL disponível = área do wrap MENOS o padding dele (senão a base corta).
      const cs = getComputedStyle(wrap);
      const padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
      const availH = wrap.clientHeight - padY - 2; // -2px de folga contra arredondamento
      const availW = document.documentElement.clientWidth;
      // Discussão: limita a faixa/rail de imagens a uma fração da altura REAL disponível.
      // Como deriva de availH (e não do zoom), as imagens nunca fazem a tela crescer nem o
      // texto encolher junto. null-guarded => não afeta lobby/questão/ranking/final.
      const dcards = screen.querySelector(".cards[data-mode]");
      if (dcards) {
        const strip = Math.max(180, Math.min(300, Math.round(availH * 0.34)));
        const rail  = Math.max(240, Math.min(380, Math.round(availH * 0.56)));
        dcards.style.setProperty("--fig-h", strip + "px");
        dcards.style.setProperty("--rail-h", rail + "px");
      }
      const needH = screen.scrollHeight;
      const needW = screen.scrollWidth;
      // Preenche a tela: amplia até 2,5× e reduz até 0,25×; limitado por altura E largura.
      let scale = Math.min(needH > 0 ? availH / needH : 1, needW > 0 ? availW / needW : 1);
      scale = Math.min(2.5, Math.max(0.25, scale));
      screen.style.zoom = String(scale);
    });
  }
  window.__fit = fitScreen; // usado por imagens que carregam depois (onload)

  function toggleFullscreen() {
    const d = document;
    if (!d.fullscreenElement) {
      (d.documentElement.requestFullscreen || d.documentElement.webkitRequestFullscreen || (() => {})).call(d.documentElement);
    } else {
      (d.exitFullscreen || d.webkitExitFullscreen || (() => {})).call(d);
    }
  }

  /* ------------------------------ Init ------------------------------ */
  function init() {
    $("#year-title").textContent = QUIZ.titulo;
    $("#year-sub").textContent = QUIZ.subtitulo;
    const totEl = $("#ecg-tot"); if (totEl) totEl.textContent = TOTAL;
    H.ecg = (window.ECG && $("#ecg-track")) ? ECG.mount($("#ecg-track"), $("#ecg-trace"), $("#ecg-dot"), TOTAL) : null;
    startRoom();

    $("#btn-start").addEventListener("click", startGame);
    $("#btn-reveal").addEventListener("click", revealAnswer);
    $("#btn-ranking").addEventListener("click", showRanking);
    $("#btn-discussion").addEventListener("click", showDiscussion);
    $("#btn-next").addEventListener("click", discussionNext);
    $("#btn-fig-next").addEventListener("click", figureNext);
    // "Jogar novamente" volta ao lobby: lá o tempo pode ser reajustado antes de recomeçar.
    $("#btn-again").addEventListener("click", backToLobby);
    $("#btn-new-room").addEventListener("click", () => {
      const nr = newRoomCode();
      localStorage.setItem("qz_room", nr);
      localStorage.setItem("qz_session", nr + "-" + Date.now());
      location.reload();
    });
    $("#btn-copy").addEventListener("click", () => {
      navigator.clipboard && navigator.clipboard.writeText(joinURL());
      toast("Link copiado!");
    });
    const fsBtn = $("#btn-fs");
    if (fsBtn) fsBtn.addEventListener("click", toggleFullscreen);
    window.addEventListener("resize", fitScreen);
    document.addEventListener("fullscreenchange", fitScreen);
    fitScreen();
  }

  function toast(t) {
    const el = $("#toast"); if (!el) return;
    el.textContent = t; el.classList.add("show");
    setTimeout(() => el.classList.remove("show"), 1800);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
