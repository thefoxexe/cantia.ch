import * as THREE from 'three';
import type { GlobePoint } from './globe';

// Cantia Panorama, full screen: the company's piece of the planet. After the
// zoom from space (lib/relief/globe.ts, 'intro' mode), the member lands on a
// disc of real land cut out of the Earth, like a relief model on a table:
// the real ground of the region (public/globe/ch-terrain.png, built by
// scripts/panorama-terrain.py: elevation and lakes), coloured as fields,
// forests, rock and snow, with its strata on the side. Each project stands at
// its town as a small building with one floor per step of its process (built
// floors white, the current one in the colour of its state, the rest in
// glass); the head office is the dark building with the arcs; people planned
// today stand at their project and little lights travel to it along the arc.
// Drag to turn, wheel or two fingers to zoom, right drag or two fingers to
// move, tap a building to open its card. Plain three.js, no React.

export interface WorldHandle {
  update(points: GlobePoint[], hq: { lat: number; lon: number } | null): void;
  select(id: string | null): void;
  focus(id: string | null): void;
  reset(): void;
  /** Leave the view from above and settle at the usual angle (after the zoom from space). */
  arrive(): void;
  setAnimated(on: boolean): void;
  setInsets(insets: { left?: number; right?: number; top?: number; bottom?: number }): void;
  setMood(mood: 'day' | 'night'): void;
  dispose(): void;
}

interface Options {
  accent: string;
  points: GlobePoint[];
  hq: { lat: number; lon: number } | null;
  mood?: 'day' | 'night';
  baseLabel?: string;
  onSelect?: (id: string | null) => void;
  /** Wait above the land until arrive() is called. */
  hold?: boolean;
  still?: boolean;
}

/** Colours of the states on the land (also for the legend). */
export const WORLD_STATUS: Record<GlobePoint['status'], string> = { ok: '#3F8F6A', risk: '#D39A2B', late: '#C44A3A', done: '#A79E92' };

const GROUND_BOX = { w: 5.6, e: 10.9, s: 45.6, n: 48.1 };
const BERN = { lat: 46.948, lon: 7.447 };
const FOV = 32;
const TAN = Math.tan((FOV * Math.PI) / 360);
const RINGS = 150;
const SEGS = 288;

type Ground = { w: number; h: number; elev: Uint16Array; lake: Uint8Array };
let groundPromise: Promise<Ground | null> | null = null;

function groundBase() {
  const w = window as unknown as { __CANTIA_GLOBE_BASE__?: string };
  if (w.__CANTIA_GLOBE_BASE__) return w.__CANTIA_GLOBE_BASE__;
  return /^https?:$/.test(window.location.protocol) ? '/globe/' : 'https://app.cantia.ch/globe/';
}

/** The relief of Switzerland, read once per page (elevation = R * 256 + G, lakes in B). */
function loadGround(): Promise<Ground | null> {
  if (!groundPromise) {
    groundPromise = (async () => {
      try {
        const res = await fetch(`${groundBase()}ch-terrain.png`);
        if (!res.ok) throw new Error(String(res.status));
        const blob = await res.blob();
        const bmp = await createImageBitmap(blob, { colorSpaceConversion: 'none', premultiplyAlpha: 'none' });
        const c = document.createElement('canvas');
        c.width = bmp.width;
        c.height = bmp.height;
        const g = c.getContext('2d', { willReadFrequently: true });
        if (!g) throw new Error('canvas');
        g.drawImage(bmp, 0, 0);
        const d = g.getImageData(0, 0, bmp.width, bmp.height).data;
        const n = bmp.width * bmp.height;
        const elev = new Uint16Array(n);
        const lake = new Uint8Array(n);
        for (let i = 0; i < n; i++) {
          elev[i] = d[i * 4] * 256 + d[i * 4 + 1];
          lake[i] = d[i * 4 + 2];
        }
        const size = { w: bmp.width, h: bmp.height };
        bmp.close?.();
        return { ...size, elev, lake };
      } catch {
        groundPromise = null;
        return null;
      }
    })();
  }
  return groundPromise;
}

function vhash(x: number, y: number) {
  let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

function vnoise(x: number, y: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = vhash(xi, yi);
  const b = vhash(xi + 1, yi);
  const c = vhash(xi, yi + 1);
  const d = vhash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0) / 4294967295;
}

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

const PAL = {
  meadow: new THREE.Color('#A7B67C'),
  field: new THREE.Color('#C3BF8E'),
  forest: new THREE.Color('#62794C'),
  alp: new THREE.Color('#ABAA82'),
  rock: new THREE.Color('#A39A8D'),
  snow: new THREE.Color('#F4F4F0'),
  lake: new THREE.Color('#8FAEB7'),
  strata: ['#6E5944', '#8C7862', '#A39078', '#7F6D59', '#968370', '#6A5A49'].map((c) => new THREE.Color(c)),
  bottom: new THREE.Color('#4E4237'),
};

export function createWorld(host: HTMLElement, opts: Options): WorldHandle {
  const width = () => host.clientWidth || 800;
  const height = () => host.clientHeight || 600;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(width(), height());
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  Object.assign(renderer.domElement.style, { display: 'block', width: '100%', height: '100%', outline: 'none', touchAction: 'none' });
  host.appendChild(renderer.domElement);
  const labelLayer = document.createElement('div');
  labelLayer.className = 'rf-labels';
  host.appendChild(labelLayer);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, width() / height(), 0.05, 2000);
  let insets = { left: 0, right: 0, top: 0, bottom: 0 };

  const hemi = new THREE.HemisphereLight('#FFF8EC', '#8C7A66', 0.9);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight('#FFF1DA', 2.4);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.02;
  scene.add(sun);
  scene.add(sun.target);

  const accent = new THREE.Color(opts.accent);
  let mood: 'day' | 'night' = opts.mood ?? 'day';
  let animated = !opts.still;
  let ground: Ground | null = null;
  let center = opts.hq ?? BERN;
  let R = 20;
  let ex = 1.6;
  let base = 400;
  let kx = 111.32 * Math.cos((center.lat * Math.PI) / 180);
  const kz = 110.57;
  let land: THREE.Group | null = null;
  let landKey = '';
  let marks = new THREE.Group();
  scene.add(marks);
  let points = opts.points;
  let hq = opts.hq;
  let selected: string | null = null;

  // ---- the land
  const sample = (lat: number, lon: number) => {
    if (!ground) return { h: 450 + vnoise(lon * 40, lat * 40) * 120, lake: 0 };
    const fx = ((lon - GROUND_BOX.w) / (GROUND_BOX.e - GROUND_BOX.w)) * ground.w - 0.5;
    const fy = ((GROUND_BOX.n - lat) / (GROUND_BOX.n - GROUND_BOX.s)) * ground.h - 0.5;
    if (fx < 0 || fy < 0 || fx >= ground.w - 1 || fy >= ground.h - 1) return { h: 450, lake: 0 };
    const ix = Math.floor(fx);
    const iy = Math.floor(fy);
    const ax = fx - ix;
    const ay = fy - iy;
    const i = iy * ground.w + ix;
    const bl = (arr: Uint16Array | Uint8Array) =>
      arr[i] * (1 - ax) * (1 - ay) + arr[i + 1] * ax * (1 - ay) + arr[i + ground!.w] * (1 - ax) * ay + arr[i + ground!.w + 1] * ax * ay;
    return { h: bl(ground.elev), lake: bl(ground.lake) / 255 };
  };
  const toLatLon = (x: number, z: number) => ({ lat: center.lat - z / kz, lon: center.lon + x / kx });
  const toXZ = (lat: number, lon: number) => ({ x: (lon - center.lon) * kx, z: (center.lat - lat) * kz });
  const curve = (x: number, z: number) => ((x * x + z * z) / (2 * 6371)) * 5;
  const yAt = (x: number, z: number) => {
    const g = toLatLon(x, z);
    return ((sample(g.lat, g.lon).h - base) / 1000) * ex - curve(x, z);
  };

  function colorAt(x: number, z: number, h: number, ny: number, lake: number, out: THREE.Color) {
    // Broad, calm areas: meadows and fields in the plains, forests on the
    // slopes, alpine pasture higher up, then rock and snow.
    const n1 = vnoise(x * 0.12 + 31, z * 0.12 + 17);
    const n2 = vnoise(x * 0.35 + 5, z * 0.35 + 11);
    out.copy(PAL.meadow).lerp(PAL.field, smooth(0.35, 0.75, n1) * 0.7);
    out.lerp(PAL.alp, smooth(1300, 1900, h));
    const forest = smooth(0.58, 0.7, n1 * 0.45 + n2 * 0.35 + (1 - ny) * 1.5) * (1 - smooth(1800, 2100, h));
    out.lerp(PAL.forest, forest);
    const rock = Math.max(smooth(2200, 2800, h), smooth(0.66, 0.5, ny) * smooth(1200, 1700, h));
    out.lerp(PAL.rock, rock * (0.85 + n2 * 0.15));
    const snow = smooth(2900, 3350, h + (n2 - 0.5) * 300) * smooth(0.45, 0.7, ny);
    out.lerp(PAL.snow, snow);
    out.lerp(PAL.lake, smooth(0.35, 0.65, lake));
    out.multiplyScalar(0.97 + n2 * 0.06);
  }

  function buildLand() {
    const old = land;
    if (old) {
      scene.remove(old);
      old.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose();
        (m.material as THREE.Material | undefined)?.dispose?.();
      });
    }
    land = new THREE.Group();
    scene.add(land);

    const n = (RINGS + 1) * SEGS;
    const pos = new Float32Array(n * 3);
    const hs = new Float32Array(n);
    const lakes = new Float32Array(n);
    for (let i = 0; i <= RINGS; i++) {
      const r = (R * i) / RINGS;
      for (let j = 0; j < SEGS; j++) {
        const a = (j / SEGS) * Math.PI * 2;
        const x = Math.cos(a) * r;
        const z = Math.sin(a) * r;
        const g = toLatLon(x, z);
        const s = sample(g.lat, g.lon);
        const k = i * SEGS + j;
        pos[k * 3] = x;
        pos[k * 3 + 2] = z;
        hs[k] = s.h;
        lakes[k] = s.lake;
      }
    }
    const sorted = Array.from(hs).sort((a, b) => a - b);
    base = sorted[Math.floor(sorted.length * 0.02)] - 60;
    const relief = sorted[sorted.length - 1] - base;
    // Mountains readable, plains not flat: more lift on small pieces of land.
    ex = THREE.MathUtils.clamp((R * 0.16) / Math.max(0.6, relief / 1000), 1.2, 2.6);
    for (let k = 0; k < n; k++) pos[k * 3 + 1] = ((hs[k] - base) / 1000) * ex - curve(pos[k * 3], pos[k * 3 + 2]);

    const idx: number[] = [];
    for (let i = 0; i < RINGS; i++)
      for (let j = 0; j < SEGS; j++) {
        const a = i * SEGS + j;
        const b = i * SEGS + ((j + 1) % SEGS);
        const c = (i + 1) * SEGS + j;
        const d = (i + 1) * SEGS + ((j + 1) % SEGS);
        if (i > 0) idx.push(a, b, c);
        idx.push(b, d, c);
      }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    const nor = geo.getAttribute('normal');
    const col = new Float32Array(n * 3);
    const c = new THREE.Color();
    for (let k = 0; k < n; k++) {
      colorAt(pos[k * 3], pos[k * 3 + 2], hs[k], nor.getY(k), lakes[k], c);
      col[k * 3] = c.r;
      col[k * 3 + 1] = c.g;
      col[k * 3 + 2] = c.b;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const top = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.93, metalness: 0 }));
    top.castShadow = true;
    top.receiveShadow = true;
    land.add(top);

    // The side of the piece of land: its strata, down to a flat bottom.
    let minY = Infinity;
    for (let k = 0; k < n; k++) minY = Math.min(minY, pos[k * 3 + 1]);
    const bottom = minY - (0.7 + R * 0.05);
    const LAY = 8;
    const wpos: number[] = [];
    const wcol: number[] = [];
    const widx: number[] = [];
    for (let j = 0; j <= SEGS; j++) {
      const k = RINGS * SEGS + (j % SEGS);
      const x = pos[k * 3];
      const yTop = pos[k * 3 + 1];
      const z = pos[k * 3 + 2];
      for (let l = 0; l <= LAY; l++) {
        const f = l / LAY;
        const y = l === 0 ? yTop : l === 1 ? yTop - 0.18 : yTop + (bottom - yTop) * f;
        wpos.push(x, y, z);
        const sc = l === 0 ? PAL.strata[0] : PAL.strata[(l + (vhash(j >> 4, l) > 0.7 ? 1 : 0)) % PAL.strata.length];
        wcol.push(sc.r, sc.g, sc.b);
      }
    }
    for (let j = 0; j < SEGS; j++)
      for (let l = 0; l < LAY; l++) {
        const a = j * (LAY + 1) + l;
        const b = (j + 1) * (LAY + 1) + l;
        widx.push(a, a + 1, b, b, a + 1, b + 1);
      }
    const wgeo = new THREE.BufferGeometry();
    wgeo.setAttribute('position', new THREE.Float32BufferAttribute(wpos, 3));
    wgeo.setAttribute('color', new THREE.Float32BufferAttribute(wcol, 3));
    wgeo.setIndex(widx);
    wgeo.computeVertexNormals();
    const wall = new THREE.Mesh(wgeo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, flatShading: true, side: THREE.DoubleSide }));
    wall.receiveShadow = true;
    land.add(wall);
    const cap = new THREE.Mesh(new THREE.CircleGeometry(R, SEGS).rotateX(Math.PI / 2), new THREE.MeshStandardMaterial({ color: PAL.bottom, roughness: 1 }));
    cap.position.y = bottom;
    land.add(cap);

    // A soft shadow on the table under it.
    const sc = document.createElement('canvas');
    sc.width = sc.height = 128;
    const sg = sc.getContext('2d')!;
    const grad = sg.createRadialGradient(64, 64, 20, 64, 64, 64);
    grad.addColorStop(0, 'rgba(60,45,30,.35)');
    grad.addColorStop(1, 'rgba(60,45,30,0)');
    sg.fillStyle = grad;
    sg.fillRect(0, 0, 128, 128);
    const shadowTex = new THREE.CanvasTexture(sc);
    const shade = new THREE.Mesh(new THREE.PlaneGeometry(R * 2.9, R * 2.9).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }));
    shade.position.y = bottom - R * 0.12;
    shade.userData.tex = shadowTex;
    land.add(shade);

    sun.position.set(-R * 1.1, R * 1.6, -R * 0.7);
    sun.target.position.set(0, 0, 0);
    const sh = sun.shadow.camera;
    sh.left = sh.bottom = -R * 1.15;
    sh.right = sh.top = R * 1.15;
    sh.near = 0.1;
    sh.far = R * 5;
    sh.updateProjectionMatrix();
    groundY = yAt(0, 0);
  }
  let groundY = 0;

  // ---- the company on it
  type Mark = { id: string; point: GlobePoint; x: number; z: number; y: number; top: number; el: HTMLElement | null; ring: THREE.Mesh | null };
  let markList: Mark[] = [];
  let hqMark: { x: number; z: number; y: number; top: number; el: HTMLElement | null } | null = null;
  let travelers: { mesh: THREE.Mesh; curve: THREE.QuadraticBezierCurve3; u: number; speed: number }[] = [];
  let pulses: { mesh: THREE.Mesh; phase: number; size: number }[] = [];
  let windows: THREE.MeshStandardMaterial[] = [];
  let selRing: THREE.Mesh | null = null;
  const unit = () => Math.max(0.5, R / 21);

  function clearMarks() {
    scene.remove(marks);
    marks.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose();
      (m.material as THREE.Material | undefined)?.dispose?.();
    });
    for (const m of markList) m.el?.remove();
    hqMark?.el?.remove();
    marks = new THREE.Group();
    scene.add(marks);
    markList = [];
    travelers = [];
    pulses = [];
    windows = [];
    selRing = null;
  }

  const std = (color: THREE.ColorRepresentation, extra: THREE.MeshStandardMaterialParameters = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.75, metalness: 0, ...extra });

  function building(x: number, z: number, p: GlobePoint) {
    const u = unit();
    const y = yAt(x, z);
    const g = new THREE.Group();
    g.position.set(x, y, z);
    const status = new THREE.Color(WORLD_STATUS[p.status]);
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.62 * u, 0.66 * u, 0.12 * u, 40), std(p.status === 'done' ? '#D8D2C8' : '#EFEAE1'));
    pad.position.y = 0.02 * u;
    pad.receiveShadow = true;
    g.add(pad);
    const steps = Math.max(2, Math.min(8, p.steps ?? 5));
    const step = p.status === 'done' ? steps : Math.max(0, Math.min(steps - 1, p.step ?? Math.round((p.progress ?? 0) * (steps - 1))));
    const fh = 0.3 * u;
    const w = 0.62 * u;
    let yy = 0.1 * u;
    for (let k = 0; k < steps; k++) {
      const built = k < step;
      const current = k === step && p.status !== 'done';
      const geo = new THREE.BoxGeometry(w, fh * 0.9, w * 0.82);
      if (built || current) {
        const mat = std(current ? status : '#F6F2EA', { emissive: '#FFC978', emissiveIntensity: 0 });
        const box = new THREE.Mesh(geo, mat);
        box.position.y = yy + fh * 0.45;
        box.castShadow = true;
        box.receiveShadow = true;
        g.add(box);
        if (!current) windows.push(mat);
      } else {
        const glass = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: '#FFFFFF', transparent: true, opacity: 0.22, depthWrite: false }));
        glass.position.y = yy + fh * 0.45;
        g.add(glass);
        const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: '#6E6458', transparent: true, opacity: 0.45 }));
        edges.position.copy(glass.position);
        g.add(edges);
      }
      yy += fh;
    }
    // People planned there today.
    const crew = Math.min(4, p.crew);
    for (let k = 0; k < crew; k++) {
      const fig = new THREE.Group();
      const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.07 * u, 0.14 * u, 4, 8), std('#3B342D'));
      body.position.y = 0.17 * u;
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.065 * u, 12, 8), std('#E9C9A6'));
      head.position.y = 0.36 * u;
      fig.add(body, head);
      const a = -0.6 + k * 0.42;
      fig.position.set(Math.cos(a) * 0.82 * u, 0.06 * u, Math.sin(a) * 0.82 * u + 0.1 * u);
      fig.traverse((o) => (o.castShadow = true));
      g.add(fig);
    }
    marks.add(g);
    let ring: THREE.Mesh | null = null;
    if (p.crew > 0 || p.status === 'late') {
      ring = new THREE.Mesh(new THREE.RingGeometry(0.85, 1, 48).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: status, transparent: true, opacity: 0.6, depthWrite: false }));
      ring.position.set(x, y + 0.08 * u, z);
      marks.add(ring);
      pulses.push({ mesh: ring, phase: hash(p.id) * 1.6, size: 1.6 * u });
    }
    return { y, top: y + yy, ring };
  }

  function placeMarks() {
    clearMarks();
    const u = unit();
    // Head office.
    const h0 = hq ? toXZ(hq.lat, hq.lon) : { x: 0, z: 0 };
    const hy = yAt(h0.x, h0.z);
    const office = new THREE.Group();
    office.position.set(h0.x, hy, h0.z);
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.95 * u, 1 * u, 0.14 * u, 48), std('#EFEAE1'));
    pad.receiveShadow = true;
    office.add(pad);
    const tower = new THREE.Mesh(new THREE.BoxGeometry(0.9 * u, 1.25 * u, 0.9 * u), std('#3A332C', { roughness: 0.6 }));
    tower.position.y = 0.7 * u;
    tower.castShadow = true;
    office.add(tower);
    const crown = new THREE.Mesh(new THREE.BoxGeometry(0.96 * u, 0.1 * u, 0.96 * u), std(accent));
    crown.position.y = 1.38 * u;
    office.add(crown);
    const winMat = std('#3A332C', { emissive: '#FFC978', emissiveIntensity: 0 });
    for (let k = 0; k < 3; k++) {
      const band = new THREE.Mesh(new THREE.BoxGeometry(0.92 * u, 0.06 * u, 0.92 * u), winMat);
      band.position.y = 0.35 * u + k * 0.32 * u;
      office.add(band);
    }
    windows.push(winMat);
    marks.add(office);
    hqMark = { x: h0.x, z: h0.z, y: hy, top: hy + 1.45 * u, el: null };
    if (opts.baseLabel) {
      hqMark.el = document.createElement('div');
      hqMark.el.className = 'rf-base';
      hqMark.el.textContent = opts.baseLabel;
      labelLayer.appendChild(hqMark.el);
    }

    const taken: { x: number; z: number }[] = [{ x: h0.x, z: h0.z }];
    points.forEach((p) => {
      let { x, z } = toXZ(p.lat, p.lon);
      const d = Math.hypot(x, z);
      if (d > R * 0.9) {
        x *= (R * 0.9) / d;
        z *= (R * 0.9) / d;
      }
      // Several at the same place (same town, or no address): around it.
      for (let tries = 0; tries < 12 && taken.some((t) => Math.hypot(t.x - x, t.z - z) < 1.6 * u); tries++) {
        const a = hash(`${p.id}${tries}`) * Math.PI * 2;
        const r = (1.9 + tries * 0.45) * u;
        x += Math.cos(a) * r;
        z += Math.sin(a) * r;
      }
      taken.push({ x, z });
      const b = building(x, z, p);
      const mark: Mark = { id: p.id, point: p, x, z, y: b.y, top: b.top, el: null, ring: b.ring };
      if (p.name) {
        const el = document.createElement('button');
        el.type = 'button';
        el.className = `rf-label rf-st-${p.status}${p.example ? ' rf-example' : ''}`;
        el.innerHTML = '<span class="rf-dot"></span><span class="rf-name"></span><span class="rf-step-name"></span><span class="rf-pct"></span>';
        (el.querySelector('.rf-name') as HTMLElement).textContent = p.name;
        (el.querySelector('.rf-step-name') as HTMLElement).textContent = p.detail ?? '';
        (el.querySelector('.rf-pct') as HTMLElement).textContent = p.progress != null && !p.example ? `${Math.round(p.progress * 100)}%` : '';
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          handle.select(p.id);
          handle.focus(p.id);
        });
        labelLayer.appendChild(el);
        mark.el = el;
      }
      markList.push(mark);

      // The arc from the head office; little lights travel it to where people are today.
      const from = new THREE.Vector3(h0.x, hqMark!.top, h0.z);
      const to = new THREE.Vector3(x, b.top + 0.1 * u, z);
      const dist = from.distanceTo(to);
      const mid = from.clone().add(to).multiplyScalar(0.5);
      mid.y = Math.max(from.y, to.y) + dist * 0.22 + u;
      const cv = new THREE.QuadraticBezierCurve3(from, mid, to);
      const mat = new THREE.LineDashedMaterial({ color: accent, dashSize: 0.35 * u, gapSize: 0.22 * u, transparent: true, opacity: p.status === 'done' ? 0.25 : 0.7 });
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(cv.getPoints(64)), mat);
      line.computeLineDistances();
      marks.add(line);
      for (let k = 0; k < Math.min(3, p.crew); k++) {
        const m = new THREE.Mesh(new THREE.SphereGeometry(0.11 * u, 12, 8), new THREE.MeshBasicMaterial({ color: '#FFFFFF', transparent: true }));
        marks.add(m);
        travelers.push({ mesh: m, curve: cv, u: (k / 3 + hash(p.id)) % 1, speed: 0.12 + hash(`${p.id}s`) * 0.06 });
      }
    });
    selRing = new THREE.Mesh(new THREE.RingGeometry(0.9, 1, 64).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.9, depthWrite: false }));
    selRing.visible = false;
    marks.add(selRing);
    applyMood();
  }

  function fitLand() {
    const pts = [...points.map((p) => ({ lat: p.lat, lon: p.lon })), ...(hq ? [hq] : [])];
    center = hq ?? (pts.length ? { lat: pts.reduce((a, p) => a + p.lat, 0) / pts.length, lon: pts.reduce((a, p) => a + p.lon, 0) / pts.length } : BERN);
    kx = 111.32 * Math.cos((center.lat * Math.PI) / 180);
    // Sized for most of the projects; one far away sits at the edge, in its direction.
    const dists = pts.map((p) => {
      const q = toXZ(p.lat, p.lon);
      return Math.hypot(q.x, q.z);
    }).sort((a, b) => a - b);
    const far = dists.length ? dists[Math.min(dists.length - 1, Math.floor(dists.length * 0.85))] : 0;
    R = Math.round(THREE.MathUtils.clamp(far * 1.25 + 6, 12, 80));
    const key = `${center.lat.toFixed(3)}|${center.lon.toFixed(3)}|${R}|${ground ? 1 : 0}`;
    if (key !== landKey) {
      landKey = key;
      buildLand();
    }
  }

  // ---- light
  function applyMood() {
    const night = mood === 'night';
    hemi.color.set(night ? '#5A6E91' : '#FFF8EC');
    hemi.groundColor.set(night ? '#1A1712' : '#8C7A66');
    hemi.intensity = night ? 0.45 : 0.9;
    sun.color.set(night ? '#9FB4D9' : '#FFF1DA');
    sun.intensity = night ? 0.55 : 2.4;
    for (const w of windows) w.emissiveIntensity = night ? 0.9 : 0;
    for (const t of travelers) (t.mesh.material as THREE.MeshBasicMaterial).color.set(night ? '#FFD9A0' : '#FFFFFF');
    renderer.toneMappingExposure = night ? 1.15 : 1.05;
  }

  // ---- camera
  const view = { tx: 0, ty: 0, tz: 0, dist: 60, az: -0.2, el: 0.8 };
  let fly: { from: typeof view; to: typeof view; t0: number; dur: number } | null = null;
  let held = !!opts.hold;
  let lastInteraction = performance.now();
  const freeW = () => Math.max(0.3, (width() - insets.left - insets.right) / width());
  const freeH = () => Math.max(0.3, (height() - insets.top - insets.bottom) / height());
  const homeView = () => {
    const el = 0.78;
    const aspect = width() / height();
    const dw = (1.06 * R) / (TAN * aspect * freeW());
    const dh = (1.06 * R * Math.sin(el) + R * 0.12) / (TAN * freeH());
    return { tx: 0, ty: groundY, tz: R * 0.04, dist: Math.max(dw, dh), az: -0.22, el };
  };
  const aboveView = () => {
    const h = homeView();
    return { ...h, tz: 0, az: 0, el: 1.5, dist: h.dist * 1.35 };
  };
  const flyTo = (to: typeof view, dur = 1300) => {
    fly = { from: { ...view }, to, t0: performance.now(), dur };
  };
  const placeCamera = () => {
    const c = Math.cos(view.el);
    camera.position.set(view.tx + Math.sin(view.az) * c * view.dist, view.ty + Math.sin(view.el) * view.dist, view.tz + Math.cos(view.az) * c * view.dist);
    camera.up.set(0, 1, 0);
    // Straight down needs a hint of which way is north.
    if (view.el > 1.45) camera.up.set(-Math.sin(view.az), 0, -Math.cos(view.az));
    camera.lookAt(view.tx, view.ty, view.tz);
    camera.near = Math.max(0.05, view.dist * 0.01);
    camera.far = view.dist * 6 + R * 4;
    camera.updateProjectionMatrix();
  };
  const applyInsets = () => {
    camera.setViewOffset(width(), height(), (insets.right - insets.left) / 2, (insets.bottom - insets.top) / 2, width(), height());
    camera.updateProjectionMatrix();
  };
  const resize = () => {
    renderer.setSize(width(), height());
    camera.aspect = width() / height();
    applyInsets();
  };
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
  ro?.observe(host);

  fitLand();
  placeMarks();
  Object.assign(view, held ? aboveView() : homeView());
  applyInsets();
  if (!held && !opts.still) {
    Object.assign(view, aboveView());
    flyTo(homeView(), 2000);
  }
  loadGround().then((g) => {
    if (disposed || !g) return;
    ground = g;
    landKey = '';
    fitLand();
    placeMarks();
    if (!fly) Object.assign(view, held ? aboveView() : homeView());
  });

  // ---- touch / mouse
  const pointers = new Map<number, { x: number; y: number }>();
  let downAt: { x: number; y: number; t: number } | null = null;
  let pinch = 0;
  let mid: { x: number; y: number } | null = null;
  let panning = false;
  let vel = { az: 0, el: 0 };
  const local = (e: PointerEvent | WheelEvent) => {
    const r = renderer.domElement.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const tmp = new THREE.Vector3();
  const project = (x: number, y: number, z: number) => {
    tmp.set(x, y, z).project(camera);
    return { x: (tmp.x * 0.5 + 0.5) * width(), y: (-tmp.y * 0.5 + 0.5) * height(), z: tmp.z };
  };
  const pickAt = (px: number, py: number) => {
    let best: { id: string; d: number } | null = null;
    for (const m of markList) {
      const a = project(m.x, (m.y + m.top) / 2, m.z);
      const b = project(m.x, m.top, m.z);
      const d = Math.min(Math.hypot(a.x - px, a.y - py), Math.hypot(b.x - px, b.y - py));
      if (d < 30 && (!best || d < best.d)) best = { id: m.id, d };
    }
    return best?.id ?? null;
  };
  const pan = (dx: number, dy: number) => {
    const k = (view.dist * TAN * 2) / height();
    const rx = Math.cos(view.az);
    const rz = -Math.sin(view.az);
    const fx = -Math.sin(view.az);
    const fz = -Math.cos(view.az);
    view.tx += (-dx * rx + (dy * fx) / Math.max(0.4, Math.sin(view.el))) * k;
    view.tz += (-dx * rz + (dy * fz) / Math.max(0.4, Math.sin(view.el))) * k;
    const r = Math.hypot(view.tx, view.tz);
    if (r > R * 0.85) {
      view.tx *= (R * 0.85) / r;
      view.tz *= (R * 0.85) / r;
    }
  };
  const onDown = (e: PointerEvent) => {
    renderer.domElement.setPointerCapture?.(e.pointerId);
    pointers.set(e.pointerId, local(e));
    panning = e.button === 2 || e.shiftKey || e.ctrlKey;
    if (pointers.size === 1) downAt = { ...local(e), t: performance.now() };
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinch = Math.hypot(a.x - b.x, a.y - b.y);
      mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    }
    fly = null;
    vel = { az: 0, el: 0 };
    lastInteraction = performance.now();
  };
  const onMove = (e: PointerEvent) => {
    if (!pointers.has(e.pointerId)) {
      const p = local(e);
      renderer.domElement.style.cursor = pickAt(p.x, p.y) ? 'pointer' : 'grab';
      return;
    }
    const prev = pointers.get(e.pointerId)!;
    const now = local(e);
    pointers.set(e.pointerId, now);
    lastInteraction = performance.now();
    if (held) return;
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      const m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      if (pinch > 0) view.dist = THREE.MathUtils.clamp((view.dist * pinch) / d, R * 0.65, R * 4);
      if (mid) pan(m.x - mid.x, m.y - mid.y);
      pinch = d;
      mid = m;
      return;
    }
    if (panning) {
      pan(now.x - prev.x, now.y - prev.y);
      return;
    }
    const daz = -(now.x - prev.x) * 0.006;
    const del = (now.y - prev.y) * 0.004;
    view.az += daz;
    view.el = THREE.MathUtils.clamp(view.el + del, 0.3, 1.45);
    vel = { az: daz, el: del };
  };
  const onUp = (e: PointerEvent) => {
    const p = local(e);
    pointers.delete(e.pointerId);
    if (pointers.size < 2) {
      pinch = 0;
      mid = null;
    }
    if (downAt && Math.hypot(p.x - downAt.x, p.y - downAt.y) < 6 && performance.now() - downAt.t < 600) {
      const id = pickAt(p.x, p.y);
      handle.select(id);
      if (id) handle.focus(id);
      vel = { az: 0, el: 0 };
    }
    downAt = null;
  };
  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    if (held) return;
    fly = null;
    lastInteraction = performance.now();
    view.dist = THREE.MathUtils.clamp(view.dist * Math.exp(e.deltaY * 0.0012), R * 0.65, R * 4);
  };
  const noMenu = (e: Event) => e.preventDefault();
  renderer.domElement.addEventListener('pointerdown', onDown);
  renderer.domElement.addEventListener('pointermove', onMove);
  renderer.domElement.addEventListener('pointerup', onUp);
  renderer.domElement.addEventListener('pointercancel', onUp);
  renderer.domElement.addEventListener('wheel', onWheel, { passive: false });
  renderer.domElement.addEventListener('contextmenu', noMenu);

  // ---- loop
  const ease = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
  let raf = 0;
  let last = performance.now();
  let t = 0;
  let disposed = false;
  const frame = () => {
    raf = requestAnimationFrame(frame);
    const now = performance.now();
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (animated) t += dt;
    if (fly) {
      const q = Math.min(1, (now - fly.t0) / fly.dur);
      const e = ease(q);
      for (const k of ['tx', 'ty', 'tz', 'el'] as const) view[k] = fly.from[k] + (fly.to[k] - fly.from[k]) * e;
      let da = fly.to.az - fly.from.az;
      da = ((((da + Math.PI) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) - Math.PI;
      view.az = fly.from.az + da * e;
      view.dist = Math.exp(Math.log(fly.from.dist) + (Math.log(fly.to.dist) - Math.log(fly.from.dist)) * e);
      if (q >= 1) fly = null;
    } else if (!pointers.size) {
      view.az += vel.az;
      view.el = THREE.MathUtils.clamp(view.el + vel.el, 0.3, 1.45);
      vel.az *= 0.9;
      vel.el *= 0.9;
      // Left alone with nothing open: the land turns slowly.
      if (animated && !held && !selected && now - lastInteraction > 25000) view.az += dt * 0.025;
    }
    placeCamera();

    const u = unit();
    for (const p of pulses) {
      const k = ((t * 0.55 + p.phase) % 1.6) / 1.6;
      p.mesh.scale.setScalar(p.size * (0.4 + k));
      (p.mesh.material as THREE.MeshBasicMaterial).opacity = (1 - k) * 0.7;
    }
    for (const tr of travelers) {
      if (animated) tr.u = (tr.u + dt * tr.speed) % 1;
      tr.curve.getPoint(tr.u, tmp);
      tr.mesh.position.copy(tmp);
      (tr.mesh.material as THREE.MeshBasicMaterial).opacity = Math.min(1, Math.sin(tr.u * Math.PI) * 2);
    }
    const sel = markList.find((m) => m.id === selected);
    if (selRing) {
      selRing.visible = !!sel;
      if (sel) {
        selRing.position.set(sel.x, sel.y + 0.09 * u, sel.z);
        selRing.scale.setScalar(u * (1.25 + Math.sin(t * 3) * 0.05));
      }
    }
    renderer.render(scene, camera);
    placeLabels();
  };

  // Names over the buildings, thinned out where they would overlap.
  const placeLabels = () => {
    const w = width();
    const h = height();
    const taken: [number, number, number, number][] = [];
    const rank = (m: Mark) => (m.id === selected ? -1 : m.point.status === 'late' ? 0 : m.point.status === 'risk' ? 1 : m.point.status === 'done' ? 3 : 2);
    const show = !held;
    for (const m of [...markList].sort((a, b) => rank(a) - rank(b))) {
      if (!m.el) continue;
      const sp = project(m.x, m.top + unit() * 0.15, m.z);
      const ok = show && sp.z < 1 && sp.x > -60 && sp.x < w + 60 && sp.y > -20 && sp.y < h + 40;
      m.el.classList.toggle('rf-on', m.id === selected);
      m.el.classList.toggle('rf-dim', selected !== null && m.id !== selected);
      if (!ok) {
        m.el.style.display = 'none';
        continue;
      }
      m.el.style.display = '';
      m.el.style.transform = `translate(${sp.x.toFixed(1)}px, ${sp.y.toFixed(1)}px) translate(0, -100%)`;
      if (!m.el.dataset.w || m.el.dataset.w === '0') {
        m.el.dataset.w = String(m.el.offsetWidth);
        m.el.dataset.h = String(m.el.offsetHeight);
      }
      const bw = Number(m.el.dataset.w);
      const bh = Number(m.el.dataset.h);
      const r: [number, number, number, number] = [sp.x - 2, sp.y - bh, sp.x + bw, sp.y];
      const hit = taken.some((q) => r[0] < q[2] + 4 && r[2] > q[0] - 4 && r[1] < q[3] + 2 && r[3] > q[1] - 2);
      m.el.style.visibility = hit && m.id !== selected ? 'hidden' : 'visible';
      if (!hit || m.id === selected) taken.push(r);
    }
    if (hqMark?.el) {
      const sp = project(hqMark.x, hqMark.y, hqMark.z);
      hqMark.el.style.display = show && sp.z < 1 ? '' : 'none';
      hqMark.el.style.transform = `translate(${sp.x.toFixed(1)}px, ${(sp.y + 10).toFixed(1)}px) translate(-50%, 0)`;
    }
  };

  raf = requestAnimationFrame(frame);

  const handle: WorldHandle = {
    update(next, nextHq) {
      points = next;
      hq = nextHq;
      const before = landKey;
      fitLand();
      placeMarks();
      if (landKey !== before && !fly && !selected) Object.assign(view, held ? aboveView() : homeView());
    },
    select(id) {
      selected = id;
      lastInteraction = performance.now();
      opts.onSelect?.(id);
    },
    focus(id) {
      const m = markList.find((x) => x.id === id);
      if (!m) return;
      flyTo({ tx: m.x, ty: m.y, tz: m.z, dist: THREE.MathUtils.clamp(view.dist, R * 1.0, R * 1.25), az: view.az, el: Math.min(Math.max(view.el, 0.6), 0.85) }, 1200);
    },
    reset() {
      handle.select(null);
      flyTo(homeView(), 1300);
    },
    arrive() {
      if (!held) return;
      held = false;
      lastInteraction = performance.now();
      if (opts.still) Object.assign(view, homeView());
      else flyTo(homeView(), 2200);
    },
    setAnimated(on) {
      animated = on;
    },
    setInsets(next) {
      insets = { left: next.left ?? 0, right: next.right ?? 0, top: next.top ?? 0, bottom: next.bottom ?? 0 };
      applyInsets();
    },
    setMood(next) {
      mood = next;
      applyMood();
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      ro?.disconnect();
      renderer.domElement.removeEventListener('pointerdown', onDown);
      renderer.domElement.removeEventListener('pointermove', onMove);
      renderer.domElement.removeEventListener('pointerup', onUp);
      renderer.domElement.removeEventListener('pointercancel', onUp);
      renderer.domElement.removeEventListener('wheel', onWheel);
      renderer.domElement.removeEventListener('contextmenu', noMenu);
      for (const m of markList) m.el?.remove();
      hqMark?.el?.remove();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose();
        const mat = m.material as (THREE.Material & { map?: THREE.Texture | null }) | undefined;
        mat?.map?.dispose();
        mat?.dispose?.();
      });
      renderer.dispose();
      renderer.domElement.remove();
      labelLayer.remove();
    },
  };
  return handle;
}
