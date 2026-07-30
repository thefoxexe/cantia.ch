// Approximate WGS84 -> LV95 (EPSG:2056) conversion using swisstopo's published
// simplified formula. Accurate to ~1-2m, sufficient for map context / exports;
// not a substitute for a survey-grade transformation. The 2600072.37 /
// 1200147.07 constants already are the LV95-scale ones (swisstopo's LV03
// formula uses 600072.37 / 200147.07 — LV95 is just LV03 + 2'000'000E /
// +1'000'000N), so `e`/`n` below are real LV95 easting/northing on their
// own — e.g. Bern comes out around E 2'600'000 / N 1'200'000. A previous
// version subtracted 2'000'000/1'000'000 before returning, which silently
// turned a correct LV95 pair back into neither LV95 nor real LV03 — every
// display of these coordinates showed a meaningless truncated number
// instead of the "2'5xx'xxx / 1'1xx'xxx"-shaped values Swiss survey
// software actually expects.
export function wgs84ToLv95(lat: number, lon: number): { e: number; n: number } {
  const latSec = (lat * 3600 - 169028.66) / 10000;
  const lonSec = (lon * 3600 - 26782.5) / 10000;

  const e =
    2600072.37 +
    211455.93 * lonSec -
    10938.51 * lonSec * latSec -
    0.36 * lonSec * latSec * latSec -
    44.54 * lonSec * lonSec * lonSec;

  const n =
    1200147.07 +
    308807.95 * latSec +
    3745.25 * lonSec * lonSec +
    76.63 * latSec * latSec -
    194.56 * lonSec * lonSec * latSec +
    119.79 * latSec * latSec * latSec;

  return { e, n };
}

export function geoportalUrl(points: { lat: number; lon: number }[]): string {
  if (points.length === 0) {
    return 'https://map.geo.admin.ch/?lang=fr&layers=ch.swisstopo.swissimage,ch.kantone.cadastralwebmap-farbe&layers_opacity=1,0.75';
  }
  const first = points[0];
  const { e, n } = wgs84ToLv95(first.lat, first.lon);
  const params = new URLSearchParams({
    lang: 'fr',
    E: String(Math.round(e)),
    N: String(Math.round(n)),
    zoom: '10',
    layers: 'ch.swisstopo.swissimage,ch.kantone.cadastralwebmap-farbe',
    layers_opacity: '1,0.75',
    crosshair: 'marker',
  });
  return `https://map.geo.admin.ch/?${params.toString()}`;
}
