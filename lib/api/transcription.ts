import { invokeFunction } from './functions';

export async function transcribeAudio(storagePath: string): Promise<{ transcript: string | null; error: string | null }> {
  const { data, error } = await invokeFunction<{ transcript: string }>('transcribe-audio', { storage_path: storagePath });
  return { transcript: data?.transcript ?? null, error };
}

// Platform admin with no company only (the function refuses anyone else):
// the clip is sent inline instead of through the org bucket.
export async function transcribeAudioInline(audioBase64: string, mime: string): Promise<{ transcript: string | null; error: string | null }> {
  const { data, error } = await invokeFunction<{ transcript: string }>('transcribe-audio', { audio_base64: audioBase64, mime });
  return { transcript: data?.transcript ?? null, error };
}
