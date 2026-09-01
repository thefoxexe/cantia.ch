import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Container } from './ui';
import { colors, fontSize, radius, spacing } from '../lib/theme';
import { marketingFonts } from '../lib/marketingTheme';

const FACTS: { icon: keyof typeof Feather.glyphMap; title: string; text: string }[] = [
  { icon: 'dollar-sign', title: 'CHF', text: 'Montants et documents adaptés aux entreprises suisses.' },
  { icon: 'percent', title: 'TVA suisse', text: 'Gestion des taux de TVA utilisés en Suisse.' },
  { icon: 'credit-card', title: 'QR-facture', text: 'Facturation avec QR-facture conforme au système suisse.' },
  { icon: 'lock', title: 'Hébergement suisse', text: 'Données hébergées en Suisse.' },
];

// Shared "Conçu pour les entreprises suisses" block — same four facts on
// the homepage and every /[metier] trade page, so the Swiss positioning
// never drifts or gets watered down on a page built later than the others.
export function SwissSection() {
  return (
    <Container style={styles.outer}>
      <Text style={styles.title}>Conçu pour les entreprises suisses</Text>
      <Text style={styles.text}>
        Cantia a été développé pour le fonctionnement des entreprises du bâtiment suisse : CHF, TVA suisse, QR-facture
        et données hébergées en Suisse.
      </Text>
      <View style={styles.grid}>
        {FACTS.map((f) => (
          <View key={f.title} style={styles.card}>
            <View style={styles.iconBadge}>
              <Feather name={f.icon} size={16} color={colors.primary} />
            </View>
            <Text style={styles.cardTitle}>{f.title}</Text>
            <Text style={styles.cardText}>{f.text}</Text>
          </View>
        ))}
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  outer: {
    maxWidth: 1040,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontFamily: marketingFonts.display,
    fontSize: 28,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  text: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
    maxWidth: 560,
    lineHeight: 22,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
    marginTop: spacing.xl,
    width: '100%',
  },
  card: {
    width: 220,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  cardTitle: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: colors.text,
  },
  cardText: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    lineHeight: 17,
  },
});
