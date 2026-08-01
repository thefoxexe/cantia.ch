import { useCallback, useEffect, useRef, useState } from 'react';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from './speechRecognitionStub';

// A pause between sentences starts a new "final" segment rather than
// continuing the same one — the module's own docs warn that multiple final
// results will be returned during a single continuous session, so this
// concatenates them itself instead of only keeping the latest one.
//
// On Android in particular, continuous mode is simulated by the native side
// auto-restarting the recognizer after each pause, and that restart can
// redeliver the exact same segment as a fresh "final" result — with nothing
// guarding against it, a single short word could get appended over and over
// ("chantier chantier chantier chantier..."). lastFinalRef only lets a
// segment through if it differs from the immediately preceding one, which
// collapses any run of exact repeats down to one without touching genuinely
// new (even short) words spoken next.
function normalizeForDedup(text: string): string {
  return text.trim().toLowerCase().replace(/[.,!?;:]+$/, '');
}

// Errors the platform can't recover from on its own — anything else (no
// speech detected, a network blip, the generic Android "client"/"unknown"
// codes) is treated as transient and left to the 'end' handler below, which
// restarts the session rather than surfacing it as a stop.
const FATAL_ERRORS = new Set(['not-allowed', 'service-not-allowed', 'language-not-supported', 'audio-capture']);

export function useDictation(onTranscriptChange: (sessionTranscript: string) => void) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const onTranscriptChangeRef = useRef(onTranscriptChange);
  onTranscriptChangeRef.current = onTranscriptChange;
  const finalizedRef = useRef('');
  const lastFinalRef = useRef('');
  const langRef = useRef('fr-FR');
  // True from start() to stop() (or a fatal error) — distinguishes an 'end'
  // the user asked for from one the OS triggered on its own (Android's
  // continuous mode is itself an auto-restart loop, and even iOS 17- cuts a
  // session after ~3s of silence), which is what "ça arrête d'enregistrer
  // au bout d'un moment" was: the session ending mid-dictation with no
  // action from the user.
  const shouldListenRef = useRef(false);

  useEffect(() => {
    setSupported(ExpoSpeechRecognitionModule.isRecognitionAvailable());
  }, []);

  useSpeechRecognitionEvent('result', (event) => {
    const transcript = event.results[0]?.transcript ?? '';
    if (event.isFinal) {
      const clean = transcript.trim();
      if (!clean || normalizeForDedup(clean) === normalizeForDedup(lastFinalRef.current)) return;
      lastFinalRef.current = clean;
      finalizedRef.current = finalizedRef.current ? `${finalizedRef.current} ${clean}` : clean;
      onTranscriptChangeRef.current(finalizedRef.current);
    } else {
      const live = finalizedRef.current ? `${finalizedRef.current} ${transcript}` : transcript;
      onTranscriptChangeRef.current(live);
    }
  });
  useSpeechRecognitionEvent('end', () => {
    if (shouldListenRef.current) {
      // Transcript accumulated so far (finalizedRef/lastFinalRef) is left
      // untouched — this is a silent hand-off, not a new session.
      ExpoSpeechRecognitionModule.start({ lang: langRef.current, interimResults: true, continuous: true });
      return;
    }
    setListening(false);
  });
  useSpeechRecognitionEvent('error', (event) => {
    if (FATAL_ERRORS.has(event.error)) {
      shouldListenRef.current = false;
      setListening(false);
    }
  });

  const start = useCallback(async (lang = 'fr-FR') => {
    const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!perm.granted) return false;
    finalizedRef.current = '';
    lastFinalRef.current = '';
    langRef.current = lang;
    shouldListenRef.current = true;
    setListening(true);
    ExpoSpeechRecognitionModule.start({ lang, interimResults: true, continuous: true });
    return true;
  }, []);

  const stop = useCallback(() => {
    shouldListenRef.current = false;
    ExpoSpeechRecognitionModule.stop();
  }, []);

  return { supported, listening, start, stop };
}
