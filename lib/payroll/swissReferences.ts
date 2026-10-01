// Swiss payroll reference figures used by lib/payroll/swissEngine.ts.
// Every figure here is official and dated; update once a year.
//
// Withholding tax scales are not here: they are imported from the ESTV
// files into public.swiss_wht_tariffs (supabase/functions/
// import-payroll-references) and looked up per canton / code.

export type Canton =
  | 'AG' | 'AI' | 'AR' | 'BE' | 'BL' | 'BS' | 'FR' | 'GE' | 'GL' | 'GR' | 'JU' | 'LU' | 'NE'
  | 'NW' | 'OW' | 'SG' | 'SH' | 'SO' | 'SZ' | 'TG' | 'TI' | 'UR' | 'VD' | 'VS' | 'ZG' | 'ZH';

export const CANTONS: Canton[] = ['AG', 'AI', 'AR', 'BE', 'BL', 'BS', 'FR', 'GE', 'GL', 'GR', 'JU', 'LU', 'NE', 'NW', 'OW', 'SG', 'SH', 'SO', 'SZ', 'TG', 'TI', 'UR', 'VD', 'VS', 'ZG', 'ZH'];

// ---------------------------------------------------------------------------
// Social insurance (OFAS / Centrale de compensation). Same figures as
// public.swiss_social_insurance_rates, kept here for the pure engine.
export interface SocialRates {
  year: number;
  avsAiApgPercent: number; // employee share; the employer pays the same
  acPercent: number; // employee share up to acCeilingChf; the employer pays the same
  acCeilingChf: number; // yearly insured salary ceiling (also LAA)
  lppEntryThresholdChf: number;
  lppCoordinationDeductionChf: number;
  lppMinCoordinatedChf: number;
  lppMaxInsuredChf: number;
}

// The AC "solidarity" contribution above the ceiling was abolished on
// 1.1.2023: nothing is charged above acCeilingChf.
export const SOCIAL_RATES: Record<number, SocialRates> = {
  2025: { year: 2025, avsAiApgPercent: 5.3, acPercent: 1.1, acCeilingChf: 148200, lppEntryThresholdChf: 22680, lppCoordinationDeductionChf: 26460, lppMinCoordinatedChf: 3780, lppMaxInsuredChf: 90720 },
  2026: { year: 2026, avsAiApgPercent: 5.3, acPercent: 1.1, acCeilingChf: 148200, lppEntryThresholdChf: 22680, lppCoordinationDeductionChf: 26460, lppMinCoordinatedChf: 3780, lppMaxInsuredChf: 90720 },
};

export function socialRatesFor(year: number): SocialRates {
  return SOCIAL_RATES[year] ?? SOCIAL_RATES[Math.max(...Object.keys(SOCIAL_RATES).map(Number))];
}

// LPP minimum savings credits (art. 16 LPP), in % of the coordinated
// salary, by age (calendar year minus birth year). Shared at least 50/50.
export function lppCreditPercent(age: number): number {
  if (age < 25) return 0;
  if (age <= 34) return 7;
  if (age <= 44) return 10;
  if (age <= 54) return 15;
  if (age <= 65) return 18;
  return 0;
}

// Accident insurance: the real rates are on each company's LAA policy.
// Indicative values until the company enters its own.
export const DEFAULT_LAA = { aanpPercent: 1.4, aapPercent: 0.8 };

// ---------------------------------------------------------------------------
// Family allowances 2026, OFAS « Genres et montants des allocations
// familiales selon la LAFam, la LFA et les lois cantonales 2026 »
// (état au 12.12.2025). Monthly CHF per child.
//   child / training: [amount, higher amount]; `higher` says when the
//   higher amount applies: from the 3rd child, or above an age.
//   cafEmployerPercent: cantonal family allowance fund (CAF) rate, plus
//   the other employer contributions the canton collects with it
//   (vocational training, childcare, family benefits funds; table 2).
//   Rates of private funds can differ: editable per company.
export interface FamilyAllowanceRule {
  child: [number, number];
  training: [number, number];
  higher: 'none' | 'third_child' | 'child_over_12' | 'training_over_18';
  birth: number | null;
  cafEmployerPercent: number;
  cafEmployeePercent: number;
}

export const FAMILY_ALLOWANCES_YEAR = 2026;
export const FAMILY_ALLOWANCES_SOURCE = 'OFAS, Genres et montants des allocations familiales 2026 (état au 12.12.2025)';

const fa = (
  child: number | [number, number],
  training: number | [number, number],
  higher: FamilyAllowanceRule['higher'],
  birth: number | null,
  cafEmployerPercent: number,
  cafEmployeePercent = 0,
): FamilyAllowanceRule => ({
  child: Array.isArray(child) ? child : [child, child],
  training: Array.isArray(training) ? training : [training, training],
  higher,
  birth,
  cafEmployerPercent,
  cafEmployeePercent,
});

export const FAMILY_ALLOWANCES: Record<Canton, FamilyAllowanceRule> = {
  ZH: fa([215, 268], 268, 'child_over_12', null, 1.025 + 0.1),
  BE: fa(250, 310, 'none', null, 1.5),
  LU: fa([215, 260], 268, 'child_over_12', 1075, 1.35 + 0.005),
  UR: fa(240, 290, 'none', 1200, 1.7),
  SZ: fa(230, 280, 'none', 1000, 1.3),
  OW: fa(220, 270, 'none', null, 1.4),
  NW: fa(258, 311, 'none', null, 1.5),
  GL: fa(215, 268, 'none', null, 1.4),
  ZG: fa(330, [330, 385], 'training_over_18', null, 1.35),
  FR: fa([265, 285], [325, 345], 'third_child', 1500, 2.27 + 0.04 + 0.04),
  SO: fa(215, 268, 'none', null, 1.25),
  BS: fa(275, 325, 'none', null, 1.65),
  BL: fa(215, 268, 'none', null, 1.3),
  SH: fa(230, 290, 'none', null, 1.3 + 0.08, 0.04),
  AR: fa(230, 280, 'none', null, 1.6),
  AI: fa(245, 298, 'none', null, 1.6),
  SG: fa(245, 298, 'none', null, 1.8),
  GR: fa(240, 290, 'none', null, 1.5),
  AG: fa(225, 278, 'none', null, 1.45),
  TG: fa(215, 280, 'none', null, 1.4),
  TI: fa(215, 268, 'none', null, 1.6 + 0.15 + 0.15),
  VD: fa([322, 365], [425, 468], 'third_child', 1617, 2.37 + 0.09 + 0.09 + 0.16, 0.09),
  VS: fa([327, 435], [477, 585], 'third_child', 2142, 2.5 + 0.1, 0.13),
  NE: fa([240, 270], [320, 350], 'third_child', 1200, 1.8),
  GE: fa([311, 411], [415, 515], 'third_child', 2073, 2.22),
  JU: fa(275, 325, 'none', 1500, 2.75),
};

// Children as the payroll knows them: under 16 (allocation pour enfant)
// and 16 to 25 in training (allocation de formation). The children's ages
// are not stored, so the age-tiered cantons (ZH, LU, ZG) use the base
// amount; the order of children (3rd and following) is applied.
export function monthlyFamilyAllowance(canton: Canton, childrenUnder16: number, childrenInTraining: number): number {
  const rule = FAMILY_ALLOWANCES[canton];
  if (!rule) return 0;
  // The older ones (in training) count first: they are the 1st and 2nd children.
  const kids: ('child' | 'training')[] = [
    ...Array<'training'>(Math.max(0, childrenInTraining)).fill('training'),
    ...Array<'child'>(Math.max(0, childrenUnder16)).fill('child'),
  ];
  let total = 0;
  kids.forEach((kind, i) => {
    const pair = kind === 'child' ? rule.child : rule.training;
    const higher = rule.higher === 'third_child' && i >= 2;
    total += higher ? pair[1] : pair[0];
  });
  return total;
}

// ---------------------------------------------------------------------------
// Withholding tax: who is taxed at source, and with which scale.
// Codes: A single · B married, one income · C married, two incomes ·
// H single parent living with the children; then the number of children
// (0-9) and N / Y (church tax). Other codes (cross-border workers from
// Germany or Italy, secondary incomes…) can be entered by hand.
export type Permit = 'swiss' | 'C' | 'B' | 'L' | 'G' | 'F' | 'N' | 'S' | 'other';
export type MaritalStatus = 'single' | 'married' | 'registered' | 'divorced' | 'separated' | 'widowed';

export interface WhtSituation {
  permit: Permit;
  maritalStatus: MaritalStatus;
  spouseIsSwissOrC: boolean;
  spouseWorks: boolean;
  livesWithChildren: boolean;
  children: number;
  church: boolean;
  residenceCountry: 'CH' | 'FR' | 'DE' | 'IT' | 'AT' | 'other';
}

export function isSubjectToWht(s: WhtSituation, workCanton: Canton): { subject: boolean; reason: string } {
  if (s.permit === 'swiss' || s.permit === 'C') return { subject: false, reason: s.permit === 'swiss' ? 'Nationalité suisse' : 'Permis C' };
  const couple = s.maritalStatus === 'married' || s.maritalStatus === 'registered';
  if (couple && s.spouseIsSwissOrC && s.residenceCountry === 'CH') return { subject: false, reason: 'Marié·e à une personne suisse ou titulaire d’un permis C' };
  // Franco-Swiss agreement of 1983: French residents working in these
  // cantons are taxed in France (not at source in Switzerland).
  const franceAgreement: Canton[] = ['BE', 'BS', 'BL', 'JU', 'NE', 'SO', 'VD', 'VS'];
  if (s.residenceCountry === 'FR' && franceAgreement.includes(workCanton)) {
    return { subject: false, reason: 'Frontalier résidant en France (accord de 1983) : imposé en France' };
  }
  return { subject: true, reason: s.residenceCountry === 'CH' ? `Permis ${s.permit}` : 'Frontalier' };
}

export function whtCode(s: WhtSituation): string {
  const couple = s.maritalStatus === 'married' || s.maritalStatus === 'registered';
  const letter = couple ? (s.spouseWorks ? 'C' : 'B') : s.livesWithChildren && s.children > 0 ? 'H' : 'A';
  const kids = Math.min(9, Math.max(0, letter === 'H' ? Math.max(1, s.children) : s.children));
  return `${letter}${kids}${s.church ? 'Y' : 'N'}`;
}

// Steps from public.swiss_wht_tariffs: [income_from_chf, rate_percent, min_tax_chf]
export type WhtSteps = [number, number, number][];

export function whtRate(steps: WhtSteps, monthlyTaxableIncome: number): number {
  let rate = 0;
  for (const [from, r] of steps) {
    if (monthlyTaxableIncome >= from) rate = r;
    else break;
  }
  return rate;
}
