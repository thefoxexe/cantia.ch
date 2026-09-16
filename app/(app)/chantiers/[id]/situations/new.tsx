import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../../../../lib/auth-context';
import { useProject } from '../../../../../lib/useProject';
import { createSituationDraft, listDevisForProject } from '../../../../../lib/api/situations';
import { Button, Field, AppScreen } from '../../../../../components/ui';
import { useTranslation } from '../../../../../lib/translations';
import { colors, fontSize, radius, spacing } from '../../../../../lib/theme';
import type { Devis } from '../../../../../lib/types';

export default function NewSituationScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { organization, user } = useAuth();
  const { project } = useProject(id);

  const [devisOptions, setDevisOptions] = useState<Devis[]>([]);
  const [selectedDevisId, setSelectedDevisId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    listDevisForProject(id).then(setDevisOptions);
  }, [id]);

  async function handleCreate() {
    if (!organization || !selectedDevisId) {
      setError(t('newSituation.devisRequired'));
      return;
    }
    if (!title.trim()) {
      setError(t('newSituation.titleRequired'));
      return;
    }
    setError(null);
    setLoading(true);
    const { situationId, error: createError } = await createSituationDraft({
      organizationId: organization.id,
      projectId: id,
      devisId: selectedDevisId,
      title: title.trim(),
      userId: user?.id,
    });
    setLoading(false);
    if (createError || !situationId) {
      setError(createError ?? t('newSituation.createFailed'));
      return;
    }
    router.replace(`/(app)/chantiers/${id}/situations/${situationId}` as any);
  }

  return (
    <AppScreen>
      <ScrollView contentContainerStyle={{ padding: spacing.xl }}>
        <View style={styles.content}>
          <Text style={styles.pageTitle}>{t('newSituation.title')}</Text>
          <Text style={styles.pageSubtitle}>{project?.name}</Text>

          <Field label={t('newSituation.titleLabel')} value={title} onChangeText={setTitle} placeholder={t('newSituation.titlePlaceholder')} />

          <Text style={styles.sectionTitle}>{t('newSituation.devisSection')}</Text>
          <Text style={styles.sectionHint}>{t('newSituation.devisHint')}</Text>

          {devisOptions.length === 0 ? (
            <Text style={styles.emptyDevis}>{t('newSituation.noDevis')}</Text>
          ) : (
            <View style={styles.devisList}>
              {devisOptions.map((d) => (
                <Pressable
                  key={d.id}
                  onPress={() => setSelectedDevisId(d.id)}
                  style={[styles.devisCard, selectedDevisId === d.id && styles.devisCardActive]}
                >
                  <Text style={[styles.devisNumber, selectedDevisId === d.id && styles.devisNumberActive]}>
                    {d.number ?? t('newExtraWork.devisFallback')}
                  </Text>
                  <Text style={styles.devisClient}>{d.client_name}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button title={t('newSituation.create')} onPress={handleCreate} loading={loading} style={{ marginTop: spacing.lg }} disabled={devisOptions.length === 0} />
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  pageTitle: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.text,
  },
  pageSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.xl,
    marginBottom: spacing.xs,
  },
  sectionHint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginBottom: spacing.md,
    lineHeight: 17,
  },
  emptyDevis: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  devisList: {
    gap: spacing.sm,
  },
  devisCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  devisCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  devisNumber: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  devisNumberActive: {
    color: colors.primary,
  },
  devisClient: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  error: {
    color: colors.danger,
    fontSize: fontSize.sm,
    marginTop: spacing.md,
  },
});
