import * as THREE from 'three';
import { swissBorder } from './globeData';

// Cantia Panorama: the Earth, for real — NASA Blue Marble by day, city
// lights on the night side, shining oceans, clouds and the blue rim of the
// atmosphere — with the company on it: Switzerland outlined, the head office
// as a beacon, every project as a beam of light at its address (coloured by
// its state, a ring pulsing where someone is today), arcs from the head office
// carrying pulses.
//
// Two ways to use it:
//  - 'card' (dashboard): it turns on its own, slows down when Switzerland
//    comes round, dives in until the country fills the view, drifts there,
//    pulls back out and turns again;
//  - 'full' (app/(app)/panorama.tsx through components/relief/ReliefDom.tsx):
//    flies in from space to Switzerland, then the member drags to turn the
//    planet, zooms with the wheel or two fingers, and taps a project to open
//    its card; names of the projects float over them.
//
// Plain three.js, no React.

export type GlobeStatus = 'ok' | 'risk' | 'late' | 'done';

export interface GlobePoint {
  id: string;
  lat: number;
  lon: number;
  status: GlobeStatus;
  /** People planned there today. */
  crew: number;
  name?: string;
  /** Under the name: the current step. */
  detail?: string;
  /** 0 to 1. */
  progress?: number;
  example?: boolean;
}

export type GlobeMood = 'day' | 'night' | 'auto';

export interface GlobeHandle {
  update(points: GlobePoint[], hq: { lat: number; lon: number } | null): void;
  select(id: string | null): void;
  focus(id: string | null): void;
  reset(): void;
  setAnimated(on: boolean): void;
  setInsets(insets: { left?: number; right?: number; top?: number; bottom?: number }): void;
  setMood(mood: GlobeMood): void;
  dispose(): void;
}

interface Options {
  mode: 'card' | 'full';
  accent: string;
  points: GlobePoint[];
  hq: { lat: number; lon: number } | null;
  mood?: GlobeMood;
  /** Name over the head office (full mode). */
  baseLabel?: string;
  onSelect?: (id: string | null) => void;
  /** No motion at all (reduced motion). */
  still?: boolean;
  /** 'space': blue halo (full screen); 'neutral': a quiet grey halo (dashboard). */
  tone?: 'space' | 'neutral';
}

/** Colours of the lights, by state (also for the legend). */
export const GLOBE_STATUS: Record<GlobeStatus, string> = { ok: '#7FE0B4', risk: '#FFC14D', late: '#FF6B5B', done: '#AEB7C4' };
const DEG = Math.PI / 180;
const BERN = { lat: 46.948, lon: 7.447 };
const FOV = 30;
const TAN = Math.tan((FOV * DEG) / 2);

/** Unit vector of a place, lon 0 facing +z, north up. */
function dir(lat: number, lon: number, r = 1) {
  const la = lat * DEG;
  const lo = lon * DEG;
  return new THREE.Vector3(Math.cos(la) * Math.sin(lo) * r, Math.sin(la) * r, Math.cos(la) * Math.cos(lo) * r);
}

/** Where the sun is overhead right now (approximate, good to a degree). */
function subsolar(now = new Date()) {
  const start = Date.UTC(now.getUTCFullYear(), 0, 0);
  const doy = (now.getTime() - start) / 86400000;
  const decl = -23.44 * Math.cos(((2 * Math.PI) / 365) * (doy + 10));
  const hours = now.getUTCHours() + now.getUTCMinutes() / 60;
  return { lat: decl, lon: -15 * (hours - 12) };
}

function textureBase() {
  const w = window as unknown as { __CANTIA_GLOBE_BASE__?: string };
  if (w.__CANTIA_GLOBE_BASE__) return w.__CANTIA_GLOBE_BASE__;
  return /^https?:$/.test(window.location.protocol) ? '/globe/' : 'https://app.cantia.ch/globe/';
}

function glowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.3, 'rgba(255,255,255,.5)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0) / 4294967295;
}

const EARTH_VERT = `
varying vec2 vUv; varying vec3 vN; varying vec3 vP;
void main() {
  vUv = uv;
  vN = normalize(mat3(modelMatrix) * normal);
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vP = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;

const EARTH_FRAG = `
uniform sampler2D dayMap; uniform sampler2D nightMap; uniform sampler2D waterMap; uniform sampler2D bumpMap;
uniform vec3 sunDir; uniform float ready; uniform vec3 rim;
varying vec2 vUv; varying vec3 vN; varying vec3 vP;
void main() {
  vec3 n = normalize(vN);
  vec3 v = normalize(cameraPosition - vP);
  float d = dot(n, sunDir);
  float dayMix = smoothstep(-0.18, 0.22, d);
  vec3 day = texture2D(dayMap, vUv).rgb;
  float relief = texture2D(bumpMap, vUv).r;
  day *= 0.92 + relief * 0.22;
  vec2 o = vec2(0.0007, 0.0007);
  vec3 night = (texture2D(nightMap, vUv).rgb * 2.0 + texture2D(nightMap, vUv + o).rgb + texture2D(nightMap, vUv - o).rgb + texture2D(nightMap, vUv + vec2(o.x, -o.y)).rgb + texture2D(nightMap, vUv - vec2(o.x, -o.y)).rgb) / 6.0;
  float water = texture2D(waterMap, vUv).r;
  vec3 h = normalize(sunDir + v);
  float spec = pow(max(dot(n, h), 0.0), 60.0) * water * 0.75;
  vec3 lit = day * (0.18 + 1.05 * max(d, 0.0)) + vec3(1.0, 0.95, 0.85) * spec * dayMix;
  vec3 lights = pow(night, vec3(1.3)) * vec3(1.0, 0.75, 0.42) * 2.2;
  vec3 dark = day * vec3(0.025, 0.035, 0.06) + lights;
  vec3 col = mix(dark, lit, dayMix);
  float fres = pow(1.0 - max(dot(n, v), 0.0), 3.0);
  col += rim * fres * (0.15 + 0.6 * dayMix);
  col = mix(vec3(0.01, 0.015, 0.04) + fres * 0.05, col, ready);
  gl_FragColor = linearToOutputTexel(vec4(col, 1.0));
}`;

// The Alps up close (scripts/panorama-alps.py): colour, plus the height so the
// real sun lights the slopes, and the lakes that shine.
const ALPS = { w: 3.5, e: 13.5, s: 44.4, n: 49.4 };
const ALPS_FRAG = `
uniform sampler2D alpsMap; uniform sampler2D heightMap; uniform sampler2D nightMap;
uniform vec3 sunDir; uniform float ready; uniform vec3 rim; uniform vec2 texel; uniform vec4 box;
varying vec2 vUv; varying vec3 vN; varying vec3 vP;
float hAt(vec2 uv) { return texture2D(heightMap, uv).r * 4800.0; }
void main() {
  vec3 n = normalize(vN);
  vec3 v = normalize(cameraPosition - vP);
  vec3 east = normalize(cross(vec3(0.0, 1.0, 0.0), n));
  vec3 north = cross(n, east);
  float dx = (hAt(vUv + vec2(texel.x, 0.0)) - hAt(vUv - vec2(texel.x, 0.0))) / (2.0 * 594.0);
  float dy = (hAt(vUv + vec2(0.0, texel.y)) - hAt(vUv - vec2(0.0, texel.y))) / (2.0 * 867.0);
  vec3 pn = normalize(n - east * dx * 1.6 - north * dy * 1.6);
  float d0 = dot(n, sunDir);
  float d = dot(pn, sunDir);
  float dayMix = smoothstep(-0.18, 0.22, d0);
  vec3 day = texture2D(alpsMap, vUv).rgb;
  float water = texture2D(heightMap, vUv).a;
  vec3 h = normalize(sunDir + v);
  float spec = pow(max(dot(n, h), 0.0), 80.0) * water * 0.9;
  vec3 lit = day * (0.22 + 1.1 * max(d, 0.0) * smoothstep(-0.1, 0.15, d0)) + vec3(1.0, 0.95, 0.85) * spec * dayMix;
  vec2 g = vec2((box.x + vUv.x * (box.y - box.x) + 180.0) / 360.0, (box.z + vUv.y * (box.w - box.z) + 90.0) / 180.0);
  vec2 o = vec2(0.0009, 0.0009);
  vec3 night = (texture2D(nightMap, g).rgb * 2.0 + texture2D(nightMap, g + o).rgb + texture2D(nightMap, g - o).rgb + texture2D(nightMap, g + vec2(o.x, -o.y)).rgb + texture2D(nightMap, g - vec2(o.x, -o.y)).rgb) / 6.0;
  vec3 lights = pow(night, vec3(1.3)) * vec3(1.0, 0.75, 0.42) * 2.2;
  vec3 dark = day * vec3(0.025, 0.035, 0.06) * (0.6 + 0.8 * max(dot(pn, normalize(vec3(-0.3, 0.8, 0.5))), 0.0)) + lights;
  vec3 col = mix(dark, lit, dayMix);
  float fres = pow(1.0 - max(dot(n, v), 0.0), 3.0);
  col += rim * fres * (0.15 + 0.6 * dayMix);
  float edge = smoothstep(0.0, 0.14, min(vUv.x, 1.0 - vUv.x)) * smoothstep(0.0, 0.2, min(vUv.y, 1.0 - vUv.y));
  gl_FragColor = linearToOutputTexel(vec4(col, edge * ready));
}`;

const CLOUD_FRAG = `
uniform sampler2D cloudMap; uniform vec3 sunDir; uniform float opacity;
varying vec2 vUv; varying vec3 vN; varying vec3 vP;
void main() {
  float a = texture2D(cloudMap, vUv).r;
  float d = dot(normalize(vN), sunDir);
  float light = 0.01 + 0.95 * smoothstep(-0.15, 0.4, d);
  gl_FragColor = linearToOutputTexel(vec4(vec3(light), a * opacity));
}`;

export function createGlobe(host: HTMLElement, opts: Options): GlobeHandle {
  const full = opts.mode === 'full';
  const width = () => host.clientWidth || 800;
  const height = () => host.clientHeight || 400;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(width(), height());
  Object.assign(renderer.domElement.style, { display: 'block', width: '100%', height: '100%', outline: 'none', touchAction: 'none' });
  host.appendChild(renderer.domElement);
  const labelLayer = document.createElement('div');
  labelLayer.className = 'rf-labels';
  if (full) host.appendChild(labelLayer);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, width() / height(), 0.002, 200);
  let insets = { left: 0, right: 0, top: 0, bottom: 0 };

  // ---- the planet
  const earth = new THREE.Group();
  scene.add(earth);
  const loader = new THREE.TextureLoader();
  loader.setCrossOrigin('anonymous');
  const base = textureBase();
  const blank = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1);
  blank.needsUpdate = true;
  const sunDir = new THREE.Vector3(1, 0, 0);
  const neutral = opts.tone === 'neutral';
  const rim = { value: neutral ? new THREE.Vector3(0.09, 0.09, 0.1) : new THREE.Vector3(0.1, 0.25, 0.6) };
  const earthMat = new THREE.ShaderMaterial({
    uniforms: { dayMap: { value: blank }, nightMap: { value: blank }, waterMap: { value: blank }, bumpMap: { value: blank }, sunDir: { value: sunDir }, ready: { value: 0 }, rim },
    vertexShader: EARTH_VERT,
    fragmentShader: EARTH_FRAG,
  });
  const textures: THREE.Texture[] = [];
  let loaded = 0;
  const load = (file: string, key: 'dayMap' | 'nightMap' | 'waterMap' | 'bumpMap', after?: () => void) => {
    loader.load(`${base}${file}`, (t) => {
      t.colorSpace = key === 'dayMap' || key === 'nightMap' ? THREE.SRGBColorSpace : THREE.NoColorSpace;
      t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      const old = earthMat.uniforms[key].value as THREE.Texture;
      earthMat.uniforms[key].value = t;
      if (old !== blank) old.dispose();
      textures.push(t);
      loaded++;
      after?.();
    });
  };
  // The sharper day picture comes after, for the close-up of Switzerland.
  load('earth-day-2k.jpg', 'dayMap', () => full && load('earth-day-4k.jpg', 'dayMap'));
  load('earth-night-2k.jpg', 'nightMap');
  load('earth-water-2k.jpg', 'waterMap');
  load('earth-bump-2k.jpg', 'bumpMap');
  // The texture's left edge is lon -180 at -z: turn the sphere so lon 0 faces +z.
  const ball = new THREE.Mesh(new THREE.SphereGeometry(1, 160, 120), earthMat);
  ball.rotation.y = -Math.PI / 2;
  earth.add(ball);

  const alpsMat = new THREE.ShaderMaterial({
    uniforms: {
      alpsMap: { value: blank },
      rim,
      heightMap: { value: blank },
      nightMap: earthMat.uniforms.nightMap,
      sunDir: { value: sunDir },
      ready: { value: 0 },
      texel: { value: new THREE.Vector2(1 / 1280, 1 / 640) },
      box: { value: new THREE.Vector4(ALPS.w, ALPS.e, ALPS.s, ALPS.n) },
    },
    vertexShader: EARTH_VERT,
    fragmentShader: ALPS_FRAG,
    transparent: true,
    depthWrite: false,
  });
  let alpsLoaded = 0;
  for (const [file, key] of [['alps-day.jpg', 'alpsMap'], ['alps-height.png', 'heightMap']] as const) {
    loader.load(`${base}${file}`, (t) => {
      t.colorSpace = key === 'alpsMap' ? THREE.SRGBColorSpace : THREE.NoColorSpace;
      t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      alpsMat.uniforms[key].value = t;
      textures.push(t);
      alpsLoaded++;
    });
  }
  const alps = new THREE.Mesh(
    new THREE.SphereGeometry(1.0002, 96, 64, (ALPS.w + 180) * DEG, (ALPS.e - ALPS.w) * DEG, (90 - ALPS.n) * DEG, (ALPS.n - ALPS.s) * DEG),
    alpsMat,
  );
  alps.rotation.y = -Math.PI / 2;
  alps.renderOrder = -1;
  earth.add(alps);

  const cloudMat = new THREE.ShaderMaterial({
    uniforms: { cloudMap: { value: blank }, sunDir: { value: sunDir }, opacity: { value: 0 } },
    vertexShader: EARTH_VERT,
    fragmentShader: CLOUD_FRAG,
    transparent: true,
    depthWrite: false,
  });
  loader.load(`${base}earth-clouds-1k.jpg`, (t) => {
    cloudMat.uniforms.cloudMap.value = t;
    textures.push(t);
  });
  const clouds = new THREE.Mesh(new THREE.SphereGeometry(1.006, 96, 72), cloudMat);
  clouds.rotation.y = -Math.PI / 2;
  earth.add(clouds);

  // Atmosphere: a soft blue rim, brighter on the day side.
  const atmo = new THREE.Mesh(
    new THREE.SphereGeometry(1.1, 64, 48),
    new THREE.ShaderMaterial({
      uniforms: { c: { value: new THREE.Color(neutral ? '#B9BCC2' : '#5AA0FF') }, k: { value: neutral ? 0.55 : 1.4 }, sunDir: { value: sunDir } },
      vertexShader: 'varying vec3 vN; varying vec3 vW; void main(){ vN = normalize(normalMatrix * normal); vW = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader:
        'uniform vec3 c; uniform float k; uniform vec3 sunDir; varying vec3 vN; varying vec3 vW; void main(){ float i = pow(clamp(0.66 - dot(vN, vec3(0.0,0.0,1.0)), 0.0, 1.0), 2.6); float day = 0.35 + 0.65 * smoothstep(-0.3, 0.4, dot(-vW, sunDir) * -1.0); gl_FragColor = vec4(c * i * k * day, i * day); }',
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    }),
  );
  scene.add(atmo);

  // Stars.
  const starPos: number[] = [];
  for (let i = 0; i < 900; i++) {
    const v = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize().multiplyScalar(60 + Math.random() * 40);
    starPos.push(v.x, v.y, v.z);
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: neutral ? '#C8C6C1' : '#AFC2E4', size: 1.2, sizeAttenuation: false, transparent: true, opacity: neutral ? 0.35 : 0.6, depthWrite: false })));

  // Switzerland, outlined.
  const border = new THREE.Group();
  for (const ring of swissBorder()) {
    const pts = ring.map(([la, lo]) => dir(la, lo, 1.0004));
    border.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: '#FFFFFF', transparent: true, opacity: 0.85, depthWrite: false })));
  }
  earth.add(border);

  // ---- the company
  const glowTex = glowTexture();
  let marks = new THREE.Group();
  earth.add(marks);
  type Pulse = { sprite: THREE.Sprite; curve: THREE.QuadraticBezierCurve3; u: number; speed: number };
  type Scaled = { obj: THREE.Object3D; base: number };
  type Mark = { id: string; at: THREE.Vector3; point: GlobePoint; el: HTMLElement | null };
  let pulses: Pulse[] = [];
  let rings: { mesh: THREE.Mesh; phase: number; scale: number }[] = [];
  let beams: { mesh: THREE.Mesh; phase: number }[] = [];
  let scaled: Scaled[] = [];
  let markList: Mark[] = [];
  let hqLabel: HTMLElement | null = null;
  let hqAt = dir(BERN.lat, BERN.lon);
  let hqGeo = BERN;
  let beacon: THREE.Sprite | null = null;
  let selected: string | null = null;

  const sprite = (color: string, size: number, opacity = 1) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending }));
    s.scale.setScalar(size);
    return s;
  };

  function disposeMarks() {
    earth.remove(marks);
    marks.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose();
      (m.material as THREE.Material | undefined)?.dispose?.();
    });
    for (const m of markList) m.el?.remove();
    hqLabel?.remove();
    hqLabel = null;
  }

  function build(points: GlobePoint[], hq: { lat: number; lon: number } | null) {
    disposeMarks();
    marks = new THREE.Group();
    earth.add(marks);
    pulses = [];
    rings = [];
    beams = [];
    scaled = [];
    markList = [];
    hqGeo = hq ?? BERN;
    hqAt = dir(hqGeo.lat, hqGeo.lon);
    const hqPos = dir(hqGeo.lat, hqGeo.lon, 1.0006);

    // Head office: a white beacon with a slow ring; from afar, one warm light.
    const hqGlow = sprite('#FFFFFF', 0.0035);
    hqGlow.position.copy(hqPos);
    marks.add(hqGlow);
    scaled.push({ obj: hqGlow, base: 0.0035 });
    const ringGeo = new THREE.RingGeometry(0.8, 1, 48);
    const addRing = (at: THREE.Vector3, color: string, scale: number, phase: number) => {
      const ring = new THREE.Mesh(ringGeo.clone(), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.6, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
      ring.position.copy(at);
      ring.lookAt(at.clone().multiplyScalar(2));
      marks.add(ring);
      rings.push({ mesh: ring, phase, scale });
    };
    addRing(hqPos, '#FFFFFF', 0.006, 0);
    beacon = sprite('#FFD9A8', 0.09, 0.9);
    beacon.position.copy(dir(hqGeo.lat, hqGeo.lon, 1.01));
    marks.add(beacon);
    if (full && opts.baseLabel) {
      hqLabel = document.createElement('div');
      hqLabel.className = 'rf-base';
      hqLabel.textContent = opts.baseLabel;
      labelLayer.appendChild(hqLabel);
    }

    points.forEach((p, i) => {
      // Unknown or identical place: spread a little around it, always the same way.
      const j = hash(p.id);
      const k = hash(`${p.id}·`);
      const near = Math.abs(p.lat - hqGeo.lat) < 0.01 && Math.abs(p.lon - hqGeo.lon) < 0.01;
      const lat = p.lat + (near ? (j - 0.5) * 0.3 : (j - 0.5) * 0.02);
      const lon = p.lon + (near ? (k - 0.5) * 0.45 : (k - 0.5) * 0.02);
      const baseV = dir(lat, lon, 1.0004);
      const color = GLOBE_STATUS[p.status];
      const len = p.status === 'done' ? 0.0018 : 0.0035 + Math.min(3, p.crew) * 0.0012;
      const beam = new THREE.Mesh(
        new THREE.CylinderGeometry(0.00016, 0.0003, len, 6, 1, true).translate(0, len / 2, 0),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending }),
      );
      beam.position.copy(baseV);
      beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), baseV.clone().normalize());
      marks.add(beam);
      beams.push({ mesh: beam, phase: i * 0.7 });
      scaled.push({ obj: beam, base: 1 });
      const head = sprite(color, 0.0024);
      head.position.copy(baseV.clone().normalize().multiplyScalar(1.0004 + len));
      head.userData.len = len;
      marks.add(head);
      scaled.push({ obj: head, base: 0.0024 });
      if (p.crew > 0 || p.status === 'late') addRing(baseV, color, 0.0035, i * 0.9);

      const mid = hqPos.clone().add(baseV).multiplyScalar(0.5);
      const d = hqPos.distanceTo(baseV);
      const ctrl = mid.normalize().multiplyScalar(1.001 + Math.max(0.004, d * 0.45));
      const curve = new THREE.QuadraticBezierCurve3(hqPos.clone(), ctrl, baseV.clone());
      marks.add(
        new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(curve.getPoints(40)),
          new THREE.LineBasicMaterial({ color: opts.accent, transparent: true, opacity: 0.6, depthWrite: false, blending: THREE.AdditiveBlending }),
        ),
      );
      if (p.status !== 'done') {
        const s = sprite(color, 0.0017);
        marks.add(s);
        pulses.push({ sprite: s, curve, u: j, speed: 0.25 + k * 0.25 });
      }

      let el: HTMLElement | null = null;
      if (full && p.name) {
        el = document.createElement('button');
        (el as HTMLButtonElement).type = 'button';
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
      }
      markList.push({ id: p.id, at: baseV.clone().normalize(), point: { ...p, lat, lon }, el });
    });
  }
  build(opts.points, opts.hq);

  // ---- light: the real sun, or a pleasant morning / a night over Switzerland
  let mood: GlobeMood = opts.mood ?? 'auto';
  const sunEarth = new THREE.Vector3();
  const placeSun = () => {
    if (mood === 'auto') {
      const s = subsolar();
      sunEarth.copy(dir(s.lat, s.lon));
    } else if (mood === 'day') sunEarth.copy(dir(hqGeo.lat - 22, hqGeo.lon + 28));
    else sunEarth.copy(dir(-hqGeo.lat * 0.3, hqGeo.lon + 165));
  };
  placeSun();

  // ---- camera
  // Card: the planet turns under a fixed camera. Full: the planet is still
  // and the camera moves over it (lat / lon of the point looked at, altitude).
  let theta = -Math.atan2(hqAt.x, hqAt.z) - 1.3;
  let spin = 0.24;
  type Phase = 'spin' | 'in' | 'hold' | 'out';
  let phase: Phase = 'spin';
  let phaseT = 0;
  let spun = 0;
  const SPIN = 0.24;
  const DRIFT = 0.012;
  const IN = 2.8;
  const HOLD = 9;
  const OUT = 2.6;
  const ease = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);

  const view = { lat: 30, lon: hqGeo.lon - 70, alt: 3.2 };
  let fly: { from: typeof view; to: typeof view; t0: number; dur: number } | null = null;
  let animated = !opts.still;
  let lastInteraction = performance.now();

  const freeAspect = () => Math.max(0.3, (width() - insets.left - insets.right) / Math.max(1, height() - insets.top - insets.bottom));
  const freeHeightRatio = () => Math.max(0.3, (height() - insets.top - insets.bottom) / height());
  const homeAlt = () => {
    // Switzerland (0.057 rad wide) across the free area, with a margin.
    const w = (width() < 600 ? 0.066 : 0.08) / (2 * TAN * freeAspect() * freeHeightRatio());
    return THREE.MathUtils.clamp(w, 0.09, 0.6);
  };
  const homeView = () => ({ lat: hqGeo.lat - 0.25, lon: hqGeo.lon + 0.4, alt: homeAlt() });
  const flyTo = (to: typeof view, dur = 1500) => {
    fly = { from: { ...view }, to, t0: performance.now(), dur };
  };

  const placeFullCamera = () => {
    const t = dir(view.lat, view.lon);
    const north = new THREE.Vector3(0, 1, 0).sub(t.clone().multiplyScalar(t.y)).normalize();
    // Close up the camera leans back to the south, from afar it looks at the centre.
    const tilt = THREE.MathUtils.clamp(1 - view.alt / 1.2, 0, 1) * 0.75;
    camera.position.copy(t).multiplyScalar(1 + view.alt).add(north.clone().multiplyScalar(-view.alt * tilt));
    const toCenter = THREE.MathUtils.smoothstep(view.alt, 0.5, 2.2);
    const look = t.clone().multiplyScalar(1 - toCenter);
    camera.up.copy(north.clone().lerp(new THREE.Vector3(0, 1, 0), toCenter).normalize());
    camera.lookAt(look);
  };

  const cardCamera = (k: number) => {
    const h = height();
    const far = (1.16 * h) / (TAN * Math.max(1, Math.min(h - insets.bottom, width())));
    const a = new THREE.Vector3(0, Math.sin(24 * DEG), Math.cos(24 * DEG)).multiplyScalar(far);
    const aT = new THREE.Vector3(0, 0.06, 0);
    const p = hqAt.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), theta);
    const north = new THREE.Vector3(0, 1, 0).sub(p.clone().multiplyScalar(p.y)).normalize();
    const back = THREE.MathUtils.clamp(760 / width(), 1, 2.2);
    const b = p.clone().multiplyScalar(1 + 0.075 * back).add(north.clone().multiplyScalar(-0.055 * back));
    const bT = p.clone().add(north.clone().multiplyScalar(0.004));
    camera.position.lerpVectors(a, b, k);
    camera.up.set(0, 1, 0);
    camera.lookAt(aT.lerp(bT, k));
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
  applyInsets();

  // ---- touch / mouse (full mode)
  const pointers = new Map<number, { x: number; y: number }>();
  let downAt: { x: number; y: number; t: number } | null = null;
  let pinch = 0;
  let vel = { lat: 0, lon: 0 };
  const radPerPx = () => (view.alt * 2 * TAN) / height();
  const tmp = new THREE.Vector3();
  const project = (v: THREE.Vector3) => {
    tmp.copy(v).applyMatrix4(earth.matrixWorld).project(camera);
    return { x: (tmp.x * 0.5 + 0.5) * width(), y: (-tmp.y * 0.5 + 0.5) * height(), z: tmp.z };
  };
  const facing = (v: THREE.Vector3) => {
    const w = v.clone().applyMatrix4(earth.matrixWorld);
    return w.dot(camera.position.clone().sub(w)) > 0;
  };
  const pickAt = (x: number, y: number) => {
    let best: { id: string; d: number } | null = null;
    for (const m of markList) {
      if (!facing(m.at)) continue;
      const s = project(m.at);
      const d = Math.hypot(s.x - x, s.y - y);
      if (d < 28 && (!best || d < best.d)) best = { id: m.id, d };
    }
    return best?.id ?? null;
  };
  const local = (e: PointerEvent | WheelEvent) => {
    const r = renderer.domElement.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const onDown = (e: PointerEvent) => {
    renderer.domElement.setPointerCapture?.(e.pointerId);
    pointers.set(e.pointerId, local(e));
    if (pointers.size === 1) downAt = { ...local(e), t: performance.now() };
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinch = Math.hypot(a.x - b.x, a.y - b.y);
    }
    fly = null;
    vel = { lat: 0, lon: 0 };
    lastInteraction = performance.now();
  };
  const onMove = (e: PointerEvent) => {
    if (!pointers.has(e.pointerId)) {
      if (full) renderer.domElement.style.cursor = pickAt(local(e).x, local(e).y) ? 'pointer' : 'grab';
      return;
    }
    const prev = pointers.get(e.pointerId)!;
    const now = local(e);
    pointers.set(e.pointerId, now);
    lastInteraction = performance.now();
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinch > 0) view.alt = THREE.MathUtils.clamp(view.alt * (pinch / d), 0.02, 3.6);
      pinch = d;
      return;
    }
    const k = radPerPx() / DEG;
    const dLat = (now.y - prev.y) * k;
    const dLon = (-(now.x - prev.x) * k) / Math.max(0.2, Math.cos(view.lat * DEG));
    view.lat = THREE.MathUtils.clamp(view.lat + dLat, -80, 80);
    view.lon += dLon;
    vel = { lat: dLat, lon: dLon };
  };
  const onUp = (e: PointerEvent) => {
    const p = local(e);
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinch = 0;
    if (downAt && Math.hypot(p.x - downAt.x, p.y - downAt.y) < 6 && performance.now() - downAt.t < 600) {
      const id = pickAt(p.x, p.y);
      handle.select(id);
      if (id) handle.focus(id);
      vel = { lat: 0, lon: 0 };
    }
    downAt = null;
  };
  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    fly = null;
    lastInteraction = performance.now();
    view.alt = THREE.MathUtils.clamp(view.alt * Math.exp(e.deltaY * 0.0012), 0.02, 3.6);
  };
  if (full) {
    renderer.domElement.addEventListener('pointerdown', onDown);
    renderer.domElement.addEventListener('pointermove', onMove);
    renderer.domElement.addEventListener('pointerup', onUp);
    renderer.domElement.addEventListener('pointercancel', onUp);
    renderer.domElement.addEventListener('wheel', onWheel, { passive: false });
    // Arrive from space.
    if (!opts.still) flyTo(homeView(), 2800);
    else Object.assign(view, homeView());
  } else renderer.domElement.style.pointerEvents = 'none';

  // ---- loop
  let raf = 0;
  let last = performance.now();
  let t = 0;
  const frame = () => {
    raf = requestAnimationFrame(frame);
    const now = performance.now();
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (animated) t += dt;

    let k = 0;
    if (!full) {
      phaseT += animated ? dt : 0;
      const front = (((-Math.atan2(hqAt.x, hqAt.z) - theta) % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2) - Math.PI;
      if (opts.still) theta = -Math.atan2(hqAt.x, hqAt.z);
      else if (animated) {
        if (phase === 'spin') {
          spin += (SPIN - spin) * Math.min(1, dt * 2);
          if (spun > 2.5 && front > 0.3 && front < 0.75) {
            phase = 'in';
            phaseT = 0;
          }
        } else if (phase === 'in') {
          spin = Math.max(DRIFT, front / Math.max(0.25, IN - phaseT));
          if (phaseT >= IN) {
            phase = 'hold';
            phaseT = 0;
          }
        } else if (phase === 'hold') {
          spin += (DRIFT - spin) * Math.min(1, dt * 3);
          if (phaseT >= HOLD) {
            phase = 'out';
            phaseT = 0;
          }
        } else if (phaseT >= OUT) {
          phase = 'spin';
          phaseT = 0;
          spun = 0;
        } else spin += (SPIN - spin) * Math.min(1, dt * 1.2);
        theta += spin * dt;
        spun += dt;
      }
      earth.rotation.y = theta;
      if (opts.still) k = 0.8;
      else if (phase === 'in') k = ease(Math.min(1, phaseT / IN));
      else if (phase === 'hold') k = 1;
      else if (phase === 'out') k = 1 - ease(Math.min(1, phaseT / OUT));
      cardCamera(k);
    } else {
      if (fly) {
        const q = Math.min(1, (now - fly.t0) / fly.dur);
        const e = ease(q);
        view.lat = fly.from.lat + (fly.to.lat - fly.from.lat) * e;
        let dl = fly.to.lon - fly.from.lon;
        dl = ((((dl + 180) % 360) + 360) % 360) - 180;
        view.lon = fly.from.lon + dl * e;
        // Rise a little between two far places, then come down.
        const hop = Math.min(0.6, (Math.abs(fly.to.lat - fly.from.lat) + Math.abs(dl)) / 60);
        view.alt = Math.exp(Math.log(fly.from.alt) + (Math.log(fly.to.alt) - Math.log(fly.from.alt)) * e) + Math.sin(q * Math.PI) * hop;
        if (q >= 1) fly = null;
      } else if (!pointers.size) {
        view.lat = THREE.MathUtils.clamp(view.lat + vel.lat, -80, 80);
        view.lon += vel.lon;
        vel.lat *= 0.9;
        vel.lon *= 0.9;
        // Left alone for a while with nothing open: the planet drifts slowly.
        if (animated && !selected && now - lastInteraction > 20000) view.lon += dt * 0.6 * Math.min(1, view.alt);
      }
      placeFullCamera();
      k = THREE.MathUtils.clamp(1 - (view.alt - 0.25) / 1.4, 0, 1);
    }

    // Light follows the planet.
    if (mood === 'auto' && Math.floor(t) % 30 === 0) placeSun();
    sunDir.copy(sunEarth).applyQuaternion(earth.quaternion);
    if (earthMat.uniforms.ready.value < 1 && loaded >= 1) earthMat.uniforms.ready.value = Math.min(1, earthMat.uniforms.ready.value + dt * 1.5);
    if (alpsMat.uniforms.ready.value < 1 && alpsLoaded >= 2 && loaded >= 2) alpsMat.uniforms.ready.value = Math.min(1, alpsMat.uniforms.ready.value + dt * 1.5);
    clouds.rotation.y = -Math.PI / 2 + t * 0.004;
    // Clouds thin out as we come close, so Switzerland stays clear.
    cloudMat.uniforms.opacity.value = 0.85 * (1 - k) * Math.min(1, earthMat.uniforms.ready.value);

    // Markers keep about the same size on screen.
    const alt = full ? view.alt : camera.position.distanceTo(hqAt.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), theta));
    const s = THREE.MathUtils.clamp(alt / 0.16, 0.25, 6);
    for (const sc of scaled) {
      if (sc.obj instanceof THREE.Sprite) sc.obj.scale.setScalar(sc.base * s);
      else sc.obj.scale.set(s, s, s);
    }
    for (const m of marks.children) {
      if (m instanceof THREE.Sprite && m.userData.len) m.position.setLength(1.0004 + m.userData.len * s);
    }
    if (beacon) (beacon.material as THREE.SpriteMaterial).opacity = 0.9 * THREE.MathUtils.clamp((alt - 0.5) / 1.5, 0, 1) * (0.8 + 0.2 * Math.sin(t * 2));
    for (const r of rings) {
      const u = ((t * 0.6 + r.phase) % 1.6) / 1.6;
      r.mesh.scale.setScalar(r.scale * s * (0.2 + u));
      (r.mesh.material as THREE.MeshBasicMaterial).opacity = (1 - u) * 0.75;
    }
    for (const b of beams) (b.mesh.material as THREE.MeshBasicMaterial).opacity = 0.7 + 0.3 * Math.sin(t * 2.4 + b.phase);
    for (const p of pulses) {
      if (animated) p.u = (p.u + dt * p.speed) % 1;
      p.curve.getPoint(p.u, tmp);
      p.sprite.position.copy(tmp);
      p.sprite.scale.setScalar(0.0017 * s);
      (p.sprite.material as THREE.SpriteMaterial).opacity = Math.sin(p.u * Math.PI);
    }
    for (const line of border.children) ((line as THREE.Line).material as THREE.LineBasicMaterial).opacity = 0.35 + 0.5 * THREE.MathUtils.clamp(1 - (alt - 0.1) / 2, 0, 1);

    earth.updateMatrixWorld();
    renderer.render(scene, camera);

    if (full) placeLabels();
  };

  // Names over the projects, thinned out where they would overlap.
  const placeLabels = () => {
    const w = width();
    const h = height();
    const show = view.alt < 0.9;
    const taken: [number, number, number, number][] = [];
    const order = [...markList].sort((a, b) => rank(a) - rank(b));
    for (const m of order) {
      if (!m.el) continue;
      const sp = project(m.at.clone().multiplyScalar(1.0004));
      const ok = show && facing(m.at) && sp.z < 1 && sp.x > -50 && sp.x < w + 50 && sp.y > -20 && sp.y < h + 40;
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
    if (hqLabel) {
      const sp = project(hqAt.clone().multiplyScalar(1.0004));
      const ok = view.alt < 2.5 && facing(hqAt);
      hqLabel.style.display = ok ? '' : 'none';
      if (ok) hqLabel.style.transform = `translate(${sp.x.toFixed(1)}px, ${(sp.y + 12).toFixed(1)}px) translate(-50%, 0)`;
    }
  };
  const rank = (m: Mark) => (m.id === selected ? -1 : m.point.status === 'late' ? 0 : m.point.status === 'risk' ? 1 : m.point.status === 'done' ? 3 : 2);

  raf = requestAnimationFrame(frame);

  const handle: GlobeHandle = {
    update(points, hq) {
      build(points, hq);
      placeSun();
    },
    select(id) {
      selected = id;
      lastInteraction = performance.now();
      opts.onSelect?.(id);
    },
    focus(id) {
      const m = markList.find((x) => x.id === id);
      if (!m || !full) return;
      flyTo({ lat: m.point.lat - 0.04, lon: m.point.lon, alt: Math.min(view.alt, 0.035) }, 1300);
    },
    reset() {
      handle.select(null);
      if (full) flyTo(homeView(), 1400);
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
      placeSun();
    },
    dispose() {
      cancelAnimationFrame(raf);
      ro?.disconnect();
      renderer.domElement.removeEventListener('pointerdown', onDown);
      renderer.domElement.removeEventListener('pointermove', onMove);
      renderer.domElement.removeEventListener('pointerup', onUp);
      renderer.domElement.removeEventListener('pointercancel', onUp);
      renderer.domElement.removeEventListener('wheel', onWheel);
      disposeMarks();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose();
        (m.material as THREE.Material | undefined)?.dispose?.();
      });
      textures.forEach((x) => x.dispose());
      blank.dispose();
      glowTex.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      labelLayer.remove();
    },
  };
  return handle;
}
