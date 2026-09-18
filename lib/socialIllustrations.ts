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

export type SocialScene = 'devis' | 'chantier' | 'facture' | 'equipe' | 'rentabilite' | 'signature' | 'essai';

export const SOCIAL_SCENES: { key: SocialScene; label: string }[] = [
  { key: 'devis', label: 'Devis à la voix (micro)' },
  { key: 'chantier', label: 'Chantier & suivi (grue)' },
  { key: 'facture', label: 'Facturation / QR-facture' },
  { key: 'equipe', label: 'Équipe / RH' },
  { key: 'rentabilite', label: 'Rentabilité / finances' },
  { key: 'signature', label: 'Signature électronique' },
  { key: 'essai', label: 'Marque / essai gratuit (drapeau)' },
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

export const SCENES: Record<SocialScene, (ctx: CanvasRenderingContext2D, iso: Iso) => void> = {
  devis: sceneDevis,
  chantier: sceneChantier,
  facture: sceneFacture,
  equipe: sceneEquipe,
  rentabilite: sceneRentabilite,
  signature: sceneSignature,
  essai: sceneEssai,
};

export const SCENE_CARD_CONTENT: Record<SocialScene, ((ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => void) | null> = {
  devis: micWaveformContent,
  chantier: progressContent,
  facture: invoiceContent,
  equipe: payslipContent,
  rentabilite: marginContent,
  signature: signatureContent,
  essai: null,
};
