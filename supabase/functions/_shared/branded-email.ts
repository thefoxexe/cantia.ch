import { PdfLocale, pdfT } from './pdf-i18n.ts';
import { escapeHtml } from './resend.ts';

// Kept apart from resend.ts because of the embedded logo (a long base64
// string): the document emails (devis, factures, relances) don't need it.

// Shared branded shell (logo header, cream background, footer) used by
// emails that are less "business document" and more "product moment" —
// currently the client-portal verification code. The document emails
// (devis/facture/relance) stay on buildDocumentEmailHtml's plainer layout
// on purpose: those carry an org's own message and PDF, this one is pure
// Cantia product chrome. Colors match lib/theme.ts. The logo is embedded
// as a base64 data URI (assets/brand/logo.png, the full logo), not linked from a
// URL — an external fetch is one more thing that can fail (host hiccup,
// Gmail's image proxy caching a miss) and shows as a broken-image glyph
// when it does; embedding the bytes means there's nothing to fetch.
export function buildBrandedEmailShell(bodyHtml: string, locale: PdfLocale = 'fr'): string {
  const font = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
  return `
    <div style="background: #F7F1E6; padding: 40px 20px; font-family: ${font};">
      <div style="max-width: 480px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; border: 1px solid #E6D8C2; overflow: hidden;">
        <div style="padding: 28px 32px 20px; border-bottom: 1px solid #E6D8C2;">
          <img src="data:image/png;base64,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" width="170" height="32" alt="Cantia" style="display: block; border: 0; height: 32px; width: 170px;" />
        </div>
        <div style="padding: 32px;">
          ${bodyHtml}
        </div>
      </div>
      <p style="max-width: 480px; margin: 20px auto 0; text-align: center; font-size: 12px; color: #6E6151; line-height: 1.6;">
        ${escapeHtml(pdfT(locale, 'emailFooterTagline'))}<br/>
        <a href="https://cantia.ch" style="color: #A95C30; text-decoration: none; font-weight: 600;">cantia.ch</a>
      </p>
    </div>
  `.trim();
}
