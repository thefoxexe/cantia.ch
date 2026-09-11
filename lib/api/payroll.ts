import { supabase } from '../supabase';
import type {
  CertificateBox,
  CertificateSubbox,
  PayrollDeductionType,
  PayrollExpense,
  PayrollExpenseType,
  PayrollGhostEmployee,
  PayrollProfile,
  PayrollProfileDeduction,
  PayrollTimeEntry,
  PayrollWorkType,
  SwissSocialInsuranceRates,
} from '../types';

// Identifies who a payroll profile/deduction/PDF belongs to — either a
// real app user or a payroll-only "ghost employee" (see
// payroll_ghost_employees: someone tracked for salary/accounting purposes
// only, with no app login). Every payroll_profiles-derived RLS policy
// gates purely on organization_id, never on which of these two a row
// belongs to, so both kinds flow through the exact same functions below.
export type EmployeeRef = { userId: string; ghostEmployeeId?: undefined } | { userId?: undefined; ghostEmployeeId: string };

function ownerColumn(ref: EmployeeRef): { column: 'user_id' | 'ghost_employee_id'; id: string } {
  return ref.userId ? { column: 'user_id', id: ref.userId } : { column: 'ghost_employee_id', id: ref.ghostEmployeeId! };
}

// ==========================================================================
// Ghost employees — payroll-only "employees" with no app account. Created
// for people a fiduciary/accountant needs on the books (salary, deduction
// overrides, Lohnausweis) without them ever logging into Cantia.
// ==========================================================================

export async function listGhostEmployees(organizationId: string): Promise<PayrollGhostEmployee[]> {
  const { data } = await supabase
    .from('payroll_ghost_employees')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('active', true)
    .order('full_name', { ascending: true });
  return data ?? [];
}

// Creates the ghost employee and its (monthly-salary) payroll profile in
// one step — a ghost employee only ever exists for payroll purposes, so
// there's no reason to split "create the person" from "set their salary
// terms" the way the real-user flow does (a real user already exists as
// an app account before payroll ever touches them).
export async function createGhostEmployee(
  organizationId: string,
  fullName: string,
  createdBy: string | undefined,
): Promise<{ id: string | null; error: string | null }> {
  const { data, error } = await supabase
    .from('payroll_ghost_employees')
    .insert({ organization_id: organizationId, full_name: fullName.trim(), created_by: createdBy })
    .select('id')
    .single();
  if (error) return { id: null, error: error.message };
  const { error: profileError } = await supabase
    .from('payroll_profiles')
    .insert({ organization_id: organizationId, ghost_employee_id: data.id, salary_type: 'monthly', updated_by: createdBy });
  if (profileError) return { id: null, error: profileError.message };
  return { id: data.id, error: null };
}

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
  certificateSubbox: CertificateSubbox | null = null,
  certificateSubboxArt: string | null = null,
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('payroll_expense_types').insert({
    organization_id: organizationId,
    label: label.trim(),
    unit,
    rate_chf: rateChf,
    sort_order: sortOrder,
    certificate_subbox: certificateSubbox,
    certificate_subbox_art: certificateSubboxArt,
    // Same reasoning as createDeductionType: the settings modal always
    // shows the box chips (including "Aucune"), so this is an explicit,
    // reviewed choice even when left unassigned.
    certificate_subbox_reviewed: true,
  });
  return { error: error?.message ?? null };
}

export async function updateExpenseType(
  id: string,
  updates: {
    label: string;
    unit: 'km' | 'forfait';
    rateChf: number | null;
    active: boolean;
    certificateSubbox: CertificateSubbox | null;
    certificateSubboxArt: string | null;
  },
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('payroll_expense_types')
    .update({
      label: updates.label.trim(),
      unit: updates.unit,
      rate_chf: updates.rateChf,
      active: updates.active,
      certificate_subbox: updates.certificateSubbox,
      certificate_subbox_art: updates.certificateSubboxArt,
      certificate_subbox_reviewed: true,
    })
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
  certificateBox: CertificateBox | null = null,
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('payroll_deduction_types').insert({
    organization_id: organizationId,
    label: label.trim(),
    default_rate_percent: defaultRatePercent,
    sort_order: sortOrder,
    certificate_box: certificateBox,
    // Saved via the settings modal, which always shows the box chips
    // (including "Aucune") — this is an explicit, reviewed choice even
    // when it's left at "no box".
    certificate_box_reviewed: true,
  });
  return { error: error?.message ?? null };
}

export async function updateDeductionType(
  id: string,
  updates: { label: string; defaultRatePercent: number | null; active: boolean; certificateBox: CertificateBox | null },
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('payroll_deduction_types')
    .update({
      label: updates.label.trim(),
      default_rate_percent: updates.defaultRatePercent,
      active: updates.active,
      certificate_box: updates.certificateBox,
      certificate_box_reviewed: true,
    })
    .eq('id', id);
  return { error: error?.message ?? null };
}

export async function deleteDeductionType(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('payroll_deduction_types').delete().eq('id', id);
  return { error: error?.message ?? null };
}

// ==========================================================================
// Swiss social-insurance reference rates + the standard payroll catalog —
// "point 4" (barèmes officiels à jour) and "point 1" (cotisations
// standards préconfigurées) from the RH & Salaires roadmap. Every new
// organization gets the standard catalog automatically (DB trigger, see
// 20260911232000_standard_payroll_catalog.sql) — restoreStandardPayrollCatalog
// below is only for an org that predates that trigger or deleted its
// defaults.
// ==========================================================================

// Public reference table (no RLS restriction beyond "select using true") —
// falls back to the latest known year client-side too, same logic as the
// seeding function, in case the current year's row isn't in yet.
export async function getSwissSocialInsuranceRates(year: number = new Date().getFullYear()): Promise<SwissSocialInsuranceRates | null> {
  const { data: exact } = await supabase.from('swiss_social_insurance_rates').select('*').eq('year', year).maybeSingle();
  if (exact) return exact as SwissSocialInsuranceRates;
  const { data: latest } = await supabase.from('swiss_social_insurance_rates').select('*').order('year', { ascending: false }).limit(1).maybeSingle();
  return (latest as SwissSocialInsuranceRates) ?? null;
}

// Re-inserts the 6 standard deduction types + Kilométrage for an org
// missing some or all of them (idempotent server-side — see
// seed_standard_payroll_catalog, skips any label already present).
export async function restoreStandardPayrollCatalog(organizationId: string): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('rpc_seed_standard_payroll_catalog', { p_organization_id: organizationId });
  return { error: error?.message ?? null };
}

export interface StandardDeductionCatalogItem {
  key: string;
  label: string;
  defaultRatePercent: number | null;
  certificateBox: CertificateBox | null;
  hint: string;
}

// The extra, opt-in items beyond the base 6 every org already gets — each
// depends on the employer's own pension fund/canton/insurer, so unlike
// AVS/AC there's no single real percentage to preconfigure. Shown as
// checkboxes in the "Ajouter des cotisations suisses" picker with an
// editable rate, not silently auto-created for everyone.
export function buildOptionalDeductionCatalog(rates: SwissSocialInsuranceRates | null): StandardDeductionCatalogItem[] {
  return [
    {
      key: 'lpp',
      label: 'Cotisation LPP (2e pilier)',
      defaultRatePercent: null,
      certificateBox: 'box10_1',
      hint: rates
        ? `Dépend de votre caisse de pension et de l'âge de l'employé — reportez le taux depuis son certificat de prévoyance. Déduction de coordination ${rates.year} : CHF ${rates.lpp_coordination_deduction_chf.toLocaleString('fr-CH')}/an.`
        : "Dépend de votre caisse de pension et de l'âge de l'employé — reportez le taux depuis son certificat de prévoyance.",
    },
    {
      key: 'impot_source',
      label: 'Impôt à la source',
      defaultRatePercent: null,
      certificateBox: 'box12',
      hint: "Dépend du barème cantonal de l'employé — reportez le taux depuis le décompte de votre administration fiscale cantonale, ou utilisez un montant fixe par employé (Compte de l'employé → Cotisations).",
    },
    {
      key: 'ac_solidarite',
      label: 'Cotisation AC solidarité',
      defaultRatePercent: rates?.ac_solidarity_employee_percent ?? null,
      certificateBox: 'box9',
      hint: rates
        ? `Uniquement sur la part du salaire annuel dépassant CHF ${rates.ac_cap_chf.toLocaleString('fr-CH')} — rarissime en PME. N'ajoutez ceci que pour un employé dont le salaire dépasse ce seuil.`
        : "Uniquement sur la part du salaire annuel dépassant le plafond AC — rarissime en PME.",
    },
  ];
}

export interface StandardExpenseCatalogItem {
  key: string;
  label: string;
  unit: 'km' | 'forfait';
  rateChf: number | null;
  certificateSubbox: CertificateSubbox;
  hint: string;
}

// Kilométrage is already part of the automatic base catalog — these are
// the other common expense types an org can opt into from the same
// picker, each pre-mapped to its real case-13 sub-box.
export const OPTIONAL_EXPENSE_CATALOG: StandardExpenseCatalogItem[] = [
  {
    key: 'repas',
    label: 'Repas / représentation',
    unit: 'forfait',
    rateChf: null,
    certificateSubbox: '13_2_1',
    hint: 'Indemnité forfaitaire de représentation (repas d\'affaires, invitations) — case 13.2.1.',
  },
  {
    key: 'deplacement_justificatif',
    label: 'Frais de déplacement / logement (sur justificatifs)',
    unit: 'forfait',
    rateChf: null,
    certificateSubbox: '13_1_1',
    hint: 'Remboursement de frais réels sur présentation de justificatifs (billets, hôtel) — case 13.1.1.',
  },
  {
    key: 'formation',
    label: 'Formation continue',
    unit: 'forfait',
    rateChf: null,
    certificateSubbox: '13_3',
    hint: "Contribution de l'employeur au perfectionnement professionnel de l'employé — case 13.3.",
  },
];

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

// Accepts "8" -> 08:00, "8.5"/"8,5" -> 08:05, "830"/"1430" -> 08:30/14:30,
// "14:30" -> 14:30 — every shorthand someone would actually type while
// logging a start/end time without reaching for a picker.
export function parseFlexibleTime(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;
  if (/^\d{1,2}$/.test(s)) {
    const h = Number(s);
    if (h > 23) return null;
    return `${String(h).padStart(2, '0')}:00`;
  }
  const sepMatch = s.match(/^(\d{1,2})[.,](\d{1,2})$/);
  if (sepMatch) {
    const h = Number(sepMatch[1]);
    const m = Number(sepMatch[2].padStart(2, '0'));
    if (h > 23 || m > 59) return null;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }
  const colonMatch = s.match(/^(\d{1,2}):(\d{2})$/);
  if (colonMatch) {
    const h = Number(colonMatch[1]);
    const m = Number(colonMatch[2]);
    if (h > 23 || m > 59) return null;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }
  const compact = s.match(/^(\d{3,4})$/);
  if (compact) {
    const digits = compact[1].padStart(4, '0');
    const h = Number(digits.slice(0, 2));
    const m = Number(digits.slice(2));
    if (h > 23 || m > 59) return null;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }
  return null;
}

// Decimal hours between two "HH:MM" times, rolling over past midnight for an
// overnight shift (end earlier than start).
export function hoursFromRange(startTime: string, endTime: string): number {
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  let minutes = eh * 60 + em - (sh * 60 + sm);
  if (minutes < 0) minutes += 24 * 60;
  return Math.round((minutes / 60) * 100) / 100;
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

export async function getPayrollProfile(organizationId: string, ref: EmployeeRef): Promise<PayrollProfile | null> {
  const owner = ownerColumn(ref);
  const { data } = await supabase
    .from('payroll_profiles')
    .select('*')
    .eq('organization_id', organizationId)
    .eq(owner.column, owner.id)
    .maybeSingle();
  return data ?? null;
}

export async function upsertPayrollProfile(
  organizationId: string,
  ref: EmployeeRef,
  updates: Partial<
    Pick<
      PayrollProfile,
      'salary_type' | 'hourly_rate_chf' | 'monthly_salary_chf' | 'street' | 'postal_code' | 'locality' | 'notes' | 'avs_number' | 'birth_date'
    >
  >,
  updatedBy: string | undefined,
): Promise<{ error: string | null }> {
  const owner = ownerColumn(ref);
  const { error } = await supabase
    .from('payroll_profiles')
    .upsert(
      { organization_id: organizationId, [owner.column]: owner.id, ...updates, updated_by: updatedBy },
      { onConflict: 'organization_id,owner_key' },
    );
  return { error: error?.message ?? null };
}

export async function listProfileDeductions(organizationId: string, ref: EmployeeRef): Promise<PayrollProfileDeduction[]> {
  const owner = ownerColumn(ref);
  const { data } = await supabase
    .from('payroll_profile_deductions')
    .select('*')
    .eq('organization_id', organizationId)
    .eq(owner.column, owner.id);
  return data ?? [];
}

// One row per deduction type touched for this employee — enabled=false
// records an explicit opt-out (a deduction that doesn't apply to them,
// e.g. no LAAC), a custom rate/amount records an override. Deduction
// types never touched for this employee simply use their org default.
export async function upsertProfileDeduction(
  organizationId: string,
  ref: EmployeeRef,
  deductionTypeId: string,
  updates: { ratePercent: number | null; fixedAmountChf: number | null; enabled: boolean },
  updatedBy: string | undefined,
): Promise<{ error: string | null }> {
  const owner = ownerColumn(ref);
  const { error } = await supabase.from('payroll_profile_deductions').upsert(
    {
      organization_id: organizationId,
      [owner.column]: owner.id,
      deduction_type_id: deductionTypeId,
      rate_percent: updates.ratePercent,
      fixed_amount_chf: updates.fixedAmountChf,
      enabled: updates.enabled,
      updated_by: updatedBy,
    },
    { onConflict: 'organization_id,owner_key,deduction_type_id' },
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

export interface AnnualSalarySummary extends SalaryBreakdown {
  totalHours: number;
}

// On-screen preview for the "Récapitulatif annuel" — same per-month math as
// generate-salary-certificate-pdf (12 separate computeSalaryBreakdown calls,
// summed), so what's shown here always matches what the PDF export produces.
export async function getAnnualSalarySummary(
  organizationId: string,
  ref: EmployeeRef,
  year: number,
  profile: Pick<PayrollProfile, 'salary_type' | 'hourly_rate_chf' | 'monthly_salary_chf'>,
  deductionTypes: PayrollDeductionType[],
  overrides: PayrollProfileDeduction[],
): Promise<AnnualSalarySummary> {
  // Ghost employees never log hours (no app account to log them from) —
  // hourly salary_type is only meaningful for real users, so this simply
  // yields zero hours for a ghost rather than needing listTimeEntries to
  // understand ghost ids too.
  const isHourly = profile.salary_type === 'hourly' && !!ref.userId;
  const entries = isHourly ? await listTimeEntries(organizationId, ref.userId!, `${year}-01-01`, `${year}-12-31`) : [];

  let totalHours = 0;
  let gross = 0;
  const lineTotals = new Map<string, number>();

  for (let month = 0; month < 12; month++) {
    const monthHours = isHourly
      ? entries.filter((e) => new Date(`${e.entry_date}T00:00:00`).getMonth() === month).reduce((sum, e) => sum + Number(e.hours), 0)
      : 0;
    const monthGross = isHourly ? round2(monthHours * (profile.hourly_rate_chf ?? 0)) : (profile.monthly_salary_chf ?? 0);
    totalHours += monthHours;
    gross += monthGross;

    const breakdown = computeSalaryBreakdown(monthGross, deductionTypes, overrides);
    for (const l of breakdown.lines) {
      lineTotals.set(l.label, round2((lineTotals.get(l.label) ?? 0) + l.amount));
    }
  }

  totalHours = round2(totalHours);
  gross = round2(gross);
  const lines: DeductionLine[] = Array.from(lineTotals.entries()).map(([label, amount]) => ({ label, amount }));
  const totalDeductions = round2(lines.reduce((sum, l) => sum + l.amount, 0));
  return { totalHours, gross, lines, totalDeductions, net: round2(gross - totalDeductions) };
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
