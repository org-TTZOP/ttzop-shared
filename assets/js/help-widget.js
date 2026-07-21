// ═══ 📖 УНІВЕРСАЛЬНЫ РЭНДЭР ПАДКАЗКІ — АДЗІН кампанент на ЎСЕ куткі ═══
// Спажыўцы: панэль (admin/index.html: секцыя ў ⓘ-драўэры), сайт (main.js: мадалкі броні/кошыка/заказу/
// падпіскі) і кабінет (portal.html: секцыі запісаў/падпісак). Самадастатковы, як reader.js/cdate.js:
// каллер трымае СВОЙ каталог тэм і рэзалв, а рэндэр згортвальнага блока жыве тут — адзін на праект.
//
// TTZOP_HELP.block({
//   label,        // слова «Даведка» (загаловак-прэфікс)
//   title,        // назва тэмы
//   body,         // масіў абзацаў
//   open,         // ці разгорнута па змаўчанні (дэфолт — згорнута)
//   onToggle,     // JS-радок у ontoggle (напр. запомніць стан: «_helpOpen=this.open»)
//   accent,       // CSS-выраз колеру акцэнту кутка (напр. 'var(--accent)' / 'var(--color-primary)')
//   border,       // CSS-выраз колеру рамкі
//   esc           // эскейпер каллера (escHtml / _dsEsc / escChat); дэфолт — убудаваны
// }) → HTML-радок <details>. Стылі (структурныя, без колераў) інжектуюцца раз праз ensureStyle.
(function (global) {
  var STYLE_ID = 'twh-style';
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var st = document.createElement('style'); st.id = STYLE_ID;
    // колеры — праз пер-блокавыя зменныя --twh-* (каллер задае inline), таму адзін стыль на ўсе тэмы кутка
    st.textContent =
      '.twh{border:1px solid var(--twh-border,#2a2f45);border-radius:10px;margin:0 0 12px;background:color-mix(in srgb, var(--twh-accent,#f97316) 6%, transparent)}' +
      '.twh>summary{cursor:pointer;list-style:none;display:flex;align-items:center;gap:6px;padding:9px 11px;font-size:0.83rem;font-weight:700;color:var(--twh-accent,#f97316)}' +
      '.twh>summary::-webkit-details-marker{display:none}' +
      '.twh-arr{display:inline-block;transition:transform .15s;opacity:.7}' +
      '.twh[open]>summary .twh-arr{transform:rotate(90deg)}' +
      '.twh-body{padding:0 11px 11px;font-size:0.83rem;line-height:1.55;opacity:.9}' +
      '.twh-body p{margin:0 0 6px}.twh-body p:last-child{margin-bottom:0}';
    document.head.appendChild(st);
  }
  function block(cfg) {
    cfg = cfg || {}; ensureStyle();
    var e = cfg.esc || esc;
    var body = (cfg.body || []).map(function (p) { return '<p>' + e(p) + '</p>'; }).join('');
    var vars = '--twh-accent:' + (cfg.accent || '#f97316') + ';--twh-border:' + (cfg.border || '#2a2f45');
    var head = (cfg.label ? e(cfg.label) + ' · ' : '') + e(cfg.title || '');
    return '<details class="twh" style="' + vars + '"' + (cfg.open ? ' open' : '') +
      (cfg.onToggle ? ' ontoggle="' + cfg.onToggle + '"' : '') + '>' +
      '<summary><span class="twh-arr">▸</span>❓ ' + head + '</summary>' +
      '<div class="twh-body">' + body + '</div></details>';
  }
  global.TTZOP_HELP = { block: block, ensureStyle: ensureStyle };
})(typeof window !== 'undefined' ? window : this);
