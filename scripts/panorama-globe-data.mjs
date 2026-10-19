// Regenerates the Swiss border in lib/relief/globeData.ts for the Panorama
// globe from Natural Earth via world-atlas: run in a folder with
// world-atlas@2.0.2 and topojson-client@3.1.0 installed, then paste
// border.txt into CH_BORDER. Earth textures: public/globe/README.md.

import { readFileSync, writeFileSync } from 'node:fs';
import { feature } from 'topojson-client';
const countries = JSON.parse(readFileSync('node_modules/world-atlas/countries-10m.json'));
const ch = feature(countries, countries.objects.countries).features.find((f) => f.id === '756');
const g = ch.geometry;
const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
// Douglas-Peucker in degrees
function dp(pts, eps) { if (pts.length < 3) return pts; let dmax = 0, idx = 0; const [a, b] = [pts[0], pts[pts.length - 1]]; for (let i = 1; i < pts.length - 1; i++) { const p = pts[i]; const dx = b[0] - a[0], dy = b[1] - a[1]; const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy || 1))); const d = Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy); if (d > dmax) { dmax = d; idx = i; } } if (dmax > eps) { const l = dp(pts.slice(0, idx + 1), eps); const r = dp(pts.slice(idx), eps); return [...l.slice(0, -1), ...r]; } return [a, b]; }
const rings = polys.map((p) => dp(p[0], 0.004)).filter((r) => r.length > 10);
console.log(rings.map((r) => r.length));
const enc = rings.map((r) => r.map(([lon, lat]) => `${Math.round(lat * 1000)},${Math.round(lon * 1000)}`).join(' ')).join('|');
writeFileSync('border.txt', enc);
console.log(enc.length);
