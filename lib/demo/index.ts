// Read-only demo of the app (demo.cantia.ch): same build as app.cantia.ch,
// compiled with EXPO_PUBLIC_DEMO=1 (scripts/build-demo.mjs). The Supabase
// client then never reaches the network: lib/demo/fetch.ts answers every
// request from the sample company in lib/demo/fixtures.ts and refuses every
// write, and a signed-in session is already in place.
export const IS_DEMO = process.env.EXPO_PUBLIC_DEMO === '1';

type Listener = () => void;
const listeners = new Set<Listener>();

// Called when the demo refused a change, so the banner can say so.
export function notifyDemoBlocked(): void {
  for (const l of listeners) l();
}

export function onDemoBlocked(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
