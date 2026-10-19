import * as THREE from 'three';
import { CH_DOTS, decodeMask, LAND_DOTS } from './globeData';

// Cantia Panorama on the dashboard: the planet, drawn in dots like a
// Shopify Live View. It spins, slows down when Switzerland comes round,
// dives in until the country fills the view (lit up, with every project as a
// little beam of light, linked to the head office by arcs that carry
// pulses), drifts there for a while, pulls back out and spins again.
//
// Plain three.js, no React: it runs inside components/relief/PanoramaGlobeDom.tsx.

export type GlobeStatus = 'ok' | 'risk' | 'late' | 'done';

export interface GlobePoint {
  id: string;
  lat: number;
  lon: number;
  status: GlobeStatus;
  /** People planned there today. */
  crew: number;
}

export interface GlobeHandle {
  update(points: GlobePoint[], hq: { lat: number; lon: number } | null): void;
  setInsets(insets: { bottom?: number }): void;
  dispose(): void;
}

const STATUS: Record<GlobeStatus, string> = { ok: '#7FD6B0', risk: '#F2B33D', late: '#FF6B5B', done: '#8E97A6' };
const DEG = Math.PI / 180;
const BERN = { lat: 46.948, lon: 7.447 };

/** Unit vector of a place, lon 0 facing +z. */
function dir(lat: number, lon: number, r = 1) {
  const la = lat * DEG;
  const lo = lon * DEG;
  return new THREE.Vector3(Math.cos(la) * Math.sin(lo) * r, Math.sin(la) * r, Math.cos(la) * Math.cos(lo) * r);
}

function dotTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 32;
  const g = c.getContext('2d')!;
  g.beginPath();
  g.arc(16, 16, 13, 0, Math.PI * 2);
  g.fillStyle = '#FFFFFF';
  g.fill();
  return new THREE.CanvasTexture(c);
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

export function createGlobe(host: HTMLElement, opts: { accent: string; points: GlobePoint[]; hq: { lat: number; lon: number } | null; still?: boolean }): GlobeHandle {
  const width = () => host.clientWidth || 800;
  const height = () => host.clientHeight || 400;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(width(), height());
  Object.assign(renderer.domElement.style, { display: 'block', width: '100%', height: '100%' });
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, width() / height(), 0.01, 100);
  let bottomInset = 0;

  const earth = new THREE.Group();
  scene.add(earth);

  // The ball itself, dark, a little lighter towards the rim.
  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(0.994, 96, 64),
    new THREE.ShaderMaterial({
      uniforms: { a: { value: new THREE.Color('#0D182B') }, b: { value: new THREE.Color('#2A4675') } },
      vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
      fragmentShader: 'uniform vec3 a; uniform vec3 b; varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1.0 - max(dot(vN, vV), 0.0), 1.8); gl_FragColor = vec4(mix(a, b, f), 1.0); }',
    }),
  );
  earth.add(ball);

  // Land as dots; Switzerland as a denser, lit patch.
  const dotTex = dotTexture();
  const land = decodeMask(LAND_DOTS);
  const landPos: number[] = [];
  for (const [lat, lon] of land) {
    const v = dir(lat, lon, 1.001);
    landPos.push(v.x, v.y, v.z);
  }
  const landGeo = new THREE.BufferGeometry();
  landGeo.setAttribute('position', new THREE.Float32BufferAttribute(landPos, 3));
  const landMat = new THREE.PointsMaterial({ color: '#7890B8', size: 2, sizeAttenuation: false, map: dotTex, transparent: true, alphaTest: 0.4, depthWrite: false });
  earth.add(new THREE.Points(landGeo, landMat));

  const chPos: number[] = [];
  for (const [lat, lon] of decodeMask(CH_DOTS)) {
    const v = dir(lat, lon, 1.0015);
    chPos.push(v.x, v.y, v.z);
  }
  const chGeo = new THREE.BufferGeometry();
  chGeo.setAttribute('position', new THREE.Float32BufferAttribute(chPos, 3));
  const chMat = new THREE.PointsMaterial({ color: '#F4E6CF', size: 2, sizeAttenuation: false, map: dotTex, transparent: true, alphaTest: 0.4, depthWrite: false });
  earth.add(new THREE.Points(chGeo, chMat));

  // Atmosphere.
  const atmo = new THREE.Mesh(
    new THREE.SphereGeometry(1.12, 64, 48),
    new THREE.ShaderMaterial({
      uniforms: { c: { value: new THREE.Color('#4E8BF0') } },
      vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
      fragmentShader: 'uniform vec3 c; varying vec3 vN; varying vec3 vV; void main(){ float i = pow(clamp(0.68 - dot(vN, vec3(0.0, 0.0, 1.0)), 0.0, 1.0), 2.4); gl_FragColor = vec4(c * i * 1.3, i); }',
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    }),
  );
  scene.add(atmo);

  // A few stars.
  const starPos: number[] = [];
  for (let i = 0; i < 700; i++) {
    const v = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize().multiplyScalar(30 + Math.random() * 20);
    starPos.push(v.x, v.y, v.z);
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
  const starMat = new THREE.PointsMaterial({ color: '#8EA3C7', size: 1.2, sizeAttenuation: false, transparent: true, opacity: 0.55, depthWrite: false });
  scene.add(new THREE.Points(starGeo, starMat));

  // ---- the company: head office, projects, arcs, pulses
  const glowTex = glowTexture();
  let marks = new THREE.Group();
  earth.add(marks);
  type Pulse = { sprite: THREE.Sprite; curve: THREE.QuadraticBezierCurve3; u: number; speed: number };
  let pulses: Pulse[] = [];
  let rings: { mesh: THREE.Mesh; phase: number; scale: number }[] = [];
  let beams: { mesh: THREE.Mesh; phase: number }[] = [];
  let hqDir = dir(BERN.lat, BERN.lon);
  let beacon: THREE.Sprite | null = null;

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
      const mat = m.material as THREE.Material | undefined;
      mat?.dispose();
    });
  }

  function build(points: GlobePoint[], hq: { lat: number; lon: number } | null) {
    disposeMarks();
    marks = new THREE.Group();
    earth.add(marks);
    pulses = [];
    rings = [];
    beams = [];
    const h = hq ?? BERN;
    hqDir = dir(h.lat, h.lon);

    // Head office: a white beacon with a slow ring.
    const hqPos = dir(h.lat, h.lon, 1.002);
    const hqGlow = sprite('#FFFFFF', 0.0035);
    hqGlow.position.copy(hqPos);
    marks.add(hqGlow);
    const ringGeo = new THREE.RingGeometry(0.8, 1, 48);
    const addRing = (at: THREE.Vector3, color: string, scale: number, phase: number) => {
      const ring = new THREE.Mesh(ringGeo.clone(), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.6, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
      ring.position.copy(at);
      ring.lookAt(at.clone().multiplyScalar(2));
      marks.add(ring);
      rings.push({ mesh: ring, phase, scale });
    };
    addRing(hqPos, '#FFFFFF', 0.006, 0);
    // Seen from far away, the whole company glows as one warm light.
    beacon = sprite('#FFD9A8', 0.09, 0.9);
    beacon.position.copy(dir(h.lat, h.lon, 1.01));
    marks.add(beacon);

    points.forEach((p, i) => {
      // Unknown or identical place: spread a little around it, always the same way.
      const j = hash(p.id);
      const k = hash(`${p.id}·`);
      const near = Math.abs(p.lat - h.lat) < 0.01 && Math.abs(p.lon - h.lon) < 0.01;
      const lat = p.lat + (near ? (j - 0.5) * 0.35 : (j - 0.5) * 0.02);
      const lon = p.lon + (near ? (k - 0.5) * 0.5 : (k - 0.5) * 0.02);
      const base = dir(lat, lon, 1.001);
      const color = STATUS[p.status];
      // A beam of light standing on the place.
      const len = p.status === 'done' ? 0.002 : 0.004 + Math.min(3, p.crew) * 0.0015;
      const beam = new THREE.Mesh(
        new THREE.CylinderGeometry(0.00018, 0.00035, len, 6, 1, true).translate(0, len / 2, 0),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending }),
      );
      beam.position.copy(base);
      beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), base.clone().normalize());
      marks.add(beam);
      beams.push({ mesh: beam, phase: i * 0.7 });
      const head = sprite(color, 0.0026);
      head.position.copy(base.clone().normalize().multiplyScalar(1.001 + len));
      marks.add(head);
      if (p.crew > 0 || p.status === 'late') addRing(base, color, 0.004, i * 0.9);

      // The arc from the head office, with pulses running out.
      const mid = hqPos.clone().add(base).multiplyScalar(0.5);
      const d = hqPos.distanceTo(base);
      const ctrl = mid.normalize().multiplyScalar(1.001 + Math.max(0.004, d * 0.45));
      const curve = new THREE.QuadraticBezierCurve3(hqPos.clone(), ctrl, base.clone());
      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(curve.getPoints(40)),
        new THREE.LineBasicMaterial({ color: opts.accent, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending }),
      );
      marks.add(line);
      if (p.status !== 'done') {
        const s = sprite(color, 0.0018);
        marks.add(s);
        pulses.push({ sprite: s, curve, u: j, speed: 0.25 + k * 0.25 });
      }
    });
  }
  build(opts.points, opts.hq);

  // ---- camera story: spin, dive into Switzerland, drift, pull back
  type Phase = 'spin' | 'in' | 'hold' | 'out';
  let phase: Phase = 'spin';
  let phaseT = 0;
  let spun = 0;
  // Start with Switzerland about to come round.
  let theta = -Math.atan2(hqDir.x, hqDir.z) - 1.3;
  let spin = 0.24;
  const SPIN = 0.24;
  const DRIFT = 0.012;
  const IN = 2.8;
  const HOLD = 9;
  const OUT = 2.6;
  const ease = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
  const tmp = new THREE.Vector3();
  const look = new THREE.Vector3();

  const planetView = (out: { pos: THREE.Vector3; target: THREE.Vector3 }) => {
    // Far enough for the whole ball (and its glow) to fit in the free area.
    const h = height();
    const fit = (1.16 * h) / (Math.tan((camera.fov * DEG) / 2) * Math.max(1, Math.min(h - bottomInset, width())));
    out.pos.set(0, Math.sin(24 * DEG), Math.cos(24 * DEG)).multiplyScalar(fit);
    out.target.set(0, 0.06, 0);
  };
  const closeView = (out: { pos: THREE.Vector3; target: THREE.Vector3 }) => {
    // Above Switzerland, looking down at it from the south.
    const p = hqDir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), theta);
    const north = new THREE.Vector3(0, 1, 0).sub(p.clone().multiplyScalar(p.y)).normalize();
    out.target.copy(p).add(north.clone().multiplyScalar(0.004));
    // Further back on a narrow card, so the whole country fits across.
    const back = THREE.MathUtils.clamp(760 / width(), 1, 2.2);
    out.pos.copy(p).multiplyScalar(1 + 0.068 * back).add(north.clone().multiplyScalar(-0.05 * back));
  };
  const a = { pos: new THREE.Vector3(), target: new THREE.Vector3() };
  const b = { pos: new THREE.Vector3(), target: new THREE.Vector3() };

  const resize = () => {
    renderer.setSize(width(), height());
    camera.aspect = width() / height();
    camera.updateProjectionMatrix();
  };
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
  ro?.observe(host);

  let raf = 0;
  let last = performance.now();
  let t = 0;
  const still = !!opts.still;
  const frame = () => {
    raf = requestAnimationFrame(frame);
    const now = performance.now();
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    t += dt;
    phaseT += dt;

    // Where the head office faces now, against the camera (0 = in front).
    const front = (((-Math.atan2(hqDir.x, hqDir.z) - theta) % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2) - Math.PI;
    if (!still) {
      if (phase === 'spin') {
        spin += (SPIN - spin) * Math.min(1, dt * 2);
        if (spun > 2.5 && front > 0.3 && front < 0.75) {
          phase = 'in';
          phaseT = 0;
        }
      } else if (phase === 'in') {
        // Slow down so that Switzerland arrives just in front.
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
    } else {
      theta = -Math.atan2(hqDir.x, hqDir.z);
    }
    earth.rotation.y = theta;

    planetView(a);
    closeView(b);
    let k = 0;
    if (still) k = 0.75;
    else if (phase === 'in') k = ease(Math.min(1, phaseT / IN));
    else if (phase === 'hold') k = 1;
    else if (phase === 'out') k = 1 - ease(Math.min(1, phaseT / OUT));
    camera.position.lerpVectors(a.pos, b.pos, k);
    look.lerpVectors(a.target, b.target, k);
    camera.lookAt(look);
    camera.setViewOffset(width(), height(), 0, bottomInset / 2, width(), height());

    // Dots keep about the same size on screen, a little bigger close up.
    const dist = Math.max(0.05, camera.position.length() - 1);
    const ppu = height() / (2 * dist * Math.tan((camera.fov * DEG) / 2));
    landMat.size = THREE.MathUtils.clamp(ppu * 0.0042, 1.4, 4.2) * Math.min(2, renderer.getPixelRatio()) * 0.75;
    chMat.size = THREE.MathUtils.clamp(ppu * 0.0006, 1.2, 3.2) * Math.min(2, renderer.getPixelRatio()) * 0.75;

    if (beacon) (beacon.material as THREE.SpriteMaterial).opacity = 0.9 * (1 - k) * (0.8 + 0.2 * Math.sin(t * 2));
    for (const r of rings) {
      const u = ((t * 0.6 + r.phase) % 1.6) / 1.6;
      r.mesh.scale.setScalar(r.scale * (0.2 + u));
      (r.mesh.material as THREE.MeshBasicMaterial).opacity = (1 - u) * 0.7;
    }
    for (const bm of beams) (bm.mesh.material as THREE.MeshBasicMaterial).opacity = 0.65 + 0.3 * Math.sin(t * 2.4 + bm.phase);
    for (const p of pulses) {
      p.u = (p.u + dt * p.speed) % 1;
      p.curve.getPoint(p.u, tmp);
      p.sprite.position.copy(tmp);
      (p.sprite.material as THREE.SpriteMaterial).opacity = Math.sin(p.u * Math.PI);
    }
    renderer.render(scene, camera);
  };
  raf = requestAnimationFrame(frame);

  return {
    update(points, hq) {
      build(points, hq);
    },
    setInsets(next) {
      bottomInset = next.bottom ?? 0;
    },
    dispose() {
      cancelAnimationFrame(raf);
      ro?.disconnect();
      disposeMarks();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose();
        (m.material as THREE.Material | undefined)?.dispose?.();
      });
      dotTex.dispose();
      glowTex.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
