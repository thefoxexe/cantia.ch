import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Button, Screen } from '../components/ui';
import { colors, fontSize, radius, spacing } from '../lib/theme';

const FEATURES = [
  {
    emoji: '🏗️',
    title: 'Rapports de chantier',
    text: "Notes et photos géoréférencées sur le terrain, transformées automatiquement en rapport PDF avec votre logo et votre signature.",
  },
  {
    emoji: '📄',
    title: 'Devis en quelques minutes',
    text: 'Prenez vos notes de rendez-vous et générez un devis PDF téléchargeable, avec suivi de statut intégré.',
  },
  {
    emoji: '☁️',
    title: 'Cloud sécurisé',
    text: 'Plans, soumissions et documents hébergés de manière chiffrée, accessibles partout — plus besoin du classeur.',
  },
  {
    emoji: '⚙️',
    title: 'Personnalisable',
    text: "Adapté à chaque métier du bâtiment, de l'artisan indépendant à la grande entreprise.",
  },
];

export default function LandingScreen() {
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.brand}>Opus</Text>
          <Text style={styles.headline}>La plateforme des artisans et entreprises du bâtiment en Suisse</Text>
          <Text style={styles.subheadline}>
            Rapports de chantier, devis et documents centralisés — depuis le terrain comme depuis le bureau.
          </Text>

          <View style={styles.ctaRow}>
            <Link href="/(auth)/signup" asChild>
              <Button title="Créer mon compte gratuitement" onPress={() => {}} style={styles.ctaButton} />
            </Link>
            <Link href="/(auth)/login" asChild>
              <Button title="Se connecter" onPress={() => {}} variant="secondary" style={styles.ctaButton} />
            </Link>
          </View>
        </View>

        <View style={styles.features}>
          {FEATURES.map((f) => (
            <View key={f.title} style={styles.featureCard}>
              <Text style={styles.featureEmoji}>{f.emoji}</Text>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>Opus — pensé pour le bâtiment suisse.</Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  hero: {
    maxWidth: 640,
    width: '100%',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  brand: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1,
    marginBottom: spacing.xl,
  },
  headline: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    lineHeight: 42,
    marginBottom: spacing.md,
  },
  subheadline: {
    fontSize: fontSize.lg,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: 480,
    marginBottom: spacing.xl,
  },
  ctaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
    width: '100%',
  },
  ctaButton: {
    minWidth: 220,
  },
  features: {
    width: '100%',
    maxWidth: 960,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.lg,
    marginTop: spacing.xl,
  },
  featureCard: {
    width: 260,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  featureEmoji: {
    fontSize: 28,
    marginBottom: spacing.sm,
  },
  featureTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  featureText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 20,
  },
  footer: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xxl,
  },
});
