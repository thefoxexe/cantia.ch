import { ReactNode, useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Container, Screen } from './ui';
import { Heading } from './Heading';
import { MarketingHead } from './MarketingHead';
import { MarketingFooter, MarketingNav } from './MarketingChrome';
import { colors, spacing } from '../lib/theme';
import { displayType, marketingFonts, monoType } from '../lib/marketingTheme';
import { CtaButton } from './landing/CtaButton';
import { SectionHead } from './landing/SectionHead';
import { AnnotatedDocument, type DocumentId } from './landing/DocumentShowcase';
import { useMarketingDict } from '../lib/i18n';
import { authHref } from '../lib/appHost';
import { getAppLocale, useTranslation } from '../lib/translations';

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

export function SolutionPage({
  kicker,
  title,
  subtitle,
  visual,
  features,
  afterFeatures,
  documentId,
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
  afterFeatures?: ReactNode;
  // A real export of this module (components/landing/DocumentShowcase),
  // shown annotated right after the feature grid.
  documentId?: DocumentId;
  steps?: SolutionStep[];
  faq?: SolutionFaqItem[];
  related?: SolutionRelatedLink[];
  closingTitle: string;
  closingText: string;
}) {
  const { t } = useTranslation();
  const docsDict = useMarketingDict().documents;
  const exportDoc = documentId ? docsDict.docs.find((d) => d.id === documentId) : undefined;
  const solutionsPrefix = getAppLocale() === 'de' ? '/de/solutions' : getAppLocale() === 'it' ? '/it/solutions' : '/solutions';
  const pricingHref = getAppLocale() === 'de' ? '/de/#pricing' : getAppLocale() === 'it' ? '/it/#pricing' : '/#pricing';
  const heroAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(heroAnim, { toValue: 1, duration: 620, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [heroAnim]);

  return (
    <Screen>
      <MarketingHead title={`${title} | Cantia`} />
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
              <Heading level={1} style={styles.title}>{title}</Heading>
              <Text style={styles.subtitle}>{subtitle}</Text>
              <View style={styles.ctaRow}>
                <Link href={authHref('signup')} asChild>
                  <CtaButton title={t('solutionPage.ctaTrial')} />
                </Link>
                <Link href={pricingHref as any}>
                  <Text style={styles.secondaryLink}>{t('solutionPage.ctaPricing')}</Text>
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
            {features.map((f) => (
              <View key={f.title} style={styles.featureCard}>
                <Feather name={f.icon} size={20} color={colors.primary} style={styles.featureIcon} />
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureText}>{f.text}</Text>
              </View>
            ))}
          </View>
        </Container>

        {exportDoc ? (
          <Container style={styles.section}>
            <SectionHead label={docsDict.eyebrow} title={exportDoc.tab} intro={docsDict.intro} />
            <AnnotatedDocument doc={exportDoc} hrefFor={(slug) => `${solutionsPrefix}/${slug}`} />
          </Container>
        ) : null}

        {afterFeatures}

        {steps?.length ? (
          <Container style={styles.section}>
            <Text style={styles.stepsEyebrow}>{t('solutionPage.stepsEyebrow')}</Text>
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
            <Text style={styles.stepsEyebrow}>{t('solutionPage.faqEyebrow')}</Text>
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
            <Text style={styles.stepsEyebrow}>{t('solutionPage.seeAlsoEyebrow')}</Text>
            <View style={styles.relatedRow}>
              {related.map((r) => (
                <Link key={r.href} href={r.href as any} asChild>
                  <Pressable style={styles.relatedChip}>
                    <Text style={styles.relatedChipText}>{r.label}</Text>
                    <Text style={styles.relatedArrow}>→</Text>
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
              <CtaButton title={t('solutionPage.ctaTrial')} tone="light" style={styles.closingCta} />
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
  kickerPill: { alignSelf: 'flex-start', marginBottom: spacing.lg },
  kickerText: { ...monoType, fontSize: 11, color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.4 },
  title: { ...displayType, fontSize: 60, fontWeight: '800', color: colors.text, letterSpacing: -0.3, lineHeight: 58, maxWidth: 680 } as unknown as ViewStyle,
  subtitle: { fontFamily: marketingFonts.body, fontSize: 18, color: '#4A3D31', marginTop: spacing.lg, lineHeight: 28, maxWidth: 560 },
  ctaRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.xl, marginTop: spacing.xl },
  section: {
    maxWidth: 1040,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  featureGrid: { flexDirection: 'row', flexWrap: 'wrap', borderTopWidth: 1.5, borderTopColor: '#231A12' },
  featureCard: { flexGrow: 1, flexBasis: 300, paddingTop: spacing.lg, paddingBottom: spacing.xl, paddingRight: spacing.xl, borderBottomWidth: 1, borderBottomColor: '#D8C8B0', gap: spacing.sm },
  featureIcon: { marginBottom: spacing.xs },
  featureTitle: { fontFamily: marketingFonts.body, fontSize: 18, fontWeight: '700', color: colors.text, lineHeight: 24 },
  featureText: { fontFamily: marketingFonts.body, fontSize: 15, color: '#4A3D31', lineHeight: 23 },
  stepsEyebrow: { ...monoType, fontSize: 11, color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: spacing.lg, borderTopWidth: 1.5, borderTopColor: '#231A12', paddingTop: spacing.md },
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
  stepNumber: { width: 30, height: 30, borderRadius: 15, borderWidth: 1.5, borderColor: colors.primary, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  stepNumberText: { ...monoType, fontSize: 12, color: colors.primary },
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
  stepTitle: { fontFamily: marketingFonts.body, fontSize: 18, fontWeight: '700', color: colors.text },
  stepText: { fontFamily: marketingFonts.body, fontSize: 15, color: '#4A3D31', lineHeight: 23, marginTop: 2 },
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
  faqQuestion: { fontFamily: marketingFonts.body, fontSize: 17, fontWeight: '700', color: colors.text },
  faqAnswer: { fontFamily: marketingFonts.body, fontSize: 15, color: '#4A3D31', lineHeight: 23, maxWidth: 680 },
  relatedRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xl },
  relatedChip: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, borderBottomWidth: 1.5, borderBottomColor: '#231A12', paddingBottom: 2 },
  relatedChipText: { fontFamily: marketingFonts.body, fontSize: 15, fontWeight: '600', color: colors.text },
  closingOuter: {
    maxWidth: 1040,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  closing: { backgroundColor: colors.primaryDark, borderRadius: 3, paddingHorizontal: spacing.xl, paddingVertical: 64, alignItems: 'flex-start' },
  closingTitle: { ...displayType, fontSize: 44, fontWeight: '800', color: '#fff', lineHeight: 44, maxWidth: 680 },
  closingText: { fontFamily: marketingFonts.body, fontSize: 17, color: 'rgba(255,255,255,0.8)', marginTop: spacing.md, lineHeight: 26, maxWidth: 520 },
  closingCta: { marginTop: spacing.xl },
  secondaryLink: { fontFamily: marketingFonts.body, fontSize: 15, fontWeight: '600', color: colors.text, borderBottomWidth: 1.5, borderBottomColor: '#231A12', paddingBottom: 2 },
  relatedArrow: { color: colors.primary, fontSize: 14 },
});
