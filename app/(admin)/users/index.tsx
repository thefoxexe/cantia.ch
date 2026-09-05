import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Container, EmptyState, Field, LoadingScreen } from '../../../components/ui';
import { AdminErrorBanner } from '../../../components/AdminErrorBanner';
import { AdminRefreshButton } from '../../../components/AdminRefreshButton';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import { listUsers } from '../../../lib/api/admin';
import type { AdminUserSummary } from '../../../lib/types';

const PAGE_SIZE = 50;

function formatDate(iso: string | null): string {
  if (!iso) return 'jamais';
  return new Date(iso).toLocaleString('fr-CH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function MiniStat({ label, value, icon, accent }: { label: string; value: number; icon: keyof typeof Feather.glyphMap; accent?: string }) {
  return (
    <View style={styles.miniTile}>
      <View style={[styles.miniIcon, accent ? { backgroundColor: `${accent}1c` } : null]}>
        <Feather name={icon} size={15} color={accent ?? colors.textMuted} />
      </View>
      <View>
        <Text style={styles.miniValue}>{value.toLocaleString('fr-CH')}</Text>
        <Text style={styles.miniLabel}>{label}</Text>
      </View>
    </View>
  );
}

export default function AdminUsersList() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState<AdminUserSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (query: string) => {
    setLoading(true);
    const { rows: r, total: t, error: err } = await listUsers(query, PAGE_SIZE, 0);
    setRows(r);
    setTotal(t);
    setError(err);
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => load(search), 250);
    return () => clearTimeout(timer);
  }, [search, load]);

  // Computed over the currently loaded page (search-filtered, up to
  // PAGE_SIZE) — an honest read on real activity rather than a fabricated
  // "engagement rate" that would need event history we don't track.
  const activeLast7d = useMemo(
    () => rows.filter((u) => u.last_sign_in_at && Date.now() - new Date(u.last_sign_in_at).getTime() < 7 * 24 * 3600 * 1000).length,
    [rows],
  );
  const neverSignedIn = useMemo(() => rows.filter((u) => !u.last_sign_in_at).length, [rows]);

  return (
    <ScrollView>
      <Container style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Utilisateurs {total > 0 ? `(${total})` : ''}</Text>
          <AdminRefreshButton onPress={() => load(search)} loading={loading} />
        </View>
        {!loading && rows.length > 0 ? (
          <View style={styles.miniGrid}>
            <MiniStat label="Actifs (7 derniers jours)" value={activeLast7d} icon="activity" accent={colors.success} />
            <MiniStat label="Jamais connectés" value={neverSignedIn} icon="user-x" accent={neverSignedIn > 0 ? colors.warning : undefined} />
          </View>
        ) : null}
        <Field label="Rechercher" placeholder="Nom ou e-mail…" value={search} onChangeText={setSearch} />
        {error ? <AdminErrorBanner message={error} /> : null}
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
                <Text style={styles.rowTitle} numberOfLines={1}>{u.full_name || u.email}</Text>
                <Text style={styles.rowSubtitle} numberOfLines={1}>
                  {u.email} · {u.organization_name} · {u.role}
                </Text>
                <View style={styles.rowFooter}>
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
  miniGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  miniTile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minWidth: 170,
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  miniIcon: {
    width: 30,
    height: 30,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniValue: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  miniLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: '600',
  },
  list: {
    gap: spacing.sm,
  },
  row: {
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
  rowFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  rowMeta: {
    fontSize: 11,
    color: colors.textMuted,
  },
});
