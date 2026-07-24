// ── АДЗІНЫ SVG-НАБОР ІКОНАК ⋯-МЕНЮ — агульны кампанент (панэль + сайт/Чарнавік), як reader.js/cdate.js ──
// Крыніца праўды для ўсіх ⋯-меню. Усе іконкі на currentColor (монахром) → колер задае кнопка
// (нейтральны / акцэнт для стану / чырвоны для danger). Эмодзі НЕ ўжываем: іх колер даваў шрыфт браўзера
// (на Тэсле — Chromium без каляровага emoji-шрыфту — выпадаў у контур; SVG рэндэрыцца аднолькава ўсюды).
window.TTZOP_MENU_ICONS = {
  addFolder:'<path d="M2 5.6V4Q2 3 3 3H5.9L7 4.6H13Q14 4.6 14 5.6V12Q14 13 13 13H3Q2 13 2 12Z" stroke="currentColor" stroke-width="1.4"/><path d="M8 7.6v3.2M6.4 9.2h3.2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>',
  addForm:'<rect x="2.4" y="4" width="11.2" height="8" rx="1.4" stroke="currentColor" stroke-width="1.4"/><path d="M8 6.4v3.2M6.4 8h3.2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>',
  addFile:'<path d="M4.2 2.6h4L11.6 6v7.4H4.2Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M8 2.8V6h3.2" stroke="currentColor" stroke-width="1.3"/><path d="M7.8 9v2.6M6.5 10.3h2.6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>',
  addNote:'<rect x="3.6" y="2.5" width="8.8" height="11" rx="1.3" stroke="currentColor" stroke-width="1.4"/><path d="M5.8 5.6h4.4M5.8 8h4.4M5.8 10.4h2.4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><path d="M11.2 2.2v2M10.2 3.2h2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>',
  eye:'<path d="M1.8 8S4 4.2 8 4.2 14.2 8 14.2 8 12 11.8 8 11.8 1.8 8 1.8 8Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><circle cx="8" cy="8" r="1.9" stroke="currentColor" stroke-width="1.4"/>',
  dup:'<rect x="5.6" y="5.6" width="7.2" height="7.2" rx="1.4" stroke="currentColor" stroke-width="1.4"/><path d="M3.4 9.8V4.4Q3.4 3.4 4.4 3.4H9.6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>',
  design:'<circle cx="8" cy="8" r="2.3" stroke="currentColor" stroke-width="1.5"/><path d="M8 2.4v1.9M8 11.7v1.9M2.4 8h1.9M11.7 8h1.9M4.1 4.1l1.35 1.35M10.55 10.55l1.35 1.35M11.9 4.1l-1.35 1.35M5.45 10.55l-1.35 1.35" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/>',
  sort:'<path d="M5 3.4v9.2M5 12.6l-1.7-1.7M5 12.6l1.7-1.7M11 12.6V3.4M11 3.4L9.3 5.1M11 3.4l1.7 1.7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>',
  arrange:'<path d="M6.2 2.6h3.6M8 2.6v3.4M5.2 6h5.6l-.5 2.2H5.7zM8 8.2v3.4M8 13.4l-1.1-1.4h2.2z" stroke="currentColor" stroke-width="1.35" stroke-linejoin="round"/>',
  restore:'<path d="M4 7.2h6a3 3 0 0 1 0 6H6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 4.7 3.4 7.2 6 9.7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>',
  reset:'<path d="M12.4 8a4.4 4.4 0 1 1-1.3-3.1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M12.5 3.3v2.3h-2.3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>',
  rename:'<path d="M10.4 3.2l2.4 2.4L6 12.4l-3 .7.7-3z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M9.3 4.3l2.4 2.4" stroke="currentColor" stroke-width="1.4"/>',
  desc:'<rect x="3.8" y="2.6" width="8.4" height="10.8" rx="1.3" stroke="currentColor" stroke-width="1.4"/><path d="M5.9 5.9h4.2M5.9 8.2h4.2M5.9 10.5h2.6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>',
  translate:'<circle cx="8" cy="8" r="5.3" stroke="currentColor" stroke-width="1.4"/><path d="M2.7 8h10.6M8 2.7v10.6" stroke="currentColor" stroke-width="1.1"/><path d="M8 2.7c2.2 1.7 2.2 8.9 0 10.6M8 2.7c-2.2 1.7-2.2 8.9 0 10.6" stroke="currentColor" stroke-width="1.1"/>',
  photo:'<rect x="2.4" y="3.6" width="11.2" height="8.8" rx="1.5" stroke="currentColor" stroke-width="1.4"/><circle cx="5.7" cy="6.4" r="1.05" fill="currentColor"/><path d="M3.2 11l3.1-3 2.2 2 2.1-1.9 2.6 2.5" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>',
  move:'<path d="M2 5.6V4Q2 3 3 3H5.9L7 4.6H10Q11 4.6 11 5.6V7.4" stroke="currentColor" stroke-width="1.4"/><path d="M6 11.2h6.4M9.7 8.6l2.7 2.6-2.7 2.6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>',
  del:'<path d="M3.5 4.6h9M6 4.6V3.3Q6 2.6 6.7 2.6h2.6Q10 2.6 10 3.3V4.6M4.8 4.6l.55 8.1Q5.4 13.4 6.4 13.4h3.2Q10.6 13.4 10.65 12.7L11.2 4.6" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M6.8 6.8v4.4M9.2 6.8v4.4" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/>',
  lock:'<rect x="3.6" y="7" width="8.8" height="6.2" rx="1.5" stroke="currentColor" stroke-width="1.5"/><path d="M5.5 7V5.3a2.5 2.5 0 0 1 5 0V7" stroke="currentColor" stroke-width="1.5"/>',
  share:'<rect x="3.1" y="6.6" width="9.8" height="6.9" rx="1.5" stroke="currentColor" stroke-width="1.4"/><path d="M8 9.6V2.6M5.6 5 8 2.6 10.4 5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>',
};
// рэндэр іконкі: opts.cls (клас), opts.color (яўны колер), opts.size (px, дэфолт 16)
window.TTZOP_mIco = function (id, opts) {
  const p = window.TTZOP_MENU_ICONS[id];
  if (!p) return '';
  opts = opts || {};
  const cls = opts.cls ? ` class="${opts.cls}"` : '';
  const col = opts.color ? ';color:' + opts.color : '';
  const sz = opts.size || 16;
  return `<svg${cls} viewBox="0 0 16 16" width="${sz}" height="${sz}" fill="none" style="display:block;pointer-events:none;margin:0 auto${col}">${p}</svg>`;
};
