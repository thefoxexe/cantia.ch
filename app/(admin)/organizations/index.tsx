import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
import type { AdminOrganizationSummary, AdminOrgBillingStatus } from '../../../lib/types';

const PAGE_SIZE = 30;

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
  const [search, setSearch] = useState('');
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

  return (
    <ScrollView>
      <Container style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Entreprises {total > 0 ? `(${total})` : ''}</Text>
          <AdminRefreshButton onPress={() => load(search)} loading={loading} />
        </View>
        <Field label="Rechercher" placeholder="Nom de l'entreprise…" value={search} onChangeText={setSearch} />
        {error ? <AdminErrorBanner message={error} /> : null}
        {loading ? (
          <LoadingScreen label="Chargement…" />
        ) : rows.length === 0 ? (
          <EmptyState title="Aucune entreprise trouvée" subtitle={search ? 'Essayez une autre recherche.' : undefined} />
        ) : (
          <FlatList
            data={rows}
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
