import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { SITE, OG_IMAGE, ROUTES, alternatePathFor, jsonLdFor, localeAndBareOf } from './seo-routes.mjs';

const distDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const distIndex = path.join(distDir, 'index.html');

const FONT_LINKS = `
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" />
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

  let html = baseHtml.replace(/<html\s+lang="[^"]*"/, `<html lang="${routeLocale}"`);
  html = html.replace('<head>', `<head>${FONT_LINKS}${GTAG_SCRIPT}`);
  html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>${metaTags}`);
  return html;
}

const baseHtml = readFileSync(distIndex, 'utf8');

for (const route of ROUTES) {
  const html = patch(baseHtml, route);
  if (!route.path) {
    writeFileSync(distIndex, html);
    continue;
  }
  const dir = path.join(distDir, route.path);
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, 'index.html'), html);
}

console.log(`SEO meta tags injected: dist/index.html + ${ROUTES.length - 1} route(s).`);
