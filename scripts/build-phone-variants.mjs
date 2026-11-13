// Phone versions of the pre-rendered public pages.
//
// The main export (dist/) renders every page at desktop width (1440 px). A
// phone cannot show that HTML as it is: it is wider than the screen, so the
// page used to stay hidden until JavaScript had re-laid it out, and the
// largest text only appeared seconds later (slow LCP on mobile).
//
// The build therefore renders the site a second time at phone width
// (CANTIA_SSR_VIEWPORT=phone, into dist-phone/). This script takes each
// finished desktop page in dist/ (title, meta, hreflang, JSON-LD already
// injected) and writes dist/_m/<route>.html: the same page with the phone
// markup and the phone stylesheet in place of the desktop ones, and
// <html data-ssr-viewport="phone">. The edge function
// (netlify/edge-functions/trailing-slash.ts) serves that file to phones under
// the normal URL; lib/hydrationViewport.ts hydrates it at phone width.
//
// Run after inject-seo-meta.mjs and inject-static-content.mjs.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { ROUTES } from './seo-routes.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(root, 'dist');
const phoneDir = path.join(root, 'dist-phone');

const SHEET_RE = /<style id="react-native-stylesheet">[\s\S]*?<\/style>/;

export function rootMarkup(html) {
  const start = html.indexOf('<div id="root">');
  if (start < 0) return null;
  // The root div closes right before the first bundle <script> after it.
  const m = /<\/div>\s*<script[^>]+src="\/_expo/.exec(html.slice(start));
  if (!m) return null;
  return html.slice(start, start + m.index + '</div>'.length);
}

export function phoneVariant(desktopHtml, phoneHtml) {
  const desktopRoot = rootMarkup(desktopHtml);
  const phoneRoot = rootMarkup(phoneHtml);
  const phoneSheet = (phoneHtml.match(SHEET_RE) || [])[0];
  if (!desktopRoot || !phoneRoot || !phoneSheet || !SHEET_RE.test(desktopHtml)) return null;
  return desktopHtml
    .replace(desktopRoot, () => phoneRoot)
    .replace(SHEET_RE, () => phoneSheet)
    .replace(/<html([^>]*?) data-ssr-viewport="desktop"/, '<html$1 data-ssr-viewport="phone"');
}

function source(dir, route) {
  const candidates = route ? [`${route}.html`, `${route}/index.html`] : ['index.html'];
  for (const c of candidates) {
    const f = path.join(dir, c);
    if (existsSync(f)) return f;
  }
  return null;
}

function main() {
  if (!existsSync(phoneDir)) throw new Error('build-phone-variants: dist-phone/ is missing (run the phone export first).');
  let written = 0;
  const skipped = [];
  for (const route of ROUTES) {
    const desktopFile = route.path ? path.join(distDir, `${route.path}.html`) : path.join(distDir, 'index.html');
    const phoneFile = source(phoneDir, route.path);
    if (!existsSync(desktopFile) || !phoneFile) {
      skipped.push(route.path || '/');
      continue;
    }
    const desktop = readFileSync(desktopFile, 'utf8');
    if (!desktop.includes('data-ssr-viewport="desktop"')) {
      skipped.push(route.path || '/');
      continue;
    }
    const html = phoneVariant(desktop, readFileSync(phoneFile, 'utf8'));
    if (!html) {
      skipped.push(route.path || '/');
      continue;
    }
    const target = path.join(distDir, '_m', route.path ? `${route.path}.html` : 'index.html');
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, html);
    written++;
  }
  console.log(`Phone variants written: ${written} page(s) in dist/_m/${skipped.length ? `; no phone version for ${skipped.length}: ${skipped.slice(0, 10).join(', ')}` : ''}.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
