import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Container, EmptyState, Field, LoadingScreen } from '../../../components/ui';
import { AdminErrorBanner } from '../../../components/AdminErrorBanner';
import { AdminOrgStatusPill } from '../../../components/AdminOrgStatusPill';
import { AdminRefreshButton } from '../../../components/AdminRefreshButton';
import { InternalTag } from '../../../components/InternalTag';
import { PaymentStatusIcon } from '../../../components/PaymentStatusIcon';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import { getOrgBillingStatuses, listOrganizations } from '../../../lib/api/admin';
import { getOrgStatus, type OrgStatusBucket } from '../../../lib/adminStatus';
import type { AdminOrgBillingStatus, AdminOrganizationSummary } from '../../../lib/types';

const PAGE_SIZE = 50;

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-CH', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Deliberately just lists + counts — the money (MRR, ARR, cash collected,
// growth) all lives on the Dashboard now, one place, so this screen never
// repeats the same figure worded a second way. This page answers one
// question only: "who's on what, and how many."
const STATUS_FILTERS: { key: OrgStatusBucket | null; label: string }[] = [
  { key: null, label: 'Toutes' },
  { key: 'paid', label: 'Payant' },
  { key: 'trialing', label: 'Essai' },
  { key: 'canceled', label: 'Résiliées / archivées' },
  { key: 'past_due', label: 'Paiement en retard' },
  { key: 'complimentary', label: 'Offert' },
  { key: 'plan_selected', label: 'Plan choisi' },
  { key: 'incomplete', label: 'Inscription incomplète' },
];

function StatusCountTile({ label, count, active, onPress }: { label: string; count: number; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.countTile, active && styles.countTileActive]} onPress={onPress}>
      <Text style={[styles.countValue, active && styles.countValueActive]}>{count}</Text>
      <Text style={[styles.countLabel, active && styles.countLabelActive]}>{label}</Text>
    </Pressable>
  );
}

// Reuses admin_list_organizations rather than a separate RPC/table — the
// subscription-relevant fields (plan, subscription_status, trial_ends_at)
// already live on organizations, no need for a parallel billing view.
export default function AdminSubscriptionsList() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrgStatusBucket | null>(null);
  const [planFilter, setPlanFilter] = useState<string | null>(null);
  const [rows, setRows] = useState<AdminOrganizationSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [billing, setBilling] = useState<Record<string, AdminOrgBillingStatus>>({});

  const load = useCallback(async (query: string) => {
    setLoading(true);
    const { rows: r, total: t, error: err } = await listOrganizations(query, PAGE_SIZE, 0);
    setRows(r);
    setTotal(t);
    setError(err);
    setLoading(false);
    getOrgBillingStatuses(r.map((o) => o.id)).then(({ statuses }) => setBilling(statuses));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => load(search), 250);
    return () => clearTimeout(timer);
  }, [search, load]);

  // Computed over the currently loaded page (search-filtered, up to
  // PAGE_SIZE) — same honest-count caveat as the Entreprises list.
  const countsByBucket = useMemo(() => {
    const counts = new Map<OrgStatusBucket, number>();
    for (const o of rows) {
      const bucket = getOrgStatus(o).bucket;
      counts.set(bucket, (counts.get(bucket) ?? 0) + 1);
    }
    return counts;
  }, [rows]);

  const plans = useMemo(() => Array.from(new Map(rows.map((o) => [o.plan_id, o.plan_name])).entries()), [rows]);
  const filteredRows = useMemo(() => {
    let base = rows;
    if (statusFilter) base = base.filter((o) => getOrgStatus(o).bucket === statusFilter);
    if (planFilter) base = base.filter((o) => o.plan_id === planFilter);
    return base;
  }, [rows, statusFilter, planFilter]);

  return (
    // style={{ flex: 1 }} is required here: a bare <ScrollView> inside this
    // layout's flex:1/minHeight:0 content column doesn't reliably get a
    // constrained height on web, so it never gets a scrollable viewport —
    // the page just silently doesn't scroll once content overflows.
    <ScrollView style={{ flex: 1 }}>
      <Container style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Abonnements {total > 0 ? `(${total})` : ''}</Text>
          <AdminRefreshButton onPress={() => load(search)} loading={loading} />
        </View>

        {/* flexWrap, not a horizontal ScrollView — a horizontal scroller
            nested inside this page's outer vertical ScrollView captured the
            touch/wheel gesture wherever it started, locking the page
            mid-scroll (the same bug the Entreprises list had). */}
        <View style={styles.countRow}>
          {STATUS_FILTERS.map((f) => (
            <StatusCountTile
              key={f.label}
              label={f.label}
              count={f.key ? countsByBucket.get(f.key) ?? 0 : total}
              active={statusFilter === f.key}
              onPress={() => setStatusFilter(f.key)}
            />
          ))}
        </View>

        <Field label="Rechercher" placeholder="Nom de l'entreprise…" value={search} onChangeText={setSearch} />
        {plans.length > 1 ? (
          <View style={styles.planFilterRow}>
            <Pressable style={[styles.planChip, !planFilter && styles.planChipActive]} onPress={() => setPlanFilter(null)}>
              <Text style={[styles.planChipText, !planFilter && styles.planChipTextActive]}>Tous les plans</Text>
            </Pressable>
            {plans.map(([id, name]) => (
              <Pressable key={id} style={[styles.planChip, planFilter === id && styles.planChipActive]} onPress={() => setPlanFilter(id)}>
                <Text style={[styles.planChipText, planFilter === id && styles.planChipTextActive]}>{name}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
        {error ? <AdminErrorBanner message={error} /> : null}
        {loading ? (
          <LoadingScreen label="Chargement…" />
        ) : filteredRows.length === 0 ? (
          <EmptyState title="Aucune entreprise trouvée" />
        ) : (
          <View style={styles.list}>
            {filteredRows.map((org) => {
              const orgBilling = billing[org.id];
              // Legacy trial_ends_at (the 'découverte' plan's own local
              // countdown) vs. Stripe's real next-invoice date for an actual
              // 'trialing' subscription — whichever one applies to this org.
              const trialEndDate = org.trial_ends_at ?? (org.subscription_status === 'trialing' ? orgBilling?.next_invoice_date ?? null : null);
              return (
                <Pressable
                  key={org.id}
                  style={[styles.row, org.is_internal && styles.rowInternal]}
                  onPress={() => router.push(`/(admin)/organizations/${org.id}` as any)}
                >
                  <View style={{ flex: 1 }}>
                    <View style={styles.rowTitleLine}>
                      <Text style={styles.rowTitle}>{org.name}</Text>
                      {org.is_internal && org.internal_label ? <InternalTag label={org.internal_label} /> : null}
                    </View>
                    <Text style={styles.rowSubtitle}>{org.plan_name}</Text>
                  </View>
                  <PaymentStatusIcon status={orgBilling} />
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <AdminOrgStatusPill org={org} />
                    {trialEndDate ? <Text style={styles.rowMeta}>Jusqu'au {formatDate(trialEndDate)}</Text> : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </Container>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
  },
  countRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  countTile: {
    minWidth: 96,
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  countTileActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  countValue: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  countValueActive: {
    color: '#fff',
  },
  countLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  countLabelActive: {
    color: 'rgba(255,255,255,0.85)',
  },
  list: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  planFilterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  planChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  planChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  planChipText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textMuted,
  },
  planChipTextActive: {
    color: '#fff',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  rowInternal: {
    opacity: 0.55,
  },
  rowTitleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rowTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  rowSubtitle: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  rowMeta: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
});
