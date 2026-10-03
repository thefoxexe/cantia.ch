// Cash curve for the Trésorerie page: the balance over the past months
// (rebuilt from imported bank statements, else from the balances typed in)
// and the projection over the next 90 days from the forecast items
// (open invoices in, payroll / subcontractors / recurring expenses out).
// Pure module (no I/O) so it can be tested with node directly.

export interface CurvePoint {
  date: string; // YYYY-MM-DD
  balance: number;
}

export interface BankBalanceInput {
  lastImportedBalance: number | null;
  lastImportedAt: string | null; // ISO timestamp of the statement import
  transactions: { bookingDate: string; amount: number }[]; // signed
}

export interface SnapshotInput {
  balance: number;
  recordedAt: string; // ISO timestamp
}

export interface ForecastItemInput {
  amount: number; // + in, − out
  date: string | null;
  overdue: boolean;
}

const r2 = (n: number) => Math.round(n * 100) / 100;

export function isoAddDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86400000);
}

// Where the history comes from, and the balance the projection starts from.
export interface CashStart {
  balance: number;
  asOf: string | null; // YYYY-MM-DD
  source: 'bank' | 'snapshot' | 'none';
}

export function cashStart(banks: BankBalanceInput[], snapshots: SnapshotInput[]): CashStart {
  const imported = banks.filter((b) => b.lastImportedBalance != null && b.lastImportedAt);
  const bankAsOf = imported.length ? imported.map((b) => b.lastImportedAt!.slice(0, 10)).sort().pop()! : null;
  const latestSnap = [...snapshots].sort((a, b) => (a.recordedAt < b.recordedAt ? 1 : -1))[0];
  const snapAsOf = latestSnap ? latestSnap.recordedAt.slice(0, 10) : null;
  // The most recent figure wins; the bank on a tie (it is the real one).
  if (bankAsOf && (!snapAsOf || bankAsOf >= snapAsOf)) {
    return { balance: r2(imported.reduce((s, b) => s + Number(b.lastImportedBalance), 0)), asOf: bankAsOf, source: 'bank' };
  }
  if (latestSnap) return { balance: r2(latestSnap.balance), asOf: snapAsOf, source: 'snapshot' };
  return { balance: 0, asOf: null, source: 'none' };
}

// Daily balance from `from` to `to` (inclusive).
//  - Bank: each account's balance on day d = last imported balance minus
//    the transactions booked after d (up to the import). Days before the
//    first transaction we know of are left out (unknown).
//  - Otherwise the typed-in balances, held flat until the next one.
export function buildHistory(banks: BankBalanceInput[], snapshots: SnapshotInput[], from: string, to: string): CurvePoint[] {
  const points: CurvePoint[] = [];
  const usable = banks.filter((b) => b.lastImportedBalance != null && b.lastImportedAt && b.transactions.length);
  if (usable.length) {
    const firstKnown = usable.map((b) => b.transactions.reduce((m, t) => (t.bookingDate < m ? t.bookingDate : m), '9999')).sort()[0];
    const lastKnown = usable.map((b) => b.lastImportedAt!.slice(0, 10)).sort().pop()!;
    const start = firstKnown > from ? isoAddDays(firstKnown, -1) : from;
    const end = lastKnown < to ? lastKnown : to;
    for (let d = start; d <= end; d = isoAddDays(d, 1)) {
      let total = 0;
      for (const b of usable) {
        const importDay = b.lastImportedAt!.slice(0, 10);
        const after = b.transactions.filter((t) => t.bookingDate > d && t.bookingDate <= importDay).reduce((s, t) => s + Number(t.amount), 0);
        total += Number(b.lastImportedBalance) - after;
      }
      points.push({ date: d, balance: r2(total) });
    }
    return points;
  }
  const snaps = [...snapshots].sort((a, b) => (a.recordedAt < b.recordedAt ? -1 : 1));
  if (!snaps.length) return points;
  // The last balance typed in before `from` opens the window.
  let idx = snaps.findIndex((s) => s.recordedAt.slice(0, 10) >= from);
  if (idx === -1) idx = snaps.length;
  let current: number | null = idx > 0 ? snaps[idx - 1].balance : null;
  for (let d = from; d <= to; d = isoAddDays(d, 1)) {
    while (idx < snaps.length && snaps[idx].recordedAt.slice(0, 10) <= d) {
      current = snaps[idx].balance;
      idx += 1;
    }
    if (current != null) points.push({ date: d, balance: r2(current) });
  }
  return points;
}

export interface Projection {
  expected: CurvePoint[]; // every forecast item
  cautious: CurvePoint[]; // outflows only: what if nobody pays in time
  lowest: CurvePoint; // lowest expected point
  firstNegative: string | null; // first day the expected balance is < 0
  inflow: number;
  outflow: number;
}

// Daily projection from `today` over `days`. Overdue items are counted as
// due today (they are late, not cancelled); undated ones are left out.
export function buildProjection(start: number, items: ForecastItemInput[], today: string, days = 90): Projection {
  const horizon = isoAddDays(today, days);
  const byDay = new Map<string, { in: number; out: number }>();
  let inflow = 0;
  let outflow = 0;
  for (const it of items) {
    if (!it.date) continue;
    const day = it.overdue || it.date < today ? today : it.date;
    if (day > horizon) continue;
    const cur = byDay.get(day) ?? { in: 0, out: 0 };
    if (it.amount >= 0) {
      cur.in += it.amount;
      inflow += it.amount;
    } else {
      cur.out += it.amount;
      outflow += it.amount;
    }
    byDay.set(day, cur);
  }
  const expected: CurvePoint[] = [];
  const cautious: CurvePoint[] = [];
  let e = start;
  let c = start;
  let lowest: CurvePoint = { date: today, balance: r2(start) };
  let firstNegative: string | null = start < 0 ? today : null;
  for (let i = 0; i <= daysBetween(today, horizon); i++) {
    const d = isoAddDays(today, i);
    const m = byDay.get(d);
    if (m) {
      e += m.in + m.out;
      c += m.out;
    }
    expected.push({ date: d, balance: r2(e) });
    cautious.push({ date: d, balance: r2(c) });
    if (e < lowest.balance) lowest = { date: d, balance: r2(e) };
    if (e < 0 && !firstNegative) firstNegative = d;
  }
  return { expected, cautious, lowest, firstNegative, inflow: r2(inflow), outflow: r2(outflow) };
}

// Nice round ticks for the Y axis.
export function niceTicks(min: number, max: number, count = 4): number[] {
  if (min === max) {
    const pad = Math.max(1000, Math.abs(min) * 0.1);
    min -= pad;
    max += pad;
  }
  const span = max - min;
  const raw = span / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? 10 * mag;
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = lo; v <= hi + step / 2; v += step) ticks.push(Math.round(v));
  return ticks;
}
