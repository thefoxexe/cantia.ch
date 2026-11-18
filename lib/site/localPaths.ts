import TRADE_SLUGS from './tradeSlugs.json';

// Pages whose German or Italian address is a word of that language, not the
// French path (SEO, November 2026). The old address redirects in 301
// (netlify.toml); links go straight to the new one through localHref, and
// scripts/inject-seo-meta.mjs rewrites any that remain in the built HTML.
export const LOCAL_PAGE_PATHS: Record<string, string> = {
  '/de/solutions/devis': '/de/offerte-erstellen',
  '/it/solutions/devis': '/it/creare-preventivo',
  '/de/nouvelle-entreprise': '/de/neues-unternehmen',
  '/it/nouvelle-entreprise': '/it/nuova-impresa',
};

// Trade pages (lib/site/tradeSlugs.json): /de/electricien -> /de/elektroinstallateur.
for (const [locale, slugs] of Object.entries(TRADE_SLUGS as Record<string, Record<string, string>>)) {
  for (const [fr, local] of Object.entries(slugs)) LOCAL_PAGE_PATHS[`/${locale}/${fr}`] = `/${locale}/${local}`;
}

export function localHref(href: string): string {
  const [path, rest = ''] = href.split(/(?=[?#])/);
  const mapped = LOCAL_PAGE_PATHS[path];
  return mapped ? mapped + rest : href;
}

// The French address a localized page stands for: /de/offerte-erstellen
// becomes /de/solutions/devis (its prefix kept). Unchanged when not localized.
export function unlocalizedHref(path: string): string {
  for (const [from, to] of Object.entries(LOCAL_PAGE_PATHS)) if (to === path) return from;
  return path;
}
