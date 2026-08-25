import { createClient } from 'npm:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@17.5.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Platform-admin-only view into real Stripe billing state: whether an org
// actually has a card on file, what they'll really be charged next (after
// any trial/discount, via Stripe's own upcoming-invoice computation rather
// than a locally-guessed number), and aggregate MRR/CA/plan/promo-code
// stats built from the same real data. Never exposes STRIPE_SECRET_KEY or
// raw Stripe objects to the client — only the derived fields below.
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) return json({ error: "Stripe n'est pas configuré côté serveur." }, 500);
    const stripe = new Stripe(stripeKey, { apiVersion: '2025-03-31.basil', httpClient: Stripe.createFetchHttpClient() });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('Authorization') ?? '';

    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const admin = createClient(supabaseUrl, serviceKey);

    const {
      data: { user },
    } = await userClient.auth.getUser();
    if (!user) return json({ error: 'Non authentifié' }, 401);

    const { data: isAdmin } = await userClient.rpc('is_platform_admin');
    if (!isAdmin) return json({ error: 'Accès refusé : réservé aux administrateurs de la plateforme.' }, 403);

    const { action, organization_ids } = await req.json();

    if (action === 'org_billing') {
      if (!Array.isArray(organization_ids) || organization_ids.length === 0) {
        return json({ error: 'organization_ids requis' }, 400);
      }
      const { data: orgs } = await admin
        .from('organizations')
        .select('id, stripe_customer_id, stripe_subscription_id')
        .in('id', organization_ids as string[]);

      const statuses: Record<string, unknown> = {};
      await Promise.all(
        (orgs ?? []).map(async (org) => {
          statuses[org.id] = await getOrgBilling(stripe, org.stripe_customer_id, org.stripe_subscription_id);
        }),
      );
      return json({ statuses });
    }

    if (action === 'overview') {
      return json(await getRevenueOverview(stripe, admin));
    }

    return json({ error: 'action inconnue' }, 400);
  } catch (err) {
    console.error(err);
    return json({ error: String(err instanceof Error ? err.message : err) }, 500);
  }
});

async function getOrgBilling(stripe: Stripe, customerId: string | null, subscriptionId: string | null) {
  const empty = {
    has_payment_method: false,
    card_brand: null as string | null,
    card_last4: null as string | null,
    card_exp_month: null as number | null,
    card_exp_year: null as number | null,
    subscription_status: null as string | null,
    cancel_at_period_end: false,
    next_invoice_amount_chf: null as number | null,
    next_invoice_date: null as string | null,
    will_be_charged: false,
  };
  if (!customerId) return empty;

  let card: Stripe.PaymentMethod.Card | null = null;
  let subscription: Stripe.Subscription | null = null;

  if (subscriptionId) {
    try {
      subscription = await stripe.subscriptions.retrieve(subscriptionId, { expand: ['default_payment_method'] });
      const pm = subscription.default_payment_method;
      if (pm && typeof pm !== 'string') card = pm.card ?? null;
    } catch {
      subscription = null;
    }
  }

  if (!card) {
    try {
      const customer = await stripe.customers.retrieve(customerId, { expand: ['invoice_settings.default_payment_method'] });
      if (!('deleted' in customer) || !customer.deleted) {
        const pm = (customer as Stripe.Customer).invoice_settings?.default_payment_method;
        if (pm && typeof pm !== 'string') card = pm.card ?? null;
      }
    } catch {
      // customer lookup failed — leave card null, fields below stay empty
    }
  }

  if (!card) {
    try {
      const methods = await stripe.paymentMethods.list({ customer: customerId, type: 'card', limit: 1 });
      card = methods.data[0]?.card ?? null;
    } catch {
      // no card on file
    }
  }

  let nextInvoiceAmountChf: number | null = null;
  let nextInvoiceDate: string | null = null;
  if (subscription && ['active', 'trialing', 'past_due'].includes(subscription.status)) {
    try {
      const upcoming = await stripe.invoices.retrieveUpcoming({ customer: customerId, subscription: subscription.id });
      nextInvoiceAmountChf = upcoming.amount_due / 100;
      const periodEnd = subscription.trial_end ?? subscription.current_period_end;
      nextInvoiceDate = periodEnd ? new Date(periodEnd * 1000).toISOString() : null;
    } catch {
      // nothing upcoming (e.g. subscription ending, no further cycles)
    }
  }

  return {
    has_payment_method: !!card,
    card_brand: card?.brand ?? null,
    card_last4: card?.last4 ?? null,
    card_exp_month: card?.exp_month ?? null,
    card_exp_year: card?.exp_year ?? null,
    subscription_status: subscription?.status ?? null,
    cancel_at_period_end: subscription?.cancel_at_period_end ?? false,
    next_invoice_amount_chf: nextInvoiceAmountChf,
    next_invoice_date: nextInvoiceDate,
    will_be_charged:
      !!card && !!subscription && ['active', 'trialing', 'past_due'].includes(subscription.status) && !subscription.cancel_at_period_end,
  };
}

// deno-lint-ignore no-explicit-any
async function getRevenueOverview(stripe: Stripe, admin: any) {
  const [{ data: orgs }, { data: plans }] = await Promise.all([
    admin
      .from('organizations')
      .select('id, name, plan_id, subscription_status, stripe_customer_id, stripe_subscription_id, promo_code_used')
      .eq('is_internal', false)
      .not('stripe_subscription_id', 'is', null),
    admin.from('plans').select('id, name, stripe_price_id, stripe_price_id_yearly'),
  ]);

  const priceToPlan = new Map<string, { id: string; name: string }>();
  for (const p of plans ?? []) {
    if (p.stripe_price_id) priceToPlan.set(p.stripe_price_id, { id: p.id, name: p.name });
    if (p.stripe_price_id_yearly) priceToPlan.set(p.stripe_price_id_yearly, { id: p.id, name: p.name });
  }

  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);
  const monthStartTs = Math.floor(monthStart.getTime() / 1000);

  let mrrActiveChf = 0;
  let mrrTrialingChf = 0;
  let newMrrThisMonthChf = 0;
  let activeCount = 0;
  let trialingCount = 0;
  const byPlan = new Map<string, { plan_id: string; plan_name: string; active_count: number; trialing_count: number; mrr_chf: number }>();

  await Promise.all(
    (orgs ?? []).map(async (org: { id: string; plan_id: string; stripe_subscription_id: string }) => {
      let sub: Stripe.Subscription;
      try {
        sub = await stripe.subscriptions.retrieve(org.stripe_subscription_id, { expand: ['items.data.price'] });
      } catch {
        return;
      }
      if (!['active', 'trialing'].includes(sub.status)) return;

      const item = sub.items.data[0];
      if (!item?.price) return;
      const price = item.price as Stripe.Price;
      const unitAmount = (price.unit_amount ?? 0) / 100;
      const monthlyEquivalent = price.recurring?.interval === 'year' ? unitAmount / 12 : unitAmount;
      const discountFactor = sub.discount?.coupon
        ? sub.discount.coupon.percent_off
          ? 1 - sub.discount.coupon.percent_off / 100
          : sub.discount.coupon.amount_off
            ? Math.max(0, 1 - sub.discount.coupon.amount_off / 100 / unitAmount)
            : 1
        : 1;
      const realMonthly = monthlyEquivalent * discountFactor;

      const planInfo = priceToPlan.get(price.id) ?? { id: org.plan_id, name: org.plan_id };
      if (!byPlan.has(planInfo.id)) byPlan.set(planInfo.id, { plan_id: planInfo.id, plan_name: planInfo.name, active_count: 0, trialing_count: 0, mrr_chf: 0 });
      const bucket = byPlan.get(planInfo.id)!;

      if (sub.status === 'active') {
        mrrActiveChf += realMonthly;
        activeCount += 1;
        bucket.active_count += 1;
        bucket.mrr_chf += realMonthly;
        if (sub.start_date && sub.start_date >= monthStartTs) newMrrThisMonthChf += realMonthly;
      } else {
        mrrTrialingChf += realMonthly;
        trialingCount += 1;
        bucket.trialing_count += 1;
      }
    }),
  );

  // Lifetime + this-month revenue actually collected, from real (non-internal)
  // customers only — cross-referenced against our own org records rather than
  // trusting Stripe's customer list wholesale (which may include stray test
  // customers created before an org row existed, or ones from removed orgs).
  // Also the base list for churn below: cancellation clears
  // stripe_subscription_id (see stripe-webhook customer.subscription.deleted),
  // so a churned org is invisible to the `orgs` query above but still has its
  // stripe_customer_id — that's the only way to find what was lost this month.
  const { data: allRealOrgs } = await admin.from('organizations').select('stripe_customer_id').eq('is_internal', false).not('stripe_customer_id', 'is', null);
  const knownCustomerIds = new Set((orgs ?? []).map((o: { stripe_customer_id: string | null }) => o.stripe_customer_id).filter(Boolean));
  for (const o of allRealOrgs ?? []) knownCustomerIds.add(o.stripe_customer_id);

  let churnedMrrThisMonthChf = 0;
  let churnedCountThisMonth = 0;
  await Promise.all(
    (allRealOrgs ?? []).map(async (o: { stripe_customer_id: string }) => {
      let canceled: Stripe.ApiList<Stripe.Subscription>;
      try {
        canceled = await stripe.subscriptions.list({ customer: o.stripe_customer_id, status: 'canceled', limit: 3, expand: ['data.items.data.price'] });
      } catch {
        return;
      }
      for (const sub of canceled.data) {
        if (!sub.canceled_at || sub.canceled_at < monthStartTs) continue;
        const price = sub.items.data[0]?.price as Stripe.Price | undefined;
        if (!price) continue;
        const unitAmount = (price.unit_amount ?? 0) / 100;
        churnedMrrThisMonthChf += price.recurring?.interval === 'year' ? unitAmount / 12 : unitAmount;
        churnedCountThisMonth += 1;
      }
    }),
  );

  let caTotalChf = 0;
  let caThisMonthChf = 0;
  let startingAfter: string | undefined;
  for (let page = 0; page < 5; page++) {
    const invoices: Stripe.ApiList<Stripe.Invoice> = await stripe.invoices.list({ status: 'paid', limit: 100, starting_after: startingAfter });
    for (const inv of invoices.data) {
      const customerId = typeof inv.customer === 'string' ? inv.customer : inv.customer?.id;
      if (!customerId || !knownCustomerIds.has(customerId)) continue;
      const amount = (inv.amount_paid ?? 0) / 100;
      caTotalChf += amount;
      if ((inv.status_transitions?.paid_at ?? inv.created) >= monthStartTs) caThisMonthChf += amount;
    }
    if (!invoices.has_more) break;
    startingAfter = invoices.data[invoices.data.length - 1]?.id;
  }

  const promoCounts = new Map<string, { code: string; org_count: number; active_count: number; trialing_count: number }>();
  for (const org of orgs ?? []) {
    if (!org.promo_code_used) continue;
    if (!promoCounts.has(org.promo_code_used)) {
      promoCounts.set(org.promo_code_used, { code: org.promo_code_used, org_count: 0, active_count: 0, trialing_count: 0 });
    }
    const bucket = promoCounts.get(org.promo_code_used)!;
    bucket.org_count += 1;
    if (org.subscription_status === 'active') bucket.active_count += 1;
    else if (org.subscription_status === 'trialing') bucket.trialing_count += 1;
  }

  return {
    mrr_active_chf: round2(mrrActiveChf),
    mrr_trialing_chf: round2(mrrTrialingChf),
    arr_chf: round2(mrrActiveChf * 12),
    new_mrr_this_month_chf: round2(newMrrThisMonthChf),
    churned_mrr_this_month_chf: round2(churnedMrrThisMonthChf),
    churned_count_this_month: churnedCountThisMonth,
    net_mrr_this_month_chf: round2(newMrrThisMonthChf - churnedMrrThisMonthChf),
    ca_total_chf: round2(caTotalChf),
    ca_this_month_chf: round2(caThisMonthChf),
    active_count: activeCount,
    trialing_count: trialingCount,
    by_plan: Array.from(byPlan.values())
      .map((b) => ({ ...b, mrr_chf: round2(b.mrr_chf) }))
      .sort((a, b) => b.mrr_chf - a.mrr_chf),
    promo_codes: Array.from(promoCounts.values()).sort((a, b) => b.org_count - a.org_count),
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
