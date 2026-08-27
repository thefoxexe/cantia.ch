import { supabase } from '../supabase';
import type {
  PayrollDeductionType,
  PayrollExpense,
  PayrollExpenseType,
  PayrollProfile,
  PayrollProfileDeduction,
  PayrollTimeEntry,
  PayrollWorkType,
} from '../types';

// ==========================================================================
// Company catalogs — "types de travail", "types de frais", "types de
// cotisation". Every org member can read the first two (they pick from
// them when logging their own hours/expenses); deduction types are
// manager-only, enforced by RLS, not just hidden client-side.
// ==========================================================================

export async function listWorkTypes(organizationId: string): Promise<PayrollWorkType[]> {
  const { data } = await supabase
    .from('payroll_work_types')
    .select('*')
    .eq('organization_id', organizationId)
    .order('sort_order', { ascending: true });
  return data ?? [];
}

export async function createWorkType(
  organizationId: string,
  label: string,
  hourlyRateChf: number | null,
  sortOrder: number,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('payroll_work_types')
    .insert({ organization_id: organizationId, label: label.trim(), hourly_rate_chf: hourlyRateChf, sort_order: sortOrder });
  return { error: error?.message ?? null };
}

export async function updateWorkType(
  id: string,
  updates: { label: string; hourlyRateChf: number | null; active: boolean },
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('payroll_work_types')
    .update({ label: updates.label.trim(), hourly_rate_chf: updates.hourlyRateChf, active: updates.active })
    .eq('id', id);
  return { error: error?.message ?? null };
}

export async function deleteWorkType(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('payroll_work_types').delete().eq('id', id);
  return { error: error?.message ?? null };
}

export async function listExpenseTypes(organizationId: string): Promise<PayrollExpenseType[]> {
  const { data } = await supabase
    .from('payroll_expense_types')
    .select('*')
    .eq('organization_id', organizationId)
    .order('sort_order', { ascending: true });
  return data ?? [];
}

export async function createExpenseType(
  organizationId: string,
  label: string,
  unit: 'km' | 'forfait',
  rateChf: number | null,
  sortOrder: number,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('payroll_expense_types')
    .insert({ organization_id: organizationId, label: label.trim(), unit, rate_chf: rateChf, sort_order: sortOrder });
  return { error: error?.message ?? null };
}

export async function updateExpenseType(
  id: string,
  updates: { label: string; unit: 'km' | 'forfait'; rateChf: number | null; active: boolean },
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('payroll_expense_types')
    .update({ label: updates.label.trim(), unit: updates.unit, rate_chf: updates.rateChf, active: updates.active })
    .eq('id', id);
  return { error: error?.message ?? null };
}

export async function deleteExpenseType(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('payroll_expense_types').delete().eq('id', id);
  return { error: error?.message ?? null };
}

export async function listDeductionTypes(organizationId: string): Promise<PayrollDeductionType[]> {
  const { data } = await supabase
    .from('payroll_deduction_types')
    .select('*')
    .eq('organization_id', organizationId)
    .order('sort_order', { ascending: true });
  return data ?? [];
}

export async function createDeductionType(
  organizationId: string,
  label: string,
  defaultRatePercent: number | null,
  sortOrder: number,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('payroll_deduction_types')
    .insert({ organization_id: organizationId, label: label.trim(), default_rate_percent: defaultRatePercent, sort_order: sortOrder });
  return { error: error?.message ?? null };
}

export async function updateDeductionType(
  id: string,
  updates: { label: string; defaultRatePercent: number | null; active: boolean },
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('payroll_deduction_types')
    .update({ label: updates.label.trim(), default_rate_percent: updates.defaultRatePercent, active: updates.active })
    .eq('id', id);
  return { error: error?.message ?? null };
}

export async function deleteDeductionType(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('payroll_deduction_types').delete().eq('id', id);
  return { error: error?.message ?? null };
}

// ==========================================================================
// Time entries — chantier + type de travail + either a plain hours figure
// or a start/end range (the caller computes `hours` from the range before
// calling create/update, so every reader downstream only ever deals with a
// single numeric hours value).
// ==========================================================================

export interface PayrollTimeEntryWithNames extends PayrollTimeEntry {
  project_name: string | null;
  work_type_label: string | null;
}

export async function listTimeEntries(
  organizationId: string,
  userId: string,
  rangeStart: string,
  rangeEnd: string,
): Promise<PayrollTimeEntryWithNames[]> {
  const { data } = await supabase
    .from('payroll_time_entries')
    .select('*, projects(name), payroll_work_types(label)')
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .gte('entry_date', rangeStart)
    .lte('entry_date', rangeEnd)
    .order('entry_date', { ascending: false });
  return (data ?? []).map((r: any) => ({
    ...r,
    project_name: r.projects?.name ?? null,
    work_type_label: r.payroll_work_types?.label ?? null,
  }));
}

export async function createTimeEntry(params: {
  organizationId: string;
  projectId: string | null;
  workTypeId: string | null;
  userId: string;
  entryDate: string;
  hours: number;
  startTime: string | null;
  endTime: string | null;
  note: string;
  createdBy: string | undefined;
}): Promise<{ error: string | null }> {
  const { error } = await supabase.from('payroll_time_entries').insert({
    organization_id: params.organizationId,
    project_id: params.projectId,
    work_type_id: params.workTypeId,
    user_id: params.userId,
    entry_date: params.entryDate,
    hours: params.hours,
    start_time: params.startTime,
    end_time: params.endTime,
    note: params.note.trim() || null,
    created_by: params.createdBy,
  });
  return { error: error?.message ?? null };
}

export async function updateTimeEntry(
  id: string,
  updates: {
    projectId: string | null;
    workTypeId: string | null;
    entryDate: string;
    hours: number;
    startTime: string | null;
    endTime: string | null;
    note: string;
  },
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('payroll_time_entries')
    .update({
      project_id: updates.projectId,
      work_type_id: updates.workTypeId,
      entry_date: updates.entryDate,
      hours: updates.hours,
      start_time: updates.startTime,
      end_time: updates.endTime,
      note: updates.note.trim() || null,
    })
    .eq('id', id);
  return { error: error?.message ?? null };
}

export async function deleteTimeEntry(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('payroll_time_entries').delete().eq('id', id);
  return { error: error?.message ?? null };
}

// ==========================================================================
// Expenses — chantier + type de frais (km-rated or forfait), same
// visibility rule as time entries.
// ==========================================================================

export interface PayrollExpenseWithNames extends PayrollExpense {
  project_name: string | null;
  expense_type_label: string | null;
  expense_type_unit: 'km' | 'forfait' | null;
}

export async function listExpenses(
  organizationId: string,
  userId: string,
  rangeStart: string,
  rangeEnd: string,
): Promise<PayrollExpenseWithNames[]> {
  const { data } = await supabase
    .from('payroll_expenses')
    .select('*, projects(name), payroll_expense_types(label, unit)')
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .gte('expense_date', rangeStart)
    .lte('expense_date', rangeEnd)
    .order('expense_date', { ascending: false });
  return (data ?? []).map((r: any) => ({
    ...r,
    project_name: r.projects?.name ?? null,
    expense_type_label: r.payroll_expense_types?.label ?? null,
    expense_type_unit: r.payroll_expense_types?.unit ?? null,
  }));
}

export async function createExpense(params: {
  organizationId: string;
  projectId: string | null;
  expenseTypeId: string | null;
  userId: string;
  expenseDate: string;
  quantity: number | null;
  amountChf: number;
  note: string;
  createdBy: string | undefined;
}): Promise<{ error: string | null }> {
  const { error } = await supabase.from('payroll_expenses').insert({
    organization_id: params.organizationId,
    project_id: params.projectId,
    expense_type_id: params.expenseTypeId,
    user_id: params.userId,
    expense_date: params.expenseDate,
    quantity: params.quantity,
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

// ==========================================================================
// Salary profile + per-employee deduction overrides — manager-only,
// enforced by RLS.
// ==========================================================================

export async function getPayrollProfile(organizationId: string, userId: string): Promise<PayrollProfile | null> {
  const { data } = await supabase
    .from('payroll_profiles')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .maybeSingle();
  return data ?? null;
}

export async function upsertPayrollProfile(
  organizationId: string,
  userId: string,
  updates: Partial<
    Pick<PayrollProfile, 'salary_type' | 'hourly_rate_chf' | 'monthly_salary_chf' | 'street' | 'postal_code' | 'locality' | 'notes'>
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

export async function listProfileDeductions(organizationId: string, userId: string): Promise<PayrollProfileDeduction[]> {
  const { data } = await supabase
    .from('payroll_profile_deductions')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('user_id', userId);
  return data ?? [];
}

// One row per deduction type touched for this employee — enabled=false
// records an explicit opt-out (a deduction that doesn't apply to them,
// e.g. no LAAC), a custom rate/amount records an override. Deduction
// types never touched for this employee simply use their org default.
export async function upsertProfileDeduction(
  organizationId: string,
  userId: string,
  deductionTypeId: string,
  updates: { ratePercent: number | null; fixedAmountChf: number | null; enabled: boolean },
  updatedBy: string | undefined,
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('payroll_profile_deductions').upsert(
    {
      organization_id: organizationId,
      user_id: userId,
      deduction_type_id: deductionTypeId,
      rate_percent: updates.ratePercent,
      fixed_amount_chf: updates.fixedAmountChf,
      enabled: updates.enabled,
      updated_by: updatedBy,
    },
    { onConflict: 'organization_id,user_id,deduction_type_id' },
  );
  return { error: error?.message ?? null };
}

export interface DeductionLine {
  label: string;
  amount: number;
}

export interface SalaryBreakdown {
  gross: number;
  lines: DeductionLine[];
  totalDeductions: number;
  net: number;
}

// Combines the org's deduction catalog with this employee's overrides —
// a deduction type never touched for them applies at its org default rate,
// enabled by default; disabling or overriding it is per-employee.
export function computeSalaryBreakdown(
  gross: number,
  deductionTypes: PayrollDeductionType[],
  overrides: PayrollProfileDeduction[],
): SalaryBreakdown {
  const overrideByType = new Map(overrides.map((o) => [o.deduction_type_id, o]));
  const lines: DeductionLine[] = [];

  for (const dt of deductionTypes) {
    if (!dt.active) continue;
    const override = overrideByType.get(dt.id);
    if (override && !override.enabled) continue;

    const ratePercent = override?.rate_percent ?? dt.default_rate_percent;
    const fixedAmount = override?.fixed_amount_chf;
    const amount =
      fixedAmount != null ? fixedAmount : ratePercent != null ? round2((gross * ratePercent) / 100) : 0;
    if (amount === 0 && ratePercent == null && fixedAmount == null) continue;
    lines.push({ label: dt.label, amount });
  }

  const totalDeductions = round2(lines.reduce((sum, l) => sum + l.amount, 0));
  return { gross: round2(gross), lines, totalDeductions, net: round2(gross - totalDeductions) };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export type ExportGranularity = 'day' | 'week' | 'month';

interface ExportRow {
  period: string;
  projectName: string;
  workTypeLabel: string;
  hours: number;
}

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

export function groupHoursForExport(
  entries: PayrollTimeEntryWithNames[],
  granularity: ExportGranularity,
): ExportRow[] {
  const totals = new Map<string, ExportRow>();
  for (const entry of entries) {
    const period = periodLabel(entry.entry_date, granularity);
    const projectName = entry.project_name ?? 'Sans chantier';
    const workTypeLabel = entry.work_type_label ?? 'Non précisé';
    const key = `${period}__${projectName}__${workTypeLabel}`;
    const existing = totals.get(key);
    if (existing) {
      existing.hours = round2(existing.hours + Number(entry.hours));
    } else {
      totals.set(key, { period, projectName, workTypeLabel, hours: round2(Number(entry.hours)) });
    }
  }
  return Array.from(totals.values());
}

export function hoursToCsv(rows: ExportRow[], granularity: ExportGranularity): string {
  const periodHeader = granularity === 'day' ? 'Date' : granularity === 'week' ? 'Semaine' : 'Mois';
  const header = `${periodHeader};Chantier;Type de travail;Heures`;
  const lines = rows.map((r) => `${r.period};${r.projectName};${r.workTypeLabel};${r.hours.toFixed(2).replace('.', ',')}`);
  return [header, ...lines].join('\n');
}
