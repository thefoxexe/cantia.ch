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

// A short personal note from Bastien, not a branded newsletter: plain text
// look, first name, a real question, and replies land on info@cantia.ch.
const FROM = 'Bastien de Cantia <info@cantia.ch>';

const COPY: Record<Locale, { subject: string; hello: (name: string) => string; body: (org: string, link: string) => string[]; bye: string }> = {
  fr: {
    subject: 'Votre compte Cantia',
    hello: (name) => (name ? `Bonjour ${name},` : 'Bonjour,'),
    body: (org, link) => [
      `Je suis Bastien, de Cantia. J’ai vu que vous aviez créé un compte pour ${org} il y a quelques jours, sans aller jusqu’au bout.`,
      'Est-ce que quelque chose vous a bloqué ? Une question sur les formules, la carte demandée pour l’essai, ou simplement le temps de regarder ? Répondez-moi directement à ce mail, je vous réponds personnellement.',
      `Pour reprendre là où vous en étiez : <a href="${link}" style="color:#A95C30;">${link.replace(/^https:\/\//, '').replace(/\?.*$/, '')}</a>. Les 14 jours d’essai commencent à ce moment-là, et rien n’est débité avant la fin.`,
    ],
    bye: 'Belle journée,',
  },
  de: {
    subject: 'Ihr Cantia-Konto',
    hello: (name) => (name ? `Grüezi ${name}` : 'Grüezi'),
    body: (org, link) => [
      `Ich bin Bastien von Cantia. Ich habe gesehen, dass Sie vor ein paar Tagen ein Konto für ${org} erstellt haben, aber nicht ganz fertig geworden sind.`,
      'Hat Sie etwas aufgehalten? Eine Frage zu den Paketen, die Karte für die Testphase oder einfach die Zeit? Antworten Sie direkt auf diese E-Mail, ich antworte Ihnen persönlich.',
      `Um dort weiterzumachen, wo Sie aufgehört haben: <a href="${link}" style="color:#A95C30;">${link.replace(/^https:\/\//, '').replace(/\?.*$/, '')}</a>. Die 14 Tage Testphase beginnen dann, und vor deren Ende wird nichts abgebucht.`,
    ],
    bye: 'Freundliche Grüsse',
  },
  it: {
    subject: 'Il suo account Cantia',
    hello: (name) => (name ? `Buongiorno ${name},` : 'Buongiorno,'),
    body: (org, link) => [
      `Sono Bastien di Cantia. Ho visto che qualche giorno fa ha creato un account per ${org}, senza arrivare fino in fondo.`,
      'Qualcosa l’ha bloccata? Una domanda sui piani, la carta richiesta per la prova o semplicemente il tempo? Mi risponda direttamente a questa e-mail, le rispondo personalmente.',
      `Per riprendere da dove si era fermato: <a href="${link}" style="color:#A95C30;">${link.replace(/^https:\/\//, '').replace(/\?.*$/, '')}</a>. I 14 giorni di prova iniziano in quel momento e nulla viene addebitato prima della fine.`,
    ],
    bye: 'Cordiali saluti,',
  },
};

function buildHtml(orgName: string, firstName: string, locale: Locale): string {
  const c = COPY[locale];
  const link = `${APP_URL}/choose-plan?locale=${locale}`;
  const p = (html: string) => `<p style="margin:0 0 14px;">${html}</p>`;
  return `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.55;color:#222;max-width:560px;">
${p(escapeHtml(c.hello(firstName)))}
${c.body(escapeHtml(orgName), link).map(p).join('\n')}
${p(`${escapeHtml(c.bye)}<br/>Bastien`)}
</div>`;
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
      const locale: Locale = testLocale === 'de' || testLocale === 'it' ? testLocale : 'fr';
      const html = buildHtml('Votre Entreprise', 'Jean', locale);
      const { ok } = await sendResendEmail({
        apiKey,
        from: FROM,
        replyTo: 'info@cantia.ch',
        to: [testEmail],
        subject: `[TEST] ${COPY[locale].subject}`,
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
      .select('user_id, full_name, locale')
      .eq('organization_id', organization_id)
      .eq('role', 'owner')
      .maybeSingle();
    if (!owner) return json({ ok: true, skipped: true });

    const { data: ownerAuth } = await admin.auth.admin.getUserById(owner.user_id);
    const email = ownerAuth?.user?.email;
    if (!email) return json({ ok: true, skipped: true });

    // The language the owner uses in the app, else the company's.
    const locale = resolveLocale({ locale: owner.locale || org.locale });
    const firstName = String(owner.full_name ?? '').trim().split(/\s+/)[0] ?? '';
    const html = buildHtml(org.name, firstName, locale);

    await sendResendEmail({
      apiKey,
      from: FROM,
      replyTo: 'info@cantia.ch',
      to: [email],
      subject: COPY[locale].subject,
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
