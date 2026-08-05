// Temporary stand-in for 'expo-speech-recognition'. Its latest published
// release (56.0.1) predates Expo SDK 57 (this app is on ~57.0.8) and is the
// leading suspect for the native crash-on-launch reported on a fresh EAS
// build — a native module built against an older RN/New Architecture ABI is
// a classic cause of an instant, pre-JS crash with no error the JS layer
// ever sees. Package removed from app.json/package.json until a SDK
// 57-compatible release exists; this mirrors its call shape exactly so
// lib/useDictation.ts and lib/useVoiceRecorder.ts need only swap the import
// source (one line each) and otherwise keep working unchanged, reporting
// "not available" instead of touching any native code. Swap the import back
// once a compatible version ships.
export const ExpoSpeechRecognitionModule = {
  isRecognitionAvailable: () => false,
  requestPermissionsAsync: async () => ({ granted: false }),
  start: (_options?: unknown) => {},
  stop: () => {},
  abort: () => {},
};

export function useSpeechRecognitionEvent(_eventName: string, _handler: (event: any) => void) {
  // no-op: the native module is disabled, so no event ever fires.
}
