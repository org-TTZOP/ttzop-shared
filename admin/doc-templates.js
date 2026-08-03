// ═══ 📄 КАТАЛОГ СТАРТАВЫХ ШАБЛОНАЎ ЮРЫДЫЧНЫХ ДАКУМЕНТАЎ ═══
//
// ⚠️ ЧАМУ ГЭТА ІСНУЕ. РМ «Палітыка прыватнасці» прыязджаў да кліента з ПУСТЫМ рэдактарам.
// Юрыдычны дакумент з нуля не піша ніхто — і не напіша; у выніку сайт ішоў у свет без палітыкі,
// хоць механізм згод працаваў і пісаў у базу нумар версіі, якой не існавала.
//
// 🔑 ФАЙЛ ЛЕНАВЫ (як `help-i18n.js`): цягнецца толькі калі кліент ціснуў «Узяць шаблон».
// Юрыдычны тэкст не мусіць ехаць у старт панэлі — той і так важкі.
//
// 🧩 КАТАЛОГ, а не код: новы дакумент = АДЗІН запіс `DOC_TEMPLATES[тып][мова]`, рухавік
// (`_docTemplateGet` у панэлі) не чапаецца. Тыпы — тыя ж, што ў `DOC_TYPES`:
// privacy · terms · refund · delivery · other.
//
// 🔤 ПАДСТАЎКІ `{{…}}` — гэта НЕ новы механізм, а існуючы каталог `DOC_FIELDS`: панэль падменіць
// іх значэннямі з налад пры паказе і заморозіць здымак пры публікацыі версіі. Ужываць толькі
// коды, што ёсць у `DOC_FIELDS`, інакш у тэксце застануцца дужкі.
//
// ⚠️ ЗМЕСТ АПІСВАЕ РЭАЛЬНУЮ МЕХАНІКУ, звераную па кодзе (не агульныя шаблоны з інтэрнэту):
//   • кукі НЕ ставяцца ніводнай — праверана: `document.cookie` у `main.js` і `index.html` = 0;
//     усё, што захоўваецца ў браўзеры, ляжыць у localStorage і патрэбна для працы (мова, кошык…)
//   • трэціх трэкераў (GA, Meta, Matomo…) няма ніводнага
//   • шрыфты САМАХОСТ (`assets/fonts`) — запыту да fonts.googleapis.com няма
//   • АЛЕ мапа цягне пліткі з tile.openstreetmap.org — гэта адзіны трэці бок, які бачыць IP
//     наведвальніка, і ён названы асобна (толькі на старонках з мапай)
//   • выдаленне = АНАНІМІЗАЦЫЯ: фінансавыя радкі застаюцца (падатковы абавязак, GDPR арт. 17(3))
// Мяняецца механіка — спярша праўка тут, потым новая версія дакумента.
//
// ⚠️ ЭТА ЗАГАТОЎКА, А НЕ ЮРЫДЫЧНАЯ КАНСУЛЬТАЦЫЯ. Кліент мусіць прачытаць, выкрасліць лішняе
// і зацвердзіць у свайго юрыста. Таму тэкст пачынаецца бачным блокам-папярэджаннем, які кліент
// здымае САМ — аўтаматычна яго не прыбіраем: знік бы адзіны сігнал «дакумент яшчэ не праверана».
//
// 🌍 Мовы: `be` + `en`, рэзалв з фолбэкам на `en`. Неправераны тэкст на мове, якой мы не валодаем,
// горш за англійскі — англійскі кліент адразу бачыць як «трэба перакласці», а венгерскі прыме
// за гатовы. Дадаць мову = адзін запіс, гэта не тупік.

window.TTZOP_DOC_TEMPLATES = {

  privacy: {

    be: `
<p style="background:#fff8e1;border-left:4px solid #f5a623;padding:10px 12px"><strong>⚠️ ГЭТА ЗАГАТОЎКА — ПРАЧЫТАЙЦЕ І ПРАВЕРЦЕ.</strong> Тэкст пабудаваны па артыкулах 13-14 GDPR і апісвае тое, што сістэма робіць з данымі насамрэч. Але ён не ведае вашай краіны, вашай справы і вашых дамоў з іншымі кампаніямі. Выкрасліце тое, чаго ў вас няма, дапішыце тое, што ёсць, і зацвердзіце ў юрыста. Пасля праверкі выдаліце гэты блок.</p>

<h2>Палітыка прыватнасці</h2>
<p>Гэты дакумент тлумачыць, якія персанальныя даныя збірае сайт <strong>{{site}}</strong>, навошта, на якой прававой падставе, колькі мы іх трымаем і як вы можаце імі кіраваць.</p>

<h3>1. Хто адказвае за вашы даныя</h3>
<p><strong>Кантралёр даных</strong> — {{company}} (далей — {{orgshort}}).<br>
Адрас: {{address}}<br>
Падатковы/рэгістрацыйны нумар: {{taxnum}}<br>
Пошта: <a href="mailto:{{email}}">{{email}}</a> · Тэлефон: {{phone}}</p>
<p>Па любых пытаннях пра даныя пішыце на <a href="mailto:{{email}}">{{email}}</a> — гэта наш канал для запытаў суб'ектаў даных.</p>

<h3>2. Коратка — самае галоўнае</h3>
<ul>
  <li>Мы збіраем толькі тое, што вы падаяце самі, і толькі каб выканаць вашу просьбу.</li>
  <li>Паводле аўтаматычнай праверкі, сайт <strong>{{notrack}}</strong>, не вядзе рэкламнага сачэння і логаў наведванняў.</li>
  <li>Мы <strong>не прадаём</strong> вашы даныя і не перадаём іх нікому дзеля чужых мэтаў.</li>
  <li>Мы <strong>не прымаем аўтаматычных рашэнняў</strong> пра вас і не займаемся прафіляваннем.</li>
  <li>Вы ў любы момант можаце атрымаць копію сваіх даных або папрасіць іх выдаліць.</li>
</ul>

<h3>3. Што мы збіраем, навошта і на якой падставе</h3>
<table style="border-collapse:collapse;width:100%">
  <tr><td><strong>Даныя</strong></td><td><strong>Навошта</strong></td><td><strong>Прававая падстава (GDPR)</strong></td></tr>
  <tr><td>Імя, email, тэлефон, адрас дастаўкі, склад заказу, ваш каментар</td><td>прыняць і выканаць заказ, звязацца з вамі па ім</td><td>арт. 6(1)(b) — выкананне дамовы</td></tr>
  <tr><td>Імя, кантакт, выбраная паслуга і час, колькасць удзельнікаў</td><td>запіс на пэўны час, напамін, перанос ці адмена</td><td>арт. 6(1)(b) — выкананне дамовы</td></tr>
  <tr><td>Тэкст вашых паведамленняў і прыкладзеныя файлы</td><td>адказаць на зварот, весці ліставанне па заказе</td><td>арт. 6(1)(b), а для агульных пытанняў — арт. 6(1)(f)</td></tr>
  <tr><td>Email для ўваходу ў кабінет і аднаразовыя коды</td><td>бяспечны ўваход без пароля</td><td>арт. 6(1)(b) — доступ да паслугі</td></tr>
  <tr><td>Дакументы аплаты, сумы, нумары заказаў</td><td>бухгалтэрыя і падатковая справаздачнасць</td><td>арт. 6(1)(c) — юрыдычны абавязак</td></tr>
  <tr><td>IP-адрас — <strong>не захоўваецца</strong>: ператвараецца ў незваротны ключ</td><td>абмежаванне частаты запытаў, абарона ад ботаў і перабору кодаў</td><td>арт. 6(1)(f) — законны інтарэс</td></tr>
  <tr><td>Версія дакумента, з якой вы згадзіліся, і час згоды</td><td>доказ, што згода была атрымана</td><td>арт. 6(1)(c) — падсправаздачнасць</td></tr>
</table>
<p><em>Законны інтарэс</em> у выпадках вышэй — гэта абарона сайта ад узлому і спаму і магчымасць адказаць на ваш зварот. Мы зважылі яго з вашымі правамі і лічым, што ён іх не парушае; вы можаце запярэчыць — гл. раздзел 9.</p>
<p>Мы <strong>не збіраем</strong> асаблівых катэгорый даных (здароўе, веравызнанне, палітычныя погляды, паходжанне, біяметрыя). <strong style="color:#b45309">ЗАПОЎНІЦЬ, калі ваша дзейнасць іх патрабуе</strong> — тады гэты раздзел трэба перапісаць і назваць падставу з арт. 9 GDPR.</p>

<h3>4. Ці абавязкова падаваць даныя</h3>
<p>Падаць даныя — ваш выбар. Але без імя, кантакту і адрасу мы <strong>не зможам</strong> прыняць заказ ці зрабіць запіс: гэта не наша прыхамаць, а ўмова, без якой дамову проста немагчыма выканаць. Калі вы не хочаце пакідаць даныя — звяжыцеся з намі іншым спосабам, і мы падкажам, што магчыма.</p>

<h3>5. Кукі, сачэнне і староннія запыты</h3>
<p>Паводле аўтаматычнай праверкі паводзін сайта, ён <strong>{{notrack}}</strong>. Няма ні Google Analytics, ні пікселяў сацсетак, ні рэкламных сетак, ні іншых трэкераў. ⓘ Гэта значэнне не набіраецца рукамі: яно вылічваецца праверкай рэальных загалоўкаў сайта і змесціва сховішча, і пры змене паводзін дакумент атрымлівае новую версію.</p>
<p>Браўзер захоўвае некалькі тэхнічных значэнняў (выбраная мова, змесціва кошыка, чарнавік паведамлення, прыкметы ўваходу ў кабінет). Яны застаюцца <strong>на вашай прыладзе</strong>, нам не перадаюцца і патрэбныя выключна для працы сайта — таму згода на іх не патрабуецца. Ачыстка даных сайта ў браўзеры выдаляе іх адразу.</p>
<p>IP-адрас патрэбны толькі на тое імгненне, каб адрозніць вашы запыты ад чужых і не даць боту заваліць сайт заказамі ці перабраць коды ўваходу. Для гэтага адрас адразу ператвараецца ў незваротны ключ (крыптаграфічны хэш з сакрэтнай соллю) — з яго нельга атрымаць адрас назад. Ключ жыве кароткае акно і аўтаматычна прыбіраецца. Логаў наведванняў мы не вядзём наогул.</p>
<p>⚠️ Пры гэтым сам факт злучэння бачыць наш хмарны правайдэр — як любы хостынг любога сайта; гэта ўзровень сеткі, а не наш выбар (гл. раздзел 6).</p>
<p>Шрыфты загружаюцца з нашага ж сервера — пабочных запытаў яны не робяць. <em>Калі на старонцы паказаная мапа</em>, яе пліткі прыходзяць з OpenStreetMap, і іх сервер бачыць ваш IP-адрас. Гэта адзіны запыт да трэцяга боку на сайце.</p>

<h3>6. Хто яшчэ бачыць даныя</h3>
<p>Мы не прадаём даныя і не перадаём іх трэцім асобам дзеля іх уласных мэтаў. Іх апрацоўваюць толькі падрадчыкі, без якіх сайт не працуе — усе яны звязаныя з намі дамовай апрацоўкі (арт. 28 GDPR):</p>
<ul>
  <li><strong>Пастаўшчык хмарнай інфраструктуры</strong> — хостынг сайта, база даных, сховішча файлаў.</li>
  <li><strong>Сэрвіс адпраўкі пошты</strong> — каб пацвярджэнне заказу і код уваходу да вас даехалі.</li>
  <li><strong>OpenStreetMap</strong> — толькі пліткі мапы і толькі на старонках з мапай.</li>
  <li><strong style="color:#b45309">ЗАПОЎНІЦЬ:</strong> плацёжны сэрвіс, служба дастаўкі, бухгалтэр — калі яны ў вас ёсць.</li>
</ul>
<p>Даныя могуць быць перададзены дзяржаўным органам, калі гэтага патрабуе закон.</p>

<h3>7. Перадача за межы ЕЭП</h3>
<p>Нашы падрадчыкі могуць апрацоўваць даныя па-за Еўрапейскай эканамічнай прасторай. У такіх выпадках перадача абапіраецца на <strong>стандартныя дагаворныя ўмовы Еўракамісіі (SCC)</strong> або на рашэнне пра адэкватнасць для адпаведнай краіны. Копію гарантый можна запытаць на <a href="mailto:{{email}}">{{email}}</a>.</p>

<h3>8. Колькі мы захоўваем даныя</h3>
<ul>
  <li><strong>Гісторыя заказаў і запісаў</strong> — {{retention}}, потым ідзе ў архіў або абязасабліваецца.</li>
  <li><strong>Дакументы аплаты</strong> — столькі, колькі патрабуе падатковае заканадаўства, нават калі вы папрасілі выдаліць астатняе.</li>
  <li><strong>Ліставанне</strong> — пакуль актуальны зварот, потым разам з гісторыяй заказаў.</li>
  <li><strong>Запісы згоды</strong> — пакуль дзейнічае абавязак даказаць, што згода была.</li>
  <li><strong>Ключы абмежавання частаты</strong> (з якіх адрас не аднаўляецца) — кароткае акно, потым выдаляюцца аўтаматычна.</li>
</ul>

<h3>9. Вашы правы</h3>
<p>Паводле GDPR вы маеце права:</p>
<ul>
  <li><strong>ведаць</strong>, якія даныя пра вас у нас ёсць, і атрымаць іх копію (арт. 15);</li>
  <li><strong>выправіць</strong> няслушнае ці дапоўніць няпоўнае (арт. 16);</li>
  <li><strong>выдаліць</strong> свае даныя — «права быць забытым» (арт. 17);</li>
  <li><strong>абмежаваць</strong> апрацоўку, пакуль спрэчка не вырашана (арт. 18);</li>
  <li><strong>перанесці</strong> даныя ў машыначытальным фармаце да іншага пастаўшчыка (арт. 20);</li>
  <li><strong>запярэчыць</strong> супраць апрацоўкі на падставе законнага інтарэсу (арт. 21);</li>
  <li><strong>адклікаць згоду</strong> ў любы момант, калі апрацоўка ішла на яе падставе — гэта не робіць незаконным тое, што было да адклікання (арт. 7(3));</li>
  <li><strong>паскардзіцца</strong> ў нагляданы орган па абароне даных вашай краіны (арт. 77).</li>
</ul>
<p><strong>Як скарыстацца:</strong> кнопкі «атрымаць копію» і «выдаліць даныя» ёсць у вашым кабінеце, або напішыце на <a href="mailto:{{email}}">{{email}}</a>. Мы адкажам <strong>цягам аднаго месяца</strong>; калі запыт складаны, тэрмін можа быць падоўжаны яшчэ на два месяцы — пра гэта мы паведамім. Гэта бясплатна.</p>
<p><strong>Як менавіта працуе выдаленне.</strong> Запыт выконваецца не імгненна: некалькі дзён яго можна адклікаць — гэта абарона ад выпадковага націску. Пасля гэтага імя, кантакты, адрас і тэксты паведамленняў сціраюцца незваротна, а прыкладзеныя файлы выдаляюцца са сховішча. Радкі пра аплату застаюцца, <strong>але без вашага імя</strong> — захоўваць іх нас абавязвае падатковы закон (арт. 17(3)(b) GDPR). Пакуль ёсць неаплачаны заказ ці будучы запіс на час, выдаленне не пачынаецца: спярша трэба закрыць справу.</p>

<h3>10. Аўтаматычныя рашэнні і прафіляванне</h3>
<p>Мы <strong>не прымаем</strong> рашэнняў пра вас выключна аўтаматычна і <strong>не будуем профіляў</strong> для прагназавання вашых паводзін ці інтарэсаў.</p>

<h3>11. Даныя дзяцей</h3>
<p>Сайт не прызначаны для дзяцей і мы свядома не збіраем іх даных. Калі вы лічыце, што дзіця пакінула нам свае даныя, напішыце на <a href="mailto:{{email}}">{{email}}</a> — мы іх выдалім.</p>

<h3>12. Бяспека</h3>
<p>Злучэнне з сайтам шыфруецца (HTTPS). Уваход у кабінет — па аднаразовым кодзе на вашу пошту, без пароля, які можна падгледзець. Доступ да адміністрацыйнай панэлі абаронены паролем і абмежаваны колам асоб, якім ён патрэбны па працы. Паводле аўтаматычнай праверкі, {{backup}}.</p>
<p>Калі здарыцца ўцечка, што пагражае вашым правам, мы паведамім нагляданаму органу цягам 72 гадзін і, калі рызыка высокая, вам асабіста (арт. 33-34 GDPR).</p>

<h3>13. Змены гэтай палітыкі</h3>
<p>Кожная рэдакцыя захоўваецца асобнай версіяй з датай — відаць, што і калі мянялася. Пры істотных зменах мы папросім згоду нанова, і будзе зафіксавана, з якой менавіта версіяй вы згадзіліся.</p>

<p style="color:#666"><em>{{orgsign}} · {{site}}</em></p>
`,

    en: `
<p style="background:#fff8e1;border-left:4px solid #f5a623;padding:10px 12px"><strong>⚠️ THIS IS A STARTING DRAFT — READ IT AND CHECK IT.</strong> The text follows GDPR Articles 13-14 and describes what the system actually does with data. But it knows nothing about your country, your business or your agreements with other companies. Delete what does not apply, add what does, and have a lawyer approve it. Remove this block once reviewed.</p>

<h2>Privacy Policy</h2>
<p>This document explains what personal data the site <strong>{{site}}</strong> collects, why, on what legal basis, how long we keep it and how you can control it.</p>

<h3>1. Who is responsible for your data</h3>
<p><strong>Data controller</strong> — {{company}} (referred to below as {{orgshort}}).<br>
Address: {{address}}<br>
Tax / registration number: {{taxnum}}<br>
Email: <a href="mailto:{{email}}">{{email}}</a> · Phone: {{phone}}</p>
<p>For any question about your data write to <a href="mailto:{{email}}">{{email}}</a> — this is our channel for data subject requests.</p>

<h3>2. In short</h3>
<ul>
  <li>We collect only what you give us, and only to carry out your request.</li>
  <li>According to an automated check, this site <strong>{{notrack}}</strong>, runs no advertising tracking and keeps no visit logs.</li>
  <li>We <strong>do not sell</strong> your data and do not pass it to anyone for their own purposes.</li>
  <li>We make <strong>no automated decisions</strong> about you and do no profiling.</li>
  <li>You can obtain a copy of your data, or ask us to delete it, at any time.</li>
</ul>

<h3>3. What we collect, why, and on what legal basis</h3>
<table style="border-collapse:collapse;width:100%">
  <tr><td><strong>Data</strong></td><td><strong>Purpose</strong></td><td><strong>Legal basis (GDPR)</strong></td></tr>
  <tr><td>Name, email, phone, delivery address, order contents, your comment</td><td>to accept and fulfil your order and contact you about it</td><td>Art. 6(1)(b) — performance of a contract</td></tr>
  <tr><td>Name, contact, chosen service and time, number of participants</td><td>booking, reminders, rescheduling or cancellation</td><td>Art. 6(1)(b) — performance of a contract</td></tr>
  <tr><td>The text of your messages and any attachments</td><td>to answer you and correspond about the order</td><td>Art. 6(1)(b); for general enquiries Art. 6(1)(f)</td></tr>
  <tr><td>Email for signing in and one-time codes</td><td>secure passwordless access to your account</td><td>Art. 6(1)(b) — access to the service</td></tr>
  <tr><td>Payment records, amounts, order numbers</td><td>accounting and tax reporting</td><td>Art. 6(1)(c) — legal obligation</td></tr>
  <tr><td>IP address — <strong>not stored</strong>: converted into an irreversible key</td><td>rate limiting, protection against bots and code-guessing</td><td>Art. 6(1)(f) — legitimate interest</td></tr>
  <tr><td>The document version you accepted and the time of acceptance</td><td>evidence that consent was obtained</td><td>Art. 6(1)(c) — accountability</td></tr>
</table>
<p><em>Legitimate interest</em> above means protecting the site from intrusion and spam and being able to answer your enquiry. We have balanced it against your rights and consider that it does not override them; you may object — see section 9.</p>
<p>We do <strong>not</strong> collect special categories of data (health, religion, political opinions, origin, biometrics). <strong style="color:#b45309">TO COMPLETE if your business requires them</strong> — this section must then be rewritten and name a basis under Art. 9 GDPR.</p>

<h3>4. Do you have to provide data</h3>
<p>Providing data is your choice. But without a name, contact details and address we simply <strong>cannot</strong> accept an order or make a booking — this is not our preference but a condition without which the contract cannot be performed. If you would rather not leave data, contact us another way and we will tell you what is possible.</p>

<h3>5. Cookies, tracking and third-party requests</h3>
<p>According to an automated check of the site's behaviour, it <strong>{{notrack}}</strong>. There is no Google Analytics, no social network pixels, no ad networks, no other trackers. ⓘ This value is not typed in by hand: it is computed by inspecting the site's real response headers and the contents of our storage, and if the behaviour changes the document is reissued as a new version.</p>
<p>Your browser stores a few technical values (chosen language, cart contents, an unsent message draft, sign-in state). They stay <strong>on your device</strong>, are never sent to us, and exist solely so the site works — which is why no consent is required for them. Clearing site data in your browser removes them immediately.</p>
<p>Your IP address is needed only for the instant required to tell your requests apart from anyone else's, so that a bot cannot flood the site with orders or guess sign-in codes. For that the address is immediately turned into an irreversible key (a cryptographic hash with a secret salt) from which the address cannot be recovered. The key lives for a short window and is then removed automatically. We keep no visit logs at all.</p>
<p>⚠️ The connection itself is of course visible to our cloud provider — as it is for any website on any hosting; that is the network layer, not our choice (see section 6).</p>
<p>Fonts are served from our own server and make no third-party requests. <em>If a page shows a map</em>, its tiles come from OpenStreetMap and their server sees your IP address. That is the only third-party request on this site.</p>

<h3>6. Who else sees the data</h3>
<p>We do not sell data and do not pass it to third parties for their own purposes. It is processed only by suppliers without whom the site cannot run, each bound by a data processing agreement (Art. 28 GDPR):</p>
<ul>
  <li><strong>Cloud infrastructure provider</strong> — site hosting, database, file storage.</li>
  <li><strong>Email delivery service</strong> — so that order confirmations and sign-in codes reach you.</li>
  <li><strong>OpenStreetMap</strong> — map tiles only, and only on pages that show a map.</li>
  <li><strong style="color:#b45309">TO COMPLETE:</strong> payment provider, courier, accountant — if you use them.</li>
</ul>
<p>Data may be disclosed to public authorities where the law requires it.</p>

<h3>7. Transfers outside the EEA</h3>
<p>Our suppliers may process data outside the European Economic Area. Where that happens, the transfer relies on the <strong>European Commission Standard Contractual Clauses (SCC)</strong> or on an adequacy decision for the country concerned. A copy of the safeguards can be requested at <a href="mailto:{{email}}">{{email}}</a>.</p>

<h3>8. How long we keep data</h3>
<ul>
  <li><strong>Order and booking history</strong> — {{retention}}, after which it is archived or anonymised.</li>
  <li><strong>Payment records</strong> — for as long as tax law requires, even if you asked us to delete everything else.</li>
  <li><strong>Correspondence</strong> — while the enquiry is live, then together with the order history.</li>
  <li><strong>Consent records</strong> — while we must be able to prove consent was given.</li>
  <li><strong>Rate-limiting keys</strong> (from which no address can be recovered) — a short window, then removed automatically.</li>
</ul>

<h3>9. Your rights</h3>
<p>Under the GDPR you have the right to:</p>
<ul>
  <li><strong>know</strong> what data we hold about you and receive a copy (Art. 15);</li>
  <li><strong>correct</strong> what is wrong or complete what is missing (Art. 16);</li>
  <li><strong>have your data erased</strong> — the right to be forgotten (Art. 17);</li>
  <li><strong>restrict</strong> processing while a dispute is resolved (Art. 18);</li>
  <li><strong>port</strong> your data to another provider in a machine-readable format (Art. 20);</li>
  <li><strong>object</strong> to processing based on legitimate interest (Art. 21);</li>
  <li><strong>withdraw consent</strong> at any time where processing was based on it — this does not affect the lawfulness of what happened before (Art. 7(3));</li>
  <li><strong>lodge a complaint</strong> with the data protection authority in your country (Art. 77).</li>
</ul>
<p><strong>How to exercise them:</strong> your account has buttons to export and to delete your data, or write to <a href="mailto:{{email}}">{{email}}</a>. We will answer <strong>within one month</strong>; if the request is complex that may be extended by a further two months, and we will tell you. There is no charge.</p>
<p><strong>How deletion actually works.</strong> The request is not carried out instantly: for a few days it can be withdrawn, which protects you from an accidental click. After that your name, contact details, address and message texts are erased irreversibly, and attached files are removed from storage. Payment records remain, <strong>but without your name</strong> — tax law obliges us to keep them (Art. 17(3)(b) GDPR). While an unpaid order or a future booking exists, deletion does not start: that business has to be closed first.</p>

<h3>10. Automated decisions and profiling</h3>
<p>We make <strong>no</strong> decisions about you by automated means alone, and we build <strong>no profiles</strong> to predict your behaviour or interests.</p>

<h3>11. Children</h3>
<p>This site is not intended for children and we do not knowingly collect their data. If you believe a child has given us their data, write to <a href="mailto:{{email}}">{{email}}</a> and we will delete it.</p>

<h3>12. Security</h3>
<p>The connection to the site is encrypted (HTTPS). Signing in uses a one-time code sent to your email rather than a password that can be observed. Access to the management panel is password-protected and limited to people who need it for their work. According to an automated check, {{backup}}.</p>
<p>If a breach occurs that threatens your rights, we will notify the supervisory authority within 72 hours and, where the risk is high, you personally (Arts. 33-34 GDPR).</p>

<h3>13. Changes to this policy</h3>
<p>Every revision is stored as a separate dated version, so it is clear what changed and when. For significant changes we will ask for consent again, and it will be recorded which version you agreed to.</p>

<p style="color:#666"><em>{{orgsign}} · {{site}}</em></p>
`,

  },

  // ⚠️ УМОВЫ — гэта ДАМОВА (у адрозненне ад Палітыкі, што толькі ІНФАРМУЕ). Значыць прабелы тут
  // каштуюць даражэй: без тэрміну вяртання і без названага права спрэчку няма чым закрываць.
  // Месцы, што залежаць ад краіны і віду дзейнасці, пазначаны прама ў тэксце — каб кліент не
  // прапусціў іх вокам сярод гатовых абзацаў.
  terms: {

    be: `
<p style="background:#fff8e1;border-left:4px solid #f5a623;padding:10px 12px"><strong>⚠️ ГЭТА ЗАГАТОЎКА — ПРАЧЫТАЙЦЕ І ПРАВЕРЦЕ.</strong> Умовы — гэта дамова, а не тэкст на сайце. Абзацы, пазначаныя <strong style="color:#b45309">ЗАПОЎНІЦЬ</strong>, залежаць ад вашай краіны і вашай справы: без іх дакумент не працуе. Зацвердзіце ў юрыста і выдаліце гэты блок.</p>

<h2>Умовы карыстання і продажу</h2>
<p>Гэтыя ўмовы дзейнічаюць паміж {{company}} (далей — {{orgshort}}, «мы») і кожным, хто робіць заказ ці карыстаецца сайтам <strong>{{site}}</strong> (далей — «вы»). Афармляючы заказ, вы прымаеце гэтыя ўмовы і заключаеце з намі дамову.</p>

<h3>1. Хто прадае</h3>
<p>{{company}}<br>
Адрас: {{address}}<br>
Падатковы/рэгістрацыйны нумар: {{taxnum}}<br>
Сувязь: <a href="mailto:{{email}}">{{email}}</a> · {{phone}}</p>

<h3>2. Што прадаецца</h3>
<p>Праз сайт можна замовіць тавар, замовіць паслугу, запісацца на пэўны час, аформіць падпіску або даслаць запыт на індывідуальную прапанову — у залежнасці ад таго, што выстаўлена ў каталозе.</p>
<p>Фота і апісанні паказваюць тавар максімальна дакладна, але магчымыя нязначныя адрозненні ў адценні, вазе ці афармленні. <strong style="color:#b45309">ЗАПОЎНІЦЬ:</strong> калі ў вас ручная праца ці прадукт пад заказ — апішыце дапушчальныя адхіленні.</p>

<h3>3. Як заключаецца дамова</h3>
<ol>
  <li>Вы адпраўляеце заказ праз сайт — гэта ваша прапанова.</li>
  <li>Мы дасылаем пацвярджэнне на email. <strong>Дамова лічыцца заключанай з гэтага моманту.</strong></li>
  <li>Да пацвярджэння мы можам заказ не прыняць — напрыклад, тавару няма ў наяўнасці або адрас па-за зонай абслугоўвання.</li>
</ol>
<p>Стан заказу відаць у вашым кабінеце і мяняецца па ходзе працы; пра кожную важную змену прыходзіць ліст. Мова дамовы — тая, на якой вы аформілі заказ.</p>

<h3>4. Цэны</h3>
<p>Дзейнічае цана, паказаная на сайце ў момант афармлення заказу. Частка пазіцый можа быць пазначана як «ад» ці «па запыце» — для іх канчатковая цана называецца пасля ўдакладнення дэталяў і <strong>да пачатку працы</strong>.</p>
<p><strong style="color:#b45309">ЗАПОЎНІЦЬ:</strong> ці ўключаны падатак у паказаную цану — гэта пытанне задаюць часцей за ўсё.</p>

<h3>5. Аплата</h3>
<p>Спосабы аплаты і тэрміны — у дакуменце «Дастаўка і аплата». Пасля пацвярджэння заказу вы атрымліваеце рэквізіты, суму і <strong>тэрмін аплаты</strong>.</p>
<p>Калі аплата не прыходзіць да названага тэрміну, заказ адмяняецца аўтаматычна, і мы паведамляем пра гэта лістом загадзя. Гэта не штраф — проста мы не трымаем тавар бясконца; заказаць нанова можна ў любы момант.</p>

<h3>6. Выкананне</h3>
<p><strong style="color:#b45309">ЗАПОЎНІЦЬ:</strong> тэрміны выканання і дастаўкі. Калі тавар рыхтуецца пад заказ, назавіце тэрмін вырабу <strong>асобна</strong> ад тэрміну дастаўкі — гэта самае частае непаразуменне.</p>
<p>Пра любую затрымку паведамляем адразу, як даведаемся.</p>

<h3>7. Запіс на пэўны час</h3>
<p>Перанесці ці адмяніць запіс можна самастойна ў кабінеце — да таго моманту, які пазначаны для гэтай паслугі. Пазней звяжыцеся з намі: <a href="mailto:{{email}}">{{email}}</a>, {{phone}}.</p>
<p><strong style="color:#b45309">ЗАПОЎНІЦЬ:</strong> што пры непрыходзе без папярэджання — ці бярэцца плата, ці губляецца перадаплата.</p>

<h3>8. Падпіскі</h3>
<p>Падпіска дзейнічае абраны перыяд (месяц ці год) і працягваецца, пакуль вы яе не спыніце. Спыніць можна ў любы момант — доступ і паслуга захоўваюцца <strong>да канца ўжо аплачанага перыяду</strong>, грошы за яго не вяртаюцца, калі не дамовіліся іначай.</p>

<h3>9. Адмова і вяртанне</h3>
<p><strong style="color:#b45309">ЗАПОЎНІЦЬ — без гэтага раздзела дакумент не працуе.</strong> Пазначце: тэрмін адмовы, у якім стане прымаецца тавар, хто плаціць за зваротную дасылку, за колькі дзён вяртаюцца грошы. У ЕС для продажу на адлегласці звычайна дзейнічаюць 14 дзён, але ёсць выключэнні — тавар пад канкрэтнага пакупніка, хуткапсавальнае, распячатаная гігіена, цалкам аказаная паслуга.</p>
<p>Пры бракаваным ці не тым тавары дзейнічаюць іншыя правілы і іншыя тэрміны — гэта не «перадумаў», а наша неналежнае выкананне.</p>

<h3>10. Кабінет і бяспека доступу</h3>
<p>Уваход у кабінет — па аднаразовым кодзе на ваш email. Беражыце доступ да пошты: усе дзеянні, зробленыя праз ваш кабінет, лічацца вашымі. Пра падазрэнне на чужы доступ паведамляйце адразу на <a href="mailto:{{email}}">{{email}}</a>.</p>

<h3>11. Змест сайта і ваш змест</h3>
<p>Тэксты, фота і афармленне сайта належаць нам; карыстацца імі ў іншым месцы без дазволу нельга. Калі вы дасылаеце нам свае фота ці тэксты (у чаце, у водгуку, у заказе), вы дазваляеце нам выкарыстаць іх у той меры, у якой гэта патрэбна для выканання вашага заказу.</p>

<h3>12. Персанальныя даныя</h3>
<p>Як мы абыходзімся з вашымі данымі, апісана ў <strong>Палітыцы прыватнасці</strong> — яна частка гэтых умоў. Гісторыя заказаў захоўваецца {{retention}}; дакументы аплаты — столькі, колькі патрабуе падатковы закон.</p>

<h3>13. Наша адказнасць</h3>
<p>Мы адказваем за тое, што прадалі, і за шкоду, прычыненую нашай віной. Мы не адказваем за абставіны, што ад нас не залежаць: збоі сувязі і інтэрнэту, дзеянні перавозчыка, стыхійныя падзеі, змены заканадаўства.</p>
<p>⚠️ Гэтае абмежаванне <strong>не закранае</strong> вашых правоў спажыўца, гарантаваных законам, і не дзейнічае пры наўмыснай віне ці грубай неасцярожнасці.</p>

<h3>14. Змены ўмоў</h3>
<p>Кожная рэдакцыя захоўваецца асобнай версіяй з датай. Да ўжо зробленага заказу прымяняецца тая рэдакцыя, што дзейнічала ў момант заказу.</p>

<h3>15. Права і спрэчкі</h3>
<p><strong style="color:#b45309">ЗАПОЎНІЦЬ:</strong> права якой краіны дзейнічае і дзе разглядаюцца спрэчкі. Спярша мы заўсёды спрабуем вырашыць пытанне лістом — напішыце на <a href="mailto:{{email}}">{{email}}</a>. Правы спажыўца, гарантаваныя законам краіны яго пражывання, гэтым не абмяжоўваюцца.</p>

<p style="color:#666"><em>{{orgsign}} · {{site}}</em></p>
`,

    en: `
<p style="background:#fff8e1;border-left:4px solid #f5a623;padding:10px 12px"><strong>⚠️ THIS IS A STARTING DRAFT — READ IT AND CHECK IT.</strong> Terms are a contract, not just text on a page. The paragraphs marked <strong style="color:#b45309">TO COMPLETE</strong> depend on your country and your business: without them the document does not work. Have a lawyer approve it and remove this block.</p>

<h2>Terms of Use and Sale</h2>
<p>These terms apply between {{company}} (referred to below as {{orgshort}}, "we") and anyone who places an order or uses the site <strong>{{site}}</strong> ("you"). By placing an order you accept these terms and enter into a contract with us.</p>

<h3>1. Who sells</h3>
<p>{{company}}<br>
Address: {{address}}<br>
Tax / registration number: {{taxnum}}<br>
Contact: <a href="mailto:{{email}}">{{email}}</a> · {{phone}}</p>

<h3>2. What is sold</h3>
<p>Through this site you can order goods, order a service, book a specific time, take out a subscription, or request an individual quote — depending on what is listed in the catalogue.</p>
<p>Photos and descriptions show the product as accurately as possible, but slight differences in shade, weight or finish are possible. <strong style="color:#b45309">TO COMPLETE:</strong> if you make things by hand or to order, describe the acceptable variation.</p>

<h3>3. How the contract is formed</h3>
<ol>
  <li>You submit an order through the site — this is your offer.</li>
  <li>We send a confirmation by email. <strong>The contract is concluded at that moment.</strong></li>
  <li>Before confirming we may decline an order — for example, the item is out of stock or the address is outside our service area.</li>
</ol>
<p>The status of your order is visible in your account and changes as work progresses; every significant change is emailed to you. The language of the contract is the one in which you placed the order.</p>

<h3>4. Prices</h3>
<p>The price shown on the site when you place the order applies. Some items may be marked "from" or "on request" — for those the final price is given once details are agreed and <strong>before work begins</strong>.</p>
<p><strong style="color:#b45309">TO COMPLETE:</strong> whether tax is included in the displayed price — this is the most frequent question.</p>

<h3>5. Payment</h3>
<p>Payment methods and deadlines are set out in the "Delivery and payment" document. Once your order is confirmed you receive the bank details, the amount and a <strong>payment deadline</strong>.</p>
<p>If payment does not arrive by that date the order is cancelled automatically, and we notify you by email in advance. This is not a penalty — we simply cannot hold stock indefinitely; you are welcome to order again at any time.</p>

<h3>6. Performance</h3>
<p><strong style="color:#b45309">TO COMPLETE:</strong> your lead times for fulfilment and delivery. If goods are made to order, state the making time <strong>separately</strong> from the delivery time — this is the most common misunderstanding.</p>
<p>We tell you about any delay as soon as we know.</p>

<h3>7. Booked appointments</h3>
<p>You can reschedule or cancel a booking yourself in your account, up to the cut-off set for that service. After that, contact us: <a href="mailto:{{email}}">{{email}}</a>, {{phone}}.</p>
<p><strong style="color:#b45309">TO COMPLETE:</strong> what happens if someone does not turn up without notice — whether a fee applies or a deposit is lost.</p>

<h3>8. Subscriptions</h3>
<p>A subscription runs for the chosen period (month or year) and continues until you stop it. You may stop it at any time — access and service continue <strong>to the end of the period already paid for</strong>, and that amount is not refunded unless agreed otherwise.</p>

<h3>9. Cancellation and returns</h3>
<p><strong style="color:#b45309">TO COMPLETE — the document does not work without this section.</strong> State: the withdrawal period, the condition in which goods are accepted back, who pays return postage, and within how many days money is refunded. In the EU, 14 days normally applies to distance selling, with exceptions — goods made to the buyer's specification, perishables, opened hygiene products, a service already fully performed.</p>
<p>Faulty or wrong goods are governed by different rules and different time limits — that is not "changing your mind" but our failure to perform properly.</p>

<h3>10. Your account and access security</h3>
<p>Signing in uses a one-time code sent to your email. Keep access to that mailbox safe: anything done through your account is treated as done by you. Report any suspected unauthorised access immediately to <a href="mailto:{{email}}">{{email}}</a>.</p>

<h3>11. Site content and your content</h3>
<p>The texts, photos and design of this site belong to us and may not be used elsewhere without permission. If you send us your own photos or text (in chat, a review or an order), you allow us to use them to the extent needed to fulfil your order.</p>

<h3>12. Personal data</h3>
<p>How we handle your data is set out in our <strong>Privacy Policy</strong>, which forms part of these terms. Order history is kept for {{retention}}; payment records for as long as tax law requires.</p>

<h3>13. Our liability</h3>
<p>We are responsible for what we sell and for harm caused by our fault. We are not responsible for circumstances beyond our control: connectivity failures, the actions of a carrier, natural events, changes in legislation.</p>
<p>⚠️ This limitation <strong>does not affect</strong> your statutory consumer rights and does not apply in cases of intent or gross negligence.</p>

<h3>14. Changes to these terms</h3>
<p>Every revision is stored as a separate dated version. An order already placed is governed by the revision in force when it was placed.</p>

<h3>15. Governing law and disputes</h3>
<p><strong style="color:#b45309">TO COMPLETE:</strong> which country's law applies and where disputes are heard. We always try to settle a matter by email first — write to <a href="mailto:{{email}}">{{email}}</a>. Statutory consumer rights in your country of residence are not limited by this.</p>

<p style="color:#666"><em>{{orgsign}} · {{site}}</em></p>
`,

  },

  // ↩️ ВЯРТАННЕ І АДМОВА. ⚠️ Гэты дакумент на 90% вызначаецца КРАІНАЙ, пра якую сістэма нічога не
  // ведае (у ЕС — 14 дзён з пералікам выключэнняў, у іншых месцах інакш). Таму шаблон свядома
  // зроблены як КАРТА ПЫТАННЯЎ з падказкамі, а не як гатовы тэкст: выдуманыя тэрміны выглядалі б
  // праўдзіва і менавіта таму былі б небяспечныя.
  // Па змаўчанні гэтая тэма — раздзел 8 Умоў (`DOC_SPLITTABLE`); асобным дакументам яна становіцца,
  // калі кліент так выбраў у Агульных наладах.
  refund: {

    be: `
<p style="background:#fff8e1;border-left:4px solid #f5a623;padding:10px 12px"><strong>⚠️ ГЭТА КАРТА ПЫТАННЯЎ, а не гатовы тэкст.</strong> Правілы вяртання амаль цалкам вызначае закон вашай краіны, і выдумляць за яго тэрміны небяспечна. Ніжэй — усе пытанні, на якія дакумент мусіць адказаць, з падказкамі. Адкажыце на кожнае, зверце з юрыстам і выдаліце гэты блок.</p>

<h2>Вяртанне і адмова</h2>
<p>Дакумент тлумачыць, як адмовіцца ад заказу ў <strong>{{company}}</strong> і як вярнуць грошы.</p>

<h3>1. За колькі можна перадумаць</h3>
<p><strong style="color:#b45309">ЗАПОЎНІЦЬ:</strong> колькі дзён ад атрымання ёсць у пакупніка. У ЕС для пакупак на адлегласці гэта звычайна 14 дзён; праверце, што дзейнічае ў вас, і адкуль лічыцца тэрмін — ад заказу ці ад атрымання.</p>

<h3>2. Што нельга вярнуць</h3>
<p><strong style="color:#b45309">ЗАПОЎНІЦЬ.</strong> Тыповыя выключэнні: зробленае пад канкрэтнага пакупніка (гравіроўка, індывідуальны памер), ежа і іншае, што хутка псуецца, распячатаная гігіена і касметыка, паслуга, якую ўжо аказалі цалкам з вашай згоды. Пералічыце толькі тое, што сапраўды пра вас — лішнія выключэнні выглядаюць як спроба ўхіліцца.</p>

<h3>3. У якім стане прымаецца назад</h3>
<p><strong style="color:#b45309">ЗАПОЎНІЦЬ:</strong> ці патрэбная цэлая ўпакоўка, біркі, дакумент пра куплю. ⚠️ Памятайце: у многіх краінах пакупнік мае права агледзець тавар — таму «толькі ў некранутай плёнцы» можа быць незаконным патрабаваннем.</p>

<h3>4. Хто плаціць за зваротную дасылку</h3>
<p><strong style="color:#b45309">ЗАПОЎНІЦЬ.</strong> Асобна апішыце два розныя выпадкі: пакупнік проста перадумаў — і тавар прыйшоў бракаваны ці не той. У другім выпадку выдаткі амаль заўсёды вашы.</p>

<h3>5. Як вярнуць</h3>
<p>Напішыце нам на <a href="mailto:{{email}}">{{email}}</a> ці патэлефануйце {{phone}} — мы скажам, куды даслаць і што прыкласці. Адрас: {{address}}.</p>
<p><strong style="color:#b45309">ЗАПОЎНІЦЬ:</strong> ці патрэбная папяровая заява, ці ёсць форма.</p>

<h3>6. Калі вернуцца грошы</h3>
<p><strong style="color:#b45309">ЗАПОЎНІЦЬ:</strong> за колькі дзён і якім шляхам (на той жа рахунак, з якога плацілі). Пазначце, ці вяртаецца кошт першапачатковай дасылкі — гэта самае частае пытанне.</p>

<h3>7. Бракаваны ці не той тавар</h3>
<p>Гэта не «вяртанне па перадуманні», а іншая сітуацыя: тут вы маеце права на замену, рамонт ці грошы, і тэрміны тут іншыя. Сфатаграфуйце праблему і напішыце нам адразу.</p>
<p><strong style="color:#b45309">ЗАПОЎНІЦЬ:</strong> тэрмін гарантыі і што вы прапануеце першым — замену ці грошы.</p>

<h3>8. Адмена паслугі ці запісу</h3>
<p>Перанесці ці адмяніць запіс можна ў кабінеце да тэрміну, пазначанага для гэтай паслугі.
<strong style="color:#b45309">ЗАПОЎНІЦЬ:</strong> ці ўтрымліваецца нешта пры позняй адмене і ці вяртаецца перадаплата.</p>

<p style="color:#666"><em>{{orgsign}}</em></p>
`,

    en: `
<p style="background:#fff8e1;border-left:4px solid #f5a623;padding:10px 12px"><strong>⚠️ THIS IS A MAP OF QUESTIONS, not a finished text.</strong> Return rules are set almost entirely by the law of your country, and inventing deadlines on its behalf is dangerous. Below is every question the document must answer, with hints. Answer each one, have a lawyer check it, and delete this block.</p>

<h2>Returns and cancellation</h2>
<p>This document explains how to cancel an order from <strong>{{company}}</strong> and how refunds work.</p>

<h3>1. How long you have to change your mind</h3>
<p><strong style="color:#b45309">TO COMPLETE:</strong> how many days the buyer has from receipt. In the EU this is usually 14 days for distance selling; check what applies to you, and from when the period runs — the order or the delivery.</p>

<h3>2. What cannot be returned</h3>
<p><strong style="color:#b45309">TO COMPLETE.</strong> Typical exceptions: goods made to the buyer's specification (engraving, custom size), food and other perishables, opened hygiene and cosmetic products, a service already fully performed with the buyer's consent. List only what genuinely applies to you — surplus exceptions read as an attempt to wriggle out.</p>

<h3>3. What condition goods must be in</h3>
<p><strong style="color:#b45309">TO COMPLETE:</strong> whether the packaging, tags and proof of purchase are required. ⚠️ Remember that in many countries the buyer is entitled to inspect the goods — so "only in unopened wrapping" may be an unlawful requirement.</p>

<h3>4. Who pays return postage</h3>
<p><strong style="color:#b45309">TO COMPLETE.</strong> Describe two different cases separately: the buyer simply changed their mind, versus the item arrived faulty or wrong. In the second case the cost is almost always yours.</p>

<h3>5. How to return</h3>
<p>Write to <a href="mailto:{{email}}">{{email}}</a> or call {{phone}} — we will tell you where to send it and what to include. Address: {{address}}.</p>
<p><strong style="color:#b45309">TO COMPLETE:</strong> whether a written statement or a form is needed.</p>

<h3>6. When the money comes back</h3>
<p><strong style="color:#b45309">TO COMPLETE:</strong> within how many days and by what route (normally back to the method used to pay). State whether the original delivery charge is refunded — this is the most frequent question.</p>

<h3>7. Faulty or wrong item</h3>
<p>This is not "changing your mind" but a different situation: here you are entitled to a replacement, a repair or your money back, and different time limits apply. Photograph the problem and write to us straight away.</p>
<p><strong style="color:#b45309">TO COMPLETE:</strong> the warranty period, and whether you offer a replacement or a refund first.</p>

<h3>8. Cancelling a service or a booking</h3>
<p>You can reschedule or cancel a booking in your account up to the cut-off set for that service.
<strong style="color:#b45309">TO COMPLETE:</strong> whether anything is withheld for a late cancellation and whether a deposit is refunded.</p>

<p style="color:#666"><em>{{orgsign}}</em></p>
`,

  },

  // 🚚 ДАСТАЎКА І АПЛАТА. ⚠️ Механіка звераная па кодзе: зоны з коштам і парогам «бясплатна ад»
  // (`delivery.zones` / `freeAbove`), кошт лічыцца па АДРАСУ З КАБІНЕТА (без захаванага адрасу
  // дастаўка не прапануецца), аплата — банкаўскі пераказ па рахунку з тэрмінам і аўта-ануляваннем.
  // Тэрміны і самавываз сістэма не ведае — яны пазначаны як «запоўніць».
  delivery: {

    be: `
<p style="background:#fff8e1;border-left:4px solid #f5a623;padding:10px 12px"><strong>⚠️ ГЭТА ЗАГАТОЎКА — ПРАЧЫТАЙЦЕ І ПРАВЕРЦЕ.</strong> Тут апісана тое, што сістэма ўмее рабіць. Вашы зоны, кошты і тэрміны яна не ведае — абзацы з пазнакай <strong style="color:#b45309">ЗАПОЎНІЦЬ</strong> трэба дапісаць рукамі. Пасля праверкі выдаліце гэты блок.</p>

<h2>Дастаўка і аплата</h2>

<h3>1. Як можна атрымаць заказ</h3>
<p>Дастаўка па адрасе і <strong style="color:#b45309">ЗАПОЎНІЦЬ: самавываз — ці ёсць, адкуль і ў якія гадзіны</strong>.</p>
<p>Кошт дастаўкі разлічваецца па <strong>зоне</strong>, у якую трапляе ваш адрас. Каб убачыць кошт, увайдзіце ў кабінет і захавайце адрас — тады ён падставіцца ў кошык сам. Калі адрас не трапляе ні ў адну зону, кошт называецца асобна пасля вашага заказу.</p>

<h3>2. Зоны і кошт</h3>
<p><strong style="color:#b45309">ЗАПОЎНІЦЬ: пералічыце зоны і кошт дастаўкі ў кожную.</strong> Зручна табліцай — назва зоны, што ў яе ўваходзіць, кошт.</p>
<p>Пры суме заказу вышэй за пэўны парог дастаўка можа быць бясплатнай — калі такі парог у вас ёсць, ён паказваецца ў кошыку аўтаматычна.</p>

<h3>3. Тэрміны</h3>
<p><strong style="color:#b45309">ЗАПОЎНІЦЬ: за колькі дзён (ці гадзін) вы дастаўляеце, у якія дні тыдня, ці ёсць інтэрвалы часу і тэрміновая дастаўка.</strong> Калі тавар рыхтуецца пад заказ, напішыце тэрмін вырабу асобна ад тэрміну дастаўкі — гэта самае частае непаразуменне.</p>
<p>Пра затрымку паведамляем адразу, як даведаемся.</p>

<h3>4. Аплата</h3>
<p>Аплата — банкаўскім пераказам па рахунку. Пасля пацвярджэння заказу вы атрымліваеце ліст з рэквізітамі, сумай і <strong>тэрмінам аплаты</strong>.</p>
<p>⚠️ Калі аплата не прыходзіць да названага тэрміну, заказ адмяняецца аўтаматычна. Гэта не штраф — проста мы не трымаем тавар бясконца. Заказаць нанова можна ў любы момант.</p>
<p><strong style="color:#b45309">ЗАПОЎНІЦЬ, калі ў вас ёсць іншыя спосабы:</strong> наяўнымі пры атрыманні, картай кур'еру, аплата па факце. Пазначце таксама, калі берацца перадаплата і колькі.</p>

<h3>5. Валюта і падаткі</h3>
<p>Цэны паказаны ў валюце сайта. <strong style="color:#b45309">ЗАПОЎНІЦЬ: ці ўключаны падатак у цану</strong> — гэта пытанне, якое пакупнікі задаюць часцей за ўсё.</p>

<h3>6. Пры атрыманні</h3>
<p>Праверце заказ пры атрыманні. Калі нешта пашкоджана ці не тое — не прымайце моўчкі: сфатаграфуйце і адразу напішыце нам на <a href="mailto:{{email}}">{{email}}</a> ці патэлефануйце {{phone}}. Так пытанне вырашаецца хутчэй за ўсё.</p>

<h3>7. Калі дастаўка не адбылася</h3>
<p><strong style="color:#b45309">ЗАПОЎНІЦЬ:</strong> што адбываецца, калі па адрасе нікога няма ці тэлефон не адказвае — паўторны выезд, яго кошт, колькі захоўваецца заказ.</p>

<h3>8. Пытанні</h3>
<p><strong>{{company}}</strong>, {{address}} · <a href="mailto:{{email}}">{{email}}</a> · {{phone}}</p>

<p style="color:#666"><em>{{orgsign}}</em></p>
`,

    en: `
<p style="background:#fff8e1;border-left:4px solid #f5a623;padding:10px 12px"><strong>⚠️ THIS IS A STARTING DRAFT — READ IT AND CHECK IT.</strong> What follows describes what the system can do. It does not know your zones, prices or lead times — the paragraphs marked <strong style="color:#b45309">TO COMPLETE</strong> must be written by you. Remove this block once reviewed.</p>

<h2>Delivery and payment</h2>

<h3>1. How you can receive an order</h3>
<p>Delivery to your address, and <strong style="color:#b45309">TO COMPLETE: collection in person — whether you offer it, from where and at what hours</strong>.</p>
<p>The delivery charge is calculated from the <strong>zone</strong> your address falls into. To see the charge, sign in and save your address — it is then applied in the cart automatically. If an address falls outside every zone, we quote the charge separately after you order.</p>

<h3>2. Zones and charges</h3>
<p><strong style="color:#b45309">TO COMPLETE: list your zones and the charge for each.</strong> A small table works best — zone name, what it covers, charge.</p>
<p>Above a certain order value delivery may be free — if you have such a threshold, the cart applies it automatically.</p>

<h3>3. Lead times</h3>
<p><strong style="color:#b45309">TO COMPLETE: how many days (or hours) delivery takes, on which weekdays, whether you offer time slots or express delivery.</strong> If goods are made to order, state the making time separately from the delivery time — this is the most common misunderstanding.</p>
<p>We tell you about any delay as soon as we know.</p>

<h3>4. Payment</h3>
<p>Payment is by bank transfer against an invoice. Once your order is confirmed you receive an email with the bank details, the amount and a <strong>payment deadline</strong>.</p>
<p>⚠️ If payment does not arrive by that date, the order is cancelled automatically. This is not a penalty — we simply cannot hold stock indefinitely. You are welcome to order again at any time.</p>
<p><strong style="color:#b45309">TO COMPLETE if you accept other methods:</strong> cash on delivery, card to the courier, payment after the work. Also state whether you take a deposit and how much.</p>

<h3>5. Currency and tax</h3>
<p>Prices are shown in the site currency. <strong style="color:#b45309">TO COMPLETE: whether tax is included in the price</strong> — this is the question buyers ask most often.</p>

<h3>6. On receipt</h3>
<p>Please check your order on receipt. If something is damaged or wrong, do not accept it in silence: photograph it and write to us straight away at <a href="mailto:{{email}}">{{email}}</a> or call {{phone}}. That is by far the quickest route to a fix.</p>

<h3>7. If delivery fails</h3>
<p><strong style="color:#b45309">TO COMPLETE:</strong> what happens if nobody is at the address or the phone is not answered — a repeat attempt, its cost, and how long an order is held.</p>

<h3>8. Questions</h3>
<p><strong>{{company}}</strong>, {{address}} · <a href="mailto:{{email}}">{{email}}</a> · {{phone}}</p>

<p style="color:#666"><em>{{orgsign}}</em></p>
`,

  },

};
