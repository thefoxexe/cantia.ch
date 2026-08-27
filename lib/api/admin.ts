import { supabase } from '../supabase';
import { invokeFunction } from './functions';
import type {
  AdminAuditLog,
  AdminDashboardStats,
  AdminModuleSummary,
  AdminOrgBillingStatus,
  AdminOrganizationDetail,
  AdminOrganizationSummary,
  AdminRevenueOverview,
  AdminSiteTrafficOverview,
  AdminUserSummary,
  PlatformModule,
} from '../types';

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

export async function setOrganizationModule(orgId: string, moduleKey: string, enabled: boolean): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('admin_set_organization_module', {
    org_id: orgId,
    module_key: moduleKey,
    enabled,
  });
  return { error: logRpcError('admin_set_organization_module', error) };
}

export async function listModules(): Promise<{ rows: AdminModuleSummary[]; error: string | null }> {
  const { data, error } = await supabase.rpc('admin_list_modules');
  const err = logRpcError('admin_list_modules', error);
  return { rows: err || !data ? [] : (data as AdminModuleSummary[]), error: err };
}

export async function upsertModule(input: {
  key: string;
  name: string;
  description?: string | null;
  category?: string | null;
  visibility?: 'standard' | 'private' | 'experimental';
  status?: 'active' | 'beta' | 'disabled';
}): Promise<{ module: PlatformModule | null; error: string | null }> {
  const { data, error } = await supabase.rpc('admin_upsert_module', {
    module_key: input.key,
    module_name: input.name,
    module_description: input.description ?? null,
    module_category: input.category ?? null,
    module_visibility: input.visibility ?? 'private',
    module_status: input.status ?? 'active',
  });
  return { module: (data as PlatformModule) ?? null, error: logRpcError('admin_upsert_module', error) };
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

// cantia.ch pageviews, logged client-side by lib/siteAnalytics.ts — see the
// migration for why this table has no SELECT policy at all (read-only via
// this security-definer RPC, same is_platform_admin() gate as every other
// admin_* call).
export async function getSiteTraffic(): Promise<{ overview: AdminSiteTrafficOverview | null; error: string | null }> {
  const { data, error } = await supabase.rpc('admin_site_traffic_overview');
  return { overview: error ? null : (data as AdminSiteTrafficOverview), error: logRpcError('admin_site_traffic_overview', error) };
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
