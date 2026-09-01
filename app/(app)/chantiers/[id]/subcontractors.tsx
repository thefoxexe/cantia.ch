import { ScrollView, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useProject } from '../../../../lib/useProject';
import { ProjectSubcontractors } from '../../../../components/ProjectSubcontractors';
import { FeatureHint } from '../../../../components/FeatureHint';
import { LoadingScreen, PageHeader, Screen } from '../../../../components/ui';
import { useTranslation } from '../../../../lib/translations';
import { spacing } from '../../../../lib/theme';

export default function ChantierSubcontractorsScreen() {
  const { t } = useTranslation();
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
        title={t('modules.subcontractors.label')}
        backTo={`/(app)/chantiers/${id}`}
        style={{ maxWidth: 880, width: '100%', alignSelf: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.lg, marginBottom: 0 }}
      />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.xl, maxWidth: 880, width: '100%', alignSelf: 'center', paddingBottom: spacing.xxl * 2 }}>
        <View>
          <FeatureHint
            id="chantier-subcontractors"
            icon="users"
            title={t('chantierSubcontractors.hintTitle')}
            text={t('chantierSubcontractors.hintText')}
          />
          <ProjectSubcontractors projectId={id} organizationId={project.organization_id} />
        </View>
      </ScrollView>
    </Screen>
  );
}
