import { createClient } from 'npm:@supabase/supabase-js@2';

// Read-only lookup of what's currently sitting in the Resend account
// (audiences + their contacts — emails, names: personal data), used to size
// up the "send to everyone on Resend" mass-send before it happens — no
// prospecting infra tracked these contacts anywhere else, Resend itself is
// the source of truth here.
//
// Never called by a client app screen — protected by a shared dispatch
// secret the same way send-prospect-email / bexio-cron-sync are (read from
// the environment, never hardcoded — see
// 20260828140000_dispatch_secret_vault.sql), AND, since this returns real
// personal data rather than just triggering an action, additionally
// requires a valid platform-admin session on top of the secret — a leaked
// secret alone is no longer enough to exfiltrate the contact list.
const DISPATCH_SECRET = Deno.env.get('DISPATCH_SECRET');

Deno.serve(async (req: Request) => {
  try {
    const body = await req.json().catch(() => ({}));
    if (!DISPATCH_SECRET || body.dispatch_secret !== DISPATCH_SECRET) return json({ error: 'forbidden' }, 403);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const authHeader = req.headers.get('Authorization') ?? '';
    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const {
      data: { user },
    } = await userClient.auth.getUser();
    if (!user) return json({ error: 'Non authentifié' }, 401);
    const { data: isAdmin } = await userClient.rpc('is_platform_admin');
    if (!isAdmin) return json({ error: 'Accès refusé : réservé aux administrateurs de la plateforme.' }, 403);

    const apiKey = Deno.env.get('RESEND_API_KEY');
    if (!apiKey) return json({ error: 'RESEND_API_KEY manquant' }, 500);

    const audRes = await fetch('https://api.resend.com/audiences', {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const audData = await audRes.json();
    if (!audRes.ok) return json({ error: audData }, 502);

    const audiences: { id: string; name: string }[] = audData.data ?? [];
    const results = [];
    for (const aud of audiences) {
      const contactsRes = await fetch(`https://api.resend.com/audiences/${aud.id}/contacts`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      const contactsData = await contactsRes.json();
      const contacts = (contactsData.data ?? []).map((c: Record<string, unknown>) => ({
        email: c.email,
        first_name: c.first_name,
        last_name: c.last_name,
        unsubscribed: c.unsubscribed,
      }));
      results.push({ audience_id: aud.id, audience_name: aud.name, count: contacts.length, contacts });
    }

    return json({ audiences: results });
  } catch (err) {
    return json({ error: String(err instanceof Error ? err.message : err) }, 500);
  }
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}
