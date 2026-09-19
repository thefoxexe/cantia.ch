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

const postsFrDir = path.join(rootDir, 'lib/blog/posts');
const blogDatesFr = readdirSync(postsFrDir)
  .filter((f) => f.endsWith('.ts'))
  .map((f) => loadTsModule(path.join(postsFrDir, f)).post)
  .reduce((acc, post) => {
    acc[post.slug] = post.publishedAt;
    return acc;
  }, {});

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

const { TRADE_PAGES_DE } = loadTsModule(path.join(rootDir, 'lib/tradeLandingPagesDe.ts'));
const tradeRoutes = Object.values(TRADE_PAGES_DE).map((trade) => ({
  path: `de/${trade.slug}`,
  title: trade.seo.title,
  description: trade.seo.description,
  faq: (trade.faq ?? []).map((item) => ({ q: item.question, a: item.answer })),
}));

const out = `export const BLOG_SEO_DE = ${JSON.stringify(blogRoutes, null, 2)};

export const TRADE_SEO_DE = ${JSON.stringify(tradeRoutes, null, 2)};

export const BLOG_DATES_FR = ${JSON.stringify(blogDatesFr, null, 2)};

export const HELP_SEO_FR = ${JSON.stringify(helpRoutesFr, null, 2)};

export const HELP_SEO_DE = ${JSON.stringify(helpRoutesDe, null, 2)};
`;

writeFileSync(path.join(rootDir, 'scripts/de-seo-data.generated.mjs'), out);
console.log(
  `Generated ${blogRoutes.length} German blog routes, ${tradeRoutes.length} German trade routes, ${Object.keys(blogDatesFr).length} French blog dates, ${helpRoutesFr.length} FR + ${helpRoutesDe.length} DE help-article routes.`,
);
