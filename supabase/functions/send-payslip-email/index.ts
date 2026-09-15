import { createClient } from 'npm:@supabase/supabase-js@2';

// Self-contained (see generate-payslip-pdf's own comment for why).
//
// Manager-triggered "Envoyer par e-mail" action in Fiches de salaire —
// replaces the earlier in-app-notification approach entirely: payroll
// (especially fixed-salary or ghost employees who never open the app at
// all) can't rely on an in-app bell to reach anyone. Sends a branded e-mail
// to the employee's personal_email (deliberately distinct from any app
// login) with a link to the secure public portal — no salary figures in
// the e-mail body itself, only in the OTP-gated portal.

const BUCKET = 'opus-storage';

type Locale = 'fr' | 'de' | 'it';

const MONTHS: Record<Locale, string[]> = {
  fr: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  de: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
  it: ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'],
};

const LABELS = {
  subject: { fr: 'Votre fiche de salaire de {month} est disponible', de: 'Ihre Lohnabrechnung für {month} ist verfügbar', it: 'La sua busta paga di {month} è disponibile' },
  greeting: { fr: 'Bonjour', de: 'Hallo', it: 'Buongiorno' },
  intro: {
    fr: 'Votre fiche de salaire de {month} est prête à consulter. Elle est disponible de façon sécurisée sur votre portail personnel — vous devrez confirmer votre adresse e-mail pour y accéder.',
    de: 'Ihre Lohnabrechnung für {month} steht bereit. Sie ist sicher auf Ihrem persönlichen Portal verfügbar — zum Zugriff müssen Sie Ihre E-Mail-Adresse bestätigen.',
    it: 'La sua busta paga di {month} è pronta. È disponibile in modo sicuro sul suo portale personale — dovrà confermare il suo indirizzo e-mail per accedervi.',
  },
  cta: { fr: 'Consulter ma fiche de salaire', de: 'Meine Lohnabrechnung ansehen', it: 'Consultare la mia busta paga' },
  poweredBy: { fr: 'Envoyé via Cantia', de: 'Gesendet über Cantia', it: 'Inviato tramite Cantia' },
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

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function base64FromBytes(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  return btoa(binary);
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { slip_id } = await req.json();
    if (!slip_id) return json({ error: 'slip_id requis' }, 400);

    const apiKey = Deno.env.get('RESEND_API_KEY');
    if (!apiKey) return json({ error: "L'envoi d'e-mail n'est pas encore configuré côté serveur." }, 500);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('Authorization') ?? '';
    const apikeyHeader = req.headers.get('apikey') ?? anonKey;

    const userClient = createClient(supabaseUrl, apikeyHeader, { global: { headers: { Authorization: authHeader } } });
    const admin = createClient(supabaseUrl, serviceKey);

    const { data: slip, error: slipError } = await userClient.from('payroll_slips').select('*').eq('id', slip_id).maybeSingle();
    if (slipError || !slip) return json({ error: 'Accès refusé' }, 403);
    if (!['validee', 'payee'].includes(slip.status)) return json({ error: "Cette fiche doit être validée avant l'envoi." }, 400);

    const { data: profile } = await admin
      .from('payroll_profiles')
      .select('personal_email, public_token, user_id, ghost_employee_id')
      .eq('organization_id', slip.organization_id)
      .eq('owner_key', slip.owner_key)
      .maybeSingle();
    if (!profile) return json({ error: 'Profil de paie introuvable.' }, 404);
    if (!profile.personal_email) {
      return json({ error: "Aucune adresse e-mail personnelle configurée pour cet employé. Ajoutez-la sur sa fiche employé." }, 400);
    }

    const [{ data: org }, { data: member }] = await Promise.all([
      admin.from('organizations').select('name, logo_url, locale, email_signature').eq('id', slip.organization_id).single(),
      profile.user_id
        ? admin.from('organization_members').select('full_name').eq('organization_id', slip.organization_id).eq('user_id', profile.user_id).maybeSingle()
        : admin.from('payroll_ghost_employees').select('full_name').eq('id', profile.ghost_employee_id).maybeSingle(),
    ]);

    const locale: Locale = org?.locale === 'de' || org?.locale === 'it' ? org.locale : 'fr';
    const orgName = org?.name ?? 'Cantia';
    const monthLabel = `${MONTHS[locale][slip.month - 1]} ${slip.year}`;
    const employeeName = member?.full_name ?? '';

    let logoImgTag = `<span style="font-size: 17px; font-weight: 700; color: #231A12;">${escapeHtml(orgName)}</span>`;
    if (org?.logo_url) {
      const { data: file } = await admin.storage.from(BUCKET).download(org.logo_url);
      if (file) {
        const bytes = new Uint8Array(await file.arrayBuffer());
        const contentType = (file.type as string) || 'image/png';
        const dataUri = `data:${contentType};base64,${base64FromBytes(bytes)}`;
        logoImgTag = `<img src="${dataUri}" alt="${escapeHtml(orgName)}" height="36" style="height: 36px; max-width: 180px; object-fit: contain; display: inline-block; vertical-align: middle;" />`;
      }
    }

    const portalUrl = `https://cantia.ch/salaire-employe/${profile.public_token}`;
    const font = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
    const html = `
      <div style="background: #F7F1E6; padding: 40px 20px; font-family: ${font};">
        <div style="max-width: 480px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; border: 1px solid #E6D8C2; overflow: hidden;">
          <div style="padding: 28px 32px 20px; border-bottom: 1px solid #E6D8C2;">
            ${logoImgTag}
          </div>
          <div style="padding: 32px;">
            <p style="margin: 0 0 16px; font-size: 15px; color: #231A12;">${t(locale, 'greeting')}${employeeName ? ` ${escapeHtml(employeeName)}` : ''},</p>
            <p style="margin: 0 0 28px; font-size: 15px; line-height: 1.6; color: #231A12;">${escapeHtml(t(locale, 'intro', { month: monthLabel }))}</p>
            <p style="margin: 0 0 8px; text-align: center;">
              <a href="${portalUrl}" style="display: inline-block; background: #BC5A31; color: #FFFFFF; font-weight: 700; font-size: 14px; padding: 14px 28px; border-radius: 999px; text-decoration: none;">${escapeHtml(t(locale, 'cta'))}</a>
            </p>
          </div>
          <div style="padding: 16px 32px 24px; border-top: 1px solid #F1E6D5;">
            <p style="margin: 0; font-size: 11px; color: #6E6151; text-align: center;">${escapeHtml(t(locale, 'poweredBy'))} · <a href="https://cantia.ch" style="color: #BC5A31; text-decoration: none; font-weight: 600;">cantia.ch</a></p>
          </div>
        </div>
        <p style="max-width: 480px; margin: 20px auto 0; text-align: center; font-size: 12px; color: #6E6151; line-height: 1.6;">
          ${escapeHtml(t(locale, 'footerTagline'))}
        </p>
      </div>
    `.trim();

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: `${orgName} <noreply@cantia.ch>`,
        to: [profile.personal_email],
        subject: t(locale, 'subject', { month: monthLabel }),
        html,
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error('Resend error', res.status, errText);
      return json({ error: `Échec de l'envoi de l'e-mail (${res.status})` }, 500);
    }

    return json({ ok: true });
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
