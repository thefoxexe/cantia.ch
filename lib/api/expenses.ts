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

export interface OrganizationExpenseRow extends ProjectExpense {
  projects: { name: string } | null;
}

// Every chantier-linked expense across the org, with the chantier's name
// joined in — the "Dépenses" module's read-only view over the same rows
// each chantier's own Rentabilité tab already shows individually.
export async function listOrganizationProjectExpenses(organizationId: string): Promise<OrganizationExpenseRow[]> {
  const { data } = await supabase
    .from('project_expenses')
    .select('*, projects(name)')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });
  return (data ?? []) as OrganizationExpenseRow[];
}

export interface ProjectExpenseInput {
  label: string;
  category: string | null;
  amount: number;
  expenseDate: string | null;
  notes: string | null;
}

export async function createProjectExpense(
  organizationId: string,
  projectId: string,
  input: ProjectExpenseInput,
  createdBy: string | null,
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('project_expenses').insert({
    organization_id: organizationId,
    project_id: projectId,
    label: input.label,
    category: input.category,
    amount: input.amount,
    expense_date: input.expenseDate,
    notes: input.notes,
    created_by: createdBy,
  });
  return { error: error?.message ?? null };
}

export async function deleteProjectExpense(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('project_expenses').delete().eq('id', id);
  return { error: error?.message ?? null };
}
