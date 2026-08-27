import { createClient } from 'npm:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@17.5.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Best-effort: an org with no Stripe subscription (free plan, or billing
// never configured) just skips this — deletion must never be blocked by a
// Stripe hiccup.
async function cancelStripeSubscription(subscriptionId: string | null) {
  if (!subscriptionId) return;
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
  if (!stripeKey) return;
  try {
    const stripe = new Stripe(stripeKey, { apiVersion: '2025-03-31.basil', httpClient: Stripe.createFetchHttpClient() });
    await stripe.subscriptions.cancel(subscriptionId);
  } catch (err) {
    console.error('Stripe cancellation failed (continuing with deletion):', err);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
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

    const { action, organizationId } = await req.json();

    if (action === 'organization') {
      if (!organizationId) return json({ error: 'organizationId requis' }, 400);
      const { data: membership } = await admin
        .from('organization_members')
        .select('role')
        .eq('organization_id', organizationId)
        .eq('user_id', user.id)
        .maybeSingle();
      if (!membership || membership.role !== 'owner') {
        return json({ error: "Seul le propriétaire peut supprimer l'entreprise." }, 403);
      }
      const { data: org } = await admin.from('organizations').select('stripe_subscription_id').eq('id', organizationId).single();
      await cancelStripeSubscription(org?.stripe_subscription_id ?? null);
      // Every org-scoped table (projects, devis, factures, payroll_*,
      // organization_members, …) references organization_id with
      // `on delete cascade` — deleting the org row is enough.
      const { error } = await admin.from('organizations').delete().eq('id', organizationId);
      if (error) return json({ error: error.message }, 500);
      return json({ deleted: 'organization' });
    }

    if (action === 'account') {
      const { data: memberships } = await admin
        .from('organization_members')
        .select('id, organization_id, role')
        .eq('user_id', user.id);

      for (const m of memberships ?? []) {
        if (m.role === 'owner') {
          const { count } = await admin
            .from('organization_members')
            .select('id', { count: 'exact', head: true })
            .eq('organization_id', m.organization_id);
          if ((count ?? 0) > 1) {
            return json(
              {
                error:
                  "Vous êtes propriétaire d'une entreprise avec d'autres membres. Transférez la propriété ou supprimez l'entreprise avant de supprimer votre compte.",
              },
              409,
            );
          }
          const { data: org } = await admin.from('organizations').select('stripe_subscription_id').eq('id', m.organization_id).single();
          await cancelStripeSubscription(org?.stripe_subscription_id ?? null);
          await admin.from('organizations').delete().eq('id', m.organization_id);
        } else {
          await admin.from('organization_members').delete().eq('id', m.id);
        }
      }

      const { error } = await admin.auth.admin.deleteUser(user.id);
      if (error) return json({ error: error.message }, 500);
      return json({ deleted: 'account' });
    }

    return json({ error: "Action inconnue." }, 400);
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
