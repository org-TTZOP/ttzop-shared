// ═══════════════════════════════════════════════════════════════════════════
// 📅 BOOKING — АГУЛЬНЫ МОДУЛЬ ЗАНЯТАСЦІ (панэль + сайт + воркер: адна крыніца праўды)
// ───────────────────────────────────────────────────────────────────────────
// Тут жывуць ТОЛЬКІ тыя разлікі, што абавязаны супадаць ва ўсіх трох спажыўцоў:
//   панэль малюе занятасць → сайт паказвае вольныя слоты → воркер правярае бронь.
// Разыходжанне на любым з іх = падвойная бронь. Таму механізм — у ШАБЛОНЕ, не ў кутку.
//
// Загрузка: браўзер — <script type="module" src=".../booking.js"> (модуль сам кладзе
// сябе ў globalThis.TTZOP_BOOKING, каб класічныя скрыпты панэлі/сайта бачылі яго);
// воркер — звычайны `import` (wrangler збірае файл у бандл).
//
// ⚠️ Безыменнасць: модуль не ведае ні пра РМ Запісы, ні пра кабінет — толькі пра
// «запіс займае рэсурсы на інтэрвалах».
// ═══════════════════════════════════════════════════════════════════════════

// Статусы, пры якіх запіс БОЛЬШ НЕ займае рэсурс (вызваляе слот).
// Крыніца праўды і для панэлі (стужка/куб), і для воркера (праверка перасячэння).
export const APPT_DEAD = ['cancelled', 'no_show'];
export const isDead = st => APPT_DEAD.includes(st);

// «ЧЧ:ММ» → хвіліны ад пачатку дня. Падоўжаныя хвіліны: «25:00» → 1500 (начная змена).
export function toMin(hhmm) { const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm || ''); return m ? +m[1] * 60 + +m[2] : null; }
// хвіліны → «ЧЧ:ММ» (>24г захоўваецца як «25:00» — round-trip праз toMin)
export function fromMin(min) { return String(Math.floor(min / 60)).padStart(2, '0') + ':' + String(((min % 60) + 60) % 60).padStart(2, '0'); }
// нумар дня (дзён ад эпохі) — база АБСАЛЮТНЫХ хвілін: абс = dayNum(date)*1440 + хвіліна дня
export function dayNum(date) { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date || ''); return m ? Math.round(Date.UTC(+m[1], +m[2] - 1, +m[3]) / 86400000) : 0; }

// «ЧЫТАЙ АБОДВА» — што менавіта займае запіс: [{resourceId, start, end}] у хвілінах ДНЯ запісу.
// Новая мадэль assignments[] (сузор'е рэсурсаў па этапах) АБО legacy (resourceId/personId/
// placeId/equipmentIds займаюць увесь [time, time+duration]).
export function apptResourceUses(a) {
  if (Array.isArray(a.assignments) && a.assignments.length) {
    const out = a.assignments.map(x => ({ resourceId: x.resourceId, start: toMin(x.from), end: toMin(x.to) })).filter(u => u.resourceId && u.start != null && u.end != null);
    // ad-hoc equipmentIds (па-за харэаграфіяй) — займаюць увесь дыяпазон запісу (інакш нябачныя для канфліктаў/стужкі)
    if (Array.isArray(a.equipmentIds) && a.equipmentIds.length && out.length) {
      const lo = Math.min(...out.map(u => u.start)), hi = Math.max(...out.map(u => u.end));
      a.equipmentIds.forEach(id => { if (id && !out.some(u => u.resourceId === id)) out.push({ resourceId: id, start: lo, end: hi }); });
    }
    return out;
  }
  const st = toMin(a.time); if (st == null) return [];
  const end = st + Math.max(5, +a.duration || 0);
  const ids = [...new Set([a.resourceId, a.personId, a.placeId, ...(Array.isArray(a.equipmentIds) ? a.equipmentIds : [])].filter(Boolean))];
  return ids.map(resourceId => ({ resourceId, start: st, end }));
}

// Занятасць запісу ў АБСАЛЮТНЫХ хвілінах: [{resourceId, startAt, endAt}].
// Трэйлінг-буфер (bufferAfter) уваходзіць у канец — рэсурс не свабодны адразу пасля.
// Абсалютная вось — адзіны спосаб карэктна параўнаць начную бронь 23:30→00:30 (яна
// перасякае поўнач: end > 1440, і дзень-суседа блакуе без асобнай логікі «сутак»).
export function apptIntervalsAbs(a) {
  const base = dayNum(a.date) * 1440, buf = Math.max(0, +a.bufferAfter || 0);
  return apptResourceUses(a).map(u => ({ resourceId: u.resourceId, startAt: base + u.start, endAt: base + u.end + buf }));
}

// Ці перасякаюцца два паўадкрытыя інтэрвалы [s,e). Дотык канцамі (e1===s2) — НЕ перасячэнне.
export const overlaps = (s1, e1, s2, e2) => s1 < e2 && s2 < e1;
// 📦 пік адначасовасці: max колькасць інтэрвалаў [{start,end}], што накладаюцца ў адзін момант
// у акне [st,end) — канфлікт ёмістасці, калі пік > cap (парнае перасячэнне пераацэньвала б:
// a∩k і b∩k пры a∦b — гэта ўсё яшчэ 2 адначасова, не 3). Дастаткова праверыць моманты стартаў.
export function concurrentPeak(intervals, st, end) {
  let peak = 0;
  for (const iv of intervals) {
    const t = Math.max(iv.start, st); if (t >= end || t >= iv.end) continue;
    const n = intervals.filter(o => o.start <= t && o.end > t).length;
    if (n > peak) peak = n;
  }
  return peak;
}

// ═══════════════════════════════════════════════════════════════════════════
// 🧩 РАШАЛЬНІК ВОЛЬНЫХ СЛОТАЎ (F1: харэаграфія — сегменты × рэсурсы × час)
// Быў у admin/index.html. Пераехаў сюды, бо трэба ТРОМ: панэль малюе, сайт паказвае,
// воркер правярае бронь. Усё чыстае: на ўваход `tree` (companyTree) + масіў запісаў.
// ═══════════════════════════════════════════════════════════════════════════

// ── Часавыя паясы (Intl ёсць і ў браўзеры, і ў воркеры) ──
export function tzOffsetMin(tz, date) {
  try {
    const p = {}; new Intl.DateTimeFormat('en-US', { timeZone: tz, hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).formatToParts(date).forEach(x => p[x.type] = x.value);
    const asUTC = Date.UTC(+p.year, +p.month - 1, +p.day, p.hour === '24' ? 0 : +p.hour, +p.minute, +p.second);
    return Math.round((asUTC - date.getTime()) / 60000);
  } catch { return null; }
}
export function resourceTz(tree, resId) {
  const n = (tree || []).find(x => x.id === resId); if (!n) return '';
  if (n.fields && n.fields.timezone) return n.fields.timezone; // офіс/філіял сам нясе пояс
  const folder = (tree || []).find(x => x.id === n.parentId), office = (tree || []).find(x => x.id === folder?.parentId);
  return office?.fields?.timezone || '';
}
// пояс галаўнога офіса (HQ) — апорны пояс восі часу
export const hqTz = tree => (tree || []).find(x => x.parentId == null && x.fields)?.fields?.timezone || '';
// зрух branch→HQ (хв): дадаць да лакальнага насценнага часу філіяла. 0 калі пояс не зададзены/супадае.
export function tzDeltaMin(tree, resId, isoDate) {
  const bt = resourceTz(tree, resId), ht = hqTz(tree); if (!bt || !ht || bt === ht) return 0;
  const [Y, Mo, D] = (isoDate || '').split('-').map(Number); if (!Y) return 0;
  const inst = new Date(Date.UTC(Y, Mo - 1, D, 12)); // поўдзень дзелавога дня (DST праз Intl)
  const bo = tzOffsetMin(bt, inst), ho = tzOffsetMin(ht, inst); if (bo == null || ho == null) return 0;
  return ho - bo;
}

// ── Графік ──
// дзень-нумары радка (ISO 1=Пн..7=Нд): новае `days:[...]` або легасі `day`; [] = штодня
export function schedRowDays(r) {
  if (Array.isArray(r.days)) return r.days.map(String);
  if (r.day && r.day !== '*') return [String(r.day)];
  return [];
}
// інтэрвал графіка ў ПАДОЎЖАНЫХ хвілінах: начная змена (to≤from) → to+1440 (вось цягнецца за поўнач)
export function schedIvMin(iv) { if (!iv) return null; const f = toMin(iv.from), t = toMin(iv.to); if (f == null || t == null) return null; return { from: f, to: t <= f ? t + 1440 : t }; }
// графік рэсурсу на дзень тыдня: дзень-канкрэтныя радкі перакрываюць «штодня»; калі ў рэсурсу
// няма свайго радка — бярэм графік яго офіса (рэсурс → папка «Рэсурсы» → офіс).
// ⚠️ ДВА РОЗНЫЯ «пуста», якія раней зліваліся ў адно (і рэсурс быў браніравальны ў свой выходны):
//   • `rows` пустыя      → графік НЕ зададзены нідзе → абмежаванняў няма (вольны ўвесь дзень);
//   • `rows` ёсць, а `hours` пустыя → ВЫХОДНЫ (радок дня з «--» часам) → не вольны ніколі.
const _schedHoursOf = rows => rows.filter(s => s.from && s.to).map(s => ({ from: s.from, to: s.to })); // агульны для тыднёвага і выключэнняў
export function resourceScheduleInfo(tree, resourceId, dow) {
  const res = (tree || []).find(n => n.id === resourceId);
  const dayRows = node => { const rows = node?.fields?._schedule || []; const spec = rows.filter(s => schedRowDays(s).includes(String(dow))); return spec.length ? spec : rows.filter(s => !schedRowDays(s).length); };
  const own = dayRows(res);
  if (own.length) return { rows: own, hours: _schedHoursOf(own) }; // уласны радок дня — БЕЗ fallback на офіс
  const folder = (tree || []).find(n => n.id === res?.parentId), office = (tree || []).find(n => n.id === folder?.parentId);
  const off = dayRows(office);
  return { rows: off, hours: _schedHoursOf(off) };
}
// 📆 D: ВЫКЛЮЧЭННІ ГРАФІКА (date-specific — адпачынак/святы/асаблівы дзень): fields._exceptions =
// [{date, dateTo?, from?, to?}] на рэсурсе І на офісе/філіяле. Радок без часу = ЗАЧЫНЕНА (тая ж
// семантыка, што тыднёвы «дзень без гадзін = выходны»); некалькі радкоў на дату = перапынак;
// dateTo (уключна) — дыяпазон (адпачынак адным радком, не 14-ю).
const _exceptionRows = (node, date) => (node?.fields?._exceptions || []).filter(r => r && r.date && r.date <= date && date <= (r.dateTo || r.date));
// графік НА ДАТУ: выключэнні (уласныя → офіса, тая ж іерархія «сваё перакрывае») → тыднёвы (dow).
// Усе разлікі занятасці ідуць праз ГЭТУЮ функцыю — тыднёвая resourceScheduleInfo застаецца для
// выгляду «тыповы тыдзень» (табліца графіка ў панэлі).
export function resourceScheduleInfoAt(tree, resourceId, date) {
  const res = (tree || []).find(n => n.id === resourceId);
  const own = _exceptionRows(res, date);
  if (own.length) return { rows: own, hours: _schedHoursOf(own) };
  const folder = (tree || []).find(n => n.id === res?.parentId), office = (tree || []).find(n => n.id === folder?.parentId);
  const off = _exceptionRows(office, date);
  if (off.length) return { rows: off, hours: _schedHoursOf(off) };
  return resourceScheduleInfo(tree, resourceId, dowOf(date));
}
// гадзіны працы (сумяшчальны выгляд — спажыўцы UI чакаюць масіў інтэрвалаў)
export const resourceSchedule = (tree, resourceId, dow) => resourceScheduleInfo(tree, resourceId, dow).hours;
export const resourceScheduleAt = (tree, resourceId, date) => resourceScheduleInfoAt(tree, resourceId, date).hours; // 📆 date-aware (з выключэннямі)
// выходны: радкі на гэты дзень ЁСЦЬ, але без часу
export function resourceDayOff(tree, resourceId, dow) { const i = resourceScheduleInfo(tree, resourceId, dow); return i.rows.length > 0 && i.hours.length === 0; }

// ISO-нумар дня тыдня (1=Пн … 7=Нд) па UTC — каб пояс машыны не зрушваў дзень
export const dowOf = date => { const d = new Date(date + 'T00:00:00Z').getUTCDay(); return d === 0 ? 7 : d; };

// ── Рэсурсы ──
// усе актыўныя рэсурсы дрэва: {id, type, office}. Лэйблы — справа UI, тут іх няма (безыменнасць).
export function resources(tree) {
  return (tree || []).filter(n => n.type === 'form' && n.formSchema === 'resourceStructure' && n.fields?.active !== false).map(r => {
    const folder = (tree || []).find(f => f.id === r.parentId), office = (tree || []).find(o => o.id === folder?.parentId);
    return { id: r.id, type: r.fields?.resourceType || 'person', office: office?.id || null };
  });
}
// рэсурсы пула, абмежаваныя філіялам; пусты ці '*' → без фільтра
export function branchScopePool(tree, ids, branchId) {
  if (!branchId || branchId === '*') return ids;
  const off = Object.fromEntries(resources(tree).map(r => [r.id, r.office]));
  return ids.filter(id => off[id] === branchId);
}
// 📦 ЁМІСТАСЦЬ (склад): колькі АДНАЧАСОВЫХ выкарыстанняў трымае рэсурс (10 крэслаў, зала на 8).
// Адзіная крыніца-правіла: інвентарны спіс «Адзінкі» (_units) НЕпусты → лічым спраўныя
// (state !== 'off' — няспраўная адзінка часова выпадае са складу); пусты → поле qty (дэфолт 1).
// cap=0 (усе адзінкі няспраўныя) → рэсурс небранявальны ўвогуле.
export function resourceCapacity(tree, resId) {
  const f = (tree || []).find(n => n.id === resId)?.fields || {};
  const units = Array.isArray(f._units) ? f._units : [];
  if (units.length) return units.filter(u => u && u.state !== 'off').length;
  return Math.max(1, parseInt(f.qty, 10) || 1);
}

// ── Этапы (сегменты) ──
// рэжым выбару рэсурсу: any (любы свайго тыпу) / specific (толькі candidates) / none (этап без рэсурсу)
export const segPick = seg => seg.pick || (Array.isArray(seg.candidates) && seg.candidates.length ? 'specific' : 'any');
// «жывы» этап: мае працягласць І не «Без»
export const segActive = seg => +seg.duration > 0 && segPick(seg) !== 'none';
export function segmentPool(tree, seg) {
  const all = resources(tree), pick = segPick(seg);
  if (pick === 'none') return [];
  if (pick === 'specific') return (Array.isArray(seg.candidates) ? seg.candidates : []).filter(id => all.some(r => r.id === id));
  return all.filter(r => r.type === (seg.type || 'person')).map(r => r.id); // any
}

// ── Занятасць ──
// ISO-дзень + зрух у днях (без TZ-скажэння: працуем на UTC-паўдні)
const _shiftDay = (date, off) => { const d = new Date(date + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + off); return d.toISOString().slice(0, 10); };
// занятасць рэсурсу ў АБСАЛЮТНЫХ хвілінах, дні D-1..D+1 — начная бронь суседняга дня трапляе ў акно
// (23:00→01:00 «учора» блакуе «сёння» 00:30, і наадварот). excludeId — не лічыць сам запіс.
export function resourceBusyAbs(appointments, resId, date, excludeId) {
  const out = [];
  for (let off = -1; off <= 1; off++) {
    const dd = _shiftDay(date, off);
    (appointments || []).filter(a => a.date === dd && !isDead(a.status) && a.id !== excludeId)
      .forEach(a => apptIntervalsAbs(a).forEach(u => { if (u.resourceId === resId) out.push({ start: u.startAt, end: u.endAt }); }));
  }
  return out;
}
// колькі занятых інтэрвалаў рэсурсу перасякаюць акно [start,end] (хвіліны дня, вось абсалютная)
export function busyCountInWindow(ctx, resId, date, start, end) {
  const base = dayNum(date) * 1440;
  return resourceBusyAbs(ctx.appointments, resId, date).filter(b => overlaps(base + start, base + end, b.start, b.end)).length;
}
// рэсурс вольны ў акне [start,end] (HQ-хвіліны дня): працуе паводле графіка (не зададзены → увесь дзень)
// І адначасовых выкарыстанняў МЕНШ за ёмістасць (📦 склад: было «любое перасячэнне = заняты» = cap 1).
export function resourceFreeInWindow(ctx, resId, date, start, end) {
  const { tree } = ctx;
  const cap = resourceCapacity(tree, resId);
  if (cap <= 0) return false; // усе адзінкі няспраўныя — небранявальны
  const dl = tzDeltaMin(tree, resId, date); // графік філіяла (лакальны насценны) → пояс HQ
  const { rows, hours: sched } = resourceScheduleInfoAt(tree, resId, date); // 📆 з выключэннямі (адпачынак/святы)
  if (rows.length && !sched.length) return false; // ВЫХОДНЫ/ЗАЧЫНЕНА — не вольны ўвесь дзень (раней трактаваўся як «графіка няма» → бралі броні)
  if (sched.length && !sched.some(iv => { const m = schedIvMin(iv); return m && start >= m.from + dl && end <= m.to + dl; })) return false;
  return busyCountInWindow(ctx, resId, date, start, end) < cap;
}
// прызначыць рэсурс кожнаму этапу на старт T (backtracking з улікам груп: strict=той самы,
// prefer=прыярытэт таму самому, any=незалежна; адзін рэсурс у акнах, што перасякаюцца — да ЁМІСТАСЦІ:
// заняткі звонку + уласныя этапы гэтага ж запісу разам не пераўзыходзяць cap)
export function assignSegments(ctx, segs, groups, T, date, branchId) {
  const { tree } = ctx;
  const policyOf = gid => groups.find(g => g._id === gid)?.policy || 'any';
  const wins = segs.map(sg => { const o = +sg.offset || 0; return { start: T + o, end: T + o + Math.max(1, +sg.duration || 0) }; });
  const pools = segs.map((sg, i) => branchScopePool(tree, segmentPool(tree, sg), branchId).filter(rid => resourceFreeInWindow(ctx, rid, date, wins[i].start, wins[i].end)));
  if (pools.some(p => !p.length)) return null; // нейкі этап не мае вольнага рэсурсу
  const assign = new Array(segs.length).fill(null), groupChosen = {};
  // 📦 перакрыцці таго ж рэсурсу дазволены пакуль знешнія заняткі + уласныя этапы + гэты < cap
  const overlapsUsed = (i, rid) => {
    const own = segs.reduce((n, _, j) => n + (j !== i && assign[j] === rid && overlaps(wins[i].start, wins[i].end, wins[j].start, wins[j].end) ? 1 : 0), 0);
    if (!own) return false; // без уласных перакрыццяў дастаткова resourceFreeInWindow (пул ужо адфільтраваны)
    return busyCountInWindow(ctx, rid, date, wins[i].start, wins[i].end) + own + 1 > resourceCapacity(tree, rid);
  };
  const bt = i => {
    if (i >= segs.length) return true;
    const gid = segs[i].groupId, pol = gid ? policyOf(gid) : 'any';
    let cands = pools[i];
    if (gid && groupChosen[gid] != null) { const ch = groupChosen[gid];
      if (pol === 'strict') cands = pools[i].includes(ch) ? [ch] : [];
      else if (pol === 'prefer') cands = pools[i].includes(ch) ? [ch, ...pools[i].filter(r => r !== ch)] : pools[i];
    }
    for (const rid of cands) {
      if (overlapsUsed(i, rid)) continue;
      assign[i] = rid; const prev = groupChosen[gid];
      if (gid && (pol === 'strict' || pol === 'prefer') && groupChosen[gid] == null) groupChosen[gid] = rid;
      if (bt(i + 1)) return true;
      assign[i] = null; if (gid && groupChosen[gid] === rid && prev == null) groupChosen[gid] = prev;
    }
    return false;
  };
  if (!bt(0)) return null;
  return segs.map((sg, i) => ({ segId: sg._id || ('s' + i), resourceId: assign[i], from: fromMin(wins[i].start), to: fromMin(wins[i].end) }));
}
export const SLOT_STEP = 15; // крок сеткі слотаў, хв
// вольныя слоты паслугі-харэаграфіі на дату: [{time, assignments:[{segId,resourceId,from,to}]}]
export function choreographyFreeSlots(ctx, svc, date, branchId) {
  const { tree } = ctx;
  const segs = (svc._segments || []).filter(segActive); // «Без» (none) этапы прапускаюцца
  if (!segs.length || !date) return [];
  const groups = svc._groups || [];
  const total = segs.reduce((m, sg) => Math.max(m, (+sg.offset || 0) + (+sg.duration || 0)), 0);
  // дыяпазон дня = аб'яднанне графікаў усіх кандыдатаў НА ДАТУ (📆 з выключэннямі); нічога не зададзена → 08:00–20:00
  let lo = 24 * 60, hi = 0;
  [...new Set(segs.flatMap(sg => branchScopePool(tree, segmentPool(tree, sg), branchId)))].forEach(rid => {
    const dl = tzDeltaMin(tree, rid, date);
    resourceScheduleAt(tree, rid, date).forEach(iv => { const m = schedIvMin(iv); if (m) { lo = Math.min(lo, m.from + dl); hi = Math.max(hi, m.to + dl); } });
  });
  if (lo >= hi) { lo = 8 * 60; hi = 20 * 60; }
  const out = [];
  for (let T = Math.ceil(lo / SLOT_STEP) * SLOT_STEP; T + total <= hi; T += SLOT_STEP) {
    const a = assignSegments(ctx, segs, groups, T, date, branchId);
    if (a) out.push({ time: fromMin(T), assignments: a });
  }
  return out;
}
// Бранявальныя пазіцыі Каталога (📅 booking; легасі без fulfil — старая логіка duration>0).
// Легасі (адзін рэсурс, увесь час) → сінтэз аднаго этапу, каб рашальнік бачыў адзіную мадэль.
export function bookableServices(nodes) {
  return (nodes || []).filter(n => n.type === 'form' && (!n.fields?.fulfil || n.fields.fulfil === 'booking')).map(n => {
    const f = n.fields || {};
    const segs = Array.isArray(f._segments) ? f._segments : [];
    const segLen = segs.filter(segActive).reduce((m, sg) => Math.max(m, (+sg.offset || 0) + (+sg.duration || 0)), 0);
    const duration = segLen || (+f.duration || 0);
    const resourceIds = segs.length ? [...new Set(segs.flatMap(sg => Array.isArray(sg.candidates) ? sg.candidates : []))] : (Array.isArray(f.resourceIds) ? f.resourceIds : []);
    const segments = segs.length ? segs : (duration > 0 ? [{ _id: 's0', type: 'person', candidates: resourceIds, offset: 0, duration }] : []);
    // leadMin — запас перад БРОННЮ; cancelLeadMin — запас перад ПАЧАТКАМ, раней за які кліент ужо не адменіць/не перанясе.
    // Дзве розныя семантыкі, не блытаць. Абодва ўжывае ТОЛЬКІ публічны шлях (адмін у панэлі не абмежаваны).
    return { id: n.id, name: f.name || n.name || '?', duration, bufferAfter: +f.bufferAfter || 0, leadMin: Math.max(0, +f.bookLead || 0),
      cancelLeadMin: Math.max(0, +f.bookCancelLead || 0), resourceIds, _segments: segments, _groups: Array.isArray(f._groups) ? f._groups : [],
      groupMax: Math.max(0, parseInt(f.groupMax, 10) || 0), // 👥 ліміт групы; 0 = звычайная адзіночная
      fixed: f.bookFixed === 'yes' }; // 📅 толькі прызначаныя выезды (экскурсіі): публіка не стварае новых слотаў — далучаецца да існуючых груп
  }).filter(x => x.duration > 0);
}
// 👥 ГРУПЫ: адзіная нармалізацыя месцаў адной броні (дэфолт 1) — ААП: не паўтараць parseInt/max па кутках
export const seatQty = q => Math.max(1, parseInt(q, 10) || 1);
// колькі месцаў занята ў групавым запісе (кожны ўдзельнік бярэ qty месцаў)
export function groupSeatsTaken(a) {
  return (Array.isArray(a?.participants) ? a.participants : []).reduce((n, p) => n + seatQty(p?.qty), 0);
}

const _API = { APPT_DEAD, isDead, toMin, fromMin, dayNum, apptResourceUses, apptIntervalsAbs, overlaps,
  tzOffsetMin, resourceTz, hqTz, tzDeltaMin, schedRowDays, schedIvMin, resourceSchedule, resources, branchScopePool,
  segPick, segActive, segmentPool, resourceBusyAbs, resourceFreeInWindow, assignSegments, choreographyFreeSlots,
  bookableServices, SLOT_STEP, resourceScheduleInfo, resourceDayOff, dowOf,
  resourceCapacity, busyCountInWindow, concurrentPeak, // 📦 склад/ёмістасць
  resourceScheduleInfoAt, resourceScheduleAt, // 📆 D: выключэнні графіка (date-aware)
  groupSeatsTaken, seatQty }; // 👥 групавыя паслугі
if (typeof globalThis !== 'undefined') globalThis.TTZOP_BOOKING = _API;
