import { KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useProject } from '../../../../lib/useProject';
import { ProjectFeed } from '../../../../components/ProjectFeed';
import { LoadingScreen, PageHeader, AppScreen } from '../../../../components/ui';
import { useTranslation } from '../../../../lib/translations';
import { spacing } from '../../../../lib/theme';

export default function ChantierFeedScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { project } = useProject(id);

  if (!project) {
    return (
      <AppScreen>
        <LoadingScreen />
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <PageHeader
        title={t('chantierHub.feed')}
        backTo={`/(app)/chantiers/${id}`}
        style={{ maxWidth: 880, width: '100%', alignSelf: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.lg, marginBottom: 0 }}
      />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ProjectFeed projectId={id} />
      </KeyboardAvoidingView>
    </AppScreen>
  );
}
