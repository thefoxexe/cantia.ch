import { useCallback, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { RecordingPresets, requestRecordingPermissionsAsync, useAudioRecorder } from 'expo-audio';
import { useAuth } from './auth-context';
import { deleteFromOrgBucket, uploadToOrgBucket } from './api/storage';
import { transcribeAudio } from './api/transcription';

export interface VoiceRecording {
  uri: string;
  mimeType: string;
  durationSeconds: number;
  transcript: string;
}

// Real voice messages need both a playable audio file and a text
// transcript (for AI report generation) out of a single recording.
// `expo-audio` records on every platform uniformly; the transcript comes
// from a scratch upload to supabase/functions/transcribe-audio (Whisper)
// once recording stops — see lib/useDictation.ts for why this replaced
// the previous expo-speech-recognition-based approach. The caller-facing
// shape (uri/mimeType/durationSeconds/transcript, all present together
// once stop() resolves) is unchanged, so ProjectFeed.tsx needed no edits.
export function useVoiceRecorder() {
  const { organization } = useAuth();
  const [recording, setRecording] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const startTimeRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  function startTimer() {
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 500);
  }

  function stopTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }

  const start = useCallback(async (): Promise<boolean> => {
    setElapsedSeconds(0);
    const perm = await requestRecordingPermissionsAsync();
    if (!perm.granted) return false;
    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record();
    setRecording(true);
    startTimer();
    return true;
  }, [audioRecorder]);

  const stop = useCallback(async (): Promise<VoiceRecording | null> => {
    stopTimer();
    setRecording(false);
    const durationSeconds = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));

    await audioRecorder.stop();
    const uri = audioRecorder.uri;
    if (!uri) return null;
    const mimeType = Platform.OS === 'web' ? 'audio/webm' : 'audio/m4a';

    let transcript = '';
    if (organization) {
      const ext = Platform.OS === 'web' ? 'webm' : 'm4a';
      const scratchPath = `_dictation-tmp/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { path } = await uploadToOrgBucket(organization.id, scratchPath, uri, mimeType);
      if (path) {
        const { transcript: text } = await transcribeAudio(path);
        transcript = text ?? '';
        deleteFromOrgBucket(path).catch(() => {});
      }
    }

    return { uri, mimeType, durationSeconds, transcript };
  }, [audioRecorder, organization]);

  const cancel = useCallback(() => {
    stopTimer();
    setRecording(false);
    audioRecorder.stop().catch(() => {});
  }, [audioRecorder]);

  return { recording, elapsedSeconds, start, stop, cancel };
}
