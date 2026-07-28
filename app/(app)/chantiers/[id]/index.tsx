import { useCallback, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../../../../lib/supabase';
import { getSignedUrl } from '../../../../lib/api/storage';
import { Card, EmptyState, Screen, StatusBadge } from '../../../../components/ui';
import { ProjectDocuments } from '../../../../components/ProjectDocuments';
import { ProjectPhotos } from '../../../../components/ProjectPhotos';
import { ProjectSurvey } from '../../../../components/ProjectSurvey';
import { FeatureHint } from '../../../../components/FeatureHint';
import { colors, fontSize, radius, spacing } from '../../../../lib/theme';
import type { Project, Report } from '../../../../lib/types';

type Tab = 'reports' | 'documents' | 'photos' | 'survey';

const TABS: { key: Tab; label: string; icon: keyof typeof Feather.glyphMap }[] = [
  { key: 'reports', label: 'Rapports', icon: 'file-text' },
  { key: 'documents', label: 'Documents', icon: 'folder' },
  { key: 'photos', label: 'Photos', icon: 'image' },
  { key: 'survey', label: 'Levés', icon: 'crosshair' },
];

export default function ChantierDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('reports');

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

        <View style={styles.tabBar}>
          {TABS.map((t) => (
            <Pressable key={t.key} onPress={() => setTab(t.key)} style={styles.tabItem}>
              <Feather name={t.icon} size={16} color={tab === t.key ? colors.primary : colors.textMuted} />
              <Text style={[styles.tabLabel, tab === t.key && styles.tabLabelActive]}>{t.label}</Text>
              {tab === t.key ? <View style={styles.tabIndicator} /> : null}
            </Pressable>
          ))}
        </View>

        {tab === 'reports' ? (
          <View>
            <Pressable style={styles.newButton} onPress={() => router.push(`/(app)/chantiers/${id}/rapport-new`)}>
              <Feather name="plus" size={16} color="#fff" />
              <Text style={styles.newButtonText}>Nouveau rapport de chantier</Text>
            </Pressable>

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
                      <Pressable onPress={() => openPdf(r.pdf_path!)} style={styles.pdfLink}>
                        <Feather name="file-text" size={14} color={colors.primary} />
                        <Text style={styles.pdfLinkText}>Ouvrir le PDF</Text>
                      </Pressable>
                    ) : null}
                  </Card>
                ))}
              </View>
            )}
          </View>
        ) : null}

        {tab === 'documents' ? (
          <View>
            <FeatureHint
              id="chantier-documents"
              icon="folder"
              title="Un classeur numérique par chantier"
              text="Organisez vos plans et documents en dossiers et sous-dossiers, comme dans un classeur physique."
            />
            <ProjectDocuments projectId={id} />
          </View>
        ) : null}
        {tab === 'photos' ? (
          <View>
            <FeatureHint
              id="chantier-photos"
              icon="image"
              title="Toutes vos photos, filtrables"
              text="Toutes les photos de vos rapports apparaissent ici. Filtrez par date et ouvrez leur position sur la carte."
            />
            <ProjectPhotos projectId={id} />
          </View>
        ) : null}
        {tab === 'survey' ? (
          <View>
            <FeatureHint
              id="chantier-survey"
              icon="crosshair"
              title="Levés de précision"
              text="Ajoutez des points de chantier, visualisez-les sur le cadastre et l’orthophoto officiels, puis exportez-les en DXF, CSV, XML ou GPX."
            />
            <ProjectSurvey projectId={id} organizationId={project.organization_id} />
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginTop: -spacing.sm,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    position: 'relative',
  },
  tabLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: colors.primary,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -1,
    left: spacing.md,
    right: spacing.md,
    height: 2,
    backgroundColor: colors.primary,
  },
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    height: 48,
    marginBottom: spacing.lg,
  },
  newButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: fontSize.md,
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
