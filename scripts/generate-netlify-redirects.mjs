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
import { ROUTES } from './seo-routes.mjs';

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

const toml = readFileSync(tomlPath, 'utf8');
const start = toml.indexOf(BEGIN);
const end = toml.indexOf(END);
if (start < 0 || end < 0 || end < start) {
  console.error(`netlify.toml: markers "${BEGIN}" / "${END}" not found — nothing written.`);
  process.exit(1);
}
const beginLineEnd = toml.indexOf('\n', start) + 1;
writeFileSync(tomlPath, toml.slice(0, beginLineEnd) + blocks + '\n' + toml.slice(end));
console.log(`netlify.toml: ${nonBlog.length} explicit route redirects regenerated (rest of the file untouched).`);
