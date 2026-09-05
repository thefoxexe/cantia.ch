import { Platform } from 'react-native';

// Tidio's public embed key — safe to embed directly, not a secret.
const TIDIO_SCRIPT_SRC = '//code.tidio.co/yi0kke4ku7gjiesaohhy0o3fdlh6c0hy.js';

let scriptInjected = false;
let apiReady = false;
// Set when openLiveChat() is called before Tidio has finished loading (the
// very first click) — the "ready" listener below drains it once the API
// actually exists, so that first click still opens the chat instead of
// silently doing nothing.
let openRequested = false;

// Loaded lazily — only when the Contact page's "Chat en direct" button is
// actually clicked, never sitewide — and its default floating bubble is
// hidden the moment the widget reports ready, so the only way to see it is
// that button, not a bubble following visitors around every other page.
function ensureTidioLoaded(): void {
  if (Platform.OS !== 'web' || scriptInjected) return;
  scriptInjected = true;

  document.addEventListener('tidioChat-ready', () => {
    apiReady = true;
    const api = (window as unknown as { tidioChatApi?: { hide: () => void; show: () => void; open: () => void } }).tidioChatApi;
    if (!api) return;
    api.hide();
    if (openRequested) {
      openRequested = false;
      api.show();
      api.open();
    }
  });

  const script = document.createElement('script');
  script.src = TIDIO_SCRIPT_SRC;
  script.async = true;
  document.head.appendChild(script);
}

export function openLiveChat(): void {
  if (Platform.OS !== 'web') return;
  const api = (window as unknown as { tidioChatApi?: { show: () => void; open: () => void } }).tidioChatApi;
  if (apiReady && api) {
    api.show();
    api.open();
    return;
  }
  // First click ever: script isn't loaded (or hasn't reported ready) yet —
  // queue the open for the "ready" listener above to fulfil.
  openRequested = true;
  ensureTidioLoaded();
}
