import { forceLocale } from '../../../lib/translations';
import { HELP_ARTICLES_DE } from '../../../lib/helpArticles';
import HelpArticleScreen from '../../aide/[id]';

forceLocale('de');

// Own generateStaticParams rather than re-exporting the FR route's: only 12
// of the 27 FR help-article ids have a German translation so far (see
// lib/helpArticles.ts's HELP_ARTICLES_DE) — prerendering the other 15 under
// /de/aide/<id> would just prerender "article not found" pages in German.
export function generateStaticParams() {
  return HELP_ARTICLES_DE.map((a) => ({ id: a.id }));
}

export default HelpArticleScreen;
