import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Screen } from '../components/ui';
import { PageHero, pageWrap } from '../components/landing/PageHero';
import { bodyInk, ink, rule } from '../components/landing/brand';
import { useMarketingDict } from '../lib/i18n';
import { marketingFonts, monoType } from '../lib/marketingTheme';
import { MarketingHead } from '../components/MarketingHead';
import { MarketingFooter, MarketingNav } from '../components/MarketingChrome';
import { HELP_ARTICLES, HELP_ARTICLES_DE, HELP_ARTICLES_IT } from '../lib/helpArticles';
import { breakpoints, colors, spacing } from '../lib/theme';
import { getAppLocale, useTranslation } from '../lib/translations';
import { marketingPageTitle } from '../lib/marketingSeoTitles';

function normalize(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/\p{Mn}/gu, '');
}

export default function PublicAideScreen() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const dict = useMarketingDict();
  const { width } = useWindowDimensions();
  const isTablet = width < breakpoints.desktop;
  const locale = getAppLocale();
  const aideHrefPrefix = locale === 'de' ? '/de/aide' : locale === 'it' ? '/it/aide' : '/aide';
  const articles = locale === 'de' ? HELP_ARTICLES_DE : locale === 'it' && HELP_ARTICLES_IT.length ? HELP_ARTICLES_IT : HELP_ARTICLES;

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return articles;
    return articles.filter((a) => {
      const haystack = normalize([a.title, a.category, ...a.keywords, ...a.body].join(' '));
      return haystack.includes(q);
    });
  }, [query, articles]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof HELP_ARTICLES>();
    for (const article of filtered) {
      const list = map.get(article.category) ?? [];
      list.push(article);
      map.set(article.category, list);
    }
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <Screen style={{ padding: 0 }}>
      <MarketingHead title={marketingPageTitle('aide', locale)} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <MarketingNav />

        <PageHero kicker={dict.landingNav.help} title={t('aidePage.title')} lede={t('aidePage.lead')}>
          <View style={styles.searchRow}>
            <Feather name="search" size={18} color={ink} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={t('aidePage.searchPlaceholder')}
              placeholderTextColor={colors.textMuted}
              style={styles.searchInput}
            />
          </View>
        </PageHero>

        <View style={[pageWrap, styles.layout, isTablet && styles.layoutCompact]}>
          <View style={[styles.side, !isTablet && { width: '28%' }]}>
            <Link href={(`${aideHrefPrefix}/videos`) as any} asChild>
              <Pressable style={styles.sideRow}>
                <Feather name="film" size={18} color={colors.primary} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={styles.sideTitle}>{t('aidePage.videosCardTitle')}</Text>
                  <Text style={styles.sideText}>{t('aidePage.videosCardText')}</Text>
                </View>
              </Pressable>
            </Link>
            <Link href={(`${aideHrefPrefix}/ressources`) as any} asChild>
              <Pressable style={styles.sideRow}>
                <Feather name="download" size={18} color={colors.primary} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={styles.sideTitle}>{t('aidePage.resourcesCardTitle')}</Text>
                  <Text style={styles.sideText}>{t('aidePage.resourcesCardText')}</Text>
                </View>
              </Pressable>
            </Link>
            <View style={styles.sideRow}>
              <Feather name="life-buoy" size={18} color={colors.primary} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.sideTitle}>{t('aidePage.contactTitle')}</Text>
                <Text style={styles.sideText}>{t('aidePage.contactText')}</Text>
              </View>
            </View>
          </View>

          <View style={{ flex: 1 }}>
            {grouped.length === 0 ? (
              <Text style={styles.empty}>{t('aidePage.emptyText')}</Text>
            ) : (
              grouped.map(([category, articles]) => (
                <View key={category} style={styles.category}>
                  <Text style={styles.categoryTitle}>{category}</Text>
                  {articles.map((article) => (
                    <Link key={article.id} href={`${aideHrefPrefix}/${article.id}` as any} asChild>
                      <Pressable style={styles.articleRow}>
                        <Text style={styles.articleTitle}>{article.title}</Text>
                        <Text style={styles.arrow}>→</Text>
                      </Pressable>
                    </Link>
                  ))}
                </View>
              ))
            )}
          </View>
        </View>

        <MarketingFooter />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.xxl, borderBottomWidth: 1.5, borderBottomColor: ink, paddingVertical: spacing.sm, maxWidth: 620 },
  searchInput: { flex: 1, fontFamily: marketingFonts.body, fontSize: 19, color: ink, paddingVertical: 6, outlineStyle: 'none' } as any,
  layout: { flexDirection: 'row', gap: 64, alignItems: 'flex-start', paddingTop: spacing.xl, paddingBottom: 96 },
  layoutCompact: { flexDirection: 'column', alignItems: 'stretch', gap: spacing.xxl },
  side: { borderTopWidth: 1.5, borderTopColor: ink },
  sideRow: { flexDirection: 'row', gap: spacing.md, paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: rule },
  sideTitle: { fontFamily: marketingFonts.body, fontSize: 16, fontWeight: '700', color: ink },
  sideText: { fontFamily: marketingFonts.body, fontSize: 14, lineHeight: 21, color: bodyInk },
  category: { marginBottom: spacing.xxl, borderTopWidth: 1.5, borderTopColor: ink },
  categoryTitle: { ...monoType, fontSize: 11, letterSpacing: 0.4, textTransform: 'uppercase', color: colors.primary, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: rule },
  articleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.lg, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: rule },
  articleTitle: { flex: 1, fontFamily: marketingFonts.body, fontSize: 17, fontWeight: '600', color: ink },
  arrow: { fontSize: 16, color: colors.primary },
  empty: { fontFamily: marketingFonts.body, fontSize: 16, color: bodyInk },
});
