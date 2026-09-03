// One-off generator (re-run manually after adding/editing German blog posts
// or trade pages): transpiles the relevant .ts data files with the
// TypeScript compiler API (already a project dependency) and re-emits their
// SEO-relevant fields as a plain, dependency-free .mjs data file that
// scripts/seo-routes.mjs can statically import — the SEO build scripts run
// under plain `node`, with no ts-node/tsx loader, so they can never import
// .ts sources directly. Output is checked into the repo, same pattern as
// public/sitemap.xml: generated once, committed, regenerated on demand.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import ts from 'typescript';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

function loadTsModule(absPath) {
  const source = readFileSync(absPath, 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const mod = { exports: {} };
  const fn = new Function('exports', 'require', 'module', '__filename', '__dirname', outputText);
  fn(mod.exports, require, mod, absPath, path.dirname(absPath));
  return mod.exports;
}

// ---- Blog posts (posts-de/*.ts) ----
const postsDeDir = path.join(rootDir, 'lib/blog/posts-de');
const blogFiles = readdirSync(postsDeDir).filter((f) => f.endsWith('.ts'));
const blogRoutes = blogFiles
  .map((f) => {
    const { post } = loadTsModule(path.join(postsDeDir, f));
    return {
      path: `de/blog/${post.slug}`,
      title: `${post.title} | Cantia`,
      description: post.description,
      faq: (post.faq ?? []).map((item) => ({ q: item.question, a: item.answer })),
      publishedAt: post.publishedAt,
    };
  })
  .sort((a, b) => a.path.localeCompare(b.path));

// ---- French blog dates (posts/*.ts) — seo-routes.mjs already hand-authors
// FR blog title/description/faq (it predates this generator), but has no
// publishedAt of its own; this fills that one gap so Article JSON-LD can
// carry a real datePublished on the French blog too, without duplicating
// the 138 already-curated title/description pairs.
const postsFrDir = path.join(rootDir, 'lib/blog/posts');
const blogDatesFr = readdirSync(postsFrDir)
  .filter((f) => f.endsWith('.ts'))
  .map((f) => loadTsModule(path.join(postsFrDir, f)).post)
  .reduce((acc, post) => {
    acc[post.slug] = post.publishedAt;
    return acc;
  }, {});

// ---- Trade pages (tradeLandingPagesDe.ts) ----
const { TRADE_PAGES_DE } = loadTsModule(path.join(rootDir, 'lib/tradeLandingPagesDe.ts'));
const tradeRoutes = Object.values(TRADE_PAGES_DE).map((trade) => ({
  path: `de/${trade.slug}`,
  title: trade.seo.title,
  description: trade.seo.description,
  faq: (trade.faq ?? []).map((item) => ({ q: item.question, a: item.answer })),
}));

const out = `// GENERATED FILE — do not hand-edit.
// Regenerate with: node scripts/generate-de-seo-data.mjs
// Source: lib/blog/posts-de/*.ts and lib/blog/posts/*.ts (blog) and
// lib/tradeLandingPagesDe.ts (trades).
export const BLOG_SEO_DE = ${JSON.stringify(blogRoutes, null, 2)};

export const TRADE_SEO_DE = ${JSON.stringify(tradeRoutes, null, 2)};

export const BLOG_DATES_FR = ${JSON.stringify(blogDatesFr, null, 2)};
`;

writeFileSync(path.join(rootDir, 'scripts/de-seo-data.generated.mjs'), out);
console.log(
  `Generated ${blogRoutes.length} German blog routes, ${tradeRoutes.length} German trade routes, ${Object.keys(blogDatesFr).length} French blog dates.`,
);
