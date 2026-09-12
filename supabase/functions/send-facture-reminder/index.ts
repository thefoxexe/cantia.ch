import { createClient } from 'npm:@supabase/supabase-js@2';

// Self-contained on purpose (not importing ../_shared/*.ts) — the MCP
// deploy path for this function has repeatedly failed to resolve relative
// imports to _shared files ("Module not found ... _shared/resend.ts") even
// though the file layout matches other functions that supposedly deploy
// that way. Every other payroll PDF function in this repo hit the same
// wall and was made self-contained for the same reason; this one follows
// that precedent rather than fighting the deploy tool again. Keep it in
// sync with lib/translations and _shared/resend.ts/pdf-i18n.ts by hand if
// those change.

const BUCKET = 'opus-storage';

type PdfLocale = 'fr' | 'de' | 'it';

function resolvePdfLocale(org: any): PdfLocale {
  return org?.locale === 'de' ? 'de' : org?.locale === 'it' ? 'it' : 'fr';
}
function resolveDocLocale(doc: any, org: any): PdfLocale {
  if (doc?.locale === 'de' || doc?.locale === 'fr' || doc?.locale === 'it') return doc.locale;
  return resolvePdfLocale(org);
}

const LABELS = {
  projectLabel: { fr: 'Chantier', de: 'Baustelle', it: 'Cantiere' },
  emailGreeting: { fr: 'Bonjour', de: 'Hallo', it: 'Buongiorno' },
  emailSignatureFallback: { fr: 'Meilleures salutations,', de: 'Freundliche Grüsse,', it: 'Cordiali saluti,' },
  reminderOverdueDefaultMessage: {
    fr: "Bonjour {{client}},\n\nSauf erreur de notre part, cette facture est toujours impayée. Merci de la régler, ou de nous prévenir si c'est déjà fait.",
    de: 'Hallo {{client}},\n\nSofern uns kein Fehler unterlaufen ist, ist diese Rechnung noch offen. Bitte begleichen Sie sie, oder informieren Sie uns, falls dies bereits geschehen ist.',
    it: 'Buongiorno {{client}},\n\nSalvo nostro errore, questa fattura risulta ancora non saldata. Vi preghiamo di regolarla, oppure di avvisarci se il pagamento è già stato effettuato.',
  },
  reminderUpcomingDefaultMessage: {
    fr: 'Bonjour {{client}},\n\nPetit rappel : cette facture arrive bientôt à échéance.',
    de: 'Hallo {{client}},\n\nEine kurze Erinnerung: Diese Rechnung wird bald fällig.',
    it: 'Buongiorno {{client}},\n\nUn breve promemoria: questa fattura sta per scadere.',
  },
  viewFacture: { fr: 'Voir la facture', de: 'Rechnung ansehen', it: 'Visualizza la fattura' },
  detailAndBalance: { fr: 'détail et solde à jour', de: 'Details und aktueller Saldo', it: 'dettaglio e saldo aggiornato' },
  reminderSubjectOverdue: { fr: 'Rappel — facture {number} en retard de paiement', de: 'Erinnerung — Rechnung {number} überfällig', it: 'Promemoria — fattura {number} scaduta' },
  reminderSubjectUpcoming: { fr: 'Rappel — facture {number} à régler prochainement', de: 'Erinnerung — Rechnung {number} bald fällig', it: 'Promemoria — fattura {number} in scadenza' },
} as const;

type LabelKey = keyof typeof LABELS;

function pdfT(locale: PdfLocale, key: LabelKey, vars?: Record<string, string | number>): string {
  let text: string = LABELS[key][locale];
  if (vars) {
    for (const [k, v] of Object.entries(vars)) text = text.replace(`{${k}}`, String(v));
  }
  return text;
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function textToHtmlLines(text: string): string {
  return escapeHtml(text).split('\n').join('<br/>');
}
function applyEmailVariables(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key: string) => vars[key] ?? match);
}

function buildDocumentEmailHtml(params: {
  clientName: string | null;
  bodyMessage: string;
  linkUrl: string;
  linkLabel: string;
  linkHint: string;
  signature: string;
}): string {
  const { bodyMessage, linkUrl, linkLabel, linkHint, signature } = params;
  const font = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
  return `
    <div style="font-family: ${font}; font-size: 15px; line-height: 1.6; color: #1a1f1c; max-width: 560px;">
      <p style="margin: 0 0 20px;">${textToHtmlLines(bodyMessage)}</p>
      <p style="margin: 0 0 24px;">
        <a href="${linkUrl}" style="color: #1f3d3a; font-weight: 700; text-decoration: underline;">${escapeHtml(linkLabel)}</a>
        ${linkHint ? ` — ${escapeHtml(linkHint)}` : ''}
      </p>
      <p style="margin: 0; padding-top: 16px; border-top: 1px solid #e5e2da; color: #1a1f1c;">${textToHtmlLines(signature)}</p>
    </div>
  `.trim();
}

function base64FromBytes(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  return btoa(binary);
}

async function fetchStorageBytes(admin: ReturnType<typeof createClient>, bucket: string, path: string): Promise<{ bytes: Uint8Array } | null> {
  const { data, error } = await admin.storage.from(bucket).download(path);
  if (error || !data) return null;
  return { bytes: new Uint8Array(await data.arrayBuffer()) };
}

async function sendResendEmail(params: {
  apiKey: string;
  from: string;
  to: string[];
  replyTo?: string | null;
  subject: string;
  html: string;
  attachments?: { filename: string; content: string }[];
}): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${params.apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: params.from,
      to: params.to,
      reply_to: params.replyTo || undefined,
      subject: params.subject,
      html: params.html,
      attachments: params.attachments,
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    console.error('Resend error', res.status, errText);
    return { ok: false, error: `Échec de l'envoi de l'e-mail (${res.status})` };
  }
  return { ok: true };
}

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
    if (facture.status === 'paid') return json({ error: 'Cette facture est déjà payée.' }, 400);
    if (facture.status === 'cancelled') return json({ error: 'Cette facture est annulée.' }, 400);

    const { data: org } = await admin
      .from('organizations')
      .select('name, email, plan_id, facture_reminder_message_upcoming, facture_reminder_message_overdue, email_signature, locale')
      .eq('id', facture.organization_id)
      .single();
    const locale = resolveDocLocale(facture, org);

    const { data: plan } = await admin.from('plans').select('has_email_sending').eq('id', org?.plan_id).single();
    if (plan && plan.has_email_sending === false) {
      return json({ error: "L'envoi de relances par e-mail n'est pas disponible sur votre plan. Passez à un plan supérieur pour l'activer." }, 403);
    }

    const overdue = facture.due_date < new Date().toISOString().slice(0, 10);
    const orgName = org?.name ?? 'Notre entreprise';

    // Regenerate right before sending, same as send-facture-email — a
    // reminder must carry the facture's current state (payments recorded
    // since the original send, a since-added late-payment fee line), never
    // whatever was attached the first time it went out.
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

    const publicUrl = `https://cantia.ch/facture-client/${facture.public_token}`;

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

    const subject = pdfT(locale, overdue ? 'reminderSubjectOverdue' : 'reminderSubjectUpcoming', { number: facture.number ?? '' });

    const rawMessage =
      String(custom_message ?? '').trim() ||
      String((overdue ? org?.facture_reminder_message_overdue : org?.facture_reminder_message_upcoming) ?? '').trim() ||
      pdfT(locale, overdue ? 'reminderOverdueDefaultMessage' : 'reminderUpcomingDefaultMessage');
    const rawSignature = String(org?.email_signature ?? '').trim() || `${pdfT(locale, 'emailSignatureFallback')}\n${orgName}`;
    const bodyMessage = applyEmailVariables(rawMessage, vars);
    const signature = applyEmailVariables(rawSignature, vars);

    const html = buildDocumentEmailHtml({
      clientName: facture.client_name,
      bodyMessage,
      linkUrl: publicUrl,
      linkLabel: pdfT(locale, 'viewFacture'),
      linkHint: pdfT(locale, 'detailAndBalance'),
      signature,
    });

    const { ok, error } = await sendResendEmail({
      apiKey,
      from: `${orgName} <noreply@cantia.ch>`,
      to: [facture.client_email],
      replyTo: org?.email,
      subject,
      html,
      attachments: [{ filename: `Facture-${facture.number ?? facture_id}.pdf`, content: base64FromBytes(pdfFile.bytes) }],
    });
    if (!ok) return json({ error }, 502);

    await admin.from('factures').update({ last_reminded_at: new Date().toISOString() }).eq('id', facture_id);

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
