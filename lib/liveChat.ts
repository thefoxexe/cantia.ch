import { Platform } from 'react-native';

// Crisp's Website ID is a public client-side identifier (like a Stripe
// publishable key) — safe to embed directly, it's not a secret.
const CRISP_WEBSITE_ID = 'd3f8f882-ae6e-424a-bd7c-47808312daf5';

let loading = false;

// Loaded lazily — only when the Contact page actually calls openLiveChat(),
// never sitewide — and its default floating launcher is hidden immediately
// (queued before the real script even finishes loading), so the only way
// to see it is our own "Chat en direct" button, not a bubble following
// visitors around every page.
function ensureCrispLoaded(): void {
  if (Platform.OS !== 'web' || loading) return;
  loading = true;
  const w = window as unknown as { $crisp?: unknown[]; CRISP_WEBSITE_ID?: string };
  w.$crisp = w.$crisp || [];
  w.CRISP_WEBSITE_ID = CRISP_WEBSITE_ID;
  (w.$crisp as unknown[]).push(['do', 'chat:hide']);
  const script = document.createElement('script');
  script.src = 'https://client.crisp.chat/l.js';
  script.async = true;
  document.head.appendChild(script);
}

export function openLiveChat(): void {
  if (Platform.OS !== 'web') return;
  ensureCrispLoaded();
  const w = window as unknown as { $crisp?: unknown[] };
  (w.$crisp as unknown[]).push(['do', 'chat:show']);
  (w.$crisp as unknown[]).push(['do', 'chat:open']);
}
