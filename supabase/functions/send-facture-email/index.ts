import { createClient } from 'npm:@supabase/supabase-js@2';
import { applyEmailVariables, base64FromBytes, buildDocumentEmailHtml, sendResendEmail } from '../_shared/resend.ts';
import { fetchStorageBytes } from '../_shared/pdf-helpers.ts';
import { isValidSwissIban } from '../_shared/qrbill.ts';
import { pdfT, resolvePdfLocale } from '../_shared/pdf-i18n.ts';

const BUCKET = 'opus-storage';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { facture_id, custom_message } = await req.json();
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

    const { data: org } = await admin
      .from('organizations')
      .select('name, email, iban, plan_id, facture_email_message, email_signature, locale')
      .eq('id', facture.organization_id)
      .single();
    const locale = resolvePdfLocale(org);

    const { data: plan } = await admin.from('plans').select('has_email_sending').eq('id', org?.plan_id).single();
    if (plan && plan.has_email_sending === false) {
      return json({ error: "L'envoi de factures par e-mail n'est pas disponible sur votre plan. Passez à un plan supérieur pour l'activer." }, 403);
    }

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
      headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ facture_id }),
    });
    const genData = await genRes.json().catch(() => null);
    if (!genRes.ok || !genData?.path) {
      return json({ error: genData?.error ?? 'Échec de la génération du PDF de la facture.' }, 500);
    }

    const pdfFile = await fetchStorageBytes(admin, BUCKET, genData.path);
    if (!pdfFile) return json({ error: 'Le PDF de la facture est introuvable dans le stockage.' }, 500);

    const orgName = org?.name ?? 'Notre entreprise';
    const publicUrl = `https://cantia.ch/facture-client/${facture.public_token}`;
    const kind = pdfT(locale, facture.is_deposit ? 'factureDepositLabel' : 'factureLabel');

    let projectName: string | null = null;
    if (facture.project_id) {
      const { data: project } = await admin.from('projects').select('name').eq('id', facture.project_id).single();
      projectName = project?.name ?? null;
    }
    const vars = {
      client: facture.client_name ?? '',
      entreprise: orgName,
      numero: facture.number ?? '',
      chantier: projectName ?? '',
      echeance: formatDateFr(facture.due_date),
    };

    const rawMessage =
      String(custom_message ?? org?.facture_email_message ?? '').trim() ||
      pdfT(locale, 'factureDefaultMessage');
    const rawSignature = String(org?.email_signature ?? '').trim() || `${pdfT(locale, 'emailSignatureFallback')}\n${orgName}`;
    const bodyMessage = applyEmailVariables(rawMessage, vars);
    const signature = applyEmailVariables(rawSignature, vars);

    const subject = `${kind} ${facture.number ?? ''} — ${orgName}`;
    const html = buildDocumentEmailHtml({
      clientName: facture.client_name,
      bodyMessage,
      includeGreeting: false,
      linkUrl: publicUrl,
      linkLabel: pdfT(locale, 'viewFacture'),
      linkHint: pdfT(locale, 'detailAndBalance'),
      signature,
      locale,
    });

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

function formatDateFr(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  return `${day}.${month}.${year}`;
}
