import { supabase } from '../supabase';

// Why a company cancels: picked in Compte → Abonnement just before Stripe's
// cancellation flow (table subscription_cancellation_reasons, read by the
// admin panel). Never blocks the cancellation: a failed insert is ignored.
export const CANCELLATION_REASONS = ['too_expensive', 'missing_feature', 'too_complex', 'not_used', 'other_tool', 'business_stopped', 'seasonal', 'other'] as const;
export type CancellationReason = (typeof CANCELLATION_REASONS)[number];

export async function saveCancellationReason(organizationId: string, userId: string, reason: CancellationReason | null, comment: string): Promise<void> {
  const text = comment.trim().slice(0, 2000);
  if (!reason && !text) return;
  try {
    await supabase.from('subscription_cancellation_reasons').insert({ organization_id: organizationId, user_id: userId, source: 'app', reason, comment: text || null });
  } catch {
    // never stand between the customer and their cancellation
  }
}

export interface CancellationReasonRow {
  id: string;
  organization_id: string;
  user_id: string | null;
  source: 'app' | 'stripe';
  reason: string | null;
  comment: string | null;
  created_at: string;
}

// Platform admin only (RLS).
export async function listCancellationReasons(organizationId?: string, limit = 50): Promise<CancellationReasonRow[]> {
  let q = supabase.from('subscription_cancellation_reasons').select('*').order('created_at', { ascending: false }).limit(limit);
  if (organizationId) q = q.eq('organization_id', organizationId);
  const { data, error } = await q;
  if (error) return [];
  return (data ?? []) as CancellationReasonRow[];
}
