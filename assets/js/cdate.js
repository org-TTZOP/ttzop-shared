/* ================================================================
   TTZOP — cdate.js: 📅 ФІРМЕННЫ КАЛЯНДАР-ПАПАП (адзін кампанент на ЎСЕ куткі:
   панэль admin/index.html + Чарнавік/сайт main.js; узор — reader.js/slots-modal.js).
   Самадастатковы рухавік: значэнне ISO жыве ў схаваным <input id>, выбар дня робіць
   dispatchEvent('change') — існуючы onchange каллера спрацоўвае сам.
   Канфіг каллера — window.TTZOP_CDATE = {
     locale():   код мовы для назваў месяцаў/дзён (дэфолт 'be'),
     fmt(iso):   дысплэйны фармат даты (дэфолт ISO як ёсць),
     placeholder(): плейсхолдэр дысплэй-поля,
     labels():   { today, clear } — подпісы кнопак нізу
   } — кожны кут дае СВАЮ мову/фармат (панэль: fmtDate/рэгіянальныя налады; сайт: мова наведвальніка).
   ================================================================ */

// Частыя памылковыя коды краіна≠мова (by = бел. лацінка ў TTZOP → месяцы па-беларуску)
const _DATE_LOCALE_ALIAS = { by: 'be', ua: 'uk', cz: 'cs', gr: 'el' };
// Бяспечная локаль для Intl: невядомы код НЕ валіцца на сістэмную мову (яна чужая сайту)
function _cdateSafeLocale(code) {
  code = _DATE_LOCALE_ALIAS[code] || code || 'be';
  try { if (Intl.DateTimeFormat.supportedLocalesOf([code]).length) return code; } catch {}
  return 'be';
}
function _cdateCfg() { return (typeof window !== 'undefined' && window.TTZOP_CDATE) || {}; }
function _cdateLoc() { try { return _cdateCfg().locale() || 'be'; } catch { return 'be'; } }
function _cdateFmt(iso) { try { return _cdateCfg().fmt ? _cdateCfg().fmt(iso) : iso; } catch { return iso; } }
function _cdateLabels() { try { return _cdateCfg().labels() || {}; } catch { return {}; } }

let _cdateCur = null; // {id, year, month} — бягучы выгляд папапа
function _cdateEnsurePop() {
  let pop = document.getElementById('cdate-pop');
  if (!pop) {
    const st = document.createElement('style');
    st.textContent = `#cdate-pop{position:absolute;z-index:100001;display:none;background:#1d2230;border:1px solid var(--border,#333a4d);border-radius:10px;padding:8px;box-shadow:0 8px 28px rgba(0,0,0,.45);width:236px;font-size:.85rem;color:#e5e9f2}
      #cdate-pop .cd-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}
      #cdate-pop .cd-head span{font-weight:700;text-transform:capitalize}
      #cdate-pop .cd-head button{background:none;border:none;color:inherit;cursor:pointer;font-size:1.2rem;line-height:1;padding:2px 10px;border-radius:6px}
      #cdate-pop .cd-head button:hover{background:var(--border,#333a4d)}
      #cdate-pop .cd-wd,#cdate-pop .cd-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;text-align:center}
      #cdate-pop .cd-wd span{color:var(--muted,#8b93a7);font-size:.68rem;padding:2px 0}
      #cdate-pop .cd-grid button{background:none;border:none;color:inherit;cursor:pointer;border-radius:6px;padding:6px 0;font-size:.8rem;pointer-events:auto}
      #cdate-pop .cd-grid button:hover{background:var(--border,#333a4d)}
      #cdate-pop .cd-grid button.today{color:var(--accent,#f97316);box-shadow:inset 0 0 0 1px var(--accent,#f97316);font-weight:700}
      #cdate-pop .cd-grid button.sel{background:var(--accent,#f97316);color:#fff;font-weight:700;box-shadow:none}
      #cdate-pop .cd-foot{margin-top:6px;text-align:right;display:flex;justify-content:space-between;gap:6px}
      #cdate-pop .cd-foot button{background:none;border:1px solid var(--border,#333a4d);border-radius:6px;color:var(--muted,#8b93a7);cursor:pointer;font-size:.72rem;padding:3px 9px;pointer-events:auto}
      #cdate-pop button{pointer-events:auto!important}`; /* edit-рэжым Чарнавіка глушыць кнопкі секцый — папап жыве ў body, але страхуемся */
    document.head.appendChild(st);
    pop = document.createElement('div'); pop.id = 'cdate-pop';
    document.body.appendChild(pop);
    document.addEventListener('mousedown', e => {
      if (pop.style.display === 'block' && !pop.contains(e.target) && !e.target.closest('[data-cdate]')) _cdateClose();
    });
  }
  return pop;
}
// anchorEl (опц.) — якар пазіцыянавання, калі схаванае поле не мае свайго дысплэя (напр. інлайн-дата навіны ў Чарнавіку)
function _cdateOpen(id, anchorEl) {
  const d = document.getElementById(id); if (!d) return;
  _cdateEnsurePop();
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d.value || '');
  const now = new Date();
  _cdateCur = { id, year: m ? +m[1] : now.getFullYear(), month: m ? +m[2] - 1 : now.getMonth() };
  _cdateRender();
  const pop = document.getElementById('cdate-pop');
  const anchor = anchorEl || document.getElementById(id + '-disp') || d;
  const r = anchor.getBoundingClientRect();
  pop.style.left = Math.max(4, Math.min(window.scrollX + r.left, window.scrollX + window.innerWidth - 244)) + 'px';
  pop.style.top = (window.scrollY + r.bottom + 4) + 'px';
  pop.style.display = 'block';
}
function _cdateRender() {
  const pop = _cdateEnsurePop();
  const { id, year, month } = _cdateCur;
  const dEl = document.getElementById(id);
  const sel = dEl && dEl.value ? dEl.value.slice(0, 10) : '';
  const startDow = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7; // панядзелак=0
  const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const loc = _cdateSafeLocale(_cdateLoc());
  let wd; try { const f = new Intl.DateTimeFormat(loc, { weekday: 'short' }); wd = [...Array(7)].map((_, i) => f.format(new Date(Date.UTC(2024, 0, 1 + i)))); } catch { wd = ['Пн', 'Аўт', 'Ср', 'Чц', 'Пт', 'Сб', 'Нд']; }
  let title; try { title = new Intl.DateTimeFormat(loc, { month: 'long', year: 'numeric' }).format(new Date(Date.UTC(year, month, 1))); } catch { title = `${month + 1}.${year}`; }
  const _td = new Date(); // сённяшняя дата (лакальная) для падсветкі
  const today = `${_td.getFullYear()}-${String(_td.getMonth() + 1).padStart(2, '0')}-${String(_td.getDate()).padStart(2, '0')}`;
  let cells = '';
  for (let i = 0; i < startDow; i++) cells += '<span></span>';
  for (let n = 1; n <= days; n++) {
    const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(n).padStart(2, '0')}`;
    const cls = [iso === today ? 'today' : '', iso === sel ? 'sel' : ''].filter(Boolean).join(' ');
    cells += `<button type="button" class="${cls}" onclick="_cdatePick('${id}','${iso}')">${n}</button>`;
  }
  const lb = _cdateLabels();
  pop.innerHTML = `<div class="cd-head"><button type="button" onclick="_cdateNav(-1)">‹</button><span>${title}</span><button type="button" onclick="_cdateNav(1)">›</button></div>`
    + `<div class="cd-wd">${wd.map(w => `<span>${w}</span>`).join('')}</div>`
    + `<div class="cd-grid">${cells}</div>`
    + `<div class="cd-foot"><button type="button" onclick="_cdatePick('${id}','${today}')">${lb.today || 'Сёння'}</button><button type="button" onclick="_cdatePick('${id}','')">${lb.clear || 'Ачысціць'}</button></div>`;
}
function _cdateNav(delta) {
  if (!_cdateCur) return;
  let { year, month } = _cdateCur; month += delta;
  if (month < 0) { month = 11; year--; } else if (month > 11) { month = 0; year++; }
  _cdateCur.year = year; _cdateCur.month = month; _cdateRender();
}
function _cdatePick(id, iso) {
  const d = document.getElementById(id);
  if (d) { d.value = iso; d.dispatchEvent(new Event('change', { bubbles: true })); } // спрацоўвае існуючы onchange (дысплэй + onChange)
  _cdateClose();
}
function _cdateClose() { const pop = document.getElementById('cdate-pop'); if (pop) pop.style.display = 'none'; _cdateCur = null; }
function _cdateSync(id) { const d = document.getElementById(id), disp = document.getElementById(id + '-disp'); if (d && disp) disp.value = d.value ? _cdateFmt(d.value) : ''; }
function _cdateSet(id, iso) { const d = document.getElementById(id), disp = document.getElementById(id + '-disp'); if (d) d.value = iso || ''; if (disp) disp.value = iso ? _cdateFmt(iso) : ''; }
function _cdatePlaceholder(id, iso) { const disp = document.getElementById(id + '-disp'); if (disp) disp.placeholder = iso ? _cdateFmt(iso) : ((_cdateCfg().placeholder && _cdateCfg().placeholder()) || ''); }
