import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Container, EmptyState, LoadingScreen } from '../../../components/ui';
import { AdminErrorBanner } from '../../../components/AdminErrorBanner';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import { listModules } from '../../../lib/api/admin';
import type { AdminModuleSummary } from '../../../lib/types';

const VISIBILITY_LABEL: Record<string, string> = { standard: 'Standard', private: 'Privé', experimental: 'Beta' };
const STATUS_LABEL: Record<string, string> = { active: 'Actif', beta: 'Beta', disabled: 'Désactivé' };

// A module row with no matching feature code does nothing — so there is no
// self-service "create" button here. A private module is built by Claude
// during a real dev session (the code + the admin_upsert_module registry
// entry together, in the same commit); this screen only lists what already
// exists and lets you grant it to a company (from its detail page). Once
// granted, the company's own admin switches it on themselves in their
// Compte → Outils & modules.
export default function AdminModulesList() {
  const [modules, setModules] = useState<AdminModuleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { rows, error: err } = await listModules();
    setModules(rows);
    setError(err);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <ScrollView>
      <Container style={styles.container}>
        <Text style={styles.title}>Modules</Text>
        <Text style={styles.hint}>
          Le registre des modules sur mesure développés pour des entreprises précises. Pour en créer un, demande-le
          directement dans la conversation — le module et son entrée ici sont livrés ensemble.
        </Text>

        {error ? <AdminErrorBanner message={error} /> : null}

        {loading ? (
          <LoadingScreen label="Chargement…" />
        ) : modules.length === 0 ? (
          <EmptyState title="Aucun module sur mesure pour l'instant" subtitle="Demande-en un dans la conversation quand une entreprise en a besoin." />
        ) : (
          <View style={styles.list}>
            {modules.map((mod) => (
              <View key={mod.id} style={styles.row}>
                <View style={{ flex: 1 }}>
                  <View style={styles.rowTitleLine}>
                    <Text style={styles.rowTitle}>{mod.name}</Text>
                    <Text style={styles.rowKey}>{mod.key}</Text>
                  </View>
                  {mod.description ? <Text style={styles.rowDescription}>{mod.description}</Text> : null}
                </View>
                <View style={styles.pill}>
                  <Text style={styles.pillText}>{VISIBILITY_LABEL[mod.visibility] ?? mod.visibility}</Text>
                </View>
                <View style={[styles.pill, mod.status === 'disabled' && styles.pillDisabled]}>
                  <Text style={styles.pillText}>{STATUS_LABEL[mod.status] ?? mod.status}</Text>
                </View>
                <Text style={styles.rowCount}>
                  {mod.organizations_count} entreprise{mod.organizations_count > 1 ? 's' : ''}
                </Text>
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
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  hint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginBottom: spacing.xl,
    maxWidth: 560,
  },
  list: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  rowTitleLine: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  rowTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  rowKey: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontFamily: 'monospace',
  },
  rowDescription: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  rowCount: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: '600',
  },
  pill: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  pillDisabled: {
    backgroundColor: colors.border,
  },
  pillText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },
});
