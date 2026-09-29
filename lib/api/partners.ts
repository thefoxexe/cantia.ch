import { Linking, Platform } from 'react-native';
import { invokeFunction } from './functions';

export const PARTNERS_URL = 'https://partners.cantia.ch';

// Opens partners.cantia.ch already signed in with the current account: the
// partners-sso function returns a one-time sign-in link for this user
// (auth sessions are kept per domain, never in a .cantia.ch cookie). Falls
// back to the plain site, which asks to sign in.
export async function openPartnerSpace(): Promise<void> {
  const { data } = await invokeFunction<{ url: string }>('partners-sso', {});
  const url = data?.url ?? PARTNERS_URL;
  // Same tab: a window.open() after an await is blocked by most browsers.
  if (Platform.OS === 'web' && typeof window !== 'undefined') window.location.assign(url);
  else Linking.openURL(url);
}
