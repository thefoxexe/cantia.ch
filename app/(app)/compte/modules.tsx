import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import { Container, PageHeader, Screen } from '../../../components/ui';
import { TOGGLEABLE_MODULES, isModuleEnabled, type ModuleKey } from '../../../lib/modules';
import { colors, fontSize, spacing } from '../../../lib/theme';

export default function ModulesScreen() {
  const { organization, role, refreshOrganization } = useAuth();
  const [enabledModules, setEnabledModules] = useState<string[]>(organization?.enabled_modules ?? []);
  const [saving, setSaving] = useState(false);
  const isAdmin = role === 'owner' || role === 'admin';

  useFocusEffect(
    useCallback(() => {
      setEnabledModules(organization?.enabled_modules ?? []);
    }, [organization]),
  );

  async function toggleModule(key: ModuleKey) {
    if (!organization || !isAdmin || saving) return;
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
            Désactivez ce que vous n’utilisez pas pour garder une application simple. Rapports reste toujours actif.
          </Text>
          <View style={{ marginTop: spacing.lg, gap: spacing.lg }}>
            {TOGGLEABLE_MODULES.map((m) => (
              <View key={m.key} style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>{m.label}</Text>
                  <Text style={styles.desc}>{m.description}</Text>
                </View>
                <Switch
                  value={isModuleEnabled(enabledModules, m.key)}
                  onValueChange={() => toggleModule(m.key)}
                  disabled={!isAdmin}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#fff"
                />
              </View>
            ))}
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
});
