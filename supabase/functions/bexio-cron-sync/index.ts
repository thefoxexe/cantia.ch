import { createClient } from 'npm:@supabase/supabase-js@2';

// Called only by pg_cron (see migration for the schedule + shared secret),
// never by a client — hit every 15 minutes, sweeps every organization with
// Bexio connected and auto_sync_enabled.
//
// This used to run the whole sync sweep (contacts, articles, invoices,
// devis/invoice status) inline for every org in this one invocation. That
// broke down once Besson (1140 Bexio contacts) connected alongside two
// other orgs — the combined memory/CPU footprint of processing all of them
// in one shared isolate started hitting WORKER_RESOURCE_LIMIT, silently
// killing the sweep before it finished for ANY org, not just Besson.
//
// This function is now just a dispatcher, and it fans out at STEP
// granularity, not just per org: for each connected org it fires three
// independent requests to bexio-sync-worker — 'contacts', 'articles', and
// 'rest' (invoices pulled from Bexio + devis/invoice status) — instead of
// one request doing all of it. A one-request-per-org version fixed two of
// the three affected orgs, but Besson's contacts (1138) and articles (897)
// combined still didn't reliably finish inside Supabase's 150s request
// idle-timeout even running concurrently within one invocation (sharing an
// isolate's budget between two 20-way concurrent loops isn't meaningfully
// faster than doing them one after another). Splitting by step gives each
// step its own isolate and its own full 130s budget.
const DISPATCH_SECRET = Deno.env.get('DISPATCH_SECRET');

// Generous per-call budget — Capped below Supabase's own 150s request
// idle-timeout (see docs/guides/functions/limits — a flat platform ceiling
// on every edge function response, independent of plan): a worker call
// still running past that gets killed with a 504 on Supabase's side
// regardless of what this dispatcher's own AbortController says, so there
// is no point waiting past it — this just gives it as much of that budget
// as possible while leaving this dispatcher's own response enough room to
// still land inside ITS 150s idle-timeout to the pg_cron caller.
const WORKER_TIMEOUT_MS = 130_000;

const STEPS = ['contacts', 'articles', 'rest'] as const;

Deno.serve(async (req: Request) => {
  if (!DISPATCH_SECRET || req.headers.get('x-dispatch-secret') !== DISPATCH_SECRET) {
    return new Response(JSON.stringify({ error: 'forbidden' }), { status: 403 });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const admin = createClient(supabaseUrl, serviceKey);
  const workerUrl = `${supabaseUrl}/functions/v1/bexio-sync-worker`;

  const { data: integrations } = await admin
    .from('integrations')
    .select('id, organization_id, status')
    .eq('provider', 'bexio')
    .eq('status', 'connected')
    .eq('auto_sync_enabled', true);

  async function runStep(integrationId: string, step: (typeof STEPS)[number]): Promise<boolean> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), WORKER_TIMEOUT_MS);
    try {
      const res = await fetch(workerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Dispatch-Secret': DISPATCH_SECRET },
        body: JSON.stringify({ integration_id: integrationId, step }),
        signal: controller.signal,
      });
      const body = await res.json().catch(() => ({}));
      return res.ok && body.ok !== false;
    } finally {
      clearTimeout(timer);
    }
  }

  const outcomes = await Promise.allSettled(
    (integrations ?? []).map(async (integration) => {
      const results = await Promise.allSettled(STEPS.map((step) => runStep(integration.id, step)));
      const ok = results.every((r) => r.status === 'fulfilled' && r.value === true);
      results.forEach((r, i) => {
        if (r.status === 'rejected') console.error('bexio-cron-sync: step dispatch failed', integration.id, STEPS[i], r.reason);
      });
      return { organization_id: integration.organization_id, ok };
    }),
  );

  const summary = outcomes.map((outcome, i) => {
    const integration = (integrations ?? [])[i];
    if (outcome.status === 'fulfilled') return outcome.value;
    console.error('bexio-cron-sync: unexpected failure for integration', integration.id, outcome.reason);
    return { organization_id: integration.organization_id, ok: false };
  });

  return new Response(JSON.stringify({ synced: summary.length, summary }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
