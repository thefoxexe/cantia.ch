import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Container } from '../../components/ui';
import { SitePage } from '../../components/site/Sections';
import { Headline } from '../../components/site/Primitives';
import { site } from '../../lib/siteTheme';
import { BLOG_CATEGORIES, getAllPosts } from '../../lib/blog';
import { BlogCategory } from '../../lib/blog/types';
import { colors, fontSize, radius, spacing } from '../../lib/theme';
const DM = "'DM Sans', 'DM Sans Fallback', Arial, sans-serif";
import { getAppLocale, useTranslation } from '../../lib/translations';

const CATEGORY_STYLE: Record<BlogCategory, { icon: keyof typeof Feather.glyphMap; color: string; soft: string }> = {
  'Devis & facturation': { icon: 'file-text', color: site.copper, soft: '#f3e6da' },
  'Juridique & normes': { icon: 'shield', color: colors.danger, soft: colors.dangerSoft },
  'RH & salaires': { icon: 'users', color: colors.warning, soft: colors.warningSoft },
  'Chantier & rentabilité': { icon: 'trending-up', color: colors.success, soft: colors.successSoft },
  'Comparatifs & outils': { icon: 'layers', color: colors.accent, soft: colors.accentSoft },
  'Métiers du bâtiment': { icon: 'tool', color: colors.slate, soft: colors.slateSoft },
  'Croissance & acquisition': { icon: 'target', color: colors.plum, soft: colors.plumSoft },
  'Sur-mesure & automatisations': { icon: 'sliders', color: colors.moss, soft: colors.mossSoft },
  'Services & autres métiers': { icon: 'briefcase', color: colors.slate, soft: colors.slateSoft },
};

function normalize(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/\p{Mn}/gu, '');
}

export default function BlogIndexScreen() {
  const { t } = useTranslation();
  const locale = getAppLocale();
  const posts = useMemo(() => getAllPosts(locale), [locale]);
  const blogHrefPrefix = locale === 'de' ? '/de/blog' : locale === 'it' ? '/it/blog' : '/blog';
  const formatDate = (iso: string) => {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString(`${locale}-CH`, { day: 'numeric', month: 'short', year: 'numeric' });
  };
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    return posts.filter((p) => {
      if (category && p.category !== category) return false;
      if (!q) return true;
      const haystack = normalize([p.title, p.question, p.excerpt, p.category, ...p.keywords].join(' '));
      return haystack.includes(q);
    });
  }, [query, category, posts]);

  const [featured, ...rest] = filtered;

  return (
    <SitePage title={`${t('blogIndexPage.title')} | Cantia`} description={t('blogIndexPage.subtitle')}>

        <Container style={styles.heroOuter}>
          <View style={styles.kickerPill}>
            <Text style={styles.kickerText}>{t('blogIndexPage.kicker')}</Text>
          </View>
          <Headline level={1} plain={t('blogIndexPage.title')} size={52} style={{ letterSpacing: -2.2 }} />
          <Text style={styles.subtitle}>{t('blogIndexPage.subtitle')}</Text>

          <View style={styles.searchRow}>
            <Feather name="search" size={16} color={site.muted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={t('blogIndexPage.searchPlaceholder')}
              placeholderTextColor={site.muted}
              style={styles.searchInput}
            />
            {query ? (
              <Pressable onPress={() => setQuery('')} hitSlop={8}>
                <Feather name="x" size={16} color={site.muted} />
              </Pressable>
            ) : null}
          </View>

          <View style={styles.chipRow}>
            <Pressable onPress={() => setCategory(null)} style={[styles.chip, !category && styles.chipActive]}>
              <Text style={[styles.chipText, !category && styles.chipTextActive]}>{t('blogIndexPage.allArticles')}</Text>
            </Pressable>
            {BLOG_CATEGORIES.map((c) => (
              <Pressable key={c} onPress={() => setCategory(category === c ? null : c)} style={[styles.chip, category === c && styles.chipActive]}>
                <View style={[styles.chipDot, { backgroundColor: category === c ? '#fff' : CATEGORY_STYLE[c].color }]} />
                <Text style={[styles.chipText, category === c && styles.chipTextActive]}>{t(`blogCategories.${c}`)}</Text>
              </Pressable>
            ))}
          </View>
        </Container>

        <Container style={styles.section}>
          {filtered.length === 0 ? (
            <Text style={styles.empty}>{t('blogIndexPage.empty')}</Text>
          ) : (
            <>
              {featured ? (
                <Link href={`${blogHrefPrefix}/${featured.slug}` as any} asChild>
                  <Pressable style={styles.featuredCard}>
                    <View style={styles.featuredTop}>
                      <View style={[styles.categoryBadge, { backgroundColor: CATEGORY_STYLE[featured.category].soft }]}>
                        <Feather name={CATEGORY_STYLE[featured.category].icon} size={13} color={CATEGORY_STYLE[featured.category].color} />
                        <Text style={[styles.categoryBadgeText, { color: CATEGORY_STYLE[featured.category].color }]}>{t(`blogCategories.${featured.category}`)}</Text>
                      </View>
                      <View style={styles.featuredBadge}>
                        <Text style={styles.featuredBadgeText}>{t('blogIndexPage.latestArticle')}</Text>
                      </View>
                    </View>
                    <Text style={styles.featuredTitle}>{featured.title}</Text>
                    <Text style={styles.featuredExcerpt}>{featured.excerpt}</Text>
                    <View style={styles.cardMetaRow}>
                      <Text style={styles.cardMetaText}>{formatDate(featured.publishedAt)}</Text>
                      <View style={styles.cardMetaDot} />
                      <Text style={styles.cardMetaText}>{t('blogIndexPage.minRead', { count: featured.readMinutes })}</Text>
                      <View style={{ flex: 1 }} />
                      <View style={styles.readMore}>
                        <Text style={styles.readMoreText}>{t('blogIndexPage.readArticle')}</Text>
                        <Feather name="arrow-right" size={13} color={site.copper} />
                      </View>
                    </View>
                  </Pressable>
                </Link>
              ) : null}

              <Text style={styles.gridCount}>{t('blogIndexPage.otherArticles', { count: rest.length })}</Text>

              <View style={styles.grid}>
                {rest.map((p) => (
                  <Link key={p.slug} href={`${blogHrefPrefix}/${p.slug}` as any} asChild>
                    <Pressable style={styles.card}>
                      <Text style={[styles.cardCategory, { color: CATEGORY_STYLE[p.category].color }]}>{t(`blogCategories.${p.category}`)}</Text>
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
                          <Text style={styles.cardMetaText}>{t('blogIndexPage.minRead', { count: p.readMinutes })}</Text>
                        </View>
                        <Feather name="arrow-right" size={14} color={site.muted} />
                      </View>
                    </Pressable>
                  </Link>
                ))}
              </View>
            </>
          )}
        </Container>

    </SitePage>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
  },
  heroOuter: { maxWidth: 1240, width: '100%', alignSelf: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.xxxl, paddingBottom: spacing.lg },
  kickerPill: { alignSelf: 'flex-start', marginBottom: spacing.xl },
  kickerText: {
    fontFamily: DM,
    fontSize: fontSize.xs,
    color: site.ink,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  title: { fontFamily: DM, fontSize: 80, fontWeight: '500', color: site.ink, lineHeight: 76, maxWidth: 900 } as unknown as ViewStyle,
  subtitle: { fontFamily: DM, fontSize: 19, lineHeight: 29, color: site.muted, marginTop: spacing.xl, maxWidth: 640 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.xxl, borderBottomWidth: 1.5, borderBottomColor: site.ink, paddingVertical: spacing.sm, maxWidth: 620 },
  searchInput: { flex: 1, fontFamily: DM, fontSize: 18, color: site.ink, paddingVertical: 6, outlineStyle: 'none' } as any,
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.xl },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: '#D8C8B0', borderRadius: 3, paddingVertical: 7, paddingHorizontal: 12 },
  chipActive: { backgroundColor: site.ink, borderColor: site.ink },
  chipDot: { width: 6, height: 6 },
  chipText: { fontFamily: DM, fontSize: 14, fontWeight: '600', color: site.ink },
  chipTextActive: {
    color: '#fff',
  },
  section: { maxWidth: 1240, width: '100%', alignSelf: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.xxl, paddingBottom: 96 },
  empty: {
    fontFamily: DM,
    fontSize: fontSize.md,
    color: site.muted,
  },
  featuredCard: { borderTopWidth: 1.5, borderTopColor: site.ink, borderBottomWidth: 1, borderBottomColor: '#D8C8B0', paddingTop: spacing.lg, paddingBottom: spacing.xl, gap: spacing.md },
  featuredTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  featuredBadge: {},
  featuredBadgeText: { fontFamily: DM, fontSize: 10.5, letterSpacing: 0.4, textTransform: 'uppercase', color: site.copper },
  categoryBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'transparent' },
  categoryBadgeText: { fontFamily: DM, fontSize: 10.5, letterSpacing: 0.4, textTransform: 'uppercase' },
  featuredTitle: { fontFamily: DM, fontSize: 48, lineHeight: 48, fontWeight: '500', color: site.ink, maxWidth: 900 },
  featuredExcerpt: { fontFamily: DM, fontSize: 18, lineHeight: 28, color: site.muted, maxWidth: 720 },
  gridCount: { fontFamily: DM, fontSize: 10.5, letterSpacing: 0.4, textTransform: 'uppercase', color: site.muted, marginTop: 64, marginBottom: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: spacing.xxl, borderTopWidth: 1.5, borderTopColor: site.ink },
  card: { flexGrow: 1, flexBasis: 320, maxWidth: '100%', gap: spacing.sm, paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: '#D8C8B0' } as any,
  cardCategory: { fontFamily: DM, fontSize: 10.5, letterSpacing: 0.4, textTransform: 'uppercase' },
  cardTitle: { fontFamily: DM, fontSize: 18, fontWeight: '700', lineHeight: 24, color: site.ink },
  cardExcerpt: { fontFamily: DM, fontSize: 15, lineHeight: 22, color: site.muted },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' as any },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  cardMetaText: { fontFamily: DM, fontSize: 10.5, color: site.muted },
  cardMetaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: site.line,
  },
  readMore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readMoreText: {
    fontFamily: DM,
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: site.copper,
  },
});
