import { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import { Button, Field, PageHeader, Screen } from '../../../components/ui';
import { TOGGLEABLE_MODULES, isModuleEnabled, type ModuleKey } from '../../../lib/modules';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';

export default function NewChantierScreen() {
  const { organization, user, refreshOrganization } = useAuth();
  const [name, setName] = useState('');
  const [clientName, setClientName] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [showModulesPrompt, setShowModulesPrompt] = useState(false);
  const [enabledModules, setEnabledModules] = useState<string[]>(organization?.enabled_modules ?? []);
  const [savingModules, setSavingModules] = useState(false);

  useEffect(() => {
    if (!organization) return;
    supabase
      .from('projects')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', organization.id)
      .then(({ count }) => {
        if (count === 0) {
          setEnabledModules(organization.enabled_modules ?? []);
          setShowModulesPrompt(true);
        }
      });
    // Only relevant right when this screen is first reached — re-checking on
    // every organization refresh would keep re-opening the prompt after the
    // first project has already been created.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organization?.id]);

  function toggleModule(key: ModuleKey) {
    setEnabledModules((prev) => (isModuleEnabled(prev, key) ? prev.filter((m) => m !== key) : [...prev, key]));
  }

  async function confirmModules() {
    if (!organization) {
      setShowModulesPrompt(false);
      return;
    }
    setSavingModules(true);
    await supabase.from('organizations').update({ enabled_modules: enabledModules }).eq('id', organization.id);
    await refreshOrganization();
    setSavingModules(false);
    setShowModulesPrompt(false);
  }

  async function handleCreate() {
    if (!organization) return;
    if (!name.trim()) {
      setError('Le nom du chantier est requis.');
      return;
    }
    setError(null);
    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .insert({
        organization_id: organization.id,
        name: name.trim(),
        client_name: clientName.trim() || null,
        address: address.trim() || null,
        created_by: user?.id,
      })
      .select()
      .single();
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.replace(`/(app)/chantiers/${data.id}`);
  }

  return (
    <Screen style={{ padding: spacing.xl }}>
      <ScrollView>
        <PageHeader title="Nouveau chantier" backTo="/(app)/chantiers" />

        <Field label="Nom du chantier" value={name} onChangeText={setName} placeholder="Ex : Villa Dupont - Rue du Lac 12" />
        <Field label="Client" value={clientName} onChangeText={setClientName} placeholder="Nom du client" />
        <Field label="Adresse" value={address} onChangeText={setAddress} placeholder="Adresse du chantier" />
        {error ? <Text style={{ color: colors.danger, fontSize: fontSize.sm, marginBottom: spacing.md }}>{error}</Text> : null}
        <Button title="Créer le chantier" onPress={handleCreate} loading={loading} />
      </ScrollView>

      <Modal visible={showModulesPrompt} animationType="fade" transparent onRequestClose={confirmModules}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Bienvenue sur Opus-Flow</Text>
            <Text style={styles.sheetSubtitle}>
              Avant votre premier chantier, choisissez les outils que vous voulez utiliser. Vous pourrez changer ça à
              tout moment depuis Compte → Outils & modules.
            </Text>
            <ScrollView contentContainerStyle={styles.sheetList}>
              {TOGGLEABLE_MODULES.map((m) => (
                <View key={m.key} style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowLabel}>{m.label}</Text>
                    <Text style={styles.rowDesc}>{m.description}</Text>
                  </View>
                  <Switch
                    value={isModuleEnabled(enabledModules, m.key)}
                    onValueChange={() => toggleModule(m.key)}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor="#fff"
                  />
                </View>
              ))}
            </ScrollView>
            <Button title="Continuer" icon="check" onPress={confirmModules} loading={savingModules} style={{ marginTop: spacing.lg }} />
          </View>
        </View>
      </Modal>
    </Screen>
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
});
