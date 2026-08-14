import { ScrollView, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useProject } from '../../../../lib/useProject';
import { ProjectSurvey } from '../../../../components/ProjectSurvey';
import { FeatureHint } from '../../../../components/FeatureHint';
import { LoadingScreen, PageHeader, Screen } from '../../../../components/ui';
import { spacing } from '../../../../lib/theme';

export default function ChantierSurveyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { project } = useProject(id);

  if (!project) {
    return (
      <Screen>
        <LoadingScreen />
      </Screen>
    );
  }

  return (
    <Screen>
      <PageHeader
        title="Levés"
        backTo={`/(app)/chantiers/${id}`}
        style={{ maxWidth: 880, width: '100%', alignSelf: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.lg, marginBottom: 0 }}
      />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.xl, maxWidth: 880, width: '100%', alignSelf: 'center', paddingBottom: spacing.xxl * 2 }}>
        <View>
          <FeatureHint
            id="chantier-survey"
            icon="crosshair"
            title="Levés de précision"
            text="Ajoutez des points de chantier, visualisez-les sur le cadastre et l’orthophoto officiels, puis exportez-les en DXF, CSV, XML ou GPX."
          />
          <ProjectSurvey projectId={id} organizationId={project.organization_id} />
        </View>
      </ScrollView>
    </Screen>
  );
}
