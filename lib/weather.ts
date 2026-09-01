import AsyncStorage from '@react-native-async-storage/async-storage';

// Open-Meteo: free, keyless, no quota to manage — geocoding resolves the
// org's town to coordinates once, cached locally, then the forecast API is
// polled periodically for that fixed point.
const GEOCODE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const GEOCODE_CACHE_KEY = 'cantia:weatherGeocode';

export interface WeatherNow {
  temperatureC: number;
  code: number;
}

interface GeocodeResult {
  lat: number;
  lon: number;
}

// WMO weather codes (used by Open-Meteo) collapsed into the handful of
// states worth showing on a dashboard glance, in French.
const WEATHER_CODE_MAP: Record<number, { label: string; icon: 'sun' | 'cloud' | 'cloud-drizzle' | 'cloud-rain' | 'cloud-snow' | 'cloud-lightning' }> = {
  0: { label: 'Ciel dégagé', icon: 'sun' },
  1: { label: 'Plutôt dégagé', icon: 'sun' },
  2: { label: 'Partiellement nuageux', icon: 'cloud' },
  3: { label: 'Couvert', icon: 'cloud' },
  45: { label: 'Brouillard', icon: 'cloud' },
  48: { label: 'Brouillard givrant', icon: 'cloud' },
  51: { label: 'Bruine légère', icon: 'cloud-drizzle' },
  53: { label: 'Bruine', icon: 'cloud-drizzle' },
  55: { label: 'Bruine dense', icon: 'cloud-drizzle' },
  61: { label: 'Pluie légère', icon: 'cloud-rain' },
  63: { label: 'Pluie', icon: 'cloud-rain' },
  65: { label: 'Forte pluie', icon: 'cloud-rain' },
  66: { label: 'Pluie verglaçante', icon: 'cloud-rain' },
  67: { label: 'Pluie verglaçante forte', icon: 'cloud-rain' },
  71: { label: 'Neige légère', icon: 'cloud-snow' },
  73: { label: 'Neige', icon: 'cloud-snow' },
  75: { label: 'Forte neige', icon: 'cloud-snow' },
  77: { label: 'Neige en grains', icon: 'cloud-snow' },
  80: { label: 'Averses légères', icon: 'cloud-rain' },
  81: { label: 'Averses', icon: 'cloud-rain' },
  82: { label: 'Fortes averses', icon: 'cloud-rain' },
  85: { label: 'Averses de neige', icon: 'cloud-snow' },
  86: { label: 'Fortes averses de neige', icon: 'cloud-snow' },
  95: { label: 'Orage', icon: 'cloud-lightning' },
  96: { label: 'Orage avec grêle', icon: 'cloud-lightning' },
  99: { label: 'Orage violent avec grêle', icon: 'cloud-lightning' },
};

export function describeWeatherCode(code: number): { label: string; icon: 'sun' | 'cloud' | 'cloud-drizzle' | 'cloud-rain' | 'cloud-snow' | 'cloud-lightning' } {
  return WEATHER_CODE_MAP[code] ?? { label: 'Météo', icon: 'cloud' };
}

async function geocode(query: string): Promise<GeocodeResult | null> {
  try {
    const cacheRaw = await AsyncStorage.getItem(GEOCODE_CACHE_KEY);
    const cache = cacheRaw ? (JSON.parse(cacheRaw) as Record<string, GeocodeResult>) : {};
    if (cache[query]) return cache[query];

    // Open-Meteo's geocoder matches place names, not "NPA Ville, Pays"
    // strings — pass the bare town name and fetch a few candidates, then
    // prefer a Swiss one, rather than a single combined query that can
    // silently return zero results.
    const res = await fetch(`${GEOCODE_URL}?name=${encodeURIComponent(query)}&count=5&language=fr&format=json`);
    if (!res.ok) return null;
    const data = await res.json();
    const results: any[] = data?.results ?? [];
    if (!results.length) return null;
    const best = results.find((r) => r.country_code === 'CH') ?? results[0];
    const result: GeocodeResult = { lat: best.latitude, lon: best.longitude };
    cache[query] = result;
    await AsyncStorage.setItem(GEOCODE_CACHE_KEY, JSON.stringify(cache));
    return result;
  } catch {
    return null;
  }
}

// The bare town name is what Open-Meteo's place geocoder actually matches
// on — a postal code or "Suisse" suffix tacked on tends to return zero
// results rather than narrowing the match.
export function addressQueryFor(org: { locality?: string | null; address?: string | null }): string | null {
  if (org.locality?.trim()) return org.locality.trim();
  if (org.address?.trim()) return org.address.trim();
  return null;
}

export async function fetchWeatherFor(query: string): Promise<WeatherNow | null> {
  const point = await geocode(query);
  if (!point) return null;
  try {
    const res = await fetch(
      `${FORECAST_URL}?latitude=${point.lat}&longitude=${point.lon}&current=temperature_2m,weather_code&timezone=auto`,
    );
    if (!res.ok) return null;
    const data = await res.json();
    const current = data?.current;
    if (!current || typeof current.temperature_2m !== 'number') return null;
    return { temperatureC: current.temperature_2m, code: current.weather_code ?? 0 };
  } catch {
    return null;
  }
}
