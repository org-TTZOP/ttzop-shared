// ═══ 📅 УНІВЕРСАЛЬНАЯ МАДАЛКА ВОЛЬНЫХ СЛОТАЎ — АДЗІН кампанент на ЎСЕ куткі ═══
// Спажыўцы: сайт (index.html → main.js: новая бронь) і кабінет (portal.html: перанос запісу).
// Самадастатковы, як reader.js: каллер перадае i18n (`labels`), пацверджанне (`confirm`) і хукі;
// колеры — з CSS-зменных старонкі (--surface/--border/--text/--accent/--muted ёсць у абодвух).
// Слоты лічыць СЕРВЕР (`booking_slots`) — кліент не бачыць ні чужых броняў, ні id рэсурсаў.
//
// openSlotsModal({
//   api, repo, serviceId, name, lang,
//   token,      // радок або () => радок; без токена бронь немагчымая → onNeedLogin
//   moveFrom,   // 🔄 id старога запісу: перанос (сервер не лічыць яго заняткам самога сябе)
//   days,       // колькі дзён у пікеры (дэфолт 14)
//   labels: { title, date, time, loading, none, confirm, done, taken, err, login },
//   confirm(msg, onOk),      // siteConfirm / portalConfirm — сістэмныя дыялогі ЗАБАРОНЕНЫ
//   onNeedLogin(intent),     // не ўвайшоў: каллер кладзе намер і адкрывае кабінет
//   onDone(res)              // паспяховая бронь/перанос: {id,date,time,moved}
// })
(function () {
  const ID = 'bk-modal';
  const esc = v => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); // і ' — значэнні трапляюць у inline-onclick у адзінарных двукоссях
  const L = (c, k) => (c.labels && c.labels[k]) || '';
  const tok = c => (typeof c.token === 'function' ? c.token() : c.token) || '';

  let S = null; // {cfg, date, today, busy}

  function dayLabel(iso, lang) { // «пн, 3 жн» — праз Intl на мове каллера (без хардкоду назваў дзён)
    try { return new Date(iso + 'T12:00:00Z').toLocaleDateString(lang || 'be', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }); }
    catch { return iso; }
  }
  // «сёння» лакальнае — толькі стартавая здагадка; сапраўднае аддае сервер у поясе HQ (гл. loadSlots)
  const localToday = () => { const t = new Date(); return new Date(Date.UTC(t.getFullYear(), t.getMonth(), t.getDate())).toISOString().slice(0, 10); };
  function days(cfg) { // дні пікера ад «сёння» БІЗНЕСУ (S.today), не гледача: у ЛА яшчэ ўчора, калі ў Мінску ўжо заўтра
    const out = [], n = cfg.days || 14, base = new Date((S?.today || localToday()) + 'T12:00:00Z');
    for (let i = 0; i < n; i++) { const d = new Date(base); d.setUTCDate(d.getUTCDate() + i); out.push(d.toISOString().slice(0, 10)); }
    return out;
  }
  const close = () => document.getElementById(ID)?.remove();

  function openSlotsModal(cfg) {
    S = { cfg, today: localToday(), date: '', busy: false };
    S.date = (cfg.startDate && days(cfg).includes(cfg.startDate)) ? cfg.startDate : days(cfg)[0];
    close();
    const ov = document.createElement('div');
    ov.id = ID;
    // ⚠️ z-index НІЖЭЙ за пацверджанні каллераў (siteConfirm 10002 / portalConfirm 10000): дыялог
    // адкрываецца ПАВЕРХ мадалкі і мусіць лавіць клікі. Роўны z-index спрацоўваў толькі на сайце —
    // выпадкова, па парадку ў DOM; у кабінеце мадалка перакрывала кнопку «Пацвердзіць» (злоўлена жыўцом).
    ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:9990;display:flex;align-items:center;justify-content:center;padding:16px';
    ov.innerHTML = `<div style="background:var(--surface,#181c27);border:1px solid var(--border,#2a2f45);border-radius:14px;max-width:440px;width:100%;max-height:86vh;overflow:auto;padding:18px;box-shadow:0 16px 48px rgba(0,0,0,0.5)">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:14px">
        <div style="font-weight:700;font-size:1.02rem;color:var(--text,#e8eaf0)">${esc((L(cfg, 'title') || '{name}').replace('{name}', cfg.name || ''))}</div>
        <button onclick="slotsModalClose()" style="background:none;border:none;color:var(--muted,#9aa1ad);cursor:pointer;font-size:1.1rem;line-height:1">✕</button>
      </div>
      <div style="font-size:0.8rem;color:var(--muted,#9aa1ad);margin-bottom:6px">${esc(L(cfg, 'date'))}</div>
      <div id="bk-days" style="display:flex;gap:6px;overflow-x:auto;padding-bottom:8px;margin-bottom:12px"></div>
      <div style="font-size:0.8rem;color:var(--muted,#9aa1ad);margin-bottom:6px">${esc(L(cfg, 'time'))}</div>
      <div id="bk-slots" style="display:flex;flex-wrap:wrap;gap:6px;min-height:40px"></div>
    </div>`;
    ov.addEventListener('click', e => { if (e.target === ov) ov.remove(); });
    document.body.appendChild(ov);
    renderDays();
    loadSlots();
  }

  function renderDays() {
    const box = document.getElementById('bk-days'); if (!box || !S) return;
    box.innerHTML = days(S.cfg).map(d => {
      const on = d === S.date;
      return `<button onclick="_slotsPickDate('${d}')" style="flex:0 0 auto;padding:7px 10px;border-radius:8px;cursor:pointer;font-size:0.8rem;white-space:nowrap;border:1px solid ${on ? 'var(--accent,#f97316)' : 'var(--border,#2a2f45)'};background:${on ? 'var(--accent,#f97316)' : 'transparent'};color:${on ? '#fff' : 'var(--text,#e8eaf0)'}">${esc(dayLabel(d, S.cfg.lang))}</button>`;
    }).join('');
  }

  async function loadSlots() {
    const box = document.getElementById('bk-slots'); if (!box || !S) return;
    const cfg = S.cfg;
    box.innerHTML = `<div style="color:var(--muted,#9aa1ad);font-size:0.85rem;padding:8px 0">${esc(L(cfg, 'loading') || '…')}</div>`;
    let slots = [], srvToday = '';
    try {
      const r = await fetch(cfg.api, { method: 'POST', headers: { 'Content-Type': 'application/json' },
        // moveFrom патрабуе токена (сервер правярае ўласнасць запісу) — інакш чужым id прасвяцілі б занятасць
        body: JSON.stringify({ action: 'booking_slots', repo: cfg.repo, serviceId: cfg.serviceId, date: S.date, lang: cfg.lang, moveFrom: cfg.moveFrom || '', token: cfg.moveFrom ? tok(cfg) : undefined }) });
      const j = await r.json().catch(() => ({})); // today прыходзіць і з памылкай bad_date — чытаем заўсёды
      if (r.ok) slots = j.slots || [];
      srvToday = j.today || '';
    } catch {}
    if (!document.getElementById(ID)) return; // мадалку закрылі, пакуль чакалі адказ
    // 🌍 «сёння» гледача ≠ «сёння» бізнесу (кліент у ЛА, HQ у Мінску): прымаем серверную дату і
    // перабудоўваем пікер ад яе — інакш першы дзень маўчаў бы «няма слотаў» (bad_date), хоць слоты ёсць.
    // Другі раз не зойдзем: пасля прыняцця S.today === srvToday.
    if (srvToday && srvToday !== S.today) {
      S.today = srvToday;
      if (S.date < srvToday || !days(cfg).includes(S.date)) S.date = srvToday;
      renderDays(); loadSlots(); return;
    }
    box.innerHTML = slots.length
      ? slots.map(t => `<button onclick="_slotsPickTime('${esc(t)}')" style="padding:8px 12px;border-radius:8px;border:1px solid var(--border,#2a2f45);background:transparent;color:var(--text,#e8eaf0);cursor:pointer;font-size:0.86rem">${esc(t)}</button>`).join('')
      : `<div style="color:var(--muted,#9aa1ad);font-size:0.85rem;padding:8px 0">${esc(L(cfg, 'none'))}</div>`;
  }

  function pickDate(d) { if (!S) return; S.date = d; renderDays(); loadSlots(); }

  function pickTime(time) {
    if (!S) return;
    const cfg = S.cfg;
    const msg = (L(cfg, 'confirm') || '{d} {t}?').replace('{d}', dayLabel(S.date, cfg.lang)).replace('{t}', time);
    cfg.confirm(msg, () => book(time));
  }

  async function book(time) {
    if (!S || S.busy) return;
    const cfg = S.cfg, token = tok(cfg);
    if (!token) { // не ўвайшоў — намер перажывае ўваход (каллер вырашае, дзе яго захаваць)
      close();
      cfg.onNeedLogin?.({ serviceId: cfg.serviceId, name: cfg.name, date: S.date, time });
      return;
    }
    S.busy = true;
    let res = {};
    try {
      const r = await fetch(cfg.api, { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'portal_book', repo: cfg.repo, token, serviceId: cfg.serviceId, date: S.date, time, moveFrom: cfg.moveFrom || '' }) });
      res = await r.json();
    } catch { res = { error: 'net' }; }
    S.busy = false;
    if (res.ok) {
      const d = dayLabel(S.date, cfg.lang), moved = !!cfg.moveFrom;
      close();
      cfg.confirm((L(cfg, 'done') || '').replace('{d}', d).replace('{t}', time), () => cfg.onDone?.({ ...res, moved }));
      return;
    }
    // хтосьці апярэдзіў, пакуль кліент думаў → паказваем свежы спіс
    if (res.error === 'slot_taken') { cfg.confirm(L(cfg, 'taken'), () => {}); loadSlots(); return; }
    cfg.confirm(L(cfg, 'err'), () => {});
  }

  globalThis.openSlotsModal = openSlotsModal;
  globalThis.slotsModalClose = close;
  globalThis._slotsPickDate = pickDate;   // inline-onclick мадалкі (той жа стыль, што ў астатнім сайце)
  globalThis._slotsPickTime = pickTime;
})();
