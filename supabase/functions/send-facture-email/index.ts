import { createClient } from 'npm:@supabase/supabase-js@2';
import { base64FromBytes, formatChfPlain, sendResendEmail } from '../_shared/resend.ts';
import { fetchStorageBytes } from '../_shared/pdf-helpers.ts';
import { isValidSwissIban } from '../_shared/qrbill.ts';

const BUCKET = 'opus-storage';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function formatDateFr(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-CH');
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { facture_id } = await req.json();
    if (!facture_id) return json({ error: 'facture_id requis' }, 400);

    const apiKey = Deno.env.get('RESEND_API_KEY');
    if (!apiKey) {
      return json({ error: "L'envoi d'e-mail n'est pas encore configuré côté serveur." }, 500);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('Authorization') ?? '';

    // Bound to the caller's JWT: RLS enforces the caller belongs to the org
    // that owns this facture before anything else here runs.
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const admin = createClient(supabaseUrl, serviceKey);

    const { data: facture, error: factureError } = await userClient.from('factures').select('*').eq('id', facture_id).single();
    if (factureError || !facture) return json({ error: 'Facture introuvable ou accès refusé' }, 404);
    if (!facture.client_email) return json({ error: "Cette facture n'a pas d'adresse e-mail client." }, 400);
    if (facture.status === 'cancelled') return json({ error: 'Cette facture est annulée.' }, 400);
    if (facture.status === 'draft') return json({ error: "Finalisez d'abord la facture avant de l'envoyer." }, 400);

    const [{ data: org }, { data: items }, { data: payments }] = await Promise.all([
      admin.from('organizations').select('name, email, iban').eq('id', facture.organization_id).single(),
      admin.from('facture_items').select('quantity, unit_price').eq('facture_id', facture_id),
      admin.from('facture_payments').select('amount').eq('facture_id', facture_id),
    ]);

    if (!isValidSwissIban(org?.iban)) {
      return json(
        { error: "Ajoutez un IBAN valide dans Compte → Entreprise avant d'envoyer une facture — sans lui, le code QR de paiement ne peut pas être généré correctement." },
        400,
      );
    }

    // Always regenerate right before sending — a facture's PDF can go stale
    // (a payment recorded since the last generation, an edited line) and the
    // client must always receive the current state, not whatever was
    // attached last time.
    const genRes = await fetch(`${supabaseUrl}/functions/v1/generate-facture-pdf`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ facture_id }),
    });
    const genData = await genRes.json().catch(() => null);
    if (!genRes.ok || !genData?.path) {
      return json({ error: genData?.error ?? 'Échec de la génération du PDF de la facture.' }, 500);
    }

    const pdfFile = await fetchStorageBytes(admin, BUCKET, genData.path);
    if (!pdfFile) return json({ error: 'Le PDF de la facture est introuvable dans le stockage.' }, 500);

    const subtotal = (items ?? []).reduce((sum: number, it: any) => sum + Number(it.quantity) * Number(it.unit_price), 0);
    const total = subtotal * (1 + Number(facture.vat_rate) / 100);
    const paid = (payments ?? []).reduce((sum: number, p: any) => sum + Number(p.amount), 0);
    const remaining = Math.max(total - paid, 0);
    const orgName = org?.name ?? 'Notre entreprise';
    const publicUrl = `https://cantia.ch/facture-client/${facture.public_token}`;
    const kind = facture.is_deposit ? "Facture d'acompte" : 'Facture';

    const subject = `${kind} ${facture.number ?? ''} — ${orgName}`;
    const html = `
      <p>Bonjour${facture.client_name ? ` ${facture.client_name}` : ''},</p>
      <p>Veuillez trouver ci-joint notre facture :</p>
      <ul>
        <li>${kind} n° ${facture.number ?? '—'}</li>
        <li>Montant : CHF ${formatChfPlain(total)}</li>
        <li>Solde restant dû : CHF ${formatChfPlain(remaining)}</li>
        <li>Échéance : ${formatDateFr(facture.due_date)}</li>
      </ul>
      <p>
        <a href="${publicUrl}">Consulter cette facture en ligne</a> pour retrouver le détail et le solde restant à tout moment.
      </p>
      <p>Cordialement,<br/>${orgName}</p>
    `.trim();

    const { ok, error } = await sendResendEmail({
      apiKey,
      from: `${orgName} <noreply@cantia.ch>`,
      to: [facture.client_email],
      replyTo: org?.email,
      subject,
      html,
      attachments: [{ filename: `${kind}-${facture.number ?? facture_id}.pdf`, content: base64FromBytes(pdfFile.bytes) }],
    });
    if (!ok) return json({ error }, 502);

    // Status is already sent/partial/paid by this point (draft is rejected
    // above) — never downgrade a partial/paid facture back to "sent".

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
