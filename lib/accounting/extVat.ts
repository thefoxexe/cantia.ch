// The AFC VAT return of a client outside Cantia, from the books the firm
// keeps for it (acc_ext_vat_summary): the VAT codes of the lines become the
// rows lib/vat/afcForm.ts turns into the official figures. Pure functions
// (Node tests in scripts/ext-ledger.test.mjs).
import type { LedgerRow, Periodicity, VatMethod } from '../vat/afcForm';

export interface ExtVatSummary {
  codes: { vat_code: string; net: number; lines: number }[];
  vat_due: number;
  input_tax: number;
  input_material: number;
  input_invest: number;
}

const RATES: Record<string, number> = { '81': 8.1, '26': 2.6, '38': 3.8, '77': 7.7, '25': 2.5, '37': 3.7 };
const r2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

// Cantia codes (V81, M81, I81, E0, A0, X0) and the usual Banana / Abacus
// spellings (VSM81, VSI81, U81…). null: unknown, left out of the form.
export function classifyVatCode(code: string): { category: string; rate: number } | null {
  const c = code.trim().toUpperCase().replace(/[\s.%_-]/g, '');
  let m = c.match(/^(V|U|UST)(81|26|38|77|25|37)$/);
  if (m) {
    const rate = RATES[m[2]];
    return { category: rate === 3.8 || rate === 3.7 ? 'vente_hebergement' : rate === 2.6 || rate === 2.5 ? 'vente_reduit' : 'vente_normal', rate };
  }
  m = c.match(/^(M|VM|VSM|VST)(81|26|38|77|25|37)$/);
  if (m) return { category: 'achat_materiel', rate: RATES[m[2]] };
  m = c.match(/^(I|VI|VSI|VSF|VSB)(81|26|38|77|25|37)$/);
  if (m) return { category: 'achat_investissement', rate: RATES[m[2]] };
  if (/^(E0|E|EX|EXP|VE)$/.test(c)) return { category: 'vente_exoneree', rate: 0 };
  if (/^(A0|AUS|ETR|VA)$/.test(c)) return { category: 'vente_etranger', rate: 0 };
  if (/^(X0|X|EXCL|VX|AUSG)$/.test(c)) return { category: 'vente_exclue', rate: 0 };
  return null;
}

// Rows for buildAfcForm: turnover per sales code (VAT computed on the net,
// as the form does), input tax as booked on 1170 / 1171.
export function extVatRows(s: ExtVatSummary): { rows: LedgerRow[]; unknown: { code: string; net: number }[] } {
  const rows: LedgerRow[] = [];
  const unknown: { code: string; net: number }[] = [];
  for (const x of s.codes) {
    const k = classifyVatCode(x.vat_code);
    const net = r2(Number(x.net));
    if (!k) {
      unknown.push({ code: x.vat_code, net });
      continue;
    }
    if (k.category.startsWith('achat')) rows.push({ code: x.vat_code, category: k.category, rate: k.rate, base: net, amount: 0 });
    else rows.push({ code: x.vat_code, category: k.category, rate: k.rate, base: net, amount: r2((net * k.rate) / 100) });
  }
  if (Number(s.input_material)) rows.push({ code: '1170', category: 'achat_materiel', rate: 0, base: 0, amount: r2(Number(s.input_material)) });
  if (Number(s.input_invest)) rows.push({ code: '1171', category: 'achat_investissement', rate: 0, base: 0, amount: r2(Number(s.input_invest)) });
  return { rows, unknown };
}

export function vatSetup(vatMethod: string): { method: VatMethod; periodicity: Periodicity } | null {
  if (vatMethod === 'effective_quarterly') return { method: 'effective', periodicity: 'trimestrielle' };
  if (vatMethod === 'effective_monthly') return { method: 'effective', periodicity: 'mensuelle' };
  if (vatMethod === 'effective_annual') return { method: 'effective', periodicity: 'annuelle' };
  if (vatMethod === 'tdfn_semester') return { method: 'tdfn', periodicity: 'semestrielle' };
  return null;
}

// Period key of the deadlines (lib/accounting/workspace.ts): 2026-Q1,
// 2026-S2, 2026-M03, 2026.
export function deadlineKey(periodKey: string): string {
  return periodKey.replace(/-T(\d)$/, '-Q$1');
}

// eCH-0217 rows (lib/api/accounting.ts buildEch0217Xml): sales and input
// tax per category.
export function ech0217Report(rows: LedgerRow[]) {
  const toRow = (r: LedgerRow) => ({ code: r.code, label: r.code, category: r.category, rate: r.rate, base: r.base, amount: r.amount, entryCount: 0 });
  const sales = rows.filter((r) => !r.category.startsWith('achat')).map(toRow);
  const deductible = rows.filter((r) => r.category.startsWith('achat')).map(toRow);
  const salesVat = r2(sales.reduce((s, r) => s + r.amount, 0));
  const deductibleVat = r2(deductible.reduce((s, r) => s + r.amount, 0));
  return {
    salesRows: sales,
    totalSalesBase: r2(sales.reduce((s, r) => s + r.base, 0)),
    totalSalesVat: salesVat,
    deductibleRows: deductible,
    totalDeductibleBase: r2(deductible.reduce((s, r) => s + r.base, 0)),
    totalDeductibleVat: deductibleVat,
    netVatDue: r2(salesVat - deductibleVat),
    roundedNetVatDue: r2(salesVat - deductibleVat),
  };
}
