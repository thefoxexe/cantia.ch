import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Button, Container, Screen } from './ui';
import { Heading } from './Heading';
import { MarketingFooter, MarketingNav } from './MarketingChrome';
import { colors, fontSize, radius, spacing } from './../lib/theme';
import { marketingFonts } from '../lib/marketingTheme';
import { authHref } from '../lib/appHost';
import { HelpArticle } from '../lib/helpArticles';
import { getAppLocale, useTranslation } from '../lib/translations';

// Full standalone page for one help article — reachable at /aide/<id> (and
// /de/aide/<id>), one URL per feature instead of only an accordion row
// buried inside /aide. Same content (lib/helpArticles.ts), rendered as a
// real page so each feature gets its own indexable, linkable, shareable
// address rather than being invisible to anyone who isn't already on /aide
// with that row expanded.
export function HelpArticlePage({ article, related }: { article: HelpArticle; related: HelpArticle[] }) {
  const { t } = useTranslation();
  const locale = getAppLocale();
  const aideHref = locale === 'de' ? '/de/aide' : '/aide';
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [fadeAnim, article.id]);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <MarketingNav />

        <Container style={styles.container}>
          <View style={styles.breadcrumb}>
            <Link href={aideHref as any}><Text style={styles.breadcrumbLink}>{t('aidePage.title')}</Text></Link>
            <Text style={styles.breadcrumbSep}>›</Text>
            <Text style={styles.breadcrumbCurrent}>{article.category}</Text>
          </View>

          <Animated.View style={{ opacity: fadeAnim }}>
            <View style={styles.categoryPill}>
              <Text style={styles.categoryPillText}>{article.category}</Text>
            </View>
            <Heading level={1} style={styles.title}>{article.title}</Heading>

            <View style={styles.body}>
              {article.body.map((paragraph, i) => (
                <Text key={i} style={styles.paragraph}>
                  {paragraph}
                </Text>
              ))}
            </View>
          </Animated.View>

          {related.length ? (
            <View style={styles.relatedSection}>
              <Text style={styles.relatedEyebrow}>{t('helpArticlePage.relatedEyebrow')}</Text>
              <View style={styles.relatedGrid}>
                {related.map((r) => (
                  <Link key={r.id} href={`${aideHref}/${r.id}` as any} asChild>
                    <Pressable style={styles.relatedCard}>
                      <Text style={styles.relatedTitle}>{r.title}</Text>
                      <View style={styles.relatedMore}>
                        <Text style={styles.relatedMoreText}>{t('helpArticlePage.readArticle')}</Text>
                        <Feather name="arrow-right" size={12} color={colors.primary} />
                      </View>
                    </Pressable>
                  </Link>
                ))}
              </View>
            </View>
          ) : null}

          <View style={styles.contactCard}>
            <Feather name="life-buoy" size={18} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.contactTitle}>{t('helpArticlePage.contactTitle')}</Text>
              <Text style={styles.contactText}>{t('helpArticlePage.contactText')}</Text>
            </View>
          </View>

          <View style={styles.closing}>
            <Text style={styles.closingTitle}>{t('helpArticlePage.closingTitle')}</Text>
            <Link href={authHref('signup')} asChild>
              <Button title={t('helpArticlePage.closingCta')} variant="secondary" onPress={() => {}} style={styles.closingBtn} />
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
    paddingBottom: spacing.xxl,
  },
  container: {
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
    marginBottom: spacing.xl,
  },
  breadcrumbLink: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textDecorationLine: 'underline',
  },
  breadcrumbSep: { fontSize: fontSize.xs, color: colors.textMuted },
  breadcrumbCurrent: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.xs,
    color: colors.text,
    fontWeight: '700',
  },
  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    marginBottom: spacing.md,
  },
  categoryPillText: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  title: {
    fontFamily: marketingFonts.display,
    fontSize: 34,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.4,
    lineHeight: 40,
    marginBottom: spacing.xl,
  } as any,
  body: {
    gap: spacing.lg,
  },
  paragraph: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.md,
    color: colors.textMuted,
    lineHeight: 26,
  },
  relatedSection: {
    marginTop: spacing.xxl,
  },
  relatedEyebrow: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: spacing.md,
  },
  relatedGrid: {
    gap: spacing.sm,
  },
  relatedCard: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  relatedTitle: {
    flex: 1,
    fontFamily: marketingFonts.body,
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  relatedMore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  relatedMoreText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.primary,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginTop: spacing.xxl,
  },
  contactTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  contactText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  closing: {
    alignItems: 'center',
    marginTop: spacing.xxl,
    paddingTop: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  closingTitle: {
    fontFamily: marketingFonts.display,
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  closingBtn: {
    minWidth: 200,
  },
});
