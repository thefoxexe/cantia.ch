import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { OnboardingShell } from '../../../components/site/OnboardingShell';
import { sans, site } from '../../../lib/siteTheme';
import { Button, Field, Screen } from '../../../components/ui';
import { useTranslation } from '../../../lib/translations';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import { SectorPicker } from '../../../components/SectorPicker';
import { displayType } from '../../../lib/marketingTheme';
import { WORK_TERMS, workTermText, type WorkTerm } from '../../../lib/vocabulary';

// Same values as public.set_acquisition_source (migration 20261103200000).
const ACQUISITION_SOURCES = ['bouche_a_oreille', 'google', 'ia', 'reseaux_sociaux', 'fiduciaire', 'publicite', 'autre'] as const;
type AcquisitionSource = (typeof ACQUISITION_SOURCES)[number];

export default function CreateOrganizationScreen() {
  const { t } = useTranslation();
  const { createOrganization } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [trade, setTrade] = useState<string | null>(null);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [workTerm, setWorkTerm] = useState<WorkTerm>('chantier');
  // « Comment avez-vous connu Cantia ? » — one tap, stored on the company.
  const [source, setSource] = useState<AcquisitionSource | null>(null);
  const [sourceDetail, setSourceDetail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    setError(null);
    if (!name.trim()) {
      setError(t('authOnboardingCreate.nameRequired'));
      return;
    }
    if (!source) {
      setError(t('authOnboardingCreate.sourceRequired'));
      return;
    }
    setLoading(true);
    const { error: createError } = await createOrganization(name.trim(), trade, workTerm, specialties, { source, detail: sourceDetail.trim() || null });
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
    <OnboardingShell step={1} contentContainerStyle={styles.container}>
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

        <SectorPicker
          trade={trade}
          specialties={specialties}
          labelStyle={styles.fieldLabel}
          onChange={(tr, sp) => {
            setTrade(tr);
            setSpecialties(sp);
          }}
        />

        <Text style={styles.fieldLabel}>{t('authOnboardingCreate.workTermLabel')}</Text>
        <View style={styles.chips}>
          {WORK_TERMS.map((term) => (
            <Pressable key={term} onPress={() => setWorkTerm(term)} style={[styles.chip, workTerm === term && styles.chipActive]}>
              <Text style={[styles.chipText, workTerm === term && styles.chipTextActive]}>{workTermText(t, term, 'plural')}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.hint}>{String(t('authOnboardingCreate.workTermHint', { example: workTermText(t, workTerm, 'example'), postProcess: [] } as any))}</Text>

        <Text style={styles.fieldLabel}>{t('authOnboardingCreate.sourceLabel')}</Text>
        <View style={styles.chips}>
          {ACQUISITION_SOURCES.map((key) => (
            <Pressable key={key} onPress={() => setSource(key)} style={[styles.chip, source === key && styles.chipActive]}>
              <Text style={[styles.chipText, source === key && styles.chipTextActive]}>{t(`authOnboardingCreate.sources.${key}`)}</Text>
            </Pressable>
          ))}
        </View>
        {source === 'autre' || source === 'reseaux_sociaux' || source === 'publicite' ? (
          <Field label={t('authOnboardingCreate.sourceDetailPlaceholder')} value={sourceDetail} onChangeText={setSourceDetail} placeholder={t('authOnboardingCreate.sourceDetailPlaceholder')} />
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button title={t('authOnboardingCreate.submit')} onPress={handleCreate} loading={loading} style={{ marginTop: spacing.xl }} />
      </OnboardingShell>
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
    ...sans,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '400',
    letterSpacing: -1.2,
    color: site.ink,
  },
  subtitle: {
    ...sans,
    fontSize: 14,
    color: site.muted,
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
  hint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: -spacing.sm,
    marginBottom: spacing.sm,
  },
  error: {
    color: colors.danger,
    fontSize: fontSize.sm,
    marginTop: spacing.sm,
  },
});
