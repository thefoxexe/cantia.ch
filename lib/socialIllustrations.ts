// Canvas2D isometric illustration system shared by generateInstagram/
// generateLinkedin in socialPostGenerator.ts — a TypeScript port of the
// illustration language built for the paid-ad creatives (same 2:1 dimetric
// projection, same flat-silhouette worker figure, same floating device-card
// convention), so organic posts and paid ads read as one visual system.
//
// Each SCENES[key] draws only the ground/props for its topic; the caller
// (socialPostGenerator.ts) positions the device card/badge and worker
// figure per format, exactly mirroring the ad generator's structure.

const INK = '#231A12';
const MUTED = '#6E6153';
const PRIMARY = '#BC5A31';
const PRIMARY_DARK = '#7C3B21';
const PRIMARY_SOFT = '#F5DECB';
const ACCENT = '#D97B41';
const ACCENT_SOFT = '#F6E4D2';
const MOSS = '#5C7A5C';
const SLATE = '#3F5D7D';
const SUCCESS = '#2E6B4F';
const SURFACE = '#FFFFFF';
const BORDER = '#E6D8C2';

export type SocialScene =
  | 'devis'
  | 'chantier'
  | 'facture'
  | 'equipe'
  | 'rentabilite'
  | 'signature'
  | 'essai'
  | 'planning'
  | 'tresorerie'
  | 'sousTraitants'
  | 'rapportChantier'
  | 'situations'
  | 'donneesImport'
  | 'dashboard'
  | 'meteo'
  | 'support'
  | 'multiDevice';

export const SOCIAL_SCENES: { key: SocialScene; label: string }[] = [
  { key: 'devis', label: 'Devis à la voix (micro)' },
  { key: 'chantier', label: 'Chantier & suivi (grue)' },
  { key: 'facture', label: 'Facturation / QR-facture' },
  { key: 'equipe', label: 'Équipe / RH' },
  { key: 'rentabilite', label: 'Rentabilité / finances' },
  { key: 'signature', label: 'Signature électronique' },
  { key: 'essai', label: 'Marque / essai gratuit (drapeau)' },
  { key: 'planning', label: 'Planning chantiers (calendrier)' },
  { key: 'tresorerie', label: 'Trésorerie / prévisionnel' },
  { key: 'sousTraitants', label: 'Sous-traitants (camion)' },
  { key: 'rapportChantier', label: 'Rapport de chantier (photos)' },
  { key: 'situations', label: 'Situations de chantier (%)' },
  { key: 'donneesImport', label: 'Import de données' },
  { key: 'dashboard', label: 'Tableau de bord (KPI)' },
  { key: 'meteo', label: 'Météo chantier' },
  { key: 'support', label: 'Support / aide' },
  { key: 'multiDevice', label: 'Bureau + chantier synchronisés' },
];

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function rgbToHex(r: number, g: number, b: number): string {
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}
function mix(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  return rgbToHex(ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t);
}
function lighten(hex: string, t: number): string {
  return mix(hex, '#FFFFFF', t);
}
function darken(hex: string, t: number): string {
  return mix(hex, '#000000', t);
}

// -------------------------------------------------------------- iso engine
// 2:1 dimetric projection — same deliberate flat-illustration geometry as
// the ad creatives (not literal 30° isometric).
export class Iso {
  constructor(
    public ox: number,
    public oy: number,
    public tile = 60,
    public zh = 32,
  ) {}
  project(x: number, y: number, z: number): [number, number] {
    return [this.ox + (x - y) * (this.tile / 2), this.oy + (x + y) * (this.tile / 4) - z * this.zh];
  }
}

function fillPoly(ctx: CanvasRenderingContext2D, pts: [number, number][], fill: string) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill: string) {
  roundRectPath(ctx, x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
}

function circle(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, fill: string) {
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

// Axis-aligned iso box: fills top/left/right faces with a 3-value shade.
function isoBox(ctx: CanvasRenderingContext2D, iso: Iso, gx: number, gy: number, w: number, d: number, h: number, color: string, z0 = 0) {
  const P = (x: number, y: number, z: number) => iso.project(x, y, z);
  const top = lighten(color, 0.34);
  const left = color;
  const right = darken(color, 0.22);
  fillPoly(ctx, [P(gx, gy, z0 + h), P(gx + w, gy, z0 + h), P(gx + w, gy + d, z0 + h), P(gx, gy + d, z0 + h)], top);
  fillPoly(ctx, [P(gx, gy + d, z0 + h), P(gx + w, gy + d, z0 + h), P(gx + w, gy + d, z0), P(gx, gy + d, z0)], left);
  fillPoly(ctx, [P(gx + w, gy, z0 + h), P(gx + w, gy + d, z0 + h), P(gx + w, gy + d, z0), P(gx + w, gy, z0)], right);
}

function groundPlinth(ctx: CanvasRenderingContext2D, iso: Iso, w = 7.4, d = 4.6, h = 0.55, color = PRIMARY_SOFT) {
  isoBox(ctx, iso, -w / 2, -d / 2, w, d, h, color);
}

function bush(ctx: CanvasRenderingContext2D, iso: Iso, gx: number, gy: number, color = MOSS) {
  const [cx, cy] = iso.project(gx, gy, 0.55);
  circle(ctx, cx - 10, cy - 14, 16, lighten(color, 0.1));
  circle(ctx, cx + 10, cy - 16, 18, color);
  circle(ctx, cx, cy - 26, 15, lighten(color, 0.22));
}

function crane(ctx: CanvasRenderingContext2D, iso: Iso, gx: number, gy: number, mastH = 3.0, color = SLATE) {
  const [bx, by] = iso.project(gx, gy, 0.55);
  const [tx, ty] = iso.project(gx, gy, mastH);
  fillPoly(
    ctx,
    [
      [bx - 13, by],
      [tx - 7, ty],
      [tx + 7, ty],
      [bx + 13, by],
    ],
    color,
  );
  const jibY = ty - 6;
  const jibLeft = tx - 150;
  const jibRight = tx + 90;
  rr(ctx, jibLeft, jibY - 9, jibRight - jibLeft, 18, 6, color);
  rr(ctx, tx - 20, jibY - 9, 40, 30, 6, darken(color, 0.15));
  rr(ctx, jibRight - 34, jibY + 9, 34, 20, 4, darken(color, 0.1));
  const hookX = jibLeft + 30;
  const hookY = jibY + 74;
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(hookX, jibY + 9);
  ctx.lineTo(hookX, hookY);
  ctx.stroke();
  rr(ctx, hookX - 12, hookY, 24, 16, 3, PRIMARY);
}

export function swissCross(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, bg: string | null = PRIMARY, cross = '#FFFFFF') {
  const bar = size * 0.34;
  const arm = size * 0.62;
  if (bg) rr(ctx, cx - size / 2, cy - size / 2, size, size, size * 0.22, bg);
  rr(ctx, cx - bar / 2, cy - arm / 2, bar, arm, bar * 0.18, cross);
  rr(ctx, cx - arm / 2, cy - bar / 2, arm, bar, bar * 0.18, cross);
}

function truck(ctx: CanvasRenderingContext2D, iso: Iso, gx: number, gy: number, color = SLATE) {
  isoBox(ctx, iso, gx, gy, 1.5, 0.85, 0.62, color);
  isoBox(ctx, iso, gx + 1.5, gy + 0.1, 0.62, 0.62, 0.82, darken(color, 0.08));
  [
    [gx + 0.35, gy + 0.85],
    [gx + 1.15, gy + 0.85],
    [gx + 1.85, gy + 0.65],
  ].forEach(([wx, wy]) => {
    const [px, py] = iso.project(wx, wy, 0);
    circle(ctx, px, py + 4, 16, INK);
    circle(ctx, px, py + 4, 7, MUTED);
  });
}

function materialStack(ctx: CanvasRenderingContext2D, iso: Iso, gx: number, gy: number, color = ACCENT) {
  const s = 0.42;
  const gap = 0.04;
  for (let layer = 0; layer < 2; layer++) {
    for (let i = 0; i < 3; i++) {
      isoBox(ctx, iso, gx + i * (s + gap), gy, s, s, 0.26, layer === 1 ? lighten(color, 0.14) : color, layer * 0.26);
    }
  }
}

function isoTopGrid(ctx: CanvasRenderingContext2D, iso: Iso, gx: number, gy: number, w: number, d: number, h: number, cols: number, rows: number, lineColor: string) {
  const P = (x: number, y: number) => iso.project(x, y, h);
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 1.4;
  for (let c = 1; c < cols; c++) {
    const t = c / cols;
    const [x1, y1] = P(gx + w * t, gy);
    const [x2, y2] = P(gx + w * t, gy + d);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  for (let r = 1; r < rows; r++) {
    const t = r / rows;
    const [x1, y1] = P(gx, gy + d * t);
    const [x2, y2] = P(gx + w, gy + d * t);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
}

function isoTopCellCenter(iso: Iso, gx: number, gy: number, w: number, d: number, h: number, cols: number, rows: number, c: number, r: number): [number, number] {
  return iso.project(gx + (w * (c + 0.5)) / cols, gy + (d * (r + 0.5)) / rows, h);
}

function laptop(ctx: CanvasRenderingContext2D, iso: Iso, gx: number, gy: number, color = SLATE) {
  isoBox(ctx, iso, gx, gy, 1.0, 0.62, 0.07, darken(color, 0.05));
  const [hx, hy] = iso.project(gx + 0.05, gy + 0.06, 0.07);
  ctx.save();
  ctx.translate(hx, hy);
  ctx.rotate((-6 * Math.PI) / 180);
  rr(ctx, -8, -118, 96, 118, 10, INK);
  rr(ctx, -1, -110, 84, 100, 4, lighten(color, 0.55));
  ctx.restore();
}

function miniPhone(ctx: CanvasRenderingContext2D, iso: Iso, gx: number, gy: number, rotateDeg = -8) {
  const [px, py] = iso.project(gx, gy, 0.55);
  ctx.save();
  ctx.translate(px, py);
  ctx.rotate((rotateDeg * Math.PI) / 180);
  ctx.shadowColor = 'rgba(35,26,18,0.16)';
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 8;
  rr(ctx, -26, -96, 52, 96, 12, SURFACE);
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = BORDER;
  ctx.lineWidth = 3;
  roundRectPath(ctx, -26, -96, 52, 96, 12);
  ctx.stroke();
  rr(ctx, -18, -84, 36, 56, 5, PRIMARY_SOFT);
  circle(ctx, 0, -18, 5, PRIMARY);
  ctx.restore();
}

function cloudPuff(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale = 1, color = SURFACE) {
  circle(ctx, cx - 16 * scale, cy, 14 * scale, color);
  circle(ctx, cx + 14 * scale, cy - 2 * scale, 16 * scale, color);
  circle(ctx, cx, cy - 10 * scale, 13 * scale, color);
}

function sunGlyph(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color = ACCENT) {
  circle(ctx, cx, cy, r, color);
  ctx.strokeStyle = color;
  ctx.lineWidth = r * 0.16;
  ctx.lineCap = 'round';
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const x1 = cx + Math.cos(a) * r * 1.35;
    const y1 = cy + Math.sin(a) * r * 1.35;
    const x2 = cx + Math.cos(a) * r * 1.75;
    const y2 = cy + Math.sin(a) * r * 1.75;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
}

function ringGauge(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, pct: number, color: string, trackColor = ACCENT_SOFT) {
  ctx.lineWidth = r * 0.22;
  ctx.lineCap = 'round';
  ctx.strokeStyle = trackColor;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pct);
  ctx.stroke();
}

function checkBadge(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color = SUCCESS) {
  circle(ctx, cx, cy, r, color);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = r * 0.22;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.42, cy);
  ctx.lineTo(cx - r * 0.12, cy + r * 0.32);
  ctx.lineTo(cx + r * 0.46, cy - r * 0.38);
  ctx.stroke();
}

function syncGlyph(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color = SUCCESS) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(cx, cy, r, -0.15 * Math.PI, 1.1 * Math.PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0.85 * Math.PI, 1.9 * Math.PI);
  ctx.stroke();
  const a1 = -0.15 * Math.PI;
  const ax1 = cx + r * Math.cos(a1);
  const ay1 = cy + r * Math.sin(a1);
  fillPoly(
    ctx,
    [
      [ax1 - 8, ay1 - 2],
      [ax1 + 6, ay1 - 8],
      [ax1 + 2, ay1 + 8],
    ],
    color,
  );
  const a2 = 0.85 * Math.PI;
  const ax2 = cx + r * Math.cos(a2);
  const ay2 = cy + r * Math.sin(a2);
  fillPoly(
    ctx,
    [
      [ax2 + 8, ay2 + 2],
      [ax2 - 6, ay2 + 8],
      [ax2 - 2, ay2 - 8],
    ],
    color,
  );
}

// ------------------------------------------------------------- worker figure
export function workerFigure(
  ctx: CanvasRenderingContext2D,
  cx: number,
  baseY: number,
  scale = 1,
  opts: { hatColor?: string; bodyColor?: string; prop?: 'phone' | 'stylus' | 'none' } = {},
) {
  const hatColor = opts.hatColor ?? PRIMARY;
  const bodyColor = opts.bodyColor ?? INK;
  const prop = opts.prop ?? 'phone';
  ctx.save();
  ctx.translate(cx, baseY);
  ctx.scale(scale, scale);
  rr(ctx, -30, -108, 22, 108, 10, bodyColor);
  rr(ctx, 10, -108, 22, 108, 10, bodyColor);
  rr(ctx, -40, -230, 80, 132, 22, bodyColor);
  rr(ctx, -40, -178, 80, 14, 4, ACCENT);
  ctx.strokeStyle = bodyColor;
  ctx.lineWidth = 26;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(28, -214);
  ctx.bezierCurveTo(74, -224, 86, -256, 84, -292);
  ctx.stroke();
  ctx.lineWidth = 24;
  ctx.beginPath();
  ctx.moveTo(-30, -206);
  ctx.bezierCurveTo(-58, -186, -62, -150, -54, -120);
  ctx.stroke();
  circle(ctx, 0, -260, 34, bodyColor);
  ctx.beginPath();
  ctx.ellipse(0, -270, 36, 30, 0, Math.PI, 0, true);
  ctx.fillStyle = hatColor;
  ctx.fill();
  rr(ctx, -42, -272, 84, 12, 6, hatColor);
  if (prop === 'phone') {
    rr(ctx, 70, -330, 34, 58, 8, SURFACE);
    ctx.strokeStyle = BORDER;
    ctx.lineWidth = 3;
    roundRectPath(ctx, 70, -330, 34, 58, 8);
    ctx.stroke();
    rr(ctx, 78, -320, 18, 30, 3, PRIMARY_SOFT);
    circle(ctx, 87, -300, 3.5, PRIMARY);
  } else if (prop === 'stylus') {
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(72, -296);
    ctx.lineTo(98, -322);
    ctx.stroke();
    circle(ctx, 100, -324, 5, PRIMARY);
  }
  ctx.restore();
}

// -------------------------------------------------------------- device card
export function deviceCard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  rotateDeg: number,
  drawContent: (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => void,
) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((rotateDeg * Math.PI) / 180);
  ctx.translate(-cx, -cy);
  ctx.shadowColor = 'rgba(35,26,18,0.18)';
  ctx.shadowBlur = 22;
  ctx.shadowOffsetY = 14;
  roundRectPath(ctx, x, y, w, h, 26);
  ctx.fillStyle = SURFACE;
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = BORDER;
  ctx.lineWidth = 2;
  roundRectPath(ctx, x, y, w, h, 26);
  ctx.stroke();
  drawContent(ctx, x, y, w, h);
  ctx.restore();
}

export function stampBadge(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, rotateDeg: number, big: string, small: string) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((rotateDeg * Math.PI) / 180);
  ctx.shadowColor = 'rgba(35,26,18,0.18)';
  ctx.shadowBlur = 22;
  ctx.shadowOffsetY = 14;
  circle(ctx, 0, 0, r, PRIMARY);
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = PRIMARY_SOFT;
  ctx.lineWidth = 3;
  ctx.setLineDash([6, 10]);
  ctx.beginPath();
  ctx.arc(0, 0, r - 16, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.font = `900 ${r * 0.62}px "Helvetica Neue", Arial, sans-serif`;
  ctx.fillText(big, 0, r * 0.06);
  ctx.font = `700 ${r * 0.128}px "Helvetica Neue", Arial, sans-serif`;
  ctx.fillText(small, 0, r * 0.36);
  ctx.textAlign = 'left';
  ctx.restore();
}

// ------------------------------------------------------------ card content
export function micWaveformContent(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const cx = x + w / 2;
  circle(ctx, cx, y + h * 0.2, w * 0.14, PRIMARY_SOFT);
  rr(ctx, cx - w * 0.042, y + h * 0.12, w * 0.084, h * 0.15, w * 0.042, PRIMARY);
  ctx.fillRect(cx - w * 0.06, y + h * 0.2, w * 0.12, 4);
  ctx.strokeStyle = PRIMARY;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(cx, y + h * 0.175, w * 0.09, 0.15 * Math.PI, 0.85 * Math.PI, false);
  ctx.stroke();
  const barY = y + h * 0.44;
  const heights = [10, 22, 34, 18, 28, 14, 24, 12];
  const bw = 6;
  const gap = 8;
  const total = heights.length * (bw + gap) - gap;
  let bx = x + (w - total) / 2;
  for (const hh of heights) {
    rr(ctx, bx, barY - hh / 2, bw, hh, bw / 2, ACCENT);
    bx += bw + gap;
  }
  const rowY = y + h * 0.58;
  rr(ctx, x + 24, rowY, w - 48, 54, 14, ACCENT_SOFT);
  ctx.fillStyle = INK;
  ctx.font = '600 15px "Helvetica Neue", Arial, sans-serif';
  ctx.fillText('Facade Nord', x + 40, rowY + 24);
  ctx.fillStyle = MUTED;
  ctx.font = '400 13px "Helvetica Neue", Arial, sans-serif';
  ctx.fillText('Peinture + isolation', x + 40, rowY + 42);
  circle(ctx, x + w - 48, rowY + 27, 15, SUCCESS);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 3.4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(x + w - 55, rowY + 27);
  ctx.lineTo(x + w - 50, rowY + 33);
  ctx.lineTo(x + w - 41, rowY + 21);
  ctx.stroke();
}

export function progressContent(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const gap = 8;
  const pw = (w - 48 - gap) / 2;
  const ph = 64;
  const photos = [MOSS, SLATE, PRIMARY, ACCENT];
  photos.forEach((col, i) => {
    const px = x + 24 + (i % 2) * (pw + gap);
    const py = y + 30 + Math.floor(i / 2) * (ph + gap);
    rr(ctx, px, py, pw, ph, 12, lighten(col, 0.72));
    ctx.globalAlpha = 0.85;
    rr(ctx, px + 10, py + ph - 22, pw - 20, 12, 4, col);
    ctx.globalAlpha = 1;
  });
  const gy = y + 30 + 2 * ph + gap + 26;
  ctx.fillStyle = INK;
  ctx.font = '600 15px "Helvetica Neue", Arial, sans-serif';
  ctx.fillText('Facade Nord', x + 24, gy);
  ctx.fillStyle = PRIMARY;
  ctx.font = '700 15px "Helvetica Neue", Arial, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('72%', x + w - 24, gy);
  ctx.textAlign = 'left';
  const barY = gy + 14;
  rr(ctx, x + 24, barY, w - 48, 12, 6, ACCENT_SOFT);
  rr(ctx, x + 24, barY, (w - 48) * 0.72, 12, 6, PRIMARY);
  const cy2 = barY + 44;
  circle(ctx, x + 40, cy2, 16, SLATE);
  rr(ctx, x + 64, cy2 - 16, w - 64 - 24, 32, 12, '#F7F1E6');
  ctx.fillStyle = MUTED;
  ctx.font = '400 13px "Helvetica Neue", Arial, sans-serif';
  ctx.fillText('Coffrage terminé ✓', x + 78, cy2 + 5);
}

export function invoiceContent(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const pad = 24;
  ctx.fillStyle = MUTED;
  ctx.font = '700 12px "Helvetica Neue", Arial, sans-serif';
  ctx.fillText('QR-FACTURE', x + pad, y + 40);
  ctx.fillStyle = INK;
  ctx.font = '800 26px "Helvetica Neue", Arial, sans-serif';
  ctx.fillText('CHF 4’280.00', x + pad, y + 76);
  // masked reference line
  rr(ctx, x + pad, y + 96, w - pad * 2, 14, 6, '#F7F1E6');
  for (let i = 0; i < 6; i++) rr(ctx, x + pad + 10 + i * 22, y + 100, 14, 6, 2, BORDER);
  // small QR-like grid prop
  const qs = w * 0.24;
  const qx = x + w - pad - qs;
  const qy = y + h - pad - qs - 46;
  rr(ctx, qx, qy, qs, qs, 8, '#F7F1E6');
  const cell = qs / 5;
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      if ((r + c * 2) % 3 === 0) rr(ctx, qx + 4 + c * cell, qy + 4 + r * cell, cell - 4, cell - 4, 2, INK);
    }
  }
  const rowY = y + h - pad - 40;
  rr(ctx, x + pad, rowY, w - pad * 2 - qs - 12, 40, 14, ACCENT_SOFT);
  circle(ctx, x + pad + 20, rowY + 20, 13, SUCCESS);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(x + pad + 14, rowY + 20);
  ctx.lineTo(x + pad + 18, rowY + 25);
  ctx.lineTo(x + pad + 27, rowY + 14);
  ctx.stroke();
  ctx.fillStyle = SUCCESS;
  ctx.font = '700 14px "Helvetica Neue", Arial, sans-serif';
  ctx.fillText('Payée', x + pad + 42, rowY + 25);
}

export function payslipContent(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const pad = 24;
  circle(ctx, x + pad + 22, y + 50, 22, SLATE);
  ctx.fillStyle = '#fff';
  ctx.font = '700 16px "Helvetica Neue", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('JB', x + pad + 22, y + 56);
  ctx.textAlign = 'left';
  ctx.fillStyle = INK;
  ctx.font = '600 16px "Helvetica Neue", Arial, sans-serif';
  ctx.fillText('J. Bettex', x + pad + 56, y + 46);
  ctx.fillStyle = MUTED;
  ctx.font = '400 13px "Helvetica Neue", Arial, sans-serif';
  ctx.fillText('38.5 h cette semaine', x + pad + 56, y + 65);
  const rowY = y + 108;
  rr(ctx, x + pad, rowY, w - pad * 2, 64, 14, ACCENT_SOFT);
  ctx.fillStyle = MUTED;
  ctx.font = '600 12px "Helvetica Neue", Arial, sans-serif';
  ctx.fillText('SALAIRE NET', x + pad + 18, rowY + 26);
  ctx.fillStyle = INK;
  ctx.font = '800 24px "Helvetica Neue", Arial, sans-serif';
  ctx.fillText('CHF 5’240.00', x + pad + 18, rowY + 52);
  const chipY = y + 108 + 64 + 18;
  rr(ctx, x + pad, chipY, 108, 30, 15, '#F7F1E6');
  ctx.fillStyle = SUCCESS;
  ctx.font = '700 12px "Helvetica Neue", Arial, sans-serif';
  ctx.fillText('✓ Calculé', x + pad + 14, chipY + 20);
}

export function marginContent(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const pad = 24;
  ctx.fillStyle = MUTED;
  ctx.font = '700 12px "Helvetica Neue", Arial, sans-serif';
  ctx.fillText('MARGE — CHANTIER', x + pad, y + 40);
  ctx.fillStyle = SUCCESS;
  ctx.font = '900 42px "Helvetica Neue", Arial, sans-serif';
  ctx.fillText('+18%', x + pad, y + 84);
  ctx.fillStyle = INK;
  ctx.font = '600 15px "Helvetica Neue", Arial, sans-serif';
  ctx.fillText('CHF 12’400 de marge', x + pad, y + 108);
  // mini ascending bars
  const baseY = y + h - pad - 8;
  const bw = 20;
  const gap = 12;
  const heights = [22, 34, 48, 64];
  let bx = x + pad;
  heights.forEach((bh, i) => {
    rr(ctx, bx, baseY - bh, bw, bh, 5, i === heights.length - 1 ? PRIMARY : ACCENT_SOFT);
    bx += bw + gap;
  });
  ctx.strokeStyle = SUCCESS;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(bx + 6, baseY - heights[heights.length - 1] - 4);
  ctx.lineTo(bx + 18, baseY - heights[heights.length - 1] - 18);
  ctx.lineTo(bx + 10, baseY - heights[heights.length - 1] - 18);
  ctx.moveTo(bx + 18, baseY - heights[heights.length - 1] - 18);
  ctx.lineTo(bx + 18, baseY - heights[heights.length - 1] - 6);
  ctx.stroke();
}

export function signatureContent(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const pad = 24;
  ctx.fillStyle = MUTED;
  ctx.font = '700 12px "Helvetica Neue", Arial, sans-serif';
  ctx.fillText('TRAVAUX SUPPLÉMENTAIRES', x + pad, y + 38);
  ctx.fillStyle = INK;
  ctx.font = '600 15px "Helvetica Neue", Arial, sans-serif';
  ctx.fillText('Reprise étanchéité toiture', x + pad, y + 62);
  const lineY = y + h * 0.56;
  ctx.strokeStyle = BORDER;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + pad, lineY);
  ctx.lineTo(x + w - pad, lineY);
  ctx.stroke();
  ctx.strokeStyle = PRIMARY;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(x + pad + 4, lineY - 6);
  ctx.bezierCurveTo(x + pad + 30, lineY - 34, x + pad + 46, lineY + 14, x + pad + 74, lineY - 10);
  ctx.bezierCurveTo(x + pad + 96, lineY - 30, x + pad + 108, lineY, x + pad + 140, lineY - 8);
  ctx.stroke();
  const chipY = lineY + 20;
  rr(ctx, x + pad, chipY, 90, 30, 15, ACCENT_SOFT);
  circle(ctx, x + pad + 16, chipY + 15, 9, SUCCESS);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(x + pad + 12, chipY + 15);
  ctx.lineTo(x + pad + 15, chipY + 19);
  ctx.lineTo(x + pad + 21, chipY + 10);
  ctx.stroke();
  ctx.fillStyle = SUCCESS;
  ctx.font = '700 12px "Helvetica Neue", Arial, sans-serif';
  ctx.fillText('Signé', x + pad + 30, chipY + 20);
}

export function calendarContent(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const pad = 22;
  ctx.fillStyle = MUTED;
  ctx.font = '700 12px "Helvetica Neue", Arial, sans-serif';
  ctx.fillText('PLANNING — CETTE SEMAINE', x + pad, y + 34);
  const days = ['L', 'M', 'M', 'J', 'V'];
  const colW = (w - pad * 2) / days.length;
  const rowTop = y + 54;
  days.forEach((d, i) => {
    ctx.fillStyle = MUTED;
    ctx.font = '700 11px "Helvetica Neue", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(d, x + pad + colW * i + colW / 2, rowTop);
    ctx.textAlign = 'left';
  });
  const chips = [
    { day: 0, color: PRIMARY },
    { day: 0, color: SLATE, offset: 1 },
    { day: 2, color: MOSS },
    { day: 3, color: PRIMARY },
    { day: 4, color: SLATE },
  ];
  chips.forEach((chip) => {
    const cx = x + pad + colW * chip.day + colW / 2;
    const cy = rowTop + 26 + (chip.offset ?? 0) * 30;
    rr(ctx, cx - colW / 2 + 6, cy, colW - 12, 22, 6, chip.color);
  });
}

export function cashflowContent(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const pad = 24;
  ctx.fillStyle = MUTED;
  ctx.font = '700 12px "Helvetica Neue", Arial, sans-serif';
  ctx.fillText('TRÉSORERIE — 90 JOURS', x + pad, y + 36);
  ctx.fillStyle = INK;
  ctx.font = '800 26px "Helvetica Neue", Arial, sans-serif';
  ctx.fillText('CHF 48’900', x + pad, y + 70);
  const chartY = y + 96;
  const chartH = h - 96 - pad;
  const points = [0.3, 0.42, 0.38, 0.55, 0.5, 0.68, 0.6, 0.78];
  const stepX = (w - pad * 2) / (points.length - 1);
  ctx.beginPath();
  points.forEach((p, i) => {
    const px = x + pad + i * stepX;
    const py = chartY + chartH - p * chartH;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.lineTo(x + pad + (points.length - 1) * stepX, chartY + chartH);
  ctx.lineTo(x + pad, chartY + chartH);
  ctx.closePath();
  ctx.fillStyle = lighten(SUCCESS, 0.75);
  ctx.fill();
  ctx.beginPath();
  points.forEach((p, i) => {
    const px = x + pad + i * stepX;
    const py = chartY + chartH - p * chartH;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.strokeStyle = SUCCESS;
  ctx.lineWidth = 3.4;
  ctx.lineJoin = 'round';
  ctx.stroke();
  const lastX = x + pad + (points.length - 1) * stepX;
  const lastY = chartY + chartH - points[points.length - 1] * chartH;
  circle(ctx, lastX, lastY, 6, SUCCESS);
}

export function subcontractorContent(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const pad = 22;
  ctx.fillStyle = MUTED;
  ctx.font = '700 12px "Helvetica Neue", Arial, sans-serif';
  ctx.fillText('SOUS-TRAITANTS', x + pad, y + 34);
  const rows: { name: string; status: string; color: string; avatar: string }[] = [
    { name: 'Électricité SA', status: 'En cours', color: PRIMARY, avatar: SLATE },
    { name: 'Plomberie Dubois', status: 'Terminé', color: SUCCESS, avatar: MOSS },
  ];
  let ry = y + 54;
  rows.forEach((row) => {
    circle(ctx, x + pad + 18, ry + 18, 18, row.avatar);
    ctx.fillStyle = '#fff';
    ctx.font = '700 13px "Helvetica Neue", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(row.name.slice(0, 2).toUpperCase(), x + pad + 18, ry + 22);
    ctx.textAlign = 'left';
    ctx.fillStyle = INK;
    ctx.font = '600 14px "Helvetica Neue", Arial, sans-serif';
    ctx.fillText(row.name, x + pad + 46, ry + 14);
    rr(ctx, x + pad + 46, ry + 22, 84, 22, 11, lighten(row.color, 0.8));
    ctx.fillStyle = row.color;
    ctx.font = '700 11px "Helvetica Neue", Arial, sans-serif';
    ctx.fillText(row.status, x + pad + 58, ry + 37);
    ry += 62;
  });
}

export function reportContent(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const gap = 8;
  const pw = (w - 48 - gap) / 2;
  const ph = 58;
  const photos = [MOSS, SLATE, PRIMARY, ACCENT];
  photos.forEach((col, i) => {
    const px = x + 24 + (i % 2) * (pw + gap);
    const py = y + 26 + Math.floor(i / 2) * (ph + gap);
    rr(ctx, px, py, pw, ph, 12, lighten(col, 0.72));
    circle(ctx, px + pw - 16, py + 16, 10, SURFACE);
  });
  const gy = y + 26 + 2 * ph + gap + 30;
  ctx.fillStyle = INK;
  ctx.font = '600 15px "Helvetica Neue", Arial, sans-serif';
  ctx.fillText('Rapport du jour', x + 24, gy);
  ctx.fillStyle = MUTED;
  ctx.font = '400 13px "Helvetica Neue", Arial, sans-serif';
  ctx.fillText('4 photos · envoyé au client', x + 24, gy + 20);
  checkBadge(ctx, x + w - 40, gy - 6, 15, SUCCESS);
}

export function situationsContent(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const pad = 22;
  ctx.fillStyle = MUTED;
  ctx.font = '700 12px "Helvetica Neue", Arial, sans-serif';
  ctx.fillText('SITUATIONS DE CHANTIER', x + pad, y + 34);
  const rows = [
    { label: 'Situation 1', pct: 0.3 },
    { label: 'Situation 2', pct: 0.65 },
    { label: 'Situation 3', pct: 1 },
  ];
  let ry = y + 52;
  rows.forEach((row) => {
    ctx.fillStyle = INK;
    ctx.font = '600 13px "Helvetica Neue", Arial, sans-serif';
    ctx.fillText(row.label, x + pad, ry + 12);
    ctx.fillStyle = row.pct === 1 ? SUCCESS : PRIMARY;
    ctx.font = '700 13px "Helvetica Neue", Arial, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${Math.round(row.pct * 100)}%`, x + w - pad, ry + 12);
    ctx.textAlign = 'left';
    rr(ctx, x + pad, ry + 18, w - pad * 2, 10, 5, ACCENT_SOFT);
    rr(ctx, x + pad, ry + 18, (w - pad * 2) * row.pct, 10, 5, row.pct === 1 ? SUCCESS : PRIMARY);
    ry += 42;
  });
}

export function checklistContent(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const pad = 22;
  ctx.fillStyle = MUTED;
  ctx.font = '700 12px "Helvetica Neue", Arial, sans-serif';
  ctx.fillText('IMPORT EN COURS', x + pad, y + 34);
  const items = ['1 240 clients', '3 800 devis', '2 100 factures'];
  let ry = y + 50;
  items.forEach((label) => {
    checkBadge(ctx, x + pad + 12, ry + 10, 12, SUCCESS);
    ctx.fillStyle = INK;
    ctx.font = '500 14px "Helvetica Neue", Arial, sans-serif';
    ctx.fillText(label, x + pad + 32, ry + 15);
    ry += 32;
  });
  const barY = ry + 8;
  rr(ctx, x + pad, barY, w - pad * 2, 12, 6, ACCENT_SOFT);
  rr(ctx, x + pad, barY, (w - pad * 2) * 0.86, 12, 6, SUCCESS);
  ctx.fillStyle = SUCCESS;
  ctx.font = '700 13px "Helvetica Neue", Arial, sans-serif';
  ctx.fillText('86% importé', x + pad, barY + 32);
}

export function kpiGridContent(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const pad = 20;
  const gap = 10;
  const cw = (w - pad * 2 - gap) / 2;
  const ch = (h - pad * 2 - gap) / 2 - 4;
  const tiles = [
    { label: 'Devis actifs', value: '18', color: PRIMARY },
    { label: 'Chantiers', value: '7', color: SLATE },
    { label: 'CA du mois', value: '84k', color: SUCCESS },
    { label: 'Marge', value: '24%', color: ACCENT },
  ];
  tiles.forEach((t, i) => {
    const tx = x + pad + (i % 2) * (cw + gap);
    const ty = y + pad + Math.floor(i / 2) * (ch + gap);
    rr(ctx, tx, ty, cw, ch, 12, lighten(t.color, 0.82));
    ctx.fillStyle = t.color;
    ctx.font = '800 20px "Helvetica Neue", Arial, sans-serif';
    ctx.fillText(t.value, tx + 14, ty + ch * 0.55);
    ctx.fillStyle = MUTED;
    ctx.font = '600 11px "Helvetica Neue", Arial, sans-serif';
    ctx.fillText(t.label, tx + 14, ty + ch - 12);
  });
}

export function weatherContent(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const pad = 20;
  ctx.fillStyle = MUTED;
  ctx.font = '700 12px "Helvetica Neue", Arial, sans-serif';
  ctx.fillText('MÉTÉO CHANTIER — 5 JOURS', x + pad, y + 32);
  const days = [
    { d: 'Lun', t: '14°', sun: true },
    { d: 'Mar', t: '16°', sun: true },
    { d: 'Mer', t: '11°', sun: false },
    { d: 'Jeu', t: '13°', sun: true },
    { d: 'Ven', t: '15°', sun: true },
  ];
  const colW = (w - pad * 2) / days.length;
  days.forEach((day, i) => {
    const cx = x + pad + colW * i + colW / 2;
    const cy = y + 68;
    if (day.sun) sunGlyph(ctx, cx, cy, 14, ACCENT);
    else cloudPuff(ctx, cx, cy, 0.5, lighten(SLATE, 0.7));
    ctx.fillStyle = INK;
    ctx.font = '700 14px "Helvetica Neue", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(day.t, cx, cy + 36);
    ctx.fillStyle = MUTED;
    ctx.font = '500 11px "Helvetica Neue", Arial, sans-serif';
    ctx.fillText(day.d, cx, cy + 52);
    ctx.textAlign = 'left';
  });
}

export function chatContent(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const pad = 20;
  const bubbles: { text: string; mine: boolean }[] = [
    { text: 'Comment créer un devis vocal ?', mine: false },
    { text: 'Appuie sur le micro et dicte 🎙️', mine: true },
    { text: 'Envoyé en 2 minutes, merci !', mine: false },
  ];
  let by = y + 24;
  bubbles.forEach((b) => {
    ctx.font = '500 13px "Helvetica Neue", Arial, sans-serif';
    const maxW = w * 0.68;
    const bw = Math.min(maxW, ctx.measureText(b.text).width + 32);
    const bx = b.mine ? x + w - pad - bw : x + pad;
    rr(ctx, bx, by, bw, 40, 16, b.mine ? PRIMARY : '#F7F1E6');
    ctx.fillStyle = b.mine ? '#fff' : INK;
    ctx.fillText(b.text, bx + 16, by + 25);
    by += 52;
  });
}

export function syncContent(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const pad = 22;
  ctx.fillStyle = MUTED;
  ctx.font = '700 12px "Helvetica Neue", Arial, sans-serif';
  ctx.fillText('SYNCHRONISÉ', x + pad, y + 34);
  const cy = y + h * 0.55;
  rr(ctx, x + pad, cy - 30, 70, 50, 10, '#F7F1E6');
  ctx.fillStyle = SLATE;
  ctx.font = '700 11px "Helvetica Neue", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Bureau', x + pad + 35, cy + 38);
  rr(ctx, x + w - pad - 44, cy - 34, 44, 66, 10, '#F7F1E6');
  ctx.fillText('Chantier', x + w - pad - 22, cy + 46);
  ctx.textAlign = 'left';
  syncGlyph(ctx, x + w / 2, cy - 4, 26, SUCCESS);
}

// ----------------------------------------------------------------- scenes
function sceneDevis(ctx: CanvasRenderingContext2D, iso: Iso) {
  groundPlinth(ctx, iso);
  isoBox(ctx, iso, -2.9, -1.8, 1.0, 0.8, 0.34, PRIMARY_DARK);
  isoBox(ctx, iso, -2.9, -1.8, 1.0, 0.8, 0.3, PRIMARY, 0.34);
  isoBox(ctx, iso, -2.55, -0.55, 1.3, 0.75, 0.5, SLATE);
  workerFigure(ctx, ...iso.project(0.4, 1.1, 0.55), 0.66, { hatColor: PRIMARY, prop: 'phone' });
  bush(ctx, iso, 2.3, -1.7);
  bush(ctx, iso, 2.7, -0.9, lighten(MOSS, 0.12));
}

function sceneChantier(ctx: CanvasRenderingContext2D, iso: Iso) {
  groundPlinth(ctx, iso, 7.8, 4.8);
  isoBox(ctx, iso, -3.0, -1.6, 2.0, 1.3, 1.1, lighten(PRIMARY_DARK, 0.08));
  isoBox(ctx, iso, -3.0, -1.6, 2.0, 1.3, 1.0, PRIMARY, 1.1);
  crane(ctx, iso, -3.6, 1.1, 3.1);
  isoBox(ctx, iso, 1.7, -0.3, 0.9, 0.7, 0.3, SLATE);
  bush(ctx, iso, 2.7, -1.5);
}

function sceneFacture(ctx: CanvasRenderingContext2D, iso: Iso) {
  groundPlinth(ctx, iso, 6.8, 4.4);
  // stack of "paper" — thin flat boxes
  isoBox(ctx, iso, -2.4, -1.1, 1.3, 1.0, 0.14, '#F1E6D5');
  isoBox(ctx, iso, -2.3, -1.0, 1.3, 1.0, 0.14, ACCENT_SOFT, 0.14);
  isoBox(ctx, iso, -2.2, -0.9, 1.3, 1.0, 0.16, SURFACE, 0.28);
  // small QR-block prop
  isoBox(ctx, iso, 0.6, -0.2, 0.7, 0.7, 0.45, SLATE);
  bush(ctx, iso, 2.5, -1.4);
  bush(ctx, iso, -2.6, 1.2, lighten(MOSS, 0.1));
}

function sceneEquipe(ctx: CanvasRenderingContext2D, iso: Iso) {
  groundPlinth(ctx, iso, 6.8, 4.4);
  isoBox(ctx, iso, -2.2, -0.6, 0.6, 0.6, 0.4, SLATE);
  workerFigure(ctx, ...iso.project(0.6, 0.6, 0.55), 0.62, { hatColor: PRIMARY, prop: 'none' });
  workerFigure(ctx, ...iso.project(-0.6, 1.3, 0.55), 0.58, { hatColor: SLATE, prop: 'none' });
  bush(ctx, iso, 2.5, -1.4);
}

function sceneRentabilite(ctx: CanvasRenderingContext2D, iso: Iso) {
  groundPlinth(ctx, iso, 6.8, 4.4);
  isoBox(ctx, iso, -1.8, -0.8, 0.7, 0.6, 0.4, ACCENT_SOFT);
  isoBox(ctx, iso, -0.9, -0.5, 0.7, 0.6, 0.7, ACCENT);
  isoBox(ctx, iso, 0.0, -0.2, 0.7, 0.6, 1.05, PRIMARY);
  bush(ctx, iso, 2.5, -1.4);
  bush(ctx, iso, -2.6, 1.2, lighten(MOSS, 0.1));
}

function sceneSignature(ctx: CanvasRenderingContext2D, iso: Iso) {
  groundPlinth(ctx, iso, 6.8, 4.4);
  isoBox(ctx, iso, -0.3, -0.3, 0.5, 0.4, 1.1, SLATE);
  isoBox(ctx, iso, -0.4, -0.4, 0.7, 0.6, 0.08, darken(SLATE, 0.1), 1.1);
  workerFigure(ctx, ...iso.project(-1.9, 0.9, 0.55), 0.72, { hatColor: PRIMARY, prop: 'stylus' });
  bush(ctx, iso, 2.5, -1.5);
}

function sceneEssai(ctx: CanvasRenderingContext2D, iso: Iso) {
  groundPlinth(ctx, iso, 6.6, 4.2);
  const [px, py] = iso.project(2.0, 0, 0.55);
  rr(ctx, px - 4, py - 190, 8, 190, 4, PRIMARY_DARK);
  circle(ctx, px, py - 190, 7, PRIMARY_DARK);
  fillPoly(
    ctx,
    [
      [px + 4, py - 182],
      [px + 108, py - 165],
      [px + 4, py - 140],
    ],
    PRIMARY,
  );
  swissCross(ctx, px + 42, py - 165, 30, null, '#FFFFFF');
  isoBox(ctx, iso, -2.1, -0.6, 0.55, 0.55, 0.7, SLATE);
  const [hx, hy] = iso.project(-1.5, 1.0, 0.55);
  ctx.save();
  ctx.translate(hx, hy);
  ctx.rotate((-24 * Math.PI) / 180);
  rr(ctx, -6, -86, 12, 86, 5, PRIMARY_DARK);
  rr(ctx, -30, -110, 60, 28, 6, INK);
  ctx.restore();
  bush(ctx, iso, 2.4, -1.5);
  bush(ctx, iso, -2.6, 1.2, lighten(MOSS, 0.1));
}

function scenePlanning(ctx: CanvasRenderingContext2D, iso: Iso) {
  groundPlinth(ctx, iso, 6.8, 4.4);
  isoBox(ctx, iso, -1.6, -1.3, 2.2, 1.5, 0.16, '#F1E6D5');
  isoTopGrid(ctx, iso, -1.6, -1.3, 2.2, 1.5, 0.16, 5, 4, MUTED);
  const c1 = isoTopCellCenter(iso, -1.6, -1.3, 2.2, 1.5, 0.16, 5, 4, 1, 1);
  const c2 = isoTopCellCenter(iso, -1.6, -1.3, 2.2, 1.5, 0.16, 5, 4, 2, 2);
  const c3 = isoTopCellCenter(iso, -1.6, -1.3, 2.2, 1.5, 0.16, 5, 4, 3, 1);
  circle(ctx, c1[0], c1[1], 7, PRIMARY);
  circle(ctx, c2[0], c2[1], 7, SLATE);
  circle(ctx, c3[0], c3[1], 7, MOSS);
  workerFigure(ctx, ...iso.project(1.9, 1.2, 0.55), 0.58, { hatColor: SLATE, prop: 'stylus' });
  bush(ctx, iso, 2.7, -1.6);
}

function sceneTresorerie(ctx: CanvasRenderingContext2D, iso: Iso) {
  groundPlinth(ctx, iso, 6.8, 4.4);
  const [cx, cy] = iso.project(-1.6, 0.3, 0.55);
  for (let i = 0; i < 5; i++) {
    circle(ctx, cx, cy - i * 12, 34, i % 2 === 0 ? SUCCESS : lighten(SUCCESS, 0.18));
  }
  ctx.fillStyle = '#fff';
  ctx.font = '800 22px "Helvetica Neue", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('CHF', cx, cy - 5 * 12 + 8);
  ctx.textAlign = 'left';
  const [rx, ry] = iso.project(1.3, -0.6, 0.9);
  ringGauge(ctx, rx, ry, 66, 0.72, SUCCESS, ACCENT_SOFT);
  ctx.fillStyle = SUCCESS;
  ctx.font = '900 26px "Helvetica Neue", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('72j', rx, ry + 9);
  ctx.textAlign = 'left';
  bush(ctx, iso, 2.6, 1.3);
}

function sceneSousTraitants(ctx: CanvasRenderingContext2D, iso: Iso) {
  groundPlinth(ctx, iso, 6.8, 4.4);
  truck(ctx, iso, -2.6, -0.5, SLATE);
  materialStack(ctx, iso, 0.6, -0.3, ACCENT);
  workerFigure(ctx, ...iso.project(2.1, 1.1, 0.55), 0.58, { hatColor: SLATE, prop: 'none' });
  bush(ctx, iso, -2.8, 1.3);
}

function sceneRapportChantier(ctx: CanvasRenderingContext2D, iso: Iso) {
  groundPlinth(ctx, iso, 6.8, 4.4);
  isoBox(ctx, iso, -0.5, -0.4, 0.9, 0.6, 0.5, INK);
  const [lx, ly] = iso.project(-0.05, -0.4, 0.8);
  circle(ctx, lx, ly, 26, SLATE);
  circle(ctx, lx, ly, 15, darken(SLATE, 0.2));
  isoBox(ctx, iso, 1.3, 0.3, 0.9, 0.65, 0.06, '#F1E6D5');
  isoBox(ctx, iso, 1.4, 0.4, 0.9, 0.65, 0.06, SURFACE, 0.06);
  workerFigure(ctx, ...iso.project(-2.2, 1.2, 0.55), 0.58, { hatColor: PRIMARY, prop: 'phone' });
  bush(ctx, iso, 2.6, -1.5);
}

function sceneSituations(ctx: CanvasRenderingContext2D, iso: Iso) {
  groundPlinth(ctx, iso, 6.8, 4.4);
  isoBox(ctx, iso, -2.2, -0.9, 1.1, 0.8, 0.1, lighten(ACCENT_SOFT, 0.1));
  isoBox(ctx, iso, -2.1, -0.8, 1.1, 0.8, 0.1, ACCENT_SOFT, 0.14);
  isoBox(ctx, iso, -2.0, -0.7, 1.1, 0.8, 0.12, SURFACE, 0.28);
  const [rx, ry] = iso.project(1.4, 0.2, 0.9);
  ringGauge(ctx, rx, ry, 64, 0.65, PRIMARY, ACCENT_SOFT);
  ctx.fillStyle = PRIMARY;
  ctx.font = '900 24px "Helvetica Neue", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('65%', rx, ry + 8);
  ctx.textAlign = 'left';
  bush(ctx, iso, 2.6, -1.5);
}

function sceneDonneesImport(ctx: CanvasRenderingContext2D, iso: Iso) {
  groundPlinth(ctx, iso, 6.8, 4.4);
  const files = [MOSS, SLATE, ACCENT];
  files.forEach((col, i) => {
    isoBox(ctx, iso, -2.6 + i * 0.28, -1.3 + i * 0.22, 0.9, 0.65, 0.08, lighten(col, 0.6), i * 0.1);
  });
  isoBox(ctx, iso, 0.6, -0.2, 0.9, 0.9, 0.75, SLATE);
  swissCross(ctx, ...iso.project(1.05, 0.25, 1.1), 46);
  bush(ctx, iso, 2.6, -1.6);
}

function sceneDashboard(ctx: CanvasRenderingContext2D, iso: Iso) {
  groundPlinth(ctx, iso, 6.8, 4.4);
  const heights = [0.4, 0.7, 0.55, 0.95];
  const colors = [PRIMARY, SLATE, MOSS, ACCENT];
  let gx = -2.6;
  heights.forEach((hgt, i) => {
    isoBox(ctx, iso, gx, -0.6, 0.5, 0.5, hgt, colors[i]);
    gx += 0.62;
  });
  const [rx, ry] = iso.project(1.6, 0.8, 1.0);
  ringGauge(ctx, rx, ry, 58, 0.8, PRIMARY, ACCENT_SOFT);
  bush(ctx, iso, 2.7, -1.6);
}

function sceneMeteo(ctx: CanvasRenderingContext2D, iso: Iso) {
  groundPlinth(ctx, iso, 6.8, 4.4);
  isoBox(ctx, iso, -1.0, -0.6, 1.4, 1.0, 0.75, lighten(PRIMARY_DARK, 0.1));
  crane(ctx, iso, -2.6, 1.0, 2.4, SLATE);
  const [sx, sy] = iso.project(2.0, -1.4, 1.6);
  sunGlyph(ctx, sx, sy, 34, ACCENT);
  const [clx, cly] = iso.project(0.6, -1.6, 1.9);
  cloudPuff(ctx, clx, cly, 1.1, lighten(SLATE, 0.78));
  bush(ctx, iso, 2.6, 1.2);
}

function sceneSupport(ctx: CanvasRenderingContext2D, iso: Iso) {
  groundPlinth(ctx, iso, 6.8, 4.4);
  isoBox(ctx, iso, -0.4, -0.4, 0.7, 0.6, 0.55, SLATE);
  workerFigure(ctx, ...iso.project(1.6, 1.0, 0.55), 0.6, { hatColor: PRIMARY, prop: 'phone' });
  const [bx, by] = iso.project(-1.8, -1.3, 1.5);
  circle(ctx, bx, by, 30, PRIMARY);
  ctx.fillStyle = '#fff';
  ctx.font = '900 30px "Helvetica Neue", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('?', bx, by + 10);
  ctx.textAlign = 'left';
  bush(ctx, iso, 2.6, -1.4);
}

function sceneMultiDevice(ctx: CanvasRenderingContext2D, iso: Iso) {
  groundPlinth(ctx, iso, 6.8, 4.4);
  laptop(ctx, iso, -1.6, -0.4, SLATE);
  miniPhone(ctx, iso, 1.0, 0.2, -8);
  const [mx, my] = iso.project(-0.1, -0.3, 1.5);
  syncGlyph(ctx, mx, my, 30, SUCCESS);
  bush(ctx, iso, 2.6, -1.5);
}

export const SCENES: Record<SocialScene, (ctx: CanvasRenderingContext2D, iso: Iso) => void> = {
  devis: sceneDevis,
  chantier: sceneChantier,
  facture: sceneFacture,
  equipe: sceneEquipe,
  rentabilite: sceneRentabilite,
  signature: sceneSignature,
  essai: sceneEssai,
  planning: scenePlanning,
  tresorerie: sceneTresorerie,
  sousTraitants: sceneSousTraitants,
  rapportChantier: sceneRapportChantier,
  situations: sceneSituations,
  donneesImport: sceneDonneesImport,
  dashboard: sceneDashboard,
  meteo: sceneMeteo,
  support: sceneSupport,
  multiDevice: sceneMultiDevice,
};

export const SCENE_CARD_CONTENT: Record<SocialScene, ((ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => void) | null> = {
  devis: micWaveformContent,
  chantier: progressContent,
  facture: invoiceContent,
  equipe: payslipContent,
  rentabilite: marginContent,
  signature: signatureContent,
  essai: null,
  planning: calendarContent,
  tresorerie: cashflowContent,
  sousTraitants: subcontractorContent,
  rapportChantier: reportContent,
  situations: situationsContent,
  donneesImport: checklistContent,
  dashboard: kpiGridContent,
  meteo: weatherContent,
  support: chatContent,
  multiDevice: syncContent,
};
