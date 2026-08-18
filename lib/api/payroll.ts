import { supabase } from '../supabase';
import type { PayrollExpense, PayrollProfile, PayrollTimeEntry } from '../types';

export interface PayrollTimeEntryWithProject extends PayrollTimeEntry {
  project_name: string | null;
}

export async function listTimeEntries(
  organizationId: string,
  userId: string,
  rangeStart: string,
  rangeEnd: string,
): Promise<PayrollTimeEntryWithProject[]> {
  const { data } = await supabase
    .from('payroll_time_entries')
    .select('*, projects(name)')
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .gte('entry_date', rangeStart)
    .lte('entry_date', rangeEnd)
    .order('entry_date', { ascending: false });
  return (data ?? []).map((r: any) => ({ ...r, project_name: r.projects?.name ?? null }));
}

export async function createTimeEntry(params: {
  organizationId: string;
  projectId: string | null;
  userId: string;
  entryDate: string;
  hours: number;
  note: string;
  createdBy: string | undefined;
}): Promise<{ error: string | null }> {
  const { error } = await supabase.from('payroll_time_entries').insert({
    organization_id: params.organizationId,
    project_id: params.projectId,
    user_id: params.userId,
    entry_date: params.entryDate,
    hours: params.hours,
    note: params.note.trim() || null,
    created_by: params.createdBy,
  });
  return { error: error?.message ?? null };
}

export async function updateTimeEntry(
  id: string,
  updates: { projectId: string | null; entryDate: string; hours: number; note: string },
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('payroll_time_entries')
    .update({
      project_id: updates.projectId,
      entry_date: updates.entryDate,
      hours: updates.hours,
      note: updates.note.trim() || null,
    })
    .eq('id', id);
  return { error: error?.message ?? null };
}

export async function deleteTimeEntry(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('payroll_time_entries').delete().eq('id', id);
  return { error: error?.message ?? null };
}

export interface PayrollExpenseWithProject extends PayrollExpense {
  project_name: string | null;
}

export async function listExpenses(
  organizationId: string,
  userId: string,
  rangeStart: string,
  rangeEnd: string,
): Promise<PayrollExpenseWithProject[]> {
  const { data } = await supabase
    .from('payroll_expenses')
    .select('*, projects(name)')
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .gte('expense_date', rangeStart)
    .lte('expense_date', rangeEnd)
    .order('expense_date', { ascending: false });
  return (data ?? []).map((r: any) => ({ ...r, project_name: r.projects?.name ?? null }));
}

export async function createExpense(params: {
  organizationId: string;
  projectId: string | null;
  userId: string;
  expenseDate: string;
  category: 'km' | 'autre';
  km: number | null;
  amountChf: number;
  note: string;
  createdBy: string | undefined;
}): Promise<{ error: string | null }> {
  const { error } = await supabase.from('payroll_expenses').insert({
    organization_id: params.organizationId,
    project_id: params.projectId,
    user_id: params.userId,
    expense_date: params.expenseDate,
    category: params.category,
    km: params.km,
    amount_chf: params.amountChf,
    note: params.note.trim() || null,
    created_by: params.createdBy,
  });
  return { error: error?.message ?? null };
}

export async function deleteExpense(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('payroll_expenses').delete().eq('id', id);
  return { error: error?.message ?? null };
}

export async function getPayrollProfile(organizationId: string, userId: string): Promise<PayrollProfile | null> {
  const { data } = await supabase
    .from('payroll_profiles')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .maybeSingle();
  return data ?? null;
}

// Secretary/admin only (RLS-enforced) — creates the profile on first edit,
// updates it after. One row per (organization, user), upsert keeps the
// "fiche" screen from needing to know whether it exists yet.
export async function upsertPayrollProfile(
  organizationId: string,
  userId: string,
  updates: Partial<
    Pick<
      PayrollProfile,
      | 'salary_type'
      | 'hourly_rate_chf'
      | 'monthly_salary_chf'
      | 'avs_rate_percent'
      | 'ac_rate_percent'
      | 'lpp_amount_chf'
      | 'laa_rate_percent'
      | 'source_tax_rate_percent'
      | 'notes'
    >
  >,
  updatedBy: string | undefined,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('payroll_profiles')
    .upsert(
      { organization_id: organizationId, user_id: userId, ...updates, updated_by: updatedBy },
      { onConflict: 'organization_id,user_id' },
    );
  return { error: error?.message ?? null };
}

// Brut → net breakdown for a given gross amount, using the profile's
// (editable, org-specific) deduction rates. AVS/AC use the standard 2026
// employee-share percentages by default; LPP and source tax default to 0
// since they depend on the pension fund and the employee's personal
// situation — left to the admin to fill in correctly per employee.
export interface SalaryBreakdown {
  gross: number;
  avs: number;
  ac: number;
  lpp: number;
  laa: number;
  sourceTax: number;
  totalDeductions: number;
  net: number;
}

export function computeSalaryBreakdown(gross: number, profile: PayrollProfile | null): SalaryBreakdown {
  const avsRate = profile?.avs_rate_percent ?? 5.3;
  const acRate = profile?.ac_rate_percent ?? 1.1;
  const lpp = profile?.lpp_amount_chf ?? 0;
  const laaRate = profile?.laa_rate_percent ?? 0.5;
  const sourceTaxRate = profile?.source_tax_rate_percent ?? 0;

  const avs = round2((gross * avsRate) / 100);
  const ac = round2((gross * acRate) / 100);
  const laa = round2((gross * laaRate) / 100);
  const sourceTax = round2((gross * sourceTaxRate) / 100);
  const totalDeductions = round2(avs + ac + lpp + laa + sourceTax);

  return { gross: round2(gross), avs, ac, lpp: round2(lpp), laa, sourceTax, totalDeductions, net: round2(gross - totalDeductions) };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export type ExportGranularity = 'day' | 'week' | 'month';

interface ExportRow {
  period: string;
  projectName: string;
  hours: number;
}

// ISO week start (Monday) — same convention as the Planning screen, so
// "hebdomadaire" groups match what the rest of the app already calls a week.
function startOfWeek(d: Date): Date {
  const date = new Date(d);
  const day = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - day);
  return date;
}

function periodLabel(dateStr: string, granularity: ExportGranularity): string {
  const d = new Date(`${dateStr}T00:00:00`);
  if (granularity === 'day') return dateStr;
  if (granularity === 'month') {
    return d.toLocaleDateString('fr-CH', { month: 'long', year: 'numeric' });
  }
  const start = startOfWeek(d);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const fmt = (x: Date) => x.toLocaleDateString('fr-CH', { day: '2-digit', month: '2-digit' });
  return `Semaine du ${fmt(start)} au ${fmt(end)}`;
}

// Groups entries by (period, chantier) and sums hours — the shared logic
// behind the CSV export, whatever granularity the employee picked.
export function groupHoursForExport(
  entries: PayrollTimeEntryWithProject[],
  granularity: ExportGranularity,
): ExportRow[] {
  const totals = new Map<string, ExportRow>();
  for (const entry of entries) {
    const period = periodLabel(entry.entry_date, granularity);
    const projectName = entry.project_name ?? 'Sans chantier';
    const key = `${period}__${projectName}`;
    const existing = totals.get(key);
    if (existing) {
      existing.hours = round2(existing.hours + Number(entry.hours));
    } else {
      totals.set(key, { period, projectName, hours: round2(Number(entry.hours)) });
    }
  }
  return Array.from(totals.values());
}

export function hoursToCsv(rows: ExportRow[], granularity: ExportGranularity): string {
  const periodHeader = granularity === 'day' ? 'Date' : granularity === 'week' ? 'Semaine' : 'Mois';
  const header = `${periodHeader};Chantier;Heures`;
  const lines = rows.map((r) => `${r.period};${r.projectName};${r.hours.toFixed(2).replace('.', ',')}`);
  return [header, ...lines].join('\n');
}
