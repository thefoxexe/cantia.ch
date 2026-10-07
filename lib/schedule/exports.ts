// Planning de chantier — Excel rows and MS Project XML (MSPDI).
// Pure functions (no RN, no XLSX) so Node can run the tests; the screen
// turns the rows into an .xlsx with SheetJS.
import { DEFAULT_WORKDAYS, addDays as addDaysIso, flatten, workdaysBetween, type Rolled, type ScheduleItem, type ScheduleLink } from './calc.ts';

type Cell = string | number | Date | null;

const KIND = { phase: 'Phase', task: 'Tâche', milestone: 'Jalon' } as const;
const STATUS: Record<string, string> = { todo: 'À planifier', planned: 'Planifié', in_progress: 'En cours', done: 'Terminé', blocked: 'Bloqué' };

const asDate = (d: string | null | undefined) => (d ? new Date(`${d}T00:00:00Z`) : null);

// One line per phase / task / milestone, numbered like a WBS (1, 1.1, 1.2…);
// "Après" lists the numbers of the predecessors.
export function scheduleSheetRows(items: ScheduleItem[], links: Pick<ScheduleLink, 'from_item' | 'to_item'>[], rolled: Map<string, Rolled>, workdays = DEFAULT_WORKDAYS): Cell[][] {
  const rows = flatten(items);
  const wbs = outline(rows);
  const head: Cell[] = ['N°', 'Phase / tâche', 'Type', 'Corps de métier', 'Entreprise', 'Début', 'Fin', 'Durée (jours ouvrables)', 'Après', 'Avancement %', 'Statut', 'Remarques'];
  return [
    head,
    ...rows.map(({ item, depth }) => {
      const r = rolled.get(item.id);
      const start = r?.start ?? item.start_date;
      const end = r?.end ?? item.end_date;
      const dur = item.kind === 'milestone' ? 0 : item.kind === 'task' && item.duration ? item.duration : start && end ? workdaysBetween(start, end, workdays) : null;
      const after = links.filter((l) => l.to_item === item.id).map((l) => wbs.get(l.from_item)).filter(Boolean).join(', ');
      return [
        wbs.get(item.id) ?? '',
        `${'   '.repeat(depth)}${item.name}`,
        KIND[item.kind],
        item.trade ?? '',
        item.company ?? '',
        asDate(start),
        asDate(end),
        dur,
        after,
        item.kind === 'phase' ? r?.progress ?? 0 : item.status === 'done' ? 100 : item.progress ?? 0,
        item.kind === 'phase' ? '' : STATUS[item.status] ?? item.status,
        item.notes ?? '',
      ];
    }),
  ];
}

function outline(rows: { item: ScheduleItem; depth: number }[]): Map<string, string> {
  const out = new Map<string, string>();
  const counters: number[] = [];
  for (const { item, depth } of rows) {
    counters.length = depth + 1;
    counters[depth] = (counters[depth] ?? 0) + 1;
    out.set(item.id, counters.map((n) => n ?? 1).join('.'));
  }
  return out;
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// MS Project XML (MSPDI) — opens in MS Project, ProjectLibre, GanttProject…
// Working days 8:00–12:00 / 13:00–17:00, finish-to-start links. Lines
// without a predecessor get "start no earlier than" so the dates hold when
// MS Project recalculates.
export function scheduleMspdi(opts: { project: string; items: ScheduleItem[]; links: Pick<ScheduleLink, 'from_item' | 'to_item'>[]; rolled: Map<string, Rolled>; workdays?: number[]; now?: string }): string {
  const workdays = opts.workdays ?? DEFAULT_WORKDAYS;
  const rows = flatten(opts.items);
  const wbs = outline(rows);
  const uid = new Map(rows.map((r, i) => [r.item.id, i + 1]));
  const hasChildren = new Set(opts.items.map((i) => i.parent_id).filter(Boolean));
  const dates = rows.map(({ item }) => {
    const r = opts.rolled.get(item.id);
    return { start: r?.start ?? item.start_date, end: r?.end ?? item.end_date };
  });
  const allStarts = dates.map((d) => d.start).filter(Boolean).sort() as string[];
  const allEnds = dates.map((d) => d.end).filter(Boolean).sort() as string[];
  const first = allStarts[0] ?? (opts.now ?? new Date().toISOString()).slice(0, 10);
  const last = allEnds.at(-1) ?? first;
  const now = (opts.now ?? new Date().toISOString()).slice(0, 19);

  const tag = (k: string, v: string | number) => `<${k}>${typeof v === 'string' ? esc(v) : v}</${k}>`;
  // MS Project numbers weekdays Sunday = 1 … Saturday = 7; ours are ISO (Monday = 1)
  const weekDays = [1, 2, 3, 4, 5, 6, 7]
    .map((d) => {
      const iso = d === 1 ? 7 : d - 1;
      const on = workdays.includes(iso);
      return `<WeekDay><DayType>${d}</DayType><DayWorking>${on ? 1 : 0}</DayWorking>${
        on ? '<WorkingTimes><WorkingTime><FromTime>08:00:00</FromTime><ToTime>12:00:00</ToTime></WorkingTime><WorkingTime><FromTime>13:00:00</FromTime><ToTime>17:00:00</ToTime></WorkingTime></WorkingTimes>' : ''
      }</WeekDay>`;
    })
    .join('');

  // holidays, closures and days off of the chantier (see WorkCalendar)
  const offDays = [...((workdays as number[] & { off?: Set<string> }).off ?? [])].filter((d) => d >= addDaysIso(first, -31) && d <= addDaysIso(last, 365)).sort();
  const exceptions = offDays.length
    ? `<Exceptions>${offDays
        .map((d) => `<Exception><EnteredByOccurrences>0</EnteredByOccurrences><TimePeriod><FromDate>${d}T00:00:00</FromDate><ToDate>${d}T23:59:00</ToDate></TimePeriod><Occurrences>1</Occurrences><Name>Jour fermé</Name><Type>1</Type><DayWorking>0</DayWorking></Exception>`)
        .join('')}</Exceptions>`
    : '';

  const tasks = rows.map(({ item, depth }, i) => {
    const { start, end } = dates[i];
    const summary = item.kind === 'phase' || hasChildren.has(item.id);
    const milestone = item.kind === 'milestone';
    const days = milestone ? 0 : start && end ? Math.max(1, workdaysBetween(start, end, workdays)) : item.duration ?? 1;
    const preds = opts.links.filter((l) => l.to_item === item.id && uid.has(l.from_item));
    const notes = [item.trade ? `Corps de métier : ${item.trade}` : '', item.company ? `Entreprise : ${item.company}` : '', item.notes ?? ''].filter(Boolean).join('\n');
    const parts = [
      tag('UID', uid.get(item.id)!),
      tag('ID', i + 1),
      tag('Name', item.name),
      tag('Type', 1),
      tag('IsNull', 0),
      tag('CreateDate', now),
      tag('WBS', wbs.get(item.id)!),
      tag('OutlineNumber', wbs.get(item.id)!),
      tag('OutlineLevel', depth + 1),
      tag('Priority', 500),
      start ? tag('Start', `${start}T08:00:00`) : '',
      end ? tag('Finish', `${end}T${milestone ? '08:00:00' : '17:00:00'}`) : '',
      tag('Duration', `PT${days * 8}H0M0S`),
      tag('DurationFormat', 7),
      tag('Milestone', milestone ? 1 : 0),
      tag('Summary', summary ? 1 : 0),
      tag('PercentComplete', item.status === 'done' ? 100 : Math.round(item.progress ?? 0)),
      !summary && start && !preds.length ? tag('ConstraintType', 4) + tag('ConstraintDate', `${start}T08:00:00`) : tag('ConstraintType', 0),
      notes ? tag('Notes', notes) : '',
      ...preds.map((l) => `<PredecessorLink><PredecessorUID>${uid.get(l.from_item)}</PredecessorUID><Type>1</Type><CrossProject>0</CrossProject><LinkLag>0</LinkLag><LagFormat>7</LagFormat></PredecessorLink>`),
    ];
    return `<Task>${parts.join('')}</Task>`;
  });

  return [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<Project xmlns="http://schemas.microsoft.com/project">',
    tag('SaveVersion', 14),
    tag('Name', `${opts.project}.xml`),
    tag('Title', opts.project),
    tag('CreationDate', now),
    tag('ScheduleFromStart', 1),
    tag('StartDate', `${first}T08:00:00`),
    tag('FinishDate', `${last}T17:00:00`),
    tag('CalendarUID', 1),
    tag('DefaultStartTime', '08:00:00'),
    tag('DefaultFinishTime', '17:00:00'),
    tag('MinutesPerDay', 480),
    tag('MinutesPerWeek', 480 * workdays.length),
    tag('DaysPerMonth', 20),
    tag('DurationFormat', 7),
    `<Calendars><Calendar><UID>1</UID><Name>Cantia</Name><IsBaseCalendar>1</IsBaseCalendar><WeekDays>${weekDays}</WeekDays>${exceptions}</Calendar></Calendars>`,
    `<Tasks>${tasks.join('')}</Tasks>`,
    '</Project>',
  ].join('\n');
}
