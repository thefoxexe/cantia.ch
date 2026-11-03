// Planning de chantier — AI proposal (supabase/functions/generate-schedule)
// turned into a TemplateData, the same shape as a company template, so it is
// previewed and inserted exactly like one (planTemplate places it on working
// days, holidays and closures included). Pure functions so Node can run the
// tests.
import { DEFAULT_WORKDAYS, type ItemKind } from './calc.ts';
import { planTemplate, type TemplateData, type TemplateItem } from './templates.ts';
import type { ImportPlan } from './imports.ts';

export interface AiPlanItem {
  id: string;
  kind: 'task' | 'milestone';
  name: string;
  trade: string;
  workdays: number;
  after: string[];
}

export interface AiPlanPhase {
  name: string;
  items: AiPlanItem[];
}

export interface AiPlan {
  title: string;
  summary: string;
  assumptions: string[];
  phases: AiPlanPhase[];
}

const MAX_LINES = 200;
const MAX_WORKDAYS = 500;

const clean = (s: unknown, max = 160): string => (typeof s === 'string' ? s.replace(/\s+/g, ' ').trim().slice(0, max) : '');

// Lines in the AI's order, phases first; every "after" pointing at a line
// that does not exist is dropped, and so is any link that would close a loop.
// A line with nothing before it starts on day 0 of the chantier.
export function aiPlanToTemplate(plan: AiPlan): TemplateData {
  const items: TemplateItem[] = [];
  const keyOf = new Map<string, string>();
  let n = 0;
  for (const [pi, phase] of (plan.phases ?? []).entries()) {
    const phaseName = clean(phase?.name);
    const lines = (phase?.items ?? []).filter((it) => clean(it?.name));
    if (!phaseName || !lines.length) continue;
    const phaseKey = `p${pi + 1}`;
    items.push({ key: phaseKey, parent: null, kind: 'phase', name: phaseName, trade: null, duration: null, offset: null });
    for (const it of lines) {
      if (items.length >= MAX_LINES) break;
      const id = clean(it.id, 40) || `x${n}`;
      if (keyOf.has(id)) continue;
      const key = `a${++n}`;
      keyOf.set(id, key);
      const days = Math.round(Number(it.workdays));
      const milestone = it.kind === 'milestone' || !(days > 0);
      items.push({
        key,
        parent: phaseKey,
        kind: (milestone ? 'milestone' : 'task') as ItemKind,
        name: clean(it.name),
        trade: clean(it.trade, 60) || null,
        duration: milestone ? 0 : Math.min(days, MAX_WORKDAYS),
        offset: null,
      });
    }
  }

  const preds = new Map<string, string[]>();
  for (const phase of plan.phases ?? []) {
    for (const it of phase?.items ?? []) {
      const to = keyOf.get(clean(it?.id, 40));
      if (!to) continue;
      for (const a of it.after ?? []) {
        const from = keyOf.get(clean(a, 40));
        if (from && from !== to && !(preds.get(to) ?? []).includes(from)) preds.set(to, [...(preds.get(to) ?? []), from]);
      }
    }
  }

  // A link is kept only if it does not close a loop with the ones kept
  // before. Links that follow the order of the plan (from an earlier line to
  // a later one) are considered first, so in a loop it is the one pointing
  // backwards that goes.
  const order = new Map(items.map((it, i) => [it.key, i]));
  const candidates: [string, string][] = [];
  for (const it of items) for (const from of preds.get(it.key) ?? []) candidates.push([from, it.key]);
  const forward = (l: [string, string]) => (order.get(l[0])! < order.get(l[1])! ? 0 : 1);
  candidates.sort((a, b) => forward(a) - forward(b));
  const kept = new Map<string, string[]>();
  for (const [from, to] of candidates) {
    if (reachesKept(kept, from, to)) continue;
    kept.set(to, [...(kept.get(to) ?? []), from]);
  }
  const links: [string, string][] = candidates.filter(([from, to]) => (kept.get(to) ?? []).includes(from));
  links.sort((a, b) => order.get(a[1])! - order.get(b[1])! || order.get(a[0])! - order.get(b[0])!);

  for (const it of items) {
    if (it.kind !== 'phase' && !(kept.get(it.key) ?? []).length) it.offset = 0;
  }
  return { items, links };
}

// Is "target" upstream of "start" through the links kept so far?
function reachesKept(kept: Map<string, string[]>, start: string, target: string): boolean {
  const stack = [start];
  const seen = new Set<string>();
  while (stack.length) {
    const k = stack.pop()!;
    if (k === target) return true;
    if (seen.has(k)) continue;
    seen.add(k);
    stack.push(...(kept.get(k) ?? []));
  }
  return false;
}

// For a chantier that already has a planning: the proposal placed from a
// start date, in the import format, so it is appended after the existing
// lines like an Excel import.
export function templateToImportPlan(data: TemplateData, start: string, workdays = DEFAULT_WORKDAYS): ImportPlan {
  const lines = planTemplate(data, start, workdays).map((l) => ({
    key: l.key,
    parent: l.parent,
    kind: l.kind,
    name: l.name,
    trade: l.trade,
    company: null,
    duration: l.duration,
    start_date: l.start_date,
    end_date: l.end_date,
    progress: 0,
    notes: null,
  }));
  return { lines, links: data.links, skipped: 0 };
}
