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

if (typeof globalThis !== 'undefined') globalThis.TTZOP_BOOKING = { APPT_DEAD, isDead, toMin, fromMin, dayNum, apptResourceUses, apptIntervalsAbs, overlaps };
