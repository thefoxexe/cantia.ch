import { supabase } from '../supabase';
import { uploadToOrgBucket } from './storage';
import { assetFileInfo } from '../imageAsset';
import { generateReportPdf } from './pdf';
import type { FeedEntry } from '../types';

export async function listFeedEntries(projectId: string): Promise<FeedEntry[]> {
  const { data } = await supabase
    .from('feed_entries')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });
  return data ?? [];
}

export async function addNoteEntry(params: {
  organizationId: string;
  projectId: string;
  userId: string | undefined;
  body: string;
}): Promise<{ error: string | null }> {
  const { error } = await supabase.from('feed_entries').insert({
    organization_id: params.organizationId,
    project_id: params.projectId,
    type: 'note',
    body: params.body.trim(),
    created_by: params.userId,
  });
  return { error: error?.message ?? null };
}

export async function addPhotoEntry(params: {
  organizationId: string;
  projectId: string;
  userId: string | undefined;
  uri: string;
  mimeType?: string | null;
  caption: string;
  latitude: number | null;
  longitude: number | null;
  takenAt: string;
}): Promise<{ error: string | null }> {
  const { ext, contentType } = assetFileInfo(params);
  const subPath = `feed/${params.projectId}/${Date.now()}.${ext}`;
  const { path, error: uploadError } = await uploadToOrgBucket(params.organizationId, subPath, params.uri, contentType);
  if (!path) return { error: uploadError ?? "Échec de l'envoi de la photo" };

  const { error } = await supabase.from('feed_entries').insert({
    organization_id: params.organizationId,
    project_id: params.projectId,
    type: 'photo',
    storage_path: path,
    caption: params.caption.trim() || null,
    latitude: params.latitude,
    longitude: params.longitude,
    taken_at: params.takenAt,
    created_by: params.userId,
  });
  return { error: error?.message ?? null };
}

export async function deleteFeedEntry(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('feed_entries').delete().eq('id', id);
  return { error: error?.message ?? null };
}

export async function generateReportFromFeed(params: {
  organizationId: string;
  projectId: string;
  userId: string | undefined;
  title: string;
  entries: FeedEntry[];
  authorNames: Record<string, string>;
}): Promise<{ reportId: string | null; error: string | null }> {
  const sorted = [...params.entries].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

  const noteLines = sorted
    .filter((e) => e.type === 'note')
    .map((e) => {
      const author = (e.created_by && params.authorNames[e.created_by]) || 'Membre';
      const when = new Date(e.created_at).toLocaleString('fr-CH', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
      return `[${when}] ${author} : ${e.body}`;
    });

  const { data: report, error: reportError } = await supabase
    .from('reports')
    .insert({
      organization_id: params.organizationId,
      project_id: params.projectId,
      title: params.title.trim(),
      notes: noteLines.join('\n\n') || null,
      created_by: params.userId,
    })
    .select()
    .single();

  if (reportError || !report) return { reportId: null, error: reportError?.message ?? 'Échec de la création du rapport' };

  const photoEntries = sorted.filter((e) => e.type === 'photo' && e.storage_path);
  for (let i = 0; i < photoEntries.length; i++) {
    const e = photoEntries[i];
    await supabase.from('report_photos').insert({
      report_id: report.id,
      storage_path: e.storage_path,
      caption: e.caption,
      latitude: e.latitude,
      longitude: e.longitude,
      taken_at: e.taken_at ?? e.created_at,
      sort_order: i,
    });
  }

  const entryIds = sorted.map((e) => e.id);
  if (entryIds.length > 0) {
    await supabase.from('feed_entries').update({ report_id: report.id }).in('id', entryIds);
  }

  const { error: pdfError } = await generateReportPdf(report.id);
  if (pdfError) return { reportId: report.id, error: `Rapport créé, mais la génération du PDF a échoué : ${pdfError}` };

  return { reportId: report.id, error: null };
}
