import AsyncStorage from '@react-native-async-storage/async-storage';
import { i18next } from './translations';

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
// states worth showing on a dashboard glance. Labels are translated
// (weather.code<N> in lib/translations/{fr,de}.ts) — only the icon mapping
// lives here.
const WEATHER_CODE_ICON: Record<number, 'sun' | 'cloud' | 'cloud-drizzle' | 'cloud-rain' | 'cloud-snow' | 'cloud-lightning'> = {
  0: 'sun',
  1: 'sun',
  2: 'cloud',
  3: 'cloud',
  45: 'cloud',
  48: 'cloud',
  51: 'cloud-drizzle',
  53: 'cloud-drizzle',
  55: 'cloud-drizzle',
  61: 'cloud-rain',
  63: 'cloud-rain',
  65: 'cloud-rain',
  66: 'cloud-rain',
  67: 'cloud-rain',
  71: 'cloud-snow',
  73: 'cloud-snow',
  75: 'cloud-snow',
  77: 'cloud-snow',
  80: 'cloud-rain',
  81: 'cloud-rain',
  82: 'cloud-rain',
  85: 'cloud-snow',
  86: 'cloud-snow',
  95: 'cloud-lightning',
  96: 'cloud-lightning',
  99: 'cloud-lightning',
};

export function describeWeatherCode(code: number): { label: string; icon: 'sun' | 'cloud' | 'cloud-drizzle' | 'cloud-rain' | 'cloud-snow' | 'cloud-lightning' } {
  const icon = WEATHER_CODE_ICON[code] ?? 'cloud';
  const key = `weather.code${code}`;
  const label = i18next.exists(key) ? i18next.t(key) : i18next.t('weather.unknown');
  return { label, icon };
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
