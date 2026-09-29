import { supabase } from '../supabase';
import type { PartnerType } from './copy';

// Data access for partners.cantia.ch. Everything goes through the signed-in
// session: the partner is always derived server-side from auth.uid(), never
// passed from here (see supabase/migrations/20260929120000_partners_foundation.sql).
export const PARTNER_LINK_BASE = 'https://cantia.ch/?ref=';

export interface PartnerProfile {
  id: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'BLOCKED';
  first_name: string;
  last_name: string;
  company_name: string | null;
  partner_type: PartnerType;
  locale: 'fr' | 'de' | 'it';
  payout_account_holder: string | null;
  iban_masked: string | null;
  created_at: string;
}

export interface PartnerStats {
  clicks: number;
  unique_visitors: number;
  signups: number;
  active_customers: number;
  trials: number;
}

export interface PartnerReferral {
  public_ref: string;
  attributed_at: string;
  status: 'SIGNED_UP' | 'TRIAL' | 'ACTIVE' | 'CANCELLED';
  plan_name: string | null;
  first_paid_at: string | null;
  commission_eligible_until: string | null;
}

export async function getMyPartnerProfile(): Promise<{ profile: PartnerProfile | null; code: string | null }> {
  const { data: profile } = await supabase
    .from('partner_profiles')
    .select('id, status, first_name, last_name, company_name, partner_type, locale, payout_account_holder, iban_masked, created_at')
    .maybeSingle();
  if (!profile) return { profile: null, code: null };
  const { data: codes } = await supabase
    .from('partner_referral_codes')
    .select('code, is_default, created_at')
    .eq('partner_id', profile.id)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(1);
  return { profile: profile as PartnerProfile, code: codes?.[0]?.code ?? null };
}

export interface BecomePartnerInput {
  firstName: string;
  lastName: string;
  companyName: string;
  partnerType: PartnerType;
  phone: string;
  address: string;
  postalCode: string;
  city: string;
  locale: 'fr' | 'de' | 'it';
}

export async function becomePartner(input: BecomePartnerInput): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('become_partner', {
    p_first_name: input.firstName,
    p_last_name: input.lastName,
    p_company_name: input.companyName || null,
    p_partner_type: input.partnerType,
    p_phone: input.phone || null,
    p_address: input.address || null,
    p_postal_code: input.postalCode || null,
    p_city: input.city || null,
    p_country: 'CH',
    p_locale: input.locale,
  });
  return { error: error?.message ?? null };
}

export async function getMyPartnerStats(): Promise<PartnerStats | null> {
  const { data } = await supabase.rpc('my_partner_stats');
  return (data as PartnerStats | null) ?? null;
}

export async function getMyPartnerReferrals(): Promise<PartnerReferral[]> {
  const { data } = await supabase.rpc('my_partner_referrals');
  return (data as PartnerReferral[] | null) ?? [];
}

export async function setPayoutAccount(holder: string, iban: string): Promise<{ ibanMasked: string | null; error: string | null }> {
  const { data, error } = await supabase.rpc('set_partner_payout_account', { p_account_holder: holder, p_iban: iban });
  if (error) return { ibanMasked: null, error: error.message };
  return { ibanMasked: (data as { iban_masked?: string } | null)?.iban_masked ?? null, error: null };
}

// ---------------------------------------------------------------------------
// Commissions, payouts, levels (supabase/migrations/20260929150000_partners_commissions.sql)

export type PartnerLevel = 'MEMBER' | 'CONFIRMED' | 'PREMIUM';
export const LEVEL_THRESHOLDS: Record<PartnerLevel, number> = { MEMBER: 0, CONFIRMED: 5, PREMIUM: 15 };

export interface PartnerSummary {
  pending_chf: number;
  available_chf: number;
  in_payout_chf: number;
  paid_chf: number;
  lifetime_chf: number;
  next_available_at: string | null;
  paying_customers: number;
  level: PartnerLevel;
  min_payout_chf: number;
  payout_day: number;
}

export interface PartnerCommission {
  id: string;
  public_ref: string | null;
  kind: 'commission' | 'adjustment';
  base_amount_chf: number;
  amount_chf: number;
  billing: string | null;
  status: 'PENDING' | 'AVAILABLE' | 'PAID' | 'CANCELLED';
  paid_at: string;
  available_at: string;
  cancelled_reason: string | null;
}

export interface PartnerPayout {
  id: string;
  period: string;
  amount_chf: number;
  commission_count: number;
  status: 'TO_PAY' | 'PAID' | 'CANCELLED';
  iban_last4: string | null;
  reference: string | null;
  created_at: string;
  paid_at: string | null;
}

export async function getMyPartnerSummary(): Promise<PartnerSummary | null> {
  const { data } = await supabase.rpc('my_partner_summary');
  return (data as PartnerSummary | null) ?? null;
}

export async function getMyPartnerCommissions(): Promise<PartnerCommission[]> {
  const { data } = await supabase.rpc('my_partner_commissions');
  return (data as PartnerCommission[] | null) ?? [];
}

export async function getMyPartnerPayouts(): Promise<PartnerPayout[]> {
  const { data } = await supabase.rpc('my_partner_payouts');
  return (data as PartnerPayout[] | null) ?? [];
}

export async function amPartnersAdmin(): Promise<boolean> {
  const { data } = await supabase.rpc('am_partners_admin');
  return data === true;
}

// ---------------------------------------------------------------------------
// Admin (partners.admin permission, checked server-side by every function)

export interface AdminOverview {
  period: string;
  payout_day: number;
  reminder_day: number;
  min_payout_chf: number;
  partners: number;
  partners_active: number;
  partners_new_30d: number;
  clicks_30d: number;
  signups_30d: number;
  signups_total: number;
  paying_customers: number;
  pending_chf: number;
  available_chf: number;
  paid_chf: number;
  eligible_partners: number;
  eligible_chf: number;
  missing_iban: number;
  to_pay_count: number;
  to_pay_chf: number;
  paid_this_period: number;
  prepared_this_period: number;
}

export interface AdminPartner {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  company_name: string | null;
  partner_type: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'BLOCKED';
  payouts_frozen: boolean;
  iban_masked: string | null;
  code: string | null;
  created_at: string;
  clicks: number;
  signups: number;
  paying: number;
  pending_chf: number;
  available_chf: number;
  paid_chf: number;
}

export interface AdminPayout {
  id: string;
  partner_id: string;
  partner_name: string;
  company_name: string | null;
  email: string;
  period: string;
  amount_chf: number;
  commission_count: number;
  status: 'TO_PAY' | 'PAID' | 'CANCELLED';
  account_holder: string | null;
  iban: string | null;
  reference: string | null;
  created_at: string;
  paid_at: string | null;
}

export interface AdminCommission {
  id: string;
  partner_name: string;
  public_ref: string | null;
  kind: string;
  base_amount_chf: number;
  amount_chf: number;
  status: string;
  paid_at: string;
  available_at: string;
}

async function rpc<T>(name: string, args?: Record<string, unknown>): Promise<{ data: T | null; error: string | null }> {
  const { data, error } = await supabase.rpc(name, args);
  return { data: (data as T) ?? null, error: error?.message ?? null };
}

export const partnersAdmin = {
  overview: () => rpc<AdminOverview>('partners_admin_overview'),
  partners: () => rpc<AdminPartner[]>('partners_admin_partners'),
  payouts: (status?: 'TO_PAY' | 'PAID' | 'CANCELLED') => rpc<AdminPayout[]>('partners_admin_payouts', { p_status: status ?? null }),
  commissions: () => rpc<AdminCommission[]>('partners_admin_recent_commissions'),
  preparePayouts: () => rpc<{ created: number; skipped_missing_iban: number }>('partners_admin_prepare_payouts'),
  markPaid: (id: string, reference: string) => rpc<{ paid: boolean }>('partners_admin_mark_paid', { p_payout_id: id, p_reference: reference }),
  cancelPayout: (id: string) => rpc<{ cancelled: boolean }>('partners_admin_cancel_payout', { p_payout_id: id }),
  setPartner: (id: string, patch: { status?: AdminPartner['status']; frozen?: boolean; reason?: string }) =>
    rpc<{ updated: boolean }>('partners_admin_set_partner', {
      p_partner_id: id,
      p_status: patch.status ?? null,
      p_frozen: patch.frozen ?? null,
      p_reason: patch.reason ?? null,
    }),
};

export function formatChf(amount: number): string {
  const n = Number(amount) || 0;
  const [int, dec] = Math.abs(n).toFixed(2).split('.');
  return `${n < 0 ? '−' : ''}CHF ${int.replace(/\B(?=(\d{3})+(?!\d))/g, '’')}.${dec}`;
}
