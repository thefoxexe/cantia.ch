import { supabase } from '../supabase';
import { getFiduciaries } from './fiduciary';
import { uploadToOrgBucket } from './storage';

// « Envoyer au fiduciaire »: a document of the company goes to a fiduciary
// that has ACTIVE access on Cantia (table fiduciary_shared_documents,
// migration 20261003170000). The file is copied to the company's own
// folder, so the fiduciary can download it and the original (an invoice
// PDF regenerated later, a local file…) stays independent.

export type SharedDocKind = 'invoice' | 'expense' | 'payslip' | 'salary_certificate' | 'vat' | 'closing' | 'bank' | 'document';

export interface ActiveFirm {
  id: string;
  name: string;
}

export interface SharedDocument {
  id: string;
  firm_id: string;
  kind: SharedDocKind;
  title: string;
  file_path: string | null;
  amount_chf: number | null;
  doc_date: string | null;
  message: string | null;
  seen_at: string | null;
  created_at: string;
}

// A file to attach: any URI fetch() can read (a signed URL, a blob: URL from
// the web picker, a file:// URI on mobile).
export interface ShareFile {
  uri: string;
  name: string;
  mimeType?: string | null;
}

export interface ShareInput {
  orgId: string;
  firmId: string;
  kind: SharedDocKind;
  title: string;
  file?: ShareFile | null;
  amountChf?: number | null;
  docDate?: string | null;
  message?: string | null;
  sourceTable?: string | null;
  sourceId?: string | null;
}

const missing = (msg?: string) => !!msg && /fiduciary_shared_documents|schema cache|does not exist/i.test(msg);

export async function listActiveFirms(orgId: string): Promise<{ firms: ActiveFirm[]; error: string | null }> {
  const { data, error } = await getFiduciaries(orgId);
  if (error) return { firms: [], error };
  const seen = new Set<string>();
  const firms: ActiveFirm[] = [];
  for (const a of data?.accesses ?? []) {
    if (a.status !== 'ACTIVE' || seen.has(a.firm.id)) continue;
    seen.add(a.firm.id);
    firms.push({ id: a.firm.id, name: a.firm.name });
  }
  return { firms, error: null };
}

export async function shareWithFiduciary(input: ShareInput): Promise<{ error: string | null }> {
  let filePath: string | null = null;
  if (input.file) {
    const safe = input.file.name.normalize('NFD').replace(/[^\w.\- ]+/g, '_').slice(-120) || 'document';
    const { path, error } = await uploadToOrgBucket(input.orgId, `fiduciary-shared/${Date.now()}-${safe}`, input.file.uri, input.file.mimeType ?? 'application/octet-stream');
    if (error || !path) return { error: error ?? 'Upload failed' };
    filePath = path;
  }
  const { error } = await supabase.from('fiduciary_shared_documents').insert({
    organization_id: input.orgId,
    firm_id: input.firmId,
    kind: input.kind,
    title: input.title.trim().slice(0, 300),
    file_path: filePath,
    amount_chf: input.amountChf ?? null,
    doc_date: input.docDate ?? null,
    message: input.message?.trim() ? input.message.trim().slice(0, 2000) : null,
    source_table: input.sourceTable ?? null,
    source_id: input.sourceId ?? null,
  });
  if (error && filePath) await supabase.storage.from('opus-storage').remove([filePath]);
  if (error && missing(error.message)) return { error: 'unavailable' };
  return { error: error?.message ?? null };
}

export async function listSharedDocuments(orgId: string): Promise<{ rows: SharedDocument[]; available: boolean }> {
  const { data, error } = await supabase
    .from('fiduciary_shared_documents')
    .select('id, firm_id, kind, title, file_path, amount_chf, doc_date, message, seen_at, created_at')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) return { rows: [], available: !missing(error.message) };
  return { rows: (data ?? []).map((r: any) => ({ ...r, amount_chf: r.amount_chf == null ? null : Number(r.amount_chf) })) as SharedDocument[], available: true };
}

export async function withdrawSharedDocument(doc: SharedDocument): Promise<{ error: string | null }> {
  const { error } = await supabase.from('fiduciary_shared_documents').delete().eq('id', doc.id);
  if (!error && doc.file_path) await supabase.storage.from('opus-storage').remove([doc.file_path]);
  return { error: error?.message ?? null };
}
