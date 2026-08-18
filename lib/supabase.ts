import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// A self-returning stand-in for the Node SSR pass below: every property
// access yields a callable, chainable no-op that resolves to itself, so an
// accidental synchronous `supabase.from('x').select().order()` during
// server rendering degrades to a harmless no-op instead of a crash (the
// same shape works whether the caller treats it as a builder to keep
// chaining off of, an awaited promise, or a callback-taking function).
function makeSsrStub(): any {
  const target = () => stub;
  const stub: any = new Proxy(target, {
    get: () => stub,
    apply: () => Promise.resolve({ data: null, error: null }),
  });
  return stub;
}

// The marketing-only static export (see scripts/build-marketing.mjs)
// prerenders every route once in a Node process with no `window` —
// building the real client there throws, because `detectSessionInUrl`/
// `persistSession` synchronously touch storage during construction. Every
// actual browser context (dev, app.cantia.ch, and the client-side
// hydration pass that follows that same static prerender) always has
// `window`, so this only changes what happens during that one Node pass —
// call sites all live inside `useEffect`s (never invoked while rendering
// on the server) and get the real client as soon as the page hydrates.
export const supabase = (
  typeof window === 'undefined'
    ? (makeSsrStub() as ReturnType<typeof createClient>)
    : createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          storage: AsyncStorage,
          autoRefreshToken: true,
          persistSession: true,
          // Needed so the web build picks the session up automatically when
          // Google's OAuth redirect lands back on the app with tokens in the
          // URL (see auth-context.tsx's signInWithGoogle). No-op on native —
          // there's no `window` for this to key off of there.
          detectSessionInUrl: true,
        },
      })
);

export const STORAGE_BUCKET = 'opus-storage';
