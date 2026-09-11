import { invokeFunction } from './functions';

export async function sendNewsletterCampaign(params: {
  subject: string;
  html: string;
  userIds: string[];
  includeUnsubscribed?: boolean;
}): Promise<{ sent: number; skipped: number; total: number; error: string | null }> {
  const { data, error } = await invokeFunction<{ sent: number; skipped: number; total: number }>('send-newsletter-campaign', params);
  if (error) return { sent: 0, skipped: 0, total: 0, error };
  return { sent: data?.sent ?? 0, skipped: data?.skipped ?? 0, total: data?.total ?? 0, error: null };
}

export async function sendNewsletterTest(subject: string, html: string, testEmail: string): Promise<{ error: string | null }> {
  const { error } = await invokeFunction('send-newsletter-campaign', { subject, html, testEmail });
  return { error };
}
