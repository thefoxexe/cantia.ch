import { supabase } from '../supabase';
import type { OrganizationRole } from '../types';

export interface RolePermissions {
  canViewFinances: boolean;
  canViewMetre: boolean;
  canViewPlanning: boolean;
  canViewDocuments: boolean;
  canViewSubcontractors: boolean;
  canCreateProjects: boolean;
  canManagePayroll: boolean;
}

function toRow(permissions: RolePermissions) {
  return {
    can_view_finances: permissions.canViewFinances,
    can_view_metre: permissions.canViewMetre,
    can_view_planning: permissions.canViewPlanning,
    can_view_documents: permissions.canViewDocuments,
    can_view_subcontractors: permissions.canViewSubcontractors,
    can_create_projects: permissions.canCreateProjects,
    can_manage_payroll: permissions.canManagePayroll,
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
  // Belt-and-suspenders: equipe.tsx already hides "Nouveau rôle" once the
  // plan's cap is reached, but this closes the same gate at the API layer
  // so it can't be bypassed by calling createOrgRole directly.
  const [{ count }, { data: org }] = await Promise.all([
    supabase.from('organization_roles').select('*', { count: 'exact', head: true }).eq('organization_id', organizationId),
    supabase.from('organizations').select('plans(max_org_roles)').eq('id', organizationId).single(),
  ]);
  const maxRoles = (org?.plans as unknown as { max_org_roles: number | null } | null)?.max_org_roles;
  if (maxRoles != null && (count ?? 0) >= maxRoles) {
    return {
      role: null,
      error: `Limite de ${maxRoles} rôles atteinte pour votre offre. Passez à Équipe pour créer des rôles personnalisés en nombre illimité.`,
    };
  }

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
