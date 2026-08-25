import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Container, EmptyState, Field, LoadingScreen } from '../../../components/ui';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import { listUsers } from '../../../lib/api/admin';
import type { AdminUserSummary } from '../../../lib/types';

const PAGE_SIZE = 50;

function formatDate(iso: string | null): string {
  if (!iso) return 'jamais';
  return new Date(iso).toLocaleDateString('fr-CH', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminUsersList() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState<AdminUserSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (query: string) => {
    setLoading(true);
    const { rows: r, total: t } = await listUsers(query, PAGE_SIZE, 0);
    setRows(r);
    setTotal(t);
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => load(search), 250);
    return () => clearTimeout(timer);
  }, [search, load]);

  return (
    <ScrollView>
      <Container style={styles.container}>
        <Text style={styles.title}>Utilisateurs {total > 0 ? `(${total})` : ''}</Text>
        <Field label="Rechercher" placeholder="Nom ou e-mail…" value={search} onChangeText={setSearch} />
        {loading ? (
          <LoadingScreen label="Chargement…" />
        ) : rows.length === 0 ? (
          <EmptyState title="Aucun utilisateur trouvé" />
        ) : (
          <View style={styles.list}>
            {rows.map((u) => (
              <Pressable
                key={`${u.user_id}-${u.organization_id}`}
                style={styles.row}
                onPress={() => router.push(`/(admin)/organizations/${u.organization_id}` as any)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>{u.full_name || u.email}</Text>
                  <Text style={styles.rowSubtitle}>
                    {u.email} · {u.organization_name} · {u.role}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.rowMeta}>Inscrit le {formatDate(u.created_at)}</Text>
                  <Text style={styles.rowMeta}>Vu le {formatDate(u.last_sign_in_at)}</Text>
                </View>
              </Pressable>
            ))}
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
  },
});
