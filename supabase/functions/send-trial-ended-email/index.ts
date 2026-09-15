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
          <img src="data:image/png;base64,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" width="24" height="24" alt="Cantia" style="vertical-align: middle; border: 0; display: inline-block;" />
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
