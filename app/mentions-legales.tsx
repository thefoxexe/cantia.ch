import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Container, Screen } from '../components/ui';
import { colors, fontSize, spacing } from '../lib/theme';

export default function MentionsLegalesScreen() {
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Container style={styles.container}>
          <Link href="/" asChild>
            <Pressable style={styles.back} hitSlop={8}>
              <Feather name="arrow-left" size={16} color={colors.text} />
              <Text style={styles.backText}>Retour</Text>
            </Pressable>
          </Link>

          <Text style={styles.title}>Mentions légales</Text>
          <Text style={styles.updated}>Dernière mise à jour : juillet 2026</Text>

          <LegalSection title="Éditeur du site">
            <Text style={styles.p}>
              Le site et l'application Opus-Flow sont édités par Opus-Flow, entreprise individuelle basée en Suisse.
              Pour toute question relative à l'identité légale de l'éditeur, contactez-nous à l'adresse
              legal@opusflow.ch.
            </Text>
          </LegalSection>

          <LegalSection title="Hébergement">
            <Text style={styles.p}>
              L'application est hébergée par Supabase Inc. (base de données, authentification et stockage de
              fichiers) et par Vercel Inc. (diffusion de l'interface web). Les données sont stockées dans des centres
              de données situés dans l'Union européenne.
            </Text>
          </LegalSection>

          <LegalSection title="Propriété intellectuelle">
            <Text style={styles.p}>
              L'ensemble des éléments du site et de l'application Opus-Flow (marque, logo, textes, interface,
              structure) est protégé par le droit d'auteur. Toute reproduction ou représentation, totale ou
              partielle, sans autorisation préalable est interdite.
            </Text>
          </LegalSection>

          <LegalSection title="Responsabilité">
            <Text style={styles.p}>
              Opus-Flow met tout en œuvre pour assurer l'exactitude et la mise à jour des informations diffusées sur
              le site, mais ne saurait être tenu responsable des erreurs, omissions ou de l'indisponibilité
              temporaire du service.
            </Text>
          </LegalSection>

          <LegalSection title="Contact">
            <Text style={styles.p}>Pour toute question, écrivez-nous à legal@opusflow.ch.</Text>
          </LegalSection>
        </Container>
      </ScrollView>
    </Screen>
  );
}

function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingVertical: spacing.xxl,
  },
  container: {
    maxWidth: 720,
    paddingHorizontal: spacing.xl,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xl,
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
  },
  updated: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  p: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 21,
  },
});
