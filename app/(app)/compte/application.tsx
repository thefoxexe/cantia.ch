import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Constants from 'expo-constants';
import { useAuth } from '../../../lib/auth-context';
import { Card, Container, PageHeader, AppScreen } from '../../../components/ui';
import { showSavedCheckmark } from '../../../components/SaveConfirmation';
import { AVAILABLE_LOCALES, useTranslation, type AppLocale } from '../../../lib/translations';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';

// Paramètres › Application: settings of the app itself, for the person
// signed in (not the company). The app's language lives here, saved on
// organization_members.locale and applied at once. Each language is written
// in its own language, so someone lost in the wrong one still finds theirs.
const NATIVE_NAME: Record<AppLocale, string> = { fr: 'Français', de: 'Deutsch', it: 'Italiano' };

export default function ApplicationSettingsScreen() {
  const { t, i18n } = useTranslation();
  const { changeLocale } = useAuth();
  const current = i18n.language as AppLocale;
  const [saving, setSaving] = useState<AppLocale | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function pick(loc: AppLocale) {
    if (loc === current || saving) return;
    setSaving(loc);
    setError(null);
    const { error: e } = await changeLocale(loc);
    setSaving(null);
    if (e) setError(t('application.saveFailed'));
    else showSavedCheckmark();
  }

  return (
    <AppScreen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl * 2 }}>
        <Container>
          <PageHeader title={t('application.title')} backTo="/(app)/compte" />
          <Text style={styles.intro}>{t('application.intro')}</Text>

          <Text style={styles.sectionTitle}>{t('application.languageTitle')}</Text>
          <Text style={styles.sectionHint}>{t('application.languageHint')}</Text>
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            {AVAILABLE_LOCALES.map((loc, i) => {
              const on = loc === current;
              return (
                <Pressable
                  key={loc}
                  onPress={() => pick(loc)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: on }}
                  style={({ hovered }: any) => [styles.row, i > 0 && styles.rowBorder, hovered && !on && { backgroundColor: colors.surfaceAlt }]}
                >
                  <Text style={[styles.rowLabel, on && { color: colors.primary }]}>{NATIVE_NAME[loc]}</Text>
                  <View style={[styles.radio, on && styles.radioOn]}>{on ? <View style={styles.radioDot} /> : null}</View>
                </Pressable>
              );
            })}
          </Card>
          {saving ? <Text style={styles.sectionHint}>{t('application.saving')}</Text> : null}
          {error ? <Text style={[styles.sectionHint, { color: colors.danger }]}>{error}</Text> : null}
          <Text style={styles.note}>{t('application.documentsNote')}</Text>

          <Text style={styles.version}>{t('application.version', { version: Constants.expoConfig?.version ?? '1.0.0' })}</Text>
        </Container>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  intro: { fontSize: fontSize.sm, color: colors.textMuted, marginBottom: spacing.lg, lineHeight: 20 },
  sectionTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text, marginTop: spacing.md },
  sectionHint: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 4, marginBottom: spacing.md, lineHeight: 20 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  rowLabel: { fontSize: fontSize.md, fontWeight: '600', color: colors.text },
  radio: { width: 20, height: 20, borderRadius: radius.pill, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: radius.pill, backgroundColor: colors.primary },
  note: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.md, lineHeight: 20 },
  version: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: spacing.xl },
});
