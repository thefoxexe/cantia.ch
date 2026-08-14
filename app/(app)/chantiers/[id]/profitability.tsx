import { ScrollView, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useProject } from '../../../../lib/useProject';
import { ProjectProfitability } from '../../../../components/ProjectProfitability';
import { FeatureHint } from '../../../../components/FeatureHint';
import { LoadingScreen, PageHeader, Screen } from '../../../../components/ui';
import { spacing } from '../../../../lib/theme';

export default function ChantierProfitabilityScreen() {
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
        title="Rentabilité"
        backTo={`/(app)/chantiers/${id}`}
        style={{ maxWidth: 880, width: '100%', alignSelf: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.lg, marginBottom: 0 }}
      />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.xl, maxWidth: 880, width: '100%', alignSelf: 'center', paddingBottom: spacing.xxl * 2 }}>
        <View>
          <FeatureHint
            id="chantier-profitability"
            icon="trending-up"
            title="Rentabilité de ce chantier"
            text="Compare le devis accepté au coût réel (matériel saisi + main d'œuvre calculée depuis le Planning) pour savoir si ce chantier est rentable."
          />
          <ProjectProfitability projectId={id} organizationId={project.organization_id} />
        </View>
      </ScrollView>
    </Screen>
  );
}
