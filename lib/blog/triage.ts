// Content triage of the blog (docs/seo-tri-contenu.md), in one data file
// shared with the build scripts (scripts/seo-routes.mjs, sitemap, Netlify
// redirects): which article addresses now redirect (merged articles, slugs
// renamed in German, untranslated articles), which stay reachable but out of
// Google (noindex), and the German slug of an article.
import TRIAGE from './triage.json';

export type BlogLocale = 'fr' | 'de' | 'it';

const REDIRECTS: Record<string, string> = TRIAGE.redirects;
const NOINDEX = new Set<string>(TRIAGE.noindex);
const DE_SLUGS: Record<string, string> = TRIAGE.deSlugs;
const PREFIX: Record<BlogLocale, string> = { fr: '', de: 'de/', it: 'it/' };

// Slug of an article in the address of a language (the French slug, except
// for the articles that have their own German one).
export function publicSlug(base: string, locale: BlogLocale): string {
  return locale === 'de' ? DE_SLUGS[base] ?? base : base;
}

export function blogRoute(base: string, locale: BlogLocale): string {
  return `${PREFIX[locale]}blog/${publicSlug(base, locale)}`;
}

// Merged into another page, or not translated: the address redirects and no
// page is generated for it.
export function isRetired(base: string, locale: BlogLocale): boolean {
  return blogRoute(base, locale) in REDIRECTS;
}

// Shown in the blog lists and the "see also" cards.
export function isListed(base: string, locale: BlogLocale): boolean {
  const route = blogRoute(base, locale);
  return !(route in REDIRECTS) && !NOINDEX.has(route);
}

// Where a link to an article in this language points now (following merges).
export function resolvedBlogRoute(base: string, locale: BlogLocale): string {
  const route = blogRoute(base, locale);
  return REDIRECTS[route] ?? route;
}

export function blogHref(base: string, locale: BlogLocale): string {
  return `/${resolvedBlogRoute(base, locale)}`;
}
