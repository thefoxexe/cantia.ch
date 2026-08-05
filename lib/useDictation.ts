import { useCallback, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { RecordingPresets, requestRecordingPermissionsAsync, useAudioRecorder } from 'expo-audio';
import { useAuth } from './auth-context';
import { deleteFromOrgBucket, uploadToOrgBucket } from './api/storage';
import { transcribeAudio } from './api/transcription';

// Speech-to-text via a short recording + server-side transcription
// (supabase/functions/transcribe-audio, backed by Whisper) rather than live
// on-device recognition — expo-speech-recognition has no version compatible
// with Expo SDK 57, and repeatedly caused a native crash on every app
// launch. The trade-off is explicit and accepted: no more word-by-word
// live transcript while speaking — start() records, stop() uploads the
// clip to a scratch path, awaits the transcript, deletes the scratch file,
// then calls onTranscriptChange exactly once with the full text. Every
// existing caller already only reads the transcript after awaiting stop(),
// so this is a drop-in swap of what happens *inside* start/stop, not a new
// contract.
export function useDictation(onTranscriptChange: (sessionTranscript: string) => void) {
  const { organization } = useAuth();
  const [listening, setListening] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const onTranscriptChangeRef = useRef(onTranscriptChange);
  onTranscriptChangeRef.current = onTranscriptChange;
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  const start = useCallback(async (_lang = 'fr-FR') => {
    const perm = await requestRecordingPermissionsAsync();
    if (!perm.granted) return false;
    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record();
    setListening(true);
    return true;
  }, [audioRecorder]);

  const stop = useCallback(async () => {
    setListening(false);
    if (!organization) return;
    await audioRecorder.stop();
    const uri = audioRecorder.uri;
    if (!uri) return;

    setTranscribing(true);
    try {
      const ext = Platform.OS === 'web' ? 'webm' : 'm4a';
      const contentType = Platform.OS === 'web' ? 'audio/webm' : 'audio/m4a';
      const scratchPath = `_dictation-tmp/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { path, error: uploadError } = await uploadToOrgBucket(organization.id, scratchPath, uri, contentType);
      if (!path || uploadError) return;

      const { transcript } = await transcribeAudio(path);
      if (transcript) onTranscriptChangeRef.current(transcript);
      deleteFromOrgBucket(path).catch(() => {});
    } finally {
      setTranscribing(false);
    }
  }, [audioRecorder, organization]);

  return {
    supported: true, // recording + server transcription needs no device-specific capability check
    listening,
    transcribing,
    start,
    stop,
  };
}
