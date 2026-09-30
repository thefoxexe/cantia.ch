import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';

// Resend inbound (email.received) for the "suivi des e-mails" address of
// each organization (<token>@suivi.cantia.ch, see
// supabase/migrations/20260929140000_sales_email_inbox.sql). An email is
// kept only when it comes from a member of the organization (Bcc, forward)
// or from one of its clients (reply through the Reply-To of every devis /
// facture email, see _shared/sales-inbox.ts); anything else is not filed.
// It is filed on the matching devis or facture.
//
// That Reply-To is the Cantia address alone, so every reply that does not
// come from a member is first forwarded to the organization's own address
// (forwardToOrganization), whoever sent it and whatever the plan: a client
// reply must never be lost.

const INBOUND_DOMAIN = (Deno.env.get('INBOUND_EMAIL_DOMAIN') ?? 'suivi.cantia.ch').toLowerCase();
const SNIPPET_MAX = 800;

type Admin = SupabaseClient;

interface ReceivedEmail {
  from?: string;
  to?: string[] | string;
  cc?: string[] | string;
  bcc?: string[] | string;
  subject?: string;
  text?: string | null;
  html?: string | null;
  created_at?: string;
}

export async function handleInboundEmail(admin: Admin, data: Record<string, unknown>, occurredAt: string, webhookId: string): Promise<string> {
  const emailId = typeof data.email_id === 'string' ? data.email_id : null;
  if (!emailId) return 'no email id';

  // The webhook carries the headers; the body is fetched from the API.
  const full = await fetchReceivedEmail(emailId);
  const email: ReceivedEmail = { ...(data as ReceivedEmail), ...(full ?? {}) };
  const from = addressOf(email.from);
  if (!from) return 'no sender';
  const recipients = [...list(email.to), ...list(email.cc), ...list(email.bcc), ...list(data.to), ...list(data.cc), ...list(data.bcc)]
    .map(addressOf)
    .filter((a): a is string => !!a);
  const tokens = [...new Set(recipients.filter((a) => a.endsWith(`@${INBOUND_DOMAIN}`)).map((a) => a.split('@')[0]))];

  // The organization: through its address, or (Bcc headers are usually
  // stripped) through the member who sent it.
  let organizationId: string | null = null;
  let forwardError: unknown = null;
  if (tokens.length) {
    const { data: settings } = await admin.from('sales_email_settings').select('organization_id, enabled').in('inbox_token', tokens).limit(1).maybeSingle();
    const tokenOrgId = (settings?.organization_id as string | undefined) ?? null;
    if (tokenOrgId && !(await memberOf(admin, tokenOrgId, from))) {
      try {
        await forwardToOrganization(admin, tokenOrgId, emailId, email, from, recipients);
      } catch (err) {
        // Filed below all the same; the error then makes Resend retry the
        // webhook (the forward is idempotent, the filing too).
        forwardError = err;
      }
    }
    organizationId = settings?.enabled ? tokenOrgId : null;
  }
  const result = await fileInboundEmail(admin, organizationId, emailId, email, from, recipients, occurredAt, webhookId);
  if (forwardError) throw forwardError;
  return result;
}

async function fileInboundEmail(
  admin: Admin,
  tokenOrganizationId: string | null,
  emailId: string,
  email: ReceivedEmail,
  from: string,
  recipients: string[],
  occurredAt: string,
  webhookId: string,
): Promise<string> {
  let organizationId = tokenOrganizationId;
  if (!organizationId) {
    const { data: orgs } = await admin.rpc('sales_inbox_orgs_for_member', { p_email: from });
    const ids = ((orgs ?? []) as unknown[]).filter((id): id is string => typeof id === 'string');
    if (ids.length === 1) organizationId = ids[0];
  }
  if (!organizationId) return 'no organization';
  const { data: hasTracking } = await admin.rpc('org_has_sales_tracking', { org_id: organizationId });
  if (!hasTracking) return 'plan without sales tracking';

  const text = bodyText(email);
  const memberId = await memberOf(admin, organizationId, from);
  let direction: 'outgoing' | 'incoming';
  let counterpart: string | null = null;

  if (memberId) {
    const others: string[] = [];
    for (const address of recipients) {
      if (address.endsWith(`@${INBOUND_DOMAIN}`) || address === from) continue;
      if (!(await memberOf(admin, organizationId, address))) others.push(address);
    }
    if (others.length) {
      direction = 'outgoing';
      counterpart = others[0];
    } else {
      // Sent only to the address: a forwarded email from a client.
      const original = forwardedSender(text);
      if (original && !(await memberOf(admin, organizationId, original))) {
        direction = 'incoming';
        counterpart = original;
      } else {
        direction = 'outgoing';
      }
    }
  } else if (await isKnownClient(admin, organizationId, from)) {
    direction = 'incoming';
    counterpart = from;
  } else {
    return 'unknown sender';
  }

  const subject = (email.subject ?? '').slice(0, 300) || null;
  const { devis, facture } = await matchDocument(admin, organizationId, `${subject ?? ''}\n${text.slice(0, 4000)}`, counterpart);
  let clientId = devis?.client_id ?? facture?.client_id ?? null;
  if (!clientId && counterpart) {
    const { data: client } = await admin.from('clients').select('id').eq('organization_id', organizationId).ilike('email', counterpart).limit(1).maybeSingle();
    clientId = client?.id ?? null;
  }

  const { data: row, error } = await admin
    .from('sales_emails')
    .upsert(
      {
        organization_id: organizationId,
        direction,
        from_email: from,
        counterpart_email: counterpart,
        subject,
        snippet: snippetOf(text, direction === 'incoming' && !!memberId),
        devis_id: devis?.id ?? null,
        facture_id: facture?.id ?? null,
        client_id: clientId,
        member_user_id: memberId,
        occurred_at: email.created_at ?? occurredAt,
        resend_email_id: emailId,
      },
      { onConflict: 'resend_email_id', ignoreDuplicates: true },
    )
    .select('id')
    .maybeSingle();
  if (error) throw new Error(`sales_emails insert failed: ${error.message}`);

  // On the devis timeline too. A client's reply also stops the follow-ups
  // (send-devis-followups skips devis with a reply_received event).
  if (devis && row) {
    await admin.from('devis_events').upsert(
      {
        organization_id: organizationId,
        devis_id: devis.id,
        kind: direction === 'incoming' ? 'reply_received' : 'email_logged',
        occurred_at: email.created_at ?? occurredAt,
        webhook_id: webhookId,
        meta: { subject, sales_email_id: row.id, counterpart },
      },
      { onConflict: 'webhook_id', ignoreDuplicates: true },
    );
  }
  return row ? 'email filed' : 'already filed';
}

// Forwards a reply received on the Cantia address to the organization's own
// address: original subject, body and attachments, Reply-To the sender so
// that "Répondre" goes straight back to the client. Skipped when the human
// address already received it (e-mails sent before the Reply-To became the
// Cantia address alone listed both). Idempotent per received e-mail.
async function forwardToOrganization(admin: Admin, organizationId: string, emailId: string, email: ReceivedEmail, from: string, recipients: string[]): Promise<void> {
  const { data: org } = await admin.from('organizations').select('name, email, locale').eq('id', organizationId).maybeSingle();
  const human = (org?.email as string | null)?.trim() || (await ownerEmail(admin, organizationId));
  if (!human || recipients.includes(human.toLowerCase())) return;
  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) throw new Error('RESEND_API_KEY missing');

  const senderName = displayNameOf(email.from) || from;
  const locale = org?.locale === 'de' || org?.locale === 'it' ? org.locale : 'fr';
  const note = {
    fr: `Réponse de ${senderName} (${from}), reçue et classée par Cantia. Répondez normalement : votre message lui parviendra directement.`,
    de: `Antwort von ${senderName} (${from}), von Cantia empfangen und abgelegt. Antworten Sie ganz normal: Ihre Nachricht geht direkt an den Absender.`,
    it: `Risposta di ${senderName} (${from}), ricevuta e archiviata da Cantia. Risponda normalmente: il suo messaggio arriverà direttamente al mittente.`,
  }[locale as 'fr' | 'de' | 'it'];
  const banner = `<div style="margin:0 0 16px;padding:10px 14px;border-radius:8px;background:#F7F1E6;border:1px solid #E6D8C2;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:12px;line-height:1.5;color:#6E6151">${escapeHtml(note)}</div>`;
  const text = bodyText(email);
  const html = banner + (email.html ?? `<div style="white-space:pre-wrap;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:14px">${escapeHtml(text)}</div>`);

  const attachments = await receivedAttachments(apiKey, emailId);
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'Idempotency-Key': `inbound-forward-${emailId}` },
    body: JSON.stringify({
      from: `"${senderName.replace(/["\\<>\r\n]/g, '')} via Cantia" <noreply@cantia.ch>`,
      to: [human],
      reply_to: email.from ?? from,
      subject: (email.subject ?? '').slice(0, 300) || '(sans objet)',
      html,
      text: `${note}\n\n${text}`,
      attachments: attachments.length ? attachments : undefined,
    }),
  });
  if (!res.ok) throw new Error(`inbound forward failed: ${res.status} ${(await res.text()).slice(0, 300)}`);
}

async function receivedAttachments(apiKey: string, emailId: string): Promise<{ filename: string; path: string }[]> {
  try {
    const res = await fetch(`https://api.resend.com/emails/receiving/${emailId}/attachments`, { headers: { Authorization: `Bearer ${apiKey}` } });
    if (!res.ok) return [];
    const body = (await res.json()) as { data?: { filename?: string; download_url?: string }[] };
    return (body.data ?? [])
      .filter((a) => a.download_url)
      .map((a, i) => ({ filename: a.filename || `piece-jointe-${i + 1}`, path: a.download_url as string }));
  } catch (err) {
    console.error('received attachments fetch failed', err);
    return [];
  }
}

async function ownerEmail(admin: Admin, organizationId: string): Promise<string | null> {
  const { data: owner } = await admin
    .from('organization_members')
    .select('user_id')
    .eq('organization_id', organizationId)
    .eq('role', 'owner')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!owner?.user_id) return null;
  const { data } = await admin.auth.admin.getUserById(owner.user_id as string);
  return data?.user?.email ?? null;
}

function displayNameOf(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const match = value.match(/^\s*"?([^"<]+?)"?\s*</);
  return match ? match[1].trim() : null;
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function fetchReceivedEmail(id: string): Promise<ReceivedEmail | null> {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) return null;
  try {
    const res = await fetch(`https://api.resend.com/emails/receiving/${id}`, { headers: { Authorization: `Bearer ${apiKey}` } });
    if (!res.ok) {
      console.error('received email fetch failed', res.status);
      return null;
    }
    return (await res.json()) as ReceivedEmail;
  } catch (err) {
    console.error('received email fetch failed', err);
    return null;
  }
}

async function memberOf(admin: Admin, organizationId: string, email: string): Promise<string | null> {
  const { data } = await admin.rpc('sales_inbox_member', { p_org_id: organizationId, p_email: email });
  return typeof data === 'string' ? data : null;
}

async function isKnownClient(admin: Admin, organizationId: string, email: string): Promise<boolean> {
  const [{ count: clients }, { count: devis }, { count: factures }] = await Promise.all([
    admin.from('clients').select('id', { count: 'exact', head: true }).eq('organization_id', organizationId).ilike('email', email),
    admin.from('devis').select('id', { count: 'exact', head: true }).eq('organization_id', organizationId).ilike('client_email', email),
    admin.from('factures').select('id', { count: 'exact', head: true }).eq('organization_id', organizationId).ilike('client_email', email),
  ]);
  return (clients ?? 0) + (devis ?? 0) + (factures ?? 0) > 0;
}

interface DocRow {
  id: string;
  number: string | null;
  client_id: string | null;
  client_email: string | null;
  status: string;
  created_at: string;
}

// A devis or facture number written in the subject or the text wins;
// otherwise the latest open document sent to that client (a devis waiting
// for an answer, or an unpaid facture).
async function matchDocument(admin: Admin, organizationId: string, haystack: string, counterpart: string | null): Promise<{ devis: DocRow | null; facture: DocRow | null }> {
  const upper = haystack.toUpperCase();
  const since = new Date(Date.now() - 365 * 24 * 3600 * 1000).toISOString();
  const recent = (table: 'devis' | 'factures') =>
    admin
      .from(table)
      .select('id, number, client_id, client_email, status, created_at')
      .eq('organization_id', organizationId)
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(500);
  const [{ data: devisRows }, { data: factureRows }] = await Promise.all([recent('devis'), recent('factures')]);
  const devis = (devisRows ?? []) as DocRow[];
  const factures = (factureRows ?? []) as DocRow[];
  const byNumber = (rows: DocRow[]) => rows.find((d) => d.number && d.number.length >= 4 && upper.includes(String(d.number).toUpperCase())) ?? null;
  const devisByNumber = byNumber(devis);
  const factureByNumber = byNumber(factures);
  if (devisByNumber || factureByNumber) return { devis: devisByNumber, facture: factureByNumber };
  if (!counterpart) return { devis: null, facture: null };
  const mine = (rows: DocRow[]) => rows.filter((d) => (d.client_email ?? '').toLowerCase() === counterpart);
  const openDevis = mine(devis).find((d) => d.status === 'sent') ?? null;
  const openFacture = mine(factures).find((d) => d.status === 'sent' || d.status === 'partial') ?? null;
  if (openDevis && openFacture) return openDevis.created_at >= openFacture.created_at ? { devis: openDevis, facture: null } : { devis: null, facture: openFacture };
  if (openDevis || openFacture) return { devis: openDevis, facture: openFacture };
  return { devis: mine(devis)[0] ?? null, facture: null };
}

function list(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === 'string');
  if (typeof value === 'string') return value.split(',');
  return [];
}

function addressOf(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const match = value.match(/<([^<>\s]+@[^<>\s]+)>/) ?? value.match(/([^\s<>"',;]+@[^\s<>"',;]+)/);
  return match ? match[1].toLowerCase() : null;
}

function bodyText(email: ReceivedEmail): string {
  if (email.text) return email.text;
  if (!email.html) return '';
  return email.html
    .replace(/<(style|script)[\s\S]*?<\/\1>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|tr|li)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

// "From: / De : / Von: / Da:" line of a forwarded message.
function forwardedSender(text: string): string | null {
  const match = text.match(/^\s*\**(?:From|De|Von|Da)\s*:\**\s*(.+)$/im);
  return match ? addressOf(match[1]) : null;
}

const REPLY_SEPARATORS = [
  /^-{2,}\s*(Original Message|Message d'origine|Ursprüngliche Nachricht|Messaggio originale)/im,
  /^On .+ wrote:\s*$/im,
  /^Le .+ a écrit\s*:\s*$/im,
  /^Am .+ schrieb .+:\s*$/im,
  /^Il giorno .+ ha scritto:\s*$/im,
  /^\s*\**(From|De|Von|Da)\s*:\**\s*.+$/im,
];

// The new part of the message only, without the quoted history. For a
// forwarded client email, the forwarded message itself.
function snippetOf(text: string, forwarded: boolean): string | null {
  let body = text.replace(/\r/g, '');
  if (forwarded) {
    const at = body.search(/^\s*\**(From|De|Von|Da)\s*:/im);
    if (at >= 0) {
      body = body.slice(at);
      const blank = body.search(/\n\s*\n/);
      if (blank >= 0) body = body.slice(blank);
    }
  } else {
    for (const separator of REPLY_SEPARATORS) {
      const at = body.search(separator);
      if (at > 0) body = body.slice(0, at);
    }
  }
  body = body
    .split('\n')
    .filter((line) => !line.trimStart().startsWith('>'))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return body ? body.slice(0, SNIPPET_MAX) : null;
}
