import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Container } from './ui';
import { colors, fontSize, radius, spacing } from '../lib/theme';
import { marketingFonts } from '../lib/marketingTheme';
import { useTranslation } from '../lib/translations';

// Shared "Conçu pour les entreprises suisses" block — same four facts on
// the homepage and every /[metier] trade page, so the Swiss positioning
// never drifts or gets watered down on a page built later than the others.
export function SwissSection() {
  const { t } = useTranslation();
  const FACTS: { icon: keyof typeof Feather.glyphMap; title: string; text: string }[] = [
    { icon: 'dollar-sign', title: t('swissSection.factChfTitle'), text: t('swissSection.factChfText') },
    { icon: 'percent', title: t('swissSection.factVatTitle'), text: t('swissSection.factVatText') },
    { icon: 'credit-card', title: t('swissSection.factQrTitle'), text: t('swissSection.factQrText') },
    { icon: 'lock', title: t('swissSection.factHostingTitle'), text: t('swissSection.factHostingText') },
  ];
  return (
    <Container style={styles.outer}>
      <Text style={styles.title}>{t('swissSection.title')}</Text>
      <Text style={styles.text}>{t('swissSection.text')}</Text>
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
