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
  const primary = '#A95C30';
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
  <p style="margin:0 0 6px;"><img src="data:image/png;base64,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" width="170" height="32" alt="Cantia" style="display: block; border: 0; height: 32px; width: 170px;" /></p>
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
