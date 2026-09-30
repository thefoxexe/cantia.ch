import { supabase } from '../supabase';

// "Suivi des e-mails" (plan Entreprise): the organization's Cantia address
// and the emails filed through it (see
// supabase/migrations/20260929140000_sales_email_inbox.sql and
// supabase/functions/resend-webhook/inbound.ts).
export const SALES_INBOX_DOMAIN = 'suivi.cantia.ch';

// Where clients' replies to devis / factures go: the Cantia mailbox and a
// copy to the company address, the mailbox only, or the company address only.
export type ReplyDelivery = 'both' | 'app' | 'email';

export interface SalesInboxSettings {
  enabled: boolean;
  inbox_token: string;
  reply_to_copy: boolean;
  reply_delivery: ReplyDelivery;
}

export interface SalesEmail {
  id: string;
  direction: 'outgoing' | 'incoming';
  from_email: string;
  counterpart_email: string | null;
  subject: string | null;
  snippet: string | null;
  devis_id: string | null;
  facture_id: string | null;
  client_id: string | null;
  occurred_at: string;
  from_name?: string | null;
  read_at?: string | null;
  attachments?: MailAttachment[];
  devis: { number: string | null; client_name: string | null } | null;
  facture: { number: string | null } | null;
}

export interface MailAttachment {
  name: string;
  path: string;
  size: number;
  content_type: string;
}

// The whole message, loaded when it is opened (the list only carries the
// snippet).
export interface SalesEmailBody {
  body_text: string | null;
  body_html: string | null;
  to_emails: string[];
  cc_emails: string[];
  attachments: MailAttachment[];
}

export function salesInboxAddress(token: string): string {
  return `${token}@${SALES_INBOX_DOMAIN}`;
}

// Created on first read (with a fresh random address) so the page always
// has one to show.
export async function getSalesInboxSettings(orgId: string): Promise<SalesInboxSettings | null> {
  const { data, error } = await supabase
    .from('sales_email_settings')
    .select('enabled, inbox_token, reply_to_copy, reply_delivery')
    .eq('organization_id', orgId)
    .maybeSingle();
  if (error) return null;
  if (data) return data as SalesInboxSettings;
  const { data: created } = await supabase
    .from('sales_email_settings')
    .insert({ organization_id: orgId })
    .select('enabled, inbox_token, reply_to_copy, reply_delivery')
    .maybeSingle();
  return (created as SalesInboxSettings | null) ?? null;
}

export async function updateSalesInboxSettings(orgId: string, patch: Partial<Pick<SalesInboxSettings, 'enabled' | 'reply_to_copy' | 'reply_delivery'>>): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('sales_email_settings')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('organization_id', orgId);
  return { error: error?.message ?? null };
}

export async function regenerateSalesInbox(orgId: string): Promise<{ token: string | null; error: string | null }> {
  const { data, error } = await supabase.rpc('regenerate_sales_inbox', { p_org_id: orgId });
  return { token: typeof data === 'string' ? data : null, error: error?.message ?? null };
}

export async function listSalesEmails(orgId: string, options: { limit?: number; devisId?: string } = {}): Promise<SalesEmail[]> {
  let query = supabase
    .from('sales_emails')
    .select('id, direction, from_email, from_name, counterpart_email, subject, snippet, devis_id, facture_id, client_id, occurred_at, read_at, attachments, devis(number, client_name), facture:factures(number)')
    .eq('organization_id', orgId)
    .order('occurred_at', { ascending: false })
    .limit(options.limit ?? 30);
  if (options.devisId) query = query.eq('devis_id', options.devisId);
  const { data } = await query;
  return ((data ?? []) as unknown as SalesEmail[]).map((e) => ({
    ...e,
    devis: Array.isArray(e.devis) ? e.devis[0] ?? null : e.devis,
    facture: Array.isArray(e.facture) ? e.facture[0] ?? null : e.facture,
  }));
}

export async function deleteSalesEmail(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('sales_emails').delete().eq('id', id);
  return { error: error?.message ?? null };
}

export async function getSalesEmailBody(id: string): Promise<SalesEmailBody | null> {
  const { data } = await supabase.from('sales_emails').select('body_text, body_html, to_emails, cc_emails, attachments').eq('id', id).maybeSingle();
  return (data as SalesEmailBody | null) ?? null;
}

export async function setSalesEmailRead(id: string, read: boolean): Promise<void> {
  await supabase.rpc('set_sales_email_read', { p_id: id, p_read: read });
}

// Short-lived link to download an attachment (private bucket).
export async function attachmentUrl(path: string): Promise<string | null> {
  const { data } = await supabase.storage.from('mail-attachments').createSignedUrl(path, 300);
  return data?.signedUrl ?? null;
}
