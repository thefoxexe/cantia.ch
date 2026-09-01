import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import { Button, Container, Field, PageHeader, Screen } from '../../../components/ui';
import { showSavedCheckmark } from '../../../components/SaveConfirmation';
import { useTranslation } from '../../../lib/translations';
import { colors, fontSize, spacing } from '../../../lib/theme';

export default function DevisSettingsScreen() {
  const { t } = useTranslation();
  const { organization, role, refreshOrganization } = useAuth();
  const [vatRate, setVatRate] = useState(String(organization?.default_vat_rate ?? 8.1));
  const [validityDays, setValidityDays] = useState(String(organization?.devis_validity_days ?? 30));
  const [devisTerms, setDevisTerms] = useState(organization?.devis_terms ?? '');
  const [hourlyCost, setHourlyCost] = useState(String(organization?.hourly_cost ?? 0));
  const [saving, setSaving] = useState(false);
  const isAdmin = role === 'owner' || role === 'admin';

  const load = useCallback(() => {
    if (!organization) return;
    setVatRate(String(organization.default_vat_rate ?? 8.1));
    setValidityDays(String(organization.devis_validity_days ?? 30));
    setDevisTerms(organization.devis_terms ?? '');
    setHourlyCost(String(organization.hourly_cost ?? 0));
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
        hourly_cost: Number(hourlyCost) || 0,
      })
      .eq('id', organization.id);
    setSaving(false);
    refreshOrganization();
    showSavedCheckmark();
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl * 2 }}>
        <Container>
          <PageHeader title={t('devisSettings.title')} backTo="/(app)/compte" />

          <View style={styles.row2}>
            <View style={styles.row2Item}>
              <Field label={t('devisSettings.vatRateLabel')} value={vatRate} onChangeText={setVatRate} editable={isAdmin} keyboardType="decimal-pad" />
            </View>
            <View style={styles.row2Item}>
              <Field
                label={t('devisSettings.validityLabel')}
                value={validityDays}
                onChangeText={setValidityDays}
                editable={isAdmin}
                keyboardType="number-pad"
              />
            </View>
          </View>
          <Field
            label={t('devisSettings.termsLabel')}
            value={devisTerms}
            onChangeText={setDevisTerms}
            editable={isAdmin}
            placeholder={t('devisSettings.termsPlaceholder')}
            multiline
            style={styles.terms}
          />
          <Field
            label={t('devisSettings.hourlyCostLabel')}
            value={hourlyCost}
            onChangeText={setHourlyCost}
            editable={isAdmin}
            keyboardType="decimal-pad"
            placeholder={t('devisSettings.hourlyCostPlaceholder')}
          />
          <Text style={styles.hint}>{t('devisSettings.hourlyCostHint')}</Text>
          {isAdmin ? (
            <Button title={t('common.save')} icon="check" onPress={handleSave} loading={saving} style={{ marginTop: spacing.sm }} />
          ) : null}

          <Text style={styles.hint}>{t('devisSettings.layoutHint')}</Text>
        </Container>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
