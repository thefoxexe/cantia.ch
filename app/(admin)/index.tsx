import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Container } from '../../components/ui';
import { AdminErrorBanner } from '../../components/AdminErrorBanner';
import { AdminRefreshButton } from '../../components/AdminRefreshButton';
import { AdminSignupFunnel } from '../../components/AdminSignupFunnel';
import { GrowthChart } from '../../components/GrowthChart';
import { CashCollectedChart } from '../../components/CashCollectedChart';
import { colors, fontSize, radius, spacing } from '../../lib/theme';
import { useAdminData } from '../../lib/adminDataContext';
import type { AdminRevenueOverview } from '../../lib/types';

function formatChf(amount: number, decimals = 0): string {
  return new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF', maximumFractionDigits: decimals }).format(amount);
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

// The one figure this whole platform exists to grow, promoted above
// everything else on the page — a dark card, not another tile among tiles,
// so it reads as the headline the instant the dashboard loads.
function MrrHero({ overview }: { overview: AdminRevenueOverview }) {
  const netUp = overview.net_mrr_this_month_chf >= 0;
  return (
    <View style={styles.hero}>
      <Text style={styles.heroLabel}>Revenu récurrent mensuel (MRR)</Text>
      <Text style={styles.heroValue}>{formatChf(overview.mrr_active_chf)}</Text>
      <View style={styles.heroMetaRow}>
        <View style={[styles.heroDelta, netUp ? styles.heroDeltaUp : styles.heroDeltaDown]}>
          <Feather name={netUp ? 'arrow-up-right' : 'arrow-down-right'} size={12} color={netUp ? colors.success : colors.danger} />
          <Text style={[styles.heroDeltaText, { color: netUp ? colors.success : colors.danger }]}>
            {netUp ? '+' : '−'}
            {formatChf(Math.abs(overview.net_mrr_this_month_chf))} ce mois
          </Text>
        </View>
        <Text style={styles.heroSub}>
          ARR {formatChf(overview.arr_chf)} · {overview.active_count} client{overview.active_count > 1 ? 's' : ''} payant{overview.active_count > 1 ? 's' : ''}
        </Text>
      </View>
    </View>
  );
}

function StatTile({ label, value, icon, accent, hint }: { label: string; value: string; icon: keyof typeof Feather.glyphMap; accent?: string; hint?: string }) {
  return (
    <View style={styles.statTile}>
      <View style={[styles.statIcon, accent ? { backgroundColor: `${accent}1c` } : null]}>
        <Feather name={icon} size={15} color={accent ?? colors.textMuted} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.statValue, accent ? { color: accent } : null]}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
        {hint ? <Text style={styles.statHint}>{hint}</Text> : null}
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
      <Pressable style={styles.navTile}>
        <View style={styles.statIcon}>
          <Feather name={icon} size={15} color={colors.textMuted} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statLabel}>{label}</Text>
        </View>
        <Feather name="chevron-right" size={16} color={colors.textMuted} />
      </Pressable>
    </Link>
  );
}

export default function AdminDashboard() {
  const { stats, overview, traffic, modulesSummary, tutorialsSummary, refreshing, error, newSignal, refresh } = useAdminData();
  const [showDetails, setShowDetails] = useState(false);

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
  const scheduledCancelPct = useMemo(() => {
    if (!overview) return null;
    const base = overview.active_count + overview.trialing_count + overview.trialing_cancelling_count;
    return base > 0 ? (overview.scheduled_cancellations_count / base) * 100 : 0;
  }, [overview]);

  // Logo/revenu churn du mois : résiliations / (payants restants + ceux
  // partis ce mois) — la base de payants telle qu'elle était en début de
  // mois, sans instantané historique séparé.
  const logoChurnPct = useMemo(() => {
    if (!overview) return 0;
    const base = overview.active_count + overview.churned_count_this_month;
    return base > 0 ? (overview.churned_count_this_month / base) * 100 : 0;
  }, [overview]);
  const revenueChurnPct = useMemo(() => {
    if (!overview) return 0;
    const base = overview.mrr_active_chf + overview.churned_mrr_this_month_chf;
    return base > 0 ? (overview.churned_mrr_this_month_chf / base) * 100 : 0;
  }, [overview]);

  const hasTrafficData = !!traffic && traffic.visits_30d > 0;

  return (
    // style={{ flex: 1 }} in addition to contentContainerStyle — the latter
    // alone only sizes the inner content wrapper, not the ScrollView's own
    // box within this layout's flex:1/minHeight:0 content column, so
    // without it the page can end up with no constrained scroll viewport.
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scroll}>
      <Container style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Dashboard</Text>
          <AdminRefreshButton onPress={refresh} loading={refreshing} hasSignal={newSignal} />
        </View>

        {error ? <AdminErrorBanner message={error} /> : null}

        {overview ? <MrrHero overview={overview} /> : null}

        <View style={styles.statGrid}>
          <StatTile
            label="Entreprises"
            value={(stats?.organizations_count ?? 0).toLocaleString('fr-CH')}
            icon="briefcase"
            hint={signupsThisWeek > 0 ? `+${signupsThisWeek} cette semaine` : undefined}
          />
          <StatTile label="Utilisateurs" value={(stats?.users_count ?? 0).toLocaleString('fr-CH')} icon="users" />
          {overview ? (
            <>
              <StatTile label="Encaissé ce mois" value={formatChf(overview.ca_this_month_chf)} icon="calendar" accent={colors.success} />
              <StatTile label="Encaissé à vie" value={formatChf(overview.ca_total_chf)} icon="dollar-sign" accent={colors.success} />
              <StatTile
                label="Résiliations programmées"
                value={scheduledCancelPct !== null ? `${scheduledCancelPct.toFixed(1)}%` : '—'}
                icon="alert-triangle"
                accent={scheduledCancelPct ? colors.warning : undefined}
              />
            </>
          ) : null}
        </View>

        <SectionHeading title="Santé des inscriptions" subtitle="Qui a payé, qui est en essai, qui n'a jamais choisi de plan — tapez un segment pour voir la liste." />
        {stats ? <AdminSignupFunnel stats={stats} /> : null}

        {overview ? (
          <>
            <SectionHeading title="Croissance" subtitle="Inscriptions, argent encaissé et clients payants cumulés — filtrable par période." />
            <GrowthChart points={overview.timeseries} />

            <SectionHeading title="Cash encaissé par mois" subtitle="Factures Stripe effectivement payées, regroupées par mois." />
            <CashCollectedChart points={overview.timeseries} />

            <Pressable style={styles.detailsToggle} onPress={() => setShowDetails((v) => !v)}>
              <Text style={styles.detailsToggleText}>{showDetails ? 'Masquer les détails' : 'Afficher plus de détails'}</Text>
              <Feather name={showDetails ? 'chevron-up' : 'chevron-down'} size={16} color={colors.primary} />
            </Pressable>

            {showDetails ? (
              <>
                <SectionHeading
                  title="Résiliations"
                  subtitle="Ce qui est déjà parti ce mois, en taux plutôt qu'en compte brut — et ce qui est déjà programmé pour bientôt."
                />
                <View style={styles.detailGrid}>
                  <StatTile
                    label="Taux de résiliation (clients)"
                    value={`${logoChurnPct.toFixed(1)}%`}
                    icon="user-x"
                    accent={logoChurnPct > 0 ? colors.danger : colors.success}
                  />
                  <StatTile
                    label="Taux de résiliation (revenu)"
                    value={`${revenueChurnPct.toFixed(1)}%`}
                    icon="trending-down"
                    accent={revenueChurnPct > 0 ? colors.danger : colors.success}
                  />
                </View>

                <SectionHeading title="Pas encore de l'argent" subtitle="Essais en cours et comptes gratuits à vie — ce qui pourrait rentrer, et ce qui ne rentrera jamais." />
                <View style={styles.detailGrid}>
                  <StatTile label="MRR en attente (essais)" value={formatChf(overview.mrr_trialing_chf)} icon="clock" accent={colors.warning} hint={`${overview.trialing_count} en essai`} />
                  <StatTile label="Gratuit à vie" value={String(overview.complimentary_count)} icon="gift" hint="Jamais compté dans le MRR" />
                </View>
                {overview.complimentary_accounts.length > 0 ? (
                  <View style={styles.list}>
                    {overview.complimentary_accounts.map((acc) => (
                      <View key={acc.id} style={[styles.breakdownRow, styles.complimentaryRow]}>
                        <Text style={styles.breakdownName}>{acc.name}</Text>
                        <Text style={styles.breakdownMeta}>Code « {acc.code} » — 100% offert</Text>
                      </View>
                    ))}
                  </View>
                ) : null}

                {overview.by_plan.length > 0 ? (
                  <>
                    <SectionHeading title="MRR par plan" />
                    <View style={styles.list}>
                      {overview.by_plan.map((p) => (
                        <View key={p.plan_id} style={styles.breakdownRow}>
                          <Text style={styles.breakdownName}>{p.plan_name}</Text>
                          <Text style={styles.breakdownMeta}>
                            {p.active_count} payant{p.active_count > 1 ? 's' : ''}
                            {p.trialing_count > 0 ? ` · ${p.trialing_count} en essai` : ''}
                          </Text>
                          <Text style={styles.breakdownValue}>{formatChf(p.mrr_chf)}</Text>
                        </View>
                      ))}
                    </View>
                  </>
                ) : null}

                {overview.promo_codes.length > 0 ? (
                  <>
                    <SectionHeading title="Codes promo" subtitle="Qui les a utilisés, converti ou non." />
                    <View style={styles.list}>
                      {overview.promo_codes.map((code) => (
                        <View key={code.code} style={styles.breakdownRow}>
                          <Text style={styles.breakdownName}>{code.code}</Text>
                          <Text style={styles.breakdownMeta}>
                            {code.org_count} entreprise{code.org_count > 1 ? 's' : ''} · {code.active_count} payant{code.active_count > 1 ? 's' : ''}
                            {code.trialing_count > 0 ? ` · ${code.trialing_count} en essai` : ''}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </>
                ) : null}
              </>
            ) : null}
          </>
        ) : null}

        <SectionHeading title="Trafic du site" subtitle="cantia.ch — mesure interne, sans cookie tiers." />
        {!hasTrafficData ? (
          <View style={styles.trafficEmpty}>
            <Feather name="activity" size={16} color={colors.textMuted} />
            <Text style={styles.trafficEmptyText}>Suivi tout juste activé — les premières visites apparaîtront ici sous peu.</Text>
          </View>
        ) : (
          <>
            <View style={styles.statGrid}>
              <StatTile label="Visites (7 derniers jours)" value={traffic!.visits_7d.toLocaleString('fr-CH')} icon="activity" accent={colors.accent} />
              <StatTile label="Visiteurs uniques (7j)" value={traffic!.unique_visitors_7d.toLocaleString('fr-CH')} icon="user" />
              <StatTile label="Aujourd'hui" value={traffic!.visits_today.toLocaleString('fr-CH')} icon="calendar" />
            </View>
            {traffic!.top_pages.length > 0 ? (
              <View style={styles.pageList}>
                {traffic!.top_pages.slice(0, 5).map((p) => (
                  <View key={p.path} style={styles.pageRow}>
                    <Text style={styles.pagePath} numberOfLines={1}>
                      {p.path === '/' ? 'Accueil' : p.path}
                    </Text>
                    <Text style={styles.pageVisits}>{p.visits} visite{p.visits > 1 ? 's' : ''}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </>
        )}

        <SectionHeading title="Outils" subtitle="Accès rapide — le détail complet reste sur son propre onglet." />
        <View style={styles.statGrid}>
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
  hero: {
    backgroundColor: colors.text,
    borderRadius: radius.lg,
    padding: spacing.xl,
  },
  heroLabel: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.65)',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  heroValue: {
    fontSize: 44,
    fontWeight: '800',
    color: '#fff',
    fontVariant: ['tabular-nums'],
    marginTop: spacing.xs,
  },
  heroMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  heroDelta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  heroDeltaUp: {
    backgroundColor: 'rgba(76, 175, 80, 0.18)',
  },
  heroDeltaDown: {
    backgroundColor: 'rgba(220, 76, 76, 0.18)',
  },
  heroDeltaText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  heroSub: {
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
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
    maxWidth: 560,
  },
  sectionAction: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.primary,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  statTile: {
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
  navTile: {
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
  statIcon: {
    width: 30,
    height: 30,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: '600',
  },
  statHint: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '700',
    marginTop: 1,
  },
  detailsToggle: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginTop: spacing.xl,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  detailsToggleText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.primary,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  list: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  breakdownRow: {
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
  complimentaryRow: {
    opacity: 0.7,
  },
  breakdownName: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
    minWidth: 100,
  },
  breakdownMeta: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  breakdownValue: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.primary,
    fontVariant: ['tabular-nums'],
  },
  trafficEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginTop: spacing.md,
  },
  trafficEmptyText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: '500',
  },
  pageList: {
    gap: spacing.xs,
    marginTop: spacing.md,
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
});
