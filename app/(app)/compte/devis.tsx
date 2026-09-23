import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import { Card, Container, Field, PageHeader, AppScreen } from '../../../components/ui';
import { UnsavedChangesBar } from '../../../components/UnsavedChangesBar';
import { UnsavedChangesModal } from '../../../components/UnsavedChangesModal';
import { useUnsavedChanges } from '../../../lib/useUnsavedChanges';
import { useTranslation } from '../../../lib/translations';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';

export default function DevisSettingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { organization, role, refreshOrganization } = useAuth();
  const [vatRate, setVatRate] = useState(String(organization?.default_vat_rate ?? 8.1));
  const [validityDays, setValidityDays] = useState(String(organization?.devis_validity_days ?? 30));
  const [devisTerms, setDevisTerms] = useState(organization?.devis_terms ?? '');
  const isAdmin = role === 'owner' || role === 'admin';

  const { dirty, saving, markDirty, save, discard, confirmBeforeBack, leaveModalVisible, onLeaveSave, onLeaveDiscard, onLeaveCancel } =
    useUnsavedChanges(handleSave);

  function withDirty(setter: (v: string) => void) {
    return (v: string) => {
      setter(v);
      markDirty();
    };
  }

  const load = useCallback(() => {
    if (!organization) return;
    setVatRate(String(organization.default_vat_rate ?? 8.1));
    setValidityDays(String(organization.devis_validity_days ?? 30));
    setDevisTerms(organization.devis_terms ?? '');
  }, [organization]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function handleSave() {
    if (!organization) return false;
    await supabase
      .from('organizations')
      .update({
        default_vat_rate: Number(vatRate) || 0,
        devis_validity_days: Number(validityDays) || 30,
        devis_terms: devisTerms.trim() || null,
      })
      .eq('id', organization.id);
    refreshOrganization();
  }

  return (
    <AppScreen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl * 2 }}>
        <Container>
          <PageHeader title={t('devisSettings.title')} backTo="/(app)/compte" onBeforeBack={confirmBeforeBack} />
          <Text style={styles.intro}>{t('devisSettings.intro')}</Text>

          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Feather name="percent" size={15} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>{t('devisSettings.defaultsTitle')}</Text>
              <Text style={styles.sectionHint}>{t('devisSettings.defaultsHint')}</Text>
            </View>
          </View>
          <Card style={styles.card}>
            <View style={styles.row2}>
              <View style={styles.row2Item}>
                <Field label={t('devisSettings.vatRateLabel')} value={vatRate} onChangeText={withDirty(setVatRate)} editable={isAdmin} keyboardType="decimal-pad" />
              </View>
              <View style={styles.row2Item}>
                <Field
                  label={t('devisSettings.validityLabel')}
                  value={validityDays}
                  onChangeText={withDirty(setValidityDays)}
                  editable={isAdmin}
                  keyboardType="number-pad"
                />
              </View>
            </View>
          </Card>

          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Feather name="file-text" size={15} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>{t('devisSettings.termsTitle')}</Text>
              <Text style={styles.sectionHint}>{t('devisSettings.termsHint')}</Text>
            </View>
          </View>
          <Card style={styles.card}>
            <Field
              label={t('devisSettings.termsLabel')}
              value={devisTerms}
              onChangeText={withDirty(setDevisTerms)}
              editable={isAdmin}
              placeholder={t('devisSettings.termsPlaceholder')}
              multiline
              style={styles.terms}
            />
            <Text style={styles.hint}>{t('devisSettings.layoutHint')}</Text>
          </Card>
        </Container>
      </ScrollView>
      {isAdmin ? <UnsavedChangesBar visible={dirty} saving={saving} onSave={save} onDiscard={() => discard(load)} /> : null}
      <UnsavedChangesModal visible={leaveModalVisible} saving={saving} onSave={onLeaveSave} onDiscard={onLeaveDiscard} onCancel={onLeaveCancel} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  intro: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    lineHeight: 17,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  sectionIcon: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  sectionHint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
  card: {
    gap: spacing.sm,
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
    marginTop: spacing.xs,
  },
});
