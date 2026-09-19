import { Text, View } from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';
import { Screen } from '../../components/ui';
import { BlogArticle } from '../../components/BlogArticle';
import { MarketingFooter, MarketingNav } from '../../components/MarketingChrome';
import { BLOG_POSTS, getPostBySlug } from '../../lib/blog';
import { colors, fontSize, spacing } from '../../lib/theme';
import { getAppLocale, useTranslation } from '../../lib/translations';

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export default function BlogPostScreen() {
  const { t } = useTranslation();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const locale = getAppLocale();
  const post = getPostBySlug(typeof slug === 'string' ? slug : '', locale);

  if (!post) {
    return (
      <Screen>
        <MarketingNav />
        <View style={{ maxWidth: 480, alignSelf: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.xxxl, alignItems: 'center', gap: spacing.md }}>
          <Text style={{ fontSize: fontSize.xxl, fontWeight: '800', color: colors.text }}>{t('blogArticlePage.notFoundTitle')}</Text>
          <Text style={{ fontSize: fontSize.md, color: colors.textMuted, textAlign: 'center' }}>
            {t('blogArticlePage.notFoundText')}
          </Text>
          <Link href={(locale === 'de' ? '/de/blog' : locale === 'it' ? '/it/blog' : '/blog') as any}>
            <Text style={{ fontSize: fontSize.md, color: colors.primary, fontWeight: '700' }}>{t('blogArticlePage.backToBlog')}</Text>
          </Link>
        </View>
        <MarketingFooter />
      </Screen>
    );
  }

  return <BlogArticle post={post} />;
}
