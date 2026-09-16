import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useProject } from '../../../../../lib/useProject';
import { listSituations } from '../../../../../lib/api/situations';
import { Button, Card, EmptyState, LoadingScreen, PageHeader, Screen, StatusBadge } from '../../../../../components/ui';
import { formatDate, useTranslation } from '../../../../../lib/translations';
import { colors, fontSize, spacing } from '../../../../../lib/theme';
import type { ChantierSituation } from '../../../../../lib/types';

export default function SituationsListScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { project } = useProject(id);
  const [situations, setSituations] = useState<ChantierSituation[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setSituations(await listSituations(id));
    setLoading(false);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (!project) {
    return (
      <Screen>
        <LoadingScreen />
      </Screen>
    );
  }

  return (
    <Screen style={{ padding: spacing.xl }}>
      <View style={styles.container}>
        <PageHeader title={t('situationsList.title')} backTo={`/(app)/chantiers/${id}`} />
        <Text style={styles.projectName}>{project.name}</Text>
        <Text style={styles.hint}>{t('situationsList.hint')}</Text>

        <Button
          title={t('situationsList.newSituation')}
          icon="plus"
          onPress={() => router.push(`/(app)/chantiers/${id}/situations/new`)}
          style={{ marginBottom: spacing.lg }}
        />

        {loading ? (
          <LoadingScreen />
        ) : situations.length === 0 ? (
          <EmptyState title={t('situationsList.emptyTitle')} subtitle={t('situationsList.emptySubtitle')} />
        ) : (
          <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl, gap: spacing.md }} showsVerticalScrollIndicator={false}>
            {situations.map((s) => (
              <Pressable key={s.id} onPress={() => router.push(`/(app)/chantiers/${id}/situations/${s.id}` as any)}>
                <Card style={styles.card}>
                  <View style={styles.cardBody}>
                    <View style={styles.row}>
                      <Text style={styles.number}>{s.number ?? t('situationsList.draft')}</Text>
                      <StatusBadge status={s.status} />
                    </View>
                    <Text style={styles.title}>{s.title}</Text>
                    <Text style={styles.meta}>
                      {t('situationsList.situationIndex', { index: s.situation_index })} · {formatDate(s.created_at)}
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={18} color={colors.textMuted} />
                </Card>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  projectName: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  hint: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.lg,
    lineHeight: 19,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  cardBody: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  number: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  title: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  meta: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
});
