import { createClient } from 'npm:@supabase/supabase-js@2';

// Super Admin › fiche entreprise › E-mails: what Cantia sent to this company
// (read from Resend, the service every e-mail leaves through) and what is
// still scheduled for it (computed from the same rules as the cron jobs).
//
//   { organization_id }            -> { sent: [...], scheduled: [...] }
//   { action: 'email', id }        -> the e-mail itself (subject, html, text)
//
// Platform admins only (is_platform_admin, checked with the caller's JWT).
// Self-contained, like the other functions deployed with the MCP tool.

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

// Resend allows 2 requests a second; the list is read newest first and
// stops at the company's creation, or after this many pages.
const MAX_PAGES = 20;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface ResendListItem {
  id: string;
  to: string[] | string;
  from: string;
  subject: string;
  created_at: string;
  last_event?: string | null;
  scheduled_at?: string | null;
}

async function resend(path: string, apiKey: string): Promise<Response> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(`https://api.resend.com${path}`, { headers: { Authorization: `Bearer ${apiKey}` } });
    if (res.status !== 429) return res;
    await sleep(1100);
  }
  return fetch(`https://api.resend.com${path}`, { headers: { Authorization: `Bearer ${apiKey}` } });
}

// Same rule as send_incomplete_signup_reminders(): plan never chosen, more
// than 2 days after the account; the cron runs at minute 0 of every hour.
function nextHour(after: Date): Date {
  const d = new Date(after);
  if (d.getUTCMinutes() || d.getUTCSeconds() || d.getUTCMilliseconds()) d.setUTCHours(d.getUTCHours() + 1, 0, 0, 0);
  return d;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  try {
    const url = Deno.env.get('SUPABASE_URL')!;
    const userClient = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } });
    const { data: isAdmin } = await userClient.rpc('is_platform_admin');
    if (isAdmin !== true) return json({ error: 'forbidden' }, 403);
    const apiKey = Deno.env.get('RESEND_API_KEY');
    const body = await req.json().catch(() => ({}));

    if (body.action === 'email') {
      if (!apiKey) return json({ error: 'RESEND_API_KEY manquant' }, 500);
      if (typeof body.id !== 'string' || !/^[0-9a-f-]{36}$/i.test(body.id)) return json({ error: 'id invalide' }, 400);
      const res = await resend(`/emails/${body.id}`, apiKey);
      if (!res.ok) return json({ error: `Resend ${res.status}` }, 502);
      const e = await res.json();
      return json({ id: e.id, subject: e.subject, from: e.from, to: e.to, created_at: e.created_at, last_event: e.last_event ?? null, html: e.html ?? null, text: e.text ?? null });
    }

    const orgId = typeof body.organization_id === 'string' ? body.organization_id : '';
    if (!orgId) return json({ error: 'organization_id requis' }, 400);
    const { data: detail, error: detailError } = await userClient.rpc('admin_get_organization_detail', { org_id: orgId });
    if (detailError || !detail) return json({ error: detailError?.message ?? 'Entreprise introuvable' }, 404);

    const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: org } = await admin
      .from('organizations')
      .select('id, name, email, created_at, plan_id, plan_selected, trial_ends_at, signup_reminder_email_sent_at, trial_ended_email_sent_at, payment_failed_email_sent_at')
      .eq('id', orgId)
      .maybeSingle();
    if (!org) return json({ error: 'Entreprise introuvable' }, 404);

    const members = ((detail as any).members ?? []) as { user_id: string; email: string | null; full_name: string | null }[];
    const addresses = new Set<string>([...members.map((m) => m.email), org.email].filter(Boolean).map((e) => String(e).toLowerCase()));

    // ---- Sent: Resend, newest first, down to the company's creation.
    const sent: { id: string; to: string[]; from: string; subject: string; created_at: string; last_event: string | null }[] = [];
    let resendError: string | null = null;
    if (!apiKey) resendError = 'RESEND_API_KEY manquant';
    else if (addresses.size) {
      const floor = new Date(org.created_at).getTime() - 86400000;
      let after: string | null = null;
      for (let page = 0; page < MAX_PAGES; page++) {
        const res = await resend(`/emails?limit=100${after ? `&after=${after}` : ''}`, apiKey);
        if (!res.ok) {
          resendError = `Resend ${res.status}`;
          break;
        }
        const list = await res.json();
        const items = (list.data ?? []) as ResendListItem[];
        for (const e of items) {
          const to = (Array.isArray(e.to) ? e.to : [e.to]).map((x) => String(x).toLowerCase());
          if (to.some((x) => addresses.has(x))) sent.push({ id: e.id, to, from: e.from, subject: e.subject, created_at: e.created_at, last_event: e.last_event ?? null });
        }
        const last = items[items.length - 1];
        if (!list.has_more || !last || new Date(last.created_at).getTime() < floor) break;
        after = last.id;
        await sleep(550);
      }
    }

    // ---- Scheduled: the rules of the cron jobs, for this company.
    const scheduled: { kind: string; label: string; at: string; detail: string | null }[] = [];
    const now = Date.now();
    if (!org.plan_id && !org.plan_selected && !org.signup_reminder_email_sent_at) {
      const due = nextHour(new Date(new Date(org.created_at).getTime() + 2 * 86400000));
      scheduled.push({
        kind: 'signup_reminder',
        label: 'Relance inscription incomplète (« Votre compte Cantia », signée Bastien)',
        at: (due.getTime() < now ? nextHour(new Date(now)) : due).toISOString(),
        detail: 'Part si aucune formule n’est choisie d’ici là.',
      });
    }
    if (org.plan_id === 'decouverte' && org.trial_ends_at && !org.trial_ended_email_sent_at) {
      scheduled.push({ kind: 'trial_ended', label: 'Fin de l’essai Découverte', at: org.trial_ends_at, detail: null });
    }
    const memberIds = members.map((m) => m.user_id);
    if (memberIds.length) {
      const { data: news } = await admin
        .from('scheduled_newsletter_sends')
        .select('id, subject, scheduled_at, user_ids')
        .eq('status', 'pending')
        .overlaps('user_ids', memberIds)
        .order('scheduled_at');
      for (const n of news ?? []) scheduled.push({ kind: 'newsletter', label: `Newsletter : ${n.subject}`, at: n.scheduled_at, detail: null });
    }
    scheduled.sort((a, b) => a.at.localeCompare(b.at));

    // Sends recorded in the database, in case Resend no longer lists them.
    const markers = [
      org.signup_reminder_email_sent_at ? { kind: 'signup_reminder', label: 'Relance inscription incomplète', at: org.signup_reminder_email_sent_at } : null,
      org.trial_ended_email_sent_at ? { kind: 'trial_ended', label: 'Fin de l’essai', at: org.trial_ended_email_sent_at } : null,
      org.payment_failed_email_sent_at ? { kind: 'payment_failed', label: 'Échec de paiement', at: org.payment_failed_email_sent_at } : null,
    ].filter(Boolean);

    return json({ addresses: [...addresses], sent, scheduled, markers, resend_error: resendError });
  } catch (err) {
    console.error('admin-org-emails', err);
    return json({ error: String(err instanceof Error ? err.message : err) }, 500);
  }
});
