import { ScrollView, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useProject } from '../../../../lib/useProject';
import { ProjectDocuments } from '../../../../components/ProjectDocuments';
import { FeatureHint } from '../../../../components/FeatureHint';
import { LoadingScreen, PageHeader, Screen } from '../../../../components/ui';
import { useTranslation } from '../../../../lib/translations';
import { spacing } from '../../../../lib/theme';

export default function ChantierDocumentsScreen() {
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
        title={t('chantierDocuments.title')}
        backTo={`/(app)/chantiers/${id}`}
        style={{ maxWidth: 880, width: '100%', alignSelf: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.lg, marginBottom: 0 }}
      />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.xl, maxWidth: 880, width: '100%', alignSelf: 'center', paddingBottom: spacing.xxl * 2 }}>
        <View>
          <FeatureHint
            id="chantier-documents"
            icon="folder"
            title={t('chantierDocuments.hintTitle')}
            text={t('chantierDocuments.hintText')}
          />
          <ProjectDocuments projectId={id} />
        </View>
      </ScrollView>
    </Screen>
  );
}
