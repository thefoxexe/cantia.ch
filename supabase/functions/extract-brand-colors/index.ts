// Given a company website URL, fetches its homepage and proposes brand
// color candidates from the page's own theming signals — its declared
// `<meta name="theme-color">` (a strong, deliberate signal many sites set)
// plus a frequency scan of hex colors used in inline <style> blocks/attrs
// and (best-effort) its first linked stylesheet. No image decoding is
// involved: extracting a color from the logo image itself is done
// client-side via canvas (lib/colorFromImage.ts, web only) and merged with
// these results in the UI — this function only ever looks at text/CSS.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const FETCH_TIMEOUT_MS = 6000;
const MAX_BYTES = 400_000;
const MAX_REDIRECTS = 3;

// Fast literal pre-filter — cheap first line of defense, kept as a sanity
// check. The real protection is resolveAndCheckHostname() below: a literal
// hostname check alone is bypassable via DNS rebinding (a domain that
// resolves to a public IP on first check, then a private one when actually
// fetched) or an alternate IP encoding (decimal/octal/hex) that never
// matches this regex but still resolves to a private address.
const PRIVATE_HOSTNAME_RE = /^(localhost|\[::1\])$/i;

function ipv4ToInt(ip: string): number | null {
  const parts = ip.split('.');
  if (parts.length !== 4) return null;
  let n = 0;
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return null;
    const v = Number(part);
    if (v > 255) return null;
    n = (n << 8) | v;
  }
  return n >>> 0;
}

// RFC1918 + loopback + link-local + CGNAT + documentation/reserved ranges —
// anything that could plausibly reach an internal service or cloud
// metadata endpoint (169.254.169.254) rather than the public internet.
const PRIVATE_IPV4_BLOCKS: [string, number][] = [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.0.2.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['198.51.100.0', 24],
  ['203.0.113.0', 24],
  ['224.0.0.0', 4],
  ['240.0.0.0', 4],
];

function isPrivateIpv4(ip: string): boolean {
  const n = ipv4ToInt(ip);
  if (n === null) return true; // unparseable — fail closed
  for (const [base, bits] of PRIVATE_IPV4_BLOCKS) {
    const baseN = ipv4ToInt(base)!;
    const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
    if ((n & mask) === (baseN & mask)) return true;
  }
  return false;
}

function isPrivateIpv6(ip: string): boolean {
  const lower = ip.toLowerCase();
  if (lower === '::' || lower === '::1') return true;
  if (/^fe[89ab][0-9a-f]:/.test(lower)) return true; // fe80::/10 link-local
  if (/^f[cd][0-9a-f]{2}:/.test(lower)) return true; // fc00::/7 unique local
  const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/.exec(lower);
  if (mapped) return isPrivateIpv4(mapped[1]);
  return false;
}

// Resolves the hostname ourselves and checks every returned address,
// instead of trusting the hostname string alone — closes the DNS-rebinding
// gap a literal-only check leaves open.
async function resolveAndCheckHostname(hostname: string): Promise<boolean> {
  if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) return !isPrivateIpv4(hostname);
  if (hostname.includes(':')) return !isPrivateIpv6(hostname.replace(/^\[|\]$/g, ''));
  try {
    const [v4, v6] = await Promise.all([
      Deno.resolveDns(hostname, 'A').catch(() => [] as string[]),
      Deno.resolveDns(hostname, 'AAAA').catch(() => [] as string[]),
    ]);
    if (v4.length === 0 && v6.length === 0) return false; // couldn't resolve — fail closed
    return !v4.some(isPrivateIpv4) && !v6.some(isPrivateIpv6);
  } catch {
    return false; // fail closed
  }
}

function normalizeUrl(input: string): URL | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withScheme);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    if (PRIVATE_HOSTNAME_RE.test(url.hostname)) return null;
    return url;
  } catch {
    return null;
  }
}

// Fetches with the redirect chain validated hop-by-hop (redirect: 'manual'
// + re-check each Location ourselves) rather than letting fetch() follow
// redirects transparently, which would skip our private-IP check on
// whichever host the response actually redirects to.
async function fetchCapped(startUrl: URL, timeoutMs: number, maxBytes: number): Promise<string | null> {
  let url = startUrl;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    if (!(await resolveAndCheckHostname(url.hostname))) return null;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    let res: Response;
    try {
      res = await fetch(url.toString(), {
        signal: controller.signal,
        redirect: 'manual',
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CantiaBrandBot/1.0)' },
      });
    } catch {
      return null;
    } finally {
      clearTimeout(timer);
    }

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get('location');
      if (!location) return null;
      const next = normalizeUrl(new URL(location, url).toString());
      if (!next) return null;
      url = next;
      continue;
    }

    if (!res.ok || !res.body) return null;
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let text = '';
    let received = 0;
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        received += value.byteLength;
        text += decoder.decode(value, { stream: true });
        if (received >= maxBytes) {
          reader.cancel().catch(() => {});
          break;
        }
      }
    } catch {
      return null;
    }
    return text;
  }
  return null; // too many redirects
}

function hexToRgb(hex: string): [number, number, number] {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
}

// Excludes near-white/near-black and low-saturation grays — those are
// backgrounds/borders/text colors, not a brand accent.
function isVividBrandColor(hex: string): boolean {
  const [r, g, b] = hexToRgb(hex);
  const luminance = (r + g + b) / 3;
  if (luminance > 235 || luminance < 25) return false;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const saturation = max === 0 ? 0 : (max - min) / max;
  return saturation > 0.12;
}

function extractHexColors(text: string): string[] {
  const matches = text.match(/#[0-9a-fA-F]{6}\b/g) ?? [];
  return matches.map((m) => m.toLowerCase());
}

function extractThemeColor(html: string): string | null {
  const match = /<meta[^>]+name=["']theme-color["'][^>]+content=["'](#[0-9a-fA-F]{6})["']/i.exec(html);
  return match ? match[1].toLowerCase() : null;
}

function extractFirstStylesheetHref(html: string, base: URL): string | null {
  const match = /<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["']/i.exec(html);
  if (!match) return null;
  try {
    return new URL(match[1], base).toString();
  } catch {
    return null;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { website } = await req.json();
    if (!website || typeof website !== 'string') {
      return json({ error: 'website requis' }, 400);
    }

    const url = normalizeUrl(website);
    if (!url) return json({ suggestions: [] });

    const html = await fetchCapped(url, FETCH_TIMEOUT_MS, MAX_BYTES);
    if (!html) return json({ suggestions: [] });

    const themeColor = extractThemeColor(html);

    const cssHref = extractFirstStylesheetHref(html, url);
    const cssUrl = cssHref ? normalizeUrl(cssHref) : null;
    const css = cssUrl ? await fetchCapped(cssUrl, FETCH_TIMEOUT_MS, MAX_BYTES) : null;

    const tally = new Map<string, number>();
    for (const hex of extractHexColors(html + (css ?? ''))) {
      if (!isVividBrandColor(hex)) continue;
      tally.set(hex, (tally.get(hex) ?? 0) + 1);
    }
    const byFrequency = [...tally.entries()].sort((a, b) => b[1] - a[1]).map(([hex]) => hex);

    const suggestions: string[] = [];
    if (themeColor && isVividBrandColor(themeColor)) suggestions.push(themeColor);
    for (const hex of byFrequency) {
      if (suggestions.length >= 3) break;
      if (!suggestions.includes(hex)) suggestions.push(hex);
    }

    return json({ suggestions });
  } catch (err) {
    console.error(err);
    return json({ suggestions: [] });
  }
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
