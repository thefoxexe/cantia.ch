import { createClient } from 'npm:@supabase/supabase-js@2';

// One-time sign-in link from one Cantia site to another for the signed-in
// user: app -> partners.cantia.ch (Compte -> Programme partenaire),
// app -> accounting.cantia.ch, accounting -> partners (commissions).
// Auth sessions stay per domain: sharing them through a .cantia.ch cookie
// would expose them to every subdomain, third-party ones included (status,
// links). The link is only ever returned to the account it signs in, and
// only to one of the allowed destinations below.
const TARGETS: Record<string, string> = {
  partners: `${Deno.env.get('PARTNERS_URL') ?? 'https://partners.cantia.ch'}/espace`,
  accounting: `${Deno.env.get('ACCOUNTING_URL') ?? 'https://accounting.cantia.ch'}/espace`,
};

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
    const body = await req.json().catch(() => ({}));
    const redirectTo = TARGETS[typeof body?.target === 'string' ? body.target : 'partners'];
    if (!redirectTo) return json({ error: 'Destination inconnue' }, 400);

    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: userData, error: userError } = await admin.auth.getUser(token);
    const email = userData?.user?.email;
    if (userError || !email) return json({ error: 'Connexion requise' }, 401);

    const { data, error } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: { redirectTo },
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
