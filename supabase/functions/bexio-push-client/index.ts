import { createClient } from 'npm:@supabase/supabase-js@2';
import { bexioJson, BexioError, decodeBexioCompanyUserId, getValidAccessToken } from './bexio.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Pushes one Cantia client to Bexio as a new contact (POST /2.0/contact) —
// the missing other direction of contact sync (Bexio -> Cantia already
// existed via syncBexioContacts). Called automatically, best-effort, right
// after a client is created in Cantia (see lib/api/clients.ts::createClient)
// so a secretary creating a client doesn't have to wait for the hourly pull
// or click a manual sync button. Authorized by org membership, not
// admin-only — this is a background side effect of an action a normal
// member is already allowed to take, not a new sensitive admin capability.
//
// Fields sent: name_1, mail, phone_fixed, address, remarks, plus three
// fields Bexio's own form rejected the first live attempt without
// ("Pflichtfeld" on contact_type_id/user_id/owner_id) — confirmed by
// inspecting GET /2.0/contact_type (1 = Firma/company, 2 = Privat/
// individual) and an existing contact's own user_id/owner_id (both equal
// the access token's `company_user_id` JWT claim — see
// decodeBexioCompanyUserId in bexio.ts). user_id/owner_id are left out
// only if that claim can't be decoded, so a real failure still surfaces
// as an honest BEXIO_VALIDATION_ERROR instead of a guessed value.
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  let orgIdForErrorLog: string | undefined;
  let clientIdForErrorLog: string | undefined;

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

    const { organization_id, client_id } = await req.json();
    if (!organization_id || !client_id) return json({ error: 'organization_id et client_id requis' }, 400);
    orgIdForErrorLog = organization_id;
    clientIdForErrorLog = client_id;

    const { data: isMember } = await userClient.rpc('is_org_member', { org_id: organization_id });
    if (!isMember) return json({ error: "Vous n'appartenez pas à cette entreprise." }, 403);

    const { data: org } = await admin.from('organizations').select('plan_id').eq('id', organization_id).maybeSingle();
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
        { error: "La connexion Bexio doit être renouvelée (nouveau droit requis pour créer des clients côté Bexio). Reconnectez Bexio depuis Compte > Intégrations." },
        400,
      );
    }

    const { data: client } = await admin
      .from('clients')
      .select('id, organization_id, type, name, company_name, email, phone, address, notes')
      .eq('id', client_id)
      .eq('organization_id', organization_id)
      .maybeSingle();
    if (!client) return json({ error: 'Client introuvable.' }, 404);

    const { data: existingMapping } = await admin
      .from('integration_mappings')
      .select('external_id')
      .eq('integration_id', integration.id)
      .eq('entity_type', 'client')
      .eq('local_id', client.id)
      .maybeSingle();
    if (existingMapping) {
      // Already linked (pushed before, or originally pulled from Bexio) —
      // no-op rather than re-create a duplicate contact.
      return json({ ok: true, external_id: existingMapping.external_id, skipped: true });
    }

    const accessToken = await getValidAccessToken(admin, integration);
    const companyUserId = decodeBexioCompanyUserId(accessToken);

    const payload: Record<string, unknown> = {
      name_1: client.type === 'entreprise' ? client.company_name || client.name : client.name,
      contact_type_id: client.type === 'entreprise' ? 1 : 2,
      mail: client.email ?? undefined,
      phone_fixed: client.phone ?? undefined,
      address: client.address ?? undefined,
      remarks: client.notes ?? undefined,
      user_id: companyUserId ?? undefined,
      owner_id: companyUserId ?? undefined,
    };

    const created = await bexioJson<{ id: number }>(admin, integration, '/2.0/contact', { method: 'POST', body: JSON.stringify(payload) });
    const externalId = String(created.id);

    await admin.from('integration_mappings').insert({
      integration_id: integration.id,
      organization_id,
      entity_type: 'client',
      local_id: client.id,
      external_id: externalId,
      external_type: 'contact',
      sync_direction: 'push',
      last_synced_at: new Date().toISOString(),
    });

    await admin.from('integration_sync_logs').insert({
      integration_id: integration.id,
      organization_id,
      entity_type: 'client',
      local_id: client.id,
      external_id: externalId,
      direction: 'push',
      action: 'create',
      status: 'success',
    });

    return json({ ok: true, external_id: externalId });
  } catch (err) {
    if (err instanceof BexioError) {
      try {
        if (orgIdForErrorLog && clientIdForErrorLog) {
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
              entity_type: 'client',
              local_id: clientIdForErrorLog,
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
