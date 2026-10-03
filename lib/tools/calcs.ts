// Calculations of the free tools on cantia.ch/outils. Pure (no I/O) so
// scripts/tools.test.mjs can check them with node.

const r2 = (n: number) => Math.round(n * 100) / 100;
export const r05 = (n: number) => Math.round(n * 20) / 20;

// --- TVA ---------------------------------------------------------------------
// Swiss rates since 1.1.2024: 8.1 % normal, 2.6 % reduced, 3.8 % lodging.
export function vat(amount: number, ratePercent: number, from: 'ht' | 'ttc', round5 = false) {
  const ht = from === 'ht' ? amount : amount / (1 + ratePercent / 100);
  let tax = (ht * ratePercent) / 100;
  if (round5) tax = r05(tax);
  const htOut = from === 'ht' ? r2(amount) : r2(amount - tax);
  const taxOut = r2(from === 'ht' ? tax : amount - htOut);
  return { ht: htOut, vat: taxOut, ttc: r2(htOut + taxOut) };
}

// --- Taux horaire --------------------------------------------------------------
export interface HourlyInput {
  monthlySalary: number; // average gross per productive employee
  salariesPerYear: number; // 12 or 13
  employees: number; // productive (on site) employees
  chargesPercent: number; // employer charges on salaries (AVS, AC, LPP, LAA, CAF…)
  billableHours: number; // billable hours per employee per year
  overhead: number; // yearly overheads: rent, vehicles, insurance, office staff, tools…
  marginPercent: number; // profit margin on the selling price
}

export function hourlyRate(i: HourlyInput) {
  const payroll = i.monthlySalary * i.salariesPerYear * i.employees;
  const charges = (payroll * i.chargesPercent) / 100;
  const cost = payroll + charges + i.overhead;
  const hours = Math.max(1, i.employees * i.billableHours);
  const costPerHour = cost / hours;
  const m = Math.min(90, Math.max(0, i.marginPercent)) / 100;
  const rate = costPerHour / (1 - m);
  return {
    payroll: r2(payroll),
    charges: r2(charges),
    cost: r2(cost),
    hours,
    costPerHour: r2(costPerHour),
    salaryPerHour: r2((payroll + charges) / hours),
    overheadPerHour: r2(i.overhead / hours),
    rate: r05(rate),
    rateTtc: r05(rate * 1.081),
    yearlyProfit: r2((rate - costPerHour) * hours),
  };
}

// --- Marge ---------------------------------------------------------------------
// Margin = share of the SELLING price; markup = share of the COST.
export function marginFromCost(cost: number, marginPercent: number) {
  const m = Math.min(95, Math.max(0, marginPercent)) / 100;
  const price = cost / (1 - m);
  return breakdown(cost, price);
}

export function marginFromPrice(cost: number, price: number) {
  return breakdown(cost, price);
}

function breakdown(cost: number, price: number) {
  const profit = price - cost;
  return {
    cost: r2(cost),
    price: r2(price),
    profit: r2(profit),
    marginPercent: price > 0 ? r2((profit / price) * 100) : 0,
    markupPercent: cost > 0 ? r2((profit / cost) * 100) : 0,
    coefficient: cost > 0 ? Math.round((price / cost) * 1000) / 1000 : 0,
  };
}

// --- Intérêts de retard -------------------------------------------------------
// Art. 104 CO: 5 % a year from the day the debtor is in default (after the
// due date of an invoice with a set term, otherwise from the reminder).
export function lateInterest(amount: number, dueIso: string, paidIso: string, ratePercent = 5) {
  const days = Math.max(0, Math.round((Date.parse(`${paidIso}T00:00:00Z`) - Date.parse(`${dueIso}T00:00:00Z`)) / 86400000));
  const interest = r05((amount * ratePercent * days) / 100 / 365);
  return { days, interest, total: r2(amount + interest), perDay: r2((amount * ratePercent) / 100 / 365) };
}

// --- Indemnité de vacances -----------------------------------------------------
// Hourly paid staff: holiday pay as a supplement. weeks / (52 − weeks).
export function vacationPercent(weeks: number): number {
  return Math.round((weeks / (52 - weeks)) * 10000) / 100;
}

export function vacationPay(hourly: number, weeks: number, hoursPerMonth: number) {
  const p = vacationPercent(weeks);
  const supplement = r2((hourly * p) / 100);
  return { percent: p, supplement, hourlyWithHoliday: r2(hourly + supplement), monthly: r05(supplement * hoursPerMonth) };
}
