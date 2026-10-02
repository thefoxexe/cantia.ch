import {
  DEFAULT_LAA,
  FAMILY_ALLOWANCES,
  isSubjectToWht,
  lppCreditPercent,
  monthlyFamilyAllowance,
  socialRatesFor,
  whtCode,
  whtRate,
  type Canton,
  type MaritalStatus,
  type Permit,
  type WhtSteps,
} from './swissReferences.ts';

// One month of Swiss payroll from the employee's situation: what the law
// sets (AVS/AI/APG, AC up to its ceiling, LPP by age on the coordinated
// salary), what the company's policies set (LAA, IJM, family allowance
// fund), withholding tax from the official scale, family allowances. Pure:
// the caller passes the withholding tax steps (public.swiss_wht_tariffs).
//
// Every rate can be overridden (the "avancé" settings) — an override always
// wins over the computed value.

export interface SwissSituation {
  birthDate: string | null; // YYYY-MM-DD
  permit: Permit;
  maritalStatus: MaritalStatus;
  spouseIsSwissOrC: boolean;
  spouseWorks: boolean;
  livesWithChildren: boolean;
  childrenUnder16: number;
  childrenInTraining: number;
  church: boolean;
  residenceCountry: 'CH' | 'FR' | 'DE' | 'IT' | 'AT' | 'other';
  residenceCanton: Canton | null; // from the NPA, residents only
  workCanton: Canton; // the company's canton
  lppInsured: boolean;
  receivesFamilyAllowances: boolean;
}

export interface SwissOverrides {
  aanpPercent?: number | null;
  aapPercent?: number | null;
  ijmEmployeePercent?: number | null;
  ijmEmployerPercent?: number | null;
  lppTotalPercent?: number | null; // the fund's own total rate from 25 (replaces the legal minimum credit)
  // Many funds (often « surobligatoire » plans) already insure from 18:
  // risk (death / disability) and sometimes savings. No legal rate, so
  // only applied when the employer enters the fund's rate for 18-24.
  lppYoungPercent?: number | null;
  // Employer's share of the total LPP contribution, at least 50 % (art. 66 LPP).
  lppEmployerSharePercent?: number | null;
  cafEmployerPercent?: number | null;
  whtSubject?: boolean | null;
  whtCode?: string | null;
  whtRatePercent?: number | null;
}

export interface PayLine {
  key: string;
  label: string;
  ratePercent: number | null;
  base: number;
  amount: number;
  note?: string;
}

export interface WhtInfo {
  subject: boolean;
  reason: string;
  canton: Canton | null;
  code: string | null;
  ratePercent: number;
  // The scale for this canton / code isn't imported: the rate is 0 until it is.
  missingScale: boolean;
}

export interface SwissPayroll {
  year: number;
  gross: number;
  employee: PayLine[];
  employer: PayLine[];
  familyAllowance: number;
  totalDeductions: number;
  net: number; // gross − deductions + family allowances
  totalEmployer: number;
  totalCost: number; // gross + employer charges
  age: number | null;
  lpp: { creditPercent: number; employerSharePercent: number; coordinatedMonthly: number; applies: boolean; reason: string };
  wht: WhtInfo;
}

const r2 = (n: number) => Math.round(n * 100) / 100;
// Swiss payslips round each line to 5 centimes.
const r05 = (n: number) => Math.round(n * 20) / 20;

export function ageInYear(birthDate: string | null, year: number): number | null {
  if (!birthDate || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) return null;
  return year - Number(birthDate.slice(0, 4));
}

export function whtCantonFor(s: SwissSituation): Canton | null {
  // Residents are taxed by their canton of residence; people living
  // abroad by the canton where they work.
  return s.residenceCountry === 'CH' ? s.residenceCanton ?? s.workCanton : s.workCanton;
}

export function computeSwissPayroll(
  s: SwissSituation,
  monthlyGross: number,
  year: number,
  opts: { overrides?: SwissOverrides; whtSteps?: WhtSteps | null } = {},
): SwissPayroll {
  const o = opts.overrides ?? {};
  const rates = socialRatesFor(year);
  const gross = r2(Math.max(0, monthlyGross));
  const employee: PayLine[] = [];
  const employer: PayLine[] = [];
  const age = ageInYear(s.birthDate, year);

  // AVS / AI / APG: on the whole salary, same share for both.
  employee.push(line('avs', 'AVS / AI / APG', rates.avsAiApgPercent, gross));
  employer.push(line('avs', 'AVS / AI / APG', rates.avsAiApgPercent, gross));

  // AC: up to the monthly ceiling. (No contribution above it since 2023.)
  const acBase = Math.min(gross, rates.acCeilingChf / 12);
  employee.push(line('ac', 'AC (chômage)', rates.acPercent, acBase));
  employer.push(line('ac', 'AC (chômage)', rates.acPercent, acBase));

  // LPP: legal minimum savings credit by age, on the coordinated salary,
  // half each. Below the entry threshold or before 25: nothing to save.
  const annual = gross * 12;
  let lppApplies = s.lppInsured;
  let lppReason = 'Assuré LPP';
  if (!s.lppInsured) lppReason = 'Non assuré LPP';
  else if (annual < rates.lppEntryThresholdChf) {
    lppApplies = false;
    lppReason = `Salaire annuel sous le seuil d’entrée (CHF ${rates.lppEntryThresholdChf.toLocaleString('fr-CH')})`;
  } else if (age !== null && age < 18) {
    lppApplies = false;
    lppReason = 'Moins de 18 ans : pas de LPP';
  } else if (age !== null && age < 25 && o.lppYoungPercent == null) {
    lppApplies = false;
    lppReason = 'De 18 à 24 ans, la loi n’impose pas d’épargne : indiquez le taux de votre caisse si elle assure dès 18 ans';
  }
  const young = age !== null && age < 25;
  const creditPercent = young ? o.lppYoungPercent ?? 0 : o.lppTotalPercent ?? (age === null ? 7 : lppCreditPercent(age));
  // Employer pays at least half (art. 66 LPP); more if the plan says so.
  const employerShare = Math.min(100, Math.max(50, o.lppEmployerSharePercent ?? 50)) / 100;
  const coordinatedAnnual = lppApplies
    ? Math.min(Math.max(annual - rates.lppCoordinationDeductionChf, rates.lppMinCoordinatedChf), rates.lppMaxInsuredChf - rates.lppCoordinationDeductionChf)
    : 0;
  const coordinatedMonthly = r2(coordinatedAnnual / 12);
  if (lppApplies && creditPercent > 0) {
    const erPct = r4(creditPercent * employerShare);
    const eePct = r4(creditPercent - erPct);
    const note = `${young ? 'Plan de la caisse dès 18 ans' : 'Bonification'} ${creditPercent} % sur le salaire coordonné`;
    if (eePct > 0) employee.push(line('lpp', 'LPP (2e pilier)', eePct, coordinatedMonthly, note));
    employer.push(line('lpp', 'LPP (2e pilier)', erPct, coordinatedMonthly, note));
  }

  // LAA: up to the same ceiling as AC.
  const laaBase = acBase;
  const aanp = o.aanpPercent ?? DEFAULT_LAA.aanpPercent;
  const aap = o.aapPercent ?? DEFAULT_LAA.aapPercent;
  if (aanp > 0) employee.push(line('aanp', 'AANP (accidents non prof.)', aanp, laaBase));
  if (aap > 0) employer.push(line('aap', 'AAP (accidents prof.)', aap, laaBase));

  // IJM (sickness daily allowance): optional, company policy.
  if ((o.ijmEmployeePercent ?? 0) > 0) employee.push(line('ijm', 'IJM (maladie)', o.ijmEmployeePercent!, gross));
  if ((o.ijmEmployerPercent ?? 0) > 0) employer.push(line('ijm', 'IJM (maladie)', o.ijmEmployerPercent!, gross));

  // Family allowance fund (employer), and the employee share some cantons
  // collect (VS, VD, SH). Family allowances themselves are paid with the salary.
  const rule = FAMILY_ALLOWANCES[s.workCanton];
  const caf = o.cafEmployerPercent ?? rule?.cafEmployerPercent ?? 0;
  if (caf > 0) employer.push(line('caf', `Allocations familiales (caisse ${s.workCanton})`, caf, gross));
  if (rule && rule.cafEmployeePercent > 0) employee.push(line('caf', `Allocations familiales (part salarié ${s.workCanton})`, rule.cafEmployeePercent, gross));
  const familyAllowance = s.receivesFamilyAllowances ? monthlyFamilyAllowance(s.workCanton, s.childrenUnder16, s.childrenInTraining) : 0;

  // Withholding tax: on the salary plus family allowances.
  const auto = isSubjectToWht(
    {
      permit: s.permit,
      maritalStatus: s.maritalStatus,
      spouseIsSwissOrC: s.spouseIsSwissOrC,
      spouseWorks: s.spouseWorks,
      livesWithChildren: s.livesWithChildren,
      children: s.childrenUnder16 + s.childrenInTraining,
      church: s.church,
      residenceCountry: s.residenceCountry,
    },
    s.workCanton,
  );
  const subject = o.whtSubject ?? auto.subject;
  const code = subject
    ? o.whtCode ??
      whtCode({
        permit: s.permit,
        maritalStatus: s.maritalStatus,
        spouseIsSwissOrC: s.spouseIsSwissOrC,
        spouseWorks: s.spouseWorks,
        livesWithChildren: s.livesWithChildren,
        children: s.childrenUnder16 + s.childrenInTraining,
        church: s.church,
        residenceCountry: s.residenceCountry,
      })
    : null;
  const whtBase = r2(gross + familyAllowance);
  const scaleRate = subject && opts.whtSteps?.length ? whtRate(opts.whtSteps, whtBase) : 0;
  const whtRatePercent = subject ? o.whtRatePercent ?? scaleRate : 0;
  const wht: WhtInfo = {
    subject,
    reason: o.whtSubject != null ? 'Réglé manuellement' : auto.reason,
    canton: subject ? whtCantonFor(s) : null,
    code,
    ratePercent: whtRatePercent,
    missingScale: subject && o.whtRatePercent == null && !opts.whtSteps?.length,
  };
  if (subject && whtRatePercent > 0) employee.push(line('wht', `Impôt à la source (${code})`, whtRatePercent, whtBase));

  const totalDeductions = r2(employee.reduce((sum, l) => sum + l.amount, 0));
  const totalEmployer = r2(employer.reduce((sum, l) => sum + l.amount, 0));
  return {
    year,
    gross,
    employee,
    employer,
    familyAllowance,
    totalDeductions,
    net: r2(gross - totalDeductions + familyAllowance),
    totalEmployer,
    totalCost: r2(gross + totalEmployer),
    age,
    lpp: { creditPercent: lppApplies ? creditPercent : 0, employerSharePercent: employerShare * 100, coordinatedMonthly, applies: lppApplies, reason: lppReason },
    wht,
  };
}

function r4(n: number): number {
  return Math.round(n * 10000) / 10000;
}

function line(key: string, label: string, ratePercent: number, base: number, note?: string): PayLine {
  return { key, label, ratePercent, base: r2(base), amount: r05((base * ratePercent) / 100), note };
}
