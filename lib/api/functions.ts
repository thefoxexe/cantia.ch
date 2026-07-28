import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from '../supabase';

// supabase-js hides the real edge-function error behind a hardcoded
// "Edge Function returned a non-2xx status code" message — the actual JSON
// body (what our functions put in `{ error }`) is only reachable via
// FunctionsHttpError.context, an unread Response. This reads it properly.
export async function invokeFunction<T = any>(
  name: string,
  body: Record<string, unknown>,
): Promise<{ data: T | null; error: string | null }> {
  const { data, error } = await supabase.functions.invoke(name, { body });

  if (error) {
    if (error instanceof FunctionsHttpError) {
      try {
        const payload = await error.context.json();
        if (payload?.error) return { data: null, error: String(payload.error) };
      } catch {
        // response wasn't JSON — fall through to the generic message
      }
    }
    return { data: null, error: error.message };
  }

  if (data?.error) return { data: null, error: String(data.error) };
  return { data: data ?? null, error: null };
}
