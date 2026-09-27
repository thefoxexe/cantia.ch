import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { SITE, OG_IMAGE, ROUTES, alternatePathFor, jsonLdFor, localeAndBareOf } from './seo-routes.mjs';

const distDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const distIndex = path.join(distDir, 'index.html');

const FONT_LINKS = `
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,62..125,100..900;1,62..125,100..900&family=Martian+Mono:wdth,wght@75..112.5,100..800&display=swap" />
    <style>html, body { background-color: #F7F1E6; overscroll-behavior-y: none; }</style>`;

// Google Ads base tag — the actual production build (web.output: "single" in
// app.json) never renders app/+html.tsx at all, only this script's patched
// output ends up in dist/, so that's where any site-wide <head> injection
// has to live, same as FONT_LINKS above. Needed on every route on both
// cantia.ch and app.cantia.ch (same static export) so a click landing on
// cantia.ch can be cross-domain-linked to a signup conversion firing on
// app.cantia.ch.
const GTAG_SCRIPT = `
    <script async src="https://www.googletagmanager.com/gtag/js?id=AW-18465996566"></script>
    <script>window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'AW-18465996566');</script>`;

const OG_LOCALES = { fr: 'fr_CH', de: 'de_CH', it: 'it_CH' };

function patch(baseHtml, route) {
  const { path: routePath, title, description } = route;
  const { locale: routeLocale } = localeAndBareOf(routePath);
  const locale = OG_LOCALES[routeLocale];
  const canonicalUrl = routePath ? `${SITE}/${routePath}` : `${SITE}/`;
  const frPath = alternatePathFor(routePath, 'fr');
  const dePath = alternatePathFor(routePath, 'de');
  const itPath = alternatePathFor(routePath, 'it');
  const frUrl = frPath ? `${SITE}/${frPath}` : `${SITE}/`;
  const deUrl = `${SITE}/${dePath}`;
  const itUrl = `${SITE}/${itPath}`;
  const alternateLocales = Object.entries(OG_LOCALES)
    .filter(([loc]) => loc !== routeLocale)
    .map(([, tag]) => `\n    <meta property="og:locale:alternate" content="${tag}" />`)
    .join('');
  const metaTags = `
    <meta name="google-site-verification" content="ICyYP8Ky3MHHG3HsDL3rbEYb6Vy_2yy95uHmnLI74Sw" />
    <meta name="description" content="${description}" />
    <meta name="theme-color" content="#1F3D3A" />
    <link rel="canonical" href="${canonicalUrl}" />
    <link rel="alternate" hreflang="fr-CH" href="${frUrl}" />
    <link rel="alternate" hreflang="de-CH" href="${deUrl}" />
    <link rel="alternate" hreflang="it-CH" href="${itUrl}" />
    <link rel="alternate" hreflang="x-default" href="${frUrl}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Cantia" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${OG_IMAGE}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:locale" content="${locale}" />${alternateLocales}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${OG_IMAGE}" />
    <script type="application/ld+json">${JSON.stringify(jsonLdFor(canonicalUrl, route))}</script>`;

  let html = stripHeadManagerTags(baseHtml).replace(HYDRATE_FLAG, '').replace(/<html\s+lang="[^"]*"/, `<html lang="${routeLocale}"`);
  html = html.replace('<head>', `<head><title>${title}</title>${metaTags}${headExtras(html)}`);
  return html;
}


// ─── Static output (app.json web.output "static") ───────────────────────────
// Every route is pre-rendered by Expo with its real content, so crawlers and
// AI tools that don't run JavaScript read the actual page text. This script
// then (1) replaces the per-page <head> tags expo-router/head produced with
// the canonical SEO set from scripts/seo-routes.mjs, and moves each page to
// dist/<route>/index.html (what netlify.toml's explicit rules point at), and
// (2) turns every non-marketing page (the signed-in app, auth screens,
// dynamic [id] templates) back into a plain client-rendered shell, exactly
// like the previous single-page build — those screens depend on a session
// and must never flash pre-rendered marketing or logged-out markup.

function stripHeadManagerTags(html) {
  return html
    .replace(/<title data-rh="true">[\s\S]*?<\/title>/g, '')
    .replace(/<meta data-rh="true"[^>]*\/?>/g, '')
    .replace(/<link data-rh="true"[^>]*\/?>/g, '')
    .replace(/<script data-rh="true"[^>]*>[\s\S]*?<\/script>/g, '');
}

// The pre-rendered markup is for crawlers and AI tools that don't run
// JavaScript. Real visitors get the same client render as before: the
// hydration flag is removed (so React replaces the markup instead of
// hydrating it — the layout depends on the real window width, which the
// build can't know) and #root stays hidden until React has rendered
// (app/_layout.tsx adds .hydrated), so nobody sees the desktop snapshot
// jump to a phone layout.
const HYDRATION_STYLE = `<style>html:not(.hydrated) #root{visibility:hidden}</style>`;
const HYDRATE_FLAG = /<script type="module">globalThis\.__EXPO_ROUTER_HYDRATE__=true;<\/script>/;

function headExtras(html) {
  let extras = '';
  if (!html.includes('fonts.googleapis.com/css2')) extras += FONT_LINKS;
  if (!html.includes('googletagmanager.com/gtag')) extras += GTAG_SCRIPT;
  if (!html.includes('html:not(.hydrated)')) extras += HYDRATION_STYLE;
  return extras;
}

function makeShell(html) {
  return stripHeadManagerTags(html)
    .replace(HYDRATE_FLAG, '')
    .replace(/(<div id="root">)[\s\S]*?(<\/div>)(\s*<script[^>]+src="\/_expo)/, '$1$2$3')
    .replace('<head>', `<head><title>Cantia</title>${headExtras(html)}`);
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (name === '_expo' || name === 'assets') continue;
    if (statSync(full).isDirectory()) walk(full, out);
    else if (name.endsWith('.html')) out.push(full);
  }
  return out;
}

function routeOf(file) {
  let rel = path.relative(distDir, file).replace(/\\/g, '/').replace(/\.html$/, '');
  if (rel === 'index') return '';
  if (rel.endsWith('/index')) rel = rel.slice(0, -'/index'.length);
  return rel;
}

const routesByPath = new Map(ROUTES.map((r) => [r.path, r]));
const homeHtml = readFileSync(distIndex, 'utf8');
if (!homeHtml.includes('__EXPO_ROUTER_HYDRATE__')) {
  throw new Error('inject-seo-meta: dist/index.html is not a static render — is app.json web.output still "static"?');
}
const shell = makeShell(homeHtml);
writeFileSync(path.join(distDir, 'app-shell.html'), shell);

const files = walk(distDir).filter((f) => path.basename(f) !== 'app-shell.html');
const rendered = new Map();
for (const file of files) {
  const route = routeOf(file);
  if (routesByPath.has(route) && !rendered.has(route)) rendered.set(route, readFileSync(file, 'utf8'));
}

let patched = 0;
let shelled = 0;
for (const file of files) {
  const route = routeOf(file);
  if (routesByPath.has(route)) {
    if (file.endsWith('.html') && !file.endsWith(`${path.sep}index.html`) && route !== '') rmSync(file);
    continue;
  }
  writeFileSync(file, shell);
  shelled++;
}

for (const route of ROUTES) {
  const source = rendered.get(route.path);
  const html = patch(source ?? shell, route);
  const target = route.path ? path.join(distDir, route.path, 'index.html') : distIndex;
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, html);
  if (!source) console.warn(`inject-seo-meta: no pre-rendered page for /${route.path}, served as a client-rendered shell.`);
  patched++;
}

console.log(`SEO meta injected into ${patched} pre-rendered page(s); ${shelled} app page(s) reset to the client-rendered shell.`);
