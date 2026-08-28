import { escapeHtml, sendResendEmail } from './resend-lib.ts';

// Cold-outreach sender for prospecting batches (artisans/entreprises du
// bâtiment). v1 was almost bare-text (no styling at all) per "read like a
// personal note, not an ad" — feedback after seeing it was that it needs
// real design effort too: still personal/direct, but properly presented
// (a features box, a real CTA link, on-brand color used sparingly), not
// literally unstyled. buildDocumentEmailHtml wasn't reused — its
// boxed-details-plus-button shape is closer to a transactional receipt
// than an outreach email — but this borrows its restraint: on-brand
// palette from lib/theme.ts, one outlined (not solid-filled) CTA button.
//
// Never called by a client — protected by a shared dispatch secret the
// same way bexio-cron-sync is, invoked directly (curl/pg_net) with a
// recipients array. Kept generic enough to reuse for the real batch send:
// each recipient gets `email` plus an optional `entreprise` name. Secret is
// read from the environment, never hardcoded — see
// 20260828140000_dispatch_secret_vault.sql.
const DISPATCH_SECRET = Deno.env.get('DISPATCH_SECRET');
// Hard ceiling on a single call's blast radius: even with a valid secret,
// one request can't turn into an unbounded mass-send — split a bigger batch
// into several calls instead.
const MAX_RECIPIENTS_PER_CALL = 100;

function buildEmail(entreprise?: string): { subject: string; html: string } {
  const font = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
  const primary = '#BC5A31';
  const primaryDark = '#7C3B21';
  const text = '#231A12';
  const textMuted = '#6E6153';
  const border = '#E6D8C2';
  const surfaceAlt = '#F7F1E6';

  const introLine = entreprise
    ? `<p style="margin:0 0 18px;">J'ai vu que <strong>${escapeHtml(entreprise)}</strong> travaille dans le bâtiment, alors je me permets de vous écrire directement plutôt que de vous envoyer une pub.</p>`
    : `<p style="margin:0 0 18px;">Je me permets de vous écrire directement plutôt que de vous envoyer une pub.</p>`;

  const feature = (title: string, text2: string) =>
    `<p style="margin:0 0 10px; padding-left:16px; position:relative;"><span style="position:absolute; left:0; color:${primary}; font-weight:800;">·</span><strong style="color:${text};">${title}</strong> — ${text2}</p>`;

  const html = `
<div style="font-family:${font}; font-size:15px; line-height:1.6; color:${text}; max-width:560px;">
  <p style="margin:0 0 2px; font-size:21px; font-weight:800; color:${primaryDark}; letter-spacing:-0.3px;">Cantia</p>
  <p style="margin:0 0 24px; font-size:12px; color:${textMuted}; text-transform:uppercase; letter-spacing:0.7px;">Devis, factures &amp; chantiers pour le bâtiment suisse</p>

  <p style="margin:0 0 16px;">Bonjour,</p>
  ${introLine}
  <p style="margin:0 0 20px;">Je m'appelle Bastien, je développe Cantia.</p>

  <div style="margin:0 0 24px; padding:18px 20px; background:${surfaceAlt}; border:1px solid ${border}; border-radius:12px;">
    <p style="margin:0 0 12px; font-weight:700; color:${text};">Concrètement, avec Cantia :</p>
    ${feature('Devis &amp; factures', 'envoyés en quelques minutes, avec QR-facture suisse intégré')}
    ${feature('Suivi de chantier', 'photos, rapports, tout depuis le téléphone')}
    ${feature('Heures &amp; salaires', 'vos employés remplissent leurs heures, vous les extrayez pour facturer vos clients et verser les salaires en un clic')}
    ${feature('Compatible Bexio', 'vos clients, devis et factures se synchronisent automatiquement, sans double saisie')}
    <p style="margin:0; padding-left:16px; position:relative;"><span style="position:absolute; left:0; color:${primary}; font-weight:800;">·</span><strong style="color:${text};">Essai gratuit</strong> — 30 jours, résiliable à tout moment</p>
  </div>

  <p style="margin:0 0 24px;">Et si votre façon de travailler ne rentre pas dans une case : on peut développer un module <strong>100% sur mesure</strong>, calqué sur votre workflow et vos automatisations, pas sur celui d'un logiciel générique.</p>

  <p style="margin:0 0 24px; text-align:center;">
    <a href="https://cantia.ch" style="display:inline-block; padding:12px 30px; border:1.5px solid ${primary}; border-radius:999px; color:${primary}; font-weight:700; text-decoration:none;">Découvrir Cantia</a>
  </p>

  <p style="margin:0 0 20px;">Je ne vous écris pas pour vous vendre quoi que ce soit tout de suite — juste pour savoir si ça pourrait vous être utile. Répondez-moi directement si vous avez une question.</p>

  <p style="margin:0; padding-top:16px; border-top:1px solid ${border}; color:${text};">Bonne journée,<br><strong>Bastien</strong><br>Cantia — cantia.ch</p>
</div>
  `.trim();

  return { subject: 'Une question rapide sur vos devis et factures', html };
}

Deno.serve(async (req: Request) => {
  try {
    const body = await req.json();
    if (!DISPATCH_SECRET || body.dispatch_secret !== DISPATCH_SECRET) return json({ error: 'forbidden' }, 403);

    const recipients: { email: string; entreprise?: string }[] = Array.isArray(body.recipients) ? body.recipients : [];
    if (recipients.length === 0) return json({ error: 'recipients requis' }, 400);
    if (recipients.length > MAX_RECIPIENTS_PER_CALL) {
      return json({ error: `Maximum ${MAX_RECIPIENTS_PER_CALL} destinataires par appel — découpez le lot.` }, 400);
    }

    const apiKey = Deno.env.get('RESEND_API_KEY');
    if (!apiKey) return json({ error: 'RESEND_API_KEY manquant' }, 500);

    const results: { email: string; ok: boolean; error?: string }[] = [];
    for (const r of recipients) {
      if (!r.email) continue;
      const { subject, html } = buildEmail(r.entreprise);
      const { ok, error } = await sendResendEmail({
        apiKey,
        from: 'Cantia <info@cantia.ch>',
        to: [r.email],
        replyTo: 'info@cantia.ch',
        subject,
        html,
      });
      results.push({ email: r.email, ok, error });
      // Resend's default rate limit is 2 req/sec, shared across the whole
      // account (including any other transactional sends happening at the
      // same time) — 550ms cut it too close in practice: one 429 tends to
      // cascade into the rest of the batch also failing, since the window
      // doesn't clear within a request or two. 2000ms keeps real headroom.
      if (recipients.length > 1) await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    return json({ sent: results.length, results });
  } catch (err) {
    return json({ error: String(err instanceof Error ? err.message : err) }, 500);
  }
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}
