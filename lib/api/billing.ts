import { invokeFunction } from './functions';

function currentUrl(): string {
  if (typeof window !== 'undefined' && window.location) return window.location.href.split('?')[0];
  return 'https://localhost/';
}

export async function startCheckout(planId: string): Promise<{ url: string | null; error: string | null }> {
  const base = currentUrl();
  const { data, error } = await invokeFunction<{ url: string }>('stripe-checkout', {
    plan_id: planId,
    success_url: `${base}?checkout=success`,
    cancel_url: `${base}?checkout=cancelled`,
  });
  return { url: data?.url ?? null, error };
}

export async function openBillingPortal(): Promise<{ url: string | null; error: string | null }> {
  const { data, error } = await invokeFunction<{ url: string }>('stripe-portal', {
    return_url: currentUrl(),
  });
  return { url: data?.url ?? null, error };
}
