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

    const { plan_id, success_url, cancel_url } = await req.json();
    if (!plan_id) return json({ error: 'plan_id requis' }, 400);
    if (!success_url || !cancel_url) return json({ error: 'success_url et cancel_url requis' }, 400);

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
      .select('organization_id, role, organizations(*)')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle();

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return json({ error: "Seul un propriétaire ou administrateur peut gérer l'abonnement." }, 403);
    }
    const org = membership.organizations as any;

    const { data: plan, error: planError } = await admin.from('plans').select('*').eq('id', plan_id).single();
    if (planError || !plan) return json({ error: 'Plan introuvable' }, 404);
    if (!plan.stripe_price_id) {
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

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: plan.stripe_price_id, quantity: 1 }],
      client_reference_id: org.id,
      metadata: { organization_id: org.id, plan_id: plan.id },
      subscription_data: { metadata: { organization_id: org.id, plan_id: plan.id } },
      success_url,
      cancel_url,
      allow_promotion_codes: true,
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
