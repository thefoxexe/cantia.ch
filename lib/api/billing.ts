import { supabase } from '../supabase';

function currentUrl(): string {
  if (typeof window !== 'undefined' && window.location) return window.location.href.split('?')[0];
  return 'https://localhost/';
}

export async function startCheckout(planId: string): Promise<{ url: string | null; error: string | null }> {
  const base = currentUrl();
  const { data, error } = await supabase.functions.invoke('stripe-checkout', {
    body: {
      plan_id: planId,
      success_url: `${base}?checkout=success`,
      cancel_url: `${base}?checkout=cancelled`,
    },
  });
  if (error) return { url: null, error: error.message };
  if (data?.error) return { url: null, error: data.error };
  return { url: data?.url ?? null, error: null };
}

export async function openBillingPortal(): Promise<{ url: string | null; error: string | null }> {
  const { data, error } = await supabase.functions.invoke('stripe-portal', {
    body: { return_url: currentUrl() },
  });
  if (error) return { url: null, error: error.message };
  if (data?.error) return { url: null, error: data.error };
  return { url: data?.url ?? null, error: null };
}
