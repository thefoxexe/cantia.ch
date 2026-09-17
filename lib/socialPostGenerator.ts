import { Platform } from 'react-native';
import { Asset } from 'expo-asset';
import { wrapLines } from './thumbnailGenerator';

// Renders the two social-media visuals (Instagram 4:5, LinkedIn 1200×627)
// for a social_posts row entirely client-side via canvas, from just
// headline/subheadline/topic — same reasoning as thumbnailGenerator.ts:
// no server round trip, no storage bucket to manage, and editing a post's
// text in the admin screen regenerates the image instantly instead of
// requiring a re-upload. Both formats reuse the same brand elements (the
// hero mountain photo, the logo mark, the crème/terracotta palette) the
// user's own reference OG image already established for cantia.ch.

const LOGO_MODULE = require('../assets/logo-mark.png');
const MOUNTAIN_SRC = '/hero-mountain.webp';

const BG = '#F7F1E6';
const TEXT = '#231A12';
const TEXT_MUTED = '#6E6153';
const PRIMARY = '#BC5A31';

const FONT_FAMILY = '"Helvetica Neue", Arial, sans-serif';

export type SocialFormat = 'instagram' | 'linkedin';

export interface SocialPostContent {
  topic: string;
  headline: string;
  subheadline: string;
}

let logoPromise: Promise<HTMLImageElement | null> | null = null;
let mountainPromise: Promise<HTMLImageElement | null> | null = null;

function loadBundledImage(mod: number): Promise<HTMLImageElement | null> {
  if (Platform.OS !== 'web') return Promise.resolve(null);
  return (async () => {
    try {
      const asset = Asset.fromModule(mod);
      await asset.downloadAsync();
      const uri = asset.localUri ?? asset.uri;
      return loadImageFromUri(uri);
    } catch {
      return null;
    }
  })();
}

function loadImageFromUri(uri: string | null | undefined): Promise<HTMLImageElement | null> {
  if (!uri) return Promise.resolve(null);
  const ImageCtor = (globalThis as any).Image;
  if (!ImageCtor) return Promise.resolve(null);
  return new Promise((resolve) => {
    const img = new ImageCtor();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = uri;
  });
}

function loadLogo(): Promise<HTMLImageElement | null> {
  if (!logoPromise) logoPromise = loadBundledImage(LOGO_MODULE);
  return logoPromise;
}

function loadMountain(): Promise<HTMLImageElement | null> {
  if (Platform.OS !== 'web') return Promise.resolve(null);
  if (!mountainPromise) mountainPromise = loadImageFromUri(MOUNTAIN_SRC);
  return mountainPromise;
}

// Draws `img` into the dest rect with "cover" scaling (crops instead of
// distorting), same fit behavior as CSS background-size: cover / RN's
// resizeMode="cover".
function coverDraw(ctx: CanvasRenderingContext2D, img: HTMLImageElement, dx: number, dy: number, dw: number, dh: number) {
  const srcRatio = img.width / img.height;
  const destRatio = dw / dh;
  let sx: number, sy: number, sw: number, sh: number;
  if (srcRatio > destRatio) {
    sh = img.height;
    sw = sh * destRatio;
    sx = (img.width - sw) / 2;
    sy = 0;
  } else {
    sw = img.width;
    sh = sw / destRatio;
    sx = 0;
    sy = (img.height - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
}

// Draws the mountain photo into the dest rect, faded to transparent along
// one edge so it blends into the crème background instead of reading as a
// pasted-in photo — the same effect the marketing hero (HeroCross's
// backdrop) and the OG image reference both use. Composited via an
// offscreen canvas + destination-in gradient: bake the fade into the
// image's own alpha, then draw that (already-faded) result onto the main
// canvas, over whatever's already there.
function drawFadedMountain(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
  fadeEdge: 'left' | 'top',
) {
  const off = document.createElement('canvas');
  off.width = dw;
  off.height = dh;
  const offCtx = off.getContext('2d');
  if (!offCtx) return;
  coverDraw(offCtx, img, 0, 0, dw, dh);

  const gradient =
    fadeEdge === 'left' ? offCtx.createLinearGradient(0, 0, dw * 0.42, 0) : offCtx.createLinearGradient(0, 0, 0, dh * 0.38);
  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(1, 'rgba(0,0,0,1)');
  offCtx.globalCompositeOperation = 'destination-in';
  offCtx.fillStyle = gradient;
  offCtx.fillRect(0, 0, dw, dh);

  ctx.drawImage(off, dx, dy);
}

// Splits on manual "\n" breaks first (used when a headline wants an
// explicit two-part structure, e.g. a dark line followed by a
// brand-colored one — mirrors the landing hero's h1/h1Highlight split),
// then greedily wraps each part to fit maxWidth, shrinking the font until
// everything fits within maxLines. The final manual segment's wrapped
// lines are colored PRIMARY; everything before it stays TEXT — a no-op
// (everything TEXT) when there's only one manual segment.
function layoutHeadline(
  ctx: CanvasRenderingContext2D,
  headline: string,
  maxWidth: number,
  maxLines: number,
  startSize: number,
  minSize: number,
): { lines: { text: string; color: string }[]; size: number } {
  // A literal two-character "\n" (backslash + n), not an actual newline —
  // the admin editor's headline field is a single-line TextInput, so
  // typing a real Enter key isn't an option there; this is what both the
  // field's own label and the seeded posts (dollar-quoted SQL strings,
  // which never interpret backslash escapes) already use.
  const segments = headline.split('\\n').map((s) => s.trim()).filter(Boolean);
  let size = startSize;
  let lines: { text: string; color: string }[] = [];
  do {
    ctx.font = `800 ${size}px ${FONT_FAMILY}`;
    lines = [];
    segments.forEach((seg, i) => {
      // Only a genuine two-part headline gets the dark/orange split — a
      // single segment (most posts) stays dark ink throughout, so the
      // orange accent stays reserved for the kicker instead of every
      // headline reading as one big orange block.
      const color = segments.length > 1 && i === segments.length - 1 ? PRIMARY : TEXT;
      for (const line of wrapLines(ctx, seg, maxWidth)) lines.push({ text: line, color });
    });
    if (lines.length <= maxLines || size <= minSize) break;
    size -= 4;
  } while (true);
  return { lines: lines.slice(0, maxLines), size };
}

function drawBrandHeader(ctx: CanvasRenderingContext2D, logo: HTMLImageElement | null, x: number, y: number, logoSize: number) {
  if (logo) ctx.drawImage(logo, x, y, logoSize, logoSize);
  ctx.fillStyle = TEXT;
  ctx.font = `800 ${logoSize * 0.62}px ${FONT_FAMILY}`;
  ctx.textBaseline = 'middle';
  ctx.fillText('Cantia', x + logoSize + logoSize * 0.32, y + logoSize / 2 + 1);
  ctx.textBaseline = 'alphabetic';
}

function drawKicker(ctx: CanvasRenderingContext2D, topic: string, x: number, y: number, fontSize: number) {
  ctx.fillStyle = PRIMARY;
  ctx.font = `800 ${fontSize}px ${FONT_FAMILY}`;
  ctx.fillText(topic.toUpperCase(), x, y);
}

async function ensureAssets(): Promise<{ logo: HTMLImageElement | null; mountain: HTMLImageElement | null } | null> {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return null;
  const [logo, mountain] = await Promise.all([loadLogo(), loadMountain()]);
  return { logo, mountain };
}

// Instagram feed post, 4:5 (1080×1350 — Instagram's tallest allowed ratio,
// the format that takes the most vertical space in-feed).
async function generateInstagram(post: SocialPostContent): Promise<string | null> {
  const assets = await ensureAssets();
  if (!assets) return null;

  const W = 1080;
  const H = 1350;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, W, H);

  const bandHeight = 460;
  if (assets.mountain) drawFadedMountain(ctx, assets.mountain, 0, H - bandHeight, W, bandHeight, 'top');

  const marginX = 76;
  drawBrandHeader(ctx, assets.logo, marginX, 64, 44);
  drawKicker(ctx, post.topic, marginX, 190, 26);

  const { lines, size } = layoutHeadline(ctx, post.headline, W - marginX * 2, 4, 84, 52);
  const lineHeight = size * 1.1;
  let y = 260 + size;
  for (const line of lines) {
    ctx.fillStyle = line.color;
    ctx.font = `800 ${size}px ${FONT_FAMILY}`;
    ctx.fillText(line.text, marginX, y);
    y += lineHeight;
  }

  if (post.subheadline) {
    ctx.fillStyle = TEXT_MUTED;
    ctx.font = `500 32px ${FONT_FAMILY}`;
    const subLines = wrapLines(ctx, post.subheadline, W - marginX * 2).slice(0, 3);
    y += 12;
    for (const line of subLines) {
      ctx.fillText(line, marginX, y);
      y += 42;
    }
  }

  // "cantia.ch" pill, anchored bottom-left over the photo band — a solid
  // chip (not bare text over the photo) so it stays legible regardless of
  // what's underneath it.
  ctx.font = `800 30px ${FONT_FAMILY}`;
  const label = 'cantia.ch';
  const labelWidth = ctx.measureText(label).width;
  const chipPadX = 28;
  const chipHeight = 66;
  const chipW = labelWidth + chipPadX * 2;
  const chipX = marginX;
  const chipY = H - 64 - chipHeight;
  ctx.fillStyle = TEXT;
  roundRect(ctx, chipX, chipY, chipW, chipHeight, chipHeight / 2);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, chipX + chipPadX, chipY + chipHeight / 2 + 2);
  ctx.textBaseline = 'alphabetic';

  return canvas.toDataURL('image/png');
}

// LinkedIn feed post, 1200×627 — the same ratio (and layout language) as
// the public og-image.jpg reference, so the two only differ in copy.
async function generateLinkedin(post: SocialPostContent): Promise<string | null> {
  const assets = await ensureAssets();
  if (!assets) return null;

  const W = 1200;
  const H = 627;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, W, H);

  const mountainW = 620;
  if (assets.mountain) drawFadedMountain(ctx, assets.mountain, W - mountainW, 0, mountainW, H, 'left');

  const marginX = 72;
  const contentWidth = 620;
  drawBrandHeader(ctx, assets.logo, marginX, 52, 40);
  drawKicker(ctx, post.topic, marginX, 156, 24);

  const { lines, size } = layoutHeadline(ctx, post.headline, contentWidth, 3, 68, 42);
  const lineHeight = size * 1.06;
  let y = 210 + size;
  for (const line of lines) {
    ctx.fillStyle = line.color;
    ctx.font = `800 ${size}px ${FONT_FAMILY}`;
    ctx.fillText(line.text, marginX, y);
    y += lineHeight;
  }

  ctx.fillStyle = PRIMARY;
  ctx.fillRect(marginX, y - size * 0.35, 56, 4);
  y += 30;

  if (post.subheadline) {
    ctx.fillStyle = TEXT_MUTED;
    ctx.font = `500 24px ${FONT_FAMILY}`;
    const subLines = wrapLines(ctx, post.subheadline, contentWidth).slice(0, 2);
    for (const line of subLines) {
      ctx.fillText(line, marginX, y);
      y += 32;
    }
  }

  ctx.fillStyle = TEXT;
  ctx.font = `800 24px ${FONT_FAMILY}`;
  ctx.fillText('cantia.ch', marginX, H - 48);

  return canvas.toDataURL('image/png');
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export async function generateSocialPostDataUrl(post: SocialPostContent, format: SocialFormat): Promise<string | null> {
  return format === 'instagram' ? generateInstagram(post) : generateLinkedin(post);
}

export const SOCIAL_FORMAT_LABEL: Record<SocialFormat, string> = {
  instagram: 'Instagram (4:5, 1080×1350)',
  linkedin: 'LinkedIn (1200×627)',
};
