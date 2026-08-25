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
  price_chf_monthly: number | null;
  price_chf_yearly: number | null;
  is_contact_only: boolean;
  max_devis_factures_per_month: number | null;
  has_customization: boolean;
  has_email_sending: boolean;
  has_planning: boolean;
  has_profitability: boolean;
  has_payroll: boolean;
  has_treasury: boolean;
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
  payroll_km_rate_chf: number;
  payroll_payday: number;
  devis_email_message: string | null;
  facture_email_message: string | null;
  extra_work_email_message: string | null;
  facture_reminder_message_upcoming: string | null;
  facture_reminder_message_overdue: string | null;
  email_signature: string | null;
  plan_id: string;
  // Only set while plan_id = 'decouverte' (the 14-day trial) — a scheduled
  // job drops the org back to 'free' and clears this once it passes.
  trial_ends_at: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  promo_code_used: string | null;
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

export interface OrganizationRole {
  id: string;
  organization_id: string;
  name: string;
  color: string;
  can_view_finances: boolean;
  can_view_metre: boolean;
  can_view_planning: boolean;
  can_view_documents: boolean;
  can_view_subcontractors: boolean;
  can_create_projects: boolean;
  can_manage_payroll: boolean;
  created_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: OrgRole;
  role_id: string | null;
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
  enabled_modules: string[];
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
  project_id: string | null;
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
  client_id: string | null;
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

export type ExtraWorkStatus = 'draft' | 'sent' | 'accepted' | 'refused';

// Travaux supplémentaires : les extras demandés en cours de chantier
// ("tant que vous y êtes...") — mêmes primitives que Devis/DevisItem
// (lignes, numérotation TS-YYYY-NNNN, portail public + signature), pour
// qu'ils ne se perdent plus jamais entre le devis initial et la facture.
export interface ExtraWork {
  id: string;
  organization_id: string;
  project_id: string;
  client_id: string | null;
  devis_id: string | null;
  number: string | null;
  title: string;
  client_name: string;
  client_email: string | null;
  notes: string | null;
  status: ExtraWorkStatus;
  vat_rate: number;
  public_token: string;
  client_signed_at: string | null;
  client_signer_name: string | null;
  client_signature_data: string | null;
  facture_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExtraWorkItem {
  id: string;
  extra_work_id: string;
  description: string;
  quantity: number;
  unit: string | null;
  unit_price: number;
  sort_order: number;
}

export interface PublicExtraWorkPayload {
  extra_work: {
    id: string;
    number: string | null;
    title: string;
    status: ExtraWorkStatus;
    client_name: string;
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

export type FactureStatus = 'draft' | 'sent' | 'partial' | 'paid' | 'cancelled';

export interface Facture {
  id: string;
  organization_id: string;
  project_id: string | null;
  devis_id: string | null;
  client_id: string | null;
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
    has_pdf: boolean;
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
    has_pdf: boolean;
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
  has_pdf: boolean;
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

export type SubcontractorAssignmentStatus = 'planifie' | 'en_cours' | 'termine' | 'annule';

export interface Subcontractor {
  id: string;
  organization_id: string;
  company_name: string;
  trade: string | null;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  insurance_doc_path: string | null;
  insurance_expires_on: string | null;
  created_by: string | null;
  created_at: string;
}

export interface ProjectSubcontractor {
  id: string;
  organization_id: string;
  project_id: string;
  subcontractor_id: string;
  task: string | null;
  status: SubcontractorAssignmentStatus;
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  subcontractors?: Subcontractor;
}

export interface SubcontractorInvoice {
  id: string;
  organization_id: string;
  project_subcontractor_id: string;
  file_path: string;
  file_name: string;
  amount: number | null;
  invoice_date: string | null;
  due_date: string | null;
  paid: boolean;
  paid_at: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
}

export interface PayrollWorkType {
  id: string;
  organization_id: string;
  label: string;
  hourly_rate_chf: number | null;
  sort_order: number;
  active: boolean;
  created_at: string;
}

export type PayrollExpenseUnit = 'km' | 'forfait';

export interface PayrollExpenseType {
  id: string;
  organization_id: string;
  label: string;
  unit: PayrollExpenseUnit;
  rate_chf: number | null;
  sort_order: number;
  active: boolean;
  created_at: string;
}

export interface PayrollDeductionType {
  id: string;
  organization_id: string;
  label: string;
  default_rate_percent: number | null;
  sort_order: number;
  active: boolean;
  created_at: string;
}

export interface PayrollProfileDeduction {
  id: string;
  organization_id: string;
  user_id: string;
  deduction_type_id: string;
  rate_percent: number | null;
  fixed_amount_chf: number | null;
  enabled: boolean;
  updated_by: string | null;
  updated_at: string;
}

export interface PayrollTimeEntry {
  id: string;
  organization_id: string;
  project_id: string | null;
  user_id: string;
  entry_date: string;
  hours: number;
  work_type_id: string | null;
  start_time: string | null;
  end_time: string | null;
  note: string | null;
  invoiced_facture_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PayrollExpense {
  id: string;
  organization_id: string;
  project_id: string | null;
  user_id: string;
  expense_date: string;
  expense_type_id: string | null;
  quantity: number | null;
  amount_chf: number;
  note: string | null;
  created_by: string | null;
  created_at: string;
}

export type SalaryType = 'hourly' | 'monthly';

export interface PayrollProfile {
  id: string;
  organization_id: string;
  user_id: string;
  salary_type: SalaryType;
  hourly_rate_chf: number | null;
  monthly_salary_chf: number | null;
  street: string | null;
  postal_code: string | null;
  locality: string | null;
  notes: string | null;
  updated_by: string | null;
  updated_at: string;
}

// Trésorerie prévisionnelle — un solde de référence saisi à la main (pas de
// connexion bancaire réelle) et des dépenses récurrentes (abonnements,
// assurances...) qui, combinés aux factures/salaires/factures sous-traitants
// déjà en base, donnent une projection de trésorerie sur 90 jours.
export interface CashSnapshot {
  id: string;
  organization_id: string;
  balance_chf: number;
  recorded_at: string;
  created_by: string | null;
}

export type RecurringExpenseFrequency = 'monthly' | 'yearly';

export interface RecurringExpense {
  id: string;
  organization_id: string;
  label: string;
  category: string | null;
  amount_chf: number;
  frequency: RecurringExpenseFrequency;
  next_due_date: string;
  reminder_days_before: number;
  active: boolean;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type TreasuryItemKind = 'facture' | 'salaire' | 'sous-traitant' | 'recurrente';

export interface TreasuryForecastItem {
  kind: TreasuryItemKind;
  label: string;
  amount: number; // positif = entrée, négatif = sortie
  date: string | null; // null = sans échéance connue
  overdue: boolean;
  sourceId: string;
}

export interface TreasuryForecast {
  startingBalance: number;
  startingBalanceRecordedAt: string | null;
  timeline: { date: string; balance: number }[];
  items: TreasuryForecastItem[];
}

// Dépense ponctuelle hors chantier (fournitures, outillage, frais divers) —
// distincte de RecurringExpense (abonnements qui reviennent) et
// ProjectExpense (rattachée à un chantier pour la rentabilité).
export interface Expense {
  id: string;
  organization_id: string;
  label: string;
  category: string | null;
  amount_chf: number;
  expense_date: string;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// Une entrée du journal de notes d'un client — remplace l'ancien champ
// clients.notes unique (qui perdait l'historique à chaque écrasement).
export interface ClientNote {
  id: string;
  organization_id: string;
  client_id: string;
  body: string;
  created_by: string | null;
  created_at: string;
}

// Centre de notifications — une ligne par (destinataire, événement).
// Générées côté DB (triggers + generate_scheduled_notifications() via
// pg_cron, voir la migration notifications.sql) : jamais insérées
// directement par le client, seulement lues/marquées lues/supprimées.
export type NotificationType =
  | 'devis_stale_draft'
  | 'devis_expiring_soon'
  | 'devis_accepted'
  | 'facture_overdue'
  | 'recurring_expense_due'
  | 'extra_work_accepted'
  | 'feed_message';

export interface Notification {
  id: string;
  organization_id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  link: string | null;
  source_table: string;
  source_id: string;
  read_at: string | null;
  created_at: string;
}

export interface NotificationPreference {
  id: string;
  organization_id: string;
  user_id: string;
  type: NotificationType;
  in_app_enabled: boolean;
  email_enabled: boolean;
  push_enabled: boolean;
}

export type ModuleVisibility = 'standard' | 'private' | 'experimental';
export type ModuleStatus = 'active' | 'beta' | 'disabled';

export interface PlatformModule {
  id: string;
  key: string;
  name: string;
  description: string | null;
  category: string | null;
  visibility: ModuleVisibility;
  status: ModuleStatus;
  created_at: string;
  updated_at: string;
}

export interface OrganizationModule {
  id: string;
  organization_id: string;
  module_id: string;
  enabled: boolean;
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface AdminAuditLog {
  id: string;
  admin_email: string | null;
  action: string;
  organization_name: string | null;
  module_name: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface AdminOrganizationSummary {
  id: string;
  name: string;
  plan_id: string;
  plan_name: string;
  subscription_status: string | null;
  trial_ends_at: string | null;
  plan_selected: boolean;
  created_at: string;
  member_count: number;
  owner_email: string | null;
  private_modules_count: number;
  is_internal: boolean;
  internal_label: string | null;
  total_count: number;
}

export interface AdminOrgBillingStatus {
  has_payment_method: boolean;
  payment_method_type: string | null;
  card_brand: string | null;
  card_last4: string | null;
  card_exp_month: number | null;
  card_exp_year: number | null;
  subscription_status: string | null;
  cancel_at_period_end: boolean;
  next_invoice_amount_chf: number | null;
  next_invoice_date: string | null;
  will_be_charged: boolean;
}

export interface AdminRevenuePlanBreakdown {
  plan_id: string;
  plan_name: string;
  active_count: number;
  trialing_count: number;
  mrr_chf: number;
}

export interface AdminRevenuePromoCode {
  code: string;
  org_count: number;
  active_count: number;
  trialing_count: number;
}

export interface AdminComplimentaryAccount {
  id: string;
  name: string;
  code: string;
}

export interface AdminRevenueTimeseriesPoint {
  date: string;
  signups: number;
  revenue_chf: number;
  paying_cumulative: number;
}

export interface AdminRevenueOverview {
  mrr_active_chf: number;
  mrr_trialing_chf: number;
  arr_chf: number;
  new_mrr_this_month_chf: number;
  churned_mrr_this_month_chf: number;
  churned_count_this_month: number;
  net_mrr_this_month_chf: number;
  ca_total_chf: number;
  ca_this_month_chf: number;
  active_count: number;
  trialing_count: number;
  complimentary_count: number;
  complimentary_accounts: AdminComplimentaryAccount[];
  by_plan: AdminRevenuePlanBreakdown[];
  promo_codes: AdminRevenuePromoCode[];
  timeseries: AdminRevenueTimeseriesPoint[];
}

export interface AdminOrganizationMember {
  user_id: string;
  full_name: string | null;
  email: string;
  role: OrgRole;
  last_sign_in_at: string | null;
  created_at: string;
}

export interface AdminOrganizationPrivateModule {
  module_id: string;
  key: string;
  name: string;
  description: string | null;
  visibility: ModuleVisibility;
  status: ModuleStatus;
  enabled: boolean;
}

export interface AdminOrganizationDetail {
  organization: Organization & { plan_name: string };
  members: AdminOrganizationMember[];
  standard_modules: string[];
  private_modules: AdminOrganizationPrivateModule[];
}

export interface AdminModuleSummary {
  id: string;
  key: string;
  name: string;
  description: string | null;
  category: string | null;
  visibility: ModuleVisibility;
  status: ModuleStatus;
  organizations_count: number;
  created_at: string;
}

export interface AdminUserSummary {
  user_id: string;
  email: string;
  full_name: string | null;
  organization_id: string;
  organization_name: string;
  role: OrgRole;
  created_at: string;
  last_sign_in_at: string | null;
  total_count: number;
}

export interface AdminDashboardStats {
  organizations_count: number;
  users_count: number;
  active_trials_count: number;
  paid_subscriptions_count: number;
  signups_today_count: number;
  organizations_created_today_count: number;
}

export interface PushToken {
  id: string;
  user_id: string;
  token: string;
  platform: 'ios' | 'android';
  created_at: string;
  last_seen_at: string;
}

// Provider-agnostic accounting-software integration model (Bexio is the
// first provider) — see 20260826070000_integrations_phase0.sql,
// 20260826080000_integrations_bexio_oauth.sql. OAuth connect/disconnect is
// implemented (bexio-oauth-start/-callback/-disconnect edge functions);
// contacts/articles/invoice sync is not built yet.
export type IntegrationProvider = 'bexio';
export type IntegrationStatus = 'disconnected' | 'connecting' | 'connected' | 'error' | 'revoked';

export interface Integration {
  id: string;
  organization_id: string;
  provider: IntegrationProvider;
  status: IntegrationStatus;
  external_company_id: string | null;
  external_company_name: string | null;
  last_sync_at: string | null;
  last_successful_sync_at: string | null;
  auto_sync_enabled: boolean;
  last_error: string | null;
  connected_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface IntegrationSettings {
  id: string;
  integration_id: string;
  organization_id: string;
  auto_sync_enabled: boolean;
  sync_frequency_minutes: number | null;
  entity_settings: Record<string, unknown>;
  field_mappings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface IntegrationSyncLog {
  id: string;
  integration_id: string;
  organization_id: string;
  entity_type: string | null;
  local_id: string | null;
  external_id: string | null;
  direction: 'push' | 'pull' | null;
  action: 'create' | 'update' | 'delete' | 'skip' | 'error' | null;
  status: 'success' | 'error' | 'retrying';
  error_message: string | null;
  request_id: string | null;
  payload_summary: Record<string, unknown>;
  created_at: string;
}
