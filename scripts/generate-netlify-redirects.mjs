// Regenerates the explicit per-route [[redirects]] block in netlify.toml
// from the same ROUTES array that drives sitemap.xml and the SEO meta
// patches — see the comment already in netlify.toml for why these explicit
// rules exist at all (Netlify's on-disk-file-before-SPA-fallback precedence
// was unreliable in practice here). Run manually after adding routes:
// `node scripts/generate-netlify-redirects.mjs`. Blog posts (FR and DE) are
// covered by two splat rules instead of one entry per article — same as
// before, just now also covering /de/blog/*.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { ROUTES } from './seo-routes.mjs';

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const tomlPath = path.join(rootDir, 'netlify.toml');

// The blog *index* pages ("blog", "de/blog") still need their own explicit
// rule — only individual articles ("blog/<slug>", "de/blog/<slug>") are
// covered by the splat rules below.
const nonBlog = ROUTES.filter((r) => r.path && !r.path.startsWith('blog/') && !r.path.startsWith('de/blog/'));

const blocks = nonBlog
  .map((r) => `[[redirects]]\n  from = "/${r.path}"\n  to = "/${r.path}/index.html"\n  status = 200`)
  .join('\n\n');

const header = `[build]
  command = "npx expo export -p web -c && node scripts/inject-seo-meta.mjs"
  publish = "dist"

[build.environment]
  NODE_VERSION = "22"

# Netlify is supposed to serve a matching on-disk file (including a nested
# index.html for a "pretty" directory-style path) before ever consulting the
# redirects below — but that precedence has been unreliable in practice here,
# and the blanket "/* -> /index.html" catch-all at the bottom was winning for
# every route, so every page served the *home* page's index.html and thus its
# <title>/meta tags (see scripts/inject-seo-meta.mjs, which generates a
# distinct dist/<route>/index.html per public page, one per entry in
# scripts/seo-routes.mjs — French and German alike). Listing every known
# route as its own explicit, higher-priority rule removes that ambiguity
# entirely: these are matched top-to-bottom, first match wins, so each one is
# served before the SPA catch-all ever gets a chance to apply. This block is
# generated — do not hand-edit it, run
# \`node scripts/generate-netlify-redirects.mjs\` after adding a route to
# scripts/seo-routes.mjs instead.

${blocks}

# Static screenshots under public/aide/*.png share the "/aide/" prefix with
# the dynamic /aide/[id] route above — without this explicit pass-through,
# a request for /aide/devis-creation.png falls through every /aide/<id>
# rule above (none of them match that literal string) and lands on the SPA
# catch-all at the bottom, which serves index.html instead of the actual
# image (same unreliable on-disk-file precedence this whole file works
# around). This forces the real file to be served regardless.
[[redirects]]
  from = "/aide/*.png"
  to = "/aide/:splat.png"
  status = 200

# Blog articles (French and German) are one dynamic route each
# ([slug].tsx, see app/blog/[slug].tsx and app/de/blog/[slug].tsx) rather
# than one file per article like the routes above, so a splat rule covers
# all of them instead of needing a new [[redirects]] entry per new post —
# adding an article only means a new file under lib/blog/posts/ (or
# posts-de/).
[[redirects]]
  from = "/blog/*"
  to = "/blog/:splat/index.html"
  status = 200

[[redirects]]
  from = "/de/blog/*"
  to = "/de/blog/:splat/index.html"
  status = 200

# SPA fallback for every other route (the actual app, auth screens, etc.) —
# stays last so none of the explicit rules above are shadowed by it.
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
`;

writeFileSync(tomlPath, header);
console.log(`netlify.toml regenerated with ${nonBlog.length} explicit route redirects + 2 blog splat rules.`);
