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

          <Text style={styles.sectionTitle}>Modèles de rapport PDF</Text>
          <Text style={styles.hint}>
            Créez plusieurs modèles et choisissez celui utilisé par défaut, avec la couleur et le logo définis dans
            Profil entreprise (ou une couleur propre à chaque modèle). Vous pourrez toujours en choisir un autre au
            moment de créer un rapport précis.
          </Text>
          {organization ? (
            <PdfTemplatePicker
              organizationId={organization.id}
              kind="report"
              disabled={!isAdmin}
              hasLogo={!!organization?.logo_url}
              manage={isAdmin}
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
