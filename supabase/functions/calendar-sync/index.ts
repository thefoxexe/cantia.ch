import { createClient } from 'npm:@supabase/supabase-js@2';
import { fromGoogle, fromMicrosoft, toGoogle, toMicrosoft, TZ, addDays, type IncomingEvent, type PlanningRow } from './map.ts';

// Planning ↔ Google Calendar / Outlook, per person (migration
// 20261007140000_calendar_sync). One function, deployed without JWT
// verification because the provider's redirect (GET) carries no Cantia
// session; every POST checks the caller itself.
//   POST { action: 'connect', organization_id, provider, return_to } → { url }
//   GET  ?code&state  (redirect from Google / Microsoft) → back to the app
//   POST { action: 'disconnect', connection_id }
//   POST { action: 'sync', organization_id, user_ids? } → { synced }
// Secrets: GOOGLE_CALENDAR_CLIENT_ID / _SECRET, MICROSOFT_CALENDAR_CLIENT_ID
// / _SECRET. Redirect URI to register with both:
//   https://app.cantia.ch/api/calendar/callback

type Provider = 'google' | 'microsoft';
// deno-lint-ignore no-explicit-any
type Db = any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const APP_PLANNING = 'https://app.cantia.ch/planning';
const STATE_MAX_AGE_MS = 10 * 60 * 1000;
const MAX_PUSH = 150;
const MAX_PAGES = 15;

const PROVIDERS = {
  google: {
    authorize: 'https://accounts.google.com/o/oauth2/v2/auth',
    token: 'https://oauth2.googleapis.com/token',
    scope: 'openid email https://www.googleapis.com/auth/calendar.events',
    id: () => Deno.env.get('GOOGLE_CALENDAR_CLIENT_ID'),
    secret: () => Deno.env.get('GOOGLE_CALENDAR_CLIENT_SECRET'),
  },
  microsoft: {
    authorize: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    token: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    scope: 'offline_access openid email User.Read Calendars.ReadWrite',
    id: () => Deno.env.get('MICROSOFT_CALENDAR_CLIENT_ID'),
    secret: () => Deno.env.get('MICROSOFT_CALENDAR_CLIENT_SECRET'),
  },
} as const;

// Proxied to this function by Netlify (netlify.toml): only cantia.ch is
// declared to Google and Microsoft.
const redirectUri = () => Deno.env.get('CALENDAR_REDIRECT_URI') ?? 'https://app.cantia.ch/api/calendar/callback';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  if (req.method === 'GET') return callback(new URL(req.url), admin);

  try {
    const userClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    });
    const {
      data: { user },
    } = await userClient.auth.getUser();
    if (!user) return json({ error: 'Non authentifié' }, 401);
    const body = await req.json();

    if (body.action === 'connect') {
      const provider = body.provider as Provider;
      const conf = PROVIDERS[provider];
      if (!conf) return json({ error: 'Agenda inconnu' }, 400);
      if (!conf.id() || !conf.secret()) return json({ error: 'La connexion des agendas n’est pas encore configurée côté serveur.' }, 500);
      const { data: allowed } = await userClient.rpc('can_view_org_planning', { org_id: body.organization_id });
      if (allowed !== true) return json({ error: 'Accès refusé' }, 403);
      const state = `${crypto.randomUUID()}${crypto.randomUUID()}`.replace(/-/g, '');
      const returnTo = safeReturn(body.return_to);
      const { error } = await admin.from('calendar_oauth_states').insert({ state, organization_id: body.organization_id, user_id: user.id, provider, return_to: returnTo });
      if (error) return json({ error: error.message }, 500);
      const url = new URL(conf.authorize);
      url.searchParams.set('client_id', conf.id()!);
      url.searchParams.set('redirect_uri', redirectUri());
      url.searchParams.set('response_type', 'code');
      url.searchParams.set('scope', conf.scope);
      url.searchParams.set('state', state);
      if (provider === 'google') {
        url.searchParams.set('access_type', 'offline');
        url.searchParams.set('prompt', 'consent');
        url.searchParams.set('include_granted_scopes', 'true');
      } else {
        url.searchParams.set('response_mode', 'query');
        url.searchParams.set('prompt', 'select_account');
      }
      return json({ url: url.toString() });
    }

    if (body.action === 'disconnect') {
      const { data: conn } = await admin.from('calendar_connections').select('id, user_id, access_token_secret_id, refresh_token_secret_id').eq('id', body.connection_id).maybeSingle();
      if (!conn || conn.user_id !== user.id) return json({ error: 'Connexion introuvable' }, 404);
      // Vault has no delete: the tokens are blanked, then the row goes
      // (with the appointments it had imported, by cascade).
      for (const id of [conn.access_token_secret_id, conn.refresh_token_secret_id]) if (id) await admin.rpc('vault_update_secret', { secret_id: id, new_secret: '' });
      await admin.from('calendar_connections').delete().eq('id', conn.id);
      return json({ ok: true });
    }

    if (body.action === 'sync') {
      const org = body.organization_id as string;
      const { data: allowed } = await userClient.rpc('can_view_org_planning', { org_id: org });
      if (allowed !== true) return json({ error: 'Accès refusé' }, 403);
      // Own calendars, plus those of the members whose event the caller just
      // changed (an admin planning someone else) — same company only.
      const ids = [...new Set([user.id, ...((Array.isArray(body.user_ids) ? body.user_ids : []) as string[])])].slice(0, 30);
      const { data: conns } = await admin.from('calendar_connections').select('*').eq('organization_id', org).in('user_id', ids);
      let synced = 0;
      for (const c of conns ?? []) {
        try {
          await syncConnection(admin, c);
          synced += 1;
        } catch (e) {
          console.error('calendar sync failed', c.id, e);
          await admin.from('calendar_connections').update({ status: 'error', last_error: String(e instanceof Error ? e.message : e).slice(0, 300) }).eq('id', c.id);
        }
      }
      return json({ synced });
    }
    return json({ error: 'Action inconnue' }, 400);
  } catch (err) {
    console.error(err);
    return json({ error: String(err instanceof Error ? err.message : err) }, 500);
  }
});

function safeReturn(raw: unknown): string {
  if (typeof raw !== 'string') return APP_PLANNING;
  try {
    const u = new URL(raw);
    if (u.origin === 'https://app.cantia.ch' || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(u.origin)) return u.toString();
  } catch {
    // fall through
  }
  return APP_PLANNING;
}

function back(to: string, params: Record<string, string>): Response {
  const u = new URL(to);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  return new Response(null, { status: 302, headers: { Location: u.toString() } });
}

async function callback(url: URL, admin: Db): Promise<Response> {
  const state = url.searchParams.get('state');
  const code = url.searchParams.get('code');
  const { data: row } = state ? await admin.from('calendar_oauth_states').select('*').eq('state', state).maybeSingle() : { data: null };
  if (row) await admin.from('calendar_oauth_states').delete().eq('state', state);
  const to = row?.return_to ?? APP_PLANNING;
  if (url.searchParams.get('error')) return back(to, { calendar: 'error', message: url.searchParams.get('error_description') ?? 'Connexion refusée.' });
  if (!row || !code) return back(to, { calendar: 'error', message: 'Session de connexion invalide ou déjà utilisée.' });
  if (Date.now() - new Date(row.created_at).getTime() > STATE_MAX_AGE_MS) return back(to, { calendar: 'error', message: 'Session de connexion expirée, recommencez.' });
  const provider = row.provider as Provider;
  const conf = PROVIDERS[provider];
  try {
    const res = await fetch(conf.token, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: redirectUri(), client_id: conf.id()!, client_secret: conf.secret()!, ...(provider === 'microsoft' ? { scope: conf.scope } : {}) }),
    });
    if (!res.ok) {
      console.error('token exchange failed', provider, res.status, await res.text().catch(() => ''));
      return back(to, { calendar: 'error', message: 'L’autorisation de l’agenda a échoué.' });
    }
    const tokens = (await res.json()) as { access_token: string; refresh_token?: string; expires_in?: number };
    if (!tokens.refresh_token) return back(to, { calendar: 'error', message: 'L’agenda n’a pas donné d’accès durable, recommencez.' });
    const email = await accountEmail(provider, tokens.access_token);

    const { data: conn, error } = await admin
      .from('calendar_connections')
      .upsert({ organization_id: row.organization_id, user_id: row.user_id, provider, account_email: email, status: 'connected', last_error: null, sync_cursor: null }, { onConflict: 'organization_id,user_id,provider' })
      .select('*')
      .single();
    if (error || !conn) return back(to, { calendar: 'error', message: 'Impossible d’enregistrer la connexion.' });
    const accessId = await admin.rpc('vault_upsert_secret', { secret_name: `calendar_access_${conn.id}`, secret: tokens.access_token });
    const refreshId = await admin.rpc('vault_upsert_secret', { secret_name: `calendar_refresh_${conn.id}`, secret: tokens.refresh_token });
    if (accessId.error || refreshId.error) return back(to, { calendar: 'error', message: 'Impossible d’enregistrer la connexion.' });
    const expires = new Date(Date.now() + (tokens.expires_in ?? 3600) * 1000).toISOString();
    await admin.from('calendar_connections').update({ access_token_secret_id: accessId.data, refresh_token_secret_id: refreshId.data, access_expires_at: expires }).eq('id', conn.id);
    try {
      await syncConnection(admin, { ...conn, access_token_secret_id: accessId.data, refresh_token_secret_id: refreshId.data, access_expires_at: expires });
    } catch (e) {
      console.error('first sync failed', e);
    }
    return back(to, { calendar: 'connected', provider });
  } catch (e) {
    console.error(e);
    return back(to, { calendar: 'error', message: 'L’autorisation de l’agenda a échoué.' });
  }
}

async function accountEmail(provider: Provider, token: string): Promise<string | null> {
  try {
    const res = await fetch(provider === 'google' ? 'https://openidconnect.googleapis.com/v1/userinfo' : 'https://graph.microsoft.com/v1.0/me', { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return null;
    const info = await res.json();
    return info.email ?? info.mail ?? info.userPrincipalName ?? null;
  } catch {
    return null;
  }
}

async function accessToken(admin: Db, c: Db): Promise<string> {
  if (c.access_expires_at && new Date(c.access_expires_at).getTime() > Date.now() + 60_000 && c.access_token_secret_id) {
    const { data } = await admin.rpc('vault_read_secret', { secret_id: c.access_token_secret_id });
    if (data) return data as string;
  }
  const { data: refresh } = await admin.rpc('vault_read_secret', { secret_id: c.refresh_token_secret_id });
  if (!refresh) throw new Error('Connexion à l’agenda perdue : reconnectez-le.');
  const conf = PROVIDERS[c.provider as Provider];
  const res = await fetch(conf.token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refresh as string, client_id: conf.id()!, client_secret: conf.secret()!, ...(c.provider === 'microsoft' ? { scope: conf.scope } : {}) }),
  });
  if (!res.ok) throw new Error('L’accès à l’agenda a expiré ou a été retiré : reconnectez-le.');
  const t = (await res.json()) as { access_token: string; refresh_token?: string; expires_in?: number };
  await admin.rpc('vault_update_secret', { secret_id: c.access_token_secret_id, new_secret: t.access_token });
  if (t.refresh_token) await admin.rpc('vault_update_secret', { secret_id: c.refresh_token_secret_id, new_secret: t.refresh_token });
  const expires = new Date(Date.now() + (t.expires_in ?? 3600) * 1000).toISOString();
  await admin.from('calendar_connections').update({ access_expires_at: expires }).eq('id', c.id);
  c.access_expires_at = expires;
  return t.access_token;
}

// --- provider calls --------------------------------------------------------

async function api(token: string, method: string, url: string, body?: unknown, extra: Record<string, string> = {}): Promise<Response> {
  return fetch(url, { method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...extra }, body: body === undefined ? undefined : JSON.stringify(body) });
}

const GCAL = (cal: string) => `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(cal)}/events`;
const MS_PREFER = { Prefer: `outlook.timezone="${TZ}", odata.maxpagesize=100` };

async function createRemote(c: Db, token: string, a: PlanningRow): Promise<string> {
  const res = c.provider === 'google' ? await api(token, 'POST', GCAL(c.calendar_id), toGoogle(a)) : await api(token, 'POST', 'https://graph.microsoft.com/v1.0/me/events', toMicrosoft(a));
  if (!res.ok) throw new Error(`Écriture dans l’agenda refusée (${res.status})`);
  return String((await res.json()).id);
}

async function updateRemote(c: Db, token: string, externalId: string, a: PlanningRow): Promise<boolean> {
  const res =
    c.provider === 'google'
      ? await api(token, 'PATCH', `${GCAL(c.calendar_id)}/${encodeURIComponent(externalId)}`, toGoogle(a))
      : await api(token, 'PATCH', `https://graph.microsoft.com/v1.0/me/events/${encodeURIComponent(externalId)}`, toMicrosoft(a));
  if (res.status === 404 || res.status === 410) return false;
  if (!res.ok) throw new Error(`Mise à jour dans l’agenda refusée (${res.status})`);
  await res.body?.cancel();
  return true;
}

async function deleteRemote(c: Db, token: string, externalId: string): Promise<void> {
  const res =
    c.provider === 'google'
      ? await api(token, 'DELETE', `${GCAL(c.calendar_id)}/${encodeURIComponent(externalId)}`)
      : await api(token, 'DELETE', `https://graph.microsoft.com/v1.0/me/events/${encodeURIComponent(externalId)}`);
  if (!res.ok && res.status !== 404 && res.status !== 410) throw new Error(`Suppression dans l’agenda refusée (${res.status})`);
  await res.body?.cancel();
}

// Changes since the last read (everything from 30 days ago to 1 year ahead
// the first time). Returns the events and the next cursor.
async function readChanges(c: Db, token: string): Promise<{ events: IncomingEvent[]; cursor: string | null }> {
  const events: IncomingEvent[] = [];
  const today = new Date().toISOString().slice(0, 10);
  if (c.provider === 'google') {
    let pageToken: string | null = null;
    let cursor: string | null = c.sync_cursor;
    for (let page = 0; page < MAX_PAGES; page++) {
      const u = new URL(GCAL(c.calendar_id));
      u.searchParams.set('singleEvents', 'true');
      u.searchParams.set('maxResults', '250');
      if (pageToken) u.searchParams.set('pageToken', pageToken);
      if (cursor) u.searchParams.set('syncToken', cursor);
      else {
        u.searchParams.set('timeMin', `${addDays(today, -30)}T00:00:00Z`);
        u.searchParams.set('timeMax', `${addDays(today, 365)}T00:00:00Z`);
      }
      const res = await api(token, 'GET', u.toString());
      if (res.status === 410) {
        // token expired on Google's side: start over from a full read
        await res.body?.cancel();
        cursor = null;
        pageToken = null;
        events.length = 0;
        continue;
      }
      if (!res.ok) throw new Error(`Lecture de l’agenda refusée (${res.status})`);
      const data = await res.json();
      for (const it of data.items ?? []) events.push(fromGoogle(it));
      if (data.nextPageToken) pageToken = data.nextPageToken;
      else return { events, cursor: data.nextSyncToken ?? cursor };
    }
    return { events, cursor: c.sync_cursor };
  }
  let next: string | null =
    c.sync_cursor ?? `https://graph.microsoft.com/v1.0/me/calendarView/delta?startDateTime=${addDays(today, -30)}T00:00:00Z&endDateTime=${addDays(today, 365)}T00:00:00Z`;
  for (let page = 0; page < MAX_PAGES && next; page++) {
    const res = await api(token, 'GET', next, undefined, MS_PREFER);
    if (!res.ok) throw new Error(`Lecture de l’agenda refusée (${res.status})`);
    const data = await res.json();
    for (const it of data.value ?? []) events.push(fromMicrosoft(it));
    if (data['@odata.deltaLink']) return { events, cursor: data['@odata.deltaLink'] };
    next = data['@odata.nextLink'] ?? null;
  }
  return { events, cursor: c.sync_cursor };
}

// --- one connection --------------------------------------------------------

async function syncConnection(admin: Db, c: Db): Promise<void> {
  const token = await accessToken(admin, c);
  const today = new Date().toISOString().slice(0, 10);
  const { data: linkRows } = await admin.from('calendar_event_links').select('*').eq('connection_id', c.id);
  const links = (linkRows ?? []) as { id: string; assignment_id: string | null; external_id: string; origin: string; pushed_at: string | null }[];
  const byAssignment = new Map(links.filter((l) => l.assignment_id).map((l) => [l.assignment_id!, l]));
  const byExternal = new Map(links.map((l) => [l.external_id, l]));

  // 1. Cantia → calendar. Events deleted in Cantia first — whichever side
  // created them: deleted here means deleted there too.
  for (const l of links.filter((x) => !x.assignment_id)) {
    await deleteRemote(c, token, l.external_id);
    await admin.from('calendar_event_links').delete().eq('id', l.id);
    byExternal.delete(l.external_id);
  }
  const { data: rows } = await admin
    .from('planning_assignments')
    .select('id, title, note, starts_on, ends_on, start_time, end_time, updated_at, calendar_connection_id, projects(name, address)')
    .eq('organization_id', c.organization_id)
    .eq('member_user_id', c.user_id)
    .gte('ends_on', addDays(today, -30))
    .order('starts_on')
    .limit(1000);
  let pushed = 0;
  for (const r of rows ?? []) {
    // Appointments read from another calendar are not copied into this one.
    if (r.calendar_connection_id && r.calendar_connection_id !== c.id) continue;
    const link = byAssignment.get(r.id);
    if (link && link.pushed_at && new Date(r.updated_at) <= new Date(link.pushed_at)) continue;
    if (pushed >= MAX_PUSH) break;
    const a: PlanningRow = { ...r, project_name: r.projects?.name ?? null, project_address: r.projects?.address ?? null };
    if (link) {
      const ok = await updateRemote(c, token, link.external_id, a);
      if (ok) await admin.from('calendar_event_links').update({ pushed_at: r.updated_at }).eq('id', link.id);
      else await admin.from('calendar_event_links').delete().eq('id', link.id); // removed in the calendar: keep it in Cantia only
    } else {
      const externalId = await createRemote(c, token, a);
      const { data: created } = await admin.from('calendar_event_links').insert({ connection_id: c.id, assignment_id: r.id, external_id: externalId, origin: 'cantia', pushed_at: r.updated_at }).select('*').single();
      if (created) byExternal.set(externalId, created);
    }
    pushed += 1;
  }

  // 2. calendar → Cantia: the person's own appointments, private.
  const { events, cursor } = await readChanges(c, token);
  const horizon = addDays(today, 366);
  for (const e of events) {
    const link = byExternal.get(e.id);
    if (e.cancelled) {
      if (link) {
        // deleted in the calendar: deleted in Cantia too, wherever it came from
        if (link.assignment_id) await admin.from('planning_assignments').delete().eq('id', link.assignment_id);
        await admin.from('calendar_event_links').delete().eq('id', link.id);
        byExternal.delete(e.id);
      }
      continue;
    }
    if (link?.origin === 'cantia' || (!link && e.cantiaId)) continue; // written by Cantia: Cantia stays the reference
    if (e.startsOn > horizon) continue;
    const fields = { title: e.title, starts_on: e.startsOn, ends_on: e.endsOn, start_time: e.startTime, end_time: e.endTime };
    if (link?.assignment_id) {
      const { data: upd } = await admin.from('planning_assignments').update(fields).eq('id', link.assignment_id).select('updated_at').maybeSingle();
      if (upd) await admin.from('calendar_event_links').update({ pushed_at: upd.updated_at }).eq('id', link.id);
      continue;
    }
    const { data: ins, error } = await admin
      .from('planning_assignments')
      .insert({ organization_id: c.organization_id, member_user_id: c.user_id, created_by: c.user_id, project_id: null, is_private: true, note: null, calendar_connection_id: c.id, ...fields })
      .select('id, updated_at')
      .single();
    if (error || !ins) {
      console.error('import failed', e.id, error?.message);
      continue;
    }
    const { data: l } = await admin.from('calendar_event_links').insert({ connection_id: c.id, assignment_id: ins.id, external_id: e.id, origin: 'calendar', pushed_at: ins.updated_at }).select('*').single();
    if (l) byExternal.set(e.id, l);
  }
  await admin.from('calendar_connections').update({ sync_cursor: cursor, status: 'connected', last_error: null, last_synced_at: new Date().toISOString() }).eq('id', c.id);
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}
