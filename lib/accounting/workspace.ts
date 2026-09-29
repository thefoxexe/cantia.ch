import { supabase } from '../supabase';

// Working tools of a fiduciary (supabase/migrations/20260930120000_fiduciary_workspace.sql):
// document requests, deadline tracking, client profile, internal notes and
// figures per client. Same rule as lib/accounting/api.ts: the database
// checks the firm's ACTIVE access on every call.

export type VatMethod = 'none' | 'effective_quarterly' | 'effective_monthly' | 'tdfn_semester' | 'effective_annual';
export type LegalForm = 'individual' | 'sarl' | 'sa' | 'other';
export type DeadlineKind = 'vat' | 'salary_declaration' | 'salary_certificates' | 'tax_return' | 'closing';
export type DeadlineState = 'todo' | 'in_progress' | 'done';
export type RequestStatus = 'open' | 'answered' | 'done' | 'cancelled';

export const VAT_METHODS: VatMethod[] = ['effective_quarterly', 'tdfn_semester', 'effective_monthly', 'effective_annual', 'none'];
export const LEGAL_FORMS: LegalForm[] = ['sarl', 'sa', 'individual', 'other'];

export interface ClientProfile {
  vat_method: VatMethod;
  has_payroll: boolean;
  legal_form: LegalForm;
  fiscal_year_end: string; // MM-DD
  tax_return_due: string; // MM-DD
  assigned_to: string | null;
  saved: boolean;
}

export interface DeadlineStatusRow {
  kind: DeadlineKind;
  period_key: string;
  status: DeadlineState;
  note: string | null;
  updated_at: string;
}

export interface DeadlineClient {
  organization_id: string;
  name: string;
  profile: ClientProfile;
  statuses: DeadlineStatusRow[];
}

export interface RequestFile {
  id: string;
  file_path: string;
  file_name: string;
  size_bytes?: number | null;
  created_at: string;
}

export interface FiduciaryRequest {
  id: string;
  organization_id: string;
  organization_name: string;
  title: string;
  details: string | null;
  due_date: string | null;
  status: RequestStatus;
  client_message: string | null;
  created_at: string;
  answered_at: string | null;
  closed_at: string | null;
  last_reminded_at: string | null;
  created_by_name: string | null;
  files: RequestFile[];
}

export interface ClientNote {
  id: string;
  body: string;
  created_at: string;
  mine: boolean;
  author_name: string | null;
}

export interface ClientInsights {
  invoiced_ytd?: number;
  collected_ytd?: number;
  open_amount?: number;
  overdue_amount?: number;
  overdue_count?: number;
  invoices_ytd?: number;
  monthly?: { month: string; amount: number }[];
  expenses_ytd?: number;
  expenses_count_ytd?: number;
  entries_draft?: number;
  entries_without_receipt_90d?: number;
  last_entry_date?: string | null;
  payroll_runs_ytd?: number;
  payroll_last?: string | null;
  requests_open: number;
  requests_answered: number;
}

async function call<T>(fn: string, args?: Record<string, unknown>): Promise<{ data: T | null; error: string | null }> {
  const { data, error } = await supabase.rpc(fn, args ?? {});
  return { data: (data as T) ?? null, error: error?.message ?? null };
}

export const work = {
  profile: (org: string) => call<ClientProfile>('acc_client_profile', { p_org: org }),
  saveProfile: (org: string, p: Omit<ClientProfile, 'saved'>) =>
    call<null>('acc_set_client_profile', {
      p_org: org,
      p_vat_method: p.vat_method,
      p_has_payroll: p.has_payroll,
      p_legal_form: p.legal_form,
      p_fiscal_year_end: p.fiscal_year_end,
      p_tax_return_due: p.tax_return_due,
      p_assigned_to: p.assigned_to,
    }),
  deadlineData: () => call<DeadlineClient[]>('acc_deadline_data'),
  setDeadline: (org: string, kind: DeadlineKind, period: string, status: DeadlineState) =>
    call<null>('acc_set_deadline', { p_org: org, p_kind: kind, p_period: period, p_status: status }),
  requests: (org?: string | null) => call<FiduciaryRequest[]>('acc_requests', { p_org: org ?? null }),
  createRequest: (org: string, title: string, details: string, due: string | null) =>
    call<string>('acc_create_request', { p_org: org, p_title: title, p_details: details || null, p_due: due || null }),
  updateRequest: (id: string, action: 'done' | 'cancelled' | 'open' | 'remind') => call<null>('acc_update_request', { p_id: id, p_action: action }),
  notes: (org: string) => call<ClientNote[]>('acc_notes', { p_org: org }),
  addNote: (org: string, body: string) => call<null>('acc_add_note', { p_org: org, p_body: body }),
  deleteNote: (id: string) => call<null>('acc_delete_note', { p_id: id }),
  insights: (org: string) => call<ClientInsights>('acc_client_insights', { p_org: org }),
};

// ---------------------------------------------------------------------------
// Swiss deadline calendar, computed from the client profile.
//
// - VAT (effective method): 60 days after the end of each period (quarter,
//   month or year); net tax rate method (TDFN): per semester, same 60 days.
// - AHV/AVS annual salary declaration: 30 January for the previous year.
// - Salary certificates handed to employees: 31 January.
// - Tax return: the canton's date (profile, default 31 March).
// - Annual closing: 6 months after the fiscal year end for companies (the
//   general meeting approves the accounts within 6 months); for a sole
//   proprietorship, with the tax return.

export interface Deadline {
  key: string; // org|kind|period
  organization_id: string;
  client: string;
  kind: DeadlineKind;
  period_key: string;
  period_label: string; // e.g. "T3 2026", "2026"
  due: string; // YYYY-MM-DD
  status: DeadlineState;
}

function iso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function mmdd(year: number, value: string): Date {
  const [m, d] = value.split('-').map(Number);
  // Clamp to the month's last day (31.04 does not exist).
  const last = new Date(year, m, 0).getDate();
  return new Date(year, m - 1, Math.min(d, last));
}

export function computeDeadlines(
  clients: DeadlineClient[],
  labels: { quarter: string; semester: string; month: (m: number) => string },
  today = new Date(),
  horizonDays = 150,
  // Past deadlines older than this are not shown: a firm that just joined
  // should not see a year of "late" items it never had to track here.
  lookbackDays = 60,
): Deadline[] {
  const out: Deadline[] = [];
  const from = addDays(today, -lookbackDays);
  const to = addDays(today, horizonDays);
  const y = today.getFullYear();

  for (const c of clients) {
    const p = c.profile;
    const status = (kind: DeadlineKind, period: string): DeadlineState =>
      c.statuses.find((s) => s.kind === kind && s.period_key === period)?.status ?? 'todo';
    const push = (kind: DeadlineKind, period: string, label: string, due: Date) => {
      if (due < from || due > to) return;
      out.push({ key: `${c.organization_id}|${kind}|${period}`, organization_id: c.organization_id, client: c.name, kind, period_key: period, period_label: label, due: iso(due), status: status(kind, period) });
    };

    for (const year of [y - 1, y, y + 1]) {
      // VAT
      if (p.vat_method === 'effective_quarterly') {
        for (let q = 1; q <= 4; q++) push('vat', `${year}-Q${q}`, `${labels.quarter}${q} ${year}`, addDays(new Date(year, q * 3, 0), 60));
      } else if (p.vat_method === 'tdfn_semester') {
        for (let s = 1; s <= 2; s++) push('vat', `${year}-S${s}`, `${labels.semester}${s} ${year}`, addDays(new Date(year, s * 6, 0), 60));
      } else if (p.vat_method === 'effective_monthly') {
        for (let m = 1; m <= 12; m++) push('vat', `${year}-M${String(m).padStart(2, '0')}`, `${labels.month(m - 1)} ${year}`, addDays(new Date(year, m, 0), 60));
      } else if (p.vat_method === 'effective_annual') {
        push('vat', `${year}`, `${year}`, addDays(new Date(year, 12, 0), 60));
      }
      // Payroll (for the previous year, due in `year`)
      if (p.has_payroll) {
        push('salary_certificates', `${year - 1}`, `${year - 1}`, new Date(year, 0, 31));
        push('salary_declaration', `${year - 1}`, `${year - 1}`, new Date(year, 0, 30));
      }
      // Tax return and closing of fiscal year `year - 1`
      push('tax_return', `${year - 1}`, `${year - 1}`, mmdd(year, p.tax_return_due));
      const fye = mmdd(year - 1, p.fiscal_year_end);
      const closingDue = p.legal_form === 'individual' ? mmdd(year, p.tax_return_due) : new Date(fye.getFullYear(), fye.getMonth() + 6, fye.getDate());
      push('closing', `${year - 1}`, `${year - 1}`, closingDue);
    }
  }
  // Past items stay only while not done.
  const t = iso(today);
  return out.filter((d) => d.due >= t || d.status !== 'done').sort((a, b) => a.due.localeCompare(b.due) || a.client.localeCompare(b.client));
}

export function daysUntil(isoDate: string, today = new Date()): number {
  const d = new Date(`${isoDate}T00:00:00`);
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((d.getTime() - t.getTime()) / 86400000);
}

export function formatBytes(n: number | null | undefined): string {
  if (!n) return '';
  if (n < 1024) return `${n} o`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} Ko`;
  return `${(n / 1024 / 1024).toFixed(1)} Mo`;
}
