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

// ---- Help articles (lib/helpArticles.ts, FR + DE in one file) ----
// description is derived from the first paragraph (truncated to a clean
// sentence boundary near 155 chars) since HelpArticle has no separate SEO
// description field of its own — the body itself is already written as
// plain, complete sentences, so the first one reads fine standalone.
function descriptionFrom(paragraphs) {
  const first = paragraphs[0] ?? '';
  if (first.length <= 155) return first;
  const cut = first.slice(0, 155);
  const lastSentenceEnd = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf(' — '));
  return lastSentenceEnd > 80 ? `${cut.slice(0, lastSentenceEnd + 1)}` : `${cut.slice(0, cut.lastIndexOf(' '))}…`;
}

const { HELP_ARTICLES, HELP_ARTICLES_DE } = loadTsModule(path.join(rootDir, 'lib/helpArticles.ts'));
const helpRoutesFr = HELP_ARTICLES.map((a) => ({
  path: `aide/${a.id}`,
  title: `${a.title} | Centre d'aide Cantia`,
  description: descriptionFrom(a.body),
}));
const helpRoutesDe = HELP_ARTICLES_DE.map((a) => ({
  path: `de/aide/${a.id}`,
  title: `${a.title} | Cantia Hilfe-Center`,
  description: descriptionFrom(a.body),
}));

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
// Source: lib/blog/posts-de/*.ts and lib/blog/posts/*.ts (blog),
// lib/tradeLandingPagesDe.ts (trades), and lib/helpArticles.ts (help center).
export const BLOG_SEO_DE = ${JSON.stringify(blogRoutes, null, 2)};

export const TRADE_SEO_DE = ${JSON.stringify(tradeRoutes, null, 2)};

export const BLOG_DATES_FR = ${JSON.stringify(blogDatesFr, null, 2)};

export const HELP_SEO_FR = ${JSON.stringify(helpRoutesFr, null, 2)};

export const HELP_SEO_DE = ${JSON.stringify(helpRoutesDe, null, 2)};
`;

writeFileSync(path.join(rootDir, 'scripts/de-seo-data.generated.mjs'), out);
console.log(
  `Generated ${blogRoutes.length} German blog routes, ${tradeRoutes.length} German trade routes, ${Object.keys(blogDatesFr).length} French blog dates, ${helpRoutesFr.length} FR + ${helpRoutesDe.length} DE help-article routes.`,
);
