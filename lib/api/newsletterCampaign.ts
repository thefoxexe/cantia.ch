import { invokeFunction } from './functions';
import type { LangVariants } from './newsletter';

export type SenderPersona = 'newsletter' | 'info';

// The FR message plus optional DE/IT versions: each person gets the one in
// their language (else FR), with {{prenom}}, {{nom}}, {{entreprise}} and
// {{plan}} filled in (supabase/functions/_shared/campaign-render.ts).
export async function sendNewsletterCampaign(params: {
  subject: string;
  html: string;
  userIds: string[];
  includeUnsubscribed?: boolean;
  fromPersona: SenderPersona;
  variants?: LangVariants | null;
  audienceLabel?: string | null;
}): Promise<{ sent: number; skipped: number; total: number; error: string | null }> {
  const { data, error } = await invokeFunction<{ sent: number; skipped: number; total: number }>('send-newsletter-campaign', params);
  if (error) return { sent: 0, skipped: 0, total: 0, error };
  return { sent: data?.sent ?? 0, skipped: data?.skipped ?? 0, total: data?.total ?? 0, error: null };
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
