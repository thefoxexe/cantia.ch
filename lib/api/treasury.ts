import { supabase } from '../supabase';
import type { CashSnapshot, Expense, Organization, RecurringExpense, RecurringExpenseFrequency, TreasuryForecast, TreasuryForecastItem } from '../types';

export async function getLatestCashSnapshot(organizationId: string): Promise<CashSnapshot | null> {
  const { data } = await supabase
    .from('cash_snapshots')
    .select('*')
    .eq('organization_id', organizationId)
    .order('recorded_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ?? null;
}

export async function addCashSnapshot(organizationId: string, balanceChf: number, userId: string | undefined): Promise<{ error: string | null }> {
  const { error } = await supabase.from('cash_snapshots').insert({ organization_id: organizationId, balance_chf: balanceChf, created_by: userId });
  return { error: error?.message ?? null };
}

export async function listRecurringExpenses(organizationId: string): Promise<RecurringExpense[]> {
  const { data } = await supabase
    .from('recurring_expenses')
    .select('*')
    .eq('organization_id', organizationId)
    .order('next_due_date', { ascending: true });
  return data ?? [];
}

export interface RecurringExpenseInput {
  label: string;
  category: string | null;
  amountChf: number;
  frequency: RecurringExpenseFrequency;
  nextDueDate: string;
  reminderDaysBefore: number;
  notes: string | null;
}

export async function createRecurringExpense(
  organizationId: string,
  userId: string | undefined,
  input: RecurringExpenseInput,
): Promise<{ id: string | null; error: string | null }> {
  const { data, error } = await supabase
    .from('recurring_expenses')
    .insert({
      organization_id: organizationId,
      label: input.label,
      category: input.category,
      amount_chf: input.amountChf,
      frequency: input.frequency,
      next_due_date: input.nextDueDate,
      reminder_days_before: input.reminderDaysBefore,
      notes: input.notes,
      created_by: userId,
    })
    .select('id')
    .single();
  return { id: data?.id ?? null, error: error?.message ?? null };
}

export async function updateRecurringExpense(id: string, input: RecurringExpenseInput): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('recurring_expenses')
    .update({
      label: input.label,
      category: input.category,
      amount_chf: input.amountChf,
      frequency: input.frequency,
      next_due_date: input.nextDueDate,
      reminder_days_before: input.reminderDaysBefore,
      notes: input.notes,
    })
    .eq('id', id);
  return { error: error?.message ?? null };
}

export async function setRecurringExpenseActive(id: string, active: boolean): Promise<{ error: string | null }> {
  const { error } = await supabase.from('recurring_expenses').update({ active }).eq('id', id);
  return { error: error?.message ?? null };
}

export async function deleteRecurringExpense(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('recurring_expenses').delete().eq('id', id);
  return { error: error?.message ?? null };
}

function isoToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function nextOccurrence(dateIso: string, frequency: RecurringExpenseFrequency): string {
  const d = new Date(dateIso + 'T00:00:00Z');
  if (frequency === 'monthly') d.setUTCMonth(d.getUTCMonth() + 1);
  else d.setUTCFullYear(d.getUTCFullYear() + 1);
  return d.toISOString().slice(0, 10);
}

// Next payday on or after `from`, using organization.payroll_payday (day of
// month, 1-28 so it always exists in every month) — one occurrence within
// the forecast window per calendar month it covers.
function nextPayday(from: string, payday: number): string {
  const d = new Date(from + 'T00:00:00Z');
  const candidate = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), payday));
  if (candidate < d) candidate.setUTCMonth(candidate.getUTCMonth() + 1);
  return candidate.toISOString().slice(0, 10);
}

// Aggregates everything the org already tracks — factures non soldées,
// masse salariale estimée, factures sous-traitants non payées, dépenses
// récurrentes — into a single 90-day projection. Pure client-side
// aggregation, same pattern as app/(app)/index.tsx's dashboard: independent
// queries in parallel, combined in JS, nothing derived server-side.
export async function buildForecast(organization: Organization, days = 90): Promise<TreasuryForecast> {
  const orgId = organization.id;
  const today = isoToday();
  const horizon = addDays(today, days);

  const [snapshot, facturesRes, payrollProfilesRes, workTypesRes, timeEntriesRes, subInvoicesRes, recurringRes] = await Promise.all([
    getLatestCashSnapshot(orgId),
    supabase.from('factures').select('id, number, client_name, due_date, vat_rate').eq('organization_id', orgId).in('status', ['sent', 'partial']),
    supabase.from('payroll_profiles').select('user_id, salary_type, hourly_rate_chf, monthly_salary_chf').eq('organization_id', orgId),
    supabase.from('payroll_work_types').select('id, hourly_rate_chf').eq('organization_id', orgId),
    supabase
      .from('payroll_time_entries')
      .select('user_id, hours, work_type_id, entry_date')
      .eq('organization_id', orgId)
      .gte('entry_date', today.slice(0, 8) + '01'),
    supabase
      .from('subcontractor_invoices')
      .select('id, amount, due_date, paid, project_subcontractor_id, project_subcontractors(subcontractors(company_name))')
      .eq('organization_id', orgId)
      .eq('paid', false),
    listRecurringExpenses(orgId),
  ]);

  const items: TreasuryForecastItem[] = [];

  // --- Factures non soldées : entrées attendues ---------------------------
  const factures = facturesRes.data ?? [];
  if (factures.length) {
    const factureIds = factures.map((f) => f.id);
    const [{ data: fItems }, { data: fPayments }] = await Promise.all([
      supabase.from('facture_items').select('facture_id, quantity, unit_price').in('facture_id', factureIds),
      supabase.from('facture_payments').select('facture_id, amount').in('facture_id', factureIds),
    ]);
    const subtotalByFacture = new Map<string, number>();
    for (const it of fItems ?? []) {
      subtotalByFacture.set(it.facture_id, (subtotalByFacture.get(it.facture_id) ?? 0) + Number(it.quantity) * Number(it.unit_price));
    }
    const paidByFacture = new Map<string, number>();
    for (const p of fPayments ?? []) {
      paidByFacture.set(p.facture_id, (paidByFacture.get(p.facture_id) ?? 0) + Number(p.amount));
    }
    for (const f of factures) {
      const subtotal = subtotalByFacture.get(f.id) ?? 0;
      const total = subtotal * (1 + Number(f.vat_rate) / 100);
      const paid = paidByFacture.get(f.id) ?? 0;
      const remaining = Math.round(Math.max(0, total - paid) * 100) / 100;
      if (remaining <= 0) continue;
      items.push({
        kind: 'facture',
        label: `${f.number ?? 'Facture'} — ${f.client_name}`,
        amount: remaining,
        date: f.due_date,
        overdue: f.due_date < today,
        sourceId: f.id,
      });
    }
  }

  // --- Masse salariale estimée : sortie mensuelle --------------------------
  const profiles = payrollProfilesRes.data ?? [];
  const workTypeRate = new Map((workTypesRes.data ?? []).map((w) => [w.id, Number(w.hourly_rate_chf ?? 0)]));
  const hoursByUser = new Map<string, number>();
  for (const e of timeEntriesRes.data ?? []) {
    const rate = workTypeRate.get(e.work_type_id ?? '') ?? 0;
    hoursByUser.set(e.user_id, (hoursByUser.get(e.user_id) ?? 0) + Number(e.hours) * rate);
  }
  let payrollTotal = 0;
  for (const p of profiles) {
    if (p.salary_type === 'monthly') payrollTotal += Number(p.monthly_salary_chf ?? 0);
    else payrollTotal += hoursByUser.get(p.user_id) ?? 0;
  }
  if (payrollTotal > 0) {
    const payday = nextPayday(today, organization.payroll_payday);
    if (payday <= horizon) {
      items.push({
        kind: 'salaire',
        label: `Masse salariale estimée (${profiles.length} personne${profiles.length > 1 ? 's' : ''})`,
        amount: -Math.round(payrollTotal * 100) / 100,
        date: payday,
        overdue: false,
        sourceId: 'payroll',
      });
    }
  }

  // --- Factures sous-traitants non payées : sorties ------------------------
  for (const inv of subInvoicesRes.data ?? []) {
    if (!inv.amount) continue;
    const companyName = (inv as any).project_subcontractors?.subcontractors?.company_name ?? 'Sous-traitant';
    items.push({
      kind: 'sous-traitant',
      label: companyName,
      amount: -Number(inv.amount),
      date: inv.due_date,
      overdue: !!inv.due_date && inv.due_date < today,
      sourceId: inv.id,
    });
  }

  // --- Dépenses récurrentes : occurrences dans la fenêtre -------------------
  for (const exp of recurringRes) {
    if (!exp.active) continue;
    let occurrence = exp.next_due_date;
    let guard = 0;
    while (occurrence <= horizon && guard < 24) {
      if (occurrence >= today) {
        items.push({
          kind: 'recurrente',
          label: exp.label,
          amount: -Number(exp.amount_chf),
          date: occurrence,
          overdue: false,
          sourceId: exp.id,
        });
      }
      occurrence = nextOccurrence(occurrence, exp.frequency);
      guard += 1;
    }
  }

  items.sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return a.date.localeCompare(b.date);
  });

  const startingBalance = snapshot?.balance_chf ?? 0;
  const timeline: { date: string; balance: number }[] = [];
  let running = startingBalance;
  for (const item of items) {
    if (!item.date) continue;
    running = Math.round((running + item.amount) * 100) / 100;
    timeline.push({ date: item.date, balance: running });
  }

  return {
    startingBalance,
    startingBalanceRecordedAt: snapshot?.recorded_at ?? null,
    timeline,
    items,
  };
}

// Dépenses ponctuelles hors chantier (fournitures, outillage, frais
// divers...) — distinctes des dépenses récurrentes ci-dessus (abonnements
// qui reviennent) et des dépenses de chantier (lib/api/expenses.ts,
// rattachées à un projet pour la rentabilité).
export async function listExpenses(organizationId: string): Promise<Expense[]> {
  const { data } = await supabase
    .from('expenses')
    .select('*')
    .eq('organization_id', organizationId)
    .order('expense_date', { ascending: false });
  return data ?? [];
}

export interface ExpenseInput {
  label: string;
  category: string | null;
  amountChf: number;
  expenseDate: string;
  notes: string | null;
}

export async function createExpense(
  organizationId: string,
  userId: string | undefined,
  input: ExpenseInput,
): Promise<{ id: string | null; error: string | null }> {
  const { data, error } = await supabase
    .from('expenses')
    .insert({
      organization_id: organizationId,
      label: input.label,
      category: input.category,
      amount_chf: input.amountChf,
      expense_date: input.expenseDate,
      notes: input.notes,
      created_by: userId,
    })
    .select('id')
    .single();
  return { id: data?.id ?? null, error: error?.message ?? null };
}

export async function updateExpense(id: string, input: ExpenseInput): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('expenses')
    .update({
      label: input.label,
      category: input.category,
      amount_chf: input.amountChf,
      expense_date: input.expenseDate,
      notes: input.notes,
    })
    .eq('id', id);
  return { error: error?.message ?? null };
}

export async function deleteExpense(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('expenses').delete().eq('id', id);
  return { error: error?.message ?? null };
}

export function upcomingRecurringCount(expenses: RecurringExpense[], withinDays = 7): number {
  const today = isoToday();
  const limit = addDays(today, withinDays);
  return expenses.filter((e) => e.active && e.next_due_date >= today && e.next_due_date <= limit).length;
}
