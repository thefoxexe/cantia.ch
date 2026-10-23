import { supabase } from '../supabase';
import { invokeFunction } from './functions';
import type {
  AdminAuditLog,
  AdminBlogFunnelOverview,
  AdminDashboardStats,
  AdminFeatureUsage,
  AdminFeatureUsageByOrg,
  AdminModuleSummary,
  AdminOrgBillingStatus,
  AdminOrganizationDetail,
  AdminOrganizationSummary,
  AdminPlatformExpense,
  AdminRevenueOverview,
  AdminSiteTrafficOverview,
  AdminSocialPost,
  AdminTutorialChapter,
  AdminUserSummary,
  PlatformExpenseCategory,
  SocialPostStatus,
  TutorialChapterStatus,
} from '../types';
import type { SocialScene } from '../socialIllustrations';
import type { UsageData } from '../../components/AdminUsagePanel';

// All admin_* RPCs re-check is_platform_admin() server-side and raise if the
// caller isn't one — this client layer never has to guess who's allowed to
// call it, it just surfaces whatever the DB decides. Every call here also
// logs failures to the console and returns the message alongside the
// (empty) result, so a real failure never renders identically to "no data".

function logRpcError(name: string, error: { message: string } | null): string | null {
  if (!error) return null;
  console.error(`[admin] ${name} failed:`, error.message);
  return error.message;
}

export async function isPlatformAdmin(): Promise<boolean> {
  const { data, error } = await supabase.rpc('is_platform_admin');
  if (error) {
    console.error('[admin] is_platform_admin failed:', error.message);
    return false;
  }
  return !!data;
}

export async function getDashboardStats(): Promise<{ stats: AdminDashboardStats | null; error: string | null }> {
  const { data, error } = await supabase.rpc('admin_dashboard_stats');
  return { stats: error ? null : (data as AdminDashboardStats), error: logRpcError('admin_dashboard_stats', error) };
}

export async function listOrganizations(
  search: string,
  limit = 50,
  offset = 0,
): Promise<{ rows: AdminOrganizationSummary[]; total: number; error: string | null }> {
  const { data, error } = await supabase.rpc('admin_list_organizations', {
    search: search || null,
    limit_n: limit,
    offset_n: offset,
  });
  const err = logRpcError('admin_list_organizations', error);
  if (err || !data) return { rows: [], total: 0, error: err };
  const rows = data as AdminOrganizationSummary[];
  return { rows, total: rows[0]?.total_count ?? 0, error: null };
}

export async function getOrganizationDetail(orgId: string): Promise<{ detail: AdminOrganizationDetail | null; error: string | null }> {
  const { data, error } = await supabase.rpc('admin_get_organization_detail', { org_id: orgId });
  return { detail: error ? null : (data as AdminOrganizationDetail), error: logRpcError('admin_get_organization_detail', error) };
}

export interface SignupChannel {
  key: 'partner' | 'fiduciary' | 'google_ads' | 'campaign' | 'search' | 'social' | 'ai' | 'website' | 'blog' | 'direct' | 'site' | 'unknown';
  label: string;
  detail: string | null;
}

export interface AdminOrgOrigin {
  channel: SignupChannel;
  created_at: string;
  // Where the company was created: a web hostname (app.cantia.ch, …) or
  // 'ios' / 'android'. Null for companies created before it was recorded.
  host: string | null;
  owner: {
    email: string;
    account_created_at: string;
    provider: string | null;
    signup_source: string | null;
    newsletter: boolean | null;
  } | null;
  campaign: {
    utm_source: string | null;
    utm_medium: string | null;
    utm_campaign: string | null;
    utm_content: string | null;
    utm_term: string | null;
    gclid: boolean;
  } | null;
  signup_referrer: string | null;
  first_visit: { landing_path: string | null; referrer: string | null; at: string | null } | null;
  journey: {
    pageviews: number;
    days: number;
    first_at: string | null;
    last_at: string | null;
    pages: { path: string; at: string; views: number }[];
    referrers: string[];
    actions: { page: string; kind: string; at: string }[];
  } | null;
  partner: {
    name: string | null;
    code: string | null;
    source: string | null;
    first_click_at: string | null;
    attributed_at: string | null;
    clicks: { landing_page: string | null; referrer: string | null; at: string }[];
  } | null;
  fiduciaries: { firm: string; city: string | null; source: string; status: string; requested_at: string | null }[];
  blog_leads: { slug: string | null; at: string }[];
}

// Where a company's signup came from — the channel plus every trace the
// platform already keeps (first visit, pages seen before signing up,
// campaign, partner link, fiduciary invitation, blog lead).
export async function getOrganizationOrigin(orgId: string): Promise<{ origin: AdminOrgOrigin | null; error: string | null }> {
  const { data, error } = await supabase.rpc('admin_get_organization_origin', { p_org: orgId });
  return { origin: error ? null : (data as AdminOrgOrigin), error: logRpcError('admin_get_organization_origin', error) };
}

export async function getSignupChannels(organizationIds: string[]): Promise<{ channels: Record<string, SignupChannel>; error: string | null }> {
  if (organizationIds.length === 0) return { channels: {}, error: null };
  const { data, error } = await supabase.rpc('admin_signup_channels', { p_ids: organizationIds });
  const err = logRpcError('admin_signup_channels', error);
  const channels: Record<string, SignupChannel> = {};
  for (const row of (data ?? []) as { organization_id: string; channel: SignupChannel }[]) channels[row.organization_id] = row.channel;
  return { channels, error: err };
}

export interface AdminOrgActivity {
  organization_id: string;
  last_seen_at: string | null;
  last_sign_in_at: string | null;
  last_action_at: string | null;
  active_days_30: number;
  views_30: number;
  features_used: number;
  features_total: number;
}

// Presence and usage per company for the Entreprises list (see the
// org_usage migration).
export async function getOrgsActivity(organizationIds: string[]): Promise<{ activity: Record<string, AdminOrgActivity>; error: string | null }> {
  if (organizationIds.length === 0) return { activity: {}, error: null };
  const { data, error } = await supabase.rpc('admin_orgs_activity', { p_ids: organizationIds });
  const activity: Record<string, AdminOrgActivity> = {};
  for (const row of (data ?? []) as AdminOrgActivity[]) activity[row.organization_id] = row;
  return { activity, error: logRpcError('admin_orgs_activity', error) };
}

// People, 30-day activity, features, screens and latest actions of one company.
export async function getOrganizationUsage(orgId: string): Promise<{ usage: UsageData | null; error: string | null }> {
  const { data, error } = await supabase.rpc('admin_org_usage', { p_org: orgId });
  return { usage: error ? null : (data as UsageData), error: logRpcError('admin_org_usage', error) };
}

export interface AdminOrgEvent {
  id: string;
  event_type: 'activated' | 'trial_started' | 'plan_changed' | 'canceled';
  detail: Record<string, unknown>;
  created_at: string;
}

// The subscription lifecycle timeline shown on the org detail screen —
// written by stripe-webhook as the real Stripe events happen (see that
// function's logOrgEvent helper).
export async function getOrganizationEvents(orgId: string): Promise<{ rows: AdminOrgEvent[]; error: string | null }> {
  const { data, error } = await supabase.rpc('admin_get_organization_events', { p_organization_id: orgId });
  return { rows: error ? [] : ((data ?? []) as AdminOrgEvent[]), error: logRpcError('admin_get_organization_events', error) };
}

export async function setOrganizationModule(orgId: string, moduleKey: string, enabled: boolean): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('admin_set_organization_module', {
    org_id: orgId,
    module_key: moduleKey,
    enabled,
  });
  return { error: logRpcError('admin_set_organization_module', error) };
}

// Retired products still present in the database until their rows are
// deleted (Cantia Panorama: supabase/migrations/20261020100000_drop_panorama.sql,
// disabled meanwhile). Never shown anywhere.
const RETIRED_MODULE_KEYS = new Set(['relief']);

export async function listModules(): Promise<{ rows: AdminModuleSummary[]; error: string | null }> {
  const { data, error } = await supabase.rpc('admin_list_modules');
  const err = logRpcError('admin_list_modules', error);
  const rows = err || !data ? [] : (data as AdminModuleSummary[]);
  return { rows: rows.filter((m) => !RETIRED_MODULE_KEYS.has(m.key)), error: err };
}

export async function listUsers(
  search: string,
  limit = 50,
  offset = 0,
): Promise<{ rows: AdminUserSummary[]; total: number; error: string | null }> {
  const { data, error } = await supabase.rpc('admin_list_users', {
    search: search || null,
    limit_n: limit,
    offset_n: offset,
  });
  const err = logRpcError('admin_list_users', error);
  if (err || !data) return { rows: [], total: 0, error: err };
  const rows = data as AdminUserSummary[];
  return { rows, total: rows[0]?.total_count ?? 0, error: null };
}

export async function listAuditLogs(limit = 50, offset = 0): Promise<{ rows: AdminAuditLog[]; total: number; error: string | null }> {
  const { data, error } = await supabase.rpc('admin_list_audit_logs', { limit_n: limit, offset_n: offset });
  const err = logRpcError('admin_list_audit_logs', error);
  if (err || !data) return { rows: [], total: 0, error: err };
  const rows = data as (AdminAuditLog & { total_count: number })[];
  return { rows, total: rows[0]?.total_count ?? 0, error: null };
}

// Real Stripe billing state — never derived/guessed locally. The edge
// function itself re-checks is_platform_admin() and never returns the
// Stripe secret key, only these derived fields.
export async function getRevenueOverview(): Promise<{ overview: AdminRevenueOverview | null; error: string | null }> {
  const { data, error } = await invokeFunction<AdminRevenueOverview>('admin-billing-overview', { action: 'overview' });
  if (error) console.error('[admin] admin-billing-overview(overview) failed:', error);
  return { overview: data, error };
}

export async function getOrgBillingStatuses(organizationIds: string[]): Promise<{ statuses: Record<string, AdminOrgBillingStatus>; error: string | null }> {
  if (organizationIds.length === 0) return { statuses: {}, error: null };
  const { data, error } = await invokeFunction<{ statuses: Record<string, AdminOrgBillingStatus> }>('admin-billing-overview', {
    action: 'org_billing',
    organization_ids: organizationIds,
  });
  if (error) console.error('[admin] admin-billing-overview(org_billing) failed:', error);
  return { statuses: data?.statuses ?? {}, error };
}

// Sets trial_end 30 days out directly on the org's Stripe subscription —
// real trial time, not a coupon. Only works on an org that already has a
// Stripe subscription (stripe_subscription_id set); this is for extending
// an existing customer, never for a brand-new self-serve signup.
export async function grantTrial(organizationId: string): Promise<{ trialEnd: string | null; error: string | null }> {
  const { data, error } = await invokeFunction<{ trial_end: string }>('admin-billing-overview', {
    action: 'grant_trial',
    organization_id: organizationId,
  });
  if (error) console.error('[admin] admin-billing-overview(grant_trial) failed:', error);
  return { trialEnd: data?.trial_end ?? null, error };
}

export async function listTutorialChapters(): Promise<{ rows: AdminTutorialChapter[]; error: string | null }> {
  const { data, error } = await supabase.rpc('admin_list_tutorial_chapters');
  const err = logRpcError('admin_list_tutorial_chapters', error);
  return { rows: err || !data ? [] : (data as AdminTutorialChapter[]), error: err };
}

export async function upsertTutorialChapter(input: {
  id?: string | null;
  order_index: number;
  feature_area: string;
  title: string;
  talking_points: string;
  status: TutorialChapterStatus;
  youtube_url?: string | null;
  site_embed_done?: boolean;
  notes?: string | null;
  public_description?: string | null;
}): Promise<{ chapter: AdminTutorialChapter | null; error: string | null }> {
  const { data, error } = await supabase.rpc('admin_upsert_tutorial_chapter', {
    chapter_id: input.id ?? null,
    p_order_index: input.order_index,
    p_feature_area: input.feature_area,
    p_title: input.title,
    p_talking_points: input.talking_points,
    p_status: input.status,
    p_youtube_url: input.youtube_url ?? null,
    p_site_embed_done: input.site_embed_done ?? false,
    p_notes: input.notes ?? null,
    p_public_description: input.public_description ?? null,
  });
  return { chapter: (data as AdminTutorialChapter) ?? null, error: logRpcError('admin_upsert_tutorial_chapter', error) };
}

export async function deleteTutorialChapter(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('admin_delete_tutorial_chapter', { chapter_id: id });
  return { error: logRpcError('admin_delete_tutorial_chapter', error) };
}

export async function listSocialPosts(): Promise<{ rows: AdminSocialPost[]; error: string | null }> {
  const { data, error } = await supabase.rpc('admin_list_social_posts');
  const err = logRpcError('admin_list_social_posts', error);
  return { rows: err || !data ? [] : (data as AdminSocialPost[]), error: err };
}

export async function upsertSocialPost(input: {
  id?: string | null;
  order_index: number;
  topic: string;
  headline: string;
  subheadline: string;
  instagram_caption: string;
  linkedin_caption: string;
  status: SocialPostStatus;
  notes?: string | null;
  scene: SocialScene;
  stat_value?: string | null;
  stat_label?: string | null;
  badge?: string | null;
}): Promise<{ post: AdminSocialPost | null; error: string | null }> {
  const { data, error } = await supabase.rpc('admin_upsert_social_post', {
    post_id: input.id ?? null,
    p_order_index: input.order_index,
    p_topic: input.topic,
    p_headline: input.headline,
    p_subheadline: input.subheadline,
    p_instagram_caption: input.instagram_caption,
    p_linkedin_caption: input.linkedin_caption,
    p_status: input.status,
    p_notes: input.notes ?? null,
    p_scene: input.scene,
    p_stat_value: input.stat_value ?? null,
    p_stat_label: input.stat_label ?? null,
    p_badge: input.badge ?? null,
  });
  return { post: (data as AdminSocialPost) ?? null, error: logRpcError('admin_upsert_social_post', error) };
}

export async function deleteSocialPost(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('admin_delete_social_post', { post_id: id });
  return { error: logRpcError('admin_delete_social_post', error) };
}

// Real usage, not clicks — see admin_feature_usage_overview() for how each
// row is counted (an org's own devis/facture/report/... rows, never new
// event tracking).
export async function getFeatureUsage(): Promise<{ rows: AdminFeatureUsage[]; error: string | null }> {
  const { data, error } = await supabase.rpc('admin_feature_usage_overview');
  const err = logRpcError('admin_feature_usage_overview', error);
  return { rows: err || !data ? [] : (data as AdminFeatureUsage[]), error: err };
}

export async function getFeatureUsageByOrg(): Promise<{ rows: AdminFeatureUsageByOrg[]; error: string | null }> {
  const { data, error } = await supabase.rpc('admin_feature_usage_by_org');
  const err = logRpcError('admin_feature_usage_by_org', error);
  return { rows: err || !data ? [] : (data as AdminFeatureUsageByOrg[]), error: err };
}

// Blog funnel: which articles drive pageviews, CTA clicks and lead-magnet
// emails — see admin_blog_funnel_overview() for how each figure is counted.
export async function getBlogFunnelOverview(): Promise<{ overview: AdminBlogFunnelOverview | null; error: string | null }> {
  const { data, error } = await supabase.rpc('admin_blog_funnel_overview');
  const err = logRpcError('admin_blog_funnel_overview', error);
  return { overview: err || !data ? null : (data as AdminBlogFunnelOverview), error: err };
}

// Site traffic + campaign attribution (UTM/gclid) — see
// admin_site_traffic_overview() for how visits, sources and signups are
// grouped.
export async function getSiteTrafficOverview(): Promise<{ overview: AdminSiteTrafficOverview | null; error: string | null }> {
  const { data, error } = await supabase.rpc('admin_site_traffic_overview');
  const err = logRpcError('admin_site_traffic_overview', error);
  return { overview: err || !data ? null : (data as AdminSiteTrafficOverview), error: err };
}

// Realtime "dernières inscriptions" — new organizations landing live in the
// dashboard. RLS on organizations only lets a platform admin's own session
// see rows beyond their membership (see migration 20260825010000), so this
// channel is silent for anyone else regardless.
export function subscribeToNewOrganizations(onInsert: () => void): () => void {
  const channel = supabase
    .channel(`admin-new-orgs-${Date.now()}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'organizations' }, onInsert)
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}

export async function listPlatformExpenses(): Promise<{ rows: AdminPlatformExpense[]; error: string | null }> {
  const { data, error } = await supabase.rpc('admin_list_platform_expenses');
  const err = logRpcError('admin_list_platform_expenses', error);
  return { rows: err || !data ? [] : (data as AdminPlatformExpense[]), error: err };
}

export async function upsertPlatformExpense(input: {
  id?: string | null;
  category: PlatformExpenseCategory;
  label: string;
  amount_chf: number;
  expense_date: string;
  recurring: boolean;
  notes?: string | null;
}): Promise<{ expense: AdminPlatformExpense | null; error: string | null }> {
  const { data, error } = await supabase.rpc('admin_upsert_platform_expense', {
    expense_id: input.id ?? null,
    p_category: input.category,
    p_label: input.label,
    p_amount_chf: input.amount_chf,
    p_expense_date: input.expense_date,
    p_recurring: input.recurring,
    p_notes: input.notes ?? null,
  });
  return { expense: (data as AdminPlatformExpense) ?? null, error: logRpcError('admin_upsert_platform_expense', error) };
}

export async function deletePlatformExpense(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('admin_delete_platform_expense', { expense_id: id });
  return { error: logRpcError('admin_delete_platform_expense', error) };
}
