import { createClient } from 'npm:@supabase/supabase-js@2';
import { bexioJson, BexioError, decodeBexioCompanyUserId, getValidAccessToken, resolveBexioSalesTaxId } from './bexio.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Pushes one Cantia devis to Bexio as a kb_offer — Bexio's "Offre"/"Quote"
// object, per the client's own kb_offer cahier des charges (2026-08-26).
// Created as a draft (Bexio's default kb_offer state on POST) — never
// issued automatically, matching the same "create as draft, let the user
// decide" pattern already used by bexio-push-invoice.
//
// Two anti-duplicate layers, both from the cahier des charges (section 11):
// 1. integration_mappings (entity_type='devis') — the normal fast path.
// 2. A POST /2.0/kb_offer/search on api_reference before ever creating, in
//    case a mapping row was lost (crash between create and mapping insert,
//    manual DB edit, etc.) — this is stronger than bexio-push-invoice does
//    today because the cahier des charges explicitly calls out this exact
//    failure mode with pseudo-code, not something inferred.
//
// Two fields confirmed required by a live 422 ("user_id: Pflichtfeld",
// "positions: 0 [tax_id [Pflichtfeld]]"): the offer's own user_id (same
// company_user_id token claim used by bexio-push-client) and a tax_id on
// every position, resolved from the devis's own vat_rate against the
// account's actual tax rates (GET /3.0/taxes — see resolveBexioSalesTaxId
// in bexio.ts) rather than a hardcoded id. account_id/unit_id on positions
// are still left out — Bexio's 422 never flagged them as required, so
// guessing them risks silently misclassifying the line instead of letting
// a real BEXIO_VALIDATION_ERROR surface.
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  let orgIdForErrorLog: string | undefined;
  let devisIdForErrorLog: string | undefined;

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

    const { organization_id, devis_id } = await req.json();
    if (!organization_id || !devis_id) return json({ error: 'organization_id et devis_id requis' }, 400);
    orgIdForErrorLog = organization_id;
    devisIdForErrorLog = devis_id;

    const { data: isAdmin } = await userClient.rpc('is_org_admin', { org_id: organization_id });
    if (!isAdmin) return json({ error: "Seul un administrateur de l'entreprise peut envoyer un devis vers Bexio." }, 403);

    const { data: org } = await admin.from('organizations').select('plan_id, devis_validity_days').eq('id', organization_id).maybeSingle();
    const { data: plan } = await admin.from('plans').select('has_bexio_integration').eq('id', org?.plan_id ?? '').maybeSingle();
    if (!plan?.has_bexio_integration) return json({ error: "L'intégration Bexio nécessite le plan Équipe ou supérieur." }, 403);

    const { data: integration } = await admin
      .from('integrations')
      .select('id, organization_id, status, needs_reconnect')
      .eq('organization_id', organization_id)
      .eq('provider', 'bexio')
      .maybeSingle();
    if (!integration || integration.status !== 'connected') return json({ error: "Bexio n'est pas connecté pour cette entreprise." }, 400);
    if (integration.needs_reconnect) {
      return json(
        { error: "La connexion Bexio doit être renouvelée (nouveau droit requis pour envoyer des devis vers Bexio). Reconnectez Bexio depuis Compte > Intégrations." },
        400,
      );
    }

    const { data: devis } = await admin
      .from('devis')
      .select('id, organization_id, number, client_id, notes, vat_rate, created_at')
      .eq('id', devis_id)
      .eq('organization_id', organization_id)
      .maybeSingle();
    if (!devis) return json({ error: 'Devis introuvable.' }, 404);
    if (!devis.client_id) {
      return json({ error: "Ce devis n'a pas de client associé — impossible de l'envoyer vers Bexio." }, 400);
    }

    const { data: clientMapping } = await admin
      .from('integration_mappings')
      .select('external_id')
      .eq('integration_id', integration.id)
      .eq('entity_type', 'client')
      .eq('local_id', devis.client_id)
      .maybeSingle();
    if (!clientMapping) {
      return json(
        { error: "Le client de ce devis n'est pas relié à un contact Bexio. Synchronisez vos clients (Compte > Intégrations) et vérifiez qu'il provient bien de Bexio." },
        400,
      );
    }

    const { data: items } = await admin
      .from('devis_items')
      .select('description, quantity, unit_price, sort_order')
      .eq('devis_id', devis.id)
      .order('sort_order', { ascending: true });
    if (!items || items.length === 0) return json({ error: 'Ce devis ne contient aucune ligne.' }, 400);

    const { data: settingsRow } = await admin.from('integration_settings').select('entity_settings').eq('integration_id', integration.id).maybeSingle();
    const defaults = (settingsRow?.entity_settings as any)?.quote_defaults ?? {};

    const accessToken = await getValidAccessToken(admin, integration);
    const companyUserId = decodeBexioCompanyUserId(accessToken);
    const taxId = await resolveBexioSalesTaxId(admin, integration, Number(devis.vat_rate));

    const positions = items.map((item: any) => ({
      type: 'KbPositionCustom',
      text: item.description,
      amount: String(item.quantity),
      unit_price: String(item.unit_price),
      tax_id: taxId ?? undefined,
    }));

    // is_valid_until: the devis itself carries no expiry date of its own —
    // only the organization-wide devis_validity_days does (same value the
    // devis PDF/portal already use to describe "offre valable N jours").
    // Falls back to Bexio's own default_time_period_in_days from
    // kb_item_setting if the org somehow has neither, and is left out of
    // the payload entirely (letting Bexio apply its own default) only if
    // both are unavailable — never a guessed number of days.
    const validFrom = new Date(devis.created_at);
    const validityDays = org?.devis_validity_days ?? defaults.default_time_period_in_days ?? null;
    const isValidUntil = validityDays ? new Date(validFrom.getTime() + validityDays * 86400000).toISOString().slice(0, 10) : undefined;

    const payload: Record<string, unknown> = {
      title: devis.number ? `Devis ${devis.number}` : 'Devis Cantia',
      contact_id: Number(clientMapping.external_id),
      user_id: companyUserId ?? undefined,
      language_id: defaults.default_language_id ?? undefined,
      bank_account_id: defaults.default_bank_account_id ?? undefined,
      currency_id: defaults.default_currency_id ?? undefined,
      payment_type_id: defaults.default_payment_type_id ?? undefined,
      header: '',
      footer: devis.notes ?? '',
      mwst_type: defaults.default_mwst_type ?? undefined,
      mwst_is_net: defaults.default_mwst_is_net ?? undefined,
      show_position_taxes: defaults.default_show_position_taxes ?? undefined,
      is_valid_from: validFrom.toISOString().slice(0, 10),
      is_valid_until: isValidUntil,
      api_reference: `cantia:quote:${devis.id}`,
      positions,
    };

    const { data: existingMapping } = await admin
      .from('integration_mappings')
      .select('id, external_id')
      .eq('integration_id', integration.id)
      .eq('entity_type', 'devis')
      .eq('local_id', devis.id)
      .maybeSingle();

    let externalId: string | null = existingMapping?.external_id ?? null;
    let mappingId: string | null = existingMapping?.id ?? null;

    // Anti-duplicate safety net (cahier des charges section 11): if no local
    // mapping exists, search Bexio itself by api_reference before creating
    // — covers the case where a previous push created the offer but the
    // mapping insert that should have followed never landed (crash, retry).
    if (!externalId) {
      const found = await bexioJson<{ id: number }[]>(admin, integration, '/2.0/kb_offer/search', {
        method: 'POST',
        body: JSON.stringify([{ field: 'api_reference', value: `cantia:quote:${devis.id}`, criteria: '=' }]),
      });
      if (Array.isArray(found) && found.length > 0) {
        externalId = String(found[0].id);
      }
    }

    let action: 'create' | 'update';
    if (externalId) {
      action = 'update';
      await bexioJson(admin, integration, `/2.0/kb_offer/${externalId}`, { method: 'POST', body: JSON.stringify(payload) });
      if (mappingId) {
        await admin.from('integration_mappings').update({ last_synced_at: new Date().toISOString() }).eq('id', mappingId);
      } else {
        await admin.from('integration_mappings').insert({
          integration_id: integration.id,
          organization_id,
          entity_type: 'devis',
          local_id: devis.id,
          external_id: externalId,
          external_type: 'kb_offer',
          sync_direction: 'push',
          last_synced_at: new Date().toISOString(),
        });
      }
    } else {
      action = 'create';
      const created = await bexioJson<{ id: number }>(admin, integration, '/2.0/kb_offer', { method: 'POST', body: JSON.stringify(payload) });
      externalId = String(created.id);
      await admin.from('integration_mappings').insert({
        integration_id: integration.id,
        organization_id,
        entity_type: 'devis',
        local_id: devis.id,
        external_id: externalId,
        external_type: 'kb_offer',
        sync_direction: 'push',
        last_synced_at: new Date().toISOString(),
      });
    }

    // Best-effort immediate refresh of the display fields (document_nr etc.)
    // so the UI shows the real Bexio number right after this push instead
    // of waiting for the next scheduled pull.
    try {
      const offer = await bexioJson<{ document_nr: string | null; kb_item_status_id: number | null; network_link: string | null }>(
        admin,
        integration,
        `/2.0/kb_offer/${externalId}`,
      );
      await admin
        .from('devis')
        .update({ bexio_document_nr: offer.document_nr, bexio_status_id: offer.kb_item_status_id, bexio_network_link: offer.network_link })
        .eq('id', devis.id);
    } catch (err) {
      console.error('Failed to refresh devis Bexio display fields after push', err);
    }

    await admin.from('integration_sync_logs').insert({
      integration_id: integration.id,
      organization_id,
      entity_type: 'devis',
      local_id: devis.id,
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
        if (orgIdForErrorLog && devisIdForErrorLog) {
          const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
          const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
          const admin = createClient(supabaseUrl, serviceKey);
          const { data: integration } = await admin
            .from('integrations')
            .select('id')
            .eq('organization_id', orgIdForErrorLog)
            .eq('provider', 'bexio')
            .maybeSingle();
          if (integration) {
            await admin.from('integration_sync_logs').insert({
              integration_id: integration.id,
              organization_id: orgIdForErrorLog,
              entity_type: 'devis',
              local_id: devisIdForErrorLog,
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
