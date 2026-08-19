import { ReactNode, useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Button, Container, Screen } from './ui';
import { MarketingFooter, MarketingNav } from './MarketingChrome';
import { colors, fontSize, radius, spacing } from '../lib/theme';
import { marketingFonts } from '../lib/marketingTheme';
import { authHref } from '../lib/appHost';
import { BlogPost } from '../lib/blog/types';
import { getRelatedPosts } from '../lib/blog';

const CATEGORY_ICON: Record<BlogPost['category'], keyof typeof Feather.glyphMap> = {
  'Devis & facturation': 'file-text',
  'Juridique & normes': 'shield',
  'RH & salaires': 'users',
  'Chantier & rentabilité': 'trending-up',
  'Comparatifs & outils': 'layers',
};

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('fr-CH', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Shared template for every /blog/[slug] article — same chrome, hero and
// closing CTA pattern as SolutionPage.tsx, so the blog reads as the same
// site rather than a bolted-on section. The content itself renders through
// a small switch over BlogBlock, since no markdown/MDX parser exists in
// this repo (see lib/blog/types.ts).
export function BlogArticle({ post }: { post: BlogPost }) {
  const heroAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(heroAnim, { toValue: 1, duration: 560, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [heroAnim]);

  const related = getRelatedPosts(post);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <MarketingNav />

        <Container style={styles.heroOuter}>
          <Animated.View
            style={{
              opacity: heroAnim,
              transform: [{ translateY: heroAnim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
            }}
          >
            <Link href="/blog" asChild>
              <Pressable style={styles.backLink}>
                <Feather name="arrow-left" size={13} color={colors.primary} />
                <Text style={styles.backLinkText}>Tous les articles</Text>
              </Pressable>
            </Link>

            <View style={styles.kickerPill}>
              <Feather name={CATEGORY_ICON[post.category] ?? 'file-text'} size={12} color={colors.primaryDark} />
              <Text style={styles.kickerText}>{post.category}</Text>
            </View>

            <Text style={styles.title}>{post.title}</Text>
            <Text style={styles.question}>{post.question}</Text>

            <View style={styles.metaRow}>
              <Text style={styles.metaText}>{formatDate(post.publishedAt)}</Text>
              <View style={styles.metaDot} />
              <Text style={styles.metaText}>{post.readMinutes} min de lecture</Text>
            </View>
          </Animated.View>
        </Container>

        <Container style={styles.body}>
          {post.blocks.map((block, i) => <BlockRenderer key={i} block={block} />)}
        </Container>

        {post.faq?.length ? (
          <Container style={styles.section}>
            <Text style={styles.sectionEyebrow}>Questions fréquentes</Text>
            <View style={styles.faqList}>
              {post.faq.map((f, i) => (
                <View key={f.question} style={[styles.faqRow, i === post.faq!.length - 1 && styles.faqRowLast]}>
                  <Text style={styles.faqQuestion}>{f.question}</Text>
                  <Text style={styles.faqAnswer}>{f.answer}</Text>
                </View>
              ))}
            </View>
          </Container>
        ) : null}

        {related.length ? (
          <Container style={styles.section}>
            <Text style={styles.sectionEyebrow}>À lire aussi</Text>
            <View style={styles.relatedGrid}>
              {related.map((r) => (
                <Link key={r.slug} href={`/blog/${r.slug}` as any} asChild>
                  <Pressable style={({ hovered }: any) => [styles.relatedCard, hovered && styles.relatedCardHovered]}>
                    <Text style={styles.relatedCategory}>{r.category}</Text>
                    <Text style={styles.relatedTitle}>{r.title}</Text>
                    <View style={styles.relatedMore}>
                      <Text style={styles.relatedMoreText}>Lire l’article</Text>
                      <Feather name="arrow-right" size={12} color={colors.primary} />
                    </View>
                  </Pressable>
                </Link>
              ))}
            </View>
          </Container>
        ) : null}

        <Container style={styles.closingOuter}>
          <View style={styles.closing}>
            <Text style={styles.closingTitle}>Piloter vos chantiers sans y penser</Text>
            <Text style={styles.closingText}>
              Devis, factures QR, rapports et rentabilité par chantier — tout Cantia, gratuit pour commencer.
            </Text>
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

function BlockRenderer({ block }: { block: BlogPost['blocks'][number] }) {
  switch (block.type) {
    case 'p':
      return <Text style={styles.paragraph}>{block.text}</Text>;
    case 'h2':
      return <Text style={styles.h2}>{block.text}</Text>;
    case 'list':
      return (
        <View style={styles.list}>
          {block.items.map((item, i) => (
            <View key={i} style={styles.listRow}>
              <View style={styles.listBullet}>
                {block.ordered ? <Text style={styles.listBulletNum}>{i + 1}</Text> : <View style={styles.listDot} />}
              </View>
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}
        </View>
      );
    case 'callout':
      return (
        <View style={styles.callout}>
          <Feather name="info" size={16} color={colors.primaryDark} style={styles.calloutIcon} />
          <View style={{ flex: 1 }}>
            <Text style={styles.calloutTitle}>{block.title}</Text>
            <Text style={styles.calloutText}>{block.text}</Text>
          </View>
        </View>
      );
    case 'stat':
      return (
        <View style={styles.stat}>
          <Text style={styles.statValue}>{block.value}</Text>
          <Text style={styles.statLabel}>{block.label}</Text>
        </View>
      );
    case 'table':
      return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tableScroll}>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeadRow]}>
              {block.headers.map((h, i) => (
                <Text key={i} style={[styles.tableCell, styles.tableHeadCell]}>
                  {h}
                </Text>
              ))}
            </View>
            {block.rows.map((row, ri) => (
              <View key={ri} style={[styles.tableRow, ri === block.rows.length - 1 && styles.tableRowLast]}>
                {row.map((cell, ci) => (
                  <Text key={ci} style={styles.tableCell}>
                    {cell}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      );
    case 'cta':
      return (
        <View style={styles.inlineCta}>
          <View style={{ flex: 1, minWidth: 220 }}>
            <Text style={styles.inlineCtaTitle}>{block.title}</Text>
            <Text style={styles.inlineCtaText}>{block.text}</Text>
          </View>
          <Link href={authHref('signup')} asChild>
            <Button title={block.buttonLabel} onPress={() => {}} />
          </Link>
        </View>
      );
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
  },
  heroOuter: {
    maxWidth: 760,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    marginBottom: spacing.lg,
  },
  backLinkText: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.primary,
  },
  kickerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
    fontSize: 38,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.5,
    lineHeight: 44,
  } as unknown as ViewStyle,
  question: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.md,
    color: colors.textMuted,
    marginTop: spacing.md,
    lineHeight: 24,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  metaText: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  body: {
    maxWidth: 760,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.lg,
  },
  paragraph: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 26,
  },
  h2: {
    fontFamily: marketingFonts.display,
    fontSize: fontSize.xxl,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.3,
    marginTop: spacing.md,
  } as unknown as ViewStyle,
  list: {
    gap: spacing.sm,
  },
  listRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  listBullet: {
    width: 20,
    height: 20,
    marginTop: 3,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  listDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  listBulletNum: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: colors.primary,
  },
  listText: {
    flex: 1,
    fontFamily: marketingFonts.body,
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 24,
  },
  callout: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  calloutIcon: {
    marginTop: 2,
  },
  calloutTitle: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: colors.primaryDark,
    marginBottom: 4,
  },
  calloutText: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.sm,
    color: colors.primaryDark,
    lineHeight: 21,
    opacity: 0.9,
  },
  stat: {
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    paddingLeft: spacing.lg,
    paddingVertical: spacing.xs,
  },
  statValue: {
    fontFamily: marketingFonts.display,
    fontSize: 30,
    fontWeight: '600',
    color: colors.text,
  } as unknown as ViewStyle,
  statLabel: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  tableScroll: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  table: {
    minWidth: 480,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  tableHeadRow: {
    backgroundColor: colors.surfaceAlt,
  },
  tableCell: {
    flex: 1,
    minWidth: 130,
    fontFamily: marketingFonts.body,
    fontSize: fontSize.sm,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  tableHeadCell: {
    fontWeight: '700',
    color: colors.textMuted,
    fontSize: fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  inlineCta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  inlineCtaTitle: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  inlineCtaText: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 19,
  },
  section: {
    maxWidth: 760,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  sectionEyebrow: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    marginBottom: spacing.lg,
  },
  faqList: {},
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
  },
  relatedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  relatedCard: {
    flex: 1,
    minWidth: 220,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
    transitionProperty: 'transform, border-color',
    transitionDuration: '0.2s',
  } as unknown as ViewStyle,
  relatedCardHovered: {
    borderColor: colors.primary,
    transform: [{ translateY: -3 }],
  },
  relatedCategory: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  relatedTitle: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 20,
  },
  relatedMore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
  },
  relatedMoreText: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.primary,
  },
  closingOuter: {
    maxWidth: 1040,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
    paddingTop: spacing.lg,
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
  } as unknown as ViewStyle,
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
