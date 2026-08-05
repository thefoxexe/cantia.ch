import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Button, Container, Screen } from './ui';
import { MarketingFooter, MarketingNav } from './MarketingChrome';
import { colors, fontSize, radius, spacing } from '../lib/theme';
import { authHref } from '../lib/appHost';

type IconName = keyof typeof Feather.glyphMap;

export interface SolutionFeature {
  icon: IconName;
  title: string;
  text: string;
}

export interface SolutionStep {
  title: string;
  text: string;
}

// One shared template for every /solutions/* SEO page — same chrome
// (MarketingNav/Footer), same section order (hero → features → steps →
// closing CTA), only the copy changes per page. Keeping this as one
// component rather than copy-pasting the layout six times means a design
// tweak (spacing, a new section) only has to happen once.
export function SolutionPage({
  kicker,
  title,
  subtitle,
  features,
  steps,
  closingTitle,
  closingText,
}: {
  kicker: string;
  title: string;
  subtitle: string;
  features: SolutionFeature[];
  steps?: SolutionStep[];
  closingTitle: string;
  closingText: string;
}) {
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <MarketingNav />

        <Container style={styles.hero}>
          <View style={styles.kickerPill}>
            <Text style={styles.kickerText}>{kicker}</Text>
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          <View style={styles.ctaRow}>
            <Link href={authHref('signup')} asChild>
              <Button title="Essayer gratuitement" onPress={() => {}} />
            </Link>
            <Link href="/" asChild>
              <Button title="Voir les tarifs" variant="secondary" onPress={() => {}} />
            </Link>
          </View>
        </Container>

        <Container style={styles.section}>
          <View style={styles.featureGrid}>
            {features.map((f) => (
              <View key={f.title} style={styles.featureCard}>
                <View style={styles.featureIcon}>
                  <Feather name={f.icon} size={18} color={colors.primary} />
                </View>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureText}>{f.text}</Text>
              </View>
            ))}
          </View>
        </Container>

        {steps?.length ? (
          <Container style={styles.section}>
            <Text style={styles.stepsTitle}>Comment ça marche</Text>
            <View style={styles.stepsList}>
              {steps.map((s, i) => (
                <View key={s.title} style={styles.stepRow}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{i + 1}</Text>
                  </View>
                  <View style={styles.stepBody}>
                    <Text style={styles.stepTitle}>{s.title}</Text>
                    <Text style={styles.stepText}>{s.text}</Text>
                  </View>
                </View>
              ))}
            </View>
          </Container>
        ) : null}

        <Container style={styles.closing}>
          <Text style={styles.closingTitle}>{closingTitle}</Text>
          <Text style={styles.closingText}>{closingText}</Text>
          <Link href={authHref('signup')} asChild>
            <Button title="Essayer gratuitement" onPress={() => {}} style={styles.closingCta} />
          </Link>
        </Container>

        <MarketingFooter />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
  },
  hero: {
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  kickerPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    marginBottom: spacing.sm,
  },
  kickerText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.primary,
  },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    marginTop: spacing.md,
    lineHeight: 23,
    maxWidth: 560,
  },
  ctaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  section: {
    maxWidth: 1000,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  featureCard: {
    flex: 1,
    minWidth: 240,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  featureTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  featureText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 20,
  },
  stepsTitle: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  stepsList: {
    gap: spacing.lg,
  },
  stepRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: '#fff',
  },
  stepBody: {
    flex: 1,
    gap: 2,
  },
  stepTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  stepText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 20,
  },
  closing: {
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxxl,
    alignItems: 'center',
  },
  closingTitle: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  closingText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  closingCta: {
    marginTop: spacing.lg,
  },
});
