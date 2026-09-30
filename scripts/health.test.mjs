// Tests of the health checks' logic (supabase/functions/health/core.ts).
// Run: npm run test:health   (Node's built-in test runner, no dependency)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  CACHE_FAIL_MS,
  CACHE_OK_MS,
  CheckError,
  cacheTtl,
  healthResponse,
  liveResponse,
  logLines,
  readyResponse,
  runCheck,
  runChecks,
} from '../supabase/functions/health/core.ts';

const AT = new Date('2026-09-30T12:00:00Z');
const ok = (name, critical = true) => ({ name, critical, timeoutMs: 200, run: async () => {} });
const fail = (name, critical, err) => ({
  name,
  critical,
  timeoutMs: 200,
  run: async () => {
    throw err;
  },
});
const hang = (name, critical) => ({ name, critical, timeoutMs: 50, run: (signal) => new Promise((_, reject) => signal.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' })))) });
const neverSettles = (name, critical) => ({ name, critical, timeoutMs: 50, run: () => new Promise(() => {}) });

// A secret-looking error, to prove nothing of it reaches the public body.
const LEAKY = new Error('connect ECONNREFUSED db.internal.krijil:5432 key=sk_live_SECRET123 select * from users');

test('everything operational: 200, operational', async () => {
  const results = await runChecks([ok('database'), ok('auth'), ok('storage', false), ok('payments', false)]);
  const r = healthResponse(results, 'v1', AT);
  assert.equal(r.status, 200);
  assert.equal(r.body.status, 'operational');
  assert.deepEqual(r.body.services, { database: 'operational', auth: 'operational', storage: 'operational', payments: 'operational' });
  assert.equal(r.body.version, 'v1');
  assert.equal(r.body.timestamp, AT.toISOString());
});

test('database down (critical): 503, down', async () => {
  const results = await runChecks([fail('database', true, new CheckError('http_5xx')), ok('auth'), ok('storage', false)]);
  const r = healthResponse(results, 'v1', AT);
  assert.equal(r.status, 503);
  assert.equal(r.body.status, 'down');
  assert.equal(r.body.services.database, 'down');
  assert.equal(r.body.services.auth, 'operational');
});

test('database timeout: aborted, down, 503, bounded time', async () => {
  const started = Date.now();
  const results = await runChecks([hang('database', true), ok('auth')]);
  assert.ok(Date.now() - started < 1000, 'must not wait for the dependency');
  const db = results.find((r) => r.name === 'database');
  assert.equal(db.status, 'down');
  assert.equal(db.category, 'timeout');
  assert.equal(healthResponse(results, 'v1', AT).status, 503);
});

test('a check that never settles still times out', async () => {
  const r = await runCheck(neverSettles('database', true));
  assert.equal(r.status, 'down');
  assert.equal(r.category, 'timeout');
});

test('secondary service down: 200, degraded', async () => {
  const results = await runChecks([ok('database'), ok('auth'), fail('payments', false, new CheckError('http_5xx'))]);
  const r = healthResponse(results, 'v1', AT);
  assert.equal(r.status, 200);
  assert.equal(r.body.status, 'degraded');
  assert.equal(r.body.services.payments, 'down');
});

test('slow critical service: degraded, still 200', async () => {
  let t = 0;
  const clock = () => (t += 2000);
  const r = await runCheck({ name: 'database', critical: true, timeoutMs: 5000, slowMs: 1500, run: async () => {} }, clock);
  assert.equal(r.status, 'degraded');
  assert.equal(healthResponse([r], 'v1', AT).status, 200);
});

test('ready: 503 not_ready when a critical service is down, 200 otherwise', async () => {
  const down = await runChecks([fail('database', true, LEAKY), ok('auth')]);
  assert.deepEqual(readyResponse(down, AT), { status: 503, body: { status: 'not_ready', timestamp: AT.toISOString() } });
  const secondaryDown = await runChecks([ok('database'), ok('auth'), fail('storage', false, LEAKY)]);
  assert.equal(readyResponse(secondaryDown, AT).status, 200);
  assert.equal(readyResponse(secondaryDown, AT).body.status, 'ready');
});

test('liveness does not depend on any check', () => {
  assert.deepEqual(liveResponse(), { status: 200, body: { status: 'ok' } });
});

test('no secret, message or internal detail in the public body', async () => {
  const results = await runChecks([fail('database', true, LEAKY), fail('auth', true, new TypeError('fetch failed https://krijilwxhdlzflvnvrtl.supabase.co/auth')), ok('storage', false)]);
  for (const body of [healthResponse(results, 'v1', AT).body, readyResponse(results, AT).body]) {
    const text = JSON.stringify(body);
    for (const needle of ['ECONNREFUSED', 'sk_live', 'SECRET', 'select', 'supabase.co', 'krijil', '5432', 'fetch failed', 'stack']) {
      assert.ok(!text.includes(needle), `public body leaks "${needle}": ${text}`);
    }
    assert.deepEqual(Object.keys(body).sort(), Object.keys(body).length === 2 ? ['status', 'timestamp'] : ['services', 'status', 'timestamp', 'version']);
  }
});

test('server logs: category only, never the error message', async () => {
  const results = await runChecks([fail('database', true, LEAKY), fail('auth', true, new TypeError('fetch failed')), ok('storage', false)]);
  const lines = logLines(results, AT);
  assert.equal(lines.length, 2);
  const db = JSON.parse(lines[0]);
  assert.equal(db.service, 'database');
  assert.equal(db.category, 'unexpected');
  assert.equal(JSON.parse(lines[1]).category, 'network');
  assert.ok(!lines.join('').includes('SECRET'));
  assert.ok(typeof db.duration_ms === 'number' && db.at === AT.toISOString());
});

test('cache: short, and shorter when something fails', async () => {
  assert.equal(cacheTtl(await runChecks([ok('database')])), CACHE_OK_MS);
  assert.equal(cacheTtl(await runChecks([fail('database', true, LEAKY)])), CACHE_FAIL_MS);
  assert.ok(CACHE_OK_MS <= 15_000 && CACHE_FAIL_MS <= 5_000);
});
