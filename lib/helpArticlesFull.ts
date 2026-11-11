// The help articles with their extra sections and questions merged in.
// The site imports this; lib/helpArticles.ts stays the plain base list
// (also read by scripts/generate-*-seo-data.mjs).
import { HELP_ARTICLES as FR, HELP_ARTICLES_DE as DE, HELP_ARTICLES_IT as IT, type HelpArticle } from './helpArticles';
import { HELP_MORE_FR } from './helpArticlesMore.fr';
import { HELP_MORE_DE } from './helpArticlesMore.de';
import { HELP_MORE_IT } from './helpArticlesMore.it';
import type { HelpArticleMore } from './helpArticlesMore';

const merge = (list: HelpArticle[], more: Record<string, HelpArticleMore>): HelpArticle[] => list.map((a) => ({ ...a, ...more[a.id] }));

export const HELP_ARTICLES = merge(FR, HELP_MORE_FR);
export const HELP_ARTICLES_DE = merge(DE, HELP_MORE_DE);
export const HELP_ARTICLES_IT = merge(IT, HELP_MORE_IT);
export type { HelpArticle };
