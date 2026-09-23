import { createClient } from 'npm:@supabase/supabase-js@2';
import { syncBexioArticles, syncBexioContacts, syncBexioDevisStatuses, syncBexioInvoicesFromBexio, syncBexioInvoiceStatuses } from './bexio-sync-logic.ts';

// Does the sync work for exactly ONE integration, one STEP at a time. Split
// out of bexio-cron-sync (which used to run the whole sweep inline for
// every connected org in a single invocation) after that shared invocation
// started hitting WORKER_RESOURCE_LIMIT once one org (Besson, 1140
// contacts) plus two other orgs were all processed together in one isolate.
//
// A first cut split by ORG only (one worker call per integration doing all
// five steps sequentially-ish) — that fixed the two smaller orgs but
// Besson's contacts (1138) and articles (897) combined still didn't finish
// inside Supabase's 150s request idle-timeout, whether run sequentially
// (sum of both) or concurrently within the same invocation (which didn't
// help — sharing one isolate's CPU/network budget between two 20-way
// concurrent sync loops isn't materially faster than doing them one after
// another, and adds contention). Splitting further, by STEP, gives each
// step its own dedicated 130s window and its own isolate — contacts alone
// comfortably finishes well inside that on its own.
const DISPATCH_SECRET = Deno.env.get('DISPATCH_SECRET');

type Step = 'contacts' | 'articles' | 'rest' | 'all';

Deno.serve(async (req: Request) => {
  if (!DISPATCH_SECRET || req.headers.get('x-dispatch-secret') !== DISPATCH_SECRET) {
    return new Response(JSON.stringify({ error: 'forbidden' }), { status: 403 });
  }

  let integrationId: string | undefined;
  let step: Step = 'all';
  try {
    const body = await req.json();
    integrationId = body.integration_id;
    if (body.step === 'contacts' || body.step === 'articles' || body.step === 'rest') step = body.step;
  } catch {
    // fall through to the missing-id check below
  }
  if (!integrationId) {
    return new Response(JSON.stringify({ error: 'integration_id requis' }), { status: 400 });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const admin = createClient(supabaseUrl, serviceKey);

  const { data: integration } = await admin
    .from('integrations')
    .select('id, organization_id, status')
    .eq('id', integrationId)
    .eq('provider', 'bexio')
    .eq('status', 'connected')
    .maybeSingle();

  if (!integration) {
    return new Response(JSON.stringify({ error: 'integration introuvable ou non connectée' }), { status: 404 });
  }

  try {
    let ok: boolean;
    if (step === 'contacts') {
      ok = (await syncBexioContacts(admin, integration)).ok;
    } else if (step === 'articles') {
      ok = (await syncBexioArticles(admin, integration)).ok;
    } else if (step === 'rest') {
      // invoices_pull reads whatever client mappings exist at call time —
      // it may run alongside this same sweep's own 'contacts' step (a
      // separate worker call dispatched in parallel), so a brand-new
      // Bexio contact invoiced in the same 15-minute window can be
      // skipped here and picked up on the next sweep instead. Same
      // tolerance the skip-and-retry path already has for other reasons.
      await syncBexioInvoicesFromBexio(admin, integration);
      const [, invoiceStatusResult] = await Promise.all([syncBexioDevisStatuses(admin, integration), syncBexioInvoiceStatuses(admin, integration)]);
      ok = invoiceStatusResult.ok;
    } else {
      // Full sweep, kept for direct/manual invocation — not what
      // bexio-cron-sync's per-step dispatch uses, but a single call still
      // does the whole job correctly for a smaller org.
      const contactsPromise = syncBexioContacts(admin, integration);
      const articlesPromise = syncBexioArticles(admin, integration);
      const devisStatusPromise = syncBexioDevisStatuses(admin, integration);
      const invoiceStatusPromise = syncBexioInvoiceStatuses(admin, integration);
      await contactsPromise;
      await syncBexioInvoicesFromBexio(admin, integration);
      await Promise.all([articlesPromise, devisStatusPromise]);
      ok = (await invoiceStatusPromise).ok;
    }

    return new Response(JSON.stringify({ organization_id: integration.organization_id, step, ok }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('bexio-sync-worker: unexpected failure for integration', integration.id, step, err);
    return new Response(JSON.stringify({ organization_id: integration.organization_id, step, ok: false, error: String(err instanceof Error ? err.message : err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
