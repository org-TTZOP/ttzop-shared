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
  // ── дзеянні дыялогаў (мадалка «Падзяліцца» і інш.): эмодзі ⬇/📋/💬 давалі контур на Тэсле ──
  download:'<path d="M8 2.6v7.2M5.4 7.2 8 9.8l2.6-2.6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 11.4v1.1q0 .9.9.9h8.2q.9 0 .9-.9v-1.1" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>',
  copy:'<rect x="5.8" y="5.8" width="7.2" height="7.4" rx="1.4" stroke="currentColor" stroke-width="1.4"/><path d="M3.2 10V4.2q0-1 1-1H9.4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>',
  chat:'<path d="M13.2 8.6q0 2.8-5.2 2.8l-3.4 1.8.9-2.3Q2.8 10 2.8 8.6 2.8 5 8 5t5.2 3.6Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>',
  // ── фарматы файлаў (пліткі «Падзяліцца») — адзін каркас дакумента + літарная пазнака ──
  filePdf:'<path d="M4.2 2.6h4L11.6 6v7.4H4.2Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M8 2.8V6h3.2" stroke="currentColor" stroke-width="1.3"/><path d="M5.9 8.6v3.2M5.9 8.6h1.1a.85.85 0 0 1 0 1.7H5.9M8.9 11.8V8.6h.7a1.6 1.6 0 0 1 0 3.2Z" stroke="currentColor" stroke-width="1.15" stroke-linecap="round" stroke-linejoin="round"/>',
  fileXls:'<path d="M4.2 2.6h4L11.6 6v7.4H4.2Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M8 2.8V6h3.2" stroke="currentColor" stroke-width="1.3"/><path d="M5.9 8.8l3 3M8.9 8.8l-3 3" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/>',
  fileCsv:'<path d="M4.2 2.6h4L11.6 6v7.4H4.2Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M8 2.8V6h3.2" stroke="currentColor" stroke-width="1.3"/><path d="M6.2 9.4v1.9M8 9.4v1.9M9.8 9.4v1.9" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/>',
  link:'<path d="M6.5 9.5 9.5 6.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M7.4 4.9 8.6 3.7a2.4 2.4 0 0 1 3.4 3.4l-1.2 1.2M8.6 11.1 7.4 12.3a2.4 2.4 0 0 1-3.4-3.4l1.2-1.2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>',
  // ── тыпы Секцый (для аўта-Даведкі ў ⓘ; эмодзі тут даюць той жа контур на Тэсле) ──
  secFlat:'<rect x="2.6" y="3" width="10.8" height="10" rx="1.4" stroke="currentColor" stroke-width="1.4"/><path d="M4.8 6h6.4M4.8 8.2h6.4M4.8 10.4h3.6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>',
  secTable:'<rect x="2.2" y="3.2" width="11.6" height="9.6" rx="1.3" stroke="currentColor" stroke-width="1.4"/><path d="M2.2 6.4h11.6M6.6 6.4v6.4M10.2 6.4v6.4" stroke="currentColor" stroke-width="1.2"/>',
  secMap:'<path d="M2.6 4.6 6 3.4l4 1.4 3.4-1.2v8l-3.4 1.2-4-1.4L2.6 12.6Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M6 3.4v8.4M10 4.8v8.4" stroke="currentColor" stroke-width="1.2"/>',
  secPalette:'<path d="M8 2.6a5.4 5.4 0 1 0 0 10.8c1.2 0 1.2-1 .6-1.6-.6-.6-.2-1.6.8-1.6h1.4a2.6 2.6 0 0 0 2.6-2.6C13.4 4.6 11 2.6 8 2.6Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><circle cx="5.6" cy="6.6" r="0.9" fill="currentColor"/><circle cx="8.4" cy="5.4" r="0.9" fill="currentColor"/>',
  // ── БАКАВОЕ МЕНЮ (навігацыя РМ): былі эмодзі ў разметцы → на Тэсле монахромны контур і схема іх не бачыла ──
  navMonitor:'<rect x="2.4" y="2.6" width="11.2" height="10.8" rx="1.5" stroke="currentColor" stroke-width="1.4"/><path d="M5.2 10.6V7.4M8 10.6V5.4M10.8 10.6V8.6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>',
  navTest:'<path d="M6.2 2.6h3.6M6.8 2.6v3.9L4.3 11.6q-.5 1.8 1.4 1.8h4.6q1.9 0 1.4-1.8L9.2 6.5V2.6" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M5.4 9.4h5.2" stroke="currentColor" stroke-width="1.25"/>',
  navGeneral:'<circle cx="8" cy="8" r="2.1" stroke="currentColor" stroke-width="1.4"/><path d="M8 1.9v1.6M8 12.5v1.6M1.9 8h1.6M12.5 8h1.6M3.7 3.7l1.15 1.15M11.15 11.15l1.15 1.15M12.3 3.7l-1.15 1.15M4.85 11.15 3.7 12.3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>',
  navPrivacy:'<path d="M8 2.2l4.4 1.6v4q0 3.4-4.4 6-4.4-2.6-4.4-6v-4Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M5.9 8.1 7.5 9.7l3-3.1" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>',
  navClients:'<circle cx="6.1" cy="6.2" r="2.2" stroke="currentColor" stroke-width="1.4"/><path d="M2.3 13.2q0-3 3.8-3t3.8 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M10.6 4.4a2 2 0 0 1 0 3.8M11.4 10.6q2.3.5 2.3 2.6" stroke="currentColor" stroke-width="1.35" stroke-linecap="round"/>',
  navOrders:'<path d="M3.6 2.6h6.2l2.6 2.6v8.2H3.6Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M6 6.4h4M6 8.8h4M6 11.2h2.4" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/>',
  navAppointments:'<rect x="2.4" y="3.6" width="11.2" height="9.8" rx="1.5" stroke="currentColor" stroke-width="1.4"/><path d="M2.4 6.6h11.2M5.4 2.4v2.4M10.6 2.4v2.4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M5.4 9.4h2M8.6 9.4h2M5.4 11.4h2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>',
  navDelivery:'<path d="M1.8 4.4h6.4v6.2H1.8Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M8.2 6.6h2.6l2.4 2.3v1.7H8.2Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><circle cx="5" cy="12" r="1.3" stroke="currentColor" stroke-width="1.3"/><circle cx="10.8" cy="12" r="1.3" stroke="currentColor" stroke-width="1.3"/>',
  navSitepage:'<rect x="2.4" y="2.6" width="11.2" height="10.8" rx="1.5" stroke="currentColor" stroke-width="1.4"/><path d="M2.4 6.2h11.2M6.6 6.2v7.2" stroke="currentColor" stroke-width="1.35"/>',
  navSections:'<path d="M8 2.4l5.4 2.6v6L8 13.6 2.6 11V5Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M2.6 5 8 7.6l5.4-2.6M8 7.6v6" stroke="currentColor" stroke-width="1.3"/>',
  navReports:'<path d="M2.6 13.4V2.6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M2.6 13.4h10.8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M4.6 10.6l2.6-3 2.2 1.8 3-4" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round"/>',
  navLanguages:'<circle cx="8" cy="8" r="5.4" stroke="currentColor" stroke-width="1.4"/><path d="M2.6 8h10.8" stroke="currentColor" stroke-width="1.2"/><path d="M8 2.6c2.2 1.8 2.2 9 0 10.8M8 2.6c-2.2 1.8-2.2 9 0 10.8" stroke="currentColor" stroke-width="1.2"/>',
  navTheme:'<path d="M8 2.4a5.6 5.6 0 0 0 0 11.2q1.3 0 1.3-1.1t-.9-1.2q-.9-.1-.9-1t1.1-.9h1.9a3.1 3.1 0 0 0 3.1-3.1Q13.6 2.4 8 2.4Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><circle cx="5.6" cy="6.4" r="0.95" fill="currentColor"/><circle cx="8.6" cy="5.2" r="0.95" fill="currentColor"/>',
  navPanelview:'<rect x="1.9" y="3" width="12.2" height="8.2" rx="1.5" stroke="currentColor" stroke-width="1.4"/><path d="M6 13.4h4M8 11.2v2.2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M4.4 5.4h3.4" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/>',
  navUsers:'<circle cx="8" cy="5.6" r="2.6" stroke="currentColor" stroke-width="1.4"/><path d="M3.4 13.4q0-3.6 4.6-3.6t4.6 3.6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>',
  navChats:'<path d="M13.4 7.9q0 3.3-5.4 3.3l-3.6 2 1-2.5Q2.6 9.6 2.6 7.9 2.6 4 8 4t5.4 3.9Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M5.8 7.8h4.4" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/>',
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
