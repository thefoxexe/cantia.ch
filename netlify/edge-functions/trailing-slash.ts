// One URL per page: "/tarifs/" answers 301 → "/tarifs" (the form used by the
// canonicals, the sitemap and the hreflang). Netlify's redirect rules can't do
// this themselves: the CDN treats "/tarifs" and "/tarifs/" as the same path
// before [[redirects]] run, so a rule would loop. The query string is kept.
// Root "/" and static files are left alone.
export function trailingSlashRedirect(requestUrl: string): string | null {
  const url = new URL(requestUrl);
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
