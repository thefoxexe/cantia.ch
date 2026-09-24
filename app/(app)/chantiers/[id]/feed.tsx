import { useCallback } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useProject } from '../../../../lib/useProject';
import { ProjectFeed } from '../../../../components/ProjectFeed';
import { markFeedRead } from '../../../../lib/api/feed';
import { LoadingScreen, PageHeader, AppScreen } from '../../../../components/ui';
import { useTranslation } from '../../../../lib/translations';
import { spacing } from '../../../../lib/theme';

export default function ChantierFeedScreen() {
  const { t } = useTranslation();
  const { id, newReport } = useLocalSearchParams<{ id: string; newReport?: string }>();
  const { project } = useProject(id);

  // Clears this chantier's unread badge on the chantiers list the moment
  // its Fil is actually opened — not just visited in passing, since this
  // screen only mounts once the tab itself is selected.
  useFocusEffect(
    useCallback(() => {
      if (id) markFeedRead(id);
    }, [id]),
  );

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
        <ProjectFeed projectId={id} autoOpenReportModal={newReport === '1'} />
      </KeyboardAvoidingView>
    </AppScreen>
  );
}
