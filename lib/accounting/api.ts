import { supabase } from '../supabase';
import type { Permission } from './copy';

// Data of accounting.cantia.ch. Everything goes through database functions
// or tables protected by row level security
// (supabase/migrations/20260929210000_accounting_foundation.sql): the
// organization id sent from here is never trusted, the database checks the
// firm's ACTIVE access and the permission on every row.

export type FirmRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export interface Firm {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  postal_code: string | null;
  city: string | null;
  country: string;
  ide_number: string | null;
  website: string | null;
  mandates_range: string | null;
  software: string[];
  locale: 'fr' | 'de' | 'it';
  status: 'ACTIVE' | 'SUSPENDED' | 'BLOCKED';
  verified: boolean;
}

export interface Me {
  firm: Firm;
  role: FirmRole;
  first_name: string | null;
  last_name: string | null;
  is_admin: boolean;
}

export interface Mandant {
  access_id: string;
  organization_id: string;
  name: string;
  status: 'ACTIVE' | 'PENDING_CLIENT' | 'PENDING_FIRM';
  source: string;
  permissions: Permission[];
  plan_name: string | null;
  subscription_status: string | null;
  last_activity_at: string | null;
  documents_count: number | null;
  factures_count: number | null;
  factures_open_chf: number | null;
  factures_overdue: number | null;
  payments_30d_chf: number | null;
  bexio_status: string | null;
  requested_at: string;
  approved_at: string | null;
}

export interface Dashboard {
  active_clients: number;
  pending_client: number;
  pending_firm: number;
  overdue_invoices: number;
  open_chf: number;
  documents: number;
  pending_invitations: number;
  new_clients: number;
  recent_documents: { id: string; file_name: string; file_path: string; created_at: string; organization_id: string; organization_name: string }[];
}

export interface Invitation {
  id: string;
  kind: 'NEW_CLIENT' | 'STAFF';
  email: string;
  company_name: string | null;
  contact_name: string | null;
  status: 'PENDING' | 'ACCEPTED' | 'CANCELLED' | 'EXPIRED';
  partner_code: string | null;
  created_at: string;
  expires_at: string;
  result_organization_id: string | null;
}

export interface ClientHeader {
  access_id: string;
  organization_id: string;
  name: string;
  permissions: Permission[];
  approved_at: string | null;
  plan_name: string | null;
  subscription_status: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  postal_code: string | null;
  locality: string | null;
  ide_number: string | null;
  locale: string | null;
}

export interface DocumentRow {
  id: string;
  kind: 'invoice' | 'receipt' | 'shared';
  organization_id: string;
  organization_name: string;
  title: string;
  file_path: string | null;
  doc_date: string | null;
  amount_chf: number | null;
  created_at: string;
}

export interface Team {
  members: { user_id: string; role: FirmRole; first_name: string | null; last_name: string | null; email: string; created_at: string; me: boolean }[];
  invitations: { id: string; email: string; role: FirmRole; created_at: string; expires_at: string }[];
}

export interface AuditRow {
  id: string;
  action: string;
  organization_name: string | null;
  actor_name: string | null;
  details: Record<string, unknown>;
  created_at: string;
}

async function call<T>(fn: string, args?: Record<string, unknown>): Promise<{ data: T | null; error: string | null }> {
  const { data, error } = await supabase.rpc(fn, args ?? {});
  return { data: (data as T) ?? null, error: error?.message ?? null };
}

export const acc = {
  me: () => call<Me | null>('acc_me'),
  createFirm: (input: {
    name: string;
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
    postalCode: string;
    city: string;
    country: string;
    ide: string;
    website: string;
    mandates: string | null;
    software: string[];
    locale: string;
  }) =>
    call<string>('acc_create_firm', {
      p_name: input.name,
      p_first_name: input.firstName,
      p_last_name: input.lastName,
      p_phone: input.phone || null,
      p_address: input.address || null,
      p_postal_code: input.postalCode || null,
      p_city: input.city || null,
      p_country: input.country || 'CH',
      p_ide_number: input.ide || null,
      p_website: input.website || null,
      p_mandates_range: input.mandates,
      p_software: input.software,
      p_locale: input.locale,
    }),
  updateFirm: (f: Firm) =>
    call<null>('acc_update_firm', {
      p_name: f.name,
      p_phone: f.phone,
      p_address: f.address,
      p_postal_code: f.postal_code,
      p_city: f.city,
      p_country: f.country,
      p_ide_number: f.ide_number,
      p_website: f.website,
      p_mandates_range: f.mandates_range,
      p_software: f.software,
      p_locale: f.locale,
    }),
  dashboard: () => call<Dashboard>('acc_dashboard'),
  mandants: () => call<Mandant[]>('acc_mandants'),
  invitations: () => call<Invitation[]>('acc_invitations'),
  inviteClient: (email: string, company: string, contact: string) =>
    call<{ kind: 'request' | 'invitation'; count?: number; with_partner_code?: boolean }>('acc_invite_client', {
      p_email: email,
      p_company_name: company || null,
      p_contact_name: contact || null,
    }),
  respondClient: (accessId: string, accept: boolean) => call<null>('acc_respond_client', { p_access_id: accessId, p_accept: accept }),
  cancelInvitation: (id: string) => call<null>('acc_cancel_invitation', { p_id: id }),
  resendInvitation: (id: string) => call<null>('acc_resend_invitation', { p_id: id }),
  client: (orgId: string) => call<ClientHeader | null>('acc_client', { p_org: orgId }),
  documents: (params: { org?: string | null; from?: string | null; to?: string | null; kind?: 'invoice' | 'receipt' | 'shared' | null } = {}) =>
    call<DocumentRow[]>('acc_documents', { p_org: params.org ?? null, p_from: params.from ?? null, p_to: params.to ?? null, p_kind: params.kind ?? null }),
  team: () => call<Team>('acc_team'),
  inviteStaff: (email: string, role: 'ADMIN' | 'MEMBER') => call<null>('acc_invite_staff', { p_email: email, p_role: role }),
  setRole: (userId: string, role: FirmRole) => call<null>('acc_set_member_role', { p_user: userId, p_role: role }),
  removeMember: (userId: string) => call<null>('acc_remove_member', { p_user: userId }),
  audit: (orgId?: string | null) => call<AuditRow[]>('acc_audit', { p_org: orgId ?? null }),
  invitationPreview: (token: string) =>
    call<{ kind: 'STAFF' | 'CLIENT_TO_FIRM'; email: string; role: string | null; firm_name: string | null; organization_name: string | null; permissions: Permission[] | null; status: string } | null>(
      'acc_invitation_preview',
      { p_token: token },
    ),
  acceptInvitation: (token: string, firstName?: string, lastName?: string) =>
    call<{ kind: string; needs_firm?: boolean; organization_id?: string }>('acc_accept_invitation', {
      p_token: token,
      p_first_name: firstName ?? null,
      p_last_name: lastName ?? null,
    }),
  activatePartner: () => call<unknown>('acc_activate_partner'),
};

export const accAdmin = {
  am: () => call<boolean>('acc_am_admin'),
  overview: () =>
    call<{ firms: number; firms_active: number; firms_new_30d: number; linked_clients: number; acquired_clients: number; acquired_mrr_chf: number; partner_firms: number; suspicious: number }>(
      'acc_admin_overview',
    ),
  firms: () =>
    call<
      {
        id: string;
        name: string;
        city: string | null;
        status: string;
        verified: boolean;
        created_at: string;
        owner_email: string | null;
        members: number;
        active_clients: number;
        pending: number;
        invitations: number;
        acquired: number;
        partner: boolean;
        suspicious: string | null;
      }[]
    >('acc_admin_firms'),
  firm: (id: string) => call<Record<string, any>>('acc_admin_firm', { p_firm: id }),
  setFirm: (id: string, patch: { status?: string; verified?: boolean }) =>
    call<null>('acc_admin_set_firm', { p_firm: id, p_status: patch.status ?? null, p_verified: patch.verified ?? null }),
  addNote: (id: string, body: string) => call<null>('acc_admin_add_note', { p_firm: id, p_body: body }),
  removeAccess: (accessId: string, reason: string) => call<null>('acc_admin_remove_access', { p_access_id: accessId, p_reason: reason }),
};

// Partner figures of the signed-in user (same functions as partners.cantia.ch).
export async function partnerSummary(): Promise<{ active: boolean; code: string | null; brought: number; earned: number; available: number }> {
  const { data: profile } = await supabase.from('partner_profiles').select('id, status').maybeSingle();
  if (!profile) return { active: false, code: null, brought: 0, earned: 0, available: 0 };
  const [{ data: codes }, { data: summary }, { data: stats }] = await Promise.all([
    supabase.from('partner_referral_codes').select('code, is_default').eq('partner_id', profile.id).order('is_default', { ascending: false }).limit(1),
    supabase.rpc('my_partner_summary'),
    supabase.rpc('my_partner_stats'),
  ]);
  const s = (summary ?? {}) as { lifetime_chf?: number; available_chf?: number };
  const st = (stats ?? {}) as { signups?: number };
  return {
    active: profile.status === 'ACTIVE',
    code: codes?.[0]?.code ?? null,
    brought: st.signups ?? 0,
    earned: Number(s.lifetime_chf ?? 0),
    available: Number(s.available_chf ?? 0),
  };
}

// Invoice PDF / receipt: short-lived signed link, allowed by the storage
// policy only for documents of an ACTIVE client with DOWNLOAD_DOCUMENTS.
export async function signedDocumentUrl(path: string): Promise<string | null> {
  const { data } = await supabase.storage.from('opus-storage').createSignedUrl(path, 120);
  return data?.signedUrl ?? null;
}

export function formatChf(amount: number | null | undefined): string {
  const n = Number(amount) || 0;
  const [int, dec] = Math.abs(n).toFixed(2).split('.');
  return `${n < 0 ? '−' : ''}CHF ${int.replace(/\B(?=(\d{3})+(?!\d))/g, '’')}.${dec}`;
}

export function formatDate(iso: string | null | undefined, locale: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(`${locale}-CH`, { day: '2-digit', month: '2-digit', year: 'numeric' });
}
