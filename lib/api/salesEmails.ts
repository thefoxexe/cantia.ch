import { supabase } from '../supabase';

// "Suivi des e-mails" (plan Entreprise): the organization's Cantia address
// and the emails filed through it (see
// supabase/migrations/20260929140000_sales_email_inbox.sql and
// supabase/functions/resend-webhook/inbound.ts).
export const SALES_INBOX_DOMAIN = 'suivi.cantia.ch';

export interface SalesInboxSettings {
  enabled: boolean;
  inbox_token: string;
  reply_to_copy: boolean;
}

export interface SalesEmail {
  id: string;
  direction: 'outgoing' | 'incoming';
  from_email: string;
  counterpart_email: string | null;
  subject: string | null;
  snippet: string | null;
  devis_id: string | null;
  client_id: string | null;
  occurred_at: string;
  devis: { number: string | null; client_name: string | null } | null;
}

export function salesInboxAddress(token: string): string {
  return `${token}@${SALES_INBOX_DOMAIN}`;
}

// Created on first read (with a fresh random address) so the page always
// has one to show.
export async function getSalesInboxSettings(orgId: string): Promise<SalesInboxSettings | null> {
  const { data, error } = await supabase
    .from('sales_email_settings')
    .select('enabled, inbox_token, reply_to_copy')
    .eq('organization_id', orgId)
    .maybeSingle();
  if (error) return null;
  if (data) return data as SalesInboxSettings;
  const { data: created } = await supabase
    .from('sales_email_settings')
    .insert({ organization_id: orgId })
    .select('enabled, inbox_token, reply_to_copy')
    .maybeSingle();
  return (created as SalesInboxSettings | null) ?? null;
}

export async function updateSalesInboxSettings(orgId: string, patch: Partial<Pick<SalesInboxSettings, 'enabled' | 'reply_to_copy'>>): Promise<{ error: string | null }> {
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
    .select('id, direction, from_email, counterpart_email, subject, snippet, devis_id, client_id, occurred_at, devis(number, client_name)')
    .eq('organization_id', orgId)
    .order('occurred_at', { ascending: false })
    .limit(options.limit ?? 30);
  if (options.devisId) query = query.eq('devis_id', options.devisId);
  const { data } = await query;
  return ((data ?? []) as unknown as SalesEmail[]).map((e) => ({ ...e, devis: Array.isArray(e.devis) ? e.devis[0] ?? null : e.devis }));
}

export async function deleteSalesEmail(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('sales_emails').delete().eq('id', id);
  return { error: error?.message ?? null };
}
