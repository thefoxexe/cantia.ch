import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';

// App › E-mails: one row per e-mail sent to a client, updated afterwards by
// resend-webhook (email_message_event) and the portal / reply triggers.
// Logging never blocks a send: failures are only reported in the logs.
export async function logEmailMessage(
  admin: SupabaseClient,
  row: {
    organizationId: string;
    kind: 'facture' | 'facture_reminder' | 'extra_work';
    documentType: 'facture' | 'extra_work';
    documentId: string;
    documentNumber: string | null;
    toEmail: string;
    toName: string | null;
    subject: string;
    resendId: string | undefined;
    sentBy: string | null;
  },
): Promise<void> {
  const { error } = await admin.from('email_messages').insert({
    organization_id: row.organizationId,
    kind: row.kind,
    document_type: row.documentType,
    document_id: row.documentId,
    document_number: row.documentNumber,
    to_email: row.toEmail,
    to_name: row.toName,
    subject: row.subject,
    resend_email_id: row.resendId ?? null,
    sent_by: row.sentBy,
  });
  if (error) console.error('email_messages insert failed', error);
}

// The signed-in user behind the request, or null (service calls, cron).
export async function callerId(userClient: SupabaseClient): Promise<string | null> {
  const { data } = await userClient.auth.getUser().catch(() => ({ data: { user: null } }));
  return data?.user?.id ?? null;
}
