import { Redirect } from 'expo-router';

// Same fix as auth-callback.tsx, for the Stripe checkout cancel link
// (cantia://checkout-cancelled) opened on native — see lib/api/billing.ts
// and lib/openUrl.ts.
export default function CheckoutCancelled() {
  return <Redirect href="/" />;
}
