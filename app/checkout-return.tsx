import { Redirect } from 'expo-router';

// Same fix as checkout-success.tsx, for the Stripe billing PORTAL's return
// link (cantia://checkout-return) — used when managing/cancelling a
// subscription from lib/api/billing.ts's openBillingPortal(), as opposed to
// checkout-success/-cancelled which are for the initial purchase flow.
export default function CheckoutReturn() {
  return <Redirect href="/" />;
}
