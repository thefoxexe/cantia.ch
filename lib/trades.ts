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
