// 🌐 АДЗІНЫ РЭЗАЛВ «хост → site_id» для ЎСІХ старонак (сайт · кабінет · панэль).
//
// ⚠️ ЧАМУ КАМПАНЕНТ, А НЕ РАДОК У КОЖНЫМ ФАЙЛЕ. Да ўласных даменаў кліентаў сайт вызначаўся як
// `hostname.split('.')[0]` — і гэта было напісана ў ЧАТЫРОХ месцах (`main.js`, `admin/index.html`
// двойчы, `portal.html`), кожнае са сваім фолбэкам. Пакуль усе жывуць на `{repo}.ttzop.com`,
// разыходжанне не бачна. На `pekarnya.by` той жа радок дае `pekarnya` — сайта з такім id можа не
// быць, а можа належаць ІНШАМУ кліенту (крос-тэнант). Правіла праекта: механізм жыве ў адным
// месцы, куток дае толькі канфіг.
//
// 🔑 ДВА РЭЖЫМЫ, і гэта галоўнае ў дызайне:
//   • наш паддамен / лакальнае — рэзалв СІНХРОННЫ, з самога хоста, нуль запытаў;
//   • уласны дамен кліента — патрэбны сервер (`site_by_host`), значыць адзін запыт на загрузку,
//     вынік кладзецца ў sessionStorage і больш не пытаецца.
// Так плата за ўласныя дамены не кладзецца на 99% старонак, што жывуць на паддамене.
//
// ⚠️ `null` з `resolve()` = дамен нам не вядомы (DNS ужо вядзе да нас, а падключэнне яшчэ не
// завершана або спынена). Каллер ПАВІНЕН гэта паказаць чалавеку, а НЕ падставіць фолбэк:
// падставіўшы, мы паказалі б чужому наведвальніку тэставы сайт.
(function (g) {
  const API = g.TTZOP_API || 'https://ttzop-api.truetensites.workers.dev';
  const DEV = 'ttzop-test';     // лакальная распрацоўка і preview-зборкі
  const PLATFORM = 'ttzop';     // сама вітрына на голым ttzop.com
  const CK = 'ttzop_repo:';     // sessionStorage: пер-хост, каб два дамены ў адным браўзеры не зліліся

  // Сінхронны разбор. Вяртае site_id або null, калі без сервера не абысціся.
  function fast(host) {
    const h = String(host == null ? location.hostname : host).toLowerCase().split(':')[0]
      .replace(/^www\./, '').replace(/\.$/, '');
    if (!h || h === 'localhost' || h === '127.0.0.1' || h.endsWith('.pages.dev')) return DEV;
    const m = h.match(/^([a-z0-9][a-z0-9-]*)\.ttzop\.com$/);
    if (m) return m[1];
    if (h === 'ttzop.com') return PLATFORM;
    return null; // уласны дамен — пытаем сервер
  }

  async function resolve(host) {
    const h = String(host == null ? location.hostname : host).toLowerCase().split(':')[0];
    const f = fast(h);
    if (f) return f;
    try { const c = sessionStorage.getItem(CK + h); if (c) return c; } catch {}
    try {
      const r = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'site_by_host', host: h }) });
      const j = await r.json();
      if (j && j.repo) { try { sessionStorage.setItem(CK + h, j.repo); } catch {} return j.repo; }
    } catch {}
    return null;
  }

  g.TTZOP_SITE = { fast, resolve };
})(window);
