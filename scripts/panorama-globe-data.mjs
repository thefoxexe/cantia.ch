// Regenerates lib/relief/globeData.ts (land and Switzerland dot masks for the
// Panorama globe) from Natural Earth via world-atlas: run in a folder with
// world-atlas@2.0.2 and topojson-client@3.1.0 installed, then paste out.json
// into globeData.ts. Scanline fill on an equirectangular grid.

import { readFileSync, writeFileSync } from 'node:fs';
import { feature } from 'topojson-client';
const rings = (geom) => {
  const out = [];
  const g = geom.geometry ?? geom;
  const polys = g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [];
  for (const p of polys) for (const r of p) out.push(r);
  return out;
};
const landTopo = JSON.parse(readFileSync('node_modules/world-atlas/land-50m.json'));
const land = feature(landTopo, 'land');
const landRings = land.features ? land.features.flatMap(rings) : rings(land);
const countries = JSON.parse(readFileSync('node_modules/world-atlas/countries-10m.json'));
const ch = feature(countries, countries.objects.countries).features.find((f) => f.id === '756');
const chRings = rings(ch);
function grid(rs, n, s, w, e, step) {
  const rows = [];
  for (let lat = n - step / 2; lat > s; lat -= step) {
    const xs = [];
    for (const r of rs)
      for (let i = 0; i < r.length - 1; i++) {
        const [x1, y1] = r[i];
        const [x2, y2] = r[i + 1];
        if (y1 > lat !== y2 > lat) xs.push(x1 + ((lat - y1) * (x2 - x1)) / (y2 - y1));
      }
    xs.sort((a, b) => a - b);
    const row = [];
    let k = 0;
    for (let lon = w + step / 2; lon < e; lon += step) {
      while (k < xs.length && xs[k] < lon) k++;
      row.push(k % 2);
    }
    rows.push(row);
  }
  return rows;
}
function rle(rows) {
  return rows
    .map((r) => {
      const runs = [];
      let cur = 0;
      let n = 0;
      for (const b of r) {
        if (b === cur) n++;
        else {
          runs.push(n);
          cur = b;
          n = 1;
        }
      }
      runs.push(n);
      return runs.map((x) => x.toString(36)).join(',');
    })
    .join(';');
}
const W = grid(landRings, 90, -90, -180, 180, 0.5);
const CB = { n: 47.85, s: 45.8, w: 5.9, e: 10.55 };
const CS = 0.05;
const Cg = grid(chRings, CB.n, CB.s, CB.w, CB.e, CS);
const ones = (g) => g.reduce((a, r) => a + r.reduce((x, y) => x + y, 0), 0);
writeFileSync('out.json', JSON.stringify({ world: rle(W), cs: rle(Cg) }));
console.log('rows', W.length, W[0].length, 'land', ones(W), 'ch', Cg.length, Cg[0].length, ones(Cg), 'sizes', rle(W).length, rle(Cg).length);
const at = (g, n, w, step, lat, lon) => g[Math.floor((n - lat) / step)][Math.floor((lon - w) / step)];
console.log('Sion', at(Cg, CB.n, CB.w, CS, 46.23, 7.36), 'Paris', at(W, 90, -180, 0.5, 48.85, 2.35), 'Atlantic', at(W, 90, -180, 0.5, 40, -40), 'Como (IT)', at(Cg, CB.n, CB.w, CS, 45.81, 9.08), 'Antarctica', at(W, 90, -180, 0.5, -80, 0));
