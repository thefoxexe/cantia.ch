import { supabase } from '../supabase';
import type { OrganizationRole } from '../types';

export interface RolePermissions {
  canViewFinances: boolean;
  canViewSurvey: boolean;
  canViewMetre: boolean;
  canViewPlanning: boolean;
  canViewDocuments: boolean;
  canViewSubcontractors: boolean;
}

function toRow(permissions: RolePermissions) {
  return {
    can_view_finances: permissions.canViewFinances,
    can_view_survey: permissions.canViewSurvey,
    can_view_metre: permissions.canViewMetre,
    can_view_planning: permissions.canViewPlanning,
    can_view_documents: permissions.canViewDocuments,
    can_view_subcontractors: permissions.canViewSubcontractors,
  };
}

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
  permissions: RolePermissions,
): Promise<{ role: OrganizationRole | null; error: string | null }> {
  const { data, error } = await supabase
    .from('organization_roles')
    .insert({ organization_id: organizationId, name: name.trim(), color, ...toRow(permissions) })
    .select('*')
    .single();
  return { role: data ?? null, error: error?.message ?? null };
}

export async function updateOrgRole(
  roleId: string,
  name: string,
  color: string,
  permissions: RolePermissions,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('organization_roles')
    .update({ name: name.trim(), color, ...toRow(permissions) })
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
