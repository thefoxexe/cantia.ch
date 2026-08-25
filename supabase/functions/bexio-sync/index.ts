import { createClient } from 'npm:@supabase/supabase-js@2';
import { syncBexioContacts, syncBexioInvoiceStatuses, syncBexioSettings } from './bexio-sync-logic.ts';
import { BexioError } from './bexio.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Manual, client-triggered sync ("Synchroniser maintenant") for a single
// organization's Bexio connection. The hourly automated sweep is a
// separate function (bexio-cron-sync) that iterates every org — kept apart
// so a user-triggered request never accidentally touches another org.
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

    const { organization_id, action } = await req.json();
    if (!organization_id) return json({ error: 'organization_id requis' }, 400);
    if (!['contacts', 'settings', 'invoice_status', 'all'].includes(action)) {
      return json({ error: 'action inconnue' }, 400);
    }

    const { data: isAdmin } = await userClient.rpc('is_org_admin', { org_id: organization_id });
    if (!isAdmin) return json({ error: "Seul un administrateur de l'entreprise peut synchroniser Bexio." }, 403);

    const { data: integration } = await admin
      .from('integrations')
      .select('id, organization_id, status')
      .eq('organization_id', organization_id)
      .eq('provider', 'bexio')
      .maybeSingle();
    if (!integration || integration.status !== 'connected') {
      return json({ error: "Bexio n'est pas connecté pour cette entreprise." }, 400);
    }

    const results = [];
    if (action === 'settings' || action === 'all') results.push(await syncBexioSettings(admin, integration));
    if (action === 'contacts' || action === 'all') results.push(await syncBexioContacts(admin, integration));
    if (action === 'invoice_status' || action === 'all') results.push(await syncBexioInvoiceStatuses(admin, integration));

    await admin.from('integrations').update({ last_sync_at: new Date().toISOString() }).eq('id', integration.id);

    return json({ results });
  } catch (err) {
    if (err instanceof BexioError) return json({ error: err.message, code: err.code }, err.httpStatus ?? 500);
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
