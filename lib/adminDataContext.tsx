import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getDashboardStats, getOrgBillingStatuses, getRevenueOverview, listOrganizations, subscribeToNewOrganizations } from './api/admin';
import { getOrgStatus } from './adminStatus';
import type { AdminDashboardStats, AdminRevenueOverview } from './types';

export interface TrialForecastRow {
  id: string;
  name: string;
  planName: string | null;
  endDate: string;
  days: number;
  // Stripe's real next-invoice amount for this trialing subscription — null
  // when there's no card on file (mostly the legacy 'découverte' plan) or no
  // billing status resolved yet, never a guess from the plan's list price.
  amount: number | null;
  hasCard: boolean;
}

interface AdminData {
  stats: AdminDashboardStats | null;
  overview: AdminRevenueOverview | null;
  // null while still computing, [] once resolved with no trials in flight.
  trialForecast: TrialForecastRow[] | null;
  // True only for the very first fetch, since login/app-resume — the admin
  // layout blocks the whole platform behind a "Calcul en cours…" screen
  // until this flips false, so the money numbers are already sitting there
  // the moment the dashboard renders instead of popping in a beat later.
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  newSignal: boolean;
  refresh: () => Promise<void>;
}

const AdminDataContext = createContext<AdminData | null>(null);

// Every trial is real Stripe trial time (14 days on first checkout, 30 for a
// manual ESSAI30 grant — see stripe-checkout) EXCEPT the legacy 'découverte'
// plan, which carries its own local trial_ends_at never touching Stripe.
// Rather than re-deriving "when does this end" from a hardcoded day count,
// this reads whichever real source already applies per org — the same
// merge the org list/detail pages use.
async function loadTrialForecast(): Promise<TrialForecastRow[]> {
  // Not paginated — at Cantia's current scale (a few dozen orgs) this is one
  // request. Revisit with a dedicated RPC if the org count grows into the
  // hundreds.
  const { rows: orgs } = await listOrganizations('', 200, 0);
  const trialing = orgs.filter((o) => getOrgStatus(o).bucket === 'trialing');
  if (trialing.length === 0) return [];
  const { statuses } = await getOrgBillingStatuses(trialing.map((o) => o.id));
  const rows: TrialForecastRow[] = [];
  for (const o of trialing) {
    const billing = statuses[o.id];
    const endDate = o.trial_ends_at ?? billing?.next_invoice_date ?? null;
    if (!endDate) continue;
    rows.push({
      id: o.id,
      name: o.name,
      planName: o.plan_name,
      endDate,
      days: Math.ceil((new Date(endDate).getTime() - Date.now()) / (24 * 3600 * 1000)),
      amount: billing?.will_be_charged ? billing.next_invoice_amount_chf : null,
      hasCard: billing?.has_payment_method ?? false,
    });
  }
  return rows.sort((a, b) => a.days - b.days);
}

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [overview, setOverview] = useState<AdminRevenueOverview | null>(null);
  const [trialForecast, setTrialForecast] = useState<TrialForecastRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newSignal, setNewSignal] = useState(false);

  const load = useCallback(async () => {
    const [s, ov, tf] = await Promise.all([getDashboardStats(), getRevenueOverview(), loadTrialForecast()]);
    setStats(s.stats);
    setOverview(ov.overview);
    setTrialForecast(tf);
    setError(s.error ?? ov.error);
    setNewSignal(false);
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  // Realtime just flags "there's something new" — it does not refetch on its
  // own, so a burst of signups doesn't hammer the RPCs. The refresh button
  // (and its badge) is the actual trigger.
  useEffect(() => {
    return subscribeToNewOrganizations(() => setNewSignal(true));
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const value = useMemo<AdminData>(
    () => ({ stats, overview, trialForecast, loading, refreshing, error, newSignal, refresh }),
    [stats, overview, trialForecast, loading, refreshing, error, newSignal, refresh],
  );

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>;
}

// Only the dashboard reads this today — every other admin screen fetches its
// own data, scoped to what it shows. Throwing outside the provider is
// deliberate: a silent null would surface as "everything's empty" instead of
// a clear "you forgot to mount the provider" at the call site.
export function useAdminData(): AdminData {
  const ctx = useContext(AdminDataContext);
  if (!ctx) throw new Error('useAdminData must be used within AdminDataProvider');
  return ctx;
}
