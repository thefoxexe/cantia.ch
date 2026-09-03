import { Text, View } from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';
import { Screen } from '../../components/ui';
import { HelpArticlePage } from '../../components/HelpArticlePage';
import { MarketingFooter, MarketingNav } from '../../components/MarketingChrome';
import { HELP_ARTICLES, HELP_ARTICLES_DE } from '../../lib/helpArticles';
import { colors, fontSize, spacing } from '../../lib/theme';
import { getAppLocale, useTranslation } from '../../lib/translations';

// Needed for the `app-marketing/` static export (web.output: "static") to
// know which /aide/<id> pages to prerender — see app-marketing/aide/[id].tsx,
// which re-exports this alongside this function. The app.cantia.ch build
// (web.output: "single") ignores this export entirely and just resolves the
// route client-side, so it costs nothing there.
export function generateStaticParams() {
  return HELP_ARTICLES.map((a) => ({ id: a.id }));
}

export default function HelpArticleScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const articles = getAppLocale() === 'de' ? HELP_ARTICLES_DE : HELP_ARTICLES;
  const article = articles.find((a) => a.id === id);

  if (!article) {
    return (
      <Screen>
        <MarketingNav />
        <View style={{ maxWidth: 480, alignSelf: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.xxxl, alignItems: 'center', gap: spacing.md }}>
          <Text style={{ fontSize: fontSize.xxl, fontWeight: '800', color: colors.text }}>{t('helpArticlePage.notFoundTitle')}</Text>
          <Text style={{ fontSize: fontSize.md, color: colors.textMuted, textAlign: 'center' }}>{t('helpArticlePage.notFoundText')}</Text>
          <Link href="/aide">
            <Text style={{ fontSize: fontSize.md, color: colors.primary, fontWeight: '700' }}>{t('helpArticlePage.backToAide')}</Text>
          </Link>
        </View>
        <MarketingFooter />
      </Screen>
    );
  }

  const related = articles.filter((a) => a.id !== article.id && a.category === article.category).slice(0, 3);
  return <HelpArticlePage article={article} related={related} />;
}
