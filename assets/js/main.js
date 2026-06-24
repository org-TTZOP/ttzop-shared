/* ================================================
   TTZOP — main.js
   Загружае даныя кліента з JSON і запаўняе сайт
   ================================================ */

async function loadSiteData() {
  try {
    const response = await fetch(API_URL + '/content/' + SITE_REPO + '/settings');
    const data = await response.json();
    return data;
  } catch (e) {
    console.error('Памылка загрузкі даных:', e);
    return null;
  }
}

function applyTheme(data) {
  if (data.theme) {
    document.documentElement.setAttribute('data-theme', data.theme);
  }
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
    cart_title: 'Кошык: {n} паслуг(і)', cart_clear: 'Ачысціць', cart_order: 'Аформіць заказ →', cart_remove: 'Выдаліць',
    cart_added: '🛒 У кошыку ({n})', add_to_cart: '🛒 У кошык',
    privacy_title: 'Палітыка прыватнасці', privacy_subtitle: 'Перад замовай азнаёмцеся з палітыкай прыватнасці',
    privacy_agree: 'Я азнаёміўся і згаджаюся з палітыкай прыватнасці', privacy_decline: 'Адмовіцца', privacy_continue: 'Працягнуць →',
    form_title: 'Аформіць заказ', form_subdomain: 'Жаданы паддамен', form_email: 'Ваш Email',
    form_note: 'Заўвага (неабавязкова)', form_note_ph: 'Вашы пытанні або пажаданні...',
    form_back: 'Назад', form_send_code: 'Атрымаць код →', form_sending: 'Адпраўляем...',
    form_err_email: 'Увядзіце правільны email', form_err_subdomain: 'Увядзіце жаданы паддамен',
    form_err_subdomain_taken: 'Выберыце вольны паддамен', form_err_subdomain_test: 'Паддамен не можа ўтрымліваць "test"', form_err_connection: 'Памылка злучэння',
    verify_title: 'Пацверджанне email', verify_sent: 'Код адпраўлены на', verify_label: '6-значны код',
    verify_btn: 'Пацвердзіць і адправіць заказ', verify_checking: 'Правяраем...',
    verify_err: 'Увядзіце 6-значны код', verify_err_wrong: 'Няправільны код',
    done_title: 'Заказ прыняты!',
    done_subdomain: 'Дзякуй! Ваш сайт <b style="color:#f97316">{domain}</b> ствараецца.<br>Вы атрымаеце ліст на <b style="color:#e8eaf0">{email}</b> калі ён будзе гатовы.',
    done_regular: 'Дзякуй! Мы звяжамся з вамі па email <b style="color:#e8eaf0">{email}</b> у бліжэйшы час.',
    done_close: 'Закрыць',
    form_site_langs: 'Мовы сайта', form_site_langs_err: 'Выберыце хаця б адну мову',
    cart_added_ok: '✓ Дадана!', form_err_send: 'Памылка.', form_err_conn: 'Памылка сувязі.', privacy_unavailable: 'Палітыка прыватнасці недаступная.',
    subdomain_invalid: 'Толькі малыя літары, лічбы і злучок. Ад 3 да 30 знакаў.',
    subdomain_free: '✅ {subdomain}.ttzop.com — вольны!', subdomain_check_err: 'Памылка праверкі',
  },
  en: {
    cart_title: 'Cart: {n} item(s)', cart_clear: 'Clear', cart_order: 'Place order →', cart_remove: 'Remove',
    cart_added: '🛒 In cart ({n})', add_to_cart: '🛒 Add to cart',
    privacy_title: 'Privacy Policy', privacy_subtitle: 'Please read our privacy policy before ordering',
    privacy_agree: 'I have read and agree to the privacy policy', privacy_decline: 'Decline', privacy_continue: 'Continue →',
    form_title: 'Place order', form_subdomain: 'Desired subdomain', form_email: 'Your Email',
    form_note: 'Note (optional)', form_note_ph: 'Your questions or wishes...',
    form_back: 'Back', form_send_code: 'Get code →', form_sending: 'Sending...',
    form_err_email: 'Enter a valid email', form_err_subdomain: 'Enter desired subdomain',
    form_err_subdomain_taken: 'Choose an available subdomain', form_err_subdomain_test: 'Subdomain cannot contain "test"', form_err_connection: 'Connection error',
    verify_title: 'Email confirmation', verify_sent: 'Code sent to', verify_label: '6-digit code',
    verify_btn: 'Confirm and place order', verify_checking: 'Checking...',
    verify_err: 'Enter the 6-digit code', verify_err_wrong: 'Incorrect code',
    done_title: 'Order accepted!',
    done_subdomain: 'Thank you! Your site <b style="color:#f97316">{domain}</b> is being created.<br>You will receive an email at <b style="color:#e8eaf0">{email}</b> when it\'s ready.',
    done_regular: 'Thank you! We will contact you at <b style="color:#e8eaf0">{email}</b> shortly.',
    done_close: 'Close',
    form_site_langs: 'Site languages', form_site_langs_err: 'Select at least one language',
    cart_added_ok: '✓ Added!', form_err_send: 'Error.', form_err_conn: 'Connection error.', privacy_unavailable: 'Privacy policy unavailable.',
    subdomain_invalid: 'Only lowercase letters, numbers and hyphens. 3 to 30 characters.',
    subdomain_free: '✅ {subdomain}.ttzop.com — available!', subdomain_check_err: 'Check error',
  },
  uk: {
    cart_title: 'Кошик: {n} послуг(и)', cart_clear: 'Очистити', cart_order: 'Оформити замовлення →', cart_remove: 'Видалити',
    cart_added: '🛒 У кошику ({n})', add_to_cart: '🛒 У кошик',
    privacy_title: 'Політика конфіденційності', privacy_subtitle: 'Перед замовленням ознайомтесь з політикою конфіденційності',
    privacy_agree: 'Я ознайомився і погоджуюсь з політикою конфіденційності', privacy_decline: 'Відмовитися', privacy_continue: 'Продовжити →',
    form_title: 'Оформити замовлення', form_subdomain: 'Бажаний піддомен', form_email: 'Ваш Email',
    form_note: 'Примітка (необов\'язково)', form_note_ph: 'Ваші питання або побажання...',
    form_back: 'Назад', form_send_code: 'Отримати код →', form_sending: 'Відправляємо...',
    form_err_email: 'Введіть правильний email', form_err_subdomain: 'Введіть бажаний піддомен',
    form_err_subdomain_taken: 'Виберіть вільний піддомен', form_err_subdomain_test: 'Піддомен не може містити "test"', form_err_connection: 'Помилка з\'єднання',
    verify_title: 'Підтвердження email', verify_sent: 'Код відправлено на', verify_label: '6-значний код',
    verify_btn: 'Підтвердити і відправити замовлення', verify_checking: 'Перевіряємо...',
    verify_err: 'Введіть 6-значний код', verify_err_wrong: 'Невірний код',
    done_title: 'Замовлення прийнято!',
    done_subdomain: 'Дякуємо! Ваш сайт <b style="color:#f97316">{domain}</b> створюється.<br>Ви отримаєте лист на <b style="color:#e8eaf0">{email}</b> коли він буде готовий.',
    done_regular: 'Дякуємо! Ми зв\'яжемося з вами по email <b style="color:#e8eaf0">{email}</b> найближчим часом.',
    done_close: 'Закрити',
    form_site_langs: 'Мови сайту', form_site_langs_err: 'Виберіть хоча б одну мову',
    cart_added_ok: '✓ Додано!', form_err_send: 'Помилка.', form_err_conn: 'Помилка з\'єднання.', privacy_unavailable: 'Політика конфіденційності недоступна.',
    subdomain_invalid: 'Тільки малі літери, цифри і дефіс. Від 3 до 30 символів.',
    subdomain_free: '✅ {subdomain}.ttzop.com — вільний!', subdomain_check_err: 'Помилка перевірки',
  },
  ru: {
    cart_title: 'Корзина: {n} услуг(и)', cart_clear: 'Очистить', cart_order: 'Оформить заказ →', cart_remove: 'Удалить',
    cart_added: '🛒 В корзине ({n})', add_to_cart: '🛒 В корзину',
    privacy_title: 'Политика конфиденциальности', privacy_subtitle: 'Перед заказом ознакомьтесь с политикой конфиденциальности',
    privacy_agree: 'Я ознакомился и соглашаюсь с политикой конфиденциальности', privacy_decline: 'Отказаться', privacy_continue: 'Продолжить →',
    form_title: 'Оформить заказ', form_subdomain: 'Желаемый поддомен', form_email: 'Ваш Email',
    form_note: 'Примечание (необязательно)', form_note_ph: 'Ваши вопросы или пожелания...',
    form_back: 'Назад', form_send_code: 'Получить код →', form_sending: 'Отправляем...',
    form_err_email: 'Введите правильный email', form_err_subdomain: 'Введите желаемый поддомен',
    form_err_subdomain_taken: 'Выберите свободный поддомен', form_err_subdomain_test: 'Поддомен не может содержать "test"', form_err_connection: 'Ошибка подключения',
    verify_title: 'Подтверждение email', verify_sent: 'Код отправлен на', verify_label: '6-значный код',
    verify_btn: 'Подтвердить и отправить заказ', verify_checking: 'Проверяем...',
    verify_err: 'Введите 6-значный код', verify_err_wrong: 'Неверный код',
    done_title: 'Заказ принят!',
    done_subdomain: 'Спасибо! Ваш сайт <b style="color:#f97316">{domain}</b> создаётся.<br>Вы получите письмо на <b style="color:#e8eaf0">{email}</b> когда он будет готов.',
    done_regular: 'Спасибо! Мы свяжемся с вами по email <b style="color:#e8eaf0">{email}</b> в ближайшее время.',
    done_close: 'Закрыть',
    form_site_langs: 'Языки сайта', form_site_langs_err: 'Выберите хотя бы один язык',
    cart_added_ok: '✓ Добавлено!', form_err_send: 'Ошибка.', form_err_conn: 'Ошибка соединения.', privacy_unavailable: 'Политика конфиденциальности недоступна.',
    subdomain_invalid: 'Только строчные буквы, цифры и дефис. От 3 до 30 символов.',
    subdomain_free: '✅ {subdomain}.ttzop.com — свободен!', subdomain_check_err: 'Ошибка проверки',
  },
  pl: {
    cart_title: 'Koszyk: {n} usług(i)', cart_clear: 'Wyczyść', cart_order: 'Złóż zamówienie →', cart_remove: 'Usuń',
    cart_added: '🛒 W koszyku ({n})', add_to_cart: '🛒 Do koszyka',
    privacy_title: 'Polityka prywatności', privacy_subtitle: 'Przed zamówieniem zapoznaj się z polityką prywatności',
    privacy_agree: 'Zapoznałem się i zgadzam się z polityką prywatności', privacy_decline: 'Odrzuć', privacy_continue: 'Kontynuuj →',
    form_title: 'Złóż zamówienie', form_subdomain: 'Żądana subdomena', form_email: 'Twój Email',
    form_note: 'Uwaga (opcjonalnie)', form_note_ph: 'Twoje pytania lub życzenia...',
    form_back: 'Wstecz', form_send_code: 'Pobierz kod →', form_sending: 'Wysyłamy...',
    form_err_email: 'Podaj prawidłowy email', form_err_subdomain: 'Podaj żądaną subdomenę',
    form_err_subdomain_taken: 'Wybierz wolną subdomenę', form_err_subdomain_test: 'Subdomena nie może zawierać "test"', form_err_connection: 'Błąd połączenia',
    verify_title: 'Potwierdzenie email', verify_sent: 'Kod wysłany na', verify_label: '6-cyfrowy kod',
    verify_btn: 'Potwierdź i złóż zamówienie', verify_checking: 'Sprawdzamy...',
    verify_err: 'Wprowadź 6-cyfrowy kod', verify_err_wrong: 'Nieprawidłowy kod',
    done_title: 'Zamówienie przyjęte!',
    done_subdomain: 'Dziękujemy! Twoja strona <b style="color:#f97316">{domain}</b> jest tworzona.<br>Otrzymasz email na <b style="color:#e8eaf0">{email}</b> gdy będzie gotowa.',
    done_regular: 'Dziękujemy! Skontaktujemy się z Tobą przez email <b style="color:#e8eaf0">{email}</b> wkrótce.',
    done_close: 'Zamknij',
    form_site_langs: 'Języki witryny', form_site_langs_err: 'Wybierz co najmniej jeden język',
    cart_added_ok: '✓ Dodano!', form_err_send: 'Błąd.', form_err_conn: 'Błąd połączenia.', privacy_unavailable: 'Polityka prywatności niedostępna.',
    subdomain_invalid: 'Tylko małe litery, cyfry i myślnik. Od 3 do 30 znaków.',
    subdomain_free: '✅ {subdomain}.ttzop.com — wolny!', subdomain_check_err: 'Błąd sprawdzania',
  },
  de: {
    cart_title: 'Warenkorb: {n} Leistung(en)', cart_clear: 'Leeren', cart_order: 'Bestellen →', cart_remove: 'Entfernen',
    cart_added: '🛒 Im Warenkorb ({n})', add_to_cart: '🛒 In den Warenkorb',
    privacy_title: 'Datenschutzrichtlinie', privacy_subtitle: 'Bitte lesen Sie unsere Datenschutzrichtlinie vor der Bestellung',
    privacy_agree: 'Ich habe die Datenschutzrichtlinie gelesen und stimme zu', privacy_decline: 'Ablehnen', privacy_continue: 'Weiter →',
    form_title: 'Bestellen', form_subdomain: 'Gewünschte Subdomain', form_email: 'Ihre E-Mail',
    form_note: 'Anmerkung (optional)', form_note_ph: 'Ihre Fragen oder Wünsche...',
    form_back: 'Zurück', form_send_code: 'Code erhalten →', form_sending: 'Wird gesendet...',
    form_err_email: 'Geben Sie eine gültige E-Mail-Adresse ein', form_err_subdomain: 'Geben Sie die gewünschte Subdomain ein',
    form_err_subdomain_taken: 'Wählen Sie eine verfügbare Subdomain', form_err_subdomain_test: 'Subdomain darf "test" nicht enthalten', form_err_connection: 'Verbindungsfehler',
    verify_title: 'E-Mail-Bestätigung', verify_sent: 'Code gesendet an', verify_label: '6-stelliger Code',
    verify_btn: 'Bestätigen und bestellen', verify_checking: 'Überprüfen...',
    verify_err: 'Geben Sie den 6-stelligen Code ein', verify_err_wrong: 'Falscher Code',
    done_title: 'Bestellung aufgenommen!',
    done_subdomain: 'Danke! Ihre Website <b style="color:#f97316">{domain}</b> wird erstellt.<br>Sie erhalten eine E-Mail an <b style="color:#e8eaf0">{email}</b>, wenn sie fertig ist.',
    done_regular: 'Danke! Wir werden Sie per E-Mail an <b style="color:#e8eaf0">{email}</b> in Kürze kontaktieren.',
    done_close: 'Schließen',
    form_site_langs: 'Seitensprachen', form_site_langs_err: 'Wählen Sie mindestens eine Sprache',
    cart_added_ok: '✓ Hinzugefügt!', form_err_send: 'Fehler.', form_err_conn: 'Verbindungsfehler.', privacy_unavailable: 'Datenschutzrichtlinie nicht verfügbar.',
    subdomain_invalid: 'Nur Kleinbuchstaben, Ziffern und Bindestriche. 3 bis 30 Zeichen.',
    subdomain_free: '✅ {subdomain}.ttzop.com — verfügbar!', subdomain_check_err: 'Prüffehler',
  },
  fr: {
    cart_title: 'Panier : {n} service(s)', cart_clear: 'Vider', cart_order: 'Passer la commande →', cart_remove: 'Supprimer',
    cart_added: '🛒 Dans le panier ({n})', add_to_cart: '🛒 Ajouter au panier',
    privacy_title: 'Politique de confidentialité', privacy_subtitle: 'Veuillez lire notre politique de confidentialité avant de commander',
    privacy_agree: "J'ai lu et j'accepte la politique de confidentialité", privacy_decline: 'Refuser', privacy_continue: 'Continuer →',
    form_title: 'Passer la commande', form_subdomain: 'Sous-domaine souhaité', form_email: 'Votre Email',
    form_note: 'Remarque (facultative)', form_note_ph: 'Vos questions ou souhaits...',
    form_back: 'Retour', form_send_code: 'Recevoir le code →', form_sending: 'Envoi en cours...',
    form_err_email: 'Saisissez un email valide', form_err_subdomain: 'Saisissez le sous-domaine souhaité',
    form_err_subdomain_taken: 'Choisissez un sous-domaine disponible', form_err_subdomain_test: 'Le sous-domaine ne peut pas contenir "test"', form_err_connection: 'Erreur de connexion',
    verify_title: 'Confirmation email', verify_sent: 'Code envoyé à', verify_label: 'Code à 6 chiffres',
    verify_btn: 'Confirmer et passer la commande', verify_checking: 'Vérification...',
    verify_err: 'Saisissez le code à 6 chiffres', verify_err_wrong: 'Code incorrect',
    done_title: 'Commande acceptée !',
    done_subdomain: 'Merci ! Votre site <b style="color:#f97316">{domain}</b> est en cours de création.<br>Vous recevrez un email à <b style="color:#e8eaf0">{email}</b> quand il sera prêt.',
    done_regular: 'Merci ! Nous vous contacterons par email à <b style="color:#e8eaf0">{email}</b> sous peu.',
    done_close: 'Fermer',
    form_site_langs: 'Langues du site', form_site_langs_err: 'Sélectionnez au moins une langue',
    cart_added_ok: '✓ Ajouté!', form_err_send: 'Erreur.', form_err_conn: 'Erreur de connexion.', privacy_unavailable: 'Politique de confidentialité indisponible.',
    subdomain_invalid: 'Uniquement minuscules, chiffres et tirets. 3 à 30 caractères.',
    subdomain_free: '✅ {subdomain}.ttzop.com — disponible!', subdomain_check_err: 'Erreur de vérification',
  },
  es: {
    cart_title: 'Carrito: {n} servicio(s)', cart_clear: 'Vaciar', cart_order: 'Realizar pedido →', cart_remove: 'Eliminar',
    cart_added: '🛒 En el carrito ({n})', add_to_cart: '🛒 Añadir al carrito',
    privacy_title: 'Política de privacidad', privacy_subtitle: 'Por favor, lea nuestra política de privacidad antes de pedir',
    privacy_agree: 'He leído y acepto la política de privacidad', privacy_decline: 'Rechazar', privacy_continue: 'Continuar →',
    form_title: 'Realizar pedido', form_subdomain: 'Subdominio deseado', form_email: 'Tu Email',
    form_note: 'Nota (opcional)', form_note_ph: 'Tus preguntas o deseos...',
    form_back: 'Atrás', form_send_code: 'Obtener código →', form_sending: 'Enviando...',
    form_err_email: 'Introduce un email válido', form_err_subdomain: 'Introduce el subdominio deseado',
    form_err_subdomain_taken: 'Elige un subdominio disponible', form_err_subdomain_test: 'El subdominio no puede contener "test"', form_err_connection: 'Error de conexión',
    verify_title: 'Confirmación de email', verify_sent: 'Código enviado a', verify_label: 'Código de 6 dígitos',
    verify_btn: 'Confirmar y realizar pedido', verify_checking: 'Verificando...',
    verify_err: 'Introduce el código de 6 dígitos', verify_err_wrong: 'Código incorrecto',
    done_title: '¡Pedido aceptado!',
    done_subdomain: '¡Gracias! Tu sitio <b style="color:#f97316">{domain}</b> está siendo creado.<br>Recibirás un email en <b style="color:#e8eaf0">{email}</b> cuando esté listo.',
    done_regular: '¡Gracias! Nos pondremos en contacto contigo por email en <b style="color:#e8eaf0">{email}</b> en breve.',
    done_close: 'Cerrar',
    form_site_langs: 'Idiomas del sitio', form_site_langs_err: 'Seleccione al menos un idioma',
    cart_added_ok: '✓ Añadido!', form_err_send: 'Error.', form_err_conn: 'Error de conexión.', privacy_unavailable: 'Política de privacidad no disponible.',
    subdomain_invalid: 'Solo minúsculas, números y guiones. De 3 a 30 caracteres.',
    subdomain_free: '✅ {subdomain}.ttzop.com — disponible!', subdomain_check_err: 'Error de verificación',
  },
  it: {
    cart_title: 'Carrello: {n} servizio/i', cart_clear: 'Svuota', cart_order: 'Effettua ordine →', cart_remove: 'Rimuovi',
    cart_added: '🛒 Nel carrello ({n})', add_to_cart: '🛒 Aggiungi al carrello',
    privacy_title: 'Informativa sulla privacy', privacy_subtitle: 'Leggi la nostra informativa sulla privacy prima di ordinare',
    privacy_agree: "Ho letto e accetto l'informativa sulla privacy", privacy_decline: 'Rifiuta', privacy_continue: 'Continua →',
    form_title: 'Effettua ordine', form_subdomain: 'Sottodominio desiderato', form_email: 'La tua Email',
    form_note: 'Nota (facoltativa)', form_note_ph: 'Le tue domande o desideri...',
    form_back: 'Indietro', form_send_code: 'Ricevi codice →', form_sending: 'Invio in corso...',
    form_err_email: 'Inserisci un email valido', form_err_subdomain: 'Inserisci il sottodominio desiderato',
    form_err_subdomain_taken: 'Scegli un sottodominio disponibile', form_err_subdomain_test: 'Il sottodominio non può contenere "test"', form_err_connection: 'Errore di connessione',
    verify_title: 'Conferma email', verify_sent: 'Codice inviato a', verify_label: 'Codice a 6 cifre',
    verify_btn: 'Conferma e invia ordine', verify_checking: 'Verifica...',
    verify_err: 'Inserisci il codice a 6 cifre', verify_err_wrong: 'Codice errato',
    done_title: 'Ordine accettato!',
    done_subdomain: "Grazie! Il tuo sito <b style=\"color:#f97316\">{domain}</b> è in creazione.<br>Riceverai un'email all'indirizzo <b style=\"color:#e8eaf0\">{email}</b> quando sarà pronto.",
    done_regular: 'Grazie! Ti contatteremo per email a <b style="color:#e8eaf0">{email}</b> a breve.',
    done_close: 'Chiudi',
    form_site_langs: 'Lingue del sito', form_site_langs_err: 'Seleziona almeno una lingua',
    cart_added_ok: '✓ Aggiunto!', form_err_send: 'Errore.', form_err_conn: 'Errore di connessione.', privacy_unavailable: 'Informativa sulla privacy non disponibile.',
    subdomain_invalid: 'Solo lettere minuscole, numeri e trattini. Da 3 a 30 caratteri.',
    subdomain_free: '✅ {subdomain}.ttzop.com — disponibile!', subdomain_check_err: 'Errore di verifica',
  },
  pt: {
    cart_title: 'Carrinho: {n} serviço(s)', cart_clear: 'Limpar', cart_order: 'Fazer pedido →', cart_remove: 'Remover',
    cart_added: '🛒 No carrinho ({n})', add_to_cart: '🛒 Adicionar ao carrinho',
    privacy_title: 'Política de privacidade', privacy_subtitle: 'Por favor, leia nossa política de privacidade antes de pedir',
    privacy_agree: 'Li e concordo com a política de privacidade', privacy_decline: 'Recusar', privacy_continue: 'Continuar →',
    form_title: 'Fazer pedido', form_subdomain: 'Subdomínio desejado', form_email: 'Seu Email',
    form_note: 'Nota (opcional)', form_note_ph: 'Suas perguntas ou desejos...',
    form_back: 'Voltar', form_send_code: 'Obter código →', form_sending: 'Enviando...',
    form_err_email: 'Insira um email válido', form_err_subdomain: 'Insira o subdomínio desejado',
    form_err_subdomain_taken: 'Escolha um subdomínio disponível', form_err_subdomain_test: 'O subdomínio não pode conter "test"', form_err_connection: 'Erro de conexão',
    verify_title: 'Confirmação de email', verify_sent: 'Código enviado para', verify_label: 'Código de 6 dígitos',
    verify_btn: 'Confirmar e fazer pedido', verify_checking: 'Verificando...',
    verify_err: 'Insira o código de 6 dígitos', verify_err_wrong: 'Código incorreto',
    done_title: 'Pedido aceito!',
    done_subdomain: 'Obrigado! Seu site <b style="color:#f97316">{domain}</b> está sendo criado.<br>Você receberá um email em <b style="color:#e8eaf0">{email}</b> quando estiver pronto.',
    done_regular: 'Obrigado! Entraremos em contato por email em <b style="color:#e8eaf0">{email}</b> em breve.',
    done_close: 'Fechar',
    form_site_langs: 'Idiomas do site', form_site_langs_err: 'Selecione pelo menos um idioma',
    cart_added_ok: '✓ Adicionado!', form_err_send: 'Erro.', form_err_conn: 'Erro de conexão.', privacy_unavailable: 'Política de privacidade indisponível.',
    subdomain_invalid: 'Apenas letras minúsculas, números e hífens. De 3 a 30 caracteres.',
    subdomain_free: '✅ {subdomain}.ttzop.com — disponível!', subdomain_check_err: 'Erro de verificação',
  },
  zh: {
    cart_title: '购物车：{n} 项服务', cart_clear: '清空', cart_order: '下单 →', cart_remove: '删除',
    cart_added: '🛒 已加入购物车（{n}）', add_to_cart: '🛒 加入购物车',
    privacy_title: '隐私政策', privacy_subtitle: '下单前请阅读我们的隐私政策',
    privacy_agree: '我已阅读并同意隐私政策', privacy_decline: '拒绝', privacy_continue: '继续 →',
    form_title: '下单', form_subdomain: '所需子域名', form_email: '您的邮箱',
    form_note: '备注（可选）', form_note_ph: '您的问题或意愿...',
    form_back: '返回', form_send_code: '获取验证码 →', form_sending: '发送中...',
    form_err_email: '请输入有效的邮箱地址', form_err_subdomain: '请输入所需的子域名',
    form_err_subdomain_taken: '请选择可用的子域名', form_err_subdomain_test: '子域名不能包含"test"', form_err_connection: '连接错误',
    verify_title: '邮箱验证', verify_sent: '验证码已发送至', verify_label: '6位验证码',
    verify_btn: '确认并提交订单', verify_checking: '验证中...',
    verify_err: '请输入6位验证码', verify_err_wrong: '验证码错误',
    done_title: '订单已受理！',
    done_subdomain: '感谢！您的网站 <b style="color:#f97316">{domain}</b> 正在创建中。<br>准备好后，我们将发送邮件至 <b style="color:#e8eaf0">{email}</b>。',
    done_regular: '感谢！我们将尽快通过邮箱 <b style="color:#e8eaf0">{email}</b> 与您联系。',
    done_close: '关闭',
    form_site_langs: '网站语言', form_site_langs_err: '请至少选择一种语言',
    cart_added_ok: '✓ 已添加！', form_err_send: '错误。', form_err_conn: '连接错误。', privacy_unavailable: '隐私政策不可用。',
    subdomain_invalid: '只能使用小写字母、数字和连字符。3至30个字符。',
    subdomain_free: '✅ {subdomain}.ttzop.com — 可用！', subdomain_check_err: '检查错误',
  },
  ar: {
    cart_title: 'السلة: {n} خدمة', cart_clear: 'إفراغ', cart_order: '← تقديم الطلب', cart_remove: 'حذف',
    cart_added: '({n}) 🛒 في السلة', add_to_cart: '🛒 أضف إلى السلة',
    privacy_title: 'سياسة الخصوصية', privacy_subtitle: 'يرجى قراءة سياسة الخصوصية قبل الطلب',
    privacy_agree: 'لقد قرأت وأوافق على سياسة الخصوصية', privacy_decline: 'رفض', privacy_continue: '← متابعة',
    form_title: 'تقديم الطلب', form_subdomain: 'النطاق الفرعي المطلوب', form_email: 'بريدك الإلكتروني',
    form_note: 'ملاحظة (اختياري)', form_note_ph: 'أسئلتك أو رغباتك...',
    form_back: 'رجوع', form_send_code: '← الحصول على الرمز', form_sending: 'جارٍ الإرسال...',
    form_err_email: 'أدخل بريداً إلكترونياً صحيحاً', form_err_subdomain: 'أدخل النطاق الفرعي المطلوب',
    form_err_subdomain_taken: 'اختر نطاقاً فرعياً متاحاً', form_err_subdomain_test: 'النطاق الفرعي لا يمكن أن يحتوي على "test"', form_err_connection: 'خطأ في الاتصال',
    verify_title: 'تأكيد البريد الإلكتروني', verify_sent: 'تم إرسال الرمز إلى', verify_label: 'رمز من 6 أرقام',
    verify_btn: 'تأكيد وإرسال الطلب', verify_checking: 'جارٍ التحقق...',
    verify_err: 'أدخل الرمز المكون من 6 أرقام', verify_err_wrong: 'رمز غير صحيح',
    done_title: 'تم قبول الطلب!',
    done_subdomain: 'شكراً! موقعك <b style="color:#f97316">{domain}</b> قيد الإنشاء.<br>ستتلقى بريداً إلكترونياً على <b style="color:#e8eaf0">{email}</b> عندما يكون جاهزاً.',
    done_regular: 'شكراً! سنتواصل معك على البريد الإلكتروني <b style="color:#e8eaf0">{email}</b> قريباً.',
    done_close: 'إغلاق',
    form_site_langs: 'لغات الموقع', form_site_langs_err: 'اختر لغة واحدة على الأقل',
    cart_added_ok: '✓ تمت الإضافة!', form_err_send: 'خطأ.', form_err_conn: 'خطأ في الاتصال.', privacy_unavailable: 'سياسة الخصوصية غير متاحة.',
    subdomain_invalid: 'أحرف صغيرة وأرقام وشرطات فقط. من 3 إلى 30 حرفاً.',
    subdomain_free: '✅ {subdomain}.ttzop.com — متاح!', subdomain_check_err: 'خطأ في التحقق',
  },
  hu: {
    cart_title: 'Kosár: {n} szolgáltatás', cart_clear: 'Ürítés', cart_order: 'Rendelés leadása →', cart_remove: 'Törlés',
    cart_added: '🛒 Kosárban ({n})', add_to_cart: '🛒 Kosárba',
    privacy_title: 'Adatvédelmi irányelvek', privacy_subtitle: 'Kérjük, olvassa el adatvédelmi irányelveinket rendelés előtt',
    privacy_agree: 'Elolvastam és elfogadom az adatvédelmi irányelveket', privacy_decline: 'Elutasítás', privacy_continue: 'Folytatás →',
    form_title: 'Rendelés leadása', form_subdomain: 'Kívánt aldomain', form_email: 'Az Ön e-mail-je',
    form_note: 'Megjegyzés (nem kötelező)', form_note_ph: 'Kérdései vagy kívánságai...',
    form_back: 'Vissza', form_send_code: 'Kód kérése →', form_sending: 'Küldés folyamatban...',
    form_err_email: 'Adjon meg érvényes e-mail-t', form_err_subdomain: 'Adja meg a kívánt aldomaint',
    form_err_subdomain_taken: 'Válasszon szabad aldomaint', form_err_subdomain_test: 'Az aldomén nem tartalmazhatja a "test" szót', form_err_connection: 'Kapcsolódási hiba',
    verify_title: 'E-mail megerősítés', verify_sent: 'Kód elküldve ide:', verify_label: '6 jegyű kód',
    verify_btn: 'Megerősítés és rendelés leadása', verify_checking: 'Ellenőrzés...',
    verify_err: 'Adja meg a 6 jegyű kódot', verify_err_wrong: 'Hibás kód',
    done_title: 'Rendelés elfogadva!',
    done_subdomain: 'Köszönjük! A(z) <b style="color:#f97316">{domain}</b> weboldala létrehozás alatt áll.<br>Értesítjük e-mailben a(z) <b style="color:#e8eaf0">{email}</b> címen, amikor elkészül.',
    done_regular: 'Köszönjük! Hamarosan felvesszük Önnel a kapcsolatot a(z) <b style="color:#e8eaf0">{email}</b> e-mail-cíemen.',
    done_close: 'Bezárás',
    form_site_langs: 'Weboldal nyelvei', form_site_langs_err: 'Válasszon legalább egy nyelvet',
    cart_added_ok: '✓ Hozzáadva!', form_err_send: 'Hiba.', form_err_conn: 'Kapcsolódási hiba.', privacy_unavailable: 'Az adatvédelmi irányelvek nem elérhetők.',
    subdomain_invalid: 'Csak kisbetűk, számok és kötőjelek. 3–30 karakter.',
    subdomain_free: '✅ {subdomain}.ttzop.com — szabad!', subdomain_check_err: 'Ellenőrzési hiba',
  },
};
function getUI() { return UI_T[currentUiLang] || UI_T.be; }

function getPrimaryLang(data) {
  const langs = data.languages || [];
  const p = data.primaryLang;
  return (p && langs.some(l => l.code === p)) ? p : (langs[0]?.code || 'be');
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
    nav_services:'Паслугі', nav_about:'Пра нас', nav_files:'Галерэя', nav_contact:'Кантакты',
    services_title:'Нашы паслугі', services_subtitle:'Выконваем любы рамонт', advantages_title:'Чаму выбіраюць нас',
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
    nav_services:'Services', nav_about:'About us', nav_files:'Gallery', nav_contact:'Contacts',
    services_title:'Our Services', services_subtitle:'We handle any repair', advantages_title:'Why Choose Us',
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
    nav_services:'Послуги', nav_about:'Про нас', nav_files:'Галерея', nav_contact:'Контакти',
    services_title:'Наші послуги', services_subtitle:'Виконуємо будь-який ремонт', advantages_title:'Чому обирають нас',
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
    nav_services:'Услуги', nav_about:'О нас', nav_files:'Галерея', nav_contact:'Контакты',
    services_title:'Наши услуги', services_subtitle:'Выполняем любой ремонт', advantages_title:'Почему выбирают нас',
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
    nav_services:'Usługi', nav_about:'O nas', nav_files:'Galeria', nav_contact:'Kontakt',
    services_title:'Nasze usługi', services_subtitle:'Wykonujemy każdą naprawę', advantages_title:'Dlaczego nas wybierają',
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
    nav_services:'Leistungen', nav_about:'Über uns', nav_files:'Galerie', nav_contact:'Kontakt',
    services_title:'Unsere Leistungen', services_subtitle:'Wir führen jede Reparatur durch', advantages_title:'Warum uns wählen',
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
    nav_services:'Services', nav_about:'À propos', nav_files:'Galerie', nav_contact:'Contact',
    services_title:'Nos services', services_subtitle:'Nous réalisons toute réparation', advantages_title:'Pourquoi nous choisir',
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
    nav_services:'Servicios', nav_about:'Sobre nosotros', nav_files:'Galería', nav_contact:'Contacto',
    services_title:'Nuestros servicios', services_subtitle:'Realizamos cualquier reparación', advantages_title:'Por qué elegirnos',
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
    nav_services:'Servizi', nav_about:'Chi siamo', nav_files:'Galleria', nav_contact:'Contatti',
    services_title:'I nostri servizi', services_subtitle:'Eseguiamo qualsiasi riparazione', advantages_title:'Perché sceglierci',
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
    nav_services:'Serviços', nav_about:'Sobre nós', nav_files:'Galeria', nav_contact:'Contacto',
    services_title:'Os nossos serviços', services_subtitle:'Realizamos qualquer reparação', advantages_title:'Por que nos escolher',
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
    nav_services:'服务', nav_about:'关于我们', nav_files:'图库', nav_contact:'联系我们',
    services_title:'我们的服务', services_subtitle:'承接各类维修', advantages_title:'为何选择我们',
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
    nav_services:'الخدمات', nav_about:'من نحن', nav_files:'المعرض', nav_contact:'اتصل بنا',
    services_title:'خدماتنا', services_subtitle:'نقوم بأي إصلاح', advantages_title:'لماذا تختارنا',
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
    nav_services:'Szolgáltatások', nav_about:'Rólunk', nav_files:'Galéria', nav_contact:'Kapcsolat',
    services_title:'Szolgáltatásaink', services_subtitle:'Minden javítást elvégzünk', advantages_title:'Miért válasszon minket',
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

function changeSiteLang(lang) {
  if (!siteData) return;
  document.querySelector('#site-lang-picker .lang-dd-menu')?.classList.remove('open');
  applyLanguage(siteData, lang);
  loadServices(currentLang);
  loadAdvantages(currentLang);
  loadTestimonials(currentLang);
  loadFaq(currentLang);
  loadPrices(currentLang);
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

  document.title = companyName;

  const setText = (id, val) => { const el = document.getElementById(id); if (el && val !== undefined) el.textContent = val; };

  setText('site-logo',       companyName);
  setText('footer-logo',     companyName);
  setText('hero-title',      i.heroTitle || '');
  setText('hero-subtitle',   i.heroSubtitle || '');
  // Кантакты — дрэва Ф/П/ПФФ (data.contactTree); сайт сам сплюшчвае. Стары плоскі фармат — fallback
  const treePhones = _contactFlat(data, 'phone');
  const phones = (co?.phones?.length ? co.phones : null) || treePhones || ((Array.isArray(data.phones) && data.phones.length) ? data.phones : (data.phone ? [{ label: '', value: data.phone }] : []));
  const telHref = v => 'tel:' + String(v).replace(/[^\d+]/g, '');
  setText('hero-phone',      phones[0]?.value || '');
  setText('hero-hours',      companyHours);
  setText('contact-address', companyAddress);
  const cp = document.getElementById('contact-phone'); // спіс усіх тэлефонаў з назвамі і tel:-спасылкамі
  if (cp) cp.innerHTML = phones.map(p => `${p.label ? `<b>${p.label}:</b> ` : ''}<a href="${telHref(p.value)}">${p.value}</a>`).join('<br>');
  setText('contact-hours',   companyHours);
  setText('footer-phone',    phones[0]?.value || '');
  setText('footer-hours',    companyHours);
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
  if (footerCopy) footerCopy.textContent = '© ' + new Date().getFullYear() + ' ' + companyName;

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
}

async function applySections() {
  try {
    const response = await fetch(API_URL + '/content/' + SITE_REPO + '/sections');
    const sections = await response.json();

    const sectionMap = {
      advantages: 'advantages', promotions: 'promotions', files: 'files',
      testimonials: 'testimonials', howWeWork: 'howWeWork', about: 'about',
      brands: 'brands', faq: 'faq', certificates: 'certificates',
      clients: 'clients', prices: 'prices', blog: 'blog',
    };

    Object.entries(sectionMap).forEach(([key, id]) => {
      const el = document.getElementById(id);
      if (el) el.style.display = sections[key + '_enabled'] === false ? 'none' : '';
    });
  } catch (e) {
    console.warn('sections.json не знойдзены');
  }
}

// ════════════════════════════════════════
// КОШЫК
// ════════════════════════════════════════
let cart = JSON.parse(localStorage.getItem('ttzop_cart') || '[]');

function saveCart() {
  localStorage.setItem('ttzop_cart', JSON.stringify(cart));
  renderCartBar();
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

function renderCartBar() {
  let bar = document.getElementById('cart-bar');
  if (cart.length === 0) {
    if (bar) bar.remove();
    cartExpanded = false;
    return;
  }
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'cart-bar';
    bar.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:var(--surface,#181c27);border-top:2px solid var(--accent,#f97316);z-index:9999;box-shadow:0 -4px 20px rgba(0,0,0,0.3)';
    document.body.appendChild(bar);
  }
  const totalItems = cart.reduce((s, i) => s + (i.qty || 1), 0);
  const ui = getUI();
  const itemsHtml = cartExpanded ? `
    <div style="padding:8px 24px;border-bottom:1px solid var(--border,#2a2f45)">
      ${cart.map((item, idx) => `
        <div style="display:flex;align-items:center;gap:8px;padding:6px 0${idx < cart.length - 1 ? ';border-bottom:1px solid var(--border,#2a2f45)' : ''}">
          <span style="flex:1;font-size:0.9rem;color:var(--text,#e8eaf0)">${item.name}</span>
          <button onclick="cartDecQty(${idx})" style="width:28px;height:28px;background:var(--surface2,#1e2335);border:1px solid var(--border,#2a2f45);border-radius:6px;color:var(--text,#e8eaf0);cursor:pointer;font-size:1rem;line-height:1">−</button>
          <span style="min-width:24px;text-align:center;font-weight:700;color:var(--text,#e8eaf0)">${item.qty || 1}</span>
          <button onclick="cartIncQty(${idx})" style="width:28px;height:28px;background:var(--surface2,#1e2335);border:1px solid var(--border,#2a2f45);border-radius:6px;color:var(--text,#e8eaf0);cursor:pointer;font-size:1rem;line-height:1">+</button>
          <button onclick="cartRemoveItem(${idx})" title="${ui.cart_remove}" style="width:28px;height:28px;background:none;border:1px solid #ef4444;border-radius:6px;color:#ef4444;cursor:pointer;font-size:0.85rem;line-height:1">✕</button>
        </div>
      `).join('')}
    </div>` : '';
  bar.innerHTML = `
    ${itemsHtml}
    <div style="padding:12px 24px;display:flex;align-items:center;justify-content:space-between">
      <div style="display:flex;align-items:center;gap:16px;cursor:pointer" onclick="cartExpanded=!cartExpanded;renderCartBar()">
        <span style="font-size:1.2rem">🛒</span>
        <div>
          <div style="font-weight:700;font-size:0.95rem;color:var(--text,#e8eaf0)">${ui.cart_title.replace('{n}', totalItems)} <span style="font-size:0.75rem;opacity:0.7">${cartExpanded ? '▲' : '▼'}</span></div>
          ${!cartExpanded ? `<div style="font-size:0.8rem;color:var(--muted,#6b7280)">${cart.map(i=>`${i.name}${(i.qty||1)>1?' ×'+(i.qty||1):''}`).join(', ')}</div>` : ''}
        </div>
      </div>
      <div style="display:flex;gap:8px">
        <button onclick="clearCart()" style="padding:8px 16px;background:none;border:1px solid var(--border,#2a2f45);border-radius:8px;color:var(--muted,#6b7280);cursor:pointer;font-size:0.85rem">${ui.cart_clear}</button>
        <button onclick="openOrderModal()" style="padding:8px 20px;background:var(--accent,#f97316);color:#fff;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:0.9rem">${ui.cart_order}</button>
      </div>
    </div>
  `;
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

function _svcCardHtml(item) {
  const inCart = cart.find(c => c.id === item.id);
  const name = item.name || '';
  return `<div class="card service-card">
    <div class="service-icon">🔧</div>
    <h3 class="service-title">${_svcEsc(name)}</h3>
    ${item.description ? `<div class="service-desc text-muted">${_svcEsc(item.description)}</div>` : ''}
    ${item.price ? `<p class="service-price" data-price="${_svcEsc(String(item.price))}" data-currency="${_svcEsc(item.currency||'')}">${_svcEsc(item.price)} ${_svcEsc(item.currency || '')}</p>` : ''}
    <button id="cart-btn-${item.id}"
      onclick="addToCart('${item.id}','${name.replace(/'/g,'&#39;')}','${item.serviceType||''}','${String(item.price||'').replace(/'/g,'&#39;')}','${String(item.currency||'').replace(/'/g,'&#39;')}')"
      style="margin-top:12px;width:100%;padding:10px;background:var(--accent,#f97316);color:#fff;border:none;border-radius:8px;font-weight:600;cursor:pointer;font-size:0.9rem;transition:all 0.2s">
      ${inCart ? getUI().cart_added.replace('{n}', inCart.qty) : getUI().add_to_cart}
    </button>
  </div>`;
}

function _renderSvcNodes(nodes, parentId) {
  const children = nodes
    .filter(n => n.parentId === (parentId || null))
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  let html = '';
  for (const child of children) {
    if (child.type === 'folder') {
      const inner = _renderSvcNodes(nodes, child.id);
      if (inner) {
        html += `<div class="services-folder-heading" style="grid-column:1/-1;margin-top:8px;font-size:1.05rem;font-weight:700;padding:8px 0 4px;border-bottom:2px solid var(--color-primary,#f97316);color:var(--color-primary,#111)">${_svcEsc(child.name)}</div>${inner}`;
      }
    } else if (child.type === 'item' && !child.hidden) {
      html += _svcCardHtml(child);
    }
  }
  return html;
}

async function loadServices(lang) {
  const grid = document.getElementById('services-grid');
  if (!grid) return;
  try {
    const res = await fetch(API_URL + '/content/' + SITE_REPO + '/services'); // Фаза 1b: праз worker/KV (edge-кэш), не статыка
    if (!res.ok) throw new Error('not found');
    const data = await res.json();
    if (data && data.nodes) {
      // form-вузлы (адмінка v0.82+): палі ў fields — разгортваем да item-фармату
      data.nodes.forEach(n => {
        if (n.type === 'form' && n.fields) { const svcType = n.fields.type || ''; Object.assign(n, n.fields); n.serviceType = svcType; n.type = 'item'; }
      });
      const html = _renderSvcNodes(data.nodes, null);
      grid.innerHTML = html || '';
      renderCartBar();
      return;
    }
    throw new Error('unexpected format');
  } catch {
    // Фолбэк на published.json (стары фармат)
    try {
      const r = await fetch('content/services/published.json?v=' + Date.now());
      if (!r.ok) throw new Error();
      const items = await r.json();
      const itemName = (item, l) => item.i18n?.[l]?.name || item['name_' + l] || item.name_local || '';
      grid.innerHTML = items.map(item => {
        const inCart = cart.find(c => c.id === item.id);
        const name = itemName(item, lang);
        return `<div class="card service-card">
          <div class="service-icon">🔧</div>
          <h3 class="service-title">${_svcEsc(name)}</h3>
          ${item.description ? `<div class="service-desc text-muted">${_svcEsc(item.description)}</div>` : ''}
          ${item.price ? `<p class="service-price">${_svcEsc(item.price)} ${_svcEsc(item.currency || '')}</p>` : ''}
          <button id="cart-btn-${item.id}"
            onclick="addToCart('${item.id}','${name.replace(/'/g,'&#39;')}','${item.type||''}','${String(item.price||'').replace(/'/g,'&#39;')}','${String(item.currency||'').replace(/'/g,'&#39;')}')"
            style="margin-top:12px;width:100%;padding:10px;background:var(--accent,#f97316);color:#fff;border:none;border-radius:8px;font-weight:600;cursor:pointer;font-size:0.9rem;transition:all 0.2s">
            ${inCart ? getUI().cart_added.replace('{n}', inCart.qty) : getUI().add_to_cart}
          </button>
        </div>`;
      }).join('');
      renderCartBar();
    } catch { /* без паслуг — не паказваем */ }
  }
}

function _secEsc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

function _renderSecNodes(nodes, parentId, renderItem, renderFolder) {
  const children = nodes.filter(n => n.parentId === (parentId||null)).sort((a,b)=>(a.order||0)-(b.order||0));
  let html = '';
  for (const child of children) {
    if (child.type === 'folder') {
      const inner = _renderSecNodes(nodes, child.id, renderItem, renderFolder);
      if (inner) html += (renderFolder ? renderFolder(child) : `<div class="section-group-heading" style="grid-column:1/-1;margin-top:12px;font-size:1.05rem;font-weight:700;padding-bottom:4px;border-bottom:2px solid var(--color-primary)">${_secEsc(child.name)}</div>`) + inner;
    } else if (child.type === 'item') {
      html += renderItem(child);
    }
  }
  return html;
}

async function loadAdvantages(lang) {
  const grid = document.getElementById('advantages-grid');
  if (!grid) return;
  try {
    const res = await fetch(API_URL + '/content/' + SITE_REPO + '/advantages');
    if (!res.ok) throw new Error();
    const data = await res.json();
    if (data && data.nodes) {
      grid.innerHTML = _renderSecNodes(data.nodes, null, item => `
        <div class="card advantage-card">
          <div class="advantage-icon">${_secEsc(item.icon||'✓')}</div>
          <h3>${_secEsc(item.title||'')}</h3>
          <p class="text-muted">${_secEsc(item.description||'')}</p>
        </div>`) || '';
      return;
    }
    const items = Array.isArray(data) ? data : [];
    grid.innerHTML = items.map(item => `
      <div class="card advantage-card">
        <div class="advantage-icon">${item.icon || '✓'}</div>
        <h3>${_secEsc(item.i18n?.[lang]?.title || item['title_'+lang] || item.title_local || '')}</h3>
        <p class="text-muted">${_secEsc(item.i18n?.[lang]?.desc || item['desc_'+lang] || item.desc_local || '')}</p>
      </div>`).join('');
  } catch { console.warn('advantages.json не знойдзены'); }
}

async function loadFiles() {
  const grid = document.getElementById('files-grid');
  if (!grid) return;
  try {
    const response = await fetch(API_URL + '/content/' + SITE_REPO + '/files'); // Фаза 1b: праз worker/KV (edge-кэш), не выдалены get_gallery
    if (!response.ok) return;
    const data = await response.json();
    const design = data?.design || {};
    const cols = design.columns || 3;
    const lightbox = design.lightbox !== false;
    const ratio = design.ratio || 'original';
    const ratioStyle = ratio === 'square' ? 'aspect-ratio:1/1;object-fit:cover;width:100%;height:100%'
                     : ratio === '16:9'   ? 'aspect-ratio:16/9;object-fit:cover;width:100%;height:100%'
                     : 'width:100%;height:100%;object-fit:cover';
    grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    // даныя цяпер type:'file' (ПРОДАКФПФ ФайлБлок) — паказваем усе файлы з выявай
    const items = (data?.nodes || []).filter(n => n.type === 'file' && (n.thumbUrl || n.url));
    const sorted = [...items].sort((a, b) => (a.order || 0) - (b.order || 0));
    if (sorted.length === 0) { grid.innerHTML = ''; return; }
    grid.innerHTML = sorted.map(item => `
      <div class="tile-item ${lightbox ? 'tile-item-clickable' : ''}" ${lightbox ? `onclick="openLightbox('${item.url || item.thumbUrl}')"` : ''}>
        <img src="${item.thumbUrl || item.url}" alt="${item.caption || item.name || ''}" loading="lazy" style="${ratioStyle}">
        ${item.caption ? `<div class="tile-caption">${item.caption}</div>` : ''}
      </div>
    `).join('');
  } catch (e) { console.warn('files section не знойдзена'); }
}

async function loadTestimonials(lang) {
  const grid = document.getElementById('testimonials-grid');
  if (!grid) return;
  try {
    const res = await fetch(API_URL + '/content/' + SITE_REPO + '/testimonials');
    if (!res.ok) throw new Error();
    const data = await res.json();
    if (data && data.nodes) {
      grid.innerHTML = _renderSecNodes(data.nodes, null, item => `
        <div class="card testimonial-card">
          <div class="testimonial-stars">${'★'.repeat(item.stars||5)}</div>
          <p class="testimonial-text">"${_secEsc(item.text||'')}"</p>
          <p class="testimonial-author">— ${_secEsc(item.author||'')}</p>
          ${item.subtitle ? `<p class="text-muted testimonial-car">${_secEsc(item.subtitle)}</p>` : ''}
        </div>`) || '';
      return;
    }
    const items = Array.isArray(data) ? data : [];
    grid.innerHTML = items.map(item => `
      <div class="card testimonial-card">
        <div class="testimonial-stars">${'★'.repeat(item.stars || 5)}</div>
        <p class="testimonial-text">"${_secEsc(item.i18n?.[lang]?.text || item['text_'+lang] || item.text_local || '')}"</p>
        <p class="testimonial-author">— ${_secEsc(item.author || '')}</p>
        ${item.car ? `<p class="text-muted testimonial-car">${_secEsc(item.car)}</p>` : ''}
      </div>`).join('');
  } catch { console.warn('testimonials.json не знойдзены'); }
}

async function loadHowWeWork(lang) {
  const grid = document.getElementById('how-grid');
  if (!grid) return;
  try {
    const res = await fetch(API_URL + '/content/' + SITE_REPO + '/howWeWork');
    if (!res.ok) throw new Error();
    const data = await res.json();
    if (data && data.nodes) {
      let stepNum = 0;
      const html = _renderSecNodes(data.nodes, null,
        item => {
          stepNum++;
          return `<div class="step"><div class="step-num">${stepNum}</div><div class="step-body"><h3>${_secEsc(item.title||'')}</h3><p>${_secEsc(item.description||'')}</p></div></div>`;
        },
        folder => `<div style="margin-top:16px;font-size:1rem;font-weight:700;color:var(--color-primary)">${_secEsc(folder.name)}</div>`
      );
      grid.innerHTML = html ? `<div class="steps">${html}</div>` : '';
      return;
    }
  } catch { /* no how-we-work.json yet */ }
}

async function loadPromotions(lang) {
  const grid = document.getElementById('promo-grid');
  if (!grid) return;
  try {
    const res = await fetch(API_URL + '/content/' + SITE_REPO + '/promotions');
    if (!res.ok) throw new Error();
    const data = await res.json();
    if (data && data.nodes) {
      grid.innerHTML = _renderSecNodes(data.nodes, null, item => `
        <div class="promo-card">
          ${item.badge ? `<div class="promo-badge">${_secEsc(item.badge)}</div>` : ''}
          <div class="promo-title">${_secEsc(item.title||'')}</div>
          <div class="promo-desc">${_secEsc(item.description||'')}</div>
        </div>`) || '';
      return;
    }
  } catch { /* no promotions.json yet */ }
}

function _faqEsc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

function _renderFaqNodes(nodes, parentId, lang, counterRef) {
  const children = nodes.filter(n => n.parentId === (parentId || null)).sort((a,b)=>(a.order||0)-(b.order||0));
  let html = '';
  for (const child of children) {
    if (child.type === 'folder') {
      const inner = _renderFaqNodes(nodes, child.id, lang, counterRef);
      if (inner) {
        html += `<div class="faq-group-heading">${_faqEsc(child.name)}</div>${inner}`;
      }
    } else if (child.type === 'item') {
      const idx = counterRef.i++;
      const q = _faqEsc(child.question || '');
      const a = _faqEsc(child.answer || '');
      if (!q) continue;
      html += `<div class="faq-item"><button class="faq-question" onclick="toggleFaq(${idx})">${q}<span class="faq-arrow">▼</span></button><div class="faq-answer" id="faq-answer-${idx}"><p>${a}</p></div></div>`;
    }
  }
  return html;
}

async function loadFaq(lang) {
  const list = document.getElementById('faq-list');
  if (!list) return;
  try {
    const res = await fetch(API_URL + '/content/' + SITE_REPO + '/faq');
    if (!res.ok) throw new Error('not found');
    const data = await res.json();
    if (data && data.nodes) {
      list.innerHTML = _renderFaqNodes(data.nodes, null, lang, { i: 0 }) || '';
      return;
    }
    // fallback: old array format
    const items = Array.isArray(data) ? data : [];
    list.innerHTML = items.map((item, i) => `
      <div class="faq-item">
        <button class="faq-question" onclick="toggleFaq(${i})">
          ${_faqEsc(item.i18n?.[lang]?.question || item['question_'+lang] || item.question_local || '')}
          <span class="faq-arrow">▼</span>
        </button>
        <div class="faq-answer" id="faq-answer-${i}">
          <p>${_faqEsc(item.i18n?.[lang]?.answer || item['answer_'+lang] || item.answer_local || '')}</p>
        </div>
      </div>
    `).join('');
  } catch (e) { console.warn('faq.json не знойдзены'); }
}

function toggleFaq(i) {
  const answer = document.getElementById('faq-answer-' + i);
  if (!answer) return;
  answer.closest('.faq-item')?.classList.toggle('open');
}

async function loadPrices(lang) {
  const body = document.getElementById('prices-body');
  if (!body) return;
  try {
    const res = await fetch(API_URL + '/content/' + SITE_REPO + '/prices');
    if (!res.ok) throw new Error();
    const data = await res.json();
    if (data && data.nodes) {
      body.innerHTML = _renderSecNodes(data.nodes, null,
        item => `<tr><td>${_secEsc(item.name||'')}</td><td class="price-amount" data-price="${_secEsc(String(item.fields?.price||item.price||''))}" data-currency="${_secEsc(item.fields?.currency||item.currency||'')}">${_secEsc(item.fields?.price||item.price||'')} ${_secEsc(item.fields?.currency||item.currency||'')}</td></tr>`,
        folder => `<tr><td colspan="2" style="padding-top:12px;font-weight:700;color:var(--color-primary);font-size:0.95rem">${_secEsc(folder.name)}</td></tr>`
      ) || '';
      return;
    }
    const items = Array.isArray(data) ? data : [];
    body.innerHTML = items.map(item => `
      <tr>
        <td>${_secEsc(item.i18n?.[lang]?.service || item['service_'+lang] || item.service_local || '')}</td>
        <td>${_secEsc(item.price || '')}</td>
      </tr>`).join('');
  } catch { console.warn('prices.json не знойдзены'); }
}

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

function initForm(data) {
  const key = document.getElementById('w3f-key');
  if (key && data.web3formsKey) key.value = data.web3formsKey;

  const form = document.getElementById('booking-form');
  if (!form) return;

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
  if (!burger || !menu) return;

  burger.addEventListener('click', () => menu.classList.toggle('open'));
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => menu.classList.remove('open'));
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('#site-lang-picker')) {
      document.querySelector('#site-lang-picker .lang-dd-menu')?.classList.remove('open');
    }
  });
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

let cartExpanded = false;

let orderStep = 'privacy'; // privacy → form → verify → done
let orderEmail = '';
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
          ${stepsHtml(1, 3)}
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
            <input type="email" id="order-email-input" placeholder="your@email.com"
              style="width:100%;padding:10px 14px;background:#1e2335;border:1.5px solid #2a2f45;border-radius:8px;color:#e8eaf0;font-family:'Manrope',sans-serif;font-size:0.95rem" />
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
          ${stepsHtml(2, 3)}
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

  } else if (step === 'done') {
    const isSubdomain = !!desiredSubdomain;
    modal.innerHTML = `
      <div style="background:#181c27;border:1px solid #2a2f45;border-radius:16px;max-width:420px;width:100%;padding:48px 32px;text-align:center">
        <div style="display:flex;justify-content:center;margin-bottom:24px">${stepsHtml(3, 3)}</div>
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
      body: JSON.stringify({ action: 'check_subdomain', subdomain })
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

    // 2. Захоўваем кліента ў базу (праз Worker)
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
        ...(desiredSubdomain ? { desiredSubdomain } : {})
      })
    });
    if (!regRes.ok) {
      const regErr = await regRes.json().catch(() => ({}));
      throw new Error(regErr.error || 'Памылка захавання заказу');
    }

    showModal('done');
  } catch {
    errEl.textContent = ui.form_err_connection;
    btn.disabled = false; btn.textContent = ui.verify_btn;
  }
}

function openLightbox(src) {
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML = `<div class="lightbox-inner"><img src="${src}"><button onclick="this.closest('.lightbox').remove()">✕</button></div>`;
  lb.addEventListener('click', e => { if (e.target === lb) lb.remove(); });
  document.body.appendChild(lb);
}

async function init() {
  siteData = await loadSiteData();
  if (!siteData) return;

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

  applyTheme(siteData);

  if (siteData.watermark) {
    const wm = document.createElement('div');
    wm.style.cssText = 'position:fixed;inset:0;z-index:99998;pointer-events:none;display:flex;align-items:center;justify-content:center;overflow:hidden';
    wm.innerHTML = '<div style="transform:rotate(-35deg);font-size:9vw;font-weight:900;color:rgba(249,115,22,0.13);letter-spacing:0.08em;user-select:none;white-space:nowrap;text-align:center">AWAITING<br>PAYMENT</div>';
    document.body.appendChild(wm);
  }

  applyLanguage(siteData, selectedLang);
  await applySections();

  // загружаем курсы і кантэнт паралельна
  const ratesPromise = fetch(API_URL + '/content/' + SITE_REPO + '/exchange-rates')
    .then(r => r.ok ? r.json() : null).catch(() => null);

  await Promise.all([
    loadServices(currentLang),
    loadAdvantages(currentLang),
    loadFiles(),
    loadTestimonials(currentLang),
    loadHowWeWork(currentLang),
    loadPromotions(currentLang),
    loadFaq(currentLang),
    loadPrices(currentLang),
  ]);

  exchangeRates = await ratesPromise;
  if (exchangeRates) _applyPriceConversion();

  initMap(siteData);
  initForm(siteData);
  initNavbar();
}

document.addEventListener('DOMContentLoaded', init);