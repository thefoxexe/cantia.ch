import { createClient } from 'npm:@supabase/supabase-js@2';

// One-time sign-in link to partners.cantia.ch for the signed-in Cantia user
// (app -> Compte -> Programme partenaire). Auth sessions stay per domain:
// sharing them through a .cantia.ch cookie would expose them to every
// subdomain, third-party ones included (status, links). The link is only
// ever returned to the account it signs in.
const PARTNERS_URL = Deno.env.get('PARTNERS_URL') ?? 'https://partners.cantia.ch';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Méthode non autorisée' }, 405);

  try {
    const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
    if (!token) return json({ error: 'Connexion requise' }, 401);

    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: userData, error: userError } = await admin.auth.getUser(token);
    const email = userData?.user?.email;
    if (userError || !email) return json({ error: 'Connexion requise' }, 401);

    const { data, error } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: { redirectTo: `${PARTNERS_URL}/espace` },
    });
    if (error || !data?.properties?.action_link) return json({ error: 'Lien indisponible' }, 500);

    return json({ url: data.properties.action_link });
  } catch (err) {
    console.error(err);
    return json({ error: 'Erreur interne' }, 500);
  }
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}
