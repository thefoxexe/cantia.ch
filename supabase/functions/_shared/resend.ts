// Shared by every send-*-email function (send-devis-email, send-facture-email,
// send-facture-reminder) — one place for the Resend call + attachment
// base64 encoding instead of duplicating it three times.

// Deno's built-in ICU data for 'fr-CH' isn't reliable for grouping
// separators (toLocaleString silently drops the apostrophe in some edge
// runtime builds) — inserted manually instead of trusting Intl here.
export function formatChfPlain(n: number): string {
  const fixed = Math.abs(n).toFixed(2);
  const [intPart, decPart] = fixed.split('.');
  const withSep = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, "'");
  return `${n < 0 ? '-' : ''}${withSep}.${decPart}`;
}

// Org message/signature text is plain, user-authored input that ends up
// inside an HTML email body — escaped rather than trusted as HTML, with
// newlines converted to <br> afterwards so multi-line text still renders
// as intended without opening a stored-HTML injection surface.
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function textToHtmlLines(text: string): string {
  return escapeHtml(text).split('\n').join('<br/>');
}

// Shared visual template for every devis/facture e-mail — one place for the
// spacing/typography so "send-devis-email" and "send-facture-email" don't
// each hand-roll slightly different HTML. Structure is fixed and only the
// middle body paragraph is org-editable: greeting -> body -> optional
// chantier line -> details card -> locked "consult online" link -> signature.
export function buildDocumentEmailHtml(params: {
  clientName: string | null;
  bodyMessage: string;
  projectName?: string | null;
  detailsTitle: string;
  detailsLines: string[];
  // Secondary download link (e.g. a time-limited signed URL for a reminder
  // email, which doesn't re-attach the PDF) — rendered between the details
  // card and the main "consult online" link. Omitted entirely when unset,
  // used by send-devis-email/send-facture-email since those already attach
  // the PDF directly.
  pdfUrl?: string | null;
  pdfLabel?: string;
  linkUrl: string;
  linkLabel: string;
  linkHint: string;
  signature: string;
}): string {
  const { clientName, bodyMessage, projectName, detailsTitle, detailsLines, pdfUrl, pdfLabel, linkUrl, linkLabel, linkHint, signature } = params;
  const font = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

  return `
    <div style="font-family: ${font}; font-size: 15px; line-height: 1.6; color: #1a1f1c; max-width: 560px;">
      <p style="margin: 0 0 16px;">Bonjour${clientName ? ` ${escapeHtml(clientName)}` : ''},</p>
      <p style="margin: 0 0 20px;">${textToHtmlLines(bodyMessage)}</p>
      ${
        projectName
          ? `<p style="margin: 0 0 20px; color: #555f58;">Chantier : <strong style="color: #1a1f1c;">${escapeHtml(projectName)}</strong></p>`
          : ''
      }
      <div style="margin: 0 0 24px; padding: 16px 20px; background: #f5f4f0; border-radius: 10px;">
        <p style="margin: 0 0 10px; font-weight: 700;">${escapeHtml(detailsTitle)}</p>
        ${detailsLines
          .map((line) => `<p style="margin: 0 0 4px; color: #3f4842;">${escapeHtml(line)}</p>`)
          .join('')}
      </div>
      ${
        pdfUrl
          ? `<p style="margin: 0 0 12px;"><a href="${pdfUrl}" style="color: #1f3d3a; font-weight: 600; text-decoration: underline;">${escapeHtml(pdfLabel ?? 'Télécharger le PDF')}</a></p>`
          : ''
      }
      <p style="margin: 0 0 24px;">
        <a href="${linkUrl}" style="color: #1f3d3a; font-weight: 700; text-decoration: underline;">${escapeHtml(linkLabel)}</a>
        ${linkHint ? ` — ${escapeHtml(linkHint)}` : ''}
      </p>
      <p style="margin: 0; padding-top: 16px; border-top: 1px solid #e5e2da; color: #1a1f1c;">${textToHtmlLines(signature)}</p>
    </div>
  `.trim();
}

export function base64FromBytes(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

export async function sendResendEmail(params: {
  apiKey: string;
  from: string;
  to: string[];
  replyTo?: string | null;
  subject: string;
  html: string;
  attachments?: { filename: string; content: string }[];
}): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${params.apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: params.from,
      to: params.to,
      reply_to: params.replyTo || undefined,
      subject: params.subject,
      html: params.html,
      attachments: params.attachments,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('Resend error', res.status, errText);
    return { ok: false, error: `Échec de l'envoi de l'e-mail (${res.status})` };
  }
  return { ok: true };
}
