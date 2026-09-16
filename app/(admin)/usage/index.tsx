import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Container, EmptyState, LoadingScreen } from '../../../components/ui';
import { AdminErrorBanner } from '../../../components/AdminErrorBanner';
import { AdminRefreshButton } from '../../../components/AdminRefreshButton';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import { getFeatureUsage, getFeatureUsageByOrg } from '../../../lib/api/admin';
import type { AdminFeatureUsage, AdminFeatureUsageByOrg } from '../../../lib/types';

const CATEGORY_ORDER = ['coeur_metier', 'rh', 'finance', 'integrations', 'ia', 'personnalisation'];
const CATEGORY_LABEL: Record<string, string> = {
  coeur_metier: 'Cœur de métier',
  rh: 'RH & salaires',
  finance: 'Finance & compta',
  integrations: 'Intégrations',
  ia: 'IA & dictée vocale',
  personnalisation: 'Personnalisation',
};

function FeatureRow({
  row,
  byOrg,
  expanded,
  onToggle,
}: {
  row: AdminFeatureUsage;
  byOrg: AdminFeatureUsageByOrg[];
  expanded: boolean;
  onToggle: () => void;
}) {
  const pct = row.orgs_total > 0 ? Math.round((row.orgs_using / row.orgs_total) * 100) : 0;
  return (
    <View style={styles.row}>
      <Pressable style={styles.rowTop} onPress={onToggle} disabled={byOrg.length === 0}>
        <View style={styles.rowLabelGroup}>
          <Text style={styles.rowLabel}>{row.label}</Text>
          {byOrg.length > 0 ? (
            <Feather name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textMuted} />
          ) : null}
        </View>
        <Text style={styles.rowPct}>{pct}%</Text>
      </Pressable>
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
      {expanded && byOrg.length > 0 ? (
        <View style={styles.byOrgList}>
          {byOrg.map((o) => (
            <View key={o.organization_id} style={styles.byOrgRow}>
              <Text style={styles.byOrgName} numberOfLines={1}>
                {o.organization_name}
              </Text>
              <Text style={styles.byOrgCount}>
                {o.use_count.toLocaleString('fr-CH')}×
              </Text>
            </View>
          ))}
        </View>
      ) : null}
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
  const [byOrgRows, setByOrgRows] = useState<AdminFeatureUsageByOrg[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [overview, byOrg] = await Promise.all([getFeatureUsage(), getFeatureUsageByOrg()]);
    setRows(overview.rows);
    setByOrgRows(byOrg.rows);
    setError(overview.error ?? byOrg.error);
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

  const byOrgByFeature = new Map<string, AdminFeatureUsageByOrg[]>();
  for (const row of byOrgRows) {
    const list = byOrgByFeature.get(row.feature_key);
    if (list) list.push(row);
    else byOrgByFeature.set(row.feature_key, [row]);
  }

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
                    <FeatureRow
                      key={row.feature_key}
                      row={row}
                      byOrg={byOrgByFeature.get(row.feature_key) ?? []}
                      expanded={expanded === row.feature_key}
                      onToggle={() => setExpanded((cur) => (cur === row.feature_key ? null : row.feature_key))}
                    />
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
  rowLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
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
  byOrgList: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 6,
  },
  byOrgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  byOrgName: {
    flex: 1,
    fontSize: 12,
    color: colors.text,
  },
  byOrgCount: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    fontVariant: ['tabular-nums'],
  },
});
