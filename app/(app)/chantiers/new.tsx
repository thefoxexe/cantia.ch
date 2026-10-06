import { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import { Button, PageHeader, AppScreen } from '../../../components/ui';
import { PROJECT_MODULE_PLAN_GATED, defaultProjectModules, projectModulesFor, isModuleEnabled, type ModuleKey } from '../../../lib/modules';
import { useTranslation } from '../../../lib/translations';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import { listFolders, suggestReference } from '../../../lib/projectFolders';
import { listClients } from '../../../lib/api/clients';
import { EMPTY_PROJECT_INFO, ProjectInfoForm, projectInfoRow, type ProjectInfo } from '../../../components/chantier/ProjectInfoForm';
import type { Client, Plan, ProjectFolder } from '../../../lib/types';


export default function NewChantierScreen() {
  const { t } = useTranslation();
  const { organization, user } = useAuth();
  const params = useLocalSearchParams<{ folder?: string }>();
  const [info, setInfo] = useState<ProjectInfo>(EMPTY_PROJECT_INFO);
  const [folders, setFolders] = useState<ProjectFolder[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [suggestion, setSuggestion] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [plan, setPlan] = useState<Plan | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);
  // The company's default tools (sign-up / Paramètres › Modules).
  const defaultModules = defaultProjectModules(organization);
  const [enabledModules, setEnabledModules] = useState<string[]>(defaultModules);
  const [savingModules, setSavingModules] = useState(false);

  // the folder the user was in (Chantiers › 2026 › …), set after mount
  useEffect(() => {
    if (params.folder) setInfo((v) => ({ ...v, folder_id: String(params.folder) }));
  }, [params.folder]);

  useEffect(() => {
    if (!organization) return;
    listFolders(organization.id).then(setFolders);
    listClients(organization.id).then(setClients).catch(() => setClients([]));
    supabase
      .from('projects')
      .select('reference')
      .eq('organization_id', organization.id)
      .not('reference', 'is', null)
      .then(({ data }) => setSuggestion(suggestReference((data ?? []).map((r) => r.reference))));
  }, [organization?.id]);

  useEffect(() => {
    if (!organization) return;
    supabase.from('plans').select('*').eq('id', organization.plan_id).single().then(({ data }) => setPlan(data ?? null));
  }, [organization?.plan_id]);

  function isPlanGated(key: ModuleKey): boolean {
    const field = PROJECT_MODULE_PLAN_GATED[key];
    if (!field || !plan) return false;
    return !plan[field];
  }

  function toggleModule(key: ModuleKey) {
    if (isPlanGated(key)) return;
    setEnabledModules((prev) => (isModuleEnabled(prev, key) ? prev.filter((m) => m !== key) : [...prev, key]));
  }

  async function confirmModules() {
    if (createdId) {
      setSavingModules(true);
      await supabase.from('projects').update({ enabled_modules: enabledModules }).eq('id', createdId);
      setSavingModules(false);
      router.replace(`/(app)/chantiers/${createdId}`);
    }
  }

  async function handleCreate() {
    if (!organization) return;
    if (!info.name.trim()) {
      setError(t('newChantier.nameRequired'));
      return;
    }
    setError(null);
    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .insert({
        organization_id: organization.id,
        ...projectInfoRow(info),
        created_by: user?.id,
      })
      .select()
      .single();
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    // The row already has the DB default enabled_modules — this step just
    // lets the user customize it for this specific chantier before entering it.
    setEnabledModules(defaultModules);
    setCreatedId(data.id);
  }

  return (
    <AppScreen style={{ padding: spacing.xl }}>
      <ScrollView style={{ flex: 1 }}>
        <PageHeader title={t('newChantier.title')} backTo={params.folder ? (`/(app)/chantiers?folder=${params.folder}` as never) : '/(app)/chantiers'} />

        <View style={{ width: '100%', maxWidth: 860, alignSelf: 'center', gap: spacing.lg, paddingBottom: spacing.xxl }}>
          <ProjectInfoForm value={info} onChange={(patch) => setInfo((v) => ({ ...v, ...patch }))} folders={folders} clients={clients} suggestion={suggestion} />
          {error ? <Text style={{ color: colors.danger, fontSize: fontSize.sm }}>{error}</Text> : null}
          <Button title={t('newChantier.create')} icon="check" onPress={handleCreate} loading={loading} />
        </View>
      </ScrollView>

      <Modal visible={!!createdId} animationType="fade" transparent onRequestClose={confirmModules}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{t('newChantier.modulesTitle')}</Text>
            <Text style={styles.sheetSubtitle}>{t('newChantier.modulesSubtitle')}</Text>
            <ScrollView contentContainerStyle={styles.sheetList}>
              {projectModulesFor(organization).map((m) => {
                const gated = isPlanGated(m.key);
                return (
                  <View key={m.key} style={styles.row}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowLabel}>{t(`modules.${m.key}.label` as any)}</Text>
                      <Text style={styles.rowDesc}>{t(`modules.${m.key}.description` as any)}</Text>
                      {gated ? <Text style={styles.upgradeHint}>{t('newChantier.modulePlanGatedHint')}</Text> : null}
                    </View>
                    <Switch
                      value={!gated && isModuleEnabled(enabledModules, m.key)}
                      onValueChange={() => toggleModule(m.key)}
                      disabled={gated}
                      trackColor={{ false: colors.border, true: colors.primary }}
                      thumbColor="#fff"
                    />
                  </View>
                );
              })}
            </ScrollView>
            <Button title={t('newChantier.continue')} icon="check" onPress={confirmModules} loading={savingModules} style={{ marginTop: spacing.lg }} />
          </View>
        </View>
      </Modal>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 20, 18, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  sheet: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '85%',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
  },
  sheetTitle: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.text,
  },
  sheetSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
    lineHeight: 19,
  },
  sheetList: {
    gap: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  rowLabel: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  rowDesc: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  upgradeHint: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
});
