import { createClient } from 'npm:@supabase/supabase-js@2';

// Speech-to-text via OpenAI's Whisper API, replacing the on-device
// expo-speech-recognition module (no version compatible with Expo SDK 57
// exists — see lib/speechRecognitionStub.ts). The client already uploaded
// the recording to Storage (a scratch path for pure dictation, or the
// voice message's own permanent path) before calling this — downloading
// through the user's own client (not the admin client) means Storage's
// existing per-org RLS policies gate access here too, with nothing extra
// to reimplement.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const BUCKET = 'opus-storage';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { storage_path } = await req.json();
    if (!storage_path) return json({ error: 'storage_path requis' }, 400);

    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) return json({ error: "Transcription indisponible : clé OpenAI non configurée." }, 500);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const authHeader = req.headers.get('Authorization') ?? '';
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: file, error: downloadError } = await userClient.storage.from(BUCKET).download(storage_path);
    if (downloadError || !file) return json({ error: 'Enregistrement introuvable ou accès refusé' }, 404);

    const ext = file.type.includes('webm') ? 'webm' : file.type.includes('wav') ? 'wav' : 'm4a';
    const form = new FormData();
    form.append('file', file, `audio.${ext}`);
    form.append('model', 'whisper-1');
    form.append('language', 'fr');

    const whisperResp = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    });

    if (!whisperResp.ok) {
      const detail = await whisperResp.text().catch(() => '');
      console.error('Whisper API error:', whisperResp.status, detail);
      return json({ error: 'Échec de la transcription' }, 502);
    }

    const result = await whisperResp.json();
    return json({ transcript: String(result.text ?? '').trim() });
  } catch (err) {
    console.error(err);
    return json({ error: String(err instanceof Error ? err.message : err) }, 500);
  }
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
