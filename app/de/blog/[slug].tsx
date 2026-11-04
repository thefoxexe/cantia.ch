import { forceLocale } from '../../../lib/translations';
import BlogPostScreen from '../../blog/[slug]';
import { blogStaticParams } from '../../../lib/blog';

forceLocale('de');

export default BlogPostScreen;
export function generateStaticParams() {
  return blogStaticParams('de');
}
