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

const PRIVATE_HOSTNAME_RE =
  /^(localhost|127\.|0\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|\[::1\]|\[fc|\[fd)/i;

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

async function fetchCapped(url: string, timeoutMs: number, maxBytes: number): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CantiaBrandBot/1.0)' },
    });
    if (!res.ok || !res.body) return null;
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let text = '';
    let received = 0;
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
    return text;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
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

    const html = await fetchCapped(url.toString(), FETCH_TIMEOUT_MS, MAX_BYTES);
    if (!html) return json({ suggestions: [] });

    const themeColor = extractThemeColor(html);

    const cssHref = extractFirstStylesheetHref(html, url);
    const css = cssHref ? await fetchCapped(cssHref, FETCH_TIMEOUT_MS, MAX_BYTES) : null;

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
