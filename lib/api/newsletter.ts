import { supabase } from '../supabase';

// Absence of a row (shouldn't normally happen — every user gets one at
// signup via the on_auth_user_created_newsletter_pref trigger, and every
// pre-existing user was backfilled) defaults to subscribed, same as the
// signup checkbox's own default state.
export async function getMyNewsletterSubscription(userId: string): Promise<boolean> {
  const { data } = await supabase.from('newsletter_subscriptions').select('subscribed').eq('user_id', userId).maybeSingle();
  return data?.subscribed ?? true;
}

export async function setMyNewsletterSubscription(userId: string, subscribed: boolean): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('newsletter_subscriptions')
    .upsert({ user_id: userId, subscribed, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
  return { error: error?.message ?? null };
}

// Platform-admin only (RLS: "platform admins can view newsletter
// subscriptions") — used by the newsletter composer to show the "Tous les
// abonnés" recipient count and to tag unsubscribed users in the manual
// picker.
export async function getSubscribedCount(): Promise<number> {
  const { count } = await supabase.from('newsletter_subscriptions').select('user_id', { count: 'exact', head: true }).eq('subscribed', true);
  return count ?? 0;
}

export async function getUnsubscribedUserIds(userIds: string[]): Promise<Set<string>> {
  if (userIds.length === 0) return new Set();
  const { data } = await supabase.from('newsletter_subscriptions').select('user_id').eq('subscribed', false).in('user_id', userIds);
  return new Set((data ?? []).map((r: any) => r.user_id));
}

// Powers the newsletter composer's quick-add filter buttons — returns
// every matching user_id in one call (not paginated, since the caller adds
// the whole batch to a selection rather than rendering a list of them).
// Platform-admin only (RLS-equivalent check inside the RPC itself).
export async function filterUserIds(params: { planIds?: string[]; subscribed?: boolean }): Promise<string[]> {
  const { data, error } = await supabase.rpc('admin_filter_user_ids', {
    p_plan_ids: params.planIds ?? null,
    p_subscribed: params.subscribed ?? null,
  });
  if (error) return [];
  return (data ?? []).map((r: any) => r.user_id);
}

// Same quick-add pattern as filterUserIds, but resolves to the org OWNER
// only (not every member) for account-lifecycle segments — "résiliés",
// "en essai", the legacy "découverte" plan, never-completed signups —
// since those are about the account, not a per-member newsletter
// preference. p_org_status is one of 'canceled' | 'trialing' |
// 'decouverte' | 'incomplete'.
export async function filterOwnerIds(params: { orgStatus?: string; subscribed?: boolean }): Promise<string[]> {
  const { data, error } = await supabase.rpc('admin_filter_owner_ids', {
    p_org_status: params.orgStatus ?? null,
    p_subscribed: params.subscribed ?? null,
  });
  if (error) return [];
  return (data ?? []).map((r: any) => r.user_id);
}

export interface NewsletterCampaign {
  id: string;
  subject: string;
  from_persona: 'newsletter' | 'info';
  sent_by: string | null;
  recipient_emails: string[];
  sent_count: number;
  skipped_count: number;
  total_count: number;
  created_at: string;
}

// Simple send history — "qui a reçu quoi, quand, quel sujet" — shown at
// the bottom of the composer. Platform-admin only (RLS).
export async function listCampaigns(limit = 20): Promise<NewsletterCampaign[]> {
  const { data } = await supabase
    .from('newsletter_campaigns')
    .select('id, subject, from_persona, sent_by, recipient_emails, sent_count, skipped_count, total_count, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);
  return (data ?? []) as NewsletterCampaign[];
}

export interface ScheduledCampaign {
  id: string;
  subject: string;
  from_persona: 'newsletter' | 'info';
  user_ids: string[];
  include_unsubscribed: boolean;
  scheduled_at: string;
  status: 'pending' | 'sent' | 'failed' | 'canceled';
  created_at: string;
}

// Freezes the recipient list at scheduling time — the same array the
// immediate-send path already builds client-side, just handed to a pending
// row instead of straight to send-newsletter-campaign. Picked up by the
// dispatch_scheduled_newsletter_sends() cron (every 5 minutes) once
// scheduled_at passes.
export async function scheduleNewsletterSend(params: {
  subject: string;
  html: string;
  userIds: string[];
  fromPersona: 'newsletter' | 'info';
  includeUnsubscribed: boolean;
  scheduledAt: string;
}): Promise<{ id: string | null; error: string | null }> {
  const { data, error } = await supabase.rpc('admin_schedule_newsletter_send', {
    p_subject: params.subject,
    p_html: params.html,
    p_user_ids: params.userIds,
    p_from_persona: params.fromPersona,
    p_include_unsubscribed: params.includeUnsubscribed,
    p_scheduled_at: params.scheduledAt,
  });
  return { id: error ? null : (data as string), error: error?.message ?? null };
}

export async function listScheduledSends(): Promise<ScheduledCampaign[]> {
  const { data, error } = await supabase.rpc('admin_list_scheduled_newsletter_sends');
  if (error) return [];
  return (data ?? []) as ScheduledCampaign[];
}

export async function cancelScheduledSend(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('admin_cancel_scheduled_newsletter_send', { p_id: id });
  return { error: error?.message ?? null };
}
