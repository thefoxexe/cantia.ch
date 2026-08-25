import { useCallback, useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Container, LoadingScreen } from '../../components/ui';
import { colors, fontSize, radius, spacing } from '../../lib/theme';
import { getDashboardStats, listOrganizations, subscribeToNewOrganizations } from '../../lib/api/admin';
import type { AdminDashboardStats, AdminOrganizationSummary } from '../../lib/types';

function StatTile({ label, value, icon }: { label: string; value: number; icon: keyof typeof Feather.glyphMap }) {
  return (
    <View style={styles.tile}>
      <View style={styles.tileIcon}>
        <Feather name={icon} size={16} color={colors.primary} />
      </View>
      <Text style={styles.tileValue}>{value.toLocaleString('fr-CH')}</Text>
      <Text style={styles.tileLabel}>{label}</Text>
    </View>
  );
}

function OrgRow({ org, onPress }: { org: AdminOrganizationSummary; onPress: () => void }) {
  const isTrial = !!org.trial_ends_at && new Date(org.trial_ends_at).getTime() > Date.now();
  const statusLabel = org.subscription_status === 'active' ? 'Payant' : isTrial ? 'Essai' : org.plan_selected ? 'Actif' : 'Sans plan';
  const statusColor = org.subscription_status === 'active' ? colors.success : isTrial ? colors.warning : colors.textMuted;
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{org.name}</Text>
        <Text style={styles.rowSubtitle}>
          {org.owner_email ?? 'Sans propriétaire'} · {org.member_count} membre{org.member_count > 1 ? 's' : ''}
        </Text>
      </View>
      <View style={[styles.statusPill, { backgroundColor: `${statusColor}22` }]}>
        <Text style={[styles.statusPillText, { color: statusColor }]}>{statusLabel}</Text>
      </View>
      <Feather name="chevron-right" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [recent, setRecent] = useState<AdminOrganizationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newSignal, setNewSignal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [s, orgs] = await Promise.all([getDashboardStats(), listOrganizations('', 8, 0)]);
    setStats(s.stats);
    setRecent(orgs.rows);
    setError(s.error ?? orgs.error);
    setNewSignal(false);
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  // Realtime just flags "there's something new" — it does not refetch on
  // its own, so a burst of signups doesn't hammer the RPCs. The manual
  // "Actualiser" button (and the badge below) is the actual refresh trigger.
  useEffect(() => {
    return subscribeToNewOrganizations(() => setNewSignal(true));
  }, []);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  if (loading) return <LoadingScreen label="Chargement du tableau de bord…" />;

  return (
    <ScrollView contentContainerStyle={styles.scroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <Container style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Dashboard</Text>
          <Pressable style={styles.refreshButton} onPress={onRefresh}>
            {newSignal ? <View style={styles.refreshDot} /> : null}
            <Feather name="refresh-cw" size={14} color={colors.text} />
            <Text style={styles.refreshButtonText}>Actualiser</Text>
          </Pressable>
        </View>

        {error ? (
          <View style={styles.errorBanner}>
            <Feather name="alert-triangle" size={14} color={colors.danger} />
            <Text style={styles.errorBannerText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.grid}>
          <StatTile label="Entreprises" value={stats?.organizations_count ?? 0} icon="briefcase" />
          <StatTile label="Utilisateurs" value={stats?.users_count ?? 0} icon="users" />
          <StatTile label="Essais actifs" value={stats?.active_trials_count ?? 0} icon="clock" />
          <StatTile label="Abonnements payants" value={stats?.paid_subscriptions_count ?? 0} icon="credit-card" />
          <StatTile label="Inscriptions aujourd'hui" value={stats?.signups_today_count ?? 0} icon="user-plus" />
          <StatTile label="Entreprises créées aujourd'hui" value={stats?.organizations_created_today_count ?? 0} icon="plus-circle" />
        </View>

        <Text style={styles.sectionTitle}>Dernières inscriptions</Text>
        <View style={styles.list}>
          {recent.length === 0 ? (
            <Text style={styles.emptyText}>Aucune entreprise pour le moment.</Text>
          ) : (
            recent.map((org) => <OrgRow key={org.id} org={org} onPress={() => router.push(`/(admin)/organizations/${org.id}` as any)} />)
          )}
        </View>
      </Container>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
  },
  container: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  refreshDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  refreshButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  tile: {
    minWidth: 180,
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  tileIcon: {
    width: 30,
    height: 30,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  tileValue: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  tileLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
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
  statusPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  statusPillText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.xl,
  },
  errorBannerText: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.danger,
  },
});
