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
    .select('id, status, first_name, last_name, company_name, partner_type, locale, payout_account_holder, iban_masked')
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
