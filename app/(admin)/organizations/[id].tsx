import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Container, EmptyState, LoadingScreen, PageHeader, Switch } from '../../../components/ui';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import { getOrganizationDetail, listModules, setOrganizationModule } from '../../../lib/api/admin';
import { ORG_MODULES, PROJECT_MODULES } from '../../../lib/modules';
import type { AdminModuleSummary, AdminOrganizationDetail } from '../../../lib/types';

const STANDARD_MODULE_LABELS = new Map<string, string>([...ORG_MODULES, ...PROJECT_MODULES].map((m) => [m.key, m.label]));

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-CH', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminOrganizationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [detail, setDetail] = useState<AdminOrganizationDetail | null>(null);
  const [allModules, setAllModules] = useState<AdminModuleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingKeys, setPendingKeys] = useState<Set<string>>(new Set());
  const [feedback, setFeedback] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    const [d, mods] = await Promise.all([getOrganizationDetail(id), listModules()]);
    setDetail(d);
    setAllModules(mods);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const enabledByKey = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const m of detail?.private_modules ?? []) map.set(m.key, m.enabled);
    return map;
  }, [detail]);

  const nonStandardModules = useMemo(() => allModules.filter((m) => m.visibility !== 'standard'), [allModules]);

  async function toggle(moduleKey: string, next: boolean, moduleName: string) {
    if (!id) return;
    setPendingKeys((prev) => new Set(prev).add(moduleKey));
    const { error } = await setOrganizationModule(id, moduleKey, next);
    setPendingKeys((prev) => {
      const copy = new Set(prev);
      copy.delete(moduleKey);
      return copy;
    });
    if (error) {
      setFeedback(`Erreur : ${error}`);
    } else {
      setFeedback(next ? `✓ ${moduleName} activé pour ${detail?.organization.name}` : `${moduleName} désactivé pour ${detail?.organization.name}`);
      await load();
    }
    setTimeout(() => setFeedback(null), 4000);
  }

  if (loading) return <LoadingScreen label="Chargement de l'entreprise…" />;
  if (!detail) return <EmptyState title="Entreprise introuvable" />;

  const org = detail.organization;

  return (
    <ScrollView>
      <Container style={styles.container}>
        <PageHeader title={org.name} backTo="/(admin)/organizations" />

        {feedback ? (
          <View style={styles.feedback}>
            <Text style={styles.feedbackText}>{feedback}</Text>
          </View>
        ) : null}

        <View style={styles.infoGrid}>
          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>Plan</Text>
            <Text style={styles.infoValue}>{org.plan_name}</Text>
          </View>
          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>Statut abonnement</Text>
            <Text style={styles.infoValue}>{org.subscription_status ?? '—'}</Text>
          </View>
          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>Essai jusqu'au</Text>
            <Text style={styles.infoValue}>{formatDate(org.trial_ends_at)}</Text>
          </View>
          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>Créée le</Text>
            <Text style={styles.infoValue}>{formatDate(org.created_at)}</Text>
          </View>
          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>Identifiant</Text>
            <Text style={styles.infoValueMono} numberOfLines={1}>
              {org.id}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Membres ({detail.members.length})</Text>
        <View style={styles.list}>
          {detail.members.map((m) => (
            <View key={m.user_id} style={styles.memberRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.memberName}>{m.full_name || m.email}</Text>
                <Text style={styles.memberSubtitle}>
                  {m.email} · {m.role}
                </Text>
              </View>
              <Text style={styles.memberMeta}>Dernière connexion : {m.last_sign_in_at ? formatDate(m.last_sign_in_at) : 'jamais'}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Modules standards</Text>
        <View style={styles.chipRow}>
          {detail.standard_modules.length === 0 ? (
            <Text style={styles.emptyText}>Aucun module standard activé.</Text>
          ) : (
            detail.standard_modules.map((key) => (
              <View key={key} style={styles.chip}>
                <Text style={styles.chipText}>{STANDARD_MODULE_LABELS.get(key) ?? key}</Text>
              </View>
            ))
          )}
        </View>

        <Text style={styles.sectionTitle}>Modules privés / Extensions</Text>
        <View style={styles.list}>
          {nonStandardModules.length === 0 ? (
            <Text style={styles.emptyText}>Aucun module privé enregistré dans le registre.</Text>
          ) : (
            nonStandardModules.map((mod) => {
              const enabled = enabledByKey.get(mod.key) ?? false;
              const pending = pendingKeys.has(mod.key);
              return (
                <View key={mod.id} style={styles.moduleRow}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.moduleTitleRow}>
                      <Text style={styles.memberName}>{mod.name}</Text>
                      <View style={[styles.visibilityPill, mod.visibility === 'experimental' && styles.visibilityPillExperimental]}>
                        <Text style={styles.visibilityPillText}>{mod.visibility === 'experimental' ? 'Beta' : 'Privé'}</Text>
                      </View>
                    </View>
                    {mod.description ? <Text style={styles.memberSubtitle}>{mod.description}</Text> : null}
                  </View>
                  <Switch value={enabled} disabled={pending} onChange={(next) => toggle(mod.key, next, mod.name)} />
                </View>
              );
            })
          )}
        </View>
      </Container>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  feedback: {
    backgroundColor: colors.successSoft,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
  },
  feedbackText: {
    color: colors.success,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  infoCell: {
    minWidth: 160,
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  infoLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: '700',
  },
  infoValueMono: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },
  list: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  memberRow: {
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
  memberName: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  memberSubtitle: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  memberMeta: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  chip: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  chipText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.primary,
  },
  moduleRow: {
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
  moduleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  visibilityPill: {
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  visibilityPillExperimental: {
    backgroundColor: colors.warningSoft,
  },
  visibilityPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
});
