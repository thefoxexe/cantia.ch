// Best-effort NPA → localité lookup for the most common Swiss postal codes,
// used to auto-suggest the locality as soon as a 4-digit NPA is typed
// (everywhere the app collects a structured address). This is a
// convenience shortcut, not an exhaustive official registry — an unknown
// NPA simply doesn't autofill anything, and the user types the locality
// themselves exactly as before.
const NPA_TO_LOCALITY: Record<string, string> = {
  // Genève
  '1200': 'Genève',
  '1201': 'Genève',
  '1202': 'Genève',
  '1203': 'Genève',
  '1204': 'Genève',
  '1205': 'Genève',
  '1206': 'Genève',
  '1207': 'Genève',
  '1208': 'Genève',
  '1209': 'Genève',
  '1213': 'Onex',
  '1214': 'Vernier',
  '1217': 'Meyrin',
  '1227': 'Carouge',
  '1228': 'Plan-les-Ouates',
  '1233': 'Bernex',
  '1255': 'Veyrier',
  '1260': 'Nyon',
  '1290': 'Versoix',
  // Vaud
  '1000': 'Lausanne',
  '1003': 'Lausanne',
  '1004': 'Lausanne',
  '1005': 'Lausanne',
  '1006': 'Lausanne',
  '1007': 'Lausanne',
  '1010': 'Lausanne',
  '1012': 'Lausanne',
  '1018': 'Lausanne',
  '1020': 'Renens',
  '1030': 'Bussigny',
  '1110': 'Morges',
  '1170': 'Aubonne',
  '1180': 'Rolle',
  '1196': 'Gland',
  '1304': 'Cossonay',
  '1400': 'Yverdon-les-Bains',
  '1800': 'Vevey',
  '1820': 'Montreux',
  // Valais
  '1870': 'Monthey',
  '1920': 'Martigny',
  '1934': 'Le Châble',
  '1950': 'Sion',
  '1964': 'Conthey',
  '3960': 'Sierre',
  // Fribourg
  '1630': 'Bulle',
  '1680': 'Romont',
  '1700': 'Fribourg',
  '1618': 'Châtel-Saint-Denis',
  // Neuchâtel
  '2000': 'Neuchâtel',
  '2300': 'La Chaux-de-Fonds',
  '2400': 'Le Locle',
  // Jura / Jura bernois
  '2610': 'Saint-Imier',
  '2710': 'Tavannes',
  '2740': 'Moutier',
  '2800': 'Delémont',
  '2900': 'Porrentruy',
  // Berne
  '2500': 'Biel/Bienne',
  '3000': 'Bern',
  '3600': 'Thun',
  // Suisse alémanique / Tessin
  '4000': 'Basel',
  '4500': 'Solothurn',
  '5000': 'Aarau',
  '6000': 'Luzern',
  '6300': 'Zug',
  '6500': 'Bellinzona',
  '6600': 'Locarno',
  '6900': 'Lugano',
  '7000': 'Chur',
  '8000': 'Zürich',
  '8200': 'Schaffhausen',
  '8400': 'Winterthur',
  '8500': 'Frauenfeld',
  '9000': 'St. Gallen',
};

// Only fires once the NPA looks complete (4 digits) — a partial NPA like
// "19" would otherwise flicker through unrelated matches while typing.
export function localityForNpa(npa: string): string | null {
  const trimmed = npa.trim();
  if (!/^\d{4}$/.test(trimmed)) return null;
  return NPA_TO_LOCALITY[trimmed] ?? null;
}
