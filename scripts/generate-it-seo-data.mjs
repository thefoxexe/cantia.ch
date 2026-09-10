// One-off generator (re-run manually after adding/editing Italian blog posts,
// trade pages or help articles): transpiles the relevant .ts data files with
// the TypeScript compiler API (already a project dependency) and re-emits
// their SEO-relevant fields as a plain, dependency-free .mjs data file that
// scripts/seo-routes.mjs can statically import — the SEO build scripts run
// under plain `node`, with no ts-node/tsx loader, so they can never import
// .ts sources directly. Mirrors scripts/generate-de-seo-data.mjs exactly,
// one generator per non-French locale. Output is checked into the repo,
// same pattern as public/sitemap.xml: generated once, committed,
// regenerated on demand.
import { readFileSync, readdirSync, existsSync, writeFileSync } from 'node:fs';
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

// ---- Blog posts (posts-it/*.ts) — directory doesn't exist yet (Italian
// blog translation is a later phase); guard so this generator still runs
// cleanly in the meantime and just emits an empty array.
const postsItDir = path.join(rootDir, 'lib/blog/posts-it');
const blogRoutes = existsSync(postsItDir)
  ? readdirSync(postsItDir)
      .filter((f) => f.endsWith('.ts'))
      .map((f) => {
        const { post } = loadTsModule(path.join(postsItDir, f));
        return {
          path: `it/blog/${post.slug}`,
          title: `${post.title} | Cantia`,
          description: post.description,
          faq: (post.faq ?? []).map((item) => ({ q: item.question, a: item.answer })),
          publishedAt: post.publishedAt,
        };
      })
      .sort((a, b) => a.path.localeCompare(b.path))
  : [];

// ---- Help articles (lib/helpArticles.ts, HELP_ARTICLES_IT — empty until
// the Italian help-center translation phase fills it in) ----
function descriptionFrom(paragraphs) {
  const first = paragraphs[0] ?? '';
  if (first.length <= 155) return first;
  const cut = first.slice(0, 155);
  const lastSentenceEnd = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf(' — '));
  return lastSentenceEnd > 80 ? `${cut.slice(0, lastSentenceEnd + 1)}` : `${cut.slice(0, cut.lastIndexOf(' '))}…`;
}

const { HELP_ARTICLES_IT } = loadTsModule(path.join(rootDir, 'lib/helpArticles.ts'));
const helpRoutesIt = (HELP_ARTICLES_IT ?? []).map((a) => ({
  path: `it/aide/${a.id}`,
  title: `${a.title} | Centro assistenza Cantia`,
  description: descriptionFrom(a.body),
}));

// ---- Trade pages (tradeLandingPagesIt.ts) ----
const { TRADE_PAGES_IT } = loadTsModule(path.join(rootDir, 'lib/tradeLandingPagesIt.ts'));
const tradeRoutes = Object.values(TRADE_PAGES_IT).map((trade) => ({
  path: `it/${trade.slug}`,
  title: trade.seo.title,
  description: trade.seo.description,
  faq: (trade.faq ?? []).map((item) => ({ q: item.question, a: item.answer })),
}));

const out = `// GENERATED FILE — do not hand-edit.
// Regenerate with: node scripts/generate-it-seo-data.mjs
// Source: lib/blog/posts-it/*.ts (blog, empty until that phase),
// lib/tradeLandingPagesIt.ts (trades), and lib/helpArticles.ts (help center).
export const BLOG_SEO_IT = ${JSON.stringify(blogRoutes, null, 2)};

export const TRADE_SEO_IT = ${JSON.stringify(tradeRoutes, null, 2)};

export const HELP_SEO_IT = ${JSON.stringify(helpRoutesIt, null, 2)};
`;

writeFileSync(path.join(rootDir, 'scripts/it-seo-data.generated.mjs'), out);
console.log(
  `Generated ${blogRoutes.length} Italian blog routes, ${tradeRoutes.length} Italian trade routes, ${helpRoutesIt.length} Italian help-article routes.`,
);
