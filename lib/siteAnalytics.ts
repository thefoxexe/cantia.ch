import { supabase } from './supabase';
import { isMarketingHost } from './appHost';

// Self-hosted pageview logging for the marketing site — no third-party
// script, no tracking cookie. The visitor id is a random UUID kept in
// localStorage purely to compute "unique visitors" (deduping repeat visits
// from the same browser); it never leaves this domain and carries no PII.
// Gated to isMarketingHost() so the authenticated app (app.cantia.ch) is
// never counted as "site traffic".
const VISITOR_KEY = 'cantia_visitor_id';

function randomId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  // Older/insecure-context fallback — still unique enough for a dedup key.
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function getVisitorId(): string {
  try {
    const existing = window.localStorage.getItem(VISITOR_KEY);
    if (existing) return existing;
    const id = randomId();
    window.localStorage.setItem(VISITOR_KEY, id);
    return id;
  } catch {
    // Private browsing / storage blocked: still log the pageview, it just
    // won't dedup into "unique visitors" for this visit.
    return randomId();
  }
}

let lastTrackedPath: string | null = null;

export function trackPageview(path: string): void {
  if (typeof window === 'undefined' || !isMarketingHost()) return;
  if (path === lastTrackedPath) return;
  lastTrackedPath = path;

  supabase
    .from('site_pageviews')
    .insert({ path, visitor_id: getVisitorId(), referrer: document.referrer || null })
    .then(({ error }) => {
      if (error) console.error('[analytics] pageview insert failed:', error.message);
    });
}
