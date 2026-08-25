import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Container, EmptyState, Field, LoadingScreen } from '../../../components/ui';
import { AdminErrorBanner } from '../../../components/AdminErrorBanner';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import { listOrganizations } from '../../../lib/api/admin';
import type { AdminOrganizationSummary } from '../../../lib/types';

const PAGE_SIZE = 50;

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-CH', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Reuses admin_list_organizations rather than a separate RPC/table — the
// subscription-relevant fields (plan, subscription_status, trial_ends_at)
// already live on organizations, no need for a parallel billing view.
export default function AdminSubscriptionsList() {
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
    <ScrollView>
      <Container style={styles.container}>
        <Text style={styles.title}>Abonnements {total > 0 ? `(${total})` : ''}</Text>
        <Field label="Rechercher" placeholder="Nom de l'entreprise…" value={search} onChangeText={setSearch} />
        {error ? <AdminErrorBanner message={error} /> : null}
        {loading ? (
          <LoadingScreen label="Chargement…" />
        ) : rows.length === 0 ? (
          <EmptyState title="Aucune entreprise trouvée" />
        ) : (
          <View style={styles.list}>
            {rows.map((org) => {
              const isTrial = !!org.trial_ends_at && new Date(org.trial_ends_at).getTime() > Date.now();
              return (
                <Pressable key={org.id} style={styles.row} onPress={() => router.push(`/(admin)/organizations/${org.id}` as any)}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>{org.name}</Text>
                    <Text style={styles.rowSubtitle}>{org.plan_name}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.rowMeta}>{org.subscription_status ?? (isTrial ? 'Essai' : 'Sans abonnement')}</Text>
                    {isTrial ? <Text style={styles.rowMeta}>Jusqu'au {formatDate(org.trial_ends_at)}</Text> : null}
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
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  list: {
    gap: spacing.sm,
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
