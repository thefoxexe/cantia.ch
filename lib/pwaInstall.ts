import { Platform } from 'react-native';

// Chrome/Edge (desktop + Android) fire this once the page meets their
// installability heuristics (manifest + registered service worker); calling
// .prompt() on it is the only way to trigger their native "Installer
// l'application" dialog. Safari (iOS/macOS) never fires it — there is no
// native prompt there, which is why the account menu falls back to the
// manual instructions screen when this is unavailable.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;

if (Platform.OS === 'web' && typeof window !== 'undefined') {
  // This project builds with web.output: "single" (a plain client-rendered
  // SPA shell), so Expo Router's app/+html.tsx customization never applies
  // — verified empirically: neither `expo start --web` nor `expo export -p
  // web` inject anything from it into the served/exported index.html, both
  // stay on Expo's generic default template. The manifest link, theme-color
  // meta, and apple-touch-icon a browser needs for installability have to
  // be added to the document by hand at runtime instead.
  const head = document.head;
  if (head && !document.querySelector('link[rel="manifest"]')) {
    const manifestLink = document.createElement('link');
    manifestLink.rel = 'manifest';
    manifestLink.href = '/manifest.json';
    head.appendChild(manifestLink);

    const themeColor = document.createElement('meta');
    themeColor.name = 'theme-color';
    themeColor.content = '#7C3B21';
    head.appendChild(themeColor);

    const touchIcon = document.createElement('link');
    touchIcon.rel = 'apple-touch-icon';
    touchIcon.href = '/pwa-icon-192.png';
    head.appendChild(touchIcon);
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Installability just degrades to "unavailable" — the account menu
      // already falls back to the manual instructions screen for that case.
    });
  }
}

export function canPromptInstall(): boolean {
  return deferredPrompt != null;
}

export async function promptInstall(): Promise<boolean> {
  if (!deferredPrompt) return false;
  const prompt = deferredPrompt;
  deferredPrompt = null;
  await prompt.prompt();
  const { outcome } = await prompt.userChoice;
  return outcome === 'accepted';
}
