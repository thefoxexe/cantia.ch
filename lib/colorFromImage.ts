import { Platform } from 'react-native';

// Extracts a representative brand color from an uploaded logo by averaging
// its opaque, non-near-white/near-black pixels — logos are usually a flat
// mark on a transparent or white background, so excluding those extremes
// keeps the average from being washed out toward white/black and closer to
// the actual "brand" hue instead.
//
// Web-only: reading pixel data needs a canvas, and React Native has no
// equivalent without a native image-processing dependency (which would need
// its own EAS rebuild + device testing to verify). Desktop/web is also the
// common way a logo file gets uploaded in the first place, so this covers
// the common case; native callers just get null and the manual color picker
// still works as before.
export async function suggestBrandColorFromImage(uri: string): Promise<string | null> {
  if (Platform.OS !== 'web') return null;
  try {
    const ImageCtor = (globalThis as any).Image;
    if (!ImageCtor || typeof document === 'undefined') return null;

    const img = new ImageCtor();
    img.crossOrigin = 'anonymous';
    const loaded = await new Promise<boolean>((resolve) => {
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = uri;
    });
    if (!loaded) return null;

    const size = 48;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, size, size);

    let data: Uint8ClampedArray;
    try {
      data = ctx.getImageData(0, 0, size, size).data;
    } catch {
      // Cross-origin/tainted canvas — no way to read pixels.
      return null;
    }

    let r = 0;
    let g = 0;
    let b = 0;
    let count = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 128) continue; // transparent
      const rr = data[i];
      const gg = data[i + 1];
      const bb = data[i + 2];
      const luminance = (rr + gg + bb) / 3;
      if (luminance > 235 || luminance < 20) continue; // near-white/black background or outline
      r += rr;
      g += gg;
      b += bb;
      count += 1;
    }
    if (count === 0) return null;

    const toHex = (sum: number) => Math.round(sum / count).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  } catch {
    return null;
  }
}
