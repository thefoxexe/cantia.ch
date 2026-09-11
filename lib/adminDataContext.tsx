import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getDashboardStats, getRevenueOverview, subscribeToNewOrganizations } from './api/admin';
import type { AdminDashboardStats, AdminRevenueOverview } from './types';

interface AdminData {
  stats: AdminDashboardStats | null;
  overview: AdminRevenueOverview | null;
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

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [overview, setOverview] = useState<AdminRevenueOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newSignal, setNewSignal] = useState(false);

  const load = useCallback(async () => {
    const [s, ov] = await Promise.all([getDashboardStats(), getRevenueOverview()]);
    setStats(s.stats);
    setOverview(ov.overview);
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
    () => ({ stats, overview, loading, refreshing, error, newSignal, refresh }),
    [stats, overview, loading, refreshing, error, newSignal, refresh],
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
