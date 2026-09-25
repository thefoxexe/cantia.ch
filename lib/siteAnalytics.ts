import { supabase } from './supabase';
import { isMarketingHost } from './appHost';

// Self-hosted pageview logging for the marketing site — no third-party
// script, no ad-tracking cookie. The visitor id is a random UUID kept in
// localStorage purely to compute "unique visitors" (deduping repeat visits
// from the same browser); it never leaves this domain and carries no PII.
// Gated to isMarketingHost() so the authenticated app (app.cantia.ch) is
// never counted as "site traffic".
//
// Campaign attribution (UTM params, Google's gclid) is captured the same
// way: no PII, first-party only, and — unlike the visitor id — shared via a
// cookie scoped to ".cantia.ch" (see writeAttrCookie below) so it survives
// the cross-domain jump from cantia.ch (where an ad lands) to
// app.cantia.ch (where signup actually happens), letting a signup be
// credited to the campaign that drove the original click.
const VISITOR_KEY = 'cantia_visitor_id';
const ATTR_COOKIE = 'cantia_attr';
const ATTR_MAX_AGE_DAYS = 90;

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

export interface Attribution {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  gclid: string | null;
}

function readUrlAttribution(): Attribution | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const attr: Attribution = {
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
    utm_content: params.get('utm_content'),
    utm_term: params.get('utm_term'),
    gclid: params.get('gclid'),
  };
  const hasAny = Object.values(attr).some((v) => v);
  return hasAny ? attr : null;
}

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function writeAttrCookie(attr: Attribution): void {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  try {
    const value = encodeURIComponent(JSON.stringify(attr));
    const maxAge = ATTR_MAX_AGE_DAYS * 24 * 60 * 60;
    // ".cantia.ch" makes the cookie readable from both cantia.ch and
    // app.cantia.ch. That domain attribute is rejected by the browser
    // anywhere else (localhost, Netlify preview URLs), so fall back to a
    // host-only cookie there — fine, since there's no cross-domain jump to
    // survive in those environments anyway.
    const host = window.location.hostname;
    const domainAttr = host.endsWith('cantia.ch') ? '; domain=.cantia.ch' : '';
    document.cookie = `${ATTR_COOKIE}=${value}; path=/; max-age=${maxAge}${domainAttr}`;
  } catch {
    // Storage blocked — attribution just won't survive to signup.
  }
}

// First-touch attribution: captured once per visitor and never overwritten
// by a later, unrelated (organic) visit, so a signup that happens days
// after someone clicked an ad still credits that original campaign.
function captureAttribution(): void {
  if (readCookie(ATTR_COOKIE)) return;
  const attr = readUrlAttribution();
  if (attr) writeAttrCookie(attr);
}

// Read back on app.cantia.ch at signup time (see lib/auth-context.tsx's
// createOrganization) to attribute the new organization to whatever
// campaign, if any, first brought its owner to the site.
export function getStoredAttribution(): Attribution | null {
  const raw = readCookie(ATTR_COOKIE);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Attribution;
  } catch {
    return null;
  }
}

let lastTrackedPath: string | null = null;

export function trackPageview(path: string): void {
  if (typeof window === 'undefined' || !isMarketingHost()) return;
  if (path === lastTrackedPath) return;
  lastTrackedPath = path;

  captureAttribution();
  // Recorded per-pageview from the live URL (not the persisted cookie) so
  // the traffic log shows exactly which campaign params arrived on which
  // page, independent of first-touch attribution used for signups.
  const urlAttr = readUrlAttribution();

  supabase
    .from('site_pageviews')
    .insert({
      path,
      visitor_id: getVisitorId(),
      referrer: document.referrer || null,
      utm_source: urlAttr?.utm_source ?? null,
      utm_medium: urlAttr?.utm_medium ?? null,
      utm_campaign: urlAttr?.utm_campaign ?? null,
      utm_content: urlAttr?.utm_content ?? null,
      utm_term: urlAttr?.utm_term ?? null,
      gclid: urlAttr?.gclid ?? null,
    })
    .then(({ error }) => {
      if (error) console.error('[analytics] pageview insert failed:', error.message);
    });
}
