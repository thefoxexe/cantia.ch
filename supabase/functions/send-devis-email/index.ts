import { createClient } from 'npm:@supabase/supabase-js@2';
import { base64FromBytes, formatChfPlain, sendResendEmail } from '../_shared/resend.ts';
import { fetchStorageBytes } from '../_shared/pdf-helpers.ts';

const BUCKET = 'opus-storage';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { devis_id } = await req.json();
    if (!devis_id) return json({ error: 'devis_id requis' }, 400);

    const apiKey = Deno.env.get('RESEND_API_KEY');
    if (!apiKey) {
      return json({ error: "L'envoi d'e-mail n'est pas encore configuré côté serveur." }, 500);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('Authorization') ?? '';

    // Bound to the caller's JWT: RLS enforces the caller belongs to the org
    // that owns this devis before anything else here runs.
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const admin = createClient(supabaseUrl, serviceKey);

    const { data: devis, error: devisError } = await userClient.from('devis').select('*').eq('id', devis_id).single();
    if (devisError || !devis) return json({ error: 'Devis introuvable ou accès refusé' }, 404);
    if (!devis.client_email) return json({ error: "Ce devis n'a pas d'adresse e-mail client." }, 400);
    if (devis.status === 'draft') return json({ error: "Finalisez d'abord le devis (passez-le à \"Prêt à l'envoi\") avant de l'envoyer." }, 400);

    const [{ data: org }, { data: items }] = await Promise.all([
      admin.from('organizations').select('name, email').eq('id', devis.organization_id).single(),
      admin.from('devis_items').select('quantity, unit_price').eq('devis_id', devis_id),
    ]);

    // Always regenerate right before sending — a resent devis must reflect
    // any edits made since the last generation, not a stale PDF.
    const genRes = await fetch(`${supabaseUrl}/functions/v1/generate-devis-pdf`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ devis_id }),
    });
    const genData = await genRes.json().catch(() => null);
    if (!genRes.ok || !genData?.path) {
      return json({ error: genData?.error ?? 'Échec de la génération du PDF du devis.' }, 500);
    }

    const pdfFile = await fetchStorageBytes(admin, BUCKET, genData.path);
    if (!pdfFile) return json({ error: 'Le PDF du devis est introuvable dans le stockage.' }, 500);

    const subtotal = (items ?? []).reduce((sum: number, it: any) => sum + Number(it.quantity) * Number(it.unit_price), 0);
    const total = subtotal * (1 + Number(devis.vat_rate) / 100);
    const orgName = org?.name ?? 'Notre entreprise';
    const publicUrl = `https://cantia.ch/devis-client/${devis.public_token}`;

    const subject = `Devis ${devis.number ?? ''} — ${orgName}`;
    const html = `
      <p>Bonjour${devis.client_name ? ` ${devis.client_name}` : ''},</p>
      <p>Veuillez trouver ci-joint notre devis :</p>
      <ul>
        <li>Devis n° ${devis.number ?? '—'}</li>
        <li>Montant : CHF ${formatChfPlain(total)}</li>
      </ul>
      <p>
        <a href="${publicUrl}">Consulter et accepter ce devis en ligne</a> — vous pouvez le signer directement
        depuis cette page sécurisée, sans avoir besoin de créer de compte.
      </p>
      <p>Cordialement,<br/>${orgName}</p>
    `.trim();

    const { ok, error } = await sendResendEmail({
      apiKey,
      from: `${orgName} <noreply@cantia.ch>`,
      to: [devis.client_email],
      replyTo: org?.email,
      subject,
      html,
      attachments: [{ filename: `Devis-${devis.number ?? devis_id}.pdf`, content: base64FromBytes(pdfFile.bytes) }],
    });
    if (!ok) return json({ error }, 502);

    if (devis.status === 'ready') {
      await admin.from('devis').update({ status: 'sent' }).eq('id', devis_id);
    }

    return json({ sent: true });
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
