import { Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SitePage } from '../../components/site/Sections';
import { Btn, Headline, Wrap } from '../../components/site/Primitives';
import { HelpArticlePage } from '../../components/HelpArticlePage';
import { HELP_ARTICLES, HELP_ARTICLES_DE, HELP_ARTICLES_IT } from '../../lib/helpArticles';
import { getAppLocale, useTranslation } from '../../lib/translations';
import { sans, site } from '../../lib/siteTheme';


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
  const locale = getAppLocale();
  const articles = locale === 'de' ? HELP_ARTICLES_DE : locale === 'it' && HELP_ARTICLES_IT.length ? HELP_ARTICLES_IT : HELP_ARTICLES;
  const article = articles.find((a) => a.id === id);

  if (!article) {
    return (
      <SitePage title={`${t('helpArticlePage.notFoundTitle')} | Cantia`} cta={false}>
        <View style={{ paddingVertical: 110 }}>
          <Wrap>
            <Headline level={1} plain={t('helpArticlePage.notFoundTitle')} size={44} />
            <Text style={[sans, { fontSize: 14, color: site.muted, marginTop: 14 }]}>{t('helpArticlePage.notFoundText')}</Text>
            <View style={{ marginTop: 24, alignSelf: 'flex-start' }}>
              <Btn label={t('helpArticlePage.backToAide')} href={locale === 'de' ? '/de/aide' : locale === 'it' ? '/it/aide' : '/aide'} />
            </View>
          </Wrap>
        </View>
      </SitePage>
    );
  }

  const related = articles.filter((a) => a.id !== article.id && a.category === article.category).slice(0, 3);
  return <HelpArticlePage article={article} related={related} />;
}
