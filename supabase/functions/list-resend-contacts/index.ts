// Read-only lookup of what's currently sitting in the Resend account
// (audiences + their contacts), used to size up the "send to everyone on
// Resend" mass-send before it happens — no prospecting infra tracked these
// contacts anywhere else, Resend itself is the source of truth here.
//
// Never called by a client — protected by a shared dispatch secret the same
// way send-prospect-email / bexio-cron-sync are.
const DISPATCH_SECRET = '5521b7850a9db2110bb79575a98c37f218a2fd9cb9311ffe39bd88d447c7947b';

Deno.serve(async (req: Request) => {
  try {
    const body = await req.json().catch(() => ({}));
    if (body.dispatch_secret !== DISPATCH_SECRET) return json({ error: 'forbidden' }, 403);

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
