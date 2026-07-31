import * as ImageManipulator from 'expo-image-manipulator';

// Bakes EXIF orientation into actual pixel data by round-tripping the image
// through the native rendering pipeline with zero transformations. RN's
// <Image> respects EXIF orientation tags, but pdf-lib's embedJpg/embedPng do
// not — so a photo shot sideways with an EXIF "rotate" tag previewed
// correctly in the app yet came out rotated in generated PDFs. Re-encoding
// here means the stored file's pixels are already right-side-up by the time
// pdf-lib touches it. PNGs stay PNG (logos are often transparent-background
// PNGs; forcing JPEG would flatten that transparency onto a solid color).
export async function normalizeImageOrientation(
  uri: string,
  contentType: string,
): Promise<{ uri: string; ext: string; contentType: string }> {
  const isPng = contentType.includes('png');
  try {
    const image = await ImageManipulator.ImageManipulator.manipulate(uri).renderAsync();
    const result = await image.saveAsync({
      compress: 0.85,
      format: isPng ? ImageManipulator.SaveFormat.PNG : ImageManipulator.SaveFormat.JPEG,
    });
    return { uri: result.uri, ext: isPng ? 'png' : 'jpg', contentType: isPng ? 'image/png' : 'image/jpeg' };
  } catch {
    return { uri, ext: isPng ? 'png' : 'jpg', contentType };
  }
}

// Derives a safe file extension + content type for an uploaded image.
// expo-image-picker gives a reliable `mimeType` on both native and web —
// the previous approach of slicing the last "." off the asset's `uri`
// broke silently on web, where the picker returns a `blob:https://...`
// URL with no file extension in it at all. `.split('.').pop()` on that
// string returns the *entire* blob URL, which then got used as the
// storage object's file extension, producing an invalid path and a
// silently-swallowed upload failure (logo/photo picked but never saved).
export function assetFileInfo(asset: { uri: string; mimeType?: string | null; fileName?: string | null }): {
  ext: string;
  contentType: string;
} {
  const fromMime = mimeToExt(asset.mimeType);
  if (fromMime) return fromMime;

  const source = asset.fileName || asset.uri;
  const rawExt = (source.split('.').pop() ?? '').split('?')[0].toLowerCase();
  // A real extension is short and alphanumeric — a blob: URL with no dot
  // makes `rawExt` the whole string, which this guard rejects.
  const ext = /^[a-z0-9]{2,4}$/.test(rawExt) ? rawExt : 'jpg';
  return { ext, contentType: extToMime(ext) };
}

function mimeToExt(mimeType: string | null | undefined): { ext: string; contentType: string } | null {
  if (!mimeType) return null;
  const known: Record<string, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/webp': 'webp',
    'image/heic': 'heic',
    'image/heif': 'heif',
  };
  const ext = known[mimeType];
  if (!ext) return null;
  return { ext, contentType: mimeType };
}

function extToMime(ext: string): string {
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'heic') return 'image/heic';
  if (ext === 'heif') return 'image/heif';
  return 'image/jpeg';
}
