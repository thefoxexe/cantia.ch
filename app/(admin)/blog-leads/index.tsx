import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Container, EmptyState, LoadingScreen } from '../../../components/ui';
import { AdminErrorBanner } from '../../../components/AdminErrorBanner';
import { AdminRefreshButton } from '../../../components/AdminRefreshButton';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import { getBlogFunnelOverview } from '../../../lib/api/admin';
import type { AdminBlogFunnelOverview } from '../../../lib/types';

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value.toLocaleString('fr-CH')}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// "Quels articles amènent vraiment des inscriptions" — pageviews (site_pageviews,
// FR /blog/<slug> only), clics sur les CTA (blog_cta_clicks) et emails captés
// via le modèle de devis gratuit (blog_leads), rapprochés par slug sur les 30
// derniers jours. Voir admin_blog_funnel_overview() pour le détail du calcul.
export default function AdminBlogLeadsScreen() {
  const [overview, setOverview] = useState<AdminBlogFunnelOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getBlogFunnelOverview();
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
          <Text style={styles.title}>Blog & Leads</Text>
          <AdminRefreshButton onPress={load} loading={loading} />
        </View>
        <Text style={styles.hint}>
          Emails captés via le modèle de devis gratuit, clics sur les CTA et pages vues, par article, sur les 30
          derniers jours — pour voir quels contenus amènent vraiment des inscriptions, pas seulement du trafic.
        </Text>

        {error ? <AdminErrorBanner message={error} /> : null}

        {loading ? (
          <LoadingScreen label="Chargement…" />
        ) : !overview ? (
          <EmptyState title="Pas encore de données" />
        ) : (
          <View style={styles.sections}>
            <View style={styles.statsRow}>
              <StatCard label="Leads (total)" value={overview.leads_total} />
              <StatCard label="Leads (7 j)" value={overview.leads_7d} />
              <StatCard label="Leads (30 j)" value={overview.leads_30d} />
              <StatCard label="Clics CTA (30 j)" value={overview.clicks_30d} />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Par article (30 derniers jours)</Text>
              {overview.per_article.length === 0 ? (
                <Text style={styles.emptyRowText}>Aucune donnée pour la période.</Text>
              ) : (
                <View style={styles.table}>
                  <View style={[styles.row, styles.rowHead]}>
                    <Text style={[styles.cell, styles.cellSlug, styles.cellHead]}>Article</Text>
                    <Text style={[styles.cell, styles.cellHead]}>Vues</Text>
                    <Text style={[styles.cell, styles.cellHead]}>Clics</Text>
                    <Text style={[styles.cell, styles.cellHead]}>Leads</Text>
                    <Text style={[styles.cell, styles.cellHead]}>Conv.</Text>
                  </View>
                  {overview.per_article.map((row) => {
                    const conv = row.pageviews_30d > 0 ? Math.round(((row.clicks_30d + row.leads_30d) / row.pageviews_30d) * 1000) / 10 : null;
                    return (
                      <View key={row.slug} style={styles.row}>
                        <Text style={[styles.cell, styles.cellSlug]} numberOfLines={2}>
                          {row.slug}
                        </Text>
                        <Text style={styles.cell}>{row.pageviews_30d.toLocaleString('fr-CH')}</Text>
                        <Text style={styles.cell}>{row.clicks_30d.toLocaleString('fr-CH')}</Text>
                        <Text style={styles.cell}>{row.leads_30d.toLocaleString('fr-CH')}</Text>
                        <Text style={styles.cell}>{conv !== null ? `${conv}%` : '—'}</Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Derniers leads capturés</Text>
              {overview.recent_leads.length === 0 ? (
                <Text style={styles.emptyRowText}>Aucun lead pour le moment.</Text>
              ) : (
                <View style={styles.table}>
                  {overview.recent_leads.map((lead, i) => (
                    <View key={`${lead.email}-${lead.created_at}`} style={[styles.leadRow, i === overview.recent_leads.length - 1 && styles.leadRowLast]}>
                      <Text style={styles.leadEmail} numberOfLines={1}>
                        {lead.email}
                      </Text>
                      <Text style={styles.leadMeta} numberOfLines={1}>
                        {lead.source_slug ?? '—'}
                      </Text>
                      <Text style={styles.leadDate}>{new Date(lead.created_at).toLocaleDateString('fr-CH')}</Text>
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
  rowHead: {
    backgroundColor: colors.surfaceAlt,
  },
  cell: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  cellHead: {
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
    fontSize: 10,
    letterSpacing: 0.4,
  },
  cellSlug: {
    flex: 2.4,
    fontWeight: '600',
  },
  leadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  leadRowLast: {
    borderBottomWidth: 0,
  },
  leadEmail: {
    flex: 1.4,
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  leadMeta: {
    flex: 1.6,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  leadDate: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontVariant: ['tabular-nums'],
  },
});
