// One URL per page: "/tarifs/" answers 301 → "/tarifs" (the form used by the
// canonicals, the sitemap and the hreflang). Netlify's redirect rules can't do
// this themselves: the CDN treats "/tarifs" and "/tarifs/" as the same path
// before [[redirects]] run, so a rule would loop. The query string is kept.
// Root "/" and static files are left alone.
// Only on the marketing site: partners.cantia.ch and accounting.cantia.ch are
// built from this repository too, and they may rely on Netlify's own
// directory handling, which adds a slash; redirecting there could loop.
const HOSTS = new Set(['cantia.ch', 'www.cantia.ch']);

export function trailingSlashRedirect(requestUrl: string): string | null {
  const url = new URL(requestUrl);
  if (!HOSTS.has(url.hostname)) return null;
  if (url.pathname === '/' || !url.pathname.endsWith('/')) return null;
  url.pathname = url.pathname.replace(/\/+$/, '') || '/';
  return url.toString();
}

export default async function handler(request: Request): Promise<Response | undefined> {
  if (request.method !== 'GET' && request.method !== 'HEAD') return undefined;
  const target = trailingSlashRedirect(request.url);
  if (!target) return undefined;
  return new Response(null, { status: 301, headers: { Location: target, 'Cache-Control': 'public, max-age=3600' } });
}

export const config = {
  path: '/*',
  excludedPath: ['/_expo/*', '/assets/*', '/ingest/*', '/api/*', '/downloads/*'],
};
