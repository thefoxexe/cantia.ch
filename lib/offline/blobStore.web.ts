// Web persistence for queued photos. expo-file-system's File/Directory API
// is a no-op stub on web (no real filesystem access from the browser), and
// the picker's blob: URI dies the moment the tab reloads — so the only way
// a queued photo survives a page reload/offline stretch on web is to pull
// its bytes into IndexedDB (unlike localStorage, IndexedDB stores Blobs
// directly and isn't capped at a few MB).
const DB_NAME = 'cantia-offline';
const STORE_NAME = 'pending-photos';
const REF_PREFIX = 'idb:';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE_NAME)) req.result.createObjectStore(STORE_NAME);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function persistPickedPhoto(id: string, sourceUri: string, _ext: string): Promise<string> {
  const response = await fetch(sourceUri);
  const blob = await response.blob();
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(blob, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  return `${REF_PREFIX}${id}`;
}

export async function resolvePersistedPhoto(ref: string): Promise<string> {
  const id = ref.startsWith(REF_PREFIX) ? ref.slice(REF_PREFIX.length) : ref;
  const db = await openDb();
  const blob = await new Promise<Blob | undefined>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(id);
    req.onsuccess = () => resolve(req.result as Blob | undefined);
    req.onerror = () => reject(req.error);
  });
  if (!blob) throw new Error('Photo en attente introuvable dans le stockage local.');
  return URL.createObjectURL(blob);
}

export async function deletePersistedPhoto(ref: string): Promise<void> {
  const id = ref.startsWith(REF_PREFIX) ? ref.slice(REF_PREFIX.length) : ref;
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
