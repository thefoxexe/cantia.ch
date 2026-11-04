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

test('German slugs are unique and their articles exist', () => {
  const values = Object.values(TRIAGE.deSlugs);
  assert.equal(new Set(values).size, values.length);
  for (const [base, de] of Object.entries(TRIAGE.deSlugs)) {
    assert.ok(existsSync(new URL(`../lib/blog/posts-de/${base}.ts`, import.meta.url)), base);
    assert.ok(ROUTE_PATHS.has(`de/blog/${de}`), de);
    assert.equal(BLOG_REDIRECTS[`de/blog/${base}`], `de/blog/${de}`);
  }
});

test('every remaining article file has a page', () => {
  for (const [dir, prefix] of [['posts', 'blog/'], ['posts-it', 'it/blog/']]) {
    const files = readFileSync(new URL(`../lib/blog/index${dir === 'posts' ? '' : '-it'}.ts`, import.meta.url), 'utf8').match(/from '\.\/[a-z-]+\/([a-z0-9-]+)'/g) ?? [];
    for (const f of files) {
      const slug = f.match(/\/([a-z0-9-]+)'$/)[1];
      const path = prefix + slug;
      assert.ok(ROUTE_PATHS.has(path) || path in BLOG_REDIRECTS, `${path} has neither a page nor a redirect`);
    }
  }
});
