import { invokeFunction } from './functions';
import type { LangVariants } from './newsletter';

export type SenderPersona = 'newsletter' | 'info';

// The FR message plus optional DE/IT versions: each person gets the one in
// their language (else FR), with {{prenom}}, {{nom}}, {{entreprise}} and
// {{plan}} filled in (supabase/functions/_shared/campaign-render.ts).
export interface ExternalRecipient {
  email: string;
  name?: string;
  company?: string;
  locale?: 'fr' | 'de' | 'it';
}

// One address per line: « e-mail », optionally followed by « , Nom » and
// « , Entreprise » and « , de » / « , it » (French otherwise).
export function parseExternalRecipients(text: string): { recipients: ExternalRecipient[]; invalid: string[] } {
  const recipients: ExternalRecipient[] = [];
  const invalid: string[] = [];
  const seen = new Set<string>();
  for (const raw of text.split(/\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const parts = line.split(/[,;\t]/).map((x) => x.trim()).filter(Boolean);
    const email = (parts.shift() ?? '').toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      invalid.push(line);
      continue;
    }
    if (seen.has(email)) continue;
    seen.add(email);
    const lang = parts.find((x) => ['fr', 'de', 'it'].includes(x.toLowerCase()));
    const rest = parts.filter((x) => x !== lang);
    recipients.push({ email, name: rest[0], company: rest[1], locale: (lang?.toLowerCase() as ExternalRecipient['locale']) ?? 'fr' });
  }
  return { recipients, invalid };
}

export async function sendNewsletterCampaign(params: {
  subject: string;
  html: string;
  userIds: string[];
  includeUnsubscribed?: boolean;
  fromPersona: SenderPersona;
  variants?: LangVariants | null;
  audienceLabel?: string | null;
  // People without a Cantia account, typed in the composer.
  externalRecipients?: ExternalRecipient[];
}): Promise<{ sent: number; skipped: number; failed: number; failReason: string | null; total: number; error: string | null }> {
  const { data, error } = await invokeFunction<{ sent: number; skipped: number; failed?: number; failReason?: string | null; total: number }>('send-newsletter-campaign', params);
  if (error) return { sent: 0, skipped: 0, failed: 0, failReason: null, total: 0, error };
  return { sent: data?.sent ?? 0, skipped: data?.skipped ?? 0, failed: data?.failed ?? 0, failReason: data?.failReason ?? null, total: data?.total ?? 0, error: null };
}

export async function sendNewsletterTest(
  subject: string,
  html: string,
  testEmail: string,
  fromPersona: SenderPersona,
  extra?: { variants?: LangVariants | null; testLocale?: 'fr' | 'de' | 'it' },
): Promise<{ error: string | null }> {
  const { error } = await invokeFunction('send-newsletter-campaign', { subject, html, testEmail, fromPersona, ...extra });
  return { error };
}
