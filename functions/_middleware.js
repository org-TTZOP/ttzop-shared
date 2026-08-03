// Pages Functions middleware — блакуе публічны HTTP-доступ да прыватных дадзеных.
// .assetsignore Git-Pages ігнаруе, _redirects не падтрымлівае 403 — таму middleware.
// Файлы застаюцца ў рэпе/дэплоі (воркер ttzop-api чытае іх праз GitHub API, не праз хостынг),
// але звонку праз HTTP яны вяртаюць 403.
// 🛡️ F4: ЗАКРЫТА ЎСЯ /content/ (было — пералік асобных файлаў, і settings.json/settings_history.json/
// reset_code.json аддаваліся публічна). Сайт і кабінет чытаюць кантэнт ТОЛЬКІ праз воркер
// (`API_URL + '/content/{site}/{section}'`), дзе працуе фільтр сакрэтаў `_publicSettings` — статыка
// Pages ішла ў абыход яго. Тут жа быў публічны `content/reset_code.json` (код скіду пароля).
// Белы спіс ніжэй — адзінае, што панэль сапраўды бярэ са свайго дамена.
const PRIVATE_PREFIXES = [
  '/content',                     // усе дадзеныя сайта (акрамя PUBLIC_FILES) — толькі праз воркер
  '/CLAUDE.md',                   // унутраная дакументацыя архітэктуры
  '/README.md'                    // унутраны readme
];
// Крок 4 «парадку ў дадзеных»: гэтыя два чытае панэль пры прымірэнні дэфолтаў
// (_settingsReconcileDefaults) са СВАЙГО дамена; сакрэтаў няма (пустыя дэфолты + rename-правілы).
const PUBLIC_FILES = [
  '/content/settings-template.json',
  '/content/migrations.json'
];

// ═══ 🔎 SEO: robots.txt і sitemap.xml (02.08) ═══
// ⚠️ ЧАМУ ТУТ. Абодва файлы аддавалі HTTP 200 з ЦЕЛАМ СТАРОНКІ (Pages вяртае index.html на ўсё,
// чаго няма). Для пошукавіка гэта горш за 404: ён прыйшоў па карту сайта і атрымаў разметку.
// Middleware — самае бяспечнае месца: ён і так стаіць на кожным запыце, а тут дадаецца толькі
// параўнанне шляху з ранняй адсечкай. Ніводзін існуючы шлях не чапаецца.
// 🛡️ FAIL-OPEN: любая памылка → аддаём мінімальна слушны файл, а не 500. Горш, чым сёння, стаць
// не можа: сёння там наогул HTML.
const API_URL = 'https://ttzop-api.truetensites.workers.dev';
const _seoHdrs = (ct) => ({ 'Content-Type': ct, 'Cache-Control': 'public, max-age=3600' });

// 🚫 ЦІ ЗАКРЫТЫ САЙТ АД ІНДЭКСАЦЫІ. Дзве прычыны, абедзве важныя:
//   • сайт на ПАЎЗЕ — наведвальнікам ён не бачны, а ў выдачы вісеў бы;
//   • нашы ўласныя staging/дэма-паддамены — іх у пошуку не мусіць быць увогуле.
// ⚠️ Кліенцкі сайт на бясплатным этапе з маркай НЕ закрываем: яму трафік патрэбны, а зняты потым
// `noindex` вяртае старонку ў выдачу не адразу — мы б каштавалі кліенту тыдняў індэксацыі.
// 🔑 ВЕРДЫКТ ЛІЧЫЦЬ СЕРВЕР (`_seoNoIndex` у публічнай праекцыі налад) — тут толькі чытаем гатовы
// `noindex`. Умова жыве ў адным месцы на ЎСІХ спажыўцоў (яшчэ адзін — роўтэр, ён ставіць мета-тэг):
// дзве копіі разышліся б, і сайт мог бы адначасова забараняць абход і не мець noindex — горшы з
// вынікаў, бо `Disallow` не дае боту прачытаць `noindex`, і з выдачы старонку ўжо не прыбраць.
// ⚠️ Рэгулярка ніжэй — НЕ другая крыніца, а рэжым дэградацыі: калі API не адказаў, нашы ўласныя
// паддамены ўсё роўна не мусяць трапіць у пошук (кліенцкі ў гэтым выпадку лічым адкрытым).
const _OURS_RE = /-test\d*$|^ttzop-test/;
// 🌐 РЭАЛЬНЫ ХОСТ САЙТА, а не той, які бачыць функцыя. ⚠️ Роўтэр праксіруе на `{project}.pages.dev`
// і выразае `Host` (інакш Pages адхіляе чужы Host → 403), таму `url.hostname` тут — УНУТРАНАЕ імя.
// Жывы кейс 03.08: `sitemap.xml` кожнага кліента паказваў на `https://ttzop-shared.pages.dev/`, а
// `robots.txt` лічыў сайт нашым службовым і аддаваў `Disallow: /` — то бок закрываў КЛІЕНЦКІ сайт ад
// пошуку цалкам. Статус і Content-Type пры гэтым былі бездакорныя, таму праверкі гэтага не бачылі.
// Роўтэр перадае праўду загалоўкам; фолбэк на `url` — для прамога зваротy да Pages (без роўтэра).
const _realHost = (request, url) => (request.headers.get('x-ttzop-host') || url.hostname).toLowerCase();
async function _noIndex(host) {
  const sub = host.split('.')[0];
  try {
    const r = await fetch(`${API_URL}/content/${sub}/settings`, { cf: { cacheTtl: 300 } });
    if (r.ok) {
      const s = await r.json();
      return s?.noindex !== undefined ? !!s.noindex : !!s?.paused; // фолбэк — стары edge-кэш без поля
    }
  } catch { /* не даведаліся — ніжэй */ }
  return _OURS_RE.test(sub);
}

async function _seoFiles(url, host) {
  const origin = `https://${host}`;   // адрас, па якім сайт рэальна адкрываюць, а не ўнутраны pages.dev
  if (url.pathname === '/robots.txt') {
    if (await _noIndex(host)) {
      return new Response(`User-agent: *\nDisallow: /\n`, { headers: _seoHdrs('text/plain; charset=utf-8') });
    }
    // ⚠️ /admin і /portal.html зачыняем ад індэксацыі свядома: панэль кіравання і кабінет кліента
    // у выдачы не патрэбны нікому, а іх з'яўленне там — сігнал «сайт не даглядаюць».
    return new Response(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /portal.html
Disallow: /content/

Sitemap: ${origin}/sitemap.xml
`, { headers: _seoHdrs('text/plain; charset=utf-8') });
  }
  // sitemap: сайт — адна публічная старонка (мова жыве ў localStorage, асобных URL няма),
  // таму карта сумленна складаецца з яе адной. Дадасца URL на мову — дадасца радок сюды.
  let lastmod = new Date().toISOString().slice(0, 10);
  try {
    const site = host.split('.')[0];
    const r = await fetch(`${API_URL}/content/${site}/sections`, { cf: { cacheTtl: 3600 } });
    if (r.ok) { const t = r.headers.get('last-modified'); if (t) lastmod = new Date(t).toISOString().slice(0, 10); }
  } catch { /* fail-open: дата сённяшняя — карта ўсё роўна слушная */ }
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${origin}/</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>
</urlset>
`, { headers: _seoHdrs('application/xml; charset=utf-8') });
}

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const path = decodeURIComponent(url.pathname);
  if (path === '/robots.txt' || path === '/sitemap.xml') {
    try { return await _seoFiles(url, _realHost(context.request, url)); } catch { return context.next(); } // 🛡️ горш за сённяшняе не будзе
  }
  // ═══ 🚧 САПРАЎДНЫ 404 ═══
  // ⚠️ Было: /якая-заўгодна-лухта → HTTP 200 + галоўная старонка. Гэта «мяккі 404»: пошукавік
  // лічыць кожную памылку ў спасылцы новай старонкай і індэксуе бясконца дублікатаў галоўнай.
  // 🔑 Правіла, а не спіс: сайт — АДНА публічная старонка, значыць усё, што не «/», не файл
  // (ёсць пашырэнне) і не наш вядомы раздзел — гэта сапраўды не старонка.
  // ⚠️ /admin і /portal.html выключаны яўна: гэта жывыя раздзелы, а не памылка.
  if (path !== '/' && !/\.[a-z0-9]{1,8}$/i.test(path) && !path.startsWith('/admin') && path !== '/portal') {
    return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="robots" content="noindex"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>404</title><style>body{font:16px/1.6 system-ui,sans-serif;display:grid;place-items:center;
min-height:100vh;margin:0;background:#111827;color:#e5e7eb}a{color:#f97316}</style></head>
<body><div style="text-align:center"><h1 style="font-size:3rem;margin:0">404</h1>
<p>Page not found</p><p><a href="/">&larr; Home</a></p></div></body></html>`,
      { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }
  if (PUBLIC_FILES.includes(path)) return context.next();
  // дакладны файл (auth.json) АБО што-небудзь унутры папкі (content/...)
  const blocked = PRIVATE_PREFIXES.some(p => path === p || path.startsWith(p + '/'));
  if (blocked) return new Response('Forbidden', { status: 403 });
  return context.next();
}
