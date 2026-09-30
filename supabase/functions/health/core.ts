// Health checks for Better Stack (see docs/health-monitoring.md): the pure
// part, with no Deno / network dependency so it can be unit-tested under
// Node (scripts/health.test.mjs). index.ts wires the real checks.
//
// Public responses carry only states ("operational" / "degraded" / "down"),
// never an error message, a URL, a key or an id. Details go to the server
// log, as a category.

export type ServiceStatus = 'operational' | 'degraded' | 'down';

export type ErrorCategory = 'timeout' | 'http_4xx' | 'http_5xx' | 'network' | 'misconfigured' | 'unexpected';

export interface Check {
  name: string;
  // A critical service down makes Cantia unusable: HTTP 503.
  critical: boolean;
  timeoutMs: number;
  // Answering slower than this is "degraded" (still usable).
  slowMs?: number;
  run: (signal: AbortSignal) => Promise<void>;
}

export interface CheckResult {
  name: string;
  critical: boolean;
  status: ServiceStatus;
  durationMs: number;
  category?: ErrorCategory;
}

export class CheckError extends Error {
  category: ErrorCategory;
  constructor(category: ErrorCategory) {
    super(category);
    this.category = category;
  }
}

// HTTP status of a dependency -> error category (4xx: our request or our
// key is wrong; 5xx: the dependency is failing).
export function httpCategory(status: number): ErrorCategory {
  return status >= 500 ? 'http_5xx' : 'http_4xx';
}

export function categorize(err: unknown): ErrorCategory {
  if (err instanceof CheckError) return err.category;
  if (err && typeof err === 'object' && 'name' in err && (err as { name: string }).name === 'AbortError') return 'timeout';
  if (err instanceof TypeError) return 'network';
  return 'unexpected';
}

export async function runCheck(check: Check, now: () => number = Date.now): Promise<CheckResult> {
  const started = now();
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new CheckError('timeout'));
    }, check.timeoutMs);
  });
  try {
    await Promise.race([check.run(controller.signal), timeout]);
    const durationMs = now() - started;
    const slow = check.slowMs !== undefined && durationMs > check.slowMs;
    return { name: check.name, critical: check.critical, status: slow ? 'degraded' : 'operational', durationMs };
  } catch (err) {
    return { name: check.name, critical: check.critical, status: 'down', durationMs: now() - started, category: categorize(err) };
  } finally {
    clearTimeout(timer);
  }
}

// All checks in parallel: the slowest one bounds the response time.
export async function runChecks(checks: Check[], now: () => number = Date.now): Promise<CheckResult[]> {
  const settled = await Promise.allSettled(checks.map((c) => runCheck(c, now)));
  return settled.map((s, i) =>
    s.status === 'fulfilled' ? s.value : { name: checks[i].name, critical: checks[i].critical, status: 'down' as const, durationMs: 0, category: 'unexpected' as const },
  );
}

export function overallStatus(results: CheckResult[]): ServiceStatus {
  if (results.some((r) => r.critical && r.status === 'down')) return 'down';
  if (results.some((r) => r.status !== 'operational')) return 'degraded';
  return 'operational';
}

export interface HealthBody {
  status: ServiceStatus;
  timestamp: string;
  version: string;
  services: Record<string, ServiceStatus>;
}

// GET /health: 200 when usable (operational or degraded), 503 when a
// critical service is down.
export function healthResponse(results: CheckResult[], version: string, at: Date): { status: number; body: HealthBody } {
  const status = overallStatus(results);
  const services: Record<string, ServiceStatus> = {};
  for (const r of results) services[r.name] = r.status;
  return { status: status === 'down' ? 503 : 200, body: { status, timestamp: at.toISOString(), version, services } };
}

// GET /health/ready: only the critical services decide.
export function readyResponse(results: CheckResult[], at: Date): { status: number; body: { status: 'ready' | 'not_ready'; timestamp: string } } {
  const ready = results.filter((r) => r.critical).every((r) => r.status !== 'down');
  return { status: ready ? 200 : 503, body: { status: ready ? 'ready' : 'not_ready', timestamp: at.toISOString() } };
}

// GET /health/live: the backend answers; no dependency is touched.
export function liveResponse(): { status: number; body: { status: 'ok' } } {
  return { status: 200, body: { status: 'ok' } };
}

// One server log line per failed / slow check: service, time, duration,
// category. Never the error message (it can carry URLs or keys).
export function logLines(results: CheckResult[], at: Date): string[] {
  return results
    .filter((r) => r.status !== 'operational')
    .map((r) => JSON.stringify({ event: 'health_check', service: r.name, status: r.status, at: at.toISOString(), duration_ms: r.durationMs, category: r.category ?? 'slow' }));
}

// Short cache so frequent monitors do not hammer the dependencies. A failing
// state is kept even shorter, so recovery shows up at once.
export const CACHE_OK_MS = 10_000;
export const CACHE_FAIL_MS = 3_000;

export function cacheTtl(results: CheckResult[]): number {
  return overallStatus(results) === 'operational' ? CACHE_OK_MS : CACHE_FAIL_MS;
}
