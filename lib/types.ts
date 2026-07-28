export type OrgRole = 'owner' | 'admin' | 'member';
export type DevisStatus = 'draft' | 'sent' | 'accepted' | 'refused';

export interface Plan {
  id: string;
  name: string;
  storage_quota_mb: number;
  max_members: number;
  price_chf_monthly: number;
  has_rtk: boolean;
  stripe_price_id: string | null;
}

export interface Organization {
  id: string;
  name: string;
  trade: string | null;
  logo_url: string | null;
  signature_url: string | null;
  address: string | null;
  ide_number: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  default_vat_rate: number;
  devis_validity_days: number;
  devis_terms: string | null;
  devis_template: string;
  plan_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: OrgRole;
  full_name: string | null;
  created_at: string;
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
