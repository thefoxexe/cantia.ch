import { Platform } from 'react-native';
import { Asset } from 'expo-asset';
import { wrapLines } from './thumbnailGenerator';
import { Iso, SCENES, SCENE_CARD_CONTENT, deviceCard, stampBadge, type SocialScene } from './socialIllustrations';

// Renders the two social-media visuals (Instagram 4:5, LinkedIn 1200×627)
// for a social_posts row entirely client-side via canvas, from just
// headline/subheadline/topic/scene — same reasoning as
// thumbnailGenerator.ts: no server round trip, no storage bucket to
// manage, and editing a post's text in the admin screen regenerates the
// image instantly instead of requiring a re-upload. The hero illustration
// is the same isometric/flat-figure language built for the paid ad
// creatives (lib/socialIllustrations.ts) — genuine drawn artwork per
// topic rather than a stock/mountain photo, matched to the logo mark and
// the crème/terracotta palette.

const LOGO_MODULE = require('../assets/logo-mark.png');

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
  scene?: SocialScene | null;
  statValue?: string | null;
  statLabel?: string | null;
  badge?: string | null;
}

let logoPromise: Promise<HTMLImageElement | null> | null = null;

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

// Draws the topic's isometric illustration into `rect`, plus its floating
// device-card mockup (or, for the 'essai' scene, the "14 jours" stamp
// badge instead) — the same convention as the ad creatives.
function drawScene(
  ctx: CanvasRenderingContext2D,
  scene: SocialScene,
  iso: Iso,
  card: { x: number; y: number; w: number; h: number; rotate: number } | null,
  badge: { cx: number; cy: number; r: number; rotate: number } | null,
) {
  SCENES[scene](ctx, iso);
  const content = SCENE_CARD_CONTENT[scene];
  if (badge) {
    stampBadge(ctx, badge.cx, badge.cy, badge.r, badge.rotate, '14', 'JOURS GRATUITS');
  } else if (content && card) {
    deviceCard(ctx, card.x, card.y, card.w, card.h, card.rotate, content);
  }
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

function drawBadge(ctx: CanvasRenderingContext2D, text: string, rightX: number, y: number, fontSize: number) {
  const label = text.toUpperCase();
  ctx.font = `800 ${fontSize}px ${FONT_FAMILY}`;
  const textW = ctx.measureText(label).width;
  const padX = fontSize * 0.7;
  const h = fontSize * 2.1;
  const w = textW + padX * 2;
  const x = rightX - w;
  ctx.fillStyle = PRIMARY;
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + padX, y + h / 2 + 1);
  ctx.textBaseline = 'alphabetic';
}

function drawStat(ctx: CanvasRenderingContext2D, value: string, label: string, x: number, y: number, valueSize: number, labelSize: number, maxWidth: number) {
  ctx.fillStyle = PRIMARY;
  ctx.font = `900 ${valueSize}px ${FONT_FAMILY}`;
  const valueBaseline = y + valueSize * 0.78;
  ctx.fillText(value, x, valueBaseline);
  if (!label) return valueBaseline;
  ctx.fillStyle = TEXT_MUTED;
  ctx.font = `700 ${labelSize}px ${FONT_FAMILY}`;
  const lines = wrapLines(ctx, label.toUpperCase(), maxWidth).slice(0, 2);
  let labelY = valueBaseline + labelSize * 1.5;
  for (const line of lines) {
    ctx.fillText(line, x, labelY);
    labelY += labelSize * 1.3;
  }
  return labelY;
}

async function ensureAssets(): Promise<{ logo: HTMLImageElement | null } | null> {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return null;
  const logo = await loadLogo();
  return { logo };
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

  const scene = post.scene ?? 'essai';
  const iso = new Iso(500, 1280, 150, 78);
  drawScene(
    ctx,
    scene,
    iso,
    { x: 700, y: 890, w: 320, h: 320, rotate: -7 },
    scene === 'essai' ? { cx: 800, cy: 980, r: 175, rotate: -8 } : null,
  );

  const marginX = 76;
  drawBrandHeader(ctx, assets.logo, marginX, 64, 44);
  if (post.badge) drawBadge(ctx, post.badge, W - marginX, 60, 20);
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

  if (post.statValue && y < 700) {
    drawStat(ctx, post.statValue, post.statLabel ?? '', marginX, y + 24, 84, 20, 460);
  }

  // "cantia.ch" pill, anchored bottom-left clear of the illustration — a
  // solid chip so it stays legible regardless of what's underneath it.
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

  const scene = post.scene ?? 'essai';
  const iso = new Iso(940, 610, 100, 52);
  drawScene(
    ctx,
    scene,
    iso,
    { x: 800, y: 210, w: 230, h: 230, rotate: -7 },
    scene === 'essai' ? { cx: 840, cy: 300, r: 118, rotate: -8 } : null,
  );

  const marginX = 72;
  const contentWidth = 620;
  drawBrandHeader(ctx, assets.logo, marginX, 52, 40);
  if (post.badge) drawBadge(ctx, post.badge, W - marginX, 48, 15);
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

  if (post.statValue && y < H - 130) {
    drawStat(ctx, post.statValue, post.statLabel ?? '', marginX, y + 8, 48, 13, contentWidth);
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
