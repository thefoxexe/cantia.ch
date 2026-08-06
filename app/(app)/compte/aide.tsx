import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Card, Container, Field, PageHeader, Screen } from '../../../components/ui';
import { SettingsTabs } from '../../../components/SettingsTabs';
import { HELP_ARTICLES } from '../../../lib/helpArticles';
import { colors, fontSize, spacing } from '../../../lib/theme';

function normalize(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/\p{Mn}/gu, '');
}

export default function AideScreen() {
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
      <PageHeader title="Aide" backTo="/(app)/compte" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Container>
          <SettingsTabs />
          <Field
            label="Rechercher dans l'aide"
            value={query}
            onChangeText={setQuery}
            placeholder="ex : acompte, lien client, planning…"
          />
          {grouped.length === 0 ? (
            <Card>
              <Text style={styles.empty}>Aucun article ne correspond à cette recherche.</Text>
            </Card>
          ) : (
            grouped.map(([category, articles]) => (
              <View key={category} style={styles.categoryBlock}>
                <Text style={styles.categoryTitle}>{category}</Text>
                {articles.map((article) => {
                  const open = openId === article.id;
                  return (
                    <Card key={article.id} style={styles.articleCard}>
                      <Pressable
                        style={styles.articleHeader}
                        onPress={() => setOpenId(open ? null : article.id)}
                      >
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
                    </Card>
                  );
                })}
              </View>
            ))
          )}
        </Container>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: spacing.xxl,
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
});
