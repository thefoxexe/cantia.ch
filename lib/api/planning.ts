import { supabase } from '../supabase';
import type { PlanningAssignment } from '../types';

export interface PlanningAssignmentWithNames extends PlanningAssignment {
  project_name: string;
  member_name: string;
  // Someone else's private event: only the slot is known (« Rendez-vous privé »).
  masked?: boolean;
}

export async function listPlanningAssignments(
  organizationId: string,
  rangeStart: string,
  rangeEnd: string,
): Promise<PlanningAssignmentWithNames[]> {
  const [{ data }, busy, { data: members }] = await Promise.all([
    supabase
      .from('planning_assignments')
      .select('*, projects(name)')
      .eq('organization_id', organizationId)
      .lte('starts_on', rangeEnd)
      .gte('ends_on', rangeStart)
      .order('starts_on', { ascending: true }),
    // Other people's private events (migration 20261001110000); absent
    // before it, which simply means none.
    supabase.rpc('planning_busy_blocks', { p_organization_id: organizationId, p_start: rangeStart, p_end: rangeEnd }),
    supabase.from('organization_members').select('user_id, full_name').eq('organization_id', organizationId),
  ]);

  const names: Record<string, string> = {};
  for (const m of members ?? []) names[m.user_id] = m.full_name || 'Membre';

  const rows: PlanningAssignmentWithNames[] = (data ?? []).map((r: any) => ({
    ...r,
    project_name: r.projects?.name ?? (r.project_id ? 'Chantier' : 'Sans chantier'),
    member_name: names[r.member_user_id] ?? 'Membre',
  }));
  const masked: PlanningAssignmentWithNames[] = ((busy.error ? [] : busy.data) ?? []).map((b: any) => ({
    id: b.id,
    organization_id: organizationId,
    project_id: null,
    member_user_id: b.member_user_id,
    starts_on: b.starts_on,
    ends_on: b.ends_on,
    start_time: b.start_time,
    end_time: b.end_time,
    title: null,
    note: null,
    is_private: true,
    created_by: null,
    created_at: '',
    updated_at: '',
    project_name: '',
    member_name: names[b.member_user_id] ?? 'Membre',
    masked: true,
  }));
  return [...rows, ...masked].sort((a, b) => (a.starts_on + (a.start_time ?? '') < b.starts_on + (b.start_time ?? '') ? -1 : 1));
}

export interface PlanningEventInput {
  title: string;
  projectId: string | null;
  memberUserId: string;
  startsOn: string;
  endsOn: string;
  startTime: string | null; // HH:MM, null = all day
  endTime: string | null;
  isPrivate: boolean;
  note: string;
}

function row(p: PlanningEventInput) {
  return {
    title: p.title.trim() || null,
    project_id: p.projectId,
    member_user_id: p.memberUserId,
    starts_on: p.startsOn,
    ends_on: p.endsOn,
    start_time: p.startTime,
    end_time: p.endTime,
    is_private: p.isPrivate,
    note: p.note.trim() || null,
  };
}

// Before migration 20261001110000 the new columns don't exist: save the
// title in the note so nothing is lost.
function legacy(p: PlanningEventInput) {
  const note = [p.title.trim(), p.note.trim()].filter(Boolean).join(' — ');
  return { project_id: p.projectId, member_user_id: p.memberUserId, starts_on: p.startsOn, ends_on: p.endsOn, note: note || null };
}

const missingColumn = (msg: string | undefined) => !!msg && /column|schema cache/i.test(msg);

export async function createPlanningEvent(organizationId: string, createdBy: string | undefined, input: PlanningEventInput): Promise<{ error: string | null }> {
  let { error } = await supabase.from('planning_assignments').insert({ organization_id: organizationId, created_by: createdBy, ...row(input) });
  if (missingColumn(error?.message)) ({ error } = await supabase.from('planning_assignments').insert({ organization_id: organizationId, created_by: createdBy, ...legacy(input) }));
  return { error: error?.message ?? null };
}

export async function updatePlanningEvent(id: string, input: PlanningEventInput): Promise<{ error: string | null }> {
  let { error } = await supabase.from('planning_assignments').update(row(input)).eq('id', id);
  if (missingColumn(error?.message)) ({ error } = await supabase.from('planning_assignments').update(legacy(input)).eq('id', id));
  return { error: error?.message ?? null };
}

export async function deletePlanningAssignment(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('planning_assignments').delete().eq('id', id);
  return { error: error?.message ?? null };
}
