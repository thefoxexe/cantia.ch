import { createClient } from 'npm:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@17.5.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      return json({ error: "Le paiement en ligne n'est pas encore configuré côté serveur." }, 500);
    }
    const stripe = new Stripe(stripeKey, { apiVersion: '2025-03-31.basil', httpClient: Stripe.createFetchHttpClient() });

    const { plan_id, success_url, cancel_url, billing_interval, promo_code } = await req.json();
    if (!plan_id) return json({ error: 'plan_id requis' }, 400);
    if (!success_url || !cancel_url) return json({ error: 'success_url et cancel_url requis' }, 400);
    const yearly = billing_interval === 'year';

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('Authorization') ?? '';

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const admin = createClient(supabaseUrl, serviceKey);

    const {
      data: { user },
    } = await userClient.auth.getUser();
    if (!user) return json({ error: 'Non authentifié' }, 401);

    const { data: membership } = await userClient
      .from('organization_members')
      .select('organization_id, role, locale, organizations(*)')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle();

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return json({ error: "Seul un propriétaire ou administrateur peut gérer l'abonnement." }, 403);
    }
    const org = membership.organizations as any;
    // The member's own personal UI locale (organization_members.locale, set
    // from raw_user_meta_data.locale at signup) — not organizations.locale,
    // which is the org's separate outgoing-document language and defaults
    // to 'fr' regardless of who's paying. Whoever is sitting at this
    // checkout should see Stripe's hosted page in the language they've been
    // using through onboarding, not the org's document language.
    const stripeLocale = membership.locale === 'de' ? 'de' : 'fr';

    const { data: plan, error: planError } = await admin.from('plans').select('*').eq('id', plan_id).single();
    if (planError || !plan) return json({ error: 'Plan introuvable' }, 404);
    const priceId = yearly ? plan.stripe_price_id_yearly : plan.stripe_price_id;
    if (!priceId) {
      return json({ error: `Le plan "${plan.name}" n'est pas encore configuré pour le paiement en ligne.` }, 400);
    }

    let customerId = org.stripe_customer_id as string | null;
    if (!customerId) {
      const customer = await stripe.customers.create({
        name: org.name,
        email: org.email ?? undefined,
        metadata: { organization_id: org.id },
      });
      customerId = customer.id;
      await admin.from('organizations').update({ stripe_customer_id: customerId }).eq('id', org.id);
    }

    // Every organization gets exactly one automatic 14-day trial, granted
    // the first time it ever completes a checkout — no promo code to type
    // in. trial_used is service-role-only (see
    // 20260828100000_lock_billing_and_ownership_columns.sql), so this is
    // the only place that can flip it; a client can't re-arm its own
    // trial by hitting checkout again. Checkout's default
    // payment_method_collection ('always') still requires a card up front
    // even with a trial, so the trial doesn't charge now but does bill
    // automatically at trial end unless cancelled.
    //
    // ESSAI30 is a separate, manual 30-day trial for someone who was
    // personally given extra time — it works even if trial_used is already
    // true (that's the whole point: it's for people past their automatic
    // trial). It's real Stripe trial time (subscription_data.trial_period_days),
    // never a coupon/discount: a coupon can only discount money, so
    // "100% off the first invoice" was the previous (wrong) way this was
    // done — on a monthly plan that's roughly a free month, but on an
    // annual plan it wipes out the entire year instead of ~30 days. A
    // trial shifts the actual billing date by exactly 30 days regardless
    // of the plan's price or interval, then charges the real price.
    const promoCodeNormalized = typeof promo_code === 'string' ? promo_code.trim().toUpperCase() : '';
    const useEssai30 = promoCodeNormalized === 'ESSAI30';
    const trialDays = useEssai30 ? 30 : org.trial_used !== true ? 14 : null;
    if (trialDays !== null && org.trial_used !== true) {
      await admin.from('organizations').update({ trial_used: true }).eq('id', org.id);
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: org.id,
      metadata: { organization_id: org.id, plan_id: plan.id },
      subscription_data: {
        metadata: { organization_id: org.id, plan_id: plan.id },
        ...(trialDays !== null ? { trial_period_days: trialDays } : {}),
      },
      success_url,
      cancel_url,
      allow_promotion_codes: true,
      locale: stripeLocale,
      // The account has Managed Payments on by default, which requires every
      // line item's product to carry a Managed-Payments-eligible tax code.
      // Our products are intentionally "Nontaxable" (Bastien isn't VAT-
      // registered and must not charge VAT), which Managed Payments rejects
      // outright — so it's turned off per-session instead of hunting for a
      // "taxable" code that would risk Stripe Tax adding VAT back.
      // @ts-expect-error managed_payments isn't in the stripe-node 17.5.0 typings yet, but Stripe's own error response names this exact parameter.
      managed_payments: { enabled: false },
    });

    return json({ url: session.url });
  } catch (err) {
    console.error(err);
    return json({ error: String(err instanceof Error ? err.message : err) }, 500);
  }
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
