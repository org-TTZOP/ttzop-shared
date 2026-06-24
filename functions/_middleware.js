// Pages Functions middleware — блакуе публічны HTTP-доступ да прыватных дадзеных.
// .assetsignore Git-Pages ігнаруе, _redirects не падтрымлівае 403 — таму middleware.
// Файлы застаюцца ў рэпе/дэплоі (воркер ttzop-api чытае іх праз GitHub API, не праз хостынг),
// але звонку праз HTTP яны вяртаюць 403.
const PRIVATE_PREFIXES = [
  '/content/clients',              // персанальныя дадзеныя кліентаў (GDPR)
  '/content/auth.json',           // хэш пароля адміна
  '/content/consents.json',       // згоды
  '/content/migrations.json',     // службовы — міграцыі merge-settings
  '/content/settings-template.json', // службовы — шаблон налад для merge
  '/CLAUDE.md',                   // унутраная дакументацыя архітэктуры
  '/README.md'                    // унутраны readme
];

export async function onRequest(context) {
  const path = decodeURIComponent(new URL(context.request.url).pathname);
  // дакладны файл (auth.json) АБО што-небудзь унутры папкі (clients/...)
  const blocked = PRIVATE_PREFIXES.some(p => path === p || path.startsWith(p + '/'));
  if (blocked) return new Response('Forbidden', { status: 403 });
  return context.next();
}
