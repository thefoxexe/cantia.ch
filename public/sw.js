// Minimal service worker — its only job is to exist and register, which is
// what Chrome/Edge require before firing beforeinstallprompt. It does not
// cache anything: this is a live business app (devis, factures, chantiers),
// so every request should always go straight to the network rather than
// risk serving stale data from a cache.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', () => {
  // No-op: falling through to the network for every request.
});
