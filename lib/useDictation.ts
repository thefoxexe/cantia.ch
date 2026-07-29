import { useCallback, useEffect, useRef, useState } from 'react';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';

// A pause between sentences starts a new "final" segment rather than
// continuing the same one — the module's own docs warn that multiple final
// results will be returned during a single continuous session, so this
// concatenates them itself instead of only keeping the latest one.
export function useDictation(onTranscriptChange: (sessionTranscript: string) => void) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const onTranscriptChangeRef = useRef(onTranscriptChange);
  onTranscriptChangeRef.current = onTranscriptChange;
  const finalizedRef = useRef('');

  useEffect(() => {
    setSupported(ExpoSpeechRecognitionModule.isRecognitionAvailable());
  }, []);

  useSpeechRecognitionEvent('result', (event) => {
    const transcript = event.results[0]?.transcript ?? '';
    if (event.isFinal) {
      finalizedRef.current = finalizedRef.current ? `${finalizedRef.current} ${transcript}` : transcript;
      onTranscriptChangeRef.current(finalizedRef.current);
    } else {
      const live = finalizedRef.current ? `${finalizedRef.current} ${transcript}` : transcript;
      onTranscriptChangeRef.current(live);
    }
  });
  useSpeechRecognitionEvent('end', () => setListening(false));
  useSpeechRecognitionEvent('error', () => setListening(false));

  const start = useCallback(async (lang = 'fr-FR') => {
    const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!perm.granted) return false;
    finalizedRef.current = '';
    setListening(true);
    ExpoSpeechRecognitionModule.start({ lang, interimResults: true, continuous: true });
    return true;
  }, []);

  const stop = useCallback(() => {
    ExpoSpeechRecognitionModule.stop();
  }, []);

  return { supported, listening, start, stop };
}
