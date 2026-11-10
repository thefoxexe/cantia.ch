import { Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SitePage } from '../../components/site/Sections';
import { Btn, Headline, Wrap } from '../../components/site/Primitives';
import { sans, site } from '../../lib/siteTheme';
import { BlogArticle } from '../../components/BlogArticle';
import { blogStaticParams, getPostBySlug } from '../../lib/blog';
import { getAppLocale, useTranslation } from '../../lib/translations';

export function generateStaticParams() {
  return blogStaticParams('fr');
}

export default function BlogPostScreen() {
  const { t } = useTranslation();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const locale = getAppLocale();
  const post = getPostBySlug(typeof slug === 'string' ? slug : '', locale);

  if (!post) {
    return (
      <SitePage title={`${t('blogArticlePage.notFoundTitle')} | Cantia`} cta={false}>
        <View style={{ paddingVertical: 110 }}>
          <Wrap>
            <Headline level={1} plain={t('blogArticlePage.notFoundTitle')} size={44} />
            <Text style={[sans, { fontSize: 14, color: site.muted, marginTop: 14 }]}>{t('blogArticlePage.notFoundText')}</Text>
            <View style={{ marginTop: 24, alignSelf: 'flex-start' }}>
              <Btn label={t('blogArticlePage.backToBlog')} href={locale === 'de' ? '/de/blog' : locale === 'it' ? '/it/blog' : '/blog'} />
            </View>
          </Wrap>
        </View>
      </SitePage>
    );
  }

  return <BlogArticle post={post} />;
}
