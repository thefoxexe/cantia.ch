import { supabase } from '../supabase';
import type { ClientDocumentsPayload, PublicDevisPayload, PublicFacturePayload } from '../types';

export function publicDevisUrl(token: string): string {
  if (typeof window !== 'undefined' && window.location) {
    return `${window.location.origin}/devis-client/${token}`;
  }
  return `https://cantia.ch/devis-client/${token}`;
}

export function publicFactureUrl(token: string): string {
  if (typeof window !== 'undefined' && window.location) {
    return `${window.location.origin}/facture-client/${token}`;
  }
  return `https://cantia.ch/facture-client/${token}`;
}

// All three calls are anonymous (no session) — the RPCs are SECURITY
// DEFINER and gate access themselves via token + client_email match, not
// via RLS/auth.uid(), so the plain (anon-key) client works unauthenticated.

export async function getPublicDevis(token: string, email: string): Promise<{ data: PublicDevisPayload | null; error: string | null }> {
  const { data, error } = await supabase.rpc('get_public_devis', { p_token: token, p_email: email });
  return { data: (data as PublicDevisPayload) ?? null, error: error?.message ?? null };
}

export async function acceptPublicDevis(
  token: string,
  email: string,
  signerName: string,
  signatureData: string,
): Promise<{ status: string | null; error: string | null }> {
  const { data, error } = await supabase.rpc('accept_public_devis', {
    p_token: token,
    p_email: email,
    p_signer_name: signerName,
    p_signature_data: signatureData,
  });
  return { status: (data as { status: string } | null)?.status ?? null, error: error?.message ?? null };
}

export async function getPublicFacture(token: string, email: string): Promise<{ data: PublicFacturePayload | null; error: string | null }> {
  const { data, error } = await supabase.rpc('get_public_facture', { p_token: token, p_email: email });
  return { data: (data as PublicFacturePayload) ?? null, error: error?.message ?? null };
}

export async function listClientDocuments(
  token: string,
  kind: 'devis' | 'facture',
  email: string,
): Promise<{ data: ClientDocumentsPayload | null; error: string | null }> {
  const { data, error } = await supabase.rpc('list_client_documents', { p_token: token, p_kind: kind, p_email: email });
  return { data: (data as ClientDocumentsPayload) ?? null, error: error?.message ?? null };
}

// The edge function re-verifies token+email itself (same trust model as the
// RPCs above) before signing a short-lived download URL — invoked with the
// anon key since a client on their own portal has no Supabase session.
export async function getPublicDocumentPdfUrl(
  token: string,
  kind: 'devis' | 'facture',
  email: string,
): Promise<{ url: string | null; error: string | null }> {
  const { data, error } = await supabase.functions.invoke('public-document-pdf', { body: { token, kind, email } });
  if (error) return { url: null, error: error.message };
  if (data?.error) return { url: null, error: String(data.error) };
  return { url: data?.url ?? null, error: null };
}
