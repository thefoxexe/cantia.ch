// Import of a soumission PDF, browser side:
// 1. keep the original (Storage + public.files, never modified)
// 2. extract the text layer (pdf.js) — or OCR when the PDF is a scan
// 3. parse into a draft (rules first, see lib/tenders/parser/parse.ts)
// 4. store the draft in tender_import_jobs for the review screen
// The métré itself is only created after validation (import_tender_draft).

import { supabase } from '../supabase';
import { uploadToOrgBucket } from '../api/storage';
import { extractText } from './parser/extract.ts';
import { parseTender, PARSER_VERSION } from './parser/parse.ts';
import { ocrDocument } from './ocr.ts';
import { loadPdfJs, sha256Hex } from './pdfjs.ts';
import type { ParseResult } from './parser/types.ts';

export type ImportStep = 'reading' | 'uploading' | 'extracting' | 'ocr' | 'parsing' | 'saving' | 'done';

export interface ImportProgress {
  step: ImportStep;
  page?: number;
  pages?: number;
}

export interface PickedFile {
  name: string;
  uri: string;
  size?: number | null;
  mimeType?: string | null;
  file?: File | null;
}

async function readBytes(f: PickedFile): Promise<Uint8Array> {
  if (f.file) return new Uint8Array(await f.file.arrayBuffer());
  const res = await fetch(f.uri);
  return new Uint8Array(await res.arrayBuffer());
}

export async function importSoumission(
  projectId: string,
  organizationId: string,
  userId: string | null,
  picked: PickedFile,
  onProgress: (p: ImportProgress) => void,
): Promise<{ jobId: string | null; error: string | null }> {
  try {
    onProgress({ step: 'reading' });
    const bytes = await readBytes(picked);
    if (bytes.length < 5 || String.fromCharCode(...bytes.slice(0, 5)) !== '%PDF-') return { jobId: null, error: 'Ce fichier n’est pas un PDF.' };
    const sha = await sha256Hex(bytes);

    // 1. Original kept as a chantier document, untouched.
    onProgress({ step: 'uploading' });
    const safe = picked.name.replace(/[^\w.\-]+/g, '_').slice(-120);
    const subPath = `projects/${projectId}/soumissions/${Date.now()}-${safe}`;
    const blobUrl = typeof URL !== 'undefined' && picked.file ? URL.createObjectURL(picked.file) : picked.uri;
    const { path, error: upErr } = await uploadToOrgBucket(organizationId, subPath, blobUrl, 'application/pdf');
    if (!path) return { jobId: null, error: upErr ?? 'Envoi impossible' };
    const { data: fileRow, error: fileErr } = await supabase
      .from('files')
      .insert({ organization_id: organizationId, project_id: projectId, name: picked.name, storage_path: path, size_bytes: picked.size ?? bytes.length, mime_type: 'application/pdf', uploaded_by: userId })
      .select('id')
      .single();
    if (fileErr || !fileRow) return { jobId: null, error: fileErr?.message ?? 'Enregistrement du fichier impossible' };

    const { data: job, error: jobErr } = await supabase
      .from('tender_import_jobs')
      .insert({ project_id: projectId, file_id: fileRow.id, file_name: picked.name, sha256: sha, status: 'extracting', step: 'extracting', progress: 0.1, parser_version: PARSER_VERSION })
      .select('id')
      .single();
    if (jobErr || !job) return { jobId: null, error: jobErr?.message ?? 'Création de l’import impossible' };

    const fail = async (message: string) => {
      await supabase.from('tender_import_jobs').update({ status: 'failed', error: message }).eq('id', job.id);
      return { jobId: job.id as string, error: message };
    };

    // 2. Native text first; OCR only for scans.
    onProgress({ step: 'extracting' });
    const pdfjs = await loadPdfJs();
    let doc = await extractText(pdfjs, bytes.slice(), (page, pages) => onProgress({ step: 'extracting', page, pages }));
    let aiModel: string | null = null;
    if (doc.scanned) {
      onProgress({ step: 'ocr', page: 0, pages: doc.pages.length });
      const ocr = await ocrDocument(pdfjs, bytes.slice(), (page, pages) => onProgress({ step: 'ocr', page, pages }), organizationId);
      if (ocr.error) return fail(ocr.error);
      doc = ocr.doc!;
      aiModel = ocr.model;
    }

    // 3. Rules-based parsing.
    onProgress({ step: 'parsing' });
    const result: ParseResult & { answers?: Record<string, string> } = parseTender(doc);
    result.answers = {};

    // 4. Draft saved for the review screen.
    onProgress({ step: 'saving' });
    const needsInput = result.questions.some((q) => q.kind === 'unit' || q.kind === 'classification');
    const { error: saveErr } = await supabase
      .from('tender_import_jobs')
      .update({
        status: needsInput ? 'needs_user_input' : 'ready_for_review',
        step: null,
        progress: 1,
        page_count: doc.pages.length,
        classification: result.classification,
        stats: result.stats,
        draft: result,
        ai_model_version: aiModel,
      })
      .eq('id', job.id);
    if (saveErr) return fail(saveErr.message);
    onProgress({ step: 'done' });
    return { jobId: job.id as string, error: null };
  } catch (e) {
    return { jobId: null, error: e instanceof Error ? e.message : String(e) };
  }
}

export interface ImportJob {
  id: string;
  project_id: string;
  organization_id: string;
  tender_id: string | null;
  file_id: string | null;
  file_name: string | null;
  page_count: number | null;
  status: string;
  classification: string | null;
  draft: (ParseResult & { answers?: Record<string, string> }) | null;
  error: string | null;
  created_at: string;
}

export async function loadImportJob(id: string): Promise<ImportJob | null> {
  const { data } = await supabase.from('tender_import_jobs').select('*').eq('id', id).maybeSingle();
  return (data as ImportJob | null) ?? null;
}

export async function saveDraft(id: string, draft: ImportJob['draft'], status?: string) {
  const { error } = await supabase.from('tender_import_jobs').update({ draft, ...(status ? { status } : {}) }).eq('id', id);
  return { error: error?.message ?? null };
}

export async function finalizeImport(jobId: string, name: string, kind: string) {
  const { data, error } = await supabase.rpc('import_tender_draft', { p_job: jobId, p_name: name, p_kind: kind });
  return { tenderId: (data as string | null) ?? null, error: error?.message ?? null };
}

export async function pendingImports(projectId: string): Promise<ImportJob[]> {
  const { data } = await supabase
    .from('tender_import_jobs')
    .select('id, project_id, organization_id, tender_id, file_id, file_name, page_count, status, classification, error, created_at, stats')
    .eq('project_id', projectId)
    .in('status', ['needs_user_input', 'ready_for_review', 'failed'])
    .order('created_at', { ascending: false })
    .limit(10);
  return ((data ?? []) as unknown as ImportJob[]).map((j) => ({ ...j, draft: null }));
}

export async function discardImport(id: string) {
  const { error } = await supabase.from('tender_import_jobs').delete().eq('id', id);
  return { error: error?.message ?? null };
}

export async function fileSignedUrl(fileId: string): Promise<string | null> {
  const { data } = await supabase.from('files').select('storage_path').eq('id', fileId).maybeSingle();
  if (!data?.storage_path) return null;
  const { data: signed } = await supabase.storage.from('opus-storage').createSignedUrl(data.storage_path, 3600);
  return signed?.signedUrl ?? null;
}
