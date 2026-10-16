import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { ReliefData, ReliefItem, ReliefSpec, ReliefStyle } from './types';

// Cantia Relief: the scene. A tabletop miniature of the company drawn with
// three.js from its ReliefSpec (base model, process steps, look — written by
// the AI) and its ReliefData (projects, today's crew, tasks — read live):
//
//  - territoire: sites spread over the land around the depot, each built up
//    to its step (ground works, shell with a crane, scaffolding, finishing,
//    handed over), roads to the depot, a van for each crew out today;
//  - studio: a district where each project is a building with one floor per
//    step: finished floors, the current one in the accent colour, the
//    coming ones drawn as outlines;
//  - atelier: a workshop hall with a bay per job, the object being worked
//    on, and a path of floor tiles that lights up step by step.
//
// Plain three.js, no React: it runs inside the DOM component
// (components/relief/ReliefDom.tsx). update() rebuilds the scene from new
// data and keeps the camera where it is.

export interface ReliefHandle {
  select(id: string | null): void;
  focus(id: string | null): void;
  reset(): void;
  setAnimated(on: boolean): void;
  update(data: ReliefData): void;
  /** Swap the world plan (onboarding preview), keeping the camera. */
  setSpec(spec: ReliefSpec, data: ReliefData): void;
  /** Screen space covered by panels (px): the view centres in what's left. */
  setInsets(insets: { left?: number; right?: number; bottom?: number; top?: number }): void;
  setMood(mood: 'day' | 'dusk'): void;
  dispose(): void;
}

interface Options {
  onSelect(id: string | null): void;
  baseLabel: string;
  exampleLabel: string;
  /** Onboarding preview: turns on its own from the start. */
  preview?: boolean;
  /** Items rise from the ground when the world is (re)built. */
  intro?: boolean;
  /** false: a picture that turns on its own (dashboard), no mouse or touch. */
  interactive?: boolean;
  /** No sky colour: the page behind shows through around the miniature. */
  transparent?: boolean;
  /** Bigger than 1: the home view comes closer (a card can crop the edges). */
  zoom?: number;
  /** 'dusk': evening light, lit windows, street lamps, glowing data cables. */
  mood?: 'day' | 'dusk';
  /** Floating progress gauges over each item (when labels are hidden). */
  hud?: boolean;
}

// ------------------------------------------------------------------ palette

const ACCENT: Record<string, string> = { terracotta: '#A95C30', sapin: '#2F6B4F', lac: '#2F6E8A', ardoise: '#4A5563', prune: '#7A4A6E' };

const C = {
  bg: '#EFE8DC',
  grass: '#B9C29A',
  grassDark: '#98A578',
  grassLight: '#C9D0AC',
  soil: '#8E6E50',
  soilDark: '#6F543D',
  paving: '#DCD5CA',
  pavingDark: '#C9C1B4',
  road: '#7D7871',
  roadLine: '#EFE9DD',
  sand: '#E4D8BD',
  water: '#8DB6C2',
  rock: '#ADA69C',
  rockDark: '#978F84',
  snow: '#F5F2EC',
  trunk: '#7A5E45',
  leaf1: '#859E66',
  leaf2: '#98AE75',
  pine: '#66825E',
  concrete: '#D2CCC2',
  concreteDark: '#BDB6AA',
  floor: '#D9D3C8',
  render: '#F3EEE6',
  renderWarm: '#EAE0D0',
  wood: '#B98A5E',
  woodDark: '#6E5645',
  roofGrey: '#73695F',
  glass: '#4A5C68',
  glassLight: '#7D93A0',
  dirt: '#C9AA86',
  dirtDark: '#A2835F',
  scaffold: '#C9C3B8',
  plank: '#C9A160',
  crane: '#DDA845',
  dark: '#34363A',
  white: '#F5F2EC',
  skin: '#E2BE9A',
  helmet: '#F0C640',
  outline: '#B9AC98',
  lane: '#E6C34F',
};

// ------------------------------------------------------------------ helpers

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

const materialCache = new Map<string, THREE.Material>();
// Set by the world being built: at dusk, window glass glows.
let MOOD: 'day' | 'dusk' = 'day';
const GLOW = new Set(['#4A5C68', '#7D93A0', '#56697A']);
function mat(color: string, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) {
  const lit = MOOD === 'dusk' && GLOW.has(color) && !('emissive' in extra);
  const key = color + JSON.stringify(extra) + (lit ? '|lit' : '');
  let m = materialCache.get(key) as THREE.MeshStandardMaterial | undefined;
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color, roughness: 0.93, metalness: 0, flatShading: true, ...(lit ? { emissive: '#FFC47E', emissiveIntensity: 0.9 } : {}), ...extra });
    materialCache.set(key, m);
  }
  return m;
}

function mesh(geo: THREE.BufferGeometry, color: string, shadow = true, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) {
  const m = new THREE.Mesh(geo, mat(color, extra));
  m.castShadow = shadow;
  m.receiveShadow = true;
  return m;
}

function boxGeo(w: number, h: number, d: number, x = 0, y = 0, z = 0) {
  const g = new THREE.BoxGeometry(w, h, d);
  g.translate(x, y + h / 2, z);
  return g;
}

function box(w: number, h: number, d: number, color: string, x = 0, y = 0, z = 0) {
  return mesh(boxGeo(w, h, d, x, y, z), color);
}

function merged(geos: THREE.BufferGeometry[], color: string, shadow = true, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) {
  const g = mergeGeometries(geos.map((x) => (x.index ? x.toNonIndexed() : x)));
  geos.forEach((x) => x.dispose());
  return mesh(g, color, shadow, extra);
}

function gableGeo(w: number, d: number, h: number, overhang = 0.6) {
  const s = new THREE.Shape();
  s.moveTo(-w / 2 - overhang, 0);
  s.lineTo(w / 2 + overhang, 0);
  s.lineTo(0, h);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: d + overhang * 2, bevelEnabled: false });
  g.translate(0, 0, -(d + overhang * 2) / 2);
  return g;
}

function ribbonGeo(curve: THREE.Curve<THREE.Vector3>, width: number, y: number, samples = 100) {
  const pos: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const p = curve.getPointAt(t);
    const tan = curve.getTangentAt(t);
    const n = new THREE.Vector3(-tan.z, 0, tan.x).normalize().multiplyScalar(width / 2);
    pos.push(p.x + n.x, y, p.z + n.z, p.x - n.x, y, p.z - n.z);
    if (i < samples) {
      const a = i * 2;
      idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

function outline(w: number, h: number, d: number, y: number, color: string) {
  const geo = new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d));
  geo.translate(0, y + h / 2, 0);
  return new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.75 }));
}

class Occupancy {
  spots: { x: number; z: number; r: number }[] = [];
  constructor(
    public W: number,
    public D: number,
  ) {}
  add(x: number, z: number, r: number) {
    this.spots.push({ x, z, r });
  }
  addCurve(curve: THREE.Curve<THREE.Vector3>, r: number, samples = 50) {
    for (let i = 0; i <= samples; i++) {
      const p = curve.getPointAt(i / samples);
      this.add(p.x, p.z, r);
    }
  }
  free(x: number, z: number, r: number) {
    if (Math.abs(x) > this.W - 4 - r || Math.abs(z) > this.D - 4 - r) return false;
    return this.spots.every((s) => (s.x - x) ** 2 + (s.z - z) ** 2 > (s.r + r) ** 2);
  }
}

// ------------------------------------------------------------------ small props

function person(color: string, helmet: string | null) {
  const g = new THREE.Group();
  g.add(box(0.24, 0.85, 0.26, C.dark, -0.15, 0, 0));
  g.add(box(0.24, 0.85, 0.26, C.dark, 0.15, 0, 0));
  g.add(box(0.62, 0.8, 0.36, color, 0, 0.85, 0));
  const head = mesh(new THREE.SphereGeometry(0.24, 10, 8), C.skin);
  head.position.y = 1.9;
  g.add(head);
  if (helmet) {
    const hat = mesh(new THREE.SphereGeometry(0.28, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), helmet);
    hat.position.y = 1.98;
    g.add(hat);
  }
  g.scale.setScalar(1.5);
  return g;
}

function tree(kind: 'pine' | 'leaf', s: number, color: string) {
  const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(0.22 * s, 0.3 * s, 1.6 * s, 6).translate(0, 0.8 * s, 0), C.trunk));
  if (kind === 'pine') {
    g.add(mesh(new THREE.ConeGeometry(1.5 * s, 3.2 * s, 7).translate(0, 2.6 * s, 0), color));
    g.add(mesh(new THREE.ConeGeometry(1.1 * s, 2.4 * s, 7).translate(0, 3.9 * s, 0), color));
  } else {
    g.add(mesh(new THREE.IcosahedronGeometry(1.5 * s, 0).translate(0, 2.7 * s, 0), color));
  }
  return g;
}

function car(color: string) {
  const g = new THREE.Group();
  const wheels: THREE.BufferGeometry[] = [];
  for (const [x, z] of [
    [-0.95, 0.62],
    [-0.95, -0.62],
    [0.95, 0.62],
    [0.95, -0.62],
  ])
    wheels.push(new THREE.CylinderGeometry(0.32, 0.32, 0.24, 10).rotateX(Math.PI / 2).translate(x, 0.32, z));
  g.add(merged(wheels, C.dark));
  g.add(box(2.9, 0.75, 1.4, color, 0, 0.3, 0), box(1.6, 0.62, 1.28, color, -0.15, 1.05, 0), box(1.62, 0.42, 1.3, C.glass, -0.15, 1.12, 0));
  const head = MOOD === 'dusk' ? { emissive: '#FFF1C2', emissiveIntensity: 2.2 } : {};
  const tail = MOOD === 'dusk' ? { emissive: '#FF4A3A', emissiveIntensity: 1.6 } : {};
  g.add(mesh(boxGeo(0.06, 0.22, 0.32, 1.46, 0.6, 0.42), '#FFF6DA', false, head), mesh(boxGeo(0.06, 0.22, 0.32, 1.46, 0.6, -0.42), '#FFF6DA', false, head));
  g.add(mesh(boxGeo(0.06, 0.2, 0.3, -1.46, 0.6, 0.45), '#C8382C', false, tail), mesh(boxGeo(0.06, 0.2, 0.3, -1.46, 0.6, -0.45), '#C8382C', false, tail));
  return g;
}

function lamp() {
  const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(0.09, 0.13, 4.2, 6).translate(0, 2.1, 0), '#3B3A38'), mesh(boxGeo(0.9, 0.1, 0.12, 0.35, 4.15, 0), '#3B3A38', false));
  g.add(mesh(boxGeo(0.42, 0.2, 0.32, 0.72, 3.95, 0), '#FFF1CC', false, MOOD === 'dusk' ? { emissive: '#FFD58A', emissiveIntensity: 2.4 } : {}));
  return g;
}

const CAR_COLORS = ['#B84A3A', '#3F6E8C', '#E8E2D6', '#2F3A44', '#C9A13B', '#6E8B4A', '#8A8F96'];

function van(accent: string) {
  const g = new THREE.Group();
  const wheels: THREE.BufferGeometry[] = [];
  for (const [x, z] of [
    [-1.7, 1.0],
    [-1.7, -1.0],
    [1.6, 1.0],
    [1.6, -1.0],
  ])
    wheels.push(new THREE.CylinderGeometry(0.5, 0.5, 0.36, 10).rotateX(Math.PI / 2).translate(x, 0.5, z));
  g.add(merged(wheels, C.dark));
  g.add(box(5.2, 2.2, 2.1, C.white, -0.1, 0.55, 0));
  g.add(box(5.22, 0.3, 2.12, accent, -0.1, 1.3, 0));
  g.add(box(0.1, 0.8, 1.8, C.glass, 2.5, 1.6, 0));
  g.scale.setScalar(0.85);
  return g;
}

function scaffold(w: number, d: number, h: number, sides: ('n' | 's' | 'e' | 'w')[]) {
  const poles: THREE.BufferGeometry[] = [];
  const planks: THREE.BufferGeometry[] = [];
  const off = 1.0;
  const lift = 2;
  const levels = Math.max(1, Math.floor(h / lift));
  for (const side of sides) {
    const along = side === 'n' || side === 's' ? w + off * 2 : d + off * 2;
    const n = Math.max(2, Math.round(along / 2.4));
    const place = (a: number, y: number, len: number, height: number, depth: number, out: number) => {
      if (side === 's') return boxGeo(len, height, depth, a, y, d / 2 + out);
      if (side === 'n') return boxGeo(len, height, depth, a, y, -d / 2 - out);
      if (side === 'e') return boxGeo(depth, height, len, w / 2 + out, y, a);
      return boxGeo(depth, height, len, -w / 2 - out, y, a);
    };
    for (let i = 0; i <= n; i++) {
      const a = -along / 2 + (along * i) / n;
      poles.push(place(a, 0, 0.12, levels * lift + 1, 0.12, off));
      poles.push(place(a, 0, 0.12, levels * lift + 1, 0.12, off + 0.9));
    }
    for (let l = 1; l <= levels; l++) planks.push(place(0, l * lift, along, 0.1, 0.9, off + 0.45));
  }
  const g = new THREE.Group();
  if (poles.length) g.add(merged(poles, C.scaffold));
  if (planks.length) g.add(merged(planks, C.plank));
  return g;
}

function windows(w: number, d: number, floors: number, floorH: number, base: number, color: string) {
  const geos: THREE.BufferGeometry[] = [];
  for (let f = 0; f < floors; f++) {
    const y = base + f * floorH + floorH * 0.32;
    const nx = Math.max(1, Math.floor(w / 2.6));
    const nz = Math.max(1, Math.floor(d / 2.6));
    for (let i = 0; i < nx; i++) {
      const x = -w / 2 + (w * (i + 0.5)) / nx;
      geos.push(boxGeo(1.1, floorH * 0.45, 0.1, x, y, d / 2 + 0.03), boxGeo(1.1, floorH * 0.45, 0.1, x, y, -d / 2 - 0.03));
    }
    for (let i = 0; i < nz; i++) {
      const z = -d / 2 + (d * (i + 0.5)) / nz;
      geos.push(boxGeo(0.1, floorH * 0.45, 1.1, w / 2 + 0.03, y, z), boxGeo(0.1, floorH * 0.45, 1.1, -w / 2 - 0.03, y, z));
    }
  }
  return merged(geos, color, false);
}

// ------------------------------------------------------------------ item builders

interface Built {
  group: THREE.Group;
  top: number;
  radius: number;
  cranes: { jib: THREE.Object3D; phase: number }[];
  arms: { arm: THREE.Object3D; phase: number }[];
  /** Where the crew stands, in the item's local coordinates. */
  spots: THREE.Vector3[];
  /** Point where the road / path arrives, local. */
  gate: THREE.Vector3;
}

const SITE_KIND: Record<string, { w: number; d: number; floors: number; floorH: number; roof: 'gable' | 'flat'; finish: string; roofColor: string }> = {
  villa: { w: 9, d: 7, floors: 2, floorH: 2.8, roof: 'gable', finish: C.render, roofColor: C.roofGrey },
  immeuble: { w: 13, d: 9, floors: 4, floorH: 2.9, roof: 'flat', finish: C.renderWarm, roofColor: C.concreteDark },
  halle: { w: 15, d: 10, floors: 1, floorH: 5.5, roof: 'gable', finish: '#D9D4CA', roofColor: '#8E8A84' },
  chalet: { w: 8, d: 7, floors: 2, floorH: 2.6, roof: 'gable', finish: C.wood, roofColor: C.woodDark },
};

// territoire: a site at its step of the process.
function buildSite(item: ReliefItem, stages: number, accent: string, rand: () => number): Built {
  const g = new THREE.Group();
  const k = SITE_KIND[item.style] ?? SITE_KIND.villa;
  const plotW = k.w + 9;
  const plotD = k.d + 8;
  const f = stages > 1 ? item.stage / (stages - 1) : 1;
  const done = item.status === 'done' || f >= 1;
  const phase = done ? 'done' : f < 0.2 ? 'ground' : f < 0.5 ? 'shell' : f < 0.8 ? 'inner' : 'finish';
  const fullH = k.floors * k.floorH;
  const built: Built = { group: g, top: 4, radius: Math.max(plotW, plotD) / 2 + 1, cranes: [], arms: [], spots: [], gate: new THREE.Vector3(0, 0, plotD / 2 + 1.5) };

  g.add(mesh(boxGeo(plotW, 0.08, plotD), done ? C.grassLight : C.dirt, false));
  if (!done) {
    const posts: THREE.BufferGeometry[] = [];
    const hw = plotW / 2;
    const hd = plotD / 2;
    const edge = (x1: number, z1: number, x2: number, z2: number) => {
      const n = Math.max(1, Math.round(Math.hypot(x2 - x1, z2 - z1) / 2));
      for (let i = 0; i <= n; i++) posts.push(boxGeo(0.12, 1.4, 0.12, x1 + ((x2 - x1) * i) / n, 0, z1 + ((z2 - z1) * i) / n));
    };
    edge(-hw, -hd, hw, -hd);
    edge(-hw, -hd, -hw, hd);
    edge(hw, -hd, hw, hd);
    edge(-hw, hd, -2.5, hd);
    edge(2.5, hd, hw, hd);
    g.add(merged(posts, C.white));
  }

  const house = new THREE.Group();
  house.position.set(-1.5, 0, -1);
  g.add(house);

  if (phase === 'ground') {
    house.add(mesh(boxGeo(k.w + 1.5, 0.12, k.d + 1.5, 0, 0.02, 0), C.dirtDark, false));
    const pile = mesh(new THREE.ConeGeometry(3, 2.2, 7).translate(0, 1.1, 0), C.dirtDark);
    pile.position.set(k.w / 2 + 1.5, 0, k.d / 2 - 1);
    g.add(pile);
    const ex = new THREE.Group();
    ex.add(box(3.2, 0.7, 0.8, C.dark, 0, 0, 1.0), box(3.2, 0.7, 0.8, C.dark, 0, 0, -1.0));
    const body = new THREE.Group();
    body.position.y = 0.7;
    body.add(box(2.8, 1.1, 2.4, C.crane, -0.3, 0, 0), box(1.3, 1.3, 1.3, C.crane, 0.5, 1.1, -0.5));
    const arm = new THREE.Group();
    arm.position.set(0.9, 1.2, 0.5);
    arm.add(box(3.6, 0.4, 0.4, C.crane, 1.8, -0.2, 0));
    const stick = new THREE.Group();
    stick.position.set(3.5, 0, 0);
    stick.add(box(0.35, 2.4, 0.35, C.crane, 0, -2.3, 0), box(0.9, 0.6, 0.9, C.dark, 0.2, -2.6, 0));
    arm.add(stick);
    body.add(arm);
    ex.add(body);
    ex.position.set(-k.w / 2 + 1, 0, k.d / 2 + 2.2);
    ex.rotation.y = -0.5;
    g.add(ex);
    built.arms.push({ arm, phase: rand() * 6 });
    built.top = 5;
  } else {
    house.add(mesh(boxGeo(k.w + 0.4, 0.4, k.d + 0.4), C.concreteDark));
    const finished = phase === 'finish' || phase === 'done';
    const builtH = phase === 'shell' ? Math.max(k.floorH * 0.6, fullH * Math.min(1, (f - 0.2) / 0.3)) : fullH;
    house.add(mesh(boxGeo(k.w, builtH, k.d, 0, 0.4, 0), finished ? k.finish : C.concrete));
    const fullFloors = Math.floor(builtH / k.floorH + 0.01);
    if (fullFloors > 0) house.add(windows(k.w, k.d, fullFloors, k.floorH, 0.4, finished ? '#56697A' : C.glass));
    if (builtH >= fullH - 0.01) {
      if (k.roof === 'gable') {
        const roofH = item.style === 'halle' ? 1.6 : 3.2;
        const roof = mesh(gableGeo(k.w, k.d, roofH, item.style === 'chalet' ? 1.4 : 0.6), phase === 'inner' ? C.wood : k.roofColor);
        roof.position.y = 0.4 + fullH;
        house.add(roof);
        built.top = fullH + roofH + 1;
      } else {
        house.add(mesh(boxGeo(k.w + 0.6, 0.5, k.d + 0.6, 0, 0.4 + fullH, 0), k.roofColor));
        built.top = fullH + 1.5;
      }
    } else built.top = builtH + 1;

    if (phase === 'shell' || phase === 'inner') {
      const sc = scaffold(k.w, k.d, builtH, ['s', 'e', 'w', 'n']);
      sc.position.y = 0.4;
      house.add(sc);
    } else if (phase === 'finish') {
      const sc = scaffold(k.w, k.d, fullH, ['e']);
      sc.position.y = 0.4;
      house.add(sc);
    }

    if (phase === 'shell' || (phase === 'inner' && item.style === 'immeuble')) {
      const H = fullH + 9;
      const crane = new THREE.Group();
      crane.position.set(k.w / 2 + 2.6, 0, -k.d / 2 - 1.4);
      crane.add(box(2.2, 0.5, 2.2, C.concreteDark));
      const mast: THREE.BufferGeometry[] = [];
      for (const [x, z] of [
        [-0.4, -0.4],
        [0.4, -0.4],
        [-0.4, 0.4],
        [0.4, 0.4],
      ])
        mast.push(boxGeo(0.13, H, 0.13, x, 0.5, z));
      for (let y = 1.5; y < H; y += 1.5) mast.push(boxGeo(0.9, 0.09, 0.09, 0, 0.5 + y, 0.4), boxGeo(0.09, 0.09, 0.9, 0.4, 0.5 + y, 0));
      crane.add(merged(mast, C.crane));
      const jib = new THREE.Group();
      jib.position.y = 0.5 + H;
      jib.add(box(1.3, 0.7, 1.3, C.crane), box(0.9, 0.9, 0.9, accent, 0.8, -0.2, 0.8));
      jib.add(box(16, 0.45, 0.55, C.crane, 8, 0.7, 0), box(5, 0.45, 0.55, C.crane, -2.7, 0.7, 0), box(1.5, 1.2, 1.1, C.concreteDark, -4.6, 0, 0));
      const load = new THREE.Group();
      load.position.set(10, 0.5, 0);
      load.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 5.5, 4).translate(0, -2.75, 0), C.dark, false));
      load.add(box(1.4, 0.45, 1.1, C.plank, 0, -6, 0));
      jib.add(load);
      crane.add(jib);
      g.add(crane);
      built.cranes.push({ jib, phase: rand() * 6 });
      built.top = Math.max(built.top, H + 2);
    }

    if (phase === 'done') {
      const hedge: THREE.BufferGeometry[] = [
        boxGeo(plotW - 1, 0.9, 0.7, 0, 0, -plotD / 2 + 0.6),
        boxGeo(0.7, 0.9, plotD - 1, -plotW / 2 + 0.6, 0, 0),
        boxGeo(0.7, 0.9, plotD - 1, plotW / 2 - 0.6, 0, 0),
      ];
      g.add(merged(hedge, C.leaf1));
      const t = tree('leaf', 0.8, C.leaf2);
      t.position.set(plotW / 2 - 3, 0, plotD / 2 - 3);
      g.add(t);
    }
  }

  if (phase !== 'done') {
    const hut = new THREE.Group();
    hut.add(box(4.4, 2.4, 2.2, C.white), box(4.42, 0.32, 2.22, accent, 0, 1.9, 0), box(0.9, 1.6, 0.05, C.dark, 1.2, 0, 1.12));
    hut.position.set(-plotW / 2 + 3.1, 0, plotD / 2 - 2.1);
    g.add(hut);
  }

  const r = Math.max(k.w, k.d) / 2 + 2.2;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.4;
    built.spots.push(new THREE.Vector3(Math.cos(a) * r - 1.5, 0.08, Math.sin(a) * r * 0.8 - 1));
  }
  return built;
}

const STUDIO_KIND: Record<string, { w: number; d: number; floorH: number }> = {
  tour: { w: 9, d: 9, floorH: 4.2 },
  bloc: { w: 12, d: 9, floorH: 3.2 },
  pavillon: { w: 13, d: 8, floorH: 2.2 },
};

// studio: one building, one floor per step of the process.
function buildTower(item: ReliefItem, stages: number, accent: string): Built {
  const g = new THREE.Group();
  const k = STUDIO_KIND[item.style] ?? STUDIO_KIND.bloc;
  const plotW = k.w + 8;
  const plotD = k.d + 8;
  const done = item.status === 'done' || item.stage >= stages - 1;
  const finishedFloors = done ? stages : item.stage;
  const built: Built = { group: g, top: 0, radius: Math.max(plotW, plotD) / 2 + 1, cranes: [], arms: [], spots: [], gate: new THREE.Vector3(0, 0, plotD / 2) };

  g.add(mesh(boxGeo(plotW, 0.1, plotD), C.paving, false));
  g.add(mesh(boxGeo(k.w + 2, 0.14, k.d + 2, 0, 0.1, -0.5), C.pavingDark, false));
  const base = 0.24;
  for (let f = 0; f < stages; f++) {
    const y = base + f * k.floorH;
    if (f < finishedFloors) {
      g.add(mesh(boxGeo(k.w, k.floorH, k.d, 0, y, -0.5), f === 0 ? C.renderWarm : C.render));
      g.add(mesh(boxGeo(k.w + 0.06, k.floorH * 0.42, k.d + 0.06, 0, y + k.floorH * 0.3, -0.5), C.glass, false));
      g.add(mesh(boxGeo(k.w + 0.3, 0.18, k.d + 0.3, 0, y + k.floorH - 0.09, -0.5), C.concreteDark, false));
    } else if (f === finishedFloors && !done) {
      // The step in progress: open frame with tinted glass.
      const cols: THREE.BufferGeometry[] = [];
      for (const [x, z] of [
        [-k.w / 2 + 0.25, -k.d / 2 + 0.25],
        [k.w / 2 - 0.25, -k.d / 2 + 0.25],
        [-k.w / 2 + 0.25, k.d / 2 - 0.25],
        [k.w / 2 - 0.25, k.d / 2 - 0.25],
      ])
        cols.push(boxGeo(0.5, k.floorH, 0.5, x, y, z - 0.5));
      cols.push(boxGeo(k.w + 0.3, 0.2, k.d + 0.3, 0, y, -0.5));
      g.add(merged(cols, C.concrete));
      g.add(mesh(boxGeo(k.w - 0.6, k.floorH - 0.3, k.d - 0.6, 0, y + 0.2, -0.5), accent, false, { transparent: true, opacity: 0.45, flatShading: false }));
    } else {
      const o = outline(k.w, k.floorH, k.d, y, C.outline);
      o.position.z = -0.5;
      g.add(o);
    }
  }
  const height = base + stages * k.floorH;
  if (done) {
    g.add(mesh(boxGeo(k.w - 1, 0.3, k.d - 1, 0, height, -0.5), C.grassDark));
    const t = tree('leaf', 0.55, C.leaf2);
    t.position.set(k.w / 2 - 2, height + 0.3, -0.5);
    g.add(t);
  }
  // Entrance and two planters.
  g.add(box(2.4, 2.4, 0.2, C.glassLight, 0, base, k.d / 2 - 0.4));
  g.add(box(2.8, 0.2, 1.6, accent, 0, base + 2.4, k.d / 2 + 0.2));
  for (const x of [-plotW / 2 + 1.6, plotW / 2 - 1.6]) {
    g.add(box(1.4, 0.7, 1.4, C.pavingDark, x, 0.1, plotD / 2 - 1.6));
    const t = tree('leaf', 0.5, C.leaf1);
    t.position.set(x, 0.8, plotD / 2 - 1.6);
    g.add(t);
  }
  built.top = height + 2.5;
  for (let i = 0; i < 6; i++) built.spots.push(new THREE.Vector3(-3 + i * 1.3, 0.12, k.d / 2 + 1.8 + (i % 2) * 0.8));
  return built;
}

// atelier: a bay with the object being worked on and its step path.
function buildBay(item: ReliefItem, stages: number, accent: string): Built {
  const g = new THREE.Group();
  const W = 13;
  const D = 16;
  const done = item.status === 'done' || item.stage >= stages - 1;
  const built: Built = { group: g, top: 6, radius: 9.5, cranes: [], arms: [], spots: [], gate: new THREE.Vector3(0, 0, D / 2) };
  g.add(mesh(boxGeo(W, 0.06, D), '#E2DCD1', false));
  const lines: THREE.BufferGeometry[] = [boxGeo(W, 0.04, 0.25, 0, 0.06, -D / 2), boxGeo(0.25, 0.04, D, -W / 2, 0.06, 0), boxGeo(0.25, 0.04, D, W / 2, 0.06, 0)];
  g.add(merged(lines, C.lane, false));

  const obj = new THREE.Group();
  obj.position.set(0, 0, -1.5);
  if (item.style === 'vehicule') {
    const lift = item.stage > 0 && !done ? 1.6 : 0;
    if (lift) {
      obj.add(box(0.5, lift + 0.3, 0.5, accent, -2.4, 0, 0), box(0.5, lift + 0.3, 0.5, accent, 2.4, 0, 0));
      obj.add(box(5.6, 0.2, 3.0, C.dark, 0, lift, 0));
    }
    const car = new THREE.Group();
    car.add(box(5.4, 1.1, 2.4, done ? '#5B7C99' : '#8A9AA8', 0, 0.5, 0), box(3.0, 0.9, 2.2, done ? '#5B7C99' : '#8A9AA8', -0.3, 1.6, 0), box(3.05, 0.6, 2.25, C.glass, -0.3, 1.75, 0));
    const wheels: THREE.BufferGeometry[] = [];
    for (const [x, z] of [
      [-1.7, 1.15],
      [-1.7, -1.15],
      [1.7, 1.15],
      [1.7, -1.15],
    ])
      wheels.push(new THREE.CylinderGeometry(0.55, 0.55, 0.35, 10).rotateX(Math.PI / 2).translate(x, 0.55, z));
    car.add(merged(wheels, C.dark));
    car.position.y = lift ? lift + 0.2 : 0;
    obj.add(car);
    built.top = (lift ? lift : 0) + 5;
  } else if (item.style === 'meuble') {
    obj.add(box(4.5, 2.4, 1.6, C.wood, 0, 0, 0), box(4.3, 0.1, 0.05, C.woodDark, 0, 1.2, 0.81));
    obj.add(box(3.0, 0.15, 1.6, C.wood, 0, 0.9, 2.4), box(0.15, 0.9, 0.15, C.woodDark, -1.3, 0, 1.8), box(0.15, 0.9, 0.15, C.woodDark, 1.3, 0, 3.0));
    built.top = 5;
  } else if (item.style === 'machine') {
    obj.add(box(4, 2.6, 2.6, '#9AA6AE', 0, 0, 0), box(1.2, 1.0, 0.1, accent, -0.8, 1.4, 1.31), mesh(new THREE.CylinderGeometry(0.8, 0.8, 1.6, 12).translate(1.2, 3.4, 0), '#7E8A92'));
    built.top = 6;
  } else {
    const crates: THREE.BufferGeometry[] = [];
    const n = 2 + Math.min(4, item.stage + 1);
    for (let i = 0; i < n; i++) crates.push(boxGeo(1.6, 1.4, 1.6, -2 + (i % 3) * 2, Math.floor(i / 3) * 1.4, (i % 2) * 0.4));
    obj.add(merged(crates, C.wood));
    built.top = 5;
  }
  g.add(obj);
  // Workbench and tool cart.
  g.add(box(3.4, 1.0, 1.2, C.woodDark, -W / 2 + 2.4, 0, -D / 2 + 1.2), box(1.0, 1.1, 0.7, accent, W / 2 - 1.4, 0, -D / 2 + 1.2));

  // Step path: one tile per step, lit up to the current one.
  const tile = Math.min(2.2, (W - 2) / stages - 0.3);
  for (let s = 0; s < stages; s++) {
    const x = -((stages - 1) * (tile + 0.3)) / 2 + s * (tile + 0.3);
    const lit = done || s <= item.stage;
    const t = mesh(boxGeo(tile, 0.1, 1.4, x, 0.06, D / 2 - 1.6), lit ? accent : '#CFC7BA', false);
    g.add(t);
  }
  for (let i = 0; i < 6; i++) built.spots.push(new THREE.Vector3(-4 + i * 1.6, 0.08, 3 + (i % 2) * 1.2));
  return built;
}

// ------------------------------------------------------------------ engine

export function createRelief(host: HTMLElement, initialSpec: ReliefSpec, initial: ReliefData, opts: Options): ReliefHandle {
  let spec = initialSpec;
  let accent = ACCENT[spec.accent] ?? ACCENT.terracotta;
  const width = () => host.clientWidth || 800;
  const height = () => host.clientHeight || 600;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: !!opts.transparent, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(width(), height());
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.05;
  Object.assign(renderer.domElement.style, { display: 'block', width: '100%', height: '100%', outline: 'none' });
  host.appendChild(renderer.domElement);

  const labelLayer = document.createElement('div');
  labelLayer.className = 'rf-labels';
  host.appendChild(labelLayer);

  const scene = new THREE.Scene();
  let mood: 'day' | 'dusk' = opts.mood ?? 'day';

  const camera = new THREE.PerspectiveCamera(30, width() / height(), 1, 1600);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 30;
  controls.maxPolarAngle = 1.22;
  controls.minPolarAngle = 0.25;
  controls.screenSpacePanning = false;
  controls.autoRotateSpeed = 0.3;

  const hemi = new THREE.HemisphereLight('#FFF6E8', '#8C7B62', 1.4);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight('#FFE9CF', 2.2);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.bias = -0.0006;
  sun.shadow.normalBias = 0.04;
  scene.add(sun);
  scene.add(sun.target);

  const applyMood = () => {
    const dusk = mood === 'dusk';
    hemi.color.set(dusk ? '#8FA9D8' : '#FFF6E8');
    hemi.groundColor.set(dusk ? '#1E2530' : '#8C7B62');
    hemi.intensity = dusk ? 1.15 : 1.4;
    sun.color.set(dusk ? '#C9D6F0' : '#FFE9CF');
    sun.intensity = dusk ? 0.85 : 2.2;
    renderer.toneMappingExposure = dusk ? 1.05 : 1.05;
    if (!opts.transparent) {
      const bg = dusk ? '#18202A' : C.bg;
      scene.background = new THREE.Color(bg);
      scene.fog = new THREE.Fog(bg, 320, 700);
    }
  };
  applyMood();

  // Soft round glow, for lamps and data pulses at dusk.
  const glowTex = (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d')!;
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.35, 'rgba(255,255,255,0.45)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  })();
  const glow = (color: string, size: number, opacity = 0.9) => {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending }));
    sp.scale.setScalar(size);
    return sp;
  };

  // ---- per-build state
  let world = new THREE.Group();
  let data = initial;
  let size = { W: 76, D: 49 };
  let home = { target: new THREE.Vector3(), offset: new THREE.Vector3() };
  let homeRadius = 90;
  type ItemObj = { item: ReliefItem; built: Built; hit: THREE.Mesh; ring: THREE.Mesh; anchor: THREE.Vector3; road: THREE.CatmullRomCurve3 | null };
  let items = new Map<string, ItemObj>();
  let walkers: { obj: THREE.Object3D; a: THREE.Vector3; b: THREE.Vector3; speed: number; phase: number; walk: boolean }[] = [];
  let vans: { obj: THREE.Object3D; curve: THREE.CatmullRomCurve3; speed: number; phase: number }[] = [];
  type Dot = { parts: THREE.Object3D[]; u: number; dir: 1 | -1 };
  let flows: { curve: THREE.QuadraticBezierCurve3; len: number; dots: Dot[] }[] = [];
  let waves: { mesh: THREE.Mesh; period: number; phase: number; size: number; peak: number }[] = [];
  let beams: { mesh: THREE.Mesh; phase: number }[] = [];
  let blinkers: { obj: THREE.Object3D; phase: number }[] = [];
  let cars: { obj: THREE.Object3D; axis: 'x' | 'z'; fixed: number; from: number; to: number; speed: number; phase: number }[] = [];
  let labels: { el: HTMLElement; pos: THREE.Vector3; id: string | null }[] = [];
  let workerLabels: { el: HTMLElement; obj: THREE.Object3D; itemId: string }[] = [];
  let hits: THREE.Mesh[] = [];
  let selected: string | null = null;
  let rising: { obj: THREE.Object3D; t0: number }[] = [];
  let insets = { left: 0, right: 0, bottom: 0, top: 0 };

  const personOf = (id: string) => data.people.find((p) => p.id === id);

  function buildWorld() {
    const rand = rng(hash(spec.title + spec.template));
    world = new THREE.Group();
    scene.add(world);
    items = new Map();
    walkers = [];
    vans = [];
    flows = [];
    waves = [];
    beams = [];
    blinkers = [];
    cars = [];
    MOOD = mood;
    labels.forEach((l) => l.el.remove());
    workerLabels.forEach((l) => l.el.remove());
    labels = [];
    workerLabels = [];
    rising = [];

    const n = Math.max(1, data.items.length);
    const stages = Math.max(2, spec.stages.length);

    // Size of the miniature from the number of items.
    if (spec.template === 'studio') {
      const cols = Math.max(2, Math.ceil(Math.sqrt(n * 1.5)));
      const rows = Math.ceil(n / cols);
      size = { W: Math.max(48, cols * 13 + 14), D: Math.max(38, rows * 13 + 26) };
    } else if (spec.template === 'atelier') {
      const cols = Math.min(5, Math.max(2, Math.ceil(Math.sqrt(n * 1.6))));
      const rows = Math.ceil(n / cols);
      size = { W: Math.max(48, cols * 8 + 16), D: Math.max(38, rows * 10.5 + 24) };
    } else {
      const s = Math.min(2.4, Math.max(1, Math.sqrt(n / 6)));
      size = { W: 76 * s, D: 49 * s };
    }
    const { W, D } = size;
    const occ = new Occupancy(W, D);

    // Island: grass (or paving) on top, soil layers below.
    const shape = new THREE.Shape();
    const r = 10;
    shape.moveTo(-W + r, -D);
    shape.lineTo(W - r, -D);
    shape.quadraticCurveTo(W, -D, W, -D + r);
    shape.lineTo(W, D - r);
    shape.quadraticCurveTo(W, D, W - r, D);
    shape.lineTo(-W + r, D);
    shape.quadraticCurveTo(-W, D, -W, D - r);
    shape.lineTo(-W, -D + r);
    shape.quadraticCurveTo(-W, -D, -W + r, -D);
    const topColor = spec.template === 'territoire' ? C.grass : spec.template === 'studio' ? C.grassLight : C.paving;
    const layer = (depth: number, top: string, side: string, y: number) => {
      const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 10 });
      geo.rotateX(-Math.PI / 2);
      const m = new THREE.Mesh(geo, [mat(top), mat(side)]);
      m.position.y = y;
      m.receiveShadow = true;
      world.add(m);
    };
    layer(1.2, topColor, spec.template === 'atelier' ? C.pavingDark : C.grassDark, -1.2);
    layer(3.0, C.soil, C.soil, -4.2);
    layer(3.4, C.soilDark, C.soilDark, -7.6);

    // Sun and shadow camera follow the size.
    const ext = Math.max(W, D) + 20;
    sun.position.set(-W * 0.8, mood === 'dusk' ? 55 : 120, D * 1.1);
    sun.target.position.set(0, 0, 0);
    Object.assign(sun.shadow.camera, { left: -ext, right: ext, top: ext, bottom: -ext, near: 10, far: 420 });
    sun.shadow.camera.updateProjectionMatrix();

    const base = new THREE.Vector3(0, 0, spec.template === 'territoire' ? D * 0.12 : D - 12);

    if (spec.template === 'territoire') buildTerritoire(rand, occ, base, stages);
    else if (spec.template === 'studio') buildStudio(occ, base, stages);
    else buildAtelier(base, stages);

    // Labels over items and over the base.
    const stageLabel = (it: ReliefItem) => spec.stages[Math.min(spec.stages.length - 1, it.stage)]?.label ?? '';
    for (const so of items.values()) {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = `rf-label rf-st-${so.item.status}${so.item.example ? ' rf-example' : ''}`;
      el.innerHTML = '<span class="rf-dot"></span><span class="rf-name"></span><span class="rf-step-name"></span><span class="rf-pct"></span>';
      (el.querySelector('.rf-pct') as HTMLElement).textContent = so.item.example ? '' : `${Math.round(so.item.progress * 100)}%`;
      (el.querySelector('.rf-name') as HTMLElement).textContent = so.item.name;
      (el.querySelector('.rf-step-name') as HTMLElement).textContent = so.item.example ? `${opts.exampleLabel} · ${stageLabel(so.item)}` : stageLabel(so.item);
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        handle.select(so.item.id);
        handle.focus(so.item.id);
      });
      labelLayer.appendChild(el);
      labels.push({ el, pos: so.anchor, id: so.item.id });
    }
    const baseEl = document.createElement('div');
    baseEl.className = 'rf-label rf-base';
    baseEl.textContent = opts.baseLabel;
    labelLayer.appendChild(baseEl);
    labels.push({ el: baseEl, pos: new THREE.Vector3(base.x, 10, base.z - 2), id: null });

    // The data network: a cable from the base to every item, with pulses.
    const hub = spec.template === 'territoire' ? base.clone().add(new THREE.Vector3(-3, 7.6, -3)) : spec.template === 'studio' ? base.clone().add(new THREE.Vector3(0, 5.7, -1)) : base.clone().add(new THREE.Vector3(0, 4.1, 0));
    buildNetwork(hub, base);

    // People planned today: on their item, or at the base.
    for (const so of items.values()) {
      so.item.crew.forEach((pid, i) => {
        const p = personOf(pid);
        if (!p) return;
        const fig = person(p.color, spec.template === 'territoire' ? C.helmet : null);
        const spot = so.built.spots[i % so.built.spots.length].clone();
        const a = spot.clone().add(so.built.group.position);
        const b = a.clone().add(new THREE.Vector3((rand() - 0.5) * 4, 0, (rand() - 0.5) * 2));
        fig.position.copy(a);
        world.add(fig);
        walkers.push({ obj: fig, a, b, speed: 0.25 + rand() * 0.2, phase: rand() * 6, walk: i % 2 === 0 });
        const el = document.createElement('div');
        el.className = 'rf-worker';
        el.textContent = p.initials;
        el.title = p.name;
        el.style.background = p.color;
        labelLayer.appendChild(el);
        workerLabels.push({ el, obj: fig, itemId: so.item.id });
      });
    }
    data.atBase.forEach((pid, i) => {
      const p = personOf(pid);
      if (!p) return;
      const fig = person(p.color, null);
      const a = base.clone().add(new THREE.Vector3(-4 + i * 1.6, 0.1, 6));
      fig.position.copy(a);
      world.add(fig);
      walkers.push({ obj: fig, a, b: a.clone().add(new THREE.Vector3(2, 0, 0)), speed: 0.2, phase: i, walk: false });
    });

    hits = [...items.values()].map((s) => s.hit);

    // Home view frames the whole miniature.
    const span = Math.max(W * 1.25, D * 1.9);
    home = { target: new THREE.Vector3(0, 0, spec.template === 'territoire' ? 4 : 2), offset: new THREE.Vector3(-0.28, 0.62, 0.83).normalize().multiplyScalar(span * 1.45) };
    homeRadius = Math.hypot(W, D) * 0.98;
    controls.maxDistance = span * 4;
  }

  function addWave(x: number, z: number, color: string, size: number, period: number, phase: number, peak = 0.55) {
    const m = new THREE.Mesh(new THREE.RingGeometry(0.82, 1, 56), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }));
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, 0.2, z);
    world.add(m);
    waves.push({ mesh: m, period, phase, size, peak });
  }

  function gaugeSprite(progress: number, color: string) {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d')!;
    const dusk = mood === 'dusk';
    g.beginPath();
    g.arc(64, 64, 52, 0, Math.PI * 2);
    g.fillStyle = dusk ? 'rgba(16,21,28,0.82)' : 'rgba(255,253,249,0.94)';
    g.fill();
    g.lineWidth = 10;
    g.strokeStyle = dusk ? 'rgba(255,255,255,0.14)' : 'rgba(35,26,18,0.1)';
    g.beginPath();
    g.arc(64, 64, 42, 0, Math.PI * 2);
    g.stroke();
    g.strokeStyle = color;
    g.lineCap = 'round';
    g.beginPath();
    g.arc(64, 64, 42, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.max(0.02, Math.min(1, progress)));
    g.stroke();
    g.fillStyle = dusk ? '#FFFFFF' : '#231A12';
    g.font = '700 30px ui-monospace, Menlo, monospace';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(`${Math.round(progress * 100)}`, 64, 66);
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }));
    sp.scale.setScalar(8.5);
    sp.renderOrder = 5;
    return sp;
  }

  function buildNetwork(hub: THREE.Vector3, base: THREE.Vector3) {
    const dusk = mood === 'dusk';
    // Antenna on the base, with a blinking tip and waves on the ground.
    world.add(mesh(new THREE.CylinderGeometry(0.16, 0.26, 5, 8).translate(hub.x, hub.y + 2.5, hub.z), '#3B3A38'));
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.55, 14, 10), new THREE.MeshBasicMaterial({ color: accent }));
    tip.position.set(hub.x, hub.y + 5.2, hub.z);
    world.add(tip);
    blinkers.push({ obj: tip, phase: 0 });
    if (dusk) {
      const g = glow(accent, 7, 0.8);
      g.position.copy(tip.position);
      world.add(g);
      blinkers.push({ obj: g, phase: 0 });
    }
    addWave(base.x, base.z, accent, 16, 3.6, 0, 0.45);
    addWave(base.x, base.z, accent, 16, 3.6, 1.8, 0.45);
    const top = tip.position.clone();
    const dotGeo = new THREE.SphereGeometry(0.42, 10, 8);

    for (const so of items.values()) {
      const it = so.item;
      const pos = so.built.group.position;
      const end = so.anchor.clone();
      end.y -= 0.8;
      const d = Math.hypot(end.x - top.x, end.z - top.z);
      const mid = top.clone().lerp(end, 0.5);
      mid.y = Math.max(top.y, end.y) + 5 + d * 0.22;
      const curve = new THREE.QuadraticBezierCurve3(top.clone(), mid, end);
      const color = it.status === 'late' ? '#E0483C' : it.status === 'risk' ? '#E7A52A' : it.status === 'done' ? '#9C9388' : accent;
      const opacity = it.example ? 0.22 : it.status === 'done' ? 0.22 : dusk ? 0.6 : 0.42;
      world.add(
        new THREE.Mesh(
          new THREE.TubeGeometry(curve, 56, it.status === 'done' ? 0.06 : 0.11, 6, false),
          new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false, blending: dusk ? THREE.AdditiveBlending : THREE.NormalBlending }),
        ),
      );
      // Where the cable lands: a small glowing socket.
      const socket = new THREE.Mesh(new THREE.SphereGeometry(0.4, 10, 8), new THREE.MeshBasicMaterial({ color }));
      socket.position.copy(end);
      world.add(socket);

      if (opts.hud) {
        const gs = gaugeSprite(it.status === 'done' ? 1 : it.progress, it.status === 'done' ? '#8C8073' : color);
        gs.position.set(pos.x, so.anchor.y + 4.2, pos.z);
        world.add(gs);
      }

      if (it.status !== 'done') {
        const flow = { curve, len: curve.getLength(), dots: [] as Dot[] };
        const makeDot = (core: string, halo: string, u: number, dir: 1 | -1): Dot => {
          const parts: THREE.Object3D[] = [0, 1, 2].map((i) => {
            const m = new THREE.Mesh(dotGeo, new THREE.MeshBasicMaterial({ color: i === 0 ? core : halo, transparent: true, opacity: 1 - i * 0.3, depthWrite: false }));
            m.scale.setScalar(1 - i * 0.25);
            world.add(m);
            return m;
          });
          if (dusk) {
            const g = glow(halo, 3.2, 0.85);
            world.add(g);
            parts.push(g);
          }
          return { parts, u, dir };
        };
        // Outgoing work: more pulses where there are open tasks and people.
        const n = it.example ? 1 : Math.min(5, 1 + Math.ceil(it.tasks.length / 2) + Math.min(2, it.crew.length));
        for (let k = 0; k < n; k++) flow.dots.push(makeDot(dusk ? '#FFFFFF' : color, color, k / n, 1));
        // Progress coming back to the base.
        if (!it.example && it.progress > 0.05) flow.dots.push(makeDot('#B9F5D2', '#3FBF7F', 0.5, -1));
        flows.push(flow);
      }

      // Beacons on what needs attention.
      if (it.status === 'late' || it.status === 'risk') {
        const c = it.status === 'late' ? '#E0483C' : '#E7A52A';
        addWave(pos.x, pos.z, c, so.built.radius + 5, 2.2, 0, 0.7);
        addWave(pos.x, pos.z, c, so.built.radius + 5, 2.2, 1.1, 0.7);
        if (it.status === 'late') {
          const beam = new THREE.Mesh(
            new THREE.CylinderGeometry(1.0, 2.6, 38, 18, 1, true).translate(0, 19, 0),
            new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.16, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }),
          );
          beam.position.set(pos.x, 0, pos.z);
          world.add(beam);
          beams.push({ mesh: beam, phase: pos.x * 0.1 });
        }
      }
    }
  }

  function addCar(axis: 'x' | 'z', fixed: number, from: number, to: number, i: number) {
    const c = car(CAR_COLORS[i % CAR_COLORS.length]);
    world.add(c);
    cars.push({ obj: c, axis, fixed, from, to, speed: 0.035 + (i % 4) * 0.008, phase: i * 0.37 });
  }

  function addLamp(x: number, z: number, rotY: number) {
    const l = lamp();
    l.position.set(x, 0, z);
    l.rotation.y = rotY;
    world.add(l);
    if (mood === 'dusk') {
      const g = glow('#FFD58A', 5.5, 0.75);
      const p = new THREE.Vector3(0.72, 3.9, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY);
      g.position.set(x + p.x, p.y, z + p.z);
      world.add(g);
      const pool = new THREE.Mesh(new THREE.CircleGeometry(2.6, 24), new THREE.MeshBasicMaterial({ color: '#FFCF7A', transparent: true, opacity: 0.14, depthWrite: false, blending: THREE.AdditiveBlending }));
      pool.rotation.x = -Math.PI / 2;
      pool.position.set(x + p.x, 0.16, z + p.z);
      world.add(pool);
    }
  }

  function addItemObj(it: ReliefItem, built: Built, x: number, z: number, road: THREE.CatmullRomCurve3 | null) {
    built.group.position.set(x, 0, z);
    world.add(built.group);
    if (opts.intro) {
      built.group.scale.y = 0.001;
      rising.push({ obj: built.group, t0: performance.now() + 250 + items.size * 140 });
    }
    const hit = new THREE.Mesh(new THREE.BoxGeometry(built.radius * 2, built.top, built.radius * 2), new THREE.MeshBasicMaterial({ visible: false }));
    hit.position.set(x, built.top / 2, z);
    hit.userData.id = it.id;
    world.add(hit);
    const ring = new THREE.Mesh(new THREE.RingGeometry(built.radius + 0.4, built.radius + 1.3, 48), new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0, depthWrite: false }));
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(x, 0.14, z);
    world.add(ring);
    items.set(it.id, { item: it, built, hit, ring, anchor: new THREE.Vector3(x, built.top + 1, z), road });
  }

  function addRoad(curve: THREE.Curve<THREE.Vector3>, w: number, y: number, occ: Occupancy | null) {
    const m = new THREE.Mesh(ribbonGeo(curve, w, y), mat(C.road, { polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }));
    m.receiveShadow = true;
    world.add(m);
    const len = curve.getLength();
    const dashes: THREE.BufferGeometry[] = [];
    for (let s = 2; s < len - 2; s += 3.4) {
      const t = s / len;
      const p = curve.getPointAt(t);
      const tan = curve.getTangentAt(t);
      const d = new THREE.BoxGeometry(1.3, 0.02, 0.16);
      d.rotateY(-Math.atan2(tan.z, tan.x));
      d.translate(p.x, y + 0.02, p.z);
      dashes.push(d);
    }
    if (dashes.length) world.add(merged(dashes, C.roadLine, false));
    occ?.addCurve(curve, w / 2 + 1.2);
  }

  function scatterTrees(occ: Occupancy, rand: () => number, count: number, pinesNorth: boolean) {
    const { W, D } = size;
    for (let i = 0, placed = 0; i < count * 8 && placed < count; i++) {
      const x = (rand() - 0.5) * 2 * (W - 4);
      const z = (rand() - 0.5) * 2 * (D - 4);
      const s = 0.7 + rand() * 0.6;
      if (!occ.free(x, z, 1.8 * s)) continue;
      const pine = (pinesNorth && z < -D * 0.4) || rand() > 0.75;
      const t = tree(pine ? 'pine' : 'leaf', s, pine ? C.pine : rand() > 0.5 ? C.leaf1 : C.leaf2);
      t.position.set(x, 0, z);
      t.rotation.y = rand() * Math.PI;
      world.add(t);
      occ.add(x, z, 1.4 * s);
      placed++;
    }
  }

  // ---- territoire
  function buildTerritoire(rand: () => number, occ: Occupancy, base: THREE.Vector3, stages: number) {
    const { W, D } = size;
    if (spec.decor.mountains) {
      const peaks = Math.max(3, Math.round(W / 22));
      for (let i = 0; i < peaks; i++) {
        const x = -W + 14 + (i * (2 * W - 28)) / Math.max(1, peaks - 1) + (rand() - 0.5) * 6;
        const z = -D + 9 + rand() * 3;
        const rr = 9 + rand() * 4;
        const h = 15 + rand() * 9;
        const geo = new THREE.ConeGeometry(rr, h, 7, 3);
        const pa = geo.attributes.position;
        for (let j = 0; j < pa.count; j++) {
          const y = pa.getY(j);
          if (y > -h / 2 + 0.01 && y < h / 2 - 0.01) {
            pa.setX(j, pa.getX(j) + (rand() - 0.5) * rr * 0.22);
            pa.setZ(j, pa.getZ(j) + (rand() - 0.5) * rr * 0.22);
          }
        }
        geo.computeVertexNormals();
        const m = mesh(geo, rand() > 0.5 ? C.rock : C.rockDark);
        m.position.set(x, h / 2 - 0.5, z);
        world.add(m);
        const capH = h * 0.3;
        const cap = mesh(new THREE.ConeGeometry(rr * 0.32, capH, 7), C.snow);
        cap.position.set(x, h - capH / 2 - 0.4, z);
        world.add(cap);
        occ.add(x, z, rr + 2);
      }
    }
    if (spec.decor.water === 'lac') {
      const lx = -W * 0.68;
      const lz = D * 0.58;
      const s1 = new THREE.Shape();
      s1.absellipse(0, 0, W * 0.2 + 2, D * 0.24 + 2, 0, Math.PI * 2, false, 0);
      const s2 = new THREE.Shape();
      s2.absellipse(0, 0, W * 0.2, D * 0.24, 0, Math.PI * 2, false, 0);
      const shore = new THREE.Mesh(new THREE.ShapeGeometry(s1, 24).rotateX(-Math.PI / 2).translate(lx, 0.02, lz), mat(C.sand));
      const water = new THREE.Mesh(new THREE.ShapeGeometry(s2, 24).rotateX(-Math.PI / 2).translate(lx, 0.06, lz), mat(C.water, { roughness: 0.3, flatShading: false }));
      shore.receiveShadow = water.receiveShadow = true;
      world.add(shore, water);
      occ.add(lx, lz, W * 0.2 + 4);
    } else if (spec.decor.water === 'riviere') {
      const river = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-W * 0.55, 0, -D + 6),
        new THREE.Vector3(-W * 0.6, 0, -D * 0.2),
        new THREE.Vector3(-W * 0.7, 0, D * 0.4),
        new THREE.Vector3(-W * 0.78, 0, D - 2),
      ]);
      world.add(new THREE.Mesh(ribbonGeo(river, 5, 0.025), mat(C.sand)), new THREE.Mesh(ribbonGeo(river, 3, 0.055), mat(C.water, { roughness: 0.3, flatShading: false })));
      occ.addCurve(river, 4);
    }

    // Depot.
    const depot = new THREE.Group();
    depot.position.copy(base);
    depot.add(mesh(boxGeo(22, 0.1, 15), C.paving, false));
    depot.add(box(12, 5.2, 7.5, C.white, -3, 0, -3));
    const roof = mesh(gableGeo(12, 7.5, 2.2, 0.6), accent);
    roof.position.set(-3, 5.2, -3);
    depot.add(roof, box(4, 3.6, 0.1, C.dark, -5, 0, 0.8), box(12.02, 0.45, 7.52, accent, -3, 4.0, -3));
    world.add(depot);
    occ.add(base.x, base.z, 13);

    const main = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-W, 0, base.z + 11),
      new THREE.Vector3(-W * 0.4, 0, base.z + 13),
      new THREE.Vector3(base.x, 0, base.z + 10),
      new THREE.Vector3(W * 0.4, 0, base.z + 6),
      new THREE.Vector3(W, 0, base.z + 3),
    ]);
    addRoad(main, 3.2, 0.07, occ);
    for (let i = 0; i < 3; i++) {
      const c = car(CAR_COLORS[(i * 2) % CAR_COLORS.length]);
      world.add(c);
      vans.push({ obj: c, curve: main, speed: 0.018 + i * 0.006, phase: i * 2.1 });
    }
    for (let k = 1; k < 8; k++) {
      const p = main.getPointAt(k / 8);
      const tan = main.getTangentAt(k / 8);
      addLamp(p.x - tan.z * 2.6, p.z + tan.x * 2.6, -Math.atan2(tan.z, tan.x) + Math.PI / 2);
    }

    // Items around the depot on a widening spiral.
    const roadStart = base.clone().add(new THREE.Vector3(0, 0, 9));
    let angle = 0.9;
    data.items.forEach((it, i) => {
      const built = buildSite(it, stages, accent, rand);
      let x = 0;
      let z = 0;
      for (let tries = 0; tries < 400; tries++) {
        const rad = 28 + 7 * Math.sqrt(i + tries * 0.15);
        x = base.x + Math.cos(angle) * rad * (W / 49);
        z = base.z * 0.4 + Math.sin(angle) * rad * (D / 49) * 0.85;
        angle += 0.37;
        const inside = Math.abs(x) < W - built.radius - 4 && Math.abs(z) < D - built.radius - 4;
        if (inside && occ.free(x, z, built.radius + 1)) break;
      }
      // Never off the island, even when it is crowded.
      x = THREE.MathUtils.clamp(x, -W + built.radius + 4, W - built.radius - 4);
      z = THREE.MathUtils.clamp(z, -D + built.radius + 4, D - built.radius - 4);
      angle += 2.4;
      const gate = built.gate.clone().add(new THREE.Vector3(x, 0, z));
      const mid = roadStart.clone().lerp(gate, 0.5);
      const dir = gate.clone().sub(roadStart).normalize();
      const bend = (i % 2 ? 1 : -1) * (5 + rand() * 5);
      mid.add(new THREE.Vector3(-dir.z * bend, 0, dir.x * bend));
      const road = new THREE.CatmullRomCurve3([roadStart.clone(), mid, gate.clone().add(new THREE.Vector3(0, 0, 5)), gate]);
      addRoad(road, 2.4, 0.075 + i * 0.002, null);
      occ.add(x, z, built.radius + 1);
      addItemObj(it, built, x, z, road);
      for (const pt of [0.15, 0.5, 0.85]) {
        const p = road.getPointAt(pt);
        occ.add(p.x, p.z, 2.5);
      }
    });

    // A van out for each crew of the day (up to five).
    [...items.values()]
      .filter((o) => o.item.crew.length && o.road)
      .slice(0, 5)
      .forEach((o, i) => {
        const v = van(accent);
        world.add(v);
        vans.push({ obj: v, curve: o.road as THREE.CatmullRomCurve3, speed: 0.03 + (i % 3) * 0.01, phase: i * 1.7 });
      });

    scatterTrees(occ, rand, spec.decor.greenery === 'verdoyant' ? 140 : 70, true);
  }

  // ---- studio
  function buildStudio(occ: Occupancy, base: THREE.Vector3, stages: number) {
    const { W, D } = size;
    const n = data.items.length;
    const cols = Math.max(2, Math.ceil(Math.sqrt(Math.max(1, n) * 1.5)));
    const cell = 26;
    const rows = Math.ceil(Math.max(1, n) / cols);
    const x0 = -((cols - 1) * cell) / 2;
    const z0 = -D + 16;
    // Streets between the lots.
    const streets: THREE.BufferGeometry[] = [];
    for (let c = 0; c <= cols; c++) streets.push(boxGeo(3.4, 0.05, 2 * D - 8, x0 - cell / 2 + c * cell, 0.02, 0));
    for (let rI = 0; rI <= rows; rI++) streets.push(boxGeo(2 * W - 8, 0.05, 3.4, 0, 0.02, z0 - cell / 2 + rI * cell));
    world.add(merged(streets, C.road, false, { polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }));
    // Traffic on the streets, lamps at the crossings.
    let ci = 0;
    for (let c = 0; c <= cols && ci < 5; c += 1) {
      const x = x0 - cell / 2 + c * cell;
      if (c % 2 === 0) addCar('z', x, -D + 6, D - 6, ci++);
    }
    for (let rI = 0; rI <= rows && ci < 8; rI++) addCar('x', z0 - cell / 2 + rI * cell, -W + 6, W - 6, ci++);
    for (let c = 0; c <= cols; c++)
      for (let rI = 0; rI <= rows; rI++) if ((c + rI) % 2 === 0) addLamp(x0 - cell / 2 + c * cell + 2.4, z0 - cell / 2 + rI * cell + 2.4, Math.PI * 0.75);
    data.items.forEach((it, i) => {
      const x = x0 + (i % cols) * cell;
      const z = z0 + Math.floor(i / cols) * cell;
      const built = buildTower(it, stages, accent);
      addItemObj(it, built, x, z, null);
      occ.add(x, z, built.radius);
    });
    // Office of the company, at the front.
    const hq = new THREE.Group();
    hq.position.copy(base);
    hq.add(mesh(boxGeo(26, 0.12, 14), C.paving, false));
    hq.add(box(16, 5, 8, C.white, 0, 0.12, -1), box(16.05, 1.6, 8.05, C.glass, 0, 1.8, -1), box(16.3, 0.5, 8.3, accent, 0, 5.12, -1));
    world.add(hq);
    occ.add(base.x, base.z, 14);
    scatterTrees(occ, rng(7), spec.decor.greenery === 'verdoyant' ? 60 : 30, false);
  }

  // ---- atelier
  function buildAtelier(base: THREE.Vector3, stages: number) {
    const { W, D } = size;
    const n = data.items.length;
    const cols = Math.min(5, Math.max(2, Math.ceil(Math.sqrt(Math.max(1, n) * 1.6))));
    const cellX = 16;
    const cellZ = 21;
    const x0 = -((cols - 1) * cellX) / 2;
    const z0 = -D + 18;
    // Hall: floor, low walls cut away, columns.
    world.add(mesh(boxGeo(2 * W - 10, 0.08, 2 * D - 10, 0, 0, -2), C.floor, false));
    const walls: THREE.BufferGeometry[] = [boxGeo(2 * W - 10, 3.5, 0.6, 0, 0, -D + 3), boxGeo(0.6, 3.5, 2 * D - 10, -W + 5, 0, -2), boxGeo(0.6, 3.5, 2 * D - 10, W - 5, 0, -2)];
    for (let x = -W + 5; x <= W - 5; x += 16) walls.push(boxGeo(0.8, 9, 0.8, x, 0, -D + 3));
    world.add(merged(walls, C.concrete));
    data.items.forEach((it, i) => {
      const x = x0 + (i % cols) * cellX;
      const z = z0 + Math.floor(i / cols) * cellZ;
      addItemObj(it, buildBay(it, stages, accent), x, z, null);
    });
    // Office corner at the front.
    const office = new THREE.Group();
    office.position.copy(base);
    office.add(box(14, 3.6, 7, C.white, 0, 0, 0), box(14.05, 1.3, 7.05, C.glass, 0, 1.4, 0), box(14.3, 0.4, 7.3, accent, 0, 3.6, 0));
    world.add(office);
  }

  // ---- interaction
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let down: { x: number; y: number } | null = null;
  let lastInteraction = performance.now();
  let tween: { fromPos: THREE.Vector3; fromTarget: THREE.Vector3; toPos: THREE.Vector3; toTarget: THREE.Vector3; t0: number; dur: number } | null = null;

  const pick = (ev: PointerEvent) => {
    const r = renderer.domElement.getBoundingClientRect();
    ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    const hit = raycaster.intersectObjects(hits, false)[0];
    return hit ? (hit.object.userData.id as string) : null;
  };
  const stopAuto = () => {
    lastInteraction = performance.now();
    controls.autoRotate = false;
    tween = null;
  };
  const onDown = (ev: PointerEvent) => {
    down = { x: ev.clientX, y: ev.clientY };
    stopAuto();
  };
  const onUp = (ev: PointerEvent) => {
    if (down && Math.hypot(ev.clientX - down.x, ev.clientY - down.y) < 5) {
      const id = pick(ev);
      handle.select(id);
      if (id) handle.focus(id);
    }
    down = null;
  };
  const onMove = (ev: PointerEvent) => {
    if (!down) renderer.domElement.style.cursor = pick(ev) ? 'pointer' : 'grab';
  };
  const interactive = opts.interactive !== false;
  controls.enabled = interactive;
  if (interactive) {
    renderer.domElement.addEventListener('pointerdown', onDown);
    renderer.domElement.addEventListener('pointerup', onUp);
    renderer.domElement.addEventListener('pointermove', onMove);
    renderer.domElement.addEventListener('wheel', stopAuto, { passive: true });
  } else {
    renderer.domElement.style.pointerEvents = 'none';
    labelLayer.style.display = 'none';
  }

  const flyTo = (toPos: THREE.Vector3, toTarget: THREE.Vector3) => {
    tween = { fromPos: camera.position.clone(), fromTarget: controls.target.clone(), toPos, toTarget, t0: performance.now(), dur: 1100 };
    controls.autoRotate = false;
  };
  // Distance at which a sphere of radius r fills the free part of the view.
  const fitDistance = (r: number) => {
    const w = Math.max(1, width() - insets.right - insets.left);
    const h = Math.max(1, height() - insets.bottom - insets.top);
    const vf = THREE.MathUtils.degToRad(camera.fov) / 2;
    // Half-angle under which the free area is seen, on its shorter side.
    const a = Math.atan((Math.tan(vf) * Math.min(w, h)) / height());
    return r / Math.sin(a);
  };
  const homePos = () => home.target.clone().add(home.offset.clone().normalize().multiplyScalar((fitDistance(homeRadius) * 0.86) / (opts.zoom ?? 1)));
  const applyInsets = () => {
    const w = width();
    const h = height();
    // Shift the projection so the centre of the scene sits in the middle of
    // the area left free by the panels.
    camera.setViewOffset(w, h, (insets.right - insets.left) / 2, (insets.bottom - insets.top) / 2, w, h);
    camera.updateProjectionMatrix();
  };

  const resize = () => {
    renderer.setSize(width(), height());
    camera.aspect = width() / height();
    applyInsets();
  };
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
  ro?.observe(host);

  buildWorld();
  applyInsets();
  camera.position.copy(homePos());
  controls.target.copy(home.target);
  controls.update();
  if (opts.preview) {
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.9;
  }

  // ---- loop
  let animated = true;
  let simTime = 0;
  let last = performance.now();
  let raf = 0;
  const tmp = new THREE.Vector3();

  const frame = () => {
    raf = requestAnimationFrame(frame);
    const now = performance.now();
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (animated) simTime += dt;
    const t = simTime;

    if (tween) {
      const k = Math.min(1, (now - tween.t0) / tween.dur);
      const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      camera.position.lerpVectors(tween.fromPos, tween.toPos, e);
      controls.target.lerpVectors(tween.fromTarget, tween.toTarget, e);
      if (k >= 1) tween = null;
    } else if (!selected && animated && now - lastInteraction > (opts.preview ? 4000 : 25000)) controls.autoRotate = true;
    controls.update();

    if (rising.length) {
      rising = rising.filter((r) => {
        const k = Math.min(1, Math.max(0, (now - r.t0) / 900));
        const c = 1.55;
        const e = k <= 0 ? 0 : 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2);
        r.obj.scale.y = Math.max(0.001, e);
        return k < 1;
      });
    }

    for (const so of items.values()) {
      for (const c of so.built.cranes) c.jib.rotation.y = Math.sin(t * 0.16 + c.phase) * 1.3 + c.phase;
      for (const a of so.built.arms) a.arm.rotation.z = 0.25 + Math.sin(t * 0.8 + a.phase) * 0.3;
      const ringMat = so.ring.material as THREE.MeshBasicMaterial;
      const target = selected === so.item.id ? 0.5 + Math.sin(now / 320) * 0.18 : 0;
      ringMat.opacity += (target - ringMat.opacity) * 0.15;
    }
    for (const w of walkers) {
      if (w.walk) {
        const u = (1 - Math.cos(t * w.speed + w.phase)) / 2;
        w.obj.position.lerpVectors(w.a, w.b, u);
        const dir = Math.sin(t * w.speed + w.phase) >= 0 ? 1 : -1;
        tmp.subVectors(w.b, w.a).multiplyScalar(dir);
        w.obj.rotation.y = Math.atan2(tmp.x, tmp.z);
        w.obj.position.y = w.a.y + Math.abs(Math.sin(t * 6 + w.phase)) * 0.07;
      } else {
        w.obj.rotation.y = w.phase + Math.sin(t * 0.6 + w.phase) * 0.5;
      }
    }
    for (const f of flows) {
      for (const d of f.dots) {
        if (animated) d.u = (((d.u + dt * (12 / f.len) * d.dir) % 1) + 1) % 1;
        d.parts.forEach((m, i) => {
          const uu = (((d.u - d.dir * Math.min(i, 2) * (1.1 / f.len)) % 1) + 1) % 1;
          f.curve.getPoint(uu, m.position);
        });
      }
    }
    for (const w of waves) {
      const k = ((t + w.phase) % w.period) / w.period;
      w.mesh.scale.setScalar(Math.max(0.05, k * w.size));
      (w.mesh.material as THREE.MeshBasicMaterial).opacity = (1 - k) * w.peak;
    }
    for (const b of beams) (b.mesh.material as THREE.MeshBasicMaterial).opacity = 0.11 + 0.08 * Math.sin(t * 2.4 + b.phase);
    for (const b of blinkers) b.obj.scale.setScalar((b.obj instanceof THREE.Sprite ? 7 : 1) * (0.85 + 0.25 * Math.max(0, Math.sin(t * 3 + b.phase))));
    for (const c of cars) {
      const u = (t * c.speed + c.phase) % 1;
      const tri = u < 0.5 ? u * 2 : 2 - u * 2;
      const v = c.from + (c.to - c.from) * tri;
      const back = u >= 0.5;
      const lane = back ? -0.9 : 0.9;
      if (c.axis === 'z') {
        c.obj.position.set(c.fixed + lane, 0.08, v);
        c.obj.rotation.y = back ? Math.PI / 2 : -Math.PI / 2;
      } else {
        c.obj.position.set(v, 0.08, c.fixed - lane);
        c.obj.rotation.y = back ? Math.PI : 0;
      }
    }
    for (const v of vans) {
      const ph = t * v.speed * Math.PI * 2 + v.phase;
      const u = THREE.MathUtils.clamp((1 - Math.cos(ph)) / 2, 0, 1);
      const p = v.curve.getPointAt(u);
      const tan = v.curve.getTangentAt(u);
      if (Math.sin(ph) < 0) tan.negate();
      v.obj.position.set(p.x - tan.z * 0.7, 0.08, p.z + tan.x * 0.7);
      v.obj.rotation.y = -Math.atan2(tan.z, tan.x);
    }

    renderer.render(scene, camera);

    const w = width();
    const h = height();
    const place = (el: HTMLElement, v: THREE.Vector3) => {
      tmp.copy(v).project(camera);
      const visible = tmp.z < 1 && Math.abs(tmp.x) < 1.2 && Math.abs(tmp.y) < 1.2;
      el.style.display = visible ? '' : 'none';
      if (visible) el.style.transform = `translate(${((tmp.x * 0.5 + 0.5) * w).toFixed(1)}px, ${((-tmp.y * 0.5 + 0.5) * h).toFixed(1)}px) translate(-50%, -100%)`;
      return tmp.z;
    };
    for (const l of labels) {
      const z = place(l.el, l.pos);
      l.el.style.zIndex = String(1000 - Math.round(z * 1000));
      l.el.classList.toggle('rf-on', l.id !== null && l.id === selected);
      l.el.classList.toggle('rf-dim', selected !== null && l.id !== selected);
    }
    for (const wl of workerLabels) {
      if (wl.itemId !== selected) {
        wl.el.style.display = 'none';
        continue;
      }
      wl.obj.getWorldPosition(tmp);
      place(wl.el, tmp.clone().setY(tmp.y + 4.2));
    }
  };
  raf = requestAnimationFrame(frame);

  function disposeWorld() {
    scene.remove(world);
    world.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose();
      if (m.material && !Array.isArray(m.material) && ![...materialCache.values()].includes(m.material)) {
        const mm = m.material as THREE.Material & { map?: THREE.Texture | null };
        if (mm.map && mm.map !== glowTex) mm.map.dispose();
        mm.dispose();
      }
    });
  }

  const handle: ReliefHandle = {
    select(id) {
      selected = id;
      lastInteraction = performance.now();
      controls.autoRotate = false;
      opts.onSelect(id);
    },
    focus(id) {
      const so = id ? items.get(id) : null;
      if (!so) return;
      const site = new THREE.Vector3(so.built.group.position.x, 3, so.built.group.position.z);
      const dir = camera.position.clone().sub(controls.target).normalize();
      dir.y = Math.max(dir.y, 0.8);
      dir.normalize();
      const r = Math.max(16, so.built.radius * 2.4, so.built.top * 1.3);
      flyTo(site.clone().add(dir.multiplyScalar(Math.min(controls.maxDistance, fitDistance(r)))), site);
    },
    reset() {
      handle.select(null);
      flyTo(homePos(), home.target.clone());
    },
    setAnimated(on) {
      animated = on;
      if (!on) controls.autoRotate = false;
    },
    update(next) {
      data = next;
      disposeWorld();
      buildWorld();
      if (selected && !items.has(selected)) handle.select(null);
    },
    setSpec(nextSpec, next) {
      spec = nextSpec;
      accent = ACCENT[spec.accent] ?? ACCENT.terracotta;
      data = next;
      disposeWorld();
      buildWorld();
      if (selected && !items.has(selected)) handle.select(null);
      flyTo(homePos(), home.target.clone());
    },
    setMood(next) {
      if (next === mood) return;
      mood = next;
      applyMood();
      disposeWorld();
      buildWorld();
      if (selected && !items.has(selected)) handle.select(null);
    },
    setInsets(next) {
      insets = { left: next.left ?? 0, right: next.right ?? 0, bottom: next.bottom ?? 0, top: next.top ?? 0 };
      applyInsets();
    },
    dispose() {
      cancelAnimationFrame(raf);
      ro?.disconnect();
      renderer.domElement.removeEventListener('pointerdown', onDown);
      renderer.domElement.removeEventListener('pointerup', onUp);
      renderer.domElement.removeEventListener('pointermove', onMove);
      renderer.domElement.removeEventListener('wheel', stopAuto);
      controls.dispose();
      disposeWorld();
      glowTex.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      labelLayer.remove();
    },
  };
  return handle;
}

export function accentColor(spec: ReliefSpec) {
  return ACCENT[spec.accent] ?? ACCENT.terracotta;
}

export type { ReliefStyle };
