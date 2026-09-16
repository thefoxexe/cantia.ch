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
const PRIMARY_DARK = '#8A3D20';
const TEXT = '#231A12';
const TEXT_MUTED = '#6E6153';

// Official Swiss flag red — deliberately not the brand terracotta: the
// cross only reads as "Swiss" if it's drawn in the flag's actual color,
// not an approximation.
const SWISS_RED = '#D8232A';

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

// Manual roundRect — not relying on CanvasRenderingContext2D.roundRect,
// which is recent enough that not every engine this might render under
// (React Native Web's canvas polyfills, older WebViews) implements it.
function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// A correctly-proportioned Swiss cross (red square, white cross with
// slightly-inset arms) — drawn from shapes rather than an emoji glyph,
// which renders inconsistently (or as a plain "CH") depending on the
// system font a browser's canvas falls back to.
function drawSwissCross(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  const radius = size * 0.16;
  roundRectPath(ctx, x, y, size, size, radius);
  ctx.fillStyle = SWISS_RED;
  ctx.fill();

  const barWidth = size * 0.3;
  const inset = size * 0.19;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(x + (size - barWidth) / 2, y + inset, barWidth, size - inset * 2);
  ctx.fillRect(x + inset, y + (size - barWidth) / 2, size - inset * 2, barWidth);
}

// Renders a 1280×720 branded thumbnail for a tutorial video: logo mark,
// "Cantia" wordmark, an eyebrow pill for the feature area, the video title
// as the headline, and a Swiss-cross badge on a diagonal accent panel —
// Cantia's whole pitch is "built for Swiss construction," so the thumbnail
// says that at a glance, not just in the title text. Returns a PNG data
// URL ready to preview in an <Image> or hand to downloadFile().
// Web-only (see loadLogo above).
export async function generateThumbnailDataUrl(title: string, category: string): Promise<string | null> {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return null;

  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const marginX = 92;
  const panelX = WIDTH * 0.685;
  const skew = 96;

  // Base.
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Soft depth behind the panel before the panel itself, so the edge reads
  // as lifted rather than pasted flat onto the background.
  ctx.save();
  ctx.shadowColor = 'rgba(35, 26, 18, 0.22)';
  ctx.shadowBlur = 36;
  ctx.shadowOffsetX = -6;
  ctx.beginPath();
  ctx.moveTo(panelX + skew, 0);
  ctx.lineTo(WIDTH, 0);
  ctx.lineTo(WIDTH, HEIGHT);
  ctx.lineTo(panelX - skew, HEIGHT);
  ctx.closePath();
  const panelGradient = ctx.createLinearGradient(panelX, 0, WIDTH, HEIGHT);
  panelGradient.addColorStop(0, PRIMARY_DARK);
  panelGradient.addColorStop(1, PRIMARY);
  ctx.fillStyle = panelGradient;
  ctx.fill();
  ctx.restore();

  // Swiss cross badge + label, centered in the panel's upper half.
  const badgeSize = 120;
  const badgeX = WIDTH - 220;
  const badgeY = 108;
  drawSwissCross(ctx, badgeX, badgeY, badgeSize);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `800 24px ${FONT_FAMILY}`;
  ctx.textAlign = 'center';
  ctx.fillText('SUISSE', badgeX + badgeSize / 2, badgeY + badgeSize + 40);
  ctx.textAlign = 'left';

  // Top accent bar.
  ctx.fillStyle = TEXT;
  ctx.fillRect(0, 0, WIDTH, 10);

  // Logo mark + wordmark.
  const logo = await loadLogo();
  const logoSize = 72;
  const logoY = 76;
  if (logo) ctx.drawImage(logo, marginX, logoY, logoSize, logoSize);
  ctx.fillStyle = TEXT;
  ctx.textBaseline = 'middle';
  ctx.font = `700 42px ${FONT_FAMILY}`;
  ctx.fillText('Cantia', marginX + (logo ? logoSize + 18 : 0), logoY + logoSize / 2 + 2);

  // Eyebrow, on a soft pill for a more editorial, less "plain label" feel.
  ctx.textBaseline = 'alphabetic';
  const eyebrowText = category.toUpperCase();
  const eyebrowFont = `800 26px ${FONT_FAMILY}`;
  ctx.font = eyebrowFont;
  const eyebrowWidth = ctx.measureText(eyebrowText).width;
  const eyebrowY = 268;
  const pillPaddingX = 20;
  const pillHeight = 46;
  roundRectPath(ctx, marginX, eyebrowY - 32, eyebrowWidth + pillPaddingX * 2, pillHeight, pillHeight / 2);
  ctx.fillStyle = ACCENT_SOFT;
  ctx.fill();
  ctx.fillStyle = PRIMARY_DARK;
  ctx.font = eyebrowFont;
  ctx.fillText(eyebrowText, marginX + pillPaddingX, eyebrowY);

  // Title — auto-shrinks for long titles, wraps up to 3 lines, always
  // staying clear of the diagonal panel.
  const maxWidth = panelX - skew - marginX - 40;
  let titleSize = 70;
  let lines: string[] = [];
  do {
    ctx.font = `800 ${titleSize}px ${FONT_FAMILY}`;
    lines = wrapLines(ctx, title, maxWidth);
    if (lines.length <= 3) break;
    titleSize -= 4;
  } while (titleSize > 38);
  lines = lines.slice(0, 3);

  ctx.fillStyle = TEXT;
  ctx.font = `800 ${titleSize}px ${FONT_FAMILY}`;
  const lineHeight = titleSize * 1.14;
  let y = 356;
  for (const line of lines) {
    ctx.fillText(line, marginX, y);
    y += lineHeight;
  }

  // Footer: small brand tag + separator dot + domain, understated on
  // purpose — the title is the headline, this is just a signature.
  ctx.fillStyle = TEXT_MUTED;
  ctx.font = `600 25px ${FONT_FAMILY}`;
  const footerY = HEIGHT - 64;
  ctx.fillText('Tutoriel Cantia', marginX, footerY);
  const tagWidth = ctx.measureText('Tutoriel Cantia').width;
  ctx.fillStyle = PRIMARY;
  ctx.beginPath();
  ctx.arc(marginX + tagWidth + 22, footerY - 9, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = TEXT_MUTED;
  ctx.fillText('cantia.ch', marginX + tagWidth + 40, footerY);

  return canvas.toDataURL('image/png');
}
