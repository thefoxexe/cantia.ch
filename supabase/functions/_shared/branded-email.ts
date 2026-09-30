import { PdfLocale, pdfT } from './pdf-i18n.ts';
import { escapeHtml } from './resend.ts';

// Kept apart from resend.ts because of the embedded logo (a long base64
// string): the document emails (devis, factures, relances) don't need it.

// Shared branded shell (logo header, cream background, footer) used by
// emails that are less "business document" and more "product moment" —
// currently the client-portal verification code. The document emails
// (devis/facture/relance) stay on buildDocumentEmailHtml's plainer layout
// on purpose: those carry an org's own message and PDF, this one is pure
// Cantia product chrome. Colors match lib/theme.ts. The logo is a hosted
// PNG in the public Supabase 'brand' bucket (2x, displayed at 170x32):
// Gmail does not display images embedded as data: URIs, so every Cantia
// e-mail links this one file. To change it, upload a new versioned file
// (logo-v3.png, ...) rather than overwriting, so Gmail's image cache never
// serves a stale or failed copy.
export function buildBrandedEmailShell(bodyHtml: string, locale: PdfLocale = 'fr'): string {
  const font = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
  return `
    <div style="background: #F7F1E6; padding: 40px 20px; font-family: ${font};">
      <div style="max-width: 480px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; border: 1px solid #E6D8C2; overflow: hidden;">
        <div style="padding: 28px 32px 20px; border-bottom: 1px solid #E6D8C2;">
          <img src="https://krijilwxhdlzflvnvrtl.supabase.co/storage/v1/object/public/brand/email/logo-v2.png" width="170" height="32" alt="Cantia" style="display: block; border: 0; height: 32px; width: 170px;" />
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
