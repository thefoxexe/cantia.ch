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
    payment_method_type: null as string | null,
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

  // A saved payment method isn't always a plain "card" object — Stripe Link
  // can attach a payment method of type "link" (no card object exposed at
  // all) rather than type "card". Filtering paymentMethods.list to
  // type:'card' alone silently missed those, reporting "no card on file"
  // for a customer who genuinely has a valid, chargeable method saved.
  let pm: Stripe.PaymentMethod | null = null;
  let subscription: Stripe.Subscription | null = null;

  if (subscriptionId) {
    try {
      subscription = await stripe.subscriptions.retrieve(subscriptionId, { expand: ['default_payment_method'] });
      const spm = subscription.default_payment_method;
      if (spm && typeof spm !== 'string') pm = spm;
    } catch {
      subscription = null;
    }
  }

  if (!pm) {
    try {
      const customer = await stripe.customers.retrieve(customerId, { expand: ['invoice_settings.default_payment_method'] });
      if (!('deleted' in customer) || !customer.deleted) {
        const cpm = (customer as Stripe.Customer).invoice_settings?.default_payment_method;
        if (cpm && typeof cpm !== 'string') pm = cpm;
      }
    } catch {
      // customer lookup failed — leave pm null, fields below stay empty
    }
  }

  if (!pm) {
    // Neither the subscription nor the customer has a default set — check
    // what payment methods actually exist, across every type Stripe could
    // have attached (card, and Link's own type), not just 'card'.
    for (const type of ['card', 'link']) {
      try {
        // deno-lint-ignore no-explicit-any
        const methods = await stripe.paymentMethods.list({ customer: customerId, type: type as any, limit: 1 });
        if (methods.data[0]) {
          pm = methods.data[0];
          break;
        }
      } catch {
        // this type isn't listable for this customer — try the next
      }
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
    has_payment_method: !!pm,
    payment_method_type: pm?.type ?? null,
    card_brand: pm?.card?.brand ?? null,
    card_last4: pm?.card?.last4 ?? null,
    card_exp_month: pm?.card?.exp_month ?? null,
    card_exp_year: pm?.card?.exp_year ?? null,
    subscription_status: subscription?.status ?? null,
    cancel_at_period_end: subscription?.cancel_at_period_end ?? false,
    next_invoice_amount_chf: nextInvoiceAmountChf,
    next_invoice_date: nextInvoiceDate,
    will_be_charged:
      !!pm && !!subscription && ['active', 'trialing', 'past_due'].includes(subscription.status) && !subscription.cancel_at_period_end,
  };
}

// A subscription with a 100%-off coupon attached — like the historical
// "BASTIEN" lifetime-free grants — will never generate real revenue, no
// matter what its price object says. Stripe represents this two ways
// depending on API era: the legacy singular `discount` field, and the
// newer `discounts` array (multiple stackable discounts) — check both
// rather than assuming one is populated. Returns the coupon's display
// name/id when a full discount is found, else null.
function findFreeForeverCoupon(sub: Stripe.Subscription): string | null {
  const candidates: (Stripe.Discount | null | undefined)[] = [sub.discount];
  const arr = (sub as unknown as { discounts?: (Stripe.Discount | string)[] }).discounts;
  if (Array.isArray(arr)) {
    for (const d of arr) if (d && typeof d !== 'string') candidates.push(d);
  }
  for (const d of candidates) {
    if (d?.coupon?.percent_off === 100) return d.coupon.name || d.coupon.id;
  }
  return null;
}

function dayKey(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toISOString().slice(0, 10);
}

// deno-lint-ignore no-explicit-any
async function getRevenueOverview(stripe: Stripe, admin: any) {
  const [{ data: orgs }, { data: plans }] = await Promise.all([
    admin
      .from('organizations')
      .select('id, name, plan_id, subscription_status, stripe_customer_id, stripe_subscription_id, promo_code_used, is_complimentary')
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
  let complimentaryCount = 0;
  let scheduledCancellationsCount = 0;
  const complimentaryAccounts: { id: string; name: string; code: string }[] = [];
  const byPlan = new Map<string, { plan_id: string; plan_name: string; active_count: number; trialing_count: number; mrr_chf: number }>();
  // Every day an active (non-trialing, non-complimentary) subscription
  // started, +its monthly-equivalent price; every day one ended, the
  // opposite. Walking these in date order and accumulating gives the real
  // MRR on any given day — not an estimate, the actual Stripe price history.
  const mrrEvents: { ts: number; delta: number }[] = [];

  await Promise.all(
    (orgs ?? []).map(
      async (org: { id: string; name: string; plan_id: string; stripe_subscription_id: string; promo_code_used: string | null; is_complimentary: boolean }) => {
        let sub: Stripe.Subscription;
        try {
          sub = await stripe.subscriptions.retrieve(org.stripe_subscription_id, { expand: ['items.data.price', 'discounts'] });
        } catch {
          return;
        }
        if (!['active', 'trialing'].includes(sub.status)) return;

        // Free-forever grant: never real revenue, excluded from MRR/ARR
        // (and from every "payant" count elsewhere) — reported separately
        // instead of silently dropped. is_complimentary is the persisted
        // version of this same live check, kept in sync here so every other
        // admin screen agrees with this one without its own Stripe call.
        const freeCoupon = findFreeForeverCoupon(sub);
        if (freeCoupon) {
          complimentaryCount += 1;
          complimentaryAccounts.push({ id: org.id, name: org.name, code: freeCoupon });
          if (!org.promo_code_used) {
            await admin.from('organizations').update({ promo_code_used: freeCoupon }).eq('id', org.id);
          }
          if (!org.is_complimentary) {
            await admin.from('organizations').update({ is_complimentary: true }).eq('id', org.id);
          }
          return;
        }
        if (org.is_complimentary) {
          await admin.from('organizations').update({ is_complimentary: false }).eq('id', org.id);
        }

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
          if (sub.start_date) mrrEvents.push({ ts: sub.start_date, delta: realMonthly });
          // Real Stripe signal, already on the object we just fetched — an
          // active sub Stripe has flagged as cancel_at_period_end won't
          // renew. Early-warning churn, not yet counted as lost.
          if (sub.cancel_at_period_end) scheduledCancellationsCount += 1;
        } else {
          mrrTrialingChf += realMonthly;
          trialingCount += 1;
          bucket.trialing_count += 1;
        }
      },
    ),
  );

  // Lifetime + this-month revenue actually collected, from real (non-internal)
  // customers only — cross-referenced against our own org records rather than
  // trusting Stripe's customer list wholesale (which may include stray test
  // customers created before an org row existed, or ones from removed orgs).
  // Also the base list for churn below: cancellation clears
  // stripe_subscription_id (see stripe-webhook customer.subscription.deleted),
  // so a churned org is invisible to the `orgs` query above but still has its
  // stripe_customer_id — that's the only way to find what was lost this month.
  const { data: allRealOrgs } = await admin
    .from('organizations')
    .select('id, name, stripe_customer_id, created_at')
    .eq('is_internal', false)
    .not('stripe_customer_id', 'is', null);
  const knownCustomerIds = new Set((orgs ?? []).map((o: { stripe_customer_id: string | null }) => o.stripe_customer_id).filter(Boolean));
  for (const o of allRealOrgs ?? []) knownCustomerIds.add(o.stripe_customer_id);

  let churnedMrrThisMonthChf = 0;
  let churnedCountThisMonth = 0;
  await Promise.all(
    (allRealOrgs ?? []).map(async (o: { stripe_customer_id: string }) => {
      let canceled: Stripe.ApiList<Stripe.Subscription>;
      try {
        // limit 10, not just "this month" — every past cancellation feeds
        // the MRR-history chart below, not only this month's churn number.
        canceled = await stripe.subscriptions.list({ customer: o.stripe_customer_id, status: 'canceled', limit: 10, expand: ['data.items.data.price', 'data.discounts'] });
      } catch {
        return;
      }
      for (const sub of canceled.data) {
        if (findFreeForeverCoupon(sub)) continue; // never contributed real MRR — not a churn loss
        const price = sub.items.data[0]?.price as Stripe.Price | undefined;
        if (!price || !sub.canceled_at) continue;
        const unitAmount = (price.unit_amount ?? 0) / 100;
        const realMonthly = price.recurring?.interval === 'year' ? unitAmount / 12 : unitAmount;
        if (sub.canceled_at >= monthStartTs) {
          churnedMrrThisMonthChf += realMonthly;
          churnedCountThisMonth += 1;
        }
        if (sub.start_date) mrrEvents.push({ ts: sub.start_date, delta: realMonthly });
        mrrEvents.push({ ts: sub.canceled_at, delta: -realMonthly });
      }
    }),
  );
  mrrEvents.sort((a, b) => a.ts - b.ts);

  // Every real (non-internal) org's signup date feeds the growth chart's
  // "inscriptions" series — cheap since there are only ever a few dozen.
  const signupsByDay = new Map<string, number>();
  for (const o of allRealOrgs ?? []) {
    const day = new Date(o.created_at).toISOString().slice(0, 10);
    signupsByDay.set(day, (signupsByDay.get(day) ?? 0) + 1);
  }

  let caTotalChf = 0;
  let caThisMonthChf = 0;
  const revenueByDay = new Map<string, number>();
  const firstPaymentByCustomer = new Map<string, number>();
  let startingAfter: string | undefined;
  for (let page = 0; page < 5; page++) {
    const invoices: Stripe.ApiList<Stripe.Invoice> = await stripe.invoices.list({ status: 'paid', limit: 100, starting_after: startingAfter });
    for (const inv of invoices.data) {
      const customerId = typeof inv.customer === 'string' ? inv.customer : inv.customer?.id;
      if (!customerId || !knownCustomerIds.has(customerId)) continue;
      const amount = (inv.amount_paid ?? 0) / 100;
      const paidAtTs = inv.status_transitions?.paid_at ?? inv.created;
      caTotalChf += amount;
      if (paidAtTs >= monthStartTs) caThisMonthChf += amount;
      if (amount > 0) {
        const day = dayKey(paidAtTs);
        revenueByDay.set(day, (revenueByDay.get(day) ?? 0) + amount);
        const existing = firstPaymentByCustomer.get(customerId);
        if (!existing || paidAtTs < existing) firstPaymentByCustomer.set(customerId, paidAtTs);
      }
    }
    if (!invoices.has_more) break;
    startingAfter = invoices.data[invoices.data.length - 1]?.id;
  }

  // Daily growth series for the last 90 days — the client filters this down
  // to "aujourd'hui" / "7 jours" / "ce mois" / "depuis toujours" itself,
  // one fetch covers every period switch without re-querying Stripe.
  const firstPaymentDays = Array.from(firstPaymentByCustomer.values())
    .map((ts) => dayKey(ts))
    .sort();
  const earliestSignup = (allRealOrgs ?? []).reduce((min: string | null, o: { created_at: string }) => {
    const day = new Date(o.created_at).toISOString().slice(0, 10);
    return !min || day < min ? day : min;
  }, null as string | null);
  const rangeStart = earliestSignup ?? new Date().toISOString().slice(0, 10);
  const points: { date: string; signups: number; revenue_chf: number; paying_cumulative: number; mrr_chf: number }[] = [];
  let cursor = new Date(`${rangeStart}T00:00:00Z`);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  let payingIdx = 0;
  let mrrIdx = 0;
  let runningMrr = 0;
  while (cursor <= today) {
    const day = cursor.toISOString().slice(0, 10);
    while (payingIdx < firstPaymentDays.length && firstPaymentDays[payingIdx] <= day) payingIdx += 1;
    while (mrrIdx < mrrEvents.length && dayKey(mrrEvents[mrrIdx].ts) <= day) {
      runningMrr += mrrEvents[mrrIdx].delta;
      mrrIdx += 1;
    }
    points.push({
      date: day,
      signups: signupsByDay.get(day) ?? 0,
      revenue_chf: round2(revenueByDay.get(day) ?? 0),
      paying_cumulative: payingIdx,
      mrr_chf: round2(Math.max(0, runningMrr)),
    });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
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
    scheduled_cancellations_count: scheduledCancellationsCount,
    complimentary_count: complimentaryCount,
    complimentary_accounts: complimentaryAccounts,
    by_plan: Array.from(byPlan.values())
      .map((b) => ({ ...b, mrr_chf: round2(b.mrr_chf) }))
      .sort((a, b) => b.mrr_chf - a.mrr_chf),
    promo_codes: Array.from(promoCounts.values()).sort((a, b) => b.org_count - a.org_count),
    timeseries: points,
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
