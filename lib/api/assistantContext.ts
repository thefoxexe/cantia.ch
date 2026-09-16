import { supabase } from '../supabase';
import type { Organization } from '../types';
import type { AssistantContext } from './ai';
import { listRecurringExpenses, upcomingRecurringCount } from './treasury';

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(fromIso: string, toIso: string): number {
  const from = new Date(`${fromIso}T00:00:00Z`).getTime();
  const to = new Date(`${toIso}T00:00:00Z`).getTime();
  return Math.max(0, Math.round((from - to) / 86400000));
}

// Assembles the same real-business-data snapshot the assistant's "question"
// answering step is allowed to see — a subset of what the dashboard and
// factures list already query, kept intentionally small (tasks + overdue
// factures + revenue + org info + one treasury count) rather than a full
// read of everything, since this whole bundle gets sent to the AI on every
// question. RLS already scopes every query to organizationId's own data.
//
// canViewFinances gates the factures/payments reads entirely — someone
// asking "combien j'ai facturé ce mois-ci" as a plain member without
// finance permission gets financialDataHidden: true instead of a query
// that RLS would silently return empty anyway (that'd look like "CHF 0",
// not "you don't have access"). This is a client-side convenience on top
// of RLS (can_view_org_finances), not a replacement for it.
export async function buildAssistantContext(
  organization: Organization,
  planName: string | null,
  treasuryEnabled: boolean,
  canViewFinances: boolean,
  categoryLabel: (category: string) => string,
): Promise<AssistantContext> {
  const [tasksRes, facturesRes] = await Promise.all([
    supabase
      .from('dashboard_tasks')
      .select('title, category')
      .eq('organization_id', organization.id)
      .eq('done', false)
      .order('created_at', { ascending: false }),
    canViewFinances
      ? supabase
          .from('factures')
          .select('id, client_name, due_date, status, vat_rate')
          .eq('organization_id', organization.id)
          .in('status', ['sent', 'partial'])
      : Promise.resolve({ data: [] as { id: string; client_name: string; due_date: string; status: string; vat_rate: number }[] }),
  ]);

  const openTasksRows = (tasksRes.data ?? []) as { title: string; category: string }[];
  const openTasks = openTasksRows.slice(0, 20).map((t) => ({ title: t.title, category: categoryLabel(t.category) }));

  const today = todayIso();
  const overdueRows = ((facturesRes.data ?? []) as { id: string; client_name: string; due_date: string; vat_rate: number }[]).filter(
    (f) => f.due_date < today,
  );

  let overdueFactures: AssistantContext['overdueFactures'] = [];
  let overdueTotalChf = 0;
  if (overdueRows.length) {
    const ids = overdueRows.map((f) => f.id);
    const { data: itemsData } = await supabase.from('facture_items').select('facture_id, quantity, unit_price').in('facture_id', ids);
    const subtotalByFacture = new Map<string, number>();
    for (const it of itemsData ?? []) {
      subtotalByFacture.set(it.facture_id, (subtotalByFacture.get(it.facture_id) ?? 0) + Number(it.quantity) * Number(it.unit_price));
    }
    const withAmounts = overdueRows.map((f) => {
      const amountChf = (subtotalByFacture.get(f.id) ?? 0) * (1 + Number(f.vat_rate) / 100);
      overdueTotalChf += amountChf;
      return { clientName: f.client_name, amountChf, daysOverdue: daysBetween(today, f.due_date) };
    });
    overdueFactures = withAmounts.sort((a, b) => b.daysOverdue - a.daysOverdue).slice(0, 20);
  }

  // "Chiffre d'affaires ce mois-ci" — encashed revenue (payments actually
  // received), not invoiced amount: the sum of facture_payments dated this
  // calendar month across the org's factures.
  let revenueThisMonthChf = 0;
  if (canViewFinances) {
    const monthStart = new Date();
    monthStart.setUTCDate(1);
    monthStart.setUTCHours(0, 0, 0, 0);
    const { data: factureIdRows } = await supabase.from('factures').select('id').eq('organization_id', organization.id);
    const factureIds = (factureIdRows ?? []).map((f) => f.id as string);
    if (factureIds.length) {
      const { data: paymentsRows } = await supabase
        .from('facture_payments')
        .select('amount')
        .in('facture_id', factureIds)
        .gte('paid_at', monthStart.toISOString());
      revenueThisMonthChf = (paymentsRows ?? []).reduce((sum, p) => sum + Number((p as { amount: number }).amount), 0);
    }
  }

  let upcomingRecurringExpensesCount: number | null = null;
  if (treasuryEnabled) {
    const recurring = await listRecurringExpenses(organization.id);
    upcomingRecurringExpensesCount = upcomingRecurringCount(recurring);
  }

  const addressParts = [organization.street, [organization.postal_code, organization.locality].filter(Boolean).join(' ')].filter(
    (p): p is string => !!p && p.trim().length > 0,
  );

  return {
    orgName: organization.name,
    orgTrade: organization.trade ?? null,
    orgAddress: addressParts.length ? addressParts.join(', ') : null,
    orgPhone: organization.phone ?? null,
    orgEmail: organization.email ?? null,
    planName,
    openTasks,
    openTasksCount: openTasksRows.length,
    overdueFactures,
    overdueCount: overdueRows.length,
    overdueTotalChf,
    revenueThisMonthChf,
    upcomingRecurringExpensesCount,
    financialDataHidden: !canViewFinances,
  };
}
