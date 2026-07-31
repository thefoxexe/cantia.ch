import { ScrollView, StyleSheet, Text } from 'react-native';
import { useAuth } from '../../../lib/auth-context';
import { Container, PageHeader, Screen } from '../../../components/ui';
import { PdfTemplatePicker } from '../../../components/PdfTemplatePicker';
import { colors, fontSize, spacing } from '../../../lib/theme';

export default function RapportsSettingsScreen() {
  const { organization, role } = useAuth();
  const isAdmin = role === 'owner' || role === 'admin';

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl * 2 }}>
        <Container>
          <PageHeader title="Rapports & modèle PDF" backTo="/(app)/compte" />

          <Text style={styles.sectionTitle}>Modèle de rapport PDF</Text>
          <Text style={styles.hint}>
            Choisissez la mise en page utilisée pour générer vos rapports de chantier. Elle s'applique automatiquement à
            tous vos prochains rapports, avec la couleur et le logo définis dans Profil entreprise.
          </Text>
          {organization ? (
            <PdfTemplatePicker
              organizationId={organization.id}
              kind="report"
              disabled={!isAdmin}
              hasLogo={!!organization?.logo_url}
            />
          ) : null}
        </Container>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  hint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
});
