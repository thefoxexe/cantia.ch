import { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import { Button, Field, PageHeader, Screen } from '../../../components/ui';
import { PROJECT_MODULES, PROJECT_MODULE_PLAN_GATED, isModuleEnabled, type ModuleKey } from '../../../lib/modules';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import type { Plan } from '../../../lib/types';

const DEFAULT_MODULES = ['documents', 'photos', 'metre'];

export default function NewChantierScreen() {
  const { organization, user } = useAuth();
  const [name, setName] = useState('');
  const [clientName, setClientName] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [plan, setPlan] = useState<Plan | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [enabledModules, setEnabledModules] = useState<string[]>(DEFAULT_MODULES);
  const [savingModules, setSavingModules] = useState(false);

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
    // The row already has the DB default enabled_modules — this step just
    // lets the user customize it for this specific chantier before entering it.
    setEnabledModules(DEFAULT_MODULES);
    setCreatedId(data.id);
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

      <Modal visible={!!createdId} animationType="fade" transparent onRequestClose={confirmModules}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Quels outils pour ce chantier ?</Text>
            <Text style={styles.sheetSubtitle}>
              Choisissez les outils utiles à ce chantier précis. Vous pourrez changer ça à tout moment depuis ses
              paramètres.
            </Text>
            <ScrollView contentContainerStyle={styles.sheetList}>
              {PROJECT_MODULES.map((m) => {
                const gated = isPlanGated(m.key);
                return (
                  <View key={m.key} style={styles.row}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowLabel}>{m.label}</Text>
                      <Text style={styles.rowDesc}>{m.description}</Text>
                      {gated ? <Text style={styles.upgradeHint}>Disponible à partir du plan Équipe</Text> : null}
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
  upgradeHint: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
});
