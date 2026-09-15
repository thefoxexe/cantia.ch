import { supabase } from '../supabase';
import { invokeFunction } from './functions';
import type { ClientDocumentsPayload, PublicDevisPayload, PublicFacturePayload, PublicPayslipsPayload } from '../types';

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

export function publicPayslipsUrl(token: string): string {
  if (typeof window !== 'undefined' && window.location) {
    return `${window.location.origin}/salaire-employe/${token}`;
  }
  return `https://cantia.ch/salaire-employe/${token}`;
}

// All calls are anonymous (no session) — the RPCs are SECURITY DEFINER and
// gate access themselves via token + client_email match, not via
// RLS/auth.uid(), so the plain (anon-key) client works unauthenticated.
// Email match alone is no longer sufficient though: every call below also
// requires a `session` string proving the caller passed the emailed
// one-time-code step (see requestPortalCode/verifyPortalCode) — a request
// missing or carrying a stale session is rejected server-side regardless of
// what the UI does, since these RPCs are the actual trust boundary.

export async function requestPortalCode(token: string, kind: 'devis' | 'facture' | 'payslip', email: string): Promise<{ ok: boolean; error: string | null }> {
  const { error } = await invokeFunction('request-portal-code', { token, kind, email });
  return { ok: !error, error };
}

export async function verifyPortalCode(
  token: string,
  email: string,
  code: string,
): Promise<{ session: string | null; error: string | null }> {
  const { data, error } = await supabase.rpc('verify_public_document_code', { p_token: token, p_email: email, p_code: code });
  if (error) return { session: null, error: error.message };
  return { session: (data as { session_token: string } | null)?.session_token ?? null, error: null };
}

export async function getPublicDevis(
  token: string,
  email: string,
  session: string,
): Promise<{ data: PublicDevisPayload | null; error: string | null }> {
  const { data, error } = await supabase.rpc('get_public_devis', { p_token: token, p_email: email, p_session: session });
  return { data: (data as PublicDevisPayload) ?? null, error: error?.message ?? null };
}

export async function acceptPublicDevis(
  token: string,
  email: string,
  signerName: string,
  signatureData: string,
  session: string,
): Promise<{ status: string | null; error: string | null }> {
  const { data, error } = await supabase.rpc('accept_public_devis', {
    p_token: token,
    p_email: email,
    p_signer_name: signerName,
    p_signature_data: signatureData,
    p_session: session,
  });
  return { status: (data as { status: string } | null)?.status ?? null, error: error?.message ?? null };
}

export async function getPublicFacture(
  token: string,
  email: string,
  session: string,
): Promise<{ data: PublicFacturePayload | null; error: string | null }> {
  const { data, error } = await supabase.rpc('get_public_facture', { p_token: token, p_email: email, p_session: session });
  return { data: (data as PublicFacturePayload) ?? null, error: error?.message ?? null };
}

export async function listClientDocuments(
  token: string,
  kind: 'devis' | 'facture',
  email: string,
  session: string,
): Promise<{ data: ClientDocumentsPayload | null; error: string | null }> {
  const { data, error } = await supabase.rpc('list_client_documents', { p_token: token, p_kind: kind, p_email: email, p_session: session });
  return { data: (data as ClientDocumentsPayload) ?? null, error: error?.message ?? null };
}

// The edge function re-verifies token+email+session itself (same trust
// model as the RPCs above) before signing a short-lived download URL —
// invoked with the anon key since a client on their own portal has no
// Supabase session.
export async function getPublicDocumentPdfUrl(
  token: string,
  kind: 'devis' | 'facture',
  email: string,
  session: string,
): Promise<{ url: string | null; error: string | null }> {
  const { data, error } = await invokeFunction<{ url: string }>('public-document-pdf', { token, kind, email, session });
  return { url: data?.url ?? null, error };
}

// The payslip portal has its own pair of endpoints (not the devis/facture
// RPCs/edge function above) — an edge function rather than a plain RPC
// because it also needs to sign the org's logo out of private storage,
// something only an edge function (not SQL) can do.
export async function getPublicPayslips(
  token: string,
  email: string,
  session: string,
): Promise<{ data: PublicPayslipsPayload | null; error: string | null }> {
  const { data, error } = await invokeFunction<PublicPayslipsPayload>('public-payslip-portal', { token, email, session });
  return { data, error };
}

export async function getPublicPayslipPdfUrl(
  token: string,
  email: string,
  session: string,
  slipId: string,
): Promise<{ url: string | null; error: string | null }> {
  const { data, error } = await invokeFunction<{ url: string }>('public-payslip-pdf', { token, email, session, slip_id: slipId });
  return { url: data?.url ?? null, error };
}
