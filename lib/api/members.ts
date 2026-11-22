import { supabase } from '../supabase';

export type MyMemberChanges = Partial<{ locale: string; full_name: string; avatar_url: string; signature_url: string }>;

// A member's own settings on their organization_members row. Plain members
// and the owner have no update policy on that table (only admins, on other
// members), so this goes through update_my_member_profile(), which writes
// only these columns on the caller's own row (20261122090000).
//
// Until that migration is applied the RPC does not exist (PGRST202): fall
// back to the direct update, which still works for admins, and report a
// row that did not change instead of failing silently.
export async function updateMyMember(organizationId: string, userId: string, changes: MyMemberChanges): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('update_my_member_profile', { p_organization_id: organizationId, p_changes: changes });
  if (!error) return { error: null };
  if (error.code !== 'PGRST202' && !/update_my_member_profile/.test(error.message ?? '')) return { error: error.message };
  const { data, error: direct } = await supabase
    .from('organization_members')
    .update(changes)
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .select('id');
  if (direct) return { error: direct.message };
  return { error: data && data.length > 0 ? null : 'not saved' };
}
