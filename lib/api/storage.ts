import { supabase, STORAGE_BUCKET } from '../supabase';
import { getAppLocale } from '../translations';

export async function uploadToOrgBucket(
  orgId: string,
  subPath: string,
  fileUri: string,
  contentType: string,
): Promise<{ path: string | null; error: string | null }> {
  try {
    const response = await fetch(fileUri);
    const blob = await response.blob();
    const path = `${orgId}/${subPath}`;
    const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, blob, {
      contentType,
      upsert: true,
    });
    if (error) return { path: null, error: error.message };
    return { path, error: null };
  } catch (err) {
    return { path: null, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function getSignedUrl(path: string, expiresInSeconds = 3600): Promise<string | null> {
  const { data, error } = await supabase.storage.from(STORAGE_BUCKET).createSignedUrl(path, expiresInSeconds);
  if (error) return null;
  return data.signedUrl;
}

export async function getSignedUrls(paths: string[], expiresInSeconds = 3600): Promise<Record<string, string>> {
  if (paths.length === 0) return {};
  const { data, error } = await supabase.storage.from(STORAGE_BUCKET).createSignedUrls(paths, expiresInSeconds);
  if (error || !data) return {};
  const map: Record<string, string> = {};
  for (const item of data) {
    if (item.path && item.signedUrl) map[item.path] = item.signedUrl;
  }
  return map;
}

export async function deleteFromOrgBucket(path: string): Promise<{ error: string | null }> {
  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([path]);
  return { error: error?.message ?? null };
}

// French uses octet-based units (o/Ko/Mo/Go), German uses byte-based
// units (B/KB/MB/GB) — same magnitudes, different abbreviations.
const BYTE_UNITS: Record<'fr' | 'de', { base: string; units: string[] }> = {
  fr: { base: 'o', units: ['Ko', 'Mo', 'Go'] },
  de: { base: 'B', units: ['KB', 'MB', 'GB'] },
};

export function formatBytes(bytes: number): string {
  const locale = getAppLocale();
  const { base, units } = BYTE_UNITS[locale] ?? BYTE_UNITS.fr;
  if (bytes < 1024) return `${bytes} ${base}`;
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}
