import * as Location from 'expo-location';

export async function captureLocation(): Promise<{ latitude: number | null; longitude: number | null }> {
  try {
    const perm = await Location.requestForegroundPermissionsAsync();
    if (!perm.granted) return { latitude: null, longitude: null };
    const loc = await Location.getCurrentPositionAsync({});
    return { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
  } catch {
    return { latitude: null, longitude: null };
  }
}

// Gallery photos can be old and taken anywhere, so we never stamp them with
// the device's current position — only their own EXIF GPS data, if present.
export function exifCoords(exif: Record<string, any> | null | undefined): { latitude: number | null; longitude: number | null } {
  if (!exif) return { latitude: null, longitude: null };
  const gps = exif.GPS ?? exif;
  let lat = gps?.Latitude ?? exif.GPSLatitude ?? null;
  let lon = gps?.Longitude ?? exif.GPSLongitude ?? null;
  if (typeof lat !== 'number' || typeof lon !== 'number') return { latitude: null, longitude: null };
  const latRef = gps?.LatitudeRef ?? exif.GPSLatitudeRef;
  const lonRef = gps?.LongitudeRef ?? exif.GPSLongitudeRef;
  if (latRef === 'S' && lat > 0) lat = -lat;
  if (lonRef === 'W' && lon > 0) lon = -lon;
  return { latitude: lat, longitude: lon };
}

export function exifTakenAt(exif: Record<string, any> | null | undefined): string {
  const raw = exif?.DateTimeOriginal ?? exif?.DateTime ?? exif?.['{Exif}']?.DateTimeOriginal;
  if (typeof raw === 'string') {
    // EXIF dates look like "2026:07:28 20:31:00" — convert to a parseable ISO-ish form.
    const iso = raw.replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3');
    const parsed = new Date(iso);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  }
  return new Date().toISOString();
}
