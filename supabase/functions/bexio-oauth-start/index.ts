import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Bexio's OAuth2 + OIDC issuer (Keycloak realm) — idp.bexio.com was retired,
// this is the current issuer per Bexio's own docs, confirmed by the user.
const BEXIO_AUTHORIZE_URL = 'https://auth.bexio.com/realms/bexio/protocol/openid-connect/auth';

// V1 scope set only (cahier des charges section 8/103): reading contacts and
// articles, and creating/editing invoices. contact_edit/article_edit are
// deliberately not requested — Cantia doesn't write back to those resources
// yet, and a scope should never be requested before the feature using it
// exists.
const BEXIO_SCOPES = 'openid company_profile offline_access contact_show article_show kb_invoice_edit';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const clientId = Deno.env.get('BEXIO_CLIENT_ID');
    const clientSecret = Deno.env.get('BEXIO_CLIENT_SECRET');
    if (!clientId || !clientSecret) {
      return json({ error: "L'intégration Bexio n'est pas encore configurée côté serveur (identifiants manquants)." }, 500);
    }

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
    if (!isAdmin) return json({ error: "Seul un administrateur de l'entreprise peut connecter Bexio." }, 403);

    // A long, unguessable, single-use value — this is the only thing that
    // lets bexio-oauth-callback (hit directly by Bexio's redirect, with no
    // Cantia session attached at all) know which organization and which
    // user requested the connection, and rules out CSRF/replay.
    const state = `${crypto.randomUUID()}${crypto.randomUUID()}`.replace(/-/g, '');
    const { error: insertError } = await admin
      .from('integration_oauth_states')
      .insert({ state, organization_id, provider: 'bexio', created_by: user.id });
    if (insertError) return json({ error: insertError.message }, 500);

    const redirectUri = Deno.env.get('BEXIO_REDIRECT_URI') ?? `${supabaseUrl}/functions/v1/bexio-oauth-callback`;

    const authorizeUrl = new URL(BEXIO_AUTHORIZE_URL);
    authorizeUrl.searchParams.set('client_id', clientId);
    authorizeUrl.searchParams.set('redirect_uri', redirectUri);
    authorizeUrl.searchParams.set('response_type', 'code');
    authorizeUrl.searchParams.set('scope', BEXIO_SCOPES);
    authorizeUrl.searchParams.set('state', state);

    return json({ url: authorizeUrl.toString() });
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
