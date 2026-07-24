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

export async function onRequest(context) {
  const path = decodeURIComponent(new URL(context.request.url).pathname);
  if (PUBLIC_FILES.includes(path)) return context.next();
  // дакладны файл (auth.json) АБО што-небудзь унутры папкі (content/...)
  const blocked = PRIVATE_PREFIXES.some(p => path === p || path.startsWith(p + '/'));
  if (blocked) return new Response('Forbidden', { status: 403 });
  return context.next();
}
