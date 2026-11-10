import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { SITE, OG_IMAGE, ROUTES, hreflangAlternates, isNoindex, jsonLdFor, localeAndBareOf } from './seo-routes.mjs';

const distDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const distIndex = path.join(distDir, 'index.html');

const FONT_LINKS = `
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400..700;1,9..40,400..700&family=DM+Serif+Display:ital@0;1&family=Archivo:ital,wdth,wght@0,62..125,100..900;1,62..125,100..900&family=Martian+Mono:wdth,wght@75..112.5,100..800&display=swap" />
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
      var cantiaConsent = /(?:^|; )cantia_cookie_consent=accepted/.test(document.cookie) ? 'granted' : 'denied';
      gtag('consent', 'default', { ad_storage: cantiaConsent, ad_user_data: cantiaConsent, ad_personalization: cantiaConsent, analytics_storage: cantiaConsent });
      gtag('js', new Date());
      gtag('config', 'AW-18465996566');
      if (cantiaConsent === 'granted') gtag('config', 'G-1K03L5TNDX');</script>`;

const OG_LOCALES = { fr: 'fr_CH', de: 'de_CH', it: 'it_CH' };
const HREFLANG_TAGS = { fr: 'fr-CH', de: 'de-CH', it: 'it-CH' };

// FAQPage structured data may only list questions the visitor can read on the
// page (Google's rule), so every FAQ entry whose question isn't in the
// rendered text is dropped. Pages served as the client shell (no rendered
// text) get no FAQPage at all.
function visibleText(html) {
  const root = html.indexOf('<div id="root">');
  return (root >= 0 ? html.slice(root) : '')
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ');
}
function normalize(text) {
  return text
    .replace(/&#x27;|&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;|&#xa0;|\u00a0|\u202f/gi, ' ')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}
export function visibleFaq(html, faq) {
  if (!faq?.length) return faq;
  const text = normalize(visibleText(html));
  return faq.filter((item) => text.includes(normalize(item.q)));
}

function escapeHtml(text) {
  return String(text).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

let faqDropped = 0;
function patch(baseHtml, sourceRoute) {
  const route = { ...sourceRoute, faq: visibleFaq(baseHtml, sourceRoute.faq) };
  faqDropped += (sourceRoute.faq?.length ?? 0) - (route.faq?.length ?? 0);
  const { path: routePath } = route;
  // Escaped once here: a raw " in a description used to end the content=""
  // attribute early, so Google only read its first words.
  const title = escapeHtml(route.title);
  const description = escapeHtml(route.description);
  const { locale: routeLocale } = localeAndBareOf(routePath);
  const locale = OG_LOCALES[routeLocale];
  const canonicalUrl = routePath ? `${SITE}/${routePath}` : `${SITE}/`;
  const alternates = hreflangAlternates(routePath);
  const frAlternate = alternates.find((a) => a.locale === 'fr');
  const hreflangTags = alternates
    .map((a) => `\n    <link rel="alternate" hreflang="${HREFLANG_TAGS[a.locale]}" href="${a.url}" />`)
    .join('') + (frAlternate ? `\n    <link rel="alternate" hreflang="x-default" href="${frAlternate.url}" />` : '');
  const alternateLocales = alternates
    .filter((a) => a.locale !== routeLocale)
    .map((a) => `\n    <meta property="og:locale:alternate" content="${OG_LOCALES[a.locale]}" />`)
    .join('');
  const robotsTag = isNoindex(routePath) ? '\n    <meta name="robots" content="noindex, follow" />' : '';
  const metaTags = `
    <meta name="google-site-verification" content="ICyYP8Ky3MHHG3HsDL3rbEYb6Vy_2yy95uHmnLI74Sw" />
    <meta name="description" content="${description}" />${robotsTag}
    <meta name="theme-color" content="#1F3D3A" />
    <link rel="canonical" href="${canonicalUrl}" />${hreflangTags}
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
    <script type="application/ld+json">${JSON.stringify(jsonLdFor(canonicalUrl, route)).replace(/</g, '\\u003c')}</script>`;

  let html = stripHeadManagerTags(baseHtml).replace(HYDRATE_FLAG, '').replace(/<html\s+lang="[^"]*"/, `<html lang="${routeLocale}"`);
  html = html.replace('<head>', `<head><title>${title}</title>${metaTags}${headExtras(html)}`);
  return html;
}


// ─── Static output (app.json web.output "static") ───────────────────────────
// Every route is pre-rendered by Expo with its real content, so crawlers and
// AI tools that don't run JavaScript read the actual page text. This script
// then (1) replaces the per-page <head> tags expo-router/head produced with
// the canonical SEO set from scripts/seo-routes.mjs, and moves each page to
// dist/<route>.html (what netlify.toml's explicit rules point at), and
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
// While #root is hidden, a slow load (more than 0.4 s: a phone on 4G, a
// cold cache) shows the logo in the middle of the page instead of an empty
// background; a fast one never sees it.
const HYDRATION_STYLE = `<style>html:not(.hydrated) #root{visibility:hidden}html:not(.hydrated) body::before{content:"";position:fixed;inset:0;margin:auto;width:150px;height:28px;background:url(/logo-email.png) center/contain no-repeat;opacity:0;animation:cantia-wait .5s ease .4s forwards}@keyframes cantia-wait{from{opacity:0}50%{opacity:.85}to{opacity:.85}}html.hydrated body::before{content:none}</style>`;
const HYDRATE_FLAG = /<script type="module">globalThis\.__EXPO_ROUTER_HYDRATE__=true;<\/script>/;

function headExtras(html) {
  let extras = '';
  if (!html.includes('/fonts/dm-sans-latin.woff2') && !html.includes('fonts.googleapis.com/css2')) extras += FONT_LINKS;
  if (!html.includes('googletagmanager.com/gtag')) extras += GTAG_SCRIPT;
  if (!html.includes('html:not(.hydrated)')) extras += HYDRATION_STYLE;
  return extras;
}

function makeShell(html) {
  return stripHeadManagerTags(html)
    .replace(HYDRATE_FLAG, '')
    .replace(/(<div id="root">)[\s\S]*?(<\/div>)(\s*<script[^>]+src="\/_expo)/, '$1$2$3')
    .replace('<head>', `<head><title>Cantia</title>\n    <meta name="robots" content="noindex" />${headExtras(html)}`);
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

// One flat file per page (dist/tarifs.html, dist/de/blog/x.html), never a
// folder with an index.html: for a folder, Netlify answers /tarifs with a 301
// to /tarifs/, and the edge function (netlify/edge-functions/trailing-slash.ts)
// sends /tarifs/ back to /tarifs, an endless loop.
function pageFile(route) {
  return route ? path.join(distDir, `${route}.html`) : distIndex;
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
    if (route !== '' && file !== pageFile(route)) rmSync(file);
    continue;
  }
  // Same flat layout for the app's own screens (dist/devis/index.html ->
  // dist/devis.html), so none of them can fall into the slash loop either.
  const flat = file.endsWith(`${path.sep}index.html`) && route !== '' ? pageFile(route) : file;
  if (flat !== file) rmSync(file);
  writeFileSync(flat, shell);
  shelled++;
}

for (const route of ROUTES) {
  const source = rendered.get(route.path);
  const html = patch(source ?? shell, route);
  const target = pageFile(route.path);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, html);
  if (!source) console.warn(`inject-seo-meta: no pre-rendered page for /${route.path}, served as a client-rendered shell.`);
  patched++;
}

console.log(`SEO meta injected into ${patched} pre-rendered page(s); ${shelled} app page(s) reset to the client-rendered shell; ${faqDropped} FAQ question(s) left out of FAQPage (not visible on their page).`);
