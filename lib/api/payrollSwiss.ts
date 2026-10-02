import { supabase } from '../supabase';
import { cantonForNpa } from '../payroll/npaCanton.ts';
import { computeSwissPayroll, whtCantonFor, type SwissOverrides, type SwissPayroll, type SwissSituation } from '../payroll/swissEngine.ts';
import { isSubjectToWht, whtCode, type Canton, type WhtSteps } from '../payroll/swissReferences.ts';
import type { PayrollProfile } from '../types';

// The bridge between an employee's payroll profile and the Swiss engine
// (lib/payroll/swissEngine.ts): situation, withholding tax scale, and what
// is still missing before a first payslip.

export function situationFromProfile(profile: Partial<PayrollProfile>, companyPostalCode: string | null | undefined): SwissSituation {
  const workCanton = cantonForNpa(companyPostalCode) ?? 'GE';
  const residenceCountry = profile.residence_country ?? 'CH';
  return {
    birthDate: profile.birth_date ?? null,
    permit: profile.permit ?? 'swiss',
    maritalStatus: profile.marital_status ?? 'single',
    spouseIsSwissOrC: !!profile.spouse_is_swiss_or_c,
    spouseWorks: !!profile.spouse_works,
    livesWithChildren: !!profile.lives_with_children,
    childrenUnder16: profile.children_under_16 ?? 0,
    childrenInTraining: profile.children_in_training ?? 0,
    church: !!profile.church_tax,
    residenceCountry,
    residenceCanton: residenceCountry === 'CH' ? cantonForNpa(profile.postal_code) : null,
    workCanton,
    lppInsured: profile.lpp_insured ?? true,
    receivesFamilyAllowances: profile.receives_family_allowances ?? true,
  };
}

export function overridesFromProfile(profile: Partial<PayrollProfile>): SwissOverrides {
  const o = (profile.payroll_overrides ?? {}) as Record<string, unknown>;
  const num = (k: string) => (typeof o[k] === 'number' ? (o[k] as number) : null);
  return {
    aanpPercent: num('aanpPercent'),
    aapPercent: num('aapPercent'),
    ijmEmployeePercent: num('ijmEmployeePercent'),
    ijmEmployerPercent: num('ijmEmployerPercent'),
    lppTotalPercent: num('lppTotalPercent'),
    lppYoungPercent: num('lppYoungPercent'),
    lppEmployerSharePercent: num('lppEmployerSharePercent'),
    cafEmployerPercent: num('cafEmployerPercent'),
    whtSubject: typeof o.whtSubject === 'boolean' ? (o.whtSubject as boolean) : null,
    whtCode: typeof o.whtCode === 'string' && o.whtCode ? (o.whtCode as string) : null,
    whtRatePercent: num('whtRatePercent'),
  };
}

// The official ESTV scale for this canton / code, or null when it isn't
// imported (the engine then flags it instead of guessing a rate).
const stepsCache = new Map<string, WhtSteps | null>();
export async function getWhtSteps(year: number, canton: Canton | null, code: string | null): Promise<WhtSteps | null> {
  if (!canton || !code) return null;
  const key = `${year}:${canton}:${code}`;
  if (stepsCache.has(key)) return stepsCache.get(key)!;
  const { data, error } = await supabase.from('swiss_wht_tariffs').select('steps').eq('year', year).eq('canton', canton).eq('code', code).maybeSingle();
  const steps = !error && data ? (data.steps as WhtSteps) : null;
  stepsCache.set(key, steps);
  return steps;
}

// Everything the engine needs, fetched: the month's charges for this
// employee at this gross salary.
export async function computeForProfile(
  profile: Partial<PayrollProfile>,
  companyPostalCode: string | null | undefined,
  monthlyGross: number,
  year: number,
): Promise<SwissPayroll> {
  const situation = situationFromProfile(profile, companyPostalCode);
  const overrides = overridesFromProfile(profile);
  const subject = overrides.whtSubject ?? isSubjectToWht({ ...situation, children: situation.childrenUnder16 + situation.childrenInTraining }, situation.workCanton).subject;
  const code = subject ? overrides.whtCode ?? whtCode({ ...situation, children: situation.childrenUnder16 + situation.childrenInTraining }) : null;
  const steps = subject && overrides.whtRatePercent == null ? await getWhtSteps(year, whtCantonFor(situation), code) : null;
  return computeSwissPayroll(situation, monthlyGross, year, { overrides, whtSteps: steps });
}

export interface MissingItem {
  key: 'situation' | 'birth_date' | 'address' | 'avs_number' | 'iban' | 'salary' | 'email';
  label: string;
}

// What the employer still has to fill in before generating a first
// payslip. The employer fills everything in (the employee isn't asked).
export function missingForPayslip(profile: Partial<PayrollProfile> | null): MissingItem[] {
  const out: MissingItem[] = [];
  if (!profile) {
    return [
      { key: 'situation', label: 'Situation (nationalité, état civil, enfants)' },
      { key: 'birth_date', label: 'Date de naissance' },
      { key: 'address', label: 'Adresse (NPA et localité)' },
      { key: 'avs_number', label: 'Numéro AVS' },
      { key: 'iban', label: 'IBAN pour le versement' },
      { key: 'salary', label: 'Salaire' },
    ];
  }
  // Only once the situation columns exist (migration 20261001100000): before
  // that, nothing could be saved and the first payslip mustn't be blocked.
  if ('permit' in profile && (!profile.permit || !profile.marital_status)) out.push({ key: 'situation', label: 'Situation (nationalité, état civil, enfants)' });
  if (!profile.birth_date) out.push({ key: 'birth_date', label: 'Date de naissance' });
  if (!profile.postal_code || !profile.locality) out.push({ key: 'address', label: 'Adresse (NPA et localité)' });
  if (!profile.avs_number) out.push({ key: 'avs_number', label: 'Numéro AVS' });
  if (!profile.iban) out.push({ key: 'iban', label: 'IBAN pour le versement' });
  const salary = profile.salary_type === 'hourly' ? profile.hourly_rate_chf : profile.monthly_salary_chf;
  if (!salary) out.push({ key: 'salary', label: 'Salaire' });
  return out;
}

// Engine input for generating a payslip (lib/api/payroll.ts
// computePayrollPeriod), or undefined when the employee's situation isn't
// filled in yet (the org's catalog rates then apply, as before).
export async function swissPeriodInputFor(
  profile: Partial<PayrollProfile>,
  companyPostalCode: string | null | undefined,
  year: number,
): Promise<{ situation: SwissSituation; overrides: SwissOverrides; whtSteps: WhtSteps | null; year: number } | undefined> {
  if (!profile.swiss_auto) return undefined;
  const situation = situationFromProfile(profile, companyPostalCode);
  const overrides = overridesFromProfile(profile);
  const whtInput = { ...situation, children: situation.childrenUnder16 + situation.childrenInTraining };
  const subject = overrides.whtSubject ?? isSubjectToWht(whtInput, situation.workCanton).subject;
  const code = subject ? overrides.whtCode ?? whtCode(whtInput) : null;
  const whtSteps = subject && overrides.whtRatePercent == null ? await getWhtSteps(year, whtCantonFor(situation), code) : null;
  return { situation, overrides, whtSteps, year };
}
