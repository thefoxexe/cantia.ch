import { forceLocale } from '../../../lib/translations';
import BlogPostScreen, { generateStaticParams } from '../../blog/[slug]';

forceLocale('it');

export default BlogPostScreen;
export { generateStaticParams };
