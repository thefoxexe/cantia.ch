// Planning de chantier — import from Excel (our own export, an MS Project
// "Save as Excel", or any table with a name and a start column) and from
// MS Project XML (MSPDI). Pure functions so Node can run the tests: the
// screen reads the .xlsx with SheetJS and hands the rows over.
import { DEFAULT_WORKDAYS, endFromDuration, nextWorkday, startFromDuration, workdaysBetween, type ItemKind } from './calc.ts';

export interface ImportLine {
  key: string;
  parent: string | null;
  kind: ItemKind;
  name: string;
  trade: string | null;
  company: string | null;
  duration: number | null;
  start_date: string | null;
  end_date: string | null;
  progress: number;
  notes: string | null;
}

export interface ImportPlan {
  lines: ImportLine[]; // parents before children, in file order
  links: [string, string][]; // finish-to-start: [from, to]
  skipped: number; // rows without a name
}

// ── dates and durations ────────────────────────────────────────────────

const pad = (n: number) => String(n).padStart(2, '0');

// Date object, Excel serial number, ISO, or Swiss / German "12.10.2026",
// "12/10/26", "Lu 12.10.26", "Mon 10/12/26" is ambiguous: day first.
export function toIsoDate(v: unknown): string | null {
  if (v == null || v === '') return null;
  if (v instanceof Date && !Number.isNaN(v.getTime())) {
    // SheetJS gives local midnight; a few minutes either way must not move the day
    const d = new Date(v.getTime() + 12 * 3600_000);
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
  }
  if (typeof v === 'number' && v > 20000 && v < 80000) {
    const d = new Date(Date.UTC(1899, 11, 30) + Math.round(v) * 86_400_000);
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
  }
  const s = String(v).trim();
  let m = s.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = s.match(/(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})/);
  if (m) {
    const y = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
    const mo = Number(m[2]);
    const d = Number(m[1]);
    if (mo >= 1 && mo <= 12 && d >= 1 && d <= 31) return `${y}-${pad(mo)}-${pad(d)}`;
  }
  return null;
}

// "5", "5 jours", "5 days", "5d", "5 j?", "2 sem.", "2 wks", "PT40H0M0S"
export function toWorkdays(v: unknown, minutesPerDay = 480): number | null {
  if (v == null || v === '') return null;
  if (typeof v === 'number') return Number.isFinite(v) ? Math.max(0, Math.round(v)) : null;
  const s = String(v).trim().toLowerCase();
  const iso = s.match(/^pt(\d+(?:\.\d+)?)h(\d+)m/);
  if (iso) return Math.max(0, Math.round((Number(iso[1]) * 60 + Number(iso[2])) / minutesPerDay));
  const m = s.match(/^(\d+(?:[.,]\d+)?)\s*([a-zéèäöü.]*)/);
  if (!m) return null;
  const n = Number(m[1].replace(',', '.'));
  const unit = m[2];
  if (/^(sem|w|wo)/.test(unit)) return Math.round(n * 5);
  if (/^(h|std|ore)/.test(unit)) return Math.round(n / (minutesPerDay / 60));
  if (/^(mo|mois|mon)/.test(unit)) return Math.round(n * 20);
  return Math.round(n);
}

// ── Excel ──────────────────────────────────────────────────────────────

const norm = (s: unknown) =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

type Col = 'name' | 'start' | 'end' | 'duration' | 'wbs' | 'id' | 'type' | 'after' | 'trade' | 'company' | 'notes' | 'progress' | 'level';

const EXACT: Record<Col, string[]> = {
  name: ['phase / tache', 'phase/tache', 'nom', 'nom de la tache', 'tache', 'task name', 'task', 'name', 'vorgangsname', 'phase / aufgabe', 'aufgabe', 'vorgang', 'fase / attivita', 'attivita', 'nome', 'nome attivita', 'designation', 'libelle', 'description'],
  start: ['debut', 'start', 'beginn', 'anfang', 'inizio', 'date de debut', 'start date', 'date debut'],
  end: ['fin', 'finish', 'end', 'ende', 'fine', 'date de fin', 'end date', 'date fin'],
  duration: [],
  wbs: ['n°', 'no', 'no.', 'nr', 'nr.', 'wbs', 'psp', 'psp-code', 'edt', 'numero', 'n.', 'outline number', 'numero hierarchique', 'gliederungsnummer'],
  id: ['id', 'nr. (id)'],
  type: ['type', 'typ', 'tipo'],
  after: ['apres', 'predecessors', 'predecesseurs', 'vorganger', 'vorgaenger', 'predecessori', 'dopo', 'nach', 'after'],
  trade: ['corps de metier', 'gewerk', 'mestiere', 'trade', 'metier'],
  company: ['entreprise', 'company', 'firma', 'impresa', 'unternehmen', 'resource names', 'noms des ressources', 'ressourcennamen', 'nomi risorse'],
  notes: ['remarques', 'notes', 'bemerkungen', 'osservazioni', 'notizen', 'note', 'remarque'],
  progress: ['% complete', '% acheve', '% abgeschlossen', '% completato'],
  level: ['outline level', 'niveau', 'niveau hierarchique', 'gliederungsebene', 'livello', 'livello struttura'],
};
const PREFIX: Partial<Record<Col, string[]>> = {
  duration: ['duree', 'duration', 'dauer', 'durata'],
  progress: ['avancement', 'progress', 'fortschritt', 'avanzamento'],
};

function mapHeader(row: unknown[]): Partial<Record<Col, number>> {
  const out: Partial<Record<Col, number>> = {};
  row.forEach((cell, i) => {
    const h = norm(cell);
    if (!h) return;
    for (const col of Object.keys(EXACT) as Col[]) {
      if (out[col] != null) continue;
      if (EXACT[col].includes(h) || PREFIX[col]?.some((p) => h.startsWith(p))) {
        out[col] = i;
        return;
      }
    }
  });
  return out;
}

function kindFromType(v: unknown): ItemKind | null {
  const t = norm(v);
  if (!t) return null;
  if (/jalon|milestone|meilenstein|traguardo|milestone/.test(t)) return 'milestone';
  if (/phase|fase|summary|recapitulati|sammel/.test(t)) return 'phase';
  if (/tache|task|aufgabe|vorgang|attivita/.test(t)) return 'task';
  return null;
}

export function parseScheduleSheet(rows: unknown[][], workdays = DEFAULT_WORKDAYS): ImportPlan {
  // header: the first of the first 15 rows with a name and a start column
  let headerAt = -1;
  let cols: Partial<Record<Col, number>> = {};
  for (let i = 0; i < Math.min(rows.length, 15); i++) {
    const c = mapHeader(rows[i] ?? []);
    if (c.name != null && (c.start != null || c.duration != null)) {
      headerAt = i;
      cols = c;
      break;
    }
  }
  if (headerAt < 0) return { lines: [], links: [], skipped: 0 };
  const get = (r: unknown[], c: Col) => (cols[c] != null ? r[cols[c]!] : undefined);

  type Raw = { key: string; indent: number; level: number | null; wbs: string | null; id: string | null; name: string; type: ItemKind | null; start: string | null; end: string | null; duration: number | null; after: string[]; trade: string | null; company: string | null; notes: string | null; progress: number };
  const raws: Raw[] = [];
  let skipped = 0;
  for (const r of rows.slice(headerAt + 1)) {
    if (!r || r.every((x) => x == null || String(x).trim() === '')) continue;
    const rawName = String(get(r, 'name') ?? '');
    const name = rawName.trim();
    if (!name) {
      skipped++;
      continue;
    }
    const wbs = get(r, 'wbs') != null && String(get(r, 'wbs')).trim() ? String(get(r, 'wbs')).trim() : null;
    const prog = get(r, 'progress');
    // 45, "45 %", or 0.45 from a cell formatted as a percentage
    const progress = typeof prog === 'number' ? (prog > 0 && prog < 1 ? prog * 100 : prog) : Number(String(prog ?? '').replace('%', '').replace(',', '.').trim()) || 0;
    raws.push({
      key: String(raws.length + 1),
      indent: rawName.length - rawName.trimStart().length,
      level: get(r, 'level') != null && String(get(r, 'level')).trim() ? Number(get(r, 'level')) : null,
      wbs: wbs && /^\d+(\.\d+)*$/.test(wbs) ? wbs : null,
      id: get(r, 'id') != null ? String(get(r, 'id')).trim() : null,
      name: name.slice(0, 200),
      type: kindFromType(get(r, 'type')),
      start: toIsoDate(get(r, 'start')),
      end: toIsoDate(get(r, 'end')),
      duration: toWorkdays(get(r, 'duration')),
      after: String(get(r, 'after') ?? '')
        .split(/[;,]/)
        .map((s) => s.trim().match(/^(\d+(?:\.\d+)*)/)?.[1] ?? '')
        .filter(Boolean),
      trade: str(get(r, 'trade'), 80),
      company: str(get(r, 'company'), 120),
      notes: str(get(r, 'notes'), 4000),
      progress: Math.max(0, Math.min(100, Math.round(progress))),
    });
  }

  // hierarchy: WBS numbers, else outline level, else indentation of the name
  const parent = new Map<string, string | null>();
  if (raws.some((r) => r.wbs?.includes('.'))) {
    const byWbs = new Map(raws.filter((r) => r.wbs).map((r) => [r.wbs!, r.key]));
    for (const r of raws) parent.set(r.key, r.wbs && r.wbs.includes('.') ? byWbs.get(r.wbs.slice(0, r.wbs.lastIndexOf('.'))) ?? null : null);
  } else {
    const useLevel = raws.some((r) => r.level != null && r.level > 1);
    const stack: { depth: number; key: string }[] = [];
    for (const r of raws) {
      const depth = useLevel ? r.level ?? 1 : r.indent;
      while (stack.length && stack[stack.length - 1].depth >= depth) stack.pop();
      parent.set(r.key, stack.length ? stack[stack.length - 1].key : null);
      stack.push({ depth, key: r.key });
    }
  }

  const byWbs = new Map(raws.filter((r) => r.wbs).map((r) => [r.wbs!, r.key]));
  const byId = new Map(raws.filter((r) => r.id).map((r) => [r.id!, r.key]));
  const byRow = new Map(raws.map((r, i) => [String(i + 1), r.key]));
  const links: [string, string][] = [];
  for (const r of raws)
    for (const a of r.after) {
      const from = byWbs.get(a) ?? byId.get(a) ?? byRow.get(a);
      if (from && from !== r.key) links.push([from, r.key]);
    }

  const lines = finish(
    raws.map((r) => ({ key: r.key, parent: parent.get(r.key) ?? null, type: r.type, name: r.name, trade: r.trade, company: r.company, start: r.start, end: r.end, duration: r.duration, progress: r.progress, notes: r.notes })),
    workdays,
  );
  return { lines, links: dedupe(links), skipped };
}

// ── MS Project XML (MSPDI) ─────────────────────────────────────────────

const unxml = (s: string) =>
  s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&amp;/g, '&');

const tagOf = (xml: string, tag: string): string | null => {
  const m = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
  return m ? unxml(m[1]) : null;
};

export function isMspdi(text: string): boolean {
  return /<Project[\s>]/.test(text) && /<Tasks>/.test(text);
}

export function parseMspdi(xml: string, workdays = DEFAULT_WORKDAYS): ImportPlan {
  const minutesPerDay = Number(tagOf(xml.slice(0, xml.indexOf('<Tasks>') > 0 ? xml.indexOf('<Tasks>') : 4000), 'MinutesPerDay')) || 480;
  const tasksXml = xml.match(/<Tasks>([\s\S]*)<\/Tasks>/)?.[1] ?? '';
  const blocks = tasksXml.match(/<Task>[\s\S]*?<\/Task>/g) ?? [];
  type T = { uid: string; level: number; name: string; summary: boolean; milestone: boolean; start: string | null; end: string | null; duration: number | null; progress: number; notes: string | null; preds: string[] };
  const tasks: T[] = [];
  let skipped = 0;
  for (const b of blocks) {
    const uid = tagOf(b, 'UID') ?? '';
    const level = Number(tagOf(b, 'OutlineLevel') ?? '1');
    if (uid === '0' || level === 0 || tagOf(b, 'IsNull') === '1') continue;
    const name = (tagOf(b, 'Name') ?? '').trim();
    if (!name) {
      skipped++;
      continue;
    }
    tasks.push({
      uid,
      level,
      name: name.slice(0, 200),
      summary: tagOf(b, 'Summary') === '1',
      milestone: tagOf(b, 'Milestone') === '1',
      start: toIsoDate(tagOf(b, 'Start')),
      end: toIsoDate(tagOf(b, 'Finish')),
      duration: toWorkdays(tagOf(b, 'Duration'), minutesPerDay),
      progress: Math.max(0, Math.min(100, Number(tagOf(b, 'PercentComplete') ?? '0') || 0)),
      notes: str(tagOf(b, 'Notes'), 4000),
      preds: (b.match(/<PredecessorLink>[\s\S]*?<\/PredecessorLink>/g) ?? []).map((l) => tagOf(l, 'PredecessorUID') ?? '').filter(Boolean),
    });
  }
  const key = new Map(tasks.map((t, i) => [t.uid, String(i + 1)]));
  const stack: { level: number; key: string }[] = [];
  const raw = tasks.map((t) => {
    while (stack.length && stack[stack.length - 1].level >= t.level) stack.pop();
    const parent = stack.length ? stack[stack.length - 1].key : null;
    stack.push({ level: t.level, key: key.get(t.uid)! });
    return {
      key: key.get(t.uid)!,
      parent,
      type: (t.summary ? 'phase' : t.milestone ? 'milestone' : 'task') as ItemKind,
      name: t.name,
      trade: null,
      company: null,
      start: t.start,
      end: t.end,
      duration: t.duration,
      progress: Math.round(t.progress),
      notes: t.notes,
    };
  });
  const links: [string, string][] = [];
  for (const t of tasks) for (const p of t.preds) if (key.has(p) && p !== t.uid) links.push([key.get(p)!, key.get(t.uid)!]);
  return { lines: finish(raw, workdays), links: dedupe(links), skipped };
}

// ── shared ─────────────────────────────────────────────────────────────

function str(v: unknown, max: number): string | null {
  const s = v == null ? '' : String(v).trim();
  return s ? s.slice(0, max) : null;
}

function dedupe(links: [string, string][]): [string, string][] {
  const seen = new Set<string>();
  return links.filter(([a, b]) => (seen.has(`${a}>${b}`) ? false : (seen.add(`${a}>${b}`), true)));
}

// Kinds, dates on working days, durations. A line with children is a phase
// (its dates are its children's); only phases hold lines.
function finish(
  raw: { key: string; parent: string | null; type: ItemKind | null; name: string; trade: string | null; company: string | null; start: string | null; end: string | null; duration: number | null; progress: number; notes: string | null }[],
  workdays: number[],
): ImportLine[] {
  const hasKids = new Set(raw.map((r) => r.parent).filter(Boolean) as string[]);
  return raw.map((r) => {
    const kind: ItemKind = hasKids.has(r.key) ? 'phase' : r.type === 'phase' ? 'task' : r.type ?? (r.duration === 0 ? 'milestone' : 'task');
    const base = { key: r.key, parent: r.parent, kind, name: r.name, trade: r.trade, company: r.company, progress: r.progress, notes: r.notes };
    if (kind === 'phase') return { ...base, duration: null, start_date: null, end_date: null };
    if (kind === 'milestone') {
      const d = r.start ?? r.end;
      return { ...base, duration: 0, start_date: d, end_date: d };
    }
    let start = r.start ? nextWorkday(r.start, workdays) : null;
    let end = r.end && start && r.end >= start ? r.end : null;
    let duration = r.duration && r.duration > 0 ? Math.min(3650, r.duration) : null;
    if (!start && r.end && duration) {
      // only an end: count back
      end = r.end;
      start = startFromDuration(r.end, duration, workdays);
    }
    if (start && !end) end = endFromDuration(start, duration ?? 1, workdays);
    if (start && end && !duration) duration = Math.max(1, workdaysBetween(start, end, workdays));
    return { ...base, duration, start_date: start, end_date: end };
  });
}

export function importStats(plan: ImportPlan) {
  return {
    phases: plan.lines.filter((l) => l.kind === 'phase').length,
    tasks: plan.lines.filter((l) => l.kind === 'task').length,
    milestones: plan.lines.filter((l) => l.kind === 'milestone').length,
    links: plan.links.length,
  };
}
