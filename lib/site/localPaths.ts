// Pages whose German or Italian address is a word of that language, not the
// French path (SEO, November 2026). The old address redirects in 301
// (netlify.toml); links go straight to the new one through localHref, and
// scripts/inject-seo-meta.mjs rewrites any that remain in the built HTML.
export const LOCAL_PAGE_PATHS: Record<string, string> = {
  '/de/solutions/devis': '/de/offerte-erstellen',
  '/it/solutions/devis': '/it/creare-preventivo',
};

export function localHref(href: string): string {
  const [path, rest = ''] = href.split(/(?=[?#])/);
  const mapped = LOCAL_PAGE_PATHS[path];
  return mapped ? mapped + rest : href;
}
