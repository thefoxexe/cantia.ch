import { createClient } from 'npm:@supabase/supabase-js@2';
import { bexioJson, BexioError, decodeBexioCompanyUserId, getValidAccessToken, resolveBexioSalesTaxId } from './bexio.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Pushes one Cantia facture to Bexio as a kb_invoice DRAFT — never issues it
// (cahier des charges section 46: issuing is a deliberate separate action,
// not built yet). Idempotent via integration_mappings: a facture already
// mapped is updated in place (POST /2.0/kb_invoice/{id}), never re-created.
//
// user_id (top-level) and tax_id (per position) are required by Bexio —
// confirmed live on the sibling kb_offer push with the identical 422
// ("user_id: Pflichtfeld", "positions: 0 [tax_id [Pflichtfeld]]"), same
// document family. Resolved the same way: user_id from the OAuth access
// token's company_user_id claim, tax_id from the account's own active
// sales-tax rates matched against the facture's vat_rate — see
// decodeBexioCompanyUserId / resolveBexioSalesTaxId in bexio.ts. Left out
// only if either lookup comes back empty, so a real BEXIO_VALIDATION_ERROR
// still surfaces instead of a guessed value silently corrupting the invoice.
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('Authorization') ?? '';

    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const admin = createClient(supabaseUrl, serviceKey);

    const {
      data: { user },
    } = await userClient.auth.getUser();
    if (!user) return json({ error: 'Non authentifié' }, 401);

    const { organization_id, facture_id } = await req.json();
    if (!organization_id || !facture_id) return json({ error: 'organization_id et facture_id requis' }, 400);

    const { data: isAdmin } = await userClient.rpc('is_org_admin', { org_id: organization_id });
    if (!isAdmin) return json({ error: "Seul un administrateur de l'entreprise peut envoyer une facture vers Bexio." }, 403);

    const { data: org } = await admin.from('organizations').select('plan_id').eq('id', organization_id).maybeSingle();
    const { data: plan } = await admin.from('plans').select('has_bexio_integration').eq('id', org?.plan_id ?? '').maybeSingle();
    if (!plan?.has_bexio_integration) return json({ error: "L'intégration Bexio nécessite le plan Équipe ou supérieur." }, 403);

    const { data: integration } = await admin
      .from('integrations')
      .select('id, organization_id, status')
      .eq('organization_id', organization_id)
      .eq('provider', 'bexio')
      .maybeSingle();
    if (!integration || integration.status !== 'connected') return json({ error: "Bexio n'est pas connecté pour cette entreprise." }, 400);

    const { data: facture } = await admin
      .from('factures')
      .select('id, organization_id, number, client_id, notes, due_date, created_at, vat_rate')
      .eq('id', facture_id)
      .eq('organization_id', organization_id)
      .maybeSingle();
    if (!facture) return json({ error: 'Facture introuvable.' }, 404);
    if (!facture.client_id) {
      return json({ error: "Cette facture n'a pas de client associé — impossible de l'envoyer vers Bexio." }, 400);
    }

    const { data: clientMapping } = await admin
      .from('integration_mappings')
      .select('external_id')
      .eq('integration_id', integration.id)
      .eq('entity_type', 'client')
      .eq('local_id', facture.client_id)
      .maybeSingle();
    if (!clientMapping) {
      return json(
        { error: "Le client de cette facture n'est pas relié à un contact Bexio. Synchronisez vos clients (Compte > Intégrations) et vérifiez qu'il provient bien de Bexio." },
        400,
      );
    }

    const { data: items } = await admin
      .from('facture_items')
      .select('description, quantity, unit_price, sort_order')
      .eq('facture_id', facture.id)
      .order('sort_order', { ascending: true });
    if (!items || items.length === 0) return json({ error: 'Cette facture ne contient aucune ligne.' }, 400);

    const { data: settingsRow } = await admin.from('integration_settings').select('entity_settings').eq('integration_id', integration.id).maybeSingle();
    const defaults = (settingsRow?.entity_settings as any)?.invoice_defaults ?? {};

    const accessToken = await getValidAccessToken(admin, integration);
    const companyUserId = decodeBexioCompanyUserId(accessToken);
    const taxId = await resolveBexioSalesTaxId(admin, integration, Number(facture.vat_rate));

    // Field names inferred by analogy with the documented KbPositionArticle
    // shape (cahier des charges section 40) — KbPositionCustom's own field
    // list isn't given in the spec, this is the closest verified example.
    const positions = items.map((item: any) => ({
      type: 'KbPositionCustom',
      text: item.description,
      amount: String(item.quantity),
      unit_price: String(item.unit_price),
      tax_id: taxId ?? undefined,
    }));

    const payload: Record<string, unknown> = {
      title: facture.number ? `Facture ${facture.number}` : 'Facture Cantia',
      contact_id: Number(clientMapping.external_id),
      user_id: companyUserId ?? undefined,
      language_id: defaults.default_language_id ?? undefined,
      bank_account_id: defaults.default_bank_account_id ?? undefined,
      currency_id: defaults.default_currency_id ?? undefined,
      payment_type_id: defaults.default_payment_type_id ?? undefined,
      mwst_type: defaults.default_mwst_type ?? undefined,
      mwst_is_net: defaults.default_mwst_is_net ?? undefined,
      header: '',
      footer: facture.notes ?? '',
      is_valid_from: new Date(facture.created_at).toISOString().slice(0, 10),
      is_valid_to: facture.due_date,
      api_reference: `cantia:facture:${facture.id}`,
      positions,
    };

    const { data: existingMapping } = await admin
      .from('integration_mappings')
      .select('id, external_id')
      .eq('integration_id', integration.id)
      .eq('entity_type', 'facture')
      .eq('local_id', facture.id)
      .maybeSingle();

    let externalId: string;
    let action: 'create' | 'update';
    if (existingMapping) {
      action = 'update';
      await bexioJson(admin, integration, `/2.0/kb_invoice/${existingMapping.external_id}`, { method: 'POST', body: JSON.stringify(payload) });
      externalId = existingMapping.external_id;
      await admin.from('integration_mappings').update({ last_synced_at: new Date().toISOString() }).eq('id', existingMapping.id);
    } else {
      action = 'create';
      const created = await bexioJson<{ id: number }>(admin, integration, '/2.0/kb_invoice', { method: 'POST', body: JSON.stringify(payload) });
      externalId = String(created.id);
      await admin.from('integration_mappings').insert({
        integration_id: integration.id,
        organization_id,
        entity_type: 'facture',
        local_id: facture.id,
        external_id: externalId,
        external_type: 'kb_invoice',
        sync_direction: 'push',
        last_synced_at: new Date().toISOString(),
      });
    }

    await admin.from('integration_sync_logs').insert({
      integration_id: integration.id,
      organization_id,
      entity_type: 'facture',
      local_id: facture.id,
      external_id: externalId,
      direction: 'push',
      action,
      status: 'success',
      payload_summary: { position_count: positions.length },
    });

    return json({ ok: true, external_id: externalId });
  } catch (err) {
    if (err instanceof BexioError) {
      try {
        const body = await req.clone().json().catch(() => null);
        if (body?.organization_id && body?.facture_id) {
          const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
          const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
          const admin = createClient(supabaseUrl, serviceKey);
          const { data: integration } = await admin
            .from('integrations')
            .select('id, organization_id, status')
            .eq('organization_id', body.organization_id)
            .eq('provider', 'bexio')
            .maybeSingle();
          if (integration) {
            await admin.from('integration_sync_logs').insert({
              integration_id: integration.id,
              organization_id: body.organization_id,
              entity_type: 'facture',
              local_id: body.facture_id,
              direction: 'push',
              action: 'error',
              status: 'error',
              error_message: err.message,
            });
          }
        }
      } catch {
        // Logging the error is best-effort — never let a logging failure
        // mask the original BexioError response below.
      }
      return json({ error: err.message, code: err.code }, err.httpStatus ?? 500);
    }
    console.error(err);
    return json({ error: String(err instanceof Error ? err.message : err) }, 500);
  }
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
