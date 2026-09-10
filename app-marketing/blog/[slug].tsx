import { forceLocale } from '../../lib/translations';
import PageComponent, { generateStaticParams } from '../../app/blog/[slug]';

forceLocale('fr');

export default PageComponent;
export { generateStaticParams };
