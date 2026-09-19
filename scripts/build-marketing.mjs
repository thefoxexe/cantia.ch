import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { SITE, OG_IMAGE, ROUTES, alternatePathFor, jsonLdFor, localeAndBareOf } from './seo-routes.mjs';

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDir = path.join(rootDir, 'dist-marketing');

if (existsSync(outputDir)) rmSync(outputDir, { recursive: true, force: true });

console.log('Building marketing-only static export (app-marketing/ -> dist-marketing/)...');
execFileSync('npx', ['expo', 'export', '-p', 'web', '-c', '--output-dir', 'dist-marketing'], {
  cwd: rootDir,
  stdio: 'inherit',
  env: {
    ...process.env,
    EXPO_ROUTER_APP_ROOT: path.join(rootDir, 'app-marketing'),
    MARKETING_BUILD: '1',
  },
});

function findRouteFile(routePath) {
  const candidates = routePath
    ? [path.join(outputDir, routePath, 'index.html'), path.join(outputDir, `${routePath}.html`)]
    : [path.join(outputDir, 'index.html')];
  return candidates.find(existsSync) ?? null;
}

const OG_LOCALES = { fr: 'fr_CH', de: 'de_CH', it: 'it_CH' };

function patchHead(html, route) {
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

  let patched = html.replace(/<html\s+lang="[^"]*"/, `<html lang="${routeLocale}"`);
  patched = patched.replace('<head>', `<head>${metaTags}`);
  if (/<title>.*?<\/title>/.test(patched)) {
    patched = patched.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
  } else {
    patched = patched.replace('</head>', `<title>${title}</title></head>`);
  }
  return patched;
}

let patchedCount = 0;
for (const route of ROUTES) {
  const file = findRouteFile(route.path);
  if (!file) {
    console.warn(`  ! no prerendered file found for route "${route.path || '/'}" — skipping meta patch`);
    continue;
  }
  writeFileSync(file, patchHead(readFileSync(file, 'utf8'), route));
  patchedCount++;
}

const notFoundFile = path.join(outputDir, '+not-found.html');
if (existsSync(notFoundFile)) {
  writeFileSync(path.join(outputDir, '404.html'), readFileSync(notFoundFile, 'utf8'));
  console.log('404.html written from +not-found.html for Netlify\'s zero-config 404 fallback.');
} else {
  console.warn('  ! no +not-found.html found — Netlify has no custom 404 page for this build.');
}

console.log(`Marketing export ready: dist-marketing/ (${patchedCount}/${ROUTES.length} route(s) patched with SEO meta).`);
