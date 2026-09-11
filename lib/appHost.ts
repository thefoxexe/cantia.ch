import { useEffect } from 'react';
import { Platform } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { forceLocale, getAppLocale, type AppLocale } from './translations';

// The marketing site (cantia.ch) and the authenticated app (app.cantia.ch)
// are the same Expo Router web build, deployed once and reachable under two
// domains — which one is which is decided at runtime from the hostname, not
// by two separate builds. Anywhere else (localhost, a Netlify preview URL,
// native), links stay same-origin so local dev is unaffected.
const MARKETING_HOSTS = ['cantia.ch', 'www.cantia.ch'];
const APP_HOST = 'app.cantia.ch';

function hostname(): string | null {
  return typeof window !== 'undefined' && window.location ? window.location.hostname : null;
}

export function isMarketingHost(): boolean {
  const h = hostname();
  return h != null && MARKETING_HOSTS.includes(h);
}

// The compiled Android/iOS app has no hostname to read — it's never the
// marketing site, always the app, so it must behave like app.cantia.ch:
// no landing page, straight to login (or the dashboard once session-checked).
export function isAppHost(): boolean {
  if (Platform.OS !== 'web') return true;
  return hostname() === APP_HOST;
}

// cantia.ch and app.cantia.ch are one static export (see the comment up
// top), so app/+html.tsx can't give app.cantia.ch a different <head> at
// build time — it has to opt itself out of indexing at runtime instead.
// Safe to call on every platform: a no-op off-web or on the marketing host.
export function excludeAppHostFromIndexing(): void {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  if (!isAppHost()) return;
  if (document.querySelector('meta[name="robots"]')) return;
  const meta = document.createElement('meta');
  meta.name = 'robots';
  meta.content = 'noindex, nofollow';
  document.head.appendChild(meta);
}

// Href for the "Se connecter" / "Créer un compte" links on the marketing
// site: on cantia.ch these must cross over to app.cantia.ch (the browser
// address bar should end up there); everywhere else, keep the normal
// same-origin Expo Router path so dev/preview builds keep working. Always
// carries the current locale as an explicit query param — a real
// cross-origin navigation loses any in-memory state, so the URL is the only
// way a visitor reading the German marketing site lands on a German signup
// screen (see applyLocaleFromUrlParam in lib/translations, which reads this
// back on the app host). Deliberately NOT skipped for French (the default):
// app.cantia.ch's own AsyncStorage cache can be stale from an earlier visit
// in the same browser (a different account, an earlier /de test, ...), and
// before an organization exists there's nothing in the DB yet to reconcile
// it against (loadOrganization's dbLocale check only kicks in once
// organization_members has a row) — so a French visitor with no explicit
// signal would silently inherit that stale cache through the entire
// onboarding flow (create/join-organization, choose-plan) until an org
// finally loads. An explicit ?locale=fr closes that gap the same way
// ?locale=de already did.
export function authHref(kind: 'login' | 'signup'): string {
  const locale = getAppLocale();
  if (isMarketingHost()) return `https://${APP_HOST}/${kind}?locale=${locale}`;
  return `/(auth)/${kind}?locale=${locale}`;
}

// Maps the current marketing pathname onto its other-language equivalent —
// every /de/* or /it/* route is a straight mirror of its French counterpart
// at the same path minus the prefix (see app/de/**, app/it/**), so toggling
// is just swapping the prefix rather than a per-page lookup table.
const LOCALE_PATH_PREFIXES: Record<'fr' | 'de' | 'it', string> = { fr: '', de: '/de', it: '/it' };

export function toggleLocalePathname(pathname: string, targetLocale: 'fr' | 'de' | 'it'): string {
  const prefixed = (['de', 'it'] as const).find((loc) => pathname === `/${loc}` || pathname.startsWith(`/${loc}/`));
  const bare = prefixed ? pathname.slice(1 + prefixed.length) || '/' : pathname;
  const targetPrefix = LOCALE_PATH_PREFIXES[targetLocale];
  if (!targetPrefix) return bare;
  return bare === '/' ? targetPrefix : `${targetPrefix}${bare}`;
}

// The in-app "Aide" screen used to duplicate the marketing site's Centre
// d'aide with its own (worse) UI — two pages with the same content drifting
// apart. There's only one now: everywhere inside the app (profile menu,
// Compte), "Aide" opens the real cantia.ch/aide, same as the marketing nav.
// Already being on the marketing site itself is the one case that stays
// same-origin, so clicking Aide there doesn't pointlessly open a new tab to
// itself.
export function helpHref(): string {
  if (isMarketingHost()) return '/aide';
  return 'https://cantia.ch/aide';
}

// Same cross-host pattern as helpHref() above, for the support popup's
// "contact form" option — the form itself only exists on the marketing
// build's /contact page.
export function contactHref(): string {
  const locale = getAppLocale();
  const path = locale === 'de' ? '/de/contact' : locale === 'it' ? '/it/contact' : '/contact';
  if (isMarketingHost()) return path;
  return `https://cantia.ch${path}`;
}

// Same cross-host pattern as helpHref()/contactHref() above, for the small
// "back to the site" arrow on login/signup — those screens are reachable
// directly (a bookmark, a shared link) without ever having come from the
// marketing site in this browser tab, so there's no in-app history to just
// go "back" to.
export function siteHomeHref(): string {
  const locale = getAppLocale();
  const path = locale === 'de' ? '/de' : locale === 'it' ? '/it' : '/';
  if (isMarketingHost()) return path;
  return `https://cantia.ch${path}`;
}

// Slugs for the dedicated per-plan marketing pages (app/plans/*.tsx),
// keyed by the `plans.id` value from Supabase — kept here rather than in
// the `plans` table itself since it's purely a URL concern, not data.
const PLAN_SLUGS: Record<string, string> = { solo: 'essentiel', equipe: 'equipe', pro: 'entreprise' };

// Href for a plan's dedicated marketing page ("En savoir plus" from a
// pricing card), cross-host the same way contactHref() is: from inside the
// app (choose-plan) this must reach the marketing build, since that's the
// only place these pages are served from.
export function planHref(planId: string): string {
  const slug = PLAN_SLUGS[planId] ?? planId;
  const locale = getAppLocale();
  const path = locale === 'de' ? `/de/plans/${slug}` : locale === 'it' ? `/it/plans/${slug}` : `/plans/${slug}`;
  if (isMarketingHost()) return path;
  return `https://cantia.ch${path}`;
}

// Every /de/* or /it/* route module calls forceLocale(...) at module scope,
// but each of those web routes is code-split (dynamically imported the
// first time it's actually navigated to) — so that call fires exactly once,
// the first time a visitor's session ever loads that particular module, and
// never again. A client-side <Link> transition later back to a bare French
// page doesn't re-run it (the module's already loaded) and, critically, the
// French pages themselves never called the equivalent forceLocale('fr') at
// all — there was nothing to reset i18next's in-memory language back to
// French after a visit to a German/Italian page, so it just stayed German/
// Italian. Call this hook from the top of every marketing page/chrome
// component (not just MarketingNav — the homepage has its own separate nav
// and needs it too) to keep the visible language matching the current URL
// on every navigation, however many times a visitor toggles between
// languages. Determines the target locale from the same prefix map
// toggleLocalePathname uses, so a 3rd (or Nth) language only needs adding
// there — this derives itself instead of hand-rolling its own binary check
// (the bug that made /it silently fall back to French: this used to check
// only for a "/de" prefix and force French for anything else, /it included).
export function useSyncMarketingLocaleFromPath(): void {
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => {
    const prefixed = (['de', 'it'] as const).find((loc) => pathname === `/${loc}` || pathname.startsWith(`/${loc}/`));
    forceLocale(prefixed ?? 'fr');
  }, [pathname]);
  useRedirectToBrowserLocaleOnce(pathname, router);
}

// Runs once per page-load session (not on every navigation — a module-level
// flag, not per-pathname, so it never re-fires just because a visitor's
// later, deliberate LangToggle click happens to land back on "/"): if a
// fresh visit's very first marketing page is the bare French homepage and
// the browser's own language is German or Italian, replace it with that
// language's mirror before the visitor even sees the French version. Any
// other landing page (a deep link, a /de or /it URL, a French page the
// visitor navigated back to) leaves the flag set without redirecting, so a
// visitor who explicitly switches back to French is never yanked away
// again. No match (or anything other than fr/de/it) keeps French, same as
// the site's existing default.
let hasCheckedBrowserLocale = false;

function detectBrowserLocale(): AppLocale | null {
  if (typeof navigator === 'undefined') return null;
  const lang = navigator.language?.slice(0, 2).toLowerCase();
  return lang === 'de' || lang === 'it' ? lang : null;
}

function useRedirectToBrowserLocaleOnce(pathname: string, router: ReturnType<typeof useRouter>): void {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    if (hasCheckedBrowserLocale) return;
    hasCheckedBrowserLocale = true;
    if (pathname !== '/') return;
    if (new URLSearchParams(window.location.search).has('locale')) return;
    const detected = detectBrowserLocale();
    if (!detected) return;
    router.replace(toggleLocalePathname(pathname, detected) as any);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
