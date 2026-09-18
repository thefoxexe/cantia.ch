import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const APP_URL = 'https://app.cantia.ch';

// Self-contained rather than importing from ../_shared — the deploy tool's
// relative-import resolution for ../_shared/... paths doesn't work (same
// issue hit by generate-payslip-pdf and every other function deployed this
// way — see send-ownership-transfer-email for the identical note).

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
  subject: { fr: '{from} vous invite à rejoindre {org} sur Cantia', de: '{from} lädt Sie ein, {org} auf Cantia beizutreten', it: '{from} la invita a unirsi a {org} su Cantia' },
  title: { fr: 'Vous êtes invité(e) sur Cantia', de: 'Sie sind zu Cantia eingeladen', it: 'È stato invitato su Cantia' },
  intro: {
    fr: '{from} vous invite à rejoindre {org} sur Cantia, la plateforme de gestion de l’équipe pour le devis, les factures et le suivi des chantiers.',
    de: '{from} lädt Sie ein, {org} auf Cantia beizutreten — der Verwaltungsplattform des Teams für Offerten, Rechnungen und die Baustellenverfolgung.',
    it: '{from} la invita a unirsi a {org} su Cantia, la piattaforma di gestione del team per preventivi, fatture e monitoraggio dei cantieri.',
  },
  cta: { fr: 'Rejoindre {org}', de: '{org} beitreten', it: 'Si unisca a {org}' },
  hint: {
    fr: 'Ce lien expire le {date}. Si vous ne vous attendiez pas à cette invitation, vous pouvez ignorer cet e-mail sans rien changer.',
    de: 'Dieser Link läuft am {date} ab. Falls Sie diese Einladung nicht erwartet haben, können Sie diese E-Mail ignorieren, ohne dass sich etwas ändert.',
    it: 'Questo link scade il {date}. Se non si aspettava questo invito, può ignorare questa e-mail senza che nulla cambi.',
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

function formatDate(iso: string, locale: Locale): string {
  try {
    return new Date(iso).toLocaleDateString(locale === 'de' ? 'de-CH' : locale === 'it' ? 'it-CH' : 'fr-CH', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

// A friendly "join the team" badge — two overlapping figures, same warm
// terracotta family as every other transactional e-mail in the product
// (see send-payment-failed-email / dispatch-notification for the same
// icon-badge pattern).
const TEAM_BADGE_SVG = `
  <div style="width: 56px; height: 56px; border-radius: 16px; background: #F5DECB; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="9" cy="8.5" r="3" stroke="#BC5A31" stroke-width="1.8"/>
      <path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" stroke="#BC5A31" stroke-width="1.8" stroke-linecap="round"/>
      <circle cx="17" cy="9" r="2.4" stroke="#BC5A31" stroke-width="1.6"/>
      <path d="M15.2 19c0.3-2.2 1.9-4 3.9-4.4" stroke="#BC5A31" stroke-width="1.6" stroke-linecap="round"/>
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

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { invite_id } = await req.json();
    if (!invite_id) return json({ error: 'invite_id requis' }, 400);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('Authorization') ?? '';

    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const {
      data: { user },
    } = await userClient.auth.getUser();
    if (!user) return json({ error: 'Non authentifié' }, 401);

    const admin = createClient(supabaseUrl, serviceKey);

    const { data: invite } = await admin.from('organization_invites').select('*').eq('id', invite_id).maybeSingle();
    if (!invite) return json({ error: 'Invitation introuvable.' }, 404);
    // invited_email lives on the row, set only at creation time (see
    // lib/api/invites.ts's createInvite) — never trusted from the request
    // body, so this function can only ever mail the address the admin who
    // created the invite actually typed in.
    if (!invite.invited_email) return json({ error: "Cette invitation n'a pas d'adresse e-mail associée." }, 400);
    if (invite.revoked || invite.used_at) return json({ error: 'Cette invitation n’est plus valide.' }, 409);
    if (new Date(invite.expires_at).getTime() < Date.now()) return json({ error: 'Cette invitation a expiré.' }, 409);

    // Only an admin/owner of the invite's own organization may trigger the
    // send — same check stripe-portal uses for "manage billing".
    const { data: membership } = await userClient
      .from('organization_members')
      .select('role')
      .eq('organization_id', invite.organization_id)
      .eq('user_id', user.id)
      .maybeSingle();
    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return json({ error: "Seul un propriétaire ou administrateur peut envoyer une invitation." }, 403);
    }

    const { data: org } = await admin.from('organizations').select('id, name, locale').eq('id', invite.organization_id).maybeSingle();
    if (!org) return json({ error: 'Entreprise introuvable.' }, 404);
    const locale = resolveLocale(org);

    const { data: inviterMember } = invite.created_by
      ? await admin.from('organization_members').select('full_name').eq('organization_id', invite.organization_id).eq('user_id', invite.created_by).maybeSingle()
      : { data: null };
    const inviterName = inviterMember?.full_name || org.name;

    const apiKey = Deno.env.get('RESEND_API_KEY');
    if (!apiKey) return json({ error: 'Service mail non configuré.' }, 500);

    const joinUrl = `${APP_URL}/join/${invite.token}?locale=${locale}`;
    const html = buildBrandedEmailShell(`
      ${TEAM_BADGE_SVG}
      <p style="margin: 0 0 4px; font-size: 13px; font-weight: 700; color: #BC5A31; text-transform: uppercase; letter-spacing: 0.6px;">${escapeHtml(org.name)}</p>
      <p style="margin: 0 0 20px; font-size: 22px; font-weight: 700; color: #231A12;">${escapeHtml(t(locale, 'title'))}</p>
      <p style="margin: 0 0 28px; font-size: 15px; line-height: 1.6; color: #231A12;">${escapeHtml(t(locale, 'intro', { from: inviterName, org: org.name }))}</p>
      <p style="margin: 0 0 24px; text-align: center;">
        <a href="${joinUrl}" style="display: inline-block; background: #BC5A31; color: #fff; padding: 14px 28px; border-radius: 10px; font-weight: 700; text-decoration: none; font-size: 15px;">${escapeHtml(t(locale, 'cta', { org: org.name }))}</a>
      </p>
      <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #6E6151;">${escapeHtml(t(locale, 'hint', { date: formatDate(invite.expires_at, locale) }))}</p>
    `, locale);

    const { ok, error } = await sendResendEmail({
      apiKey,
      from: `${org.name} <noreply@cantia.ch>`,
      to: [invite.invited_email],
      subject: t(locale, 'subject', { from: inviterName, org: org.name }),
      html,
    });
    if (!ok) return json({ error: error ?? "Échec de l'envoi." }, 502);

    return json({ ok: true });
  } catch (err) {
    console.error(err);
    return json({ error: String(err instanceof Error ? err.message : err) }, 500);
  }
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}
