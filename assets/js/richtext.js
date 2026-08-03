// ── АДЗІНЫ РЭДАКТАР ТЭКСТУ (Quill) — агульны кампанент, як reader.js / slots-modal.js / relax-games.js ──
// Куткі: панэль (`nodeInitRichtext`: цела версіі дакумента, апісанне пазіцыі Каталога, цела паста
// Навін/Блога) і Чарнавік на самім сайце (мадалка `_edModalOpen` у main.js: Тэкст-секцыі, Навіны).
// ⚠️ ЧАМУ ВЫНЕСЕНА: да гэтага сайт мантаваў СВОЙ Quill са сваім спісам кнопак, і набор ужо
// разышоўся — у панэлі былі выраўноўванне, водступы і табліцы, у Чарнавіку не было нічога з гэтага,
// а гісторыя ⟲⟳, буфер 📋 і Tab-водступ жылі толькі ў панэлі. Кожная новая кнопка рэдактара
// патрабавала праўкі ў двух месцах — роўна тая пастка, праз якую ⛶ аказалася мёртвай у Каталогу.
// Цяпер куток дае толькі КАНФІГ (профіль панэлі кнопак + ці ёсць коды палёў), а не свой код.
//
// Хост абвяшчае сэрвісы ў `TTZOP_RT_HOST` (як `TTZOP_GAMES_HOST` у гульнях):
//   t(key)          — надпіс (панэль: t(); сайт: getUI())
//   esc(s)          — экранаванне HTML
//   alert(msg)      — мадальнае паведамленне кутка (сістэмны alert() у праекце забаронены)
//   toast(msg)      — нецяжкае «зроблена» (можа быць той жа alert)
// Іконкі бяром з АГУЛЬНАГА набору `menu-icons.js` — свайго SVG кампанент не заводзіць.
window.TTZOP_RT_HOST = window.TTZOP_RT_HOST || {};

(function () {
  const H = () => window.TTZOP_RT_HOST || {};
  const t = k => (typeof H().t === 'function' ? H().t(k) : k);
  const esc = s => (typeof H().esc === 'function' ? H().esc(s)
    : String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'));
  const ico = (id, sz) => (window.TTZOP_mIco ? window.TTZOP_mIco(id, { cls: 'mi mi-' + id, size: sz || 16 }) : '');
  const say = m => (typeof H().alert === 'function' ? H().alert(m) : console.warn('[ttzop-rt]', m));
  const toast = m => (typeof H().toast === 'function' ? H().toast(m) : say(m));

  // ═══ ПАНЭЛІ КНОПАК — КОД-КАТАЛОГ ПРОФІЛЯЎ ═══
  // Профіль = які набор Quill малюе сам. Куток выбірае профіль, а не піша свой масіў.
  // `full` — паўны набор (панэль І Чарнавік на сайце): для юрдакумента водступ і выраўноўванне не
  // аздабленне, а сэнс, і кліент мае мець тое ж на сайце.
  // ⚠️ Выраўноўванне і водступ Quill — гэта КЛАСЫ `ql-align-*`/`ql-indent-*`, а `quill.snow.css`
  // грузіцца толькі ў edit-рэжыме. Таму `full` на сайце дазволены ТОЛЬКІ разам з правіламі гэтых
  // класаў у `assets/css/style.css` (дададзены v4.971) — інакш уладальнік бачыў бы выраўноўванне ў
  // рэдактары, а наведвальнік не. `basic` застаецца ў каталозе для кутка без такіх правіл.
  const TOOLBAR = {
    basic: [[{ header: [1, 2, 3, false] }], ['bold', 'italic', 'underline'], [{ list: 'ordered' }, { list: 'bullet' }], ['link'], ['clean']],
    full: [[{ header: [1, 2, 3, false] }], ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }], [{ indent: '-1' }, { indent: '+1' }],
      [{ align: '' }, { align: 'center' }, { align: 'right' }, { align: 'justify' }], ['link'], ['clean']]
  };

  // ⇥ ТАБУЛЯЦЫЯ, ЯКАЯ ПЕРАЖЫВАЕ ЗАХАВАННЕ.
  // 🐛 Знойдзена карыстальнікам: Tab на пачатку абзаца пасля перазагрузкі ЗНІКАЎ. Прычына не ў
  // захаванні — на сервер ішло правільнае `<p>\tТэкст</p>`; Quill выразае прабельныя сімвалы ў
  // пачатку блока пры ЗАГРУЗЦЫ HTML. Таму штатны Tab тут не падыходзіць, хоць і выглядаў рабочым.
  // Рашэнне: чатыры НЕРАЗДЗЯЛЯЛЬНЫЯ прабелы — яны загрузку перажываюць і зразумелыя Word.
  const TAB = '    ';
  function tabKeys(q) {
    const handler = (back) => () => {
      const sel = q.getSelection(true);
      if (!sel) return true;
      if (q.getFormat().list) return true;              // у спісе Tab робіць укладзены ўзровень — не чапаем
      if (back) {
        const from = Math.max(0, sel.index - TAB.length);
        const before = q.getText(from, sel.index - from);
        const cut = before.length - before.replace(/ +$/, '').length;
        if (cut) q.deleteText(sel.index - cut, cut, 'user');
      } else {
        q.insertText(sel.index, TAB, 'user');
        // ⚠️ Quill НЕ перасоўвае курсор за ўстаўлены тэкст сам — без гэтага ён «завісаў» пасярод
        // водступу і наступная літара трапляла ў сярэдзіну (заўвага карыстальніка 29.07)
        q.setSelection(sel.index + TAB.length, 0, 'user');
      }
      return false;
    };
    // ⚠️ Quill 2 дыспетчарызуе па НАЗВЕ клавішы і правярае свае прывязкі ПЕРШЫМІ — свае трэба
    // перасунуць у пачатак чаргі, інакш штатны апрацоўшчык уставіць сімвал табуляцыі раней за нас.
    q.keyboard.addBinding({ key: 'Tab' }, handler(false));
    q.keyboard.addBinding({ key: 'Tab', shiftKey: true }, handler(true));
    const arr = q.keyboard.bindings['Tab'];
    if (arr && arr.length >= 2) arr.unshift(...arr.splice(-2, 2));
  }

  // ↶↷ Адкат/паўтор. Гісторыя ў Quill ёсць з каробкі (Ctrl+Z), але кнопак не было — а іх шукаюць
  // вачамі, асабліва пасля ўстаўкі вялікага кавалка з Word.
  function historyButtons(host, q) {
    const bar = host.querySelector('.ql-toolbar');
    if (!bar || bar.querySelector('.rt-history')) return;
    const wrap = document.createElement('span');
    wrap.className = 'ql-formats rt-history';
    wrap.innerHTML = `<button type="button" class="rt-undo" title="${esc(t('rt_undo'))}">↶</button>
      <button type="button" class="rt-redo" title="${esc(t('rt_redo'))}">↷</button>`;
    bar.insertBefore(wrap, bar.firstChild);   // злева, як прынята ва ўсіх рэдактарах
    wrap.querySelector('.rt-undo').onclick = e => { e.preventDefault(); q.history.undo(); };
    wrap.querySelector('.rt-redo').onclick = e => { e.preventDefault(); q.history.redo(); };
  }

  // 📋 Капіраваць увесь тэкст / уставіць з буфера — асноўны шлях абмену з юрыстам (Word).
  // ⚠️ ЧЫТАЦЬ буфер кнопкай дазваляе не кожны браўзер (Firefox блакуе зусім, Chrome пытае дазвол),
  // таму пры адмове не маўчым, а кажам спалучэнне клавіш — і менавіта таго, што ў чалавека:
  // на macOS гэта ⌘V, не Ctrl+V (заўвага карыстальніка 29.07).
  const isMac = () => /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent || '');
  const pasteKey = () => (isMac() ? '⌘V' : 'Ctrl+V');
  function clipButtons(host, q) {
    const bar = host.querySelector('.ql-toolbar');
    if (!bar || bar.querySelector('.rt-clip')) return;
    const wrap = document.createElement('span');
    wrap.className = 'ql-formats rt-clip';
    wrap.innerHTML = `<button type="button" class="rt-copy" title="${esc(t('rt_copy'))}">${ico('copy', 15)}</button>
      <button type="button" class="rt-paste" title="${esc(t('rt_paste'))}">${ico('paste', 15)}</button>`;
    bar.appendChild(wrap);
    wrap.querySelector('.rt-copy').onclick = async e => {
      e.preventDefault();
      const html = q.root.innerHTML, text = q.getText();
      try { // HTML+тэкст разам: у Word пераедзе афармленне, у просты рэдактар — чысты тэкст
        await navigator.clipboard.write([new ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([text], { type: 'text/plain' }) })]);
      } catch { try { await navigator.clipboard.writeText(text); } catch { say(t('rt_clip_fail')); return; } }
      toast(t('rt_copied'));
    };
    wrap.querySelector('.rt-paste').onclick = async e => {
      e.preventDefault();
      q.focus();
      const at = (q.getSelection(true) || {}).index ?? q.getLength();
      try {
        let html = '', text = '';
        if (navigator.clipboard.read) {
          for (const item of await navigator.clipboard.read()) {
            if (item.types.includes('text/html')) html = await (await item.getType('text/html')).text();
            else if (item.types.includes('text/plain')) text = await (await item.getType('text/plain')).text();
          }
        } else text = await navigator.clipboard.readText();
        if (!html && !text) { say(t('rt_paste_hint').replace('{k}', pasteKey())); return; }
        q.history.cutoff();
        if (html) q.clipboard.dangerouslyPasteHTML(at, html, 'user'); else q.insertText(at, text, 'user');
        q.history.cutoff();
      } catch { say(t('rt_paste_hint').replace('{k}', pasteKey())); }
    };
  }

  // ═══ ▾ ДАДАТКОВЫЯ ФУНКЦЫІ РЭДАКТАРА ═══
  // Тое, што не паказваем у радку (каб не захламляць), але што часам патрэбна. Код-каталог:
  // новая функцыя = АДЗІН радок; подпіс адсюль жа ідзе і ў спіс, і ў падказку.
  // `on(q)` — што рабіць па кліку; `is(q)` — ці ўключана зараз (каб паказаць птушку).
  const toggle = (q, fmt) => q.format(fmt, !q.getFormat()[fmt], 'user');
  const script = (q, kind) => q.format('script', q.getFormat().script === kind ? false : kind, 'user');
  const EXTRA = [
    { id: 'blockquote', label: 'rt_blockquote', on: q => toggle(q, 'blockquote'), is: q => !!q.getFormat().blockquote },
    { id: 'strike',     label: 'rt_strike',     on: q => toggle(q, 'strike'),     is: q => !!q.getFormat().strike },
    { id: 'super',      label: 'rt_super',      on: q => script(q, 'super'),      is: q => q.getFormat().script === 'super' },
    { id: 'sub',        label: 'rt_sub',        on: q => script(q, 'sub'),        is: q => q.getFormat().script === 'sub' },
    { id: 'hr',         label: 'rt_hr',         on: q => hr(q) },
    // 📊 табліца: уставіць 2×2 і нарасціць па меры патрэбы (радкі/слупкі — ад бягучай ячэйкі)
    { id: 'table',      label: 'rt_table',      on: q => table(q, 'insert') },
    { id: 'trow',       label: 'rt_table_row',  on: q => table(q, 'row') },
    { id: 'tcol',       label: 'rt_table_col',  on: q => table(q, 'col') }
  ];
  // Дзеянні над табліцай ідуць праз убудаваны модуль. Курсор мусіць стаяць У ЯЧЭЙЦЫ — інакш
  // модуль моўчкі нічога не робіць, і чалавек думае, што кнопка зламаная.
  function table(q, what) {
    const tb = q.getModule('table');
    if (!tb) return;
    if (what === 'insert') { q.focus(); tb.insertTable(2, 2); return; }
    const inCell = !!q.getLine((q.getSelection(true) || {}).index ?? 0)[0]?.domNode?.closest?.('td');
    if (!inCell) { say(t('rt_table_need_cell')); return; }
    if (what === 'row') tb.insertRowBelow(); else tb.insertColumnRight();
  }
  // ⚠️ Гарызантальнай лініі ў Quill НЯМА: невядомыя тэгі ён моўчкі выкідвае, і простая ўстаўка
  // '<hr>' нічога не давала. Рэгіструем уласны блок — адзін раз на старонку, ленава.
  // `cutoff` з двух бакоў, каб ↶ вяртала менавіта гэты крок, а не зліла з суседнімі праўкамі.
  let hrReady = false;
  function hrRegister() {
    if (hrReady) return;
    try {
      const BlockEmbed = Quill.import('blots/block/embed');
      class HrBlot extends BlockEmbed {}
      HrBlot.blotName = 'hr'; HrBlot.tagName = 'hr';
      Quill.register(HrBlot);
      hrReady = true;
    } catch (e) { console.error('hr blot', e && e.message); }
  }
  function hr(q) {
    hrRegister();
    const at = (q.getSelection(true) || {}).index ?? q.getLength();
    q.history.cutoff();
    q.insertEmbed(at, 'hr', true, 'user');
    q.setSelection(at + 1, 0);
    q.history.cutoff();
  }
  // ▾ Кнопка: выпадае спіс дадатковых функцый, клік па радку АДРАЗУ ўжывае яе да вылучанага тэксту.
  function extraButton(host, q) {
    const bar = host.querySelector('.ql-toolbar');
    if (!bar || bar.querySelector('.rt-extra')) return;
    const wrap = document.createElement('span');
    wrap.className = 'ql-formats rt-extra';
    wrap.style.cssText = 'position:relative';
    wrap.innerHTML = `<button type="button" title="${esc(t('rt_more'))}">▾</button>
      <div class="rt-extra-menu rt-menu" style="display:none;right:0"></div>`;
    bar.appendChild(wrap);
    const menu = wrap.querySelector('.rt-extra-menu');
    const draw = () => {
      menu.innerHTML = EXTRA.map(x => {
        const on = x.is ? x.is(q) : false;
        return `<div class="rt-extra-item rt-menu-item${on ? ' rt-on' : ''}" data-id="${x.id}">
          <span style="display:inline-block;width:14px">${on ? '✓' : ''}</span>${esc(t(x.label))}</div>`;
      }).join('');
      menu.querySelectorAll('.rt-extra-item').forEach(el => { el.onclick = () => {
        const item = EXTRA.find(x => x.id === el.dataset.id);
        if (item) { q.focus(); item.on(q); }          // фокус вяртаем у тэкст, інакш фармат няма да чаго ўжыць
        draw();
      }; });
    };
    wrap.querySelector('button').onclick = e => {
      e.preventDefault();
      const on = menu.style.display === 'none';
      if (on) draw();
      menu.style.display = on ? 'block' : 'none';
    };
    document.addEventListener('click', e => { if (!wrap.contains(e.target)) menu.style.display = 'none'; });
  }

  // ═══ КОДЫ ПАЛЁЎ {{id}} ═══ (уключаюцца канфігам `codes` — гэта ўласцівасць ДАКУМЕНТА, не рэдактара)
  // 🔁 Падстаноўка значэннямі. Пустое значэнне НЕ выкідваем моўчкі, а падсвечваем: інакш у
  // дакуменце будзе дзірка, якую вокам не заўважыш (напр. падатковы нумар яшчэ не запоўнены).
  function substitute(html, codes) {
    let out = String(html || '');
    (codes || []).forEach(c => {
      const val = String(c.value ?? '').trim();
      const rep = val
        ? esc(val)
        : `<span style="background:var(--error,#dc2626);color:#fff;padding:0 4px;border-radius:3px" title="${esc(t('codes_empty'))}">${esc(c.code)}</span>`;
      out = out.split(c.code).join(rep);
    });
    return out;
  }
  // 🔍 ЗВЕРКА КОДАЎ. Пасля вяртання тэксту з чужога рэдактара (Word → капіпаст) код можа моўчкі
  // сапсавацца: юрыст надрукаваў `{{compny}}`, падмяніў лацінскую `c` на кірылічную, разарваў
  // дужкі. Дакумент выглядае цэлым, а поле проста перастае падстаўляцца.
  // `known` — усе дазволеныя коды; `expected` — тыя, што ў тэксце АЧАКВАЮЦЦА (уласныя палі).
  function check(html, known, expected) {
    const txt = String(html || '');
    const ok = new Set(known);
    const found = new Map();                                    // {{code}} → колькі разоў
    (txt.match(/\{\{[^{}]{0,40}\}\}/g) || []).forEach(c => found.set(c, (found.get(c) || 0) + 1));
    const unknown = [...found.keys()].filter(c => !ok.has(c));  // няма ў каталозе — памылка ці чужая мова
    // пабітыя: адна дужка, прабел усярэдзіне, разарваны — тое, што ўжо НЕ будзе падстаўлена
    const broken = (txt.match(/\{\s*\{[^{}]{0,40}\}(?!\})|(?<!\{)\{[^{}]{0,40}\}\s*\}/g) || [])
      .filter(x => !found.has(x));
    const unused = (expected || []).filter(c => !found.has(c));  // наўмысна дададзенае поле знікла
    return { found, unknown, broken: [...new Set(broken)], unused, bad: unknown.length + broken.length };
  }
  // 🔧 АЎТАВЫПРАЎЛЕННЕ. Правім толькі тое, дзе намер адназначны: з `{ {company} }` ці `{company}}`
  // дастаём унутраны id — і калі ТАКІ код ёсць у каталозе, перазбіраем у правільны. Невядомы id не
  // чапаем: маўклівая «паправка» чужога тэксту горш за бачную памылку. → [новыHTML, колькі].
  function repair(html, known) {
    let out = String(html || ''), n = 0;
    const ids = new Set(known.map(c => c.replace(/[{}]/g, '').trim()));
    out = out.replace(/\{\s*\{?\s*([A-Za-z0-9_]{1,40})\s*\}?\s*\}/g, (m, id) => {
      if (m === '{{' + id + '}}') return m;                 // ужо правільны — не чапаем
      if (!ids.has(id)) return m;                           // невядомы id — гэта не наша справа
      n++; return '{{' + id + '}}';
    });
    return [out, n];
  }
  function codesButton(host, q, getCodes) {
    const bar = host.querySelector('.ql-toolbar');
    if (!bar || bar.querySelector('.rt-codes')) return;
    const wrap = document.createElement('span');
    wrap.className = 'ql-formats rt-codes';
    wrap.style.cssText = 'position:relative';
    wrap.innerHTML = `<button type="button" title="${esc(t('docf_insert'))}">{ }</button>
      <div class="rt-codes-menu rt-menu" style="display:none;left:0;min-width:260px;max-height:280px;overflow:auto"></div>`;
    bar.appendChild(wrap);
    const menu = wrap.querySelector('.rt-codes-menu');
    wrap.querySelector('button').onclick = e => {
      e.preventDefault();
      if (menu.style.display === 'block') { menu.style.display = 'none'; return; }
      const list = getCodes() || [];
      menu.innerHTML = list.length ? list.map(c =>
        `<div class="rt-code-item rt-menu-item" data-code="${esc(c.code)}">
           <span style="color:var(--accent,#f97316);font-weight:700">${esc(c.code)}</span>
           <span style="margin-left:6px">${esc(c.label)}</span>
           <div class="rt-code-val">${esc(c.value || '—')}</div>
         </div>`).join('') : `<div class="rt-menu-item">${esc(t('docf_no_codes'))}</div>`;
      menu.style.display = 'block';
      menu.querySelectorAll('.rt-code-item').forEach(el => { el.onclick = () => {
        const at = (q.getSelection(true) || {}).index ?? q.getLength();
        q.insertText(at, el.dataset.code, 'user');
        q.setSelection(at + el.dataset.code.length, 0);
        menu.style.display = 'none';
      }; });
    };
    document.addEventListener('click', e => { if (!wrap.contains(e.target)) menu.style.display = 'none'; });
  }
  // 👁 Пераключальнік «коды ↔ значэнні». Прагляд ЗАЎСЁДЫ толькі для чытання: калі даць правіць
  // падстаўлены тэкст, чалавек адрэдагуе значэнні, і мы запішам іх намёртва замест кодаў —
  // дакумент моўчкі страціць сувязь з наладамі (рашэнне карыстальніка 29.07).
  // ⚠️ Прагляд нясе класы ql-container/ql-editor: інакш у яго свая тыпаграфіка, і пры пераключэнні
  // тэкст скакаў — мяняліся памер, водступы і вышыня радка (заўвага карыстальніка 29.07).
  function previewButton(host, q, getCodes) {
    const bar = host.querySelector('.ql-toolbar');
    const ed = host.querySelector('.node-rt-editor');   // менавіта рэдактар: прагляд таксама .ql-container
    const pv = host.querySelector('.node-rt-preview');
    if (!bar || !ed || !pv || bar.querySelector('.rt-preview')) return;
    const wrap = document.createElement('span');
    wrap.className = 'ql-formats rt-preview';
    wrap.innerHTML = `<button type="button" title="${esc(t('codes_preview'))}">${ico('eye', 15)}</button>`;
    bar.appendChild(wrap);
    const btn = wrap.querySelector('button');
    btn.onclick = e => {
      e.preventDefault();
      const on = pv.style.display === 'none';
      if (on) pv.querySelector('.ql-editor').innerHTML = substitute(q.root.innerHTML, getCodes());
      pv.style.display = on ? 'block' : 'none';
      ed.style.display = on ? 'none' : '';
      btn.classList.toggle('ql-active', on);
      host.querySelectorAll('.rt-codes button').forEach(b => { b.disabled = on; b.style.opacity = on ? '.4' : ''; });
    };
  }

  // ═══ ⛶ ВЯЛІКАЕ АКНО ═══
  // ААП: мадалка НЕ будуе другі рэдактар — яна ПЕРАНОСІЦЬ у сябе той самы вузел-хост цалкам, разам
  // з панэллю, кнопкамі, гісторыяй і незахаваным тэкстам. Копія непазбежна разышлася б з
  // арыгіналам. Пры закрыцці вузел вяртаецца на сваё месца-памятку.
  // Кнопка ў загалоўку хоста — ПЕРАКЛЮЧАЛЬНІК: у мадалцы гэта той самы вузел, значыць тая самая
  // кнопка, толькі люстэркавая іконка (стрэлкі ў цэнтр) і тое ж дзеянне, што «Закрыць».
  function fullBtnHtml() { return `<button class="node-rt-full" title="${esc(t('rt_full'))}">${ico('expand', 18)}</button>`; }
  // 🏷 ЗАГАЛОВАК РЭДАКТАРА — адзін на ўсе куткі: злева назва (калі ёсць), справа ⛶ і кнопкі дзеяння.
  // ⚠️ Раней панэль малявала свой радок (назва + ⛶ + 💾 зверху), а Чарнавік — ⛶ зверху і
  // Адмяніць/Захаваць у падвале іншым дызайнам: тыя ж дзеянні выглядалі і стаялі па-рознаму
  // (заўвага карыстальніка 30.07). Куток дае толькі СПІС кнопак, выгляд і месца — тут.
  // cfg: { label?, buttons: [{ id, label, primary?, cls? }] } → кнопка шукаецца як [data-rt-btn="id"].
  function headHtml(cfg) {
    cfg = cfg || {};
    const btns = (cfg.buttons || []).map(b =>
      `<button type="button" data-rt-btn="${esc(b.id)}" class="rt-btn${b.primary ? ' rt-btn-primary' : ''}${b.cls ? ' ' + b.cls : ''}">${esc(b.label)}</button>`).join('');
    return `<div class="rt-head">
      ${cfg.label ? `<label class="rt-head-lbl">${esc(cfg.label)}</label>` : '<span></span>'}
      <span class="rt-head-btns">${fullBtnHtml()}${btns}</span>
    </div>`;
  }
  function fullIcon(host, on) { // адзінае месца, дзе кнопка мяняе выгляд
    const b = host.querySelector('.node-rt-full'); if (!b) return;
    b.innerHTML = ico(on ? 'collapse' : 'expand', 18);
    b.title = t(on ? 'rt_full_off' : 'rt_full');
  }
  function fullClose() { document.getElementById('rt-full')?._rtClose?.(); }
  function fullToggle(host) {
    if (host.classList.contains('rt-in-full')) fullClose();
    else fullOpen(host);
  }
  function fullOpen(host) {
    ensureStyle();
    const anchor = document.createElement('div');            // памятка, куды вярнуць
    host.parentNode.insertBefore(anchor, host);
    const ov = document.createElement('div');
    ov.id = 'rt-full';
    // ⚠️ ААП: оверлэй НЕ малюе сваіх кнопак. Разгорнуты вузел прыязджае са ЎСІМІ сваімі кантролямі
    // (⛶ згарнуць · 💾 Захаваць · Адмяніць/Закрыць кутка) — свая ✕ была б чацвёртай кнопкай з тым
    // самым сэнсам, што ⛶, і рознымі паводзінамі ў двух кутках.
    ov.innerHTML = '<div id="rt-full-body"></div>';
    document.body.appendChild(ov);
    ov.querySelector('#rt-full-body').appendChild(host);     // ← той самы вузел, не копія
    host.classList.add('rt-in-full');
    fullIcon(host, true);
    const close = () => {
      host.classList.remove('rt-in-full');
      fullIcon(host, false);
      anchor.parentNode.insertBefore(host, anchor);          // вяртаем на месца
      anchor.remove(); ov.remove();
      document.removeEventListener('keydown', onEsc);
    };
    // ⚠️ Escape над іншай мадалкай (напр. «Падзяліцца») не мусіць зачыняць акно пад ёй
    const onEsc = e => { if (e.key === 'Escape' && !document.getElementById('share-modal')) close(); };
    ov._rtClose = close; // каб перарэндэр дрэва мог вярнуць вузел на месца ДА замены innerHTML
    document.addEventListener('keydown', onEsc);
  }

  // ═══ СТЫЛІ ═══ (адзін раз, як `_dndEnsureStyle`: кнопкі і меню жывуць у кампаненце, а не ў CSS
  // кожнага кутка — інакш на сайце рэдактар выглядаў бы інакш, чым у панэлі).
  // Колеры — праз CSS-var гаспадара з фолбэкам на var сайта: `--surface`/`--border`/`--muted` у
  // панэлі, `--card-bg`/`--border-color`/`--text-muted` у Чарнавіку.
  let styled = false;
  function ensureStyle() {
    if (styled || document.getElementById('rt-style')) { styled = true; return; }
    styled = true;
    const el = document.createElement('style');
    el.id = 'rt-style';
    el.textContent = `
    .ql-toolbar .rt-history button { width: auto !important; padding: 0 5px !important; font-size: 1rem; color: var(--muted, var(--text-muted, #888)) !important; }
    .ql-toolbar .rt-history button:hover { color: var(--accent, #f97316) !important; }
    .ql-toolbar .rt-codes button { width: auto !important; padding: 0 6px !important; font-size: 0.86rem; font-weight: 700; color: var(--muted, var(--text-muted, #888)) !important; }
    .ql-toolbar .rt-codes button:hover, .ql-toolbar .rt-extra button:hover { color: var(--accent, #f97316) !important; }
    .ql-toolbar .rt-extra button { width: auto !important; padding: 0 6px !important; color: var(--muted, var(--text-muted, #888)) !important; }
    .ql-toolbar .rt-clip button, .ql-toolbar .rt-preview button { width: auto !important; padding: 0 5px !important; color: var(--muted, var(--text-muted, #888)) !important; }
    .ql-toolbar .rt-clip button svg, .ql-toolbar .rt-preview button svg { color: var(--muted, var(--text-muted, #888)); }
    /* 👁 прагляд: у спакоі — як усе іконкі радка; УКЛЮЧАНЫ рэжым — акцэнтам, каб адразу было відаць,
       што глядзіш падстаўлены тэкст, а не правіш зыходны (заўвага карыстальніка 29.07) */
    .ql-toolbar .rt-clip button:hover svg, .ql-toolbar .rt-preview button:hover svg,
    .ql-toolbar .rt-preview button.ql-active svg { color: var(--accent, #f97316); }
    .rt-menu { position: absolute; top: 100%; z-index: 60; min-width: 230px; font-size: 0.84rem;
      background: var(--surface, var(--card-bg, #fff)); border: 1px solid var(--border, var(--border-color, rgba(0,0,0,.18)));
      border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,.4); }
    .rt-menu-item { padding: 8px 10px; cursor: pointer; border-bottom: 1px solid var(--border, var(--border-color, rgba(0,0,0,.12)));
      color: var(--text, var(--text-main, #111)); }
    .rt-menu-item:hover { background: var(--surface2, rgba(127,127,127,.12)); }
    .rt-menu-item.rt-on { color: var(--accent, #f97316); }
    .rt-code-val { color: var(--muted, var(--text-muted, #888)); font-size: 0.75rem; margin-top: 2px; }
    /* адзін радок загалоўка на панэль і Чарнавік: назва злева, ⛶ і дзеянні справа */
    .rt-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 0 0 4px; }
    .rt-head-lbl { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;
      color: var(--label, var(--text-muted, #888)); }
    .rt-head-btns { display: flex; align-items: center; gap: 8px; }
    .rt-btn { padding: 5px 16px; border-radius: 8px; border: 1px solid var(--border, var(--border-color, #8884));
      background: transparent; color: inherit; opacity: .82; cursor: pointer; font: inherit; font-size: 0.78rem;
      font-weight: 600; line-height: 1.5; }
    .rt-btn:hover { opacity: 1; background: var(--surface2, rgba(128,128,128,.15)); }
    .rt-btn-primary { background: var(--accent, #f97316); border-color: var(--accent, #f97316); color: #fff; opacity: 1; }
    .rt-btn-primary:hover { background: var(--accent, #f97316); opacity: .92; }
    .rt-btn:disabled { opacity: .45; cursor: not-allowed; }
    /* ⛶ кнопка — квадратная з рамкай: сімвалам «⛶» яна была бляклая і губалася побач з «Захаваць»
       (заўвага карыстальніка 30.07). Стан відаць па іконцы expand ↔ collapse. */
    .node-rt-full { display: flex; align-items: center; justify-content: center; width: 28px; height: 26px;
      background: none; border: 1px solid var(--border, var(--border-color, rgba(0,0,0,.18))); border-radius: 6px;
      color: var(--muted, var(--text-muted, #888)); cursor: pointer; padding: 0; }
    .node-rt-full:hover, .rt-in-full .node-rt-full { color: var(--accent, #f97316); border-color: var(--accent, #f97316); }
    /* z-index вышэй за мадалкі кутка: у Чарнавіку вялікае акно раскрывае САМУ мадалку рэдактара,
       і яе фон-оверлэй (z-index 10001) інакш накрыў бы яе ж зверху */
    #rt-full { position: fixed; inset: 0; z-index: 10050; display: flex; flex-direction: column;
      padding: 14px 16px 16px; background: var(--bg, rgba(0,0,0,.82)); }
    #rt-full-body { flex: 1; min-height: 0; display: flex; flex-direction: column; overflow: auto; }
    /* у вялікім акне рэдактар займае ўсю вышыню — інакш застаўся б ростам як у дрэве */
    /* разгорнуты аб'ект займае ўсё акно — і хост-поле ў панэлі, і цэлая мадалка рэдактара ў Чарнавіку
       (у яе ў звычайным стане width: min(680px,96vw) і max-height: 88vh) */
    .rt-in-full { flex: 1; min-height: 0; width: 100%; max-width: none; max-height: none; }
    .rt-in-full .ql-container, .rt-in-full .node-rt-preview { flex: 1; min-height: 0; display: flex; flex-direction: column; }
    .rt-in-full .ql-editor { flex: 1; overflow-y: auto; }`;
    document.head.appendChild(el);
  }

  // ═══ ПУБЛІЧНЫ КАНТРАКТ ═══
  // create(el, opts) — Quill з кананічным канфігам. opts.profile: 'full' (дэфолт) | 'basic'.
  // decorate(host, q, opts) — агульныя кнопкі радка; opts.codes = () => [{code,label,value}]
  //   уключае { } і 👁 (толькі там, дзе куток сапраўды мае палі дакумента).
  window.TTZOP_RICHTEXT = {
    TOOLBAR, TAB, EXTRA,
    ensureStyle,
    create(el, opts) {
      opts = opts || {};
      ensureStyle();
      // 📊 `table: true` — убудаваны модуль Quill (ужо ў зборцы, проста не быў уключаны). Табліца —
      // стандартны <table>, таму ў абодва бакі перажывае абмен з Word, у адрозненне ад уласных
      // класаў. Аб'яднанне ячэек убудаваны модуль не ўмее (патрэбна асобная бібліятэка), але
      // тыповы юрыдычны выпадак (тэрміны, спіс суб-працэсараў) закрываецца і так.
      return new Quill(el, { theme: 'snow', modules: { table: true, toolbar: TOOLBAR[opts.profile] || TOOLBAR.full } });
    },
    decorate(host, q, opts) {
      opts = opts || {};
      ensureStyle();
      historyButtons(host, q);
      extraButton(host, q);
      clipButtons(host, q);
      tabKeys(q);
      if (typeof opts.codes === 'function') { codesButton(host, q, opts.codes); previewButton(host, q, opts.codes); }
      return q;
    },
    fullBtnHtml, headHtml, fullToggle, fullIcon, fullClose,
    codes: { substitute, check, repair }
  };
})();
