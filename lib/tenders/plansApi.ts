// Plans of a chantier and the measures drawn on them (phase D).
// Lengths / areas sent here are never trusted: the database recomputes them
// from the geometry and the page calibration (public.measured_objects_compute).

import { supabase } from '../supabase';
import { uploadToOrgBucket } from '../api/storage';
import { fileSignedUrl, type PickedFile } from './importer.ts';
import { loadPdfJs } from './pdfjs.ts';
import type { Calibration, MeasureKind, Point } from './geometry.ts';

export interface SitePlanSummary {
  id: string;
  name: string;
  number: string | null;
  active_revision_id: string | null;
  revision_label: string | null;
  page_count: number;
  measures: number;
  calibrated: boolean;
  updated_at: string;
}

export interface PlanRevision {
  id: string;
  label: string;
  file_id: string;
  file_name: string | null;
  page_count: number;
  uploaded_at: string;
}

export interface PlanPage {
  id: string;
  revision_id: string;
  page_index: number;
  width_pt: number;
  height_pt: number;
  rotation: number;
  calibration: Calibration | null;
  meters_per_pt: number | null;
  label: string | null;
}

export interface MeasuredObject {
  id: string;
  plan_page_id: string;
  name: string | null;
  kind: MeasureKind;
  geometry: Point[];
  length_m: number | null;
  area_m2: number | null;
  perimeter_m: number | null;
  count: number | null;
  zone: string | null;
  floor: string | null;
  color: string | null;
  note: string | null;
  // what was measured and its dimensions: { element, height, thickness, width, factor }
  params: Record<string, unknown>;
  created_at: string;
  deleted_at: string | null;
}

export interface LoadedPlan {
  plan: { id: string; project_id: string; organization_id: string; name: string; number: string | null; active_revision_id: string | null };
  revisions: PlanRevision[];
  pages: PlanPage[];
  objects: MeasuredObject[];
  url: string | null;
}

const num = (v: unknown) => (v == null ? null : Number(v));

const toPage = (r: Record<string, unknown>): PlanPage => ({
  id: r.id as string,
  revision_id: r.revision_id as string,
  page_index: r.page_index as number,
  width_pt: Number(r.width_pt),
  height_pt: Number(r.height_pt),
  rotation: (r.rotation as number) ?? 0,
  calibration: (r.calibration as Calibration | null) ?? null,
  meters_per_pt: num(r.meters_per_pt),
  label: (r.label as string | null) ?? null,
});

const toObject = (r: Record<string, unknown>): MeasuredObject => ({
  id: r.id as string,
  plan_page_id: r.plan_page_id as string,
  name: (r.name as string | null) ?? null,
  kind: r.kind as MeasureKind,
  geometry: (r.geometry as Point[]) ?? [],
  length_m: num(r.length_m),
  area_m2: num(r.area_m2),
  perimeter_m: num(r.perimeter_m),
  count: num(r.count),
  zone: (r.zone as string | null) ?? null,
  floor: (r.floor as string | null) ?? null,
  color: (r.color as string | null) ?? null,
  note: (r.note as string | null) ?? null,
  params: (r.params as Record<string, unknown>) ?? {},
  created_at: r.created_at as string,
  deleted_at: (r.deleted_at as string | null) ?? null,
});

export async function listPlans(projectId: string): Promise<{ plans: SitePlanSummary[]; error: string | null }> {
  const { data, error } = await supabase
    .from('site_plans')
    .select('id, name, number, active_revision_id, updated_at, sort_order, site_plan_revisions!site_plan_revisions_plan_id_fkey(id, label, page_count)')
    .eq('project_id', projectId)
    .order('sort_order')
    .order('created_at');
  if (error) return { plans: [], error: error.message };
  const rows = (data ?? []) as unknown as Array<{ id: string; name: string; number: string | null; active_revision_id: string | null; updated_at: string; site_plan_revisions: Array<{ id: string; label: string; page_count: number }> }>;
  const revIds = rows.map((r) => r.active_revision_id).filter(Boolean) as string[];
  const counts = new Map<string, { measures: number; calibrated: boolean }>();
  if (revIds.length) {
    const { data: pages } = await supabase.from('site_plan_pages').select('id, revision_id, meters_per_pt').in('revision_id', revIds);
    const pageRev = new Map<string, string>();
    for (const p of pages ?? []) {
      pageRev.set(p.id, p.revision_id);
      const c = counts.get(p.revision_id) ?? { measures: 0, calibrated: false };
      if (p.meters_per_pt != null) c.calibrated = true;
      counts.set(p.revision_id, c);
    }
    if (pageRev.size) {
      const { data: objs } = await supabase.from('measured_objects').select('plan_page_id').in('plan_page_id', [...pageRev.keys()]).is('deleted_at', null);
      for (const o of objs ?? []) {
        const rev = pageRev.get(o.plan_page_id);
        if (rev) counts.get(rev)!.measures += 1;
      }
    }
  }
  return {
    plans: rows.map((r) => {
      const rev = r.site_plan_revisions.find((x) => x.id === r.active_revision_id) ?? null;
      const c = (r.active_revision_id && counts.get(r.active_revision_id)) || { measures: 0, calibrated: false };
      return { id: r.id, name: r.name, number: r.number, active_revision_id: r.active_revision_id, revision_label: rev?.label ?? null, page_count: rev?.page_count ?? 0, measures: c.measures, calibrated: c.calibrated, updated_at: r.updated_at };
    }),
    error: null,
  };
}

async function readBytes(f: PickedFile): Promise<Uint8Array> {
  if (f.file) return new Uint8Array(await f.file.arrayBuffer());
  const res = await fetch(f.uri);
  return new Uint8Array(await res.arrayBuffer());
}

export type UploadStep = 'reading' | 'uploading' | 'saving';

// New plan, or a new revision of an existing plan (planId). The new revision
// becomes the active one; older revisions and their measures are kept.
export async function uploadPlan(
  projectId: string,
  organizationId: string,
  userId: string | null,
  picked: PickedFile,
  fields: { planId?: string | null; name?: string; number?: string | null; label: string },
  onStep?: (s: UploadStep) => void,
): Promise<{ planId: string | null; error: string | null }> {
  try {
    onStep?.('reading');
    const bytes = await readBytes(picked);
    if (bytes.length < 5 || String.fromCharCode(...bytes.slice(0, 5)) !== '%PDF-') return { planId: null, error: 'Ce fichier n’est pas un PDF.' };
    const pdfjs = await loadPdfJs();
    const doc = await pdfjs.getDocument({ data: bytes.slice() }).promise;
    const sizes: Array<{ w: number; h: number; rotation: number }> = [];
    for (let n = 1; n <= Math.min(doc.numPages, 500); n++) {
      const p = await doc.getPage(n);
      const vp = p.getViewport({ scale: 1 });
      sizes.push({ w: vp.width, h: vp.height, rotation: ((p.rotate % 360) + 360) % 360 });
    }
    await doc.destroy?.();

    onStep?.('uploading');
    const safe = picked.name.replace(/[^\w.\-]+/g, '_').slice(-120);
    const blobUrl = typeof URL !== 'undefined' && picked.file ? URL.createObjectURL(picked.file) : picked.uri;
    const { path, error: upErr } = await uploadToOrgBucket(organizationId, `projects/${projectId}/plans/${Date.now()}-${safe}`, blobUrl, 'application/pdf');
    if (!path) return { planId: null, error: upErr ?? 'Envoi impossible' };
    const { data: fileRow, error: fileErr } = await supabase
      .from('files')
      .insert({ organization_id: organizationId, project_id: projectId, name: picked.name, storage_path: path, size_bytes: picked.size ?? bytes.length, mime_type: 'application/pdf', uploaded_by: userId })
      .select('id')
      .single();
    if (fileErr || !fileRow) return { planId: null, error: fileErr?.message ?? 'Enregistrement du fichier impossible' };

    onStep?.('saving');
    let planId = fields.planId ?? null;
    if (!planId) {
      const { data: plan, error } = await supabase
        .from('site_plans')
        .insert({ project_id: projectId, name: (fields.name || picked.name.replace(/\.pdf$/i, '')).slice(0, 200), number: fields.number || null })
        .select('id')
        .single();
      if (error || !plan) return { planId: null, error: error?.message ?? 'Création du plan impossible' };
      planId = plan.id as string;
    }
    const { data: rev, error: revErr } = await supabase
      .from('site_plan_revisions')
      .insert({ plan_id: planId, label: fields.label.slice(0, 60) || 'Rev A', file_id: fileRow.id, file_name: picked.name.slice(0, 300), page_count: sizes.length })
      .select('id')
      .single();
    if (revErr || !rev) return { planId, error: revErr?.message ?? 'Création de la révision impossible' };
    const { error: pagesErr } = await supabase
      .from('site_plan_pages')
      .insert(sizes.map((s, i) => ({ revision_id: rev.id, page_index: i + 1, width_pt: Math.round(s.w * 1000) / 1000, height_pt: Math.round(s.h * 1000) / 1000, rotation: s.rotation })));
    if (pagesErr) return { planId, error: pagesErr.message };
    const { error: actErr } = await supabase.from('site_plans').update({ active_revision_id: rev.id }).eq('id', planId);
    return { planId, error: actErr?.message ?? null };
  } catch (e) {
    return { planId: null, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function loadPlan(planId: string, revisionId?: string | null): Promise<{ data: LoadedPlan | null; error: string | null }> {
  const { data: plan, error } = await supabase.from('site_plans').select('id, project_id, organization_id, name, number, active_revision_id').eq('id', planId).maybeSingle();
  if (error || !plan) return { data: null, error: error?.message ?? 'Plan introuvable' };
  const { data: revs } = await supabase.from('site_plan_revisions').select('id, label, file_id, file_name, page_count, uploaded_at').eq('plan_id', planId).order('uploaded_at', { ascending: false });
  const revisions = (revs ?? []) as PlanRevision[];
  const revId = revisionId ?? plan.active_revision_id ?? revisions[0]?.id ?? null;
  const rev = revisions.find((r) => r.id === revId) ?? null;
  if (!rev) return { data: { plan, revisions, pages: [], objects: [], url: null }, error: null };
  const [{ data: pages }, url] = await Promise.all([supabase.from('site_plan_pages').select('*').eq('revision_id', rev.id).order('page_index'), fileSignedUrl(rev.file_id)]);
  const pageRows = (pages ?? []).map(toPage);
  const { data: objs } = pageRows.length
    ? await supabase
        .from('measured_objects')
        .select('*')
        .in('plan_page_id', pageRows.map((p) => p.id))
        .is('deleted_at', null)
        .order('created_at')
    : { data: [] };
  return { data: { plan, revisions, pages: pageRows, objects: (objs ?? []).map(toObject), url }, error: null };
}

export async function updatePlan(planId: string, patch: { name?: string; number?: string | null; active_revision_id?: string }) {
  const { error } = await supabase.from('site_plans').update(patch).eq('id', planId);
  return { error: error?.message ?? null };
}

export async function deletePlan(planId: string) {
  const { error } = await supabase.from('site_plans').delete().eq('id', planId);
  return { error: error?.message ?? null };
}

export async function setCalibration(pageId: string, calibration: Calibration | null): Promise<{ page: PlanPage | null; error: string | null }> {
  const { data, error } = await supabase.from('site_plan_pages').update({ calibration }).eq('id', pageId).select('*').single();
  return { page: data ? toPage(data) : null, error: error?.message ?? null };
}

export async function pageObjects(pageId: string): Promise<MeasuredObject[]> {
  const { data } = await supabase.from('measured_objects').select('*').eq('plan_page_id', pageId).is('deleted_at', null).order('created_at');
  return (data ?? []).map(toObject);
}

export async function createMeasure(pageId: string, kind: MeasureKind, geometry: Point[], extra: { zone?: string | null; color?: string | null; params?: Record<string, unknown> } = {}) {
  const { data, error } = await supabase
    .from('measured_objects')
    .insert({ plan_page_id: pageId, kind, geometry, zone: extra.zone ?? null, color: extra.color ?? null, params: extra.params ?? {} })
    .select('*')
    .single();
  return { object: data ? toObject(data) : null, error: error?.message ?? null };
}

export async function updateMeasure(id: string, patch: Partial<Pick<MeasuredObject, 'geometry' | 'name' | 'zone' | 'floor' | 'color' | 'note' | 'params'>>) {
  const { data, error } = await supabase.from('measured_objects').update(patch).eq('id', id).select('*').single();
  return { object: data ? toObject(data) : null, error: error?.message ?? null };
}

// Soft delete, so undo can bring the measure back with its name.
export async function setMeasureDeleted(id: string, deleted: boolean) {
  const { data, error } = await supabase
    .from('measured_objects')
    .update({ deleted_at: deleted ? new Date().toISOString() : null })
    .eq('id', id)
    .select('*')
    .single();
  return { object: data ? toObject(data) : null, error: error?.message ?? null };
}
