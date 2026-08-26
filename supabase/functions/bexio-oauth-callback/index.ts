import { createClient } from 'npm:@supabase/supabase-js@2';
import { syncBexioArticles, syncBexioContacts, syncBexioSettings } from './bexio-sync-logic.ts';

// Hit directly by the user's browser when Bexio redirects back after
// consent — there is no Cantia session/Authorization header here at all,
// only whatever Bexio put on the query string. Everything this function
// trusts (which organization, which user) comes from the one-time `state`
// row created by bexio-oauth-start, never from the request itself.
const BEXIO_TOKEN_URL = 'https://auth.bexio.com/realms/bexio/protocol/openid-connect/token';
const BEXIO_USERINFO_URL = 'https://auth.bexio.com/realms/bexio/protocol/openid-connect/userinfo';

const APP_INTEGRATIONS_URL = 'https://app.cantia.ch/compte/integrations';
const STATE_MAX_AGE_MS = 10 * 60 * 1000;

Deno.serve(async (req: Request) => {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const bexioError = url.searchParams.get('error');
  const bexioErrorDescription = url.searchParams.get('error_description');

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const admin = createClient(supabaseUrl, serviceKey);

  if (bexioError) {
    return redirect(`error&message=${encodeURIComponent(bexioErrorDescription || bexioError)}`);
  }
  if (!code || !state) {
    return redirect('error&message=' + encodeURIComponent('Réponse Bexio incomplète.'));
  }

  // Consume the state row immediately — one-time use regardless of whether
  // the rest of the exchange below succeeds, so a captured/replayed
  // callback URL can never be used twice.
  const { data: stateRow } = await admin.from('integration_oauth_states').select('*').eq('state', state).maybeSingle();
  if (stateRow) await admin.from('integration_oauth_states').delete().eq('state', state);

  if (!stateRow) {
    return redirect('error&message=' + encodeURIComponent('Session de connexion invalide ou déjà utilisée.'));
  }
  if (Date.now() - new Date(stateRow.created_at).getTime() > STATE_MAX_AGE_MS) {
    return redirect('error&message=' + encodeURIComponent('Session de connexion expirée, merci de recommencer.'));
  }

  const clientId = Deno.env.get('BEXIO_CLIENT_ID');
  const clientSecret = Deno.env.get('BEXIO_CLIENT_SECRET');
  if (!clientId || !clientSecret) {
    return redirect('error&message=' + encodeURIComponent("L'intégration Bexio n'est pas configurée côté serveur."));
  }
  const redirectUri = Deno.env.get('BEXIO_REDIRECT_URI') ?? `${supabaseUrl}/functions/v1/bexio-oauth-callback`;

  try {
    const tokenRes = await fetch(BEXIO_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });
    if (!tokenRes.ok) {
      const detail = await tokenRes.text().catch(() => '');
      console.error('Bexio token exchange failed', tokenRes.status, detail);
      return redirect('error&message=' + encodeURIComponent("L'échange du code d'autorisation avec Bexio a échoué."));
    }
    const tokens = (await tokenRes.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in?: number;
      scope?: string;
    };

    // company_profile claims (company_id/company_name) are only cosmetic —
    // if userinfo fails or doesn't carry them, the connection still
    // succeeds; the org just shows the raw company id until confirmed
    // otherwise against a real Bexio account.
    let companyId: string | null = null;
    let companyName: string | null = null;
    try {
      const userinfoRes = await fetch(BEXIO_USERINFO_URL, {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      if (userinfoRes.ok) {
        const info = (await userinfoRes.json()) as Record<string, unknown>;
        const nested = (info.company_profile as Record<string, unknown> | undefined) ?? info;
        companyId = pickString(nested.company_id) ?? pickString(info.company_id);
        companyName = pickString(nested.company_name) ?? pickString(info.company_name);
      } else {
        console.error('Bexio userinfo failed', userinfoRes.status, await userinfoRes.text().catch(() => ''));
      }
    } catch (err) {
      console.error('Bexio userinfo request threw', err);
    }

    const { data: existingIntegration } = await admin
      .from('integrations')
      .select('id')
      .eq('organization_id', stateRow.organization_id)
      .eq('provider', 'bexio')
      .maybeSingle();

    const { data: integration, error: upsertIntegrationError } = await admin
      .from('integrations')
      .upsert(
        {
          organization_id: stateRow.organization_id,
          provider: 'bexio',
          status: 'connected',
          external_company_id: companyId,
          external_company_name: companyName,
          connected_by: stateRow.created_by,
          last_error: null,
        },
        { onConflict: 'organization_id,provider' },
      )
      .select('id')
      .single();
    if (upsertIntegrationError || !integration) {
      console.error('Failed to upsert integration row', upsertIntegrationError);
      return redirect('error&message=' + encodeURIComponent('Impossible d’enregistrer la connexion Bexio.'));
    }

    const expiresAt = tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000).toISOString() : null;
    const scopes = tokens.scope ? tokens.scope.split(' ') : [];

    const { data: existingCredentials } = await admin
      .from('integration_credentials')
      .select('id, access_token_secret_id, refresh_token_secret_id')
      .eq('integration_id', integration.id)
      .maybeSingle();

    if (existingCredentials) {
      // Reconnecting: update the existing Vault secrets in place rather
      // than creating fresh ones each time and orphaning the old ones.
      await admin.rpc('vault_update_secret', { secret_id: existingCredentials.access_token_secret_id, new_secret: tokens.access_token });
      let refreshSecretId = existingCredentials.refresh_token_secret_id;
      if (tokens.refresh_token) {
        if (refreshSecretId) {
          await admin.rpc('vault_update_secret', { secret_id: refreshSecretId, new_secret: tokens.refresh_token });
        } else {
          const { data: newRefreshId } = await admin.rpc('vault_create_secret', {
            secret: tokens.refresh_token,
            secret_name: `bexio_refresh_${integration.id}`,
          });
          refreshSecretId = newRefreshId ?? null;
        }
      }
      await admin
        .from('integration_credentials')
        .update({ refresh_token_secret_id: refreshSecretId, expires_at: expiresAt, scopes })
        .eq('id', existingCredentials.id);
    } else {
      const { data: accessSecretId } = await admin.rpc('vault_create_secret', {
        secret: tokens.access_token,
        secret_name: `bexio_access_${integration.id}`,
      });
      let refreshSecretId: string | null = null;
      if (tokens.refresh_token) {
        const { data: newRefreshId } = await admin.rpc('vault_create_secret', {
          secret: tokens.refresh_token,
          secret_name: `bexio_refresh_${integration.id}`,
        });
        refreshSecretId = newRefreshId ?? null;
      }
      await admin.from('integration_credentials').insert({
        integration_id: integration.id,
        access_token_secret_id: accessSecretId,
        refresh_token_secret_id: refreshSecretId,
        expires_at: expiresAt,
        scopes,
      });
    }

    // existingIntegration is only used to decide log wording; not required
    // for correctness (upsert above already handles create-vs-update).
    void existingIntegration;

    // Initial import per cahier des charges section 79 — best-effort: a
    // failure here shouldn't undo a successful connection, the user can
    // always retry from "Synchroniser maintenant" once connected.
    const integrationRow = { id: integration.id, organization_id: stateRow.organization_id, status: 'connected' };
    await syncBexioSettings(admin, integrationRow).catch((err) => console.error('Initial Bexio settings sync failed', err));
    await syncBexioContacts(admin, integrationRow).catch((err) => console.error('Initial Bexio contacts sync failed', err));
    await syncBexioArticles(admin, integrationRow).catch((err) => console.error('Initial Bexio articles sync failed', err));

    return redirect('connected');
  } catch (err) {
    console.error('Bexio OAuth callback failed', err);
    return redirect('error&message=' + encodeURIComponent('Une erreur inattendue est survenue lors de la connexion à Bexio.'));
  }
});

function pickString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function redirect(bexioParam: string): Response {
  return new Response(null, {
    status: 302,
    headers: { Location: `${APP_INTEGRATIONS_URL}?bexio=${bexioParam}` },
  });
}
