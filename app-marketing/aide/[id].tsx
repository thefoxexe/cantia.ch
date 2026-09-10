import { forceLocale } from '../../lib/translations';
import PageComponent, { generateStaticParams } from '../../app/aide/[id]';

forceLocale('fr');

export default PageComponent;
export { generateStaticParams };
