import AsyncStorage from '@react-native-async-storage/async-storage';

// Where the company is, for the world around its Relief: the landmark of its
// town built in 3D at the back of the island, its lake or river, the
// mountains on the horizon (Alps, Prealps, Jura), and the map details of the
// cartouche (Swiss LV95 coordinates, altitude, canton). Found from the
// locality stored on the organization (organizations.locality).

export type ReliefLandmark = 'cathedrale' | 'basel' | 'jetdeau' | 'valere' | 'grossmunster' | 'zytglogge' | 'chillon' | 'kapellbrucke' | 'porte' | null;
export type ReliefBackdrop = 'alps' | 'prealps' | 'jura' | 'plain';
type Tri = [string, string, string];

export interface ReliefGeo {
  city: string;
  canton: string | null;
  lat: number | null;
  lon: number | null;
  elevation: number | null;
  /** Swiss LV95 coordinates (m), when the town was found. */
  e: number | null;
  n: number | null;
  landmark: ReliefLandmark;
  backdrop: ReliefBackdrop;
  water: { kind: 'lake' | 'river'; name: string } | null;
  /** Map names written in the scene: landmark(s), horizon. */
  names: { landmark: string[]; horizon: string | null };
}

interface Place {
  match: string[];
  landmark: ReliefLandmark;
  backdrop: ReliefBackdrop;
  water?: { kind: 'lake' | 'river'; name: Tri };
  landmarkNames: Tri[];
  horizon?: Tri;
}

const PLACES: Place[] = [
  { match: ['lausanne', 'pully', 'renens', 'prilly', 'ecublens'], landmark: 'cathedrale', backdrop: 'alps', water: { kind: 'lake', name: ['Lac Léman', 'Genfersee', 'Lago Lemano'] }, landmarkNames: [['Cathédrale', 'Kathedrale', 'Cattedrale']], horizon: ['Alpes de Savoie', 'Savoyer Alpen', 'Alpi della Savoia'] },
  { match: ['geneve', 'genf', 'ginevra', 'carouge', 'lancy', 'vernier', 'meyrin'], landmark: 'jetdeau', backdrop: 'prealps', water: { kind: 'lake', name: ['Lac Léman', 'Genfersee', 'Lago Lemano'] }, landmarkNames: [['Jet d’eau', 'Jet d’eau', 'Jet d’eau']], horizon: ['Salève', 'Salève', 'Salève'] },
  { match: ['sion', 'sitten'], landmark: 'valere', backdrop: 'alps', water: { kind: 'river', name: ['Rhône', 'Rhone', 'Rodano'] }, landmarkNames: [['Valère', 'Valeria', 'Valère'], ['Tourbillon', 'Tourbillon', 'Tourbillon']], horizon: ['Alpes valaisannes', 'Walliser Alpen', 'Alpi vallesane'] },
  { match: ['zurich', 'zuerich', 'zurigo', 'winterthur', 'dubendorf', 'uster'], landmark: 'grossmunster', backdrop: 'prealps', water: { kind: 'lake', name: ['Lac de Zurich', 'Zürichsee', 'Lago di Zurigo'] }, landmarkNames: [['Grossmünster', 'Grossmünster', 'Grossmünster']], horizon: ['Glärnisch', 'Glärnisch', 'Glärnisch'] },
  { match: ['bern', 'berne', 'berna', 'koniz', 'koeniz', 'ostermundigen'], landmark: 'zytglogge', backdrop: 'alps', water: { kind: 'river', name: ['Aar', 'Aare', 'Aar'] }, landmarkNames: [['Zytglogge', 'Zytglogge', 'Zytglogge']], horizon: ['Eiger · Mönch · Jungfrau', 'Eiger · Mönch · Jungfrau', 'Eiger · Mönch · Jungfrau'] },
  { match: ['basel', 'bale', 'basilea', 'riehen', 'allschwil', 'muttenz'], landmark: 'basel', backdrop: 'jura', water: { kind: 'river', name: ['Rhin', 'Rhein', 'Reno'] }, landmarkNames: [['Münster', 'Münster', 'Münster']], horizon: ['Jura', 'Jura', 'Giura'] },
  { match: ['lugano', 'paradiso', 'massagno'], landmark: null, backdrop: 'alps', water: { kind: 'lake', name: ['Lac de Lugano', 'Luganersee', 'Ceresio'] }, landmarkNames: [], horizon: ['San Salvatore', 'San Salvatore', 'San Salvatore'] },
  { match: ['luzern', 'lucerne', 'lucerna', 'kriens', 'emmen', 'horw'], landmark: 'kapellbrucke', backdrop: 'alps', water: { kind: 'lake', name: ['Lac des Quatre-Cantons', 'Vierwaldstättersee', 'Lago dei Quattro Cantoni'] }, landmarkNames: [['Kapellbrücke', 'Kapellbrücke', 'Kapellbrücke']], horizon: ['Pilatus', 'Pilatus', 'Pilatus'] },
  { match: ['montreux', 'vevey', 'villeneuve', 'la tour-de-peilz', 'clarens'], landmark: 'chillon', backdrop: 'alps', water: { kind: 'lake', name: ['Lac Léman', 'Genfersee', 'Lago Lemano'] }, landmarkNames: [['Château de Chillon', 'Schloss Chillon', 'Castello di Chillon']], horizon: ['Dents du Midi', 'Dents du Midi', 'Dents du Midi'] },
  { match: ['fribourg', 'freiburg', 'friburgo', 'villars-sur-glane', 'marly'], landmark: 'cathedrale', backdrop: 'prealps', water: { kind: 'river', name: ['Sarine', 'Saane', 'Sarine'] }, landmarkNames: [['Cathédrale Saint-Nicolas', 'Kathedrale St. Nikolaus', 'Cattedrale di San Nicolao']], horizon: ['Préalpes fribourgeoises', 'Freiburger Voralpen', 'Prealpi friburghesi'] },
  { match: ['neuchatel', 'neuenburg', 'peseux', 'hauterive'], landmark: 'cathedrale', backdrop: 'jura', water: { kind: 'lake', name: ['Lac de Neuchâtel', 'Neuenburgersee', 'Lago di Neuchâtel'] }, landmarkNames: [['Collégiale', 'Kollegiatkirche', 'Collegiata']], horizon: ['Chaumont', 'Chaumont', 'Chaumont'] },
  { match: ['delemont', 'delsberg', 'porrentruy', 'courrendlin', 'bassecourt'], landmark: 'porte', backdrop: 'jura', water: { kind: 'river', name: ['Sorne', 'Sorne', 'Sorne'] }, landmarkNames: [['Porte au Loup', 'Wolfstor', 'Porte au Loup']], horizon: ['Jura', 'Jura', 'Giura'] },
  { match: ['biel', 'bienne', 'nidau'], landmark: null, backdrop: 'jura', water: { kind: 'lake', name: ['Lac de Bienne', 'Bielersee', 'Lago di Bienne'] }, landmarkNames: [], horizon: ['Jura', 'Jura', 'Giura'] },
  { match: ['la chaux-de-fonds', 'le locle'], landmark: null, backdrop: 'jura', landmarkNames: [], horizon: ['Jura', 'Jura', 'Giura'] },
  { match: ['yverdon', 'yverdon-les-bains', 'grandson'], landmark: null, backdrop: 'jura', water: { kind: 'lake', name: ['Lac de Neuchâtel', 'Neuenburgersee', 'Lago di Neuchâtel'] }, landmarkNames: [], horizon: ['Jura', 'Jura', 'Giura'] },
  { match: ['nyon', 'morges', 'rolle', 'gland'], landmark: null, backdrop: 'alps', water: { kind: 'lake', name: ['Lac Léman', 'Genfersee', 'Lago Lemano'] }, landmarkNames: [], horizon: ['Mont Blanc', 'Mont Blanc', 'Monte Bianco'] },
  { match: ['martigny', 'monthey', 'sierre', 'siders', 'brig', 'visp', 'conthey', 'saviese', 'nendaz'], landmark: null, backdrop: 'alps', water: { kind: 'river', name: ['Rhône', 'Rhone', 'Rodano'] }, landmarkNames: [], horizon: ['Alpes valaisannes', 'Walliser Alpen', 'Alpi vallesane'] },
  { match: ['st. gallen', 'st gallen', 'saint-gall', 'san gallo'], landmark: null, backdrop: 'prealps', landmarkNames: [], horizon: ['Säntis', 'Säntis', 'Säntis'] },
  { match: ['chur', 'coire', 'coira', 'davos', 'st. moritz'], landmark: null, backdrop: 'alps', water: { kind: 'river', name: ['Rhin', 'Rhein', 'Reno'] }, landmarkNames: [], horizon: ['Alpes grisonnes', 'Bündner Alpen', 'Alpi grigionesi'] },
  { match: ['bellinzona', 'locarno', 'mendrisio'], landmark: null, backdrop: 'alps', water: { kind: 'lake', name: ['Lac Majeur', 'Lago Maggiore', 'Lago Maggiore'] }, landmarkNames: [], horizon: ['Alpes tessinoises', 'Tessiner Alpen', 'Alpi ticinesi'] },
];

// Canton (as the geocoder writes it) -> horizon, when the town is not listed.
const CANTON_BACKDROP: Record<string, ReliefBackdrop> = {
  valais: 'alps', wallis: 'alps', graubunden: 'alps', grisons: 'alps', uri: 'alps', ticino: 'alps', tessin: 'alps', glarus: 'alps', obwalden: 'alps', nidwalden: 'alps',
  jura: 'jura', neuchatel: 'jura', solothurn: 'jura', soleure: 'jura', 'basel-landschaft': 'jura', 'bale-campagne': 'jura',
  vaud: 'prealps', fribourg: 'prealps', freiburg: 'prealps', bern: 'prealps', berne: 'prealps', luzern: 'prealps', lucerne: 'prealps', schwyz: 'prealps', zug: 'prealps', 'st. gallen': 'prealps', 'appenzell innerrhoden': 'prealps', 'appenzell ausserrhoden': 'prealps',
};

function norm(s: string) {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

/** WGS84 -> Swiss LV95 (swisstopo approximate formulas, ~1 m). */
export function toLV95(lat: number, lon: number): { e: number; n: number } {
  const p = (lat * 3600 - 169028.66) / 10000;
  const l = (lon * 3600 - 26782.5) / 10000;
  const e = 2600072.37 + 211455.93 * l - 10938.51 * l * p - 0.36 * l * p * p - 44.54 * l * l * l;
  const n = 1200147.07 + 308807.95 * p + 3745.25 * l * l + 76.63 * p * p - 194.56 * l * l * p + 119.79 * p * p * p;
  return { e: Math.round(e), n: Math.round(n) };
}

/** "2 594 000" — the way Swiss maps print coordinates. */
export function formatCoord(v: number) {
  return Math.round(v)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

const CACHE_KEY = 'cantia:reliefPlace:v1';

async function geocode(query: string): Promise<{ lat: number; lon: number; elevation: number | null; canton: string | null; name: string } | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    const cache = raw ? (JSON.parse(raw) as Record<string, { lat: number; lon: number; elevation: number | null; canton: string | null; name: string }>) : {};
    if (cache[query]) return cache[query];
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=fr&format=json`);
    if (!res.ok) return null;
    const data = await res.json();
    const results: { latitude: number; longitude: number; elevation?: number; admin1?: string; country_code?: string; name: string }[] = data?.results ?? [];
    const best = results.find((r) => r.country_code === 'CH') ?? null;
    if (!best) return null;
    const out = { lat: best.latitude, lon: best.longitude, elevation: typeof best.elevation === 'number' ? best.elevation : null, canton: best.admin1 ?? null, name: best.name };
    cache[query] = out;
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    return out;
  } catch {
    return null;
  }
}

export async function getReliefGeo(locality: string | null | undefined, lang: 'fr' | 'de' | 'it'): Promise<ReliefGeo | null> {
  const city = locality?.trim();
  if (!city) return null;
  const li = lang === 'de' ? 1 : lang === 'it' ? 2 : 0;
  const key = norm(city);
  const place = PLACES.find((p) => p.match.some((m) => key === m || key.startsWith(`${m} `) || key.startsWith(`${m}-`)));
  const found = await geocode(city);
  const lv = found ? toLV95(found.lat, found.lon) : null;
  const backdrop: ReliefBackdrop = place?.backdrop ?? CANTON_BACKDROP[norm(found?.canton ?? '')] ?? 'plain';
  return {
    city: found?.name ?? city,
    canton: found?.canton ?? null,
    lat: found?.lat ?? null,
    lon: found?.lon ?? null,
    elevation: found?.elevation ?? null,
    e: lv?.e ?? null,
    n: lv?.n ?? null,
    landmark: place?.landmark ?? null,
    backdrop,
    water: place?.water ? { kind: place.water.kind, name: place.water.name[li] } : null,
    names: { landmark: (place?.landmarkNames ?? []).map((t) => t[li]), horizon: place?.horizon?.[li] ?? null },
  };
}

/** The town of a Swiss address: "Rue du Rhône 12, 1950 Sion" → "Sion". */
export function townOf(address: string | null | undefined): string | null {
  const a = (address ?? '').replace(/\s+/g, ' ').trim();
  if (!a) return null;
  const npa = /\b\d{4}\s+([A-Za-zÀ-ÿ'’.\- ]{2,40}?)(?:\s*,|\s*\(|$)/.exec(a);
  if (npa) return npa[1].trim();
  const parts = a.split(',').map((p) => p.trim()).filter(Boolean);
  const last = parts[parts.length - 1] ?? '';
  return /\d/.test(last) && parts.length > 1 ? parts[parts.length - 2] : last || null;
}

/** Where each address is (by its town), for the globe on the dashboard; unknown ones are left out. */
export async function locateAddresses(addresses: { id: string; address: string | null }[]): Promise<Record<string, { lat: number; lon: number }>> {
  const out: Record<string, { lat: number; lon: number }> = {};
  const towns = new Map<string, string[]>();
  for (const a of addresses) {
    const t = townOf(a.address);
    if (!t) continue;
    towns.set(t, [...(towns.get(t) ?? []), a.id]);
  }
  const list = [...towns.entries()].slice(0, 30);
  // A few at a time: the geocoder is a free public service.
  for (let i = 0; i < list.length; i += 4) {
    const found = await Promise.all(list.slice(i, i + 4).map(([t]) => geocode(t)));
    found.forEach((f, k) => {
      if (!f) return;
      for (const id of list[i + k][1]) out[id] = { lat: f.lat, lon: f.lon };
    });
  }
  return out;
}
