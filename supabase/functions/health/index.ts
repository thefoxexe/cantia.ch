import { CheckError, cacheTtl, healthResponse, httpCategory, liveResponse, logLines, readyResponse, runChecks, type Check, type CheckResult } from './core.ts';

// Health endpoints for Better Stack (docs/health-monitoring.md). Public, no
// JWT (deployed with verify_jwt = false); also served as
// https://app.cantia.ch/api/health[/live|/ready] through netlify.toml.
//
//   /health        every service, 200 (operational / degraded) or 503
//   /health/ready  critical services only: 200 ready / 503 not_ready
//   /health/live   the backend answers; touches nothing: 200 ok
//
// Each check is one light, read-only request with its own timeout, run in
// parallel. Nothing is created, sent or paid; no customer credential is used.

// Version of this health function (bump on deploy). The frontend build's
// commit is published separately at https://app.cantia.ch/version.json.
const VERSION = Deno.env.get('CANTIA_VERSION') ?? '2026.09.30';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const STRIPE_KEY = Deno.env.get('STRIPE_SECRET_KEY') ?? '';

async function expectOk(res: Response): Promise<void> {
  // Drain the body: we never read or return its content.
  await res.body?.cancel().catch(() => {});
  if (!res.ok) throw new CheckError(httpCategory(res.status));
}

function checks(): Check[] {
  const list: Check[] = [
    {
      // PostgREST + Postgres: `select 1` through a dedicated function.
      name: 'database',
      critical: true,
      timeoutMs: 3000,
      slowMs: 1500,
      run: async (signal) => {
        if (!SUPABASE_URL || !SERVICE_KEY) throw new CheckError('misconfigured');
        await expectOk(
          await fetch(`${SUPABASE_URL}/rest/v1/rpc/health_ping`, {
            method: 'POST',
            headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' },
            body: '{}',
            signal,
          }),
        );
      },
    },
    {
      // Supabase Auth's own health endpoint: no user, no session.
      name: 'auth',
      critical: true,
      timeoutMs: 3000,
      slowMs: 1500,
      run: async (signal) => {
        if (!SUPABASE_URL || !ANON_KEY) throw new CheckError('misconfigured');
        await expectOk(await fetch(`${SUPABASE_URL}/auth/v1/health`, { headers: { apikey: ANON_KEY }, signal }));
      },
    },
    {
      // Metadata of the public "brand" bucket: nothing uploaded or listed.
      name: 'storage',
      critical: false,
      timeoutMs: 3000,
      slowMs: 1500,
      run: async (signal) => {
        if (!SUPABASE_URL || !SERVICE_KEY) throw new CheckError('misconfigured');
        await expectOk(await fetch(`${SUPABASE_URL}/storage/v1/bucket/brand`, { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` }, signal }));
      },
    },
  ];
  if (STRIPE_KEY) {
    list.push({
      // Read-only (one product, fields discarded). A Stripe outage only
      // degrades Cantia: billing waits, the app keeps working.
      name: 'payments',
      critical: false,
      timeoutMs: 4000,
      slowMs: 2500,
      run: async (signal) => {
        await expectOk(await fetch('https://api.stripe.com/v1/products?limit=1', { headers: { Authorization: `Bearer ${STRIPE_KEY}` }, signal }));
      },
    });
  }
  return list;
}

// Last results, kept a few seconds (shorter when something fails).
let cached: { results: CheckResult[]; at: number; ttl: number } | null = null;
let inflight: Promise<CheckResult[]> | null = null;

async function currentResults(): Promise<CheckResult[]> {
  const now = Date.now();
  if (cached && now - cached.at < cached.ttl) return cached.results;
  if (!inflight) {
    inflight = runChecks(checks()).then((results) => {
      cached = { results, at: Date.now(), ttl: cacheTtl(results) };
      for (const line of logLines(results, new Date())) console.warn(line);
      return results;
    });
    inflight.finally(() => (inflight = null));
  }
  return inflight;
}

const HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
  'Access-Control-Allow-Origin': '*',
  'X-Robots-Tag': 'noindex',
};

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: HEADERS });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: { ...HEADERS, 'Access-Control-Allow-Methods': 'GET, HEAD' } });
  if (req.method !== 'GET' && req.method !== 'HEAD') return json(405, { status: 'method_not_allowed' });

  const path = new URL(req.url).pathname.replace(/\/+$/, '');
  try {
    if (path.endsWith('/live')) {
      const r = liveResponse();
      return json(r.status, r.body);
    }
    const results = await currentResults();
    if (path.endsWith('/ready')) {
      const r = readyResponse(results, new Date());
      return json(r.status, r.body);
    }
    const r = healthResponse(results, VERSION, new Date());
    return json(r.status, r.body);
  } catch {
    // Never reached in practice (checks never throw); no detail either way.
    console.error(JSON.stringify({ event: 'health_check', service: 'health', status: 'down', at: new Date().toISOString(), category: 'unexpected' }));
    return json(503, { status: 'down', timestamp: new Date().toISOString(), version: VERSION, services: {} });
  }
});
