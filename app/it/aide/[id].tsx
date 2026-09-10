import { forceLocale } from '../../../lib/translations';
import { HELP_ARTICLES_IT } from '../../../lib/helpArticles';
import HelpArticleScreen from '../../aide/[id]';

forceLocale('it');

// Own generateStaticParams rather than re-exporting the FR route's: only the
// articles with an Italian translation should be prerendered under
// /it/aide/<id> — see lib/helpArticles.ts's HELP_ARTICLES_IT (empty until
// the Italian help-article translation pass runs; this route then falls
// back to rendering nothing statically until it's filled in, same staged
// pattern /de/aide/[id].tsx used before German reached parity).
export function generateStaticParams() {
  return HELP_ARTICLES_IT.map((a) => ({ id: a.id }));
}

export default HelpArticleScreen;
