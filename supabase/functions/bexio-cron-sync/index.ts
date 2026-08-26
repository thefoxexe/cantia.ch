import { createClient } from 'npm:@supabase/supabase-js@2';
import { syncBexioArticles, syncBexioContacts, syncBexioDevisStatuses, syncBexioInvoicesFromBexio, syncBexioInvoiceStatuses } from './bexio-sync-logic.ts';

// Called only by pg_cron (see migration for the schedule + shared secret),
// never by a client — hit every 15 minutes, sweeps every organization with
// Bexio connected and auto_sync_enabled, pulling contacts, articles (into
// the Catalogue), invoices created directly in Bexio, the payment status
// of already-mapped ones, and the Bexio-side document number/status of
// devis already pushed as kb_offer. A product created in Bexio between two
// manual "Synchroniser maintenant" clicks used to only reach the Catalogue
// on the next manual sync or reconnect — now every sweep picks it up too.
const DISPATCH_SECRET = 'b7f0e4c1a9d84f2c9a3e6b5d1f7c8e2a4d6b9c0e3f5a7b1d8c2e4f6a9b3d5c7e';

Deno.serve(async (req: Request) => {
  if (req.headers.get('x-dispatch-secret') !== DISPATCH_SECRET) {
    return new Response(JSON.stringify({ error: 'forbidden' }), { status: 403 });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const admin = createClient(supabaseUrl, serviceKey);

  const { data: integrations } = await admin
    .from('integrations')
    .select('id, organization_id, status')
    .eq('provider', 'bexio')
    .eq('status', 'connected')
    .eq('auto_sync_enabled', true);

  const summary: { organization_id: string; ok: boolean }[] = [];
  for (const integration of integrations ?? []) {
    await syncBexioContacts(admin, integration);
    await syncBexioArticles(admin, integration);
    await syncBexioInvoicesFromBexio(admin, integration);
    await syncBexioDevisStatuses(admin, integration);
    const result = await syncBexioInvoiceStatuses(admin, integration);
    summary.push({ organization_id: integration.organization_id, ok: result.ok });
  }

  return new Response(JSON.stringify({ synced: summary.length, summary }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
