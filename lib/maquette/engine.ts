import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { MaquettePlan, MaquetteSite, SiteKind } from './types';

// The 3D miniature ("Ma maquette") of a construction company, drawn with
// three.js from a MaquettePlan: a tabletop island with the Alps behind, a
// lake and a river, the depot, every site built up to its phase (excavation,
// shell with a turning crane, scaffolding, finishing, handed over), the roads
// between them with trucks driving, the crew planned on each site today, and
// a label over each site. Click a site (or its label) to select it.
//
// Plain three.js, no React: it runs inside the DOM component
// (components/maquette/MaquetteDom.tsx) and in the standalone preview.

export interface MaquetteHandle {
  select(id: string | null): void;
  focus(id: string | null): void;
  reset(): void;
  setAnimated(on: boolean): void;
  dispose(): void;
}

interface Options {
  onSelect(id: string | null): void;
}

// ------------------------------------------------------------------ palette

const C = {
  bg: '#EFE6D6',
  grass: '#B5C08C',
  grassDark: '#93A36C',
  grassLight: '#C4CD9C',
  soil: '#8A6848',
  soilDark: '#6B4F36',
  road: '#77716A',
  roadLine: '#EFE9DD',
  sand: '#E2D3B1',
  water: '#7FB0BF',
  rock: '#A59D92',
  rockDark: '#8C8479',
  snow: '#F6F3EE',
  trunk: '#7A5A3E',
  leaf1: '#7E9A5C',
  leaf2: '#93AC69',
  pine: '#5F7E57',
  concrete: '#CFC9BF',
  concreteDark: '#B9B2A6',
  render: '#F3EEE5',
  renderWarm: '#EADFCD',
  wood: '#B98656',
  woodDark: '#6B5240',
  roofGrey: '#6F6560',
  roofTile: '#A95C30',
  glass: '#40525F',
  dirt: '#C7A47D',
  dirtDark: '#9C7A57',
  scaffold: '#C9C3B8',
  plank: '#C99A45',
  crane: '#E1A53A',
  cab: '#A95C30',
  dark: '#2F3135',
  white: '#F4F1EA',
  skin: '#E5BE98',
  helmet: '#F2C230',
  vine: '#5E7B45',
  accent: '#A95C30',
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

const materialCache = new Map<string, THREE.MeshStandardMaterial>();
function mat(color: string, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) {
  const key = color + JSON.stringify(extra);
  let m = materialCache.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color, roughness: 0.92, metalness: 0, flatShading: true, ...extra });
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

function merged(geos: THREE.BufferGeometry[], color: string, shadow = true) {
  const g = mergeGeometries(geos.map((x) => (x.index ? x.toNonIndexed() : x)));
  geos.forEach((x) => x.dispose());
  return mesh(g, color, shadow);
}

// A gable roof: triangle extruded along z, eaves at y = 0.
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

// A flat ribbon following a curve (roads, river), lying at height y.
function ribbonGeo(curve: THREE.Curve<THREE.Vector3>, width: number, y: number, samples = 120) {
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

function flatShapeGeo(shape: THREE.Shape, y: number) {
  const g = new THREE.ShapeGeometry(shape, 24);
  g.rotateX(-Math.PI / 2);
  g.translate(0, y, 0);
  return g;
}

function ellipseShape(rx: number, rz: number) {
  const s = new THREE.Shape();
  s.absellipse(0, 0, rx, rz, 0, Math.PI * 2, false, 0);
  return s;
}

// ------------------------------------------------------------------ occupancy

class Occupancy {
  private spots: { x: number; z: number; r: number }[] = [];
  add(x: number, z: number, r: number) {
    this.spots.push({ x, z, r });
  }
  addCurve(curve: THREE.Curve<THREE.Vector3>, r: number, samples = 60) {
    for (let i = 0; i <= samples; i++) {
      const p = curve.getPointAt(i / samples);
      this.add(p.x, p.z, r);
    }
  }
  free(x: number, z: number, r: number) {
    if (Math.abs(x) > 70 - r || Math.abs(z) > 43 - r) return false;
    return this.spots.every((s) => (s.x - x) ** 2 + (s.z - z) ** 2 > (s.r + r) ** 2);
  }
}

// ------------------------------------------------------------------ props

function person(color: string, helmet = C.helmet) {
  const g = new THREE.Group();
  g.add(box(0.24, 0.85, 0.26, C.dark, -0.15, 0, 0));
  g.add(box(0.24, 0.85, 0.26, C.dark, 0.15, 0, 0));
  g.add(box(0.62, 0.8, 0.36, color, 0, 0.85, 0));
  g.add(box(0.64, 0.08, 0.38, '#F2E36A', 0, 1.3, 0));
  const head = mesh(new THREE.SphereGeometry(0.24, 10, 8), C.skin);
  head.position.y = 1.9;
  g.add(head);
  const hat = mesh(new THREE.SphereGeometry(0.28, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), helmet);
  hat.position.y = 1.98;
  g.add(hat);
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

function truck(kind: string) {
  const g = new THREE.Group();
  const wheels: THREE.BufferGeometry[] = [];
  for (const [x, z] of [
    [-1.9, 1.05],
    [-1.9, -1.05],
    [1.7, 1.05],
    [1.7, -1.05],
  ]) {
    wheels.push(new THREE.CylinderGeometry(0.55, 0.55, 0.4, 10).rotateX(Math.PI / 2).translate(x, 0.55, z));
  }
  g.add(merged(wheels, C.dark));
  g.add(box(5.6, 0.5, 2.1, C.dark, 0, 0.6, 0));
  if (kind === 'Fourgon') {
    g.add(box(5.4, 2.3, 2.2, C.white, -0.2, 0.95, 0));
    g.add(box(5.42, 0.3, 2.22, C.accent, -0.2, 1.7, 0));
    g.add(box(0.1, 0.8, 1.9, C.glass, 2.55, 2.0, 0));
  } else {
    g.add(box(1.7, 2.1, 2.2, C.cab, 1.95, 1.0, 0));
    g.add(box(0.1, 0.8, 1.9, C.glass, 2.82, 2.0, 0));
    if (kind === 'Camion benne') {
      const bed = new THREE.Group();
      bed.add(box(3.6, 0.2, 2.2, C.concreteDark, 0, 0, 0));
      bed.add(box(3.6, 1.1, 0.15, C.concreteDark, 0, 0, 1.03));
      bed.add(box(3.6, 1.1, 0.15, C.concreteDark, 0, 0, -1.03));
      bed.add(box(0.15, 1.1, 2.2, C.concreteDark, -1.75, 0, 0));
      bed.add(box(3.2, 0.7, 1.8, C.dirt, 0, 0.2, 0));
      bed.position.set(-1.0, 1.1, 0);
      g.add(bed);
    } else {
      g.add(box(3.7, 0.25, 2.2, C.concreteDark, -1.0, 1.1, 0));
      g.add(box(0.5, 0.9, 0.5, C.crane, 0.6, 1.35, 0));
      const arm = box(3.4, 0.35, 0.35, C.crane, -1.5, 2.15, 0);
      arm.rotation.z = 0.08;
      g.add(arm);
      g.add(box(1.4, 0.5, 1.4, '#B9A27E', -2.0, 1.35, 0));
    }
  }
  return g;
}

// Scaffolding around a w x d footprint up to height h (poles, ledgers, planks).
function scaffold(w: number, d: number, h: number, sides: ('n' | 's' | 'e' | 'w')[]) {
  const poles: THREE.BufferGeometry[] = [];
  const planks: THREE.BufferGeometry[] = [];
  const off = 1.0;
  const lift = 2;
  const levels = Math.max(1, Math.floor(h / lift));
  for (const side of sides) {
    const along = side === 'n' || side === 's' ? w + off * 2 : d + off * 2;
    const n = Math.max(2, Math.round(along / 2.4));
    const place = (a: number, y: number, len: number, height: number, thick: number, depth: number, out: number) => {
      // a: position along the side, centred; out: distance from the wall
      if (side === 's') return boxGeo(len, height, depth, a, y, d / 2 + out);
      if (side === 'n') return boxGeo(len, height, depth, a, y, -d / 2 - out);
      if (side === 'e') return boxGeo(depth, height, len, w / 2 + out, y, a);
      return boxGeo(depth, height, len, -w / 2 - out, y, a);
    };
    for (let i = 0; i <= n; i++) {
      const a = -along / 2 + (along * i) / n;
      poles.push(place(a, 0, 0.12, levels * lift + 1, 0.12, 0.12, off));
      poles.push(place(a, 0, 0.12, levels * lift + 1, 0.12, 0.12, off + 0.9));
    }
    for (let l = 1; l <= levels; l++) {
      planks.push(place(0, l * lift, along, 0.1, 0.1, 0.9, off + 0.45));
      poles.push(place(0, l * lift + 1, along, 0.08, 0.08, 0.08, off + 0.9));
    }
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
      geos.push(boxGeo(1.1, floorH * 0.45, 0.1, x, y, d / 2 + 0.03));
      geos.push(boxGeo(1.1, floorH * 0.45, 0.1, x, y, -d / 2 - 0.03));
    }
    for (let i = 0; i < nz; i++) {
      const z = -d / 2 + (d * (i + 0.5)) / nz;
      geos.push(boxGeo(0.1, floorH * 0.45, 1.1, w / 2 + 0.03, y, z));
      geos.push(boxGeo(0.1, floorH * 0.45, 1.1, -w / 2 - 0.03, y, z));
    }
  }
  return merged(geos, color, false);
}

const KIND: Record<SiteKind, { w: number; d: number; floors: number; floorH: number; roof: 'gable' | 'flat'; finish: string; roofColor: string }> = {
  villa: { w: 9, d: 7, floors: 2, floorH: 2.8, roof: 'gable', finish: C.render, roofColor: C.roofGrey },
  immeuble: { w: 13, d: 9, floors: 4, floorH: 2.9, roof: 'flat', finish: C.renderWarm, roofColor: C.concreteDark },
  halle: { w: 15, d: 10, floors: 1, floorH: 5.5, roof: 'gable', finish: '#D9D4CA', roofColor: '#8E8A84' },
  chalet: { w: 8, d: 7, floors: 2, floorH: 2.6, roof: 'gable', finish: C.wood, roofColor: C.woodDark },
};

interface SiteAnim {
  cranes: { jib: THREE.Object3D; load: THREE.Object3D; phase: number }[];
  arms: { arm: THREE.Object3D; phase: number }[];
  workers: { obj: THREE.Object3D; a: THREE.Vector3; b: THREE.Vector3; speed: number; phase: number; walk: boolean; person: { initials: string; color: string; name: string } }[];
}

// One construction site, drawn according to its phase. Returns the group,
// the height of its top (for the label) and what to animate.
function buildSite(site: MaquetteSite, plan: MaquettePlan, rand: () => number) {
  const g = new THREE.Group();
  const k = KIND[site.kind];
  const anim: SiteAnim = { cranes: [], arms: [], workers: [] };
  const plotW = k.w + 9;
  const plotD = k.d + 8;
  const done = site.phase === 'reception';
  const fullH = k.floors * k.floorH;
  let top = 2;

  // Plot: dirt while building, garden once handed over.
  g.add(mesh(boxGeo(plotW, 0.08, plotD, 0, 0, 0), done ? C.grassLight : C.dirt, false));

  // Fence (open on the south side, where the road arrives).
  if (!done) {
    const posts: THREE.BufferGeometry[] = [];
    const rails: THREE.BufferGeometry[] = [];
    const edge = (x1: number, z1: number, x2: number, z2: number) => {
      const len = Math.hypot(x2 - x1, z2 - z1);
      const n = Math.max(1, Math.round(len / 2));
      for (let i = 0; i <= n; i++) posts.push(boxGeo(0.12, 1.5, 0.12, x1 + ((x2 - x1) * i) / n, 0, z1 + ((z2 - z1) * i) / n));
      const r = new THREE.BoxGeometry(Math.abs(x2 - x1) || 0.06, 1.1, Math.abs(z2 - z1) || 0.06);
      r.translate((x1 + x2) / 2, 0.85, (z1 + z2) / 2);
      rails.push(r);
    };
    const hw = plotW / 2;
    const hd = plotD / 2;
    edge(-hw, -hd, hw, -hd);
    edge(-hw, -hd, -hw, hd);
    edge(hw, -hd, hw, hd);
    edge(-hw, hd, -2.5, hd);
    edge(2.5, hd, hw, hd);
    g.add(merged(posts, C.white));
    const railMesh = merged(rails, '#E7DFD0', false);
    railMesh.material = mat('#E7DFD0', { transparent: true, opacity: 0.55 });
    g.add(railMesh);
  }

  const house = new THREE.Group();
  house.position.set(-1.5, 0, -1);
  g.add(house);

  if (site.phase === 'terrassement') {
    house.add(mesh(boxGeo(k.w + 1.5, 0.12, k.d + 1.5, 0, 0.02, 0), C.dirtDark, false));
    const pile = mesh(new THREE.ConeGeometry(3.2, 2.4, 7).translate(0, 1.2, 0), C.dirtDark);
    pile.position.set(k.w / 2 + 1.5, 0, k.d / 2 - 1);
    g.add(pile);
    // Excavator with a swinging arm.
    const ex = new THREE.Group();
    ex.add(box(3.2, 0.7, 0.8, C.dark, 0, 0, 1.0));
    ex.add(box(3.2, 0.7, 0.8, C.dark, 0, 0, -1.0));
    const body = new THREE.Group();
    body.position.y = 0.7;
    body.add(box(2.8, 1.1, 2.4, C.crane, -0.3, 0, 0));
    body.add(box(1.3, 1.3, 1.3, C.crane, 0.5, 1.1, -0.5));
    body.add(box(0.05, 0.8, 1.1, C.glass, 1.17, 1.4, -0.5));
    const arm = new THREE.Group();
    arm.position.set(0.9, 1.2, 0.5);
    const boom = box(3.6, 0.4, 0.4, C.crane, 1.8, -0.2, 0);
    arm.add(boom);
    const stick = new THREE.Group();
    stick.position.set(3.5, 0, 0);
    stick.add(box(0.35, 2.4, 0.35, C.crane, 0, -2.3, 0));
    stick.add(box(0.9, 0.6, 0.9, C.dark, 0.2, -2.6, 0));
    arm.add(stick);
    arm.rotation.z = 0.35;
    body.add(arm);
    ex.add(body);
    ex.position.set(-k.w / 2 + 1, 0, k.d / 2 + 2.2);
    ex.rotation.y = -0.5;
    g.add(ex);
    anim.arms.push({ arm, phase: rand() * 6 });
    top = 5;
  } else {
    // Ground slab.
    house.add(mesh(boxGeo(k.w + 0.4, 0.4, k.d + 0.4, 0, 0, 0), C.concreteDark));
    const finished = site.phase === 'finitions' || done;
    let builtH = fullH;
    if (site.phase === 'gros_oeuvre') builtH = Math.max(k.floorH * 0.6, fullH * Math.min(1, (site.progress - 0.15) / 0.35));
    const wallColor = finished ? k.finish : C.concrete;
    // Walls (a closed box up to the built height) and floor slabs.
    house.add(mesh(boxGeo(k.w, builtH, k.d, 0, 0.4, 0), wallColor));
    const fullFloors = Math.floor(builtH / k.floorH + 0.01);
    for (let f = 1; f <= fullFloors; f++) house.add(mesh(boxGeo(k.w + 0.3, 0.25, k.d + 0.3, 0, 0.4 + f * k.floorH - 0.12, 0), finished ? C.white : C.concreteDark, false));
    if (fullFloors > 0) house.add(windows(k.w, k.d, fullFloors, k.floorH, 0.4, finished ? '#4E6474' : C.glass));
    if (site.kind === 'chalet' && finished) house.add(mesh(boxGeo(k.w + 0.05, k.floorH, k.d + 0.05, 0, 0.4, 0), '#BDB5A8'));

    // Roof once the shell is closed.
    if (builtH >= fullH - 0.01) {
      if (k.roof === 'gable') {
        const roofH = site.kind === 'halle' ? 1.6 : 3.2;
        const color = site.phase === 'second_oeuvre' ? C.wood : k.roofColor;
        const roof = mesh(gableGeo(k.w, k.d, roofH, site.kind === 'chalet' ? 1.4 : 0.6), color);
        roof.position.y = 0.4 + fullH;
        house.add(roof);
        top = fullH + roofH + 1;
      } else {
        house.add(mesh(boxGeo(k.w + 0.6, 0.5, k.d + 0.6, 0, 0.4 + fullH, 0), k.roofColor));
        top = fullH + 1.5;
      }
    } else {
      top = builtH + 1;
    }

    // Scaffolding while the facades are open, then on one side only.
    if (site.phase === 'gros_oeuvre' || site.phase === 'second_oeuvre') {
      const sc = scaffold(k.w, k.d, builtH, ['s', 'e', 'w', 'n']);
      sc.position.y = 0.4;
      house.add(sc);
    } else if (site.phase === 'finitions') {
      const sc = scaffold(k.w, k.d, fullH, ['e']);
      sc.position.y = 0.4;
      house.add(sc);
    }

    // Tower crane on the shell and big second-phase sites.
    if (site.phase === 'gros_oeuvre' || (site.phase === 'second_oeuvre' && site.kind === 'immeuble')) {
      const H = fullH + 10;
      const crane = new THREE.Group();
      crane.position.set(k.w / 2 + 2.6, 0, -k.d / 2 - 1.4);
      crane.add(box(2.4, 0.6, 2.4, C.concreteDark, 0, 0, 0));
      const mast: THREE.BufferGeometry[] = [];
      for (const [x, z] of [
        [-0.45, -0.45],
        [0.45, -0.45],
        [-0.45, 0.45],
        [0.45, 0.45],
      ])
        mast.push(boxGeo(0.14, H, 0.14, x, 0.6, z));
      for (let y = 1.5; y < H; y += 1.5) {
        mast.push(boxGeo(1.0, 0.1, 0.1, 0, 0.6 + y, 0.45), boxGeo(1.0, 0.1, 0.1, 0, 0.6 + y, -0.45));
        mast.push(boxGeo(0.1, 0.1, 1.0, 0.45, 0.6 + y, 0), boxGeo(0.1, 0.1, 1.0, -0.45, 0.6 + y, 0));
      }
      crane.add(merged(mast, C.crane));
      const jib = new THREE.Group();
      jib.position.y = 0.6 + H;
      jib.add(box(1.4, 0.8, 1.4, C.crane, 0, 0, 0));
      jib.add(box(1.0, 1.0, 1.0, C.cab, 0.9, -0.2, 0.9));
      jib.add(box(18, 0.5, 0.6, C.crane, 9, 0.8, 0));
      jib.add(box(6, 0.5, 0.6, C.crane, -3.2, 0.8, 0));
      jib.add(box(1.6, 1.4, 1.2, C.concreteDark, -5.4, 0, 0));
      jib.add(box(0.3, 3.0, 0.3, C.crane, 0, 0.8, 0));
      const tie1 = mesh(new THREE.CylinderGeometry(0.04, 0.04, 1, 4), C.dark, false);
      const t1 = new THREE.Vector3(0, 3.8, 0);
      const t2 = new THREE.Vector3(14, 1.3, 0);
      tie1.position.copy(t1.clone().add(t2).multiplyScalar(0.5));
      tie1.scale.y = t1.distanceTo(t2);
      tie1.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), t2.clone().sub(t1).normalize());
      jib.add(tie1);
      const load = new THREE.Group();
      load.position.set(11, 0.6, 0);
      const cableLen = 6;
      load.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, cableLen, 4).translate(0, -cableLen / 2, 0), C.dark, false));
      load.add(box(1.6, 0.5, 1.2, C.plank, 0, -cableLen - 0.5, 0));
      load.add(box(1.3, 0.5, 1.0, '#C2675A', 0, -cableLen, 0));
      jib.add(load);
      crane.add(jib);
      g.add(crane);
      anim.cranes.push({ jib, load, phase: rand() * 6 });
      top = Math.max(top, H + 2);
    }

    // Garden once handed over.
    if (done) {
      const hedge: THREE.BufferGeometry[] = [];
      hedge.push(boxGeo(plotW - 1, 0.9, 0.7, 0, 0, -plotD / 2 + 0.6), boxGeo(0.7, 0.9, plotD - 1, -plotW / 2 + 0.6, 0, 0), boxGeo(0.7, 0.9, plotD - 1, plotW / 2 - 0.6, 0, 0));
      g.add(merged(hedge, C.leaf1));
      const t = tree('leaf', 0.8, C.leaf2);
      t.position.set(plotW / 2 - 3, 0, plotD / 2 - 3);
      g.add(t);
      g.add(box(4, 0.1, 5, '#D8CDBB', 2.5, 0.05, plotD / 2 - 3));
    }
  }

  // Site hut, materials.
  if (!done) {
    const hut = new THREE.Group();
    hut.add(box(4.6, 2.5, 2.3, C.white, 0, 0, 0));
    hut.add(box(4.62, 0.35, 2.32, C.accent, 0, 2.0, 0));
    hut.add(box(0.9, 1.7, 0.05, C.dark, 1.2, 0, 1.16));
    hut.add(box(1.0, 0.7, 0.05, C.glass, -0.9, 1.1, 1.16));
    hut.position.set(-plotW / 2 + 3.2, 0, plotD / 2 - 2.2);
    g.add(hut);
    const stack: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 3; i++) stack.push(boxGeo(1.4, 0.18, 1.2, plotW / 2 - 2.2, i * 0.75, plotD / 2 - 2), boxGeo(1.3, 0.55, 1.1, plotW / 2 - 2.2, i * 0.75 + 0.18, plotD / 2 - 2));
    g.add(merged(stack, '#C2675A'));
    g.add(box(1.4, 0.15, 1.2, C.plank, plotW / 2 - 4.0, 0, plotD / 2 - 2));
  }

  // The crew planned on this site today.
  site.crew.forEach((id, i) => {
    const p = plan.people.find((x) => x.id === id);
    if (!p) return;
    const w = person(p.color, p.role.startsWith('Chef') ? C.white : C.helmet);
    const angle = (i / Math.max(1, site.crew.length)) * Math.PI * 2 + rand();
    const r = Math.max(k.w, k.d) / 2 + 2.2;
    const a = new THREE.Vector3(Math.cos(angle) * r - 1.5, 0.08, Math.sin(angle) * r * 0.8 - 1);
    const b = a.clone().add(new THREE.Vector3((rand() - 0.5) * 6, 0, (rand() - 0.5) * 3));
    b.x = THREE.MathUtils.clamp(b.x, -plotW / 2 + 1, plotW / 2 - 1);
    b.z = THREE.MathUtils.clamp(b.z, -plotD / 2 + 1, plotD / 2 - 1);
    w.position.copy(a);
    g.add(w);
    anim.workers.push({ obj: w, a, b, speed: 0.25 + rand() * 0.25, phase: rand() * 6, walk: i % 2 === 0, person: { initials: p.initials, color: p.color, name: p.name } });
  });

  return { group: g, top: top + 2, anim, radius: Math.max(plotW, plotD) / 2 + 1 };
}

// ------------------------------------------------------------------ engine

export function createMaquette(host: HTMLElement, plan: MaquettePlan, opts: Options): MaquetteHandle {
  const rand = rng(20261013);
  const width = () => host.clientWidth || 800;
  const height = () => host.clientHeight || 600;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(width(), height());
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.domElement.style.display = 'block';
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  renderer.domElement.style.outline = 'none';
  host.appendChild(renderer.domElement);

  const labelLayer = document.createElement('div');
  labelLayer.className = 'mq-labels';
  host.appendChild(labelLayer);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(C.bg);
  scene.fog = new THREE.Fog(C.bg, 260, 520);

  const camera = new THREE.PerspectiveCamera(30, width() / height(), 1, 1200);
  const HOME_TARGET = new THREE.Vector3(10, 0, 4);
  const HOME_OFFSET = new THREE.Vector3(-58, 126, 168);
  // Narrow (phone) screens need to stand further back to see the whole island.
  const homePos = () => HOME_TARGET.clone().add(HOME_OFFSET.clone().multiplyScalar(camera.aspect < 1 ? 1.9 : camera.aspect < 1.4 ? 1.3 : 1));
  const HOME = { pos: homePos(), target: HOME_TARGET };
  camera.position.copy(HOME.pos);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.copy(HOME.target);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 35;
  controls.maxDistance = 420;
  controls.maxPolarAngle = 1.2;
  controls.minPolarAngle = 0.25;
  controls.screenSpacePanning = false;
  controls.autoRotateSpeed = 0.35;
  controls.update();

  // Light: warm sun with soft shadows, sky fill.
  scene.add(new THREE.HemisphereLight('#FFF6E8', '#8C7B62', 1.35));
  const sun = new THREE.DirectionalLight('#FFE6C7', 2.4);
  sun.position.set(-60, 110, 55);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -95;
  sun.shadow.camera.right = 95;
  sun.shadow.camera.top = 75;
  sun.shadow.camera.bottom = -75;
  sun.shadow.camera.near = 10;
  sun.shadow.camera.far = 320;
  sun.shadow.bias = -0.0006;
  sun.shadow.normalBias = 0.04;
  scene.add(sun);

  const world = new THREE.Group();
  scene.add(world);
  const occ = new Occupancy();

  // ---- the island (a tabletop miniature: grass on top, soil layers below)
  const islandShape = new THREE.Shape();
  {
    const W = 76;
    const D = 49;
    const r = 11;
    islandShape.moveTo(-W + r, -D);
    islandShape.lineTo(W - r, -D);
    islandShape.quadraticCurveTo(W, -D, W, -D + r);
    islandShape.lineTo(W, D - r);
    islandShape.quadraticCurveTo(W, D, W - r, D);
    islandShape.lineTo(-W + r, D);
    islandShape.quadraticCurveTo(-W, D, -W, D - r);
    islandShape.lineTo(-W, -D + r);
    islandShape.quadraticCurveTo(-W, -D, -W + r, -D);
  }
  const layer = (depth: number, top: string, side: string, y: number) => {
    const g = new THREE.ExtrudeGeometry(islandShape, { depth, bevelEnabled: false, curveSegments: 10 });
    g.rotateX(-Math.PI / 2);
    const m = new THREE.Mesh(g, [mat(top), mat(side)]);
    m.position.y = y;
    m.receiveShadow = true;
    m.castShadow = false;
    world.add(m);
  };
  layer(1.2, C.grass, C.grassDark, -1.2);
  layer(3.0, C.soil, C.soil, -4.2);
  layer(3.6, C.soilDark, C.soilDark, -7.8);

  // Soft shadow of the miniature on the "table".
  {
    const cv = document.createElement('canvas');
    cv.width = cv.height = 128;
    const ctx = cv.getContext('2d');
    if (ctx) {
      const grd = ctx.createRadialGradient(64, 64, 10, 64, 64, 64);
      grd.addColorStop(0, 'rgba(60,40,20,0.35)');
      grd.addColorStop(1, 'rgba(60,40,20,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, 128, 128);
    }
    const tex = new THREE.CanvasTexture(cv);
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(230, 150), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -9;
    scene.add(shadow);
  }

  // ---- mountains along the north edge
  const peaks: [number, number, number, number][] = [
    [-62, -39, 13, 26],
    [-42, -41, 15, 33],
    [-20, -40, 12, 24],
    [2, -42, 14, 30],
    [26, -41, 13, 27],
    [50, -40, 15, 34],
    [66, -38, 9, 18],
  ];
  for (const [x, z, r, h] of peaks) {
    const geo = new THREE.ConeGeometry(r, h, 7, 3);
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const y = p.getY(i);
      if (y > -h / 2 + 0.01 && y < h / 2 - 0.01) {
        p.setX(i, p.getX(i) + (rand() - 0.5) * r * 0.25);
        p.setZ(i, p.getZ(i) + (rand() - 0.5) * r * 0.25);
        p.setY(i, y + (rand() - 0.5) * h * 0.08);
      }
    }
    geo.computeVertexNormals();
    const m = mesh(geo, rand() > 0.5 ? C.rock : C.rockDark);
    m.position.set(x, h / 2 - 0.5, z);
    m.rotation.y = rand() * Math.PI;
    world.add(m);
    const capH = h * 0.32;
    const cap = mesh(new THREE.ConeGeometry(r * 0.34, capH, 7), C.snow);
    cap.position.set(x, h - capH / 2 - 0.4, z);
    cap.rotation.y = m.rotation.y;
    world.add(cap);
    occ.add(x, z, r + 2);
  }

  // ---- lake and river
  const lake = { x: -52, z: 30, rx: 19, rz: 12 };
  {
    const shore = new THREE.Mesh(flatShapeGeo(ellipseShape(lake.rx + 2.2, lake.rz + 2.2), 0.02), mat(C.sand));
    shore.position.set(lake.x, 0, lake.z);
    shore.receiveShadow = true;
    world.add(shore);
    const water = new THREE.Mesh(flatShapeGeo(ellipseShape(lake.rx, lake.rz), 0.06), mat(C.water, { roughness: 0.25, metalness: 0.1, flatShading: false }));
    water.position.set(lake.x, 0, lake.z);
    water.receiveShadow = true;
    world.add(water);
    occ.add(lake.x, lake.z, lake.rx + 3);
  }
  const river = new THREE.CatmullRomCurve3([new THREE.Vector3(-36, 0, -36), new THREE.Vector3(-38, 0, -20), new THREE.Vector3(-46, 0, -4), new THREE.Vector3(-47, 0, 10), new THREE.Vector3(-52, 0, 22)]);
  world.add(new THREE.Mesh(ribbonGeo(river, 5.2, 0.025), mat(C.sand)));
  {
    const w = new THREE.Mesh(ribbonGeo(river, 3.2, 0.055), mat(C.water, { roughness: 0.25, metalness: 0.1, flatShading: false }));
    w.receiveShadow = true;
    world.add(w);
  }
  occ.addCurve(river, 4);

  // A sailboat drifting on the lake.
  const boat = new THREE.Group();
  boat.add(box(3.2, 0.6, 1.2, C.white, 0, 0, 0));
  {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.lineTo(2.2, 0);
    s.lineTo(0, 3.6);
    s.closePath();
    const sail = mesh(new THREE.ShapeGeometry(s), C.white, true, { side: THREE.DoubleSide });
    sail.position.set(-0.6, 0.7, 0);
    boat.add(sail);
    boat.add(box(0.1, 4, 0.1, C.woodDark, -0.6, 0.5, 0));
  }
  world.add(boat);

  // ---- depot
  const [dx, dz] = plan.depot.pos;
  {
    const depot = new THREE.Group();
    depot.position.set(dx, 0, dz);
    depot.add(mesh(boxGeo(24, 0.1, 16, 0, 0, 0), '#D9CFBF', false));
    depot.add(box(13, 5.5, 8, C.white, -3, 0, -3));
    const roof = mesh(gableGeo(13, 8, 2.4, 0.6), C.roofTile);
    roof.position.set(-3, 5.5, -3);
    depot.add(roof);
    depot.add(box(4.2, 3.8, 0.1, C.dark, -5, 0, 1.02));
    depot.add(box(3.2, 1.0, 0.1, C.glass, 0.5, 2.6, 1.02));
    depot.add(box(13.02, 0.5, 8.02, C.accent, -3, 4.2, -3));
    // Material yard.
    for (let i = 0; i < 4; i++) depot.add(box(1.6, 0.9, 1.3, i % 2 ? '#C2675A' : C.concrete, 6 + (i % 2) * 2, 0, -5 + Math.floor(i / 2) * 2));
    // Swiss flag.
    depot.add(box(0.15, 7, 0.15, C.white, 9.5, 0, 4.5));
    const flag = new THREE.Group();
    flag.add(box(1.8, 1.8, 0.06, '#D52B1E', 0.9, 0, 0));
    flag.add(box(1.1, 0.34, 0.08, C.white, 0.9, 0.72, 0));
    flag.add(box(0.34, 1.1, 0.08, C.white, 0.9, 0.35, 0));
    flag.position.set(9.6, 5.0, 4.5);
    depot.add(flag);
    world.add(depot);
    occ.add(dx, dz, 14);
  }

  // ---- roads: a main road across the plain, and one road from the depot to each site
  const mainRoad = new THREE.CatmullRomCurve3([new THREE.Vector3(-70, 0, 16), new THREE.Vector3(-30, 0, 18), new THREE.Vector3(dx, 0, dz + 11), new THREE.Vector3(30, 0, 10), new THREE.Vector3(70, 0, 6)]);
  const roadMat = mat(C.road, { polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 });
  const addRoad = (curve: THREE.Curve<THREE.Vector3>, w: number, y: number) => {
    const m = new THREE.Mesh(ribbonGeo(curve, w, y), roadMat);
    m.receiveShadow = true;
    world.add(m);
    const len = curve.getLength();
    const dashes: THREE.BufferGeometry[] = [];
    for (let s = 2; s < len - 2; s += 3.2) {
      const t = s / len;
      const p = curve.getPointAt(t);
      const tan = curve.getTangentAt(t);
      const d = new THREE.BoxGeometry(1.4, 0.02, 0.18);
      d.rotateY(-Math.atan2(tan.z, tan.x));
      d.translate(p.x, y + 0.02, p.z);
      dashes.push(d);
    }
    if (dashes.length) world.add(merged(dashes, C.roadLine, false));
    occ.addCurve(curve, w / 2 + 1.2, 80);
  };
  addRoad(mainRoad, 3.4, 0.07);

  // Bridge where the main road crosses the river.
  {
    let best = { d: Infinity, t: 0 };
    for (let i = 0; i <= 200; i++) {
      const t = i / 200;
      const p = mainRoad.getPointAt(t);
      for (let j = 0; j <= 80; j++) {
        const q = river.getPointAt(j / 80);
        const d = p.distanceTo(q);
        if (d < best.d) best = { d, t };
      }
    }
    if (best.d < 3) {
      const p = mainRoad.getPointAt(best.t);
      const tan = mainRoad.getTangentAt(best.t);
      const bridge = new THREE.Group();
      bridge.add(box(8, 0.5, 4.2, C.concrete, 0, 0.1, 0));
      bridge.add(box(8, 0.7, 0.25, C.concreteDark, 0, 0.6, 2.0));
      bridge.add(box(8, 0.7, 0.25, C.concreteDark, 0, 0.6, -2.0));
      bridge.add(box(7.6, 0.03, 3.4, C.road, 0, 0.6, 0));
      bridge.position.set(p.x, 0, p.z);
      bridge.rotation.y = -Math.atan2(tan.z, tan.x);
      world.add(bridge);
    }
  }

  // ---- sites
  const siteObjs = new Map<string, { site: MaquetteSite; group: THREE.Group; top: number; anim: SiteAnim; hit: THREE.Mesh; ring: THREE.Mesh; road: THREE.CatmullRomCurve3 }>();
  const roadEnd = new THREE.Vector3(dx, 0, dz + 9);
  plan.sites.forEach((site, i) => {
    const built = buildSite(site, plan, rand);
    const [x, z] = site.pos;
    built.group.position.set(x, 0, z);
    world.add(built.group);

    const hit = new THREE.Mesh(new THREE.BoxGeometry(built.radius * 2, built.top, built.radius * 2), new THREE.MeshBasicMaterial({ visible: false }));
    hit.position.set(x, built.top / 2, z);
    hit.userData.siteId = site.id;
    world.add(hit);

    const ring = new THREE.Mesh(new THREE.RingGeometry(built.radius + 0.6, built.radius + 1.6, 48), new THREE.MeshBasicMaterial({ color: C.accent, transparent: true, opacity: 0, depthWrite: false }));
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(x, 0.12, z);
    world.add(ring);

    // Road from the depot to the site's gate (south side of the plot).
    const k = KIND[site.kind];
    const gate = new THREE.Vector3(x, 0, z + (k.d + 8) / 2 + 1.5);
    const mid = roadEnd.clone().lerp(gate, 0.5);
    const bend = (i % 2 ? 1 : -1) * (6 + rand() * 6);
    const dir = gate.clone().sub(roadEnd).normalize();
    mid.add(new THREE.Vector3(-dir.z * bend, 0, dir.x * bend));
    const road = new THREE.CatmullRomCurve3([roadEnd.clone(), roadEnd.clone().lerp(mid, 0.45), mid, gate.clone().add(new THREE.Vector3(0, 0, 6)), gate]);
    addRoad(road, 2.6, 0.075 + i * 0.002);

    occ.add(x, z, built.radius + 1);
    siteObjs.set(site.id, { site, group: built.group, top: built.top, anim: built.anim, hit, ring, road });
  });

  // ---- vehicles on the roads
  const vehicles = plan.vehicles
    .map((v, i) => {
      const so = siteObjs.get(v.siteId);
      if (!so) return null;
      const obj = truck(v.label);
      obj.scale.setScalar(0.8);
      world.add(obj);
      return { obj, curve: so.road, speed: v.speed, phase: i * 1.7 };
    })
    .filter(Boolean) as { obj: THREE.Group; curve: THREE.CatmullRomCurve3; speed: number; phase: number }[];
  // Two cars on the main road.
  const cars = [0, 1].map((i) => {
    const obj = new THREE.Group();
    obj.add(box(3.4, 0.9, 1.6, i ? '#3F6E8C' : '#C9C2B8', 0, 0.35, 0));
    obj.add(box(1.9, 0.7, 1.4, i ? '#3F6E8C' : '#C9C2B8', -0.2, 1.25, 0));
    obj.add(box(1.95, 0.5, 1.42, C.glass, -0.2, 1.3, 0));
    const wheels: THREE.BufferGeometry[] = [];
    for (const [x, z] of [
      [-1.1, 0.75],
      [-1.1, -0.75],
      [1.1, 0.75],
      [1.1, -0.75],
    ])
      wheels.push(new THREE.CylinderGeometry(0.38, 0.38, 0.3, 8).rotateX(Math.PI / 2).translate(x, 0.38, z));
    obj.add(merged(wheels, C.dark));
    world.add(obj);
    return { obj, curve: mainRoad, speed: 0.022 + i * 0.008, phase: i * 2.4 };
  });

  // ---- scenery: vineyards, a village, trees
  const vineyard = (cx: number, cz: number, w: number, d: number, angle: number) => {
    if (!occ.free(cx, cz, Math.max(w, d) / 2)) return;
    const g = new THREE.Group();
    g.add(mesh(boxGeo(w, 0.06, d, 0, 0, 0), '#BFA57F', false));
    const rows: THREE.BufferGeometry[] = [];
    for (let z = -d / 2 + 0.8; z < d / 2; z += 1.6) rows.push(boxGeo(w - 1, 0.9, 0.5, 0, 0, z));
    g.add(merged(rows, C.vine));
    g.position.set(cx, 0, cz);
    g.rotation.y = angle;
    world.add(g);
    occ.add(cx, cz, Math.max(w, d) / 2);
  };
  vineyard(-14, -26, 16, 10, 0.15);
  vineyard(12, -24, 14, 9, -0.1);
  vineyard(30, -22, 10, 8, 0.2);
  vineyard(-30, 4, 10, 9, 0.3);

  const houseAt = (x: number, z: number, s: number) => {
    if (!occ.free(x, z, 3.5 * s)) return false;
    const g = new THREE.Group();
    const w = 4.5 * s;
    const d = 3.8 * s;
    const h = 2.8 * s;
    g.add(box(w, h, d, rand() > 0.5 ? C.render : C.renderWarm, 0, 0, 0));
    const r = mesh(gableGeo(w, d, 1.8 * s, 0.4), rand() > 0.6 ? C.roofTile : C.roofGrey);
    r.position.y = h;
    g.add(r);
    g.add(box(0.8, 1.4, 0.05, C.woodDark, 0, 0, d / 2 + 0.02));
    g.position.set(x, 0, z);
    g.rotation.y = (rand() - 0.5) * 0.6;
    world.add(g);
    occ.add(x, z, 3.5 * s);
    return true;
  };
  for (const [cx, cz, n] of [
    [-24, 30, 6],
    [26, 30, 5],
    [62, 26, 4],
    [-62, 2, 3],
  ] as [number, number, number][]) {
    let placed = 0;
    for (let tries = 0; tries < 60 && placed < n; tries++) {
      if (houseAt(cx + (rand() - 0.5) * 16, cz + (rand() - 0.5) * 12, 0.85 + rand() * 0.35)) placed++;
    }
  }

  for (let i = 0, placed = 0; i < 900 && placed < 170; i++) {
    const x = (rand() - 0.5) * 144;
    const z = (rand() - 0.5) * 90;
    const s = 0.7 + rand() * 0.6;
    if (!occ.free(x, z, 1.8 * s)) continue;
    const pine = z < -18 || rand() > 0.7;
    const t = tree(pine ? 'pine' : 'leaf', s, pine ? C.pine : rand() > 0.5 ? C.leaf1 : C.leaf2);
    t.position.set(x, 0, z);
    t.rotation.y = rand() * Math.PI;
    world.add(t);
    occ.add(x, z, 1.4 * s);
    placed++;
  }

  // ---- labels
  const labels: { el: HTMLElement; pos: THREE.Vector3; id: string | null }[] = [];
  const pct = (n: number) => `${Math.round(n * 100)} %`;
  for (const so of siteObjs.values()) {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = `mq-label mq-st-${so.site.status}`;
    el.innerHTML = `<span class="mq-dot"></span><span class="mq-name"></span><span class="mq-pct"></span>`;
    (el.querySelector('.mq-name') as HTMLElement).textContent = so.site.name;
    (el.querySelector('.mq-pct') as HTMLElement).textContent = pct(so.site.progress);
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      handle.select(so.site.id);
      handle.focus(so.site.id);
    });
    labelLayer.appendChild(el);
    labels.push({ el, pos: new THREE.Vector3(so.site.pos[0], so.top, so.site.pos[1]), id: so.site.id });
  }
  // Initials over each worker, shown when their site is selected (who is where).
  const workerLabels: { el: HTMLElement; obj: THREE.Object3D; siteId: string }[] = [];
  for (const so of siteObjs.values()) {
    for (const w of so.anim.workers) {
      const el = document.createElement('div');
      el.className = 'mq-worker';
      el.textContent = w.person.initials;
      el.title = w.person.name;
      el.style.background = w.person.color;
      labelLayer.appendChild(el);
      workerLabels.push({ el, obj: w.obj, siteId: so.site.id });
    }
  }
  {
    const el = document.createElement('div');
    el.className = 'mq-label mq-depot';
    el.textContent = plan.depot.name;
    labelLayer.appendChild(el);
    labels.push({ el, pos: new THREE.Vector3(dx - 3, 11, dz - 3), id: null });
  }

  // ---- interaction
  let selected: string | null = null;
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const hits = [...siteObjs.values()].map((s) => s.hit);
  let down: { x: number; y: number } | null = null;
  let lastInteraction = performance.now();

  const pick = (ev: PointerEvent) => {
    const r = renderer.domElement.getBoundingClientRect();
    ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    const hit = raycaster.intersectObjects(hits, false)[0];
    return hit ? (hit.object.userData.siteId as string) : null;
  };
  const onDown = (ev: PointerEvent) => {
    down = { x: ev.clientX, y: ev.clientY };
    lastInteraction = performance.now();
    controls.autoRotate = false;
    tween = null;
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
    if (down) return;
    renderer.domElement.style.cursor = pick(ev) ? 'pointer' : 'grab';
  };
  const onWheel = () => {
    lastInteraction = performance.now();
    controls.autoRotate = false;
    tween = null;
  };
  renderer.domElement.addEventListener('pointerdown', onDown);
  renderer.domElement.addEventListener('pointerup', onUp);
  renderer.domElement.addEventListener('pointermove', onMove);
  renderer.domElement.addEventListener('wheel', onWheel, { passive: true });

  // Camera moves.
  let tween: { fromPos: THREE.Vector3; fromTarget: THREE.Vector3; toPos: THREE.Vector3; toTarget: THREE.Vector3; t0: number; dur: number } | null = null;
  const flyTo = (toPos: THREE.Vector3, toTarget: THREE.Vector3) => {
    tween = { fromPos: camera.position.clone(), fromTarget: controls.target.clone(), toPos, toTarget, t0: performance.now(), dur: 1100 };
    controls.autoRotate = false;
  };

  const resize = () => {
    renderer.setSize(width(), height());
    camera.aspect = width() / height();
    camera.updateProjectionMatrix();
  };
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
  ro?.observe(host);

  // ---- animation loop
  let animated = true;
  let simTime = 0;
  let last = performance.now();
  let raf = 0;
  const tmp = new THREE.Vector3();

  const placeOnCurve = (obj: THREE.Object3D, curve: THREE.Curve<THREE.Vector3>, u: number, forward: boolean, lane: number) => {
    const p = curve.getPointAt(THREE.MathUtils.clamp(u, 0, 1));
    const tan = curve.getTangentAt(THREE.MathUtils.clamp(u, 0, 1));
    if (!forward) tan.negate();
    const side = new THREE.Vector3(-tan.z, 0, tan.x).multiplyScalar(lane);
    obj.position.set(p.x + side.x, 0.08, p.z + side.z);
    obj.rotation.y = -Math.atan2(tan.z, tan.x);
  };

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
    } else if (!selected && now - lastInteraction > 20000 && animated) {
      controls.autoRotate = true;
    }
    controls.update();

    for (const so of siteObjs.values()) {
      for (const c of so.anim.cranes) {
        c.jib.rotation.y = Math.sin(t * 0.18 + c.phase) * 1.4 + c.phase;
        c.load.rotation.z = Math.sin(t * 1.3 + c.phase) * 0.04;
      }
      for (const a of so.anim.arms) a.arm.rotation.z = 0.25 + Math.sin(t * 0.9 + a.phase) * 0.35;
      for (const w of so.anim.workers) {
        if (w.walk) {
          const u = (1 - Math.cos(t * w.speed + w.phase)) / 2;
          w.obj.position.lerpVectors(w.a, w.b, u);
          const dir = Math.sin(t * w.speed + w.phase) >= 0 ? 1 : -1;
          tmp.subVectors(w.b, w.a).multiplyScalar(dir);
          w.obj.rotation.y = Math.atan2(tmp.x, tmp.z);
          w.obj.position.y = 0.08 + Math.abs(Math.sin(t * 6 + w.phase)) * 0.08;
        } else {
          w.obj.rotation.y = w.phase + Math.sin(t * 0.7 + w.phase) * 0.6;
          w.obj.position.y = 0.08 + Math.max(0, Math.sin(t * 4 + w.phase)) * 0.05;
        }
      }
      const ringMat = so.ring.material as THREE.MeshBasicMaterial;
      const target = selected === so.site.id ? 0.55 + Math.sin(now / 300) * 0.2 : 0;
      ringMat.opacity += (target - ringMat.opacity) * 0.15;
    }

    for (const v of [...vehicles, ...cars]) {
      const ph = t * v.speed * Math.PI * 2 + v.phase;
      const u = (1 - Math.cos(ph)) / 2;
      const forward = Math.sin(ph) >= 0;
      placeOnCurve(v.obj, v.curve, u, forward, 0.7);
    }

    const bt = t * 0.05;
    boat.position.set(lake.x + Math.cos(bt) * lake.rx * 0.55, 0.12, lake.z + Math.sin(bt) * lake.rz * 0.5);
    boat.rotation.y = -bt - Math.PI / 2;

    renderer.render(scene, camera);

    // Labels follow their anchor on screen.
    const w = width();
    const h = height();
    for (const l of labels) {
      tmp.copy(l.pos).project(camera);
      const visible = tmp.z < 1 && tmp.x > -1.2 && tmp.x < 1.2 && tmp.y > -1.2 && tmp.y < 1.2;
      l.el.style.display = visible ? '' : 'none';
      if (!visible) continue;
      const x = (tmp.x * 0.5 + 0.5) * w;
      const y = (-tmp.y * 0.5 + 0.5) * h;
      l.el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -100%)`;
      l.el.style.zIndex = String(1000 - Math.round(tmp.z * 1000));
      l.el.classList.toggle('mq-on', l.id !== null && l.id === selected);
      l.el.classList.toggle('mq-dim', selected !== null && l.id !== selected);
    }
    for (const wl of workerLabels) {
      if (wl.siteId !== selected) {
        wl.el.style.display = 'none';
        continue;
      }
      wl.obj.getWorldPosition(tmp);
      tmp.y += 4.2;
      tmp.project(camera);
      if (tmp.z >= 1) {
        wl.el.style.display = 'none';
        continue;
      }
      wl.el.style.display = '';
      wl.el.style.transform = `translate(${((tmp.x * 0.5 + 0.5) * w).toFixed(1)}px, ${((-tmp.y * 0.5 + 0.5) * h).toFixed(1)}px) translate(-50%, -100%)`;
    }
  };
  raf = requestAnimationFrame(frame);

  const handle: MaquetteHandle = {
    select(id) {
      selected = id;
      lastInteraction = performance.now();
      controls.autoRotate = false;
      opts.onSelect(id);
    },
    focus(id) {
      if (!id) return;
      const so = siteObjs.get(id);
      if (!so) return;
      const site = new THREE.Vector3(so.site.pos[0], 3, so.site.pos[1]);
      const dir = camera.position.clone().sub(controls.target).normalize();
      // Look down steeply enough that a taller neighbour doesn't hide the site.
      dir.y = Math.max(dir.y, 0.85);
      dir.normalize();
      // On wide screens the site card covers the right side: aim a little to
      // the right of the site so it sits in the free part of the view.
      const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), dir).normalize();
      const target = camera.aspect > 1.2 ? site.clone().add(right.multiplyScalar(-14)) : site;
      const dist = camera.aspect < 1 ? 150 : 100;
      flyTo(target.clone().add(dir.multiplyScalar(dist)), target);
    },
    reset() {
      handle.select(null);
      flyTo(homePos(), HOME.target.clone());
    },
    setAnimated(on) {
      animated = on;
      if (!on) controls.autoRotate = false;
    },
    dispose() {
      cancelAnimationFrame(raf);
      ro?.disconnect();
      renderer.domElement.removeEventListener('pointerdown', onDown);
      renderer.domElement.removeEventListener('pointerup', onUp);
      renderer.domElement.removeEventListener('pointermove', onMove);
      renderer.domElement.removeEventListener('wheel', onWheel);
      controls.dispose();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
      });
      materialCache.forEach((m) => m.dispose());
      materialCache.clear();
      renderer.dispose();
      renderer.domElement.remove();
      labelLayer.remove();
    },
  };
  return handle;
}
