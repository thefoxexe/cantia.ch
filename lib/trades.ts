export const TRADES = [
  'Génie civil',
  'Maçonnerie',
  'Serrurerie',
  'Électricité',
  'Plomberie / Sanitaire',
  'Menuiserie / Charpente',
  'Peinture',
  'Carrelage',
  'Chauffage / Ventilation',
  'Paysagisme',
  'Autre',
] as const;

export type Trade = (typeof TRADES)[number];

// organization.trade stores the French label verbatim as its canonical
// value (no separate id column) — this maps each stored value to a
// stable translation key, so the UI can localize the display label
// without migrating existing data.
export const TRADE_KEYS: Record<Trade, string> = {
  'Génie civil': 'genieCivil',
  Maçonnerie: 'maconnerie',
  Serrurerie: 'serrurerie',
  Électricité: 'electricite',
  'Plomberie / Sanitaire': 'plomberie',
  'Menuiserie / Charpente': 'menuiserie',
  Peinture: 'peinture',
  Carrelage: 'carrelage',
  'Chauffage / Ventilation': 'chauffage',
  Paysagisme: 'paysagisme',
  Autre: 'autre',
};
