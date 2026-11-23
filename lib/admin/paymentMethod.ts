import type { AdminOrgBillingStatus } from '../types';

// How a company pays, in one short line for the Super Admin (list and
// company page). Not every payment method is a card: Stripe Link keeps the
// card inside the customer's Link account and never exposes its brand or
// last digits, wallets wrap a card, TWINT/PayPal have no card at all.
export const CARD_BRAND_LABEL: Record<string, string> = { visa: 'Visa', mastercard: 'Mastercard', amex: 'American Express' };

export const PAYMENT_METHOD_LABEL: Record<string, string> = {
  card: 'Carte',
  link: 'Stripe Link',
  twint: 'TWINT',
  paypal: 'PayPal',
  sepa_debit: 'Prélèvement SEPA',
  revolut_pay: 'Revolut Pay',
  amazon_pay: 'Amazon Pay',
  klarna: 'Klarna',
};

export const WALLET_LABEL: Record<string, string> = { apple_pay: 'Apple Pay', google_pay: 'Google Pay', link: 'Stripe Link', samsung_pay: 'Samsung Pay' };

export function paymentMethodShort(b: AdminOrgBillingStatus | undefined | null): string {
  if (!b?.has_payment_method) return 'Aucun';
  const wallet = b.payment_method_wallet ? ` (${WALLET_LABEL[b.payment_method_wallet] ?? b.payment_method_wallet})` : '';
  if (b.card_brand && b.card_last4) return `Carte ${CARD_BRAND_LABEL[b.card_brand] ?? b.card_brand} •••• ${b.card_last4}${wallet}`;
  if (b.payment_method_type === 'link') return 'Stripe Link (carte dans le compte Link du client)';
  return PAYMENT_METHOD_LABEL[b.payment_method_type ?? ''] ?? 'Enregistré chez Stripe';
}
