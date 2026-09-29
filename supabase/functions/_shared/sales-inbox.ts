import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';

// Reply-To for every devis / facture email sent by Cantia (first send,
// follow-ups, payment reminders).
//
// 1. Replies always reach a human: the organization's address, or the
//    owner's login email when the organization has none - never the
//    noreply sender.
// 2. When "suivi des e-mails" is on (plan Entreprise), the organization's
//    Cantia address is added next to it: the client's single "Répondre"
//    reaches the company as usual AND Cantia, which files the reply on the
//    devis / facture and stops the follow-ups (resend-webhook/inbound.ts).
//    No BCC or forwarding is needed for that.
export async function salesInboxReplyTo(admin: SupabaseClient, orgId: string, orgEmail: string | null | undefined): Promise<string | string[] | null> {
  const human = orgEmail?.trim() || (await ownerEmail(admin, orgId));
  if (!human) return null;
  const { data } = await admin.from('sales_email_settings').select('enabled, reply_to_copy, inbox_token').eq('organization_id', orgId).maybeSingle();
  if (!data?.enabled || !data.reply_to_copy) return human;
  const { data: hasTracking } = await admin.rpc('org_has_sales_tracking', { org_id: orgId });
  if (!hasTracking) return human;
  const domain = Deno.env.get('INBOUND_EMAIL_DOMAIN') ?? 'suivi.cantia.ch';
  return [human, `${data.inbox_token}@${domain}`];
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
