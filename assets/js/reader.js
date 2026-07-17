// ════════════════════════════════════════════════════════════════════════════
// 📄 УНІВЕРСАЛЬНЫ ЧЫТАЧ ДАКУМЕНТА (reader.js) — АДЗІН кампанент на ЎСЕ куткі праекта:
// сайт (main.js), панэль (admin/index.html), кабінет (portal.html). ПРОДАКФПФ-механізм,
// названы па ФУНКЦЫІ (не па раздзеле). Самадастатковы: не залежыць ад site-хелпераў —
// каллер перадае гатовыя bodyHtml/колеры/подпісы праз cfg (свой i18n і свае колеры кожнага файла).
//
// API (глабальныя):
//   openReaderModal(cfg)      — тэмавая мадалка паверх старонкі (хуткае чытанне; звычайна style:'site')
//   openReaderWindow(cfg)     — асобнае акно/укладка з фіксаванай панэллю кнопак
//   replaceWithReaderDoc(cfg) — замяніць бягучую старонку дакументам (напр. прагляд па share-спасылцы)
//   mountReaderDoc(win, cfg)  — АДЗІНЫ мантаж у любое акно (усе шляхі праз яго; сінхронны window.open да fetch — фактура)
//   renderReaderDoc(cfg)      — вярнуць поўны self-contained HTML-радок дакумента (унутраны рэндэр mountReaderDoc)
//
// cfg = {
//   title,  meta,             // загаловак + радок мета (дата і інш., опц.)
//   coverUrl,                 // вокладка (опц.; паказваецца ў style:'site')
//   bodyHtml,                 // ГАТОВЫ HTML цела дакумента (каллер будуе сам)
//   extraCss,                 // дадатковы CSS цела (напр. табліцы фактуры) — опц.
//   lang, dir,                // мова / напрамак для <html>
//   style: 'site' | 'paper',  // site = колеры тэмы (чытанне на экране); paper = белы дакумент (друк)
//   colors: {bg,fg,accent},   // style:'site' — рэзалвяцца каллерам з тэмы; paper — дэфолты (белы/цёмны)
//   share: {mode:'text'|'url', value, title}, // опц. кнопка «Падзяліцца» (сістэмнае меню / копія)
//   labels: {share,pdfprint,close,copied},    // подпісы кнопак (свой i18n кожнага файла)
//   fontControls,             // паказаць A−/A+ (дэфолт true; уплывае ТОЛЬКІ на экран, друк = стандарт)
//   siteName,                 // подпіс злева ў панэлі акна
//   onClose,                  // хук закрыцця мадалкі (опц.; напр. прыбраць дып-лінк-хэш з адраса)
//   closeHref                 // опц.: ✕ вядзе на гэты адрас замест window.close() (старонка па прамой спасылцы)
// }
// ════════════════════════════════════════════════════════════════════════════
(function (global) {
  'use strict';
  var FS_KEY = 'ttzop_reader_fs';        // множнік памеру шрыфта (агульны для мадалкі і акна, localStorage)
  var FS_MIN = 0.8, FS_MAX = 1.8, FS_STEP = 0.1;

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function jsq(s) { return JSON.stringify(String(s == null ? '' : s)).replace(/</g, '\\u003c'); } // бяспечны embed у <script>
  function getFs() { try { return parseFloat(localStorage.getItem(FS_KEY)) || 1; } catch (e) { return 1; } }
  function setFs(f) { try { localStorage.setItem(FS_KEY, f); } catch (e) {} }
  function clampFs(f) { return Math.min(FS_MAX, Math.max(FS_MIN, Math.round(f * 10) / 10)); }

  // колеры паводле стылю: paper заўжды белы+цёмны (строгі друкавальны дакумент); site — з тэмы (каллер)
  function resolveColors(cfg) {
    if (cfg.style === 'paper') return { bg: '#ffffff', fg: '#1a1a1a', accent: (cfg.colors && cfg.colors.accent) || '#f97316' };
    var c = cfg.colors || {};
    return { bg: c.bg || '#ffffff', fg: c.fg || '#111111', accent: c.accent || '#f97316' };
  }
  function baseFontRem(style) { return style === 'paper' ? 0.95 : 1.15; } // база (× --fs); paper драбнейшы дзелавы

  // агульны CSS цела дакумента (нашчадкі пераймаюць колер; спасылкі — акцэнт праз --rdr-acc)
  function bodyCss(base) {
    return '.rdr-body{font-size:calc(' + base + 'rem * var(--fs,1))}' +
      '.rdr-body *{color:inherit}.rdr-body a{color:var(--rdr-acc)!important}' +
      '.rdr-body img{max-width:100%;height:auto;border-radius:8px}' +
      '.rdr-body h1,.rdr-body h2,.rdr-body h3,.rdr-body h4{line-height:1.3;margin:1em 0 .4em}' +
      '.rdr-body ul,.rdr-body ol{padding-left:1.4em;margin:.5em 0}.rdr-body p{margin:.7em 0}';
  }

  function toolbarHtml(cfg, col) {
    var L = cfg.labels || {};
    var fc = cfg.fontControls !== false;
    var aBtn = 'class="rdr-b rdr-a"';
    var b = 'class="rdr-b"';
    var out = '<span class="rdr-name">' + esc(cfg.siteName || '') + '</span>';
    if (fc) out += '<button ' + aBtn + ' style="font-size:0.8rem" onclick="_rdrFs(-' + FS_STEP + ')" aria-label="A−" title="A−">A</button>' +
                   '<button ' + aBtn + ' style="font-size:1.15rem" onclick="_rdrFs(' + FS_STEP + ')" aria-label="A+" title="A+">A</button>';
    if (cfg.share) out += '<button ' + b + ' onclick="_rdrShare(this)">↗ ' + esc(L.share || 'Share') + '</button>'; // this → ✓-водгук на самой кнопцы
    out += '<button ' + b + ' onclick="window.print()">🖨 ' + esc(L.pdfprint || 'PDF') + '</button>';
    // ✕ праз генерычны _rdrClose (у інлайн-скрыпце дакумента): пусты closeHref → window.close();
    // мэта, што адрозніваецца ад бягучай толькі #-хэшам, — прымусовы reload (Tesla/стары Chromium не перазагружаюць пры зняцці хэша)
    out += '<button ' + b + ' onclick="_rdrClose(' + esc(jsq(cfg.closeHref || '')) + ')">✕ ' + esc(L.close || '') + '</button>';
    return out;
  }

  // ── поўны self-contained HTML-дакумент (акно / замена старонкі) ──
  function renderReaderDoc(cfg) {
    var col = resolveColors(cfg);
    var base = baseFontRem(cfg.style);
    var isPaper = cfg.style === 'paper';
    var sheetMax = isPaper ? '720px' : 'min(64rem,92vw)';
    var cover = (!isPaper && cfg.coverUrl) ? '<div class="rdr-cover"><img src="' + esc(cfg.coverUrl) + '" alt=""></div>' : '';
    var meta = cfg.meta ? '<div class="rdr-meta">' + esc(cfg.meta) + '</div>' : '';
    var title = cfg.title ? '<h1 class="rdr-title">' + esc(cfg.title) + '</h1>' : '';
    var share = cfg.share || {};
    var L = cfg.labels || {};
    return '<!doctype html><html lang="' + esc(cfg.lang || 'en') + '" dir="' + esc(cfg.dir || 'ltr') + '"><head><meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<title>' + esc(cfg.title || '') + (cfg.siteName ? ' — ' + esc(cfg.siteName) : '') + '</title><style>' +
      '*{box-sizing:border-box}html{--fs:1;--rdr-acc:' + col.accent + '}' +
      'body{margin:0;background:' + col.bg + ';color:' + col.fg + ";font-family:'Manrope',system-ui,-apple-system,sans-serif;line-height:1.75}" +
      '.rdr-bar{position:sticky;top:0;z-index:10;display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:12px clamp(16px,4vw,40px);background:' + col.bg + ';border-bottom:1px solid rgba(128,128,128,0.28)}' +
      '.rdr-bar .rdr-name{margin-inline-end:auto;font-weight:700;opacity:0.75;font-size:0.95rem;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
      '.rdr-b{display:inline-flex;align-items:center;gap:6px;padding:8px 13px;border:1px solid currentColor;border-radius:8px;background:transparent;color:inherit;cursor:pointer;font:600 0.9rem system-ui,sans-serif;opacity:0.82;line-height:1}.rdr-b:hover{opacity:1}.rdr-b.rdr-a{width:38px;justify-content:center;padding:6px 0}' +
      '.rdr-sheet{max-width:' + sheetMax + ';margin:0 auto;padding:36px clamp(22px,6vw,80px) 90px}' +
      '.rdr-cover{height:min(340px,38vh);overflow:hidden;border-radius:12px;margin-bottom:22px}.rdr-cover img{width:100%;height:100%;object-fit:cover;display:block}' +
      '.rdr-meta{font-size:0.9rem;opacity:0.6;margin-bottom:10px}.rdr-title{font-size:clamp(1.7rem,3.6vw,2.4rem);line-height:1.2;margin:0 0 20px}' +
      bodyCss(base) +
      '@media print{.rdr-bar{display:none}html{--fs:1}.rdr-sheet{max-width:100%;padding:0}}' +   // друк: панэль схавана, памер стандартны
      (cfg.extraCss || '') +
      '</style></head><body>' +
      '<div class="rdr-bar">' + toolbarHtml(cfg, col) + '</div>' +
      '<div class="rdr-sheet">' + cover + meta + title + '<div class="rdr-body">' + (cfg.bodyHtml || '') + '</div></div>' +
      '<script>' +
      "var K='" + FS_KEY + "';function _rdrGf(){try{return parseFloat(localStorage.getItem(K))||1}catch(e){return 1}}" +
      'function _rdrFs(d){var f=Math.min(' + FS_MAX + ',Math.max(' + FS_MIN + ',Math.round((_rdrGf()+d)*10)/10));try{localStorage.setItem(K,f)}catch(e){}document.documentElement.style.setProperty("--fs",f)}' +
      'document.documentElement.style.setProperty("--fs",_rdrGf());' +
      // закрыццё дакумента. h зададзены (замена старонкі): толькі-хэш адрознасць → replaceState+reload
      // (надзейна на Tesla/старым Chromium); інакш звычайная навігацыя. h пусты (асобнае акно/укладка):
      // window.close() — але Tesla Atom не мае асобных укладак і адкрывае ў тым жа акне → self-close ігнаруецца;
      // фолбэк праз 250мс на _RDR_HOME (сам сайт у гэтым акне). Калі close спрацаваў — акно знікла, таймер не выклічацца.
      'var _RDR_HOME=' + jsq(cfg._homeHref || '') + ';' +
      'function _rdrClose(h){' +
      'if(h){try{var c=location.href.split("#")[0];var t=new URL(h,location.href).href.split("#")[0];if(t===c){history.replaceState(null,"",h);location.reload();return}}catch(e){}location.href=h;return}' +
      'try{window.close()}catch(e){}' +
      'setTimeout(function(){var u=_RDR_HOME;if(!u){try{u=(window.opener&&window.opener.location)?window.opener.location.href.split("#")[0]:"/"}catch(e){u="/"}}location.href=u},250)}' +
      // фолбэк без navigator.share АБО пры яго адмове (Safari можа адмаўляць share у document.write-акне):
      // копія ў буфер + ✓-водгук НА КНОПЦЫ (канон _copyEl; alert() адкінуты). AbortError = карыстальнік сам закрыў шыт — не капіруем.
      (cfg.share ? 'function _rdrShare(b){var d={title:' + jsq(share.title || cfg.title) + ',' +
        (share.mode === 'url' ? 'url:' + jsq(share.value) : 'text:' + jsq(share.value)) + '};' +
        'var cp=function(){var t=' + (share.mode === 'url' ? jsq(share.value) : jsq((share.title || cfg.title || '') + '\n\n' + (share.value || ''))) + ';' +
        'var ok=function(){if(!b)return;var o=b.innerHTML;b.innerHTML=' + jsq('✓ ') + '+' + jsq(L.copied || 'Copied') + ';setTimeout(function(){b.innerHTML=o},1600)};' +
        'if(navigator.clipboard){navigator.clipboard.writeText(t).then(ok).catch(function(){})}else{prompt(' + jsq(L.copied || 'Copied') + ',t)}};' +
        'if(navigator.share){navigator.share(d).catch(function(e){if(!e||e.name!==' + jsq('AbortError') + ')cp()})}else{cp()}}' : '') +
      '<\/script></body></html>';
  }

  // АДЗІНЫ мантаж дакумента ў ЛЮБОЕ акно (сваё/новае/адкрытае каллерам сінхронна) — БЕЗ document.write:
  // Safari пасля window.print() губляў змест write-дакумента (заставаўся голы фон). DOMParser → перанос
  // head/body у жывы дакумент; innerHTML не выконвае <script> — перазапускаем інлайн-скрыпты ўручную.
  function mountReaderDoc(win, cfg) {
    var doc = win.document;
    var parsed = new DOMParser().parseFromString(renderReaderDoc(cfg), 'text/html');
    doc.documentElement.setAttribute('lang', parsed.documentElement.getAttribute('lang') || '');
    doc.documentElement.setAttribute('dir', parsed.documentElement.getAttribute('dir') || '');
    doc.head.innerHTML = parsed.head.innerHTML;
    doc.body.innerHTML = parsed.body.innerHTML;
    doc.body.querySelectorAll('script').forEach(function (old) {
      var s = doc.createElement('script');
      if (old.src) s.src = old.src; else s.textContent = old.textContent; // знешні src ЗАХОЎВАЕЦЦА (напр. Leaflet для мапы маршруту ў акне; innerHTML-скрыпты інакш не выконваюцца)
      old.replaceWith(s);
    });
  }
  function openReaderWindow(cfg) {
    var w = global.open('', '_blank'); if (!w) return; // папап-блакер → ціха (застаецца мадалка/старонка)
    try { if (!cfg._homeHref) cfg._homeHref = global.location.origin + global.location.pathname; } catch (e) {} // фолбэк ✕ калі window.close() адмоўлены (Tesla Atom: _blank у тым жа акне)
    mountReaderDoc(w, cfg); // same-origin (about:blank ад opener) → localStorage памеру працуе
  }
  function replaceWithReaderDoc(cfg) { mountReaderDoc(global, cfg); }

  // ── МАДАЛКА (аверлэй паверх старонкі) — будуецца ў DOM (кнопкі праз closures, не inline) ──
  function ensureModalStyle(base) {
    var id = 'rdr-modal-style', st = document.getElementById(id);
    var css = '.rdr-ov{position:fixed;inset:0;z-index:100000;display:flex;align-items:flex-start;justify-content:center;background:rgba(0,0,0,0.82);padding:2.5vh 2vw;overflow-y:auto;-webkit-overflow-scrolling:touch}' +
      '.rdr-panel{position:relative;max-width:860px;width:100%;min-height:86vh;margin:auto;border-radius:14px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.5)}' +
      '.rdr-mbar{position:sticky;top:0;z-index:2;display:flex;gap:8px;align-items:center;padding:10px 14px;background:inherit;border-bottom:1px solid rgba(128,128,128,0.25)}' +
      '.rdr-mbar .sp{margin-inline-end:auto}' + bodyCss(base);
    if (st) { st.textContent = css; return; }
    st = document.createElement('style'); st.id = id; st.textContent = css; document.head.appendChild(st);
  }
  function openReaderModal(cfg) {
    var col = resolveColors(cfg), base = baseFontRem(cfg.style);
    ensureModalStyle(base);
    var L = cfg.labels || {};
    var ov = document.createElement('div'); ov.className = 'rdr-ov';
    var cover = (cfg.coverUrl) ? '<div class="rdr-cover"><img src="' + esc(cfg.coverUrl) + '" alt=""></div>' : '';
    var meta = cfg.meta ? '<div class="rdr-meta" style="font-size:0.9rem;opacity:0.6;margin-bottom:10px">' + esc(cfg.meta) + '</div>' : '';
    var fc = cfg.fontControls !== false;
    var aStyle = 'width:36px;justify-content:center;padding:6px 0';
    var bStyle = 'display:inline-flex;align-items:center;gap:6px;padding:7px 12px;border:1px solid currentColor;border-radius:8px;background:transparent;color:inherit;cursor:pointer;font:600 0.85rem system-ui,sans-serif;opacity:0.82;line-height:1';
    ov.innerHTML = '<div class="rdr-panel" style="background:' + col.bg + ';color:' + col.fg + ';--rdr-acc:' + col.accent + '">' +
      '<div class="rdr-mbar" style="background:' + col.bg + '">' +
        '<span class="sp"></span>' +
        (fc ? '<button data-fs="-" style="' + bStyle + ';' + aStyle + ';font-size:0.8rem" title="A−">A</button><button data-fs="+" style="' + bStyle + ';' + aStyle + ';font-size:1.1rem" title="A+">A</button>' : '') +
        '<button data-win style="' + bStyle + '">↗ ' + esc(L.window || L.pdfprint || '') + '</button>' +
        '<button data-close style="' + bStyle + '" aria-label="✕">✕</button>' +
      '</div>' +
      '<div class="rdr-sheet" style="max-width:720px;margin:0 auto;padding:26px clamp(20px,5vw,56px) 60px">' +
        cover + meta + (cfg.title ? '<h1 style="font-size:clamp(1.5rem,3vw,2.1rem);line-height:1.25;margin:0 0 16px">' + esc(cfg.title) + '</h1>' : '') +
        '<div class="rdr-body">' + (cfg.bodyHtml || '') + '</div>' +
      '</div></div>';
    var panel = ov.querySelector('.rdr-panel');
    var applyFs = function () { panel.style.setProperty('--fs', getFs()); };
    applyFs();
    var close = function () { ov.remove(); document.removeEventListener('keydown', onKey); if (global._rdrModalClose === close) global._rdrModalClose = null; if (typeof cfg.onClose === 'function') cfg.onClose(); }; // генерычны хук закрыцця (напр. прыбраць дып-лінк-хэш)
    global._rdrModalClose = close; // знешні закрывальнік адкрытай мадалкі (напр. «Запісацца» з маршруту: мадалка слотаў ніжэй па z — чытач мусіць сысці з дарогі)
    function onKey(e) { if (e.key === 'Escape') close(); }
    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
    ov.querySelector('[data-close]').addEventListener('click', close);
    var winBtn = ov.querySelector('[data-win]'); if (winBtn) winBtn.addEventListener('click', function () { openReaderWindow(cfg); });
    ov.querySelectorAll('[data-fs]').forEach(function (btn) {
      btn.addEventListener('click', function () { setFs(clampFs(getFs() + (btn.getAttribute('data-fs') === '+' ? FS_STEP : -FS_STEP))); applyFs(); });
    });
    document.addEventListener('keydown', onKey);
    document.body.appendChild(ov);
  }

  global.openReaderModal = openReaderModal;
  global.openReaderWindow = openReaderWindow;
  global.replaceWithReaderDoc = replaceWithReaderDoc;
  global.renderReaderDoc = renderReaderDoc;
  global.mountReaderDoc = mountReaderDoc; // для каллераў з сінхронным window.open да fetch (фактура)
  // хелпер колеру для каллераў style:'site' (люмінанс фону → чытальны тэкст) — каб не дублявалі
  global.readerReadableOn = function (bg, dark, light) {
    var m = String(bg || '').match(/\d+(\.\d+)?/g); if (!m || m.length < 3) return dark || '#1a1a1a';
    var lum = (0.299 * +m[0] + 0.587 * +m[1] + 0.114 * +m[2]) / 255;
    return lum > 0.55 ? (dark || '#1a1a1a') : (light || '#f2f2f2');
  };
})(window);
