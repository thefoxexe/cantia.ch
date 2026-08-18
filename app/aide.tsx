import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Container, Screen } from '../components/ui';
import { MarketingFooter, MarketingNav } from '../components/MarketingChrome';
import { HELP_ARTICLES } from '../lib/helpArticles';
import { colors, fontSize, radius, spacing } from '../lib/theme';

function normalize(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/\p{Mn}/gu, '');
}

// Public counterpart to Compte → Aide (app/(app)/compte/aide.tsx), same
// content — reachable from the marketing nav without needing an account, so
// a prospect (or a client who just wants to know how something works) isn't
// forced through login just to read an FAQ article.
export default function PublicAideScreen() {
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return HELP_ARTICLES;
    return HELP_ARTICLES.filter((a) => {
      const haystack = normalize([a.title, a.category, ...a.keywords, ...a.body].join(' '));
      return haystack.includes(q);
    });
  }, [query]);

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
          <Text style={styles.title}>Centre d'aide</Text>
          <Text style={styles.lead}>Les réponses aux questions les plus fréquentes sur Cantia.</Text>

          <Link href="/aide/videos" asChild>
            <Pressable style={styles.videosCard}>
              <Feather name="film" size={18} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.videosCardTitle}>Tutoriels & démos en vidéo</Text>
                <Text style={styles.videosCardText}>Voir chaque module en action, module par module.</Text>
              </View>
              <Feather name="chevron-right" size={16} color={colors.textMuted} />
            </Pressable>
          </Link>

          <View style={styles.searchRow}>
            <Feather name="search" size={16} color={colors.textMuted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="ex : acompte, lien client, planning…"
              placeholderTextColor={colors.textMuted}
              style={styles.searchInput}
            />
          </View>

          {grouped.length === 0 ? (
            <Text style={styles.empty}>Aucun article ne correspond à cette recherche.</Text>
          ) : (
            grouped.map(([category, articles]) => (
              <View key={category} style={styles.categoryBlock}>
                <Text style={styles.categoryTitle}>{category}</Text>
                {articles.map((article) => {
                  const open = openId === article.id;
                  return (
                    <View key={article.id} style={styles.articleCard}>
                      <Pressable style={styles.articleHeader} onPress={() => setOpenId(open ? null : article.id)}>
                        <Text style={styles.articleTitle}>{article.title}</Text>
                        <Feather name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
                      </Pressable>
                      {open ? (
                        <View style={styles.articleBody}>
                          {article.body.map((paragraph, idx) => (
                            <Text key={idx} style={styles.paragraph}>
                              {paragraph}
                            </Text>
                          ))}
                        </View>
                      ) : null}
                    </View>
                  );
                })}
              </View>
            ))
          )}

          <View style={styles.contactCard}>
            <Feather name="life-buoy" size={18} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.contactTitle}>Pas trouvé de réponse ?</Text>
              <Text style={styles.contactText}>Écrivez-nous directement à info@cantia.ch.</Text>
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
  articleBody: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  paragraph: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 20,
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
