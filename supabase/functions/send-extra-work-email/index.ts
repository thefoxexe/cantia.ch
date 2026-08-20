import { createClient } from 'npm:@supabase/supabase-js@2';
import { buildDocumentEmailHtml, formatChfPlain, sendResendEmail } from '../_shared/resend.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// No PDF attachment in v1 — travaux supplémentaires are meant to be
// captured and validated fast from the field; the client's only action is
// the portal link (view, sign, done). Mirrors send-devis-email's shape
// otherwise.
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { extra_work_id, custom_message } = await req.json();
    if (!extra_work_id) return json({ error: 'extra_work_id requis' }, 400);

    const apiKey = Deno.env.get('RESEND_API_KEY');
    if (!apiKey) {
      return json({ error: "L'envoi d'e-mail n'est pas encore configuré côté serveur." }, 500);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('Authorization') ?? '';

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const admin = createClient(supabaseUrl, serviceKey);

    const { data: work, error: workError } = await userClient.from('extra_works').select('*, projects(name)').eq('id', extra_work_id).single();
    if (workError || !work) return json({ error: 'Travaux supplémentaires introuvables ou accès refusé' }, 404);
    if (!work.client_email) return json({ error: "Ces travaux supplémentaires n'ont pas d'adresse e-mail client." }, 400);

    const [{ data: org }, { data: items }] = await Promise.all([
      admin.from('organizations').select('name, email, plan_id, email_signature').eq('id', work.organization_id).single(),
      admin.from('extra_work_items').select('quantity, unit_price').eq('extra_work_id', extra_work_id),
    ]);

    const { data: plan } = await admin.from('plans').select('has_email_sending').eq('id', org?.plan_id).single();
    if (plan && plan.has_email_sending === false) {
      return json({ error: "L'envoi par e-mail n'est pas disponible sur votre plan. Passez à un plan supérieur pour l'activer." }, 403);
    }

    const subtotal = (items ?? []).reduce((sum: number, it: any) => sum + Number(it.quantity) * Number(it.unit_price), 0);
    const total = subtotal * (1 + Number(work.vat_rate) / 100);
    const orgName = org?.name ?? 'Notre entreprise';
    const publicUrl = `https://cantia.ch/travaux-supplementaires-client/${work.public_token}`;

    const bodyMessage =
      String(custom_message ?? '').trim() ||
      "Des travaux supplémentaires ont été réalisés sur votre chantier, en complément du devis initial. Vous trouverez le détail et pourrez les valider directement en ligne.";
    const signature = String(org?.email_signature ?? '').trim() || `Meilleures salutations,\n${orgName}`;

    const subject = `Travaux supplémentaires ${work.number ?? ''} — ${orgName}`;
    const html = buildDocumentEmailHtml({
      clientName: work.client_name,
      bodyMessage,
      projectName: work.projects?.name ?? null,
      detailsTitle: `Travaux supplémentaires n° ${work.number ?? '—'} — ${work.title}`,
      detailsLines: [`Montant : CHF ${formatChfPlain(total)}`],
      linkUrl: publicUrl,
      linkLabel: 'Consulter et valider en ligne',
      linkHint: 'vous pouvez les accepter et les signer directement depuis cette page sécurisée, sans créer de compte',
      signature,
    });

    const { ok, error } = await sendResendEmail({
      apiKey,
      from: `${orgName} <noreply@cantia.ch>`,
      to: [work.client_email],
      replyTo: org?.email,
      subject,
      html,
    });
    if (!ok) return json({ error }, 502);

    if (work.status === 'draft') {
      await admin.from('extra_works').update({ status: 'sent' }).eq('id', extra_work_id);
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
