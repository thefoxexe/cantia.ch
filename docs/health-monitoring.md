# Health monitoring (Better Stack)

Cantia exposes three technical endpoints so Better Stack can watch the real
state of the platform. The public status page itself is hosted by Better
Stack at **status.cantia.ch** (already linked from every footer through
`components/StatusLink.tsx`); Cantia does not render a status page.

## Architecture

| Layer | What it is |
| --- | --- |
| Frontend | Expo (React Native Web), static export on Netlify: cantia.ch + app.cantia.ch (one site), accounting.cantia.ch, partners.cantia.ch |
| Backend | Supabase: Postgres + PostgREST, Auth, Storage, Edge Functions (Deno) |
| Payments | Stripe (checkout, portal, webhook) |
| E-mail | Resend (sending + inbound `suivi.cantia.ch`) |
| Integrations | Bexio (OAuth per organization, sync every 15 min) |
| Scheduled jobs | `pg_cron` in Supabase (see *Heartbeats*) |

The checks run in the Supabase Edge Function **`health`**
(`supabase/functions/health/`, deployed with `verify_jwt = false`): it is the
real backend and can reach the database, Auth and Storage from inside.
Netlify proxies it under a stable Cantia URL (`netlify.toml`, first redirect
rules), status codes and bodies unchanged.

| Public URL | Direct URL |
| --- | --- |
| `https://app.cantia.ch/api/health` | `https://krijilwxhdlzflvnvrtl.supabase.co/functions/v1/health` |
| `https://app.cantia.ch/api/health/live` | `…/functions/v1/health/live` |
| `https://app.cantia.ch/api/health/ready` | `…/functions/v1/health/ready` |

The `app.cantia.ch` URLs work once the Netlify deploy containing the proxy
rules is live. Until then, point the monitors at the direct URLs (they work
now).

## Endpoints

### `GET /api/health` — every service

```json
{
  "status": "operational",
  "timestamp": "2026-09-30T14:12:37.927Z",
  "version": "2026.09.30",
  "services": {
    "database": "operational",
    "auth": "operational",
    "storage": "operational",
    "payments": "operational"
  }
}
```

Each service is `operational`, `degraded` (answers, but slower than its
threshold) or `down` (error or timeout).

| Situation | `status` | HTTP |
| --- | --- | --- |
| Everything answers normally | `operational` | 200 |
| A secondary service is down, or any service is slow | `degraded` | 200 |
| A critical service (database, auth) is down | `down` | **503** |

### `GET /api/health/ready` — can Cantia serve users?

Only the critical services decide. `200 {"status":"ready"}` or
`503 {"status":"not_ready"}`.

### `GET /api/health/live` — does the backend answer?

`200 {"status":"ok"}`. Touches no dependency: it tells *backend unreachable*
apart from *backend up but database down*.

### `GET https://app.cantia.ch/version.json` — which frontend is deployed

Written at build time by `scripts/write-version.mjs` from Netlify's
`COMMIT_REF` / `CONTEXT` / `DEPLOY_ID` (`"local"` when built locally):
`{"version":"abc1234","context":"production","deployId":"…","builtAt":"…"}`.
The `version` field of `/api/health` is the version of the health function
itself (set `CANTIA_VERSION` in the function secrets to override).

## Services checked

| Service | Critical | Check | Timeout | "Slow" above |
| --- | --- | --- | --- | --- |
| `database` | yes | `POST /rest/v1/rpc/health_ping` (`select 1`, service role only — migration `20260930190000_health_ping.sql`) | 3 s | 1.5 s |
| `auth` | yes | `GET /auth/v1/health` (Supabase Auth's own health endpoint; no user, no session) | 3 s | 1.5 s |
| `storage` | no | `GET /storage/v1/bucket/brand` (metadata of the public brand bucket; nothing uploaded or listed) | 3 s | 1.5 s |
| `payments` | no | `GET https://api.stripe.com/v1/products?limit=1` (read-only; only if `STRIPE_SECRET_KEY` is set) | 4 s | 2.5 s |

All checks run in parallel (`Promise.allSettled`), each aborted at its own
timeout: the endpoint answers in about 4 seconds at worst.

Why storage is not critical: login, projects, quotes and invoices keep
working without it; only files (photos, PDFs) would fail. Stripe is never
critical: an outage delays billing, the app keeps working.

### Deliberately not checked

- **E-mail (Resend)**: Resend has no health endpoint, and a read-only API
  call would share the account's rate limit (a few requests per second) with
  real sends. Nothing is sent by the health check. Watch it with Better
  Stack's own Resend status integration, or `resend-webhook` bounce rates.
- **Bexio**: calling Bexio needs a customer's OAuth tokens; they are never
  used for monitoring. Bexio is watched through the sync job's heartbeat
  (below) and its real errors (`integrations` / sync logs), as a separate
  component on the status page.

## Cache and load

Results are cached in the function for **10 s** when everything is
operational and **3 s** when something fails, so a recovery shows up at
once. Concurrent requests share one run. Responses carry
`Cache-Control: no-store`.

## Security

Public bodies contain only the states above, a timestamp and a version:
no error message, URL, key, id, SQL or stack trace. A test
(`scripts/health.test.mjs`) feeds secret-looking errors to the checks and
asserts none of it reaches the body.

When a check fails or is slow, the function logs one JSON line (Supabase
Dashboard › Edge Functions › health › Logs):

```json
{"event":"health_check","service":"database","status":"down","at":"…","duration_ms":3001,"category":"timeout"}
```

Categories: `timeout`, `http_4xx`, `http_5xx`, `network`, `misconfigured`,
`unexpected`. The raw error message is never logged (it may contain URLs or
keys).

## Tests

```bash
npm run test:health
```

Covers: all operational, database down (503), database timeout (bounded
time), a check that never settles, secondary service down (200 degraded),
slow service (degraded), ready vs not ready, liveness independent of the
checks, no secret in the body, log lines without messages, cache durations.

## Better Stack configuration

Create these monitors (Better Stack › Uptime › Monitors › Create monitor).
Use the direct Supabase URLs for 3–5 until the Netlify deploy with the proxy
rules is live, then switch to the `app.cantia.ch` URLs.

**MONITOR 1 — Cantia Website**
- URL: `https://cantia.ch`
- Type: HTTP status (keyword optional: `Cantia`)
- Expected: 2XX · Check every 3 min · Timeout 30 s · Regions: Europe

**MONITOR 2 — Cantia App**
- URL: `https://app.cantia.ch`
- Type: HTTP status · Expected: 2XX · Every 3 min · Timeout 30 s

**MONITOR 3 — Cantia Backend Liveness**
- URL: `https://app.cantia.ch/api/health/live`
  (now: `https://krijilwxhdlzflvnvrtl.supabase.co/functions/v1/health/live`)
- Type: Keyword · Keyword: `"ok"` · Expected: 2XX · Every 1 min · Timeout 10 s

**MONITOR 4 — Cantia Core Health (ready)**
- URL: `https://app.cantia.ch/api/health/ready`
  (now: `…/functions/v1/health/ready`)
- Type: HTTP status · Expected: 2XX (a 503 raises the incident) · Every 1 min
  · Timeout 15 s · Confirmation period: 2 min (avoids alerting on one blip)

**MONITOR 5 — Cantia Services (degraded)**
- URL: `https://app.cantia.ch/api/health` (now: `…/functions/v1/health`)
- Type: Keyword · Keyword: `"status":"operational"` · Expected: 2XX
- Every 3 min · Timeout 15 s · Severity: low (it alerts on *degraded*, e.g.
  Stripe or Storage slow/down, without waking anyone)

**MONITOR 6 — Cantia Accounting** — `https://accounting.cantia.ch`, HTTP
2XX, every 5 min.

**MONITOR 7 — Cantia Partners** — `https://partners.cantia.ch`, HTTP 2XX,
every 5 min.

Status page (status.cantia.ch) components: *Site web* (1), *Application*
(2, 3, 4), *Services* (5), *Espace fiduciaires* (6), *Partners* (7), plus the
heartbeats below as *Tâches planifiées*.

## Heartbeats (recommended, not wired yet)

`pg_cron` jobs, 7-day history all green at the time of writing. For jobs that
call an Edge Function through `net.http_post`, `cron` only knows the request
was *sent*; a heartbeat sent by the function at the end of a successful run
is the real signal.

| Job | Schedule | What it does | Heartbeat | Grace |
| --- | --- | --- | --- | --- |
| `bexio-cron-sync` | every 15 min | Bexio sync for connected organizations | **yes** — high value | 30 min |
| `send-devis-followups` | every 15 min | Automatic quote follow-ups | **yes** | 30 min |
| `partners-release-commissions` | daily 02:15 | Releases partner commissions | **yes** (money) | 2 h |
| `accounting-mailer-retry` | hourly :17 | Retries failed fiduciary e-mails | yes | 2 h |
| `downgrade-expired-trials` | hourly | Ends expired trials | yes (billing) | 2 h |
| `auto-daily-reports` | daily 17:00 | Automatic daily reports | optional | 2 h |
| `generate-notifications` | hourly | In-app scheduled notifications | optional | 2 h |
| `dispatch-scheduled-newsletter-sends` | every 5 min | Scheduled newsletters | optional | 15 min |
| `send-incomplete-signup-reminders` | hourly | Signup reminder e-mails | optional | 2 h |
| `partners-admin-reminder` | monthly (4th, 07:45) | Admin payout reminder | optional | 1 day |

How to wire one (per job, once the heartbeat exists in Better Stack):

1. Better Stack › Heartbeats › Create: name, period = schedule, grace as
   above. Copy its URL.
2. Store it as a Supabase secret, e.g. `HEARTBEAT_BEXIO_SYNC_URL`.
3. At the end of a *successful* run, the function does
   `fetch(Deno.env.get('HEARTBEAT_BEXIO_SYNC_URL')!)` (best effort, 3 s
   timeout, never failing the job). For SQL-only jobs, the same
   `net.http_get(url)` as the last statement of the function.

These jobs were not modified here: each one needs its success condition
checked before a heartbeat is added.
