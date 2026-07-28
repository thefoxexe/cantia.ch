import { useCallback, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../../../lib/supabase';
import { getSignedUrl } from '../../../../lib/api/storage';
import { Card, EmptyState, Screen, StatusBadge } from '../../../../components/ui';
import { colors, fontSize, radius, spacing } from '../../../../lib/theme';
import type { Project, Report } from '../../../../lib/types';

export default function ChantierDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: p }, { data: r }] = await Promise.all([
      supabase.from('projects').select('*').eq('id', id).single(),
      supabase.from('reports').select('*').eq('project_id', id).order('created_at', { ascending: false }),
    ]);
    setProject(p ?? null);
    setReports(r ?? []);
    setLoading(false);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function openPdf(path: string) {
    const url = await getSignedUrl(path);
    if (url) Linking.openURL(url);
  }

  if (!project) {
    return (
      <Screen style={{ padding: spacing.xl }}>
        <Text>Chargement…</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <Card>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{project.name}</Text>
            <StatusBadge status={project.status} />
          </View>
          {project.client_name ? <Text style={styles.meta}>Client : {project.client_name}</Text> : null}
          {project.address ? <Text style={styles.meta}>{project.address}</Text> : null}
        </Card>

        <Pressable
          style={styles.newButton}
          onPress={() => router.push(`/(app)/chantiers/${id}/rapport-new`)}
        >
          <Text style={styles.newButtonText}>+ Nouveau rapport de chantier</Text>
        </Pressable>

        <Text style={styles.sectionTitle}>Rapports</Text>
        {reports.length === 0 && !loading ? (
          <EmptyState title="Aucun rapport" subtitle="Créez un rapport avec vos notes et photos géoréférencées." />
        ) : (
          <View style={{ gap: spacing.md }}>
            {reports.map((r) => (
              <Card key={r.id}>
                <View style={styles.headerRow}>
                  <Text style={styles.reportTitle}>{r.title}</Text>
                  <StatusBadge status={r.status} />
                </View>
                <Text style={styles.meta}>{new Date(r.created_at).toLocaleDateString('fr-CH')}</Text>
                {r.pdf_path ? (
                  <Pressable onPress={() => openPdf(r.pdf_path!)}>
                    <Text style={styles.pdfLink}>📄 Ouvrir le PDF</Text>
                  </Pressable>
                ) : null}
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    gap: spacing.lg,
    paddingBottom: spacing.xxl * 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.text,
    flexShrink: 1,
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
  newButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: fontSize.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  pdfLink: {
    color: colors.primary,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
});
