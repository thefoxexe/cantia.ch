import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Container, Screen } from '../../components/ui';
import { MarketingFooter, MarketingNav } from '../../components/MarketingChrome';
import { BLOG_CATEGORIES, BLOG_POSTS } from '../../lib/blog';
import { BlogCategory } from '../../lib/blog/types';
import { colors, fontSize, radius, spacing } from '../../lib/theme';
import { marketingFonts } from '../../lib/marketingTheme';

// A distinct accent per category so a card reads as its own object at a
// glance — not just a paragraph of text — even before the title is read.
const CATEGORY_STYLE: Record<BlogCategory, { icon: keyof typeof Feather.glyphMap; color: string; soft: string }> = {
  'Devis & facturation': { icon: 'file-text', color: colors.primary, soft: colors.primarySoft },
  'Juridique & normes': { icon: 'shield', color: colors.danger, soft: colors.dangerSoft },
  'RH & salaires': { icon: 'users', color: colors.warning, soft: colors.warningSoft },
  'Chantier & rentabilité': { icon: 'trending-up', color: colors.success, soft: colors.successSoft },
  'Comparatifs & outils': { icon: 'layers', color: colors.accent, soft: colors.accentSoft },
  'Métiers du bâtiment': { icon: 'tool', color: colors.slate, soft: colors.slateSoft },
  'Croissance & acquisition': { icon: 'target', color: colors.plum, soft: colors.plumSoft },
  'Sur-mesure & automatisations': { icon: 'sliders', color: colors.moss, soft: colors.mossSoft },
};

function normalize(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/\p{Mn}/gu, '');
}

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('fr-CH', { day: 'numeric', month: 'short', year: 'numeric' });
}

// The blog index — search + category filter over lib/blog's static content
// array, following the same accent-insensitive normalize()+useMemo pattern
// already established in app/aide.tsx, so a new visitor doesn't get a
// second, differently-behaving search on the same site.
export default function BlogIndexScreen() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    return BLOG_POSTS.filter((p) => {
      if (category && p.category !== category) return false;
      if (!q) return true;
      const haystack = normalize([p.title, p.question, p.excerpt, p.category, ...p.keywords].join(' '));
      return haystack.includes(q);
    });
  }, [query, category]);

  const [featured, ...rest] = filtered;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <MarketingNav />

        <Container style={styles.heroOuter}>
          <View style={styles.kickerPill}>
            <Text style={styles.kickerText}>Blog</Text>
          </View>
          <Text style={styles.title}>Les réponses concrètes du chantier suisse</Text>
          <Text style={styles.subtitle}>
            Devis, facturation, RH, juridique, comparatifs — des réponses précises aux questions que se posent
            vraiment les artisans et entreprises du bâtiment en Suisse.
          </Text>

          <View style={styles.searchRow}>
            <Feather name="search" size={16} color={colors.textMuted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="ex : QR-facture, sous-traitant, heures, SIA 118…"
              placeholderTextColor={colors.textMuted}
              style={styles.searchInput}
            />
            {query ? (
              <Pressable onPress={() => setQuery('')} hitSlop={8}>
                <Feather name="x" size={16} color={colors.textMuted} />
              </Pressable>
            ) : null}
          </View>

          <View style={styles.chipRow}>
            <Pressable onPress={() => setCategory(null)} style={[styles.chip, !category && styles.chipActive]}>
              <Text style={[styles.chipText, !category && styles.chipTextActive]}>Tous les articles</Text>
            </Pressable>
            {BLOG_CATEGORIES.map((c) => (
              <Pressable key={c} onPress={() => setCategory(category === c ? null : c)} style={[styles.chip, category === c && styles.chipActive]}>
                <View style={[styles.chipDot, { backgroundColor: category === c ? '#fff' : CATEGORY_STYLE[c].color }]} />
                <Text style={[styles.chipText, category === c && styles.chipTextActive]}>{c}</Text>
              </Pressable>
            ))}
          </View>
        </Container>

        <Container style={styles.section}>
          {filtered.length === 0 ? (
            <Text style={styles.empty}>Aucun article ne correspond à cette recherche.</Text>
          ) : (
            <>
              {featured ? (
                <Link href={`/blog/${featured.slug}` as any} asChild>
                  <Pressable style={styles.featuredCard}>
                    <View style={styles.featuredTop}>
                      <View style={[styles.categoryBadge, { backgroundColor: CATEGORY_STYLE[featured.category].soft }]}>
                        <Feather name={CATEGORY_STYLE[featured.category].icon} size={13} color={CATEGORY_STYLE[featured.category].color} />
                        <Text style={[styles.categoryBadgeText, { color: CATEGORY_STYLE[featured.category].color }]}>{featured.category}</Text>
                      </View>
                      <View style={styles.featuredBadge}>
                        <Text style={styles.featuredBadgeText}>Dernier article</Text>
                      </View>
                    </View>
                    <Text style={styles.featuredTitle}>{featured.title}</Text>
                    <Text style={styles.featuredExcerpt}>{featured.excerpt}</Text>
                    <View style={styles.cardMetaRow}>
                      <Text style={styles.cardMetaText}>{formatDate(featured.publishedAt)}</Text>
                      <View style={styles.cardMetaDot} />
                      <Text style={styles.cardMetaText}>{featured.readMinutes} min</Text>
                      <View style={{ flex: 1 }} />
                      <View style={styles.readMore}>
                        <Text style={styles.readMoreText}>Lire l’article</Text>
                        <Feather name="arrow-right" size={13} color={colors.primary} />
                      </View>
                    </View>
                  </Pressable>
                </Link>
              ) : null}

              <Text style={styles.gridCount}>
                {rest.length} autre{rest.length > 1 ? 's' : ''} article{rest.length > 1 ? 's' : ''}
              </Text>

              <View style={styles.grid}>
                {rest.map((p) => (
                  <Link key={p.slug} href={`/blog/${p.slug}` as any} asChild>
                    <Pressable style={styles.card}>
                      <View style={[styles.cardMedallion, { backgroundColor: CATEGORY_STYLE[p.category].soft }]}>
                        <Feather name={CATEGORY_STYLE[p.category].icon} size={18} color={CATEGORY_STYLE[p.category].color} />
                      </View>
                      <Text style={[styles.cardCategory, { color: CATEGORY_STYLE[p.category].color }]}>{p.category}</Text>
                      <Text style={styles.cardTitle} numberOfLines={3}>
                        {p.title}
                      </Text>
                      <Text style={styles.cardExcerpt} numberOfLines={2}>
                        {p.excerpt}
                      </Text>
                      <View style={styles.cardFooter}>
                        <View style={styles.cardMetaRow}>
                          <Text style={styles.cardMetaText}>{formatDate(p.publishedAt)}</Text>
                          <View style={styles.cardMetaDot} />
                          <Text style={styles.cardMetaText}>{p.readMinutes} min</Text>
                        </View>
                        <Feather name="arrow-right" size={14} color={colors.textMuted} />
                      </View>
                    </Pressable>
                  </Link>
                ))}
              </View>
            </>
          )}
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
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
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
    fontSize: 42,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.6,
    lineHeight: 48,
    maxWidth: 640,
  } as unknown as ViewStyle,
  subtitle: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.md,
    color: colors.textMuted,
    marginTop: spacing.md,
    lineHeight: 24,
    maxWidth: 560,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginTop: spacing.xl,
    maxWidth: 480,
  },
  searchInput: {
    flex: 1,
    fontFamily: marketingFonts.body,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.lg,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
  },
  chipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  chipText: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textMuted,
  },
  chipTextActive: {
    color: '#fff',
  },
  section: {
    maxWidth: 1040,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  empty: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
  featuredCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    gap: spacing.xs,
    shadowColor: '#231A12',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
    transitionProperty: 'transform, border-color, box-shadow',
    transitionDuration: '0.2s',
  } as unknown as ViewStyle,
  featuredCardHovered: {
    borderColor: colors.primary,
    transform: [{ translateY: -3 }],
    shadowOpacity: 0.14,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
  },
  featuredTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  featuredBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  featuredBadgeText: {
    fontFamily: marketingFonts.body,
    fontSize: 10,
    fontWeight: '800',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  categoryBadgeText: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.xs,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  featuredTitle: {
    fontFamily: marketingFonts.display,
    fontSize: 26,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.3,
    maxWidth: 640,
    marginTop: 2,
  } as unknown as ViewStyle,
  featuredExcerpt: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 21,
    maxWidth: 620,
  },
  gridCount: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  card: {
    flexBasis: '31%',
    flexGrow: 1,
    minWidth: 280,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: 6,
    shadowColor: '#231A12',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
    transitionProperty: 'transform, border-color, box-shadow',
    transitionDuration: '0.2s',
  } as unknown as ViewStyle,
  cardHovered: {
    borderColor: colors.primary,
    transform: [{ translateY: -3 }],
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  cardMedallion: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  cardCategory: {
    fontFamily: marketingFonts.body,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 21,
    marginTop: 2,
  },
  cardExcerpt: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 19,
    flexGrow: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  cardMetaText: {
    fontFamily: marketingFonts.body,
    fontSize: 11,
    color: colors.textMuted,
  },
  cardMetaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  readMore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readMoreText: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.primary,
  },
});
