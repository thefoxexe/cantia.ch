// Blog content triage (lib/blog/triage.json): every redirect lands on a real,
// indexable page in one hop, and no page is both redirected and generated.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { BLOG_REDIRECTS, ROUTES, isNoindex } from './seo-routes.mjs';

const TRIAGE = JSON.parse(readFileSync(new URL('../lib/blog/triage.json', import.meta.url), 'utf8'));
const ROUTE_PATHS = new Set(ROUTES.map((r) => r.path));
// Pages kept out of Google on purpose that an untranslated address may still
// lead to (the French version of an off-topic article).
const OFF_TOPIC_TARGETS = new Set(TRIAGE.noindex);

test('every redirect lands on an existing route, in one hop', () => {
  for (const [from, to] of Object.entries(BLOG_REDIRECTS)) {
    assert.ok(ROUTE_PATHS.has(to), `/${from} -> /${to}: no such page`);
    assert.ok(!(to in BLOG_REDIRECTS), `/${from} -> /${to}: chain`);
    assert.notEqual(from, to);
  }
});

test('merged articles land on indexed pages', () => {
  for (const [from, to] of Object.entries(BLOG_REDIRECTS)) {
    if (isNoindex(to)) assert.ok(OFF_TOPIC_TARGETS.has(to), `/${from} -> /${to} is noindex`);
  }
});

test('a redirected address is never a route', () => {
  for (const from of Object.keys(BLOG_REDIRECTS)) assert.ok(!ROUTE_PATHS.has(from), `/${from} is redirected and generated`);
});

for (const [locale, key] of [['de', 'deSlugs'], ['it', 'itSlugs']]) {
  test(`${locale} slugs are unique, their articles exist, the French-slug address redirects`, () => {
    const map = TRIAGE[key];
    const values = Object.values(map);
    assert.equal(new Set(values).size, values.length);
    for (const [base, slug] of Object.entries(map)) {
      assert.ok(existsSync(new URL(`../lib/blog/posts-${locale}/${base}.ts`, import.meta.url)), base);
      // The article has its page, unless it was merged into a product page
      // (then both of its addresses lead there).
      const local = `${locale}/blog/${slug}`;
      const merged = BLOG_REDIRECTS[local];
      assert.ok(ROUTE_PATHS.has(local) || merged, slug);
      assert.equal(BLOG_REDIRECTS[`${locale}/blog/${base}`], merged ?? local);
    }
  });
}

test('every German and Italian article has a slug in its language', () => {
  for (const [locale, key] of [['de', 'deSlugs'], ['it', 'itSlugs']]) {
    const index = readFileSync(new URL(`../lib/blog/index-${locale}.ts`, import.meta.url), 'utf8');
    for (const m of index.matchAll(/posts-\w\w\/([a-z0-9-]+)/g)) {
      const route = `${locale}/blog/${m[1]}`;
      assert.ok(TRIAGE[key][m[1]] || (route in BLOG_REDIRECTS && !BLOG_REDIRECTS[route].startsWith(`${locale}/blog/${m[1]}`)), `${route}: French slug`);
    }
  }
});

test('every remaining article file has a page', () => {
  for (const [dir, prefix] of [['posts', 'blog/'], ['posts-it', 'it/blog/']]) {
    const files = readFileSync(new URL(`../lib/blog/index${dir === 'posts' ? '' : '-it'}.ts`, import.meta.url), 'utf8').match(/from '\.\/[a-z-]+\/([a-z0-9-]+)'/g) ?? [];
    for (const f of files) {
      const slug = f.match(/\/([a-z0-9-]+)'$/)[1];
      const path = prefix + slug;
      const local = prefix === 'it/blog/' && TRIAGE.itSlugs[slug] ? prefix + TRIAGE.itSlugs[slug] : path;
      assert.ok(ROUTE_PATHS.has(local) || path in BLOG_REDIRECTS, `${path} has neither a page nor a redirect`);
    }
  }
});
