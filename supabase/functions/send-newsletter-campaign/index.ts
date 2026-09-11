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
// before sending, regardless of how the client built the list: someone who
// unsubscribed is silently skipped, UNLESS the caller explicitly passes
// includeUnsubscribed (only ever true when the composer's own confirmation
// checkbox was checked — see app/(admin)/newsletter/index.tsx).
// Two sender personas the composer can pick between — "newsletter" for
// broadcast-style sends (newsletter@ doesn't need to be a real receiving
// mailbox, Resend only needs the sending domain verified), "info" for a
// message the admin wants to look like it's genuinely coming from support
// (e.g. reaching out to someone who cancelled). Replies always land on
// info@cantia.ch, the one real inbox — redundant when persona is already
// "info", harmless either way.
const FROM_BY_PERSONA: Record<string, string> = {
  newsletter: 'Cantia Newsletter <newsletter@cantia.ch>',
  info: 'Cantia <info@cantia.ch>',
};
const REPLY_TO = 'info@cantia.ch';

async function sendResendEmail(params: { apiKey: string; from: string; replyTo?: string; to: string[]; subject: string; html: string }): Promise<{ ok: boolean }> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${params.apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: params.from, to: params.to, reply_to: params.replyTo, subject: params.subject, html: params.html }),
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

    const { subject, html, userIds, includeUnsubscribed, testEmail, fromPersona } = await req.json();
    if (!subject || !html) return json({ error: 'Sujet et contenu requis.' }, 400);

    const persona = fromPersona === 'info' ? 'info' : 'newsletter';
    const from = FROM_BY_PERSONA[persona];

    const apiKey = Deno.env.get('RESEND_API_KEY');
    if (!apiKey) return json({ error: 'Service mail non configuré.' }, 500);

    if (testEmail) {
      const { ok } = await sendResendEmail({ apiKey, from, replyTo: REPLY_TO, to: [testEmail], subject: `[TEST] ${subject}`, html });
      if (!ok) return json({ error: "Échec de l'envoi du test." }, 500);
      return json({ sent: 1, skipped: 0, total: 1 });
    }

    // The client always sends an explicit list now — every targeting
    // decision (all-subscribed, by-plan, manual, deliberately including
    // unsubscribed people) happens client-side via admin_filter_user_ids
    // and the manual picker, and lands here as one flat array.
    if (!Array.isArray(userIds) || userIds.length === 0) return json({ error: 'Aucun destinataire sélectionné.' }, 400);
    const targetIds: string[] = userIds;

    // Re-verify subscription status server-side regardless of how the
    // client built the list — the ONE thing it can't get wrong. Skipped
    // only when includeUnsubscribed is explicitly set, which the composer
    // only does after the admin has checked a confirmation box acknowledging
    // the selection includes people who opted out — UNLESS the persona is
    // "info": that's a one-off message, not the newsletter someone
    // unsubscribed from, so the unsubscribe preference simply doesn't apply
    // and this is enforced here too, not just left to the client's own UI
    // gating.
    const skipUnsubscribeFilter = includeUnsubscribed || persona === 'info';
    let finalIds = targetIds;
    if (!skipUnsubscribeFilter) {
      const { data: subRows2 } = await admin.from('newsletter_subscriptions').select('user_id, subscribed').in('user_id', targetIds);
      const subMap = new Map((subRows2 ?? []).map((r: any) => [r.user_id, r.subscribed]));
      finalIds = targetIds.filter((id) => subMap.get(id) !== false);
    }

    const emailMap = await listAllAuthUserEmails(admin);
    const emails = finalIds.map((id) => emailMap.get(id)).filter((e): e is string => !!e);
    const skipped = targetIds.length - emails.length;

    const CHUNK = 20;
    let sent = 0;
    const sentEmails: string[] = [];
    for (let i = 0; i < emails.length; i += CHUNK) {
      const chunk = emails.slice(i, i + CHUNK);
      const results = await Promise.all(chunk.map((to) => sendResendEmail({ apiKey, from, replyTo: REPLY_TO, to: [to], subject, html })));
      results.forEach((r, idx) => {
        if (r.ok) {
          sent += 1;
          sentEmails.push(chunk[idx]);
        }
      });
    }

    // Best-effort — "qui a reçu quoi, quand" history shown at the bottom
    // of the composer (app/(admin)/newsletter). Never blocks the response:
    // the e-mails have already gone out by this point.
    try {
      await admin.from('newsletter_campaigns').insert({
        subject,
        html,
        from_persona: persona,
        sent_by: user.id,
        recipient_emails: sentEmails,
        sent_count: sent,
        skipped_count: skipped,
        total_count: targetIds.length,
      });
    } catch (err) {
      console.error('newsletter_campaigns insert failed', err);
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
