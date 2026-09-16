import { Platform } from 'react-native';
import { Asset } from 'expo-asset';

// Full-bleed background provided ready-made (logo, nav labels, mountain
// photo, decorative lines, cantia.ch — all already composed at 3840×2160,
// exactly 16:9). This module's only job is to lay the video's category and
// title over the empty cream area in its upper-left, nothing else — the
// background itself is never redrawn or altered.
const BACKGROUND_MODULE = require('../assets/marketing/Cantia_Fond_Miniature_4K_Orange.png');

// Rendered at Full HD rather than the background's native 4K — YouTube's
// own recommendation, a quarter the file size, and the source scales down
// losslessly since it's exactly 16:9 already.
const WIDTH = 1920;
const HEIGHT = 1080;

const PRIMARY = '#BC5A31';
const TEXT = '#231A12';

const FONT_FAMILY = '"Helvetica Neue", Arial, sans-serif';

// The empty cream area the background leaves for text: below the logo/nav
// row, left of the mountain, above the decorative wavy lines.
const TEXT_LEFT = 200;
const TEXT_TOP = 430;
const TEXT_MAX_WIDTH = 1040;

let backgroundImagePromise: Promise<HTMLImageElement | null> | null = null;

// Same web-only canvas pattern as lib/colorFromImage.ts — reading/drawing
// pixels needs a DOM canvas, which only exists on web; native callers get
// null and the caller falls back to "no thumbnail available here".
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

function loadBackground(): Promise<HTMLImageElement | null> {
  if (!backgroundImagePromise) backgroundImagePromise = loadImage(BACKGROUND_MODULE);
  return backgroundImagePromise;
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
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

// Renders a 1920×1080 thumbnail: the fixed Cantia background image, with
// the chapter's category and title laid over its empty area. Returns a PNG
// data URL ready to preview in an <Image> or hand to downloadFile().
// Web-only (see loadImage above).
export async function generateThumbnailDataUrl(title: string, category: string): Promise<string | null> {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return null;

  const background = await loadBackground();
  if (!background) return null;

  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.drawImage(background, 0, 0, WIDTH, HEIGHT);

  // Eyebrow (feature area) — small, brand-colored, sits just above the title.
  ctx.fillStyle = PRIMARY;
  ctx.font = `800 28px ${FONT_FAMILY}`;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(category.toUpperCase(), TEXT_LEFT, TEXT_TOP);

  // Title — auto-shrinks for long titles, wraps up to 3 lines, stays clear
  // of the mountain on the right and the decorative lines below.
  let titleSize = 76;
  let lines: string[] = [];
  do {
    ctx.font = `800 ${titleSize}px ${FONT_FAMILY}`;
    lines = wrapLines(ctx, title, TEXT_MAX_WIDTH);
    if (lines.length <= 3) break;
    titleSize -= 4;
  } while (titleSize > 42);
  lines = lines.slice(0, 3);

  ctx.fillStyle = TEXT;
  ctx.font = `800 ${titleSize}px ${FONT_FAMILY}`;
  const lineHeight = titleSize * 1.16;
  let y = TEXT_TOP + 74;
  for (const line of lines) {
    ctx.fillText(line, TEXT_LEFT, y);
    y += lineHeight;
  }

  return canvas.toDataURL('image/png');
}
