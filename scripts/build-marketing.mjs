// Builds the marketing-only static export that ships as cantia.ch — see
// app-marketing/README.md for why this directory/build exists. Completely
// separate from the normal `expo export` used for app.cantia.ch: different
// router root (EXPO_ROUTER_APP_ROOT), different web.output ("static" via
// app.config.js's MARKETING_BUILD switch, vs. the default "single"), and a
// different output directory (dist-marketing vs. dist), so this can never
// interfere with the app.cantia.ch build/deploy.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { SITE, OG_IMAGE, ROUTES, alternatePathFor, jsonLdFor } from './seo-routes.mjs';

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

// Under web.output "static", `expo export` already gives each route its own
// HTML file with real prerendered content — unlike scripts/inject-seo-meta.mjs
// (which clones one empty shell per route because "single" mode only ever
// produces dist/index.html). All that's left to patch per route here is the
// <head>: title/description/canonical/OG/Twitter/JSON-LD, same metadata
// source (scripts/seo-routes.mjs) as the app.cantia.ch fallback build so the
// two can never describe a page differently.
function findRouteFile(routePath) {
  const candidates = routePath
    ? [path.join(outputDir, routePath, 'index.html'), path.join(outputDir, `${routePath}.html`)]
    : [path.join(outputDir, 'index.html')];
  return candidates.find(existsSync) ?? null;
}

function patchHead(html, route) {
  const { path: routePath, title, description } = route;
  const isDe = routePath === 'de' || routePath.startsWith('de/');
  const locale = isDe ? 'de_CH' : 'fr_CH';
  const canonicalUrl = routePath ? `${SITE}/${routePath}` : `${SITE}/`;
  const frPath = alternatePathFor(routePath, 'fr');
  const dePath = alternatePathFor(routePath, 'de');
  const frUrl = frPath ? `${SITE}/${frPath}` : `${SITE}/`;
  const deUrl = `${SITE}/${dePath}`;
  const metaTags = `
    <meta name="google-site-verification" content="ICyYP8Ky3MHHG3HsDL3rbEYb6Vy_2yy95uHmnLI74Sw" />
    <meta name="description" content="${description}" />
    <meta name="theme-color" content="#1F3D3A" />
    <link rel="canonical" href="${canonicalUrl}" />
    <link rel="alternate" hreflang="fr-CH" href="${frUrl}" />
    <link rel="alternate" hreflang="de-CH" href="${deUrl}" />
    <link rel="alternate" hreflang="x-default" href="${frUrl}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Cantia" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${OG_IMAGE}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:locale" content="${locale}" />
    <meta property="og:locale:alternate" content="${isDe ? 'fr_CH' : 'de_CH'}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${OG_IMAGE}" />
    <script type="application/ld+json">${JSON.stringify(jsonLdFor(canonicalUrl, route))}</script>`;

  let patched = html.replace('<html lang="fr">', `<html lang="${isDe ? 'de' : 'fr'}">`);
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

console.log(`Marketing export ready: dist-marketing/ (${patchedCount}/${ROUTES.length} route(s) patched with SEO meta).`);
