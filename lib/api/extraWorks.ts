import { supabase } from '../supabase';
import { invokeFunction } from './functions';
import type { PublicExtraWorkPayload } from '../types';

export function publicExtraWorkUrl(token: string): string {
  if (typeof window !== 'undefined' && window.location) {
    return `${window.location.origin}/travaux-supplementaires-client/${token}`;
  }
  return `https://cantia.ch/travaux-supplementaires-client/${token}`;
}

export async function sendExtraWorkEmail(extraWorkId: string, customMessage?: string): Promise<{ sent: boolean; error: string | null }> {
  const { data, error } = await invokeFunction<{ sent: boolean }>('send-extra-work-email', {
    extra_work_id: extraWorkId,
    custom_message: customMessage?.trim() || undefined,
  });
  return { sent: !!data?.sent, error };
}

// Anonymous, same trust model as lib/api/publicPortal.ts — the RPCs are
// SECURITY DEFINER and gate access via token + client_email match, not via
// RLS/auth.uid(), so the plain anon-key client works unauthenticated.

export async function getPublicExtraWork(token: string, email: string): Promise<{ data: PublicExtraWorkPayload | null; error: string | null }> {
  const { data, error } = await supabase.rpc('get_public_extra_work', { p_token: token, p_email: email });
  return { data: (data as PublicExtraWorkPayload) ?? null, error: error?.message ?? null };
}

export async function acceptPublicExtraWork(
  token: string,
  email: string,
  signerName: string,
  signatureData: string,
): Promise<{ status: string | null; error: string | null }> {
  const { data, error } = await supabase.rpc('accept_public_extra_work', {
    p_token: token,
    p_email: email,
    p_signer_name: signerName,
    p_signature_data: signatureData,
  });
  return { status: (data as { status: string } | null)?.status ?? null, error: error?.message ?? null };
}
