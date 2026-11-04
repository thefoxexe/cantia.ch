// Regenerates public/sitemap.xml from the same ROUTES array that drives the
// two builds' SEO meta tags (scripts/seo-routes.mjs) — so a new /blog
// article only needs adding there once, instead of being hand-copied into
// a third place. Run manually after adding routes or changing a page: `node scripts/generate-sitemap.mjs`.
import { existsSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { SITE, ROUTES, blogBaseSlug, isNoindex, localeAndBareOf } from './seo-routes.mjs';

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

// <lastmod> is the date the page's own content last changed, read from git
// history (so this script needs the repo's history, and is run locally, not on
// Netlify). Commits tagged [dates] only realigned publication dates and are
// ignored. When no source file can be tied to a route, <lastmod> is left out
// rather than guessed.
// Site-wide cosmetic commits that touched every page without changing what it
// says (219d618: new visual identity, trial buttons renamed "14 jours").
const COSMETIC_COMMITS = ['219d618'];
const gitDateCache = new Map();
function lastContentChange(file) {
  if (gitDateCache.has(file)) return gitDateCache.get(file);
  let date = null;
  if (existsSync(path.join(rootDir, file))) {
    const lines = execFileSync('git', ['log', '--format=%H %cs', '--invert-grep', '--grep=\\[dates\\]', '--', file], { cwd: rootDir })
      .toString()
      .trim()
      .split('\n')
      .filter(Boolean);
    const hit = lines.find((line) => !COSMETIC_COMMITS.some((h) => line.startsWith(h)));
    date = hit ? hit.split(' ')[1] : null;
  }
  gitDateCache.set(file, date);
  return date;
}

const LOCALE_DIRS = { fr: '', de: 'de/', it: 'it/' };
const TRADE_DATA = { fr: 'lib/tradeLandingPages.ts', de: 'lib/tradeLandingPagesDe.ts', it: 'lib/tradeLandingPagesIt.ts' };
const BLOG_DIRS = { fr: 'lib/blog/posts', de: 'lib/blog/posts-de', it: 'lib/blog/posts-it' };

function sourceFilesFor(route) {
  const { locale, bare } = localeAndBareOf(route.path);
  if (bare.startsWith('blog/')) return [`${BLOG_DIRS[locale]}/${blogBaseSlug(locale, bare.slice('blog/'.length))}.ts`];
  if (bare.startsWith('aide/') && !['aide/videos', 'aide/ressources'].includes(bare)) return ['lib/helpArticles.ts'];
  const files = [];
  for (const loc of new Set([locale, 'fr'])) {
    const base = `app/${LOCALE_DIRS[loc]}${bare || 'index'}`;
    files.push(`${base}.tsx`, `${base}/index.tsx`);
  }
  if (TRADE_DATA[locale]) files.push(TRADE_DATA[locale]);
  return files;
}

function lastmodFor(route) {
  const { bare } = localeAndBareOf(route.path);
  let files = sourceFilesFor(route).filter((f) => existsSync(path.join(rootDir, f)));
  // Trade data only counts for trade pages (the file is listed for every
  // route above so the lookup stays in one place).
  if (!/^[a-z-]+$/.test(bare) || !existsSync(path.join(rootDir, `app/${bare}.tsx`)) || !isTradeFile(bare)) {
    files = files.filter((f) => !Object.values(TRADE_DATA).includes(f));
  }
  const dates = files.map(lastContentChange).filter(Boolean);
  if (route.publishedAt) dates.push(route.publishedAt);
  return dates.sort().pop() ?? null;
}

const tradeFileCache = new Map();
function isTradeFile(bare) {
  if (!tradeFileCache.has(bare)) {
    const src = execFileSync('cat', [path.join(rootDir, `app/${bare}.tsx`)]).toString();
    tradeFileCache.set(bare, src.includes('TradePage'));
  }
  return tradeFileCache.get(bare);
}

function priorityFor(routePath) {
  const { bare } = localeAndBareOf(routePath);
  if (bare === '') return '1.0';
  if (bare === 'tarifs' || bare === 'logiciel-chantier') return '0.8';
  if (bare.startsWith('solutions/')) return '0.7';
  if (bare === 'blog' || bare.startsWith('blog/')) return '0.6';
  return '0.4';
}

// Only indexable pages: noindex routes (e.g. /liens) are left out, and so is
// app.cantia.ch (the signed-in app, which is noindex).
const urls = ROUTES.filter((r) => !isNoindex(r.path)).map((r) => {
  const lastmod = lastmodFor(r);
  return `  <url>
    <loc>${SITE}/${r.path}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}
    <priority>${priorityFor(r.path)}</priority>
  </url>`;
});

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;

writeFileSync(path.join(rootDir, 'public/sitemap.xml'), xml);
console.log(`sitemap.xml regenerated with ${urls.length} URLs.`);
