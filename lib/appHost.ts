import { useEffect } from 'react';
import { Platform } from 'react-native';
import { usePathname } from 'expo-router';
import { forceLocale, getAppLocale } from './translations';

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
// every /de/* route is a straight mirror of its French counterpart at the
// same path minus the prefix (see app/de/**), so toggling is just adding or
// stripping "/de" rather than a per-page lookup table.
export function toggleLocalePathname(pathname: string, targetLocale: 'fr' | 'de'): string {
  const isDe = pathname === '/de' || pathname.startsWith('/de/');
  const bare = isDe ? pathname.slice(3) || '/' : pathname;
  if (targetLocale === 'fr') return bare;
  return bare === '/' ? '/de' : `/de${bare}`;
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

// Every /de/* route module calls forceLocale('de') at module scope, but
// each of those web routes is code-split (dynamically imported the first
// time it's actually navigated to) — so that call fires exactly once, the
// first time a visitor's session ever loads that particular module, and
// never again. A client-side <Link> transition later back to a bare French
// page doesn't re-run it (the module's already loaded) and, critically, the
// French pages themselves never called the equivalent forceLocale('fr') at
// all — there was nothing to reset i18next's in-memory language back to
// French after a visit to a German page, so it just stayed German. Call this
// hook from the top of every marketing page/chrome component (not just
// MarketingNav — the homepage has its own separate nav and needs it too) to
// keep the visible language matching the current URL on every navigation,
// however many times a visitor toggles between French and German.
export function useSyncMarketingLocaleFromPath(): void {
  const pathname = usePathname();
  useEffect(() => {
    const isDe = pathname === '/de' || pathname.startsWith('/de/');
    forceLocale(isDe ? 'de' : 'fr');
  }, [pathname]);
}
