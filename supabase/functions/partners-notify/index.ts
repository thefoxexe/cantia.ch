import { createClient } from 'npm:@supabase/supabase-js@2';

// partners.cantia.ch → the Cantia Partners admin (PARTNERS_ADMIN_EMAIL
// secret, never in code), with the partner's own session:
// - 'signup': a new partner just created a profile (sent once, flagged by
//   partner_profiles.admin_notified_at);
// - 'contact': the partner asks to be called to agree on their terms
//   (at most one every 10 minutes).
// Deployed with JWT verification; the partner is derived from the token.

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const TYPES: Record<string, string> = {
  CONSULTANT: 'Fiduciaire / consultant',
  WEB_AGENCY: 'Agence web',
  SOFTWARE_INTEGRATOR: 'Intégrateur logiciel',
  CANTIA_CUSTOMER: 'Client Cantia',
  BUSINESS: 'Entreprise / fournisseur',
  CONTENT_CREATOR: 'Créateur de contenu',
  OTHER: 'Autre',
};

function esc(s: unknown): string {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  const to = Deno.env.get('PARTNERS_ADMIN_EMAIL');
  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!to || !apiKey) return json({ sent: false, reason: 'not configured' }, 500);

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  const { data: userData } = await admin.auth.getUser(token);
  const user = userData?.user;
  if (!user) return json({ sent: false, reason: 'unauthorized' }, 401);

  let body: { kind?: string; message?: string; phone?: string; availability?: string } = {};
  try {
    body = await req.json();
  } catch {
    // empty body
  }
  const kind = body.kind === 'contact' ? 'contact' : 'signup';

  const { data: p } = await admin
    .from('partner_profiles')
    .select('id, first_name, last_name, company_name, partner_type, phone, city, postal_code, locale, created_at, admin_notified_at, contact_requested_at')
    .eq('user_id', user.id)
    .maybeSingle();
  if (!p) return json({ sent: false, reason: 'no partner profile' }, 404);

  if (kind === 'signup' && p.admin_notified_at) return json({ sent: false, reason: 'already notified' });
  if (kind === 'contact' && p.contact_requested_at && Date.now() - new Date(p.contact_requested_at).getTime() < 10 * 60_000) {
    return json({ sent: false, reason: 'already requested' });
  }

  const name = `${p.first_name} ${p.last_name}`.trim();
  const phone = (body.phone ?? '').trim().slice(0, 40) || p.phone || '';
  const rows: [string, string][] = [
    ['Nom', name],
    ['Entreprise', p.company_name ?? '—'],
    ['Profil', TYPES[p.partner_type] ?? p.partner_type],
    ['E-mail', user.email ?? '—'],
    ['Téléphone', phone || '—'],
    ['Localité', [p.postal_code, p.city].filter(Boolean).join(' ') || '—'],
    ['Langue', String(p.locale ?? 'fr').toUpperCase()],
  ];
  if (kind === 'contact' && body.availability) rows.push(['Disponibilités', String(body.availability).slice(0, 200)]);

  const title = kind === 'signup' ? 'Nouveau partenaire inscrit' : 'Un partenaire souhaite définir ses conditions';
  const intro =
    kind === 'signup'
      ? 'Son espace est actif avec son lien, mais sa commission reste masquée tant que vous ne lui avez pas attribué un taux.'
      : 'Il demande à être contacté pour convenir de sa commission.';
  const message = kind === 'contact' && body.message ? `<p style="margin:16px 0 0;padding:12px 14px;background:#F7F1E6;border-radius:8px;white-space:pre-wrap">${esc(String(body.message).slice(0, 2000))}</p>` : '';

  const html = `
    <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#231A12;max-width:560px">
      <p style="margin:0 0 4px;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#A95C30;font-weight:700">Cantia Partners</p>
      <p style="margin:0 0 12px;font-size:20px;font-weight:800">${esc(title)}</p>
      <p style="margin:0 0 16px;color:#5A4A3B">${esc(intro)}</p>
      <table style="border-collapse:collapse;width:100%">
        ${rows.map(([k, v]) => `<tr><td style="padding:6px 0;color:#7A6755;width:130px;vertical-align:top">${esc(k)}</td><td style="padding:6px 0;font-weight:600">${esc(v)}</td></tr>`).join('')}
      </table>
      ${message}
      <p style="margin:24px 0 0"><a href="https://app.cantia.ch/partners" style="display:inline-block;background:#A95C30;color:#fff;text-decoration:none;font-weight:700;padding:11px 18px;border-radius:8px">Attribuer ses conditions</a></p>
    </div>`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Cantia Partners <noreply@cantia.ch>',
      to: [to],
      reply_to: user.email ?? undefined,
      subject: kind === 'signup' ? `Nouveau partenaire : ${name}${p.company_name ? ` (${p.company_name})` : ''}` : `À rappeler : ${name}${p.company_name ? ` (${p.company_name})` : ''} veut définir ses conditions`,
      html,
    }),
  });
  if (!res.ok) return json({ sent: false, status: res.status }, 502);

  await admin
    .from('partner_profiles')
    .update(kind === 'signup' ? { admin_notified_at: new Date().toISOString() } : { contact_requested_at: new Date().toISOString() })
    .eq('id', p.id);
  return json({ sent: true });
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
}
