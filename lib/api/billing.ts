import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import { invokeFunction } from './functions';

function currentUrl(): string {
  if (typeof window !== 'undefined' && window.location) return window.location.href.split('?')[0];
  return 'https://localhost/';
}

// On web, Stripe redirects the same browser tab back to a page on our own
// domain — the current page plus a query param is enough. On native there's
// no "current page" to return to, and the previous code fell back to
// `https://localhost/`, which Stripe would happily redirect a real device's
// browser to and just... fail to load, stranding the user after paying with
// no way back into the app. `Linking.createURL` builds a proper `cantia://`
// deep link instead, using the scheme already registered in app.json — the
// same link `WebBrowser.openAuthSessionAsync` (see lib/openUrl.ts) watches
// for to know the checkout is done and hand control back to the app.
function redirectUrl(path: string): string {
  if (Platform.OS === 'web') return `${currentUrl()}?${path}`;
  return Linking.createURL(path);
}

export async function startCheckout(
  planId: string,
  billingInterval: 'month' | 'year' = 'month',
): Promise<{ url: string | null; error: string | null }> {
  const { data, error } = await invokeFunction<{ url: string }>('stripe-checkout', {
    plan_id: planId,
    billing_interval: billingInterval,
    success_url: redirectUrl('checkout-success'),
    cancel_url: redirectUrl('checkout-cancelled'),
  });
  return { url: data?.url ?? null, error };
}

export async function openBillingPortal(flow?: 'cancel'): Promise<{ url: string | null; error: string | null }> {
  const { data, error } = await invokeFunction<{ url: string }>('stripe-portal', {
    return_url: redirectUrl('checkout-return'),
    flow,
  });
  return { url: data?.url ?? null, error };
}
