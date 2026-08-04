import { invokeFunction } from './functions';

export async function sendFactureReminder(factureId: string): Promise<{ sent: boolean; error: string | null }> {
  const { data, error } = await invokeFunction<{ sent: boolean }>('send-facture-reminder', { facture_id: factureId });
  return { sent: !!data?.sent, error };
}
