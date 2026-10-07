import { Platform } from 'react-native';
import { isMarketingHost } from './appHost';

// Session replay + funnels for the marketing site (PostHog, EU region):
// where visitors click, scroll and leave before signing up. Loaded only
//  - on cantia.ch (never app.cantia.ch, which shows clients' own data),
//  - after "Accepter" in the cookie banner (components/CookieBanner.tsx),
//  - when EXPO_PUBLIC_POSTHOG_KEY is set (a public project key, phc_…).
// Every typed value is masked; the pages clients open from an email
// (devis, factures, documents, fiche de salaire) are never recorded.
const KEY = process.env.EXPO_PUBLIC_POSTHOG_KEY;
const PRIVATE_PREFIXES = ['/devis-client', '/facture-client', '/client-documents', '/travaux-supplementaires-client', '/salaire-employe'];

type PostHog = typeof import('posthog-js').default;
let ph: PostHog | null = null;
let loading = false;

export function isPrivatePath(pathname: string): boolean {
  return PRIVATE_PREFIXES.some((p) => pathname.startsWith(p));
}

export async function startSessionReplay(): Promise<void> {
  if (Platform.OS !== 'web' || !KEY || ph || loading || !isMarketingHost()) return;
  if (isPrivatePath(window.location.pathname)) return;
  loading = true;
  try {
    const { default: posthog } = await import('posthog-js');
    posthog.init(KEY, {
      api_host: 'https://eu.i.posthog.com',
      ui_host: 'https://eu.posthog.com',
      person_profiles: 'identified_only',
      capture_pageview: 'history_change',
      persistence: 'localStorage+cookie',
      session_recording: { maskAllInputs: true },
    });
    ph = posthog;
  } catch {
    // Blocked by an ad blocker: the site works the same without it.
  } finally {
    loading = false;
  }
}

// Follows client-side navigation: off on the private pages, back on elsewhere.
export function onRouteChange(pathname: string): void {
  if (!ph) return;
  if (isPrivatePath(pathname)) ph.stopSessionRecording();
  else if (!ph.sessionRecordingStarted()) ph.startSessionRecording();
}

// "Refuser" after an earlier "Accepter" (or a cleared choice): stop and forget.
export function stopSessionReplay(): void {
  if (!ph) return;
  ph.stopSessionRecording();
  ph.opt_out_capturing();
}
