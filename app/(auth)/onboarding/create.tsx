import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { Button, Field, Screen } from '../../../components/ui';
import { useTranslation } from '../../../lib/translations';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import { TRADES, TRADE_KEYS } from '../../../lib/trades';

export default function CreateOrganizationScreen() {
  const { t } = useTranslation();
  const { createOrganization } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [trade, setTrade] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    setError(null);
    if (!name.trim()) {
      setError(t('authOnboardingCreate.nameRequired'));
      return;
    }
    setLoading(true);
    const { error: createError } = await createOrganization(name.trim(), trade);
    setLoading(false);
    if (createError) {
      setError(createError);
      return;
    }
    // The root layout redirects to /choose-plan automatically once
    // `organization` is set and `plan_selected` is false, then to
    // /(auth)/onboarding/setup once payment succeeds — the richer company
    // profile (logo, address, brand color, modules) is collected there,
    // not here, so this step stays fast on the way to checkout.
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <Pressable onPress={() => router.replace('/(auth)/onboarding')} style={styles.backLink} hitSlop={8}>
          <Feather name="arrow-left" size={16} color={colors.textMuted} />
          <Text style={styles.backLinkText}>{t('authOnboardingCreate.backLink')}</Text>
        </Pressable>

        <Text style={styles.title}>{t('authOnboardingCreate.title')}</Text>
        <Text style={styles.subtitle}>{t('authOnboardingCreate.subtitle')}</Text>

        <Field
          label={t('authOnboardingCreate.nameLabel')}
          value={name}
          onChangeText={setName}
          placeholder={t('authOnboardingCreate.namePlaceholder')}
        />

        <Text style={styles.fieldLabel}>{t('authOnboardingCreate.tradeLabel')}</Text>
        <View style={styles.chips}>
          {TRADES.map((tr) => (
            <Pressable key={tr} onPress={() => setTrade(tr)} style={[styles.chip, trade === tr && styles.chipActive]}>
              <Text style={[styles.chipText, trade === tr && styles.chipTextActive]}>{t(`trades.${TRADE_KEYS[tr]}` as any)}</Text>
            </Pressable>
          ))}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button title={t('authOnboardingCreate.submit')} onPress={handleCreate} loading={loading} style={{ marginTop: spacing.xl }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: spacing.xl,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  backLinkText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: '600',
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  fieldLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    fontWeight: '500',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: fontSize.sm,
    color: colors.text,
  },
  chipTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  error: {
    color: colors.danger,
    fontSize: fontSize.sm,
    marginTop: spacing.sm,
  },
});
