import { supabase } from '../supabase';

// Paramètres › Fiduciaire (client side of Cantia Accounting). Every call is
// checked in the database (owners and admins of the company only), see
// supabase/migrations/20260929210000_accounting_foundation.sql.

export const FIDUCIARY_PERMISSIONS = [
  'VIEW_INVOICES',
  'VIEW_PAYMENT_STATUS',
  'VIEW_CUSTOMERS',
  'VIEW_ACCOUNTING_DOCUMENTS',
  'DOWNLOAD_DOCUMENTS',
  'VIEW_EXPORTS',
  'VIEW_QUOTES',
  'VIEW_WORK_HOURS',
  'VIEW_PAYROLL_DATA',
] as const;
export type FiduciaryPermission = (typeof FIDUCIARY_PERMISSIONS)[number];

export const STANDARD_PERMISSIONS: FiduciaryPermission[] = [
  'VIEW_INVOICES',
  'VIEW_PAYMENT_STATUS',
  'VIEW_CUSTOMERS',
  'VIEW_ACCOUNTING_DOCUMENTS',
  'DOWNLOAD_DOCUMENTS',
  'VIEW_EXPORTS',
];

export type FiduciaryAccessStatus = 'PENDING_CLIENT' | 'PENDING_FIRM' | 'ACTIVE' | 'REFUSED' | 'REVOKED' | 'CANCELLED';

export interface FiduciaryAccess {
  id: string;
  status: FiduciaryAccessStatus;
  source: 'FIRM_REQUEST' | 'CLIENT_INVITE' | 'NEW_CLIENT_INVITE';
  permissions: FiduciaryPermission[];
  requested_at: string;
  approved_at: string | null;
  revoked_at: string | null;
  refused_at: string | null;
  firm: { id: string; name: string; city: string | null; website: string | null; verified: boolean; status: string };
  members: { name: string; email: string | null; role: string }[];
}

export interface FiduciaryInvitation {
  id: string;
  email: string;
  permissions: FiduciaryPermission[];
  created_at: string;
  expires_at: string;
}

export interface FiduciaryOverview {
  accesses: FiduciaryAccess[];
  invitations: FiduciaryInvitation[];
}

export interface FiduciaryAuditRow {
  id: string;
  action: string;
  firm_name: string | null;
  actor_name: string | null;
  details: Record<string, unknown>;
  created_at: string;
}

export async function getFiduciaries(orgId: string): Promise<{ data: FiduciaryOverview | null; error: string | null }> {
  const { data, error } = await supabase.rpc('org_fiduciaries', { p_org: orgId });
  return { data: (data as FiduciaryOverview | null) ?? null, error: error?.message ?? null };
}

export async function inviteFiduciary(orgId: string, email: string, permissions: FiduciaryPermission[]) {
  const { data, error } = await supabase.rpc('org_invite_fiduciary', { p_org: orgId, p_email: email, p_permissions: permissions });
  return { kind: (data as { kind?: string } | null)?.kind ?? null, error: error?.message ?? null };
}

export async function respondFiduciary(accessId: string, accept: boolean, permissions: FiduciaryPermission[]) {
  const { error } = await supabase.rpc('org_respond_fiduciary', { p_access_id: accessId, p_accept: accept, p_permissions: permissions });
  return { error: error?.message ?? null };
}

export async function setFiduciaryPermissions(accessId: string, permissions: FiduciaryPermission[]) {
  const { error } = await supabase.rpc('org_set_fiduciary_permissions', { p_access_id: accessId, p_permissions: permissions });
  return { error: error?.message ?? null };
}

export async function revokeFiduciary(accessId: string) {
  const { error } = await supabase.rpc('org_revoke_fiduciary', { p_access_id: accessId });
  return { error: error?.message ?? null };
}

export async function cancelFiduciaryInvitation(invitationId: string) {
  const { error } = await supabase.rpc('org_cancel_fiduciary_invitation', { p_invitation: invitationId });
  return { error: error?.message ?? null };
}

export async function getFiduciaryAudit(orgId: string): Promise<FiduciaryAuditRow[]> {
  const { data } = await supabase.rpc('org_fiduciary_audit', { p_org: orgId });
  return (data as FiduciaryAuditRow[] | null) ?? [];
}

export async function countPendingFiduciaryRequests(orgId: string): Promise<number> {
  const { count } = await supabase
    .from('fiduciary_client_access')
    .select('id', { count: 'exact', head: true })
    .eq('organization_id', orgId)
    .eq('status', 'PENDING_CLIENT');
  return count ?? 0;
}
