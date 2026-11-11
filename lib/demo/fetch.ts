import { buildDemoFixtures, type DemoLocale } from './fixtures';
import { notifyDemoBlocked } from './index';
import { getAppLocale } from '../translations';

// The `fetch` given to the Supabase client in the demo build: answers the
// REST, RPC, auth, functions and storage calls from the sample data, the
// way PostgREST would (a few simple filters are honoured), and refuses
// every write with an explicit error. Nothing leaves the browser.

const USER_ID = 'u-lucie-martin';
const b64 = (o: object) => btoa(JSON.stringify(o)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
const JWT = `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub: USER_ID, role: 'authenticated', exp: 4102444800, aud: 'authenticated', email: 'lucie@atelier-martin.ch' })}.demo`;

export const DEMO_USER = {
  id: USER_ID,
  aud: 'authenticated',
  role: 'authenticated',
  email: 'lucie@atelier-martin.ch',
  email_confirmed_at: '2026-08-01T08:00:00Z',
  app_metadata: { provider: 'email' },
  user_metadata: { full_name: 'Lucie Martin' },
  created_at: '2026-08-01T08:00:00Z',
};

export const DEMO_SESSION = {
  access_token: JWT,
  refresh_token: 'demo',
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: 4102444800,
  user: DEMO_USER,
};

const READ_ONLY: Record<DemoLocale, string> = {
  fr: 'Démo en lecture seule : rien n’est enregistré. Créez votre compte pour utiliser Cantia.',
  de: 'Demo nur zum Ansehen: Es wird nichts gespeichert. Erstellen Sie Ihr Konto, um Cantia zu nutzen.',
  it: 'Demo in sola lettura: non viene salvato nulla. Create il vostro account per usare Cantia.',
};

// Language of the demo, chosen once per visit: ?locale=de|it|fr in the
// link, else the browser language, else French. The sample company is
// built in that language and its owner's language is set to it, so the app
// follows (lib/auth-context.tsx reads it from organization_members).
const DEMO_LOCALE: DemoLocale = (() => {
  if (typeof window === 'undefined') return 'fr';
  const param = new URLSearchParams(window.location.search).get('locale');
  if (param === 'fr' || param === 'de' || param === 'it') return param;
  const lang = typeof navigator !== 'undefined' ? navigator.language?.slice(0, 2).toLowerCase() : '';
  return lang === 'de' || lang === 'it' ? lang : 'fr';
})();

function locale(): DemoLocale {
  const l = getAppLocale();
  return l === 'de' || l === 'it' ? l : 'fr';
}

let fixtures: any = null;
function data() {
  if (!fixtures) fixtures = buildDemoFixtures(DEMO_LOCALE);
  return fixtures;
}

function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  });
}

// Edge functions the app calls by itself while a page loads.
const BACKGROUND_FUNCTIONS = new Set(['calendar-sync']);

function refused(what: string): Response {
  if (__DEV__) console.info('[demo] refused', what);
  notifyDemoBlocked();
  const message = READ_ONLY[locale()];
  return json({ code: '42501', message, details: null, hint: null, error: message }, 403);
}

function filterRows(rows: any[], params: URLSearchParams): any[] {
  let out = rows;
  for (const [k, v] of params) {
    if (!out.length) continue;
    // A link to another row (client_id=eq.c1) on a sample table that has no
    // such column matches nothing, instead of returning every row.
    if (!(k in out[0])) {
      if (k.endsWith('_id') && k !== 'organization_id' && (v.startsWith('eq.') || v.startsWith('in.('))) out = [];
      continue;
    }
    if (v.startsWith('in.(')) {
      const set = v.slice(4, -1).split(',').map((x) => x.replace(/^"|"$/g, ''));
      out = out.filter((x) => set.includes(String(x[k])));
    } else if (v.startsWith('eq.') && k !== 'organization_id') {
      out = out.filter((x) => String(x[k]) === v.slice(3));
    }
  }
  return out;
}

export async function demoFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const request = new Request(input, init);
  const url = new URL(request.url);
  const method = request.method.toUpperCase();
  const path = url.pathname;
  const d = data();

  if (path.startsWith('/auth/v1/')) {
    if (path.startsWith('/auth/v1/user')) return method === 'GET' ? json(DEMO_USER) : refused(`${method} ${path}`);
    if (path.startsWith('/auth/v1/logout')) return new Response(null, { status: 204 });
    return json(DEMO_SESSION);
  }

  const rest = path.match(/\/rest\/v1\/(rpc\/)?([a-z_0-9]+)/);
  if (rest) {
    if (rest[1]) {
      let body: any = {};
      try {
        body = JSON.parse((await request.text()) || '{}');
      } catch {
        body = {};
      }
      let result = d.rpc[rest[2]];
      if (typeof result === 'function') result = result(body);
      return json(result ?? null);
    }
    if (method !== 'GET' && method !== 'HEAD') return refused(`${method} ${path}`);
    if (__DEV__ && d.tables[rest[2]] === undefined) console.info('[demo] missing table', rest[2]);
    let rows: any[] = d.tables[rest[2]] ?? [];
    rows = filterRows(rows, url.searchParams);
    const range = { 'content-range': `0-${Math.max(0, rows.length - 1)}/${rows.length}` };
    if (method === 'HEAD') return new Response(null, { status: 200, headers: range });
    const single = (request.headers.get('accept') || '').includes('vnd.pgrst.object');
    if (single) return rows.length ? json(rows[0]) : json({ code: 'PGRST116', message: 'no rows', details: null, hint: null }, 406);
    return json(rows, 200, range);
  }

  if (path.startsWith('/functions/v1/')) {
    const fn = path.split('/').pop() as string;
    if (d.funcs[fn] !== undefined) {
      if (fn === 'transcribe-audio' || fn === 'route-voice-command' || fn === 'generate-devis-lines') await new Promise((r) => setTimeout(r, 700));
      return json(d.funcs[fn]);
    }
    // Called by the app on its own (not by the visitor): answered quietly.
    if (BACKGROUND_FUNCTIONS.has(fn)) return json({});
    return refused(`function ${fn}`);
  }

  if (path.startsWith('/storage/v1/')) {
    if (method === 'GET') return new Response('', { status: 404 });
    return refused(`${method} ${path}`);
  }

  return refused(`${method} ${url.host}${path}`);
}

// Storage of the Supabase auth session in the demo: starts signed in as the
// sample owner; signing out works until the next visit.
export function demoAuthStorage() {
  const mem = new Map<string, string>();
  let signedOut = false;
  return {
    getItem: async (key: string) => (key.endsWith('-auth-token') ? (signedOut ? null : mem.get(key) ?? JSON.stringify(DEMO_SESSION)) : mem.get(key) ?? null),
    setItem: async (key: string, value: string) => {
      if (key.endsWith('-auth-token')) signedOut = false;
      mem.set(key, value);
    },
    removeItem: async (key: string) => {
      if (key.endsWith('-auth-token')) signedOut = true;
      mem.delete(key);
    },
  };
}

// Realtime of the demo: a socket that never connects, so live updates stay
// silent instead of reaching for a server.
export class DemoSocket {
  readyState = 3;
  binaryType = 'arraybuffer';
  onopen: (() => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onmessage: (() => void) | null = null;
  constructor(_url?: string) {}
  send() {}
  close() {}
}
