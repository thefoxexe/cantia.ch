import { createClient } from 'npm:@supabase/supabase-js@2';

const BUCKET = 'opus-storage';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function formatChf(n: number): string {
  return n.toLocaleString('fr-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDateFr(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('fr-CH');
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { facture_id } = await req.json();
    if (!facture_id) return json({ error: 'facture_id requis' }, 400);

    const apiKey = Deno.env.get('RESEND_API_KEY');
    if (!apiKey) {
      return json({ error: "L'envoi d'e-mail n'est pas encore configuré côté serveur." }, 500);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('Authorization') ?? '';

    // Bound to the caller's JWT: RLS enforces the caller belongs to the org
    // that owns this facture before anything else here runs.
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const admin = createClient(supabaseUrl, serviceKey);

    const { data: facture, error: factureError } = await userClient
      .from('factures')
      .select('*')
      .eq('id', facture_id)
      .single();

    if (factureError || !facture) return json({ error: 'Facture introuvable ou accès refusé' }, 404);
    if (!facture.client_email) return json({ error: "Cette facture n'a pas d'adresse e-mail client." }, 400);
    if (facture.status === 'paid') return json({ error: 'Cette facture est déjà payée.' }, 400);
    if (facture.status === 'cancelled') return json({ error: 'Cette facture est annulée.' }, 400);

    const [{ data: org }, { data: items }] = await Promise.all([
      admin.from('organizations').select('name, email').eq('id', facture.organization_id).single(),
      admin.from('facture_items').select('quantity, unit_price').eq('facture_id', facture_id),
    ]);

    const subtotal = (items ?? []).reduce((sum: number, it: any) => sum + Number(it.quantity) * Number(it.unit_price), 0);
    const total = subtotal * (1 + Number(facture.vat_rate) / 100);
    const overdue = facture.due_date < new Date().toISOString().slice(0, 10);
    const orgName = org?.name ?? 'Notre entreprise';

    let pdfLine = '';
    if (facture.pdf_path) {
      const { data: signed } = await admin.storage.from(BUCKET).createSignedUrl(facture.pdf_path, 60 * 60 * 24 * 7);
      if (signed?.signedUrl) {
        pdfLine = `<p><a href="${signed.signedUrl}">Télécharger la facture ${facture.number ?? ''}</a> (lien valable 7 jours).</p>`;
      }
    }

    const subject = overdue
      ? `Rappel — facture ${facture.number ?? ''} en retard de paiement`
      : `Rappel — facture ${facture.number ?? ''} à régler prochainement`;

    const html = `
      <p>Bonjour${facture.client_name ? ` ${facture.client_name}` : ''},</p>
      <p>
        ${overdue ? 'Sauf erreur de notre part, la facture suivante est toujours impayée' : "Nous vous rappelons que la facture suivante arrive bientôt à échéance"} :
      </p>
      <ul>
        <li>Facture n° ${facture.number ?? '—'}</li>
        <li>Montant : CHF ${formatChf(total)}</li>
        <li>Échéance : ${formatDateFr(facture.due_date)}</li>
      </ul>
      ${pdfLine}
      <p>Merci de bien vouloir procéder au règlement, ou de nous contacter si le paiement a déjà été effectué.</p>
      <p>Cordialement,<br/>${orgName}</p>
    `.trim();

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: `${orgName} <noreply@cantia.ch>`,
        to: [facture.client_email],
        reply_to: org?.email || undefined,
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Resend error', res.status, errText);
      return json({ error: `Échec de l'envoi de l'e-mail (${res.status})` }, 502);
    }

    await admin.from('factures').update({ last_reminded_at: new Date().toISOString() }).eq('id', facture_id);

    return json({ sent: true });
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
