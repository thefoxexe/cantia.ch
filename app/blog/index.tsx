import { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Breadcrumbs, Section, SitePage, useSiteLayout } from '../../components/site/Sections';
import { Eyebrow, Headline, Hover, Wrap } from '../../components/site/Primitives';
import { SITE_PAGES } from '../../lib/site/pages';
import { sans, site } from '../../lib/siteTheme';
import { BLOG_CATEGORIES, getAllPosts } from '../../lib/blog';
import { getAppLocale, useTranslation } from '../../lib/translations';

// cantia.ch/blog (and /de/blog, /it/blog): search, topics, the latest
// article, then every article.

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
  const { phone, tablet, width } = useSiteLayout();
  const home = locale === 'de' ? '/de' : locale === 'it' ? '/it' : '/';
  const homeLabel = SITE_PAGES[(locale as 'fr' | 'de' | 'it')]?.labels.home ?? 'Accueil';
  const cardW = phone ? '100%' : width <= 1000 ? '48%' : '31.5%';

  return (
    <SitePage title={`${t('blogIndexPage.title')} | Cantia`} description={t('blogIndexPage.subtitle')}>
      {/* Hero, search and topics */}
      <View style={{ paddingTop: phone ? 32 : 58, paddingBottom: phone ? 36 : 52 }}>
        <Wrap>
          <Breadcrumbs items={[{ label: homeLabel, href: home }, { label: t('blogIndexPage.title') }]} />
          <Eyebrow style={{ marginTop: phone ? 24 : 32 }}>{t('blogIndexPage.kicker')}</Eyebrow>
          <Headline level={1} plain={t('blogIndexPage.title')} size={phone ? 40 : tablet ? 48 : 58} style={{ marginTop: 16, marginBottom: 18, maxWidth: 900 }} />
          <Text style={[sans, styles.lead, phone && { fontSize: 13 }]}>{t('blogIndexPage.subtitle')}</Text>
          <View style={styles.search}>
            <Feather name="search" size={17} color={site.muted} />
            <TextInput value={query} onChangeText={setQuery} placeholder={t('blogIndexPage.searchPlaceholder')} placeholderTextColor="#a1a697" style={[sans, styles.searchInput]} accessibilityLabel={t('blogIndexPage.searchPlaceholder')} />
            {query ? (
              <Hover onPress={() => setQuery('')} accessibilityRole="button" hover={{ opacity: 0.6 }}>
                <Feather name="x" size={16} color={site.muted} />
              </Hover>
            ) : null}
          </View>
          <View style={styles.chips}>
            {[null, ...BLOG_CATEGORIES].map((c) => {
              const on = c === category || (c === null && !category);
              return (
                <Hover key={c ?? 'all'} onPress={() => setCategory(c === category ? null : c)} accessibilityRole="button" base={[styles.chip, on && styles.chipOn]} hover={{ borderColor: site.copper }}>
                  <Text style={[sans, styles.chipText, on && { color: '#ffffff' }]}>{c ? t(`blogCategories.${c}`) : t('blogIndexPage.allArticles')}</Text>
                </Hover>
              );
            })}
          </View>
        </Wrap>
      </View>

      <Section white>
        {filtered.length === 0 ? (
          <Text style={[sans, styles.empty]}>{t('blogIndexPage.empty')}</Text>
        ) : (
          <>
            {featured ? (
              <Link href={`${blogHrefPrefix}/${featured.slug}` as any} asChild>
                <Hover accessibilityRole="link" base={[styles.featured, phone && { padding: 26 }]} hover={{ backgroundColor: '#e2d0b9' }}>
                  <View style={styles.featuredTop}>
                    <Text style={[sans, styles.cat]}>{t(`blogCategories.${featured.category}`).toUpperCase()}</Text>
                    <Text style={[sans, styles.latest]}>{t('blogIndexPage.latestArticle').toUpperCase()}</Text>
                  </View>
                  <Text role="heading" aria-level={2} style={[sans, styles.featuredTitle, phone && { fontSize: 26, lineHeight: 32 }]}>
                    {featured.title}
                  </Text>
                  <Text style={[sans, styles.featuredExcerpt]}>{featured.excerpt}</Text>
                  <View style={styles.meta}>
                    <Text style={[sans, styles.metaText]}>
                      {formatDate(featured.publishedAt)} · {t('blogIndexPage.minRead', { count: featured.readMinutes })}
                    </Text>
                    <View style={styles.read}>
                      <Text style={[sans, styles.readText]}>{t('blogIndexPage.readArticle')}</Text>
                      <Feather name="arrow-right" size={14} color={site.copper} />
                    </View>
                  </View>
                </Hover>
              </Link>
            ) : null}

            <Text style={[sans, styles.count]}>{t('blogIndexPage.otherArticles', { count: rest.length })}</Text>
            <View style={styles.grid}>
              {rest.map((p) => (
                <Link key={p.slug} href={`${blogHrefPrefix}/${p.slug}` as any} asChild>
                  <Hover accessibilityRole="link" base={[styles.card, { width: cardW }]} hover={{ opacity: 0.8 }}>
                    {(hovered) => (
                      <>
                        <Text style={[sans, styles.cat]}>{t(`blogCategories.${p.category}`).toUpperCase()}</Text>
                        <Text style={[sans, styles.cardTitle, hovered && { color: site.copper }]} numberOfLines={3}>
                          {p.title}
                        </Text>
                        <Text style={[sans, styles.cardExcerpt]} numberOfLines={3}>
                          {p.excerpt}
                        </Text>
                        <Text style={[sans, styles.metaText, { marginTop: 'auto', paddingTop: 14 }]}>
                          {formatDate(p.publishedAt)} · {t('blogIndexPage.minRead', { count: p.readMinutes })}
                        </Text>
                      </>
                    )}
                  </Hover>
                </Link>
              ))}
            </View>
          </>
        )}
      </Section>
    </SitePage>
  );
}

const styles = StyleSheet.create({
  lead: { fontSize: 15, color: site.muted, lineHeight: 26, maxWidth: 640 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 28, maxWidth: 620, height: 54, paddingHorizontal: 18, borderWidth: 1, borderColor: '#d7dacf', borderRadius: 8, backgroundColor: site.white },
  searchInput: { flex: 1, fontSize: 15, color: site.ink, outlineStyle: 'none' } as object,
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 22 },
  chip: { borderWidth: 1, borderColor: site.line, borderRadius: 5, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: site.white },
  chipOn: { backgroundColor: site.copper, borderColor: site.copper },
  chipText: { fontSize: 11, color: site.ink },
  empty: { fontSize: 14, color: site.muted },
  featured: { backgroundColor: '#e7d8c5', borderRadius: 10, padding: 40, marginBottom: 50 },
  featuredTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  cat: { fontSize: 9, letterSpacing: 1.4, color: site.copper, fontWeight: '600' },
  latest: { fontSize: 9, letterSpacing: 1.4, color: '#8d755c', fontWeight: '600' },
  featuredTitle: { fontSize: 36, lineHeight: 42, letterSpacing: -1.2, color: site.ink, marginTop: 18, maxWidth: 860 },
  featuredExcerpt: { fontSize: 14, lineHeight: 25, color: '#6e6352', marginTop: 14, maxWidth: 760 },
  meta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginTop: 26, flexWrap: 'wrap' },
  metaText: { fontSize: 11, color: site.muted },
  read: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  readText: { fontSize: 12, color: site.copper, fontWeight: '600' },
  count: { fontSize: 11, color: site.muted, marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 34 },
  card: { borderTopWidth: 1, borderTopColor: site.line, paddingTop: 20, minHeight: 210 },
  cardTitle: { fontSize: 18, lineHeight: 25, letterSpacing: -0.4, color: site.ink, marginTop: 12 },
  cardExcerpt: { fontSize: 12, lineHeight: 21, color: site.muted, marginTop: 10 },
});
