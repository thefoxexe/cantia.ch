import { invokeFunction } from './functions';

export async function transcribeAudio(storagePath: string): Promise<{ transcript: string | null; error: string | null }> {
  const { data, error } = await invokeFunction<{ transcript: string }>('transcribe-audio', { storage_path: storagePath });
  return { transcript: data?.transcript ?? null, error };
}
