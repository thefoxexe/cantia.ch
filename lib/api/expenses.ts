import { supabase } from '../supabase';
import type { ProjectExpense } from '../types';

export async function listProjectExpenses(projectId: string): Promise<ProjectExpense[]> {
  const { data } = await supabase
    .from('project_expenses')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });
  return data ?? [];
}

export async function createProjectExpense(
  organizationId: string,
  projectId: string,
  label: string,
  amount: number,
  createdBy: string | null,
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('project_expenses').insert({
    organization_id: organizationId,
    project_id: projectId,
    label,
    amount,
    created_by: createdBy,
  });
  return { error: error?.message ?? null };
}

export async function deleteProjectExpense(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('project_expenses').delete().eq('id', id);
  return { error: error?.message ?? null };
}
