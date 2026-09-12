import { supabase } from '../supabase';
import type {
  CertificateBox,
  CertificateSubbox,
  PayrollAbsence,
  PayrollAbsenceStatus,
  PayrollAbsenceType,
  PayrollCorrection,
  PayrollDeductionType,
  PayrollExpense,
  PayrollExpenseType,
  PayrollGhostEmployee,
  PayrollProfile,
  PayrollProfileDeduction,
  PayrollProfileWageRate,
  PayrollSlipWageLine,
  PayrollTimeEntry,
  PayrollWageKind,
  PayrollWageMode,
  PayrollWageType,
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
  employerRatePercent: number | null = null,
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('payroll_deduction_types').insert({
    organization_id: organizationId,
    label: label.trim(),
    default_rate_percent: defaultRatePercent,
    employer_rate_percent: employerRatePercent,
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
  updates: { label: string; defaultRatePercent: number | null; active: boolean; certificateBox: CertificateBox | null; employerRatePercent?: number | null },
): Promise<{ error: string | null }> {
  const payload: Record<string, unknown> = {
    label: updates.label.trim(),
    default_rate_percent: updates.defaultRatePercent,
    active: updates.active,
    certificate_box: updates.certificateBox,
    certificate_box_reviewed: true,
  };
  if (updates.employerRatePercent !== undefined) payload.employer_rate_percent = updates.employerRatePercent;
  const { error } = await supabase.from('payroll_deduction_types').update(payload).eq('id', id);
  return { error: error?.message ?? null };
}

export async function deleteDeductionType(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('payroll_deduction_types').delete().eq('id', id);
  return { error: error?.message ?? null };
}

// ==========================================================================
// §7.1 "Rubriques de salaire" — earnings beyond base salary/hours: the
// wage-type catalog mirrors payroll_deduction_types exactly (see its own
// comment for the kind/mode split). Every org gets 13e salaire, heures
// supplémentaires, bonus/prime, avance sur salaire and régularisation
// rétroactive automatically; indemnité vacances is opt-in (see
// buildOptionalWageCatalog below), like LPP on the deduction side.
// ==========================================================================

export async function listWageTypes(organizationId: string): Promise<PayrollWageType[]> {
  const { data } = await supabase
    .from('payroll_wage_types')
    .select('*')
    .eq('organization_id', organizationId)
    .order('sort_order', { ascending: true });
  return data ?? [];
}

export async function createWageType(
  organizationId: string,
  label: string,
  kind: PayrollWageKind,
  mode: PayrollWageMode,
  defaultRatePercent: number | null,
  defaultFixedAmountChf: number | null,
  sortOrder: number,
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('payroll_wage_types').insert({
    organization_id: organizationId,
    label: label.trim(),
    kind,
    mode,
    default_rate_percent: defaultRatePercent,
    default_fixed_amount_chf: defaultFixedAmountChf,
    sort_order: sortOrder,
  });
  return { error: error?.message ?? null };
}

export async function updateWageType(
  id: string,
  updates: { label: string; defaultRatePercent: number | null; defaultFixedAmountChf: number | null; active: boolean },
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('payroll_wage_types')
    .update({
      label: updates.label.trim(),
      default_rate_percent: updates.defaultRatePercent,
      default_fixed_amount_chf: updates.defaultFixedAmountChf,
      active: updates.active,
    })
    .eq('id', id);
  return { error: error?.message ?? null };
}

export async function deleteWageType(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('payroll_wage_types').delete().eq('id', id);
  return { error: error?.message ?? null };
}

export interface StandardWageCatalogItem {
  key: string;
  label: string;
  kind: PayrollWageKind;
  defaultRatePercent: number | null;
  hint: string;
}

// Indemnité vacances : pour un salarié payé à l'heure sans jours de
// vacances fixes, le CO (art. 329d + jurisprudence du Tribunal fédéral)
// exige que la part vacances soit versée en supplément du salaire horaire
// ET indiquée séparément — jamais noyée silencieusement dans le taux
// horaire. Les deux pourcentages proposés sont les seuls valeurs
// légalement standard (4 semaines -> 8.33%, 5 semaines -> 10.64%) ; lequel
// s'applique dépend du droit aux vacances réel de l'employé (contrat/âge),
// donc aucun n'est présélectionné par défaut.
export function buildOptionalWageCatalog(): StandardWageCatalogItem[] {
  return [
    {
      key: 'indemnite_vacances',
      label: 'Indemnité vacances (salaire horaire)',
      kind: 'addition',
      defaultRatePercent: null,
      hint: "Pour un salaire horaire sans jours de vacances fixes : 8.33% pour 4 semaines de vacances (minimum légal adulte, art. 329a CO), 10.64% pour 5 semaines (minimum légal < 20 ans, ou accordé contractuellement). Doit figurer séparément sur le décompte de salaire — jamais inclus silencieusement dans le taux horaire.",
    },
  ];
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

// Same idempotent restore for the §7.1 wage-type catalog (13e salaire,
// heures sup, bonus, avance, régularisation rétroactive).
export async function restoreStandardWageTypes(organizationId: string): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('rpc_seed_standard_payroll_wage_types', { p_organization_id: organizationId });
  return { error: error?.message ?? null };
}

export interface StandardDeductionCatalogItem {
  key: string;
  label: string;
  defaultRatePercent: number | null;
  employerRatePercent: number | null;
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
      employerRatePercent: null,
      certificateBox: 'box10_1',
      hint: rates
        ? `Minimum légal (part salarié, moitié du taux ci-dessous) : 3.5% à 25-34 ans, 5% à 35-44, 7.5% à 45-54, 9% à 55-65 ans — dépend de l'âge, et votre caisse peut prévoir plus. Déduction de coordination ${rates.year} : CHF ${rates.lpp_coordination_deduction_chf.toLocaleString('fr-CH')}/an. Ajustez le taux par employé (fiche de l'employé → Cotisations). La part employeur (au moins égale à la part salarié, souvent plus) dépend du règlement de votre caisse — à définir ci-dessous.`
        : "Dépend de l'âge de l'employé et de votre caisse de pension — ajustez le taux par employé (fiche de l'employé → Cotisations).",
    },
    {
      key: 'impot_source',
      label: 'Impôt à la source',
      defaultRatePercent: null,
      employerRatePercent: null,
      certificateBox: 'box12',
      hint: "Dépend du barème cantonal de l'employé — reportez le taux depuis le décompte de votre administration fiscale cantonale, ou utilisez un montant fixe par employé (Compte de l'employé → Cotisations). Aucune part employeur : il ne s'agit que d'une retenue reversée au fisc.",
    },
    {
      key: 'ac_solidarite',
      label: 'Cotisation AC solidarité',
      defaultRatePercent: rates?.ac_solidarity_employee_percent ?? null,
      employerRatePercent: rates?.ac_solidarity_employee_percent ?? null,
      certificateBox: 'box9',
      hint: rates
        ? `Uniquement sur la part du salaire annuel dépassant CHF ${rates.ac_cap_chf.toLocaleString('fr-CH')} — rarissime en PME. N'ajoutez ceci que pour un employé dont le salaire dépasse ce seuil. Part employeur égale à la part salarié (paritaire, comme l'AC de base).`
        : "Uniquement sur la part du salaire annuel dépassant le plafond AC — rarissime en PME.",
    },
    {
      // Accident professionnel (LAA de base) : 100% à la charge de
      // l'employeur par la loi (art. 91 al. 1 LAA), jamais de part
      // salarié — le taux exact dépend de votre assureur et de la classe
      // de risque de votre branche, aucune valeur nationale unique
      // n'existe. Ne crée donc que la ligne, sans deviner de taux.
      key: 'aap',
      label: 'Cotisation AAP (accident professionnel)',
      defaultRatePercent: 0,
      employerRatePercent: null,
      certificateBox: null,
      hint: "100% à la charge de l'employeur par la loi (LAA) — aucune retenue sur le salaire. Le taux dépend de votre assureur-accidents et de la classe de risque de votre branche : reportez-le depuis votre police d'assurance.",
    },
    {
      // Allocations familiales : 100% employeur par la loi (LAFam) — la
      // ligne "Cotisation CAF" à charge salarié a été retirée du
      // catalogue de base (voir la migration payroll_v4_caf_legal_fix)
      // précisément parce qu'aucune base légale ne la justifiait. Elle ne
      // réapparaît ici que côté employeur, jamais côté salarié.
      key: 'caf_employeur',
      label: 'Cotisation CAF (charge employeur)',
      defaultRatePercent: 0,
      employerRatePercent: null,
      certificateBox: null,
      hint: "100% à la charge de l'employeur par la loi (LAFam) — aucune retenue sur le salaire. Le taux dépend de votre caisse de compensation cantonale : reportez-le depuis votre décompte de cotisations.",
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
      | 'salary_type'
      | 'hourly_rate_chf'
      | 'monthly_salary_chf'
      | 'street'
      | 'postal_code'
      | 'locality'
      | 'notes'
      | 'avs_number'
      | 'birth_date'
      | 'hire_date'
      | 'vacation_days_per_year'
      | 'weekly_contract_hours'
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
  updates: { ratePercent: number | null; fixedAmountChf: number | null; enabled: boolean; employerRatePercent?: number | null; employerFixedAmountChf?: number | null },
  updatedBy: string | undefined,
): Promise<{ error: string | null }> {
  const owner = ownerColumn(ref);
  // employerRatePercent/employerFixedAmountChf are only included in the
  // upsert payload when explicitly provided — upsert issues a real SQL
  // UPDATE SET for every key present in the body, so unconditionally
  // sending null here would silently wipe any employer-side override a
  // future caller (not built yet — see calculateEmployerCost's own
  // comment) had already set, every time this employee-side-only form saves.
  const payload: Record<string, unknown> = {
    organization_id: organizationId,
    [owner.column]: owner.id,
    deduction_type_id: deductionTypeId,
    rate_percent: updates.ratePercent,
    fixed_amount_chf: updates.fixedAmountChf,
    enabled: updates.enabled,
    updated_by: updatedBy,
  };
  if (updates.employerRatePercent !== undefined) payload.employer_rate_percent = updates.employerRatePercent;
  if (updates.employerFixedAmountChf !== undefined) payload.employer_fixed_amount_chf = updates.employerFixedAmountChf;
  const { error } = await supabase.from('payroll_profile_deductions').upsert(payload, { onConflict: 'organization_id,owner_key,deduction_type_id' });
  return { error: error?.message ?? null };
}

// Per-employee override of a recurring_rate wage type (e.g. this
// employee's real indemnité vacances %) — same "absent row = org default
// applies, enabled" rule as upsertProfileDeduction. Meaningless for a
// manual_entry wage type, but not prevented here, same restraint as the
// deduction side.
export async function listProfileWageRates(organizationId: string, ref: EmployeeRef): Promise<PayrollProfileWageRate[]> {
  const owner = ownerColumn(ref);
  const { data } = await supabase
    .from('payroll_profile_wage_rates')
    .select('*')
    .eq('organization_id', organizationId)
    .eq(owner.column, owner.id);
  return data ?? [];
}

export async function upsertProfileWageRate(
  organizationId: string,
  ref: EmployeeRef,
  wageTypeId: string,
  updates: { ratePercent: number | null; fixedAmountChf: number | null; enabled: boolean },
  updatedBy: string | undefined,
): Promise<{ error: string | null }> {
  const owner = ownerColumn(ref);
  const { error } = await supabase.from('payroll_profile_wage_rates').upsert(
    {
      organization_id: organizationId,
      [owner.column]: owner.id,
      wage_type_id: wageTypeId,
      rate_percent: updates.ratePercent,
      fixed_amount_chf: updates.fixedAmountChf,
      enabled: updates.enabled,
      updated_by: updatedBy,
    },
    { onConflict: 'organization_id,owner_key,wage_type_id' },
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

export interface EmployerCost {
  lines: DeductionLine[];
  total: number;
}

// §7.8 "Coût employeur" — same shape and same per-type enable/override
// logic as computeSalaryBreakdown, just reading the employer-side fields
// instead of the employee-side ones. A type with no employer rate/amount
// configured (the common case for LAAC/IJM/LPP/CAF until the organization
// sets its own real figure — see the schema migration's comment for why
// none of those get a guessed default) simply contributes nothing rather
// than being reported as zero cost, which would be misleading.
export function computeEmployerCost(
  gross: number,
  deductionTypes: PayrollDeductionType[],
  overrides: PayrollProfileDeduction[],
): EmployerCost {
  const overrideByType = new Map(overrides.map((o) => [o.deduction_type_id, o]));
  const lines: DeductionLine[] = [];

  for (const dt of deductionTypes) {
    if (!dt.active) continue;
    const override = overrideByType.get(dt.id);
    if (override && !override.enabled) continue;

    const ratePercent = override?.employer_rate_percent ?? dt.employer_rate_percent;
    const fixedAmount = override?.employer_fixed_amount_chf ?? dt.employer_fixed_amount_chf;
    if (ratePercent == null && fixedAmount == null) continue;
    const amount = fixedAmount != null ? fixedAmount : round2((gross * (ratePercent as number)) / 100);
    lines.push({ label: dt.label, amount });
  }

  return { lines, total: round2(lines.reduce((sum, l) => sum + l.amount, 0)) };
}

export interface WageAdditions {
  lines: DeductionLine[];
  total: number;
}

// §7.1 "Rubriques de salaire" — recurring_rate 'addition' wage types only
// (indemnité vacances): computed on the gross ALREADY including this
// period's manual addition lines (13e/heures sup/bonus), since Swiss
// vacation-pay case law treats it as a percentage of the total salary
// actually paid, bonuses included — but never on itself, to avoid
// circularity. Same per-type enable/override gating as computeSalaryBreakdown.
export function computeWageAdditions(
  grossBeforeRecurring: number,
  wageTypes: PayrollWageType[],
  overrides: PayrollProfileWageRate[],
): WageAdditions {
  const overrideByType = new Map(overrides.map((o) => [o.wage_type_id, o]));
  const lines: DeductionLine[] = [];

  for (const wt of wageTypes) {
    if (!wt.active || wt.mode !== 'recurring_rate' || wt.kind !== 'addition') continue;
    const override = overrideByType.get(wt.id);
    if (override && !override.enabled) continue;

    const ratePercent = override?.rate_percent ?? wt.default_rate_percent;
    const fixedAmount = override?.fixed_amount_chf ?? wt.default_fixed_amount_chf;
    if (ratePercent == null && fixedAmount == null) continue;
    const amount = fixedAmount != null ? fixedAmount : round2((grossBeforeRecurring * (ratePercent as number)) / 100);
    lines.push({ label: wt.label, amount });
  }

  return { lines, total: round2(lines.reduce((sum, l) => sum + l.amount, 0)) };
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
  deductionTypes: { id: string; label: string; defaultRatePercent: number | null; employerRatePercent: number | null }[];
  overrides: { deductionTypeId: string; ratePercent: number | null; fixedAmountChf: number | null; enabled: boolean }[];
  lines: DeductionLine[];
  employerLines: DeductionLine[];
  // §7.1 — wageAdditionLines are the recurring_rate additions computed
  // automatically (indemnité vacances); manualLines are this period's
  // one-off entries (13e, heures sup, bonus, avances, régularisations),
  // both kinds together, exactly as entered.
  wageAdditionLines: DeductionLine[];
  manualLines: { label: string; kind: PayrollWageKind; amount: number }[];
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
  wageAdditions: number;
  netAdjustments: number;
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
    wageAdditions: Number(row.wage_additions_chf ?? 0),
    netAdjustments: Number(row.net_adjustments_chf ?? 0),
    snapshot: row.snapshot,
    calculatedAt: row.calculated_at,
    validatedAt: row.validated_at,
    paidAt: row.paid_at,
    reversedSlipId: row.reversed_slip_id,
  };
}

// One-off manual wage lines for a specific employee's specific period
// (13e, heures sup, bonus, avance) — entered before calculating that
// period's slip. See payroll_slip_wage_lines_guard (schema migration) for
// why these become read-only once the period's slip is validée/payée.
export interface PayrollSlipWageLineWithType extends PayrollSlipWageLine {
  wage_type_label: string;
  wage_type_kind: PayrollWageKind;
}

export async function listSlipWageLines(
  organizationId: string,
  ref: EmployeeRef,
  year: number,
  month: number,
): Promise<PayrollSlipWageLineWithType[]> {
  const owner = ownerColumn(ref);
  const { data } = await supabase
    .from('payroll_slip_wage_lines')
    .select('*, payroll_wage_types(label, kind)')
    .eq('organization_id', organizationId)
    .eq(owner.column, owner.id)
    .eq('year', year)
    .eq('month', month)
    .order('created_at', { ascending: true });
  return (data ?? []).map((r: any) => ({
    ...r,
    wage_type_label: r.payroll_wage_types?.label ?? '',
    wage_type_kind: r.payroll_wage_types?.kind ?? 'addition',
  }));
}

export async function addSlipWageLine(params: {
  organizationId: string;
  ref: EmployeeRef;
  year: number;
  month: number;
  wageTypeId: string;
  amountChf: number;
  note: string;
  createdBy: string | undefined;
}): Promise<{ error: string | null }> {
  const owner = ownerColumn(params.ref);
  const { error } = await supabase.from('payroll_slip_wage_lines').insert({
    organization_id: params.organizationId,
    [owner.column]: owner.id,
    year: params.year,
    month: params.month,
    wage_type_id: params.wageTypeId,
    amount_chf: params.amountChf,
    note: params.note.trim() || null,
    created_by: params.createdBy,
  });
  return { error: error?.message ?? null };
}

export async function deleteSlipWageLine(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('payroll_slip_wage_lines').delete().eq('id', id);
  return { error: error?.message ?? null };
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
// Pure calculation — no I/O, no persistence — shared by
// calculateAndSavePayrollSlip and the §7.7 retroactive-correction
// simulation below, so both are guaranteed to compute a period exactly
// the same way.
export interface PayrollPeriodCalculation {
  totalHours: number;
  baseGross: number;
  totalGross: number;
  wageAdditions: WageAdditions;
  manualAdditionsTotal: number;
  netAdjustmentsTotal: number;
  breakdown: SalaryBreakdown;
  employerCost: EmployerCost;
  finalNet: number;
  manualLines: { label: string; kind: PayrollWageKind; amount: number }[];
}

export function computePayrollPeriod(
  profile: Pick<PayrollProfile, 'salary_type' | 'hourly_rate_chf' | 'monthly_salary_chf'>,
  totalHours: number,
  deductionTypes: PayrollDeductionType[],
  deductionOverrides: PayrollProfileDeduction[],
  wageTypes: PayrollWageType[],
  wageRateOverrides: PayrollProfileWageRate[],
  manualLines: PayrollSlipWageLineWithType[],
): PayrollPeriodCalculation {
  const baseGross = computeMonthlyGross(profile.salary_type, profile.hourly_rate_chf, profile.monthly_salary_chf, totalHours);

  const manualAdditionsTotal = round2(
    manualLines.filter((l) => l.wage_type_kind === 'addition').reduce((sum, l) => sum + Number(l.amount_chf), 0),
  );
  const netAdjustmentsTotal = round2(
    manualLines.filter((l) => l.wage_type_kind === 'net_adjustment').reduce((sum, l) => sum + Number(l.amount_chf), 0),
  );

  const grossBeforeRecurring = round2(baseGross + manualAdditionsTotal);
  const wageAdditions = computeWageAdditions(grossBeforeRecurring, wageTypes, wageRateOverrides);
  const totalGross = round2(grossBeforeRecurring + wageAdditions.total);

  const breakdown = computeSalaryBreakdown(totalGross, deductionTypes, deductionOverrides);
  const employerCost = computeEmployerCost(totalGross, deductionTypes, deductionOverrides);
  const finalNet = round2(breakdown.net + netAdjustmentsTotal);

  return {
    totalHours,
    baseGross,
    totalGross,
    wageAdditions,
    manualAdditionsTotal,
    netAdjustmentsTotal,
    breakdown,
    employerCost,
    finalNet,
    manualLines: manualLines.map((l) => ({ label: l.wage_type_label, kind: l.wage_type_kind, amount: Number(l.amount_chf) })),
  };
}

async function totalHoursForPeriod(organizationId: string, ref: EmployeeRef, salaryType: 'hourly' | 'monthly', year: number, month: number): Promise<number> {
  const isHourly = salaryType === 'hourly' && !!ref.userId;
  if (!isHourly) return 0;
  const monthStart = `${year}-${String(month).padStart(2, '0')}-01`;
  // listTimeEntries's rangeEnd is inclusive (lte) — day 0 of the next
  // month is the last day of this one, not the first day after it.
  const monthEnd = new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10);
  const entries = await listTimeEntries(organizationId, ref.userId!, monthStart, monthEnd);
  return round2(entries.reduce((sum, e) => sum + Number(e.hours), 0));
}

// Fetches hours (if hourly) and this period's manual wage lines, computes
// gross/deductions/net exactly as the RH payslip preview does, then
// persists the result as one slip for this employee/period — this is the
// ONLY place that saves a payroll_slip, so both the ad-hoc RH preview and
// this saved snapshot are guaranteed to use the same numbers.
export async function calculateAndSavePayrollSlip(
  organizationId: string,
  ref: EmployeeRef,
  year: number,
  month: number,
  profile: Pick<PayrollProfile, 'salary_type' | 'hourly_rate_chf' | 'monthly_salary_chf'>,
  deductionTypes: PayrollDeductionType[],
  overrides: PayrollProfileDeduction[],
  wageTypes: PayrollWageType[] = [],
  wageRateOverrides: PayrollProfileWageRate[] = [],
): Promise<{ id: string | null; error: string | null }> {
  const runId = await findOrCreatePayrollRun(organizationId, year, month);
  const isHourly = profile.salary_type === 'hourly' && !!ref.userId;
  const totalHours = await totalHoursForPeriod(organizationId, ref, profile.salary_type, year, month);
  const manualLines = await listSlipWageLines(organizationId, ref, year, month);

  const calc = computePayrollPeriod(profile, totalHours, deductionTypes, overrides, wageTypes, wageRateOverrides, manualLines);

  const snapshot: PayrollSlipSnapshot = {
    deductionTypes: deductionTypes.map((d) => ({ id: d.id, label: d.label, defaultRatePercent: d.default_rate_percent, employerRatePercent: d.employer_rate_percent })),
    overrides: overrides.map((o) => ({ deductionTypeId: o.deduction_type_id, ratePercent: o.rate_percent, fixedAmountChf: o.fixed_amount_chf, enabled: o.enabled })),
    lines: calc.breakdown.lines,
    employerLines: calc.employerCost.lines,
    wageAdditionLines: calc.wageAdditions.lines,
    manualLines: calc.manualLines,
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
      p_gross_chf: calc.totalGross,
      p_total_deductions_chf: calc.breakdown.totalDeductions,
      p_net_chf: calc.finalNet,
      p_snapshot: snapshot,
      p_employer_cost_chf: calc.employerCost.total,
      p_wage_additions_chf: round2(calc.totalGross - calc.baseGross),
      p_net_adjustments_chf: calc.netAdjustmentsTotal,
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

// §7.9 "Déclarations préparatoires" — every non-extournée slip for the
// whole year, across every employee, used to build the annual social
// insurance summary. Includes brouillon/calculée slips too (not just
// validée/payée) so the summary reflects what's on the books even for a
// period nobody has finalized yet — the screen labels each row's status
// so a manager knows which figures are still provisional.
export async function listPayrollSlipsForYear(organizationId: string, year: number): Promise<PayrollSlip[]> {
  const { data } = await supabase
    .from('payroll_slips')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('year', year)
    .neq('status', 'extournee')
    .order('month');
  return (data ?? []).map(mapPayrollSlip);
}

export async function getPayrollSlip(organizationId: string, ref: EmployeeRef, year: number, month: number): Promise<PayrollSlip | null> {
  const owner = ownerColumn(ref);
  const { data } = await supabase
    .from('payroll_slips')
    .select('*')
    .eq('organization_id', organizationId)
    .eq(owner.column, owner.id)
    .eq('year', year)
    .eq('month', month)
    .neq('status', 'extournee')
    .maybeSingle();
  return data ? mapPayrollSlip(data) : null;
}

// ==========================================================================
// Cahier des charges V2, Lot 4 §7.7 "Correction rétroactive" — simulate a
// past, already-validée/payée period with today's catalog/profile/hours,
// diff it against what was actually paid, and post the difference into a
// currently open period. See the schema migration's own comment for why
// only the net difference (a single lump-sum "régularisation" line) is
// posted, never a silent rewrite of the closed period.
// ==========================================================================

export async function simulatePayrollPeriod(
  organizationId: string,
  ref: EmployeeRef,
  year: number,
  month: number,
  profile: Pick<PayrollProfile, 'salary_type' | 'hourly_rate_chf' | 'monthly_salary_chf'>,
  deductionTypes: PayrollDeductionType[],
  overrides: PayrollProfileDeduction[],
  wageTypes: PayrollWageType[],
  wageRateOverrides: PayrollProfileWageRate[],
): Promise<PayrollPeriodCalculation> {
  const totalHours = await totalHoursForPeriod(organizationId, ref, profile.salary_type, year, month);
  const manualLines = await listSlipWageLines(organizationId, ref, year, month);
  return computePayrollPeriod(profile, totalHours, deductionTypes, overrides, wageTypes, wageRateOverrides, manualLines);
}

export interface PayrollCorrectionDiff {
  grossOld: number;
  grossNew: number;
  totalDeductionsOld: number;
  totalDeductionsNew: number;
  netOld: number;
  netNew: number;
  employerCostOld: number | null;
  employerCostNew: number;
}

export interface PayrollCorrectionPreview {
  netDiff: number;
  diff: PayrollCorrectionDiff;
}

// Nothing here is persisted — a pure comparison the UI shows before the
// payroll manager decides to apply it.
export function buildPayrollCorrectionPreview(original: PayrollSlip, recalculated: PayrollPeriodCalculation): PayrollCorrectionPreview {
  return {
    netDiff: round2(recalculated.finalNet - original.net),
    diff: {
      grossOld: original.gross,
      grossNew: recalculated.totalGross,
      totalDeductionsOld: original.totalDeductions,
      totalDeductionsNew: recalculated.breakdown.totalDeductions,
      netOld: original.net,
      netNew: recalculated.finalNet,
      employerCostOld: original.employerCost,
      employerCostNew: recalculated.employerCost.total,
    },
  };
}

export async function applyPayrollCorrection(
  organizationId: string,
  ref: EmployeeRef,
  sourceSlip: PayrollSlip,
  preview: PayrollCorrectionPreview,
  targetYear: number,
  targetMonth: number,
): Promise<{ id: string | null; error: string | null }> {
  const note = `Régularisation ${String(sourceSlip.month).padStart(2, '0')}.${sourceSlip.year}`;
  const { data, error } = await supabase.rpc('apply_payroll_correction', {
    p_organization_id: organizationId,
    p_user_id: ref.userId ?? null,
    p_ghost_employee_id: ref.ghostEmployeeId ?? null,
    p_source_slip_id: sourceSlip.id,
    p_target_year: targetYear,
    p_target_month: targetMonth,
    p_net_diff_chf: preview.netDiff,
    p_diff: preview.diff,
    p_note: note,
  });
  return { id: data ?? null, error: error?.message ?? null };
}

export async function listPayrollCorrections(organizationId: string, ref?: EmployeeRef): Promise<PayrollCorrection[]> {
  let query = supabase.from('payroll_corrections').select('*').eq('organization_id', organizationId);
  if (ref) {
    const owner = ownerColumn(ref);
    query = query.eq(owner.column, owner.id);
  }
  const { data } = await query.order('applied_at', { ascending: false });
  return data ?? [];
}

// ==========================================================================
// Cahier des charges V2, Lot 4 §7.4 "Absences" + §7.5 "Soldes horaires" —
// self-service leave requests (see the schema migration for the
// request/approve RLS split) and the two balances they feed: solde de
// vacances (every organization) and solde d'heures (only when
// weekly_contract_hours is set on the employee's profile).
// ==========================================================================

export async function listAbsences(organizationId: string, ref?: EmployeeRef): Promise<PayrollAbsence[]> {
  let query = supabase.from('payroll_absences').select('*').eq('organization_id', organizationId);
  if (ref) {
    const owner = ownerColumn(ref);
    query = query.eq(owner.column, owner.id);
  }
  const { data } = await query.order('start_date', { ascending: false });
  return data ?? [];
}

export async function createAbsence(params: {
  organizationId: string;
  ref: EmployeeRef;
  absenceType: PayrollAbsenceType;
  startDate: string;
  endDate: string;
  days: number;
  paid: boolean;
  note: string;
  status: PayrollAbsenceStatus;
  createdBy: string | undefined;
}): Promise<{ error: string | null }> {
  const owner = ownerColumn(params.ref);
  const payload: Record<string, unknown> = {
    organization_id: params.organizationId,
    [owner.column]: owner.id,
    absence_type: params.absenceType,
    start_date: params.startDate,
    end_date: params.endDate,
    days: params.days,
    paid: params.paid,
    note: params.note.trim() || null,
    status: params.status,
    created_by: params.createdBy,
  };
  if (params.status !== 'demandee') {
    payload.validated_by = params.createdBy;
    payload.validated_at = new Date().toISOString();
  }
  const { error } = await supabase.from('payroll_absences').insert(payload);
  return { error: error?.message ?? null };
}

export async function updateAbsenceStatus(
  id: string,
  status: PayrollAbsenceStatus,
  validatedBy: string | undefined,
): Promise<{ error: string | null }> {
  const payload: Record<string, unknown> = { status };
  if (status !== 'demandee') {
    payload.validated_by = validatedBy;
    payload.validated_at = new Date().toISOString();
  }
  const { error } = await supabase.from('payroll_absences').update(payload).eq('id', id);
  return { error: error?.message ?? null };
}

export async function deleteAbsence(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('payroll_absences').delete().eq('id', id);
  return { error: error?.message ?? null };
}

export interface VacationBalance {
  entitlementDays: number;
  takenDays: number;
  remainingDays: number;
}

// Art. 329a CO minimum : 5 semaines (25 jours) pour les employés de moins
// de 20 ans au 31 décembre de l'année de référence, 4 semaines (20 jours)
// pour les adultes — un contrat peut accorder davantage, jamais moins.
// Une SUGGESTION pré-remplie côté client uniquement (fiche employé) :
// jamais écrite automatiquement en base, l'organisation confirme ou
// ajuste toujours elle-même avant que vacation_days_per_year existe.
export function suggestVacationDaysPerYear(birthDate: string | null, referenceYear: number): number {
  if (!birthDate) return 20;
  const age = referenceYear - new Date(`${birthDate}T00:00:00`).getUTCFullYear();
  return age < 20 ? 25 : 20;
}

// Prorata simple par mois d'entrée dans l'année de référence — un départ
// en cours d'année n'est PAS proraté ici (le solde final au départ est un
// calcul de décompte de sortie distinct, hors périmètre de cet écran).
export function computeVacationBalance(
  vacationDaysPerYear: number | null,
  hireDate: string | null,
  year: number,
  absences: PayrollAbsence[],
): VacationBalance {
  const entitlementFull = vacationDaysPerYear ?? 0;
  let monthsEmployed = 12;
  if (hireDate) {
    const hire = new Date(`${hireDate}T00:00:00`);
    if (hire.getUTCFullYear() === year) monthsEmployed = 12 - hire.getUTCMonth();
    else if (hire.getUTCFullYear() > year) monthsEmployed = 0;
  }
  const entitlementDays = round2((entitlementFull * monthsEmployed) / 12);
  const takenDays = round2(
    absences
      .filter((a) => a.absence_type === 'vacances' && a.status === 'validee' && new Date(`${a.start_date}T00:00:00`).getUTCFullYear() === year)
      .reduce((sum, a) => sum + Number(a.days), 0),
  );
  return { entitlementDays, takenDays, remainingDays: round2(entitlementDays - takenDays) };
}

export interface HoursBalance {
  expectedHours: number;
  loggedHours: number;
  balanceHours: number;
}

export function countBusinessDays(rangeStart: string, rangeEnd: string): number {
  let count = 0;
  const cur = new Date(`${rangeStart}T00:00:00Z`);
  const end = new Date(`${rangeEnd}T00:00:00Z`);
  while (cur.getTime() <= end.getTime()) {
    const day = cur.getUTCDay();
    if (day !== 0 && day !== 6) count++;
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return count;
}

// Solde d'heures : suppose une semaine contractuelle de 5 jours ouvrables
// (lundi-vendredi) — l'immense majorité des contrats mensualisés — pour
// répartir weekly_contract_hours en heures attendues par jour ouvré sur
// la période. Retourne null tant que weekly_contract_hours n'est pas
// renseigné plutôt que de deviner un 40h/semaine par défaut, qui serait
// faux pour un temps partiel.
export async function computeHoursBalance(
  organizationId: string,
  ref: EmployeeRef,
  weeklyContractHours: number | null,
  rangeStart: string,
  rangeEnd: string,
): Promise<HoursBalance | null> {
  if (weeklyContractHours == null || !ref.userId) return null;
  const entries = await listTimeEntries(organizationId, ref.userId, rangeStart, rangeEnd);
  const loggedHours = round2(entries.reduce((sum, e) => sum + Number(e.hours), 0));
  const businessDays = countBusinessDays(rangeStart, rangeEnd);
  const expectedHours = round2((weeklyContractHours / 5) * businessDays);
  return { expectedHours, loggedHours, balanceHours: round2(loggedHours - expectedHours) };
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
