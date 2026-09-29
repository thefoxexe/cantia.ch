import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';

// Reply-To for devis emails and follow-ups: the organization's own address
// and, when "suivi des e-mails" is on (plan Entreprise), its Cantia address
// too, so a client's reply is filed on the devis and stops the follow-ups
// (resend-webhook/inbound.ts). Without an organization address there is
// nobody to reply to, so the Cantia address is never used alone.
export async function salesInboxReplyTo(admin: SupabaseClient, orgId: string, orgEmail: string | null | undefined): Promise<string | string[] | null> {
  if (!orgEmail) return null;
  const { data } = await admin.from('sales_email_settings').select('enabled, reply_to_copy, inbox_token').eq('organization_id', orgId).maybeSingle();
  if (!data?.enabled || !data.reply_to_copy) return orgEmail;
  const { data: hasTracking } = await admin.rpc('org_has_sales_tracking', { org_id: orgId });
  if (!hasTracking) return orgEmail;
  const domain = Deno.env.get('INBOUND_EMAIL_DOMAIN') ?? 'suivi.cantia.ch';
  return [orgEmail, `${data.inbox_token}@${domain}`];
}
