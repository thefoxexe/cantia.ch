import { createClient } from 'npm:@supabase/supabase-js@2';

const BUCKET = 'opus-storage';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Public, unauthenticated endpoint (same trust model as get_public_devis /
// get_public_facture): re-verifies the token+email pair itself with the
// admin client rather than relying on RLS, since a client browsing their
// own portal has no Supabase session at all.
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { token, kind, email } = await req.json();
    if (!token || !kind || !email) return json({ error: 'Paramètres manquants' }, 400);
    if (kind !== 'devis' && kind !== 'facture') return json({ error: 'Type de document invalide' }, 400);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const admin = createClient(supabaseUrl, serviceKey);

    const table = kind === 'devis' ? 'devis' : 'factures';
    const { data: row, error } = await admin
      .from(table)
      .select('client_email, pdf_path')
      .eq('public_token', token)
      .single();

    if (error || !row) return json({ error: 'Lien invalide' }, 404);
    if (!row.client_email || row.client_email.trim().toLowerCase() !== String(email).trim().toLowerCase()) {
      return json({ error: 'Vérification impossible' }, 403);
    }
    if (!row.pdf_path) return json({ error: "Le PDF n'est pas encore disponible pour ce document." }, 404);

    const { data: signed, error: signError } = await admin.storage.from(BUCKET).createSignedUrl(row.pdf_path, 60 * 15);
    if (signError || !signed?.signedUrl) return json({ error: 'Échec de la génération du lien de téléchargement.' }, 500);

    return json({ url: signed.signedUrl });
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
