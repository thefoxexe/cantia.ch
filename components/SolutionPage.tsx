import { ReactNode, useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Button, Container, Screen } from './ui';
import { MarketingFooter, MarketingNav } from './MarketingChrome';
import { colors, fontSize, radius, spacing } from '../lib/theme';
import { marketingFonts } from '../lib/marketingTheme';
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

export interface SolutionFaqItem {
  question: string;
  answer: string;
}

export interface SolutionRelatedLink {
  href: string;
  label: string;
}

// One shared template for every /solutions/* SEO page — same chrome
// (MarketingNav/Footer), same section order (hero → features → steps →
// closing CTA), only the copy changes per page. Keeping this as one
// component rather than copy-pasting the layout seven times means a design
// tweak (spacing, a new section) only has to happen once.
export function SolutionPage({
  kicker,
  title,
  subtitle,
  visual,
  features,
  steps,
  faq,
  related,
  closingTitle,
  closingText,
}: {
  kicker: string;
  title: string;
  subtitle: string;
  visual?: ReactNode;
  features: SolutionFeature[];
  steps?: SolutionStep[];
  faq?: SolutionFaqItem[];
  related?: SolutionRelatedLink[];
  closingTitle: string;
  closingText: string;
}) {
  // A single mount-in beat for the hero (fade + rise) — no scroll tracking
  // needed since it's the first thing visible on load, unlike index.tsx's
  // scroll-scrubbed reveals further down the page.
  const heroAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(heroAnim, { toValue: 1, duration: 620, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [heroAnim]);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <MarketingNav />

        <Container style={styles.heroOuter}>
          <View style={styles.heroRow}>
            <Animated.View
              style={[
                styles.heroText,
                {
                  opacity: heroAnim,
                  transform: [{ translateY: heroAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
                },
              ]}
            >
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
            </Animated.View>
            {visual ? (
              <Animated.View
                style={[
                  styles.heroVisual,
                  {
                    opacity: heroAnim,
                    transform: [{ translateY: heroAnim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }],
                  },
                ]}
              >
                {visual}
              </Animated.View>
            ) : null}
          </View>
        </Container>

        <Container style={styles.section}>
          <View style={styles.featureGrid}>
            {features.map((f, i) => (
              <Pressable key={f.title} style={({ hovered }: any) => [styles.featureCard, hovered && styles.featureCardHovered]}>
                {({ hovered }: any) => (
                  <>
                    <View style={styles.featureCardTop}>
                      <View style={[styles.featureIcon, hovered && styles.featureIconHovered]}>
                        <Feather name={f.icon} size={18} color={hovered ? '#fff' : colors.primary} />
                      </View>
                      <Text style={styles.featureIndex}>{String(i + 1).padStart(2, '0')}</Text>
                    </View>
                    <Text style={styles.featureTitle}>{f.title}</Text>
                    <Text style={styles.featureText}>{f.text}</Text>
                  </>
                )}
              </Pressable>
            ))}
          </View>
        </Container>

        {steps?.length ? (
          <Container style={styles.section}>
            <Text style={styles.stepsEyebrow}>Comment ça marche</Text>
            <View style={styles.stepsList}>
              {steps.map((s, i) => (
                <View key={s.title} style={[styles.stepRow, i === steps.length - 1 && styles.stepRowLast]}>
                  <View style={styles.stepNumberCol}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>{i + 1}</Text>
                    </View>
                    {i < steps.length - 1 ? <View style={styles.stepConnector} /> : null}
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

        {faq?.length ? (
          <Container style={styles.section}>
            <Text style={styles.stepsEyebrow}>Questions fréquentes</Text>
            <View style={styles.faqList}>
              {faq.map((f, i) => (
                <View key={f.question} style={[styles.faqRow, i === faq.length - 1 && styles.faqRowLast]}>
                  <Text style={styles.faqQuestion}>{f.question}</Text>
                  <Text style={styles.faqAnswer}>{f.answer}</Text>
                </View>
              ))}
            </View>
          </Container>
        ) : null}

        {related?.length ? (
          <Container style={styles.section}>
            <Text style={styles.stepsEyebrow}>Voir aussi</Text>
            <View style={styles.relatedRow}>
              {related.map((r) => (
                <Link key={r.href} href={r.href as any} asChild>
                  <Pressable style={({ hovered }: any) => [styles.relatedChip, hovered && styles.relatedChipHovered]}>
                    <Text style={styles.relatedChipText}>{r.label}</Text>
                    <Feather name="arrow-right" size={13} color={colors.primary} />
                  </Pressable>
                </Link>
              ))}
            </View>
          </Container>
        ) : null}

        <Container style={styles.closingOuter}>
          <View style={styles.closing}>
            <Text style={styles.closingTitle}>{closingTitle}</Text>
            <Text style={styles.closingText}>{closingText}</Text>
            <Link href={authHref('signup')} asChild>
              <Button title="Essayer gratuitement" variant="secondary" onPress={() => {}} style={styles.closingCta} />
            </Link>
          </View>
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
  heroOuter: {
    maxWidth: 1080,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  heroRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xxl,
  },
  heroText: {
    flex: 1,
    minWidth: 320,
  },
  heroVisual: {
    flex: 1,
    minWidth: 300,
    alignItems: 'center',
  },
  kickerPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    marginBottom: spacing.md,
  },
  kickerText: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  title: {
    fontFamily: marketingFonts.display,
    fontSize: 44,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.6,
    lineHeight: 50,
    maxWidth: 640,
  } as unknown as ViewStyle,
  subtitle: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.md,
    color: colors.textMuted,
    marginTop: spacing.md,
    lineHeight: 24,
    maxWidth: 540,
  },
  ctaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  section: {
    maxWidth: 1040,
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
    transitionProperty: 'transform, border-color, box-shadow',
    transitionDuration: '0.2s',
    transitionTimingFunction: 'ease',
  } as unknown as ViewStyle,
  featureCardHovered: {
    borderColor: colors.primary,
    transform: [{ translateY: -3 }],
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  featureCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    transitionProperty: 'background-color',
    transitionDuration: '0.2s',
  } as unknown as ViewStyle,
  featureIconHovered: {
    backgroundColor: colors.primary,
  },
  featureIndex: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.border,
  },
  featureTitle: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  featureText: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 20,
  },
  stepsEyebrow: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    marginBottom: spacing.lg,
  },
  stepsList: {
    maxWidth: 640,
  },
  stepRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  stepRowLast: {},
  stepNumberCol: {
    alignItems: 'center',
    width: 30,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepNumberText: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: '#fff',
  },
  stepConnector: {
    width: 1,
    flex: 1,
    minHeight: spacing.lg,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  stepBody: {
    flex: 1,
    paddingBottom: spacing.xl,
    gap: 2,
  },
  stepTitle: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  stepText: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 20,
    marginTop: 2,
  },
  faqList: {
    maxWidth: 760,
  },
  faqRow: {
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 6,
  },
  faqRowLast: {
    borderBottomWidth: 0,
  },
  faqQuestion: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  faqAnswer: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 21,
    maxWidth: 640,
  },
  relatedRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  relatedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    transitionProperty: 'border-color, transform',
    transitionDuration: '0.15s',
  } as unknown as ViewStyle,
  relatedChipHovered: {
    borderColor: colors.primary,
    transform: [{ translateY: -1 }],
  },
  relatedChipText: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  closingOuter: {
    maxWidth: 1040,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  closing: {
    backgroundColor: colors.primaryDark,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxxl,
    alignItems: 'center',
  },
  closingTitle: {
    fontFamily: marketingFonts.display,
    fontSize: 30,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: -0.4,
    textAlign: 'center',
    maxWidth: 520,
  },
  closingText: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.78)',
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 20,
    maxWidth: 440,
  },
  closingCta: {
    marginTop: spacing.xl,
    borderWidth: 0,
  },
});
