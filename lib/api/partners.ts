import { Linking, Platform } from 'react-native';
import { invokeFunction } from './functions';

export const PARTNERS_URL = 'https://partners.cantia.ch';
export const ACCOUNTING_URL = 'https://accounting.cantia.ch';

// Opens another Cantia site already signed in with the current account: the
// partners-sso function returns a one-time sign-in link for this user
// (auth sessions are kept per domain, never in a .cantia.ch cookie). Falls
// back to the plain site, which asks to sign in.
async function openSignedIn(target: 'partners' | 'accounting', fallback: string): Promise<void> {
  const { data } = await invokeFunction<{ url: string }>('partners-sso', { target });
  const url = data?.url ?? fallback;
  // Same tab: a window.open() after an await is blocked by most browsers.
  if (Platform.OS === 'web' && typeof window !== 'undefined') window.location.assign(url);
  else Linking.openURL(url);
}

export function openPartnerSpace(): Promise<void> {
  return openSignedIn('partners', PARTNERS_URL);
}

export function openAccountingSpace(): Promise<void> {
  return openSignedIn('accounting', ACCOUNTING_URL);
}
