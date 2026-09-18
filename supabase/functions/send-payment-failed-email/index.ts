import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-dispatch-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const APP_URL = 'https://app.cantia.ch';

// Internal-only, same shared-secret convention as send-trial-ended-email —
// invoked exclusively by stripe-webhook's customer.subscription.updated
// handler the moment a charge failure actually cuts off access (the
// !hasAccess && orgBefore?.plan_id transition), never by a client.
const DISPATCH_SECRET = Deno.env.get('DISPATCH_SECRET');

type Locale = 'fr' | 'de' | 'it';

function resolveLocale(org: any): Locale {
  return org?.locale === 'de' ? 'de' : org?.locale === 'it' ? 'it' : 'fr';
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const LABELS = {
  subject: {
    fr: 'Le paiement de votre abonnement Cantia n’est pas passé',
    de: 'Die Zahlung für Ihr Cantia-Abonnement ist fehlgeschlagen',
    it: 'Il pagamento del suo abbonamento Cantia non è andato a buon fine',
  },
  eyebrow: { fr: 'Paiement échoué', de: 'Zahlung fehlgeschlagen', it: 'Pagamento non riuscito' },
  title: { fr: 'Le paiement n’est pas passé', de: 'Die Zahlung ist fehlgeschlagen', it: 'Il pagamento non è riuscito' },
  intro: {
    fr: 'La banque de {org} a refusé le dernier prélèvement pour votre abonnement Cantia — carte expirée, plafond atteint ou fonds insuffisants sont les causes les plus courantes. Le temps de régulariser, l’accès à Cantia est suspendu pour toute l’équipe.',
    de: 'Die Bank von {org} hat die letzte Abbuchung für Ihr Cantia-Abonnement abgelehnt — abgelaufene Karte, erreichtes Limit oder unzureichende Mittel sind die häufigsten Ursachen. Bis zur Klärung ist der Zugriff auf Cantia für das gesamte Team gesperrt.',
    it: 'La banca di {org} ha rifiutato l’ultimo addebito per il suo abbonamento Cantia — carta scaduta, limite raggiunto o fondi insufficienti sono le cause più comuni. Fino alla regolarizzazione, l’accesso a Cantia è sospeso per tutto il team.',
  },
  reassure: {
    fr: 'Rien n’est perdu : vos devis, factures et chantiers restent intacts et vous récupérez l’accès dès que le paiement est régularisé.',
    de: 'Es geht nichts verloren: Ihre Offerten, Rechnungen und Baustellen bleiben erhalten, und Sie erhalten den Zugriff zurück, sobald die Zahlung geregelt ist.',
    it: 'Non si perde nulla: i suoi preventivi, fatture e cantieri restano intatti e riottiene l’accesso non appena il pagamento è regolarizzato.',
  },
  cta: { fr: 'Mettre à jour mon paiement', de: 'Zahlung aktualisieren', it: 'Aggiorni il pagamento' },
  helpTitle: { fr: 'Besoin d’aide ?', de: 'Brauchen Sie Hilfe?', it: 'Ha bisogno di aiuto?' },
  helpBody: {
    fr: 'Un souci avec votre banque ou votre moyen de paiement ? Répondez simplement à cet e-mail, on s’en occupe avec vous.',
    de: 'Ein Problem mit Ihrer Bank oder Ihrem Zahlungsmittel? Antworten Sie einfach auf diese E-Mail, wir kümmern uns gemeinsam mit Ihnen darum.',
    it: 'Un problema con la sua banca o il suo mezzo di pagamento? Risponda semplicemente a questa e-mail, ce ne occupiamo insieme a lei.',
  },
  footerTagline: {
    fr: 'Cantia — logiciel suisse de gestion pour entreprises du bâtiment',
    de: 'Cantia — Schweizer Verwaltungssoftware für Bauunternehmen',
    it: 'Cantia — software svizzero di gestione per aziende edili',
  },
} as const;

function t(locale: Locale, key: keyof typeof LABELS, vars?: Record<string, string>): string {
  let text: string = LABELS[key][locale];
  if (vars) for (const [k, v] of Object.entries(vars)) text = text.replace(`{${k}}`, v);
  return text;
}

// A soft terracotta "card declined" badge — warm and on-brand rather than
// an alarming red siren, matching the reassuring tone of the copy below it
// (this is a routine dunning notice, not an incident).
const CARD_BADGE_SVG = `
  <div style="width: 56px; height: 56px; border-radius: 16px; background: #F3E8D6; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="5" width="20" height="14" rx="2.5" stroke="#9C6510" stroke-width="1.8"/>
      <line x1="2" y1="9.5" x2="22" y2="9.5" stroke="#9C6510" stroke-width="1.8"/>
      <line x1="5.5" y1="14.5" x2="10" y2="14.5" stroke="#9C6510" stroke-width="1.8" stroke-linecap="round"/>
      <circle cx="18" cy="15.5" r="4.5" fill="#F3E8D6" stroke="#9C6510" stroke-width="1.6"/>
      <line x1="16.4" y1="15.5" x2="19.6" y2="15.5" stroke="#9C6510" stroke-width="1.6" stroke-linecap="round"/>
    </svg>
  </div>
`;

function buildBrandedEmailShell(bodyHtml: string, locale: Locale): string {
  const font = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
  return `
    <div style="background: #F7F1E6; padding: 40px 20px; font-family: ${font};">
      <div style="max-width: 480px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; border: 1px solid #E6D8C2; overflow: hidden;">
        <div style="padding: 28px 32px 20px; border-bottom: 1px solid #E6D8C2;">
          <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPAAAADwCAYAAAA+VemSAAAABmJLR0QA/wD/AP+gvaeTAAAgAElEQVR4nO2de7QlVX3nv/uc27dbELDF5tEgQ2xApHGBGqMRcS40KMbESZzplZm4khgf7VozWUkwxgSauO5ykplkxcSVzGSWQHyMY3QmnccMZIxKDD3aoEZNbLUbaLqBhKZRabqbboR+3FO/+eOcqv2u2ruq9rl1qn/fBbeqq+r3229P1d6/2uccgMVisVgsFovFYrFYLBaLxWKxWCwWi8VisVgsFovFYrFYLBaLxWKxWCwWi8VisVgsFovFYrFYLBaLxWKxWCxW3/X/ASXj6Yt23tA0AAAAAElFTkSuQmCC" width="24" height="24" alt="Cantia" style="vertical-align: middle; border: 0; display: inline-block;" />
          <span style="font-size: 20px; font-weight: 800; letter-spacing: 0.2px; color: #231A12; vertical-align: middle; margin-left: 8px;">Cantia</span>
        </div>
        <div style="padding: 32px;">
          ${bodyHtml}
        </div>
      </div>
      <p style="max-width: 480px; margin: 20px auto 0; text-align: center; font-size: 12px; color: #6E6151; line-height: 1.6;">
        ${escapeHtml(t(locale, 'footerTagline'))}<br/>
        <a href="https://cantia.ch" style="color: #BC5A31; text-decoration: none; font-weight: 600;">cantia.ch</a>
      </p>
    </div>
  `.trim();
}

async function sendResendEmail(params: { apiKey: string; from: string; replyTo?: string; to: string[]; subject: string; html: string }): Promise<{ ok: boolean }> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${params.apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: params.from, to: params.to, reply_to: params.replyTo, subject: params.subject, html: params.html }),
  });
  if (!res.ok) console.error('Resend error', res.status, await res.text());
  return { ok: res.ok };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  if (!DISPATCH_SECRET || req.headers.get('x-dispatch-secret') !== DISPATCH_SECRET) {
    return json({ error: 'unauthorized' }, 401);
  }

  try {
    const { organization_id } = await req.json();
    if (!organization_id) return json({ error: 'organization_id requis' }, 400);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const admin = createClient(supabaseUrl, serviceKey);

    const { data: org } = await admin
      .from('organizations')
      .select('id, name, locale, payment_failed_email_sent_at')
      .eq('id', organization_id)
      .maybeSingle();
    if (!org) return json({ error: 'Entreprise introuvable.' }, 404);

    // Idempotency claim, same pattern as send-trial-ended-email — whichever
    // call gets here first (Stripe can redeliver the same webhook event)
    // claims the send. Unlike the trial-ended flag, stripe-webhook clears
    // this column back to null the moment access is restored, so a later,
    // genuinely new payment failure on the same organization sends again.
    if (org.payment_failed_email_sent_at) return json({ ok: true, skipped: true });

    const { data: claim } = await admin
      .from('organizations')
      .update({ payment_failed_email_sent_at: new Date().toISOString() })
      .eq('id', organization_id)
      .is('payment_failed_email_sent_at', null)
      .select('id')
      .maybeSingle();
    if (!claim) return json({ ok: true, skipped: true });

    const { data: owner } = await admin
      .from('organization_members')
      .select('user_id')
      .eq('organization_id', organization_id)
      .eq('role', 'owner')
      .maybeSingle();
    if (!owner) return json({ ok: true, skipped: true });

    const { data: ownerAuth } = await admin.auth.admin.getUserById(owner.user_id);
    const email = ownerAuth?.user?.email;
    const apiKey = Deno.env.get('RESEND_API_KEY');
    if (!email || !apiKey) return json({ ok: true, skipped: true });

    const locale = resolveLocale(org);
    const html = buildBrandedEmailShell(
      `
      ${CARD_BADGE_SVG}
      <p style="margin: 0 0 4px; font-size: 13px; font-weight: 700; color: #9C6510; text-transform: uppercase; letter-spacing: 0.6px;">${escapeHtml(t(locale, 'eyebrow'))}</p>
      <p style="margin: 0 0 20px; font-size: 22px; font-weight: 700; color: #231A12;">${escapeHtml(t(locale, 'title'))}</p>
      <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #231A12;">${escapeHtml(t(locale, 'intro', { org: org.name }))}</p>
      <p style="margin: 0 0 28px; font-size: 14px; line-height: 1.6; color: #6E6151;">${escapeHtml(t(locale, 'reassure'))}</p>
      <p style="margin: 0 0 32px; text-align: center;">
        <a href="${APP_URL}/choose-plan?locale=${locale}" style="display: inline-block; background: #BC5A31; color: #fff; padding: 14px 28px; border-radius: 10px; font-weight: 700; text-decoration: none; font-size: 15px;">${escapeHtml(t(locale, 'cta'))}</a>
      </p>
      <div style="border-top: 1px solid #E6D8C2; padding-top: 20px;">
        <p style="margin: 0 0 8px; font-size: 14px; font-weight: 700; color: #231A12;">${escapeHtml(t(locale, 'helpTitle'))}</p>
        <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #6E6151;">${escapeHtml(t(locale, 'helpBody'))}</p>
      </div>
    `,
      locale,
    );

    await sendResendEmail({
      apiKey,
      from: 'Cantia <noreply@cantia.ch>',
      replyTo: 'info@cantia.ch',
      to: [email],
      subject: t(locale, 'subject'),
      html,
    });

    return json({ ok: true });
  } catch (err) {
    console.error(err);
    return json({ error: String(err instanceof Error ? err.message : err) }, 500);
  }
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}
