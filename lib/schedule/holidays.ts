// Planning de chantier — public holidays per canton, company closures and
// extra days off, folded into the working-day calendar. Pure (no RN), so
// Node can run the tests.
//
// The lists follow the usual cantonal calendars (official days plus the ones
// commonly off, e.g. Lundi du Jeûne in Vaud). They are indicative: a chantier
// can switch them off or add its own days.
import { DEFAULT_WORKDAYS, addDays, weekday } from './calc.ts';

export const CANTONS = ['AG', 'AI', 'AR', 'BE', 'BL', 'BS', 'FR', 'GE', 'GL', 'GR', 'JU', 'LU', 'NE', 'NW', 'OW', 'SG', 'SH', 'SO', 'SZ', 'TG', 'TI', 'UR', 'VD', 'VS', 'ZG', 'ZH'] as const;
export type Canton = (typeof CANTONS)[number];

type Key =
  | 'ny' | 'berchtold' | 'epiphany' | 'neRepublic' | 'stJoseph' | 'naefels' | 'goodFriday' | 'easterMonday' | 'may1'
  | 'ascension' | 'whitMonday' | 'corpusChristi' | 'juIndependence' | 'peterPaul' | 'national' | 'assumption'
  | 'jeuneGenevois' | 'lundiJeune' | 'allSaints' | 'immaculate' | 'christmas' | 'stStephen' | 'restauration';

const NAMES: Record<Key, { fr: string; de: string; it: string }> = {
  ny: { fr: 'Nouvel An', de: 'Neujahr', it: 'Capodanno' },
  berchtold: { fr: 'Saint-Berchtold', de: 'Berchtoldstag', it: 'San Bertoldo' },
  epiphany: { fr: 'Épiphanie', de: 'Dreikönigstag', it: 'Epifania' },
  neRepublic: { fr: 'Instauration de la République', de: 'Ausrufung der Republik', it: 'Proclamazione della Repubblica' },
  stJoseph: { fr: 'Saint-Joseph', de: 'Josefstag', it: 'San Giuseppe' },
  naefels: { fr: 'Näfelser Fahrt', de: 'Näfelser Fahrt', it: 'Näfelser Fahrt' },
  goodFriday: { fr: 'Vendredi saint', de: 'Karfreitag', it: 'Venerdì santo' },
  easterMonday: { fr: 'Lundi de Pâques', de: 'Ostermontag', it: 'Lunedì di Pasqua' },
  may1: { fr: '1er Mai', de: 'Tag der Arbeit', it: 'Festa del lavoro' },
  ascension: { fr: 'Ascension', de: 'Auffahrt', it: 'Ascensione' },
  whitMonday: { fr: 'Lundi de Pentecôte', de: 'Pfingstmontag', it: 'Lunedì di Pentecoste' },
  corpusChristi: { fr: 'Fête-Dieu', de: 'Fronleichnam', it: 'Corpus Domini' },
  juIndependence: { fr: 'Commémoration du plébiscite', de: 'Unabhängigkeitstag', it: 'Indipendenza giurassiana' },
  peterPaul: { fr: 'Saints Pierre et Paul', de: 'Peter und Paul', it: 'Santi Pietro e Paolo' },
  national: { fr: 'Fête nationale', de: 'Bundesfeier', it: 'Festa nazionale' },
  assumption: { fr: 'Assomption', de: 'Mariä Himmelfahrt', it: 'Assunzione' },
  jeuneGenevois: { fr: 'Jeûne genevois', de: 'Genfer Bettag', it: 'Digiuno ginevrino' },
  lundiJeune: { fr: 'Lundi du Jeûne fédéral', de: 'Bettagsmontag', it: 'Lunedì del Digiuno federale' },
  allSaints: { fr: 'Toussaint', de: 'Allerheiligen', it: 'Ognissanti' },
  immaculate: { fr: 'Immaculée Conception', de: 'Mariä Empfängnis', it: 'Immacolata' },
  christmas: { fr: 'Noël', de: 'Weihnachten', it: 'Natale' },
  stStephen: { fr: 'Saint-Étienne', de: 'Stephanstag', it: 'Santo Stefano' },
  restauration: { fr: 'Restauration de la République', de: 'Wiederherstellung der Republik', it: 'Restaurazione della Repubblica' },
};

const BASE: Key[] = ['ny', 'goodFriday', 'easterMonday', 'ascension', 'whitMonday', 'national', 'christmas', 'stStephen'];
const CATHOLIC: Key[] = ['corpusChristi', 'assumption', 'allSaints', 'immaculate'];

const BY_CANTON: Record<Canton, Key[]> = {
  ZH: [...BASE, 'berchtold', 'may1'],
  BE: [...BASE, 'berchtold'],
  LU: [...BASE, 'berchtold', ...CATHOLIC],
  UR: [...BASE, 'epiphany', 'stJoseph', ...CATHOLIC],
  SZ: [...BASE, 'epiphany', 'stJoseph', ...CATHOLIC],
  OW: [...BASE, 'berchtold', ...CATHOLIC],
  NW: [...BASE, 'stJoseph', ...CATHOLIC],
  GL: [...BASE, 'berchtold', 'naefels', 'allSaints'],
  ZG: [...BASE, 'berchtold', ...CATHOLIC],
  FR: [...BASE, 'berchtold', ...CATHOLIC],
  SO: [...BASE, 'berchtold', 'may1', ...CATHOLIC],
  BS: [...BASE, 'may1'],
  BL: [...BASE, 'may1'],
  SH: [...BASE, 'berchtold', 'may1'],
  AR: [...BASE],
  AI: [...BASE, ...CATHOLIC],
  SG: [...BASE, 'allSaints'],
  GR: [...BASE],
  AG: [...BASE, 'berchtold', ...CATHOLIC],
  TG: [...BASE, 'berchtold', 'may1'],
  TI: ['ny', 'epiphany', 'stJoseph', 'easterMonday', 'may1', 'ascension', 'whitMonday', 'corpusChristi', 'peterPaul', 'national', 'assumption', 'allSaints', 'immaculate', 'christmas', 'stStephen'],
  VD: ['ny', 'berchtold', 'goodFriday', 'easterMonday', 'ascension', 'whitMonday', 'national', 'lundiJeune', 'christmas'],
  VS: ['ny', 'stJoseph', 'ascension', 'corpusChristi', 'national', 'assumption', 'allSaints', 'immaculate', 'christmas'],
  NE: ['ny', 'berchtold', 'neRepublic', 'goodFriday', 'easterMonday', 'ascension', 'whitMonday', 'national', 'lundiJeune', 'christmas', 'stStephen'],
  GE: ['ny', 'goodFriday', 'easterMonday', 'ascension', 'whitMonday', 'national', 'jeuneGenevois', 'christmas', 'restauration'],
  JU: [...BASE, 'berchtold', 'may1', 'corpusChristi', 'juIndependence', 'assumption', 'allSaints'],
};

// Easter Sunday (Gregorian, anonymous algorithm).
export function easter(year: number): string {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

const md = (y: number, m: number, d: number) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
// n-th given ISO weekday (1 = Monday … 7 = Sunday) of a month
function nthWeekday(y: number, m: number, iso: number, n: number): string {
  let d = md(y, m, 1);
  while (weekday(d) !== iso) d = addDays(d, 1);
  return addDays(d, 7 * (n - 1));
}

function dateOf(key: Key, y: number): string {
  const e = easter(y);
  switch (key) {
    case 'ny': return md(y, 1, 1);
    case 'berchtold': return md(y, 1, 2);
    case 'epiphany': return md(y, 1, 6);
    case 'neRepublic': return md(y, 3, 1);
    case 'stJoseph': return md(y, 3, 19);
    case 'naefels': return nthWeekday(y, 4, 4, 1);
    case 'goodFriday': return addDays(e, -2);
    case 'easterMonday': return addDays(e, 1);
    case 'may1': return md(y, 5, 1);
    case 'ascension': return addDays(e, 39);
    case 'whitMonday': return addDays(e, 50);
    case 'corpusChristi': return addDays(e, 60);
    case 'juIndependence': return md(y, 6, 23);
    case 'peterPaul': return md(y, 6, 29);
    case 'national': return md(y, 8, 1);
    case 'assumption': return md(y, 8, 15);
    case 'jeuneGenevois': return addDays(nthWeekday(y, 9, 7, 1), 4);
    case 'lundiJeune': return addDays(nthWeekday(y, 9, 7, 3), 1);
    case 'allSaints': return md(y, 11, 1);
    case 'immaculate': return md(y, 12, 8);
    case 'christmas': return md(y, 12, 25);
    case 'stStephen': return md(y, 12, 26);
    case 'restauration': return md(y, 12, 31);
  }
}

export interface DayOff {
  date: string;
  name: string;
  source: 'holiday' | 'closure' | 'extra';
}

export function cantonHolidays(canton: Canton, year: number, lang: 'fr' | 'de' | 'it' = 'fr'): DayOff[] {
  return BY_CANTON[canton]
    .map((k) => ({ date: dateOf(k, year), name: NAMES[k][lang], source: 'holiday' as const }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export interface Closure {
  from: string;
  to: string;
  label: string;
}

export interface CalendarSettings {
  workdays: number[];
  canton: Canton | null;
  holidays: boolean; // the canton's public holidays are off
  closures: Closure[]; // company-wide (congés du bâtiment…)
  extra: string[]; // this chantier only
}

// Every day off between two dates, with its reason.
export function daysOff(s: CalendarSettings, from: string, to: string, lang: 'fr' | 'de' | 'it' = 'fr'): DayOff[] {
  const out = new Map<string, DayOff>();
  if (s.holidays && s.canton) {
    for (let y = Number(from.slice(0, 4)); y <= Number(to.slice(0, 4)); y++)
      for (const h of cantonHolidays(s.canton, y, lang)) if (h.date >= from && h.date <= to) out.set(h.date, h);
  }
  for (const c of s.closures) {
    for (let d = c.from > from ? c.from : from, n = 0; d <= c.to && d <= to && n < 400; d = addDays(d, 1), n++) if (!out.has(d)) out.set(d, { date: d, name: c.label, source: 'closure' });
  }
  for (const d of s.extra) if (d >= from && d <= to && !out.has(d)) out.set(d, { date: d, name: '', source: 'extra' });
  return [...out.values()].sort((a, b) => a.date.localeCompare(b.date));
}

// The calendar every schedule function takes as `workdays`: the worked
// weekdays, carrying the dates that are off (see isWorkday in calc.ts).
export type WorkCalendar = number[] & { off?: Set<string> };

export function workCalendar(s: CalendarSettings, from: string, to: string): WorkCalendar {
  const cal = [...(s.workdays?.length ? s.workdays : DEFAULT_WORKDAYS)] as WorkCalendar;
  cal.off = new Set(daysOff(s, from, to).map((d) => d.date));
  return cal;
}

// Canton from a Swiss postcode (NPA). Postcodes don't follow canton borders
// exactly, so this is a starting guess the user can change.
const NPA_RANGES: [number, number, Canton][] = [
  [1000, 1199, 'VD'], [1200, 1299, 'GE'], [1300, 1499, 'VD'], [1500, 1559, 'VD'], [1560, 1599, 'FR'],
  [1600, 1799, 'FR'], [1800, 1869, 'VD'], [1870, 1879, 'VS'], [1880, 1889, 'VD'], [1890, 1999, 'VS'],
  [2000, 2499, 'NE'], [2500, 2799, 'BE'], [2800, 2999, 'JU'], [3000, 3899, 'BE'], [3900, 3999, 'VS'],
  [4000, 4099, 'BS'], [4100, 4499, 'BL'], [4500, 4799, 'SO'], [4800, 4899, 'AG'], [4900, 4999, 'BE'],
  [5000, 5999, 'AG'], [6000, 6299, 'LU'], [6300, 6349, 'ZG'], [6350, 6399, 'NW'], [6400, 6459, 'SZ'],
  [6460, 6499, 'UR'], [6500, 6999, 'TI'], [7000, 7799, 'GR'], [8000, 8199, 'ZH'], [8200, 8299, 'SH'],
  [8300, 8499, 'ZH'], [8500, 8599, 'TG'], [8600, 8749, 'ZH'], [8750, 8799, 'GL'], [8800, 8849, 'ZH'],
  [8850, 8899, 'SZ'], [8900, 8999, 'ZH'], [9000, 9049, 'SG'], [9050, 9059, 'AI'], [9100, 9119, 'AR'],
  [9120, 9499, 'SG'], [9500, 9599, 'TG'], [9600, 9699, 'SG'],
];

export function cantonFromAddress(text: string | null | undefined): Canton | null {
  const m = text?.match(/\b([1-9]\d{3})\b/);
  if (!m) return null;
  const npa = Number(m[1]);
  return NPA_RANGES.find(([a, b]) => npa >= a && npa <= b)?.[2] ?? null;
}
