export type OrgRole = 'owner' | 'admin' | 'member';
export type DevisStatus = 'draft' | 'ready' | 'sent' | 'accepted' | 'refused';
export type ClientType = 'particulier' | 'entreprise';

export interface Client {
  id: string;
  organization_id: string;
  type: ClientType;
  name: string;
  company_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DevisTrame {
  id: string;
  organization_id: string;
  name: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DevisTrameItem {
  id: string;
  trame_id: string;
  description: string;
  unit: string | null;
  unit_price: number;
  sort_order: number;
  created_at: string;
}

export interface Plan {
  id: string;
  name: string;
  storage_quota_mb: number;
  max_members: number;
  price_chf_monthly: number;
  price_chf_yearly: number | null;
  max_devis_factures_per_month: number | null;
  has_rtk: boolean;
  has_customization: boolean;
  has_email_sending: boolean;
  has_planning: boolean;
  has_profitability: boolean;
  max_trames: number | null;
  max_ai_uses_per_month: number | null;
  stripe_price_id: string | null;
  stripe_price_id_yearly: string | null;
}

export interface Organization {
  id: string;
  name: string;
  trade: string | null;
  logo_url: string | null;
  signature_url: string | null;
  address: string | null;
  street: string | null;
  postal_code: string | null;
  locality: string | null;
  ide_number: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  default_vat_rate: number;
  devis_validity_days: number;
  devis_terms: string | null;
  devis_template: string;
  brand_color: string;
  logo_placement: 'left' | 'center' | 'right';
  footer_text: string | null;
  iban: string | null;
  hourly_cost: number;
  plan_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: string | null;
  enabled_modules: string[];
  plan_selected: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrganizationInvite {
  id: string;
  organization_id: string;
  token: string;
  role: OrgRole;
  created_by: string | null;
  created_at: string;
  expires_at: string;
  used_by: string | null;
  used_at: string | null;
  revoked: boolean;
}

export type JoinRequestStatus = 'pending' | 'accepted' | 'rejected';

export interface OrganizationJoinRequest {
  id: string;
  organization_id: string;
  user_id: string;
  status: JoinRequestStatus;
  requested_at: string;
  decided_at: string | null;
  decided_by: string | null;
}

export interface OrganizationSearchResult {
  id: string;
  name: string;
  member_count: number;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  created_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: OrgRole;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  last_seen_at: string;
}

export interface Project {
  id: string;
  organization_id: string;
  name: string;
  client_name: string | null;
  address: string | null;
  status: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReportTemplate {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
}

export interface Report {
  id: string;
  organization_id: string;
  project_id: string;
  template_id: string | null;
  title: string;
  notes: string | null;
  status: 'draft' | 'generated';
  pdf_path: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReportPhoto {
  id: string;
  report_id: string;
  storage_path: string;
  caption: string | null;
  latitude: number | null;
  longitude: number | null;
  taken_at: string;
  sort_order: number;
}

export interface FeedEntry {
  id: string;
  organization_id: string;
  project_id: string;
  type: 'note' | 'photo' | 'voice';
  body: string | null;
  storage_path: string | null;
  caption: string | null;
  latitude: number | null;
  longitude: number | null;
  taken_at: string | null;
  transcript: string | null;
  duration_seconds: number | null;
  report_id: string | null;
  created_by: string | null;
  created_at: string;
}

export interface ProjectExpense {
  id: string;
  organization_id: string;
  project_id: string;
  label: string;
  amount: number;
  category: string | null;
  created_by: string | null;
  created_at: string;
}

export interface PlanningAssignment {
  id: string;
  organization_id: string;
  project_id: string;
  member_user_id: string;
  starts_on: string;
  ends_on: string;
  note: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Devis {
  id: string;
  organization_id: string;
  project_id: string | null;
  number: string | null;
  client_name: string;
  client_address: string | null;
  client_email: string | null;
  notes: string | null;
  status: DevisStatus;
  vat_rate: number;
  pdf_path: string | null;
  public_token: string;
  client_signed_at: string | null;
  client_signer_name: string | null;
  client_signature_data: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DevisItem {
  id: string;
  devis_id: string;
  description: string;
  quantity: number;
  unit: string | null;
  unit_price: number;
  sort_order: number;
}

export type FactureStatus = 'draft' | 'sent' | 'partial' | 'paid' | 'cancelled';

export interface Facture {
  id: string;
  organization_id: string;
  project_id: string | null;
  devis_id: string | null;
  template_id: string | null;
  number: string | null;
  client_name: string;
  client_address: string | null;
  client_email: string | null;
  notes: string | null;
  status: FactureStatus;
  vat_rate: number;
  due_date: string;
  paid_at: string | null;
  pdf_path: string | null;
  public_token: string;
  last_reminded_at: string | null;
  is_deposit: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// Shapes returned by the anonymous public-portal RPCs (get_public_devis,
// accept_public_devis, get_public_facture) — deliberately separate from
// Devis/Facture/Organization since the SQL whitelists a narrow subset of
// columns rather than returning full rows to an unauthenticated caller.
export interface PublicPortalItem {
  id: string;
  description: string;
  quantity: number;
  unit: string | null;
  unit_price: number;
  sort_order: number;
}

export interface PublicPortalOrganization {
  name: string;
  phone: string | null;
  street: string | null;
  postal_code: string | null;
  locality: string | null;
  address: string | null;
  ide_number: string | null;
}

export interface PublicPortalTotals {
  subtotal: number;
  vat: number;
  total: number;
}

export interface PublicDevisPayload {
  devis: {
    id: string;
    number: string | null;
    status: DevisStatus;
    client_name: string;
    client_address: string | null;
    notes: string | null;
    vat_rate: number;
    created_at: string;
    client_signed_at: string | null;
    client_signer_name: string | null;
  };
  items: PublicPortalItem[];
  totals: PublicPortalTotals;
  organization: PublicPortalOrganization;
}

export interface PublicFacturePayload {
  facture: {
    id: string;
    number: string | null;
    status: FactureStatus;
    is_deposit: boolean;
    client_name: string;
    client_address: string | null;
    notes: string | null;
    vat_rate: number;
    due_date: string;
    paid_at: string | null;
    created_at: string;
  };
  items: PublicPortalItem[];
  totals: PublicPortalTotals;
  paid: number;
  remaining: number;
  organization: PublicPortalOrganization;
}

export interface ClientDocumentSummary {
  token: string;
  number: string | null;
  status: string;
  is_deposit?: boolean;
  created_at: string;
  project_name: string | null;
}

export interface ClientDocumentsPayload {
  organization_name: string;
  devis: ClientDocumentSummary[];
  factures: ClientDocumentSummary[];
}

export interface FactureItem {
  id: string;
  facture_id: string;
  description: string;
  quantity: number;
  unit: string | null;
  unit_price: number;
  sort_order: number;
}

export interface FacturePayment {
  id: string;
  facture_id: string;
  amount: number;
  paid_at: string;
  created_by: string | null;
  created_at: string;
}

export interface OpusFile {
  id: string;
  organization_id: string;
  project_id: string | null;
  folder_id: string | null;
  name: string;
  storage_path: string;
  size_bytes: number;
  mime_type: string | null;
  uploaded_by: string | null;
  created_at: string;
}

export interface Folder {
  id: string;
  organization_id: string;
  project_id: string;
  parent_id: string | null;
  name: string;
  created_by: string | null;
  created_at: string;
}

export interface SurveyPoint {
  id: string;
  organization_id: string;
  project_id: string;
  code: string;
  description: string | null;
  class: string | null;
  latitude: number;
  longitude: number;
  elevation: number | null;
  lv95_e: number | null;
  lv95_n: number | null;
  source: string;
  sort_order: number;
  created_by: string | null;
  created_at: string;
}

export interface MetreItem {
  id: string;
  organization_id: string;
  project_id: string;
  reference: string | null;
  description: string;
  quantity: number;
  unit: string | null;
  sort_order: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}
