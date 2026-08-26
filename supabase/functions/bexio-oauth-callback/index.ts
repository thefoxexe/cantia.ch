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

    const expiresAt = tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000).toISOString() : null;
    const scopes = tokens.scope ? tokens.scope.split(' ') : [];
    // Connections made before contact_edit was added to the requested
    // scope set only carry contact_show — this flag tells the UI a
    // reconnect is needed before client-push to Bexio will work. Cleared
    // automatically the moment Bexio actually grants contact_edit.
    const needsReconnect = !scopes.includes('contact_edit');

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
          needs_reconnect: needsReconnect,
        },
        { onConflict: 'organization_id,provider' },
      )
      .select('id')
      .single();
    if (upsertIntegrationError || !integration) {
      console.error('Failed to upsert integration row', upsertIntegrationError);
      return redirect('error&message=' + encodeURIComponent('Impossible d’enregistrer la connexion Bexio.'));
    }

    const { data: existingCredentials } = await admin
      .from('integration_credentials')
      .select('id, access_token_secret_id, refresh_token_secret_id')
      .eq('integration_id', integration.id)
      .maybeSingle();

    // Stored by name via vault_upsert_secret (update-if-exists,
    // create-otherwise) rather than always calling vault_create_secret —
    // bexio-disconnect overwrites a secret's value but never deletes it
    // (Vault has no public delete function), only removing the
    // integration_credentials row. A plain create with the same
    // `bexio_access_<integration.id>` name after any earlier disconnect
    // hit a duplicate-name error every time, silently (this RPC's error
    // was never checked), leaving the org's connection unusable while the
    // UI still briefly claimed "connected". Every write below is checked
    // and any failure now surfaces as a real error instead.
    let credentialsOk = true;
    let credentialsError: string | null = null;

    if (existingCredentials) {
      const { error: accessErr } = await admin.rpc('vault_update_secret', {
        secret_id: existingCredentials.access_token_secret_id,
        new_secret: tokens.access_token,
      });
      if (accessErr) {
        credentialsOk = false;
        credentialsError = accessErr.message;
      }
      let refreshSecretId = existingCredentials.refresh_token_secret_id;
      if (credentialsOk && tokens.refresh_token) {
        if (refreshSecretId) {
          const { error: refreshErr } = await admin.rpc('vault_update_secret', { secret_id: refreshSecretId, new_secret: tokens.refresh_token });
          if (refreshErr) {
            credentialsOk = false;
            credentialsError = refreshErr.message;
          }
        } else {
          const { data: newRefreshId, error: refreshErr } = await admin.rpc('vault_upsert_secret', {
            secret_name: `bexio_refresh_${integration.id}`,
            secret: tokens.refresh_token,
          });
          if (refreshErr || !newRefreshId) {
            credentialsOk = false;
            credentialsError = refreshErr?.message ?? 'Échec de stockage du jeton de renouvellement Bexio.';
          }
          refreshSecretId = newRefreshId ?? null;
        }
      }
      if (credentialsOk) {
        const { error: updateErr } = await admin
          .from('integration_credentials')
          .update({ refresh_token_secret_id: refreshSecretId, expires_at: expiresAt, scopes })
          .eq('id', existingCredentials.id);
        if (updateErr) {
          credentialsOk = false;
          credentialsError = updateErr.message;
        }
      }
    } else {
      const { data: accessSecretId, error: accessErr } = await admin.rpc('vault_upsert_secret', {
        secret_name: `bexio_access_${integration.id}`,
        secret: tokens.access_token,
      });
      if (accessErr || !accessSecretId) {
        credentialsOk = false;
        credentialsError = accessErr?.message ?? "Échec de stockage du jeton d'accès Bexio.";
      }
      let refreshSecretId: string | null = null;
      if (credentialsOk && tokens.refresh_token) {
        const { data: newRefreshId, error: refreshErr } = await admin.rpc('vault_upsert_secret', {
          secret_name: `bexio_refresh_${integration.id}`,
          secret: tokens.refresh_token,
        });
        if (refreshErr) {
          credentialsOk = false;
          credentialsError = refreshErr.message;
        }
        refreshSecretId = newRefreshId ?? null;
      }
      if (credentialsOk) {
        const { error: insertErr } = await admin.from('integration_credentials').insert({
          integration_id: integration.id,
          access_token_secret_id: accessSecretId,
          refresh_token_secret_id: refreshSecretId,
          expires_at: expiresAt,
          scopes,
        });
        if (insertErr) {
          credentialsOk = false;
          credentialsError = insertErr.message;
        }
      }
    }

    if (!credentialsOk) {
      console.error('Failed to store Bexio credentials', credentialsError);
      await admin
        .from('integrations')
        .update({ status: 'error', last_error: "Impossible d'enregistrer les jetons Bexio — réessayez la connexion." })
        .eq('id', integration.id);
      return redirect('error&message=' + encodeURIComponent("La connexion à Bexio a échoué lors de l'enregistrement des jetons — réessayez."));
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
