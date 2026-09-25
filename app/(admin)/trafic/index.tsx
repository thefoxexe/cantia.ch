import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Container, EmptyState, LoadingScreen } from '../../../components/ui';
import { AdminErrorBanner } from '../../../components/AdminErrorBanner';
import { AdminRefreshButton } from '../../../components/AdminRefreshButton';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import { getSiteTrafficOverview } from '../../../lib/api/admin';
import type { AdminSiteTrafficOverview } from '../../../lib/types';

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value.toLocaleString('fr-CH')}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// D'où vient le trafic (et les inscriptions) sur cantia.ch : pages vues
// (site_pageviews), sources UTM/gclid capturées sur ces pageviews, et
// organisations créées rapprochées à la source qui a amené leur créateur —
// voir admin_site_traffic_overview() pour le détail du calcul et
// lib/siteAnalytics.ts pour comment l'attribution traverse cantia.ch ->
// app.cantia.ch.
export default function AdminTrafficScreen() {
  const [overview, setOverview] = useState<AdminSiteTrafficOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getSiteTrafficOverview();
    setOverview(res.overview);
    setError(res.error);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <ScrollView style={{ flex: 1 }}>
      <Container style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Trafic</Text>
          <AdminRefreshButton onPress={load} loading={loading} />
        </View>
        <Text style={styles.hint}>
          D'où viennent les visites et les inscriptions — recherche organique, campagnes payantes (Google Ads via
          utm_source/gclid), liens directs. Une source n'apparaît que si le lien cliqué portait des paramètres
          utm_* ou gclid ; sinon la visite compte comme « direct / organique ».
        </Text>

        {error ? <AdminErrorBanner message={error} /> : null}

        {loading ? (
          <LoadingScreen label="Chargement…" />
        ) : !overview ? (
          <EmptyState title="Pas encore de données" />
        ) : (
          <View style={styles.sections}>
            <View style={styles.statsRow}>
              <StatCard label="Visites (aujourd'hui)" value={overview.visits_today} />
              <StatCard label="Visites (7 j)" value={overview.visits_7d} />
              <StatCard label="Visites (30 j)" value={overview.visits_30d} />
              <StatCard label="Visiteurs uniques (7 j)" value={overview.unique_visitors_7d} />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sources de trafic (30 derniers jours)</Text>
              {overview.sources_30d.length === 0 ? (
                <Text style={styles.emptyRowText}>Aucune donnée pour la période.</Text>
              ) : (
                <View style={styles.table}>
                  <View style={[styles.row, styles.rowHead]}>
                    <Text style={[styles.cell, styles.cellWide, styles.cellHead]}>Source</Text>
                    <Text style={[styles.cell, styles.cellWide, styles.cellHead]}>Campagne</Text>
                    <Text style={[styles.cell, styles.cellHead]}>Visites</Text>
                    <Text style={[styles.cell, styles.cellHead]}>Uniques</Text>
                    <Text style={[styles.cell, styles.cellHead]}>Via clic Ads</Text>
                  </View>
                  {overview.sources_30d.map((row, i) => (
                    <View key={`${row.source}-${row.medium}-${row.campaign}-${i}`} style={styles.row}>
                      <Text style={[styles.cell, styles.cellWide]} numberOfLines={1}>
                        {row.source}
                        {row.medium ? ` · ${row.medium}` : ''}
                      </Text>
                      <Text style={[styles.cell, styles.cellWide]} numberOfLines={1}>
                        {row.campaign ?? '—'}
                      </Text>
                      <Text style={styles.cell}>{row.visits.toLocaleString('fr-CH')}</Text>
                      <Text style={styles.cell}>{row.unique_visitors.toLocaleString('fr-CH')}</Text>
                      <Text style={styles.cell}>{row.gclid_visits.toLocaleString('fr-CH')}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Inscriptions par source (30 derniers jours)</Text>
              {overview.signups_by_source_30d.length === 0 ? (
                <Text style={styles.emptyRowText}>Aucune inscription sur la période.</Text>
              ) : (
                <View style={styles.table}>
                  <View style={[styles.row, styles.rowHead]}>
                    <Text style={[styles.cell, styles.cellWide, styles.cellHead]}>Source</Text>
                    <Text style={[styles.cell, styles.cellWide, styles.cellHead]}>Campagne</Text>
                    <Text style={[styles.cell, styles.cellHead]}>Inscriptions</Text>
                  </View>
                  {overview.signups_by_source_30d.map((row, i) => (
                    <View key={`${row.source}-${row.campaign}-${i}`} style={styles.row}>
                      <Text style={[styles.cell, styles.cellWide]} numberOfLines={1}>
                        {row.source}
                      </Text>
                      <Text style={[styles.cell, styles.cellWide]} numberOfLines={1}>
                        {row.campaign ?? '—'}
                      </Text>
                      <Text style={styles.cell}>{row.signups.toLocaleString('fr-CH')}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Pages les plus visitées (7 derniers jours)</Text>
              {overview.top_pages.length === 0 ? (
                <Text style={styles.emptyRowText}>Aucune donnée pour la période.</Text>
              ) : (
                <View style={styles.table}>
                  {overview.top_pages.map((row, i) => (
                    <View key={row.path} style={[styles.row, i === overview.top_pages.length - 1 && styles.rowLast]}>
                      <Text style={[styles.cell, styles.cellWide]} numberOfLines={1}>
                        {row.path}
                      </Text>
                      <Text style={styles.cell}>{row.visits.toLocaleString('fr-CH')}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
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
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
  },
  hint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginBottom: spacing.xl,
    maxWidth: 640,
    lineHeight: 17,
  },
  sections: {
    gap: spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  statValue: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.primary,
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  emptyRowText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  table: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowHead: {
    backgroundColor: colors.surfaceAlt,
  },
  cell: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  cellWide: {
    flex: 2,
  },
  cellHead: {
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
    fontSize: 10,
    letterSpacing: 0.4,
  },
});
