import { supabase } from '../supabase';
import type { Organization, OrganizationInvite, OrganizationSearchResult } from '../types';

export async function listActiveInvites(organizationId: string): Promise<OrganizationInvite[]> {
  const { data } = await supabase
    .from('organization_invites')
    .select('*')
    .eq('organization_id', organizationId)
    .is('used_at', null)
    .eq('revoked', false)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });
  return data ?? [];
}

export async function createInvite(organizationId: string, userId: string | undefined): Promise<{ invite: OrganizationInvite | null; error: string | null }> {
  const { data, error } = await supabase
    .from('organization_invites')
    .insert({ organization_id: organizationId, created_by: userId })
    .select()
    .single();
  return { invite: data ?? null, error: error?.message ?? null };
}

export async function revokeInvite(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('organization_invites').update({ revoked: true }).eq('id', id);
  return { error: error?.message ?? null };
}

export async function getInvitePreview(token: string): Promise<{ organizationName: string | null; valid: boolean }> {
  const { data, error } = await supabase.rpc('invite_preview', { invite_token: token });
  if (error || !data?.length) return { organizationName: null, valid: false };
  return { organizationName: data[0].organization_name, valid: data[0].valid };
}

export async function acceptInvite(
  token: string,
  confirmLeaveCurrent = false,
): Promise<{ organization: Organization | null; error: string | null }> {
  const { data, error } = await supabase.rpc('accept_invite', {
    invite_token: token,
    confirm_leave_current: confirmLeaveCurrent,
  });
  if (error) return { organization: null, error: error.message };
  return { organization: data ?? null, error: null };
}

export function inviteUrl(token: string): string {
  if (typeof window !== 'undefined' && window.location) {
    return `${window.location.origin}/join/${token}`;
  }
  return `https://opusflow.ch/join/${token}`;
}

export async function searchOrganizations(query: string): Promise<OrganizationSearchResult[]> {
  const { data, error } = await supabase.rpc('search_organizations', { search_query: query });
  if (error) return [];
  return (data ?? []) as OrganizationSearchResult[];
}

export async function requestToJoin(organizationId: string, userId: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('organization_join_requests')
    .insert({ organization_id: organizationId, user_id: userId });
  return { error: error?.message ?? null };
}

export interface MyJoinRequest {
  id: string;
  organization_id: string;
  organization_name: string;
  status: string;
  requested_at: string;
}

export async function getMyPendingRequest(): Promise<MyJoinRequest | null> {
  const { data, error } = await supabase.rpc('get_my_join_request');
  if (error || !data?.length) return null;
  return data[0] as MyJoinRequest;
}

export async function cancelJoinRequest(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('organization_join_requests').delete().eq('id', id);
  return { error: error?.message ?? null };
}

export interface PendingJoinRequest {
  id: string;
  user_id: string;
  requester_name: string;
  requester_email: string;
  requested_at: string;
}

export async function listPendingRequestsForOrg(organizationId: string): Promise<PendingJoinRequest[]> {
  const { data, error } = await supabase.rpc('list_join_requests_for_org', { org_id: organizationId });
  if (error) return [];
  return (data ?? []) as PendingJoinRequest[];
}

export async function respondToJoinRequest(requestId: string, approve: boolean): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('respond_to_join_request', { request_id: requestId, approve });
  return { error: error?.message ?? null };
}
