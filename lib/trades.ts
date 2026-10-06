export const TRADES = [
  'Construction & gros œuvre',
  'Second œuvre & finitions',
  'Technique du bâtiment',
  'Architecture & ingénierie',
  'Immobilier & gérance',
  'Paysagisme & extérieurs',
  'Nettoyage & entretien',
  'Artisanat & fabrication',
  'Services & conseil',
  'Autre',
] as const;

export type Trade = (typeof TRADES)[number];

// organization.trade stores the French label verbatim as its canonical
// value (no separate id column) — this maps each stored value to a
// stable translation key, so the UI can localize the display label
// without migrating existing data. Broad sectors (not only construction
// trades): companies set up with an earlier, trade-level value keep it
// (see LEGACY_TRADES), it simply isn't offered any more.
export const TRADE_KEYS: Record<Trade, string> = {
  'Construction & gros œuvre': 'construction',
  'Second œuvre & finitions': 'finitions',
  'Technique du bâtiment': 'technique',
  'Architecture & ingénierie': 'architecture',
  'Immobilier & gérance': 'immobilier',
  'Paysagisme & extérieurs': 'paysagisme',
  'Nettoyage & entretien': 'nettoyage',
  'Artisanat & fabrication': 'artisanat',
  'Services & conseil': 'services',
  Autre: 'autre',
};

// The trade-level values of the first version, still stored on existing
// organizations: shown (selected) until the company picks a sector.
export const LEGACY_TRADE_KEYS: Record<string, string> = {
  'Génie civil': 'genieCivil',
  Maçonnerie: 'maconnerie',
  Serrurerie: 'serrurerie',
  Électricité: 'electricite',
  'Plomberie / Sanitaire': 'plomberie',
  'Menuiserie / Charpente': 'menuiserie',
  Peinture: 'peinture',
  Carrelage: 'carrelage',
  'Chauffage / Ventilation': 'chauffage',
  Paysagisme: 'paysagismeOld',
};

// Building sectors: the companies that receive soumissions (CAN / NPK) to
// fill. Only they get the "Remplir une soumission" module — anyone else
// (fiduciaire, drone pilot, services) never sees it, it is not even offered.
// Same list in SQL: public.org_fills_soumissions().
export const BUILDING_SECTORS: readonly Trade[] = ['Construction & gros œuvre', 'Second œuvre & finitions', 'Technique du bâtiment', 'Paysagisme & extérieurs'];

export function isBuildingTrade(trade: string | null | undefined): boolean {
  if (!trade) return false;
  return (BUILDING_SECTORS as readonly string[]).includes(trade) || trade in LEGACY_TRADE_KEYS;
}

// A building company working in "chantiers" (or "projets"); with mandats /
// dossiers the vocabulary itself says it is not a site business.
export function fillsSoumissions(org: { trade: string | null; work_term?: string | null } | null | undefined): boolean {
  return !!org && isBuildingTrade(org.trade) && org.work_term !== 'mandat' && org.work_term !== 'dossier';
}

// What the company actually does inside its sector (several allowed), asked
// right after the sector at sign-up. Stored as these keys in
// organizations.trade_specialties; labels in translations "specialties".
export const SPECIALTIES: Partial<Record<Trade, string[]>> = {
  'Construction & gros œuvre': ['genieCivil', 'maconnerie', 'betonArme', 'terrassement', 'charpente', 'echafaudages', 'demolition'],
  'Second œuvre & finitions': ['menuiserie', 'platreriePeinture', 'carrelage', 'sols', 'agencement', 'vitrerie', 'isolation'],
  'Technique du bâtiment': ['electricite', 'sanitaire', 'chauffage', 'ventilation', 'ferblanterie', 'serrurerie', 'domotique'],
  'Paysagisme & extérieurs': ['amenagements', 'jardinage', 'clotures', 'piscines'],
};
