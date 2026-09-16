import { Platform } from 'react-native';
import { Asset } from 'expo-asset';

// YouTube's recommended thumbnail size.
const WIDTH = 1280;
const HEIGHT = 720;

// Cantia's real brand palette (lib/theme.ts) — kept in sync by hand since
// canvas drawing can't import theme tokens the way styled components do.
const BG = '#F7F1E6';
const ACCENT_SOFT = '#F6E4D2';
const PRIMARY = '#BC5A31';
const TEXT = '#231A12';
const TEXT_MUTED = '#6E6153';

const FONT_FAMILY = '"Helvetica Neue", Arial, sans-serif';

let logoImagePromise: Promise<HTMLImageElement | null> | null = null;

// Same web-only canvas pattern as lib/colorFromImage.ts — reading/drawing
// pixels needs a DOM canvas, which only exists on web; native callers get
// null and the caller falls back to "no thumbnail available here".
function loadLogo(): Promise<HTMLImageElement | null> {
  if (Platform.OS !== 'web') return Promise.resolve(null);
  if (!logoImagePromise) {
    logoImagePromise = (async () => {
      try {
        const asset = Asset.fromModule(require('../assets/logo-mark.png'));
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
  return logoImagePromise;
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

// Renders a 1280×720 branded thumbnail for a tutorial video — logo mark,
// "Cantia" wordmark, the feature area as an eyebrow, and the video title as
// the headline — and returns it as a PNG data URL ready to preview in an
// <Image> or hand to downloadFile(). Web-only (see loadLogo above).
export async function generateThumbnailDataUrl(title: string, category: string): Promise<string | null> {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return null;

  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const marginX = 96;

  // Background + soft decorative shapes, kept low-contrast so they never
  // fight the title for attention.
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.fillStyle = ACCENT_SOFT;
  ctx.beginPath();
  ctx.ellipse(WIDTH - 60, HEIGHT + 60, 560, 460, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(188, 90, 49, 0.09)';
  ctx.beginPath();
  ctx.ellipse(WIDTH + 40, -80, 440, 440, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = PRIMARY;
  ctx.fillRect(0, 0, WIDTH, 12);

  // Logo mark + wordmark.
  const logo = await loadLogo();
  const logoSize = 76;
  const logoY = 78;
  if (logo) ctx.drawImage(logo, marginX, logoY, logoSize, logoSize);
  ctx.fillStyle = TEXT;
  ctx.textBaseline = 'middle';
  ctx.font = `700 44px ${FONT_FAMILY}`;
  ctx.fillText('Cantia', marginX + (logo ? logoSize + 20 : 0), logoY + logoSize / 2 + 2);

  // Eyebrow (feature area).
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = PRIMARY;
  ctx.font = `800 30px ${FONT_FAMILY}`;
  ctx.fillText(category.toUpperCase(), marginX, 296);

  // Title — auto-shrinks for long titles, wraps up to 3 lines.
  const maxWidth = WIDTH - marginX - 140;
  let titleSize = 72;
  let lines: string[] = [];
  do {
    ctx.font = `800 ${titleSize}px ${FONT_FAMILY}`;
    lines = wrapLines(ctx, title, maxWidth);
    if (lines.length <= 3) break;
    titleSize -= 4;
  } while (titleSize > 40);
  lines = lines.slice(0, 3);

  ctx.fillStyle = TEXT;
  ctx.font = `800 ${titleSize}px ${FONT_FAMILY}`;
  const lineHeight = titleSize * 1.16;
  let y = 360;
  for (const line of lines) {
    ctx.fillText(line, marginX, y);
    y += lineHeight;
  }

  // Footer tag.
  ctx.fillStyle = TEXT_MUTED;
  ctx.font = `600 26px ${FONT_FAMILY}`;
  ctx.fillText('Tutoriel Cantia', marginX, HEIGHT - 64);

  return canvas.toDataURL('image/png');
}
