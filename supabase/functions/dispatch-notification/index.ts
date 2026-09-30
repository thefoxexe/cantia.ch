import { createClient } from 'npm:@supabase/supabase-js@2';

// Self-contained on purpose (not importing ../_shared/*.ts) — the MCP
// deploy path for this function has repeatedly failed to resolve relative
// imports to _shared files ("Module not found ... _shared/resend.ts") even
// though other functions in this repo supposedly deploy that way. Every
// payroll PDF function and send-facture-reminder hit the same wall and
// were made self-contained for the same reason; this one follows that
// precedent. Keep escapeHtml/buildBrandedNotificationEmail/
// sendResendEmail in sync with the other send-*-email functions by hand
// if those change.

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function textToHtmlLines(text: string): string {
  return escapeHtml(text).split('\n').join('<br/>');
}

// One of three tones per notification type (see lib/api/notifications.ts'
// NOTIFICATION_TYPES for the full list this must stay in sync with) —
// positive for something a client accepted/signed, attention for something
// that needs following up on but isn't urgent, urgent for money overdue,
// neutral for a plain chantier message. Colors match lib/theme.ts's
// success/warning/danger/primary tokens exactly.
type Tone = 'positive' | 'attention' | 'urgent' | 'neutral';

const TONE_BY_TYPE: Record<string, Tone> = {
  devis_accepted: 'positive',
  extra_work_accepted: 'positive',
  devis_stale_draft: 'attention',
  devis_expiring_soon: 'attention',
  devis_viewed: 'attention',
  devis_bounced: 'urgent',
  recurring_expense_due: 'attention',
  facture_overdue: 'urgent',
  feed_message: 'neutral',
};

const TONE_COLORS: Record<Tone, { fg: string; bg: string }> = {
  positive: { fg: '#2E6B4F', bg: '#E2EEE6' },
  attention: { fg: '#9C6510', bg: '#F3E8D6' },
  urgent: { fg: '#AB3327', bg: '#F5E1DE' },
  neutral: { fg: '#A95C30', bg: '#F5DECB' },
};

function buildBrandedNotificationEmail(params: {
  title: string;
  body: string;
  linkUrl: string;
  orgName: string;
  signature: string;
  tone: Tone;
}): string {
  const { title, body, linkUrl, orgName, signature, tone } = params;
  const font = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
  const eyebrowColor = TONE_COLORS[tone].fg;
  return `
    <div style="background: #F7F1E6; padding: 40px 20px; font-family: ${font};">
      <div style="max-width: 480px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; border: 1px solid #E6D8C2; overflow: hidden;">
        <div style="padding: 24px 32px; background: #16120E;" bgcolor="#16120E">
          <img src="https://krijilwxhdlzflvnvrtl.supabase.co/storage/v1/object/public/brand/email/logo-on-dark-v1.png" width="170" height="32" alt="Cantia" style="display: block; border: 0; height: 32px; width: 170px;" />
        </div>
        <div style="padding: 32px;">
          <p style="margin: 0 0 4px; font-size: 13px; font-weight: 700; color: ${eyebrowColor}; text-transform: uppercase; letter-spacing: 0.6px;">${escapeHtml(orgName)}</p>
          <p style="margin: 0 0 20px; font-size: 22px; font-weight: 700; color: #231A12;">${escapeHtml(title)}</p>
          <p style="margin: 0 0 28px; font-size: 15px; line-height: 1.6; color: #231A12;">${textToHtmlLines(body)}</p>
          <p style="margin: 0 0 28px; text-align: center;">
            <a href="${linkUrl}" style="display: inline-block; background: #A95C30; color: #fff; padding: 14px 28px; border-radius: 10px; font-weight: 700; text-decoration: none; font-size: 15px;">Ouvrir dans Cantia</a>
          </p>
          <p style="margin: 0; padding-top: 20px; border-top: 1px solid #E6D8C2; font-size: 13px; line-height: 1.6; color: #6E6151;">${textToHtmlLines(signature)}</p>
        </div>
      </div>
      <p style="max-width: 480px; margin: 20px auto 0; text-align: center; font-size: 12px; color: #6E6151; line-height: 1.6;">
        Cantia — le logiciel suisse pour piloter vos chantiers et vos projets<br/>
        <a href="https://cantia.ch" style="color: #A95C30; text-decoration: none; font-weight: 600;">cantia.ch</a>
      </p>
    </div>
  `.trim();
}

async function sendResendEmail(params: {
  apiKey: string;
  from: string;
  to: string[];
  subject: string;
  html: string;
}): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${params.apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: params.from, to: params.to, subject: params.subject, html: params.html }),
  });
  if (!res.ok) {
    const errText = await res.text();
    console.error('Resend error', res.status, errText);
    return { ok: false, error: `Échec de l'envoi de l'e-mail (${res.status})` };
  }
  return { ok: true };
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-dispatch-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Not the project's service-role key (this function has no way to obtain
// that from this environment) — an internal secret whose only purpose is to
// stop an outsider from invoking this endpoint at random. Duplicated as-is
// in the migration's dispatch_notification_http() trigger. verify_jwt is
// off for this function since the caller is a DB trigger, not a signed-in
// user.
const DISPATCH_SECRET = '3cafd1059f6e75930c7c09c4e9af5de9e435fbb49cbe5fdcb4964d7512d7bc1b';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  if (req.headers.get('x-dispatch-secret') !== DISPATCH_SECRET) {
    return json({ error: 'unauthorized' }, 401);
  }

  try {
    const { notification_id } = await req.json();
    if (!notification_id) return json({ error: 'notification_id requis' }, 400);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const admin = createClient(supabaseUrl, serviceKey);

    const { data: notif, error: notifError } = await admin.from('notifications').select('*').eq('id', notification_id).single();
    if (notifError || !notif) return json({ error: 'Notification introuvable' }, 404);

    const { data: pref } = await admin
      .from('notification_preferences')
      .select('email_enabled, push_enabled')
      .eq('user_id', notif.user_id)
      .eq('type', notif.type)
      .maybeSingle();
    const emailEnabled = pref?.email_enabled ?? false;
    const pushEnabled = pref?.push_enabled ?? true;

    const results: { push?: unknown; email?: unknown } = {};

    if (pushEnabled) {
      const { data: tokens } = await admin.from('push_tokens').select('token').eq('user_id', notif.user_id);
      if (tokens && tokens.length > 0) {
        const messages = tokens.map((t) => ({
          to: t.token,
          title: notif.title,
          body: notif.body ?? undefined,
          data: { link: notif.link },
        }));
        const res = await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: { Accept: 'application/json', 'Accept-Encoding': 'gzip, deflate', 'Content-Type': 'application/json' },
          body: JSON.stringify(messages),
        });
        results.push = { sent: tokens.length, ok: res.ok };
      }
    }

    if (emailEnabled) {
      const apiKey = Deno.env.get('RESEND_API_KEY');
      const { data: userRes } = await admin.auth.admin.getUserById(notif.user_id);
      const email = userRes?.user?.email;
      if (apiKey && email) {
        const { data: org } = await admin.from('organizations').select('name, email_signature').eq('id', notif.organization_id).single();
        const orgName = org?.name ?? 'Cantia';
        const signature = String(org?.email_signature ?? '').trim() || `Meilleures salutations,\n${orgName}`;
        const appPath = String(notif.link ?? '/').replace('/(app)', '') || '/';
        const tone = TONE_BY_TYPE[notif.type as string] ?? 'neutral';
        const html = buildBrandedNotificationEmail({
          title: notif.title,
          body: notif.body ?? notif.title,
          linkUrl: `https://app.cantia.ch${appPath}`,
          orgName,
          signature,
          tone,
        });
        const { ok, error } = await sendResendEmail({
          apiKey,
          from: `${orgName} <noreply@cantia.ch>`,
          to: [email],
          subject: notif.title,
          html,
        });
        results.email = { ok, error };
      }
    }

    return json({ dispatched: true, ...results });
  } catch (err) {
    console.error(err);
    return json({ error: String(err instanceof Error ? err.message : err) }, 500);
  }
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
