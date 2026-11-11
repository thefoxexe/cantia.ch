// Read-only demo of the app (demo.cantia.ch): same build as app.cantia.ch,
// compiled with EXPO_PUBLIC_DEMO=1 (scripts/build-demo.mjs). The Supabase
// client then never reaches the network: lib/demo/fetch.ts answers every
// request from the sample company in lib/demo/fixtures.ts and refuses every
// write, and a signed-in session is already in place.
export const IS_DEMO = process.env.EXPO_PUBLIC_DEMO === '1';

type Listener = () => void;
const listeners = new Set<Listener>();

// Last click, tap or key press of the visitor: a refused write only shows
// the sign-up window when it follows one, so writes the app makes on its
// own while a page loads stay silent.
let lastGesture = 0;
if (IS_DEMO && typeof window !== 'undefined') {
  const mark = () => {
    lastGesture = Date.now();
  };
  window.addEventListener('pointerdown', mark, true);
  window.addEventListener('keydown', mark, true);
}

// Called when the demo refused a change, so the banner can say so.
export function notifyDemoBlocked(): void {
  if (Date.now() - lastGesture > 2000) return;
  for (const l of listeners) l();
}

export function onDemoBlocked(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
