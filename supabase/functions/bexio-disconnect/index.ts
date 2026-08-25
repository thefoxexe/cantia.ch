import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

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

    const { organization_id } = await req.json();
    if (!organization_id) return json({ error: 'organization_id requis' }, 400);

    const { data: isAdmin } = await userClient.rpc('is_org_admin', { org_id: organization_id });
    if (!isAdmin) return json({ error: "Seul un administrateur de l'entreprise peut déconnecter Bexio." }, 403);

    const { data: integration } = await admin
      .from('integrations')
      .select('id')
      .eq('organization_id', organization_id)
      .eq('provider', 'bexio')
      .maybeSingle();
    if (!integration) return json({ ok: true });

    const { data: credentials } = await admin
      .from('integration_credentials')
      .select('access_token_secret_id, refresh_token_secret_id')
      .eq('integration_id', integration.id)
      .maybeSingle();

    // Vault has no public delete-secret function — overwrite in place with a
    // placeholder so the stored ciphertext no longer represents a usable
    // token, then remove our only reference to it.
    if (credentials) {
      await admin.rpc('vault_update_secret', { secret_id: credentials.access_token_secret_id, new_secret: 'revoked' });
      if (credentials.refresh_token_secret_id) {
        await admin.rpc('vault_update_secret', { secret_id: credentials.refresh_token_secret_id, new_secret: 'revoked' });
      }
      await admin.from('integration_credentials').delete().eq('integration_id', integration.id);
    }

    await admin.from('integrations').update({ status: 'revoked', auto_sync_enabled: false }).eq('id', integration.id);

    return json({ ok: true });
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
