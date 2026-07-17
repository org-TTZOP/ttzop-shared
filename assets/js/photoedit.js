// ═══ ✂️ УНІВЕРСАЛЬНЫ ФОТА-РЭДАКТАР (ПРОДАКФПФ, адзін кампанент на ЎСЕ куткі: панэль + Чарнавік) ═══
// Абрэзка (прапорцыі 16:9/4:3/1:1/без + пан/зум) · Яркасць · Насычанасць · Паварот 90°.
// Самадастатковы (як reader.js/cdate.js): чысты canvas, без бібліятэк; подпісы дае КАЛЛЕР праз labels
// (панэль — t(), сайт — getUI()); вынік ідзе ў існуючы канвеер загрузкі (processImage → R2) без зменаў.
// API: openPhotoEditor(file, {labels, applyAllOption}) → Promise<{file} | {file, skipAll:true} | null (адмена)>
(function (global) {
  const DEF = { title: 'Edit photo', crop_free: 'No crop', bright: 'Brightness', sat: 'Saturation',
    rotate: 'Rotate', vig: 'Vignette', reset: 'Reset', skip: 'No edits', skip_all: 'No edits for all', done: 'Done', cancel: 'Cancel' };
  let box = null;

  function openPhotoEditor(file, opts) {
    opts = opts || {};
    const L = Object.assign({}, DEF, opts.labels || {});
    if (!file || !(file.type || '').startsWith('image/')) return Promise.resolve({ file });
    return new Promise(resolve => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => { URL.revokeObjectURL(url); mount(img, file, L, opts, resolve); };
      img.onerror = () => { URL.revokeObjectURL(url); resolve({ file }); }; // не чытаецца — грузім як ёсць
      img.src = url;
    });
  }

  function mount(img, file, L, opts, resolve) {
    // стан рэдагавання
    const st = { rot: 0, br: 1, sa: 1, vg: 0, ar: 0, z: 1, cx: 0.5, cy: 0.5 }; // ar 0 = без абрэзкі; cx/cy — цэнтр кадра (0..1)
    let rotCv = document.createElement('canvas'); // крыніца пасля павароту (пераразлічваецца на ⟳)
    const makeRot = () => {
      const q = st.rot % 180 !== 0;
      rotCv.width = q ? img.naturalHeight : img.naturalWidth;
      rotCv.height = q ? img.naturalWidth : img.naturalHeight;
      const c = rotCv.getContext('2d');
      c.save(); c.translate(rotCv.width / 2, rotCv.height / 2); c.rotate(st.rot * Math.PI / 180);
      c.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2); c.restore();
    };
    makeRot();

    if (box) box.remove();
    box = document.createElement('div');
    box.id = 'pe-modal';
    box.style.cssText = 'position:fixed;inset:0;z-index:10500;background:rgba(0,0,0,0.75);display:flex;align-items:center;justify-content:center;padding:14px';
    const chip = (id, txt) => `<button type="button" data-ar="${id}" style="padding:5px 10px;border:1px solid rgba(128,128,128,0.5);border-radius:999px;background:transparent;color:inherit;cursor:pointer;font-size:0.78rem">${txt}</button>`;
    const btn = 'padding:9px 14px;border:1px solid rgba(128,128,128,0.5);border-radius:8px;background:transparent;color:inherit;cursor:pointer;font-size:0.85rem';
    box.innerHTML = `<div style="background:var(--surface, #181c27);color:var(--text, #e8eaf0);border-radius:14px;max-width:640px;width:100%;max-height:96vh;overflow:auto;padding:14px 16px;font-family:inherit">
      <div style="font-weight:700;margin-bottom:10px">🪄 ${esc(L.title)}</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:10px">
        ${chip('0', esc(L.crop_free))}${chip('1.7778', '16:9')}${chip('1.3333', '4:3')}${chip('1', '1:1')}
        <button type="button" id="pe-rot" title="${esc(L.rotate)}" style="margin-left:auto;padding:5px 12px;border:1px solid rgba(128,128,128,0.5);border-radius:999px;background:transparent;color:inherit;cursor:pointer">⟳</button>
      </div>
      <div id="pe-stage" style="position:relative;background:#111;border-radius:10px;overflow:hidden;display:flex;align-items:center;justify-content:center;touch-action:none">
        <canvas id="pe-cv" style="max-width:100%;max-height:52vh;display:block;cursor:grab"></canvas>
      </div>
      <div id="pe-zoom-row" style="display:none;align-items:center;gap:10px;margin-top:10px"><span style="font-size:0.8rem;opacity:0.7">🔍</span><input id="pe-zoom" type="range" min="100" max="400" value="100" style="flex:1"></div>
      <div style="display:flex;align-items:center;gap:10px;margin-top:8px"><span style="font-size:0.8rem;opacity:0.7;min-width:110px">☀️ ${esc(L.bright)}</span><input id="pe-br" type="range" min="40" max="180" value="100" style="flex:1"></div>
      <div style="display:flex;align-items:center;gap:10px;margin-top:8px"><span style="font-size:0.8rem;opacity:0.7;min-width:110px">🎨 ${esc(L.sat)}</span><input id="pe-sa" type="range" min="0" max="220" value="100" style="flex:1"></div>
      <div style="display:flex;align-items:center;gap:10px;margin-top:8px"><span style="font-size:0.8rem;opacity:0.7;min-width:110px">🌒 ${esc(L.vig)}</span><input id="pe-vg" type="range" min="0" max="100" value="0" style="flex:1"></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px">
        <button type="button" id="pe-reset" style="${btn}">↺ ${esc(L.reset)}</button>
        <span style="flex:1"></span>
        <button type="button" id="pe-cancel" style="${btn}">${esc(L.cancel)}</button>
        <button type="button" id="pe-skip" style="${btn}">${esc(L.skip)}</button>
        ${opts.applyAllOption ? `<button type="button" id="pe-skipall" style="${btn}">${esc(L.skip_all)}</button>` : ''}
        <button type="button" id="pe-done" style="${btn};background:var(--accent, #f97316);border-color:var(--accent, #f97316);color:#fff;font-weight:700">✓ ${esc(L.done)}</button>
      </div>
    </div>`;
    document.body.appendChild(box);
    const $ = id => box.querySelector('#' + id);
    const cv = $('pe-cv'), ctx = cv.getContext('2d');
    // ⚠️ ctx.filter правяраем РЭАЛЬНАЙ пробай піксела (чытанне ўласцівасці хлусіць: экспанда-прысвойванне
    // «падтрымліваецца», а маляванне ігнаруе фільтр → «слайдэры нічога не мяняюць», злоўлена жыва)
    const filterWorks = (() => { try { const tc = document.createElement('canvas'); tc.width = tc.height = 1; const c = tc.getContext('2d'); c.filter = 'brightness(0.4)'; c.fillStyle = '#fff'; c.fillRect(0, 0, 1, 1); return c.getImageData(0, 0, 1, 1).data[0] < 200; } catch { return false; } })();

    // кадр у КРЫНІЦЫ (rotCv-прасторы): найбольшы прамавугольнік прапорцыі ar, падзелены на zoom, з цэнтрам cx/cy
    const cropRect = () => {
      const W = rotCv.width, H = rotCv.height;
      if (!+st.ar) return { x: 0, y: 0, w: W, h: H };
      const A = +st.ar;
      let w = W, h = w / A; if (h > H) { h = H; w = h * A; }
      w /= st.z; h /= st.z;
      const x = Math.min(Math.max(st.cx * W - w / 2, 0), W - w);
      const y = Math.min(Math.max(st.cy * H - h / 2, 0), H - h);
      return { x, y, w, h };
    };
    const manualFilter = c2 => { // fallback: яркасць + насычанасць па пікселях (luma-мікс)
      const d = c2.getImageData(0, 0, c2.canvas.width, c2.canvas.height), p = d.data;
      for (let i = 0; i < p.length; i += 4) {
        let r = p[i] * st.br, g = p[i + 1] * st.br, b = p[i + 2] * st.br;
        const l = 0.299 * r + 0.587 * g + 0.114 * b;
        p[i] = Math.min(255, l + (r - l) * st.sa); p[i + 1] = Math.min(255, l + (g - l) * st.sa); p[i + 2] = Math.min(255, l + (b - l) * st.sa);
      }
      c2.putImageData(d, 0, 0);
    };
    const drawTo = (c2, outW, withFilter) => {
      const r = cropRect();
      const w = Math.round(outW), h = Math.round(outW * r.h / r.w);
      c2.canvas.width = w; c2.canvas.height = h;
      if (withFilter && filterWorks) c2.filter = `brightness(${st.br}) saturate(${st.sa})`;
      c2.drawImage(rotCv, r.x, r.y, r.w, r.h, 0, 0, w, h);
      if (withFilter && filterWorks) c2.filter = 'none';
      else if (withFilter && (st.br !== 1 || st.sa !== 1)) manualFilter(c2);
      if (st.vg > 0) { // 🌒 він'етка: радыяльны градыент паверх (аднолькава ў прэв'ю і экспарце)
        const g = c2.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.hypot(w, h) / 2);
        g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${0.85 * st.vg})`);
        c2.fillStyle = g; c2.fillRect(0, 0, w, h);
      }
    };
    // прэв'ю: маляванне БЕЗ фільтра + CSS-фільтр на самім канвасе (імгненна і працуе ўсюды);
    // рэальны фільтр пікселяў — толькі на экспарце (drawTo(..., true))
    const render = () => { drawTo(ctx, Math.min(900, cropRect().w), false); cv.style.filter = `brightness(${st.br}) saturate(${st.sa})`; $('pe-zoom-row').style.display = +st.ar ? 'flex' : 'none';
      box.querySelectorAll('[data-ar]').forEach(b => { const on = String(+b.dataset.ar) === String(+st.ar); b.style.background = on ? 'var(--accent, #f97316)' : 'transparent'; b.style.color = on ? '#fff' : 'inherit'; b.style.borderColor = on ? 'var(--accent, #f97316)' : 'rgba(128,128,128,0.5)'; }); };
    render();

    // пан кадра (мыш/тач адным шляхам — Pointer Events)
    let drag = null;
    cv.addEventListener('pointerdown', e => { if (!+st.ar) return; drag = { x: e.clientX, y: e.clientY }; cv.setPointerCapture(e.pointerId); cv.style.cursor = 'grabbing'; });
    cv.addEventListener('pointermove', e => {
      if (!drag) return;
      const r = cropRect(), k = r.w / cv.getBoundingClientRect().width; // канвас-px → крыніца-px
      st.cx -= (e.clientX - drag.x) * k / rotCv.width; st.cy -= (e.clientY - drag.y) * k / rotCv.height;
      st.cx = Math.min(Math.max(st.cx, 0), 1); st.cy = Math.min(Math.max(st.cy, 0), 1);
      drag = { x: e.clientX, y: e.clientY }; render();
    });
    cv.addEventListener('pointerup', () => { drag = null; cv.style.cursor = 'grab'; });

    box.querySelectorAll('[data-ar]').forEach(b => b.addEventListener('click', () => { st.ar = +b.dataset.ar; st.z = 1; st.cx = st.cy = 0.5; $('pe-zoom').value = 100; render(); }));
    $('pe-rot').addEventListener('click', () => { st.rot = (st.rot + 90) % 360; makeRot(); st.cx = st.cy = 0.5; render(); });
    $('pe-zoom').addEventListener('input', e => { st.z = +e.target.value / 100; render(); });
    $('pe-br').addEventListener('input', e => { st.br = +e.target.value / 100; render(); });
    $('pe-sa').addEventListener('input', e => { st.sa = +e.target.value / 100; render(); });
    $('pe-vg').addEventListener('input', e => { st.vg = +e.target.value / 100; render(); });
    $('pe-reset').addEventListener('click', () => { st.rot = 0; st.br = 1; st.sa = 1; st.vg = 0; st.ar = 0; st.z = 1; st.cx = st.cy = 0.5; makeRot(); $('pe-br').value = 100; $('pe-sa').value = 100; $('pe-vg').value = 0; $('pe-zoom').value = 100; render(); });

    const close = () => { box.remove(); box = null; document.removeEventListener('keydown', onKey); };
    const finish = v => { close(); resolve(v); };
    function onKey(e) { if (e.key === 'Escape') finish(null); }
    document.addEventListener('keydown', onKey);
    box.addEventListener('mousedown', e => { if (e.target === box) finish(null); });
    $('pe-cancel').addEventListener('click', () => finish(null));
    $('pe-skip').addEventListener('click', () => finish({ file }));
    const skipAllBtn = $('pe-skipall'); if (skipAllBtn) skipAllBtn.addEventListener('click', () => finish({ file, skipAll: true }));
    $('pe-done').addEventListener('click', () => {
      // без правак увогуле → аддаём арыгінал (нуль перакадаванняў)
      if (!+st.ar && st.rot === 0 && st.br === 1 && st.sa === 1 && st.vg === 0) return finish({ file });
      const out = document.createElement('canvas').getContext('2d');
      drawTo(out, Math.min(2400, cropRect().w), true); // столь 2400px — далей канвеер сам сцісне да 1200
      const done = blob => finish({ file: blob ? new File([blob], (file.name || 'photo').replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' }) : file });
      out.canvas.toBlob(done, 'image/jpeg', 0.92);
    });
  }

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  global.openPhotoEditor = openPhotoEditor;
})(window);
