// Planning event ↔ Google / Microsoft event, Swiss local time. Pure, so it
// is tested without the network (scripts/calendar-map.test.mjs).

export const TZ = 'Europe/Zurich';

export interface PlanningRow {
  id: string;
  title: string | null;
  note: string | null;
  starts_on: string; // YYYY-MM-DD
  ends_on: string;
  start_time: string | null; // HH:MM[:SS]
  end_time: string | null;
  project_name?: string | null;
  project_address?: string | null;
}

// What a calendar event becomes in the planning.
export interface IncomingEvent {
  id: string;
  cancelled: boolean;
  title: string;
  startsOn: string;
  endsOn: string;
  startTime: string | null;
  endTime: string | null;
  cantiaId: string | null; // written by Cantia itself
}

export function addDays(date: string, n: number): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

const hm = (t: string | null) => (t ? t.slice(0, 5) : null);

function plusHour(time: string): { time: string; nextDay: boolean } {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + 60;
  return { time: `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`, nextDay: total >= 24 * 60 };
}

// Local Zurich date + time of an instant ("2026-10-07T06:00:00Z" → 08:00).
export function zurichParts(iso: string): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(iso));
  const get = (k: string) => parts.find((p) => p.type === k)?.value ?? '00';
  return { date: `${get('year')}-${get('month')}-${get('day')}`, time: `${get('hour')}:${get('minute')}` };
}

function summaryOf(a: PlanningRow): string {
  return (a.title || a.project_name || 'Planning').slice(0, 250);
}

function descriptionOf(a: PlanningRow): string {
  return [a.project_name && a.title ? a.project_name : null, a.note, '— Cantia'].filter(Boolean).join('\n');
}

// Start / end in local wall time; all-day when there is no start time.
function span(a: PlanningRow): { allDay: true; start: string; endExclusive: string } | { allDay: false; start: string; end: string } {
  const st = hm(a.start_time);
  if (!st) return { allDay: true, start: a.starts_on, endExclusive: addDays(a.ends_on, 1) };
  let et = hm(a.end_time);
  let endDate = a.ends_on;
  if (!et) {
    const p = plusHour(st);
    et = p.time;
    if (p.nextDay) endDate = addDays(endDate, 1);
  }
  return { allDay: false, start: `${a.starts_on}T${st}:00`, end: `${endDate}T${et}:00` };
}

export function toGoogle(a: PlanningRow): Record<string, unknown> {
  const s = span(a);
  return {
    summary: summaryOf(a),
    description: descriptionOf(a),
    ...(a.project_address ? { location: a.project_address } : {}),
    start: s.allDay ? { date: s.start } : { dateTime: s.start, timeZone: TZ },
    end: s.allDay ? { date: s.endExclusive } : { dateTime: s.end, timeZone: TZ },
    extendedProperties: { private: { cantia_id: a.id } },
  };
}

export function toMicrosoft(a: PlanningRow): Record<string, unknown> {
  const s = span(a);
  return {
    subject: summaryOf(a),
    body: { contentType: 'text', content: descriptionOf(a) },
    ...(a.project_address ? { location: { displayName: a.project_address } } : {}),
    isAllDay: s.allDay,
    start: { dateTime: s.allDay ? `${s.start}T00:00:00` : s.start, timeZone: TZ },
    end: { dateTime: s.allDay ? `${s.endExclusive}T00:00:00` : s.end, timeZone: TZ },
  };
}

// Times that would break the planning's check (end before start on the same
// day) are dropped: the event stays, as a start time only.
function clean(e: IncomingEvent): IncomingEvent {
  if (e.endsOn < e.startsOn) e.endsOn = e.startsOn;
  if (e.startTime && e.endTime && e.endsOn === e.startsOn && e.endTime <= e.startTime) e.endTime = null;
  if (!e.startTime) e.endTime = null;
  return e;
}

// deno-lint-ignore no-explicit-any
export function fromGoogle(g: any): IncomingEvent {
  const cancelled = g.status === 'cancelled';
  const base = { id: String(g.id), cancelled, title: String(g.summary ?? '').slice(0, 200) || 'Rendez-vous', cantiaId: g.extendedProperties?.private?.cantia_id ?? null };
  if (cancelled || !g.start) return { ...base, startsOn: '', endsOn: '', startTime: null, endTime: null };
  if (g.start.date) return clean({ ...base, startsOn: g.start.date, endsOn: addDays(g.end?.date ?? addDays(g.start.date, 1), -1), startTime: null, endTime: null });
  const s = zurichParts(g.start.dateTime);
  const e = zurichParts(g.end?.dateTime ?? g.start.dateTime);
  // ends exactly at midnight: the day before, until 24:00 is not expressible
  if (e.time === '00:00' && e.date > s.date) return clean({ ...base, startsOn: s.date, endsOn: addDays(e.date, -1), startTime: s.time, endTime: null });
  return clean({ ...base, startsOn: s.date, endsOn: e.date, startTime: s.time, endTime: e.time });
}

// Graph, asked with Prefer: outlook.timezone="Europe/Zurich": wall times.
// deno-lint-ignore no-explicit-any
export function fromMicrosoft(m: any): IncomingEvent {
  const cancelled = !!m['@removed'] || m.isCancelled === true;
  const base = { id: String(m.id), cancelled, title: String(m.subject ?? '').slice(0, 200) || 'Rendez-vous', cantiaId: null };
  if (cancelled || !m.start) return { ...base, startsOn: '', endsOn: '', startTime: null, endTime: null };
  const sd = String(m.start.dateTime).slice(0, 10);
  const ed = String(m.end?.dateTime ?? m.start.dateTime).slice(0, 10);
  if (m.isAllDay) return clean({ ...base, startsOn: sd, endsOn: addDays(ed, -1), startTime: null, endTime: null });
  const st = String(m.start.dateTime).slice(11, 16);
  const et = String(m.end?.dateTime ?? m.start.dateTime).slice(11, 16);
  if (et === '00:00' && ed > sd) return clean({ ...base, startsOn: sd, endsOn: addDays(ed, -1), startTime: st, endTime: null });
  return clean({ ...base, startsOn: sd, endsOn: ed, startTime: st, endTime: et });
}
