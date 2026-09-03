import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Container, Screen } from '../components/ui';
import { Heading } from '../components/Heading';
import { MarketingFooter, MarketingNav } from '../components/MarketingChrome';
import { HELP_ARTICLES, HELP_ARTICLES_DE } from '../lib/helpArticles';
import { colors, fontSize, radius, spacing } from '../lib/theme';
import { getAppLocale, useTranslation } from '../lib/translations';

function normalize(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/\p{Mn}/gu, '');
}

// The one Centre d'aide, reachable from the marketing nav without needing an
// account (so a prospect, or a client who just wants to know how something
// works, isn't forced through login), and linked to directly from inside the
// app too (Compte, profile menu) — no separate in-app copy of this page.
// Each article below is its own indexable page at /aide/<id> (see
// app/aide/[id].tsx) rather than an accordion row expanding in place — a
// prospect searching "comment créer un devis Cantia" lands directly on that
// article instead of on this generic list.
export default function PublicAideScreen() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const locale = getAppLocale();
  const aideHrefPrefix = locale === 'de' ? '/de/aide' : '/aide';
  // useTranslation() above already re-renders this component on locale
  // change (same mechanism every other marketing/app screen relies on for
  // getAppLocale()), so this stays in sync with the FR/DE toggle.
  const articles = locale === 'de' ? HELP_ARTICLES_DE : HELP_ARTICLES;

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
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <MarketingNav />

        <Container style={styles.container}>
          <Heading level={1} style={styles.title}>{t('aidePage.title')}</Heading>
          <Text style={styles.lead}>{t('aidePage.lead')}</Text>

          <Link href={(locale === 'de' ? '/de/aide/videos' : '/aide/videos') as any} asChild>
            <Pressable style={styles.videosCard}>
              <Feather name="film" size={18} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.videosCardTitle}>{t('aidePage.videosCardTitle')}</Text>
                <Text style={styles.videosCardText}>{t('aidePage.videosCardText')}</Text>
              </View>
              <Feather name="chevron-right" size={16} color={colors.textMuted} />
            </Pressable>
          </Link>

          <View style={styles.searchRow}>
            <Feather name="search" size={16} color={colors.textMuted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={t('aidePage.searchPlaceholder')}
              placeholderTextColor={colors.textMuted}
              style={styles.searchInput}
            />
          </View>

          {grouped.length === 0 ? (
            <Text style={styles.empty}>{t('aidePage.emptyText')}</Text>
          ) : (
            grouped.map(([category, articles]) => (
              <View key={category} style={styles.categoryBlock}>
                <Text style={styles.categoryTitle}>{category}</Text>
                {articles.map((article) => (
                  <Link key={article.id} href={`${aideHrefPrefix}/${article.id}` as any} asChild>
                    <Pressable style={styles.articleCard}>
                      <View style={styles.articleHeader}>
                        <Text style={styles.articleTitle}>{article.title}</Text>
                        <Feather name="arrow-right" size={16} color={colors.textMuted} />
                      </View>
                    </Pressable>
                  </Link>
                ))}
              </View>
            ))
          )}

          <View style={styles.contactCard}>
            <Feather name="life-buoy" size={18} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.contactTitle}>{t('aidePage.contactTitle')}</Text>
              <Text style={styles.contactText}>{t('aidePage.contactText')}</Text>
            </View>
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
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
  },
  lead: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  videosCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  videosCardTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  videosCardText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 1,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  empty: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  categoryBlock: {
    marginTop: spacing.lg,
  },
  categoryTitle: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  articleCard: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  articleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  articleTitle: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
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
});
