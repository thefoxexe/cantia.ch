import { supabase, STORAGE_BUCKET } from '../supabase';
import { uploadToOrgBucket } from './storage';

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
  'PROPOSE_ENTRIES',
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

// Document requests from the fiduciary (supabase/migrations/20260930120000_fiduciary_workspace.sql):
// the client answers with files (uploaded to its own folder) and a message.
export interface FiduciaryRequestForClient {
  id: string;
  firm_name: string;
  title: string;
  details: string | null;
  due_date: string | null;
  status: 'open' | 'answered' | 'done';
  client_message: string | null;
  created_at: string;
  answered_at: string | null;
  files: { id: string; file_path: string; file_name: string; created_at: string }[];
}

export async function getFiduciaryRequests(orgId: string): Promise<FiduciaryRequestForClient[]> {
  const { data } = await supabase.rpc('org_fiduciary_requests', { p_org: orgId });
  return (data as FiduciaryRequestForClient[] | null) ?? [];
}

export async function addFiduciaryRequestFile(orgId: string, requestId: string, file: { uri: string; name: string; mimeType?: string | null; size?: number | null }): Promise<{ error: string | null }> {
  const safe = file.name.replace(/[^\w.\- ]+/g, '_').slice(-120);
  const { path, error } = await uploadToOrgBucket(orgId, `fiduciary-requests/${requestId}/${Date.now()}-${safe}`, file.uri, file.mimeType ?? 'application/octet-stream');
  if (error || !path) return { error: error ?? 'Upload failed' };
  const { error: rpcError } = await supabase.rpc('org_add_request_file', { p_request: requestId, p_path: path, p_name: file.name, p_size: file.size ?? null });
  return { error: rpcError?.message ?? null };
}

export async function removeFiduciaryRequestFile(fileId: string): Promise<{ error: string | null }> {
  const { data, error } = await supabase.rpc('org_remove_request_file', { p_file: fileId });
  if (!error && typeof data === 'string') await supabase.storage.from(STORAGE_BUCKET).remove([data]);
  return { error: error?.message ?? null };
}

export async function answerFiduciaryRequest(requestId: string, message: string): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('org_answer_request', { p_request: requestId, p_message: message.trim() || null });
  return { error: error?.message ?? null };
}

// ---------------------------------------------------------------------------
// Documents to sign, entry proposals, directory
// (supabase/migrations/20261008140000_fiduciary_pro.sql).

export interface FiduciaryApprovalForClient {
  id: string;
  firm_name: string;
  kind: string;
  title: string;
  message: string | null;
  file_path: string | null;
  file_name: string | null;
  file_sha256: string | null;
  due_date: string | null;
  status: 'pending' | 'approved' | 'rejected';
  signer_name: string | null;
  decided_at: string | null;
  rejection_reason: string | null;
  created_at: string;
}

export async function getFiduciaryApprovals(orgId: string): Promise<FiduciaryApprovalForClient[]> {
  const { data } = await supabase.rpc('org_fiduciary_approvals', { p_org: orgId });
  return (data as FiduciaryApprovalForClient[] | null) ?? [];
}

export async function decideFiduciaryApproval(id: string, accept: boolean, signer: string, signature: string | null, reason: string | null) {
  const { error } = await supabase.rpc('org_decide_approval', { p_id: id, p_accept: accept, p_signer: signer, p_signature: signature, p_reason: reason });
  return { error: error?.message ?? null };
}

export interface FiduciaryProposalForClient {
  id: string;
  firm_name: string;
  entry_date: string;
  label: string;
  reason: string | null;
  lines: { account_code: string; account_label: string | null; debit: number; credit: number; label: string | null }[];
  status: 'pending' | 'accepted' | 'rejected';
  posted: boolean;
  created_at: string;
  decided_at: string | null;
  rejection_reason: string | null;
}

export async function getFiduciaryProposals(orgId: string): Promise<FiduciaryProposalForClient[]> {
  const { data } = await supabase.rpc('org_entry_proposals', { p_org: orgId });
  return (data as FiduciaryProposalForClient[] | null) ?? [];
}

export async function decideFiduciaryProposal(id: string, accept: boolean, reason: string | null) {
  const { data, error } = await supabase.rpc('org_decide_entry_proposal', { p_id: id, p_accept: accept, p_reason: reason });
  return { posted: (data as { posted?: boolean } | null)?.posted ?? false, error: error?.message ?? null };
}

export interface DirectoryFirm {
  id: string;
  name: string;
  city: string | null;
  postal_code: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  verified: boolean;
  logo_data: string | null;
  brand_color: string | null;
  description: string | null;
  services: string[];
  languages: string[];
  cantons: string[];
  accepts_new_clients: boolean;
}

export async function searchFiduciaries(search: string | null, canton: string | null): Promise<DirectoryFirm[]> {
  const { data } = await supabase.rpc('fiduciary_directory', { p_search: search || null, p_canton: canton || null });
  return (data as DirectoryFirm[] | null) ?? [];
}

export async function requestFiduciary(orgId: string, firmId: string, permissions: FiduciaryPermission[]) {
  const { error } = await supabase.rpc('org_request_firm', { p_org: orgId, p_firm: firmId, p_permissions: permissions });
  return { error: error?.message ?? null };
}
