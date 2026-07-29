import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Network from 'expo-network';
import { deletePersistedPhoto, persistPickedPhoto, resolvePersistedPhoto } from './blobStore';
import { assetFileInfo } from '../imageAsset';
import { addPhotoEntry } from '../api/feed';

const STORAGE_KEY = 'cantia:offlinePhotoQueue';

export interface QueuedPhoto {
  id: string;
  organizationId: string;
  projectId: string;
  userId: string | undefined;
  mimeType: string | null;
  caption: string;
  latitude: number | null;
  longitude: number | null;
  takenAt: string;
  blobRef: string;
}

async function readQueue(): Promise<QueuedPhoto[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as QueuedPhoto[];
  } catch {
    return [];
  }
}

async function writeQueue(queue: QueuedPhoto[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

export async function enqueuePhoto(params: {
  organizationId: string;
  projectId: string;
  userId: string | undefined;
  uri: string;
  mimeType: string | null;
  caption: string;
  latitude: number | null;
  longitude: number | null;
  takenAt: string;
}): Promise<QueuedPhoto> {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const { ext } = assetFileInfo({ uri: params.uri, mimeType: params.mimeType });
  const blobRef = await persistPickedPhoto(id, params.uri, ext);
  const item: QueuedPhoto = {
    id,
    organizationId: params.organizationId,
    projectId: params.projectId,
    userId: params.userId,
    mimeType: params.mimeType,
    caption: params.caption,
    latitude: params.latitude,
    longitude: params.longitude,
    takenAt: params.takenAt,
    blobRef,
  };
  const queue = await readQueue();
  queue.push(item);
  await writeQueue(queue);
  return item;
}

export async function listQueuedPhotos(projectId: string): Promise<QueuedPhoto[]> {
  const queue = await readQueue();
  return queue.filter((q) => q.projectId === projectId);
}

export async function resolveQueuedPhotoUri(item: QueuedPhoto): Promise<string> {
  return resolvePersistedPhoto(item.blobRef);
}

async function removeFromQueue(id: string): Promise<void> {
  const queue = await readQueue();
  const item = queue.find((q) => q.id === id);
  await writeQueue(queue.filter((q) => q.id !== id));
  if (item) await deletePersistedPhoto(item.blobRef);
}

export async function isOffline(): Promise<boolean> {
  try {
    const state = await Network.getNetworkStateAsync();
    return state.isConnected === false || state.isInternetReachable === false;
  } catch {
    // If the check itself fails, don't assume offline — let the real
    // upload attempt decide.
    return false;
  }
}

let flushing = false;

// Tries to send every queued photo for every project — safe to call
// repeatedly (network regain, app foreground, screen focus) thanks to the
// lock, and each photo is dropped from the queue only once actually
// confirmed sent, so a mid-flush failure just leaves the rest for later.
export async function flushPhotoQueue(): Promise<number> {
  if (flushing) return 0;
  flushing = true;
  let sent = 0;
  try {
    if (await isOffline()) return 0;
    const queue = await readQueue();
    for (const item of queue) {
      try {
        const uri = await resolveQueuedPhotoUri(item);
        const { error, entry } = await addPhotoEntry({
          organizationId: item.organizationId,
          projectId: item.projectId,
          userId: item.userId,
          uri,
          mimeType: item.mimeType,
          caption: item.caption,
          latitude: item.latitude,
          longitude: item.longitude,
          takenAt: item.takenAt,
        });
        if (error || !entry) continue;
        await removeFromQueue(item.id);
        sent += 1;
      } catch {
        // network blip mid-item — stays queued, retried on the next flush
      }
    }
  } finally {
    flushing = false;
  }
  return sent;
}
