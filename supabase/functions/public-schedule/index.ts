import { createClient } from 'npm:@supabase/supabase-js@2';

// Self-contained (the MCP deploy path does not resolve _shared/*.ts).
//
// A planning de chantier shared by link (schedule_shares): anyone holding
// the token reads it, no account. The RPC get_shared_schedule does every
// check (unknown, revoked, expired → null) and strips internal fields; this
// function only adds a short-lived signed URL for the company logo, which
// sits in private storage.

const BUCKET = 'opus-storage';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Méthode non autorisée' }, 405);

  try {
    const { token } = await req.json();
    if (typeof token !== 'string' || !UUID.test(token)) return json({ error: 'Lien invalide' }, 404);

    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data, error } = await admin.rpc('get_shared_schedule', { p_token: token });
    if (error) {
      console.error(error);
      return json({ error: 'Planning indisponible' }, 500);
    }
    if (!data) return json({ error: 'Lien invalide ou expiré' }, 404);

    const org = data.organization ?? {};
    let logoUrl: string | null = null;
    if (org.logo_path) {
      const { data: signed } = await admin.storage.from(BUCKET).createSignedUrl(org.logo_path, 3600);
      logoUrl = signed?.signedUrl ?? null;
    }
    delete org.logo_path;
    org.logo_url = logoUrl;

    return json({ ...data, organization: org });
  } catch (err) {
    console.error(err);
    return json({ error: 'Planning indisponible' }, 500);
  }
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}
