import { supabase } from '../supabase';
import { invokeFunction } from './functions';

export interface TransferableMember {
  userId: string;
  fullName: string;
}

export interface OwnershipTransfer {
  id: string;
  organizationId: string;
  fromUserId: string;
  toUserId: string;
  token: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'expired';
  createdAt: string;
  expiresAt: string;
}

export interface OwnershipTransferDetails extends OwnershipTransfer {
  organizationName: string;
  fromName: string;
  toName: string;
}

function mapTransfer(row: any): OwnershipTransfer {
  return {
    id: row.id,
    organizationId: row.organization_id,
    fromUserId: row.from_user_id,
    toUserId: row.to_user_id,
    token: row.token,
    status: row.status,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
  };
}

// Candidates an owner can hand the org to — every other member who isn't
// already the owner. RLS on organization_members already scopes this to
// the caller's own org.
export async function listTransferableMembers(organizationId: string, excludeUserId: string): Promise<TransferableMember[]> {
  const { data } = await supabase
    .from('organization_members')
    .select('user_id, full_name')
    .eq('organization_id', organizationId)
    .neq('user_id', excludeUserId)
    .in('role', ['admin', 'member'])
    .order('full_name', { ascending: true });
  return (data ?? []).map((m) => ({ userId: m.user_id, fullName: m.full_name }));
}

// A plain select already scopes to rows the caller is a party to (see the
// "parties can view their ownership transfer" RLS policy) — no separate
// org filter needed, just splitting whatever comes back into "I started
// this" vs "this is addressed to me" by comparing against my own id.
export async function getMyOwnershipTransfers(userId: string): Promise<{ outgoing: OwnershipTransfer | null; incoming: OwnershipTransfer | null }> {
  const { data } = await supabase.from('organization_ownership_transfers').select('*').eq('status', 'pending');
  const rows = (data ?? []).map(mapTransfer);
  return {
    outgoing: rows.find((r) => r.fromUserId === userId) ?? null,
    incoming: rows.find((r) => r.toUserId === userId) ?? null,
  };
}

export async function enrichOwnershipTransfer(transfer: OwnershipTransfer): Promise<OwnershipTransferDetails> {
  const [{ data: org }, { data: members }] = await Promise.all([
    supabase.from('organizations').select('name').eq('id', transfer.organizationId).single(),
    supabase
      .from('organization_members')
      .select('user_id, full_name')
      .eq('organization_id', transfer.organizationId)
      .in('user_id', [transfer.fromUserId, transfer.toUserId]),
  ]);
  const fromName = members?.find((m: any) => m.user_id === transfer.fromUserId)?.full_name ?? '';
  const toName = members?.find((m: any) => m.user_id === transfer.toUserId)?.full_name ?? '';
  return { ...transfer, organizationName: org?.name ?? '', fromName, toName };
}

export async function getOwnershipTransferByToken(token: string): Promise<OwnershipTransfer | null> {
  const { data } = await supabase.from('organization_ownership_transfers').select('*').eq('token', token).maybeSingle();
  return data ? mapTransfer(data) : null;
}

// initiate_ownership_transfer (DB-only) then, only once that succeeded,
// send-ownership-transfer-email (kind: confirm) — mail is a side effect of
// a real DB row existing, never the other way around.
export async function initiateOwnershipTransfer(targetUserId: string): Promise<{ error: string | null }> {
  const { data, error } = await supabase.rpc('initiate_ownership_transfer', { target_user_id: targetUserId });
  if (error) return { error: error.message };
  const row = Array.isArray(data) ? data[0] : data;
  const token = row?.token;
  if (token) {
    const { error: emailError } = await invokeFunction('send-ownership-transfer-email', { token, kind: 'confirm' });
    if (emailError) return { error: emailError };
  }
  return { error: null };
}

export async function cancelOwnershipTransfer(transferId: string): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('cancel_ownership_transfer', { p_transfer_id: transferId });
  return { error: error?.message ?? null };
}

// confirm_ownership_transfer (DB-only, does the actual role swap) then a
// best-effort announcement to both parties — the transfer itself has
// already succeeded by the time the email is sent, so a slow/failed send
// here is never reported back as if the transfer failed.
export async function confirmOwnershipTransfer(token: string): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('confirm_ownership_transfer', { p_token: token });
  if (error) return { error: error.message };
  invokeFunction('send-ownership-transfer-email', { token, kind: 'announce' });
  return { error: null };
}
