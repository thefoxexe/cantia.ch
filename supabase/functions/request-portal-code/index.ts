import { createClient } from 'npm:@supabase/supabase-js@2';
import { escapeHtml, sendResendEmail } from '../_shared/resend.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const CODE_TTL_MINUTES = 10;
const MAX_CODES_PER_HOUR = 5;

// Second factor for the client portal (devis-client/facture-client): an
// email-only gate meant anyone who knew or guessed a client's address could
// see their financial documents. This mails a one-time code to the address
// on file — always responding identically whether or not it matched, so
// this endpoint itself can't be used to test which emails are valid.
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { token, kind, email } = await req.json();
    if (!token || !kind || !email) return json({ error: 'Paramètres manquants' }, 400);
    if (kind !== 'devis' && kind !== 'facture') return json({ error: 'Type de document invalide' }, 400);

    const normalizedEmail = String(email).trim().toLowerCase();
    if (!normalizedEmail.includes('@')) return json({ error: 'Adresse email invalide' }, 400);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const admin = createClient(supabaseUrl, serviceKey);

    const GENERIC_OK = { ok: true };

    // Rate-limit by (token, email) regardless of match outcome — an
    // attacker fishing for valid emails on a given token gets throttled
    // the same as a legitimate client who mistyped their address.
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

    const table = kind === 'devis' ? 'devis' : 'factures';
    const { data: row } = await admin
      .from(table)
      .select('id, number, client_name, client_email, organization_id')
      .eq('public_token', token)
      .maybeSingle();

    const matches = row?.client_email && row.client_email.trim().toLowerCase() === normalizedEmail;

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
        const { data: org } = await admin.from('organizations').select('name').eq('id', row!.organization_id).single();
        const orgName = org?.name ?? 'Cantia';
        const docLabel = kind === 'devis' ? 'devis' : 'facture';
        const html = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #1a1f1c; max-width: 480px;">
            <p style="margin: 0 0 20px;">Voici votre code de vérification pour consulter le ${docLabel} ${escapeHtml(row!.number ?? '')} de ${escapeHtml(orgName)} :</p>
            <p style="margin: 0 0 20px; font-size: 32px; font-weight: 700; letter-spacing: 6px; text-align: center; padding: 16px; background: #f5f4f0; border-radius: 10px;">${code}</p>
            <p style="margin: 0; color: #555f58;">Ce code expire dans ${CODE_TTL_MINUTES} minutes et ne peut être utilisé qu'une seule fois. Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.</p>
          </div>
        `.trim();

        await sendResendEmail({
          apiKey,
          from: `Cantia <noreply@cantia.ch>`,
          to: [row!.client_email!],
          subject: `${code} — votre code de vérification`,
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
