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
          await admin
            .from('organizations')
            .update({
              stripe_subscription_id: String(session.subscription),
              stripe_customer_id: String(session.customer),
              plan_id: planId ?? undefined,
              subscription_status: 'active',
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
            const { data: plan } = await admin.from('plans').select('id').eq('stripe_price_id', priceId).maybeSingle();
            if (plan) planId = plan.id;
          }
          await admin
            .from('organizations')
            .update({
              stripe_subscription_id: subscription.id,
              plan_id: planId ?? undefined,
              subscription_status: subscription.status,
            })
            .eq('id', organizationId);
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const organizationId = subscription.metadata?.organization_id;
        if (organizationId) {
          await admin
            .from('organizations')
            .update({
              plan_id: 'free',
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
