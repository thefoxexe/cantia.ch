import { Redirect } from 'expo-router';

// Same fix as auth-callback.tsx, for the Stripe checkout return link
// (cantia://checkout-success) opened on native — see lib/api/billing.ts
// and lib/openUrl.ts.
export default function CheckoutSuccess() {
  return <Redirect href="/" />;
}
