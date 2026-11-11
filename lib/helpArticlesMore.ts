// Extra content for the help articles: sections with a heading and a few
// questions, kept apart from lib/helpArticles.ts so that file stays readable.
// Merged into HELP_ARTICLES* there, rendered by components/HelpArticlePage.tsx,
// and the questions become FAQPage JSON-LD (scripts/generate-de-seo-data.mjs).
export interface HelpArticleSection {
  title: string;
  paragraphs: string[];
}

export interface HelpArticleMore {
  sections?: HelpArticleSection[];
  faq?: { q: string; a: string }[];
}
