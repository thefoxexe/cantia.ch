import { supabase } from '../supabase';

// Which screens a company uses in the app, for Super Admin › Entreprises:
// one counter per company, person, screen and day (org_track). The screen
// is the route without ids ("chantiers.id.gantt"). Fire-and-forget.

const DEDUPE_MS = 30_000;
const lastSent = new Map<string, number>();

export function routeArea(segments: string[]): string {
  const parts = segments
    .filter((s) => !s.startsWith('(') && s !== 'index')
    .map((s) => (s.startsWith('[') ? 'id' : s.toLowerCase().replace(/[^a-z0-9_-]/g, '-')));
  return (parts.join('.') || 'accueil').slice(0, 80);
}

export function trackOrgScreen(organizationId: string, area: string): void {
  const key = `${organizationId}:${area}`;
  const now = Date.now();
  if (now - (lastSent.get(key) ?? 0) < DEDUPE_MS) return;
  lastSent.set(key, now);
  supabase.rpc('org_track', { p_org: organizationId, p_area: area }).then(
    () => {},
    () => {},
  );
}
