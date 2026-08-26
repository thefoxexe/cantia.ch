// NOTE: duplicated verbatim in every bexio-* function directory — the
// Supabase deploy tooling used in this project does not resolve imports
// into a shared _shared/ subdirectory, only flat files alongside index.ts.
// Edit this file in every bexio-* function directory that has a copy.
// Shared Bexio API client used by every bexio-* edge function: token
// refresh (via Supabase Vault), an authenticated fetch wrapper with a
// single retry-after-refresh on 401, paginated GET, and the /search POST
// convention several Bexio resources use. Every endpoint/method/field name
// here comes from the user's own cahier des charges — nothing invented.
//
// deno-lint-ignore-file no-explicit-any

const BEXIO_API_BASE = 'https://api.bexio.com';
const BEXIO_TOKEN_URL = 'https://auth.bexio.com/realms/bexio/protocol/openid-connect/token';

export interface BexioIntegrationRow {
  id: string;
  organization_id: string;
  status: string;
}

export interface BexioCredentialsRow {
  id: string;
  access_token_secret_id: string;
  refresh_token_secret_id: string | null;
  expires_at: string | null;
}

export class BexioError extends Error {
  code: string;
  httpStatus?: number;
  constructor(code: string, message: string, httpStatus?: number) {
    super(message);
    this.code = code;
    this.httpStatus = httpStatus;
  }
}

// Refreshes the access token if it's expired or close to it (60s margin),
// and — critically — always stores whatever refresh_token Bexio returns,
// since it may issue a new one on every renewal (cahier des charges
// section 6: never treat a refresh token as eternal/immutable).
export async function getValidAccessToken(admin: any, integration: BexioIntegrationRow): Promise<string> {
  const { data: creds } = await admin
    .from('integration_credentials')
    .select('id, access_token_secret_id, refresh_token_secret_id, expires_at')
    .eq('integration_id', integration.id)
    .maybeSingle();

  if (!creds) {
    // The integration row can say "connected" while its credentials row is
    // gone (revoked token, manual cleanup, a partial reconnect) — without
    // this, every sync silently fails forever while the UI still shows a
    // green "Connecté" dot. Flip the status so it's visible and actionable.
    await markIntegrationError(admin, integration.id, 'BEXIO_AUTH_ERROR', "Aucun jeton Bexio enregistré — reconnectez l'intégration.");
    throw new BexioError('BEXIO_AUTH_ERROR', "Aucun jeton Bexio enregistré pour cette entreprise.");
  }

  const expiresAt = creds.expires_at ? new Date(creds.expires_at).getTime() : 0;
  const stillValid = expiresAt > Date.now() + 60_000;
  if (stillValid) {
    const { data: token } = await admin.rpc('vault_read_secret', { secret_id: creds.access_token_secret_id });
    if (token) return token as string;
  }

  return refreshAccessToken(admin, integration, creds);
}

async function refreshAccessToken(admin: any, integration: BexioIntegrationRow, creds: BexioCredentialsRow): Promise<string> {
  if (!creds.refresh_token_secret_id) {
    await markIntegrationError(admin, integration.id, 'BEXIO_REFRESH_FAILED', "Aucun jeton de renouvellement disponible — reconnectez Bexio.");
    throw new BexioError('BEXIO_REFRESH_FAILED', "La session Bexio a expiré, reconnectez l'intégration.");
  }
  const { data: refreshToken } = await admin.rpc('vault_read_secret', { secret_id: creds.refresh_token_secret_id });
  const clientId = Deno.env.get('BEXIO_CLIENT_ID');
  const clientSecret = Deno.env.get('BEXIO_CLIENT_SECRET');
  if (!clientId || !clientSecret || !refreshToken) {
    await markIntegrationError(admin, integration.id, 'BEXIO_REFRESH_FAILED', "Renouvellement du jeton Bexio impossible (configuration incomplète).");
    throw new BexioError('BEXIO_REFRESH_FAILED', 'Renouvellement du jeton Bexio impossible.');
  }

  const res = await fetch(BEXIO_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    console.error('Bexio token refresh failed', res.status, detail);
    await markIntegrationError(admin, integration.id, 'BEXIO_REFRESH_FAILED', "Le renouvellement de la connexion Bexio a échoué — reconnectez-la.");
    throw new BexioError('BEXIO_REFRESH_FAILED', 'Le renouvellement de la connexion Bexio a échoué.', res.status);
  }
  const tokens = (await res.json()) as { access_token: string; refresh_token?: string; expires_in?: number };

  await admin.rpc('vault_update_secret', { secret_id: creds.access_token_secret_id, new_secret: tokens.access_token });
  if (tokens.refresh_token) {
    await admin.rpc('vault_update_secret', { secret_id: creds.refresh_token_secret_id, new_secret: tokens.refresh_token });
  }
  const expiresAt = tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000).toISOString() : null;
  await admin.from('integration_credentials').update({ expires_at: expiresAt }).eq('id', creds.id);

  return tokens.access_token;
}

async function markIntegrationError(admin: any, integrationId: string, _code: string, message: string) {
  await admin.from('integrations').update({ status: 'error', last_error: message }).eq('id', integrationId);
}

// Authenticated fetch against api.bexio.com. Retries exactly once, after a
// forced token refresh, on a 401 — Bexio's own access-token expiry can race
// ahead of our stored expires_at in edge cases.
export async function bexioFetch(admin: any, integration: BexioIntegrationRow, path: string, init: RequestInit = {}): Promise<Response> {
  let token = await getValidAccessToken(admin, integration);
  let res = await doFetch(token, path, init);
  if (res.status === 401) {
    const { data: creds } = await admin
      .from('integration_credentials')
      .select('id, access_token_secret_id, refresh_token_secret_id, expires_at')
      .eq('integration_id', integration.id)
      .maybeSingle();
    if (!creds) throw new BexioError('BEXIO_AUTH_ERROR', 'Connexion Bexio introuvable.');
    token = await refreshAccessToken(admin, integration, creds);
    res = await doFetch(token, path, init);
  }
  if (res.status === 403) {
    const detail = await res.text().catch(() => '');
    console.error('Bexio 403', path, detail);
    // Per cahier des charges section 10: a 403 here isn't necessarily a
    // Cantia misconfiguration — the Bexio *user* behind this connection may
    // simply lack rights to the resource, on top of the app having the
    // OAuth scope. Surfaced distinctly so the UI doesn't say "bug".
    throw new BexioError('BEXIO_FORBIDDEN', "Votre utilisateur Bexio ne possède pas les droits nécessaires pour accéder à cette ressource.", 403);
  }
  if (res.status === 429) {
    throw new BexioError('BEXIO_RATE_LIMIT', 'Bexio a limité le nombre de requêtes — réessayez dans un instant.', 429);
  }
  return res;
}

async function doFetch(token: string, path: string, init: RequestInit): Promise<Response> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
    ...(init.body ? { 'Content-Type': 'application/json' } : {}),
    ...(init.headers as Record<string, string> | undefined),
  };
  return fetch(`${BEXIO_API_BASE}${path}`, { ...init, headers });
}

// Bexio's validation error bodies are typically either a single
// {message, error_code} object or an array of {field?, message} entries —
// whichever shape comes back, this pulls out something a human can act on
// instead of the previous "champ manquant ou invalide" black box.
//
// Some endpoints (observed on kb_offer) wrap the real per-field errors in a
// nested key (errors/error_list/details) alongside a generic top-level
// "message" summary like "The form could not be saved due to the following
// errors:" — describeOne() on the top-level object alone used to return
// just that summary and silently drop the nested detail entirely, so the
// UI showed a sentence with no actual reason after the colon. Both the
// top-level message and any nested entries are now collected.
function describeBexioErrorBody(detail: string): string | null {
  function describeOne(e: unknown): string | null {
    if (typeof e === 'string') return e;
    if (e && typeof e === 'object') {
      const field = (e as any).field ?? (e as any).name;
      const msg = (e as any).message ?? (e as any).error ?? (e as any).detail;
      if (field && msg) return `${field}: ${msg}`;
      return msg ?? field ?? null;
    }
    return null;
  }
  try {
    const parsed = JSON.parse(detail);
    const parts: string[] = [];
    if (Array.isArray(parsed)) {
      for (const e of parsed) {
        const d = describeOne(e);
        if (d) parts.push(d);
      }
    } else if (parsed && typeof parsed === 'object') {
      const top = describeOne(parsed);
      if (top) parts.push(top);
      const nested = (parsed as any).errors ?? (parsed as any).error_list ?? (parsed as any).details;
      if (Array.isArray(nested)) {
        for (const e of nested) {
          const d = describeOne(e);
          if (d) parts.push(d);
        }
      } else if (nested && typeof nested === 'object') {
        for (const [key, value] of Object.entries(nested)) {
          for (const v of Array.isArray(value) ? value : [value]) {
            parts.push(`${key}: ${typeof v === 'string' ? v : JSON.stringify(v)}`);
          }
        }
      }
    }
    // Dedupe: the top-level summary and a single nested entry sometimes
    // repeat the exact same text.
    const unique = [...new Set(parts)];
    return unique.length ? unique.join(' · ') : null;
  } catch {
    return detail.trim() ? detail.trim().slice(0, 600) : null;
  }
}

export async function bexioJson<T>(admin: any, integration: BexioIntegrationRow, path: string, init?: RequestInit): Promise<T> {
  const res = await bexioFetch(admin, integration, path, init);
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    console.error('Bexio API error', path, res.status, detail);
    if (res.status === 422) {
      const described = describeBexioErrorBody(detail);
      throw new BexioError(
        'BEXIO_VALIDATION_ERROR',
        described ? `Bexio a refusé la donnée envoyée : ${described}` : "Bexio a refusé la donnée envoyée (champ manquant ou invalide).",
        422,
      );
    }
    if (res.status === 404) {
      throw new BexioError('BEXIO_NOT_FOUND', 'Ressource introuvable dans Bexio.', 404);
    }
    throw new BexioError('BEXIO_NETWORK_ERROR', `Erreur Bexio (${res.status}).`, res.status);
  }
  if (res.status === 204) return undefined as unknown as T;
  return (await res.json()) as T;
}

// Bexio's list endpoints paginate with limit/offset — never assume one page
// covers a whole account (cahier des charges section 12). Sequential, not
// parallel: keeps this well inside any reasonable rate limit on its own.
export async function fetchAllBexioPages<T>(admin: any, integration: BexioIntegrationRow, path: string, limit = 500, maxPages = 20): Promise<T[]> {
  const separator = path.includes('?') ? '&' : '?';
  const results: T[] = [];
  for (let page = 0; page < maxPages; page++) {
    const offset = page * limit;
    const batch = await bexioJson<T[]>(admin, integration, `${path}${separator}limit=${limit}&offset=${offset}`);
    if (!Array.isArray(batch) || batch.length === 0) break;
    results.push(...batch);
    if (batch.length < limit) break;
  }
  return results;
}

export type BexioSearchCriteria = '=' | '!=' | '>' | '>=' | '<' | '<=' | 'like' | 'not_like' | 'is_null' | 'not_null' | 'in' | 'not_in';

export async function bexioSearch<T>(
  admin: any,
  integration: BexioIntegrationRow,
  path: string,
  filters: { field: string; value?: unknown; criteria: BexioSearchCriteria }[],
): Promise<T[]> {
  // The search endpoints require an array body, never a bare object.
  return bexioJson<T[]>(admin, integration, path, { method: 'POST', body: JSON.stringify(filters) });
}
