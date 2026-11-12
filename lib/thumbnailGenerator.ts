import { Platform } from 'react-native';
import { Asset } from 'expo-asset';

// YouTube thumbnail of a tutorial (Super Admin › Tutoriels › Miniatures),
// drawn in the site's art direction (November 2026): cream page, the
// C-A-N-T-I-A logo, the chapter's area as a terracotta eyebrow, the title in
// DM Sans with its second half (after « : ») in DM Serif Display italic like
// the site's headlines, and a terracotta band carrying the episode number.
// The previous version drew on a ready-made background that still had the
// old « C » logo.
const LOGO_MODULE = require('../assets/brand/logo.png');
const LOGO_RATIO = 1036 / 192;

const WIDTH = 1920;
const HEIGHT = 1080;

const CREAM = '#F6F4EF';
const INK = '#252921';
const MUTED = '#74786E';
const TERRACOTTA = '#A65D36';
const BAND_TEXT = '#FFFEFA';

const SANS = "'DM Sans', 'DM Sans Fallback', Arial, sans-serif";
const SERIF = "'DM Serif Display', 'DM Serif Fallback', Georgia, serif";

const LEFT = 140;
const BAND_X = 1420;
const TEXT_MAX_WIDTH = BAND_X - LEFT - 110;

let logoPromise: Promise<HTMLImageElement | null> | null = null;

// Reading/drawing pixels needs a DOM canvas, which only exists on web;
// native callers get null and the caller shows « no thumbnail here ».
function loadImage(mod: number): Promise<HTMLImageElement | null> {
  if (Platform.OS !== 'web') return Promise.resolve(null);
  return (async () => {
    try {
      const asset = Asset.fromModule(mod);
      await asset.downloadAsync();
      const uri = asset.localUri ?? asset.uri;
      const ImageCtor = (globalThis as any).Image;
      if (!ImageCtor || !uri) return null;
      const img = new ImageCtor();
      img.crossOrigin = 'anonymous';
      const loaded = await new Promise<boolean>((resolve) => {
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = uri;
      });
      return loaded ? img : null;
    } catch {
      return null;
    }
  })();
}

// The brand fonts are declared by the page (components/site/FontHead); a
// canvas only uses them once loaded.
async function loadFonts(): Promise<void> {
  const fonts = (document as any).fonts;
  if (!fonts?.load) return;
  try {
    await Promise.all([fonts.load(`700 96px 'DM Sans'`), fonts.load(`500 32px 'DM Sans'`), fonts.load(`italic 400 96px 'DM Serif Display'`)]);
  } catch {
    // fallback faces are fine
  }
}

// Exported for lib/socialPostGenerator.ts, which needs the exact same
// greedy word-wrap for its own canvas-drawn headlines.
export function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (current && ctx.measureText(candidate).width > maxWidth) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function setSpacing(ctx: CanvasRenderingContext2D, px: number) {
  // Chrome / Safari 17+: letterSpacing on the canvas context.
  if ('letterSpacing' in ctx) (ctx as any).letterSpacing = `${px}px`;
}

// Renders a 1920×1080 PNG data URL. `number` is the chapter's place in the
// plan (shown in the band); Web only (see loadImage above).
export async function generateThumbnailDataUrl(title: string, category: string, number?: number): Promise<string | null> {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return null;
  await loadFonts();
  if (!logoPromise) logoPromise = loadImage(LOGO_MODULE);
  const logo = await logoPromise;

  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Page and band.
  ctx.fillStyle = CREAM;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.fillStyle = TERRACOTTA;
  ctx.fillRect(BAND_X, 0, WIDTH - BAND_X, HEIGHT);

  // Logo, top left.
  if (logo) {
    const h = 58;
    ctx.drawImage(logo, LEFT, 104, h * LOGO_RATIO, h);
  }

  // Eyebrow: the chapter's area.
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = TERRACOTTA;
  ctx.font = `700 30px ${SANS}`;
  setSpacing(ctx, 5);
  const eyebrowY = 380;
  ctx.fillText(category.toUpperCase(), LEFT, eyebrowY);
  setSpacing(ctx, 0);
  ctx.fillRect(LEFT, eyebrowY + 26, 88, 5);

  // Title: « plain : accent » → plain in DM Sans, accent in serif italic.
  const [plainRaw, ...rest] = title.split(/\s+:\s+/);
  const plain = plainRaw.trim();
  const accent = rest.join(' : ').trim();
  let size = 104;
  let plainLines: string[] = [];
  let accentLines: string[] = [];
  for (; size >= 56; size -= 4) {
    ctx.font = `700 ${size}px ${SANS}`;
    setSpacing(ctx, -size * 0.02);
    plainLines = wrapLines(ctx, plain, TEXT_MAX_WIDTH);
    ctx.font = `italic 400 ${size * 1.04}px ${SERIF}`;
    setSpacing(ctx, 0);
    accentLines = accent ? wrapLines(ctx, accent, TEXT_MAX_WIDTH) : [];
    // Fits when it ends above the footer line.
    const bottom = eyebrowY + 70 + size + (plainLines.length + accentLines.length - 1) * size * 1.12;
    if (plainLines.length + accentLines.length <= 4 && bottom <= HEIGHT - 190) break;
  }
  const lineHeight = size * 1.12;
  let y = eyebrowY + 70 + size;
  ctx.fillStyle = INK;
  ctx.font = `700 ${size}px ${SANS}`;
  setSpacing(ctx, -size * 0.02);
  for (const line of plainLines.slice(0, 4)) {
    ctx.fillText(line, LEFT, y);
    y += lineHeight;
  }
  setSpacing(ctx, 0);
  ctx.fillStyle = TERRACOTTA;
  ctx.font = `italic 400 ${size * 1.04}px ${SERIF}`;
  for (const line of accentLines.slice(0, Math.max(0, 4 - plainLines.length))) {
    ctx.fillText(line, LEFT, y);
    y += lineHeight;
  }

  // Footer line.
  ctx.fillStyle = MUTED;
  ctx.font = `500 32px ${SANS}`;
  ctx.fillText('Tutoriel vidéo · cantia.ch', LEFT, HEIGHT - 110);

  // Band: « TUTORIEL » and the number.
  const bandCenter = BAND_X + (WIDTH - BAND_X) / 2;
  ctx.textAlign = 'center';
  ctx.fillStyle = BAND_TEXT;
  ctx.font = `700 28px ${SANS}`;
  setSpacing(ctx, 6);
  ctx.fillText('TUTORIEL', bandCenter, 300);
  setSpacing(ctx, 0);
  if (number != null) {
    ctx.font = `italic 400 380px ${SERIF}`;
    ctx.fillText(String(number).padStart(2, '0'), bandCenter, 690);
  }
  ctx.font = `500 30px ${SANS}`;
  ctx.globalAlpha = 0.85;
  ctx.fillText('Le logiciel suisse', bandCenter, HEIGHT - 150);
  ctx.fillText('des artisans et PME', bandCenter, HEIGHT - 110);
  ctx.globalAlpha = 1;
  ctx.textAlign = 'left';

  return canvas.toDataURL('image/png');
}
