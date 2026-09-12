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
      // No single percentage is preconfigured on purpose — genuinely no
      // one rate exists: the LPP employee share depends on the employee's
      // AGE (legal minimum bonification, art. 16 LPP: 7% du salaire
      // coordonné à 25-34 ans, 10% à 35-44, 15% à 45-54, 18% à 55-65 —
      // dont l'employeur paie au moins la moitié, donc part salarié dès
      // 3.5%/5%/7.5%/9% au minimum légal) AND on the pension fund's own
      // règlement, which is often above that legal floor. A single
      // org-wide default here would be actively wrong for at least some
      // employees — set the real rate per employee instead (fiche de
      // l'employé → Cotisations), this entry is only a starting point.
      key: 'lpp',
      label: 'Cotisation LPP (2e pilier)',
      defaultRatePercent: null,
      certificateBox: 'box10_1',
      hint: rates
        ? `Minimum légal (part salarié, moitié du taux ci-dessous) : 3.5% à 25-34 ans, 5% à 35-44, 7.5% à 45-54, 9% à 55-65 ans — dépend de l'âge, et votre caisse peut prévoir plus. Déduction de coordination ${rates.year} : CHF ${rates.lpp_coordination_deduction_chf.toLocaleString('fr-CH')}/an. Ajustez le taux par employé (fiche de l'employé → Cotisations).`
        : "Dépend de l'âge de l'employé et de votre caisse de pension — ajustez le taux par employé (fiche de l'employé → Cotisations).",
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
    const monthGross = computeMonthlyGross(profile.salary_type, profile.hourly_rate_chf, profile.monthly_salary_chf, monthHours);
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

// The one formula every gross computation in the app must agree on —
// previously duplicated inline in app/(app)/rh/[userId].tsx.
export function computeMonthlyGross(
  salaryType: 'hourly' | 'monthly',
  hourlyRateChf: number | null,
  monthlySalaryChf: number | null,
  totalHours: number,
): number {
  return salaryType === 'hourly' ? round2((hourlyRateChf ?? 0) * totalHours) : round2(monthlySalaryChf ?? 0);
}

// ==========================================================================
// Cahier des charges V2, Lot 4 §7.6 "Moteur de paie et snapshot" — persists
// what the RH payslip screen used to only ever compute live. See
// supabase/migrations/20260912170000-170100 for the schema and lifecycle
// functions this wraps. The calculation itself (computeMonthlyGross +
// computeSalaryBreakdown, both above) stays the single source of truth;
// these functions only add persistence and the brouillon -> calculée ->
// validée -> payée -> extournée lifecycle around it.
// ==========================================================================

export interface PayrollSlipSnapshot {
  deductionTypes: { id: string; label: string; defaultRatePercent: number | null }[];
  overrides: { deductionTypeId: string; ratePercent: number | null; fixedAmountChf: number | null; enabled: boolean }[];
  lines: DeductionLine[];
}

export interface PayrollSlip {
  id: string;
  runId: string;
  ownerKey: string;
  year: number;
  month: number;
  status: 'brouillon' | 'calculee' | 'validee' | 'payee' | 'extournee';
  salaryType: 'hourly' | 'monthly';
  hourlyRateChf: number | null;
  monthlySalaryChf: number | null;
  totalHours: number | null;
  gross: number;
  totalDeductions: number;
  net: number;
  employerCost: number | null;
  snapshot: PayrollSlipSnapshot;
  calculatedAt: string | null;
  validatedAt: string | null;
  paidAt: string | null;
  reversedSlipId: string | null;
}

function mapPayrollSlip(row: any): PayrollSlip {
  return {
    id: row.id,
    runId: row.run_id,
    ownerKey: row.owner_key,
    year: row.year,
    month: row.month,
    status: row.status,
    salaryType: row.salary_type,
    hourlyRateChf: row.hourly_rate_chf != null ? Number(row.hourly_rate_chf) : null,
    monthlySalaryChf: row.monthly_salary_chf != null ? Number(row.monthly_salary_chf) : null,
    totalHours: row.total_hours != null ? Number(row.total_hours) : null,
    gross: Number(row.gross_chf),
    totalDeductions: Number(row.total_deductions_chf),
    net: Number(row.net_chf),
    employerCost: row.employer_cost_chf != null ? Number(row.employer_cost_chf) : null,
    snapshot: row.snapshot,
    calculatedAt: row.calculated_at,
    validatedAt: row.validated_at,
    paidAt: row.paid_at,
    reversedSlipId: row.reversed_slip_id,
  };
}

export async function findOrCreatePayrollRun(organizationId: string, year: number, month: number): Promise<string> {
  const { data, error } = await supabase.rpc('find_or_create_payroll_run', { p_organization_id: organizationId, p_year: year, p_month: month });
  if (error) throw new Error(error.message);
  return data;
}

export async function listPayrollSlips(organizationId: string, year: number, month: number): Promise<PayrollSlip[]> {
  const { data } = await supabase
    .from('payroll_slips')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('year', year)
    .eq('month', month)
    .neq('status', 'extournee')
    .order('created_at');
  return (data ?? []).map(mapPayrollSlip);
}

// Fetches hours (if hourly) and computes gross/deductions/net exactly as
// the RH payslip preview does, then persists the result as one slip for
// this employee/period — this is the ONLY place that saves a payroll_slip,
// so both the ad-hoc RH preview and this saved snapshot are guaranteed to
// use the same numbers.
export async function calculateAndSavePayrollSlip(
  organizationId: string,
  ref: EmployeeRef,
  year: number,
  month: number,
  profile: Pick<PayrollProfile, 'salary_type' | 'hourly_rate_chf' | 'monthly_salary_chf'>,
  deductionTypes: PayrollDeductionType[],
  overrides: PayrollProfileDeduction[],
): Promise<{ id: string | null; error: string | null }> {
  const runId = await findOrCreatePayrollRun(organizationId, year, month);
  const isHourly = profile.salary_type === 'hourly' && !!ref.userId;
  const monthStart = `${year}-${String(month).padStart(2, '0')}-01`;
  // listTimeEntries's rangeEnd is inclusive (lte) — day 0 of the next
  // month is the last day of this one, not the first day after it.
  const monthEnd = new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10);
  const entries = isHourly ? await listTimeEntries(organizationId, ref.userId!, monthStart, monthEnd) : [];
  const totalHours = round2(entries.reduce((sum, e) => sum + Number(e.hours), 0));

  const gross = computeMonthlyGross(profile.salary_type, profile.hourly_rate_chf, profile.monthly_salary_chf, totalHours);
  const breakdown = computeSalaryBreakdown(gross, deductionTypes, overrides);

  const snapshot: PayrollSlipSnapshot = {
    deductionTypes: deductionTypes.map((d) => ({ id: d.id, label: d.label, defaultRatePercent: d.default_rate_percent })),
    overrides: overrides.map((o) => ({ deductionTypeId: o.deduction_type_id, ratePercent: o.rate_percent, fixedAmountChf: o.fixed_amount_chf, enabled: o.enabled })),
    lines: breakdown.lines,
  };

  try {
    const { data, error } = await supabase.rpc('upsert_payroll_slip', {
      p_run_id: runId,
      p_user_id: ref.userId ?? null,
      p_ghost_employee_id: ref.ghostEmployeeId ?? null,
      p_salary_type: profile.salary_type,
      p_hourly_rate_chf: profile.hourly_rate_chf,
      p_monthly_salary_chf: profile.monthly_salary_chf,
      p_total_hours: isHourly ? totalHours : null,
      p_gross_chf: breakdown.gross,
      p_total_deductions_chf: breakdown.totalDeductions,
      p_net_chf: breakdown.net,
      p_snapshot: snapshot,
    });
    if (error) return { id: null, error: error.message };
    return { id: data, error: null };
  } catch (err) {
    return { id: null, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function validatePayrollSlip(slipId: string): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('validate_payroll_slip', { p_slip_id: slipId });
  return { error: error?.message ?? null };
}

export async function markPayrollSlipPaid(slipId: string): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('mark_payroll_slip_paid', { p_slip_id: slipId });
  return { error: error?.message ?? null };
}

// Reopens a validated/payée slip for correction — marks it extournée and
// creates a fresh brouillon for the same employee/period (see the
// migration's comment: this is a narrow "undo and redo", not the full
// §7.7 retroactive-correction workflow).
export async function reversePayrollSlip(slipId: string): Promise<{ id: string | null; error: string | null }> {
  const { data, error } = await supabase.rpc('reverse_payroll_slip', { p_slip_id: slipId });
  return { id: data ?? null, error: error?.message ?? null };
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
