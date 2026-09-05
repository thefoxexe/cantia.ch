import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
import type { AdminOrganizationSummary, AdminOrgBillingStatus } from '../../../lib/types';

const PAGE_SIZE = 30;

const STATUS_FILTERS: { key: OrgStatusBucket | null; label: string }[] = [
  { key: null, label: 'Toutes' },
  { key: 'paid', label: 'Payant' },
  { key: 'trialing', label: 'Essai' },
  { key: 'incomplete', label: 'Inscription incomplète' },
  { key: 'plan_selected', label: 'Plan choisi' },
  { key: 'past_due', label: 'Paiement en retard' },
];

type SortKey = 'recent' | 'name' | 'members';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'recent', label: 'Plus récentes' },
  { key: 'name', label: 'Nom' },
  { key: 'members', label: 'Plus de membres' },
];

function Row({ org, billing, onPress }: { org: AdminOrganizationSummary; billing: AdminOrgBillingStatus | undefined; onPress: () => void }) {
  return (
    <Pressable style={[styles.row, org.is_internal && styles.rowInternal]} onPress={onPress}>
      <View style={{ flex: 1 }}>
        <View style={styles.rowTitleLine}>
          <Text style={styles.rowTitle}>{org.name}</Text>
          {org.is_internal && org.internal_label ? <InternalTag label={org.internal_label} /> : null}
        </View>
        <Text style={styles.rowSubtitle}>
          {org.owner_email ?? 'Sans propriétaire'} · {org.plan_name} · {org.member_count} membre{org.member_count > 1 ? 's' : ''}
          {org.private_modules_count > 0 ? ` · ${org.private_modules_count} module${org.private_modules_count > 1 ? 's' : ''} privé${org.private_modules_count > 1 ? 's' : ''}` : ''}
        </Text>
      </View>
      <PaymentStatusIcon status={billing} />
      <AdminOrgStatusPill org={org} />
      <Feather name="chevron-right" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

export default function AdminOrganizationsList() {
  const router = useRouter();
  const { status: statusParam } = useLocalSearchParams<{ status?: string }>();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrgStatusBucket | null>((statusParam as OrgStatusBucket) ?? null);
  const [sortBy, setSortBy] = useState<SortKey>('recent');
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
    // Non-blocking: the list renders immediately, real Stripe payment-method
    // status trickles in a moment later once this bulk call resolves.
    getOrgBillingStatuses(r.map((o) => o.id)).then(({ statuses }) => setBilling(statuses));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => load(search), 250);
    return () => clearTimeout(timer);
  }, [search, load]);

  // The status filter runs client-side over this single already-fetched page
  // (PAGE_SIZE=30, comfortably above the real org count today) — it does not
  // ask the server for a second page of a given status once totals grow past
  // that.
  const filteredRows = useMemo(() => {
    const base = statusFilter ? rows.filter((o) => getOrgStatus(o).bucket === statusFilter) : rows;
    const sorted = [...base];
    if (sortBy === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name, 'fr-CH'));
    else if (sortBy === 'members') sorted.sort((a, b) => b.member_count - a.member_count);
    else sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return sorted;
  }, [rows, statusFilter, sortBy]);

  return (
    <ScrollView>
      <Container style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Entreprises {total > 0 ? `(${total})` : ''}</Text>
          <AdminRefreshButton onPress={() => load(search)} loading={loading} />
        </View>
        <Field label="Rechercher" placeholder="Nom de l'entreprise…" value={search} onChangeText={setSearch} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {STATUS_FILTERS.map((f) => (
            <Pressable
              key={f.label}
              style={[styles.filterChip, statusFilter === f.key && styles.filterChipActive]}
              onPress={() => setStatusFilter(f.key)}
            >
              <Text style={[styles.filterChipText, statusFilter === f.key && styles.filterChipTextActive]}>{f.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
        <View style={styles.sortRow}>
          <Text style={styles.sortLabel}>Trier :</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortChipRow}>
            {SORT_OPTIONS.map((s) => (
              <Pressable
                key={s.key}
                style={[styles.filterChip, sortBy === s.key && styles.filterChipActive]}
                onPress={() => setSortBy(s.key)}
              >
                <Text style={[styles.filterChipText, sortBy === s.key && styles.filterChipTextActive]}>{s.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
        {error ? <AdminErrorBanner message={error} /> : null}
        {loading ? (
          <LoadingScreen label="Chargement…" />
        ) : filteredRows.length === 0 ? (
          <EmptyState
            title="Aucune entreprise trouvée"
            subtitle={search ? 'Essayez une autre recherche.' : statusFilter ? 'Aucune entreprise dans ce statut.' : undefined}
          />
        ) : (
          <FlatList
            data={filteredRows}
            keyExtractor={(o) => o.id}
            renderItem={({ item }) => (
              <Row org={item} billing={billing[item.id]} onPress={() => router.push(`/(admin)/organizations/${item.id}` as any)} />
            )}
            ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
            scrollEnabled={false}
          />
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
  filterRow: {
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  sortLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textMuted,
  },
  sortChipRow: {
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textMuted,
  },
  filterChipTextActive: {
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
});
