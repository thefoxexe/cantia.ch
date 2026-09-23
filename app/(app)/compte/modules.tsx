import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import { Card, Container, PageHeader, Switch, AppScreen } from '../../../components/ui';
import { ORG_MODULES, isModuleEnabled, listMyPrivateModules, toggleModuleActivation, type ModuleKey, type PrivateModuleGrant } from '../../../lib/modules';
import { useTranslation } from '../../../lib/translations';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import type { Plan } from '../../../lib/types';

type IconName = keyof typeof Feather.glyphMap;

// Modules whose availability also depends on the org's plan, beyond the
// admin's own on/off toggle.
const PLAN_GATED: Partial<Record<ModuleKey, keyof Plan>> = {
  planning: 'has_planning',
  payroll: 'has_payroll',
  treasury: 'has_treasury',
};

const MODULE_ICON: Record<ModuleKey, IconName> = {
  documents: 'folder',
  photos: 'image',
  devis: 'file-text',
  metre: 'grid',
  planning: 'calendar',
  profitability: 'pie-chart',
  subcontractors: 'briefcase',
  payroll: 'users',
  treasury: 'trending-up',
  accounting: 'book-open',
};

export default function ModulesScreen() {
  const { t } = useTranslation();
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
    <AppScreen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl * 2 }}>
        <Container>
          <PageHeader title={t('moduleSettings.title')} backTo="/(app)/compte" />
          <Text style={styles.hint}>{t('moduleSettings.intro')}</Text>

          <View style={styles.rolesCallout}>
            <Feather name="shield" size={16} color={colors.accent} />
            <View style={{ flex: 1 }}>
              <Text style={styles.rolesCalloutText}>{t('moduleSettings.rolesHint')}</Text>
              <Text style={styles.rolesCalloutLink} onPress={() => router.push('/(app)/compte/equipe')}>
                {t('moduleSettings.rolesLink')}
              </Text>
            </View>
          </View>

          <View style={{ marginTop: spacing.lg, gap: spacing.md }}>
            {ORG_MODULES.map((m) => {
              const gated = isPlanGated(m.key);
              const active = !gated && isModuleEnabled(enabledModules, m.key);
              return (
                <Card key={m.key} style={styles.moduleCard}>
                  <View style={[styles.moduleIcon, active && styles.moduleIconActive]}>
                    <Feather name={MODULE_ICON[m.key]} size={17} color={active ? colors.primary : colors.textMuted} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>{t(`modules.${m.key}.label` as any)}</Text>
                    <Text style={styles.desc}>{t(`modules.${m.key}.description` as any)}</Text>
                    {gated ? (
                      <Text style={styles.upgradeHint} onPress={() => router.push('/(app)/compte')}>
                        {t('moduleSettings.upgradeHint')}
                      </Text>
                    ) : null}
                  </View>
                  <Switch value={active} onChange={() => toggleModule(m.key)} disabled={!isAdmin || gated} />
                </Card>
              );
            })}
          </View>

          {privateModules.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>{t('moduleSettings.customModulesTitle')}</Text>
              <Text style={styles.hint}>{t('moduleSettings.customModulesHint')}</Text>
              <View style={{ marginTop: spacing.lg, gap: spacing.md }}>
                {privateModules.map((m) => (
                  <Card key={m.key} style={styles.moduleCard}>
                    <View style={[styles.moduleIcon, m.activated && styles.moduleIconActive]}>
                      <Feather name="package" size={17} color={m.activated ? colors.primary : colors.textMuted} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.label}>{m.name}</Text>
                      {m.description ? <Text style={styles.desc}>{m.description}</Text> : null}
                    </View>
                    <Switch value={m.activated} onChange={() => togglePrivateModule(m)} disabled={!isAdmin || togglingKey === m.key} />
                  </Card>
                ))}
              </View>
            </>
          ) : null}
        </Container>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  hint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    lineHeight: 17,
  },
  rolesCallout: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.accentSoft,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  rolesCalloutText: {
    fontSize: fontSize.xs,
    color: colors.text,
    lineHeight: 17,
  },
  rolesCalloutLink: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.primary,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.xxl,
    marginBottom: spacing.xs,
  },
  moduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  moduleIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleIconActive: {
    backgroundColor: colors.primarySoft,
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
