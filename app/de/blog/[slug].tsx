import { forceLocale } from '../../../lib/translations';
import BlogPostScreen, { generateStaticParams } from '../../blog/[slug]';

forceLocale('de');

export default BlogPostScreen;
export { generateStaticParams };
