import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import { Button, Container, Field, Screen } from '../../../components/ui';
import { SettingsHeader } from '../../../components/SettingsHeader';
import { DevisTemplatePicker } from '../../../components/DevisTemplatePicker';
import { colors, fontSize, spacing } from '../../../lib/theme';

export default function DevisSettingsScreen() {
  const { organization, role, refreshOrganization } = useAuth();
  const [vatRate, setVatRate] = useState(String(organization?.default_vat_rate ?? 8.1));
  const [validityDays, setValidityDays] = useState(String(organization?.devis_validity_days ?? 30));
  const [devisTerms, setDevisTerms] = useState(organization?.devis_terms ?? '');
  const [devisTemplate, setDevisTemplate] = useState(organization?.devis_template ?? 'classic');
  const [saving, setSaving] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const isAdmin = role === 'owner' || role === 'admin';

  const load = useCallback(() => {
    if (!organization) return;
    setVatRate(String(organization.default_vat_rate ?? 8.1));
    setValidityDays(String(organization.devis_validity_days ?? 30));
    setDevisTerms(organization.devis_terms ?? '');
    setDevisTemplate(organization.devis_template ?? 'classic');
  }, [organization]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function handleSave() {
    if (!organization) return;
    setSaving(true);
    await supabase
      .from('organizations')
      .update({
        default_vat_rate: Number(vatRate) || 0,
        devis_validity_days: Number(validityDays) || 30,
        devis_terms: devisTerms.trim() || null,
      })
      .eq('id', organization.id);
    setSaving(false);
    refreshOrganization();
  }

  async function selectDevisTemplate(templateId: string) {
    if (!organization || !isAdmin || templateId === devisTemplate) return;
    setDevisTemplate(templateId);
    setSavingTemplate(true);
    await supabase.from('organizations').update({ devis_template: templateId }).eq('id', organization.id);
    setSavingTemplate(false);
    refreshOrganization();
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl * 2 }}>
        <Container>
          <SettingsHeader title="Devis & modèle PDF" backTo="/(app)/compte" />

          <View style={styles.row2}>
            <View style={styles.row2Item}>
              <Field label="TVA par défaut (%)" value={vatRate} onChangeText={setVatRate} editable={isAdmin} keyboardType="decimal-pad" />
            </View>
            <View style={styles.row2Item}>
              <Field
                label="Validité (jours)"
                value={validityDays}
                onChangeText={setValidityDays}
                editable={isAdmin}
                keyboardType="number-pad"
              />
            </View>
          </View>
          <Field
            label="Mentions / conditions (pied de page PDF)"
            value={devisTerms}
            onChangeText={setDevisTerms}
            editable={isAdmin}
            placeholder="Ex : Paiement à 30 jours net. TVA non incluse dans les acomptes."
            multiline
            style={styles.terms}
          />
          {isAdmin ? (
            <Button title="Enregistrer" icon="check" onPress={handleSave} loading={saving} style={{ marginTop: spacing.sm }} />
          ) : null}

          <Text style={styles.sectionTitle}>Modèle de devis PDF</Text>
          <Text style={styles.hint}>
            Choisissez la mise en page utilisée pour générer vos devis. Elle s’applique automatiquement à tous vos
            prochains devis.
          </Text>
          <View style={{ marginTop: spacing.md }}>
            <DevisTemplatePicker
              value={devisTemplate}
              onChange={selectDevisTemplate}
              disabled={!isAdmin}
              hasLogo={!!organization?.logo_url}
            />
          </View>
          {savingTemplate ? <Text style={styles.hint}>Enregistrement du modèle…</Text> : null}
        </Container>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.xxl,
    marginBottom: spacing.md,
  },
  row2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  row2Item: {
    flexGrow: 1,
    flexBasis: 160,
  },
  terms: {
    minHeight: 70,
    paddingTop: spacing.md,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
});
