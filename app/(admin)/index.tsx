import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Container, LoadingScreen } from '../../components/ui';
import { AdminErrorBanner } from '../../components/AdminErrorBanner';
import { AdminRefreshButton } from '../../components/AdminRefreshButton';
import { InternalTag } from '../../components/InternalTag';
import { GrowthChart } from '../../components/GrowthChart';
import { colors, fontSize, radius, spacing } from '../../lib/theme';
import { getDashboardStats, getRevenueOverview, listOrganizations, subscribeToNewOrganizations } from '../../lib/api/admin';
import type { AdminDashboardStats, AdminOrganizationSummary, AdminRevenueOverview } from '../../lib/types';

function formatChf(amount: number): string {
  return new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF', maximumFractionDigits: 0 }).format(amount);
}

function StatTile({ label, value, icon, accent }: { label: string; value: number | string; icon: keyof typeof Feather.glyphMap; accent?: string }) {
  return (
    <View style={styles.tile}>
      <View style={[styles.tileIcon, accent ? { backgroundColor: `${accent}22` } : null]}>
        <Feather name={icon} size={16} color={accent ?? colors.primary} />
      </View>
      <Text style={[styles.tileValue, accent ? { color: accent } : null]}>{typeof value === 'number' ? value.toLocaleString('fr-CH') : value}</Text>
      <Text style={styles.tileLabel}>{label}</Text>
    </View>
  );
}

function SectionHeading({ title, action }: { title: string; action?: { label: string; href: string } }) {
  return (
    <View style={styles.sectionHeading}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? (
        <Link href={action.href as any} asChild>
          <Pressable>
            <Text style={styles.sectionAction}>{action.label} →</Text>
          </Pressable>
        </Link>
      ) : null}
    </View>
  );
}

function OrgRow({ org, onPress }: { org: AdminOrganizationSummary; onPress: () => void }) {
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
  const [overview, setOverview] = useState<AdminRevenueOverview | null>(null);
  const [recent, setRecent] = useState<AdminOrganizationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newSignal, setNewSignal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [s, ov, orgs] = await Promise.all([getDashboardStats(), getRevenueOverview(), listOrganizations('', 8, 0)]);
    setStats(s.stats);
    setOverview(ov.overview);
    setRecent(orgs.rows);
    setError(s.error ?? ov.error ?? orgs.error);
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
    <ScrollView contentContainerStyle={styles.scroll}>
      <Container style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Dashboard</Text>
          <AdminRefreshButton onPress={onRefresh} loading={refreshing} hasSignal={newSignal} />
        </View>

        {error ? <AdminErrorBanner message={error} /> : null}

        <SectionHeading title="Croissance" />
        <View style={styles.grid}>
          <StatTile label="Entreprises" value={stats?.organizations_count ?? 0} icon="briefcase" />
          <StatTile label="Utilisateurs" value={stats?.users_count ?? 0} icon="users" />
          <StatTile label="Inscriptions aujourd'hui" value={stats?.signups_today_count ?? 0} icon="user-plus" />
          <StatTile label="Entreprises créées aujourd'hui" value={stats?.organizations_created_today_count ?? 0} icon="plus-circle" />
        </View>

        <SectionHeading title="Abonnements" action={{ label: 'Voir le détail', href: '/(admin)/subscriptions' }} />
        <View style={styles.grid}>
          <StatTile label="Essais actifs" value={stats?.active_trials_count ?? 0} icon="clock" accent={colors.warning} />
          <StatTile label="Abonnements payants" value={stats?.paid_subscriptions_count ?? 0} icon="credit-card" accent={colors.success} />
        </View>

        {overview ? (
          <>
            <SectionHeading title="Argent" action={{ label: 'Voir le détail', href: '/(admin)/subscriptions' }} />
            <View style={styles.grid}>
              <StatTile label="Encaissé ce mois" value={formatChf(overview.ca_this_month_chf)} icon="calendar" accent={colors.success} />
              <StatTile label="MRR actif" value={formatChf(overview.mrr_active_chf)} icon="trending-up" />
              <StatTile label="ARR" value={formatChf(overview.arr_chf)} icon="bar-chart-2" />
            </View>

            {overview.by_plan.length > 0 ? (
              <View style={styles.planList}>
                {overview.by_plan.map((p) => (
                  <View key={p.plan_id} style={styles.planRow}>
                    <Text style={styles.planName}>{p.plan_name}</Text>
                    <Text style={styles.planMeta}>
                      {p.active_count} payant{p.active_count > 1 ? 's' : ''}
                      {p.trialing_count > 0 ? ` · ${p.trialing_count} en essai` : ''}
                    </Text>
                    <Text style={styles.planValue}>{formatChf(p.mrr_chf)}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            <GrowthChart points={overview.timeseries} />
          </>
        ) : null}

        <SectionHeading title="Dernières inscriptions" action={{ label: 'Voir toutes les entreprises', href: '/(admin)/organizations' }} />
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  tile: {
    minWidth: 170,
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
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  sectionAction: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.primary,
  },
  planList: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  planName: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
    minWidth: 90,
  },
  planMeta: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  planValue: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.primary,
    fontVariant: ['tabular-nums'],
  },
  list: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
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
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
});
