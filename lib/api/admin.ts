import { supabase } from '../supabase';
import type {
  AdminAuditLog,
  AdminDashboardStats,
  AdminModuleSummary,
  AdminOrganizationDetail,
  AdminOrganizationSummary,
  AdminUserSummary,
  PlatformModule,
} from '../types';

// All admin_* RPCs re-check is_platform_admin() server-side and raise if the
// caller isn't one — this client layer never has to guess who's allowed to
// call it, it just surfaces whatever the DB decides.

export async function isPlatformAdmin(): Promise<boolean> {
  const { data, error } = await supabase.rpc('is_platform_admin');
  if (error) return false;
  return !!data;
}

export async function getDashboardStats(): Promise<AdminDashboardStats | null> {
  const { data, error } = await supabase.rpc('admin_dashboard_stats');
  if (error) return null;
  return data as AdminDashboardStats;
}

export async function listOrganizations(
  search: string,
  limit = 50,
  offset = 0,
): Promise<{ rows: AdminOrganizationSummary[]; total: number }> {
  const { data, error } = await supabase.rpc('admin_list_organizations', {
    search: search || null,
    limit_n: limit,
    offset_n: offset,
  });
  if (error || !data) return { rows: [], total: 0 };
  const rows = data as AdminOrganizationSummary[];
  return { rows, total: rows[0]?.total_count ?? 0 };
}

export async function getOrganizationDetail(orgId: string): Promise<AdminOrganizationDetail | null> {
  const { data, error } = await supabase.rpc('admin_get_organization_detail', { org_id: orgId });
  if (error) return null;
  return data as AdminOrganizationDetail;
}

export async function setOrganizationModule(orgId: string, moduleKey: string, enabled: boolean): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('admin_set_organization_module', {
    org_id: orgId,
    module_key: moduleKey,
    enabled,
  });
  return { error: error?.message ?? null };
}

export async function listModules(): Promise<AdminModuleSummary[]> {
  const { data, error } = await supabase.rpc('admin_list_modules');
  if (error || !data) return [];
  return data as AdminModuleSummary[];
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
  return { module: (data as PlatformModule) ?? null, error: error?.message ?? null };
}

export async function listUsers(search: string, limit = 50, offset = 0): Promise<{ rows: AdminUserSummary[]; total: number }> {
  const { data, error } = await supabase.rpc('admin_list_users', {
    search: search || null,
    limit_n: limit,
    offset_n: offset,
  });
  if (error || !data) return { rows: [], total: 0 };
  const rows = data as AdminUserSummary[];
  return { rows, total: rows[0]?.total_count ?? 0 };
}

export async function listAuditLogs(limit = 50, offset = 0): Promise<{ rows: AdminAuditLog[]; total: number }> {
  const { data, error } = await supabase.rpc('admin_list_audit_logs', { limit_n: limit, offset_n: offset });
  if (error || !data) return { rows: [], total: 0 };
  const rows = data as (AdminAuditLog & { total_count: number })[];
  return { rows, total: rows[0]?.total_count ?? 0 };
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
