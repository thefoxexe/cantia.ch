import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-dispatch-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const APP_URL = 'https://app.cantia.ch';

// The CTA link carries ?locale=<locale> rather than a /de/ or /it/ path prefix —
// those prefixes only exist for the crawlable marketing routes (app/de/**,
// app/it/**); the authenticated app has no locale-prefixed routes at all,
// it renders in whatever organization_members.locale says once signed in.
// ?locale= is the same mechanism lib/appHost.ts's authHref already uses to
// carry a language choice across a fresh, not-yet-authenticated navigation
// into app.cantia.ch — see applyLocaleFromUrlParam in lib/translations.

// Internal-only — invoked either by pg_net from downgrade_expired_trials()
// (legacy no-card trials) or directly by stripe-webhook's
// customer.subscription.deleted handler (current card-required flow), never
// by a client. Same shared secret as dispatch-notification/bexio-cron-sync,
// see 20260828140000_dispatch_secret_vault.sql. Self-contained rather than
// importing from ../_shared — the deploy tool can't resolve those relative
// imports (same issue as generate-lohnausweis-pdf and every other function
// deployed this way).
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
  subject: { fr: 'Votre période d’essai Cantia est terminée', de: 'Ihre Cantia-Testphase ist beendet', it: 'Il suo periodo di prova Cantia è terminato' },
  title: { fr: 'Votre essai est terminé', de: 'Ihre Testphase ist beendet', it: 'Il suo periodo di prova è terminato' },
  intro: {
    fr: 'La période d’essai de {org} sur Cantia est arrivée à son terme sans passage à un abonnement payant. Pas de panique : rien n’est perdu, vos données restent en sécurité et vous pouvez réactiver l’accès à tout moment.',
    de: 'Die Testphase von {org} auf Cantia ist abgelaufen, ohne dass ein kostenpflichtiges Abonnement abgeschlossen wurde. Keine Sorge: Es geht nichts verloren, Ihre Daten bleiben sicher und Sie können den Zugriff jederzeit reaktivieren.',
    it: 'Il periodo di prova di {org} su Cantia è terminato senza passaggio a un abbonamento a pagamento. Nessun problema: non si perde nulla, i suoi dati restano al sicuro e può riattivare l’accesso in qualsiasi momento.',
  },
  cta: { fr: 'Réactiver mon compte', de: 'Konto reaktivieren', it: 'Riattivi il mio account' },
  feedbackTitle: { fr: 'Une minute pour nous aider ?', de: 'Eine Minute, um uns zu helfen?', it: 'Un minuto per aiutarci?' },
  feedbackBody: {
    fr: 'On aimerait beaucoup savoir ce qui a manqué ou ce qui vous a freiné — répondez simplement à cet e-mail, on lit chaque message et ça nous aide vraiment à améliorer Cantia.',
    de: 'Wir würden gerne wissen, was gefehlt hat oder was Sie zurückgehalten hat — antworten Sie einfach auf diese E-Mail, wir lesen jede Nachricht und es hilft uns wirklich, Cantia zu verbessern.',
    it: 'Ci piacerebbe sapere cosa è mancato o cosa l’ha frenata — risponda semplicemente a questa e-mail, leggiamo ogni messaggio e ci aiuta davvero a migliorare Cantia.',
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
      .select('id, name, locale, trial_ended_email_sent_at')
      .eq('id', organization_id)
      .maybeSingle();
    if (!org) return json({ error: 'Entreprise introuvable.' }, 404);

    // Idempotency guard, shared by both callers (pg_cron and the Stripe
    // webhook) — whichever gets here first claims the send, any later or
    // retried call is a silent no-op rather than a duplicate e-mail.
    if (org.trial_ended_email_sent_at) return json({ ok: true, skipped: true });

    const { data: claim } = await admin
      .from('organizations')
      .update({ trial_ended_email_sent_at: new Date().toISOString() })
      .eq('id', organization_id)
      .is('trial_ended_email_sent_at', null)
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
      <p style="margin: 0 0 4px; font-size: 13px; font-weight: 700; color: #BC5A31; text-transform: uppercase; letter-spacing: 0.6px;">Cantia</p>
      <p style="margin: 0 0 20px; font-size: 22px; font-weight: 700; color: #231A12;">${escapeHtml(t(locale, 'title'))}</p>
      <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #231A12;">${escapeHtml(t(locale, 'intro', { org: org.name }))}</p>
      <p style="margin: 0 0 32px; text-align: center;">
        <a href="${APP_URL}/choose-plan?locale=${locale}" style="display: inline-block; background: #BC5A31; color: #fff; padding: 14px 28px; border-radius: 10px; font-weight: 700; text-decoration: none; font-size: 15px;">${escapeHtml(t(locale, 'cta'))}</a>
      </p>
      <div style="border-top: 1px solid #E6D8C2; padding-top: 20px;">
        <p style="margin: 0 0 8px; font-size: 14px; font-weight: 700; color: #231A12;">${escapeHtml(t(locale, 'feedbackTitle'))}</p>
        <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #6E6151;">${escapeHtml(t(locale, 'feedbackBody'))}</p>
      </div>
    `,
      locale,
    );

    await sendResendEmail({
      apiKey,
      from: 'Cantia <noreply@cantia.ch>',
      replyTo: 'info@cantia.ch',
      to: [email],
      subject: t(locale, 'subject', { org: org.name }),
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
