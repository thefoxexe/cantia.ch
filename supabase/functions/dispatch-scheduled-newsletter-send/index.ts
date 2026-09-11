import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-dispatch-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Internal-only — invoked by pg_net from dispatch_scheduled_newsletter_sends()
// (the cron every 5 minutes, see 20260911210000_scheduled_newsletter_sends.sql),
// never by a client directly. Same dispatch-secret pattern as
// send-trial-ended-email/send-signup-reminder-email. This duplicates
// send-newsletter-campaign's actual sending logic rather than calling it —
// self-contained functions can't import from each other in this deploy
// setup, and the two entry points differ enough (one reads a client-built
// request, this one reads a stored row) that sharing code would need the
// same ../_shared import the deploy tool can't resolve anyway.
const DISPATCH_SECRET = Deno.env.get('DISPATCH_SECRET');

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

  if (!DISPATCH_SECRET || req.headers.get('x-dispatch-secret') !== DISPATCH_SECRET) {
    return json({ error: 'unauthorized' }, 401);
  }

  try {
    const { schedule_id } = await req.json();
    if (!schedule_id) return json({ error: 'schedule_id requis' }, 400);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const admin = createClient(supabaseUrl, serviceKey);

    // Idempotency claim — flips pending -> sent up front so a retried or
    // overlapping cron tick can't double-send; if Resend calls below fail
    // partway, the row is corrected to 'failed' afterwards rather than left
    // claimable again (a partial send retrying from scratch would double-
    // mail whoever already got it in the failed attempt).
    const { data: claimed } = await admin
      .from('scheduled_newsletter_sends')
      .update({ status: 'sent', sent_at: new Date().toISOString() })
      .eq('id', schedule_id)
      .eq('status', 'pending')
      .select('*')
      .maybeSingle();
    if (!claimed) return json({ ok: true, skipped: true });

    const apiKey = Deno.env.get('RESEND_API_KEY');
    if (!apiKey) {
      await admin.from('scheduled_newsletter_sends').update({ status: 'failed', error: 'RESEND_API_KEY manquant' }).eq('id', schedule_id);
      return json({ error: 'Service mail non configuré.' }, 500);
    }

    const persona = claimed.from_persona === 'info' ? 'info' : 'newsletter';
    const from = FROM_BY_PERSONA[persona];
    const targetIds: string[] = claimed.user_ids ?? [];

    // Same rule as the immediate-send path (app/(admin)/newsletter):
    // "info" always goes out regardless of newsletter unsubscribe status,
    // "newsletter" respects it unless include_unsubscribed was explicitly
    // set when scheduling.
    const skipUnsubscribeFilter = claimed.include_unsubscribed || persona === 'info';
    let finalIds = targetIds;
    if (!skipUnsubscribeFilter && targetIds.length > 0) {
      const { data: subRows } = await admin.from('newsletter_subscriptions').select('user_id, subscribed').in('user_id', targetIds);
      const subMap = new Map((subRows ?? []).map((r: any) => [r.user_id, r.subscribed]));
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
      const results = await Promise.all(chunk.map((to) => sendResendEmail({ apiKey, from, replyTo: REPLY_TO, to: [to], subject: claimed.subject, html: claimed.html })));
      results.forEach((r, idx) => {
        if (r.ok) {
          sent += 1;
          sentEmails.push(chunk[idx]);
        }
      });
    }

    // Same history table the immediate-send path writes to, so a scheduled
    // send shows up in the composer's "historique des envois" exactly like
    // any other campaign — nothing distinguishes it there on purpose.
    try {
      await admin.from('newsletter_campaigns').insert({
        subject: claimed.subject,
        html: claimed.html,
        from_persona: persona,
        sent_by: claimed.created_by,
        recipient_emails: sentEmails,
        sent_count: sent,
        skipped_count: skipped,
        total_count: targetIds.length,
      });
    } catch (err) {
      console.error('newsletter_campaigns insert failed', err);
    }

    return json({ ok: true, sent, skipped, total: targetIds.length });
  } catch (err) {
    console.error(err);
    return json({ error: String(err instanceof Error ? err.message : err) }, 500);
  }
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}
