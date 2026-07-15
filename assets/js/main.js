/* ================================================
   TTZOP — main.js
   Загружае даныя кліента з JSON і запаўняе сайт
   ================================================ */

async function loadSiteData() {
  try {
    // #4: у рэжыме прэв'ю (?look=токен) чытаем settings з непублікаваным выглядам (draft appearance-ключы)
    const _look = new URLSearchParams(location.search).get('look');
    const response = await fetch(API_URL + '/content/' + SITE_REPO + '/settings' + (_look ? '?draft=' + encodeURIComponent(_look) : ''));
    const data = await response.json();
    return data;
  } catch (e) {
    console.error('Памылка загрузкі даных:', e);
    return null;
  }
}

function applyTheme(data) {
  const root = document.documentElement;
  // Палітра бягучай тэмы: базавы прэсэт (data-theme) + inline CSS-vars перакрываюць themes.css
  if (data.themeColors && data.themeColors.base) {
    root.setAttribute('data-theme', data.themeColors.base);
    const vars = data.themeColors.vars || {};
    Object.keys(vars).forEach(k => { if (vars[k]) root.style.setProperty(k, vars[k]); });
  } else if (data.theme) {
    root.setAttribute('data-theme', data.theme);
  }
  // 🎛 Дызайн-параметры тэмы (РМ Тэмы → Секцыя «Дызайн» → праекцыя themeColors.design).
  // CSS уключае фічы праз атрыбуты data-d-* на <html>; адсутнасць design (стары settings) = усё па дэфолце ON.
  const d = data.themeColors?.design || {};
  const D = (k, def) => d[k] || def;
  root.dataset.dHero   = D('heroStyle', 'aurora'); // aurora | vivid | flat
  root.dataset.dShadows = D('shadows', 'soft');    // flat | soft | deep — цені картак
  // структурныя восі прэсэта «Цэх» (v4.460): фота-hero нізам / фонавы здымак / стужка фактаў / навбар паверх / палосы
  root.dataset.dHerolayout = D('heroLayout', 'standard'); // standard | photo (поўнаэкранны, кантэнт унізе злева)
  root.dataset.dHerophoto  = D('heroPhoto', 'off');       // on = фонавае фота з галерэі (fallback — градыент heroStyle)
  root.dataset.dStats      = D('statsStrip', 'off');      // on = hero-meta як стужка фактаў пад кнопкамі
  root.dataset.dNavstyle   = D('navStyle', 'solid');      // solid | overlay (празрысты паверх hero да скролу)
  root.dataset.dBands      = D('bands', 'off');           // on = «Пра нас» палосай тэкст↔выява
  // восі прэсэтаў «Маршрут»/«Афіша» (v4.461)
  root.dataset.dSvcstyle   = D('svcStyle', 'cards');      // cards | route | covers | index (нумараваны спіс «Пратакол»)
  root.dataset.dHeroalign  = D('heroAlign', 'left');      // left | center
  root.dataset.dBgpattern  = D('bgPattern', 'none');      // none | grid (карта-сетка на светлых секцыях)
  // восі прэсэтаў «Пратакол»/«Штамп» (v4.473)
  root.dataset.dTypo    = D('typo', 'standard');          // standard | editorial (серыф) | caps (КАПС-плакат)
  root.dataset.dMarquee = D('marquee', 'off');            // on = бягучы радок паслуг/коштаў пад hero
  root.dataset.dFrames  = D('frames', 'off');             // on = тоўстыя рамкі-борды замест ценяў
  root.dataset.dStamp   = D('stamp', 'off');              // on = круглая «пячатка» з назвай кампаніі ў hero
  root.dataset.dGlass  = D('glassNav', 'on');
  root.dataset.dBento  = D('bento', 'on');
  root.dataset.dSticky = D('stickyCta', 'on');
  root.dataset.dAnim   = D('anim', 'on');
  // маштаб скругленасці вуглоў — тры прэсэты пераазначаюць --radius-* з themes.css
  const RAD = { sharp: ['2px','4px','8px'], soft: ['6px','10px','16px'], round: ['12px','18px','28px'] };
  const r = RAD[D('radius', 'soft')] || RAD.soft;
  root.style.setProperty('--radius-sm', r[0]); root.style.setProperty('--radius-md', r[1]); root.style.setProperty('--radius-lg', r[2]);
}

const SITE_LANGS = [
  { code: 'be', label: 'BE', name: 'Беларуская' },
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'uk', label: 'UK', name: 'Українська' },
  { code: 'ru', label: 'RU', name: 'Русский' },
  { code: 'pl', label: 'PL', name: 'Polski' },
  { code: 'de', label: 'DE', name: 'Deutsch' },
  { code: 'fr', label: 'FR', name: 'Français' },
  { code: 'es', label: 'ES', name: 'Español' },
  { code: 'it', label: 'IT', name: 'Italiano' },
  { code: 'pt', label: 'PT', name: 'Português' },
  { code: 'zh', label: 'ZH', name: '中文' },
  { code: 'ar', label: 'AR', name: 'العربية', dir: 'rtl' },
  { code: 'hu', label: 'HU', name: 'Magyar' },
];

let currentLang = null;
let currentUiLang = 'be';
let siteData = null;
let exchangeRates = null; // { rates:{EUR-база}, overrides:{}, updatedAt:'' } з content/exchange-rates.json

// locale → ISO 4217 (ECB-база, EUR-краіны не патрабуюць уліку)
const _LOCALE_CURRENCY = {
  'pl':'PLN','cs':'CZK','hu':'HUF','ro':'RON','bg':'BGN','hr':'EUR','sk':'EUR',
  'sl':'EUR','lt':'EUR','lv':'EUR','et':'EUR',
  'sv':'SEK','no':'NOK','da':'DKK',
  'be':'BYN','ru':'RUB','uk':'UAH','ka':'GEL','kk':'KZT',
  'tr':'TRY','zh':'CNY','ja':'JPY','ko':'KRW',
  'ar':'AED','he':'ILS','hi':'INR',
  'en-gb':'GBP','en-au':'AUD','en-nz':'AUD','en-ca':'CAD','en-us':'USD',
  'en-in':'INR','en-sg':'SGD',
  'pt-br':'BRL','es-mx':'MXN','es-ar':'ARS',
};

function _detectVisitorCurrency(baseCurrency) {
  const loc = (navigator.language || '').toLowerCase();
  return _LOCALE_CURRENCY[loc]
    || _LOCALE_CURRENCY[loc.split('-')[0]]
    || baseCurrency || 'EUR';
}

function _convertAmount(amount, fromCode, toCode, rates) {
  if (!amount || fromCode === toCode) return amount;
  const r = { ...rates };
  const from = fromCode === 'EUR' ? 1 : (r[fromCode] || 0);
  const to   = toCode   === 'EUR' ? 1 : (r[toCode]   || 0);
  if (!from || !to) return amount;
  return Math.round((amount / from) * to * 100) / 100;
}

// Акругляем лакальную суму да "прыгожага" ліку: вялікія — да цэлых, малыя — да 0.01
function _roundLocal(amount) {
  if (amount >= 1000) return Math.round(amount);
  if (amount >= 100)  return Math.round(amount * 10) / 10;
  if (amount >= 10)   return Math.round(amount);
  return Math.round(amount * 100) / 100;
}

function _applyPriceConversion() {
  if (!exchangeRates || !siteData) return;
  const base = siteData.currency?.code || 'EUR';
  const visitor = _detectVisitorCurrency(base);
  const effective = { ...exchangeRates.rates, ...exchangeRates.overrides };
  document.querySelectorAll('[data-price][data-currency]').forEach(el => {
    const raw = parseFloat(el.dataset.price);
    const cur = el.dataset.currency || base;
    if (!raw) return;
    const baseText = raw + ' ' + cur; // асноўная валюта — стабільная цана
    if (visitor === cur) { el.textContent = baseText; return; }
    const converted = _convertAmount(raw, cur, visitor, effective);
    if (!converted || converted === raw) { el.textContent = baseText; return; }
    // Паказваем абедзве: асноўную + лакальную арыентыр
    el.innerHTML = `${baseText} <span style="color:inherit;opacity:0.65;font-size:0.9em">(≈ ${_roundLocal(converted)} ${visitor})</span>`;
  });
}

const UI_T = {
  be: {
    book_title: "Запіс на {name}", book_date: "Дата", book_time: "Час", book_loading: "Шукаем вольны час…", book_none: "На гэты дзень вольнага часу няма", book_confirm: "Запісацца на {d} а {t}?", book_done: "Гатова! Вы запісаны на {d} а {t}. Дэталі — у кабінеце.", book_taken: "Гэты час толькі што занялі. Выберыце іншы.", book_login: "Каб запісацца, увайдзіце ў кабінет", book_err: "Не атрымалася. Паспрабуйце пазней", book_seats: "Месцаў:", book_full: "Месцаў не засталося — абярыце іншы час", grp_upto: "Група да {n} удзельнікаў", show_more:'Паказаць яшчэ', show_less:'Скрыць', view_toggle:'Карткі / Спіс',
    hours_your_tz: 'у вашым поясе:', sched_dayoff: 'выходны', sched_everyday: 'Штодня',
    cart_title: 'Кошык: {n} паслуг(і)', cart_clear: 'Ачысціць', cart_order: 'Аформіць заказ →', cart_remove: 'Выдаліць', cart_subtotal: 'Сума', cart_delivery: 'Дастаўка', cart_total: 'Разам', cart_empty: 'Кошык пусты', cab_chat: 'Чат', cab_logout: 'Выйсці', cab_cabinet: 'Кабінет', cart_address: 'Адрас дастаўкі', cart_addr_none: 'Дадаць адрас у кабінеце', cab_logout_confirm: 'Выйсці з кабінета? Наступны ўваход — толькі праз новы код на email.',
    cart_added: '🛒 У кошыку ({n})', cta_book: 'Запісацца', price_from_pfx:'ад', price_quote:'Па дамове', badge_hit:'Хіт', badge_new:'Новае', badge_promo:'Акцыя', chat_book_pfx:'Хачу запісацца: {name}', ask_btn:'Спытаць', chat_ask_pfx:'Пытанне пра: {name}', sub_btn:'Аформіць падпіску', chat_sub_pfx:'Хачу аформіць падпіску: {name}', per_month:'/мес', per_year:'/год', look_note:'Рэжым прагляду канцэптаў — гэта НЕ рэальны выгляд сайта', look_colors:'Колеры', look_designs:'Паводзіны', look_apply:'Выбраць гэты варыянт', add_to_cart: '🛒 У кошык', reader_pdfprint: 'PDF / Друк', reader_close: 'Закрыць', reader_share: 'Падзяліцца', reader_copied: 'Скапіравана', read_in_tab: 'Чытаць у новым акне', read_more: 'Чытаць далей',
    privacy_title: 'Палітыка прыватнасці', privacy_subtitle: 'Перад замовай азнаёмцеся з палітыкай прыватнасці',
    privacy_agree: 'Я азнаёміўся і згаджаюся з палітыкай прыватнасці', privacy_decline: 'Адмовіцца', privacy_continue: 'Працягнуць →',
    form_title: 'Аформіць заказ', form_subdomain: 'Жаданы паддамен', form_email: 'Ваш Email',
    form_note: 'Заўвага (неабавязкова)', form_note_ph: 'Вашы пытанні або пажаданні...',
    form_back: 'Назад', form_send_code: 'Атрымаць код →', form_sending: 'Адпраўляем...',
    form_err_email: 'Увядзіце правільны email', form_err_subdomain: 'Увядзіце жаданы паддамен',
    form_err_subdomain_taken: 'Выберыце вольны паддамен', form_err_subdomain_test: 'Паддамен не можа ўтрымліваць "test"', form_err_connection: 'Памылка злучэння',
    verify_title: 'Пацверджанне email', verify_sent: 'Код адпраўлены на', verify_label: '6-значны код',
    verify_btn: 'Пацвердзіць і адправіць заказ', verify_checking: 'Правяраем...', site_paused: 'Сайт часова прыпынены', site_paused_more: 'Дадатковая інфармацыя на {site}',
    verify_err: 'Увядзіце 6-значны код', verify_err_wrong: 'Няправільны код',
    done_title: 'Заказ прыняты!',
    // 📝 №3а: анкета «Свой сайт» (сайт нараджаецца напоўнены)
    intake_title: "Пра вашу справу",
    intake_hint: "Запоўніце — і сайт адразу будзе ваш. Можна прапусціць і зрабіць пазней у панэлі.",
    intake_company: "Назва кампаніі",
    intake_company_ph: "Кавярня «Зерне»",
    intake_field: "Сфера дзейнасці",
    intake_field_ph: "Кава і выпечка",
    intake_about: "Кароткае апісанне",
    intake_about_ph: "1-2 сказы пра тое, чым вы займаецеся",
    intake_phone: "Тэлефон",
    intake_phone_ph: "+375 29 123-45-67",
    intake_address: "Адрас",
    intake_address_ph: "г. Мінск, вул. Няміга 5",
    intake_offers: "Галоўныя прапановы",
    intake_offers_hint: "Да трох. Цана неабавязковая — без яе будзе «па дамове».",
    intake_offer_name: "Назва",
    intake_offer_price: "Цана",
    intake_skip: "Прапусціць",
    intake_submit: "Гатова →",
    intake_saving: "Захаванне…",
    done_subdomain: 'Дзякуй! Ваш сайт <b style="color:#f97316">{domain}</b> ствараецца.<br>Вы атрымаеце ліст на <b style="color:#e8eaf0">{email}</b> калі ён будзе гатовы.',
    done_regular: 'Дзякуй! Мы звяжамся з вамі па email <b style="color:#e8eaf0">{email}</b> у бліжэйшы час.',
    done_close: 'Закрыць',
    form_site_langs: 'Мовы сайта', form_site_langs_err: 'Выберыце хаця б адну мову',
    cart_added_ok: '✓ Дадана!', form_err_send: 'Памылка.', form_err_conn: 'Памылка сувязі.', privacy_unavailable: 'Палітыка прыватнасці недаступная.',
    subdomain_invalid: 'Толькі малыя літары, лічбы і злучок. Ад 3 да 30 знакаў.',
    subdomain_free: '✅ {subdomain}.ttzop.com — вольны!', subdomain_check_err: 'Памылка праверкі',
  },
  en: {
    book_title: "Book {name}", book_date: "Date", book_time: "Time", book_loading: "Looking for free time…", book_none: "No free time on this day", book_confirm: "Book {d} at {t}?", book_done: "Done! You are booked for {d} at {t}. Details are in your account.", book_taken: "That time was just taken. Please pick another.", book_login: "Sign in to your account to book", book_err: "Something went wrong. Please try later", book_seats: "Seats:", book_full: "No seats left — pick another time", grp_upto: "Group up to {n}", show_more:'Show more', show_less:'Hide', view_toggle:'Cards / List',
    hours_your_tz: 'your time:', sched_dayoff: 'day off', sched_everyday: 'Every day',
    cart_title: 'Cart: {n} item(s)', cart_clear: 'Clear', cart_order: 'Place order →', cart_remove: 'Remove', cart_subtotal: 'Subtotal', cart_delivery: 'Delivery', cart_total: 'Total', cart_empty: 'Cart is empty', cab_chat: 'Chat', cab_logout: 'Log out', cab_cabinet: 'Account', cart_address: 'Delivery address', cart_addr_none: 'Add an address in your account', cab_logout_confirm: 'Log out? Next time you\'ll need a new email code to sign in.',
    cart_added: '🛒 In cart ({n})', cta_book: 'Book now', price_from_pfx:'from', price_quote:'Price on request', badge_hit:'Top', badge_new:'New', badge_promo:'Sale', chat_book_pfx:'I would like to book: {name}', ask_btn:'Ask a question', chat_ask_pfx:'Question about: {name}', sub_btn:'Subscribe', chat_sub_pfx:'I would like to subscribe: {name}', per_month:'/mo', per_year:'/yr', look_note:'Concept preview mode — this is NOT the live site look', look_colors:'Colors', look_designs:'Behavior', look_apply:'Choose this look', add_to_cart: '🛒 Add to cart', reader_pdfprint: 'PDF / Print', reader_close: 'Close', reader_share: 'Share', reader_copied: 'Copied', read_in_tab: 'Read in new tab', read_more: 'Read more',
    privacy_title: 'Privacy Policy', privacy_subtitle: 'Please read our privacy policy before ordering',
    privacy_agree: 'I have read and agree to the privacy policy', privacy_decline: 'Decline', privacy_continue: 'Continue →',
    form_title: 'Place order', form_subdomain: 'Desired subdomain', form_email: 'Your Email',
    form_note: 'Note (optional)', form_note_ph: 'Your questions or wishes...',
    form_back: 'Back', form_send_code: 'Get code →', form_sending: 'Sending...',
    form_err_email: 'Enter a valid email', form_err_subdomain: 'Enter desired subdomain',
    form_err_subdomain_taken: 'Choose an available subdomain', form_err_subdomain_test: 'Subdomain cannot contain "test"', form_err_connection: 'Connection error',
    verify_title: 'Email confirmation', verify_sent: 'Code sent to', verify_label: '6-digit code',
    verify_btn: 'Confirm and place order', verify_checking: 'Checking...', site_paused: 'Site temporarily paused', site_paused_more: 'More information at {site}',
    verify_err: 'Enter the 6-digit code', verify_err_wrong: 'Incorrect code',
    done_title: 'Order accepted!',
    // 📝 №3а: анкета «Свой сайт» (сайт нараджаецца напоўнены)
    intake_title: "About your business",
    intake_hint: "Fill this in and the site is yours right away. You can skip and do it later in the panel.",
    intake_company: "Company name",
    intake_company_ph: "Zerne Coffee",
    intake_field: "Field of work",
    intake_field_ph: "Coffee and pastry",
    intake_about: "Short description",
    intake_about_ph: "1-2 sentences about what you do",
    intake_phone: "Phone",
    intake_phone_ph: "+1 555 123-4567",
    intake_address: "Address",
    intake_address_ph: "5 Main St, Springfield",
    intake_offers: "Main offers",
    intake_offers_hint: "Up to three. Price is optional — without it we show «on request».",
    intake_offer_name: "Name",
    intake_offer_price: "Price",
    intake_skip: "Skip",
    intake_submit: "Done →",
    intake_saving: "Saving…",
    done_subdomain: 'Thank you! Your site <b style="color:#f97316">{domain}</b> is being created.<br>You will receive an email at <b style="color:#e8eaf0">{email}</b> when it\'s ready.',
    done_regular: 'Thank you! We will contact you at <b style="color:#e8eaf0">{email}</b> shortly.',
    done_close: 'Close',
    form_site_langs: 'Site languages', form_site_langs_err: 'Select at least one language',
    cart_added_ok: '✓ Added!', form_err_send: 'Error.', form_err_conn: 'Connection error.', privacy_unavailable: 'Privacy policy unavailable.',
    subdomain_invalid: 'Only lowercase letters, numbers and hyphens. 3 to 30 characters.',
    subdomain_free: '✅ {subdomain}.ttzop.com — available!', subdomain_check_err: 'Check error',
  },
  uk: {
    book_title: "Запис на {name}", book_date: "Дата", book_time: "Час", book_loading: "Шукаємо вільний час…", book_none: "На цей день вільного часу немає", book_confirm: "Записатися на {d} о {t}?", book_done: "Готово! Вас записано на {d} о {t}. Деталі — в кабінеті.", book_taken: "Цей час щойно зайняли. Оберіть інший.", book_login: "Щоб записатися, увійдіть до кабінету", book_err: "Не вдалося. Спробуйте пізніше", book_seats: "Місць:", book_full: "Місць не залишилося — оберіть інший час", grp_upto: "Група до {n} учасників", show_more:'Показати ще', show_less:'Сховати', view_toggle:'Картки / Список',
    hours_your_tz: 'у вашому поясі:', sched_dayoff: 'вихідний', sched_everyday: 'Щодня',
    cart_title: 'Кошик: {n} послуг(и)', cart_clear: 'Очистити', cart_order: 'Оформити замовлення →', cart_remove: 'Видалити', cart_subtotal: 'Сума', cart_delivery: 'Доставка', cart_total: 'Разом', cart_empty: 'Кошик порожній', cab_chat: 'Чат', cab_logout: 'Вийти', cab_cabinet: 'Кабінет', cart_address: 'Адреса доставки', cart_addr_none: 'Додати адресу в кабінеті', cab_logout_confirm: 'Вийти з кабінету? Наступний вхід — лише через новий код на email.',
    cart_added: '🛒 У кошику ({n})', cta_book: 'Записатися', price_from_pfx:'від', price_quote:'За домовленістю', badge_hit:'Хіт', badge_new:'Нове', badge_promo:'Акція', chat_book_pfx:'Хочу записатися: {name}', ask_btn:'Запитати', chat_ask_pfx:'Питання про: {name}', sub_btn:'Оформити підписку', chat_sub_pfx:'Хочу оформити підписку: {name}', per_month:'/міс', per_year:'/рік', look_note:'Режим перегляду концептів — це НЕ реальний вигляд сайту', look_colors:'Кольори', look_designs:'Поведінка', look_apply:'Обрати цей варіант', add_to_cart: '🛒 У кошик', reader_pdfprint: 'PDF / Друк', reader_close: 'Закрити', reader_share: 'Поділитися', reader_copied: 'Скопійовано', read_in_tab: 'Читати в новій вкладці', read_more: 'Читати далі',
    privacy_title: 'Політика конфіденційності', privacy_subtitle: 'Перед замовленням ознайомтесь з політикою конфіденційності',
    privacy_agree: 'Я ознайомився і погоджуюсь з політикою конфіденційності', privacy_decline: 'Відмовитися', privacy_continue: 'Продовжити →',
    form_title: 'Оформити замовлення', form_subdomain: 'Бажаний піддомен', form_email: 'Ваш Email',
    form_note: 'Примітка (необов\'язково)', form_note_ph: 'Ваші питання або побажання...',
    form_back: 'Назад', form_send_code: 'Отримати код →', form_sending: 'Відправляємо...',
    form_err_email: 'Введіть правильний email', form_err_subdomain: 'Введіть бажаний піддомен',
    form_err_subdomain_taken: 'Виберіть вільний піддомен', form_err_subdomain_test: 'Піддомен не може містити "test"', form_err_connection: 'Помилка з\'єднання',
    verify_title: 'Підтвердження email', verify_sent: 'Код відправлено на', verify_label: '6-значний код',
    verify_btn: 'Підтвердити і відправити замовлення', verify_checking: 'Перевіряємо...', site_paused: 'Сайт тимчасово призупинено', site_paused_more: 'Додаткова інформація на {site}',
    verify_err: 'Введіть 6-значний код', verify_err_wrong: 'Невірний код',
    done_title: 'Замовлення прийнято!',
    // 📝 №3а: анкета «Свой сайт» (сайт нараджаецца напоўнены)
    intake_title: "Про вашу справу",
    intake_hint: "Заповніть — і сайт одразу буде ваш. Можна пропустити й зробити пізніше в панелі.",
    intake_company: "Назва компанії",
    intake_company_ph: "Кав'ярня «Зерно»",
    intake_field: "Сфера діяльності",
    intake_field_ph: "Кава і випічка",
    intake_about: "Короткий опис",
    intake_about_ph: "1-2 речення про те, чим ви займаєтесь",
    intake_phone: "Телефон",
    intake_phone_ph: "+380 67 123-45-67",
    intake_address: "Адреса",
    intake_address_ph: "м. Київ, вул. Хрещатик 5",
    intake_offers: "Головні пропозиції",
    intake_offers_hint: "До трьох. Ціна необов'язкова — без неї буде «за домовленістю».",
    intake_offer_name: "Назва",
    intake_offer_price: "Ціна",
    intake_skip: "Пропустити",
    intake_submit: "Готово →",
    intake_saving: "Збереження…",
    done_subdomain: 'Дякуємо! Ваш сайт <b style="color:#f97316">{domain}</b> створюється.<br>Ви отримаєте лист на <b style="color:#e8eaf0">{email}</b> коли він буде готовий.',
    done_regular: 'Дякуємо! Ми зв\'яжемося з вами по email <b style="color:#e8eaf0">{email}</b> найближчим часом.',
    done_close: 'Закрити',
    form_site_langs: 'Мови сайту', form_site_langs_err: 'Виберіть хоча б одну мову',
    cart_added_ok: '✓ Додано!', form_err_send: 'Помилка.', form_err_conn: 'Помилка з\'єднання.', privacy_unavailable: 'Політика конфіденційності недоступна.',
    subdomain_invalid: 'Тільки малі літери, цифри і дефіс. Від 3 до 30 символів.',
    subdomain_free: '✅ {subdomain}.ttzop.com — вільний!', subdomain_check_err: 'Помилка перевірки',
  },
  ru: {
    book_title: "Запись на {name}", book_date: "Дата", book_time: "Время", book_loading: "Ищем свободное время…", book_none: "На этот день свободного времени нет", book_confirm: "Записаться на {d} в {t}?", book_done: "Готово! Вы записаны на {d} в {t}. Детали — в кабинете.", book_taken: "Это время только что заняли. Выберите другое.", book_login: "Чтобы записаться, войдите в кабинет", book_err: "Не получилось. Попробуйте позже", book_seats: "Мест:", book_full: "Мест не осталось — выберите другое время", grp_upto: "Группа до {n} участников", show_more:'Показать ещё', show_less:'Скрыть', view_toggle:'Карточки / Список',
    hours_your_tz: 'в вашем поясе:', sched_dayoff: 'выходной', sched_everyday: 'Ежедневно',
    cart_title: 'Корзина: {n} услуг(и)', cart_clear: 'Очистить', cart_order: 'Оформить заказ →', cart_remove: 'Удалить', cart_subtotal: 'Сумма', cart_delivery: 'Доставка', cart_total: 'Итого', cart_empty: 'Корзина пуста', cab_chat: 'Чат', cab_logout: 'Выйти', cab_cabinet: 'Кабинет', cart_address: 'Адрес доставки', cart_addr_none: 'Добавить адрес в кабинете', cab_logout_confirm: 'Выйти из кабинета? Следующий вход — только через новый код на email.',
    cart_added: '🛒 В корзине ({n})', cta_book: 'Записаться', price_from_pfx:'от', price_quote:'По договорённости', badge_hit:'Хит', badge_new:'Новое', badge_promo:'Акция', chat_book_pfx:'Хочу записаться: {name}', ask_btn:'Спросить', chat_ask_pfx:'Вопрос о: {name}', sub_btn:'Оформить подписку', chat_sub_pfx:'Хочу оформить подписку: {name}', per_month:'/мес', per_year:'/год', look_note:'Режим просмотра концептов — это НЕ реальный вид сайта', look_colors:'Цвета', look_designs:'Поведение', look_apply:'Выбрать этот вариант', add_to_cart: '🛒 В корзину', reader_pdfprint: 'PDF / Печать', reader_close: 'Закрыть', reader_share: 'Поделиться', reader_copied: 'Скопировано', read_in_tab: 'Читать в новой вкладке', read_more: 'Читать далее',
    privacy_title: 'Политика конфиденциальности', privacy_subtitle: 'Перед заказом ознакомьтесь с политикой конфиденциальности',
    privacy_agree: 'Я ознакомился и соглашаюсь с политикой конфиденциальности', privacy_decline: 'Отказаться', privacy_continue: 'Продолжить →',
    form_title: 'Оформить заказ', form_subdomain: 'Желаемый поддомен', form_email: 'Ваш Email',
    form_note: 'Примечание (необязательно)', form_note_ph: 'Ваши вопросы или пожелания...',
    form_back: 'Назад', form_send_code: 'Получить код →', form_sending: 'Отправляем...',
    form_err_email: 'Введите правильный email', form_err_subdomain: 'Введите желаемый поддомен',
    form_err_subdomain_taken: 'Выберите свободный поддомен', form_err_subdomain_test: 'Поддомен не может содержать "test"', form_err_connection: 'Ошибка подключения',
    verify_title: 'Подтверждение email', verify_sent: 'Код отправлен на', verify_label: '6-значный код',
    verify_btn: 'Подтвердить и отправить заказ', verify_checking: 'Проверяем...', site_paused: 'Сайт временно приостановлен', site_paused_more: 'Дополнительная информация на {site}',
    verify_err: 'Введите 6-значный код', verify_err_wrong: 'Неверный код',
    done_title: 'Заказ принят!',
    // 📝 №3а: анкета «Свой сайт» (сайт нараджаецца напоўнены)
    intake_title: "О вашем деле",
    intake_hint: "Заполните — и сайт сразу будет вашим. Можно пропустить и сделать позже в панели.",
    intake_company: "Название компании",
    intake_company_ph: "Кофейня «Зерно»",
    intake_field: "Сфера деятельности",
    intake_field_ph: "Кофе и выпечка",
    intake_about: "Краткое описание",
    intake_about_ph: "1-2 предложения о том, чем вы занимаетесь",
    intake_phone: "Телефон",
    intake_phone_ph: "+7 900 123-45-67",
    intake_address: "Адрес",
    intake_address_ph: "г. Москва, ул. Тверская 5",
    intake_offers: "Главные предложения",
    intake_offers_hint: "До трёх. Цена необязательна — без неё будет «по договорённости».",
    intake_offer_name: "Название",
    intake_offer_price: "Цена",
    intake_skip: "Пропустить",
    intake_submit: "Готово →",
    intake_saving: "Сохранение…",
    done_subdomain: 'Спасибо! Ваш сайт <b style="color:#f97316">{domain}</b> создаётся.<br>Вы получите письмо на <b style="color:#e8eaf0">{email}</b> когда он будет готов.',
    done_regular: 'Спасибо! Мы свяжемся с вами по email <b style="color:#e8eaf0">{email}</b> в ближайшее время.',
    done_close: 'Закрыть',
    form_site_langs: 'Языки сайта', form_site_langs_err: 'Выберите хотя бы один язык',
    cart_added_ok: '✓ Добавлено!', form_err_send: 'Ошибка.', form_err_conn: 'Ошибка соединения.', privacy_unavailable: 'Политика конфиденциальности недоступна.',
    subdomain_invalid: 'Только строчные буквы, цифры и дефис. От 3 до 30 символов.',
    subdomain_free: '✅ {subdomain}.ttzop.com — свободен!', subdomain_check_err: 'Ошибка проверки',
  },
  pl: {
    book_title: "Rezerwacja: {name}", book_date: "Data", book_time: "Godzina", book_loading: "Szukamy wolnych terminów…", book_none: "Brak wolnych terminów tego dnia", book_confirm: "Zarezerwować {d} o {t}?", book_done: "Gotowe! Rezerwacja na {d} o {t}. Szczegóły w panelu klienta.", book_taken: "Ten termin właśnie zajęto. Wybierz inny.", book_login: "Zaloguj się, aby zarezerwować", book_err: "Nie udało się. Spróbuj później", book_seats: "Miejsca:", book_full: "Brak miejsc — wybierz inny czas", grp_upto: "Grupa do {n} osób", show_more:'Pokaż więcej', show_less:'Ukryj', view_toggle:'Karty / Lista',
    hours_your_tz: 'u Ciebie:', sched_dayoff: 'wolne', sched_everyday: 'Codziennie',
    cart_title: 'Koszyk: {n} usług(i)', cart_clear: 'Wyczyść', cart_order: 'Złóż zamówienie →', cart_remove: 'Usuń', cart_subtotal: 'Suma', cart_delivery: 'Dostawa', cart_total: 'Razem', cart_empty: 'Koszyk jest pusty', cab_chat: 'Czat', cab_logout: 'Wyloguj', cab_cabinet: 'Konto', cart_address: 'Adres dostawy', cart_addr_none: 'Dodaj adres w koncie', cab_logout_confirm: 'Wylogować się? Następne logowanie będzie wymagać nowego kodu e-mail.',
    cart_added: '🛒 W koszyku ({n})', cta_book: 'Umów się', price_from_pfx:'od', price_quote:'Cena do uzgodnienia', badge_hit:'Hit', badge_new:'Nowość', badge_promo:'Promocja', chat_book_pfx:'Chcę się umówić: {name}', ask_btn:'Zapytaj', chat_ask_pfx:'Pytanie o: {name}', sub_btn:'Subskrybuj', chat_sub_pfx:'Chcę wykupić subskrypcję: {name}', per_month:'/mies.', per_year:'/rok', look_note:'Tryb podglądu koncepcji — to NIE jest realny wygląd strony', look_colors:'Kolory', look_designs:'Zachowanie', look_apply:'Wybierz ten wariant', add_to_cart: '🛒 Do koszyka', reader_pdfprint: 'PDF / Drukuj', reader_close: 'Zamknij', reader_share: 'Udostępnij', reader_copied: 'Skopiowano', read_in_tab: 'Otwórz w nowej karcie', read_more: 'Czytaj dalej',
    privacy_title: 'Polityka prywatności', privacy_subtitle: 'Przed zamówieniem zapoznaj się z polityką prywatności',
    privacy_agree: 'Zapoznałem się i zgadzam się z polityką prywatności', privacy_decline: 'Odrzuć', privacy_continue: 'Kontynuuj →',
    form_title: 'Złóż zamówienie', form_subdomain: 'Żądana subdomena', form_email: 'Twój Email',
    form_note: 'Uwaga (opcjonalnie)', form_note_ph: 'Twoje pytania lub życzenia...',
    form_back: 'Wstecz', form_send_code: 'Pobierz kod →', form_sending: 'Wysyłamy...',
    form_err_email: 'Podaj prawidłowy email', form_err_subdomain: 'Podaj żądaną subdomenę',
    form_err_subdomain_taken: 'Wybierz wolną subdomenę', form_err_subdomain_test: 'Subdomena nie może zawierać "test"', form_err_connection: 'Błąd połączenia',
    verify_title: 'Potwierdzenie email', verify_sent: 'Kod wysłany na', verify_label: '6-cyfrowy kod',
    verify_btn: 'Potwierdź i złóż zamówienie', verify_checking: 'Sprawdzamy...', site_paused: 'Strona tymczasowo wstrzymana', site_paused_more: 'Więcej informacji na {site}',
    verify_err: 'Wprowadź 6-cyfrowy kod', verify_err_wrong: 'Nieprawidłowy kod',
    done_title: 'Zamówienie przyjęte!',
    // 📝 №3а: анкета «Свой сайт» (сайт нараджаецца напоўнены)
    intake_title: "O Twojej firmie",
    intake_hint: "Wypełnij — i strona od razu będzie Twoja. Możesz pominąć i zrobić to później w panelu.",
    intake_company: "Nazwa firmy",
    intake_company_ph: "Kawiarnia «Ziarno»",
    intake_field: "Branża",
    intake_field_ph: "Kawa i wypieki",
    intake_about: "Krótki opis",
    intake_about_ph: "1-2 zdania o tym, czym się zajmujesz",
    intake_phone: "Telefon",
    intake_phone_ph: "+48 555 111 222",
    intake_address: "Adres",
    intake_address_ph: "ul. Długa 5, Kraków",
    intake_offers: "Główne oferty",
    intake_offers_hint: "Do trzech. Cena opcjonalna — bez niej pokażemy «do uzgodnienia».",
    intake_offer_name: "Nazwa",
    intake_offer_price: "Cena",
    intake_skip: "Pomiń",
    intake_submit: "Gotowe →",
    intake_saving: "Zapisywanie…",
    done_subdomain: 'Dziękujemy! Twoja strona <b style="color:#f97316">{domain}</b> jest tworzona.<br>Otrzymasz email na <b style="color:#e8eaf0">{email}</b> gdy będzie gotowa.',
    done_regular: 'Dziękujemy! Skontaktujemy się z Tobą przez email <b style="color:#e8eaf0">{email}</b> wkrótce.',
    done_close: 'Zamknij',
    form_site_langs: 'Języki witryny', form_site_langs_err: 'Wybierz co najmniej jeden język',
    cart_added_ok: '✓ Dodano!', form_err_send: 'Błąd.', form_err_conn: 'Błąd połączenia.', privacy_unavailable: 'Polityka prywatności niedostępna.',
    subdomain_invalid: 'Tylko małe litery, cyfry i myślnik. Od 3 do 30 znaków.',
    subdomain_free: '✅ {subdomain}.ttzop.com — wolny!', subdomain_check_err: 'Błąd sprawdzania',
  },
  de: {
    book_title: "Termin: {name}", book_date: "Datum", book_time: "Uhrzeit", book_loading: "Freie Zeiten werden gesucht…", book_none: "An diesem Tag sind keine Termine frei", book_confirm: "Termin am {d} um {t} buchen?", book_done: "Fertig! Ihr Termin: {d} um {t}. Details im Kundenkonto.", book_taken: "Dieser Termin wurde gerade vergeben. Bitte wählen Sie einen anderen.", book_login: "Zum Buchen bitte im Kundenkonto anmelden", book_err: "Hat nicht geklappt. Bitte später versuchen", book_seats: "Plätze:", book_full: "Keine Plätze mehr — wählen Sie eine andere Zeit", grp_upto: "Gruppe bis {n} Teilnehmer", show_more:'Mehr anzeigen', show_less:'Ausblenden', view_toggle:'Karten / Liste',
    hours_your_tz: 'bei Ihnen:', sched_dayoff: 'geschlossen', sched_everyday: 'Täglich',
    cart_title: 'Warenkorb: {n} Leistung(en)', cart_clear: 'Leeren', cart_order: 'Bestellen →', cart_remove: 'Entfernen', cart_subtotal: 'Zwischensumme', cart_delivery: 'Lieferung', cart_total: 'Gesamt', cart_empty: 'Warenkorb ist leer', cab_chat: 'Chat', cab_logout: 'Abmelden', cab_cabinet: 'Konto', cart_address: 'Lieferadresse', cart_addr_none: 'Adresse im Konto hinzufügen', cab_logout_confirm: 'Abmelden? Für die nächste Anmeldung benötigen Sie einen neuen E-Mail-Code.',
    cart_added: '🛒 Im Warenkorb ({n})', cta_book: 'Termin buchen', price_from_pfx:'ab', price_quote:'Preis auf Anfrage', badge_hit:'Top', badge_new:'Neu', badge_promo:'Aktion', chat_book_pfx:'Ich möchte einen Termin buchen: {name}', ask_btn:'Frage stellen', chat_ask_pfx:'Frage zu: {name}', sub_btn:'Abonnieren', chat_sub_pfx:'Ich möchte abonnieren: {name}', per_month:'/Mon.', per_year:'/Jahr', look_note:'Konzept-Vorschau — NICHT das echte Erscheinungsbild der Website', look_colors:'Farben', look_designs:'Verhalten', look_apply:'Diesen Look wählen', add_to_cart: '🛒 In den Warenkorb', reader_pdfprint: 'PDF / Druck', reader_close: 'Schließen', reader_share: 'Teilen', reader_copied: 'Kopiert', read_in_tab: 'In neuem Tab öffnen', read_more: 'Weiterlesen',
    privacy_title: 'Datenschutzrichtlinie', privacy_subtitle: 'Bitte lesen Sie unsere Datenschutzrichtlinie vor der Bestellung',
    privacy_agree: 'Ich habe die Datenschutzrichtlinie gelesen und stimme zu', privacy_decline: 'Ablehnen', privacy_continue: 'Weiter →',
    form_title: 'Bestellen', form_subdomain: 'Gewünschte Subdomain', form_email: 'Ihre E-Mail',
    form_note: 'Anmerkung (optional)', form_note_ph: 'Ihre Fragen oder Wünsche...',
    form_back: 'Zurück', form_send_code: 'Code erhalten →', form_sending: 'Wird gesendet...',
    form_err_email: 'Geben Sie eine gültige E-Mail-Adresse ein', form_err_subdomain: 'Geben Sie die gewünschte Subdomain ein',
    form_err_subdomain_taken: 'Wählen Sie eine verfügbare Subdomain', form_err_subdomain_test: 'Subdomain darf "test" nicht enthalten', form_err_connection: 'Verbindungsfehler',
    verify_title: 'E-Mail-Bestätigung', verify_sent: 'Code gesendet an', verify_label: '6-stelliger Code',
    verify_btn: 'Bestätigen und bestellen', verify_checking: 'Überprüfen...', site_paused: 'Website vorübergehend pausiert', site_paused_more: 'Weitere Informationen auf {site}',
    verify_err: 'Geben Sie den 6-stelligen Code ein', verify_err_wrong: 'Falscher Code',
    done_title: 'Bestellung aufgenommen!',
    // 📝 №3а: анкета «Свой сайт» (сайт нараджаецца напоўнены)
    intake_title: "Über Ihr Unternehmen",
    intake_hint: "Ausfüllen — und die Website gehört sofort Ihnen. Sie können überspringen und es später im Panel machen.",
    intake_company: "Firmenname",
    intake_company_ph: "Café «Korn»",
    intake_field: "Branche",
    intake_field_ph: "Kaffee und Gebäck",
    intake_about: "Kurzbeschreibung",
    intake_about_ph: "1-2 Sätze darüber, was Sie tun",
    intake_phone: "Telefon",
    intake_phone_ph: "+49 151 1234567",
    intake_address: "Adresse",
    intake_address_ph: "Hauptstraße 5, Berlin",
    intake_offers: "Hauptangebote",
    intake_offers_hint: "Bis zu drei. Preis optional — ohne ihn zeigen wir «auf Anfrage».",
    intake_offer_name: "Name",
    intake_offer_price: "Preis",
    intake_skip: "Überspringen",
    intake_submit: "Fertig →",
    intake_saving: "Speichern…",
    done_subdomain: 'Danke! Ihre Website <b style="color:#f97316">{domain}</b> wird erstellt.<br>Sie erhalten eine E-Mail an <b style="color:#e8eaf0">{email}</b>, wenn sie fertig ist.',
    done_regular: 'Danke! Wir werden Sie per E-Mail an <b style="color:#e8eaf0">{email}</b> in Kürze kontaktieren.',
    done_close: 'Schließen',
    form_site_langs: 'Seitensprachen', form_site_langs_err: 'Wählen Sie mindestens eine Sprache',
    cart_added_ok: '✓ Hinzugefügt!', form_err_send: 'Fehler.', form_err_conn: 'Verbindungsfehler.', privacy_unavailable: 'Datenschutzrichtlinie nicht verfügbar.',
    subdomain_invalid: 'Nur Kleinbuchstaben, Ziffern und Bindestriche. 3 bis 30 Zeichen.',
    subdomain_free: '✅ {subdomain}.ttzop.com — verfügbar!', subdomain_check_err: 'Prüffehler',
  },
  fr: {
    book_title: "Réserver : {name}", book_date: "Date", book_time: "Heure", book_loading: "Recherche de créneaux…", book_none: "Aucun créneau libre ce jour-là", book_confirm: "Réserver le {d} à {t} ?", book_done: "C'est fait ! Rendez-vous le {d} à {t}. Détails dans votre espace client.", book_taken: "Ce créneau vient d'être pris. Choisissez-en un autre.", book_login: "Connectez-vous à votre espace pour réserver", book_err: "Échec. Réessayez plus tard", book_seats: "Places :", book_full: "Plus de places — choisissez un autre horaire", grp_upto: "Groupe jusqu’à {n}", show_more:'Afficher plus', show_less:'Masquer', view_toggle:'Cartes / Liste',
    hours_your_tz: 'chez vous :', sched_dayoff: 'fermé', sched_everyday: 'Tous les jours',
    cart_title: 'Panier : {n} service(s)', cart_clear: 'Vider', cart_order: 'Passer la commande →', cart_remove: 'Supprimer', cart_subtotal: 'Sous-total', cart_delivery: 'Livraison', cart_total: 'Total', cart_empty: 'Le panier est vide', cab_chat: 'Chat', cab_logout: 'Se déconnecter', cab_cabinet: 'Compte', cart_address: 'Adresse de livraison', cart_addr_none: 'Ajouter une adresse dans le compte', cab_logout_confirm: 'Se déconnecter ? La prochaine connexion nécessitera un nouveau code par e-mail.',
    cart_added: '🛒 Dans le panier ({n})', cta_book: 'Prendre RDV', price_from_pfx:'dès', price_quote:'Prix sur demande', badge_hit:'Top', badge_new:'Nouveau', badge_promo:'Promo', chat_book_pfx:'Je souhaite réserver : {name}', ask_btn:'Poser une question', chat_ask_pfx:'Question sur : {name}', sub_btn:'S\'abonner', chat_sub_pfx:'Je souhaite m\'abonner : {name}', per_month:'/mois', per_year:'/an', look_note:'Mode aperçu de concepts — ce n’est PAS l’apparence réelle du site', look_colors:'Couleurs', look_designs:'Comportement', look_apply:'Choisir ce style', add_to_cart: '🛒 Ajouter au panier', reader_pdfprint: 'PDF / Impr.', reader_close: 'Fermer', reader_share: 'Partager', reader_copied: 'Copié', read_in_tab: 'Ouvrir dans un onglet', read_more: 'Lire la suite',
    privacy_title: 'Politique de confidentialité', privacy_subtitle: 'Veuillez lire notre politique de confidentialité avant de commander',
    privacy_agree: "J'ai lu et j'accepte la politique de confidentialité", privacy_decline: 'Refuser', privacy_continue: 'Continuer →',
    form_title: 'Passer la commande', form_subdomain: 'Sous-domaine souhaité', form_email: 'Votre Email',
    form_note: 'Remarque (facultative)', form_note_ph: 'Vos questions ou souhaits...',
    form_back: 'Retour', form_send_code: 'Recevoir le code →', form_sending: 'Envoi en cours...',
    form_err_email: 'Saisissez un email valide', form_err_subdomain: 'Saisissez le sous-domaine souhaité',
    form_err_subdomain_taken: 'Choisissez un sous-domaine disponible', form_err_subdomain_test: 'Le sous-domaine ne peut pas contenir "test"', form_err_connection: 'Erreur de connexion',
    verify_title: 'Confirmation email', verify_sent: 'Code envoyé à', verify_label: 'Code à 6 chiffres',
    verify_btn: 'Confirmer et passer la commande', verify_checking: 'Vérification...', site_paused: 'Site temporairement suspendu', site_paused_more: 'Plus d’informations sur {site}',
    verify_err: 'Saisissez le code à 6 chiffres', verify_err_wrong: 'Code incorrect',
    done_title: 'Commande acceptée !',
    // 📝 №3а: анкета «Свой сайт» (сайт нараджаецца напоўнены)
    intake_title: "À propos de votre activité",
    intake_hint: "Remplissez — et le site est à vous tout de suite. Vous pouvez passer et le faire plus tard dans le panneau.",
    intake_company: "Nom de l'entreprise",
    intake_company_ph: "Café «Grain»",
    intake_field: "Secteur d'activité",
    intake_field_ph: "Café et pâtisserie",
    intake_about: "Brève description",
    intake_about_ph: "1-2 phrases sur ce que vous faites",
    intake_phone: "Téléphone",
    intake_phone_ph: "+33 6 12 34 56 78",
    intake_address: "Adresse",
    intake_address_ph: "5 rue Principale, Paris",
    intake_offers: "Offres principales",
    intake_offers_hint: "Jusqu'à trois. Prix facultatif — sans lui, nous affichons «sur demande».",
    intake_offer_name: "Nom",
    intake_offer_price: "Prix",
    intake_skip: "Passer",
    intake_submit: "Terminé →",
    intake_saving: "Enregistrement…",
    done_subdomain: 'Merci ! Votre site <b style="color:#f97316">{domain}</b> est en cours de création.<br>Vous recevrez un email à <b style="color:#e8eaf0">{email}</b> quand il sera prêt.',
    done_regular: 'Merci ! Nous vous contacterons par email à <b style="color:#e8eaf0">{email}</b> sous peu.',
    done_close: 'Fermer',
    form_site_langs: 'Langues du site', form_site_langs_err: 'Sélectionnez au moins une langue',
    cart_added_ok: '✓ Ajouté!', form_err_send: 'Erreur.', form_err_conn: 'Erreur de connexion.', privacy_unavailable: 'Politique de confidentialité indisponible.',
    subdomain_invalid: 'Uniquement minuscules, chiffres et tirets. 3 à 30 caractères.',
    subdomain_free: '✅ {subdomain}.ttzop.com — disponible!', subdomain_check_err: 'Erreur de vérification',
  },
  es: {
    book_title: "Reservar: {name}", book_date: "Fecha", book_time: "Hora", book_loading: "Buscando horas libres…", book_none: "No hay horas libres ese día", book_confirm: "¿Reservar el {d} a las {t}?", book_done: "¡Listo! Cita el {d} a las {t}. Detalles en tu cuenta.", book_taken: "Esa hora acaba de ocuparse. Elige otra.", book_login: "Inicia sesión para reservar", book_err: "No se pudo. Inténtalo más tarde", book_seats: "Plazas:", book_full: "No quedan plazas — elija otra hora", grp_upto: "Grupo de hasta {n}", show_more:'Mostrar más', show_less:'Ocultar', view_toggle:'Tarjetas / Lista',
    hours_your_tz: 'en tu zona:', sched_dayoff: 'cerrado', sched_everyday: 'Todos los días',
    cart_title: 'Carrito: {n} servicio(s)', cart_clear: 'Vaciar', cart_order: 'Realizar pedido →', cart_remove: 'Eliminar', cart_subtotal: 'Subtotal', cart_delivery: 'Envío', cart_total: 'Total', cart_empty: 'El carrito está vacío', cab_chat: 'Chat', cab_logout: 'Cerrar sesión', cab_cabinet: 'Cuenta', cart_address: 'Dirección de entrega', cart_addr_none: 'Añadir dirección en tu cuenta', cab_logout_confirm: '¿Cerrar sesión? La próxima vez necesitarás un nuevo código por correo.',
    cart_added: '🛒 En el carrito ({n})', cta_book: 'Reservar', price_from_pfx:'desde', price_quote:'Precio a convenir', badge_hit:'Top', badge_new:'Nuevo', badge_promo:'Oferta', chat_book_pfx:'Quiero reservar: {name}', ask_btn:'Preguntar', chat_ask_pfx:'Pregunta sobre: {name}', sub_btn:'Suscribirse', chat_sub_pfx:'Quiero suscribirme: {name}', per_month:'/mes', per_year:'/año', look_note:'Modo de vista previa de conceptos — NO es el aspecto real del sitio', look_colors:'Colores', look_designs:'Comportamiento', look_apply:'Elegir esta variante', add_to_cart: '🛒 Añadir al carrito', reader_pdfprint: 'PDF / Imprimir', reader_close: 'Cerrar', reader_share: 'Compartir', reader_copied: 'Copiado', read_in_tab: 'Abrir en pestaña nueva', read_more: 'Leer más',
    privacy_title: 'Política de privacidad', privacy_subtitle: 'Por favor, lea nuestra política de privacidad antes de pedir',
    privacy_agree: 'He leído y acepto la política de privacidad', privacy_decline: 'Rechazar', privacy_continue: 'Continuar →',
    form_title: 'Realizar pedido', form_subdomain: 'Subdominio deseado', form_email: 'Tu Email',
    form_note: 'Nota (opcional)', form_note_ph: 'Tus preguntas o deseos...',
    form_back: 'Atrás', form_send_code: 'Obtener código →', form_sending: 'Enviando...',
    form_err_email: 'Introduce un email válido', form_err_subdomain: 'Introduce el subdominio deseado',
    form_err_subdomain_taken: 'Elige un subdominio disponible', form_err_subdomain_test: 'El subdominio no puede contener "test"', form_err_connection: 'Error de conexión',
    verify_title: 'Confirmación de email', verify_sent: 'Código enviado a', verify_label: 'Código de 6 dígitos',
    verify_btn: 'Confirmar y realizar pedido', verify_checking: 'Verificando...', site_paused: 'Sitio temporalmente pausado', site_paused_more: 'Más información en {site}',
    verify_err: 'Introduce el código de 6 dígitos', verify_err_wrong: 'Código incorrecto',
    done_title: '¡Pedido aceptado!',
    // 📝 №3а: анкета «Свой сайт» (сайт нараджаецца напоўнены)
    intake_title: "Sobre su negocio",
    intake_hint: "Complete y el sitio será suyo de inmediato. Puede omitir y hacerlo después en el panel.",
    intake_company: "Nombre de la empresa",
    intake_company_ph: "Cafetería «Grano»",
    intake_field: "Sector",
    intake_field_ph: "Café y repostería",
    intake_about: "Descripción breve",
    intake_about_ph: "1-2 frases sobre lo que hace",
    intake_phone: "Teléfono",
    intake_phone_ph: "+34 600 123 456",
    intake_address: "Dirección",
    intake_address_ph: "C/ Mayor 5, Madrid",
    intake_offers: "Ofertas principales",
    intake_offers_hint: "Hasta tres. El precio es opcional — sin él mostramos «a convenir».",
    intake_offer_name: "Nombre",
    intake_offer_price: "Precio",
    intake_skip: "Omitir",
    intake_submit: "Listo →",
    intake_saving: "Guardando…",
    done_subdomain: '¡Gracias! Tu sitio <b style="color:#f97316">{domain}</b> está siendo creado.<br>Recibirás un email en <b style="color:#e8eaf0">{email}</b> cuando esté listo.',
    done_regular: '¡Gracias! Nos pondremos en contacto contigo por email en <b style="color:#e8eaf0">{email}</b> en breve.',
    done_close: 'Cerrar',
    form_site_langs: 'Idiomas del sitio', form_site_langs_err: 'Seleccione al menos un idioma',
    cart_added_ok: '✓ Añadido!', form_err_send: 'Error.', form_err_conn: 'Error de conexión.', privacy_unavailable: 'Política de privacidad no disponible.',
    subdomain_invalid: 'Solo minúsculas, números y guiones. De 3 a 30 caracteres.',
    subdomain_free: '✅ {subdomain}.ttzop.com — disponible!', subdomain_check_err: 'Error de verificación',
  },
  it: {
    book_title: "Prenota: {name}", book_date: "Data", book_time: "Ora", book_loading: "Cerchiamo orari liberi…", book_none: "Nessun orario libero in questo giorno", book_confirm: "Prenotare il {d} alle {t}?", book_done: "Fatto! Appuntamento il {d} alle {t}. Dettagli nell'area clienti.", book_taken: "Questo orario è appena stato preso. Scegline un altro.", book_login: "Accedi all'area clienti per prenotare", book_err: "Non è riuscito. Riprova più tardi", book_seats: "Posti:", book_full: "Posti esauriti — scegli un altro orario", grp_upto: "Gruppo fino a {n}", show_more:'Mostra altro', show_less:'Nascondi', view_toggle:'Schede / Elenco',
    hours_your_tz: 'da te:', sched_dayoff: 'chiuso', sched_everyday: 'Ogni giorno',
    cart_title: 'Carrello: {n} servizio/i', cart_clear: 'Svuota', cart_order: 'Effettua ordine →', cart_remove: 'Rimuovi', cart_subtotal: 'Subtotale', cart_delivery: 'Consegna', cart_total: 'Totale', cart_empty: 'Il carrello è vuoto', cab_chat: 'Chat', cab_logout: 'Esci', cab_cabinet: 'Account', cart_address: 'Indirizzo di consegna', cart_addr_none: 'Aggiungi un indirizzo nel tuo account', cab_logout_confirm: 'Uscire? Al prossimo accesso servirà un nuovo codice via e-mail.',
    cart_added: '🛒 Nel carrello ({n})', cta_book: 'Prenota', price_from_pfx:'da', price_quote:'Prezzo su richiesta', badge_hit:'Top', badge_new:'Novità', badge_promo:'Offerta', chat_book_pfx:'Vorrei prenotare: {name}', ask_btn:'Chiedi', chat_ask_pfx:'Domanda su: {name}', sub_btn:'Abbonati', chat_sub_pfx:'Vorrei abbonarmi: {name}', per_month:'/mese', per_year:'/anno', look_note:'Anteprima dei concept — NON è l’aspetto reale del sito', look_colors:'Colori', look_designs:'Comportamento', look_apply:'Scegli questa variante', add_to_cart: '🛒 Aggiungi al carrello', reader_pdfprint: 'PDF / Stampa', reader_close: 'Chiudi', reader_share: 'Condividi', reader_copied: 'Copiato', read_in_tab: 'Apri in nuova scheda', read_more: 'Leggi tutto',
    privacy_title: 'Informativa sulla privacy', privacy_subtitle: 'Leggi la nostra informativa sulla privacy prima di ordinare',
    privacy_agree: "Ho letto e accetto l'informativa sulla privacy", privacy_decline: 'Rifiuta', privacy_continue: 'Continua →',
    form_title: 'Effettua ordine', form_subdomain: 'Sottodominio desiderato', form_email: 'La tua Email',
    form_note: 'Nota (facoltativa)', form_note_ph: 'Le tue domande o desideri...',
    form_back: 'Indietro', form_send_code: 'Ricevi codice →', form_sending: 'Invio in corso...',
    form_err_email: 'Inserisci un email valido', form_err_subdomain: 'Inserisci il sottodominio desiderato',
    form_err_subdomain_taken: 'Scegli un sottodominio disponibile', form_err_subdomain_test: 'Il sottodominio non può contenere "test"', form_err_connection: 'Errore di connessione',
    verify_title: 'Conferma email', verify_sent: 'Codice inviato a', verify_label: 'Codice a 6 cifre',
    verify_btn: 'Conferma e invia ordine', verify_checking: 'Verifica...', site_paused: 'Sito temporaneamente sospeso', site_paused_more: 'Maggiori informazioni su {site}',
    verify_err: 'Inserisci il codice a 6 cifre', verify_err_wrong: 'Codice errato',
    done_title: 'Ordine accettato!',
    // 📝 №3а: анкета «Свой сайт» (сайт нараджаецца напоўнены)
    intake_title: "Sulla tua attività",
    intake_hint: "Compila e il sito sarà subito tuo. Puoi saltare e farlo dopo nel pannello.",
    intake_company: "Nome dell'azienda",
    intake_company_ph: "Caffè «Chicco»",
    intake_field: "Settore",
    intake_field_ph: "Caffè e pasticceria",
    intake_about: "Breve descrizione",
    intake_about_ph: "1-2 frasi su cosa fai",
    intake_phone: "Telefono",
    intake_phone_ph: "+39 320 1234567",
    intake_address: "Indirizzo",
    intake_address_ph: "Via Roma 5, Milano",
    intake_offers: "Offerte principali",
    intake_offers_hint: "Fino a tre. Il prezzo è facoltativo — senza mostriamo «su richiesta».",
    intake_offer_name: "Nome",
    intake_offer_price: "Prezzo",
    intake_skip: "Salta",
    intake_submit: "Fatto →",
    intake_saving: "Salvataggio…",
    done_subdomain: "Grazie! Il tuo sito <b style=\"color:#f97316\">{domain}</b> è in creazione.<br>Riceverai un'email all'indirizzo <b style=\"color:#e8eaf0\">{email}</b> quando sarà pronto.",
    done_regular: 'Grazie! Ti contatteremo per email a <b style="color:#e8eaf0">{email}</b> a breve.',
    done_close: 'Chiudi',
    form_site_langs: 'Lingue del sito', form_site_langs_err: 'Seleziona almeno una lingua',
    cart_added_ok: '✓ Aggiunto!', form_err_send: 'Errore.', form_err_conn: 'Errore di connessione.', privacy_unavailable: 'Informativa sulla privacy non disponibile.',
    subdomain_invalid: 'Solo lettere minuscole, numeri e trattini. Da 3 a 30 caratteri.',
    subdomain_free: '✅ {subdomain}.ttzop.com — disponibile!', subdomain_check_err: 'Errore di verifica',
  },
  pt: {
    book_title: "Marcar: {name}", book_date: "Data", book_time: "Hora", book_loading: "A procurar horários livres…", book_none: "Não há horários livres neste dia", book_confirm: "Marcar {d} às {t}?", book_done: "Pronto! Marcação em {d} às {t}. Detalhes na sua conta.", book_taken: "Esse horário acabou de ser ocupado. Escolha outro.", book_login: "Entre na sua conta para marcar", book_err: "Não foi possível. Tente mais tarde", book_seats: "Lugares:", book_full: "Sem lugares — escolha outro horário", grp_upto: "Grupo até {n}", show_more:'Mostrar mais', show_less:'Ocultar', view_toggle:'Cartões / Lista',
    hours_your_tz: 'no seu fuso:', sched_dayoff: 'fechado', sched_everyday: 'Todos os dias',
    cart_title: 'Carrinho: {n} serviço(s)', cart_clear: 'Limpar', cart_order: 'Fazer pedido →', cart_remove: 'Remover', cart_subtotal: 'Subtotal', cart_delivery: 'Entrega', cart_total: 'Total', cart_empty: 'O carrinho está vazio', cab_chat: 'Chat', cab_logout: 'Sair', cab_cabinet: 'Conta', cart_address: 'Endereço de entrega', cart_addr_none: 'Adicionar endereço na sua conta', cab_logout_confirm: 'Sair? No próximo acesso será necessário um novo código por e-mail.',
    cart_added: '🛒 No carrinho ({n})', cta_book: 'Agendar', price_from_pfx:'desde', price_quote:'Preço sob consulta', badge_hit:'Top', badge_new:'Novo', badge_promo:'Promoção', chat_book_pfx:'Quero agendar: {name}', ask_btn:'Perguntar', chat_ask_pfx:'Pergunta sobre: {name}', sub_btn:'Subscrever', chat_sub_pfx:'Quero subscrever: {name}', per_month:'/mês', per_year:'/ano', look_note:'Modo de pré-visualização — NÃO é a aparência real do site', look_colors:'Cores', look_designs:'Comportamento', look_apply:'Escolher esta variante', add_to_cart: '🛒 Adicionar ao carrinho', reader_pdfprint: 'PDF / Imprimir', reader_close: 'Fechar', reader_share: 'Partilhar', reader_copied: 'Copiado', read_in_tab: 'Abrir em novo separador', read_more: 'Ler mais',
    privacy_title: 'Política de privacidade', privacy_subtitle: 'Por favor, leia nossa política de privacidade antes de pedir',
    privacy_agree: 'Li e concordo com a política de privacidade', privacy_decline: 'Recusar', privacy_continue: 'Continuar →',
    form_title: 'Fazer pedido', form_subdomain: 'Subdomínio desejado', form_email: 'Seu Email',
    form_note: 'Nota (opcional)', form_note_ph: 'Suas perguntas ou desejos...',
    form_back: 'Voltar', form_send_code: 'Obter código →', form_sending: 'Enviando...',
    form_err_email: 'Insira um email válido', form_err_subdomain: 'Insira o subdomínio desejado',
    form_err_subdomain_taken: 'Escolha um subdomínio disponível', form_err_subdomain_test: 'O subdomínio não pode conter "test"', form_err_connection: 'Erro de conexão',
    verify_title: 'Confirmação de email', verify_sent: 'Código enviado para', verify_label: 'Código de 6 dígitos',
    verify_btn: 'Confirmar e fazer pedido', verify_checking: 'Verificando...', site_paused: 'Site temporariamente pausado', site_paused_more: 'Mais informações em {site}',
    verify_err: 'Insira o código de 6 dígitos', verify_err_wrong: 'Código incorreto',
    done_title: 'Pedido aceito!',
    // 📝 №3а: анкета «Свой сайт» (сайт нараджаецца напоўнены)
    intake_title: "Sobre o seu negócio",
    intake_hint: "Preencha — e o site será seu imediatamente. Pode ignorar e fazer depois no painel.",
    intake_company: "Nome da empresa",
    intake_company_ph: "Cafeteria «Grão»",
    intake_field: "Área de atuação",
    intake_field_ph: "Café e pastelaria",
    intake_about: "Breve descrição",
    intake_about_ph: "1-2 frases sobre o que faz",
    intake_phone: "Telefone",
    intake_phone_ph: "+351 912 345 678",
    intake_address: "Endereço",
    intake_address_ph: "Rua Principal 5, Lisboa",
    intake_offers: "Principais ofertas",
    intake_offers_hint: "Até três. O preço é opcional — sem ele mostramos «sob consulta».",
    intake_offer_name: "Nome",
    intake_offer_price: "Preço",
    intake_skip: "Ignorar",
    intake_submit: "Concluído →",
    intake_saving: "A guardar…",
    done_subdomain: 'Obrigado! Seu site <b style="color:#f97316">{domain}</b> está sendo criado.<br>Você receberá um email em <b style="color:#e8eaf0">{email}</b> quando estiver pronto.',
    done_regular: 'Obrigado! Entraremos em contato por email em <b style="color:#e8eaf0">{email}</b> em breve.',
    done_close: 'Fechar',
    form_site_langs: 'Idiomas do site', form_site_langs_err: 'Selecione pelo menos um idioma',
    cart_added_ok: '✓ Adicionado!', form_err_send: 'Erro.', form_err_conn: 'Erro de conexão.', privacy_unavailable: 'Política de privacidade indisponível.',
    subdomain_invalid: 'Apenas letras minúsculas, números e hífens. De 3 a 30 caracteres.',
    subdomain_free: '✅ {subdomain}.ttzop.com — disponível!', subdomain_check_err: 'Erro de verificação',
  },
  zh: {
    book_title: "预约：{name}", book_date: "日期", book_time: "时间", book_loading: "正在查找空闲时间…", book_none: "当天没有空闲时间", book_confirm: "预约 {d} {t}？", book_done: "完成！已为您预约 {d} {t}。详情请见客户中心。", book_taken: "该时段刚被占用，请另选一个。", book_login: "请先登录客户中心再预约", book_err: "操作失败，请稍后再试", book_seats: "人数：", book_full: "名额已满 — 请选择其他时间", grp_upto: "团体最多 {n} 人", show_more:'显示更多', show_less:'收起', view_toggle:'卡片 / 列表',
    hours_your_tz: '您的时间：', sched_dayoff: '休息', sched_everyday: '每天',
    cart_title: '购物车：{n} 项服务', cart_clear: '清空', cart_order: '下单 →', cart_remove: '删除', cart_subtotal: '小计', cart_delivery: '配送', cart_total: '合计', cart_empty: '购物车为空', cab_chat: '聊天', cab_logout: '退出', cab_cabinet: '我的账户', cart_address: '配送地址', cart_addr_none: '在账户中添加地址', cab_logout_confirm: '确定退出吗？下次登录需要新的邮箱验证码。',
    cart_added: '🛒 已加入购物车（{n}）', cta_book: '立即预约', price_from_pfx:'低至', price_quote:'价格面议', badge_hit:'热门', badge_new:'新品', badge_promo:'促销', chat_book_pfx:'我想预约：{name}', ask_btn:'咨询', chat_ask_pfx:'咨询：{name}', sub_btn:'订阅', chat_sub_pfx:'我想订阅：{name}', per_month:'/月', per_year:'/年', look_note:'概念预览模式 — 这不是网站的真实外观', look_colors:'颜色', look_designs:'行为', look_apply:'选择此方案', add_to_cart: '🛒 加入购物车', reader_pdfprint: 'PDF / 打印', reader_close: '关闭', reader_share: '分享', reader_copied: '已复制', read_in_tab: '在新标签页打开', read_more: '阅读更多',
    privacy_title: '隐私政策', privacy_subtitle: '下单前请阅读我们的隐私政策',
    privacy_agree: '我已阅读并同意隐私政策', privacy_decline: '拒绝', privacy_continue: '继续 →',
    form_title: '下单', form_subdomain: '所需子域名', form_email: '您的邮箱',
    form_note: '备注（可选）', form_note_ph: '您的问题或意愿...',
    form_back: '返回', form_send_code: '获取验证码 →', form_sending: '发送中...',
    form_err_email: '请输入有效的邮箱地址', form_err_subdomain: '请输入所需的子域名',
    form_err_subdomain_taken: '请选择可用的子域名', form_err_subdomain_test: '子域名不能包含"test"', form_err_connection: '连接错误',
    verify_title: '邮箱验证', verify_sent: '验证码已发送至', verify_label: '6位验证码',
    verify_btn: '确认并提交订单', verify_checking: '验证中...', site_paused: '网站暂时暂停', site_paused_more: '更多信息请访问 {site}',
    verify_err: '请输入6位验证码', verify_err_wrong: '验证码错误',
    done_title: '订单已受理！',
    // 📝 №3а: анкета «Свой сайт» (сайт нараджаецца напоўнены)
    intake_title: "关于您的业务",
    intake_hint: "填写后，网站立即属于您。也可以跳过，稍后在面板中填写。",
    intake_company: "公司名称",
    intake_company_ph: "「谷粒」咖啡馆",
    intake_field: "经营领域",
    intake_field_ph: "咖啡与烘焙",
    intake_about: "简短描述",
    intake_about_ph: "用1-2句话介绍您的业务",
    intake_phone: "电话",
    intake_phone_ph: "+86 138 0013 8000",
    intake_address: "地址",
    intake_address_ph: "北京市朝阳区主街5号",
    intake_offers: "主要服务",
    intake_offers_hint: "最多三项。价格可选 — 不填则显示「面议」。",
    intake_offer_name: "名称",
    intake_offer_price: "价格",
    intake_skip: "跳过",
    intake_submit: "完成 →",
    intake_saving: "保存中…",
    done_subdomain: '感谢！您的网站 <b style="color:#f97316">{domain}</b> 正在创建中。<br>准备好后，我们将发送邮件至 <b style="color:#e8eaf0">{email}</b>。',
    done_regular: '感谢！我们将尽快通过邮箱 <b style="color:#e8eaf0">{email}</b> 与您联系。',
    done_close: '关闭',
    form_site_langs: '网站语言', form_site_langs_err: '请至少选择一种语言',
    cart_added_ok: '✓ 已添加！', form_err_send: '错误。', form_err_conn: '连接错误。', privacy_unavailable: '隐私政策不可用。',
    subdomain_invalid: '只能使用小写字母、数字和连字符。3至30个字符。',
    subdomain_free: '✅ {subdomain}.ttzop.com — 可用！', subdomain_check_err: '检查错误',
  },
  ar: {
    book_title: "حجز: {name}", book_date: "التاريخ", book_time: "الوقت", book_loading: "جارٍ البحث عن أوقات متاحة…", book_none: "لا توجد أوقات متاحة في هذا اليوم", book_confirm: "الحجز في {d} الساعة {t}؟", book_done: "تم! حجزك في {d} الساعة {t}. التفاصيل في حسابك.", book_taken: "تم حجز هذا الوقت للتو. اختر وقتًا آخر.", book_login: "سجّل الدخول إلى حسابك للحجز", book_err: "لم ينجح. حاول لاحقًا", book_seats: "عدد الأماكن:", book_full: "لا أماكن متبقية — اختر وقتاً آخر", grp_upto: "مجموعة حتى {n}", show_more:'عرض المزيد', show_less:'إخفاء', view_toggle:'بطاقات / قائمة',
    hours_your_tz: 'بتوقيتك:', sched_dayoff: 'إجازة', sched_everyday: 'كل يوم',
    cart_title: 'السلة: {n} خدمة', cart_clear: 'إفراغ', cart_order: '← تقديم الطلب', cart_remove: 'حذف', cart_subtotal: 'المجموع الفرعي', cart_delivery: 'التوصيل', cart_total: 'الإجمالي', cart_empty: 'السلة فارغة', cab_chat: 'الدردشة', cab_logout: 'خروج', cab_cabinet: 'حسابي', cart_address: 'عنوان التوصيل', cart_addr_none: 'أضف عنوانًا في حسابك', cab_logout_confirm: 'تسجيل الخروج؟ ستحتاج إلى رمز بريد إلكتروني جديد للدخول مرة أخرى.',
    cart_added: '({n}) 🛒 في السلة', cta_book: 'احجز الآن', price_from_pfx:'ابتداءً من', price_quote:'السعر عند الطلب', badge_hit:'الأكثر طلباً', badge_new:'جديد', badge_promo:'عرض', chat_book_pfx:'أرغب في الحجز: {name}', ask_btn:'اسأل', chat_ask_pfx:'سؤال عن: {name}', sub_btn:'اشترك', chat_sub_pfx:'أرغب في الاشتراك: {name}', per_month:'/شهر', per_year:'/سنة', look_note:'وضع معاينة المفاهيم — هذا ليس المظهر الحقيقي للموقع', look_colors:'الألوان', look_designs:'السلوك', look_apply:'اختيار هذا الشكل', add_to_cart: '🛒 أضف إلى السلة', reader_pdfprint: 'PDF / طباعة', reader_close: 'إغلاق', reader_share: 'مشاركة', reader_copied: 'تم النسخ', read_in_tab: 'فتح في تبويب جديد', read_more: 'اقرأ المزيد',
    privacy_title: 'سياسة الخصوصية', privacy_subtitle: 'يرجى قراءة سياسة الخصوصية قبل الطلب',
    privacy_agree: 'لقد قرأت وأوافق على سياسة الخصوصية', privacy_decline: 'رفض', privacy_continue: '← متابعة',
    form_title: 'تقديم الطلب', form_subdomain: 'النطاق الفرعي المطلوب', form_email: 'بريدك الإلكتروني',
    form_note: 'ملاحظة (اختياري)', form_note_ph: 'أسئلتك أو رغباتك...',
    form_back: 'رجوع', form_send_code: '← الحصول على الرمز', form_sending: 'جارٍ الإرسال...',
    form_err_email: 'أدخل بريداً إلكترونياً صحيحاً', form_err_subdomain: 'أدخل النطاق الفرعي المطلوب',
    form_err_subdomain_taken: 'اختر نطاقاً فرعياً متاحاً', form_err_subdomain_test: 'النطاق الفرعي لا يمكن أن يحتوي على "test"', form_err_connection: 'خطأ في الاتصال',
    verify_title: 'تأكيد البريد الإلكتروني', verify_sent: 'تم إرسال الرمز إلى', verify_label: 'رمز من 6 أرقام',
    verify_btn: 'تأكيد وإرسال الطلب', verify_checking: 'جارٍ التحقق...', site_paused: 'الموقع متوقف مؤقتًا', site_paused_more: 'مزيد من المعلومات على {site}',
    verify_err: 'أدخل الرمز المكون من 6 أرقام', verify_err_wrong: 'رمز غير صحيح',
    done_title: 'تم قبول الطلب!',
    // 📝 №3а: анкета «Свой сайт» (сайт нараджаецца напоўнены)
    intake_title: "عن عملك",
    intake_hint: "املأ البيانات — وسيصبح الموقع لك فوراً. يمكنك التخطي والقيام بذلك لاحقاً في اللوحة.",
    intake_company: "اسم الشركة",
    intake_company_ph: "مقهى «الحبة»",
    intake_field: "مجال العمل",
    intake_field_ph: "القهوة والمخبوزات",
    intake_about: "وصف مختصر",
    intake_about_ph: "جملة أو جملتان عما تقوم به",
    intake_phone: "الهاتف",
    intake_phone_ph: "+971 50 123 4567",
    intake_address: "العنوان",
    intake_address_ph: "شارع الرئيسي 5، دبي",
    intake_offers: "العروض الرئيسية",
    intake_offers_hint: "حتى ثلاثة. السعر اختياري — بدونه سنعرض «حسب الطلب».",
    intake_offer_name: "الاسم",
    intake_offer_price: "السعر",
    intake_skip: "تخطي",
    intake_submit: "تم ←",
    intake_saving: "جارٍ الحفظ…",
    done_subdomain: 'شكراً! موقعك <b style="color:#f97316">{domain}</b> قيد الإنشاء.<br>ستتلقى بريداً إلكترونياً على <b style="color:#e8eaf0">{email}</b> عندما يكون جاهزاً.',
    done_regular: 'شكراً! سنتواصل معك على البريد الإلكتروني <b style="color:#e8eaf0">{email}</b> قريباً.',
    done_close: 'إغلاق',
    form_site_langs: 'لغات الموقع', form_site_langs_err: 'اختر لغة واحدة على الأقل',
    cart_added_ok: '✓ تمت الإضافة!', form_err_send: 'خطأ.', form_err_conn: 'خطأ في الاتصال.', privacy_unavailable: 'سياسة الخصوصية غير متاحة.',
    subdomain_invalid: 'أحرف صغيرة وأرقام وشرطات فقط. من 3 إلى 30 حرفاً.',
    subdomain_free: '✅ {subdomain}.ttzop.com — متاح!', subdomain_check_err: 'خطأ في التحقق',
  },
  hu: {
    book_title: "Időpont: {name}", book_date: "Dátum", book_time: "Időpont", book_loading: "Szabad időpontok keresése…", book_none: "Ezen a napon nincs szabad időpont", book_confirm: "Lefoglalja: {d} {t}?", book_done: "Kész! Időpontja: {d} {t}. Részletek a fiókjában.", book_taken: "Ezt az időpontot épp lefoglalták. Válasszon másikat.", book_login: "A foglaláshoz jelentkezzen be a fiókjába", book_err: "Nem sikerült. Próbálja később", book_seats: "Helyek:", book_full: "Nincs több hely — válasszon másik időpontot", grp_upto: "Csoport max. {n} fő", show_more:'Továbbiak', show_less:'Elrejtés', view_toggle:'Kártyák / Lista',
    hours_your_tz: 'nálad:', sched_dayoff: 'zárva', sched_everyday: 'Minden nap',
    cart_title: 'Kosár: {n} szolgáltatás', cart_clear: 'Ürítés', cart_order: 'Rendelés leadása →', cart_remove: 'Törlés', cart_subtotal: 'Részösszeg', cart_delivery: 'Szállítás', cart_total: 'Összesen', cart_empty: 'A kosár üres', cab_chat: 'Csevegés', cab_logout: 'Kijelentkezés', cab_cabinet: 'Fiók', cart_address: 'Szállítási cím', cart_addr_none: 'Adj hozzá címet a fiókban', cab_logout_confirm: 'Kijelentkezik? A következő belépéshez új e-mail kód szükséges.',
    cart_added: '🛒 Kosárban ({n})', cta_book: 'Időpontfoglalás', price_from_pfx:'már', price_quote:'Ár megegyezés szerint', badge_hit:'Sláger', badge_new:'Új', badge_promo:'Akció', chat_book_pfx:'Időpontot szeretnék foglalni: {name}', ask_btn:'Kérdezek', chat_ask_pfx:'Kérdés erről: {name}', sub_btn:'Előfizetés', chat_sub_pfx:'Elő szeretnék fizetni: {name}', per_month:'/hó', per_year:'/év', look_note:'Koncepció-előnézet — ez NEM a webhely valódi kinézete', look_colors:'Színek', look_designs:'Viselkedés', look_apply:'Ezt választom', add_to_cart: '🛒 Kosárba', reader_pdfprint: 'PDF / Nyomt.', reader_close: 'Bezárás', reader_share: 'Megosztás', reader_copied: 'Másolva', read_in_tab: 'Megnyitás új lapon', read_more: 'Tovább olvasom',
    privacy_title: 'Adatvédelmi irányelvek', privacy_subtitle: 'Kérjük, olvassa el adatvédelmi irányelveinket rendelés előtt',
    privacy_agree: 'Elolvastam és elfogadom az adatvédelmi irányelveket', privacy_decline: 'Elutasítás', privacy_continue: 'Folytatás →',
    form_title: 'Rendelés leadása', form_subdomain: 'Kívánt aldomain', form_email: 'Az Ön e-mail-je',
    form_note: 'Megjegyzés (nem kötelező)', form_note_ph: 'Kérdései vagy kívánságai...',
    form_back: 'Vissza', form_send_code: 'Kód kérése →', form_sending: 'Küldés folyamatban...',
    form_err_email: 'Adjon meg érvényes e-mail-t', form_err_subdomain: 'Adja meg a kívánt aldomaint',
    form_err_subdomain_taken: 'Válasszon szabad aldomaint', form_err_subdomain_test: 'Az aldomén nem tartalmazhatja a "test" szót', form_err_connection: 'Kapcsolódási hiba',
    verify_title: 'E-mail megerősítés', verify_sent: 'Kód elküldve ide:', verify_label: '6 jegyű kód',
    verify_btn: 'Megerősítés és rendelés leadása', verify_checking: 'Ellenőrzés...', site_paused: 'A webhely átmenetileg szünetel', site_paused_more: 'További információ: {site}',
    verify_err: 'Adja meg a 6 jegyű kódot', verify_err_wrong: 'Hibás kód',
    done_title: 'Rendelés elfogadva!',
    // 📝 №3а: анкета «Свой сайт» (сайт нараджаецца напоўнены)
    intake_title: "Az Ön vállalkozásáról",
    intake_hint: "Töltse ki — és az oldal azonnal az Öné. Kihagyhatja, és később megteheti a panelen.",
    intake_company: "Cégnév",
    intake_company_ph: "«Szem» Kávézó",
    intake_field: "Tevékenységi kör",
    intake_field_ph: "Kávé és pékáru",
    intake_about: "Rövid leírás",
    intake_about_ph: "1-2 mondat arról, mivel foglalkozik",
    intake_phone: "Telefon",
    intake_phone_ph: "+36 30 123 4567",
    intake_address: "Cím",
    intake_address_ph: "Fő utca 5, Budapest",
    intake_offers: "Fő ajánlatok",
    intake_offers_hint: "Legfeljebb három. Az ár nem kötelező — nélküle «megegyezés szerint» jelenik meg.",
    intake_offer_name: "Név",
    intake_offer_price: "Ár",
    intake_skip: "Kihagyás",
    intake_submit: "Kész →",
    intake_saving: "Mentés…",
    done_subdomain: 'Köszönjük! A(z) <b style="color:#f97316">{domain}</b> weboldala létrehozás alatt áll.<br>Értesítjük e-mailben a(z) <b style="color:#e8eaf0">{email}</b> címen, amikor elkészül.',
    done_regular: 'Köszönjük! Hamarosan felvesszük Önnel a kapcsolatot a(z) <b style="color:#e8eaf0">{email}</b> e-mail-cíemen.',
    done_close: 'Bezárás',
    form_site_langs: 'Weboldal nyelvei', form_site_langs_err: 'Válasszon legalább egy nyelvet',
    cart_added_ok: '✓ Hozzáadva!', form_err_send: 'Hiba.', form_err_conn: 'Kapcsolódási hiba.', privacy_unavailable: 'Az adatvédelmi irányelvek nem elérhetők.',
    subdomain_invalid: 'Csak kisbetűk, számok és kötőjelek. 3–30 karakter.',
    subdomain_free: '✅ {subdomain}.ttzop.com — szabad!', subdomain_check_err: 'Ellenőrzési hiba',
  },
};
// 🖊️ Фаза D: падказка, калі оверлэй-рэдактар не бачыць адкрытай панэлі (post-merge — без праўкі 13 мега-радкоў)
;(() => { const M = { be:'Адкрыйце панэль кіравання, каб рэдагаваць', en:'Open the admin panel to edit', uk:'Відкрийте панель керування, щоб редагувати', ru:'Откройте панель управления, чтобы редактировать', pl:'Otwórz panel, aby edytować', de:'Öffnen Sie das Panel zum Bearbeiten', fr:'Ouvrez le panneau pour modifier', es:'Abre el panel para editar', it:'Apri il pannello per modificare', pt:'Abra o painel para editar', zh:'打开管理面板进行编辑', ar:'افتح لوحة التحكم للتعديل', hu:'Nyissa meg a panelt a szerkesztéshez' }; Object.keys(M).forEach(l => { if (UI_T[l]) UI_T[l].look_edit_nopanel = M[l]; }); })();
// 🖊️ слайс A: плейсхолдэры пустога загалоўка/падзагалоўка + падказка аўта-захавання ў edit-рэжыме
;(() => { const T = { be:['Загаловак','Падзагаловак','Тэкст…','Дата','Захаваць'], en:['Heading','Subheading','Text…','Date','Save'], uk:['Заголовок','Підзаголовок','Текст…','Дата','Зберегти'], ru:['Заголовок','Подзаголовок','Текст…','Дата','Сохранить'], pl:['Nagłówek','Podtytuł','Tekst…','Data','Zapisz'], de:['Überschrift','Untertitel','Text…','Datum','Speichern'], fr:['Titre','Sous-titre','Texte…','Date','Enregistrer'], es:['Título','Subtítulo','Texto…','Fecha','Guardar'], it:['Titolo','Sottotitolo','Testo…','Data','Salva'], pt:['Título','Subtítulo','Texto…','Data','Guardar'], zh:['标题','副标题','文本…','日期','保存'], ar:['العنوان','العنوان الفرعي','نص…','التاريخ','حفظ'], hu:['Címsor','Alcím','Szöveg…','Dátum','Mentés'] }; Object.keys(T).forEach(l => { if (UI_T[l]) { UI_T[l].ed_title = T[l][0]; UI_T[l].ed_subtitle = T[l][1]; UI_T[l].ed_body = T[l][2]; UI_T[l].ed_date = T[l][3]; UI_T[l].ed_save = T[l][4]; } }); })();
;(() => { const M = { be:'Згарнуць / разгарнуць панэль', en:'Collapse / expand panel', uk:'Згорнути / розгорнути панель', ru:'Свернуть / развернуть панель', pl:'Zwiń / rozwiń panel', de:'Panel ein-/ausklappen', fr:'Réduire / agrandir le panneau', es:'Contraer / expandir panel', it:'Comprimi / espandi pannello', pt:'Recolher / expandir painel', zh:'折叠 / 展开面板', ar:'طيّ / توسيع اللوحة', hu:'Panel össze-/kinyitása' }; Object.keys(M).forEach(l => { if (UI_T[l]) UI_T[l].look_min = M[l]; }); })();
;(() => { const A = { be:'✎ Клікні на тэкст — праўкі захоўваюцца аўтаматычна', en:'✎ Click text — edits save automatically', uk:'✎ Клікни на текст — зміни зберігаються автоматично', ru:'✎ Кликни на текст — правки сохраняются автоматически', pl:'✎ Kliknij tekst — zmiany zapisują się automatycznie', de:'✎ Text anklicken — Änderungen speichern automatisch', fr:'✎ Cliquez sur le texte — enregistrement automatique', es:'✎ Haz clic en el texto — se guarda automáticamente', it:'✎ Clicca sul testo — salvataggio automatico', pt:'✎ Clica no texto — guarda automaticamente', zh:'✎ 点击文字 — 自动保存', ar:'✎ انقر على النص — يُحفظ تلقائيًا', hu:'✎ Kattints a szövegre — automatikusan mentődik' }; Object.keys(A).forEach(l => { if (UI_T[l]) UI_T[l].ed_autosave = A[l]; }); })();
// #1: look_note цяпер праўдзівы — прэв'ю паказвае РЭАЛЬНЫ чарнавік (Фаза A/D), а не «канцэпт» (post-merge перакрывае стары інлайн)
;(() => { const M = { be:'Прэв\'ю чарнавіка — так убачаць наведвальнікі пасля публікацыі', en:'Draft preview — this is how visitors will see it after publishing', uk:'Перегляд чернетки — так побачать відвідувачі після публікації', ru:'Просмотр черновика — так увидят посетители после публикации', pl:'Podgląd wersji roboczej — tak zobaczą to odwiedzający po opublikowaniu', de:'Entwurfsvorschau — so sehen es Besucher nach der Veröffentlichung', fr:'Aperçu du brouillon — voici ce que verront les visiteurs après publication', es:'Vista previa del borrador: así lo verán los visitantes tras publicar', it:'Anteprima della bozza: così la vedranno i visitatori dopo la pubblicazione', pt:'Pré-visualização do rascunho — é assim que os visitantes verão após publicar', zh:'草稿预览 — 发布后访客将看到此效果', ar:'معاينة المسودة — هكذا سيراها الزوار بعد النشر', hu:'Piszkozat előnézete — így látják a látogatók a közzététel után' }; Object.keys(M).forEach(l => { if (UI_T[l]) UI_T[l].look_note = M[l]; }); })();
function getUI() { return UI_T[currentUiLang] || UI_T.be; }

function getPrimaryLang(data) {
  const langs = data.languages || [];
  const p = data.primaryLang;
  return (p && langs.some(l => l.code === p)) ? p : (langs[0]?.code || 'be');
}

// ── #3: гадзіны працы ў часавым поясе ГОСЦЯ (калі пояс філіяла зададзены і адрозніваецца) ──
function _escHtml(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
// універсальна: стварыць/абнавіць favicon браўзера з іконкі кампаніі (пусты url → не чапаем)
function _setFavicon(url) { // WebP-favicon Safari ігнаруе → канвертуем у PNG праз canvas (CORS на media адкрыты)
  if (!url) return;
  const img = new Image(); img.crossOrigin = 'anonymous';
  img.onload = () => {
    try {
      const c = document.createElement('canvas'); c.width = c.height = 64;
      const s = Math.min(img.width, img.height); // цэнтр-кроп у квадрат
      c.getContext('2d').drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, 64, 64);
      let l = document.querySelector('link[rel="icon"]');
      if (!l) { l = document.createElement('link'); l.rel = 'icon'; document.head.appendChild(l); }
      l.type = 'image/png'; l.href = c.toDataURL('image/png');
    } catch {} // tainted canvas (нечаканы CORS) — застаемся без favicon, не валімся
  };
  img.src = url;
}
function _siteViewerTz() { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch { return ''; } }
function _siteTzOffMin(tz, date) { try { const p = {}; new Intl.DateTimeFormat('en-US', { timeZone: tz, hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).formatToParts(date).forEach(x => p[x.type] = x.value); const u = Date.UTC(+p.year, +p.month - 1, +p.day, p.hour === '24' ? 0 : +p.hour, +p.minute, +p.second); return Math.round((u - date.getTime()) / 60000); } catch { return null; } }
function _siteConvHHMM(hhmm, iso, fromTz, toTz) { const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm || ''); if (!m) return null; const [Y, Mo, D] = iso.split('-').map(Number); const guess = Date.UTC(Y, Mo - 1, D, +m[1], +m[2]); const fo = _siteTzOffMin(fromTz, new Date(guess)); if (fo == null) return null; const inst = guess - fo * 60000; const to = _siteTzOffMin(toTz, new Date(inst)); if (to == null) return null; const dt = new Date(inst + to * 60000); const hh = String(dt.getUTCHours()).padStart(2, '0'), mm = String(dt.getUTCMinutes()).padStart(2, '0'); const shift = Math.round((Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate()) - Date.UTC(Y, Mo - 1, D)) / 86400000); return { time: `${hh}:${mm}`, shift }; }
function _siteRowDays(r) { if (Array.isArray(r.days)) return r.days.map(String); if (r.day && r.day !== '*') return [String(r.day)]; return []; }
function _siteRefIso(dow) { const now = new Date(); const cur = ((now.getDay() + 6) % 7) + 1; const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (dow - cur)); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
// сыры графік (rows {days,from,to}) у поясе fromTz → тэкст у поясе toTz (тыднёвая праекцыя з улікам зруху дня пры канверсіі)
function _siteHoursInTz(rows, fromTz, toTz, langCode) {
  if (!Array.isArray(rows) || !rows.length || !fromTz || !toTz) return '';
  let wf; try { wf = new Intl.DateTimeFormat(langCode || 'en', { weekday: 'short' }); } catch { wf = new Intl.DateTimeFormat('en', { weekday: 'short' }); }
  const dayName = d => { const nm = wf.format(new Date(2024, 0, +d)); return nm.charAt(0).toUpperCase() + nm.slice(1); };
  const ivByDay = {}, offDays = {}, everyIv = [];
  rows.forEach(r => { const ds = _siteRowDays(r);
    if (r.from && r.to) {
      if (!ds.length) { const iso = _siteRefIso(((new Date().getDay() + 6) % 7) + 1); const a = _siteConvHHMM(r.from, iso, fromTz, toTz), b = _siteConvHHMM(r.to, iso, fromTz, toTz); if (a && b) everyIv.push(`${a.time}–${b.time}${b.shift > a.shift ? ` +${b.shift - a.shift}` : ''}`); }
      else ds.forEach(d => { const iso = _siteRefIso(+d); const a = _siteConvHHMM(r.from, iso, fromTz, toTz), b = _siteConvHHMM(r.to, iso, fromTz, toTz); if (!a || !b) return; const nd = ((+d - 1 + a.shift + 7) % 7) + 1; (ivByDay[nd] = ivByDay[nd] || []).push(`${a.time}–${b.time}${b.shift > a.shift ? ` +${b.shift - a.shift}` : ''}`); }); // зрух дня пры канверсіі; +N пры начной змене
    } else if (ds.length) ds.forEach(d => { offDays[+d] = true; });
  });
  const byDay = {};
  Object.keys(ivByDay).forEach(d => { byDay[+d] = ivByDay[d].slice().sort().join(', '); });
  Object.keys(offDays).forEach(d => { if (byDay[+d] === undefined) byDay[+d] = null; });
  const every = everyIv.length ? everyIv.slice().sort().join(', ') : null;
  const keys = Object.keys(byDay); if (!keys.length) return every || '';
  const days = keys.map(Number).sort((a, b) => a - b);
  const ui = getUI(); const lblOf = v => v === null ? ui.sched_dayoff : v;
  const parts = []; let i = 0;
  while (i < days.length) { let j = i; while (j + 1 < days.length && days[j + 1] === days[j] + 1 && byDay[days[j + 1]] === byDay[days[i]]) j++;
    parts.push(`${i === j ? dayName(days[i]) : dayName(days[i]) + '–' + dayName(days[j])} ${lblOf(byDay[days[i]])}`); i = j + 1; }
  if (every) parts.push(`${ui.sched_everyday} ${every}`);
  return parts.join(', ');
}
// Плоскі зрэз дрэва кантактаў (data.contactTree) у DFS-парадку; null → дрэва няма (стары плоскі фармат)
function _contactFlat(data, type) {
  const tree = Array.isArray(data.contactTree) ? data.contactTree : null;
  if (!tree) return null;
  const out = [];
  const walk = pid => tree.filter(n => (n.parentId ?? null) === pid && !n._deleted)
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .forEach(n => { if (n.type === type) out.push(n); if (n.type === 'folder') walk(n.id); });
  walk(null);
  return out;
}

const STATIC_I18N = {
  be: {
    nav_services:'Прапановы', nav_about:'Пра нас', nav_files:'Галерэя', nav_contact:'Кантакты', nav_cabinet:'Кабінет', contact_chat_desc:'Напішыце нам у чаце — адкажам там жа, а апавяшчэнне пра адказ прыйдзе на вашу пошту.', contact_chat_btn:'Напісаць у чат',
    services_title:'Нашы прапановы', services_subtitle:'Выконваем любы рамонт', advantages_title:'Чаму выбіраюць нас',
    about_title:'Пра нас', how_title:'Як мы працуем', promo_title:'Акцыі і спецпрапановы',
    files_title:'Галерэя работ', testimonials_title:'Водгукі кліентаў', prices_title:'Кошты паслуг',
    prices_col_service:'Паслуга', prices_col_price:'Кошт', brands_title:'Маркі з якімі працуем',
    certs_title:'Сертыфікаты і ліцэнзіі', clients_title:'Нашы партнёры', blog_title:'Карысныя артыкулы',
    faq_title:'Частыя пытанні', contact_title:'Кантакты',
    form_title:'Запісацца на сэрвіс', form_name:'Ваша імя', form_phone:'Тэлефон',
    form_car:'Марка і мадэль аўто', form_message:'Апішыце праблему', form_submit:'Адправіць заяўку',
    footer_desc:'Прафесійны аўтасэрвіс', footer_nav:'Навігацыя', footer_contacts:'Кантакты',
    footer_legal:'Дакументы', footer_privacy:'Палітыка прыватнасці', footer_portal:'Мае заказы',
    maps_btn:'Адкрыць у Google Maps',
  },
  en: {
    nav_services:'Offers', nav_about:'About us', nav_files:'Gallery', nav_contact:'Contacts', nav_cabinet:'Account', contact_chat_desc:'Write to us in the chat — we\'ll reply there, and you\'ll get an email notification.', contact_chat_btn:'Open chat',
    services_title:'Our Offers', services_subtitle:'We handle any repair', advantages_title:'Why Choose Us',
    about_title:'About Us', how_title:'How We Work', promo_title:'Promotions & Special Offers',
    files_title:'Our Work Gallery', testimonials_title:'Customer Reviews', prices_title:'Price List',
    prices_col_service:'Service', prices_col_price:'Price', brands_title:'Brands We Work With',
    certs_title:'Certificates & Licences', clients_title:'Our Partners', blog_title:'Useful Articles',
    faq_title:'Frequently Asked Questions', contact_title:'Contact Us',
    form_title:'Book a Service', form_name:'Your name', form_phone:'Phone',
    form_car:'Car make and model', form_message:'Describe the issue', form_submit:'Send Request',
    footer_desc:'Professional auto service', footer_nav:'Navigation', footer_contacts:'Contacts',
    footer_legal:'Legal', footer_privacy:'Privacy Policy', footer_portal:'My orders',
    maps_btn:'Open in Google Maps',
  },
  uk: {
    nav_services:'Пропозиції', nav_about:'Про нас', nav_files:'Галерея', nav_contact:'Контакти', nav_cabinet:'Кабінет', contact_chat_desc:'Напишіть нам у чаті — відповімо там само, а сповіщення про відповідь прийде на вашу пошту.', contact_chat_btn:'Написати в чат',
    services_title:'Наші пропозиції', services_subtitle:'Виконуємо будь-який ремонт', advantages_title:'Чому обирають нас',
    about_title:'Про нас', how_title:'Як ми працюємо', promo_title:'Акції та спецпропозиції',
    files_title:'Галерея робіт', testimonials_title:'Відгуки клієнтів', prices_title:'Ціни на послуги',
    prices_col_service:'Послуга', prices_col_price:'Ціна', brands_title:'Марки з якими працюємо',
    certs_title:'Сертифікати та ліцензії', clients_title:'Наші партнери', blog_title:'Корисні статті',
    faq_title:'Часті запитання', contact_title:'Контакти',
    form_title:'Записатися на сервіс', form_name:'Ваше ім\'я', form_phone:'Телефон',
    form_car:'Марка і модель авто', form_message:'Опишіть проблему', form_submit:'Надіслати заявку',
    footer_desc:'Професійний автосервіс', footer_nav:'Навігація', footer_contacts:'Контакти',
    footer_legal:'Документи', footer_privacy:'Політика конфіденційності', footer_portal:'Мої замовлення',
    maps_btn:'Відкрити в Google Maps',
  },
  ru: {
    nav_services:'Предложения', nav_about:'О нас', nav_files:'Галерея', nav_contact:'Контакты', nav_cabinet:'Кабинет', contact_chat_desc:'Напишите нам в чате — ответим там же, а уведомление об ответе придёт на вашу почту.', contact_chat_btn:'Написать в чат',
    services_title:'Наши предложения', services_subtitle:'Выполняем любой ремонт', advantages_title:'Почему выбирают нас',
    about_title:'О нас', how_title:'Как мы работаем', promo_title:'Акции и спецпредложения',
    files_title:'Галерея работ', testimonials_title:'Отзывы клиентов', prices_title:'Цены на услуги',
    prices_col_service:'Услуга', prices_col_price:'Цена', brands_title:'Марки с которыми работаем',
    certs_title:'Сертификаты и лицензии', clients_title:'Наши партнёры', blog_title:'Полезные статьи',
    faq_title:'Часто задаваемые вопросы', contact_title:'Контакты',
    form_title:'Записаться на сервис', form_name:'Ваше имя', form_phone:'Телефон',
    form_car:'Марка и модель авто', form_message:'Опишите проблему', form_submit:'Отправить заявку',
    footer_desc:'Профессиональный автосервис', footer_nav:'Навигация', footer_contacts:'Контакты',
    footer_legal:'Документы', footer_privacy:'Политика конфиденциальности', footer_portal:'Мои заказы',
    maps_btn:'Открыть в Google Maps',
  },
  pl: {
    nav_services:'Oferta', nav_about:'O nas', nav_files:'Galeria', nav_contact:'Kontakt', nav_cabinet:'Konto', contact_chat_desc:'Napisz do nas na czacie — odpowiemy tam, a powiadomienie o odpowiedzi otrzymasz e-mailem.', contact_chat_btn:'Napisz na czacie',
    services_title:'Nasza oferta', services_subtitle:'Wykonujemy każdą naprawę', advantages_title:'Dlaczego nas wybierają',
    about_title:'O nas', how_title:'Jak pracujemy', promo_title:'Promocje i oferty specjalne',
    files_title:'Galeria prac', testimonials_title:'Opinie klientów', prices_title:'Cennik usług',
    prices_col_service:'Usługa', prices_col_price:'Cena', brands_title:'Marki z którymi pracujemy',
    certs_title:'Certyfikaty i licencje', clients_title:'Nasi partnerzy', blog_title:'Pomocne artykuły',
    faq_title:'Często zadawane pytania', contact_title:'Kontakt',
    form_title:'Umów wizytę', form_name:'Twoje imię', form_phone:'Telefon',
    form_car:'Marka i model samochodu', form_message:'Opisz problem', form_submit:'Wyślij zgłoszenie',
    footer_desc:'Profesjonalny serwis samochodowy', footer_nav:'Nawigacja', footer_contacts:'Kontakt',
    footer_legal:'Dokumenty', footer_privacy:'Polityka prywatności', footer_portal:'Moje zamówienia',
    maps_btn:'Otwórz w Google Maps',
  },
  de: {
    nav_services:'Angebote', nav_about:'Über uns', nav_files:'Galerie', nav_contact:'Kontakt', nav_cabinet:'Konto', contact_chat_desc:'Schreiben Sie uns im Chat — wir antworten dort, und Sie erhalten eine E-Mail-Benachrichtigung.', contact_chat_btn:'Chat öffnen',
    services_title:'Unsere Angebote', services_subtitle:'Wir führen jede Reparatur durch', advantages_title:'Warum uns wählen',
    about_title:'Über uns', how_title:'Wie wir arbeiten', promo_title:'Aktionen & Sonderangebote',
    files_title:'Arbeitsgalerie', testimonials_title:'Kundenbewertungen', prices_title:'Preisliste',
    prices_col_service:'Leistung', prices_col_price:'Preis', brands_title:'Marken mit denen wir arbeiten',
    certs_title:'Zertifikate & Lizenzen', clients_title:'Unsere Partner', blog_title:'Nützliche Artikel',
    faq_title:'Häufig gestellte Fragen', contact_title:'Kontakt',
    form_title:'Termin vereinbaren', form_name:'Ihr Name', form_phone:'Telefon',
    form_car:'Fahrzeugmarke und -modell', form_message:'Problem beschreiben', form_submit:'Anfrage senden',
    footer_desc:'Professioneller Kfz-Service', footer_nav:'Navigation', footer_contacts:'Kontakt',
    footer_legal:'Dokumente', footer_privacy:'Datenschutzrichtlinie', footer_portal:'Meine Bestellungen',
    maps_btn:'In Google Maps öffnen',
  },
  fr: {
    nav_services:'Offres', nav_about:'À propos', nav_files:'Galerie', nav_contact:'Contact', nav_cabinet:'Compte', contact_chat_desc:'Écrivez-nous dans le chat — nous y répondrons et vous recevrez une notification par e-mail.', contact_chat_btn:'Ouvrir le chat',
    services_title:'Nos offres', services_subtitle:'Nous réalisons toute réparation', advantages_title:'Pourquoi nous choisir',
    about_title:'À propos de nous', how_title:'Comment nous travaillons', promo_title:'Promotions & offres spéciales',
    files_title:'Galerie de travaux', testimonials_title:'Avis clients', prices_title:'Tarifs',
    prices_col_service:'Service', prices_col_price:'Prix', brands_title:'Marques avec lesquelles nous travaillons',
    certs_title:'Certificats & licences', clients_title:'Nos partenaires', blog_title:'Articles utiles',
    faq_title:'Questions fréquentes', contact_title:'Contact',
    form_title:'Prendre rendez-vous', form_name:'Votre nom', form_phone:'Téléphone',
    form_car:'Marque et modèle du véhicule', form_message:'Décrivez le problème', form_submit:'Envoyer la demande',
    footer_desc:'Service automobile professionnel', footer_nav:'Navigation', footer_contacts:'Contact',
    footer_legal:'Documents', footer_privacy:'Politique de confidentialité', footer_portal:'Mes commandes',
    maps_btn:'Ouvrir dans Google Maps',
  },
  es: {
    nav_services:'Ofertas', nav_about:'Sobre nosotros', nav_files:'Galería', nav_contact:'Contacto', nav_cabinet:'Cuenta', contact_chat_desc:'Escríbenos en el chat: te responderemos allí y recibirás una notificación por correo.', contact_chat_btn:'Abrir el chat',
    services_title:'Nuestras ofertas', services_subtitle:'Realizamos cualquier reparación', advantages_title:'Por qué elegirnos',
    about_title:'Sobre nosotros', how_title:'Cómo trabajamos', promo_title:'Promociones y ofertas especiales',
    files_title:'Galería de trabajos', testimonials_title:'Opiniones de clientes', prices_title:'Lista de precios',
    prices_col_service:'Servicio', prices_col_price:'Precio', brands_title:'Marcas con las que trabajamos',
    certs_title:'Certificados y licencias', clients_title:'Nuestros socios', blog_title:'Artículos útiles',
    faq_title:'Preguntas frecuentes', contact_title:'Contacto',
    form_title:'Reservar servicio', form_name:'Su nombre', form_phone:'Teléfono',
    form_car:'Marca y modelo del vehículo', form_message:'Describa el problema', form_submit:'Enviar solicitud',
    footer_desc:'Servicio de automóviles profesional', footer_nav:'Navegación', footer_contacts:'Contacto',
    footer_legal:'Documentos', footer_privacy:'Política de privacidad', footer_portal:'Mis pedidos',
    maps_btn:'Abrir en Google Maps',
  },
  it: {
    nav_services:'Offerte', nav_about:'Chi siamo', nav_files:'Galleria', nav_contact:'Contatti', nav_cabinet:'Account', contact_chat_desc:'Scrivici in chat: ti risponderemo lì e riceverai una notifica via e-mail.', contact_chat_btn:'Apri la chat',
    services_title:'Le nostre offerte', services_subtitle:'Eseguiamo qualsiasi riparazione', advantages_title:'Perché sceglierci',
    about_title:'Chi siamo', how_title:'Come lavoriamo', promo_title:'Promozioni e offerte speciali',
    files_title:'Galleria lavori', testimonials_title:'Recensioni clienti', prices_title:'Listino prezzi',
    prices_col_service:'Servizio', prices_col_price:'Prezzo', brands_title:'Marchi con cui lavoriamo',
    certs_title:'Certificati e licenze', clients_title:'I nostri partner', blog_title:'Articoli utili',
    faq_title:'Domande frequenti', contact_title:'Contatti',
    form_title:'Prenota un servizio', form_name:'Il tuo nome', form_phone:'Telefono',
    form_car:'Marca e modello del veicolo', form_message:'Descrivi il problema', form_submit:'Invia richiesta',
    footer_desc:'Officina professionale', footer_nav:'Navigazione', footer_contacts:'Contatti',
    footer_legal:'Documenti', footer_privacy:'Informativa sulla privacy', footer_portal:'I miei ordini',
    maps_btn:'Apri in Google Maps',
  },
  pt: {
    nav_services:'Ofertas', nav_about:'Sobre nós', nav_files:'Galeria', nav_contact:'Contacto', nav_cabinet:'Conta', contact_chat_desc:'Escreva para nós no chat — responderemos lá e você receberá uma notificação por e-mail.', contact_chat_btn:'Abrir o chat',
    services_title:'As nossas ofertas', services_subtitle:'Realizamos qualquer reparação', advantages_title:'Por que nos escolher',
    about_title:'Sobre nós', how_title:'Como trabalhamos', promo_title:'Promoções e ofertas especiais',
    files_title:'Galeria de trabalhos', testimonials_title:'Avaliações de clientes', prices_title:'Lista de preços',
    prices_col_service:'Serviço', prices_col_price:'Preço', brands_title:'Marcas com que trabalhamos',
    certs_title:'Certificados e licenças', clients_title:'Os nossos parceiros', blog_title:'Artigos úteis',
    faq_title:'Perguntas frequentes', contact_title:'Contacto',
    form_title:'Agendar serviço', form_name:'O seu nome', form_phone:'Telefone',
    form_car:'Marca e modelo do veículo', form_message:'Descreva o problema', form_submit:'Enviar pedido',
    footer_desc:'Oficina profissional', footer_nav:'Navegação', footer_contacts:'Contacto',
    footer_legal:'Documentos', footer_privacy:'Política de privacidade', footer_portal:'As minhas encomendas',
    maps_btn:'Abrir no Google Maps',
  },
  zh: {
    nav_services:'产品与服务', nav_about:'关于我们', nav_files:'图库', nav_contact:'联系我们', nav_cabinet:'我的账户', contact_chat_desc:'在聊天中给我们留言——我们会在那里回复，并通过邮件通知您。', contact_chat_btn:'打开聊天',
    services_title:'我们的产品与服务', services_subtitle:'承接各类维修', advantages_title:'为何选择我们',
    about_title:'关于我们', how_title:'我们的工作流程', promo_title:'促销与特别优惠',
    files_title:'作品展示', testimonials_title:'客户评价', prices_title:'价格表',
    prices_col_service:'服务', prices_col_price:'价格', brands_title:'合作品牌',
    certs_title:'证书与许可', clients_title:'我们的合作伙伴', blog_title:'实用文章',
    faq_title:'常见问题', contact_title:'联系我们',
    form_title:'预约服务', form_name:'您的姓名', form_phone:'电话',
    form_car:'车辆品牌和型号', form_message:'描述问题', form_submit:'提交申请',
    footer_desc:'专业汽车服务', footer_nav:'导航', footer_contacts:'联系方式',
    footer_legal:'文件', footer_privacy:'隐私政策', footer_portal:'我的订单',
    maps_btn:'在Google Maps中打开',
  },
  ar: {
    nav_services:'العروض', nav_about:'من نحن', nav_files:'المعرض', nav_contact:'اتصل بنا', nav_cabinet:'حسابي', contact_chat_desc:'راسلنا في الدردشة — سنرد هناك وستصلك إشعارات عبر البريد الإلكتروني.', contact_chat_btn:'فتح الدردشة',
    services_title:'عروضنا', services_subtitle:'نقوم بأي إصلاح', advantages_title:'لماذا تختارنا',
    about_title:'من نحن', how_title:'كيف نعمل', promo_title:'العروض والتخفيضات',
    files_title:'معرض الأعمال', testimonials_title:'آراء العملاء', prices_title:'قائمة الأسعار',
    prices_col_service:'الخدمة', prices_col_price:'السعر', brands_title:'العلامات التجارية التي نعمل معها',
    certs_title:'الشهادات والتراخيص', clients_title:'شركاؤنا', blog_title:'مقالات مفيدة',
    faq_title:'الأسئلة الشائعة', contact_title:'اتصل بنا',
    form_title:'احجز خدمة', form_name:'اسمك', form_phone:'الهاتف',
    form_car:'ماركة وطراز السيارة', form_message:'صف المشكلة', form_submit:'إرسال الطلب',
    footer_desc:'خدمة سيارات احترافية', footer_nav:'التنقل', footer_contacts:'جهات الاتصال',
    footer_legal:'الوثائق', footer_privacy:'سياسة الخصوصية', footer_portal:'طلباتي',
    maps_btn:'فتح في خرائط Google',
  },
  hu: {
    nav_services:'Ajánlatok', nav_about:'Rólunk', nav_files:'Galéria', nav_contact:'Kapcsolat', nav_cabinet:'Fiók', contact_chat_desc:'Írjon nekünk a csevegésben — ott válaszolunk, és e-mail értesítést kap.', contact_chat_btn:'Csevegés megnyitása',
    services_title:'Ajánlataink', services_subtitle:'Minden javítást elvégzünk', advantages_title:'Miért válasszon minket',
    about_title:'Rólunk', how_title:'Hogyan dolgozunk', promo_title:'Akciók és különleges ajánlatok',
    files_title:'Munkáink galériája', testimonials_title:'Ügyfélvélemények', prices_title:'Árlista',
    prices_col_service:'Szolgáltatás', prices_col_price:'Ár', brands_title:'Márkák amelyekkel dolgozunk',
    certs_title:'Tanúsítványok és licencek', clients_title:'Partnereink', blog_title:'Hasznos cikkek',
    faq_title:'Gyakran ismételt kérdések', contact_title:'Kapcsolat',
    form_title:'Időpontfoglalás', form_name:'Az Ön neve', form_phone:'Telefon',
    form_car:'Autó márkája és modellje', form_message:'Írja le a problémát', form_submit:'Kérelem küldése',
    footer_desc:'Professzionális autószerviz', footer_nav:'Navigáció', footer_contacts:'Kapcsolat',
    footer_legal:'Dokumentumok', footer_privacy:'Adatvédelmi irányelvek', footer_portal:'Rendeléseim',
    maps_btn:'Megnyitás Google Térképen',
  },
};

function getI18n(data, lang) {
  const primary = getPrimaryLang(data);
  const builtin = STATIC_I18N[lang] || STATIC_I18N['en'] || {};
  const primaryData = data.i18n?.[primary] || {};
  const rawLangData = lang !== primary ? (data.i18n?.[lang] || {}) : primaryData;
  // Skip empty strings so blank settings.json fields don't override built-in translations
  const langData = Object.fromEntries(Object.entries(rawLangData).filter(([, v]) => v !== '' && v != null));
  return { ...primaryData, ...builtin, ...langData };
}

function _getContentLang(data, selectedLang) {
  const active = (data.languages || []).filter(l => l.active).map(l => l.code);
  return active.includes(selectedLang) ? selectedLang : getPrimaryLang(data);
}

function renderSiteLangDropdown(data, selectedLang) {
  const container = document.getElementById('site-lang-picker');
  if (!container) return;
  const activeLangs = (data.languages || []).filter(l => l.active);
  if (activeLangs.length <= 1) { container.innerHTML = ''; return; }
  const selEntry = activeLangs.find(l => l.code === selectedLang);
  const curDef = SITE_LANGS.find(l => l.code === selectedLang) || { label: selEntry?.label || selectedLang.toUpperCase(), name: selEntry?.name || selectedLang };
  const items = activeLangs.map(sl => {
    const def = SITE_LANGS.find(l => l.code === sl.code) || { label: sl.label || sl.code.toUpperCase(), name: sl.name || sl.label || sl.code };
    return `<button class="lang-dd-item${sl.code === selectedLang ? ' active' : ''}" onclick="changeSiteLang('${sl.code}')">
      <span class="lang-dd-code">${def.label}</span>
      <span class="lang-dd-name">${def.name}</span>
    </button>`;
  }).join('');
  container.innerHTML = `
    <button class="lang-dd-btn" onclick="toggleLangDropdown(event)">${curDef.label} <span class="dd-arrow">▾</span></button>
    <div class="lang-dd-menu">${items}</div>`;
}

function toggleLangDropdown(e) {
  e.stopPropagation();
  document.querySelector('#site-lang-picker .lang-dd-menu')?.classList.toggle('open');
}

async function changeSiteLang(lang) {
  if (!siteData) return;
  document.querySelector('#site-lang-picker .lang-dd-menu')?.classList.remove('open');
  applyLanguage(siteData, lang);
  await applySections(); // перарэндэр секцый на новай мове праз ТОЙ ЖА шлях, што старт (свежы фетч+рэндэр)
  initReveal(); // 🎯 ФІКС: перарэндэраныя секцыі — НОВЫЯ DOM-вузлы; без паўторнага reveal-назіральніка яны завісаюць схаванымі (.js-reveal без .in-view) → «пасля пераключэння мовы секцыі не паказваюцца»
}

function applyLanguage(data, selectedLang) {
  const contentLang = _getContentLang(data, selectedLang);
  currentLang = contentLang;
  localStorage.setItem('ttzop_lang', selectedLang);

  const langEntry = (data.languages || []).find(l => l.code === contentLang);
  const uiLang = langEntry?.uiLang || contentLang;
  currentUiLang = UI_T[uiLang] ? uiLang : (UI_T[contentLang] ? contentLang : 'be');

  const langDef = SITE_LANGS.find(l => l.code === (langEntry?.uiLang || selectedLang));
  document.documentElement.dir = langDef?.dir || 'ltr';

  const i = getI18n(data, contentLang);
  const iUI = uiLang !== contentLang ? getI18n(data, uiLang) : i;

  // Праекцыя Структуры кампаніі (галоўны офіс) — адзіная крыніца; fallback на стары i18n/contactTree.
  // name/address/hours — мультымоўныя {мова:значэнне}; выбіраем па кантэнт-мове (fallback прымарная → першае непустое)
  const co = data.company || null;
  const _coPrimary = getPrimaryLang(data);
  const _mlPick = v => (v && typeof v === 'object' && !Array.isArray(v)) ? (v[contentLang] || v[_coPrimary] || Object.values(v).find(Boolean) || '') : (v || '');
  const companyName = _mlPick(co?.name) || i.companyName || '';
  const companyAddress = _mlPick(co?.address) || i.address || '';
  const companyHours = _mlPick(co?.hours) || i.workingHours || '';
  // #3: дубль гадзін у поясе госця — ТОЛЬКІ калі пояс філіяла зададзены і ≠ пояс госця
  const _btz = co?.timezone || '', _vtz = _siteViewerTz();
  const companyHoursTz = (_btz && _vtz && _btz !== _vtz && Array.isArray(co?.schedule) && co.schedule.length)
    ? _siteHoursInTz(co.schedule, _btz, _vtz, contentLang) : '';

  document.title = companyName;
  _setFavicon(co?.logoIcon); // favicon браўзера з іконкі кампаніі

  const setText = (id, val) => { const el = document.getElementById(id); if (el && val !== undefined) el.textContent = val; };
  // гадзіны: асноўны радок + (пры іншым поясе) цьмяны «у вашым поясе: …»
  const setHours = (id) => { const el = document.getElementById(id); if (!el) return;
    if (companyHoursTz) el.innerHTML = `${_escHtml(companyHours)}<span style="opacity:.65;font-size:.9em"> · ${_escHtml(getUI().hours_your_tz)} ${_escHtml(companyHoursTz)}</span>`;
    else el.textContent = companyHours; };

  setText('site-logo',       companyName);
  setText('footer-logo',     companyName);
  // лагатып-выява ў навбары (Структура кампаніі → Папка-0 «Лагатыпы» → праекцыя settings.company.logo):
  // асноўны варыянт, fallback іконка; няма лагатыпа — застаецца толькі тэкставая назва (як раней)
  const _navLogo = co?.logo || co?.logoIcon || '';
  const _navLogoEl = document.getElementById('site-logo-img');
  if (_navLogoEl && _navLogo) _navLogoEl.innerHTML = `<img src="${_escHtml(_navLogo)}" alt="">`;
  setText('hero-title',      i.heroTitle || '');
  setText('hero-subtitle',   i.heroSubtitle || '');
  // Кантакты — дрэва Ф/П/ПФФ (data.contactTree); сайт сам сплюшчвае. Стары плоскі фармат — fallback
  const treePhones = _contactFlat(data, 'phone');
  const phones = (co?.phones?.length ? co.phones : null) || treePhones || ((Array.isArray(data.phones) && data.phones.length) ? data.phones : (data.phone ? [{ label: '', value: data.phone }] : []));
  const telHref = v => 'tel:' + String(v).replace(/[^\d+]/g, '');
  setText('hero-phone',      phones[0]?.value || '');
  setHours('hero-hours');
  setText('contact-address', companyAddress);
  const cp = document.getElementById('contact-phone'); // спіс усіх тэлефонаў з назвамі і tel:-спасылкамі
  if (cp) cp.innerHTML = phones.map(p => `${p.label ? `<b>${p.label}:</b> ` : ''}<a href="${telHref(p.value)}">${p.value}</a>`).join('<br>');
  setHours('contact-hours');
  setText('footer-phone',    phones[0]?.value || '');
  setHours('footer-hours');
  setText('about-text',      i.about_text || '');
  setText('hero-btn-primary',   i.hero_btn_primary || '');
  setText('hero-btn-secondary', i.hero_btn_secondary || '');

  // Email — з дрэва кантактаў (fallback на стары data.email_routing)
  const primary = getPrimaryLang(data);
  const treeEmails = _contactFlat(data, 'email');
  const emailSrc = (co?.emails?.length ? co.emails.map(e => ({ address: e.address, labels: { [contentLang]: e.label, [primary]: e.label }, active: true })) : null) || treeEmails || (Array.isArray(data.email_routing) ? data.email_routing : null);
  if (emailSrc) {
    const activeEmails = emailSrc.filter(e => e.address && e.active !== false); // схаваныя (active:false) не паказваем
    const emailsHtml = activeEmails.map(e =>
      `<div class="contact-item"><span class="contact-icon">✉️</span>
       <span><b>${e.labels?.[contentLang] || e.labels?.[primary] || ''}</b>: <a href="mailto:${e.address}">${e.address}</a></span></div>`
    ).join('');
    const ce = document.getElementById('contact-emails');
    if (ce) ce.innerHTML = emailsHtml;
    const fe = document.getElementById('footer-emails');
    if (fe) fe.innerHTML = activeEmails.map(e =>
      `<p><a href="mailto:${e.address}">${e.labels?.[contentLang] || e.labels?.[primary] || ''}</a></p>`
    ).join('');
  }

  const footerCopy = document.getElementById('footer-copy');
  // К3b: копірайт з секцыі «Футэр» (Структура сайта); пуста → аўта «© год кампанія» як раней
  const customCopy = _sv(siteData?.footer?.copyright);
  if (footerCopy) footerCopy.textContent = customCopy || ('© ' + new Date().getFullYear() + ' ' + companyName);
  const fsoc = document.getElementById('footer-social'); // сацсеткі з секцыі «Футэр»
  if (fsoc) fsoc.innerHTML = (siteData?.footer?.socials || []).filter(x => x && x.url)
    .map(x => `<a href="${_dsEsc(x.url)}" target="_blank" rel="noopener" style="margin:0 10px">${_dsEsc(_sv(x.label) || x.url)}</a>`).join('');

  const mapsBtn = document.getElementById('google-maps-link');
  if (mapsBtn) mapsBtn.textContent = i.maps_btn || 'Google Maps';

  // Усе data-i18n элементы (content lang першы, uiLang як fallback)
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = i[key] || iUI[key] || '';
    if (val) el.textContent = val;
  });

  // Placeholder у форме
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const val = i[key] || iUI[key] || '';
    if (val) el.setAttribute('placeholder', val);
  });

  document.documentElement.setAttribute('lang', selectedLang);
  renderSiteLangDropdown(data, selectedLang);
  updateCabinetNav(); // email наведвальніка не затираецца пры перамалёўцы i18n кнопкі «Кабінет»
}

// ════════════════════════════════════════
// 🧱 ДЫНАМІЧНЫЯ СЕКЦЫІ (Фаза 1 хрыбет): сайт = СПІС экзэмпляраў; рэндэр па viewType з код-каталога SITE_VIEWS.
// Дадаць секцыю = запіс у спіс (нуль кода). Замяняе 9 захардкоджаных loadX + 9 HTML-кантэйнераў.
// ════════════════════════════════════════
// многамоўнае значэнне {be:..} АБО радок → па currentLang з fallback (прымарная → першае непустое)
function _sv(v) {
  if (v && typeof v === 'object' && !Array.isArray(v)) return v[currentLang] || v[getPrimaryLang(siteData)] || Object.values(v).find(Boolean) || '';
  return v == null ? '' : v;
}
function _dsEsc(s) { return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

// 🃏 ГЛАБАЛЬНАЯ КАРТКА-АНОНС (ПРОДАКФПФ, безыменная — па функцыі): адзін рэндэр для ЎСІХ картак сайта
// (Паслугі/Навіны/…). media = cover-выява (навіны) АБО icon-эмодзі (паслугі); footer = гатовы HTML
// (цана+кошык / кнопка чытача); onClick = клік па ЎСЁЙ картцы (навіны→мадалка), footer-кнопкі robяць stopPropagation.
function _cardHtml(o) {
  const media = o.cover
    ? `<img class="post-cover" src="${_dsEsc(o.cover)}" alt="" loading="lazy" style="width:100%;border-radius:8px;margin-bottom:12px;object-fit:cover;aspect-ratio:16/9">`
    : (o.icon ? `<div class="service-icon">${_dsEsc(o.icon)}</div>` : '');
  const meta = (o.meta || o.metaEd) ? `<div class="post-date text-muted" style="font-size:0.82rem;margin-bottom:6px"${o.metaEd || ''}>${_dsEsc(o.meta)}</div>` : '';
  // 🖊️ o.titleEd/o.textEd/o.metaEd — edit-атрыбуты. o.textHtml=true → цела сырое (richtext, не эскейпім). Пустое ў edit — для плейсхолдэра
  const text = (o.text || o.textEd) ? `<div class="service-desc text-muted" style="margin-top:8px"${o.textEd || ''}>${o.textHtml ? (o.text || '') : _dsEsc(o.text)}</div>` : '';
  // o.badge — куточак-бэйдж любой карткі (паслугі: Хіт/Новае/…; генерычна для ўсіх спажыўцоў _cardHtml)
  const badge = o.badge ? `<span style="position:absolute;top:10px;inset-inline-end:10px;background:var(--accent,#f97316);color:#fff;font-size:0.72rem;font-weight:700;padding:3px 9px;border-radius:999px;letter-spacing:0.03em">${_dsEsc(o.badge)}</span>` : '';
  const style = ` style="position:relative${o.onClick ? ';cursor:pointer' : ''}"`; // relative — якар для бэйджа/радка рэдактара
  const click = o.onClick ? ` onclick="${o.onClick}"` : '';
  return `<article class="card ${o.cls || ''}${o.dim ? ' ds-hidden' : ''}"${click}${style}>${o.edbar || ''}${badge}${media}${meta}<h3 class="service-title"${o.titleEd || ''}>${_dsEsc(o.title)}</h3>${text}${o.footer || ''}</article>`;
}

// 🧷 ГЛАБАЛЬНЫ ФОЛД (адзін механізм на ЎСЕ згортвальныя загалоўкі старонкі: секцыі/Папкі ў renderDynamicSections
// І групы Каталога ў SITE_VIEWS.cards): кнопка-стрэлка ▸ злева, паварот CSS ад details[open], хэндлер _dFoldBtn.
// extraAttr — дадатковыя атрыбуты на <details> (напр. grid-column для групы ўнутры сеткі картак)
const _dsFoldWrap = (collapsed, head, inner, extraAttr = '', sumAttr = '') => head ? `<details class="ds-fold"${collapsed ? '' : ' open'}${extraAttr ? ' ' + extraAttr : ''}><summary${sumAttr ? ' ' + sumAttr : ''}><button class="ds-fold-btn" contenteditable="false" onclick="_dFoldBtn(event)" title="${_svcEsc(_dL('Разгарнуць / Згарнуць', 'Expand / Collapse'))}">▶</button>${head}</summary>${inner}</details>` : head + inner;
// Узроўневы загаловак групы (матрошка): d=0 — акцэнт-рыса, глыбей — драбней+водступ. Спажыўцы: cards (папкі Каталога), gallery (🗂 альбомы)
// attr (опц.) — _edAttr рэдагавання назвы на месцы: кладзецца на ЎНУТРАНЫ span, каб плейсхолдэр/фокус не чапалі «▸ »
const _dsGroupHead = (txt, d, attr = '') => d === 0
  ? `<div class="services-folder-heading" style="grid-column:1/-1;margin-top:8px;font-size:1.05rem;font-weight:700;padding:8px 0 4px;border-bottom:2px solid var(--color-primary,#f97316);color:var(--color-primary,#111)">${attr ? `<span${attr}>${_dsEsc(txt)}</span>` : _dsEsc(txt)}</div>`
  : `<div class="services-folder-heading" style="grid-column:1/-1;margin-top:4px;font-size:${Math.max(0.8, 0.98 - d * 0.08)}rem;font-weight:600;padding:${Math.max(4, 10 - d * 2)}px 0 2px ${d * 14}px;opacity:0.85">▸ ${attr ? `<span${attr}>${_dsEsc(txt)}</span>` : _dsEsc(txt)}</div>`;
// ═══ 🧷 СЕКЦЫЯ-СПАСЫЛКА НА КАТАЛОГ (рашэнне 2026-07-15: «спасылка замест копіі») ═══
// source-экзэмпляр НЕ трымае адбітка картак — сайт будуе іх ЖЫЎЦОМ з Каталога ({site}:services):
// публіка — з апублікаванага, прэв'ю/Чарнавік (?look) — з чарнавіка. Панэльная праекцыя-копія
// (_SITE_SOURCES/_siteSourceProject) і жывы мірор воркера выдалены — крыніца праўды адна.
let _svcTree = null; // вузлы Каталога (дрэва {nodes}) — загружаюцца, калі на старонцы ёсць source-секцыя
let _svcTrash = []; // Сметніца Каталога (data.trash) — ⓘ source-секцыі паказвае яе з ♻/✕ (draft_src restore/purge)
async function _svcFetchTree() {
  try {
    const _look = new URLSearchParams(location.search).get('look');
    const r = await fetch(API_URL + '/content/' + SITE_REPO + '/services' + (_look ? '?draft=' + encodeURIComponent(_look) + '&cb=' + Date.now() : ''));
    const d = await r.json();
    if (d && Array.isArray(d.nodes)) { _svcTree = d.nodes; _svcTrash = Array.isArray(d.trash) ? d.trash : []; }
  } catch (e) { /* фетч не ўдаўся — застаецца папярэдняе дрэва / застылы content з sections (fallback) */ }
}
// Праекцыя Каталога → карткі (АДЗІНЫ код праекцыі; былая панэльная _SITE_SOURCES.services выдалена).
// path = ПОЎНЫ шлях папак [{id,name,active}] — id патрэбны кіраванню з Чарнавіка; name можа быць ml-аб'ектам.
// У edit-рэжыме НЕактыўныя вузлы ўключаюцца з пазнакай hidden (цьмяныя, ● вяртае) — як пазіцыі іншых секцый.
function _svcItems(nodes) {
  const items = [];
  const walk = (pid, path, hidUp) => (nodes || [])
    .filter(n => n && (n.parentId ?? null) === pid && !n._deleted)
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .forEach(n => {
      const off = n.active === false;
      if (n.type === 'form') {
        if (off && !_dEdit) return;
        const f = n.fields || {};
        items.push({ id: n.id, icon: f.icon || '', title: f.name || n.name || '', text: f.description || '',
          price: f.price != null ? String(f.price) : '', currency: f.currency || '', itemType: f.type || 'general',
          priceMode: f.priceMode || 'exact',
          badge: (f.badge && f.badge !== 'none') ? f.badge : '', badgeText: f.badgeText || '',
          fulfil: f.fulfil || 'cart',
          ...(f.fulfil === 'subscription' && f.period ? { period: f.period } : {}),
          ...((!f.fulfil || f.fulfil === 'booking') && +f.groupMax > 0 ? { groupMax: +f.groupMax } : {}), // 👥 групавая пазнака (легасі без fulfil = bookable)
          ...(off || hidUp ? { hidden: true } : {}),
          ...(path.length ? { group: path[path.length - 1].name, path } : {}) });
      }
      if (n.type === 'folder') {
        if (off && !_dEdit) return; // ● выкл на Папцы хавае ЎСЁ паддрэва з публікі (🌑 _newInactive)
        // безназоўная папка не дае ўзроўню публіцы; у edit — дае (новая +📂 безназоўная і пустая — мусіць быць бачнай, каб назваць/напоўніць)
        walk(n.id, (n.name || _dEdit) ? [...path, { id: n.id, name: n.name || '', active: !off }] : path, hidUp || off);
      }
    });
  walk(null, [], false);
  return items;
}
// Уліць жывую праекцыю ў source-экзэмпляры спіса секцый (in-memory, перад рэндэрам; без дрэва — застылы content як fallback)
function _svcResolveSources(data) {
  if (!_svcTree) return;
  (Array.isArray(data?.sections) ? data.sections : []).forEach(x => { if (x && x.source === 'services') x.content = { items: _svcItems(_svcTree) }; });
}
// КАТАЛОГ ВЫГЛЯДАЎ (viewType → innerHTML секцыі). Класы супадаюць са style.css → кожны перавыкарыстоўваецца бясконца.
const SITE_VIEWS = {
  // тэкст + фота (Пра нас, простыя навіны). body — гатовы HTML (richtext)
  text: inst => {
    const c = inst.content || {};
    const img = _sv(c.image) ? `<div class="about-image"><img src="${_dsEsc(_sv(c.image))}" alt="" loading="lazy"></div>` : '';
    const bodyEd = _edAttr(inst.id, 'content.body', 'rich', getUI().ed_body); // 🖊️ цела — клік адкрывае мадалку WYSIWYG
    return `<div class="about-inner"><div class="about-content"><div class="about-text"${bodyEd}>${_sv(c.body)}</div></div>${img}</div>`;
  },
  // сетка картак (Паслугі/Перавагі); item з id+price → кнопка кошыка; it.group → падзагаловак групы (папка ў дрэве Паслуг)
  cards: inst => {
    const items = inst.content?.items || [];
    const isSrc = !!inst.source; // 🧷 секцыя-спасылка: змест жыве ў КАТАЛОГУ — індэксныя бары/inline-праўка
    // секцыі не дастасоўныя (пісалі б у чарнавік старонкі міма крыніцы); кіраванне групамі/карткамі — draft_src
    const cardHtml = (it, _i) => {
      const name = _sv(it.title), price = _sv(it.price), cur = _sv(it.currency);
      const ui = getUI();
      const pm = _sv(it.priceMode) || 'exact'; // рэжым цаны: exact / from («ад») / quote («па дамове»)
      const btnStyle = 'margin-top:12px;width:100%;padding:10px;background:var(--accent,#f97316);color:#fff;border:none;border-radius:8px;font-weight:600;cursor:pointer;font-size:0.9rem';
      const inCart = it.id ? cart.find(c => c.id === it.id) : null;
      // К1 «Каталог»: асноўная кнопка па СПОСАБЕ АТРЫМАННЯ (cart/booking/inquiry; fallback на пераходны cta v4.547)
      const ff = _sv(it.fulfil) || (_sv(it.cta) === 'chat' ? 'inquiry' : 'cart');
      const nameArg = `'${_dsEsc(name).replace(/'/g,'&#39;')}'`;
      // 👥 групавая пазіцыя — пазнака ліміту (groupMax прыходзіць з праекцыі толькі ў bookable, у т.л. легасі без fulfil, што рэндэрыцца як cart)
      let btn = +_sv(it.groupMax) > 0 ? `<p style="margin:8px 0 0;font-size:0.8rem;opacity:0.75">👥 ${_dsEsc((ui.grp_upto || '').replace('{n}', _sv(it.groupMax)))}</p>` : '';
      if (ff === 'booking') { // 📅 мадалка вольных слотаў; легасі-пазіцыя без id → чат (рашальнік не ведае, што браніраваць)
        btn = btn + (it.id
          ? `<button onclick="event.stopPropagation();bookItem('${_dsEsc(it.id)}',${nameArg})" style="${btnStyle}">📅 ${ui.cta_book}</button>`
          : `<button onclick="event.stopPropagation();chatAboutItem(${nameArg},'chat_book_pfx')" style="${btnStyle}">📅 ${ui.cta_book}</button>`);
      } else if (ff === 'inquiry') {
        btn += `<button onclick="event.stopPropagation();chatAboutItem(${nameArg},'chat_ask_pfx')" style="${btnStyle}">💬 ${ui.ask_btn}</button>`;
      } else if (ff === 'subscription') { // 🔁 S1/S2 дыспетчар: «Свой сайт» → order-flow стварэння сайта; іншыя → аўта-афармленне ў кабінеце
        btn += !it.id
          ? `<button onclick="event.stopPropagation();chatAboutItem(${nameArg},'chat_sub_pfx')" style="${btnStyle}">🔁 ${ui.sub_btn}</button>` // легасі-пазіцыя без id → чат
          : _sv(it.itemType) === 'subdomain'
            ? `<button onclick="event.stopPropagation();siteSubscribeOrder('${_dsEsc(it.id)}',${nameArg},'${_dsEsc(price)}','${_dsEsc(cur)}')" style="${btnStyle}">🔁 ${ui.sub_btn}</button>`
            : `<button onclick="event.stopPropagation();subscribeItem('${_dsEsc(it.id)}',${nameArg})" style="${btnStyle}">🔁 ${ui.sub_btn}</button>`;
      } else if (it.id && price && pm === 'exact') {
        btn += `<button id="cart-btn-${_dsEsc(it.id)}" onclick="addToCart('${_dsEsc(it.id)}',${nameArg},'${_dsEsc(it.itemType||'')}','${_dsEsc(price)}','${_dsEsc(cur)}')" style="${btnStyle}">${inCart ? ui.cart_added.replace('{n}', inCart.qty) : ui.add_to_cart}</button>`;
      }
      // чат — ЗАЎСЁДЫ даступны (рашэнне К1): другасная ціхая кнопка пры cart (пры booking/inquiry асноўная ўжо вядзе ў чат)
      if (ff === 'cart') btn += `<button onclick="event.stopPropagation();chatAboutItem(${nameArg},'chat_ask_pfx')" style="margin-top:8px;width:100%;padding:7px;background:none;border:1px solid var(--border,#8883);border-radius:8px;color:inherit;opacity:0.7;cursor:pointer;font-size:0.82rem">💬 ${ui.ask_btn}</button>`;
      // цана: quote — тэкст без канверсіі; from — прэфікс «ад» ПА-ЗА .price-amount (канверсія перапісвае ўнутранасць)
      const priceHtml = pm === 'quote'
        ? `<p class="service-price">${ui.price_quote}</p>`
        : price ? `<p class="service-price">${pm === 'from' ? _dsEsc(ui.price_from_pfx) + ' ' : ''}<span class="price-amount" data-price="${_dsEsc(price)}" data-currency="${_dsEsc(cur)}">${_dsEsc(price)} ${_dsEsc(cur)}</span>${ff === 'subscription' ? ' ' + _dsEsc(_sv(it.period) === 'year' ? ui.per_year : ui.per_month) : ''}</p>` : '';
      const badge = _sv(it.badge) === 'custom' ? _sv(it.badgeText) : (_sv(it.badge) ? ui['badge_' + _sv(it.badge)] || '' : '');
      return _cardHtml({ cls: 'service-card', icon: _sv(it.icon) || '🔧', title: name, text: _sv(it.text), badge, footer: priceHtml + btn,
        edbar: isSrc ? _dSrcBar(it.id, it.hidden !== true) : _dItemBar(inst.id, 'items', _i, items.length, it.hidden !== true, 'cards'), // 🃏 пер-пазіцыйны радок ● ▲▼ ⋯ (крыніца → draft_src)
        dim: it.hidden === true,
        titleEd: isSrc ? '' : _edAttr(inst.id, 'content.items.' + _i + '.title', 'text', getUI().ed_title), // 🖊️ слайс C — толькі ўласны кантэнт секцыі (крыніца правіцца праз ✎ бара)
        textEd: isSrc ? '' : _edAttr(inst.id, 'content.items.' + _i + '.text', 'text', getUI().ed_body) });
    };
    // 🪆 ГРУПЫ = ПАПКІ КАТАЛОГА (path [{id,name,active}] або легасі радкі): матрошка фолдаў — той жа
    // глабальны _dsFoldWrap, што секцыі/Папкі старонкі (адзін механізм згортвання ўсюды, рашэнне 2026-07-15).
    // Паслядоўны праход захоўвае зыходны парадак Каталога (карткі і падгрупы ўперамешку).
    const rootKids = [], _byKey = new Map();
    items.forEach((it, _i) => {
      const path = Array.isArray(it.path) ? it.path : (_sv(it.group) ? [it.group] : []);
      let kids = rootKids, acc = '';
      path.forEach(seg => {
        acc += '/' + (seg && seg.id ? seg.id : _sv(seg));
        let g = _byKey.get(acc);
        if (!g) { g = { seg, kids: [] }; _byKey.set(acc, g); kids.push({ g }); }
        kids = g.kids;
      });
      kids.push({ it, _i });
    });
    // 🖊 edit: сінтэзуем групы і для ПУСТЫХ Папак Каталога (група будуецца з path пазіцый — пустая/новая
    // Папка інакш была б нябачнай: тая ж западня «+📂 нічога не дадаў», што draft_add v4.682)
    if (isSrc && _dEdit && _svcTree) {
      const walkF = (pid, chain) => (_svcTree || []).filter(n => n && n.type === 'folder' && (n.parentId ?? null) === pid && !n._deleted)
        .sort((a, b) => (a.order || 0) - (b.order || 0)).forEach(n => {
          const nchain = [...chain, { id: n.id, name: n.name || '', active: n.active !== false }];
          let kids = rootKids, acc = '';
          nchain.forEach(seg => { acc += '/' + seg.id; let g = _byKey.get(acc); if (!g) { g = { seg, kids: [] }; _byKey.set(acc, g); kids.push({ g }); } kids = g.kids; });
          walkF(n.id, nchain);
        });
      walkF(null, []);
    }
    const renderKids = (kids, d) => kids.map(k => k.it !== undefined ? cardHtml(k.it, k._i) : grpHtml(k.g, d)).join('');
    const grpHtml = (g, d) => {
      const seg = g.seg || {};
      const nm = _dsEsc(_sv(seg.name !== undefined ? seg.name : seg)) || (_dEdit ? '<span style="opacity:.5">📂 ' + _svcEsc(_dL('(без назвы)', '(untitled)')) + '</span>' : ''); // новая +📂 — плейсхолдэр, каб не «нічога не дадалося»
      const off = seg.active === false; // неактыўная папка трапляе сюды толькі ў edit (публіка яе не атрымлівае)
      const head = `<span class="services-folder-heading" style="font-size:${d === 0 ? '1.05rem' : Math.max(0.8, 0.98 - d * 0.08) + 'rem'};font-weight:${d === 0 ? 700 : 600};${d === 0 ? 'color:var(--color-primary,#111)' : 'opacity:0.85'}">${nm}</span>${isSrc && seg.id ? _dSrcBar(seg.id, !off) : ''}`;
      // flex-радок загалоўка: [▸][назва]……[● ▲▼ ⋯ справа] — канонны правы кластар кнопак (ААП-парытэт радка панэлі)
      const sumSt = (d === 0
        ? 'border-bottom:2px solid var(--color-primary,#f97316);padding:8px 0 4px;margin-top:8px'
        : `padding:${Math.max(4, 10 - d * 2)}px 0 2px ${d * 14}px;margin-top:4px`) + ';display:flex;align-items:center;gap:8px';
      return _dsFoldWrap(false, head, `<div class="grid grid-3" style="margin-top:10px">${renderKids(g.kids, d + 1)}</div>`,
        `style="grid-column:1/-1${off ? ';opacity:.5' : ''}"`, `style="${sumSt}"`);
    };
    // ➕ у edit: тонкая стужка «+📂» на канцы (канон Каталога: топ-узровень трымае толькі Папкі-катэгорыі)
    const addStrip = (isSrc && _dEdit)
      ? `<div style="grid-column:1/-1;text-align:center;padding:6px 0"><button class="ds-eb-btn ds-add-btn" onclick="_dSrcAdd('folder',null)" title="${_svcEsc(_dL('Дадаць Папку Каталога', 'Add Catalog folder'))}">+📂 ${_svcEsc(_dL('Папка', 'Folder'))}</button></div>` : '';
    return `<div class="grid grid-3">${renderKids(rootKids, 0)}${addStrip}</div>`;
  },
  // табліца назва↔кошт (Цэны)
  list: inst => {
    const rows = inst.content?.rows || [];
    return `<table class="prices-table"><tbody>${rows.map((r, _i) => { const price = _sv(r.value), cur = _sv(r.currency); const bar = _dEdit ? `<td class="ds-item-td">${_dItemBar(inst.id, 'rows', _i, rows.length, r.hidden !== true, 'list')}</td>` : ''; return `<tr${_dEdit && r.hidden === true ? ' class="ds-hidden"' : ''}><td${_edAttr(inst.id, 'content.rows.' + _i + '.name', 'text', getUI().ed_title)}>${_dsEsc(_sv(r.name))}</td><td class="price-amount" data-price="${_dsEsc(price)}" data-currency="${_dsEsc(cur)}">${_dsEsc(price)} ${_dsEsc(cur)}</td>${bar}</tr>`; }).join('')}</tbody></table>`;
  },
  // акардэон пытанне/адказ (FAQ)
  accordion: inst => {
    const items = inst.content?.items || [];
    return `<div class="faq-list">${items.map((it, _i) => _dItemWrap(inst.id, 'items', _i, items.length, it.hidden !== true, `<div class="faq-item"><button class="faq-question" onclick="this.parentElement.classList.toggle('open');const a=this.nextElementSibling;a.style.maxHeight=a.style.maxHeight?'':a.scrollHeight+'px'">${_dsEsc(_sv(it.q))}<span class="faq-arrow">▼</span></button><div class="faq-answer"><p>${_sv(it.a)}</p></div></div>`, 'accordion')).join('')}</div>`;
  },
  // Галерэя — БЕЗ уласнай мадэлі: фота = генерычныя {kind:'file'}-радкі дрэва, рэндэрацца
  // універсальна ў renderDynamicSections (у ЛЮБОЙ галіне/секцыі); тып пакінуты як шыльда экзэмпляра
  gallery: () => '',
  // водгукі
  testimonials: inst => {
    const items = inst.content?.items || [];
    return `<div class="grid grid-3">${items.map((it, _i) => _dItemWrap(inst.id, 'items', _i, items.length, it.hidden !== true, `<div class="card testimonial-card"><div class="testimonial-stars">${'★'.repeat(Math.max(1, Math.min(5, +_sv(it.stars) || 5)))}</div><p class="testimonial-text">"${_dsEsc(_sv(it.text))}"</p><p class="testimonial-author">— ${_dsEsc(_sv(it.author))}</p></div>`, 'testimonials')).join('')}</div>`;
  },
  // лагатыпы марак/партнёраў
  brands: inst => {
    const items = inst.content?.items || [];
    return `<div class="brands-grid">${items.map((it, _i) => _dItemWrap(inst.id, 'items', _i, items.length, it.hidden !== true, `<div class="brand-item">${_sv(it.logo) ? `<img src="${_dsEsc(_sv(it.logo))}" alt="${_dsEsc(_sv(it.name))}">` : _dsEsc(_sv(it.name))}</div>`, 'brands')).join('')}</div>`;
  },
  // 📰 артыкулы (Навіны/Блог) праз глабальную картку-анонс + універсальны чытач (reader.js):
  // клік па картцы → мадалка (openPostReader); кнопка «↗ Чытаць у новым акне» → асобнае акно. hidden не паказваюцца.
  posts: inst => {
    const all = inst.content?.posts || []; const ui = getUI();
    // арыгінальны індэкс (не фільтраваны) — каб edit-шлях content.posts.{i} супадаў нават пры схаваных пастах
    return `<div class="grid grid-3">${all.map((p, i) => ({ p, i })).filter(x => _dEdit || !x.p.hidden).map(({ p, i }) => { // edit: схаваныя таксама (цьмяныя, каб вярнуць)
      const key = String(p.id || inst.id + ':' + i); // стабільны id паста (дып-лінк #post= перажывае перасартаванне)
      _sitePostReg[key] = p; // рэестр для чытача (цела=HTML, у onclick не ўставіш)
      const excerpt = _sv(p.body).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 130); // тэкставы ўрывак без тэгаў
      const winBtn = `<button onclick="event.stopPropagation();openPostReaderWindow('${_dsEsc(key)}')" style="margin-top:10px;padding:6px 12px;border:1px solid var(--accent,#f97316);border-radius:8px;background:transparent;color:var(--accent,#f97316);font-weight:600;font-size:0.85rem;cursor:pointer">↗ ${_dsEsc(ui.read_in_tab)}</button>`;
      return _cardHtml({ cls: 'post-card', cover: _sv(p.cover), meta: _sv(p.date), title: _sv(p.title),
        edbar: _dItemBar(inst.id, 'posts', i, all.length, p.hidden !== true, 'posts'), dim: p.hidden === true, // 🃏 пер-пазіцыйны радок навіны
        text: _dEdit ? _sv(p.body) : (excerpt ? excerpt + (excerpt.length >= 130 ? '…' : '') : ''), textHtml: _dEdit, // 🖊️ edit: поўнае цела (HTML→мадалка); інакш урывак
        footer: winBtn, onClick: _dEdit ? '' : `openPostReader('${_dsEsc(key)}')`, // edit: картку не адкрываем чытачом
        titleEd: _edAttr(inst.id, 'content.posts.' + i + '.title', 'ml', ui.ed_title),
        metaEd: _edAttr(inst.id, 'content.posts.' + i + '.date', 'text', ui.ed_date),
        textEd: _edAttr(inst.id, 'content.posts.' + i + '.body', 'rich', ui.ed_body) });
    }).join('')}</div>`;
  },
};

// рэндэр усіх уключаных секцый са спіса ў #site-sections + nav + хукі (кошык/маркі/курсы)
function renderDynamicSections(data) {
  const mount = document.getElementById('site-sections');
  if (!mount) return;
  _sitePostReg = {}; // рэестр пастоў — толькі бягучы рэндэр (выдалены пост не жыве па старым ключы)
  _siteAlbumReg = {}; _albSeq = 0; // 🖼 рэестр альбомаў лайтбокса — таксама толькі бягучы рэндэр
  // 🪆 К3d МАТРОШКА: сайт паўтарае дрэва РМ «Структура сайта» (kind='folder' = раздзел/папка, kind='file' = фота/файл, parentId = укладзенасць)
  const raw = [...(Array.isArray(data?.sections) ? data.sections : [])]; // копія — нармалізатар ніжэй дадае радкі (перарэндэр мовы не павінен дубляваць)
  // ⚰️ ЛЕГАСІ-нармалізатар старой галерэйнай мадэлі (content.images/albums → генерычныя радкі);
  // выдаліць, калі ўсе сайты перазахаваюць Структуру (панэль тады піша {kind:'file'} сама)
  raw.slice().forEach(inst => {
    if (!inst || inst.kind) return; const c = inst.content || {};
    (Array.isArray(c.images) ? c.images : []).forEach((im, i) => raw.push({ kind: 'file', id: im.id || inst.id + '-f' + i, parentId: im.albumId || inst.id, url: _sv(im.url || im), thumbUrl: im.thumbUrl, caption: im.caption, enabled: im.hidden !== true }));
    (Array.isArray(c.albums) ? c.albums : []).slice().sort((x, y) => (x.order ?? 0) - (y.order ?? 0)).forEach(a => raw.push({ kind: 'folder', id: a.id, name: a.name, parentId: a.parentId || inst.id, enabled: a.hidden !== true }));
  });
  // у edit-рэжыме схаваныя (enabled===false) секцыі ЗАСТАЮЦЦА бачныя (цьмяныя) — каб іх можна было вярнуць праз ⋯
  const list = raw.filter(s => s && (_dEdit || s.enabled !== false) && (s.kind === 'folder' || s.kind === 'file' || SITE_VIEWS[s.type]));
  const kidsOf = pid => list.filter(x => (x.parentId || null) === pid);
  // 🪆 МЕГАПРАВІЛА «ПУСТАЯ ГАЛІНА НЕ ПУБЛІКУЕЦЦА» (адзінае месца правіла; канон — CLAUDE.md 🧱 Матрошка):
  // раздзел, у паддрэве якога НЯМА ніводнай бачнай секцыі-ліста, на сайт не трапляе. ЧАМУ: пустая
  // паласа з голым загалоўкам выглядае як баг/недабудова (карыстальнік стварае раздзелы наперад).
  // ЯК АДМЯНІЦЬ: прыбраць фільтр _branchHasLeaf у renderKids ніжэй — і пустыя раздзелы стануць бачныя.
  // «і без форм»: пустая СЕКЦЫЯ (форма без зместу — ні масіваў, ні тэксту/выявы) — таксама не ліст
  const _instHasContent = inst => {
    const c = inst.content || {};
    if (inst.source) return true; // праекцыя-крыніца (Каталог) — заўсёды жывая
    if (_branchHasLeaf(inst.id)) return true; // генерычныя дзеці экзэмпляра (фота/папкі/укладзеныя секцыі) = змест
    for (const k in c) {
      const v = c[k];
      if (Array.isArray(v) ? v.some(x => x && x.hidden !== true)
        : (v && (typeof v !== 'object' ? String(v).trim() : Object.values(v).some(t => String(t || '').trim())))) return true;
    }
    return false;
  };
  const _branchHasLeaf = pid => kidsOf(pid).some(x => x.kind === 'folder' ? _branchHasLeaf(x.id) : x.kind === 'file' ? true : _instHasContent(x));
  let band = 0; // чаргаванне фонавых палос — толькі верхні ўзровень
  const hTag = d => `h${Math.min(2 + d, 5)}`; // h2 → h3 → h4 → h5 (глыбей — h5)
  // 🎛 згорнутасць галіны: загаловак = <summary> (стрэлка праз CSS .ds-fold), змест раскрываецца па кліку;
  // без загалоўка згортваць няма за што — паказваем як ёсць
  // фолд УСЮДЫ (рашэнне 2026-07-14): «Згорнута» = толькі пачатковы стан; без загалоўка — няма за што згортваць.
  // Адзін механізм стрэлкі на публіку І edit — глабальны _dsFoldWrap (ім жа групы Каталога ў cards)
  const _foldWrap = _dsFoldWrap;
  // 🎛 уласцівасць секцыі (каталог SECTION_PROPS): рэзалв печаны панэллю ў inst.disp; лег. v4.593 — асобныя ключы
  const _dsProp = (inst, k) => (inst.disp || {})[k] ?? ({ previewN: inst.previewN, collapsed: inst.collapsed ? 'yes' : undefined, layoutView: inst.dispLayout }[k]);
  const instHtml = (inst, d, idx, sibN) => {
    const t0 = _sv(inst.title), s0 = _sv(inst.subtitle);
    const ebar = _dSecBar(inst.id, idx > 0, idx < sibN - 1, inst.enabled !== false); // ▲▼ ● ⋯ (толькі edit)
    const eCls = _dEdit ? ` ds-editable${inst.enabled === false ? ' ds-hidden' : ''}` : '';
    const alignL = _dsProp(inst, 'headAlign') === 'left'; // выраўноўванне загалоўка (верхні ўзровень; глыбей і так злева)
    // 🖊️ слайс A: у edit-рэжыме загаловак/падзагаловак — рэдагавальныя НА МЕСЦЫ; у edit паказваем нават пустыя (каб дадаць)
    const title = (t0 || _dEdit) ? `<${hTag(d)} class="section-title"${_edAttr(inst.id, 'title', 'ml', getUI().ed_title + (_dEdit && typeof _dTypeTag === 'function' ? _dTypeTag(inst.type) : ''))} style="${d ? `font-size:${Math.max(1, 1.5 - d * 0.2)}rem;text-align:left` : (alignL ? 'text-align:left' : '')}">${_dsEsc(t0)}</${hTag(d)}>` : '';
    const sub = (s0 || _dEdit) ? `<p class="section-subtitle text-muted"${_edAttr(inst.id, 'subtitle', 'ml', getUI().ed_subtitle)}${(d || alignL) ? ' style="text-align:left"' : ''}>${_dsEsc(s0)}</p>` : '';
    const body = _foldWrap(_dsProp(inst, 'collapsed') === 'yes', title, sub + SITE_VIEWS[inst.type](inst) + renderKids(inst.id, d + 1)); // + генерычныя дзеці экзэмпляра (фота/папкі/укладзеныя секцыі)
    // CSS-класы каталога (спажывае style.css) + data-атрыбуты пасля-рэндэрных крокаў (_dsApplyDisplay)
    const cols = _dsProp(inst, 'gridCols'), w = _dsProp(inst, 'secWidth'), pad = _dsProp(inst, 'secPad');
    const cls = [
      cols && cols !== 'auto' ? 'ds-cols-' + cols.replace('c', '') : '',
      w === 'narrow' ? 'ds-w-narrow' : w === 'full' ? 'ds-w-full' : '',
      pad === 'compact' ? 'ds-pad-compact' : pad === 'roomy' ? 'ds-pad-roomy' : '',
      _dsProp(inst, 'carousel') === 'yes' ? 'ds-carousel' : ''
    ].filter(Boolean).join(' ');
    // previewN: пуста = дэфолт 3 (канон 3/15, 2026-07-15); яўны 0 = паказаць усе. data-pvn пішам ЗАЎСЁДЫ
    // (і "0") — атрыбут пазначае секцыю-ўладальніка сваіх сетак для closest-фільтра ў _dsApplyDisplay
    const pvnRaw = _dsProp(inst, 'previewN');
    const pvn = (pvnRaw === undefined || pvnRaw === null || pvnRaw === '') ? 3 : +pvnRaw;
    const lay = _dsProp(inst, 'layoutView'), ord = _dsProp(inst, 'itemOrder');
    const disp = ` data-pvn="${pvn}"${(lay && lay !== 'off') ? ` data-lay="${_dsEsc(lay)}"` : ''}${(ord && ord !== 'panel') ? ` data-ord="${_dsEsc(ord)}"` : ''}`;
    const bandProp = _dsProp(inst, 'band'); // фонавая паласа: auto = чаргаванне, light/accent = яўная (лічыльнік не спажываецца)
    const bandCls = bandProp === 'light' ? 's-light' : bandProp === 'accent' ? 's-accent' : (band++ % 2 ? 's-alt' : 's-light');
    return d === 0
      ? `<section id="sec-${_dsEsc(inst.id)}"${disp} class="section ${bandCls}${cls ? ' ' + cls : ''}${eCls}"><div class="container">${ebar}${body}</div></section>`
      : `<div id="sec-${_dsEsc(inst.id)}"${disp} class="${cls}${eCls}" style="margin:20px 0 0 ${Math.min(d - 1, 3) * 14}px">${ebar}${body}</div>`; // укладзены блок — водступ па глыбіні
  };
  const folderHtml = (f, d, idx, sibN) => {
    const name = _dsEsc(_sv(f.name));
    const inner = renderKids(f.id, d + 1);
    const ebar = _dSecBar(f.id, idx > 0, idx < sibN - 1, f.enabled !== false); // ▲▼ ● ⋯ раздзела-Папкі
    const eCls = _dEdit ? ` ds-editable${f.enabled === false ? ' ds-hidden' : ''}` : '';
    // 🖊️ назва Папкі рэдагуецца НА МЕСЦЫ (як загаловак секцыі, path='name'); у edit пустая — плейсхолдэр,
    // інакш новая Папка (без імя і дзяцей) выглядала «нічога не дадалося» — жывая заўвага 2026-07-10
    const nmAttr = _edAttr(f.id, 'name', 'ml', getUI().ed_title);
    const head = (name || _dEdit)
      ? (d === 0 ? `<h2 class="section-title"${nmAttr}>${name}</h2>` : _dsGroupHead(_sv(f.name), d - 1, nmAttr))
      : '';
    // data-pvn="3" — уласныя сеткі раздзела (файлы-фота наўпрост у Папцы) таксама пад канонам 3/15;
    // сеткі ўкладзеных секцый не кранаюцца (closest-фільтр у _dsApplyDisplay — кожная секцыя апрацоўвае свае)
    return d === 0
      ? `<section id="sec-${_dsEsc(f.id)}" data-pvn="3" class="section ${band++ % 2 ? 's-alt' : 's-light'}${eCls}"><div class="container">${ebar}${_foldWrap(f.collapsed, head, inner)}</div></section>`
      : `<div id="sec-${_dsEsc(f.id)}" data-pvn="3"${eCls ? ` class="${eCls.trim()}"` : ''} style="margin:20px 0 0 ${Math.min(d - 1, 3) * 14}px">${ebar}${_foldWrap(f.collapsed, head, inner)}</div>`;
  };
  // 📎 генерычны ФайлБлок дрэва: фота — плітка з лайтбоксам (суседнія файлы зліваюцца ў адну сетку)
  const _fileTile = (f, idx, total, albId) => {
    const url = _dsEsc(_sv(f.url)); const cap = _sv(f.caption);
    // ФайлБлок = вузел sections.json → той жа радок ● ▲▼ ⓘ ⋯ (node-механізм) + рэдагавальная назва/апісанне
    if (_dEdit) return `<div id="sec-${_dsEsc(f.id)}" class="tile-item ds-editable ds-file${f.enabled === false ? ' ds-hidden' : ''}">${_dSecBar(f.id, idx > 0, idx < total - 1, f.enabled !== false)}<img src="${url}" alt="" loading="lazy"><div class="tile-caption"${_edAttr(f.id, 'caption', 'text', _dL('Назва / апісанне', 'Name / caption'))}>${_dsEsc(cap)}</div></div>`;
    return `<div class="tile-item tile-item-clickable" onclick="openLightbox('${albId}',${idx})">${cap ? `<div class="tile-caption">${_dsEsc(cap)}</div>` : ''}<img src="${url}" alt="" loading="lazy"></div>`;
  };
  const renderKids = (pid, d) => {
    const kids = kidsOf(pid).filter(x => _dEdit || (x.kind === 'folder' ? _branchHasLeaf(x.id) : x.kind === 'file' ? true : _instHasContent(x))); // мегаправіла: пустая галіна/секцыя не публікуецца. ⚠️ EDIT-байпас: у прэв'ю-рэдактары пустыя ПАКАЗВАЕМ (каб напоўніць новую ➕ секцыю; як пустыя загалоўкі вышэй)
    const out = []; let files = [];
    const flush = () => { if (files.length) {
      // 🖼 суседнія файлы адной сеткі = АЛЬБОМ лайтбокса (◀▶/swipe гартаюць у яго межах)
      const albId = 'alb' + (++_albSeq);
      _siteAlbumReg[albId] = files.map(f => ({ url: _sv(f.url), caption: _sv(f.caption) }));
      out.push(`<div class="tile-grid">${files.map((f, i) => _fileTile(f, i, files.length, albId)).join('')}</div>`); files = [];
    } };
    kids.forEach((x, i) => { if (x.kind === 'file') files.push(x); else { flush(); out.push(x.kind === 'folder' ? folderHtml(x, d, i, kids.length) : instHtml(x, d, i, kids.length)); } }); // idx/len → ▲▼ на канцах недаступныя
    flush();
    return out.join('');
  };
  mount.innerHTML = renderKids(null, 0);
  _dsApplyDisplay(mount); // 🎛 ліміт паказу + тумблер Карткі/Спіс (генерычна па data-атрыбутах)
  buildSiteNav(list.filter(x => !x.kind)); // у nav — толькі секцыі-экзэмпляры (папкі/файлы не пункты меню)
  // К3b: hero/footer — секцыі ПА-ЗА спісам рэндэру (заўсёды зверху/знізу); ● кіруе паказам
  const allInst = Array.isArray(data?.sections) ? data.sections : [];
  const heroOff = allInst.some(x => x?.type === 'hero' && x.enabled === false);
  const footOff = allInst.some(x => x?.type === 'footer' && x.enabled === false);
  document.querySelector('.hero')?.style.setProperty('display', heroOff ? 'none' : '');
  document.querySelector('.footer')?.style.setProperty('display', footOff ? 'none' : '');
  _marqueeParts = list.filter(s => s.type === 'cards').flatMap(s => (s.content?.items || []).map(it => _sv(it.title) + (_sv(it.price) ? ' ' + _sv(it.price) + ' ' + _sv(it.currency || '') : ''))).filter(Boolean); // marquee-вось
  if (typeof initMarquee === 'function') initMarquee();
  renderCartNav();
  if (exchangeRates) _applyPriceConversion();
}

// 🎛 ПРЭЗЕНТАЦЫЯ ГАЛІНЫ (генерычная, ПА-ЗА SITE_VIEWS — працуе з любой сеткай любога выгляду):
// data-pvn = N бачных пазіцый (пуста ў панэлі = 3; 0 = усе); «Паказаць яшчэ» — порцыямі па _DS_PORTION=15
// (канон 3/15, як Table-секцыі панэлі; без унутранага скролу) + «Скрыць» вяртае да N; data-lay = дэфолт
// Карткі/Спіс з панэлі, выбар наведвальніка мацнейшы (localStorage пер-секцыя, не дадзеныя)
const _DS_PORTION = 15;
function _dsApplyDisplay(mount) {
  const ui = getUI();
  mount.querySelectorAll('[data-pvn],[data-lay],[data-ord]').forEach(root => {
    // closest-фільтр: сетка належыць БЛІЖЭЙШАЙ секцыі-ўладальніку — укладзеная секцыя (матрошка)
    // апрацоўвае свае сеткі сама, інакш кнопкі «Паказаць яшчэ» дубляваліся б ад продка і нашчадка
    const grids = [...root.querySelectorAll('.grid, .tile-grid, .brands-grid, .faq-list')]
      .filter(g => (g.closest('[data-pvn],[data-lay],[data-ord]') || root) === root);
    if (root.dataset.ord) grids.forEach(grid => { // 🎲 парадак пазіцый: random/newest (групы з загалоўкамі/фолдамі не тасуем — парадак групавы)
      const items = [...grid.children];
      if (items.some(el => el.classList.contains('services-folder-heading') || el.classList.contains('ds-fold'))) return;
      if (root.dataset.ord === 'random') items.sort(() => Math.random() - 0.5).forEach(el => grid.append(el));
      else if (root.dataset.ord === 'newest') items.reverse().forEach(el => grid.append(el));
    });
    if (root.dataset.lay && grids.length) { // тумблер Карткі/Спіс
      const key = 'ttzop_lay_' + root.id;
      const btn = document.createElement('button');
      btn.className = 'ds-lay-btn'; btn.type = 'button'; btn.title = ui.view_toggle || '';
      const apply = () => { const v = localStorage.getItem(key) || root.dataset.lay; root.classList.toggle('ds-list', v === 'list'); btn.textContent = v === 'list' ? '🃏' : '☰'; };
      btn.onclick = () => { const v = (localStorage.getItem(key) || root.dataset.lay) === 'list' ? 'cards' : 'list'; try { localStorage.setItem(key, v); } catch (e) {} apply(); };
      grids[0].before(btn);
      apply();
    }
    const n = parseInt(root.dataset.pvn || '0', 10);
    if (!(n > 0) || root.classList.contains('ds-carousel')) return; // карусель = уся стужка, ліміт не дастасоўны
    grids.forEach(grid => { // ліміт паказу — пер-сетка (галіна можа мець некалькі сетак; сетка кожнай групы-фолда лічыцца сама)
      const items = [...grid.children].filter(el => !el.classList.contains('services-folder-heading') && !el.classList.contains('ds-fold')); // загалоўкі груп і самі групы не лічым і не хаваем
      if (items.length <= n) return;
      let shown = n;
      const wrap = document.createElement('div'); wrap.className = 'ds-more-wrap';
      const more = document.createElement('button'); more.type = 'button'; more.className = 'ds-more-btn';
      const less = document.createElement('button'); less.type = 'button'; less.className = 'ds-more-btn';
      less.textContent = ui.show_less || '▲';
      // Порцыі 3/15: з прэв'ю (N<15) першы клік адкрывае да 15, далей +15 за клік
      const nextShown = () => Math.min(shown < _DS_PORTION ? _DS_PORTION : shown + _DS_PORTION, items.length);
      const apply = () => {
        items.forEach((el, i) => { el.style.display = i < shown ? '' : 'none'; });
        const rest = items.length - shown;
        more.style.display = rest > 0 ? '' : 'none';
        more.textContent = `${ui.show_more || '…'} (+${nextShown() - shown})`;
        less.style.display = shown > n ? '' : 'none';
      };
      more.onclick = () => { shown = nextShown(); apply(); };
      less.onclick = () => { shown = n; apply(); grid.scrollIntoView({ block: 'nearest' }); };
      wrap.append(more, less);
      grid.after(wrap);
      apply();
    });
  });
}

// nav навбар+футэр СА СПІСА (экзэмпляры з nav:true) + фіксаваны Кантакты; сінхронна з рэальнымі секцыямі
function buildSiteNav(list) {
  const i18 = getI18n(siteData, currentLang);
  // іконка тыпу секцыі + назва (nav-ico/nav-lbl): малы экран — бургер-панэль; сярэдні — толькі іконкі ў радку; вялікі — іконкі+назвы
  const _navA = (href, ico, lbl) => `<li><a href="${href}"><span class="nav-ico">${_dsEsc(ico)}</span><span class="nav-lbl">${_dsEsc(lbl)}</span></a></li>`;
  const items = (list || []).filter(s => s.nav).map(s => _navA(`#sec-${_dsEsc(s.id)}`, _sv(s.icon) || '📄', _sv(s.navLabel) || _sv(s.title)));
  items.push(_navA('#contact', '📞', i18.nav_contact || 'Кантакты'));
  const html = items.join('');
  const nm = document.getElementById('navbar-menu'); if (nm) nm.innerHTML = html;
  const fn = document.getElementById('footer-nav'); if (fn) fn.innerHTML = html;
}

async function applySections() {
  try {
    // 🖊️ Прэв'ю чарнавіка: у рэжыме ?look=<токен> чытаем НЕапублікаваны чарнавік (worker валідуе токен, чужы → published)
    const _look = new URLSearchParams(location.search).get('look');
    const response = await fetch(API_URL + '/content/' + SITE_REPO + '/sections' + (_look ? '?draft=' + encodeURIComponent(_look) : ''));
    const data = await response.json();
    if (siteData) siteData._sections = data; // запомніць — каб перарэндэрыць пры змене мовы
    if ((Array.isArray(data?.sections) ? data.sections : []).some(x => x && x.source)) await _svcFetchTree(); // 🧷 секцыя-спасылка → падцягнуць Каталог
    _svcResolveSources(data);
    renderDynamicSections(data);
  } catch (e) {
    console.warn('sections не знойдзены', e);
  }
}

// ════════════════════════════════════════
// КОШЫК
// ════════════════════════════════════════
let cart = JSON.parse(localStorage.getItem('ttzop_cart') || '[]');

function saveCart() {
  localStorage.setItem('ttzop_cart', JSON.stringify(cart));
  renderCartNav();
}

function cartHasSubdomain() {
  return cart.some(i => i.type === 'subdomain');
}

function addToCart(id, name, type = '', price = '', currency = '') {
  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty = (existing.qty || 1) + 1;
  } else {
    cart.push({ id, name, qty: 1, type, price, currency });
  }
  saveCart();
  // Анімацыя кнопкі
  const btn = document.getElementById(`cart-btn-${id}`);
  if (btn) {
    btn.textContent = getUI().cart_added_ok;
    btn.style.background = 'var(--success, #22c55e)';
    setTimeout(() => {
      btn.style.background = 'var(--accent,#f97316)';
      updateCartButtons();
    }, 1000);
  }
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
  updateCartButtons();
}

function updateCartButtons() {
  document.querySelectorAll('[id^="cart-btn-"]').forEach(btn => {
    const id = btn.id.replace('cart-btn-', '');
    const item = cart.find(i => i.id === id);
    if (item) {
      btn.textContent = getUI().cart_added.replace('{n}', item.qty);
    } else {
      btn.textContent = getUI().add_to_cart;
      btn.style.background = 'var(--accent,#f97316)';
    }
  });
}

// 🛒 навбар-іконка кошыка: колькасць у бэйджы + аўтаабнаўленне адкрытай мадалкі (замяніў ніжні cart-bar)
function renderCartNav() {
  const btn = document.getElementById('nav-cart');
  if (btn) {
    const totalItems = cart.reduce((s, i) => s + (i.qty || 1), 0);
    const cnt = btn.querySelector('.cart-count');
    if (cnt) cnt.textContent = totalItems;
    btn.style.display = cart.length ? '' : 'none';
  }
  if (document.getElementById('cart-modal')) { // мадалка адкрыта — перарэндзіць цела (ці закрыць, калі спусцелі)
    if (cart.length) renderCartModalBody();
    else closeCartModal();
  }
}

// сума цэн кошыка па валютах (цэны — радкі, могуць быць нялічбавыя → парсім, нялічбавыя не лічым)
function _cartSums() {
  const byCur = {};
  cart.forEach(i => {
    const n = parseFloat(String(i.price ?? '').replace(',', '.').replace(/[^\d.]/g, ''));
    if (!isNaN(n) && n > 0) { const c = i.currency || ''; byCur[c] = (byCur[c] || 0) + n * (i.qty || 1); }
  });
  return byCur;
}
function _fmtMoney(n) { return (Math.round(n * 100) / 100).toString(); }

// C2b: кошт дастаўкі па зоне выбранага адрасу (freeAbove → бясплатна). Вяртае null калі дастаўка непрымяняльная.
function _cartDeliveryCalc() {
  const dcfg = siteData?.delivery;
  if (!_cabinetSession || !dcfg?.enabled || !Array.isArray(dcfg.zones) || !dcfg.zones.length) return null;
  const addrs = _cabinetSession.addresses || [];
  if (!addrs.length) return null;
  const sel = document.getElementById('cart-addr-select');
  const chosen = (sel ? addrs.find(a => a.text === sel.value) : null) || addrs.find(a => a.isDefault) || addrs[0];
  const zone = chosen ? dcfg.zones.find(z => z.id === chosen.zoneId) : null;
  if (!zone) return { address: chosen?.text || '', cost: null, zoneName: '', currency: dcfg.currency || '' }; // адрас без зоны — кошт не вызначаны
  const cur = dcfg.currency || '';
  const sub = _cartSums()[cur] || 0;
  const free = dcfg.freeAbove != null && dcfg.freeAbove !== '' && sub >= dcfg.freeAbove;
  return { address: chosen?.text || '', cost: free ? 0 : (parseFloat(zone.cost) || 0), zoneName: zone.name, currency: cur };
}

let _cartAddrSel = null; // выбраны адрас у мадалцы (text) — перажывае пераразлік кошту
function openCartModal() {
  if (!cart.length) return;
  _cartAddrSel = null;
  document.getElementById('cart-modal')?.remove();
  const modal = document.createElement('div');
  modal.id = 'cart-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px';
  modal.addEventListener('click', e => { if (e.target === modal) closeCartModal(); }); // клік па фоне = закрыць
  modal.innerHTML = `<div style="background:var(--surface,#181c27);border:1px solid var(--border,#2a2f45);border-radius:16px;max-width:480px;width:100%;max-height:85vh;display:flex;flex-direction:column;overflow:hidden;position:relative">
      <button onclick="closeCartModal()" aria-label="✕" style="position:absolute;top:14px;right:14px;background:none;border:none;color:#6b7280;cursor:pointer;font-size:1.2rem;line-height:1;padding:4px;z-index:1">✕</button>
      <div id="cart-modal-body" style="display:flex;flex-direction:column;overflow:hidden;flex:1"></div>
    </div>`;
  document.body.appendChild(modal);
  renderCartModalBody();
  // залагінены → падцягнуць свежыя адрасы (маглі дадаць у кабінеце) і перарэндзіць селектар
  if (_cabinetSession) {
    fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'portal_me', repo: SITE_REPO, token: _cabinetSession.token }) })
      .then(r => r.ok ? r.json() : null).then(me => { if (me && Array.isArray(me.addresses)) { _cabinetSession.addresses = me.addresses; if (document.getElementById('cart-modal-body')) renderCartModalBody(); } }).catch(() => {});
  }
}
function closeCartModal() { document.getElementById('cart-modal')?.remove(); }

function renderCartModalBody() {
  const body = document.getElementById('cart-modal-body');
  if (!body) return;
  const ui = getUI();
  const totalItems = cart.reduce((s, i) => s + (i.qty || 1), 0);
  // радкі тавараў: назва, цана, +/−, колькасць, ✕
  const rowsHtml = cart.map((item, idx) => {
    const priced = item.price ? `${item.price}${item.currency ? ' ' + item.currency : ''}` : '';
    return `<div style="display:flex;align-items:center;gap:8px;padding:10px 0;border-bottom:1px solid var(--border,#2a2f45)">
      <div style="flex:1;min-width:0">
        <div style="font-size:0.92rem;color:var(--text,#e8eaf0);overflow:hidden;text-overflow:ellipsis">${_svcEsc(item.name)}</div>
        ${priced ? `<div style="font-size:0.8rem;color:var(--muted,#6b7280)">${_svcEsc(priced)}</div>` : ''}
      </div>
      <button onclick="cartDecQty(${idx})" style="width:28px;height:28px;background:var(--surface2,#1e2335);border:1px solid var(--border,#2a2f45);border-radius:6px;color:var(--text,#e8eaf0);cursor:pointer;font-size:1rem;line-height:1">−</button>
      <span style="min-width:24px;text-align:center;font-weight:700;color:var(--text,#e8eaf0)">${item.qty || 1}</span>
      <button onclick="cartIncQty(${idx})" style="width:28px;height:28px;background:var(--surface2,#1e2335);border:1px solid var(--border,#2a2f45);border-radius:6px;color:var(--text,#e8eaf0);cursor:pointer;font-size:1rem;line-height:1">+</button>
      <button onclick="cartRemoveItem(${idx})" title="${ui.cart_remove}" style="width:28px;height:28px;background:none;border:1px solid #ef4444;border-radius:6px;color:#ef4444;cursor:pointer;font-size:0.85rem;line-height:1">✕</button>
    </div>`;
  }).join('');
  // сумы па валютах + дастаўка па зоне выбранага адрасу (C2b)
  const sums = _cartSums();
  const curs = Object.keys(sums);
  const dc = _cartDeliveryCalc();
  const delivery = (dc && dc.cost != null) ? { cost: dc.cost, currency: dc.currency } : null;
  let totalsHtml = '';
  if (curs.length) {
    const line = (label, val, cur, strong) => `<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:${strong ? '1rem' : '0.9rem'};${strong ? 'font-weight:700;color:var(--text,#e8eaf0)' : 'color:var(--muted,#6b7280)'}"><span>${label}</span><span>${_fmtMoney(val)}${cur ? ' ' + cur : ''}</span></div>`;
    totalsHtml = '<div style="padding:12px 0 0">';
    curs.forEach(c => { totalsHtml += line(ui.cart_subtotal, sums[c], c, false); });
    if (delivery) {
      totalsHtml += line(ui.cart_delivery, delivery.cost, delivery.currency, false);
      // дастаўку дадаём да суме той жа валюты (ці асобным радком, калі валюта іншая)
      if (sums[delivery.currency] != null) totalsHtml += line(ui.cart_total, sums[delivery.currency] + delivery.cost, delivery.currency, true);
      else totalsHtml += line(ui.cart_total, delivery.cost, delivery.currency, true);
      curs.filter(c => c !== delivery.currency).forEach(c => { totalsHtml += line(ui.cart_total, sums[c], c, true); });
    } else {
      curs.forEach(c => { totalsHtml += line(ui.cart_total, sums[c], c, true); });
    }
    totalsHtml += '</div>';
  }
  // C2a: секцыя адрасу дастаўкі — толькі калі кліент залагінены (з яго кнігі адрасоў; выбар → register_order)
  let addrHtml = '';
  if (_cabinetSession) {
    const addrs = _cabinetSession.addresses || [];
    if (addrs.length) {
      const defId = (addrs.find(a => a.isDefault) || addrs[0]).id;
      addrHtml = `<div style="padding:12px 0 0">
        <label style="display:block;font-size:0.78rem;font-weight:600;color:var(--muted,#6b7280);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px">📦 ${ui.cart_address}</label>
        <select id="cart-addr-select" onchange="_cartAddrSel=this.value;renderCartModalBody()" style="width:100%;padding:10px 12px;background:var(--surface2,#1e2335);border:1px solid var(--border,#2a2f45);border-radius:8px;color:var(--text,#e8eaf0);font-size:0.9rem">
          ${addrs.map(a => `<option value="${_svcEsc(a.text)}"${(_cartAddrSel != null ? a.text === _cartAddrSel : a.id === defId) ? ' selected' : ''}>${_svcEsc(a.label ? a.label + ' — ' + a.text : a.text)}</option>`).join('')}
        </select></div>`;
    } else {
      addrHtml = `<div style="padding:12px 0 0"><button onclick="closeCartModal();openCabinet('cabinet')" style="width:100%;padding:10px;background:none;border:1px dashed var(--border,#2a2f45);border-radius:8px;color:var(--accent,#f97316);cursor:pointer;font-size:0.85rem">📦 ${ui.cart_addr_none}</button></div>`;
    }
  }
  body.innerHTML = `
    <div style="padding:24px 24px 12px;border-bottom:1px solid var(--border,#2a2f45)">
      <div style="font-family:'Unbounded',sans-serif;font-size:1rem;font-weight:700;color:var(--text,#e8eaf0)">🛒 ${ui.cart_title.replace('{n}', totalItems)}</div>
    </div>
    <div style="overflow-y:auto;padding:8px 24px 0;flex:1">
      ${rowsHtml}
      ${addrHtml}
      ${totalsHtml}
    </div>
    <div style="padding:16px 24px;border-top:1px solid var(--border,#2a2f45);display:flex;gap:8px;justify-content:space-between">
      <button onclick="clearCart()" style="padding:10px 16px;background:none;border:1px solid var(--border,#2a2f45);border-radius:8px;color:var(--muted,#6b7280);cursor:pointer;font-size:0.85rem">${ui.cart_clear}</button>
      <button onclick="cartCheckout()" style="padding:10px 20px;background:var(--accent,#f97316);color:#fff;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:0.9rem">${ui.cart_order}</button>
    </div>`;
}
// «Аформіць»: запомніць выбраны адрас + налічаны кошт/зону дастаўкі → адкрыць звычайны order-flow
function cartCheckout() {
  const sel = document.getElementById('cart-addr-select');
  orderDelivery = sel ? sel.value : '';
  const dc = _cartDeliveryCalc();
  orderDeliveryCost = (dc && dc.cost != null) ? dc.cost : null;
  orderDeliveryZone = (dc && dc.zoneName) ? dc.zoneName : '';
  closeCartModal();
  openOrderModal();
}

function cartIncQty(idx) {
  if (idx < 0 || idx >= cart.length) return;
  cart[idx].qty = (cart[idx].qty || 1) + 1;
  saveCart();
  updateCartButtons();
}

function cartDecQty(idx) {
  if (idx < 0 || idx >= cart.length) return;
  cart[idx].qty = (cart[idx].qty || 1) - 1;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  saveCart();
  updateCartButtons();
}

function cartRemoveItem(idx) {
  cart.splice(idx, 1);
  saveCart();
  updateCartButtons();
}

function clearCart() {
  cart = [];
  saveCart();
  updateCartButtons();
}

// ════════════════════════════════════════
// ПАСЛУГІ
// ════════════════════════════════════════
function _svcEsc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

function initMap(data) {
  const container = document.getElementById('map-container');
  if (!container) return;
  // мапа галоўнага офіса (праекцыя Структуры кампаніі); fallback на стары data.mapLat/Lng
  const cm = data.company?.map;
  const rawLat = (cm && cm.lat != null) ? cm.lat : data.mapLat;
  const rawLng = (cm && cm.lng != null) ? cm.lng : data.mapLng;
  if (rawLat == null || rawLng == null || rawLat === '' || rawLng === '') return;

  const lat = parseFloat(rawLat);
  const lng = parseFloat(rawLng);
  const zoom = parseInt((cm && cm.zoom) || data.mapZoom) || 16;

  const mapsLink = document.getElementById('google-maps-link');
  if (mapsLink) mapsLink.href = `https://www.google.com/maps?q=${lat},${lng}`;

  const map = L.map('map-container', { preferCanvas: true }).setView([lat, lng], zoom);
  setTimeout(() => map.invalidateSize(), 300);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map);

  L.marker([lat, lng])
    .addTo(map)
    .bindPopup((cn => (cn && typeof cn === 'object') ? (cn[currentLang] || cn[getPrimaryLang(data)] || Object.values(cn).find(Boolean) || '') : (cn || getI18n(data, currentLang).companyName || ''))(data.company?.name))
    .openPopup();
}

// ════════════════════════════════════════
// 👤 КАБІНЕТ — аверлэй на старонцы сайта (iframe portal.html; ✕ проста закрывае, сесія жыве 30 дзён)
// ════════════════════════════════════════
function openCabinet(view = 'chat') {
  closeCabinetMenu();
  if (document.getElementById('cabinet-overlay')) return;
  const ov = document.createElement('div');
  ov.id = 'cabinet-overlay';
  // чысцейшае акно: адна рамка (сам iframe), БЕЗ знешняга круглага ✕ — крыжык жыве ў загалоўку кабінета
  // (portal.html дэтэктуе iframe і кліча parent.closeCabinet). Мабілка = на ўвесь экран (CSS у style.css).
  // #view — які від паказаць пасля ўваходу (chat / cabinet); portal.html чытае location.hash
  ov.innerHTML = `<div class="cabinet-frame"><iframe src="/portal.html#${view === 'cabinet' ? 'cabinet' : 'chat'}" title="Кабінет"></iframe></div>`;
  ov.addEventListener('click', e => { if (e.target === ov) closeCabinet(); }); // клік па фоне = закрыць
  document.body.appendChild(ov);
}
function closeCabinet() { document.getElementById('cabinet-overlay')?.remove(); setTimeout(() => { _cabinetRefreshSession(); _cabinetRefreshUnread(); bookIntentApply(); }, 500); } // remove (не hide) — спыняе палінг; пасля закрыцця абнаўляем Імя/email/адрасы (маглі змяніць у кабінеце) + непрачытаныя
// 💬 чат пра пазіцыю каталога (генерычна: pfxKey = UI_T-ключ тэксту прадзапаўнення — запіс/запыт);
// прадзапаўненне праз localStorage (iframe same-origin) → кабінет-чат
function chatAboutItem(name, pfxKey) {
  try { localStorage.setItem('ttzop_chat_prefill', (getUI()[pfxKey] || '{name}').replace('{name}', name)); } catch {}
  openCabinet('chat');
}

// ═══ 📅 БРОНЬ З КАРТКІ — праз УНІВЕРСАЛЬНУЮ МАДАЛКУ (assets/js/slots-modal.js) ═══
// Сайт дае толькі cfg: свой i18n, свой siteConfirm і хукі. Той жа кампанент выкарыстоўвае
// кабінет (перанос запісу) — рэндэр слотаў жыве ў адным месцы.
const _BK_DAYS = 14; // колькі дзён паказваем у пікеры
const _bkLabels = () => { const ui = getUI(); return { title: ui.book_title, date: ui.book_date, time: ui.book_time, loading: ui.book_loading, none: ui.book_none, confirm: ui.book_confirm, done: ui.book_done, taken: ui.book_taken, err: ui.book_err, seats: ui.book_seats, full: ui.book_full }; }; // 👥 seats/full — групавыя паслугі
function bookItem(itemId, name, startDate) {
  const ui = getUI();
  openSlotsModal({ api: API_URL, repo: SITE_REPO, serviceId: itemId, name, lang: currentUiLang, days: _BK_DAYS, startDate,
    token: () => localStorage.getItem('ttzop_portal_token'),
    labels: _bkLabels(),
    confirm: (msg, onOk) => siteConfirm(msg, onOk, false),
    onNeedLogin: it => { // бронь патрабуе сесіі: намер перажывае ўваход (той жа патэрн, што ttzop_sub_intent)
      try { localStorage.setItem('ttzop_book_intent', JSON.stringify({ id: it.serviceId, name: it.name, date: it.date })); } catch {}
      siteConfirm(ui.book_login || '', () => openCabinet('chat'), false);
    },
    onDone: () => openCabinet('chat') });
}
// намер броні перажыў уваход у кабінет → адкрываем той жа дзень (слоты маглі змяніцца — не бранюем моўчкі)
function bookIntentApply() {
  let it = null;
  try { it = JSON.parse(localStorage.getItem('ttzop_book_intent') || 'null'); localStorage.removeItem('ttzop_book_intent'); } catch {}
  if (!it || !localStorage.getItem('ttzop_portal_token')) return;
  bookItem(it.id, it.name, it.date);
}
// 🔁 S1: «Падпісацца» на картцы → намер у localStorage (як chat_prefill) → кабінет; пасля ўваходу
// portal.html сам пацвердзіць (portalSubIntentApply) і аформіць падпіску (portal_subscribe)
function subscribeItem(id, name) {
  const ta = document.createElement('textarea'); ta.innerHTML = name || ''; // onclick-атрыбут нясе HTML-энтыці (&#39; і інш.) — дэкод, каб confirm кабінета паказваў чысты тэкст
  try { localStorage.setItem('ttzop_sub_intent', JSON.stringify({ id, name: ta.value })); } catch {}
  openCabinet('cabinet');
}
// 🔁 S2: падпіска «Свой сайт» → існуючы order-flow стварэння сайта (паддамен → email-код → аўта-стварэнне);
// падпіску ў D1 заводзіць register_order па пазіцыі кошыка (fulfil=subscription правяраецца з CONTENT KV)
let _siteOrderItemId = ''; // якую менавіта «Свой сайт»-картку клікнуў кліент — па ЁЙ ідзе праверка паддамена (кошык НЕ чапаем і НЕ аглядаем: там могуць ляжаць розныя тавары кліента)
function siteSubscribeOrder(id, name, price, currency) {
  const ta = document.createElement('textarea'); ta.innerHTML = name || '';
  _siteOrderItemId = id;
  if (!cart.find(c => c.id === id)) addToCart(id, ta.value, 'subdomain', price, currency); // гард: паўторны клік не павялічвае qty
  openOrderModal();
}
// абнавіць сесію навбара з портала (Імя/email/адрасы маглі змяніцца ў кабінеце) — «адразу» пасля вяртання на сайт
async function _cabinetRefreshSession() {
  if (!_cabinetSession) return;
  try {
    const res = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'portal_me', repo: SITE_REPO, token: _cabinetSession.token }) });
    if (!res.ok) return;
    const me = await res.json();
    _cabinetSession.email = me.email || _cabinetSession.email;
    _cabinetSession.name = (me.name && me.name !== me.email) ? me.name : '';
    _cabinetSession.addresses = Array.isArray(me.addresses) ? me.addresses : [];
    if (me.email) localStorage.setItem('ttzop_portal_email', me.email); // email мог змяніцца ў кабінеце
    updateCabinetNav();
  } catch { /* сетка — застаецца папярэдняе */ }
}

// ── Выпадаючае меню кнопкі «Кабінет»: 💬 Чат · 👤 Кабінет · 🚪 Выйсці (Выйсці — толькі калі залагінены) ──
function toggleCabinetMenu(ev) {
  if (ev) ev.preventDefault();
  if (document.getElementById('cabinet-menu')) { closeCabinetMenu(); return; }
  const anchor = document.getElementById('nav-cabinet');
  if (!anchor) return;
  const ui = getUI();
  const menu = document.createElement('div');
  menu.id = 'cabinet-menu';
  menu.style.cssText = 'position:absolute;z-index:10001;min-width:170px;background:var(--surface,#181c27);border:1px solid var(--border,#2a2f45);border-radius:10px;box-shadow:0 12px 32px rgba(0,0,0,0.4);padding:6px;overflow:hidden';
  const item = (icon, label, onclick, danger) => `<button onclick="${onclick}" style="display:flex;align-items:center;gap:10px;width:100%;padding:10px 12px;background:none;border:none;border-radius:7px;color:${danger ? '#ef4444' : 'var(--text,#e8eaf0)'};cursor:pointer;font-size:0.9rem;text-align:left" onmouseenter="this.style.background='var(--surface2,#1e2335)'" onmouseleave="this.style.background='none'"><span style="font-size:1.05rem">${icon}</span> ${label}</button>`;
  menu.innerHTML =
    item('💬', ui.cab_chat, "openCabinet('chat')") +
    item('👤', ui.cab_cabinet, "openCabinet('cabinet')") + // cab_cabinet у UI_T (nav_cabinet жыве ў STATIC_I18N → быў undefined)
    (_cabinetSession ? item('🚪', ui.cab_logout, 'cabinetLogout()', true) : '');
  // пазіцыя пад кнопкай (справа выраўнавана, каб не выходзіла за край)
  const r = anchor.getBoundingClientRect();
  menu.style.top = (r.bottom + window.scrollY + 6) + 'px';
  menu.style.left = Math.max(8, r.right + window.scrollX - 170) + 'px';
  document.body.appendChild(menu);
  setTimeout(() => document.addEventListener('mousedown', _cabinetMenuOutside), 0); // клік па-за меню = закрыць
}
function _cabinetMenuOutside(e) {
  if (!e.target.closest('#cabinet-menu') && e.target.id !== 'nav-cabinet' && !e.target.closest('#nav-cabinet')) closeCabinetMenu();
}
function closeCabinetMenu() {
  document.getElementById('cabinet-menu')?.remove();
  document.removeEventListener('mousedown', _cabinetMenuOutside);
}
// кастомнае пацверджанне сайта (сістэмныя confirm/alert у прадукце ЗАБАРОНЕНЫ; люстэрка portalConfirm кабінета)
function siteConfirm(msg, onOk, danger) {
  document.getElementById('site-confirm')?.remove();
  const ov = document.createElement('div');
  ov.id = 'site-confirm';
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:10002;display:flex;align-items:center;justify-content:center;padding:20px';
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  ov.innerHTML = `<div style="background:var(--surface,#181c27);border:1px solid var(--border,#2a2f45);border-radius:12px;max-width:340px;width:100%;padding:18px 18px 14px;box-shadow:0 16px 48px rgba(0,0,0,0.5)">
    <div style="font-size:0.92rem;line-height:1.5;white-space:pre-line;color:var(--text,#e8eaf0)">${esc(msg)}</div>
    <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px;align-items:center">
      <button id="sc-no" style="background:none;border:none;color:var(--muted,#9aa1ad);cursor:pointer;font-size:1rem;padding:8px 12px">✕</button><!-- моўна-нейтральны знак — без новага i18n-ключа -->
      <button id="sc-ok" style="background:${danger ? 'var(--error,#ef4444)' : 'var(--accent,#f97316)'};color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:600;font-size:0.9rem;padding:8px 20px">OK</button>
    </div></div>`;
  ov.addEventListener('click', e => { if (e.target === ov) ov.remove(); }); // фон = скасаваць
  ov.querySelector('#sc-no').addEventListener('click', () => ov.remove());
  ov.querySelector('#sc-ok').addEventListener('click', () => { ov.remove(); onOk(); });
  document.body.appendChild(ov);
}
function cabinetLogout() {
  closeCabinetMenu();
  const ui = getUI();
  siteConfirm(ui.cab_logout_confirm, _cabinetLogoutDo, true); // кастомны дыялог замест сістэмнага confirm
}
function _cabinetLogoutDo() {
  localStorage.removeItem('ttzop_portal_token');
  localStorage.removeItem('ttzop_portal_email');
  _cabinetSession = null; _cabinetUnread = 0;
  if (_cabinetPollTimer) { clearInterval(_cabinetPollTimer); _cabinetPollTimer = null; }
  closeCabinet();
  // навбар вяртаецца да звычайнай кнопкі «Кабінет»: email/бэйдж прыбраць, span верне i18n
  const a = document.getElementById('nav-cabinet');
  if (a) { a.querySelector('.cab-unread')?.remove(); const sp = a.querySelector('[data-i18n="nav_cabinet"]'); if (sp) sp.textContent = ui.cab_cabinet; }
}

// ── Наведвальнік з захаванай сесіяй: замест кнопкі «Кабінет» паказваем email + бэйдж непрачытаных (як імя+бэйдж у панэлі) ──
let _cabinetSession = null, _cabinetUnread = 0, _cabinetPollTimer = null;
async function initCabinetNav() {
  const token = localStorage.getItem('ttzop_portal_token');
  const email = localStorage.getItem('ttzop_portal_email') || '';
  if (!token || !email) return; // браўзер не памятае наведвальніка → застаецца звычайная кнопка
  try {
    const res = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'portal_me', repo: SITE_REPO, token }) });
    if (!res.ok) return; // сесія пратэрмінавана → кнопка «Кабінет» без змен
    const me = await res.json().catch(() => ({}));
    // name паказваем толькі калі гэта РЭАЛЬНАЕ імя (payload вяртае email як fallback name) — навбар прыярытэт: Імя → email
    _cabinetSession = { email, token, name: (me.name && me.name !== me.email) ? me.name : '', addresses: Array.isArray(me.addresses) ? me.addresses : [] };
    updateCabinetNav();
    _cabinetRefreshUnread();
    if (!_cabinetPollTimer) _cabinetPollTimer = setInterval(_cabinetRefreshUnread, 60000); // палінг як панэльны _chatPollUnread (60с)
  } catch { /* сеткавая памылка — застаецца кнопка «Кабінет» */ }
}
async function _cabinetRefreshUnread() {
  if (!_cabinetSession) return;
  try {
    const res = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'portal_unread', repo: SITE_REPO, token: _cabinetSession.token }) });
    if (!res.ok) return;
    const d = await res.json();
    _cabinetUnread = d.unread || 0;
    updateCabinetNav();
  } catch { /* непрачытаныя абновяцца на наступным палінгу */ }
}
function updateCabinetNav() {
  const a = document.getElementById('nav-cabinet');
  if (!a || !_cabinetSession) return;
  const span = a.querySelector('[data-i18n="nav_cabinet"]');
  if (span) span.textContent = _cabinetSession.name || _cabinetSession.email; // Імя → email замест «Кабінет» (перакрывае i18n; applyLanguage перавыклікае гэту функцыю)
  let badge = a.querySelector('.cab-unread');
  if (_cabinetUnread > 0) {
    if (!badge) { badge = document.createElement('span'); badge.className = 'cab-unread'; badge.style.cssText = 'display:inline-block;min-width:16px;height:16px;padding:0 4px;margin-left:5px;border-radius:8px;background:#f97316;color:#fff;font-size:0.68rem;line-height:16px;text-align:center;font-weight:700;vertical-align:middle'; a.appendChild(badge); }
    badge.textContent = _cabinetUnread > 99 ? '99+' : _cabinetUnread;
    badge.style.display = 'inline-block';
  } else if (badge) { badge.style.display = 'none'; }
}

function initForm(data) {
  const key = document.getElementById('w3f-key');
  if (key && data.web3formsKey) key.value = data.web3formsKey;

  // поле «аўто» — наладжвальнае (універсальны шаблон, не толькі аўтасэрвіс): settings.contactForm.car === false → схаваць
  const carField = document.getElementById('form-car-field');
  if (carField && data.contactForm?.car === false) carField.style.display = 'none';

  const form = document.getElementById('booking-form');
  if (!form) return;

  // Web3Forms-канал АДКЛЮЧАНЫ па змаўчанні: заяўкі ідуць праз чат Кабінета (панэль бачыць усё);
  // вяртанне старой формы-ліста = settings.contactForm.web3 === true (код/ключ пакінуты знарок)
  const chatCta = document.getElementById('contact-chat-cta');
  if (data.contactForm?.web3 !== true) {
    form.style.display = 'none';
    if (chatCta) chatCta.style.display = '';
    return; // слухач submit не патрэбны
  }

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = '...';
    btn.disabled = true;
    try {
      const formData = new FormData(form);
      const response = await fetch(form.action, { method: 'POST', body: formData });
      const result = await response.json();
      btn.textContent = result.success ? '✓' : getUI().form_err_send;
      if (result.success) form.reset();
    } catch (e) {
      btn.textContent = getUI().form_err_conn;
    }
    setTimeout(() => { btn.textContent = originalText; btn.disabled = false; }, 3000);
  });
}

function initNavbar() {
  const burger = document.getElementById('burger');
  const menu = document.getElementById('navbar-menu');
  const backdrop = document.getElementById('nav-backdrop');
  if (!burger || !menu) return;

  // ☰ дзейнічае па шырыні (як панэль кіравання): мабілка = drawer, сярэдні = разгарнуць рэйл да назваў, шырокі = згарнуць да іконак
  const mqMobile = window.matchMedia('(max-width: 479px)');
  const mqMedium = window.matchMedia('(min-width: 480px) and (max-width: 800px)');
  const closeDrawer = () => { menu.classList.remove('open'); backdrop && backdrop.classList.remove('show'); };

  burger.addEventListener('click', () => {
    if (mqMobile.matches) {                              // мабілка: высунуць/схаваць drawer
      const open = menu.classList.toggle('open');
      backdrop && backdrop.classList.toggle('show', open);
    } else if (mqMedium.matches) {                       // сярэдні: рэйл-іконкі ↔ разгорнуты з назвамі
      document.body.classList.toggle('nav-expanded');
    } else {                                             // шырокі: панэль з назвамі ↔ згорнуты рэйл-іконкі
      document.body.classList.toggle('nav-collapsed');
    }
  });

  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => { closeDrawer(); document.body.classList.remove('nav-expanded'); }); // выбар секцыі закрывае часовыя станы
  });
  backdrop && backdrop.addEventListener('click', closeDrawer);

  document.addEventListener('click', e => {
    const outside = !e.target.closest('#navbar-menu') && !e.target.closest('#burger');
    if (outside && mqMobile.matches) closeDrawer();                                  // клік па-за — закрыць drawer
    if (outside && mqMedium.matches) document.body.classList.remove('nav-expanded'); // ...і згарнуць разгорнуты рэйл
    if (!e.target.closest('#site-lang-picker')) {
      document.querySelector('#site-lang-picker .lang-dd-menu')?.classList.remove('open');
    }
  });

  // змена брэйкпойнта — скід часовых станаў, каб панэль не «завісла» ў чужым рэжыме
  [mqMobile, mqMedium].forEach(mq => mq.addEventListener('change', () => { closeDrawer(); document.body.classList.remove('nav-expanded'); }));
}

// ════════════════════════════════════════
// ФОРМА ЗАМОВЫ — МАДАЛЬНАЕ АКНО
// ════════════════════════════════════════
const API_URL = 'https://ttzop-api.truetensites.workers.dev';
const SITE_REPO = window.location.hostname.split('.')[0];

const COUNTRY_TO_LANG = {
  BY: 'be',
  UA: 'uk',
  RU: 'ru', KZ: 'ru', KG: 'ru', TJ: 'ru', TM: 'ru', UZ: 'ru', AM: 'ru', AZ: 'ru', GE: 'ru', MD: 'ru',
  PL: 'pl',
  DE: 'de', AT: 'de', CH: 'de', LI: 'de',
  FR: 'fr', LU: 'fr', MC: 'fr',
  ES: 'es', MX: 'es', AR: 'es', CO: 'es', CL: 'es', PE: 'es', VE: 'es', EC: 'es', GT: 'es', CU: 'es', BO: 'es', DO: 'es', HN: 'es', PY: 'es', SV: 'es', NI: 'es', CR: 'es', PA: 'es', UY: 'es',
  IT: 'it', SM: 'it', VA: 'it',
  PT: 'pt', BR: 'pt', AO: 'pt', MZ: 'pt', CV: 'pt',
  CN: 'zh', TW: 'zh', HK: 'zh', MO: 'zh', SG: 'zh',
  SA: 'ar', AE: 'ar', EG: 'ar', MA: 'ar', DZ: 'ar', TN: 'ar', LY: 'ar', IQ: 'ar', SY: 'ar', JO: 'ar', LB: 'ar', KW: 'ar', QA: 'ar', BH: 'ar', OM: 'ar', YE: 'ar', PS: 'ar', SD: 'ar',
  HU: 'hu',
};

async function detectLangByIp(activeLangs) {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'get_country', repo: SITE_REPO }),
    });
    const { country } = await res.json();
    const lang = COUNTRY_TO_LANG[country];
    return (lang && activeLangs.includes(lang)) ? lang : null;
  } catch {
    return null;
  }
}


let orderStep = 'privacy'; // privacy → form → verify → [intake] → done
let orderIntake = null;    // №3а: адказы анкеты «Свой сайт» (null = прапушчана)
let orderEmail = '';
let orderDelivery = '', orderDeliveryCost = null, orderDeliveryZone = ''; // C2a/C2b: адрас + налічаны кошт + зона дастаўкі
let privacyVersion = '';

async function openOrderModal() {
  // Загружаем палітыку АДНЫМ запытам праз worker/KV (Фаза 1b): метаданыя + бягучы HTML разам (projection)
  try {
    const res = await fetch(API_URL + '/content/' + SITE_REPO + '/privacy');
    const meta = await res.json();
    privacyVersion = meta?.current || '';
    const privacyHtml = meta?.html ? meta.html : `<p>${getUI().privacy_unavailable}</p>`;

    showModal('privacy', privacyHtml);
  } catch(e) {
    showModal('privacy', `<p>${getUI().privacy_unavailable}</p>`);
  }
}

function showModal(step, privacyHtml = '') {
  document.getElementById('order-modal')?.remove();

  const modal = document.createElement('div');
  modal.id = 'order-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px';

  if (step === 'privacy') {
    modal.innerHTML = `
      <div style="background:#181c27;border:1px solid #2a2f45;border-radius:16px;max-width:600px;width:100%;max-height:80vh;display:flex;flex-direction:column;overflow:hidden;position:relative">
        <button onclick="closeOrderModal()" style="position:absolute;top:14px;right:14px;background:none;border:none;color:#6b7280;cursor:pointer;font-size:1.2rem;line-height:1;padding:4px;border-radius:4px;z-index:1" onmouseenter="this.style.color='#e8eaf0'" onmouseleave="this.style.color='#6b7280'">✕</button>
        <div style="padding:24px 24px 16px;border-bottom:1px solid #2a2f45">
          <div style="font-family:'Unbounded',sans-serif;font-size:1rem;font-weight:700;color:#e8eaf0;margin-bottom:4px">${getUI().privacy_title}</div>
          <div style="font-size:0.85rem;color:#6b7280">${getUI().privacy_subtitle}</div>
        </div>
        <div style="overflow-y:auto;padding:24px;flex:1;color:#e8eaf0;line-height:1.7;font-size:0.9rem">
          ${privacyHtml}
        </div>
        <div style="padding:16px 24px;border-top:1px solid #2a2f45;display:flex;align-items:center;gap:16px">
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:0.9rem;color:#e8eaf0;flex:1">
            <input type="checkbox" id="privacy-agree-check" onchange="document.getElementById('privacy-agree-btn').disabled=!this.checked" style="width:18px;height:18px;accent-color:#f97316" />
            ${getUI().privacy_agree}
          </label>
          <button onclick="closeOrderModal()" style="padding:10px 16px;background:none;border:1px solid #2a2f45;border-radius:8px;color:#6b7280;cursor:pointer;font-size:0.85rem;white-space:nowrap">${getUI().privacy_decline}</button>
          <button id="privacy-agree-btn" disabled onclick="showModal('form')" style="padding:10px 20px;background:#f97316;color:#fff;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:0.9rem;white-space:nowrap;opacity:0.5" onmouseenter="this.style.opacity=this.disabled?'0.5':'0.9'" onmouseleave="this.style.opacity=this.disabled?'0.5':'1'">${getUI().privacy_continue}</button>
        </div>
      </div>
    `;
    // Актывуем кнопку калі чэкбокс адзначаны
    modal.querySelector('#privacy-agree-check').addEventListener('change', function() {
      const btn = modal.querySelector('#privacy-agree-btn');
      btn.disabled = !this.checked;
      btn.style.opacity = this.checked ? '1' : '0.5';
    });

  } else if (step === 'form') {
    const cartSummary = cart.map(i => `${i.name}${i.qty > 1 ? ' ×' + i.qty : ''}`).join(', ');
    const needSubdomain = cartHasSubdomain();
    modal.innerHTML = `
      <div style="background:#181c27;border:1px solid #2a2f45;border-radius:16px;max-width:480px;width:100%;overflow:hidden;position:relative">
        <button onclick="closeOrderModal()" style="position:absolute;top:14px;right:14px;background:none;border:none;color:#6b7280;cursor:pointer;font-size:1.2rem;line-height:1;padding:4px;border-radius:4px;z-index:1" onmouseenter="this.style.color='#e8eaf0'" onmouseleave="this.style.color='#6b7280'">✕</button>
        <div style="padding:24px 24px 16px;border-bottom:1px solid #2a2f45">
          <div style="font-family:'Unbounded',sans-serif;font-size:1rem;font-weight:700;color:#e8eaf0">${getUI().form_title}</div>
          <div style="font-size:0.85rem;color:#6b7280;margin-top:4px">📋 ${cartSummary}</div>
          ${stepsHtml(1, _stepTot())}
        </div>
        <div style="padding:24px">
          ${needSubdomain ? `
          <div style="margin-bottom:16px">
            <label style="display:block;font-size:0.8rem;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.07em;margin-bottom:6px">${getUI().form_subdomain}</label>
            <div style="display:flex;align-items:stretch">
              <input type="text" id="order-subdomain-input" placeholder="yourname"
                oninput="checkSubdomainDebounced()"
                style="flex:1;padding:10px 14px;background:#1e2335;border:1.5px solid #2a2f45;border-right:none;border-radius:8px 0 0 8px;color:#e8eaf0;font-family:'Manrope',sans-serif;font-size:0.95rem" />
              <span style="padding:10px 14px;background:#252b40;border:1.5px solid #2a2f45;border-radius:0 8px 8px 0;color:#6b7280;font-size:0.9rem;white-space:nowrap;display:flex;align-items:center">.ttzop.com</span>
            </div>
            <div id="subdomain-status" style="font-size:0.8rem;margin-top:6px;min-height:18px"></div>
          </div>` : ''}
          <div style="margin-bottom:16px">
            <label style="display:block;font-size:0.8rem;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.07em;margin-bottom:6px">${getUI().form_email}</label>
            <input type="email" id="order-email-input" placeholder="your@email.com" value="${(localStorage.getItem('ttzop_portal_email') || '').replace(/"/g, '')}"
              style="width:100%;padding:10px 14px;background:#1e2335;border:1.5px solid #2a2f45;border-radius:8px;color:#e8eaf0;font-family:'Manrope',sans-serif;font-size:0.95rem" /><!-- прэфіл з сесіі Кабінета -->

          </div>
          <div style="margin-bottom:16px">
            <label style="display:block;font-size:0.8rem;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.07em;margin-bottom:6px">${getUI().form_note}</label>
            <textarea id="order-note-input" placeholder="${getUI().form_note_ph}" rows="3"
              style="width:100%;padding:10px 14px;background:#1e2335;border:1.5px solid #2a2f45;border-radius:8px;color:#e8eaf0;font-family:'Manrope',sans-serif;font-size:0.95rem;resize:vertical"></textarea>
          </div>
          <div style="margin-bottom:16px">
            <label style="display:block;font-size:0.8rem;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.07em;margin-bottom:8px">${getUI().form_site_langs}</label>
            <div style="display:flex;flex-wrap:wrap;gap:6px" id="order-langs-grid">
              ${SITE_LANGS.map(l => `
                <button type="button" data-lang="${l.code}"
                  onclick="toggleOrderLang(this)"
                  style="padding:5px 10px;border-radius:6px;border:1.5px solid #2a2f45;background:${currentUiLang===l.code?'#f97316':'#1e2335'};color:${currentUiLang===l.code?'#fff':'#9ca3af'};cursor:pointer;font-size:0.8rem;transition:all 0.15s"
                  data-selected="${currentUiLang===l.code?'1':'0'}"
                >${l.label} ${l.name}</button>`).join('')}
            </div>
          </div>
          <div id="order-form-error" style="font-size:0.85rem;color:#ef4444;margin-bottom:8px"></div>
          <div style="display:flex;gap:8px">
            <button onclick="closeOrderModal()" style="padding:10px 16px;background:none;border:1px solid #2a2f45;border-radius:8px;color:#6b7280;cursor:pointer;font-size:0.85rem">${getUI().form_back}</button>
            <button onclick="sendOrderCode()" id="send-code-btn" style="flex:1;padding:10px;background:#f97316;color:#fff;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:0.9rem">${getUI().form_send_code}</button>
          </div>
        </div>
      </div>
    `;

  } else if (step === 'verify') {
    modal.innerHTML = `
      <div style="background:#181c27;border:1px solid #2a2f45;border-radius:16px;max-width:400px;width:100%;overflow:hidden;position:relative">
        <button onclick="closeOrderModal()" style="position:absolute;top:14px;right:14px;background:none;border:none;color:#6b7280;cursor:pointer;font-size:1.2rem;line-height:1;padding:4px;border-radius:4px;z-index:1" onmouseenter="this.style.color='#e8eaf0'" onmouseleave="this.style.color='#6b7280'">✕</button>
        <div style="padding:24px 24px 16px;border-bottom:1px solid #2a2f45">
          <div style="font-family:'Unbounded',sans-serif;font-size:1rem;font-weight:700;color:#e8eaf0">${getUI().verify_title}</div>
          <div style="font-size:0.85rem;color:#6b7280;margin-top:4px">${getUI().verify_sent} ${orderEmail}</div>
          ${stepsHtml(2, _stepTot())}
        </div>
        <div style="padding:24px">
          <div style="margin-bottom:16px">
            <label style="display:block;font-size:0.8rem;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.07em;margin-bottom:6px">${getUI().verify_label}</label>
            <input type="text" id="order-code-input" placeholder="123456" maxlength="6"
              style="width:100%;padding:12px 14px;background:#1e2335;border:1.5px solid #2a2f45;border-radius:8px;color:#e8eaf0;font-family:'Manrope',sans-serif;font-size:1.2rem;letter-spacing:8px;text-align:center" />
          </div>
          <div id="order-verify-error" style="font-size:0.85rem;color:#ef4444;margin-bottom:8px"></div>
          <div style="display:flex;gap:8px">
            <button onclick="closeOrderModal()" style="padding:12px 16px;background:none;border:1px solid #2a2f45;border-radius:8px;color:#6b7280;cursor:pointer;font-size:0.85rem;white-space:nowrap">${getUI().privacy_decline}</button>
            <button onclick="verifyOrderCode()" id="verify-code-btn" style="flex:1;padding:12px;background:#f97316;color:#fff;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:0.95rem">${getUI().verify_btn}</button>
          </div>
        </div>
      </div>
    `;
    document.getElementById('order-code-input')?.addEventListener('keydown', e => {
      if (e.key === 'Enter') verifyOrderCode();
    });

  } else if (step === 'intake') { // 📝 №3а: анкета «Свой сайт» — сайт нараджаецца напоўнены. «Прапусціць» = ранейшыя паводзіны
    const ui = getUI();
    const inp = (id, ph, extra = '') => `<input type="text" id="${id}" placeholder="${_svcEsc(ph)}" ${extra}
      style="width:100%;padding:11px 13px;background:#1e2335;border:1.5px solid #2a2f45;border-radius:8px;color:#e8eaf0;font-family:'Manrope',sans-serif;font-size:0.9rem" />`;
    const lbl = t => `<label style="display:block;font-size:0.78rem;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.07em;margin:14px 0 6px">${_svcEsc(t)}</label>`;
    const offerRow = i => `<div style="display:flex;gap:8px;margin-bottom:8px">
      <div style="flex:2">${inp('ik-off-name-' + i, ui.intake_offer_name)}</div>
      <div style="flex:1">${inp('ik-off-price-' + i, ui.intake_offer_price)}</div></div>`;
    modal.innerHTML = `
      <div style="background:#181c27;border:1px solid #2a2f45;border-radius:16px;max-width:520px;width:100%;max-height:86vh;display:flex;flex-direction:column;overflow:hidden;position:relative">
        <button onclick="closeOrderModal()" style="position:absolute;top:14px;right:14px;background:none;border:none;color:#6b7280;cursor:pointer;font-size:1.2rem;line-height:1;padding:4px;border-radius:4px;z-index:1" onmouseenter="this.style.color='#e8eaf0'" onmouseleave="this.style.color='#6b7280'">✕</button>
        <div style="padding:24px 24px 16px;border-bottom:1px solid #2a2f45">
          <div style="font-family:'Unbounded',sans-serif;font-size:1rem;font-weight:700;color:#e8eaf0">${_svcEsc(ui.intake_title)}</div>
          <div style="font-size:0.85rem;color:#6b7280;margin-top:4px">${_svcEsc(ui.intake_hint)}</div>
          ${stepsHtml(3, _stepTot())}
        </div>
        <div style="padding:20px 24px;overflow-y:auto">
          ${lbl(ui.intake_company)}${inp('ik-company', ui.intake_company_ph)}
          ${lbl(ui.intake_field)}${inp('ik-field', ui.intake_field_ph)}
          ${lbl(ui.intake_about)}<textarea id="ik-about" rows="3" placeholder="${_svcEsc(ui.intake_about_ph)}"
            style="width:100%;padding:11px 13px;background:#1e2335;border:1.5px solid #2a2f45;border-radius:8px;color:#e8eaf0;font-family:'Manrope',sans-serif;font-size:0.9rem;resize:vertical"></textarea>
          ${lbl(ui.intake_phone)}${inp('ik-phone', ui.intake_phone_ph)}
          ${lbl(ui.intake_address)}${inp('ik-address', ui.intake_address_ph)}
          ${lbl(ui.intake_offers)}
          <div style="font-size:0.75rem;color:#6b7280;margin:-2px 0 8px">${_svcEsc(ui.intake_offers_hint)}</div>
          ${[0, 1, 2].map(offerRow).join('')}
          <div id="intake-error" style="display:none;color:#ef4444;font-size:0.85rem;margin-top:8px"></div>
        </div>
        <div style="padding:16px 24px 22px;border-top:1px solid #2a2f45;display:flex;gap:10px">
          <button onclick="submitIntake(true)" style="flex:1;padding:12px;background:none;border:1.5px solid #2a2f45;border-radius:8px;color:#6b7280;font-family:'Manrope',sans-serif;font-size:0.9rem;font-weight:600;cursor:pointer">${_svcEsc(ui.intake_skip)}</button>
          <button id="intake-submit-btn" onclick="submitIntake(false)" style="flex:2;padding:12px;background:#f97316;border:none;border-radius:8px;color:#fff;font-family:'Manrope',sans-serif;font-size:0.9rem;font-weight:700;cursor:pointer">${_svcEsc(ui.intake_submit)}</button>
        </div>
      </div>`;
  } else if (step === 'done') {
    const isSubdomain = !!desiredSubdomain;
    modal.innerHTML = `
      <div style="background:#181c27;border:1px solid #2a2f45;border-radius:16px;max-width:420px;width:100%;padding:48px 32px;text-align:center">
        <div style="display:flex;justify-content:center;margin-bottom:24px">${stepsHtml(_stepTot(), _stepTot())}</div>
        <div style="font-size:3rem;margin-bottom:16px">${isSubdomain ? '🚀' : '✅'}</div>
        <div style="font-family:'Unbounded',sans-serif;font-size:1rem;font-weight:700;color:#e8eaf0;margin-bottom:8px">${getUI().done_title}</div>
        <div style="font-size:0.9rem;color:#6b7280;margin-bottom:24px">${isSubdomain
          ? getUI().done_subdomain.replace('{domain}', `${desiredSubdomain}.ttzop.com`).replace('{email}', orderEmail)
          : getUI().done_regular.replace('{email}', orderEmail)
        }</div>
        <button onclick="closeOrderModal()" style="padding:12px 32px;background:#f97316;color:#fff;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:0.9rem">${getUI().done_close}</button>
      </div>
    `;
    clearCart();
    desiredSubdomain = '';
    subdomainAvailable = false;
  }

  modal.addEventListener('click', e => { if (e.target === modal) closeOrderModal(); });
  document.body.appendChild(modal);
}

function closeOrderModal() {
  document.getElementById('order-modal')?.remove();
}

let orderNote = '';
let orderCart = [];
let orderSiteLangs = [];
let desiredSubdomain = '';
let subdomainAvailable = false;
let subdomainCheckTimer = null;

function checkSubdomainDebounced() {
  clearTimeout(subdomainCheckTimer);
  const input = document.getElementById('order-subdomain-input');
  if (!input) return;
  const val = input.value.trim().toLowerCase();
  const status = document.getElementById('subdomain-status');
  if (!val) { if (status) status.textContent = ''; subdomainAvailable = false; return; }
  if (!/^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/.test(val)) {
    if (status) { status.textContent = getUI().subdomain_invalid; status.style.color = '#ef4444'; }
    subdomainAvailable = false;
    return;
  }
  if (SITE_REPO !== 'ttzop-test' && val.includes('test')) {
    if (status) { status.textContent = getUI().form_err_subdomain_test; status.style.color = '#ef4444'; }
    subdomainAvailable = false;
    return;
  }
  if (status) { status.textContent = getUI().verify_checking; status.style.color = '#6b7280'; }
  subdomainCheckTimer = setTimeout(() => checkSubdomainAvailability(val), 600);
}

async function checkSubdomainAvailability(subdomain) {
  const status = document.getElementById('subdomain-status');
  try {
    const res = await fetch(API_URL, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      // repo — АБАВЯЗКОВА (без яго воркер шукаў спіс у undefined:services → чорны спіс маўчаў, корань бага yukki);
      // itemId — КЛІКНУТАЯ кліентам пазіцыя «Свой сайт» (_siteOrderItemId), НЕ агляд кошыка (там могуць быць
      // некалькі розных пазіцый — правяраем менавіта тую, што кліент цяпер афармляе); фолбэк — кошык (легасі-шлях праз чэкаўт)
      body: JSON.stringify({ action: 'check_subdomain', subdomain, repo: SITE_REPO, itemId: _siteOrderItemId || cart.find(i => i.type === 'subdomain')?.id || '' })
    });
    const data = await res.json();
    if (data.available) {
      if (status) { status.textContent = getUI().subdomain_free.replace('{subdomain}', subdomain); status.style.color = '#22c55e'; }
      subdomainAvailable = true;
    } else {
      if (status) { status.textContent = `❌ ${getUI().form_err_subdomain_taken}`; status.style.color = '#ef4444'; }
      subdomainAvailable = false;
    }
  } catch {
    if (status) { status.textContent = getUI().subdomain_check_err; status.style.color = '#ef4444'; }
    subdomainAvailable = false;
  }
}

// Агульны лік крокаў мадала: анкета (№3а) — толькі для заказу «Свой сайт»
function _stepTot() { return desiredSubdomain ? 4 : 3; }
// 📝 №3а: сабраць анкету і завяршыць заказ. skip=true → orderIntake застаецца null (паводзіны да №3а).
// Валідацыі «абавязковых» палёў НЯМА свядома: анкета цалкам апцыянальная, сервер сам нармалізуе і абрэжа.
async function submitIntake(skip) {
  const btn = document.getElementById('intake-submit-btn');
  const errEl = document.getElementById('intake-error');
  const val = id => (document.getElementById(id)?.value || '').trim();
  if (!skip) {
    const offers = [0, 1, 2].map(i => ({ name: val('ik-off-name-' + i), price: val('ik-off-price-' + i) })).filter(o => o.name);
    const ik = { companyName: val('ik-company'), field: val('ik-field'), about: val('ik-about'),
      phone: val('ik-phone'), address: val('ik-address'), offers };
    orderIntake = Object.values(ik).some(v => (Array.isArray(v) ? v.length : v)) ? ik : null; // усё пустое = тое ж «прапусціць»
  }
  if (btn) { btn.disabled = true; btn.textContent = getUI().intake_saving; }
  try {
    await registerOrder();
    showModal('done');
  } catch (e) {
    if (errEl) { errEl.style.display = 'block'; errEl.textContent = e.message || getUI().form_err_connection; }
    if (btn) { btn.disabled = false; btn.textContent = getUI().intake_submit; }
  }
}

function stepsHtml(current, total) {
  const dots = Array.from({ length: total }, (_, i) =>
    `<div style="width:8px;height:8px;border-radius:50%;background:${i < current ? '#f97316' : '#2a2f45'}"></div>`
  ).join('');
  return `<div style="display:flex;gap:5px;align-items:center;margin-top:10px">${dots}<span style="font-size:0.72rem;color:#6b7280;margin-left:4px">${current}/${total}</span></div>`;
}

function toggleOrderLang(btn) {
  const selected = btn.dataset.selected === '1';
  btn.dataset.selected = selected ? '0' : '1';
  btn.style.background = selected ? '#1e2335' : '#f97316';
  btn.style.color = selected ? '#9ca3af' : '#fff';
  btn.style.borderColor = selected ? '#2a2f45' : '#f97316';
}

async function sendOrderCode() {
  const email = document.getElementById('order-email-input')?.value.trim();
  const errEl = document.getElementById('order-form-error');
  const ui = getUI();
  if (!email || !email.includes('@')) {
    errEl.textContent = ui.form_err_email;
    return;
  }
  if (cartHasSubdomain()) {
    const sub = document.getElementById('order-subdomain-input')?.value.trim().toLowerCase();
    if (!sub) { errEl.textContent = ui.form_err_subdomain; return; }
    if (!subdomainAvailable) { errEl.textContent = ui.form_err_subdomain_taken; return; }
    desiredSubdomain = sub;
  }
  // Збіраем выбраныя мовы сайта
  const selectedLangBtns = [...document.querySelectorAll('#order-langs-grid [data-selected="1"]')];
  if (selectedLangBtns.length === 0) { errEl.textContent = ui.form_site_langs_err; return; }
  orderSiteLangs = selectedLangBtns.map(b => {
    const def = SITE_LANGS.find(l => l.code === b.dataset.lang);
    return { code: b.dataset.lang, label: def?.label || b.dataset.lang.toUpperCase(), name: def?.name || b.dataset.lang, active: true };
  });
  // Захоўваем note і cart перад пераходам
  orderNote = document.getElementById('order-note-input')?.value.trim() || '';
  orderCart = [...cart];
  orderEmail = email;
  const btn = document.getElementById('send-code-btn');
  btn.disabled = true; btn.textContent = ui.form_sending;

  // Кабінет: email ужо пацверджаны сесіяй (30 дзён) → заказ БЕЗ паўторнага кода
  const cabToken = localStorage.getItem('ttzop_portal_token');
  const cabEmail = (localStorage.getItem('ttzop_portal_email') || '').toLowerCase();
  if (cabToken && cabEmail && cabEmail === email.toLowerCase()) {
    try {
      const meRes = await fetch(API_URL, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'portal_me', repo: SITE_REPO, token: cabToken })
      });
      if (meRes.ok) { await registerOrder(); showModal('done'); return; }
    } catch { /* сесія не пацвердзілася — звычайны шлях з кодам */ }
  }

  try {
    const res = await fetch(API_URL, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'send_order_code', repo: SITE_REPO, email, lang: currentLang })
    });
    const data = await res.json();
    if (res.ok) {
      showModal('verify');
    } else {
      errEl.textContent = data.error || ui.form_err_connection;
      btn.disabled = false; btn.textContent = ui.form_send_code;
    }
  } catch {
    errEl.textContent = ui.form_err_connection;
    btn.disabled = false; btn.textContent = ui.form_send_code;
  }
}

// рэгістрацыя заказу — агульная для двух шляхоў (пасля кода І для кабінет-сесіі); кідае Error пры няўдачы
async function registerOrder() {
  const cartSummary = orderCart.map(i => `${i.name}${i.qty > 1 ? ' ×' + i.qty : ''}`).join(', ');
  const regRes = await fetch(API_URL, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'register_order',
      repo: SITE_REPO,
      email: orderEmail,
      privacyVersion,
      cart: orderCart,
      note: orderNote,
      cartSummary,
      lang: currentLang,
      siteLanguages: orderSiteLangs.length > 0 ? orderSiteLangs : undefined,
      ...(orderDelivery ? { deliveryAddress: orderDelivery } : {}), // C2a: выбраны адрас дастаўкі
      ...(orderDeliveryCost != null ? { deliveryCost: orderDeliveryCost, deliveryZone: orderDeliveryZone } : {}), // C2b: налічаны кошт+зона
      ...(desiredSubdomain ? { desiredSubdomain } : {}),
      ...(orderIntake ? { intake: orderIntake } : {}) // №3а: анкета «Свой сайт» (апцыянальная)
    })
  });
  if (!regRes.ok) {
    const regErr = await regRes.json().catch(() => ({}));
    throw new Error(regErr.error || 'Памылка захавання заказу');
  }
}

async function verifyOrderCode() {
  const code = document.getElementById('order-code-input')?.value.trim();
  const errEl = document.getElementById('order-verify-error');
  const ui = getUI();
  if (!code || code.length !== 6) { errEl.textContent = ui.verify_err; return; }

  const btn = document.getElementById('verify-code-btn');
  btn.disabled = true; btn.textContent = ui.verify_checking;

  try {
    // 1. Верыфікуем код
    const verifyRes = await fetch(API_URL, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'verify_order_code', repo: SITE_REPO, email: orderEmail, code })
    });
    const verifyData = await verifyRes.json();
    if (!verifyRes.ok) {
      errEl.textContent = verifyData.error || ui.verify_err_wrong;
      btn.disabled = false; btn.textContent = ui.verify_btn;
      return;
    }

    // 2. №3а: «Свой сайт» → крок анкеты (сайт народзіцца напоўнены). Іншыя заказы — як раней.
    if (desiredSubdomain) { showModal('intake'); return; }
    await registerOrder();
    showModal('done');
  } catch {
    errEl.textContent = ui.form_err_connection;
    btn.disabled = false; btn.textContent = ui.verify_btn;
  }
}

// 🖼 ЛАЙТБОКС-ГАЛЕРЭЯ (жывая заўвага 2026-07-10): мадалка фота з подпісам + лічыльнікам, ◀▶ па бягучым
// АЛЬБОМЕ (суседнія ФайлБлокі адной сеткі — рэестр _siteAlbumReg, як _sitePostReg), swipe на сэнсарным,
// ↗ арыгінал у новай укладцы, Esc/стрэлкі клавіятуры. Легасі-выклік openLightbox(url) працуе як раней.
let _siteAlbumReg = {}, _albSeq = 0, _lbState = null;
function openLightbox(albOrSrc, idx) {
  const items = _siteAlbumReg[albOrSrc] || [{ url: albOrSrc, caption: '' }];
  _lbState = { items, i: Math.min(Math.max(+idx || 0, 0), items.length - 1) };
  const many = items.length > 1;
  const lb = document.createElement('div');
  lb.className = 'lightbox active'; // .active абавязковы — без яго .lightbox display:none (той жа баг, што лавілі ў постах)
  lb.id = 'site-lightbox';
  lb.innerHTML = `<div class="lightbox-inner">
    <img id="lb-img" src="" alt="">
    <div class="lb-bar"><span id="lb-cap"></span><span id="lb-cnt"></span></div>
    <div class="lb-btns">
      <button onclick="window.open(document.getElementById('lb-img').src, '_blank')" aria-label="↗">↗</button>
      <button onclick="closeLightbox()" aria-label="✕">✕</button>
    </div>
    ${many ? `<button class="lb-nav lb-prev" onclick="lightboxStep(-1)" aria-label="◀">‹</button><button class="lb-nav lb-next" onclick="lightboxStep(1)" aria-label="▶">›</button>` : ''}
  </div>`;
  lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });
  // жэст сэнсарнага экрана: гарызантальны свайп ≥40px = гартаць альбом
  let tx = null;
  lb.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => {
    if (tx === null) return; const dx = e.changedTouches[0].clientX - tx; tx = null;
    if (Math.abs(dx) >= 40) lightboxStep(dx < 0 ? 1 : -1);
  }, { passive: true });
  document.body.appendChild(lb);
  document.addEventListener('keydown', _lbKeys);
  lightboxStep(0); // першы паказ
}
function lightboxStep(d) {
  const st = _lbState; if (!st) return;
  const n = st.items.length;
  st.i = ((st.i + d) % n + n) % n; // цыкл па альбоме (за апошнім — першы)
  const it = st.items[st.i], img = document.getElementById('lb-img');
  if (!img) return;
  img.src = it.url;
  document.getElementById('lb-cap').textContent = it.caption || '';
  document.getElementById('lb-cnt').textContent = n > 1 ? `${st.i + 1} / ${n}` : '';
}
function _lbKeys(e) {
  if (e.key === 'Escape') closeLightbox();
  else if (e.key === 'ArrowRight') lightboxStep(1);
  else if (e.key === 'ArrowLeft') lightboxStep(-1);
}
function closeLightbox() {
  document.getElementById('site-lightbox')?.remove();
  document.removeEventListener('keydown', _lbKeys);
  _lbState = null;
}

// 📰 рэестр постаў бягучага рэндэру (key `${instId}:${i}` → пост) + аверлэй поўнага артыкула
let _sitePostReg = {};
// рэзалв CSS-зменнай тэмы ў КАНКРЭТНЫ колер (rgb) — праз праб-элемент (getPropertyValue вяртаў бы «var(--light-text)»)
function _themeColor(varName, fallback) {
  const t = document.createElement('div');
  t.style.cssText = 'position:absolute;visibility:hidden;color:var(' + varName + ')';
  document.body.appendChild(t);
  const c = getComputedStyle(t).color; t.remove();
  return c && c !== 'rgba(0, 0, 0, 0)' ? c : (fallback || '');
}
// 📖 ЧЫТАЧ НАВІН/БЛОГА — тонкі білдэр cfg да ўніверсальнага reader.js (assets/js/reader.js).
// Колеры тэмы рэзалвяцца ТУТ (у бацькоўскай старонцы, бачыць themes.css) і перадаюцца ў чытач;
// стыль 'site' = як картка (фон --card-bg, тэкст — гарантавана кантрасны праз readerReadableOn).
function _postReaderCfg(p, key) {
  const bg = _themeColor('--card-bg', '#fff'), acc = _themeColor('--color-accent', '#f97316');
  const fg = readerReadableOn(bg); // тэкст з ЯРКАСЦІ фону (не з нізкакантраснага --text-main)
  const ui = getUI();
  const shareUrl = _postUrl(key); // Падзяліцца СПАСЫЛКАЙ (дып-лінк #post= — сайт сам адкрые артыкул)
  return {
    title: _sv(p.title), meta: _sv(p.date), coverUrl: _sv(p.cover), bodyHtml: _sv(p.body),
    lang: currentLang, dir: document.documentElement.dir || 'ltr', style: 'site',
    colors: { bg, fg, accent: acc },
    share: { mode: 'url', value: shareUrl, title: _sv(p.title) },
    labels: { share: ui.reader_share, pdfprint: ui.reader_pdfprint, close: ui.reader_close, copied: ui.reader_copied, window: ui.read_in_tab },
    fontControls: true, siteName: _sv(siteData?.company?.name) || document.title || 'TTZOP'
  };
}
function _postUrl(key) { return location.origin + location.pathname + '#post=' + encodeURIComponent(key); } // публічны адрас паста
function openPostReader(key) { // картка → мадалка; адрасны радок атрымлівае #post= (дып-лінк), закрыццё чысціць
  const p = _sitePostReg[key]; if (!p) return;
  const cfg = _postReaderCfg(p, key);
  history.replaceState(null, '', '#post=' + encodeURIComponent(key));
  cfg.onClose = () => { if (location.hash.startsWith('#post=')) history.replaceState(null, '', location.pathname + location.search); };
  openReaderModal(cfg);
}
function openPostReaderWindow(key) { const p = _sitePostReg[key]; if (p) openReaderWindow(_postReaderCfg(p, key)); } // кнопка → асобнае акно
function _postDeepLinkOpen() { // старт па share-спасылцы #post={key}: старонка цалкам замяняецца дакументам-артыкулам
  const m = location.hash.match(/^#post=(.+)/);
  if (!m) return false;
  const key = decodeURIComponent(m[1]);
  const p = _sitePostReg[key];
  if (!p) return false; // мёртвы ключ → проста сайт
  const cfg = _postReaderCfg(p, key);
  cfg.closeHref = location.pathname + location.search; // ✕ вядзе на сам сайт (укладка адкрыта карыстальнікам — close() бяссільны)
  replaceWithReaderDoc(cfg);
  return true; // каллер спыняе далейшы init — дакумент ужо заменены
}

// ⏸ Белая старонка «прыпынена» (сцяг settings.paused) — поўны блок доступу, дадзеныя цэлыя. Мова наведвальніка.
function _renderSitePaused(lang) {
  const ui = UI_T[lang] || UI_T.be, msg = ui.site_paused;
  // спасылка на галоўны сайт платформы (жывая заўвага 2026-07-10): наведвальнік не ўпіраецца ў глухую сцяну
  const more = (ui.site_paused_more || '').replace('{site}', '<a href="https://ttzop.com" style="color:#f97316;font-weight:600">ttzop.com</a>');
  document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  document.body.style.cssText = 'margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#fff;color:#111;font-family:system-ui,sans-serif';
  document.body.innerHTML = `<div style="text-align:center;padding:24px"><div style="font-size:64px;line-height:1;margin-bottom:18px">⏸</div><div style="font-size:1.5rem;font-weight:600">${msg}</div>${more ? `<div style="margin-top:14px;font-size:0.95rem;color:#555">${more}</div>` : ''}</div>`;
}
async function init() {
  siteData = await loadSiteData();
  if (!siteData) return;
  // 🖊️ слайс A: рэжым праўкі на месцы — ?edit=1 + editToken (&ed=) са спасылкі 👁 уладальніка.
  // Гасцявая 📋-спасылка нясе толькі ?look= → рэдактар не адкрыецца, а сервер адхіліць любы draft_*.
  // Аўтарытэт — СЕРВЕР (_editTokenMatch на кожнай мутацыі); тут толькі паказ UI.
  const _qs = new URLSearchParams(location.search);
  _dEditTok = _qs.get('ed') || '';
  _dEdit = _qs.get('edit') === '1' && !!_dEditTok;
  if (_dEdit) { document.body.classList.add('ds-edit'); _dEditBind(); } // ds-edit → кнопкі/спасылкі секцый інертныя (рэдагуеш, не купляеш)

  const primary = getPrimaryLang(siteData);
  const saved = localStorage.getItem('ttzop_lang');
  const activeLangs = (siteData.languages || []).filter(l => l.active).map(l => l.code);
  let selectedLang;
  if (saved && activeLangs.includes(saved)) {
    selectedLang = saved;
  } else {
    const detected = await detectLangByIp(activeLangs);
    selectedLang = detected || primary;
  }

  if (siteData.paused) { _renderSitePaused(selectedLang); return; } // ⏸ сайт прыпынены → белая старонка, кантэнт не рэндэрыцца (сцяг settings.paused, сіметрычна watermark)

  applyTheme(siteData);

  if (siteData.watermark) {
    const wm = document.createElement('div');
    wm.style.cssText = 'position:fixed;inset:0;z-index:99998;pointer-events:none;display:flex;align-items:center;justify-content:center;overflow:hidden';
    wm.innerHTML = '<div style="transform:rotate(-35deg);font-size:9vw;font-weight:900;color:rgba(249,115,22,0.13);letter-spacing:0.08em;user-select:none;white-space:nowrap;text-align:center">AWAITING<br>PAYMENT</div>';
    document.body.appendChild(wm);
  }

  applyLanguage(siteData, selectedLang);

  // курсы валют — паралельна з секцыямі
  const ratesPromise = fetch(API_URL + '/content/' + SITE_REPO + '/exchange-rates')
    .then(r => r.ok ? r.json() : null).catch(() => null);

  await applySections(); // 🧱 дынамічны рэндэр усіх секцый са спіса (замест loadX×9)
  if (_postDeepLinkOpen()) return; // прыйшлі па share-спасылцы #post= → старонка заменена артыкулам, астатні init не патрэбны

  exchangeRates = await ratesPromise;
  if (exchangeRates) _applyPriceConversion();

  initMap(siteData);
  initForm(siteData);
  initNavbar();
  renderCartNav();     // 🛒 сінхранізаваць навбар-іконку кошыка з localStorage пры старце
  initCabinetNav();    // 👤 наведвальнік з захаванай сесіяй → email+бэйдж непрачытаных замест кнопкі «Кабінет»
  initReveal();        // 🎛 дызайн-параметры тэмы (пасля applyTheme — чытаюць data-d-*)
  initGlassNav();
  initStickyCta(siteData);
  initHeroPhoto();     // фонавае фота hero (вось heroPhoto прэсэта «Цэх»)
  initStamp(siteData); // пячатка ў hero (вось stamp прэсэта «Штамп»; marquee будуе renderDynamicSections з cards-секцый)
  initLookPreview(siteData); // 👁 ?look=1 — прэв'ю-перабор варыянтаў выгляду
}

// ════════════════════════════════════════
// 👁 ПРЭВ'Ю ВЫГЛЯДУ (?look=1): жывы перабор палітраў × паводзін на РЭАЛЬНЫМ змесце сайта.
// Нічога не захоўвае — толькі паказ; «Выбраць гэты варыянт» вядзе ў панэль (#look=…), дзе ставяцца дзве ○.
// Улічваюцца толькі АКТЫЎНЫЯ варыянты (node.active !== false); неактыўныя ігнаруюцца.
// ════════════════════════════════════════
const _LOOK_SLOTS = { accent:'--color-accent', primary:'--color-primary', bg:'--light-bg', surface:'--light-bg-card', text:'--light-text', muted:'--light-text-muted', border:'--light-border', nav:'--nav-bg' }; // люстэрка THEME_SLOTS адмінкі (трымаць у сінхроне)
const _LOOK_BASES = ['steel','carbon','light','green','workshop','route','poster','protocol','stamp']; // валідныя data-theme прэсэты themes.css
// назвы сістэмных дызайн-прэсэтаў (sysKey → подпіс; be/en, іншыя мовы → en)
const _LOOK_SYS = { design_p_standard:{be:'Стандартны',en:'Standard'}, design_p_minimal:{be:'Мінімалістычны',en:'Minimalist'}, design_p_lively:{be:'Жывы',en:'Lively'}, design_p_workshop:{be:'Цэх',en:'Workshop'}, design_p_route:{be:'Маршрут',en:'Route'}, design_p_poster:{be:'Афіша',en:'Poster'}, design_p_protocol:{be:'Пратакол',en:'Protocol'}, design_p_stamp:{be:'Штамп',en:'Stamp'} };
let _lookSel = { p: null, d: null };
function _lookName(n) {
  const nm = n.name;
  if (nm && typeof nm === 'object') return nm[currentLang] || nm[getPrimaryLang(siteData)] || Object.values(nm).find(Boolean) || '';
  if (nm) return nm;
  const sysMap = _LOOK_SYS[n.sysKey]; return sysMap ? (sysMap[currentUiLang] || sysMap.en) : (n.sysKey || n.id);
}
function initLookPreview(data) {
  // пер-сайтавы токен: параўноўвае СЕРВЕР (settings.lookToken больш не аддаецца публічна) — маркер `_draft`
  // прыходзіць толькі з адказу /content/{site}/settings?draft=<tok>, калі токен прыняты. Голы ?look=1 ігнаруецца.
  const tok = new URLSearchParams(location.search).get('look');
  if (!tok || data._draft !== true) return;
  const nodes = (data.themeTree || []).filter(n => n.type === 'form' && n.active !== false); // толькі актыўныя
  const pals = nodes.filter(n => n.formSchema === 'theme');
  const des  = nodes.filter(n => n.formSchema === 'themeDesign');
  if (!pals.length || !des.length) return;
  _lookSel.p = (pals.find(n => n.fields?._current) || pals[0]).id;
  _lookSel.d = (des.find(n => n.fields?._current) || des[0]).id;
  // бягучыя (захаваныя ў панэлі) варыянты — аранжавая рамка, каб бачыць «адкуль сышоў» пры пераборы
  const row = (list, kind) => list.map(n =>
    `<button class="look-opt${n.fields?._current ? ' cur' : ''}" data-kind="${kind}" data-id="${_svcEsc(n.id)}" onclick="_lookPick('${kind}','${_svcEsc(n.id)}')">${_svcEsc(_lookName(n))}</button>`).join('');
  // 🖊️ Фаза D: рэжым рэдагавання (👁 адкрывае &edit=1) — блок «Секцыя → Тып → параметры», сінхрон з панэллю
  const edit = new URLSearchParams(location.search).get('edit') === '1';
  const el = document.createElement('div');
  el.id = 'look-panel';
  el.innerHTML = `
    <button class="look-toggle" onclick="_lookToggle()" title="${_svcEsc(getUI().look_min)}" aria-label="${_svcEsc(getUI().look_min)}">▾</button>
    <div class="look-note">${_svcEsc(getUI().look_note)}</div>
    ${edit ? `<div style="font-size:.68rem;color:#7fd07f;text-align:center;margin-top:-3px">${_svcEsc(getUI().ed_autosave)}</div>` : ''}
    <div class="look-row"><span class="look-lbl">🎨 ${_svcEsc(getUI().look_colors)}</span>${row(pals, 'p')}</div>
    <div class="look-row"><span class="look-lbl">🧩 ${_svcEsc(getUI().look_designs)}</span>${row(des, 'd')}</div>
    ${edit ? `<div id="look-edit" class="look-row" style="flex-direction:column;align-items:stretch;gap:6px"></div>` : ''}
    <button class="look-apply" onclick="_lookApply()">✓ ${_svcEsc(getUI().look_apply)}</button>`;
  document.body.appendChild(el);
  _lookRefresh();
  if (edit) _dEditInit();
  try { if (localStorage.getItem('ttzop_look_min') === '1') _lookToggle(); } catch {} // аднавіць згорнуты стан
}
// 🖊️ Згарнуць/разгарнуць панэльку прэв'ю (шмат месца замінае рэдагаваць старонку) — стан у localStorage
function _lookToggle() {
  const el = document.getElementById('look-panel'); if (!el) return;
  const min = el.classList.toggle('look-min');
  const btn = el.querySelector('.look-toggle'); if (btn) btn.textContent = min ? '▴' : '▾';
  try { localStorage.setItem('ttzop_look_min', min ? '1' : ''); } catch {}
}
// ── 🖊️ Фаза D (АДЗІНЫ ШЛЯХ) — самадастатковы рэдактар параметраў секцыі ў прэв'ю ──
// Адзін таб, без панэлі/BroadcastChannel (працуе на Тэсла Atom): піша ў чарнавік ПРАМА праз worker
// draft_set (аўтарызацыя lookToken са спасылкі), потым перачытвае чарнавік і перарэндэрвае старонку.
let _dSecId = null;
let _dEdit = false; // 🖊️ слайс A: рэжым праўкі кантэнту НА МЕСЦЫ (contenteditable) — усталёўваецца ў init пры ?edit=1 + наяўнасці editToken
let _dEditTok = ''; // 🔑 editToken са спасылкі 👁 (&ed=) — адзіны ключ ЗАПІСУ ў чарнавік; дасылаецца цэнтральна ў _draftPost
// спрошчаны лэйбл: be для славянскіх моў інтэрфейсу, en для астатніх (оверлэй — інструмент уладальніка;
// каталог параметраў — люстэрка панэльнага SECTION_PROPS, але кароткі: тыпы паказаны іконка+код без перакладу)
const _dL = (be, en) => (['be', 'ru', 'uk'].includes(currentUiLang) ? be : en);
const _SEC_TICON = { text: '📄', cards: '🃏', list: '💰', accordion: '❓', gallery: '🖼️', testimonials: '💬', brands: '🚗', posts: '📰', hero: '🔝', footer: '🔚' }; // іконка тыпу для подпісу секцыі (сам Тып мяняецца ў панэлі, не ў прэв'ю)
const _dTypeTag = t => { const r = _D_ADD_TYPES.find(x => x[0] === t); return r ? ` (${r[1]} ${_dL(r[2], r[3])})` : ''; }; // « (📄 Тэкст)» — тып у плейсхолдэры пустой секцыі (каб дублі не блыталі ў edit)
// ➕ каталог тыпаў для «Дадаць секцыю» (люстэрка SITE_VIEWS; hero/footer выключаны — статычныя, па-за спісам)
const _D_ADD_TYPES = [['text', '📄', 'Тэкст', 'Text'], ['cards', '🃏', 'Карткі', 'Cards'], ['list', '💰', 'Прайс', 'Prices'], ['accordion', '❓', 'FAQ', 'FAQ'], ['posts', '📰', 'Навіны', 'News'], ['testimonials', '💬', 'Водгукі', 'Reviews'], ['brands', '🚗', 'Брэнды', 'Brands'], ['gallery', '🖼️', 'Галерэя', 'Gallery']];
// ключ масіва пазіцый у content па тыпе секцыі (пусты = тып без дадаваемых пазіцый: text/gallery)
function _dItemKey(t) { return t === 'list' ? 'rows' : t === 'posts' ? 'posts' : (['cards', 'accordion', 'testimonials', 'brands'].includes(t) ? 'items' : ''); }
function _secCat() { return [ // люстэрка SECTION_PROPS панэлі (усе 10 параметраў); num:true → лічбавае поле
  { key: 'gridCols',   name: _dL('Калонкі', 'Columns'),   opts: [['auto', _dL('Аўта', 'Auto')], ['c1', '1'], ['c2', '2'], ['c3', '3'], ['c4', '4']] },
  { key: 'layoutView', name: _dL('Выгляд', 'View'),       opts: [['off', _dL('Аўта', 'Auto')], ['cards', _dL('Карткі', 'Cards')], ['list', _dL('Спіс', 'List')]] },
  { key: 'previewN',   name: _dL('Паказваць', 'Show'),    num: true }, // колькі пазіцый адразу (пуста = 3, 0 = усе; далей порцыямі па 15)
  { key: 'itemOrder',  name: _dL('Парадак', 'Order'),     opts: [['panel', _dL('З панэлі', 'Panel')], ['random', _dL('Выпадкова', 'Random')], ['newest', _dL('Навейшыя', 'Newest')]] },
  { key: 'collapsed',  name: _dL('Згорнута', 'Collapsed'), opts: [['no', _dL('Не', 'No')], ['yes', _dL('Так', 'Yes')]] },
  { key: 'headAlign',  name: _dL('Загаловак', 'Heading'), opts: [['center', _dL('Цэнтр', 'Center')], ['left', _dL('Злева', 'Left')]] },
  { key: 'band',       name: _dL('Паласа', 'Band'),       opts: [['auto', _dL('Аўта', 'Auto')], ['light', _dL('Светлая', 'Light')], ['accent', _dL('Акцэнт', 'Accent')]] },
  { key: 'secWidth',   name: _dL('Шырыня', 'Width'),      opts: [['normal', _dL('Звычайна', 'Normal')], ['narrow', _dL('Вузкая', 'Narrow')], ['full', _dL('На ўвесь', 'Full')]] },
  { key: 'secPad',     name: _dL('Водступы', 'Padding'),  opts: [['normal', _dL('Звычайна', 'Normal')], ['compact', _dL('Кампактна', 'Compact')], ['roomy', _dL('Прасторна', 'Roomy')]] },
  { key: 'carousel',   name: _dL('Карусель', 'Carousel'), opts: [['no', _dL('Не', 'No')], ['yes', _dL('Так', 'Yes')]] }
]; }
function _dEditInit() {
  _dEditRender();
  _dStatusRefresh(); // 🔔 ці састарэў Сайт — вырашае, ці паказваць 🚀
  // стрэлка фолда круціцца чыстым CSS ад details[open] (.ds-fold-btn) — toggle-слухач больш не патрэбны
}
function _dSecs() { const s = siteData?._sections; return (Array.isArray(s?.sections) ? s.sections : []).filter(x => x && x.kind !== 'folder' && x.kind !== 'file' && x.type && SITE_VIEWS[x.type]); }
function _dSecTitle(s) { const tt = s.title; const nm = (tt && typeof tt === 'object') ? (tt[currentLang] || Object.values(tt).find(Boolean)) : tt; return nm || _sv(s.caption) || _sv(s.name) || s.type || s.id; } // файл → caption/name
let _dDirty = null; // 🔔 ці састарэў Сайт (draft ≠ published): null=яшчэ не ведаем, true → паказваем 🚀, false → «✓ актуальны»
async function _dStatusRefresh() { // адзіная праўда — воркер draft_status (тая ж логіка, што банер панэлі)
  try {
    const r = await _draftPost({ action: 'draft_status', repo: SITE_REPO });
    const j = r && r.json ? await r.json().catch(() => null) : null;
    if (j && j.ok) { _dDirty = !!j.dirty; _dEditRender(); }
  } catch (e) {}
}
function _dEditRender() { // ніжняя панэль: падказка + ⓘ узроўню СТАРОНКІ (Сметніца верхніх секцый) + 🚀 (толькі пры dirty); параметры/парадак — у ⋯ самой секцыі
  const w = document.getElementById('look-edit'); if (!w) return;
  // 🚀 бачны ТОЛЬКІ калі Сайт сапраўды састарэў (рашэнне 2026-07-15); актуальны → ціхая пазнака ✓
  const pubHtml = _dDirty === true
    ? `<button class="ds-eb-btn ds-add-btn" onclick="_dPublish()" title="${_svcEsc(_dL('Апублікаваць сайт — публіка ўбачыць усе змены чарнавіка', 'Publish site — visitors will see all draft changes'))}" style="margin-left:8px;border-color:var(--accent,#f97316);color:var(--accent,#f97316)">🚀 ${_svcEsc(_dL('Апублікаваць', 'Publish'))}</button>`
    : _dDirty === false ? `<span class="look-lbl" style="opacity:.6;margin-left:8px">✓ ${_svcEsc(_dL('Сайт актуальны', 'Site up to date'))}</span>` : '';
  w.innerHTML = `<span class="look-lbl" style="opacity:.8">🖊 ${_svcEsc(_dL('Секцыі: ● ▲▼ ⓘ ⋯ на старонцы', 'Sections: ● ▲▼ ⓘ ⋯ on page'))}</span><button class="ds-eb-btn ds-add-btn" onclick="_dAddMenu(null,this)" title="${_svcEsc(_dL('Дадаць секцыю/раздзел', 'Add section/folder'))}" style="margin-left:8px">➕ ${_svcEsc(_dL('Дадаць', 'Add'))}</button><button class="ds-eb-btn" onclick="_dSecInfo(null,this)" title="${_svcEsc(_dL('Старонка: інфа і Сметніца', 'Page: info & Trash'))}">ⓘ</button>${pubHtml}`;
}
// 🚀 публікацыя З ЧАРНАВІКА (2026-07-15): editToken уладальніка → воркер draft_publish (агульны _publishAll
// з панэльным 🚀). Пацверджанне — свой дыялог (сістэмныя забаронены), пасля — перачытаць старонку
function _dPublish() {
  siteConfirm(_dL('Апублікаваць сайт? Публіка ўбачыць УСЕ змены чарнавіка (старонка, Каталог, выгляд).', 'Publish the site? Visitors will see ALL draft changes (page, catalog, appearance).'), async () => {
    try {
      const r = await _draftPost({ action: 'draft_publish', repo: SITE_REPO });
      const j = r && r.json ? await r.json().catch(() => null) : null;
      await _dReload(); // унутры перачытае і draft_status → 🚀 знікне, з'явіцца «✓ Сайт актуальны»
      _edFlash && document.body && _edFlash(document.querySelector('#look-edit') || document.body); // зялёны водгук як пры захаванні
      console.info('🚀 published:', j && j.published);
    } catch (e) {}
  }, false); // не-разбуральнае — звычайная кнопка, не чырвоная
}
function _dSecById(id) { const s = siteData?._sections; return (Array.isArray(s?.sections) ? s.sections : []).find(x => x && x.id === id) || null; }
// зялёная кропка «Актыўна» — тое самае прадстаўленне, што ў панэлі (.node-active-dot): active → паказ на сайце (inst.enabled)
function _dDot(active) { return `<span class="ds-dot${active ? '' : ' off'}"></span>`; }
// ▲▼ + ● + ⋯ панэлька рэдактара секцыі/раздзела (генерычна для любога вузла; толькі edit-рэжым) — люстэрка радка панэлі
function _dSecBar(id, canUp, canDown, active) {
  if (!_dEdit) return '';
  const mv = (on, dir, arr) => `<button class="ds-eb-btn"${on ? '' : ' disabled'} onclick="event.stopPropagation();_dMove('${_dsEsc(id)}','${dir}')" title="${dir === 'up' ? _svcEsc(_dL('Уверх', 'Up')) : _svcEsc(_dL('Уніз', 'Down'))}">${arr}</button>`;
  const dot = `<button class="ds-eb-btn ds-eb-dot" onclick="event.stopPropagation();_dSecSetEnabled('${_dsEsc(id)}',${!active})" title="${active ? _svcEsc(_dL('Актыўна — паказана', 'Active — shown')) : _svcEsc(_dL('Схавана', 'Hidden'))}">${_dDot(active)}</button>`;
  const info = `<button class="ds-eb-btn" onclick="event.stopPropagation();_dSecInfo('${_dsEsc(id)}',this)" title="${_svcEsc(_dL('Інфа і Сметніца', 'Info & Trash'))}">ⓘ</button>`;
  return `<div class="ds-editbar" contenteditable="false">${dot}${mv(canUp, 'up', '▲')}${mv(canDown, 'down', '▼')}${info}<button class="ds-eb-btn ds-eb-menu" onclick="event.stopPropagation();_dSecMenu('${_dsEsc(id)}',this)" title="${_svcEsc(_dL('Меню', 'Menu'))}">⋯</button></div>`;
}
// ▸ ПЕРАД назвай (канон Панелі: левы дыскложур у пачатку радка) — жыве ў summary фолда, публіка+edit;
// паварот стрэлкі — чыста CSS (.ds-fold[open] > summary > .ds-fold-btn), адзін хэндлер абодвум рэжымам
function _dFoldBtn(ev) {
  ev.preventDefault(); ev.stopPropagation(); // не даць summary зрабіць другі (адваротны) toggle
  const d = ev.target.closest('details.ds-fold'); if (d) d.open = !d.open;
}
async function _dMove(id, dir) { // рух адносна БАЧНАГА суседа (DOM = рэальны візуальны парадак; мінае пустыя/схаваныя)
  const wrap = document.getElementById('sec-' + id); if (!wrap) return;
  const sibs = [...wrap.parentElement.children].filter(c => c.id && c.id.indexOf('sec-') === 0); // сваякі-секцыі таго ж кантэйнера
  const i = sibs.indexOf(wrap); const ref = dir === 'up' ? sibs[i - 1] : sibs[i + 1];
  if (!ref) return; // край — няма куды
  const refId = ref.id.slice(4);
  try { await _draftPost({ action: 'draft_move', repo: SITE_REPO, id, refId, pos: dir === 'up' ? 'before' : 'after' }); await _dReload(); } catch (e) {}
}
function _dMenuClose() { const m = document.getElementById('ds-menu'); if (m) m.remove(); document.removeEventListener('mousedown', _dMenuOutside, true); }
function _dMenuOutside(e) { const m = document.getElementById('ds-menu'); if (m && !m.contains(e.target)) _dMenuClose(); }
// ⋯-меню чарнавіка = ЛЮСТЭРКА панэльнага канону (рашэнне «ААП» 2026-07-10): тая ж сетка кнопак-іконак
// 34×34 з тултыпамі (node-overflow-menu-grid), той жа парадак груп g1(●,+📂,+🗒,+📎) · g2(⧉) · g3(✎) ·
// g4(✕ danger) праз падзяляльнікі. Адрозненне ад панэлі АДНО — хвост «🎨 Параметры» (выгляд секцыі).
// Кліент бачыць адзін дызайн меню і ў Панелі, і ў Чарнавіку — не блытаецца рознымі UI адной функцыі.
function _dSecMenu(id, btn) {
  if (document.getElementById('ds-menu')) { _dMenuClose(); return; }
  _dSecId = id; // мэтавая секцыя для _dChange (параметры)
  const sec = _dSecById(id); const hidden = sec && sec.enabled === false;
  const isFolder = sec && sec.kind === 'folder', isFile = sec && sec.kind === 'file';
  const mi = (icon, title, onclick, cls) => `<button class="ds-mi${cls ? ' ' + cls : ''}" title="${_svcEsc(title)}" onclick="${onclick}">${icon}</button>`;
  const sep = '<div class="ds-msep"></div>';
  const sst = 'padding:4px 8px;border-radius:6px;border:1px solid var(--border-color,#8884);background:var(--card-bg,#1f2430);color:inherit;font-size:.82rem;width:100%';
  const o = (v, selv, lbl) => `<option value="${_svcEsc(v)}"${v === selv ? ' selected' : ''}>${_svcEsc(lbl)}</option>`;
  // параметры выгляду — толькі для секцый (не раздзелаў/файлаў)
  const params = (isFolder || isFile) ? '' : _secCat().map(p => {
    const cur = (sec && sec.disp && sec.disp[p.key] != null) ? sec.disp[p.key] : (p.num ? 0 : p.opts[0][0]);
    const ctrl = p.num
      ? `<input type="number" min="0" value="${_svcEsc(cur == null ? 0 : cur)}" onchange="_dMenuChange('${p.key}',this.value)" style="${sst}">`
      : `<select onchange="_dMenuChange('${p.key}',this.value)" style="${sst}">${p.opts.map(op => o(op[0], cur, op[1])).join('')}</select>`;
    return `<label class="ds-mp">${_svcEsc(p.name)}${ctrl}</label>`;
  }).join('');
  const itemKey = !isFolder && !isFile && !(sec && sec.source) ? _dItemKey(sec && sec.type) : ''; // ліставая секцыя → +🗒 = пазіцыя; 🧷 source-секцыя — пазіцыі жывуць у КАТАЛОГУ (дадаваць там; draft_item пісаў бы міма крыніцы)
  // g1 — як у панэлі: ● актыў · +📂 Папка · +🗒 (раздзел → пікер тыпаў секцый, аналаг пікера віду ў
  // Каталогу; ліставая → пазіцыя; іншая секцыя — без 🗒: «Форму не кладуць у Форму») · +📎 Файл
  const g1 = mi(_dDot(!hidden), hidden ? _dL('Схавана — паказаць', 'Hidden — show') : _dL('Актыўна — схаваць', 'Active — hide'), `_dSecSetEnabled('${_dsEsc(id)}',${hidden})`)
    + (!isFile ? mi('+📂', _dL('Дадаць Папку', 'Add folder'), `_dAddNode('folder','','${_dsEsc(id)}')`) : '')
    + (isFolder ? mi('+🗒', _dL('Дадаць Секцыю', 'Add section'), `_dTypePick('${_dsEsc(id)}',this)`)
      : itemKey ? mi('+🗒', _dL('Дадаць пазіцыю', 'Add item'), `_dItemAdd('${_dsEsc(id)}','${_dsEsc(itemKey)}','${_dsEsc(sec.type)}')`) : '')
    + (!isFile ? mi('+📎', _dL('Дадаць Файл (фота)', 'Add file (photo)'), `_dFileAdd('${_dsEsc(id)}')`) : '');
  const g2 = mi('⧉', _dL('Дубляваць', 'Duplicate'), `_dSecDup('${_dsEsc(id)}')`);
  const g3 = mi('✎', _dL('Пераназваць', 'Rename'), `_dSecFocusTitle('${_dsEsc(id)}')`);
  const g4 = mi('✕', _dL('Выдаліць', 'Delete'), `_dSecDelete('${_dsEsc(id)}')`, 'ds-mi-del');
  const m = document.createElement('div'); m.id = 'ds-menu'; m.className = 'ds-menu ds-menu-grid';
  m.innerHTML = [g1, g2, g3, g4].filter(Boolean).join(sep)
    + (params ? `${sep}<div class="ds-mi-sep">🎨 ${_svcEsc(_dL('Параметры', 'Params'))}</div><div class="ds-mparams">${params}</div>` : '');
  document.body.appendChild(m);
  const r = btn.getBoundingClientRect(); // размясціць пад кнопкай, не за краем экрана
  m.style.top = (r.bottom + 6 + scrollY) + 'px';
  m.style.left = Math.max(8, Math.min(r.right - m.offsetWidth + scrollX, scrollX + innerWidth - m.offsetWidth - 8)) + 'px';
  setTimeout(() => document.addEventListener('mousedown', _dMenuOutside, true), 0);
}
// +🗒 у раздзеле → пікер тыпаў секцый асобным дыялогам (аналаг панэльнага пікера віду _newFieldsPick)
function _dTypePick(id, btn) {
  const r = btn.getBoundingClientRect(); _dMenuClose();
  _dAddMenuAt(id, r, true);
}
async function _dMenuChange(key, val) { _dMenuClose(); await _dChange(key, val); } // параметр з меню → чарнавік
async function _dSecSetEnabled(id, enabled) { // ● схаваць/паказаць (enabled — поле inst, праз draft_set path)
  _dMenuClose();
  try { await _draftPost({ action: 'draft_set', repo: SITE_REPO, id, path: 'enabled', val: !!enabled }); await _dReload(); } catch (e) {}
}
function _dSecFocusTitle(id) { // ✎ скрол+фокус на inline-загаловак секцыі
  _dMenuClose();
  const host = document.getElementById('sec-' + id); if (!host) return;
  const t = host.querySelector('[data-ed$="::ml"], [data-ed]'); host.scrollIntoView({ behavior: 'smooth', block: 'center' });
  if (t) setTimeout(() => { t.focus(); const sel = getSelection(); const rg = document.createRange(); rg.selectNodeContents(t); rg.collapse(false); sel.removeAllRanges(); sel.addRange(rg); }, 320);
}
async function _dSecDup(id) { _dMenuClose(); try { await _draftPost({ action: 'draft_dup', repo: SITE_REPO, id }); await _dReload(); } catch (e) {} } // ⧉ клон вузла+паддрэва
function _dSecDelete(id) { // 🗑 → Сметніца чарнавіка (не назусім)
  _dMenuClose();
  const sec = _dSecById(id); const nm = _dSecTitle(sec) || id;
  siteConfirm(_dL('Выдаліць у Сметніцу?', 'Move to Trash?') + '\n«' + nm + '»', async () => {
    try { await _draftPost({ action: 'draft_delete', repo: SITE_REPO, id }); await _dReload(); } catch (e) {}
  }, true);
}
function _dSecCount(sec) { // лік пазіцый (ліставая) ці дзяцей (раздзел)
  const s = siteData?._sections; const all = Array.isArray(s?.sections) ? s.sections : [];
  if (sec.kind === 'folder') return all.filter(x => x && (x.parentId || null) === sec.id).length;
  const c = sec.content || {}; let n = 0; ['items', 'posts', 'rows'].forEach(k => { if (Array.isArray(c[k])) n += c[k].length; }); return n || 0;
}
function _dTrashItems(originId) { // карані груп, выдаленыя З гэтага кантэйнера (origin===id; null = верхні ўзровень/старонка)
  const s = siteData?._sections; const tr = Array.isArray(s?._trash) ? s._trash : [];
  return tr.filter(x => x && x._groupRoot && (x._origParentId || null) === (originId || null)); // тыя ж палі, што панэль (_nodeTrashList)
}
function _dInfoClose() { const m = document.getElementById('ds-info'); if (m) m.remove(); document.removeEventListener('mousedown', _dInfoOutside, true); }
function _dInfoOutside(e) { const m = document.getElementById('ds-info'); if (m && !m.contains(e.target)) _dInfoClose(); }
function _dSecInfo(id, btn) { // ⓘ драўэр: інфа секцыі + СВАЯ Сметніца (id=null → узровень старонкі). Люстэрка ⓘ-Папкі панэлі
  if (document.getElementById('ds-info')) { _dInfoClose(); return; }
  const sec = id ? _dSecById(id) : null;
  const row = (k, v) => `<div class="ds-inf-row"><b>${_svcEsc(k)}:</b> ${_svcEsc(v)}</div>`;
  let info;
  if (sec) {
    const typeName = sec.kind === 'folder' ? _dL('Раздзел', 'Folder') : sec.kind === 'file' ? _dL('📎 Файл', '📎 File') : ((_SEC_TICON[sec.type] || '') + ' ' + (sec.type || '')).trim();
    info = row(_dL('Тып', 'Type'), typeName) + row(_dL('Назва', 'Title'), _dSecTitle(sec)) + (sec.kind !== 'file' ? row(sec.kind === 'folder' ? _dL('Дзяцей', 'Children') : _dL('Пазіцый', 'Items'), _dSecCount(sec)) : '') + `<div class="ds-inf-row" style="opacity:.55"><b>id:</b> ${_svcEsc(sec.id)}</div>`;
  } else {
    const s = siteData?._sections; const cnt = (Array.isArray(s?.sections) ? s.sections : []).filter(x => x && x.kind !== 'file').length;
    info = `<div class="ds-inf-row"><b>${_svcEsc(_dL('Старонка', 'Page'))}</b></div>` + row(_dL('Секцый', 'Sections'), cnt);
  }
  const nodes = _dTrashItems(id), items = id ? _dItemTrashOf(id) : []; // выдаленыя дзеці-секцыі + выдаленыя пазіцыі
  // 🧷 source-секцыя: яе «пазіцыі» жывуць у КАТАЛОГУ → паказваем Сметніцу Каталога (draft_src restore/purge)
  const srcTrash = (sec && sec.source) ? _svcTrash.filter(x => x && x._groupRoot) : [];
  const trRow = (nm, restore, purge) => `<div class="ds-tr-row"><span class="ds-tr-nm">🗑 ${_svcEsc(nm)}</span><span class="ds-tr-acts"><button class="ds-eb-btn" onclick="${restore}" title="${_svcEsc(_dL('Аднавіць', 'Restore'))}">♻</button><button class="ds-eb-btn" onclick="${purge}" title="${_svcEsc(_dL('Выдаліць назаўжды', 'Delete forever'))}">✕</button></span></div>`;
  const trHtml = (nodes.length || items.length || srcTrash.length)
    ? nodes.map(x => trRow(_dSecTitle(x) || x.id, `_dTrashRestore('${_dsEsc(x.id)}')`, `_dTrashPurge('${_dsEsc(x.id)}')`)).join('')
      + items.map(x => trRow(_dItemLabel(x), `_dItemRestore('${_dsEsc(x._trashId)}')`, `_dItemPurge('${_dsEsc(x._trashId)}')`)).join('')
      + srcTrash.map(x => trRow(_dSrcTrashLabel(x), `_dSrcRestore('${_dsEsc(x.id)}')`, `_dSrcPurge('${_dsEsc(x.id)}')`)).join('')
    : `<div class="ds-inf-row" style="opacity:.55">${_svcEsc(_dL('Сметніца пустая', 'Trash empty'))}</div>`;
  const m = document.createElement('div'); m.id = 'ds-info'; m.className = 'ds-menu ds-info';
  m.innerHTML = `<div class="ds-mi-sep">ℹ️ ${_svcEsc(_dL('Інфармацыя', 'Info'))}</div>${info}<div class="ds-mi-sep">🗑 ${_svcEsc(_dL('Сметніца', 'Trash'))}</div>${trHtml}`;
  document.body.appendChild(m);
  const r = btn.getBoundingClientRect();
  m.style.top = (r.bottom + 6 + scrollY) + 'px';
  m.style.left = Math.max(8, Math.min(r.right - m.offsetWidth + scrollX, scrollX + innerWidth - m.offsetWidth - 8)) + 'px';
  setTimeout(() => document.addEventListener('mousedown', _dInfoOutside, true), 0);
}
async function _dTrashRestore(id) { _dInfoClose(); try { await _draftPost({ action: 'draft_restore', repo: SITE_REPO, id }); await _dReload(); } catch (e) {} }
function _dTrashPurge(id) { siteConfirm(_dL('Выдаліць назаўжды?', 'Delete forever?'), async () => { _dInfoClose(); try { await _draftPost({ action: 'draft_purge', repo: SITE_REPO, id }); await _dReload(); } catch (e) {} }, true); }
function _dSecPick(id) { _dSecId = id; }
// 🃏 ПЕР-ПАЗІЦЫЙНЫ радок (карткі/навіны/радкі/FAQ/водгукі/брэнды): ● ▲▼ ⋯ — той жа радок, што ў секцый (парытэт панэлі)
function _dItemBar(secId, key, idx, total, active, type) {
  if (!_dEdit) return '';
  const a = _dsEsc(secId), k = _dsEsc(key), ty = _dsEsc(type || '');
  const mv = (on, dir, arr) => `<button class="ds-eb-btn"${on ? '' : ' disabled'} onclick="event.stopPropagation();_dItemMove('${a}','${k}',${idx},'${dir}')" title="${dir === 'up' ? _svcEsc(_dL('Уверх', 'Up')) : _svcEsc(_dL('Уніз', 'Down'))}">${arr}</button>`;
  const dot = `<button class="ds-eb-btn ds-eb-dot" onclick="event.stopPropagation();_dItemActive('${a}','${k}',${idx},${!active})" title="${active ? _svcEsc(_dL('Актыўна', 'Active')) : _svcEsc(_dL('Схавана', 'Hidden'))}">${_dDot(active)}</button>`;
  const menu = `<button class="ds-eb-btn ds-eb-menu" onclick="event.stopPropagation();_dItemMenu('${a}','${k}',${idx},'${ty}',this)" title="${_svcEsc(_dL('Меню', 'Menu'))}">⋯</button>`;
  return `<div class="ds-editbar ds-item-bar" contenteditable="false">${dot}${mv(idx > 0, 'up', '▲')}${mv(idx < total - 1, 'down', '▼')}${menu}</div>`;
}
async function _dItemMove(id, key, idx, dir) { try { await _draftPost({ action: 'draft_item', op: 'move', repo: SITE_REPO, id, key, idx, dir }); await _dReload(); } catch (e) {} }
async function _dItemActive(id, key, idx, active) { try { await _draftPost({ action: 'draft_set', repo: SITE_REPO, id, path: 'content.' + key + '.' + idx + '.hidden', val: !active }); await _dReload(); } catch (e) {} }
function _dItemDelete(id, key, idx) { siteConfirm(_dL('Выдаліць пазіцыю ў Сметніцу?', 'Move item to Trash?'), async () => { try { await _draftPost({ action: 'draft_item', op: 'delete', repo: SITE_REPO, id, key, idx }); await _dReload(); } catch (e) {} }, true); }
async function _dItemRestore(trashId) { _dInfoClose(); try { await _draftPost({ action: 'draft_item', op: 'restore', repo: SITE_REPO, trashId }); await _dReload(); } catch (e) {} }
function _dItemPurge(trashId) { siteConfirm(_dL('Выдаліць назаўжды?', 'Delete forever?'), async () => { _dInfoClose(); try { await _draftPost({ action: 'draft_item', op: 'purge', repo: SITE_REPO, trashId }); await _dReload(); } catch (e) {} }, true); }
function _dItemTrashOf(secId) { const s = siteData?._sections; const tr = Array.isArray(s?._trash) ? s._trash : []; return tr.filter(x => x && x._itemKey && x._itemOf === secId); } // выдаленыя пазіцыі гэтай секцыі
function _dItemLabel(x) { return (_sv(x.title) || _sv(x.name) || _sv(x.q) || _sv(x.author) || _sv(x.text) || _dL('Пазіцыя', 'Item')).replace(/<[^>]*>/g, ' ').slice(0, 40); }
// генерычны абгортнік пазіцыі (div-тыпы: FAQ/водгукі/брэнды) — position:relative + радок; па-за edit вяртае html як ёсць
function _dItemWrap(secId, key, idx, total, active, html, type) { return _dEdit ? `<div class="ds-item${active ? '' : ' ds-hidden'}">${_dItemBar(secId, key, idx, total, active, type)}${html}</div>` : html; }
// каталог палёў пазіцыі па тыпе секцыі (люстэрка схем панэлі; ml — мультымоўнае, opts — select). Новы тып = радок тут.
function _dItemFields(type) {
  const L = _dL;
  if (type === 'cards') return [{ k: 'icon', label: L('Іконка', 'Icon') }, { k: 'title', label: L('Назва', 'Title'), ml: 1 }, { k: 'text', label: L('Апісанне', 'Description'), ml: 1, area: 1 }, { k: 'price', label: L('Цана', 'Price') }, { k: 'currency', label: L('Валюта', 'Currency') }, { k: 'priceMode', label: L('Рэжым цаны', 'Price mode'), opts: [['exact', L('Дакладна', 'Exact')], ['from', L('Ад', 'From')], ['quote', L('Па дамове', 'Quote')]] }, { k: 'badge', label: L('Бэйдж', 'Badge'), opts: [['', L('Няма', 'None')], ['hit', L('Хіт', 'Hit')], ['new', L('Новае', 'New')], ['custom', L('Свой', 'Custom')]] }, { k: 'badgeText', label: L('Тэкст бэйджа', 'Badge text') }, { k: 'fulfil', label: L('Спосаб', 'Fulfil'), opts: [['cart', '🛒 ' + L('Кошык', 'Cart')], ['booking', '📅 ' + L('Запіс', 'Booking')], ['inquiry', '💬 ' + L('Запыт', 'Inquiry')], ['subscription', '🔁 ' + L('Падпіска', 'Subscription')]] }, { k: 'period', label: L('Перыяд', 'Period'), opts: [['month', L('Месяц', 'Month')], ['year', L('Год', 'Year')]] }];
  if (type === 'list') return [{ k: 'name', label: L('Назва', 'Name'), ml: 1 }, { k: 'value', label: L('Сума', 'Amount') }, { k: 'currency', label: L('Валюта', 'Currency') }];
  if (type === 'posts') return [{ k: 'title', label: L('Загаловак', 'Title'), ml: 1 }, { k: 'date', label: L('Дата', 'Date') }, { k: 'cover', label: L('Вокладка URL', 'Cover URL') }]; // цела — WYSIWYG інлайн
  if (type === 'testimonials') return [{ k: 'author', label: L('Аўтар', 'Author') }, { k: 'text', label: L('Тэкст', 'Text'), area: 1 }, { k: 'stars', label: L('Зоркі (1-5)', 'Stars (1-5)') }];
  if (type === 'brands') return [{ k: 'name', label: L('Назва', 'Name') }, { k: 'logo', label: L('Лагатып URL', 'Logo URL') }];
  if (type === 'accordion') return [{ k: 'q', label: L('Пытанне', 'Question'), ml: 1 }, { k: 'a', label: L('Адказ', 'Answer'), ml: 1, area: 1 }];
  return [];
}
function _dItemMenu(secId, key, idx, type, btn) { // ⋯ пазіцыі — тая ж панэльная сетка іконак: ✎ · ⧉ · ✕(danger)
  if (document.getElementById('ds-menu')) { _dMenuClose(); return; }
  const mi = (icon, title, onclick, cls) => `<button class="ds-mi${cls ? ' ' + cls : ''}" title="${_svcEsc(title)}" onclick="${onclick}">${icon}</button>`;
  const sep = '<div class="ds-msep"></div>';
  const m = document.createElement('div'); m.id = 'ds-menu'; m.className = 'ds-menu ds-menu-grid';
  m.innerHTML = [
    _dItemFields(type).length ? mi('✎', _dL('Рэдагаваць', 'Edit'), `_dItemEdit('${_dsEsc(secId)}','${_dsEsc(key)}',${idx},'${_dsEsc(type)}')`) : '',
    mi('⧉', _dL('Дубляваць', 'Duplicate'), `_dItemDup('${_dsEsc(secId)}','${_dsEsc(key)}',${idx})`),
    mi('✕', _dL('Выдаліць', 'Delete'), `_dItemDelete('${_dsEsc(secId)}','${_dsEsc(key)}',${idx})`, 'ds-mi-del') // канонны чырвоны ✕
  ].filter(Boolean).join(sep);
  document.body.appendChild(m);
  const r = btn.getBoundingClientRect();
  m.style.top = (r.bottom + 6 + scrollY) + 'px';
  m.style.left = Math.max(8, Math.min(r.right - m.offsetWidth + scrollX, scrollX + innerWidth - m.offsetWidth - 8)) + 'px';
  setTimeout(() => document.addEventListener('mousedown', _dMenuOutside, true), 0);
}
async function _dItemDup(secId, key, idx) { _dMenuClose(); try { await _draftPost({ action: 'draft_item', op: 'dup', repo: SITE_REPO, id: secId, key, idx }); await _dReload(); } catch (e) {} }
// ✎ мадалка палёў пазіцыі — генерычны рэндэр (тэкст/тэкстарэа/select), захаванне адным draft_item op='set'
function _dItemEdit(secId, key, idx, type) {
  _dMenuClose();
  const sec = _dSecById(secId); const item = sec && sec.content && sec.content[key] && sec.content[key][idx]; if (!item) return;
  const fields = _dItemFields(type); const lang = currentLang;
  const val = f => { const v = item[f.k]; return f.ml ? _sv(v) : (v == null ? '' : String(v)); };
  const ctrl = f => f.opts
    ? `<select data-fk="${_dsEsc(f.k)}" class="ds-ff">${f.opts.map(o => `<option value="${_svcEsc(o[0])}"${o[0] === val(f) ? ' selected' : ''}>${_svcEsc(o[1])}</option>`).join('')}</select>`
    : f.area ? `<textarea data-fk="${_dsEsc(f.k)}" class="ds-ff" rows="3">${_svcEsc(val(f))}</textarea>`
      : `<input data-fk="${_dsEsc(f.k)}" class="ds-ff" value="${_svcEsc(val(f))}">`;
  const rows = fields.map(f => `<label class="ds-fl"><span>${_svcEsc(f.label)}${f.ml ? ' <em style="opacity:.6">(' + _svcEsc(lang) + ')</em>' : ''}</span>${ctrl(f)}</label>`).join('');
  const m = document.createElement('div'); m.id = 'ds-fmodal'; m.className = 'ds-fmodal';
  m.innerHTML = `<div class="ds-fmbox"><div class="ds-fmbody">${rows}</div><div class="ds-fmfoot"><button class="ed-cancel" onclick="_dFModalClose()">${_svcEsc(getUI().reader_close || 'Закрыць')}</button><button class="ed-save" onclick="_dFModalSave('${_dsEsc(secId)}','${_dsEsc(key)}',${idx},'${_dsEsc(type)}')">💾 ${_svcEsc(getUI().ed_save || 'Захаваць')}</button></div></div>`;
  document.body.appendChild(m);
  m.addEventListener('mousedown', e => { if (e.target === m) _dFModalClose(); });
}
function _dFModalClose() { const m = document.getElementById('ds-fmodal'); if (m) m.remove(); }
async function _dFModalSave(secId, key, idx, type) {
  const m = document.getElementById('ds-fmodal'); if (!m) return;
  const sec = _dSecById(secId); const item = (sec && sec.content && sec.content[key] && sec.content[key][idx]) || {};
  const fields = _dItemFields(type); const lang = currentLang; const patch = {};
  fields.forEach(f => { const el = m.querySelector(`[data-fk="${f.k}"]`); if (!el) return; const v = el.value;
    if (f.ml) patch[f.k] = Object.assign({}, (item[f.k] && typeof item[f.k] === 'object') ? item[f.k] : {}, { [lang]: v }); // мержым бягучую мову, не сціраем іншыя
    else patch[f.k] = v; });
  _dFModalClose();
  try { await _draftPost({ action: 'draft_item', op: 'set', repo: SITE_REPO, id: secId, key, idx, patch }); await _dReload(); } catch (e) {}
}
// ═══ 🧷 КІРАВАННЕ КАТАЛОГАМ З ЧАРНАВІКА (draft_src) — бары на групах-Папках і картках source-секцыі ═══
// Той жа выгляд і меню, што ў пазіцый секцый (ААП-парытэт); адрозненне АДНО — адрасат запісу:
// чарнавік КАТАЛОГА ({site}:services:draft), не чарнавік старонкі. Публіка ўбачыць пасля 🚀.
function _dSrcNode(id) { return (_svcTree || []).find(n => n && n.id === id) || null; }
async function _dSrcPost(payload) { try { await _draftPost({ action: 'draft_src', repo: SITE_REPO, ...payload }); await _dReload(); } catch (e) {} }
function _dSrcBar(id, active) {
  if (!_dEdit || !id) return '';
  const a = _dsEsc(id);
  // preventDefault — бар групы жыве ЎНУТРЫ <summary>: без яго кожны клік кнопкі яшчэ і згортваў бы фолд
  const pd = 'event.preventDefault();event.stopPropagation();';
  const mv = (dir, arr) => `<button class="ds-eb-btn" onclick="${pd}_dSrcPost({op:'move',id:'${a}',dir:'${dir}'})" title="${dir === 'up' ? _svcEsc(_dL('Уверх', 'Up')) : _svcEsc(_dL('Уніз', 'Down'))}">${arr}</button>`; // край = no-op на серверы
  const dot = `<button class="ds-eb-btn ds-eb-dot" onclick="${pd}_dSrcPost({op:'active',id:'${a}',active:${!active}})" title="${active ? _svcEsc(_dL('Актыўна', 'Active')) : _svcEsc(_dL('Схавана', 'Hidden'))}">${_dDot(active)}</button>`;
  const menu = `<button class="ds-eb-btn ds-eb-menu" onclick="${pd}_dSrcMenu('${a}',this)" title="${_svcEsc(_dL('Меню', 'Menu'))}">⋯</button>`;
  return `<div class="ds-editbar ds-item-bar" contenteditable="false">${dot}${mv('up', '▲')}${mv('down', '▼')}${menu}</div>`;
}
function _dSrcMenu(id, btn) { // тая ж панэльная сетка іконак: [Папка: +📂 +🗒] · ⧉ · ✎ · ✕(danger)
  if (document.getElementById('ds-menu')) { _dMenuClose(); return; }
  const n = _dSrcNode(id); if (!n) return;
  const mi = (icon, title, onclick, cls) => `<button class="ds-mi${cls ? ' ' + cls : ''}" title="${_svcEsc(title)}" onclick="${onclick}">${icon}</button>`;
  const sep = '<div class="ds-msep"></div>';
  const m = document.createElement('div'); m.id = 'ds-menu'; m.className = 'ds-menu ds-menu-grid';
  // g1 — толькі ў Папкі-групы (канон Каталога: пазіцыі жывуць у Папках; сама пазіцыя дзяцей не мае)
  const g1 = n.type === 'folder'
    ? mi('+📂', _dL('Дадаць Папку', 'Add folder'), `_dSrcAdd('folder','${_dsEsc(id)}')`) + mi('+🗒', _dL('Дадаць пазіцыю', 'Add item'), `_dSrcTypePick('${_dsEsc(id)}',this)`)
    : '';
  m.innerHTML = [
    g1,
    mi('⧉', _dL('Дубляваць', 'Duplicate'), `_dMenuClose();_dSrcPost({op:'dup',id:'${_dsEsc(id)}'})`),
    mi('✎', _dL('Рэдагаваць', 'Edit'), `_dSrcEdit('${_dsEsc(id)}')`),
    mi('✕', _dL('Выдаліць', 'Delete'), `_dSrcDelete('${_dsEsc(id)}')`, 'ds-mi-del')
  ].filter(Boolean).join(sep);
  document.body.appendChild(m);
  const r = btn.getBoundingClientRect();
  m.style.top = (r.bottom + 6 + scrollY) + 'px';
  m.style.left = Math.max(8, Math.min(r.right - m.offsetWidth + scrollX, scrollX + innerWidth - m.offsetWidth - 8)) + 'px';
  setTimeout(() => document.addEventListener('mousedown', _dMenuOutside, true), 0);
}
function _dSrcDelete(id) {
  _dMenuClose();
  siteConfirm(_dL('Выдаліць у Сметніцу Каталога?', 'Move to Catalog Trash?'), async () => { await _dSrcPost({ op: 'delete', id }); }, true); // ♻ — у ⓘ source-секцыі
}
// ➕ стварэнне вузлоў Каталога з Чарнавіка: Папка (тут жа) / пазіцыя (праз пікер віду — люстэрка панэльнага _newFieldsPick)
async function _dSrcAdd(kind, parentId, fulfil) {
  _dMenuClose();
  try {
    const r = await _draftPost({ action: 'draft_src', op: 'add', repo: SITE_REPO, kind, parentId: parentId || null, fulfil: fulfil || '' });
    const j = r && r.json ? await r.json().catch(() => null) : null;
    await _dReload();
    if (j && j.id) _dSrcEdit(j.id); // новы вузел безназоўны і НеАктыўны (🌑 канон) → адразу ✎ запоўніць
  } catch (e) {}
}
function _dSrcTypePick(parentId, btn) { // «Што ствараем?» — 🛒 Тавар / 📅 Паслуга / 🔁 Падпіска → fulfil прэсэта
  const r = btn.getBoundingClientRect(); _dMenuClose();
  const mi = (icon, label, onclick) => `<button class="ds-mi" style="width:auto;padding:4px 10px;display:block" onclick="${onclick}">${icon} ${_svcEsc(label)}</button>`;
  const m = document.createElement('div'); m.id = 'ds-menu'; m.className = 'ds-menu';
  m.innerHTML = `<div class="ds-mi-sep">➕ ${_svcEsc(_dL('Што ствараем?', 'What to create?'))}</div>`
    + mi('🛒', _dL('Тавар', 'Product'), `_dSrcAdd('item','${_dsEsc(parentId)}','cart')`)
    + mi('📅', _dL('Паслуга', 'Service'), `_dSrcAdd('item','${_dsEsc(parentId)}','booking')`)
    + mi('🔁', _dL('Падпіска', 'Subscription'), `_dSrcAdd('item','${_dsEsc(parentId)}','subscription')`);
  document.body.appendChild(m);
  m.style.top = (r.bottom + 6 + scrollY) + 'px';
  m.style.left = Math.max(8, Math.min(r.right - m.offsetWidth + scrollX, scrollX + innerWidth - m.offsetWidth - 8)) + 'px';
  setTimeout(() => document.addEventListener('mousedown', _dMenuOutside, true), 0);
}
// ♻/✕ Сметніца Каталога (ⓘ source-секцыі)
async function _dSrcRestore(id) { _dInfoClose(); await _dSrcPost({ op: 'restore', id }); }
function _dSrcPurge(id) { siteConfirm(_dL('Выдаліць назаўжды?', 'Delete forever?'), async () => { _dInfoClose(); await _dSrcPost({ op: 'purge', id }); }, true); }
function _dSrcTrashLabel(x) { return (_sv(x.fields && x.fields.name) || _sv(x.name) || x.id).toString().slice(0, 40); }
// Палі КАТАЛОГА (ключы крыніцы, не секцыі): Папка → толькі назва; пазіцыя → поўны набор (белы спіс draft_src)
function _dSrcFields(n) {
  const L = _dL;
  if (n.type === 'folder') return [{ k: 'name', label: L('Назва', 'Name'), ml: 1 }];
  return [{ k: 'icon', label: L('Іконка', 'Icon') }, { k: 'name', label: L('Назва', 'Name'), ml: 1 }, { k: 'description', label: L('Апісанне', 'Description'), ml: 1, area: 1 },
    { k: 'price', label: L('Цана', 'Price') }, { k: 'currency', label: L('Валюта', 'Currency') },
    { k: 'priceMode', label: L('Рэжым цаны', 'Price mode'), opts: [['exact', L('Дакладна', 'Exact')], ['from', L('Ад', 'From')], ['quote', L('Па дамове', 'Quote')]] },
    { k: 'badge', label: L('Бэйдж', 'Badge'), opts: [['none', L('Няма', 'None')], ['hit', L('Хіт', 'Hit')], ['new', L('Новае', 'New')], ['promo', L('Акцыя', 'Promo')], ['custom', L('Свой', 'Custom')]] },
    { k: 'badgeText', label: L('Тэкст бэйджа', 'Badge text') },
    { k: 'fulfil', label: L('Спосаб', 'Fulfil'), opts: [['cart', '🛒 ' + L('Кошык', 'Cart')], ['booking', '📅 ' + L('Запіс', 'Booking')], ['inquiry', '💬 ' + L('Запыт', 'Inquiry')], ['subscription', '🔁 ' + L('Падпіска', 'Subscription')]] },
    { k: 'period', label: L('Перыяд', 'Period'), opts: [['month', L('Месяц', 'Month')], ['year', L('Год', 'Year')]] },
    { k: 'groupMax', label: '👥 ' + L('Ліміт групы', 'Group limit') }];
}
function _dSrcEdit(id) { // ✎ мадалка палёў вузла Каталога — той жа ds-fmodal, што ў пазіцый
  _dMenuClose();
  const n = _dSrcNode(id); if (!n) return;
  const f = n.fields || {}; const fields = _dSrcFields(n); const lang = currentLang;
  const cur = k => k === 'name' && n.type === 'folder' ? n.name : f[k]; // назва Папкі жыве на вузле
  const val = fd => { const v = cur(fd.k); return fd.ml ? _sv(v) : (v == null ? '' : String(v)); };
  const ctrl = fd => fd.opts
    ? `<select data-fk="${_dsEsc(fd.k)}" class="ds-ff">${fd.opts.map(o => `<option value="${_svcEsc(o[0])}"${o[0] === val(fd) ? ' selected' : ''}>${_svcEsc(o[1])}</option>`).join('')}</select>`
    : fd.area ? `<textarea data-fk="${_dsEsc(fd.k)}" class="ds-ff" rows="3">${_svcEsc(val(fd))}</textarea>`
      : `<input data-fk="${_dsEsc(fd.k)}" class="ds-ff" value="${_svcEsc(val(fd))}">`;
  const rows = fields.map(fd => `<label class="ds-fl"><span>${_svcEsc(fd.label)}${fd.ml ? ' <em style="opacity:.6">(' + _svcEsc(lang) + ')</em>' : ''}</span>${ctrl(fd)}</label>`).join('');
  const m = document.createElement('div'); m.id = 'ds-fmodal'; m.className = 'ds-fmodal';
  m.innerHTML = `<div class="ds-fmbox"><div class="ds-fmbody">${rows}</div><div class="ds-fmfoot"><button class="ed-cancel" onclick="_dFModalClose()">${_svcEsc(getUI().reader_close || 'Закрыць')}</button><button class="ed-save" onclick="_dSrcModalSave('${_dsEsc(id)}')">💾 ${_svcEsc(getUI().ed_save || 'Захаваць')}</button></div></div>`;
  document.body.appendChild(m);
  m.addEventListener('mousedown', e => { if (e.target === m) _dFModalClose(); });
}
async function _dSrcModalSave(id) {
  const m = document.getElementById('ds-fmodal'); if (!m) return;
  const n = _dSrcNode(id); if (!n) { _dFModalClose(); return; }
  const f = n.fields || {}; const lang = currentLang; const patch = {};
  _dSrcFields(n).forEach(fd => {
    const el = m.querySelector(`[data-fk="${fd.k}"]`); if (!el) return;
    const v = el.value;
    const curV = fd.k === 'name' && n.type === 'folder' ? n.name : f[fd.k];
    if (fd.ml) patch[fd.k] = Object.assign({}, (curV && typeof curV === 'object') ? curV : {}, { [lang]: v }); // мержым бягучую мову, не сціраем іншыя
    else patch[fd.k] = v;
  });
  _dFModalClose();
  await _dSrcPost({ op: 'set', id, patch });
}
// ➕ ДАДАЦЬ: агульны спіс опцый (тыпы секцый + Раздзел + Фота) для пікера — parentId=null (старонка) або id раздзела.
// nodesOnly=true (унутр СЕКЦЫІ): толькі 📁 Папка + 📷 Фота — канон «Форму не кладуць у Форму» (секцыя ў секцыі),
// але Папкі-0 і Файлы секцыя трымае гэтак жа, як любая Папка панэлі (+📂/+📎 — ААП-парытэт з панэллю)
function _dAddOptionsHtml(parentId, typesOnly) {
  const mi = (icon, label, onclick) => `<button class="ds-mi" onclick="${onclick}">${icon} ${_svcEsc(label)}</button>`;
  const pid = parentId ? `'${_dsEsc(parentId)}'` : 'null';
  return _D_ADD_TYPES.map(t => mi(t[1], _dL(t[2], t[3]), `_dAddNode('section','${t[0]}',${pid})`)).join('')
    + (typesOnly ? '' // +🗒-пікер тыпаў (з ⋯ раздзела): Папка/Файл маюць свае кнопкі +📂/+📎 у самім меню
      : mi('📁', _dL('Раздзел', 'Folder'), `_dAddNode('folder','',${pid})`)
        + mi('📷', _dL('Фота', 'Photo'), `_dFileAdd(${pid})`));
}
// 📷 бяспечная загрузка фота на месцы: image-only + ≤4МБ (сервер таксама правярае); base64 → draft_file → новы ФайлБлок
function _fileToB64(f) { return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1] || ''); r.onerror = rej; r.readAsDataURL(f); }); }
function _dFileAdd(parentId) {
  _dMenuClose();
  const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*'; inp.multiple = true;
  inp.onchange = async () => {
    const files = [...(inp.files || [])].slice(0, 10);
    let skipped = 0, ok = 0;
    for (const f of files) {
      if (!f.type.startsWith('image/') || f.size > 4 * 1024 * 1024) { skipped++; continue; } // толькі выявы ≤4МБ (сервер дублюе праверку)
      try { const data = await _fileToB64(f); const r = await _draftPost({ action: 'draft_file', repo: SITE_REPO, parentId: parentId || null, contentType: f.type, data }); if (r && r.ok) ok++; else skipped++; } catch (e) { skipped++; } // праз чаргу (без гонкі з draft_set)
    }
    if (ok) await _dReload();
    if (skipped) siteConfirm(_dL('Прапушчана файлаў: ', 'Files skipped: ') + skipped + '\n' + _dL('(толькі выявы да 4 МБ)', '(images up to 4 MB only)'), () => {});
  };
  inp.click();
}
function _dAddMenu(parentId, btn) { // пікер «Дадаць» на ўзроўні старонкі (з ніжняй панэлі)
  if (document.getElementById('ds-menu')) { _dMenuClose(); return; }
  _dAddMenuAt(parentId, btn.getBoundingClientRect(), false);
}
// агульны рэндэр пікера «Дадаць» па гатовым rect (каб клікнутая кнопка магла быць ужо прыбраная з DOM — +🗒 з ⋯)
function _dAddMenuAt(parentId, r, typesOnly) {
  const m = document.createElement('div'); m.id = 'ds-menu'; m.className = 'ds-menu';
  m.innerHTML = `<div class="ds-mi-sep">➕ ${_svcEsc(typesOnly ? _dL('Дадаць Секцыю', 'Add section') : _dL('Дадаць', 'Add'))}</div>${_dAddOptionsHtml(parentId, typesOnly)}`;
  document.body.appendChild(m);
  m.style.top = (r.bottom + 6 + scrollY) + 'px';
  m.style.left = Math.max(8, Math.min(r.right - m.offsetWidth + scrollX, scrollX + innerWidth - m.offsetWidth - 8)) + 'px';
  setTimeout(() => document.addEventListener('mousedown', _dMenuOutside, true), 0);
}
async function _dAddNode(kind, secType, parentId) { // стварыць секцыю/раздзел у чарнавік
  _dMenuClose();
  try { await _draftPost({ action: 'draft_add', repo: SITE_REPO, kind, secType, parentId: parentId || null }); await _dReload(); } catch (e) {}
}
async function _dItemAdd(secId, key, type) { // ➕ пустая пазіцыя → перарэндэр → адразу мадалка палёў новай
  _dMenuClose();
  try {
    await _draftPost({ action: 'draft_item', op: 'add', repo: SITE_REPO, id: secId, key });
    await _dReload();
    const sec = _dSecById(secId), arr = sec && sec.content && sec.content[key];
    if (arr && arr.length && _dItemFields(type).length) _dItemEdit(secId, key, arr.length - 1, type); // адкрыць праўку новай
  } catch (e) {}
}
async function _dChange(key, val) { // прама ў чарнавік праз worker (lookToken), потым перарэндэр
  if (!_dSecId) return;
  try {
    await _draftPost({ action: 'draft_set', repo: SITE_REPO, id: _dSecId, key, val }); // праз чаргу (без гонкі)
    await _dReload();
  } catch (e) {}
}
async function _dReload() { // перачытаць чарнавік і перарэндэрыць старонку + оверлэй
  try {
    const tok = new URLSearchParams(location.search).get('look');
    const r = await fetch(API_URL + '/content/' + SITE_REPO + '/sections?draft=' + encodeURIComponent(tok) + '&cb=' + Date.now());
    const data = await r.json();
    if ((Array.isArray(data?.sections) ? data.sections : []).some(x => x && x.source)) await _svcFetchTree(); // 🧷 Каталог-чарнавік мог змяніцца (draft_src)
    _svcResolveSources(data);
    siteData._sections = data; renderDynamicSections(data);
    initReveal(); // 🎯 ФІКС (як пры змене мовы v4.601): перарэндэраныя секцыі — НОВЫЯ DOM-вузлы; без паўторнага reveal-назіральніка завісаюць схаванымі (.js-reveal без .in-view)
    _dEditRender();
    _dStatusRefresh(); // 🔔 кожная праўка магла зрабіць Сайт састарэлым (ці наадварот — вярнуць да published)
  } catch (e) {}
}
// 🖊️ слайс A: праўка кантэнту НА МЕСЦЫ — focusout з [data-ed] → draft_set з укладзеным шляхам (дэлегавана, перажывае перарэндэры)
// 🖊️ атрыбут рэдагавальнага элемента. mode text|ml — inline contenteditable; mode rich — клік адкрывае
// мадалку WYSIWYG (доўгае/прыгожае цела). Новае поле = адзін выклік.
function _edAttr(id, path, mode, ph) {
  if (!_dEdit) return '';
  if (mode === 'rich') return ` data-edm="${_dsEsc(id + '::' + path)}" data-ph="${_dsEsc(ph || '')}" title="${_dsEsc(ph || '')}"`; // без class (элемент ужо мае свой) — стыль/клік па [data-edm]
  return ` contenteditable="true" data-ed="${_dsEsc(id + '::' + path + '::' + (mode || 'text'))}"${ph ? ` data-ph="${_dsEsc(ph)}"` : ''}`;
}
// 🔒 ЧАРГА draft-запісаў: draft_set/draft_theme — read-modify-write адзін sections/settings-чарнавік →
// паралельныя праўкі перазапісвалі б адна адну. Серыялізуем усе праз адзін ланцуг промісаў.
let _draftQ = Promise.resolve();
// 🔑 Адзіны пункт аўтарызацыі draft_*-мутацый: editToken (з &ed= у спасылцы 👁 уладальніка), а НЕ lookToken —
// той шэрыцца з гасцямі і чытаецца з публічнага settings, дык запісу даваць не можа. Каллеры токена не бачаць.
function _draftPost(body) {
  _draftQ = _draftQ.then(() => fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ repo: SITE_REPO, ...body, editToken: _dEditTok }) }).catch(() => {}));
  return _draftQ;
}
let _dEditBound = false;
function _dEditBind() {
  if (_dEditBound) return; _dEditBound = true;
  document.addEventListener('keydown', e => { const el = e.target.closest && e.target.closest('[data-ed]'); if (el && e.key === 'Enter' && !e.shiftKey && !(el.dataset.ed || '').endsWith('::html')) { e.preventDefault(); el.blur(); } }); // Enter=скончыць
  document.addEventListener('click', e => { const el = e.target.closest && e.target.closest('[data-edm]'); if (el) { e.preventDefault(); e.stopPropagation(); _edModalOpen(el); } }); // rich-цела → мадалка WYSIWYG
  document.addEventListener('focusout', async e => {
    const el = e.target.closest && e.target.closest('[data-ed]'); if (!el) return;
    const [id, path0, mode] = (el.dataset.ed || '').split('::'); if (!id || !path0) return;
    const path = mode === 'ml' ? path0 + '.' + currentLang : path0; // ml-палі (title/subtitle) → {бягучая мова}
    const val = mode === 'html' ? el.innerHTML.trim() : el.textContent.trim(); // body — HTML; астатняе — плоскі тэкст
    _draftPost({ action: 'draft_set', repo: SITE_REPO, id, path, val, html: mode === 'html' }).then(() => _edFlash(el)); // праз чаргу + зялёны флэш «захавана»; html→серверная санітызацыя
  });
}
// ✓ кароткі візуальны водгук «захавана» на элеменце пасля запісу ў чарнавік
function _edFlash(el) { if (!el || !el.isConnected) return; el.classList.add('ed-saved'); setTimeout(() => el.classList.remove('ed-saved'), 750); }
// 🖊️ МАДАЛКА-WYSIWYG для прыгожага цела (Тэкст-секцыі, Навіны) — той жа Quill, што і ў панэлі (прывычна кліенту).
// Quill грузіцца ЛЯНІВА толькі ў edit-рэжыме (звычайны наведвальнік не плаціць за ~200КБ).
let _edModalEl = null, _edModalCtx = null, _edQuill = null, _edQuillP = null;
function _edQuillLoad() { // адзін раз падгрузіць Quill CSS+JS з unpkg (як admin)
  if (window.Quill) return Promise.resolve();
  if (_edQuillP) return _edQuillP;
  _edQuillP = new Promise((res, rej) => {
    if (!document.querySelector('link[data-quill]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'https://unpkg.com/quill@2.0.2/dist/quill.snow.css'; l.setAttribute('data-quill', '1'); document.head.appendChild(l); }
    const s = document.createElement('script'); s.src = 'https://unpkg.com/quill@2.0.2/dist/quill.js'; s.onload = res; s.onerror = rej; document.head.appendChild(s);
  });
  return _edQuillP;
}
// эфектыўны (скампазаваны) фон элемента: збірае паўпразрыстыя слаі фону ад el уверх да першага
// непразрыстага, кампазуе іх — вяртае суцэльны rgb, які РЭАЛЬНА бачны на месцы карткі.
function _effectiveBg(node) {
  const parse = c => { const m = c && c.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s/]+([\d.]+))?/); return m ? { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : +m[4] } : null; };
  const stack = []; let n = node, base = null;
  while (n) { const p = parse(getComputedStyle(n).backgroundColor); if (p) { if (p.a >= 0.999) { base = p; break; } if (p.a > 0) stack.push(p); } n = n.parentElement; }
  if (!base) base = { r: 255, g: 255, b: 255, a: 1 };
  let cur = base; // ад дна (непразрысты) уверх — накладаем кожны паўпразрысты слой
  for (let i = stack.length - 1; i >= 0; i--) { const t = stack[i]; cur = { r: Math.round(t.r * t.a + cur.r * (1 - t.a)), g: Math.round(t.g * t.a + cur.g * (1 - t.a)), b: Math.round(t.b * t.a + cur.b * (1 - t.a)) }; }
  return `rgb(${cur.r}, ${cur.g}, ${cur.b})`;
}
function _edModalOpen(el) {
  const [id, path] = (el.dataset.edm || '').split('::'); if (!id || !path) return;
  _edModalCtx = { el, id, path };
  const ui = getUI();
  if (!_edModalEl) {
    _edModalEl = document.createElement('div'); _edModalEl.id = 'ed-modal';
    _edModalEl.innerHTML = `<div class="ed-modal-box">
      <div class="ed-modal-quill"></div>
      <div class="ed-modal-foot"><button type="button" class="ed-cancel" onclick="_edModalClose()">${_svcEsc(ui.reader_close || 'Закрыць')}</button><button type="button" class="ed-save" onclick="_edModalSave()">💾 ${_svcEsc(ui.ed_save || 'Захаваць')}</button></div>
    </div>`;
    document.body.appendChild(_edModalEl);
    _edModalEl.addEventListener('mousedown', e => { if (e.target === _edModalEl) _edModalClose(); }); // клік па фоне закрывае
  }
  const html = el.innerHTML;
  // 🎨 колеры з ЖЫВОЙ старонкі (іменаванне тэма-зменных заблытанае → чытаем computed). Мадалка = як картка.
  const rootCs = getComputedStyle(document.documentElement);
  const fg = getComputedStyle(el).color || '#1a1a1a'; // колер САМОГА рэдагаванага тэксту (дакладна як на старонцы)
  // фон = ЭФЕКТЫЎНЫ колер карткі, як бачыць вока: шкляныя карткі (rgba<1) кампазуюцца паверх свайго фону.
  // (Раней бралі першы непразрысты продак → карычневы фон пад шкляной сіняй карткай — не супадала.)
  const bg = _effectiveBg(el);
  const accent = rootCs.getPropertyValue('--accent').trim() || rootCs.getPropertyValue('--color-primary').trim() || '#f97316';
  const box = _edModalEl.querySelector('.ed-modal-box'); // інлайн-var перакрываюць CSS-фолбэкі
  box.style.setProperty('--card-bg', bg); box.style.setProperty('--text-main', fg);
  box.style.setProperty('--text-muted', 'color-mix(in srgb, ' + fg + ' 60%, transparent)'); box.style.setProperty('--accent', accent);
  box.style.setProperty('--border-color', 'color-mix(in srgb, ' + fg + ' 42%, transparent)');
  _edModalEl.style.display = 'flex';
  _edQuillLoad().then(() => {
    const host = _edModalEl.querySelector('.ed-modal-quill');
    if (!_edQuill) { // адзін інстанс, той жа toolbar-канфіг што ў панэлі (nodeInitRichtext)
      _edQuill = new Quill(host, { theme: 'snow', modules: { toolbar: [[{ header: [1, 2, 3, false] }], ['bold', 'italic', 'underline'], [{ list: 'ordered' }, { list: 'bullet' }], ['link'], ['clean']] } });
    }
    _edQuill.root.innerHTML = html; // сыпем бягучае цела
    setTimeout(() => _edQuill.focus(), 40);
  }).catch(() => { console.warn('[ttzop] Quill load failed'); _edModalClose(); });
}
function _edModalClose() { if (_edModalEl) _edModalEl.style.display = 'none'; _edModalCtx = null; }
function _edModalSave() {
  if (!_edModalCtx || !_edQuill) return;
  const { el, id, path } = _edModalCtx;
  let html = _edQuill.root.innerHTML.trim();
  if (html === '<p><br></p>') html = ''; // пусты Quill
  el.innerHTML = html; _edFlash(el); _edModalClose(); // адразу на старонцы + флэш
  _draftPost({ action: 'draft_set', repo: SITE_REPO, id, path, val: html, html: true }); // праз чаргу; html→серверная санітызацыя
}
function _lookPick(kind, id) { _lookSel[kind] = id; _lookRefresh(); }
function _lookRefresh() {
  document.querySelectorAll('.look-opt').forEach(b => b.classList.toggle('on', _lookSel[b.dataset.kind] === b.dataset.id));
  const tc = _lookTC(); if (!tc) return;
  applyTheme({ themeColors: tc }); // жывое ўжыванне (захаванне ў чарнавік — «✓ Выбраць»)
  initHeroPhoto(); // восі heroPhoto/marquee/stamp маглі пераключыцца
  initMarquee();
  initStamp(siteData);
}
// {base,vars,design} з выбранай палітры+паводзін — агульны для жывога прэв'ю і захавання ў чарнавік
function _lookTC() {
  const nodes = siteData.themeTree || [];
  const pal = nodes.find(n => n.id === _lookSel.p), d = nodes.find(n => n.id === _lookSel.d);
  if (!pal || !d) return null;
  const vars = {}; Object.entries(_LOOK_SLOTS).forEach(([k, cssVar]) => { const hx = pal.fields?.[k]; if (/^#[0-9a-fA-F]{6}$/.test(hx || '')) vars[cssVar] = hx; });
  const base = _LOOK_BASES.includes(pal.fields?.base) ? pal.fields.base : (_LOOK_BASES.includes(pal.id) ? pal.id : 'steel');
  return { base, vars, design: d.fields || {} };
}
// 🎨 «✓ Выбраць» — захаваць тэму (палітра+паводзіны) у ЧАРНАВІК ПРАМА праз worker draft_theme (lookToken).
// Самадастаткова, адзін таб — працуе на Тэсла Atom (без BroadcastChannel/навігацыі ў панэль).
async function _lookApply() {
  const tc = _lookTC(); if (!tc) return;
  try {
    await _draftPost({ action: 'draft_theme', repo: SITE_REPO, theme: _lookSel.p, activeDesign: _lookSel.d, themeColors: tc }); // праз чаргу (без гонкі)
    const btn = document.querySelector('#look-panel .look-apply'); if (btn) { const t0 = btn.textContent; btn.textContent = '✓'; setTimeout(() => { btn.textContent = t0; }, 1400); } // фідбэк
  } catch (e) {}
}

// 🎛 Бягучы радок (data-d-marquee=on, прэсэт «Штамп»): стужка паслуг/коштаў пад hero.
// Часткі кладзе renderDynamicSections у _marqueeParts (з cards-секцый) — таму пераклікаецца адтуль і з прэв'ю.
let _marqueeParts = [];
function initMarquee() {
  const old = document.getElementById('site-marquee');
  if (document.documentElement.dataset.dMarquee !== 'on' || !_marqueeParts.length) { old?.remove(); return; }
  const hero = document.getElementById('hero'); if (!hero) return;
  let el = old;
  if (!el) { el = document.createElement('div'); el.id = 'site-marquee'; el.setAttribute('aria-hidden', 'true'); hero.after(el); }
  const line = _marqueeParts.map(_svcEsc).join(' &nbsp;✚&nbsp; ') + ' &nbsp;✚&nbsp; ';
  el.innerHTML = `<div class="mq-track">${line}${line}</div>`; // ×2 — бясшоўная пятля (анімацыя -50%)
}
// 🎛 Пячатка (data-d-stamp=on, прэсэт «Штамп»): круглы штамп з кароткай назвай кампаніі ў hero
function initStamp(data) {
  const old = document.getElementById('hero-stamp');
  if (document.documentElement.dataset.dStamp !== 'on') { old?.remove(); return; }
  const co = data?.company || {};
  const pick = v => (v && typeof v === 'object') ? (v[currentLang] || v[getPrimaryLang(data)] || Object.values(v).find(Boolean) || '') : (v || '');
  const txt = pick(co.shortName) || pick(co.shortOfficial) || pick(co.name) || '';
  const heroInner = document.querySelector('#hero .hero-inner');
  if (!txt || !heroInner) { old?.remove(); return; }
  let el = old;
  if (!el) { el = document.createElement('div'); el.id = 'hero-stamp'; heroInner.appendChild(el); }
  el.textContent = txt;
}

// 🎛 Фонавае фота hero (data-d-herophoto=on): першы здымак з галерэі + цёмны аверлэй.
// Няма фота — нічога не робім (застаецца градыент heroStyle). Загрузіш фота ў галерэю — hero «дазрэе» сам.
async function initHeroPhoto() {
  if (document.documentElement.dataset.dHerophoto !== 'on') { document.getElementById('hero-photo')?.remove(); return; } // вось выключылі (прэв'ю) — прыбраць здымак
  try {
    const res = await fetch(API_URL + '/content/' + SITE_REPO + '/files');
    if (!res.ok) return;
    const data = await res.json();
    const img = (data?.nodes || []).find(n => (n.type === 'file' || n.type === 'item') && n.url && !n.hidden);
    if (!img) return;
    const hero = document.getElementById('hero'); if (!hero) return;
    let ph = document.getElementById('hero-photo');
    if (!ph) { ph = document.createElement('div'); ph.id = 'hero-photo'; hero.prepend(ph); }
    ph.style.backgroundImage = `linear-gradient(178deg, rgba(6,9,7,0.45) 0%, rgba(6,9,7,0.82) 100%), url("${img.url}")`;
  } catch { /* фота неабавязковае */ }
}

document.addEventListener('DOMContentLoaded', init);

// Плаўнае з'яўленне секцый пры скроле. Бяспечна: клас .js-reveal (які хавае секцыі да in-view)
// ставіцца ТОЛЬКІ пры падтрымцы IntersectionObserver, выключаным prefers-reduced-motion
// І ўключаным дызайн-параметры тэмы anim (data-d-anim, гл. applyTheme) —
// інакш старонка паказваецца адразу цалкам (ніякіх «нябачных секцый» без JS).
// Выклікаецца з init() ПАСЛЯ applyTheme (каб бачыць data-d-anim), не пры парсінгу файла.
let _revealIO = null;
function initReveal() {
  if (document.documentElement.dataset.dAnim === 'off') return;
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.body.classList.add('js-reveal');
  if (_revealIO) _revealIO.disconnect(); // перарэндэр (змена мовы): адключыць стары назіральнік — не цячэ і зможа назіраць НОВЫЯ секцыі
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px' });
  _revealIO = io;
  document.querySelectorAll('section').forEach(s => io.observe(s));
}

// Glass-навбар: пасля пракруткі за hero навбар становіцца паўпразрыстым са blur
// (клас .scrolled + CSS-гейт html[data-d-glass="on"]). Танны passive-слухач.
function initGlassNav() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  const upd = () => nav.classList.toggle('scrolled', window.scrollY > 24);
  window.addEventListener('scroll', upd, { passive: true });
  upd();
}

// Мабільная плаваючая CTA (дызайн-параметр stickyCta): 📞 званок + кнопка да формы запісу.
// Паказваецца толькі на вузкіх экранах (CSS). Кошык цяпер у навбары (іконка 🛒), ніжняга бара няма.
function initStickyCta(data) {
  if (document.documentElement.dataset.dSticky === 'off') return;
  const phones = _contactFlat(data, 'phone') || [];
  const phone = phones[0]?.value || data.phone || '';
  const bar = document.createElement('div');
  bar.id = 'sticky-cta';
  bar.innerHTML =
    (phone ? `<a class="btn btn-outline" href="tel:${_escHtml(String(phone).replace(/[^\d+]/g, ''))}">📞</a>` : '') +
    `<a class="btn btn-primary" href="#contact">${_escHtml(getUI().cta_book || '')}</a>`;
  document.body.appendChild(bar);
}

// Версія білда сайта — той жа APP_VERSION, што ў панэлі (admin/version.js, падключаны ў index.html
// перад main.js). Паказ побач з лагатыпам + у кансолі: адразу бачна, ці дакаціўся дэплой Pages.
if (typeof APP_VERSION !== 'undefined') {
  console.log('TTZOP ' + APP_VERSION);
  const _vEl = document.getElementById('site-version');
  if (_vEl) _vEl.textContent = APP_VERSION;
}