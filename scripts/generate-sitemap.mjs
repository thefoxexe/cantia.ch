// Regenerates public/sitemap.xml from the same ROUTES array that drives the
// two builds' SEO meta tags (scripts/seo-routes.mjs) — so a new /blog
// article only needs adding there once, instead of being hand-copied into
// a third place. Run manually after adding routes: `node scripts/generate-sitemap.mjs`.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { SITE, ROUTES } from './seo-routes.mjs';

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const today = new Date().toISOString().slice(0, 10);

function priorityFor(routePath) {
  if (routePath === '') return '1.0';
  if (routePath.startsWith('solutions/')) return '0.7';
  if (routePath === 'blog') return '0.6';
  if (routePath.startsWith('blog/')) return '0.6';
  if (routePath === 'telechargement') return '0.4';
  return '0.2';
}

function changefreqFor(routePath) {
  if (routePath === '') return 'weekly';
  if (routePath.startsWith('blog')) return 'weekly';
  if (routePath === 'mentions-legales' || routePath === 'confidentialite') return 'yearly';
  return 'monthly';
}

const urls = ROUTES.map(
  (r) => `  <url>
    <loc>${SITE}/${r.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreqFor(r.path)}</changefreq>
    <priority>${priorityFor(r.path)}</priority>
  </url>`
);

// app.cantia.ch isn't part of the marketing ROUTES array (different
// subdomain/build entirely), but its login page is worth keeping indexed —
// kept as a manual addition, same as the hand-maintained file before this
// script existed.
urls.push(`  <url>
    <loc>https://app.cantia.ch/login</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`);

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;

writeFileSync(path.join(rootDir, 'public/sitemap.xml'), xml);
console.log(`sitemap.xml regenerated with ${urls.length} URLs.`);
