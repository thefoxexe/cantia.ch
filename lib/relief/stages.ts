import type { ReliefAnswers, ReliefKind, ReliefSpec, ReliefStage } from './types';

// Where a project stands in the company's process, in plain functions (no
// React, no Supabase) so they can be tested (scripts/maquette.test.mjs):
// which process applies to a project, how far along it is from the
// durations the owner gave, when it should end, and what someone means when
// they say "the design is done, we're starting development".

// ------------------------------------------------------------ kinds

/** The kinds of projects of the company, each with its process. */
export function kindsOf(spec: Pick<ReliefSpec, 'stages' | 'vocabulary'>, answers: Pick<ReliefAnswers, 'stages' | 'kinds'> | null | undefined): ReliefKind[] {
  const clean = (stages: { label: string; owner?: string; days?: number; minDays?: number; client?: boolean }[]): ReliefStage[] =>
    stages
      .filter((s) => s.label && s.label.trim())
      .slice(0, 12)
      .map((s) => ({
        label: s.label.trim(),
        ...(s.owner ? { owner: s.owner } : {}),
        ...(s.days ? { days: s.days } : {}),
        ...(s.minDays ? { minDays: s.minDays } : {}),
        ...(s.client ? { client: true } : {}),
      }));
  const own = (answers?.kinds ?? []).map((k, i) => ({ id: k.id || `k${i}`, name: k.name.trim() || spec.vocabulary.item, stages: clean(k.stages) })).filter((k) => k.stages.length >= 2);
  if (own.length) return own;
  // Older worlds: one process, the one the AI wrote, with the owner's durations.
  const fromAnswers = answers?.stages ?? [];
  const stages = spec.stages.map((s, i) => {
    const a = fromAnswers.find((x) => x.label === s.label) ?? fromAnswers[i];
    return a && a.label === s.label ? { ...s, ...(a.minDays ? { minDays: a.minDays } : {}) } : s;
  });
  return [{ id: 'main', name: spec.vocabulary.item, stages }];
}

/** The kind a project most likely is, from its name (first kind otherwise). */
export function guessKind(kinds: ReliefKind[], name: string): ReliefKind {
  if (kinds.length <= 1) return kinds[0];
  const text = ` ${norm(name)} `;
  let best: { k: ReliefKind; score: number } | null = null;
  for (const k of kinds) {
    const words = norm(k.name)
      .split(' ')
      .filter((w) => w.length >= 3);
    const score = words.filter((w) => text.includes(` ${w}`)).length;
    if (score && (!best || score > best.score)) best = { k, score };
  }
  return best?.k ?? kinds[0];
}

// ------------------------------------------------------------ calendar

function parseDay(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function isoOf(d: Date) {
  return d.toISOString().slice(0, 10);
}

/** Working days (Monday to Friday) from one day to another, the first not counted. */
export function workingDaysBetween(from: string, to: string): number {
  const a = parseDay(from);
  const b = parseDay(to);
  if (b <= a) return 0;
  let n = 0;
  for (const d = new Date(a); d < b; ) {
    d.setUTCDate(d.getUTCDate() + 1);
    const w = d.getUTCDay();
    if (w !== 0 && w !== 6) n++;
  }
  return n;
}

/** The day that comes n working days after the given one. */
export function addWorkingDays(from: string, n: number): string {
  const d = parseDay(from);
  let left = Math.max(0, Math.round(n));
  while (left > 0) {
    d.setUTCDate(d.getUTCDate() + 1);
    const w = d.getUTCDay();
    if (w !== 0 && w !== 6) left--;
  }
  return isoOf(d);
}

const daysOf = (s: ReliefStage) => (s.days && s.days > 0 ? s.days : 1);

/** 0 to 1, from the durations: the steps behind plus the part of this one already spent. */
export function progressAt(stages: ReliefStage[], stage: number, elapsed: number): number {
  if (!stages.length) return 0;
  const i = Math.min(stages.length - 1, Math.max(0, stage));
  const total = stages.reduce((s, x) => s + daysOf(x), 0);
  const behind = stages.slice(0, i).reduce((s, x) => s + daysOf(x), 0);
  // Never "done" from time alone: a step ends when someone says so.
  const part = Math.min(daysOf(stages[i]) * 0.9, Math.max(0, elapsed));
  return Math.min(0.98, Math.max(0.02, (behind + part) / total));
}

/** When the item should end: what is left of this step, then the next ones. */
export function estimateEnd(stages: ReliefStage[], stage: number, since: string, today: string): string {
  const i = Math.min(stages.length - 1, Math.max(0, stage));
  const elapsed = workingDaysBetween(since, today);
  const left = Math.max(0, (stages[i]?.days ?? 0) - elapsed) + stages.slice(i + 1).reduce((s, x) => s + (x.days ?? 0), 0);
  return addWorkingDays(today, left);
}

/** Over the usual length of the step. */
export function stageOverdue(s: ReliefStage | undefined, elapsed: number | null): boolean {
  return !!s?.days && elapsed != null && elapsed > s.days;
}

/** Moving on before the minimum the owner gave. */
export function stageTooEarly(s: ReliefStage | undefined, elapsed: number | null): boolean {
  return !!s?.minDays && elapsed != null && elapsed < s.minDays;
}

// ------------------------------------------------------------ voice

/** Lower case, no accents, no punctuation: "Gros œuvre !" → "gros oeuvre". */
export function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const FINISH = [
  // fr
  'fini', 'finie', 'finis', 'finies', 'termine', 'terminee', 'termines', 'terminees', 'acheve', 'achevee', 'boucle', 'bouclee', 'valide', 'validee', 'livre', 'livree', 'c est fait', 'on a fini',
  // de
  'fertig', 'abgeschlossen', 'erledigt', 'beendet', 'gemacht', 'abgenommen', 'durch',
  // it
  'finito', 'finita', 'terminato', 'terminata', 'completato', 'completata', 'fatto', 'fatta', 'concluso', 'conclusa',
];
const START = [
  // fr
  'passe a', 'passe au', 'passe aux', 'passer a', 'passer au', 'passons a', 'passons au', 'passe en', 'passer en', 'on passe', 'on commence', 'commence', 'commencer', 'demarre', 'demarrer', 'debut', 'on attaque', 'attaque', 'on est en', 'on est a', 'en phase', 'maintenant',
  // de
  'beginnen', 'beginnt', 'starten', 'startet', 'jetzt', 'wechseln zu', 'weiter zu', 'sind in', 'sind bei', 'nun',
  // it
  'passiamo a', 'passiamo al', 'passiamo alla', 'passare a', 'passare al', 'inizia', 'iniziamo', 'cominciamo', 'siamo in', 'siamo alla', 'ora',
];
const NEXT = ['etape suivante', 'suivante', 'prochaine etape', 'naechste', 'nachste', 'naechster schritt', 'prossima', 'successiva', 'avanti', 'weiter'];

function find(text: string, phrase: string, from = 0): number {
  const t = ` ${text} `;
  const i = t.indexOf(` ${phrase} `, from);
  return i < 0 ? -1 : i;
}

function positions(text: string, words: string[]): number[] {
  return words.map((w) => find(text, w)).filter((i) => i >= 0);
}

export type StageCommand = { itemId: string | null; stage: number | null; reason: 'start' | 'finish' | 'mention' | 'next' | null };

/**
 * What a sentence asks, e.g. "Villa Dupont : la conception est terminée, on
 * passe au développement". The item is found by its name (when no item is
 * open), the step by its label, the intent by a few words in fr/de/it.
 */
export function parseStageCommand(
  said: string,
  opts: { items: { id: string; name: string; client?: string | null; stages: ReliefStage[]; stage: number }[]; current?: string | null },
): StageCommand {
  let text = norm(said);
  if (!text) return { itemId: null, stage: null, reason: null };

  // Which item: the open one, or the one whose name is said.
  let item = opts.items.find((i) => i.id === opts.current) ?? null;
  let best = 0;
  for (const it of opts.items) {
    const name = norm(it.name);
    if (!name) continue;
    let score = find(text, name) >= 0 ? 1 : 0;
    if (!score) {
      const words = name.split(' ').filter((w) => w.length >= 3);
      if (words.length) score = words.filter((w) => find(text, w) >= 0).length / words.length;
      // A word only this item has ("Favre"), in its name or its client's.
      const own = [...words, ...norm(it.client ?? '').split(' ')].filter(
        (w) => w.length >= 4 && find(text, w) >= 0 && !opts.items.some((o) => o.id !== it.id && ` ${norm(o.name)} ${norm(o.client ?? '')} `.includes(` ${w} `)),
      );
      if (own.length) score = Math.max(score, 0.6);
    }
    if (score > best && score >= 0.5) {
      best = score;
      item = it;
    }
  }
  if (!item) return { itemId: null, stage: null, reason: null };
  // The item's own name must not count as a step ("Studio Conception").
  const name = norm(item.name);
  if (name && find(text, name) >= 0) text = ` ${text} `.replace(` ${name} `, ' ').trim();

  // Which steps are said, and where.
  const labels = item.stages.map((s) => norm(s.label));
  const mentions: { stage: number; at: number }[] = [];
  labels.forEach((l, i) => {
    if (!l) return;
    let at = find(text, l);
    if (at < 0) {
      // A distinctive word of the label ("oeuvre" alone is shared, "gros" is not).
      const words = l.split(' ').filter((w) => w.length >= 5 && labels.filter((x) => x.split(' ').includes(w)).length === 1);
      for (const w of words) {
        const j = find(text, w);
        if (j >= 0) {
          at = j;
          break;
        }
      }
    }
    if (at >= 0) mentions.push({ stage: i, at });
  });
  mentions.sort((a, b) => a.at - b.at);
  const last = item.stages.length - 1;
  const starts = positions(text, START);
  const finishes = positions(text, FINISH);

  if (mentions.length && starts.length) {
    // "on passe au développement": the step said after the starting words.
    const s = Math.min(...starts);
    const after = mentions.find((m) => m.at > s);
    if (after) return { itemId: item.id, stage: after.stage, reason: 'start' };
  }
  if (mentions.length && finishes.length) {
    // "la conception est terminée": the step said closest to the finishing word.
    const f = finishes[0];
    const near = [...mentions].sort((a, b) => Math.abs(a.at - f) - Math.abs(b.at - f))[0];
    return { itemId: item.id, stage: Math.min(last, near.stage + 1), reason: 'finish' };
  }
  if (mentions.length) return { itemId: item.id, stage: mentions[mentions.length - 1].stage, reason: 'mention' };
  if (finishes.length || positions(text, NEXT).length) return { itemId: item.id, stage: Math.min(last, item.stage + 1), reason: 'next' };
  return { itemId: item.id, stage: null, reason: null };
}
