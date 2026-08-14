import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useProject } from '../../../../lib/useProject';
import { supabase } from '../../../../lib/supabase';
import { Button, EmptyState, Card, LoadingScreen, PageHeader, Screen, StatusBadge } from '../../../../components/ui';
import { colors, fontSize, spacing } from '../../../../lib/theme';
import type { Report } from '../../../../lib/types';

export default function ChantierReportsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { project } = useProject(id);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('reports').select('*').eq('project_id', id).order('created_at', { ascending: false });
    setReports(data ?? []);
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
    <Screen>
      <PageHeader title="Rapports" backTo={`/(app)/chantiers/${id}`} style={styles.topBar} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container}>
        <Button
          title="Nouveau rapport de chantier"
          icon="plus"
          onPress={() => router.push(`/(app)/chantiers/${id}/rapport-new`)}
          style={{ marginBottom: spacing.lg }}
        />

        {reports.length === 0 && !loading ? (
          <EmptyState title="Aucun rapport" subtitle="Créez un rapport avec vos notes et photos géoréférencées." />
        ) : (
          <View style={{ gap: spacing.md }}>
            {reports.map((r) => (
              <Pressable key={r.id} onPress={() => router.push(`/(app)/chantiers/${id}/rapports/${r.id}`)}>
                <Card>
                  <View style={styles.headerRow}>
                    <Text style={styles.reportTitle}>{r.title}</Text>
                    <StatusBadge status={r.status} />
                  </View>
                  <Text style={styles.meta}>{new Date(r.created_at).toLocaleDateString('fr-CH')}</Text>
                  <View style={styles.pdfLink}>
                    <Feather
                      name={r.pdf_path ? 'file-text' : 'alert-triangle'}
                      size={14}
                      color={r.pdf_path ? colors.primary : colors.accent}
                    />
                    <Text style={styles.pdfLinkText}>{r.pdf_path ? 'Voir le rapport' : 'PDF non généré — voir le rapport'}</Text>
                  </View>
                </Card>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    maxWidth: 880,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    marginBottom: 0,
  },
  container: {
    padding: spacing.xl,
    gap: spacing.lg,
    paddingBottom: spacing.xxl * 2,
    maxWidth: 880,
    width: '100%',
    alignSelf: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  reportTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    flexShrink: 1,
  },
  meta: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  pdfLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  pdfLinkText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: fontSize.sm,
  },
});
