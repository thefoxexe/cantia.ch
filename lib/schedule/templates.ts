// Planning de chantier — company templates (migration 20261007190000).
// Pure functions (no Supabase, no RN) so Node can run the tests.
//
// A template keeps the structure only: phases, tasks, milestones, trades,
// durations in working days, how many working days after the beginning each
// line starts, and the "after" links. Never the real dates, companies,
// people or progress.
import { DEFAULT_WORKDAYS, addDays, endFromDuration, flatten, nextWorkday, workdaysBetween, type ItemKind, type ScheduleItem, type ScheduleLink } from './calc.ts';

export interface TemplateItem {
  key: string;
  parent: string | null;
  kind: ItemKind;
  name: string;
  trade: string | null;
  duration: number | null;
  // working days from the beginning of the chantier (null: not planned)
  offset: number | null;
}

export interface TemplateData {
  items: TemplateItem[];
  links: [string, string][];
}

export interface PlannedLine {
  key: string;
  parent: string | null;
  kind: ItemKind;
  name: string;
  trade: string | null;
  duration: number | null;
  start_date: string | null;
  end_date: string | null;
  sort_order: number;
}

// Chantier → template. Keys are short ("1", "2"…) so the JSON stays small.
export function toTemplate(items: ScheduleItem[], links: Pick<ScheduleLink, 'from_item' | 'to_item'>[], workdays = DEFAULT_WORKDAYS): TemplateData {
  const rows = flatten(items);
  const key = new Map(rows.map((r, i) => [r.item.id, String(i + 1)]));
  const starts = items.filter((i) => i.kind !== 'phase' && i.start_date).map((i) => i.start_date!).sort();
  const first = starts[0] ?? null;
  return {
    items: rows.map(({ item }) => {
      const duration =
        item.kind === 'phase' ? null : item.kind === 'milestone' ? 0 : item.duration ?? (item.start_date && item.end_date ? Math.max(1, workdaysBetween(item.start_date, item.end_date, workdays)) : null);
      return {
        key: key.get(item.id)!,
        parent: item.parent_id ? key.get(item.parent_id) ?? null : null,
        kind: item.kind,
        name: item.name,
        trade: item.trade ?? null,
        duration,
        offset: item.kind !== 'phase' && item.start_date && first ? Math.max(0, workdaysBetween(first, item.start_date, workdays) - 1) : null,
      };
    }),
    links: links.filter((l) => key.has(l.from_item) && key.has(l.to_item)).map((l) => [key.get(l.from_item)!, key.get(l.to_item)!]),
  };
}

// Template → lines with dates, from a start date: each line at its offset,
// but never before the end of what it comes after. Parents come first.
export function planTemplate(data: TemplateData, start: string, workdays = DEFAULT_WORKDAYS): PlannedLine[] {
  const byKey = new Map(data.items.map((i) => [i.key, i]));
  const preds = new Map<string, string[]>();
  for (const [from, to] of data.links) preds.set(to, [...(preds.get(to) ?? []), from]);
  const dates = new Map<string, { start: string | null; end: string | null }>();
  const visiting = new Set<string>();

  const place = (k: string): { start: string | null; end: string | null } => {
    const done = dates.get(k);
    if (done) return done;
    const it = byKey.get(k);
    if (!it || it.kind === 'phase' || visiting.has(k)) return { start: null, end: null };
    visiting.add(k);
    let s: string | null = it.offset != null ? endFromDuration(start, it.offset + 1, workdays) : null;
    for (const p of preds.get(k) ?? []) {
      const pd = place(p);
      if (!pd.end) continue;
      const after = byKey.get(p)?.kind === 'milestone' ? nextWorkday(pd.end, workdays) : nextWorkday(addDays(pd.end, 1), workdays);
      if (!s || after > s) s = after;
    }
    visiting.delete(k);
    const r = !s
      ? { start: null, end: null }
      : it.kind === 'milestone'
        ? { start: s, end: s }
        : { start: s, end: it.duration ? endFromDuration(s, it.duration, workdays) : s };
    dates.set(k, r);
    return r;
  };

  // parents before children, keeping the template's order otherwise
  const ordered: TemplateItem[] = [];
  const seen = new Set<string>();
  const push = (it: TemplateItem, depth = 0) => {
    if (seen.has(it.key) || depth > 20) return;
    const parent = it.parent ? byKey.get(it.parent) : undefined;
    if (parent) push(parent, depth + 1);
    seen.add(it.key);
    ordered.push(it);
  };
  data.items.forEach((it) => push(it));

  return ordered.map((it, i) => {
    const d = place(it.key);
    return {
      key: it.key,
      parent: it.parent && byKey.has(it.parent) ? it.parent : null,
      kind: it.kind,
      name: it.name,
      trade: it.trade,
      duration: it.kind === 'phase' ? null : it.duration,
      start_date: d.start,
      end_date: d.end,
      sort_order: (i + 1) * 10,
    };
  });
}

export function templateStats(data: TemplateData): { phases: number; tasks: number; milestones: number; days: number } {
  const lines = planTemplate(data, '2030-01-07');
  const ends = lines.map((l) => l.end_date).filter(Boolean).sort() as string[];
  return {
    phases: data.items.filter((i) => i.kind === 'phase').length,
    tasks: data.items.filter((i) => i.kind === 'task').length,
    milestones: data.items.filter((i) => i.kind === 'milestone').length,
    days: ends.length ? workdaysBetween('2030-01-07', ends.at(-1)!) : 0,
  };
}

// Cahier des charges §5: villa, indicative durations, finish-to-start.
const VILLA: { phase: string; tasks: [string, string, string, number, string[]][] }[] = [
  { phase: 'Préparation', tasks: [['t1', 'Installation et préparation', 'Installation de chantier', 2, []]] },
  {
    phase: 'Gros œuvre',
    tasks: [
      ['t2', 'Terrassement', 'Terrassement', 5, ['t1']],
      ['t3', 'Fondations et radier', 'Maçonnerie / béton', 5, ['t2']],
      ['t4', 'Murs et dalle du rez-de-chaussée', 'Maçonnerie / béton', 10, ['t3']],
      ['t5', 'Murs et dalle de l’étage', 'Maçonnerie / béton', 10, ['t4']],
    ],
  },
  {
    phase: 'Enveloppe',
    tasks: [
      ['t6', 'Charpente', 'Charpente', 5, ['t5']],
      ['t7', 'Couverture et mise hors d’eau', 'Couverture', 5, ['t6']],
      ['t8', 'Fenêtres et étanchéité extérieure', 'Fenêtres / façade', 5, ['t5']],
    ],
  },
  {
    phase: 'Second œuvre',
    tasks: [
      ['t9', 'Installations techniques', 'Électricité', 10, ['t7', 't8']],
      ['t10', 'Cloisons et plâtrerie', 'Plâtrerie', 8, ['t9']],
      ['t11', 'Chape', 'Chape', 3, ['t10']],
      ['t12', 'Carrelage, peinture et finitions', 'Peinture', 10, ['t11']],
    ],
  },
  { phase: 'Fin de chantier', tasks: [['t13', 'Réception', 'Réception', 0, ['t12']]] },
];

export const VILLA_TEMPLATE: TemplateData = {
  items: VILLA.flatMap((ph, i) => [
    { key: `p${i + 1}`, parent: null, kind: 'phase' as const, name: ph.phase, trade: null, duration: null, offset: null },
    ...ph.tasks.map(([key, name, trade, days, after]) => ({
      key,
      parent: `p${i + 1}`,
      kind: (days ? 'task' : 'milestone') as ItemKind,
      name,
      trade,
      duration: days,
      offset: after.length ? null : 0,
    })),
  ]),
  links: VILLA.flatMap((ph) => ph.tasks.flatMap(([key, , , , after]) => after.map((a) => [a, key] as [string, string]))),
};
