// web.output is "single" (a plain client-rendered SPA export), so Expo
// Router's app/+html.tsx convention — the normal place for per-project
// <head> customization — is silently ignored; it only applies under
// web.output "static". Switching the whole app to "static" pre-rendering
// just to get SEO tags is a much bigger, riskier change than this file
// warrants, so instead this runs once after `expo export` and patches the
// meta tags straight into the already-built dist/index.html. Static text
// injection like this is also what actually matters here: social-media
// link-preview crawlers (Facebook/Twitter/LinkedIn/WhatsApp/Slack) read the
// raw HTML and do not execute JavaScript, so client-side-injected <meta>
// tags would never be seen by them — only build-time-injected ones work.
//
// `single` mode means `expo export` only ever produces one dist/index.html
// for every route — every public page (solutions/*, /telechargement, legal
// pages) was shipping that exact same file, same <title>, same
// <link rel="canonical" href="https://cantia.ch/">. That canonical tag is
// the actual bug: it told search engines every one of those pages is a
// duplicate of the homepage, which is a direct signal to drop them from the
// index rather than rank them. The asset paths in the exported HTML are
// absolute (`/_expo/...`, verified against a real `expo export` output), so
// a copy of index.html works unmodified from any nested directory — Expo
// Router hydrates client-side off `window.location.pathname` regardless of
// which physical file served it. So: clone index.html once per public
// route below and patch each clone's own title/description/canonical/JSON-LD.
// Netlify (see netlify.toml) serves a matching static file before falling
// back to its SPA catch-all redirect, so dist/solutions/devis/index.html
// answers GET /solutions/devis directly.
//
// This is the "single" CSR build that still ships app.cantia.ch, and
// cantia.ch until its DNS points at the separate marketing build (see
// scripts/build-marketing.mjs). Once that cutover happens this script's
// dist/ output is only ever served under app.cantia.ch, where every public
// page is noindex'd anyway — kept for now as the fallback while that
// migration is rolled out domain by domain.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { SITE, OG_IMAGE, ROUTES, alternatePathFor, jsonLdFor } from './seo-routes.mjs';

const distDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const distIndex = path.join(distDir, 'index.html');

// Same `web.output: "single"` problem as the SEO tags above: app/+html.tsx's
// <link> tags for the marketing typefaces (Fraunces/Instrument Sans, see
// lib/marketingTheme.ts) never reach the exported HTML either — only visible
// via `expo start --web`, never on the actual cantia.ch build. Injected here
// for the same reason the meta tags are.
// Also carries a body background matching lib/theme.ts colors.bg (#F7F1E6)
// — without it, the raw white html/body shows through for an instant
// during the mobile overscroll bounce at the top of the page, which reads
// as a stray gap under the (deliberately transparent) marketing navbar.
const FONT_LINKS = `
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" />
    <style>html, body { background-color: #F7F1E6; overscroll-behavior-y: none; }</style>`;

function patch(baseHtml, route) {
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

  let html = baseHtml.replace('<html lang="en">', `<html lang="${isDe ? 'de' : 'fr'}">`);
  html = html.replace('<head>', `<head>${FONT_LINKS}`);
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
