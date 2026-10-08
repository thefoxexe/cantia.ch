import { supabase } from '../supabase';
import type { ExportEntry } from './exports';
import type { LegalForm, VatMethod } from './workspace';

// The fiduciary workspace beyond reading the books
// (supabase/migrations/20261008140000_fiduciary_pro.sql): clients outside
// Cantia, work checklists, time and fees, approvals, entry proposals,
// indicators, brand and directory. The database checks the firm and the
// client's access on every call.

export type Software = 'abacus' | 'banana' | 'winbiz' | 'bexio' | 'cresus' | 'sage' | 'klara' | 'excel' | 'other' | 'none';
export const SOFTWARES: Software[] = ['abacus', 'banana', 'winbiz', 'bexio', 'cresus', 'sage', 'klara', 'excel', 'other', 'none'];
export const SOFTWARE_LABEL: Record<Software | 'cantia', string> = {
  cantia: 'Cantia',
  abacus: 'Abacus',
  banana: 'Banana',
  winbiz: 'Winbiz',
  bexio: 'bexio',
  cresus: 'Crésus',
  sage: 'Sage',
  klara: 'KLARA',
  excel: 'Excel',
  other: '—',
  none: '—',
};

// A client is a Cantia company (org) or an external one (ext).
export interface ClientRef {
  org?: string | null;
  ext?: string | null;
}
const ids = (ref: ClientRef) => ({ p_org: ref.org ?? null, p_ext: ref.ext ?? null });
export const refKey = (ref: { organization_id?: string | null; external_client_id?: string | null }) =>
  ref.organization_id ? `org:${ref.organization_id}` : `ext:${ref.external_client_id}`;
export const refFromKey = (key: string): ClientRef => (key.startsWith('org:') ? { org: key.slice(4) } : { ext: key.slice(4) });
export const clientHref = (ref: { organization_id?: string | null; external_client_id?: string | null }, tab?: string) =>
  `/mandant?${ref.organization_id ? `id=${ref.organization_id}` : `ext=${ref.external_client_id}`}${tab ? `&tab=${tab}` : ''}`;

export interface ExternalClient {
  id: string;
  name: string;
  legal_form: LegalForm;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  postal_code: string | null;
  city: string | null;
  ide_number: string | null;
  software: Software;
  vat_method: VatMethod;
  has_payroll: boolean;
  fiscal_year_end: string;
  tax_return_due: string;
  assigned_to: string | null;
  assigned_name?: string | null;
  hourly_rate: number | null;
  locale: 'fr' | 'de' | 'it';
  portal_token: string;
  status: 'ACTIVE' | 'ARCHIVED';
  created_at: string;
  requests_open?: number;
  requests_answered?: number;
  work_open?: number;
  approvals_pending?: number;
  unbilled_minutes?: number;
}
export type ExternalClientInput = Omit<ExternalClient, 'id' | 'portal_token' | 'status' | 'created_at' | 'assigned_name' | 'requests_open' | 'requests_answered' | 'work_open' | 'approvals_pending' | 'unbilled_minutes'>;

export type WorkKind = 'closing' | 'vat' | 'payroll' | 'tax' | 'onboarding' | 'other';
export const WORK_KINDS: WorkKind[] = ['closing', 'vat', 'payroll', 'tax', 'onboarding', 'other'];
export type WorkStatus = 'todo' | 'in_progress' | 'waiting_client' | 'review' | 'done' | 'cancelled';
export const WORK_STATUSES: WorkStatus[] = ['todo', 'in_progress', 'waiting_client', 'review', 'done'];

export interface ProcessTemplate {
  id: string;
  name: string;
  kind: WorkKind;
  steps: string[];
}

export interface WorkStep {
  id: string;
  title: string;
  done: boolean;
  done_at: string | null;
  done_by_name: string | null;
}

export interface WorkItem {
  id: string;
  organization_id: string | null;
  external_client_id: string | null;
  client_name: string;
  title: string;
  kind: WorkKind;
  period_label: string | null;
  due_date: string | null;
  assigned_to: string | null;
  assigned_name: string | null;
  status: WorkStatus;
  created_at: string;
  completed_at: string | null;
  minutes: number;
  steps: WorkStep[];
}

export interface TimeEntry {
  id: string;
  user_id: string;
  user_name: string | null;
  mine: boolean;
  organization_id: string | null;
  external_client_id: string | null;
  client_name: string;
  work_item_id: string | null;
  work_title: string | null;
  entry_date: string;
  minutes: number;
  description: string | null;
  billable: boolean;
  rate_chf: number | null;
  status: 'open' | 'billed';
  billed_at: string | null;
}

export type ApprovalKind = 'annual_accounts' | 'tax_return' | 'vat_return' | 'payroll' | 'engagement' | 'other';
export const APPROVAL_KINDS: ApprovalKind[] = ['annual_accounts', 'tax_return', 'vat_return', 'payroll', 'engagement', 'other'];

export interface Approval {
  id: string;
  organization_id: string | null;
  external_client_id: string | null;
  client_name: string;
  kind: ApprovalKind;
  title: string;
  message: string | null;
  file_path: string | null;
  file_name: string | null;
  file_sha256: string | null;
  due_date: string | null;
  status: 'pending' | 'approved' | 'rejected';
  signer_name: string | null;
  signature_data: string | null;
  decided_at: string | null;
  decided_ip: string | null;
  rejection_reason: string | null;
  created_at: string;
  created_by_name: string | null;
  last_reminded_at: string | null;
}

export interface ProposalLine {
  account_code: string;
  debit: number;
  credit: number;
  label?: string | null;
  account_label?: string | null;
}

export interface EntryProposal {
  id: string;
  organization_id: string;
  entry_date: string;
  label: string;
  reason: string | null;
  lines: ProposalLine[];
  status: 'pending' | 'accepted' | 'rejected';
  posted: boolean;
  entry_id: string | null;
  created_at: string;
  created_by_name: string | null;
  decided_at: string | null;
  rejection_reason: string | null;
}

export interface PL {
  revenue?: number | null;
  material?: number | null;
  personnel?: number | null;
  opex?: number | null;
  depreciation?: number | null;
  financial?: number | null;
  other?: number | null;
  taxes?: number | null;
  lines?: number;
}

export interface Kpis {
  period: { from: string; to: string; prev_from: string; prev_to: string };
  current: PL;
  previous: PL;
  balance: { liquid: number; receivables: number; inventory: number; current_assets: number; total_assets: number; short_term_debt: number; long_term_debt: number };
  monthly: { month: string; revenue: number; result: number }[];
  last_entry_date: string | null;
}

export interface PortfolioRow {
  kind: 'cantia' | 'external';
  organization_id: string | null;
  external_client_id: string | null;
  name: string;
  software: Software | 'cantia';
  assigned_to: string | null;
  assigned_name: string | null;
  kpis: Kpis | null;
  requests_open: number;
  requests_answered: number;
  work_open: number;
  approvals_pending: number;
  unbilled_minutes: number;
}

export interface DirectoryFirm {
  id: string;
  name: string;
  city: string | null;
  postal_code: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  verified: boolean;
  logo_data: string | null;
  brand_color: string | null;
  description: string | null;
  services: string[];
  languages: string[];
  cantons: string[];
  accepts_new_clients: boolean;
}

// Figures derived from the ledger (null when a denominator is zero).
export function derive(pl: PL) {
  const n = (v: number | null | undefined) => Number(v ?? 0);
  const revenue = n(pl.revenue);
  const gross = revenue - n(pl.material);
  const ebitda = gross - n(pl.personnel) - n(pl.opex);
  const ebit = ebitda - n(pl.depreciation);
  const result = ebit - n(pl.financial) - n(pl.other) - n(pl.taxes);
  const pct = (v: number) => (revenue ? Math.round((v / revenue) * 1000) / 10 : null);
  return { revenue, gross, ebitda, ebit, result, grossPct: pct(gross), ebitdaPct: pct(ebitda), ebitPct: pct(ebit), resultPct: pct(result) };
}

export function ratios(k: Kpis) {
  const b = k.balance;
  const div = (a: number, d: number) => (d > 0.004 ? Math.round((a / d) * 100) / 100 : null);
  const equity = Number(b.total_assets) - Number(b.short_term_debt) - Number(b.long_term_debt);
  const days = Math.max(1, Math.round((new Date(k.period.to).getTime() - new Date(k.period.from).getTime()) / 86400000) + 1);
  const revenue = Number(k.current.revenue ?? 0);
  return {
    quick: div(Number(b.liquid) + Number(b.receivables), Number(b.short_term_debt)),
    current: div(Number(b.current_assets), Number(b.short_term_debt)),
    equity,
    equityPct: Number(b.total_assets) > 0 ? Math.round((equity / Number(b.total_assets)) * 1000) / 10 : null,
    dso: revenue > 0 ? Math.round((Number(b.receivables) / revenue) * days) : null,
  };
}

async function call<T>(fn: string, args?: Record<string, unknown>): Promise<{ data: T | null; error: string | null }> {
  const { data, error } = await supabase.rpc(fn, args ?? {});
  return { data: (data as T) ?? null, error: error?.message ?? null };
}

export const pro = {
  // External clients
  externalClients: (archived = false) => call<ExternalClient[]>('acc_external_clients', { p_include_archived: archived }),
  externalClient: (id: string) => call<ExternalClient | null>('acc_external_client', { p_ext: id }),
  saveExternalClient: (id: string | null, data: Partial<ExternalClientInput>) => call<string>('acc_save_external_client', { p_id: id, p_data: data }),
  externalAction: (id: string, action: 'archive' | 'restore' | 'new_link') => call<{ portal_token: string | null }>('acc_external_client_action', { p_id: id, p_action: action }),
  extRequests: (id: string) => call<import('./workspace').FiduciaryRequest[]>('acc_ext_requests', { p_ext: id }),
  extCreateRequest: (id: string, title: string, details: string, due: string | null, notify = true) =>
    call<string>('acc_ext_create_request', { p_ext: id, p_title: title, p_details: details || null, p_due: due || null, p_notify: notify }),
  extUpdateRequest: (id: string, action: 'done' | 'cancelled' | 'open' | 'remind') => call<null>('acc_ext_update_request', { p_id: id, p_action: action }),
  extNotes: (id: string) => call<import('./workspace').ClientNote[]>('acc_ext_notes', { p_ext: id }),
  extAddNote: (id: string, body: string) => call<null>('acc_ext_add_note', { p_ext: id, p_body: body }),
  extArchiveNote: (id: string) => call<null>('acc_ext_archive_note', { p_id: id }),
  extSetDeadline: (id: string, kind: string, period: string, status: string) => call<null>('acc_ext_set_deadline', { p_ext: id, p_kind: kind, p_period: period, p_status: status }),

  // Work
  templates: () => call<ProcessTemplate[]>('acc_process_templates'),
  saveTemplate: (id: string | null, name: string, kind: WorkKind, steps: string[]) => call<string>('acc_save_process_template', { p_id: id, p_name: name, p_kind: kind, p_steps: steps }),
  archiveTemplate: (id: string) => call<null>('acc_archive_process_template', { p_id: id }),
  workItems: (ref: ClientRef = {}, includeDone = true) => call<WorkItem[]>('acc_work_items', { ...ids(ref), p_include_done: includeDone }),
  createWorkItem: (ref: ClientRef, input: { title: string; kind: WorkKind; period: string | null; due: string | null; assigned: string | null; steps: string[]; template: string | null }) =>
    call<string>('acc_create_work_item', {
      ...ids(ref),
      p_title: input.title,
      p_kind: input.kind,
      p_period: input.period,
      p_due: input.due,
      p_assigned: input.assigned,
      p_steps: input.steps,
      p_template: input.template,
    }),
  updateWorkItem: (id: string, patch: Partial<{ title: string; period_label: string | null; due_date: string | null; assigned_to: string | null; status: WorkStatus }>) =>
    call<null>('acc_update_work_item', { p_id: id, p_patch: patch }),
  toggleStep: (id: string, done: boolean) => call<WorkStatus>('acc_toggle_work_step', { p_step: id, p_done: done }),
  addStep: (item: string, title: string) => call<string>('acc_add_work_step', { p_item: item, p_title: title }),
  archiveStep: (id: string) => call<null>('acc_archive_work_step', { p_step: id }),

  // Time
  timeEntries: (params: { from?: string | null; to?: string | null } & ClientRef = {}) =>
    call<TimeEntry[]>('acc_time_entries', { p_from: params.from ?? null, p_to: params.to ?? null, ...ids(params) }),
  addTime: (ref: ClientRef, input: { date: string; minutes: number; description: string; billable: boolean; workItem: string | null }) =>
    call<string>('acc_add_time', { ...ids(ref), p_date: input.date, p_minutes: input.minutes, p_description: input.description || null, p_billable: input.billable, p_work_item: input.workItem }),
  updateTime: (id: string, patch: Partial<{ entry_date: string; minutes: number; description: string | null; billable: boolean; rate_chf: number | null }>) =>
    call<null>('acc_update_time', { p_id: id, p_patch: patch }),
  timeAction: (idList: string[], action: 'void' | 'billed' | 'reopen') => call<number>('acc_time_action', { p_ids: idList, p_action: action }),
  setClientRate: (org: string, rate: number | null) => call<null>('acc_set_client_rate', { p_org: org, p_rate: rate }),

  // Approvals
  approvals: (ref: ClientRef = {}) => call<Approval[]>('acc_approvals', ids(ref)),
  createApproval: (ref: ClientRef, input: { kind: ApprovalKind; title: string; message: string; filePath: string | null; fileName: string | null; sha256: string | null; due: string | null }) =>
    call<string>('acc_create_approval', {
      ...ids(ref),
      p_kind: input.kind,
      p_title: input.title,
      p_message: input.message || null,
      p_file_path: input.filePath,
      p_file_name: input.fileName,
      p_sha256: input.sha256,
      p_due: input.due,
    }),
  approvalAction: (id: string, action: 'remind' | 'cancel') => call<null>('acc_approval_action', { p_id: id, p_action: action }),

  // Entry proposals
  proposals: (org: string) => call<EntryProposal[]>('acc_entry_proposals', { p_org: org }),
  createProposal: (org: string, date: string, label: string, reason: string, lines: ProposalLine[]) =>
    call<string>('acc_create_entry_proposal', { p_org: org, p_date: date, p_label: label, p_reason: reason || null, p_lines: lines }),
  cancelProposal: (id: string) => call<null>('acc_cancel_entry_proposal', { p_id: id }),

  // Indicators
  kpis: (org: string, asOf?: string) => call<Kpis>('acc_client_kpis', { p_org: org, p_as_of: asOf ?? null }),
  portfolio: () => call<PortfolioRow[]>('acc_portfolio'),

  // Brand and directory
  updateFirmProfile: (p: {
    logo_data: string | null;
    brand_color: string | null;
    default_hourly_rate: number | null;
    directory_visible: boolean;
    description: string | null;
    services: string[];
    languages: string[];
    cantons: string[];
    public_email: string | null;
    accepts_new_clients: boolean;
  }) =>
    call<null>('acc_update_firm_profile', {
      p_logo_data: p.logo_data,
      p_brand_color: p.brand_color,
      p_default_hourly_rate: p.default_hourly_rate,
      p_directory_visible: p.directory_visible,
      p_description: p.description,
      p_services: p.services,
      p_languages: p.languages,
      p_cantons: p.cantons,
      p_public_email: p.public_email,
      p_accepts_new_clients: p.accepts_new_clients,
    }),
  directory: (search?: string | null, canton?: string | null) => call<DirectoryFirm[]>('fiduciary_directory', { p_search: search || null, p_canton: canton || null }),
};

// Posted entries of a period, every page (exports to Abacus / Banana / Winbiz).
export async function loadPostedEntries(org: string, from: string, to: string): Promise<ExportEntry[]> {
  const out: ExportEntry[] = [];
  for (let page = 0; page < 50; page++) {
    const { data, error } = await supabase
      .from('accounting_entries')
      .select('entry_number, entry_date, label, external_reference, accounting_entry_lines(debit, credit, label, vat_code, sort_order, accounting_accounts(code))')
      .eq('organization_id', org)
      .eq('status', 'comptabilisee')
      .gte('entry_date', from)
      .lte('entry_date', to)
      .order('entry_date')
      .order('entry_number')
      .range(page * 500, page * 500 + 499);
    if (error) throw new Error(error.message);
    for (const e of (data ?? []) as any[]) {
      out.push({
        entry_number: e.entry_number,
        entry_date: e.entry_date,
        label: e.label,
        external_reference: e.external_reference,
        lines: ((e.accounting_entry_lines ?? []) as any[])
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((l) => ({ account_code: l.accounting_accounts?.code ?? '', debit: Number(l.debit), credit: Number(l.credit), label: l.label, vat_code: l.vat_code })),
      });
    }
    if ((data ?? []).length < 500) break;
  }
  return out;
}

export async function clientAccounts(org: string): Promise<{ code: string; label: string }[]> {
  const { data } = await supabase.from('accounting_accounts').select('code, label').eq('organization_id', org).eq('is_active', true).order('code').limit(2000);
  return (data ?? []) as { code: string; label: string }[];
}

// SHA-256 of a file (proof attached to an approval).
export async function sha256Hex(data: ArrayBuffer): Promise<string | null> {
  try {
    const digest = await crypto.subtle.digest('SHA-256', data);
    return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    return null;
  }
}

// An approval document goes to fiduciary/{firm}/approvals/{uuid}/{name}.
export async function uploadApprovalFile(firmId: string, file: { name: string; data: ArrayBuffer; type: string }): Promise<{ path: string | null; error: string | null }> {
  const safe = file.name.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9._-]+/g, '-').slice(-120) || 'document.pdf';
  const path = `fiduciary/${firmId}/approvals/${crypto.randomUUID()}/${safe}`;
  const { error } = await supabase.storage.from('opus-storage').upload(path, file.data, { contentType: file.type || 'application/pdf', upsert: false });
  return { path: error ? null : path, error: error?.message ?? null };
}

export function portalUrl(token: string): string {
  const local = typeof window !== 'undefined' && window.location && !/(^|\.)cantia\.ch$/.test(window.location.hostname);
  return `${local ? window.location.origin : 'https://accounting.cantia.ch'}/depot?t=${token}`;
}

export function formatMinutes(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}:${String(m).padStart(2, '0')}`;
}

// Default checklists, offered until the firm writes its own.
export const DEFAULT_TEMPLATES: Record<'fr' | 'de' | 'it', { name: string; kind: WorkKind; steps: string[] }[]> = {
  fr: [
    { name: 'Bouclement annuel', kind: 'closing', steps: ['Relevés bancaires et postaux reçus', 'Rapprochement bancaire', 'Débiteurs et ducroire', 'Créanciers et charges à payer', 'Stock et travaux en cours', 'Actifs transitoires et passifs transitoires', 'Amortissements', 'Impôts et provisions', 'Bilan et compte de résultat', 'Annexe et rapport', 'Validation par le client', 'Assemblée générale / approbation'] },
    { name: 'Décompte TVA', kind: 'vat', steps: ['Écritures du trimestre complètes', 'Contrôle des codes TVA', 'Concordance chiffre d’affaires', 'Impôt préalable vérifié', 'Décompte établi', 'Transmis à l’AFC (ePortal)', 'Paiement planifié'] },
    { name: 'Salaires de fin d’année', kind: 'payroll', steps: ['Salaires de décembre contrôlés', 'Certificats de salaire', 'Déclaration AVS', 'Déclaration LAA / LAAC / IJM', 'Attestation LPP', 'Impôt à la source (décompte annuel)'] },
    { name: 'Déclaration d’impôt', kind: 'tax', steps: ['Documents reçus', 'Bouclement validé', 'Déclaration remplie', 'Contrôle', 'Signature du client', 'Envoi à l’administration'] },
    { name: 'Nouveau mandat', kind: 'onboarding', steps: ['Lettre de mission signée', 'Documents d’identification (LBA)', 'Accès aux banques', 'Reprise des soldes d’ouverture', 'Profil TVA et salaires'] },
  ],
  de: [
    { name: 'Jahresabschluss', kind: 'closing', steps: ['Bank- und Postauszüge erhalten', 'Bankabstimmung', 'Debitoren und Delkredere', 'Kreditoren und Abgrenzungen', 'Vorräte und angefangene Arbeiten', 'Aktive und passive Rechnungsabgrenzungen', 'Abschreibungen', 'Steuern und Rückstellungen', 'Bilanz und Erfolgsrechnung', 'Anhang und Bericht', 'Freigabe durch den Kunden', 'Generalversammlung / Genehmigung'] },
    { name: 'MWST-Abrechnung', kind: 'vat', steps: ['Buchungen des Quartals vollständig', 'MWST-Codes geprüft', 'Umsatzabstimmung', 'Vorsteuer geprüft', 'Abrechnung erstellt', 'An ESTV übermittelt (ePortal)', 'Zahlung geplant'] },
    { name: 'Lohn Jahresende', kind: 'payroll', steps: ['Dezemberlöhne geprüft', 'Lohnausweise', 'AHV-Lohnmeldung', 'UVG / UVGZ / KTG-Meldung', 'BVG-Bestätigung', 'Quellensteuer (Jahresabrechnung)'] },
    { name: 'Steuererklärung', kind: 'tax', steps: ['Unterlagen erhalten', 'Abschluss freigegeben', 'Erklärung ausgefüllt', 'Kontrolle', 'Unterschrift des Kunden', 'Versand an die Verwaltung'] },
    { name: 'Neues Mandat', kind: 'onboarding', steps: ['Mandatsvertrag unterzeichnet', 'Identifikation (GwG)', 'Bankzugänge', 'Eröffnungssaldi übernommen', 'MWST- und Lohnprofil'] },
  ],
  it: [
    { name: 'Chiusura annuale', kind: 'closing', steps: ['Estratti bancari e postali ricevuti', 'Riconciliazione bancaria', 'Debitori e delcredere', 'Creditori e ratei passivi', 'Scorte e lavori in corso', 'Ratei e risconti', 'Ammortamenti', 'Imposte e accantonamenti', 'Bilancio e conto economico', 'Allegato e rapporto', 'Convalida del cliente', 'Assemblea generale / approvazione'] },
    { name: 'Rendiconto IVA', kind: 'vat', steps: ['Registrazioni del trimestre complete', 'Codici IVA controllati', 'Concordanza della cifra d’affari', 'Imposta precedente verificata', 'Rendiconto allestito', 'Trasmesso all’AFC (ePortal)', 'Pagamento pianificato'] },
    { name: 'Salari di fine anno', kind: 'payroll', steps: ['Salari di dicembre controllati', 'Certificati di salario', 'Dichiarazione AVS', 'Dichiarazione LAINF / LAINFC / IGM', 'Attestazione LPP', 'Imposta alla fonte (conteggio annuale)'] },
    { name: 'Dichiarazione d’imposta', kind: 'tax', steps: ['Documenti ricevuti', 'Chiusura convalidata', 'Dichiarazione compilata', 'Controllo', 'Firma del cliente', 'Invio all’amministrazione'] },
    { name: 'Nuovo mandato', kind: 'onboarding', steps: ['Lettera d’incarico firmata', 'Identificazione (LRD)', 'Accessi bancari', 'Saldi di apertura ripresi', 'Profilo IVA e salari'] },
  ],
};
