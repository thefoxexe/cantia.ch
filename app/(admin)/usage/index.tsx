import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Container, EmptyState, LoadingScreen } from '../../../components/ui';
import { AdminErrorBanner } from '../../../components/AdminErrorBanner';
import { AdminRefreshButton } from '../../../components/AdminRefreshButton';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import { getFeatureUsage } from '../../../lib/api/admin';
import type { AdminFeatureUsage } from '../../../lib/types';

const CATEGORY_ORDER = ['coeur_metier', 'rh', 'finance', 'integrations', 'ia', 'personnalisation'];
const CATEGORY_LABEL: Record<string, string> = {
  coeur_metier: 'Cœur de métier',
  rh: 'RH & salaires',
  finance: 'Finance & compta',
  integrations: 'Intégrations',
  ia: 'IA & dictée vocale',
  personnalisation: 'Personnalisation',
};

function FeatureRow({ row }: { row: AdminFeatureUsage }) {
  const pct = row.orgs_total > 0 ? Math.round((row.orgs_using / row.orgs_total) * 100) : 0;
  return (
    <View style={styles.row}>
      <View style={styles.rowTop}>
        <Text style={styles.rowLabel}>{row.label}</Text>
        <Text style={styles.rowPct}>{pct}%</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%` }]} />
      </View>
      <View style={styles.rowMetaLine}>
        <Text style={styles.rowMeta}>
          {row.orgs_using} entreprise{row.orgs_using > 1 ? 's' : ''} sur {row.orgs_total} · {row.total_count.toLocaleString('fr-CH')} au total
        </Text>
        {row.last_30d_count !== null ? (
          <Text style={styles.rowMeta30}>{row.last_30d_count.toLocaleString('fr-CH')} sur 30 j</Text>
        ) : null}
      </View>
    </View>
  );
}

// "Qu'est-ce que les gens utilisent vraiment" — ranks every feature by real
// adoption (% of real organizations with at least one real row: a devis
// created, an hour logged, a bank account connected…), not by clicks or
// page views. See admin_feature_usage_overview() for exactly what each row
// counts. Useful for marketing to lean on what genuinely converts instead
// of guessing from the feature-list copy.
export default function AdminUsageScreen() {
  const [rows, setRows] = useState<AdminFeatureUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { rows: r, error: err } = await getFeatureUsage();
    setRows(r);
    setError(err);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const byCategory = new Map<string, AdminFeatureUsage[]>();
  for (const row of rows) {
    const list = byCategory.get(row.category);
    if (list) list.push(row);
    else byCategory.set(row.category, [row]);
  }
  const categories = CATEGORY_ORDER.filter((c) => byCategory.has(c));

  return (
    <ScrollView style={{ flex: 1 }}>
      <Container style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Utilisation</Text>
          <AdminRefreshButton onPress={load} loading={loading} />
        </View>
        <Text style={styles.hint}>
          Adoption réelle par fonctionnalité — comptée depuis les vraies données créées (un devis enregistré, une
          heure pointée, un compte bancaire connecté…), jamais depuis des clics. Entreprises internes/test exclues.
        </Text>

        {error ? <AdminErrorBanner message={error} /> : null}

        {loading ? (
          <LoadingScreen label="Chargement…" />
        ) : rows.length === 0 ? (
          <EmptyState title="Pas encore de données" />
        ) : (
          <View style={styles.groups}>
            {categories.map((cat) => (
              <View key={cat} style={styles.group}>
                <Text style={styles.groupTitle}>{CATEGORY_LABEL[cat] ?? cat}</Text>
                <View style={styles.list}>
                  {byCategory.get(cat)!.map((row) => (
                    <FeatureRow key={row.feature_key} row={row} />
                  ))}
                </View>
              </View>
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
  groups: {
    gap: spacing.xl,
  },
  group: {
    gap: spacing.sm,
  },
  groupTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  list: {
    gap: spacing.sm,
  },
  row: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    shadowColor: '#0B0F0E',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  rowLabel: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  rowPct: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: colors.primary,
    fontVariant: ['tabular-nums'],
  },
  track: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  rowMetaLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  rowMeta: {
    fontSize: 11,
    color: colors.textMuted,
  },
  rowMeta30: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.success,
  },
});
