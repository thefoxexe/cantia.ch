// Edge rules for the HTML pages served from this repository's main build.
//
// 1. One URL per page: "/tarifs/" answers 301 → "/tarifs" (the form used by
//    the canonicals, the sitemap and the hreflang). Netlify's redirect rules
//    can't do this themselves: the CDN treats "/tarifs" and "/tarifs/" as the
//    same path before [[redirects]] run, so a rule would loop. The query
//    string is kept. Root "/" and static files are left alone.
// 2. Phones get the phone render of the page. Every public page is
//    pre-rendered twice (scripts/build-phone-variants.mjs): at desktop width
//    (dist/<page>.html) and at phone width (dist/_m/<page>.html). A phone is
//    sent the phone file under the normal URL, so its first paint is already
//    laid out for its screen instead of waiting for JavaScript. Same text,
//    links and meta in both; "Vary: User-Agent" tells caches and crawlers the
//    HTML depends on the device (Google's "dynamic serving").
// 3. app.cantia.ch (the signed-in app, same build) is never indexed:
//    "X-Robots-Tag: noindex" on every page there, before any JavaScript runs.
//
// Only on the marketing hosts for 1 and 2: partners.cantia.ch and
// accounting.cantia.ch are built from this repository too, and they may rely
// on Netlify's own directory handling, which adds a slash; redirecting there
// could loop.
const HOSTS = new Set(['cantia.ch', 'www.cantia.ch']);
const APP_HOSTS = new Set(['app.cantia.ch']);
const PHONE_DIR = '/_m';

type Next = { next: () => Promise<Response> };

export function trailingSlashRedirect(requestUrl: string): string | null {
  const url = new URL(requestUrl);
  if (!HOSTS.has(url.hostname)) return null;
  if (url.pathname === '/' || !url.pathname.endsWith('/')) return null;
  url.pathname = url.pathname.replace(/\/+$/, '') || '/';
  return url.toString();
}

const PHONE_UA = /iPhone|iPod|Android.+Mobile|Mobile.+Firefox|Windows Phone|IEMobile|Opera Mini|BlackBerry|BB10/i;

export function isPhone(headers: Headers): boolean {
  if (headers.get('sec-ch-ua-mobile') === '?1') return true;
  return PHONE_UA.test(headers.get('user-agent') ?? '');
}

// "/" → "/_m/index.html", "/de/tarifs" → "/_m/de/tarifs.html"; null for
// anything that looks like a file (has an extension).
export function phonePath(pathname: string): string | null {
  if (/\.[a-z0-9]+$/i.test(pathname)) return null;
  const clean = pathname.replace(/\/+$/, '');
  return `${PHONE_DIR}${clean === '' ? '/index' : clean}.html`;
}

function withHeaders(res: Response, set: Record<string, string>, drop: string[] = []): Response {
  const headers = new Headers(res.headers);
  for (const h of drop) headers.delete(h);
  for (const [k, v] of Object.entries(set)) headers.set(k, v);
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
}

function isHtml(res: Response): boolean {
  return (res.headers.get('content-type') ?? '').includes('text/html');
}

export default async function handler(request: Request, context?: Next): Promise<Response | undefined> {
  if (request.method !== 'GET' && request.method !== 'HEAD') return undefined;
  const url = new URL(request.url);

  if (APP_HOSTS.has(url.hostname)) {
    if (!context) return undefined;
    const res = await context.next();
    return isHtml(res) ? withHeaders(res, { 'X-Robots-Tag': 'noindex, nofollow' }) : res;
  }
  if (!HOSTS.has(url.hostname)) return undefined;

  const target = trailingSlashRedirect(request.url);
  if (target) return new Response(null, { status: 301, headers: { Location: target, 'Cache-Control': 'public, max-age=3600' } });

  const variant = phonePath(url.pathname);
  if (!variant || !context) return undefined;

  if (isPhone(request.headers)) {
    const phone = await fetch(new URL(variant, url.origin), { method: request.method, redirect: 'manual' });
    if (phone.status === 200 && isHtml(phone)) {
      // The /_m/ files carry a noindex header for anyone opening them
      // directly (netlify.toml); under the real URL the page is indexable.
      // fetch() has already decoded the body: drop the encoding headers.
      return withHeaders(phone, { Vary: 'User-Agent' }, ['x-robots-tag', 'content-encoding', 'content-length']);
    }
    // No phone render for this URL (app route, 404…): the normal response.
  }
  const res = await context.next();
  return isHtml(res) ? withHeaders(res, { Vary: 'User-Agent' }) : res;
}

export const config = {
  path: '/*',
  excludedPath: ['/_expo/*', '/assets/*', '/ingest/*', '/api/*', '/downloads/*', '/_m/*'],
};
