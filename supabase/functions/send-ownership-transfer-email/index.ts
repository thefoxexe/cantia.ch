import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const APP_URL = 'https://app.cantia.ch';

// Self-contained rather than importing from ../_shared — the deploy tool's
// relative-import resolution for ../_shared/... paths doesn't work (same
// issue hit by generate-payslip-pdf), so every function deployed this way
// inlines what it needs instead (see generate-lohnausweis-pdf /
// generate-salary-certificate-pdf for the same pattern).

type PdfLocale = 'fr' | 'de' | 'it';

function resolvePdfLocale(org: any): PdfLocale {
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
  confirmSubject: { fr: '{org} — confirmez le transfert de propriété', de: '{org} — Eigentümerübertragung bestätigen', it: '{org} — confermi il trasferimento di proprietà' },
  confirmTitle: { fr: 'Devenez propriétaire de {org}', de: 'Werden Sie Inhaber von {org}', it: 'Diventi titolare di {org}' },
  confirmIntro: {
    fr: '{from} vous a désigné comme nouveau propriétaire de {org} sur Cantia. Confirmez ci-dessous pour accepter ce rôle — vous aurez accès à la facturation, aux membres et à tous les réglages de l’entreprise.',
    de: '{from} hat Sie als neuen Inhaber von {org} auf Cantia vorgeschlagen. Bestätigen Sie unten, um diese Rolle zu übernehmen — Sie erhalten Zugriff auf Abrechnung, Mitglieder und alle Unternehmenseinstellungen.',
    it: '{from} l’ha designata come nuovo titolare di {org} su Cantia. Confermi qui sotto per accettare questo ruolo — avrà accesso alla fatturazione, ai membri e a tutte le impostazioni dell’azienda.',
  },
  confirmCta: { fr: 'Confirmer et devenir propriétaire', de: 'Bestätigen und Inhaber werden', it: 'Confermi e diventi titolare' },
  confirmHint: {
    fr: 'Ce lien expire dans 7 jours. Si vous ne vous attendiez pas à ce message, vous pouvez ignorer cet e-mail sans rien changer.',
    de: 'Dieser Link läuft in 7 Tagen ab. Falls Sie diese Nachricht nicht erwartet haben, können Sie diese E-Mail ignorieren, ohne dass sich etwas ändert.',
    it: 'Questo link scade tra 7 giorni. Se non si aspettava questo messaggio, può ignorare questa e-mail senza che nulla cambi.',
  },
  announceSubject: { fr: '{org} — la propriété a été transférée', de: '{org} — Eigentümerschaft wurde übertragen', it: '{org} — la proprietà è stata trasferita' },
  announceTitle: { fr: 'Transfert de propriété confirmé', de: 'Eigentümerübertragung bestätigt', it: 'Trasferimento di proprietà confermato' },
  announceBody: {
    fr: '{to} est désormais propriétaire de {org}. {from} reste administrateur de l’entreprise et garde accès à tous les réglages, hors zone dangereuse.',
    de: '{to} ist ab sofort Inhaber von {org}. {from} bleibt Administrator des Unternehmens und behält Zugriff auf alle Einstellungen, ausser dem Gefahrenbereich.',
    it: '{to} è ora titolare di {org}. {from} resta amministratore dell’azienda e mantiene l’accesso a tutte le impostazioni, esclusa la zona pericolosa.',
  },
  footerTagline: {
    fr: 'Cantia — logiciel suisse de gestion pour entreprises du bâtiment',
    de: 'Cantia — Schweizer Verwaltungssoftware für Bauunternehmen',
    it: 'Cantia — software svizzero di gestione per aziende edili',
  },
} as const;

function t(locale: PdfLocale, key: keyof typeof LABELS, vars?: Record<string, string>): string {
  let text: string = LABELS[key][locale];
  if (vars) for (const [k, v] of Object.entries(vars)) text = text.replace(`{${k}}`, v);
  return text;
}

function buildBrandedEmailShell(bodyHtml: string, locale: PdfLocale): string {
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

async function sendResendEmail(params: { apiKey: string; from: string; to: string[]; subject: string; html: string }): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${params.apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: params.from, to: params.to, subject: params.subject, html: params.html }),
  });
  if (!res.ok) {
    console.error('Resend error', res.status, await res.text());
    return { ok: false, error: `Échec de l'envoi de l'e-mail (${res.status})` };
  }
  return { ok: true };
}

// Called by the client right after initiate_ownership_transfer (kind:
// 'confirm') and right after confirm_ownership_transfer (kind: 'announce')
// — the RPCs themselves are DB-only, so sending mail is a separate step
// the client triggers once the DB write it depends on has actually
// succeeded. Looked up by token with the service role rather than trusting
// anything the client sends about who's involved.
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { token, kind } = await req.json();
    if (!token || (kind !== 'confirm' && kind !== 'announce')) return json({ error: 'Paramètres invalides' }, 400);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const admin = createClient(supabaseUrl, serviceKey);

    const { data: transfer } = await admin.from('organization_ownership_transfers').select('*').eq('token', token).maybeSingle();
    if (!transfer) return json({ error: 'Transfert introuvable.' }, 404);
    if (kind === 'confirm' && transfer.status !== 'pending') return json({ error: "Ce transfert n'est plus en attente." }, 409);
    if (kind === 'announce' && transfer.status !== 'confirmed') return json({ error: "Ce transfert n'a pas été confirmé." }, 409);

    const { data: org } = await admin.from('organizations').select('id, name, locale').eq('id', transfer.organization_id).single();
    if (!org) return json({ error: 'Entreprise introuvable.' }, 404);
    const locale = resolvePdfLocale(org);

    const { data: members } = await admin
      .from('organization_members')
      .select('user_id, full_name')
      .eq('organization_id', transfer.organization_id)
      .in('user_id', [transfer.from_user_id, transfer.to_user_id]);

    const [{ data: fromAuth }, { data: toAuth }] = await Promise.all([
      admin.auth.admin.getUserById(transfer.from_user_id),
      admin.auth.admin.getUserById(transfer.to_user_id),
    ]);
    const fromEmail = fromAuth?.user?.email ?? null;
    const toEmail = toAuth?.user?.email ?? null;
    const fromName = members?.find((m: any) => m.user_id === transfer.from_user_id)?.full_name || fromEmail || 'Un administrateur';
    const toName = members?.find((m: any) => m.user_id === transfer.to_user_id)?.full_name || toEmail || '';

    const apiKey = Deno.env.get('RESEND_API_KEY');
    if (!apiKey) return json({ error: 'Service mail non configuré.' }, 500);

    if (kind === 'confirm') {
      if (!toEmail) return json({ error: 'Adresse e-mail du destinataire introuvable.' }, 500);
      const confirmUrl = `${APP_URL}/transfer-ownership/${token}`;
      const html = buildBrandedEmailShell(
        `
        <p style="margin: 0 0 4px; font-size: 13px; font-weight: 700; color: #BC5A31; text-transform: uppercase; letter-spacing: 0.6px;">Cantia</p>
        <p style="margin: 0 0 20px; font-size: 22px; font-weight: 700; color: #231A12;">${escapeHtml(t(locale, 'confirmTitle', { org: org.name }))}</p>
        <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #231A12;">${escapeHtml(t(locale, 'confirmIntro', { from: fromName, org: org.name }))}</p>
        <p style="margin: 0 0 24px; text-align: center;">
          <a href="${confirmUrl}" style="display: inline-block; background: #BC5A31; color: #fff; padding: 14px 28px; border-radius: 10px; font-weight: 700; text-decoration: none; font-size: 15px;">${escapeHtml(t(locale, 'confirmCta'))}</a>
        </p>
        <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #6E6151;">${escapeHtml(t(locale, 'confirmHint'))}</p>
      `,
        locale,
      );

      await sendResendEmail({ apiKey, from: 'Cantia <noreply@cantia.ch>', to: [toEmail], subject: t(locale, 'confirmSubject', { org: org.name }), html });
    } else {
      const html = buildBrandedEmailShell(
        `
        <p style="margin: 0 0 4px; font-size: 13px; font-weight: 700; color: #BC5A31; text-transform: uppercase; letter-spacing: 0.6px;">Cantia</p>
        <p style="margin: 0 0 20px; font-size: 22px; font-weight: 700; color: #231A12;">${escapeHtml(t(locale, 'announceTitle'))}</p>
        <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #231A12;">${escapeHtml(t(locale, 'announceBody', { to: toName, from: fromName, org: org.name }))}</p>
      `,
        locale,
      );
      const subject = t(locale, 'announceSubject', { org: org.name });

      await Promise.all(
        [fromEmail, toEmail]
          .filter((e): e is string => !!e)
          .map((to) => sendResendEmail({ apiKey, from: 'Cantia <noreply@cantia.ch>', to: [to], subject, html })),
      );
    }

    return json({ ok: true });
  } catch (err) {
    console.error(err);
    return json({ error: String(err instanceof Error ? err.message : err) }, 500);
  }
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}
