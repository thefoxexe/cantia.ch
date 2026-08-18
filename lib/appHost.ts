import { Platform } from 'react-native';

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
// same-origin Expo Router path so dev/preview builds keep working.
export function authHref(kind: 'login' | 'signup'): string {
  if (isMarketingHost()) return `https://${APP_HOST}/${kind}`;
  return `/(auth)/${kind}`;
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
