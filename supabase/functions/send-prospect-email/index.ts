import { escapeHtml, sendResendEmail } from './resend-lib.ts';

// Cold-outreach sender for prospecting batches (artisans/entreprises du
// bâtiment). Deliberately NOT built on buildDocumentEmailHtml — that
// template's boxed details/CTA-button look reads as a transactional
// receipt, which is right for a devis/facture email but wrong here: the
// whole point (per explicit feedback after a batch that converted near
// zero) is to read as a short personal note from a real person, not an ad.
// Plain paragraphs, one inline text link, no logo/button/color block.
//
// Never called by a client — protected by a shared dispatch secret the
// same way bexio-cron-sync is, invoked directly (curl/pg_net) with a
// recipients array. Kept generic enough to reuse for the real batch send:
// each recipient gets `email` plus an optional `entreprise` name.
const DISPATCH_SECRET = '450db466265b9ffcc65591c120ebb3f10d54b14b3795f87b989560c0a6a6444e';

function buildEmail(entreprise?: string): { subject: string; html: string } {
  const font = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
  const introLine = entreprise
    ? `<p style="margin:0 0 16px;">J'ai vu que ${escapeHtml(entreprise)} travaille dans le bâtiment, alors je me permets de vous écrire directement.</p>`
    : `<p style="margin:0 0 16px;">Je me permets de vous écrire directement.</p>`;

  const html = `
<div style="font-family:${font}; font-size:15px; line-height:1.6; color:#1a1a1a; max-width:560px;">
  <p style="margin:0 0 16px;">Bonjour,</p>
  ${introLine}
  <p style="margin:0 0 16px;">Je m'appelle Bastien, je développe <strong>Cantia</strong> — devis, factures avec QR-facture, suivi de chantier, tout depuis le téléphone, pensé pour les entreprises du bâtiment en Suisse.</p>
  <p style="margin:0 0 16px;">Si vous utilisez déjà <strong>Bexio</strong> pour votre comptabilité : Cantia s'y connecte directement, vos clients, devis et factures se synchronisent automatiquement, sans double saisie.</p>
  <p style="margin:0 0 16px;">Je ne vous écris pas pour vous vendre quoi que ce soit tout de suite — juste pour savoir si ça pourrait vous être utile. Vous pouvez essayer gratuitement pendant 30 jours, résiliable à tout moment, sur <a href="https://cantia.ch" style="color:#1f3d3a; font-weight:600;">cantia.ch</a>, ou simplement me répondre si vous avez une question.</p>
  <p style="margin:0;">Bonne journée,<br>Bastien<br>Cantia</p>
</div>
  `.trim();

  return { subject: 'Une question rapide sur vos devis et factures', html };
}

Deno.serve(async (req: Request) => {
  try {
    const body = await req.json();
    if (body.dispatch_secret !== DISPATCH_SECRET) return json({ error: 'forbidden' }, 403);

    const recipients: { email: string; entreprise?: string }[] = Array.isArray(body.recipients) ? body.recipients : [];
    if (recipients.length === 0) return json({ error: 'recipients requis' }, 400);

    const apiKey = Deno.env.get('RESEND_API_KEY');
    if (!apiKey) return json({ error: 'RESEND_API_KEY manquant' }, 500);

    const results: { email: string; ok: boolean; error?: string }[] = [];
    for (const r of recipients) {
      if (!r.email) continue;
      const { subject, html } = buildEmail(r.entreprise);
      const { ok, error } = await sendResendEmail({
        apiKey,
        from: 'Bastien (Cantia) <bastien@cantia.ch>',
        to: [r.email],
        replyTo: 'bastien@cantia.ch',
        subject,
        html,
      });
      results.push({ email: r.email, ok, error });
    }

    return json({ sent: results.length, results });
  } catch (err) {
    return json({ error: String(err instanceof Error ? err.message : err) }, 500);
  }
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}
