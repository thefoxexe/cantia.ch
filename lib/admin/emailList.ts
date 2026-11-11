import { Platform } from 'react-native';
import type { ExternalRecipient } from '../api/newsletterCampaign';

// The outside addresses of the e-mail being prepared (Super Admin › E-mails),
// kept in this browser until it is sent. Other admin pages (Nouvelles
// entreprises) add to the same list.
const KEY = 'cantia:admin-email-externals';
export const MAX_EXTERNAL = 200;

export function loadEmailList(): Map<string, ExternalRecipient> {
  try {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return new Map();
    const raw = JSON.parse(window.localStorage.getItem(KEY) || '[]');
    const list = Array.isArray(raw) ? (raw as ExternalRecipient[]).filter((r) => r && typeof r.email === 'string') : [];
    return new Map(list.map((r) => [r.email, r]));
  } catch {
    return new Map();
  }
}

export function saveEmailList(map: Map<string, ExternalRecipient>): void {
  try {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    if (map.size) window.localStorage.setItem(KEY, JSON.stringify([...map.values()]));
    else window.localStorage.removeItem(KEY);
  } catch {
    // Not kept: the list still works for this visit.
  }
}

// Adds (or updates) one address; false when the list is full.
export function addToEmailList(r: ExternalRecipient): boolean {
  const map = loadEmailList();
  if (!map.has(r.email) && map.size >= MAX_EXTERNAL) return false;
  map.set(r.email, { ...map.get(r.email), ...r });
  saveEmailList(map);
  return true;
}

export function isInEmailList(email: string | null | undefined): boolean {
  return !!email && loadEmailList().has(email.toLowerCase());
}
