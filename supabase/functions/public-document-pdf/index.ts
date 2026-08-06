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
      .select('id, client_email')
      .eq('public_token', token)
      .single();

    if (error || !row) return json({ error: 'Lien invalide' }, 404);
    if (!row.client_email || row.client_email.trim().toLowerCase() !== String(email).trim().toLowerCase()) {
      return json({ error: 'Vérification impossible' }, 403);
    }

    // Always regenerate before signing — same reasoning as send-devis-email /
    // send-facture-email: a client can download at any time, including right
    // after the org records a payment or edits a line, so the file handed
    // out must reflect the current state rather than whatever was generated
    // last (which could be stale, or never have existed at all). The
    // service-role key is forwarded as both apikey and Authorization so the
    // callee's userClient resolves under RLS-bypassing admin access.
    const genRes = await fetch(`${supabaseUrl}/functions/v1/generate-${kind}-pdf`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey, 'Content-Type': 'application/json' },
      body: JSON.stringify(kind === 'devis' ? { devis_id: row.id } : { facture_id: row.id }),
    });
    const genData = await genRes.json().catch(() => null);
    if (!genRes.ok || !genData?.path) {
      return json({ error: genData?.error ?? 'Échec de la génération du PDF.' }, 500);
    }

    const { data: signed, error: signError } = await admin.storage.from(BUCKET).createSignedUrl(genData.path, 60 * 15);
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
