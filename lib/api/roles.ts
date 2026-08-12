import { supabase } from '../supabase';
import type { OrganizationRole } from '../types';

export async function listOrgRoles(organizationId: string): Promise<OrganizationRole[]> {
  const { data } = await supabase
    .from('organization_roles')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: true });
  return data ?? [];
}

export async function createOrgRole(
  organizationId: string,
  name: string,
  color: string,
  canViewFinances: boolean,
): Promise<{ role: OrganizationRole | null; error: string | null }> {
  const { data, error } = await supabase
    .from('organization_roles')
    .insert({ organization_id: organizationId, name: name.trim(), color, can_view_finances: canViewFinances })
    .select('*')
    .single();
  return { role: data ?? null, error: error?.message ?? null };
}

export async function updateOrgRole(
  roleId: string,
  name: string,
  color: string,
  canViewFinances: boolean,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('organization_roles')
    .update({ name: name.trim(), color, can_view_finances: canViewFinances })
    .eq('id', roleId);
  return { error: error?.message ?? null };
}

// Members holding this role fall back to role_id = null (plain "Membre")
// automatically — the FK is ON DELETE SET NULL, no manual cleanup needed.
export async function deleteOrgRole(roleId: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('organization_roles').delete().eq('id', roleId);
  return { error: error?.message ?? null };
}

export async function assignMemberRole(memberId: string, roleId: string | null): Promise<{ error: string | null }> {
  const { error } = await supabase.from('organization_members').update({ role_id: roleId }).eq('id', memberId);
  return { error: error?.message ?? null };
}
