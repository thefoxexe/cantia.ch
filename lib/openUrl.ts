import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

export type CheckoutOutcome = 'success' | 'cancelled' | 'dismissed';

// Opens a Stripe Checkout/Portal URL and, on native, waits for the user to
// actually finish with it.
//
// - Web: a same-tab navigation. `window.open`/a new tab is unreliably
//   blocked by mobile browsers once there's been any await between the tap
//   and the call (Stripe URLs always arrive after a network round trip), so
//   a same-tab redirect is what Stripe itself recommends — the SPA reloads
//   fresh when Stripe redirects back to our own domain.
// - Native: `Linking.openURL` used to hand off to a full external browser
//   app with no way back — `WebBrowser.openAuthSessionAsync` instead opens
//   an in-app browser sheet and automatically closes itself the moment
//   Stripe redirects to our own `cantia://` scheme (see lib/api/billing.ts),
//   handing control straight back to the app.
export async function openCheckoutUrl(url: string): Promise<CheckoutOutcome> {
  if (Platform.OS === 'web') {
    window.location.assign(url);
    return 'success';
  }
  const result = await WebBrowser.openAuthSessionAsync(url, Linking.createURL('checkout-success'));
  if (result.type === 'success') {
    return result.url.includes('checkout-cancelled') ? 'cancelled' : 'success';
  }
  return 'dismissed';
}
