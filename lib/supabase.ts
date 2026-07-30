import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // Needed so the web build picks the session up automatically when
    // Google's OAuth redirect lands back on the app with tokens in the URL
    // (see auth-context.tsx's signInWithGoogle). No-op on native — there's
    // no `window` for this to key off of there.
    detectSessionInUrl: true,
  },
});

export const STORAGE_BUCKET = 'opus-storage';
