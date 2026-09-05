import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Container, LoadingScreen } from '../../components/ui';
import { AdminErrorBanner } from '../../components/AdminErrorBanner';
import { AdminRefreshButton } from '../../components/AdminRefreshButton';
import { AdminSignupFunnel } from '../../components/AdminSignupFunnel';
import { StatSparkline } from '../../components/StatSparkline';
import { colors, fontSize, radius, spacing } from '../../lib/theme';
import {
  getDashboardStats,
  getRevenueOverview,
  getSiteTraffic,
  listModules,
  listTutorialChapters,
  subscribeToNewOrganizations,
} from '../../lib/api/admin';
import type { AdminDashboardStats, AdminRevenueOverview, AdminSiteTrafficOverview } from '../../lib/types';

function formatChf(amount: number): string {
  return new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF', maximumFractionDigits: 0 }).format(amount);
}

function SectionHeading({ title, subtitle, action }: { title: string; subtitle?: string; action?: { label: string; href: string } }) {
  return (
    <View style={styles.sectionHeading}>
      <View style={{ flex: 1 }}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      </View>
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

// The one number a section leads with — value + genuine trend (a real delta,
// never a % computed from tiny counts) + a sparkline. Per the dataviz stat-
// tile spec: everything else on the dashboard is a plain secondary tile: this
// is the only shape that earns the extra visual weight.
function HeroStatCard({
  label,
  value,
  icon,
  accent = colors.primary,
  deltaText,
  sparkline,
  footnote,
}: {
  label: string;
  value: number;
  icon: keyof typeof Feather.glyphMap;
  accent?: string;
  deltaText?: string;
  sparkline?: number[];
  footnote?: string;
}) {
  return (
    <View style={styles.hero}>
      <View style={styles.heroTop}>
        <View style={[styles.heroIcon, { backgroundColor: `${accent}1c` }]}>
          <Feather name={icon} size={20} color={accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.heroLabel}>{label}</Text>
          <Text style={styles.heroValue}>{value.toLocaleString('fr-CH')}</Text>
        </View>
        {deltaText ? (
          <View style={styles.deltaChip}>
            <Feather name="arrow-up-right" size={11} color={colors.success} />
            <Text style={styles.deltaChipText}>{deltaText}</Text>
          </View>
        ) : null}
      </View>
      {sparkline && sparkline.length > 1 ? <StatSparkline values={sparkline} color={accent} /> : null}
      {footnote ? <Text style={styles.heroFootnote}>{footnote}</Text> : null}
    </View>
  );
}

function MiniTile({ label, value, icon, accent }: { label: string; value: number; icon: keyof typeof Feather.glyphMap; accent?: string }) {
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

// A shortcut card, not another list: "combien" + "va voir le détail", for
// screens (Modules, Tutoriels) that already have their own dedicated tab —
// the dashboard doesn't need to re-render their content, just point at it.
function NavTile({ label, value, icon, href }: { label: string; value: string; icon: keyof typeof Feather.glyphMap; href: string }) {
  return (
    <Link href={href as any} asChild>
      <Pressable style={styles.miniTile}>
        <View style={styles.miniIcon}>
          <Feather name={icon} size={15} color={colors.textMuted} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.miniValue}>{value}</Text>
          <Text style={styles.miniLabel}>{label}</Text>
        </View>
        <Feather name="chevron-right" size={16} color={colors.textMuted} />
      </Pressable>
    </Link>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [overview, setOverview] = useState<AdminRevenueOverview | null>(null);
  const [traffic, setTraffic] = useState<AdminSiteTrafficOverview | null>(null);
  const [modulesSummary, setModulesSummary] = useState({ active: 0, total: 0 });
  const [tutorialsSummary, setTutorialsSummary] = useState({ published: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newSignal, setNewSignal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [s, ov, tr, mods, tuts] = await Promise.all([
      getDashboardStats(),
      getRevenueOverview(),
      getSiteTraffic(),
      listModules(),
      listTutorialChapters(),
    ]);
    setStats(s.stats);
    setOverview(ov.overview);
    setTraffic(tr.overview);
    setModulesSummary({ active: mods.rows.filter((m) => m.status === 'active').length, total: mods.rows.length });
    setTutorialsSummary({ published: tuts.rows.filter((c) => c.status === 'publie').length, total: tuts.rows.length });
    setError(s.error ?? ov.error ?? tr.error ?? mods.error ?? tuts.error);
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

  // Real, not estimated: the sum of actual daily signups over the last 7
  // timeseries points — never a percentage derived from small counts (a
  // 1→3 week reads as "+200%" and means nothing at Cantia's current size).
  const signupsThisWeek = useMemo(() => {
    if (!overview) return 0;
    return overview.timeseries.slice(-7).reduce((sum, p) => sum + p.signups, 0);
  }, [overview]);

  // % of everyone still alive today (payants + essais réellement en cours)
  // whose subscription Stripe already shows as cancel_at_period_end — real,
  // already-decided churn that just hasn't landed yet, not a projection.
  // Denominator: active_count already includes active-but-cancelling subs,
  // so only trialing_cancelling_count needs adding back (trialing_count
  // itself already excludes those) to avoid double-counting them.
  const scheduledCancelPct = useMemo(() => {
    if (!overview) return null;
    const base = overview.active_count + overview.trialing_count + overview.trialing_cancelling_count;
    return base > 0 ? (overview.scheduled_cancellations_count / base) * 100 : 0;
  }, [overview]);

  const orgSparkline = useMemo(() => (overview ? overview.timeseries.slice(-14).map((p) => p.signups) : []), [overview]);
  const trafficSparkline = useMemo(() => (traffic ? traffic.timeseries.slice(-14).map((p) => p.visits) : []), [traffic]);
  const hasTrafficData = !!traffic && traffic.visits_30d > 0;

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
        <HeroStatCard
          label="Entreprises"
          value={stats?.organizations_count ?? 0}
          icon="briefcase"
          deltaText={signupsThisWeek > 0 ? `+${signupsThisWeek} cette semaine` : undefined}
          sparkline={orgSparkline}
          footnote={`Aujourd'hui : +${stats?.signups_today_count ?? 0} utilisateur${(stats?.signups_today_count ?? 0) > 1 ? 's' : ''} · +${stats?.organizations_created_today_count ?? 0} entreprise${(stats?.organizations_created_today_count ?? 0) > 1 ? 's' : ''}`}
        />
        <View style={styles.miniGrid}>
          <MiniTile label="Utilisateurs" value={stats?.users_count ?? 0} icon="users" />
          <MiniTile label="Clients payants" value={stats?.paid_subscriptions_count ?? 0} icon="check-circle" accent={colors.success} />
        </View>

        <SectionHeading title="Santé des inscriptions" subtitle="Qui a payé, qui est en essai, qui n'a jamais choisi de plan — tapez un segment pour voir la liste." />
        {stats ? <AdminSignupFunnel stats={stats} /> : null}

        <SectionHeading title="Outils" subtitle="Accès rapide — le détail complet reste sur son propre onglet." />
        <View style={styles.miniGrid}>
          <NavTile
            label="Modules sur mesure"
            value={`${modulesSummary.active} actif${modulesSummary.active > 1 ? 's' : ''} sur ${modulesSummary.total}`}
            icon="grid"
            href="/(admin)/modules"
          />
          <NavTile
            label="Tutoriels vidéo"
            value={`${tutorialsSummary.published} publié${tutorialsSummary.published > 1 ? 's' : ''} sur ${tutorialsSummary.total}`}
            icon="video"
            href="/(admin)/tutoriels"
          />
        </View>

        <SectionHeading title="Trafic du site" subtitle="cantia.ch — mesure interne, sans cookie tiers." />
        {!hasTrafficData ? (
          <View style={styles.trafficEmpty}>
            <Feather name="activity" size={16} color={colors.textMuted} />
            <Text style={styles.trafficEmptyText}>Suivi tout juste activé — les premières visites apparaîtront ici sous peu.</Text>
          </View>
        ) : (
          <>
            <HeroStatCard
              label="Visites (7 derniers jours)"
              value={traffic!.visits_7d}
              icon="activity"
              accent={colors.accent}
              sparkline={trafficSparkline}
              footnote={`${traffic!.unique_visitors_7d} visiteur${traffic!.unique_visitors_7d > 1 ? 's' : ''} unique${traffic!.unique_visitors_7d > 1 ? 's' : ''} cette semaine · ${traffic!.visits_today} aujourd'hui`}
            />
            {traffic!.top_pages.length > 0 ? (
              <View style={styles.pageList}>
                {traffic!.top_pages.slice(0, 5).map((p) => (
                  <View key={p.path} style={styles.pageRow}>
                    <Text style={styles.pagePath} numberOfLines={1}>
                      {p.path === '/' ? "Accueil" : p.path}
                    </Text>
                    <Text style={styles.pageVisits}>{p.visits} visite{p.visits > 1 ? 's' : ''}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </>
        )}

        {overview ? (
          <>
            <SectionHeading title="Argent" subtitle="Comptes gratuits à vie déjà exclus de tout ce qui suit." action={{ label: 'Voir le détail', href: '/(admin)/subscriptions' }} />
            {/* Money values need currency formatting, not the plain-number MiniTile — a small dedicated row instead. */}
            <View style={styles.moneyGrid}>
              <View style={styles.moneyTile}>
                <Text style={styles.moneyLabel}>Encaissé ce mois</Text>
                <Text style={[styles.moneyValue, { color: colors.success }]}>{formatChf(overview.ca_this_month_chf)}</Text>
              </View>
              <View style={styles.moneyTile}>
                <Text style={styles.moneyLabel}>Encaissé à vie</Text>
                <Text style={[styles.moneyValue, { color: colors.success }]}>{formatChf(overview.ca_total_chf)}</Text>
              </View>
              <Pressable style={styles.moneyTile} onPress={() => router.push('/(admin)/subscriptions')}>
                <View style={styles.moneyTileHeader}>
                  <Text style={styles.moneyLabel}>MRR actif</Text>
                  <Feather name="bar-chart-2" size={12} color={colors.textMuted} />
                </View>
                <Text style={styles.moneyValue}>{formatChf(overview.mrr_active_chf)}</Text>
                <Text style={styles.moneyTapHint}>Voir l'évolution →</Text>
              </Pressable>
              <View style={styles.moneyTile}>
                <Text style={styles.moneyLabel}>Résiliations programmées</Text>
                <Text style={[styles.moneyValue, scheduledCancelPct ? { color: colors.warning } : null]}>
                  {scheduledCancelPct !== null ? `${scheduledCancelPct.toFixed(1)}%` : '—'}
                </Text>
              </View>
            </View>

            {overview.by_plan.length > 0 ? (
              <View style={styles.planGrid}>
                {overview.by_plan.map((p) => (
                  <View key={p.plan_id} style={styles.planChip}>
                    <Text style={styles.planChipName} numberOfLines={1}>{p.plan_name}</Text>
                    <Text style={styles.planChipCount}>
                      {p.active_count} payant{p.active_count > 1 ? 's' : ''}
                      {p.trialing_count > 0 ? ` · ${p.trialing_count} essai` : ''}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}
          </>
        ) : null}
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
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: spacing.xxl,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  sectionSubtitle: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  sectionAction: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.primary,
  },
  hero: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  heroIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: '600',
  },
  heroValue: {
    fontSize: fontSize.xxxl,
    fontWeight: '800',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  deltaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.successSoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  deltaChipText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.success,
  },
  heroFootnote: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: '500',
  },
  miniGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
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
  trafficEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  trafficEmptyText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: '500',
  },
  pageList: {
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  pageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  pagePath: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  pageVisits: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: '600',
  },
  moneyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  moneyTile: {
    minWidth: 150,
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  moneyLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: '600',
  },
  moneyValue: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  moneyTileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  moneyTapHint: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },
  // A compact glance at "which plans, how many people" — not the full
  // MRR-per-plan ledger (name + CHF + counts in a full-width row), which
  // stays on Abonnements so this number isn't shown twice, worded two
  // different ways, in two places.
  planGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  planChip: {
    minWidth: 130,
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  planChipName: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  planChipCount: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
});
