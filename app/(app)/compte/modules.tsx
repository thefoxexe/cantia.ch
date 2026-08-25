import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import { Container, PageHeader, Screen } from '../../../components/ui';
import { ORG_MODULES, isModuleEnabled, listMyPrivateModules, toggleModuleActivation, type ModuleKey, type PrivateModuleGrant } from '../../../lib/modules';
import { colors, fontSize, spacing } from '../../../lib/theme';
import type { Plan } from '../../../lib/types';

// Modules whose availability also depends on the org's plan, beyond the
// admin's own on/off toggle.
const PLAN_GATED: Partial<Record<ModuleKey, keyof Plan>> = {
  planning: 'has_planning',
  payroll: 'has_payroll',
  treasury: 'has_treasury',
};

export default function ModulesScreen() {
  const { organization, role, refreshOrganization } = useAuth();
  const router = useRouter();
  const [enabledModules, setEnabledModules] = useState<string[]>(organization?.enabled_modules ?? []);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [saving, setSaving] = useState(false);
  const [privateModules, setPrivateModules] = useState<PrivateModuleGrant[]>([]);
  const [togglingKey, setTogglingKey] = useState<string | null>(null);
  const isAdmin = role === 'owner' || role === 'admin';

  const load = useCallback(async () => {
    setEnabledModules(organization?.enabled_modules ?? []);
    if (!organization) return;
    const { data } = await supabase.from('plans').select('*').eq('id', organization.plan_id).single();
    setPlan(data ?? null);
    setPrivateModules(await listMyPrivateModules());
  }, [organization]);

  async function togglePrivateModule(mod: PrivateModuleGrant) {
    if (!isAdmin || togglingKey) return;
    setTogglingKey(mod.key);
    const { error } = await toggleModuleActivation(mod.key, !mod.activated);
    if (!error) setPrivateModules((prev) => prev.map((m) => (m.key === mod.key ? { ...m, activated: !m.activated } : m)));
    setTogglingKey(null);
  }

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  function isPlanGated(key: ModuleKey): boolean {
    const field = PLAN_GATED[key];
    if (!field || !plan) return false;
    return !plan[field];
  }

  async function toggleModule(key: ModuleKey) {
    if (!organization || !isAdmin || saving || isPlanGated(key)) return;
    const next = isModuleEnabled(enabledModules, key)
      ? enabledModules.filter((m) => m !== key)
      : [...enabledModules, key];
    setEnabledModules(next);
    setSaving(true);
    await supabase.from('organizations').update({ enabled_modules: next }).eq('id', organization.id);
    setSaving(false);
    refreshOrganization();
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl * 2 }}>
        <Container>
          <PageHeader title="Outils & modules" backTo="/(app)/compte" />
          <Text style={styles.hint}>
            Sections principales de l'application, pour toute l'équipe. Les outils propres à un chantier (documents,
            photos, métré, sous-traitants, rentabilité) se choisissent séparément dans les paramètres de
            chaque chantier.
          </Text>
          <View style={{ marginTop: spacing.lg, gap: spacing.lg }}>
            {ORG_MODULES.map((m) => {
              const gated = isPlanGated(m.key);
              return (
                <View key={m.key} style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>{m.label}</Text>
                    <Text style={styles.desc}>{m.description}</Text>
                    {gated ? (
                      <Text style={styles.upgradeHint} onPress={() => router.push('/(app)/compte')}>
                        Disponible à partir du plan Équipe — voir les plans
                      </Text>
                    ) : null}
                  </View>
                  <Switch
                    value={!gated && isModuleEnabled(enabledModules, m.key)}
                    onValueChange={() => toggleModule(m.key)}
                    disabled={!isAdmin || gated}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor="#fff"
                  />
                </View>
              );
            })}
          </View>

          {privateModules.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>Modules sur mesure</Text>
              <Text style={styles.hint}>Fonctionnalités développées spécifiquement pour votre entreprise. Activez-les quand votre équipe est prête.</Text>
              <View style={{ marginTop: spacing.lg, gap: spacing.lg }}>
                {privateModules.map((m) => (
                  <View key={m.key} style={styles.row}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.label}>{m.name}</Text>
                      {m.description ? <Text style={styles.desc}>{m.description}</Text> : null}
                    </View>
                    <Switch
                      value={m.activated}
                      onValueChange={() => togglePrivateModule(m)}
                      disabled={!isAdmin || togglingKey === m.key}
                      trackColor={{ false: colors.border, true: colors.primary }}
                      thumbColor="#fff"
                    />
                  </View>
                ))}
              </View>
            </>
          ) : null}
        </Container>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.xxl,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  desc: {
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
