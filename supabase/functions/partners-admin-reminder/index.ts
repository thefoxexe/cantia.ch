import { createClient } from 'npm:@supabase/supabase-js@2';

// Monthly (the 4th, pg_cron): tells the Cantia Partners admin what is due
// for tomorrow's payouts. The address comes from the PARTNERS_ADMIN_EMAIL
// secret, never from code.
Deno.serve(async (req: Request) => {
  const secret = Deno.env.get('DISPATCH_SECRET');
  if (!secret || req.headers.get('x-dispatch-secret') !== secret) return new Response('forbidden', { status: 403 });

  const to = Deno.env.get('PARTNERS_ADMIN_EMAIL');
  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!to || !apiKey) return json({ sent: false, reason: 'PARTNERS_ADMIN_EMAIL or RESEND_API_KEY missing' }, 500);

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data, error } = await admin.rpc('partners_payout_digest');
  if (error || !data) return json({ sent: false, reason: error?.message ?? 'no digest' }, 500);
  const d = data as { eligible_partners: number; eligible_chf: number; missing_iban: number; pending_chf: number; to_pay_count: number; payout_day: number };

  const chf = (n: number) => `CHF ${Number(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, '’')}`;
  const lines = [
    `${d.eligible_partners} partenaire(s) à payer, pour ${chf(d.eligible_chf)}.`,
    d.missing_iban ? `${d.missing_iban} partenaire(s) sans IBAN : leur versement attendra.` : null,
    d.to_pay_count ? `${d.to_pay_count} versement(s) déjà préparé(s) restent à virer.` : null,
    `En validation (disponible plus tard) : ${chf(d.pending_chf)}.`,
  ].filter(Boolean) as string[];

  const html = `
    <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#231A12;max-width:560px">
      <p style="margin:0 0 12px;font-weight:700">Versements Cantia Partners du ${d.payout_day} du mois</p>
      ${lines.map((l) => `<p style="margin:0 0 6px">${l}</p>`).join('')}
      <p style="margin:20px 0 0"><a href="https://partners.cantia.ch/admin" style="color:#BC5A31;font-weight:700">Ouvrir l’administration partenaires</a></p>
    </div>`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Cantia Partners <noreply@cantia.ch>',
      to: [to],
      subject: d.eligible_partners ? `Partenaires : ${d.eligible_partners} versement(s) à préparer demain` : 'Partenaires : aucun versement ce mois-ci',
      html,
    }),
  });
  if (!res.ok) return json({ sent: false, status: res.status }, 502);
  return json({ sent: true, digest: d });
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}
