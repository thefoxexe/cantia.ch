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
