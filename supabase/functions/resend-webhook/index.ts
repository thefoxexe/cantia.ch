import { createClient } from 'npm:@supabase/supabase-js@2';
import { handleInboundEmail } from './inbound.ts';

// Resend delivery events (delivered, bounced, complained, opened, clicked)
// for every client e-mail (email_messages, app › E-mails) and, for devis,
// in devis_events too; and inbound emails received on the organizations'
// "suivi des e-mails" addresses (inbound.ts).
// Deployed without JWT verification: Resend authenticates each delivery
// with a Svix signature instead, checked against RESEND_WEBHOOK_SECRET.

const KIND_BY_TYPE: Record<string, string> = {
  'email.delivered': 'delivered',
  'email.bounced': 'bounced',
  'email.complained': 'complained',
  'email.opened': 'opened',
  'email.clicked': 'clicked',
};

// Corporate mail scanners open every link within seconds of delivery. Such
// clicks are kept but flagged, and the app does not count them.
const BOT_CLICK_WINDOW_MS = 60_000;
const SIGNATURE_TOLERANCE_S = 5 * 60;

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const secret = Deno.env.get('RESEND_WEBHOOK_SECRET');
  if (!secret) {
    console.error('RESEND_WEBHOOK_SECRET is not set');
    return new Response('Not configured', { status: 500 });
  }

  const body = await req.text();
  const svixId = req.headers.get('svix-id') ?? '';
  const svixTimestamp = req.headers.get('svix-timestamp') ?? '';
  const svixSignature = req.headers.get('svix-signature') ?? '';
  if (!(await verifySvixSignature(secret, svixId, svixTimestamp, svixSignature, body))) {
    return new Response('Invalid signature', { status: 401 });
  }

  let event: { type?: string; created_at?: string; data?: Record<string, unknown> };
  try {
    event = JSON.parse(body);
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  if (event.type === 'email.received') {
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    try {
      const occurred = typeof event.created_at === 'string' ? event.created_at : new Date().toISOString();
      return ok(await handleInboundEmail(admin, event.data ?? {}, occurred, svixId));
    } catch (err) {
      console.error(err);
      return new Response('Storage error', { status: 500 });
    }
  }

  const kind = KIND_BY_TYPE[event.type ?? ''];
  if (!kind) return ok('ignored type');

  const data = event.data ?? {};
  const emailId = typeof data.email_id === 'string' ? data.email_id : null;
  if (!emailId) return ok('no email id');

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const occurredAt = typeof event.created_at === 'string' ? event.created_at : new Date().toISOString();

  // App › E-mails: every e-mail sent to a client (devis, factures, reminders,
  // extra works) has its row in email_messages, updated here.
  const bounceMessage = kind === 'bounced' ? ((data.bounce as { message?: string } | undefined)?.message ?? null) : null;
  const { error: hubError } = await admin.rpc('email_message_event', {
    p_resend_id: emailId,
    p_kind: kind,
    p_at: occurredAt,
    p_reason: bounceMessage,
  });
  if (hubError) console.error('email_message_event failed', hubError);

  // The email that was sent for this devis: found through its Resend id,
  // which send-devis-email and the follow-up sender store on their event.
  const { data: sent } = await admin
    .from('devis_events')
    .select('organization_id, devis_id, occurred_at')
    .eq('resend_email_id', emailId)
    .in('kind', ['sent', 'followup_sent'])
    .order('occurred_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  let devisId = sent?.devis_id ?? tagValue(data.tags, 'devis_id');
  let organizationId = sent?.organization_id ?? null;
  if (devisId && !organizationId) {
    const { data: devis } = await admin.from('devis').select('organization_id').eq('id', devisId).maybeSingle();
    organizationId = devis?.organization_id ?? null;
    if (!organizationId) devisId = null;
  }
  // Not a devis email (factures, invitations…): nothing more to record.
  if (!devisId || !organizationId) return ok('not a devis email');

  const meta: Record<string, unknown> = {};
  const click = data.click as { link?: string; userAgent?: string } | undefined;
  if (kind === 'clicked' && click) {
    meta.link = click.link ?? null;
    const sentAt = sent?.occurred_at ? new Date(sent.occurred_at).getTime() : null;
    if (sentAt !== null && new Date(occurredAt).getTime() - sentAt < BOT_CLICK_WINDOW_MS) meta.suspected_bot = true;
  }
  if (kind === 'bounced') {
    meta.reason = bounceMessage;
  }

  const { error } = await admin.from('devis_events').upsert(
    {
      organization_id: organizationId,
      devis_id: devisId,
      kind,
      occurred_at: occurredAt,
      resend_email_id: emailId,
      webhook_id: svixId,
      meta,
    },
    { onConflict: 'webhook_id', ignoreDuplicates: true },
  );
  if (error) {
    console.error('devis_events insert failed', error);
    return new Response('Storage error', { status: 500 });
  }

  // A bounce means the client never got the devis: tell the people who
  // follow the money right away.
  if (kind === 'bounced') {
    const { data: devis } = await admin.from('devis').select('number, client_email').eq('id', devisId).maybeSingle();
    const { data: members } = await admin.rpc('finance_member_user_ids', { org_id: organizationId });
    // SETOF uuid: PostgREST returns plain strings.
    const userIds = ((members ?? []) as unknown[]).filter((id): id is string => typeof id === 'string');
    if (userIds.length) {
      await admin.from('notifications').insert(
        userIds.map((userId) => ({
          organization_id: organizationId,
          user_id: userId,
          type: 'devis_bounced',
          title: `Devis non délivré — ${devis?.number ?? ''}`,
          body: `L'adresse ${devis?.client_email ?? 'du client'} a refusé l'e-mail. Vérifiez-la et renvoyez le devis.`,
          link: `/(app)/devis/${devisId}`,
          source_table: 'devis',
          source_id: devisId,
        })),
      );
    }
  }

  return ok('recorded');
});

function ok(message: string): Response {
  return new Response(JSON.stringify({ ok: true, message }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

// Resend sends tags as an object ({ devis_id: "…" }) on webhook events; an
// array of { name, value } is accepted too.
function tagValue(tags: unknown, name: string): string | null {
  if (!tags) return null;
  if (Array.isArray(tags)) {
    const hit = tags.find((t) => t && typeof t === 'object' && (t as { name?: string }).name === name) as { value?: string } | undefined;
    return typeof hit?.value === 'string' ? hit.value : null;
  }
  if (typeof tags === 'object') {
    const value = (tags as Record<string, unknown>)[name];
    return typeof value === 'string' ? value : null;
  }
  return null;
}

// Svix scheme used by Resend webhooks: HMAC-SHA256 over "id.timestamp.body"
// with the base64 key after the "whsec_" prefix; the header carries one or
// more space-separated "v1,<base64 signature>" entries.
export async function verifySvixSignature(
  secret: string,
  id: string,
  timestamp: string,
  signatureHeader: string,
  body: string,
): Promise<boolean> {
  if (!id || !timestamp || !signatureHeader) return false;
  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > SIGNATURE_TOLERANCE_S) return false;

  const keyBytes = base64ToBytes(secret.startsWith('whsec_') ? secret.slice('whsec_'.length) : secret);
  const key = await crypto.subtle.importKey('raw', keyBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${id}.${timestamp}.${body}`));
  const expected = bytesToBase64(new Uint8Array(mac));

  return signatureHeader.split(' ').some((part) => {
    const [version, signature] = part.split(',');
    return version === 'v1' && !!signature && timingSafeEqual(signature, expected);
  });
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function base64ToBytes(b64: string): Uint8Array<ArrayBuffer> {
  const bin = atob(b64);
  const out = new Uint8Array(new ArrayBuffer(bin.length));
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function bytesToBase64(bytes: Uint8Array): string {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}
