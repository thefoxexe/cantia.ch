import { invokeFunction } from './functions';

export async function sendDevisEmail(devisId: string, customMessage?: string): Promise<{ sent: boolean; error: string | null }> {
  const { data, error } = await invokeFunction<{ sent: boolean }>('send-devis-email', {
    devis_id: devisId,
    custom_message: customMessage?.trim() || undefined,
  });
  return { sent: !!data?.sent, error };
}
