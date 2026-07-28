import { supabase } from '../supabase';
import type { Organization, OrganizationInvite } from '../types';

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

export async function acceptInvite(token: string): Promise<{ organization: Organization | null; error: string | null }> {
  const { data, error } = await supabase.rpc('accept_invite', { invite_token: token });
  if (error) return { organization: null, error: error.message };
  return { organization: data ?? null, error: null };
}

export function inviteUrl(token: string): string {
  if (typeof window !== 'undefined' && window.location) {
    return `${window.location.origin}/join/${token}`;
  }
  return `https://opusflow.ch/join/${token}`;
}
