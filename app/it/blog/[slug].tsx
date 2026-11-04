import { forceLocale } from '../../../lib/translations';
import BlogPostScreen from '../../blog/[slug]';
import { blogStaticParams } from '../../../lib/blog';

forceLocale('it');

export default BlogPostScreen;
export function generateStaticParams() {
  return blogStaticParams('it');
}
