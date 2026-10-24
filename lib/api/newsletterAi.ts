import { invokeFunction } from './functions';

// Super Admin › E-mails: Claude writes or revises the campaign e-mail in
// Cantia's colours, and translates it (supabase/functions/
// generate-newsletter-email). One call per language so none runs long.

export interface AiEmail {
  subject: string;
  preheader: string;
  html: string;
  notes?: string | null;
}

export async function generateEmail(params: {
  brief: string;
  kind: string;
  tone: string;
  audience?: string | null;
  ctaUrl?: string;
  ctaLabel?: string;
  previousHtml?: string;
  subject?: string;
  preheader?: string;
  revision?: string;
}): Promise<{ email: AiEmail | null; error: string | null }> {
  const { data, error } = await invokeFunction<AiEmail>('generate-newsletter-email', { mode: 'generate', ...params });
  return { email: data, error };
}

export async function translateEmail(params: { lang: 'de' | 'it'; subject: string; preheader: string; html: string }): Promise<{ email: AiEmail | null; error: string | null }> {
  const { data, error } = await invokeFunction<AiEmail>('generate-newsletter-email', { mode: 'translate', ...params });
  return { email: data, error };
}
