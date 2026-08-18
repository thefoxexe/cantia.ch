import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import { Container, PageHeader, Screen } from '../../../components/ui';
import { ORG_MODULES, isModuleEnabled, type ModuleKey } from '../../../lib/modules';
import { colors, fontSize, spacing } from '../../../lib/theme';
import type { Plan } from '../../../lib/types';

// Modules whose availability also depends on the org's plan, beyond the
// admin's own on/off toggle.
const PLAN_GATED: Partial<Record<ModuleKey, keyof Plan>> = {
  planning: 'has_planning',
  payroll: 'has_payroll',
};

export default function ModulesScreen() {
  const { organization, role, refreshOrganization } = useAuth();
  const router = useRouter();
  const [enabledModules, setEnabledModules] = useState<string[]>(organization?.enabled_modules ?? []);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [saving, setSaving] = useState(false);
  const isAdmin = role === 'owner' || role === 'admin';

  const load = useCallback(async () => {
    setEnabledModules(organization?.enabled_modules ?? []);
    if (!organization) return;
    const { data } = await supabase.from('plans').select('*').eq('id', organization.plan_id).single();
    setPlan(data ?? null);
  }, [organization]);

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
            photos, levés, métré, sous-traitants, rentabilité) se choisissent séparément dans les paramètres de
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
