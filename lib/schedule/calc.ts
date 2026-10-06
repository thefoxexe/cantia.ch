// Planning de chantier — the rules, without any I/O (tested in
// scripts/schedule.test.mjs). Dates are ISO days "YYYY-MM-DD"; durations
// are working days, counted inclusively (Mon → Fri = 5).

export type ItemKind = 'phase' | 'task' | 'milestone';
export type ItemStatus = 'todo' | 'planned' | 'in_progress' | 'done' | 'blocked';

export interface ScheduleItem {
  id: string;
  parent_id: string | null;
  kind: ItemKind;
  name: string;
  trade: string | null;
  company: string | null;
  responsible_user_id: string | null;
  team_size: number | null;
  status: ItemStatus;
  progress: number;
  progress_manual: boolean;
  start_date: string | null;
  end_date: string | null;
  duration: number | null;
  fixed: boolean;
  baseline_start: string | null;
  baseline_end: string | null;
  actual_start: string | null;
  actual_end: string | null;
  notes: string | null;
  sort_order: number;
}

export interface ScheduleLink {
  id: string;
  from_item: string;
  to_item: string;
}

export const DEFAULT_WORKDAYS = [1, 2, 3, 4, 5];

// ISO weekday 1 (Monday) … 7 (Sunday), in UTC so no timezone drift.
export function weekday(date: string): number {
  const d = new Date(`${date}T00:00:00Z`).getUTCDay();
  return d === 0 ? 7 : d;
}

export function addDays(date: string, n: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);
}

export const isWorkday = (date: string, workdays = DEFAULT_WORKDAYS) => workdays.includes(weekday(date));

// The same day if it is worked, else the next worked one.
export function nextWorkday(date: string, workdays = DEFAULT_WORKDAYS): string {
  let d = date;
  for (let i = 0; i < 14 && !isWorkday(d, workdays); i++) d = addDays(d, 1);
  return d;
}

// Last day of a task that starts on `start` and lasts `duration` working days.
export function endFromDuration(start: string, duration: number, workdays = DEFAULT_WORKDAYS): string {
  let d = nextWorkday(start, workdays);
  for (let left = Math.max(1, duration) - 1; left > 0; ) {
    d = addDays(d, 1);
    if (isWorkday(d, workdays)) left -= 1;
  }
  return d;
}

// First day of a task that ends on `end` and lasts `duration` working days.
export function startFromDuration(end: string, duration: number, workdays = DEFAULT_WORKDAYS): string {
  let d = end;
  for (let i = 0; i < 14 && !isWorkday(d, workdays); i++) d = addDays(d, -1);
  for (let left = Math.max(1, duration) - 1; left > 0; ) {
    d = addDays(d, -1);
    if (isWorkday(d, workdays)) left -= 1;
  }
  return d;
}

// Working days from start to end, both included.
export function workdaysBetween(start: string, end: string, workdays = DEFAULT_WORKDAYS): number {
  if (end < start) return 0;
  let n = 0;
  for (let d = start; d <= end; d = addDays(d, 1)) if (isWorkday(d, workdays)) n += 1;
  return n;
}

// The task spans a non-working day (shown on the bar).
export function crossesNonWorking(start: string | null, end: string | null, workdays = DEFAULT_WORKDAYS): boolean {
  if (!start || !end) return false;
  for (let d = start; d <= end; d = addDays(d, 1)) if (!isWorkday(d, workdays)) return true;
  return false;
}

// Two of start / end / duration given → the third. `changed` says which one
// the user just typed, so that one is kept.
export function reconcile(
  v: { kind: ItemKind; start_date: string | null; end_date: string | null; duration: number | null },
  changed: 'start' | 'end' | 'duration',
  workdays = DEFAULT_WORKDAYS,
): { start_date: string | null; end_date: string | null; duration: number | null } {
  if (v.kind === 'milestone') return { start_date: v.start_date, end_date: v.start_date, duration: 0 };
  let { start_date: s, end_date: e, duration: n } = v;
  if (changed === 'duration' && n != null && n > 0) {
    if (s) e = endFromDuration(s, n, workdays);
    else if (e) s = startFromDuration(e, n, workdays);
  } else if (changed === 'start' && s) {
    if (n != null && n > 0) e = endFromDuration(s, n, workdays);
    else if (e) n = e < s ? null : workdaysBetween(s, e, workdays);
    if (e && e < s) e = s;
  } else if (changed === 'end' && e) {
    if (s && e < s) s = e;
    if (s) n = workdaysBetween(s, e, workdays);
    else if (n != null && n > 0) s = startFromDuration(e, n, workdays);
  }
  return { start_date: s, end_date: e, duration: n };
}

// Late: planned end passed and not done. Days counted in calendar days.
export function lateDays(item: Pick<ScheduleItem, 'status' | 'end_date' | 'kind'>, today: string): number {
  if (item.status === 'done' || !item.end_date || item.kind === 'phase') return 0;
  const d = daysBetween(item.end_date, today);
  return d > 0 ? d : 0;
}

export interface Rolled {
  start: string | null;
  end: string | null;
  progress: number;
  late: number;
}

// A phase covers its children; its progress is the children's, weighted by
// duration when there is one (manual entry allowed: progress_manual).
export function rollup(items: ScheduleItem[], today: string): Map<string, Rolled> {
  const byParent = new Map<string | null, ScheduleItem[]>();
  for (const it of items) byParent.set(it.parent_id, [...(byParent.get(it.parent_id) ?? []), it]);
  const out = new Map<string, Rolled>();
  const visit = (it: ScheduleItem): Rolled => {
    const kids = byParent.get(it.id) ?? [];
    if (it.kind !== 'phase' || !kids.length) {
      const r = { start: it.start_date, end: it.end_date, progress: it.status === 'done' ? 100 : it.progress, late: lateDays(it, today) };
      out.set(it.id, r);
      return r;
    }
    const rs = kids.map(visit);
    const starts = rs.map((r) => r.start).filter(Boolean) as string[];
    const ends = rs.map((r) => r.end).filter(Boolean) as string[];
    let weight = 0;
    let sum = 0;
    kids.forEach((k, i) => {
      if (k.kind === 'milestone') return;
      const w = Math.max(1, k.kind === 'phase' ? (rs[i].start && rs[i].end ? daysBetween(rs[i].start!, rs[i].end!) + 1 : 1) : k.duration ?? 1);
      weight += w;
      sum += w * rs[i].progress;
    });
    const r: Rolled = {
      start: starts.length ? starts.sort()[0] : it.start_date,
      end: ends.length ? ends.sort().at(-1)! : it.end_date,
      progress: it.progress_manual ? it.progress : weight ? Math.round(sum / weight) : 0,
      late: Math.max(0, ...rs.map((x) => x.late)),
    };
    out.set(it.id, r);
    return r;
  };
  for (const it of byParent.get(null) ?? []) visit(it);
  // orphans (parent filtered out)
  for (const it of items) if (!out.has(it.id)) visit(it);
  return out;
}

// Would linking from → to close a loop?
export function wouldCycle(links: Pick<ScheduleLink, 'from_item' | 'to_item'>[], from: string, to: string): boolean {
  if (from === to) return true;
  const next = new Map<string, string[]>();
  for (const l of links) next.set(l.from_item, [...(next.get(l.from_item) ?? []), l.to_item]);
  const seen = new Set<string>();
  const stack = [to];
  while (stack.length) {
    const cur = stack.pop()!;
    if (cur === from) return true;
    if (seen.has(cur)) continue;
    seen.add(cur);
    stack.push(...(next.get(cur) ?? []));
  }
  return false;
}

export interface Shift {
  id: string;
  name: string;
  from: { start: string; end: string };
  to: { start: string; end: string };
}

export interface Conflict {
  id: string;
  name: string;
  needsStart: string; // earliest start allowed by its predecessors
  start: string;
}

// After `changedIds` moved: the successors that now start too early (finish
// → start). Each is pushed to the first working day after its latest
// predecessor, keeping its duration, and the push goes on downstream. Fixed
// tasks are not moved: they come back as conflicts. Nothing is applied here
// — the screen shows the list and asks first.
export function cascade(items: ScheduleItem[], links: ScheduleLink[], changedIds: string[], workdays = DEFAULT_WORKDAYS): { shifts: Shift[]; conflicts: Conflict[] } {
  const byId = new Map(items.map((i) => [i.id, { ...i }]));
  const preds = new Map<string, string[]>();
  const succs = new Map<string, string[]>();
  for (const l of links) {
    preds.set(l.to_item, [...(preds.get(l.to_item) ?? []), l.from_item]);
    succs.set(l.from_item, [...(succs.get(l.from_item) ?? []), l.to_item]);
  }
  const shifts = new Map<string, Shift>();
  const conflicts = new Map<string, Conflict>();
  const queue = [...changedIds];
  let guard = 0;
  while (queue.length && guard++ < 5000) {
    const id = queue.shift()!;
    for (const sid of succs.get(id) ?? []) {
      const s = byId.get(sid);
      if (!s || !s.start_date) continue;
      // a milestone has no length: the next task may start that same day
      const earliest = (preds.get(sid) ?? [])
        .map((p) => byId.get(p))
        .filter((p) => p?.end_date)
        .map((p) => nextWorkday(addDays(p!.end_date!, p!.kind === 'milestone' ? 0 : 1), workdays));
      if (!earliest.length) continue;
      const needs = earliest.sort().at(-1)!;
      if (s.start_date >= needs) continue;
      if (s.fixed || s.status === 'done') {
        conflicts.set(sid, { id: sid, name: s.name, needsStart: needs, start: s.start_date });
        continue;
      }
      const dur = s.kind === 'milestone' ? 0 : s.duration ?? (s.end_date ? workdaysBetween(s.start_date, s.end_date, workdays) : 1);
      const newEnd = s.kind === 'milestone' ? needs : endFromDuration(needs, dur, workdays);
      const prev = shifts.get(sid);
      shifts.set(sid, { id: sid, name: s.name, from: prev?.from ?? { start: s.start_date, end: s.end_date ?? s.start_date }, to: { start: needs, end: newEnd } });
      s.start_date = needs;
      s.end_date = newEnd;
      queue.push(sid);
    }
  }
  return { shifts: [...shifts.values()], conflicts: [...conflicts.values()] };
}

// Display order: depth-first by sort_order, with each line's depth.
export function flatten(items: ScheduleItem[], collapsed: Set<string> = new Set()): { item: ScheduleItem; depth: number; hasChildren: boolean }[] {
  const byParent = new Map<string | null, ScheduleItem[]>();
  for (const it of items) byParent.set(it.parent_id, [...(byParent.get(it.parent_id) ?? []), it]);
  for (const list of byParent.values()) list.sort((a, b) => a.sort_order - b.sort_order);
  const ids = new Set(items.map((i) => i.id));
  const out: { item: ScheduleItem; depth: number; hasChildren: boolean }[] = [];
  const walk = (parent: string | null, depth: number) => {
    for (const it of byParent.get(parent) ?? []) {
      const kids = byParent.get(it.id) ?? [];
      out.push({ item: it, depth, hasChildren: kids.length > 0 });
      if (!collapsed.has(it.id)) walk(it.id, depth + 1);
    }
  };
  walk(null, 0);
  // lines whose parent is not in the list (filtered) go at the top level
  for (const it of items) if (it.parent_id && !ids.has(it.parent_id) && !out.some((o) => o.item.id === it.id)) out.push({ item: it, depth: 0, hasChildren: false });
  return out;
}
