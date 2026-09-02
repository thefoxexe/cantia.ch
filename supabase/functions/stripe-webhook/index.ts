import { createClient } from 'npm:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@17.5.0';

Deno.serve(async (req: Request) => {
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  if (!stripeKey || !webhookSecret) {
    console.error('Stripe secrets not configured');
    return new Response('Stripe not configured', { status: 500 });
  }
  const stripe = new Stripe(stripeKey, { apiVersion: '2025-03-31.basil', httpClient: Stripe.createFetchHttpClient() });

  const signature = req.headers.get('stripe-signature');
  const body = await req.text();
  if (!signature) return new Response('Missing signature', { status: 400 });

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    console.error('Signature verification failed', err);
    return new Response('Invalid signature', { status: 400 });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const admin = createClient(supabaseUrl, serviceKey);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const organizationId = session.metadata?.organization_id ?? session.client_reference_id;
        const planId = session.metadata?.plan_id;
        if (organizationId && session.subscription) {
          // This is the only place plan_id/plan_selected get set for a new
          // organization — both are service-role-only (see the 20260902070000
          // migration) precisely so a client can't grant itself access before
          // Stripe actually confirms the checkout.
          await admin
            .from('organizations')
            .update({
              stripe_subscription_id: String(session.subscription),
              stripe_customer_id: String(session.customer),
              plan_id: planId ?? undefined,
              subscription_status: 'active',
              plan_selected: true,
            })
            .eq('id', organizationId);
        }
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        const organizationId = subscription.metadata?.organization_id;
        if (organizationId) {
          const priceId = subscription.items.data[0]?.price?.id;
          let planId = subscription.metadata?.plan_id;
          if (priceId) {
            const { data: plan } = await admin
              .from('plans')
              .select('id')
              .or(`stripe_price_id.eq.${priceId},stripe_price_id_yearly.eq.${priceId}`)
              .maybeSingle();
            if (plan) planId = plan.id;
          }
          // The real trial end, straight from Stripe, replaces the old
          // naive "+14 days from org creation" default — reflects any
          // Stripe-side adjustment and stays null once the trial's over.
          const trialEndsAt = subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null;
          await admin
            .from('organizations')
            .update({
              stripe_subscription_id: subscription.id,
              plan_id: planId ?? undefined,
              subscription_status: subscription.status,
              trial_ends_at: trialEndsAt,
            })
            .eq('id', organizationId);
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const organizationId = subscription.metadata?.organization_id;
        if (organizationId) {
          // No free plan to fall back to — cancelling locks the org out.
          // plan_id is cleared (not just plan_selected) so app/_layout.tsx's
          // gate, which now checks plan_id directly, sends them straight
          // back to choose-plan instead of leaving a stale plan_id that
          // reads as "on a real plan" anywhere that inspects it directly.
          await admin
            .from('organizations')
            .update({
              plan_id: null,
              plan_selected: false,
              stripe_subscription_id: null,
              subscription_status: 'canceled',
            })
            .eq('id', organizationId);
        }
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error('Webhook handling error', err);
    return new Response('Webhook handler error', { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
