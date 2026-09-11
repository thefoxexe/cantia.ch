import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Container } from '../../components/ui';
import { AdminErrorBanner } from '../../components/AdminErrorBanner';
import { AdminRefreshButton } from '../../components/AdminRefreshButton';
import { GrowthChart } from '../../components/GrowthChart';
import { CashCollectedChart } from '../../components/CashCollectedChart';
import { colors, fontSize, radius, spacing } from '../../lib/theme';
import { useAdminData } from '../../lib/adminDataContext';
import type { AdminRevenueOverview } from '../../lib/types';

function formatChf(amount: number, decimals = 0): string {
  return new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF', maximumFractionDigits: decimals }).format(amount);
}

function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.sectionHeading}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
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

// Just the essential financial picture — MRR, ARR, growth, cash — nothing
// else. Signup funnel detail lives on Entreprises, subscription counts on
// Abonnements, traffic and shortcuts were cut: this screen answers one
// question only, "is the business growing," at a glance.
export default function AdminDashboard() {
  const { stats, overview, refreshing, error, newSignal, refresh } = useAdminData();

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

        {overview ? (
          <>
            <SectionHeading title="Croissance" subtitle="Inscriptions, argent encaissé et clients payants cumulés — filtrable par période." />
            <GrowthChart points={overview.timeseries} />

            <SectionHeading title="Cash encaissé par mois" subtitle="Factures Stripe effectivement payées, regroupées par mois." />
            <CashCollectedChart points={overview.timeseries} />
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
});
