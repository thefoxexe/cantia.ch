import { createClient } from 'npm:@supabase/supabase-js@2';

// Self-contained on purpose (not importing ../_shared/*.ts) — the MCP
// deploy path for this function has repeatedly failed to resolve relative
// imports to _shared files ("Module not found ... _shared/resend.ts"),
// reproduced twice for this exact function despite it having deployed
// multi-file successfully in the past. Every payroll PDF function and
// several send-*-email functions hit the same wall; this follows the same
// precedent. Keep escapeHtml/buildBrandedEmailShell/sendResendEmail and the
// LABELS subset below in sync with _shared/resend.ts and
// _shared/pdf-i18n.ts by hand if those change.

type PdfLocale = 'fr' | 'de' | 'it';

function resolvePdfLocale(org: any): PdfLocale {
  return org?.locale === 'de' ? 'de' : org?.locale === 'it' ? 'it' : 'fr';
}

const LABELS = {
  devisLabel: { fr: 'Devis', de: 'Angebot', it: 'Preventivo' },
  factureLabel: { fr: 'Facture', de: 'Rechnung', it: 'Fattura' },
  verificationCodeLabel: { fr: 'Code de vérification', de: 'Bestätigungscode', it: 'Codice di verifica' },
  verificationCodeTitle: { fr: 'Consulter votre {doc}', de: '{doc} ansehen', it: 'Consultare il vostro {doc}' },
  verificationCodeIntro: {
    fr: 'Voici votre code pour consulter le {doc} {number} de {org} :',
    de: 'Hier ist Ihr Code, um {doc} {number} von {org} anzusehen:',
    it: 'Ecco il vostro codice per consultare il {doc} {number} di {org}:',
  },
  verificationCodePayslipTitle: { fr: 'Consulter votre fiche de salaire', de: 'Lohnabrechnung ansehen', it: 'Consultare la sua busta paga' },
  verificationCodePayslipIntro: {
    fr: 'Voici votre code pour consulter votre fiche de salaire de {org} :',
    de: 'Hier ist Ihr Code, um Ihre Lohnabrechnung von {org} anzusehen:',
    it: 'Ecco il suo codice per consultare la sua busta paga di {org}:',
  },
  verificationCodeHint: {
    fr: "Ce code expire dans {minutes} minutes et ne peut être utilisé qu'une seule fois. Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.",
    de: 'Dieser Code läuft in {minutes} Minuten ab und kann nur einmal verwendet werden. Falls Sie diese Anfrage nicht gestellt haben, ignorieren Sie diese E-Mail.',
    it: 'Questo codice scade tra {minutes} minuti e può essere utilizzato una sola volta. Se non siete voi all\'origine di questa richiesta, ignorate questa e-mail.',
  },
  verificationCodeSubject: { fr: '{code} — votre code de vérification', de: '{code} — Ihr Bestätigungscode', it: '{code} — il vostro codice di verifica' },
  emailFooterTagline: {
    fr: 'Cantia — logiciel suisse de gestion pour entreprises du bâtiment',
    de: 'Cantia — Schweizer Verwaltungssoftware für Bauunternehmen',
    it: 'Cantia — software svizzero di gestione per aziende edili',
  },
} as const;

type LabelKey = keyof typeof LABELS;

function pdfT(locale: PdfLocale, key: LabelKey, vars?: Record<string, string | number>): string {
  let text: string = LABELS[key][locale];
  if (vars) for (const [k, v] of Object.entries(vars)) text = text.replace(`{${k}}`, String(v));
  return text;
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function buildBrandedEmailShell(bodyHtml: string, locale: PdfLocale = 'fr'): string {
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
        ${escapeHtml(pdfT(locale, 'emailFooterTagline'))}<br/>
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

const CODE_TTL_MINUTES = 10;
const MAX_CODES_PER_HOUR = 5;

// Second factor for the client portal (devis-client/facture-client) and,
// as of the payroll-portal work, the employee payslip portal
// (salaire-employe) — an email-only gate meant anyone who knew or guessed
// an address could see private documents. This mails a one-time code to
// the address on file — always responding identically whether or not it
// matched, so this endpoint itself can't be used to test which emails are
// valid/enrolled.
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { token, kind, email } = await req.json();
    if (!token || !kind || !email) return json({ error: 'Paramètres manquants' }, 400);
    if (kind !== 'devis' && kind !== 'facture' && kind !== 'payslip') return json({ error: 'Type de document invalide' }, 400);

    const normalizedEmail = String(email).trim().toLowerCase();
    if (!normalizedEmail.includes('@')) return json({ error: 'Adresse email invalide' }, 400);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const admin = createClient(supabaseUrl, serviceKey);

    const GENERIC_OK = { ok: true };

    // Rate-limit by (token, email) regardless of match outcome — an
    // attacker fishing for valid emails on a given token gets throttled
    // the same as a legitimate recipient who mistyped their address.
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await admin
      .from('public_document_verifications')
      .select('id', { count: 'exact', head: true })
      .eq('document_token', token)
      .eq('email', normalizedEmail)
      .gte('created_at', oneHourAgo);
    if ((count ?? 0) >= MAX_CODES_PER_HOUR) {
      return json({ error: 'Trop de demandes. Réessayez plus tard.' }, 429);
    }

    let matchEmail: string | null = null;
    let organizationId: string | null = null;
    let docNumber: string | null = null;
    if (kind === 'payslip') {
      const { data: row } = await admin
        .from('payroll_profiles')
        .select('personal_email, organization_id')
        .eq('public_token', token)
        .maybeSingle();
      matchEmail = row?.personal_email ?? null;
      organizationId = row?.organization_id ?? null;
    } else {
      const table = kind === 'devis' ? 'devis' : 'factures';
      const { data: row } = await admin
        .from(table)
        .select('id, number, client_name, client_email, organization_id')
        .eq('public_token', token)
        .maybeSingle();
      matchEmail = row?.client_email ?? null;
      organizationId = row?.organization_id ?? null;
      docNumber = row?.number ?? null;
    }

    const matches = matchEmail && matchEmail.trim().toLowerCase() === normalizedEmail;

    // Always create the verification row and always return the same
    // response — only the email send itself is conditional on a real
    // match, so a probing request can't distinguish "wrong email" from
    // "check your inbox."
    const code = String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0');
    const codeHash = await sha256Hex(code);
    const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000).toISOString();

    await admin.from('public_document_verifications').insert({
      document_token: token,
      email: normalizedEmail,
      code_hash: codeHash,
      expires_at: expiresAt,
    });

    if (matches) {
      const apiKey = Deno.env.get('RESEND_API_KEY');
      if (apiKey) {
        const { data: org } = await admin.from('organizations').select('name, locale').eq('id', organizationId!).single();
        const orgName = org?.name ?? 'Cantia';
        const locale = resolvePdfLocale(org);

        let title: string;
        let intro: string;
        if (kind === 'payslip') {
          title = pdfT(locale, 'verificationCodePayslipTitle');
          intro = pdfT(locale, 'verificationCodePayslipIntro', { org: orgName });
        } else {
          // German nouns stay capitalized mid-sentence ("Ihr Angebot
          // ansehen"); French document nouns don't ("consulter votre
          // devis") — only the French label needs lowercasing here.
          const rawDocLabel = pdfT(locale, kind === 'devis' ? 'devisLabel' : 'factureLabel');
          const docLabel = locale === 'de' ? rawDocLabel : rawDocLabel.toLowerCase();
          title = pdfT(locale, 'verificationCodeTitle', { doc: docLabel });
          intro = pdfT(locale, 'verificationCodeIntro', { doc: docLabel, number: docNumber ?? '', org: orgName });
        }

        const html = buildBrandedEmailShell(
          `
          <p style="margin: 0 0 4px; font-size: 13px; font-weight: 700; color: #BC5A31; text-transform: uppercase; letter-spacing: 0.6px;">${escapeHtml(pdfT(locale, 'verificationCodeLabel'))}</p>
          <p style="margin: 0 0 24px; font-size: 22px; font-weight: 700; color: #231A12;">${escapeHtml(title)}</p>
          <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.6; color: #231A12;">
            ${escapeHtml(intro)}
          </p>
          <div style="margin: 0 0 24px; padding: 20px; background: #F5DECB; border-radius: 12px; text-align: center;">
            <span style="font-size: 34px; font-weight: 700; letter-spacing: 10px; color: #7C3B21;">${code}</span>
          </div>
          <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #6E6151;">
            ${escapeHtml(pdfT(locale, 'verificationCodeHint', { minutes: CODE_TTL_MINUTES }))}
          </p>
        `,
          locale,
        );

        await sendResendEmail({
          apiKey,
          from: `Cantia <noreply@cantia.ch>`,
          to: [matchEmail!],
          subject: pdfT(locale, 'verificationCodeSubject', { code }),
          html,
        });
      }
    }

    return json(GENERIC_OK);
  } catch (err) {
    console.error(err);
    return json({ error: String(err instanceof Error ? err.message : err) }, 500);
  }
});

async function sha256Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
