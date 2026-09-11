import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-dispatch-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const APP_URL = 'https://app.cantia.ch';

// Internal-only — invoked either by pg_net from
// send_incomplete_signup_reminders() (real sends, gated by organization_id +
// the idempotency guard below) or directly by an admin's test send
// (testEmail, no organization_id, no DB write at all). Same shared secret as
// dispatch-notification/send-trial-ended-email, see
// 20260828140000_dispatch_secret_vault.sql. Self-contained rather than
// importing from ../_shared — the deploy tool can't resolve those relative
// imports (same issue as every other function deployed this way).
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
  subject: { fr: 'Finalisez votre inscription sur Cantia', de: 'Schließen Sie Ihre Anmeldung bei Cantia ab', it: 'Completi la sua registrazione su Cantia' },
  title: { fr: "Votre inscription n'est pas terminée", de: 'Ihre Anmeldung ist noch nicht abgeschlossen', it: 'La sua registrazione non è ancora completata' },
  intro: {
    fr: "Vous avez créé un compte pour {org} sur Cantia, mais vous n'avez pas encore choisi de plan — votre inscription est restée en suspens. Vous avez droit à 14 jours d'essai gratuit pour découvrir devis, factures, chantiers, planning, trésorerie et le reste, sans engagement.",
    de: 'Sie haben ein Konto für {org} bei Cantia erstellt, aber noch keinen Plan gewählt — Ihre Anmeldung ist offen geblieben. Sie haben Anspruch auf 14 Tage kostenlose Testphase, um Offerten, Rechnungen, Baustellen, Planung, Liquidität und mehr unverbindlich zu entdecken.',
    it: 'Ha creato un account per {org} su Cantia, ma non ha ancora scelto un piano — la sua registrazione è rimasta in sospeso. Ha diritto a 14 giorni di prova gratuita per scoprire preventivi, fatture, cantieri, pianificazione, tesoreria e altro, senza impegno.',
  },
  cta: { fr: 'Choisir mon plan', de: 'Plan auswählen', it: 'Scelga il suo piano' },
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

function buildBrandedEmailShell(bodyHtml: string, locale: Locale): string {
  const font = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
  return `
    <div style="background: #F7F1E6; padding: 40px 20px; font-family: ${font};">
      <div style="max-width: 480px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; border: 1px solid #E6D8C2; overflow: hidden;">
        <div style="padding: 28px 32px 20px; border-bottom: 1px solid #E6D8C2;">
          <img src="https://cantia.ch/logo-email.png" width="32" height="32" alt="Cantia" style="vertical-align: middle; border-radius: 7px; border: 0; display: inline-block;" />
          <span style="font-size: 18px; font-weight: 700; color: #231A12; margin-left: 10px; vertical-align: middle;">Cantia</span>
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

function buildHtml(orgName: string, locale: Locale): string {
  return buildBrandedEmailShell(
    `
    <p style="margin: 0 0 4px; font-size: 13px; font-weight: 700; color: #BC5A31; text-transform: uppercase; letter-spacing: 0.6px;">Cantia</p>
    <p style="margin: 0 0 20px; font-size: 22px; font-weight: 700; color: #231A12;">${escapeHtml(t(locale, 'title'))}</p>
    <p style="margin: 0 0 32px; font-size: 15px; line-height: 1.6; color: #231A12;">${escapeHtml(t(locale, 'intro', { org: orgName }))}</p>
    <p style="margin: 0; text-align: center;">
      <a href="${APP_URL}/choose-plan?locale=${locale}" style="display: inline-block; background: #BC5A31; color: #fff; padding: 14px 28px; border-radius: 10px; font-weight: 700; text-decoration: none; font-size: 15px;">${escapeHtml(t(locale, 'cta'))}</a>
    </p>
  `,
    locale,
  );
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
    const { organization_id, testEmail, testLocale } = await req.json();
    const apiKey = Deno.env.get('RESEND_API_KEY');
    if (!apiKey) return json({ error: 'Service mail non configuré.' }, 500);

    // Test mode: no DB read, no idempotency write, no owner lookup — just a
    // one-off send to whatever address the admin composer passed, with a
    // placeholder org name, so the exact real template can be reviewed
    // before the automation is scheduled for real accounts.
    if (testEmail) {
      const locale = testLocale === 'de' || testLocale === 'it' ? testLocale : 'fr';
      const html = buildHtml('Votre Entreprise', locale);
      const { ok } = await sendResendEmail({
        apiKey,
        from: 'Cantia <noreply@cantia.ch>',
        replyTo: 'info@cantia.ch',
        to: [testEmail],
        subject: `[TEST] ${t(locale, 'subject')}`,
        html,
      });
      if (!ok) return json({ error: "Échec de l'envoi du test." }, 500);
      return json({ ok: true, test: true });
    }

    if (!organization_id) return json({ error: 'organization_id ou testEmail requis' }, 400);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const admin = createClient(supabaseUrl, serviceKey);

    const { data: org } = await admin
      .from('organizations')
      .select('id, name, locale, signup_reminder_email_sent_at')
      .eq('id', organization_id)
      .maybeSingle();
    if (!org) return json({ error: 'Entreprise introuvable.' }, 404);

    // Idempotency guard — a retried/duplicate call is a silent no-op rather
    // than a second reminder.
    if (org.signup_reminder_email_sent_at) return json({ ok: true, skipped: true });

    const { data: claim } = await admin
      .from('organizations')
      .update({ signup_reminder_email_sent_at: new Date().toISOString() })
      .eq('id', organization_id)
      .is('signup_reminder_email_sent_at', null)
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
    if (!email) return json({ ok: true, skipped: true });

    const locale = resolveLocale(org);
    const html = buildHtml(org.name, locale);

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
