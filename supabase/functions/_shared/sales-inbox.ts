import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';

// Reply-To for every devis / facture email sent by Cantia (first send,
// follow-ups, payment reminders).
//
// 1. Replies always reach a human: the organization's address, or the
//    owner's login email when the organization has none - never the
//    noreply sender.
// 2. When "suivi des e-mails" is on (plan Entreprise), the Reply-To is the
//    organization's Cantia address alone, shown with the organization's
//    name ("WebAlp.ch"), so the client sees a single, clean recipient.
//    Cantia files the reply on the devis / facture, stops the follow-ups,
//    and forwards it at once, attachments included, to the human address
//    (resend-webhook/inbound.ts), Reply-To set to the client.
export async function salesInboxReplyTo(admin: SupabaseClient, orgId: string, orgEmail: string | null | undefined): Promise<string | null> {
  const human = await salesInboxHumanAddress(admin, orgId, orgEmail);
  if (!human) return null;
  const { data } = await admin.from('sales_email_settings').select('enabled, reply_to_copy, inbox_token').eq('organization_id', orgId).maybeSingle();
  if (!data?.enabled || !data.reply_to_copy) return human;
  const { data: hasTracking } = await admin.rpc('org_has_sales_tracking', { org_id: orgId });
  if (!hasTracking) return human;
  const domain = Deno.env.get('INBOUND_EMAIL_DOMAIN') ?? 'suivi.cantia.ch';
  const { data: org } = await admin.from('organizations').select('name').eq('id', orgId).maybeSingle();
  return withDisplayName(org?.name, `${data.inbox_token}@${domain}`);
}

// Where replies end up: the organization's address, else the owner's login.
export async function salesInboxHumanAddress(admin: SupabaseClient, orgId: string, orgEmail?: string | null): Promise<string | null> {
  const direct = orgEmail?.trim();
  if (direct) return direct;
  const { data: org } = await admin.from('organizations').select('email').eq('id', orgId).maybeSingle();
  return org?.email?.trim() || (await ownerEmail(admin, orgId));
}

export function withDisplayName(name: string | null | undefined, address: string): string {
  const clean = (name ?? '').replace(/["\\\r\n<>]/g, '').trim();
  return clean ? `"${clean}" <${address}>` : address;
}

async function ownerEmail(admin: SupabaseClient, orgId: string): Promise<string | null> {
  const { data: owner } = await admin
    .from('organization_members')
    .select('user_id')
    .eq('organization_id', orgId)
    .eq('role', 'owner')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!owner?.user_id) return null;
  const { data } = await admin.auth.admin.getUserById(owner.user_id);
  return data?.user?.email ?? null;
}
