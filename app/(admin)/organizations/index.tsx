import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Container, EmptyState, Field, LoadingScreen } from '../../../components/ui';
import { AdminErrorBanner } from '../../../components/AdminErrorBanner';
import { InternalTag } from '../../../components/InternalTag';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import { listOrganizations } from '../../../lib/api/admin';
import type { AdminOrganizationSummary } from '../../../lib/types';

const PAGE_SIZE = 30;

function Row({ org, onPress }: { org: AdminOrganizationSummary; onPress: () => void }) {
  const isTrial = !!org.trial_ends_at && new Date(org.trial_ends_at).getTime() > Date.now();
  const statusLabel = org.subscription_status === 'active' ? 'Payant' : isTrial ? 'Essai' : org.plan_selected ? 'Actif' : 'Sans plan';
  const statusColor = org.subscription_status === 'active' ? colors.success : isTrial ? colors.warning : colors.textMuted;
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
      <View style={[styles.statusPill, { backgroundColor: `${statusColor}22` }]}>
        <Text style={[styles.statusPillText, { color: statusColor }]}>{statusLabel}</Text>
      </View>
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

  const load = useCallback(async (query: string) => {
    setLoading(true);
    const { rows: r, total: t, error: err } = await listOrganizations(query, PAGE_SIZE, 0);
    setRows(r);
    setTotal(t);
    setError(err);
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => load(search), 250);
    return () => clearTimeout(timer);
  }, [search, load]);

  return (
    <Container style={styles.container}>
      <Text style={styles.title}>Entreprises {total > 0 ? `(${total})` : ''}</Text>
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
          renderItem={({ item }) => <Row org={item} onPress={() => router.push(`/(admin)/organizations/${item.id}` as any)} />}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          scrollEnabled={false}
        />
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.lg,
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
  statusPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  statusPillText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
});
