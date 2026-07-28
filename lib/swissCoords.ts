// Approximate WGS84 -> LV95 (EPSG:2056) conversion using swisstopo's published
// simplified formula. Accurate to ~1-2m, sufficient for map context / exports;
// not a substitute for a survey-grade transformation.
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

  return { e: e - 2000000, n: n - 1000000 };
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
