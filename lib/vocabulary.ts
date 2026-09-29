// What the company calls its jobs (organizations.work_term): the app was
// written around "chantier"; a company that runs "projets", "mandats" or
// "dossiers" sees its own word everywhere instead. Implemented as an
// i18next post-processor (registered in lib/translations/index.ts), so every
// translated string follows without touching the dictionaries. Everything
// else works the same.

export type WorkTerm = 'chantier' | 'projet' | 'mandat' | 'dossier';
export const WORK_TERMS: WorkTerm[] = ['chantier', 'projet', 'mandat', 'dossier'];

let current: WorkTerm = 'chantier';

export function getWorkTerm(): WorkTerm {
  return current;
}

// Returns true when the term actually changed (the caller re-renders).
export function setWorkTerm(term: string | null | undefined): boolean {
  const next = (WORK_TERMS as string[]).includes(term ?? '') ? (term as WorkTerm) : 'chantier';
  if (next === current) return false;
  current = next;
  return true;
}

type Replacement = [RegExp, string | ((match: string) => string)];

function sameCase(source: string, word: string): string {
  if (source === source.toUpperCase()) return word.toUpperCase();
  if (source[0] === source[0].toUpperCase()) return word[0].toUpperCase() + word.slice(1);
  return word;
}

// French: chantier, projet, mandat and dossier are all masculine, so
// articles and agreements stay right.
function frRules(sg: string, pl: string): Replacement[] {
  return [
    [/\bchantiers\b/gi, (m) => sameCase(m, pl)],
    [/\bchantier\b/gi, (m) => sameCase(m, sg)],
  ];
}

// Italian: cantiere, progetto, mandato and dossier are all masculine too.
function itRules(sg: string, pl: string): Replacement[] {
  return [
    [/\bcantieri\b/gi, (m) => sameCase(m, pl)],
    [/\bcantiere\b/gi, (m) => sameCase(m, sg)],
  ];
}

// German: die Baustelle (feminine) becomes das Projekt / Mandat / Dossier
// (neuter), so the article or adjective in front changes with it.
const DE_WORDS: Record<Exclude<WorkTerm, 'chantier'>, { sg: string; gen: string; pl: string; plDat: string; compound: string }> = {
  projet: { sg: 'Projekt', gen: 'Projekts', pl: 'Projekte', plDat: 'Projekten', compound: 'Projekt' },
  mandat: { sg: 'Mandat', gen: 'Mandats', pl: 'Mandate', plDat: 'Mandaten', compound: 'Mandats' },
  dossier: { sg: 'Dossier', gen: 'Dossiers', pl: 'Dossiers', plDat: 'Dossiers', compound: 'Dossier' },
};

// Feminine determiner before "Baustelle" -> its neuter form. The "-er"
// forms are either dative (after a preposition: "auf der Baustelle" -> "auf
// dem Projekt") or genitive ("Name der Baustelle" -> "Name des Projekts").
const DE_NOM_ACC: [string, string][] = [
  ['die', 'das'],
  ['diese', 'dieses'],
  ['keine', 'kein'],
  ['eine', 'ein'],
  ['jede', 'jedes'],
  ['welche', 'welches'],
  ['Ihre', 'Ihr'],
  ['ihre', 'ihr'],
];
const DE_OBLIQUE: [string, string, string][] = [
  ['der', 'dem', 'des'],
  ['dieser', 'diesem', 'dieses'],
  ['keiner', 'keinem', 'keines'],
  ['einer', 'einem', 'eines'],
  ['jeder', 'jedem', 'jedes'],
  ['welcher', 'welchem', 'welches'],
  ['Ihrer', 'Ihrem', 'Ihres'],
  ['ihrer', 'ihrem', 'ihres'],
];
const DE_DATIVE_PREPS = ['auf', 'aus', 'bei', 'mit', 'nach', 'von', 'vom', 'zu', 'in', 'an', 'vor', 'hinter', 'neben', 'über', 'unter', 'zwischen', 'gegenüber', 'seit', 'ab'];

const DE_BARE = ['ein', 'kein', 'Ihr', 'ihr'];
const DE_ADJECTIVES = ['Neue', 'Verknüpfte', 'Betroffene', 'Aktive', 'Laufende', 'Erste', 'Nächste', 'Letzte', 'Ausgewählte', 'Zugewiesene', 'Offene', 'Abgeschlossene', 'Aktuelle'];

const DE_PLURAL_DATIVE = ['den', 'Ihren', 'ihren', 'zwischen', 'laufenden', 'allen', 'mehreren', 'mit', 'von', 'aus', 'bei', 'zu', 'in', 'an', 'auf'];

function deRules(term: Exclude<WorkTerm, 'chantier'>): Replacement[] {
  const w = DE_WORDS[term];
  const rules: Replacement[] = [];
  // Compounds first: Baustellenrapport -> Projektrapport, baustellenbezogen
  // -> projektbezogen, Baustellen-Feed -> Projekt-Feed.
  rules.push([/Baustellen(?=[a-zäöüß]|-[A-ZÄÖÜ])/g, w.compound]);
  rules.push([/baustellen(?=[a-zäöüß])/g, w.compound.toLowerCase()]);
  // Plural after a dative word, then plain plural.
  rules.push([new RegExp(`\\b(${DE_PLURAL_DATIVE.join('|')}) Baustellen\\b`, 'gi'), (m) => `${m.split(' ')[0]} ${w.plDat}`]);
  rules.push([/\bBaustellen\b/g, w.pl]);
  rules.push([/\bBAUSTELLEN\b/g, w.pl.toUpperCase()]);
  // "zur Baustelle" -> "zum Projekt".
  rules.push([/\b([Zz])ur( [a-zäöü]+)? Baustelle\b/g, (m) => m.replace(/ur\b/, 'um').replace(/Baustelle$/, w.sg)]);
  // Oblique singular, with an optional adjective ("-en", unchanged).
  for (const [fem, dat, gen] of DE_OBLIQUE) {
    rules.push([
      new RegExp(`(?:([A-Za-zäöüÄÖÜß]+) )?\\b(${fem})( [a-zäöü]+)? Baustelle\\b`, 'gi'),
      (m: string) => {
        const parts = m.split(' ');
        const hasPrev = parts.length >= 3 && parts[parts.length - 2] !== undefined && !new RegExp(`^${fem}$`, 'i').test(parts[0]);
        const prev = hasPrev ? parts[0] : null;
        const detIndex = hasPrev ? 1 : 0;
        const det = parts[detIndex];
        const adj = parts.length - detIndex === 3 ? parts[detIndex + 1] : null;
        const dative = !!prev && DE_DATIVE_PREPS.includes(prev.toLowerCase());
        const noun = dative ? w.sg : w.gen;
        return `${prev ? `${prev} ` : ''}${sameCase(det, dative ? dat : gen)}${adj ? ` ${adj}` : ''} ${noun}`;
      },
    ]);
  }
  // Nominative / accusative singular ("Ihre erste Baustelle" -> "Ihr erstes
  // Projekt": ein / kein / Ihr take no ending, the adjective carries it).
  for (const [fem, neu] of DE_NOM_ACC) {
    rules.push([
      new RegExp(`\\b(${fem})( [a-zäöü]+)? Baustelle\\b`, 'gi'),
      (m) => {
        const parts = m.split(' ');
        let adj = parts.length === 3 ? parts[1] : null;
        if (adj && DE_BARE.includes(neu) && adj.endsWith('e')) adj = `${adj}s`;
        return `${sameCase(parts[0], neu)}${adj ? ` ${adj}` : ''} ${w.sg}`;
      },
    ]);
  }
  // Adjective alone before the noun: "Neue Baustelle" -> "Neues Projekt".
  rules.push([new RegExp(`\\b(${DE_ADJECTIVES.join('|')}) Baustelle\\b`, 'g'), (m) => `${m.split(' ')[0]}s ${w.sg}`]);
  rules.push([/\bBaustelle\b/g, w.sg]);
  rules.push([/\bBAUSTELLE\b/g, w.sg.toUpperCase()]);
  return rules;
}

const RULES: Record<Exclude<WorkTerm, 'chantier'>, Record<'fr' | 'de' | 'it', Replacement[]>> = {
  projet: { fr: frRules('projet', 'projets'), de: deRules('projet'), it: itRules('progetto', 'progetti') },
  mandat: { fr: frRules('mandat', 'mandats'), de: deRules('mandat'), it: itRules('mandato', 'mandati') },
  dossier: { fr: frRules('dossier', 'dossiers'), de: deRules('dossier'), it: itRules('dossier', 'dossier') },
};

export function applyWorkTerm(value: string, lng: string | undefined, term: WorkTerm = current): string {
  if (term === 'chantier' || typeof value !== 'string') return value;
  const lang = lng === 'de' || lng === 'it' ? lng : 'fr';
  let out = value;
  for (const [pattern, replacement] of RULES[term][lang]) {
    out = out.replace(pattern, replacement as never);
  }
  return out;
}

// i18next post-processor (see lib/translations/index.ts).
export const workTermPostProcessor = {
  type: 'postProcessor' as const,
  name: 'workTerm',
  process(value: string, _key: string | string[], _options: unknown, translator: { language?: string }) {
    return applyWorkTerm(value, translator?.language);
  },
};

// The option names themselves ("Chantiers", "Projets"…) are never rewritten.
export function workTermText(t: (...args: any[]) => unknown, term: WorkTerm, field: 'plural' | 'example'): string {
  return String(t(`workTerm.${term}.${field}`, { postProcess: [] }));
}
