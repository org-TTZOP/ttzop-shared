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
  // JSON — той жа аркуш, што ў PDF/Excel/CSV, але з фігурнымі дужкамі: CSV-іконка ў ролі JSON
  // блытала («два аднолькавыя аркушы»), а фармат стаў стандартнай пліткай «Падзяліцца»
  fileJson:'<path d="M4.2 2.6h4L11.6 6v7.4H4.2Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M8 2.8V6h3.2" stroke="currentColor" stroke-width="1.3"/><path d="M7.1 9.1c-.7 0-.7.6-.7 1.1s0 1.1-.7 1.1M8.9 9.1c.7 0 .7.6.7 1.1s0 1.1.7 1.1" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" fill="none"/>',
  // 📋 устаўка з буфера — аркуш на планшэце; парная да `copy`, якая ўжо ёсць у наборы
  paste:'<rect x="4" y="3.4" width="8" height="10.2" rx="1.4" stroke="currentColor" stroke-width="1.4"/><path d="M6.3 3.4V2.6h3.4v0.8" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M6.4 8h3.2M6.4 10.4h3.2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>',
  // ⛶ вялікае акно ↔ назад: рамка + чатыры стрэлкі. Пара робіцца ЛЮСТЭРКАМ адной геаметрыі —
  // разгарнуць = ад цэнтра ў вуглы, згарнуць = з вуглоў у цэнтр (глядач бачыць той самы аб'єкт у
  // двух станах). Быў сімвал «⛶» тэкстам: у частцы шрыфтоў ён бляклы і чытаецца як брак гліфа.
  expand:'<rect x="1.9" y="1.9" width="12.2" height="12.2" rx="1.7" stroke="currentColor" stroke-width="1.15" opacity=".5"/><path d="M7.2 7.2 4.5 4.5M4.5 4.5h2.1M4.5 4.5v2.1M8.8 7.2l2.7-2.7M11.5 4.5H9.4M11.5 4.5v2.1M7.2 8.8 4.5 11.5M4.5 11.5h2.1M4.5 11.5V9.4M8.8 8.8l2.7 2.7M11.5 11.5H9.4M11.5 11.5V9.4" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/>',
  // ⚠️ у «згарнуць» галоўкі стрэлак глядзяць у цэнтр і на 17px злипаліся ў пляму — трымаем зазор
  collapse:'<rect x="1.9" y="1.9" width="12.2" height="12.2" rx="1.7" stroke="currentColor" stroke-width="1.15" opacity=".5"/><path d="M4.4 4.4 6.9 6.9M6.9 6.9H5M6.9 6.9V5M11.6 4.4 9.1 6.9M9.1 6.9h1.9M9.1 6.9V5M4.4 11.6 6.9 9.1M6.9 9.1H5M6.9 9.1v1.9M11.6 11.6 9.1 9.1M9.1 9.1h1.9M9.1 9.1v1.9" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/>',
  link:'<path d="M6.5 9.5 9.5 6.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M7.4 4.9 8.6 3.7a2.4 2.4 0 0 1 3.4 3.4l-1.2 1.2M8.6 11.1 7.4 12.3a2.4 2.4 0 0 1-3.4-3.4l1.2-1.2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>',
  // ── кантролі (пошук/стоп/геаметка): былі эмодзі 🔍⏹📍 у лэйблах кнопак ──
  search:'<circle cx="7.2" cy="7.2" r="4.2" stroke="currentColor" stroke-width="1.5"/><path d="M10.4 10.4l3 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
  stop:'<rect x="4" y="4" width="8" height="8" rx="1.4" stroke="currentColor" stroke-width="1.5"/>',
  pin:'<path d="M8 13.6s4.2-4.3 4.2-7a4.2 4.2 0 1 0-8.4 0c0 2.7 4.2 7 4.2 7Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><circle cx="8" cy="6.5" r="1.5" stroke="currentColor" stroke-width="1.3"/>',
  // ⚠️ Іконак выкату тут НЯМА знарок: дзеянне «Абнавіць да актуальнага» жыве КНОПКАЙ У РАДКУ табліцы
  // «Дэплой» (там відаць, які менавіта сайт і з якой версіі абнаўляецца). Дзве аднакавыя ракеты ў ⋯
  // («на адзін сайт» і «на ўсіх») не адрознівалі дзеянні — заўвага карыстальніка 26.07; ⋯-шлях зняты
  // цалкам, каб не было двух шляхоў да аднаго дзеяння.
  // ── тыпы Секцый (для аўта-Даведкі ў ⓘ; эмодзі тут даюць той жа контур на Тэсле) ──
  secFlat:'<rect x="2.6" y="3" width="10.8" height="10" rx="1.4" stroke="currentColor" stroke-width="1.4"/><path d="M4.8 6h6.4M4.8 8.2h6.4M4.8 10.4h3.6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>',
  secTable:'<rect x="2.2" y="3.2" width="11.6" height="9.6" rx="1.3" stroke="currentColor" stroke-width="1.4"/><path d="M2.2 6.4h11.6M6.6 6.4v6.4M10.2 6.4v6.4" stroke="currentColor" stroke-width="1.2"/>',
  secMap:'<path d="M2.6 4.6 6 3.4l4 1.4 3.4-1.2v8l-3.4 1.2-4-1.4L2.6 12.6Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M6 3.4v8.4M10 4.8v8.4" stroke="currentColor" stroke-width="1.2"/>',
  secPalette:'<path d="M8 2.6a5.4 5.4 0 1 0 0 10.8c1.2 0 1.2-1 .6-1.6-.6-.6-.2-1.6.8-1.6h1.4a2.6 2.6 0 0 0 2.6-2.6C13.4 4.6 11 2.6 8 2.6Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><circle cx="5.6" cy="6.6" r="0.9" fill="currentColor"/><circle cx="8.4" cy="5.4" r="0.9" fill="currentColor"/>',
  // ── БАКАВОЕ МЕНЮ (навігацыя РМ): былі эмодзі ў разметцы → на Тэсле монахромны контур і схема іх не бачыла ──
  // 💰 Фінансы: банкнота з манетай. ⚠️ Іконкі не было зусім — пункт трымаўся на запасным праходзе
  // па эмодзі, які 04.08 знесены як другая крыніца. Каталог мусіць пакрываць УСЕ пункты меню.
  navFinance:'<rect x="1.9" y="4.2" width="12.2" height="7.6" rx="1.4" stroke="currentColor" stroke-width="1.4"/><circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="1.35"/><path d="M4.3 6.2v3.6M11.7 6.2v3.6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>',
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
  // 🎲 Релакс — кубік: адзін контур + тры кропкі (на 16px больш не чытаецца)
  navRelax:'<rect x="2.8" y="2.8" width="10.4" height="10.4" rx="2.2" stroke="currentColor" stroke-width="1.4"/><circle cx="5.9" cy="5.9" r="1.05" fill="currentColor"/><circle cx="8" cy="8" r="1.05" fill="currentColor"/><circle cx="10.1" cy="10.1" r="1.05" fill="currentColor"/>',
  navPanelview:'<rect x="1.9" y="3" width="12.2" height="8.2" rx="1.5" stroke="currentColor" stroke-width="1.4"/><path d="M6 13.4h4M8 11.2v2.2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M4.4 5.4h3.4" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/>',
  // 🔄 Абнаўленне — ПРОСТАЯ круглая стрэлка (рашэнне карыстальніка 27.07: двухстрэлкавы sync
  // выглядаў цяжка). Геаметрыя тая ж, што ў `reset` — свядома: карыстальнік хоча роўна тую кнопку,
  // якую бачыць у ⋯-меню. `reset` пры гэтым НЕ чапаем — у яго свой запіс і свой сэнс (скід да
  // дэфолту), проста малюнак блізкі. Асобны id патрэбны, каб схема іконак кіравала імі паасобку.
  refresh:'<path d="M12.4 8a4.4 4.4 0 1 1-1.3-3.1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M12.5 3.3v2.3h-2.3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>',
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

// ═══ 🔤 ЭМОДЗІ → ІКОНКА: замена ў НАДПІСАХ хрому (03.08) ═══
// ⚠️ Заўвага з Tesla: «амаль усе іконкі на загалоўках Папак і Форм чорна-белыя». Гэты набор ужо
// вырашыў тое ж для ⋯-меню і дыялогаў (гл. шапку файла), але надпісы раздзелаў, секцый і кнопак
// ідуць з `ui-i18n.js`, дзе іконка — гэта ЭМОДЗІ ў тэксце (замер 03.08: 76 унікальных, 1861
// ужыванне). Іх нельга замяніць па месцах: яны жывуць у 13 моўных блоках і дадаюцца новымі радкамі.
// 🔑 Таму замена — АДНЫМ праходам па гатовым надпісе (`ttIcoText`), а каталог `EMOJI` кажа, які
// эмодзі якой іконцы адпавядае. Новая пара = адзін радок; невядомае эмодзі застаецца як было
// (няпоўны каталог — не паломка, а проста «яшчэ не дайшлі рукі»).
// ⛔ НЕ ЎЖЫВАЦЬ на дадзеных кліента: калі чалавек напісаў 🎉 у назве сваёй папкі — гэта ЯГО тэкст,
// а не наша іконка. Замена робіцца толькі там, дзе HTML будуем мы самі.
// ⚠️ Вынік — HTML, значыць у атрыбут (`title="…"`) яго класці нельга: там эмодзі бяскрыўдны.
window.TTZOP_ICON_EMOJI = {
  '➕': 'addForm', '✕': 'close', '✎': 'rename', '✏': 'rename', '🗑': 'del', '🔍': 'search',
  '⚙': 'design', '📋': 'copy', '📄': 'filePdf', '📝': 'desc', '📅': 'calendar', '⏰': 'clock',
  '⏳': 'hourglass', '⏸': 'pause', '▶': 'play', '✅': 'ok', '✓': 'ok', '✔': 'ok', '❌': 'no',
  '⛔': 'no', '🚫': 'no', '⚠': 'warn', '👥': 'users', '💬': 'chat', '🛒': 'cart', '🚀': 'rocket',
  '📦': 'box', '📎': 'clip', '📊': 'chart', '🔁': 'repeat', '🔄': 'reset', '↻': 'reset',
  '↺': 'restore', '🖨': 'print', '🌐': 'translate', '👁': 'eye', '📷': 'photo', '✂': 'cut',
  '✉': 'mail', '🔒': 'lock', '📤': 'share', '⬇': 'download', '📁': 'move', '🖊': 'rename',
  '💰': 'money', '🧪': 'flask', '📜': 'scroll', '🗒': 'note', '🚚': 'truck', '🧱': 'blocks',
  '📈': 'trend', '🎨': 'palette', '🖥': 'screen', '🎲': 'dice', '👤': 'user', '🧭': 'compass',
  'ⓘ': 'info', '🎯': 'target', '🔧': 'wrench', '👑': 'crown', '📞': 'phone',
  // ── чыпы-метрыкі на загалоўках Папак/Форм (04.08): фаза 1 іх не ўзяла, бо яны будуюцца не з
  // `ui-i18n.js`, а рукамі ў хуках `_formNameHtml`/`_folderNameHtml`. Цяпер ідуць праз `TTZOP_chip` ──
  '💳': 'card', '💾': 'save', '💽': 'disk', '🌍': 'world', '⭐': 'star', '✍': 'pen',
  '👻': 'ghost', '🚨': 'alarm', '📧': 'mail', '✗': 'close', // ✗ offline — просты крыж, а не «забаронена» (🚫)
  '🚧': 'works', // 🚧 «не закончана» — свая іконка, не ⚠: гэта не памылка, а недаробленае месца
  '🆕': 'fresh', '👀': 'eye', // статусы заказу: астатнія сем ужо былі ў каталогу, гэтыя два падалі ў эмодзі
};
// іконкі, якіх у наборы ⋯-меню не было (ён закрываў толькі меню і дыялогі)
Object.assign(window.TTZOP_MENU_ICONS, {
  works:'<path d="M2.4 5.2h11.2v5.6H2.4Z" stroke="currentColor" stroke-width="1.35" stroke-linejoin="round"/><path d="M4.2 10.8 7 5.2M8 10.8 10.8 5.2" stroke="currentColor" stroke-width="1.2"/><path d="M3.2 10.8v2.6M12.8 10.8v2.6" stroke="currentColor" stroke-width="1.35" stroke-linecap="round"/>',
  close:'<path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
  search:'<circle cx="7" cy="7" r="4.2" stroke="currentColor" stroke-width="1.4"/><path d="M10.1 10.1 13.4 13.4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
  calendar:'<rect x="2.5" y="3.6" width="11" height="9.9" rx="1.3" stroke="currentColor" stroke-width="1.4"/><path d="M2.5 6.6h11M5.6 2.4v2.4M10.4 2.4v2.4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>',
  clock:'<circle cx="8" cy="8.4" r="5.2" stroke="currentColor" stroke-width="1.4"/><path d="M8 5.6v2.9l2 1.3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>',
  hourglass:'<path d="M4.6 2.4h6.8M4.6 13.6h6.8M5.6 2.4c0 3 4.8 3.4 4.8 5.6s-4.8 2.6-4.8 5.6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M10.4 2.4c0 3-4.8 3.4-4.8 5.6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>',
  pause:'<path d="M6 3.4v9.2M10 3.4v9.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
  play:'<path d="M5.4 3.2 12 8l-6.6 4.8Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>',
  ok:'<path d="M3.4 8.4 6.4 11.4 12.6 4.8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
  no:'<circle cx="8" cy="8" r="5.6" stroke="currentColor" stroke-width="1.4"/><path d="M4.6 11.4 11.4 4.6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>',
  warn:'<path d="M8 2.6 14 13H2Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M8 6.4v3.1M8 11.2v.3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>',
  users:'<circle cx="6.2" cy="6" r="2.4" stroke="currentColor" stroke-width="1.35"/><path d="M2.2 13c0-2.2 1.8-3.7 4-3.7s4 1.5 4 3.7" stroke="currentColor" stroke-width="1.35" stroke-linecap="round"/><path d="M11 4.3a2.3 2.3 0 0 1 0 3.9M11.6 9.7c1.5.5 2.4 1.7 2.4 3.3" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/>',
  cart:'<path d="M1.8 2.8h1.9l2 8h7l1.5-5.9H4.2" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6.6" cy="13" r="1" stroke="currentColor" stroke-width="1.2"/><circle cx="11.4" cy="13" r="1" stroke="currentColor" stroke-width="1.2"/>',
  rocket:'<path d="M6.6 9.4S6.1 5.6 9.4 2.7c2.4 0 3.9 1.5 3.9 3.9-2.9 3.3-6.7 2.8-6.7 2.8Z" stroke="currentColor" stroke-width="1.35" stroke-linejoin="round"/><path d="m6.6 9.4-2.4 2.4M4.7 6.9 2.8 8.2l1.4 1.4M9.1 11.3l1.4 1.4 1.3-1.9" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>',
  box:'<path d="M2.6 5.4 8 2.6l5.4 2.8v5.9L8 14.1 2.6 11.3Z" stroke="currentColor" stroke-width="1.35" stroke-linejoin="round"/><path d="M2.6 5.4 8 8.2l5.4-2.8M8 8.2v5.9" stroke="currentColor" stroke-width="1.25" stroke-linejoin="round"/>',
  clip:'<path d="M11.2 6.3 6.9 10.6a1.55 1.55 0 0 0 2.2 2.2l4.4-4.4a3.1 3.1 0 0 0-4.4-4.4L4.4 8.7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>',
  chart:'<path d="M2.6 13.4h10.8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M4.6 13.4V9.6M8 13.4V4.6M11.4 13.4V7.4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
  repeat:'<path d="M3.2 6.4A3.4 3.4 0 0 1 6.6 3h5.2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M9.9 1.5 12.4 3 9.9 4.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M12.8 9.6A3.4 3.4 0 0 1 9.4 13H4.2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M6.1 11.5 3.6 13l2.5 1.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>',
  print:'<path d="M4.6 6.2V2.7h6.8v3.5" stroke="currentColor" stroke-width="1.35" stroke-linejoin="round"/><rect x="2.6" y="6.2" width="10.8" height="4.9" rx="1.2" stroke="currentColor" stroke-width="1.35"/><path d="M4.8 9.6h6.4v3.7H4.8Z" stroke="currentColor" stroke-width="1.35" stroke-linejoin="round"/>',
  cut:'<circle cx="4.6" cy="11.9" r="1.6" stroke="currentColor" stroke-width="1.3"/><circle cx="11.4" cy="11.9" r="1.6" stroke="currentColor" stroke-width="1.3"/><path d="M5.7 10.8 12 2.6M10.3 10.8 4 2.6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>',
  money:'<circle cx="8" cy="8" r="5.6" stroke="currentColor" stroke-width="1.4"/><path d="M8 4.8v6.4M9.9 6.2A2 2 0 0 0 8 5.6h-.4a1.5 1.5 0 0 0 0 3h.8a1.5 1.5 0 0 1 0 3H8a2 2 0 0 1-1.9-.6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>',
  flask:'<path d="M6.4 2.4h3.2M7 2.4v3.9L3.6 12a1.2 1.2 0 0 0 1 1.9h6.8a1.2 1.2 0 0 0 1-1.9L9 6.3V2.4" stroke="currentColor" stroke-width="1.35" stroke-linejoin="round"/><path d="M5.4 9.6h5.2" stroke="currentColor" stroke-width="1.25"/>',
  scroll:'<path d="M4.2 2.8h6.2a1.4 1.4 0 0 1 1.4 1.4v8a1.6 1.6 0 0 1-1.6 1.6H5.4A1.6 1.6 0 0 1 3.8 12.2V4.2" stroke="currentColor" stroke-width="1.35" stroke-linejoin="round"/><path d="M5.9 5.9h4.2M5.9 8.2h4.2M5.9 10.5h2.6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>',
  note:'<rect x="3.4" y="2.6" width="9.2" height="10.8" rx="1.3" stroke="currentColor" stroke-width="1.4"/><path d="M5.8 5.6h4.4M5.8 8h4.4M5.8 10.4h2.4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>',
  truck:'<path d="M1.8 4.4h7v6.2h-7Z" stroke="currentColor" stroke-width="1.35" stroke-linejoin="round"/><path d="M8.8 6.8h2.6l2.4 2.2v1.6h-5Z" stroke="currentColor" stroke-width="1.35" stroke-linejoin="round"/><circle cx="4.6" cy="11.8" r="1.2" stroke="currentColor" stroke-width="1.25"/><circle cx="11.2" cy="11.8" r="1.2" stroke="currentColor" stroke-width="1.25"/>',
  blocks:'<rect x="2.4" y="2.6" width="5" height="4.4" rx="0.8" stroke="currentColor" stroke-width="1.35"/><rect x="8.6" y="2.6" width="5" height="4.4" rx="0.8" stroke="currentColor" stroke-width="1.35"/><rect x="5.5" y="8.6" width="5" height="4.4" rx="0.8" stroke="currentColor" stroke-width="1.35"/>',
  trend:'<path d="M2.4 11.6 6.2 7.8l2.4 2.4 4.8-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M10.6 5.2h2.8V8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>',
  palette:'<path d="M8 2.4a5.6 5.6 0 1 0 0 11.2c.9 0 1.3-.6 1.3-1.2 0-.9-.7-1.2-.7-1.9 0-.6.5-1.1 1.2-1.1h1.1A3.5 3.5 0 0 0 14 5.9C13.6 3.8 11 2.4 8 2.4Z" stroke="currentColor" stroke-width="1.35" stroke-linejoin="round"/><circle cx="5.6" cy="6.2" r="0.9" fill="currentColor"/><circle cx="9" cy="5.2" r="0.9" fill="currentColor"/>',
  screen:'<rect x="1.9" y="3" width="12.2" height="8" rx="1.3" stroke="currentColor" stroke-width="1.4"/><path d="M5.8 13.4h4.4M8 11v2.4" stroke="currentColor" stroke-width="1.35" stroke-linecap="round"/>',
  dice:'<rect x="2.6" y="2.6" width="10.8" height="10.8" rx="2" stroke="currentColor" stroke-width="1.4"/><circle cx="5.8" cy="5.8" r="0.95" fill="currentColor"/><circle cx="10.2" cy="10.2" r="0.95" fill="currentColor"/><circle cx="8" cy="8" r="0.95" fill="currentColor"/>',
  user:'<circle cx="8" cy="5.8" r="2.6" stroke="currentColor" stroke-width="1.4"/><path d="M2.8 13.4c0-2.6 2.3-4.2 5.2-4.2s5.2 1.6 5.2 4.2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>',
  compass:'<circle cx="8" cy="8" r="5.6" stroke="currentColor" stroke-width="1.4"/><path d="m10.6 5.4-1.5 3.7-3.7 1.5 1.5-3.7Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>',
  info:'<circle cx="8" cy="8" r="5.6" stroke="currentColor" stroke-width="1.4"/><path d="M8 7.2v4M8 4.7v.3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
  target:'<circle cx="8" cy="8" r="5.4" stroke="currentColor" stroke-width="1.35"/><circle cx="8" cy="8" r="2.8" stroke="currentColor" stroke-width="1.3"/><circle cx="8" cy="8" r="0.9" fill="currentColor"/>',
  wrench:'<path d="M10.4 2.6a3.4 3.4 0 0 0-2.9 5.1L3 12.2l1.6 1.6 4.5-4.4a3.4 3.4 0 0 0 4.2-4.5l-1.9 1.9-1.6-1.6Z" stroke="currentColor" stroke-width="1.35" stroke-linejoin="round"/>',
  crown:'<path d="M2.6 12.2h10.8M3.1 11 2.3 5.2l3.2 2.3L8 3.6l2.5 3.9 3.2-2.3-.8 5.8Z" stroke="currentColor" stroke-width="1.35" stroke-linejoin="round"/>',
  phone:'<path d="M3.1 2.6h2.4L7 6 5.5 7.2a7.8 7.8 0 0 0 3.3 3.3L10 9l3.4 1.5v2.4c0 .8-.7 1.4-1.5 1.4C6.5 13.9 2.1 9.5 1.7 4.1c0-.8.6-1.5 1.4-1.5Z" stroke="currentColor" stroke-width="1.35" stroke-linejoin="round"/>',
  mail:'<rect x="1.9" y="3.6" width="12.2" height="8.8" rx="1.2" stroke="currentColor" stroke-width="1.4"/><path d="m2.2 4.6 5.8 3.9 5.8-3.9" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>',
  // ── чыпы-метрыкі загалоўкаў (04.08). Малюнак тут БОЛЬШ схематычны, чым у меню: чып жыве на 0.72rem
  // (≈11px), і дробныя дэталі на такім памеры зліваюцца ў пляму — правяралася вокам на радку сайта ──
  card:'<rect x="1.8" y="3.6" width="12.4" height="8.8" rx="1.6" stroke="currentColor" stroke-width="1.4"/><path d="M1.8 6.6h12.4" stroke="currentColor" stroke-width="1.5"/><path d="M4.2 9.8h2.6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>',
  save:'<path d="M2.6 4.1q0-1.5 1.5-1.5h6.6L13.4 5.4v6.5q0 1.5-1.5 1.5H4.1q-1.5 0-1.5-1.5Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M5.2 2.6h5v3.2h-5Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M5 9.2h6v4.2H5Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>',
  disk:'<circle cx="8" cy="8" r="5.6" stroke="currentColor" stroke-width="1.4"/><circle cx="8" cy="8" r="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M8 2.4a5.6 5.6 0 0 1 4.9 2.9" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>',
  // 🌍 «увесь свет» ≠ 🌐 translate (той — меридыяны): тут контур мацерыкоў, каб два глобусы ў адным
  // радку (расход перакладаў × агульная квота пошты) не чыталіся як адна і тая ж лічба
  world:'<circle cx="8" cy="8" r="5.6" stroke="currentColor" stroke-width="1.4"/><path d="M4.1 5.2q1.3.9 2.4.3t1.9.5-.4 2.1-2 .5-1.5 1.4.9 2.2" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M11.9 5.4q-1.4.5-1.2 1.7t1.9 1.1" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
  star:'<path d="M8 2.2 9.8 6l4.1.5-3 2.8.8 4.1L8 11.5 4.3 13.4l.8-4.1-3-2.8L6.2 6Z" stroke="currentColor" stroke-width="1.35" stroke-linejoin="round"/>',
  pen:'<path d="M10.6 2.9 13.1 5.4 5.9 12.6l-3.3.7.7-3.3z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M9.4 4.1 11.9 6.6" stroke="currentColor" stroke-width="1.3"/>',
  ghost:'<path d="M3.4 13.4V7.2a4.6 4.6 0 0 1 9.2 0v6.2l-1.5-1.2-1.5 1.2-1.6-1.2-1.6 1.2-1.5-1.2Z" stroke="currentColor" stroke-width="1.35" stroke-linejoin="round"/><circle cx="6.4" cy="7" r="0.85" fill="currentColor"/><circle cx="9.6" cy="7" r="0.85" fill="currentColor"/>',
  alarm:'<path d="M4 10.6V7.4a4 4 0 1 1 8 0v3.2l1.2 1.5H2.8Z" stroke="currentColor" stroke-width="1.35" stroke-linejoin="round"/><path d="M6.6 12.1a1.5 1.5 0 0 0 2.8 0" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>',
  // 🆕 «новае» — іскра, а не надпіс NEW: літары на 11px не чытаюцца і не перакладаюцца на 13 моў
  fresh:'<path d="M8 1.9 9.5 6.5 14.1 8 9.5 9.5 8 14.1 6.5 9.5 1.9 8 6.5 6.5Z" stroke="currentColor" stroke-width="1.35" stroke-linejoin="round"/>',
});

// ═══ 🏷 ЧЫП ЗАГАЛОЎКА — АДЗІНЫ БУДАЎНІК метрык-пазнак (04.08) ═══
// ⚠️ Быў Ctrl-C/Ctrl-V: кожны чып пісаў рукамі `font-size:0.72rem;color:{тры тэрнарнікі};margin-left:6px;
// white-space:nowrap` — і стылі ўжо разышліся (0.72rem у радку сайта, 0.75rem у Аглядзе, `margin` то
// ёсць, то не), а эмодзі ў іх заставаўся эмодзі: фаза 1 бачыла толькі надпісы з `ui-i18n.js`.
// 🔑 ГАЛОЎНАЕ ТУТ — МЯЖА, і яна механічная, а не «не забыцца»: `ico` — НАША іконка (ідзе праз каталог),
// `text` — ЗАЎСЁДЫ даныя (заўсёды экрануецца). Прагнаць увесь загаловак праз `ttIcoText` нельга: у ім
// назва, якую пісаў кліент, і яго 🎉 у імені папкі — гэта ЯГО тэкст, а не наша іконка.
// 🎨 КОЛЕР ІКОНКІ ЧЫПА — ДВА РЭЖЫМЫ, і мяжа паміж імі не «густ», а НАЯЎНАСЦЬ СІГНАЛУ:
//   · тон нясе СТАН (warn/crit/ok ці яўны колер) → іконка бярэ колер тону. Чырвонае «квота
//     вычарпана» мусіць застацца чырвоным у любой схеме — стан пераважвае аздабленне;
//   · тон НЕЙТРАЛЬНЫ (mute/fg/пуста) → сігналу няма, і колер аддаецца СХЕМЕ іконак (`mi-<id>`).
// ⚠️ Спярша я аддаў колер тону заўсёды — і ў «Каляровай» схеме ўвесь радок Формы стаў шэры
// (заўвага карыстальніка 04.08). Шэры — гэта таксама сцвярджэнне («усё спакойна»), і рабіць яго
// адзіным магчымым выглядам значыла адабраць у схемы тое, чым яна кіруе.
window.TTZOP_CHIP_TONES = { mute:'var(--muted)', fg:'var(--fg)', accent:'var(--accent)', ok:'#22c55e', warn:'#f59e0b', crit:'#ef4444' };
// 📊 парог → тон АДНЫМ месцам: кожны чып-лічнік пісаў свой ланцуг тэрнарнікаў, і межы разыходзіліся
// (70/90 у файлах, 60/85 у KV, «max-20» у пошце) без ніводнай прычыны, акрамя парадку напісання.
window.TTZOP_chipTone = function (used, max, o) {
  if (!max) return 'mute';                       // без ліміту няма і парога — проста лічба
  o = o || {};
  const pct = (Number(used) / Number(max)) * 100;
  return pct >= (o.crit == null ? 100 : o.crit) ? 'crit' : pct >= (o.warn == null ? 70 : o.warn) ? 'warn' : 'mute';
};
// 🔤 надпіс з `ui-i18n.js` часта ўжо нясе іконку першым токенам («✅ Пацверджаны»). Расшчапленне
// рабілася рукамі ў двух месцах — цяпер яно ў МЕХАНІЗМЕ: `label` сам дзеліцца на ico+text.
// ⚠️ Дзелім толькі калі першы токен РЭАЛЬНА знак, а не слова: інакш «Новы заказ» страціў бы слова.
// 🔑 Правіла па СУТНАСЦІ, а не па спісе дыяпазонаў: «знак» = у токене няма ніводнай літары і лічбы.
// Спіс кодавых блокаў тут ужо падводзіў — 🆕 (U+1F195) не трапляе ў «эмодзі» 1F300–1FAFF, і
// расшчапленне ціха не спрацоўвала. Новы эмодзі з любога будучага блока працуе сам.
const _CHIP_WORD_RE = /[\p{L}\p{N}]/u;
window.TTZOP_chipSplit = function (label) {
  const s = String(label == null ? '' : label).trim();
  const i = s.indexOf(' ');
  if (i <= 0) return { ico: '', text: label };
  const head = s.slice(0, i);
  return _CHIP_WORD_RE.test(head) ? { ico: '', text: label } : { ico: head, text: s.slice(i + 1) };
};
window.TTZOP_chip = function (o) {
  if (!o) return '';
  if (o.label != null) { const p = window.TTZOP_chipSplit(o.label); o = { ...o, ico: o.ico || p.ico, text: p.text }; }
  const has = o.text != null && o.text !== '';
  if (!has && !o.ico) return '';                 // пусты чып не месца займае, а знікае
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const col = window.TTZOP_CHIP_TONES[o.tone] || o.tone || 'var(--muted)';
  // тон нясе стан? (усё, апроч нейтральных mute/fg) — тады схема іконак у колер НЕ ўмешваецца
  const stateful = !!o.tone && o.tone !== 'mute' && o.tone !== 'fg';
  // ⚠️ `icoColor` — ЯЎНЫ колер іконкі, толькі для прэв'ю ЧУЖОЙ схемы (`_pvHeadHtml`): клас
  // `mi-<id>` дае колер БЯГУЧАЙ схемы, і ўсе тры прэв'ю выглядалі б аднолькава. Тая ж пастка і
  // той жа выхад, што ў `_icoFolder(col)`
  let ico = o.ico ? window.ttIcoText(esc(o.ico), { scheme: !stateful && !o.icoColor }) : '';
  if (ico && o.icoColor && !stateful) ico = `<span style="color:${esc(o.icoColor)};display:inline-flex">${ico}</span>`;
  const txt = has ? esc(o.text) : '';
  const box = o.outline ? 'border:1px solid currentColor;border-radius:10px;padding:0 7px;opacity:0.9;' : '';
  const ttl = o.title ? ` title="${esc(o.title)}"` : '';
  // `lead` — чып ПЕРАД назвай (⭐ уласны сайт): адступ мусіць быць з другога боку, інакш ён
  // адсоўвае сам сябе ад краю радка замест таго, каб аддзяліцца ад назвы
  const gap = o.lead ? 'margin-right:6px' : 'margin-left:6px';
  // 🏷 клас-пазнака `tt-chip` — каб чып быў ПАЗНАВАЛЬНЫ ў DOM. Без яе праверка вымушана мераць
  // «любы дробны span з эмодзі» і трапляе ў чужое (надпісы з `ui-i18n.js` таксама нясуць эмодзі):
  // тэст мераў бы не тое, што сцвярджае. Класу няма ў CSS — ён падпіс, а не стыль.
  return `<span class="tt-chip" style="font-size:0.72rem;color:${col};${gap};white-space:nowrap;display:inline-flex;align-items:center;gap:3px;${box}${o.dim ? 'opacity:0.5;' : ''}"${ttl}>${ico}${txt}</span>`;
};
// адзін праход па надпісе: усе вядомыя эмодзі → SVG таго ж памеру, што тэкст побач
// `opts.scheme` — дадаць клас `mi mi-<id>`, каб колерам іконкі кіравала СХЕМА (як у ⋯-меню і
// бакавога меню). Па змаўчанні НЕ дадаецца: у кнопках і загалоўках іконка мусіць пераймаць колер
// свайго кантэксту (danger-чырвоны, акцэнт актыўнага) — там клас біўся б з ім.
window.ttIcoText = (function () {
  let RE = null;
  return function (str, opts) {
    if (str == null) return str;
    const s = String(str);
    if (!s) return s;
    if (!RE) { // ⚠️ рэгулярка будуецца З КАТАЛОГА, а не пішацца рукамі: новы радок каталога не можа
      // застацца «напалову жывым» (іконка ёсць, замена яе не бачыць) — гэта клас «дзве крыніцы спісу»
      const keys = Object.keys(window.TTZOP_ICON_EMOJI).sort((a, b) => b.length - a.length);
      RE = new RegExp('(' + keys.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')\uFE0F?', 'g');
    }
    const sch = !!(opts && opts.scheme);
    return s.replace(RE, (m, k) => {
      const id = window.TTZOP_ICON_EMOJI[k], p = window.TTZOP_MENU_ICONS[id];
      // 1em — іконка роўная тэксту побач (загаловак, кнопка, пункт меню) і не ламае вёрстку
      return p ? `<svg${sch ? ` class="mi mi-${id}"` : ''} viewBox="0 0 16 16" width="1em" height="1em" fill="none" style="display:inline-block;vertical-align:-0.13em;flex-shrink:0" aria-hidden="true">${p}</svg>` : m;
    });
  };
})();
