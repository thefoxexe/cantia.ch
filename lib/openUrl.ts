import { Linking, Platform } from 'react-native';

// On web, Linking.openURL opens a new tab via window.open — which mobile
// browsers reliably block once there's been any await between the tap and
// the call (Stripe checkout/portal URLs always arrive after a network
// round-trip). A same-tab navigation is never blocked and is also what
// Stripe itself recommends for Checkout/Portal redirects.
export function openExternalUrl(url: string) {
  if (Platform.OS === 'web') {
    window.location.assign(url);
  } else {
    Linking.openURL(url);
  }
}
