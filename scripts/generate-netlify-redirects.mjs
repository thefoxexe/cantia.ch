// Regenerates the explicit per-route [[redirects]] in netlify.toml from the
// same ROUTES array that drives sitemap.xml and the SEO meta patches — see
// the comment in netlify.toml for why these explicit rules exist at all
// (Netlify's on-disk-file-before-SPA-fallback precedence was unreliable in
// practice here). Run manually after adding routes:
// `node scripts/generate-netlify-redirects.mjs`.
//
// Only the region between the "# BEGIN generated routes" and
// "# END generated routes" markers is rewritten. Everything else in
// netlify.toml (build command per surface, /api/health and calendar proxies,
// PostHog /ingest, security headers, blog splats, SPA fallback) is
// hand-maintained and kept as is. Blog articles are covered by splat rules,
// not one entry per article.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { BLOG_REDIRECTS, ROUTES } from './seo-routes.mjs';

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const tomlPath = path.join(rootDir, 'netlify.toml');

const BEGIN = '# BEGIN generated routes';
const END = '# END generated routes';

// The blog *index* pages ("blog", "de/blog", "it/blog") still need their own
// explicit rule — only individual articles are covered by the splat rules.
const nonBlog = ROUTES.filter(
  (r) => r.path && !r.path.startsWith('blog/') && !r.path.startsWith('de/blog/') && !r.path.startsWith('it/blog/')
);

const blocks = nonBlog
  .map((r) => `[[redirects]]\n  from = "/${r.path}"\n  to = "/${r.path}/index.html"\n  status = 200`)
  .join('\n\n');

// 301s of the blog content triage (lib/blog/triage.json).
const blogBlocks = Object.entries(BLOG_REDIRECTS)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([from, to]) => `[[redirects]]\n  from = "/${from}"\n  to = "/${to}"\n  status = 301\n  force = true`)
  .join('\n\n');

function replaceBetween(toml, begin, end, content) {
  const start = toml.indexOf(begin);
  const stop = toml.indexOf(end);
  if (start < 0 || stop < 0 || stop < start) {
    console.error(`netlify.toml: markers "${begin}" / "${end}" not found — nothing written.`);
    process.exit(1);
  }
  const beginLineEnd = toml.indexOf('\n', start) + 1;
  return toml.slice(0, beginLineEnd) + content + '\n' + toml.slice(stop);
}

let toml = readFileSync(tomlPath, 'utf8');
toml = replaceBetween(toml, BEGIN, END, blocks);
toml = replaceBetween(toml, '# BEGIN generated blog redirects', '# END generated blog redirects', blogBlocks);
writeFileSync(tomlPath, toml);
console.log(`netlify.toml: ${nonBlog.length} explicit route redirects and ${Object.keys(BLOG_REDIRECTS).length} blog redirects regenerated (rest of the file untouched).`);
