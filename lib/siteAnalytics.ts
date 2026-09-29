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
// cookie scoped to ".cantia.ch" (see writeSharedCookie below) so it survives
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

// ".cantia.ch" makes a cookie readable from both cantia.ch and
// app.cantia.ch. That domain attribute is rejected by the browser anywhere
// else (localhost, Netlify preview URLs), so fall back to a host-only cookie
// there — fine, since there's no cross-domain jump to survive in those
// environments anyway.
function writeSharedCookie(name: string, payload: unknown): void {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  try {
    const value = encodeURIComponent(JSON.stringify(payload));
    const maxAge = ATTR_MAX_AGE_DAYS * 24 * 60 * 60;
    const host = window.location.hostname;
    const domainAttr = host.endsWith('cantia.ch') ? '; domain=.cantia.ch' : '';
    document.cookie = `${name}=${value}; path=/; max-age=${maxAge}${domainAttr}; SameSite=Lax`;
  } catch {
    // Storage blocked — attribution just won't survive to signup.
  }
}

// ---------------------------------------------------------------------------
// Consent. The campaign attribution cookie below is
// only written once the visitor accepted it in the cookie banner
// (components/CookieBanner.tsx). Until then, what arrived in the URL waits
// in sessionStorage, and is written the moment they accept.
export type CookieConsent = 'accepted' | 'refused';
const CONSENT_KEY = 'cantia_cookie_consent';
const PENDING_ATTR_KEY = 'cantia_attr_pending';

// The choice itself lives in a .cantia.ch cookie (plus localStorage as a
// fallback) so that app.cantia.ch, where the signup conversion fires, knows
// it too. app/+html.tsx reads that cookie before Google's tag loads.
export function getCookieConsent(): CookieConsent | null {
  if (typeof window === 'undefined') return null;
  const fromCookie = readCookie(CONSENT_KEY);
  if (fromCookie === 'accepted' || fromCookie === 'refused') return fromCookie;
  try {
    const value = window.localStorage.getItem(CONSENT_KEY);
    return value === 'accepted' || value === 'refused' ? value : null;
  } catch {
    return null;
  }
}

export function setCookieConsent(value: CookieConsent): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CONSENT_KEY, value);
    const host = window.location.hostname;
    const domainAttr = host.endsWith('cantia.ch') ? '; domain=.cantia.ch' : '';
    document.cookie = `${CONSENT_KEY}=${value}; path=/; max-age=${365 * 24 * 60 * 60}${domainAttr}; SameSite=Lax`;
  } catch {
    // Blocked storage: the banner simply shows again next visit.
  }
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  if (value === 'accepted') {
    gtag?.('consent', 'update', { ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted', analytics_storage: 'granted' });
    const attr = takePending<Attribution>(PENDING_ATTR_KEY);
    if (attr && !readCookie(ATTR_COOKIE)) writeSharedCookie(ATTR_COOKIE, attr);
  } else {
    takePending(PENDING_ATTR_KEY);
  }
}

function stashPending(key: string, payload: unknown): void {
  try {
    if (!window.sessionStorage.getItem(key)) window.sessionStorage.setItem(key, JSON.stringify(payload));
  } catch {
    // Nothing to do: without storage the visit simply isn't attributed.
  }
}

function takePending<T>(key: string): T | null {
  try {
    const raw = window.sessionStorage.getItem(key);
    window.sessionStorage.removeItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

// First-touch attribution: captured once per visitor and never overwritten
// by a later, unrelated (organic) visit, so a signup that happens days
// after someone clicked an ad still credits that original campaign.
function captureAttribution(): void {
  if (readCookie(ATTR_COOKIE)) return;
  const attr = readUrlAttribution();
  if (!attr) return;
  if (getCookieConsent() === 'accepted') writeSharedCookie(ATTR_COOKIE, attr);
  else if (getCookieConsent() === null) stashPending(PENDING_ATTR_KEY, attr);
}

// ---------------------------------------------------------------------------
// Cantia Partners referral links (https://cantia.ch/?ref=CODE, also
// accepted on app.cantia.ch). Every click is logged server-side
// (record_referral_click, anonymous visitor id only).
//
// The code is kept first-touch for 90 days in a .cantia.ch cookie. Unlike
// the campaign cookie it does not wait for the cookie banner: it only
// carries the partner's code (no advertising, no third party) and is what
// the partner contract relies on, so it is a functional cookie (described
// on /confidentialite). It is written right away, before the click is
// validated, so a visitor who goes to sign up within the same second still
// carries it; an unknown code is removed once the server answers.
//
// At signup the code is copied onto the user (auth metadata), and the
// company is attributed in the same transaction as its creation
// (supabase/migrations/20260929190000_partners_attribution_hardening.sql).
const REF_COOKIE = 'cantia_ref';
const REF_PATTERN = /^[A-Z0-9]{6,12}$/;

export interface StoredReferral {
  code: string;
  visitor_id: string;
  first_click_at: string;
}

let lastReferralCode: string | null = null;

function captureReferral(path: string): void {
  const raw = new URLSearchParams(window.location.search).get('ref');
  const code = raw?.trim().toUpperCase() ?? '';
  if (!REF_PATTERN.test(code) || code === lastReferralCode) return;
  lastReferralCode = code;
  const visitorId = getVisitorId();
  const utm = readUrlAttribution();
  const firstTouch = !readCookie(REF_COOKIE);
  if (firstTouch) writeSharedCookie(REF_COOKIE, { code, visitor_id: visitorId, first_click_at: new Date().toISOString() } satisfies StoredReferral);
  supabase
    .rpc('record_referral_click', {
      p_code: code,
      p_visitor_id: visitorId,
      p_landing_page: path,
      p_referrer: document.referrer || null,
      p_utm: utm ?? {},
    })
    .then(({ data, error }) => {
      if (error || !firstTouch) return;
      if ((data as { valid?: boolean } | null)?.valid === false && getStoredReferral()?.code === code) removeSharedCookie(REF_COOKIE);
    });
}

function removeSharedCookie(name: string): void {
  try {
    const host = window.location.hostname;
    const domainAttr = host.endsWith('cantia.ch') ? '; domain=.cantia.ch' : '';
    document.cookie = `${name}=; path=/; max-age=0${domainAttr}; SameSite=Lax`;
  } catch {
    // Nothing to remove.
  }
}

// Cantia Accounting: a fiduciary's invitation link
// (app.cantia.ch/signup?fiduciary_invite=TOKEN&ref=CODE). The token is
// kept 30 days, copied onto the account at signup, and the new company is
// linked to the firm (waiting for the client's consent) when it is created
// (supabase/migrations/20260929210000_accounting_foundation.sql).
const FIDUCIARY_INVITE_COOKIE = 'cantia_fid_invite';

function captureFiduciaryInvite(): void {
  const token = new URLSearchParams(window.location.search).get('fiduciary_invite')?.trim() ?? '';
  if (!/^[a-f0-9]{24,64}$/.test(token)) return;
  try {
    const host = window.location.hostname;
    const domainAttr = host.endsWith('cantia.ch') ? '; domain=.cantia.ch' : '';
    document.cookie = `${FIDUCIARY_INVITE_COOKIE}=${token}; path=/; max-age=${30 * 24 * 60 * 60}${domainAttr}; SameSite=Lax`;
  } catch {
    // Without storage the link still works through the signup page.
  }
}

export function getStoredFiduciaryInvite(): string | null {
  const token = readCookie(FIDUCIARY_INVITE_COOKIE);
  return token && /^[a-f0-9]{24,64}$/.test(token) ? token : null;
}

// Read back on app.cantia.ch right after the organization is created.
export function getStoredReferral(): StoredReferral | null {
  const raw = readCookie(REF_COOKIE);
  if (!raw) return null;
  try {
    const ref = JSON.parse(raw) as StoredReferral;
    return REF_PATTERN.test(ref.code) ? ref : null;
  } catch {
    return null;
  }
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
  if (typeof window === 'undefined') return;
  // Partner links work on cantia.ch and on app.cantia.ch alike.
  if (isMarketingHost() || window.location.hostname.endsWith('cantia.ch')) captureReferral(path);
  captureFiduciaryInvite();
  if (!isMarketingHost()) return;
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
