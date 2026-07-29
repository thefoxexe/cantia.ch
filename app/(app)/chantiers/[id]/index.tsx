import { useCallback, useState } from 'react';
import { Platform, KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../../lib/auth-context';
import { isModuleEnabled } from '../../../../lib/modules';
import { supabase } from '../../../../lib/supabase';
import { Card, EmptyState, LoadingScreen, Screen, StatusBadge } from '../../../../components/ui';
import { ProjectFeed } from '../../../../components/ProjectFeed';
import { ProjectDocuments } from '../../../../components/ProjectDocuments';
import { ProjectPhotos } from '../../../../components/ProjectPhotos';
import { ProjectSurvey } from '../../../../components/ProjectSurvey';
import { ProjectMetre } from '../../../../components/ProjectMetre';
import { FeatureHint } from '../../../../components/FeatureHint';
import { colors, fontSize, radius, spacing } from '../../../../lib/theme';
import type { Project, Report } from '../../../../lib/types';

type Tab = 'feed' | 'reports' | 'documents' | 'photos' | 'survey' | 'metre';

const TABS: { key: Tab; label: string; icon: keyof typeof Feather.glyphMap }[] = [
  { key: 'feed', label: "Fil d'actualité", icon: 'message-circle' },
  { key: 'reports', label: 'Rapports', icon: 'file-text' },
  { key: 'documents', label: 'Documents', icon: 'folder' },
  { key: 'photos', label: 'Photos', icon: 'image' },
  { key: 'survey', label: 'Levés', icon: 'crosshair' },
  { key: 'metre', label: 'Métré', icon: 'list' },
];

export default function ChantierDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { organization } = useAuth();
  const visibleTabs = TABS.filter(
    (t) => t.key === 'feed' || t.key === 'reports' || isModuleEnabled(organization?.enabled_modules, t.key as any),
  );
  const [project, setProject] = useState<Project | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('feed');
  const activeTab = visibleTabs.some((t) => t.key === tab) ? tab : 'feed';

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

  if (!project) {
    return (
      <Screen>
        <LoadingScreen />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.replace('/(app)/chantiers')} hitSlop={8} style={styles.iconButton}>
          <Feather name="arrow-left" size={20} color={colors.text} />
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>
          {project.name}
        </Text>
        <Pressable onPress={() => router.push(`/(app)/chantiers/${id}/settings`)} hitSlop={8} style={styles.iconButton}>
          <Feather name="settings" size={20} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar} contentContainerStyle={styles.tabBarContent}>
        {visibleTabs.map((t) => (
          <Pressable key={t.key} onPress={() => setTab(t.key)} style={styles.tabItem}>
            <Feather name={t.icon} size={16} color={activeTab === t.key ? colors.primary : colors.textMuted} />
            <Text style={[styles.tabLabel, activeTab === t.key && styles.tabLabelActive]}>{t.label}</Text>
            {activeTab === t.key ? <View style={styles.tabIndicator} /> : null}
          </Pressable>
        ))}
      </ScrollView>

      {activeTab === 'feed' ? (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ProjectFeed projectId={id} />
        </KeyboardAvoidingView>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container}>
          {activeTab === 'reports' ? (
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
            </View>
          ) : null}

          {activeTab === 'documents' ? (
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
          {activeTab === 'photos' ? (
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
          {activeTab === 'survey' ? (
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
          {activeTab === 'metre' ? (
            <View>
              <FeatureHint
                id="chantier-metre"
                icon="list"
                title="Métré poste par poste"
                text="Détaillez vos quantités par poste, puis générez un devis pré-rempli en un clic à partir de ce métré."
              />
              <ProjectMetre projectId={id} organizationId={project.organization_id} />
            </View>
          ) : null}
        </ScrollView>
      )}
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    maxWidth: 880,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.text,
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
  tabBar: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexGrow: 0,
    maxWidth: 880,
    width: '100%',
    alignSelf: 'center',
  },
  tabBarContent: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
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
