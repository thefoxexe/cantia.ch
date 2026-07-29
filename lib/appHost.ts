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

export function isAppHost(): boolean {
  return hostname() === APP_HOST;
}

// Href for the "Se connecter" / "Créer un compte" links on the marketing
// site: on cantia.ch these must cross over to app.cantia.ch (the browser
// address bar should end up there); everywhere else, keep the normal
// same-origin Expo Router path so dev/preview builds keep working.
export function authHref(kind: 'login' | 'signup'): string {
  if (isMarketingHost()) return `https://${APP_HOST}/${kind}`;
  return `/(auth)/${kind}`;
}
