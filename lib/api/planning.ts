import { supabase } from '../supabase';
import type { PlanningAssignment } from '../types';

export interface PlanningAssignmentWithNames extends PlanningAssignment {
  project_name: string;
  member_name: string;
}

export async function listPlanningAssignments(
  organizationId: string,
  rangeStart: string,
  rangeEnd: string,
): Promise<PlanningAssignmentWithNames[]> {
  const { data } = await supabase
    .from('planning_assignments')
    .select('*, projects(name)')
    .eq('organization_id', organizationId)
    .lte('starts_on', rangeEnd)
    .gte('ends_on', rangeStart)
    .order('starts_on', { ascending: true });

  const rows = data ?? [];
  if (rows.length === 0) return [];

  const { data: members } = await supabase
    .from('organization_members')
    .select('user_id, full_name')
    .eq('organization_id', organizationId);
  const names: Record<string, string> = {};
  for (const m of members ?? []) names[m.user_id] = m.full_name || 'Membre';

  return rows.map((r: any) => ({
    ...r,
    project_name: r.projects?.name ?? 'Chantier',
    member_name: names[r.member_user_id] ?? 'Membre',
  }));
}

export async function createPlanningAssignment(params: {
  organizationId: string;
  projectId: string;
  memberUserId: string;
  startsOn: string;
  endsOn: string;
  note: string;
  createdBy: string | undefined;
}): Promise<{ error: string | null }> {
  const { error } = await supabase.from('planning_assignments').insert({
    organization_id: params.organizationId,
    project_id: params.projectId,
    member_user_id: params.memberUserId,
    starts_on: params.startsOn,
    ends_on: params.endsOn,
    note: params.note.trim() || null,
    created_by: params.createdBy,
  });
  return { error: error?.message ?? null };
}

export async function updatePlanningAssignment(
  id: string,
  updates: { startsOn: string; endsOn: string; note: string },
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('planning_assignments')
    .update({ starts_on: updates.startsOn, ends_on: updates.endsOn, note: updates.note.trim() || null })
    .eq('id', id);
  return { error: error?.message ?? null };
}

export async function deletePlanningAssignment(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('planning_assignments').delete().eq('id', id);
  return { error: error?.message ?? null };
}
