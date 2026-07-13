/* =====================================================================
   ECG — barra de progresso "batimento" dourada (assinatura MedCof).
   Um batimento por questão; o ponto dourado avança conforme o quiz.
   Traçado idêntico ao da apresentação de referência.
   ===================================================================== */
window.ECG = (function () {
  function ecgPath(W, H, beats) {
    const base = H * 0.62, amp = H * 0.50, bw = W / beats;
    let d = `M0 ${base}`;
    for (let b = 0; b < beats; b++) {
      const x = b * bw;
      d += ` L${x + bw * 0.10} ${base}`;
      d += ` Q${x + bw * 0.16} ${base - amp * 0.16} ${x + bw * 0.22} ${base}`;
      d += ` L${x + bw * 0.32} ${base}`;
      d += ` L${x + bw * 0.36} ${base + amp * 0.10}`;
      d += ` L${x + bw * 0.42} ${base - amp}`;
      d += ` L${x + bw * 0.48} ${base + amp * 0.30}`;
      d += ` L${x + bw * 0.54} ${base}`;
      d += ` L${x + bw * 0.64} ${base}`;
      d += ` Q${x + bw * 0.74} ${base - amp * 0.30} ${x + bw * 0.84} ${base}`;
      d += ` L${x + bw} ${base}`;
    }
    return d;
  }

  // Monta o traçado num <svg viewBox="0 0 1200 32">.
  // Retorna um objeto com set(frac) para avançar o ponto (0..1).
  function mount(trackEl, traceEl, dotEl, beats) {
    const d = ecgPath(1200, 32, beats);
    trackEl.setAttribute("d", d);
    traceEl.setAttribute("d", d);
    const len = traceEl.getTotalLength();
    traceEl.style.strokeDasharray = len;
    traceEl.style.strokeDashoffset = len; // começa vazio
    return {
      set(frac) {
        const p = Math.max(0, Math.min(1, frac));
        traceEl.style.strokeDashoffset = len * (1 - p);
        try {
          const pt = traceEl.getPointAtLength(len * p);
          dotEl.setAttribute("cx", pt.x);
          dotEl.setAttribute("cy", pt.y);
          dotEl.style.opacity = p > 0 ? 1 : 0;
        } catch (e) {}
      },
    };
  }

  return { mount, ecgPath };
})();
