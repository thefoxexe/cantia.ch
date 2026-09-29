import { supabase } from '../supabase';
import { sendDevisEmail } from './devis';
import { sendExtraWorkEmail } from './extraWorks';
import { sendFactureEmail, sendFactureReminder } from './factures';
import type { SalesEmail } from './salesEmails';

// App › E-mails: every e-mail sent from Cantia to a client (devis, devis
// follow-ups, factures, payment reminders, extra works) and where it stands.
// Rows are written server-side (supabase/migrations/20260930100000_email_hub.sql):
// the senders create them, resend-webhook fills delivered / opened / clicked /
// bounced, the portal fills "viewed", client replies fill "replied".

export type EmailKind = 'devis' | 'devis_followup' | 'facture' | 'facture_reminder' | 'extra_work';
export type EmailDocType = 'devis' | 'facture' | 'extra_work';

// One word per e-mail: the furthest step it reached. A bounce overrides
// everything, since the client never got it.
export type EmailStatus = 'sent' | 'delivered' | 'opened' | 'viewed' | 'replied' | 'bounced';
export const STATUS_STEPS: Exclude<EmailStatus, 'bounced'>[] = ['sent', 'delivered', 'opened', 'viewed', 'replied'];

export interface EmailMessage {
  id: string;
  kind: EmailKind;
  document_type: EmailDocType;
  document_id: string;
  document_number: string | null;
  to_email: string;
  to_name: string | null;
  subject: string | null;
  sent_by: string | null;
  sent_at: string;
  delivered_at: string | null;
  opened_at: string | null;
  open_count: number;
  clicked_at: string | null;
  click_count: number;
  viewed_at: string | null;
  view_count: number;
  replied_at: string | null;
  reply_count: number;
  bounced_at: string | null;
  bounce_reason: string | null;
  complained_at: string | null;
  last_event_at: string;
}

export type EmailFilter = 'all' | 'watch' | 'devis' | 'factures' | 'reminders' | 'replies';

const NO_OPEN_WATCH_DAYS = 3;

export function emailStatus(m: EmailMessage): EmailStatus {
  if (m.bounced_at || m.complained_at) return 'bounced';
  if (m.replied_at) return 'replied';
  if (m.viewed_at) return 'viewed';
  if (m.opened_at || m.clicked_at) return 'opened';
  if (m.delivered_at) return 'delivered';
  return 'sent';
}

// Needs a look: never arrived, or nobody opened it after a few days.
// (Many mail apps block the open pixel, so a portal view or a reply also
// counts as "opened".)
export function needsAttention(m: EmailMessage): 'bounced' | 'notOpened' | null {
  const status = emailStatus(m);
  if (status === 'bounced') return 'bounced';
  if ((status === 'sent' || status === 'delivered') && Date.now() - new Date(m.sent_at).getTime() > NO_OPEN_WATCH_DAYS * 86400000) {
    return 'notOpened';
  }
  return null;
}

export function matchesFilter(m: EmailMessage, filter: EmailFilter): boolean {
  switch (filter) {
    case 'watch':
      return needsAttention(m) !== null;
    case 'devis':
      return m.document_type === 'devis' || m.document_type === 'extra_work';
    case 'factures':
      return m.document_type === 'facture';
    case 'reminders':
      return m.kind === 'devis_followup' || m.kind === 'facture_reminder';
    case 'replies':
      return !!m.replied_at;
    default:
      return true;
  }
}

export function matchesSearch(m: EmailMessage, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [m.to_email, m.to_name, m.subject, m.document_number].some((v) => (v ?? '').toLowerCase().includes(q));
}

export async function listEmailMessages(orgId: string, limit = 500): Promise<EmailMessage[]> {
  const { data } = await supabase
    .from('email_messages')
    .select('*')
    .eq('organization_id', orgId)
    .order('sent_at', { ascending: false })
    .limit(limit);
  return (data ?? []) as EmailMessage[];
}

// Chantier of each extra works (its screen lives under the chantier).
export async function extraWorkProjects(ids: string[]): Promise<Record<string, string>> {
  if (!ids.length) return {};
  const { data } = await supabase.from('extra_works').select('id, project_id').in('id', ids);
  const out: Record<string, string> = {};
  for (const row of (data ?? []) as { id: string; project_id: string }[]) out[row.id] = row.project_id;
  return out;
}

export function documentHref(m: EmailMessage, projectId?: string | null): string | null {
  if (m.document_type === 'devis') return `/(app)/devis/${m.document_id}`;
  if (m.document_type === 'facture') return `/(app)/devis/factures/${m.document_id}`;
  if (m.document_type === 'extra_work' && projectId) return `/(app)/chantiers/${projectId}/travaux-supplementaires/${m.document_id}`;
  return null;
}

// Replies and filed e-mails about the same document (or, when none is
// linked, with the same person) - shown under the timeline.
export async function conversationFor(orgId: string, m: EmailMessage): Promise<SalesEmail[]> {
  let query = supabase
    .from('sales_emails')
    .select('id, direction, from_email, counterpart_email, subject, snippet, devis_id, facture_id, client_id, occurred_at')
    .eq('organization_id', orgId)
    .gte('occurred_at', m.sent_at)
    .order('occurred_at', { ascending: true })
    .limit(20);
  if (m.document_type === 'devis') query = query.eq('devis_id', m.document_id);
  else if (m.document_type === 'facture') query = query.eq('facture_id', m.document_id);
  else query = query.ilike('counterpart_email', m.to_email);
  const { data } = await query;
  return ((data ?? []) as unknown as SalesEmail[]).map((e) => ({ ...e, devis: null, facture: null }));
}

// Sends the document again (a new e-mail, with its own row). For a facture
// already sent, the natural "again" is a payment reminder.
export async function resendEmail(m: EmailMessage): Promise<{ sent: boolean; error: string | null }> {
  if (m.document_type === 'devis') return sendDevisEmail(m.document_id);
  if (m.document_type === 'extra_work') return sendExtraWorkEmail(m.document_id);
  if (m.kind === 'facture_reminder') return sendFactureReminder(m.document_id);
  return sendFactureEmail(m.document_id);
}

export async function sentByNames(orgId: string, ids: string[]): Promise<Record<string, string>> {
  const unique = [...new Set(ids.filter(Boolean))];
  if (!unique.length) return {};
  const { data } = await supabase
    .from('organization_members')
    .select('user_id, full_name')
    .eq('organization_id', orgId)
    .in('user_id', unique);
  const out: Record<string, string> = {};
  for (const row of (data ?? []) as { user_id: string; full_name: string | null }[]) {
    if (row.full_name) out[row.user_id] = row.full_name;
  }
  return out;
}
