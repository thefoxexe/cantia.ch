import { Text, View } from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';
import { Screen } from '../../components/ui';
import { BlogArticle } from '../../components/BlogArticle';
import { MarketingFooter, MarketingNav } from '../../components/MarketingChrome';
import { BLOG_POSTS, getPostBySlug } from '../../lib/blog';
import { colors, fontSize, spacing } from '../../lib/theme';
import { getAppLocale, useTranslation } from '../../lib/translations';

// Needed for the `app-marketing/` static export (web.output: "static") to
// know which /blog/<slug> pages to prerender — see app-marketing/blog/[slug].tsx,
// which re-exports this alongside this function. The app.cantia.ch build
// (web.output: "single") ignores this export entirely and just resolves the
// route client-side, so it costs nothing there.
export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export default function BlogPostScreen() {
  const { t } = useTranslation();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const post = getPostBySlug(typeof slug === 'string' ? slug : '', getAppLocale());

  if (!post) {
    return (
      <Screen>
        <MarketingNav />
        <View style={{ maxWidth: 480, alignSelf: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.xxxl, alignItems: 'center', gap: spacing.md }}>
          <Text style={{ fontSize: fontSize.xxl, fontWeight: '800', color: colors.text }}>{t('blogArticlePage.notFoundTitle')}</Text>
          <Text style={{ fontSize: fontSize.md, color: colors.textMuted, textAlign: 'center' }}>
            {t('blogArticlePage.notFoundText')}
          </Text>
          <Link href="/blog">
            <Text style={{ fontSize: fontSize.md, color: colors.primary, fontWeight: '700' }}>{t('blogArticlePage.backToBlog')}</Text>
          </Link>
        </View>
        <MarketingFooter />
      </Screen>
    );
  }

  return <BlogArticle post={post} />;
}
