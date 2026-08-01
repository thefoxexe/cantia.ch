import { useCallback, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { RecordingPresets, requestRecordingPermissionsAsync, useAudioRecorder } from 'expo-audio';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from './speechRecognitionStub';

export interface VoiceRecording {
  uri: string;
  mimeType: string;
  durationSeconds: number;
  transcript: string;
}

// Real voice messages need both a playable audio file and a text
// transcript (for AI report generation) out of a single recording.
//
// - Web: expo-speech-recognition never persists audio there (the browser's
//   Speech API is a black box with no accessible audio blob), so an
//   `expo-audio` recorder runs alongside it — browsers reliably support
//   two simultaneous microphone consumers.
// - Native: running a separate recorder AND the speech recognizer at once
//   risks fighting over the OS audio session, so a single
//   `expo-speech-recognition` session with `recordingOptions.persist`
//   supplies both the transcript and the audio file uri from one mic grab.
// Trailing punctuation stripped before comparison so "chantier" vs
// "chantier." still count as the same redelivered segment.
function normalizeForDedup(text: string): string {
  return text.trim().toLowerCase().replace(/[.,!?;:]+$/, '');
}

export function useVoiceRecorder() {
  const [recording, setRecording] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const startTimeRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const finalizedRef = useRef('');
  const lastFinalRef = useRef('');
  const liveTranscriptRef = useRef('');
  const nativeAudioUriRef = useRef<string | null>(null);
  const audioEndResolverRef = useRef<((uri: string | null) => void) | null>(null);
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  // Same Android continuous-recognition quirk as useDictation.ts: a restart
  // after a pause can redeliver the same segment as a fresh "final" result,
  // so a short voice message could otherwise end up with its one word
  // repeated many times in the transcript used for AI report generation.
  useSpeechRecognitionEvent('result', (event) => {
    const transcript = event.results[0]?.transcript ?? '';
    if (event.isFinal) {
      const clean = transcript.trim();
      if (!clean || normalizeForDedup(clean) === normalizeForDedup(lastFinalRef.current)) return;
      lastFinalRef.current = clean;
      finalizedRef.current = finalizedRef.current ? `${finalizedRef.current} ${clean}` : clean;
      liveTranscriptRef.current = finalizedRef.current;
    } else {
      liveTranscriptRef.current = finalizedRef.current ? `${finalizedRef.current} ${transcript}` : transcript;
    }
  });
  useSpeechRecognitionEvent('audioend', (event) => {
    nativeAudioUriRef.current = event.uri ?? null;
    audioEndResolverRef.current?.(event.uri ?? null);
    audioEndResolverRef.current = null;
  });

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

  function waitForNativeAudioUri(timeoutMs = 3000): Promise<string | null> {
    return new Promise((resolve) => {
      audioEndResolverRef.current = resolve;
      setTimeout(() => {
        if (audioEndResolverRef.current) {
          audioEndResolverRef.current = null;
          resolve(nativeAudioUriRef.current);
        }
      }, timeoutMs);
    });
  }

  const start = useCallback(async (): Promise<boolean> => {
    finalizedRef.current = '';
    lastFinalRef.current = '';
    liveTranscriptRef.current = '';
    nativeAudioUriRef.current = null;
    setElapsedSeconds(0);

    const speechPerm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();

    if (Platform.OS === 'web') {
      const micPerm = await requestRecordingPermissionsAsync();
      if (!micPerm.granted) return false;
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      if (speechPerm.granted) {
        ExpoSpeechRecognitionModule.start({ lang: 'fr-FR', interimResults: true, continuous: true });
      }
    } else {
      if (!speechPerm.granted) return false;
      ExpoSpeechRecognitionModule.start({
        lang: 'fr-FR',
        interimResults: true,
        continuous: true,
        recordingOptions: { persist: true },
      });
    }

    setRecording(true);
    startTimer();
    return true;
  }, [audioRecorder]);

  const stop = useCallback(async (): Promise<VoiceRecording | null> => {
    stopTimer();
    setRecording(false);
    const durationSeconds = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));

    if (Platform.OS === 'web') {
      ExpoSpeechRecognitionModule.stop();
      await audioRecorder.stop();
      const uri = audioRecorder.uri;
      if (!uri) return null;
      return { uri, mimeType: 'audio/webm', durationSeconds, transcript: liveTranscriptRef.current.trim() };
    }

    ExpoSpeechRecognitionModule.stop();
    const uri = await waitForNativeAudioUri();
    if (!uri) return null;
    return { uri, mimeType: 'audio/m4a', durationSeconds, transcript: liveTranscriptRef.current.trim() };
  }, [audioRecorder]);

  const cancel = useCallback(() => {
    stopTimer();
    setRecording(false);
    ExpoSpeechRecognitionModule.abort();
    if (Platform.OS === 'web') {
      audioRecorder.stop().catch(() => {});
    }
  }, [audioRecorder]);

  return { recording, elapsedSeconds, start, stop, cancel };
}
