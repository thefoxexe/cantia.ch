import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Platform-admin-only bulk sender for the newsletter composer
// (app/(admin)/newsletter). The admin's pasted HTML is sent verbatim —
// no branded shell wrapped around it, unlike the transactional emails
// elsewhere in supabase/functions — since the whole point of the paste-in
// editor is "sends exactly what I put in".
//
// Every recipient is re-checked against newsletter_subscriptions right
// before sending, regardless of how they were selected (the "all
// subscribed" segment or a manual pick): someone who has unsubscribed, or
// never subscribed, is silently skipped rather than blocking the send —
// this is the one invariant the caller can't override from the client.
async function sendResendEmail(params: { apiKey: string; from: string; to: string[]; subject: string; html: string }): Promise<{ ok: boolean }> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${params.apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: params.from, to: params.to, subject: params.subject, html: params.html }),
  });
  if (!res.ok) console.error('Resend error', res.status, await res.text());
  return { ok: res.ok };
}

async function listAllAuthUserEmails(admin: ReturnType<typeof createClient>): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  let page = 1;
  // listUsers pages at up to 1000/page — loop until a short page signals
  // the end, same pagination contract Supabase documents for this call.
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error || !data?.users?.length) break;
    for (const u of data.users) if (u.email) map.set(u.id, u.email);
    if (data.users.length < 1000) break;
    page += 1;
  }
  return map;
}

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

    const { data: isAdmin } = await userClient.rpc('is_platform_admin');
    if (!isAdmin) return json({ error: 'Accès refusé : réservé aux administrateurs de la plateforme.' }, 403);

    const { subject, html, mode, userIds, testEmail } = await req.json();
    if (!subject || !html) return json({ error: 'Sujet et contenu requis.' }, 400);

    const apiKey = Deno.env.get('RESEND_API_KEY');
    if (!apiKey) return json({ error: 'Service mail non configuré.' }, 500);

    if (testEmail) {
      const { ok } = await sendResendEmail({ apiKey, from: 'Cantia <noreply@cantia.ch>', to: [testEmail], subject: `[TEST] ${subject}`, html });
      if (!ok) return json({ error: "Échec de l'envoi du test." }, 500);
      return json({ sent: 1, skipped: 0, total: 1 });
    }

    if (mode !== 'all_subscribed' && mode !== 'manual') return json({ error: 'Mode de ciblage invalide.' }, 400);

    let targetIds: string[];
    if (mode === 'manual') {
      if (!Array.isArray(userIds) || userIds.length === 0) return json({ error: 'Aucun destinataire sélectionné.' }, 400);
      targetIds = userIds;
    } else {
      const { data: subRows } = await admin.from('newsletter_subscriptions').select('user_id').eq('subscribed', true);
      targetIds = (subRows ?? []).map((r: any) => r.user_id);
    }

    // Re-verify subscription status for the actual target set (covers both
    // modes uniformly, and catches a manual pick of someone who isn't
    // subscribed) — absence of a row defaults to subscribed, matching the
    // signup checkbox's own default, though every real user has one via
    // the signup trigger and the original backfill.
    const { data: subRows2 } = await admin.from('newsletter_subscriptions').select('user_id, subscribed').in('user_id', targetIds);
    const subMap = new Map((subRows2 ?? []).map((r: any) => [r.user_id, r.subscribed]));
    const finalIds = targetIds.filter((id) => subMap.get(id) !== false);

    const emailMap = await listAllAuthUserEmails(admin);
    const emails = finalIds.map((id) => emailMap.get(id)).filter((e): e is string => !!e);
    const skipped = targetIds.length - emails.length;

    const CHUNK = 20;
    let sent = 0;
    for (let i = 0; i < emails.length; i += CHUNK) {
      const chunk = emails.slice(i, i + CHUNK);
      const results = await Promise.all(chunk.map((to) => sendResendEmail({ apiKey, from: 'Cantia <noreply@cantia.ch>', to: [to], subject, html })));
      sent += results.filter((r) => r.ok).length;
    }

    return json({ sent, skipped, total: targetIds.length });
  } catch (err) {
    console.error(err);
    return json({ error: String(err instanceof Error ? err.message : err) }, 500);
  }
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}
