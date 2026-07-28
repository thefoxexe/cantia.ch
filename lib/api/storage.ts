import { supabase, STORAGE_BUCKET } from '../supabase';

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

export async function deleteFromOrgBucket(path: string): Promise<{ error: string | null }> {
  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([path]);
  return { error: error?.message ?? null };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  const units = ['Ko', 'Mo', 'Go'];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}
