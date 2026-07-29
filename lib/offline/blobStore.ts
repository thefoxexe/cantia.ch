import { Directory, File, Paths } from 'expo-file-system';

// Native persistence for queued photos: copy the picker's (often cache-dir)
// asset into the app's document directory, which the OS doesn't clear the
// way it can clear caches — so a photo taken with no signal survives an
// app restart until it's actually sent.
const QUEUE_DIR_NAME = 'pending-photos';

function queueDir(): Directory {
  const dir = new Directory(Paths.document, QUEUE_DIR_NAME);
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  return dir;
}

export async function persistPickedPhoto(id: string, sourceUri: string, ext: string): Promise<string> {
  const dest = new File(queueDir(), `${id}.${ext}`);
  const source = new File(sourceUri);
  await source.copy(dest);
  return dest.uri;
}

export async function resolvePersistedPhoto(ref: string): Promise<string> {
  return ref;
}

export async function deletePersistedPhoto(ref: string): Promise<void> {
  try {
    const file = new File(ref);
    if (file.exists) file.delete();
  } catch {
    // best-effort cleanup — a leftover file in the app's own sandboxed
    // directory isn't worth surfacing an error for.
  }
}
