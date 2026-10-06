// Chantiers filed like a file explorer: folders (« 2026 » › « Villas »),
// a number per chantier, and per-user favourites (migration
// 20261008100000_project_folders).
import { supabase } from './supabase';
import { getWorkTerm } from './vocabulary';
import type { Project, ProjectFolder } from './types';

export async function listFolders(organizationId: string): Promise<ProjectFolder[]> {
  const { data } = await supabase.from('project_folders').select('*').eq('organization_id', organizationId).order('name');
  return (data as ProjectFolder[]) ?? [];
}

export async function createFolder(organizationId: string, name: string, parentId: string | null): Promise<{ folder: ProjectFolder | null; error: string | null }> {
  const { data, error } = await supabase.from('project_folders').insert({ organization_id: organizationId, name: name.trim(), parent_id: parentId }).select('*').single();
  return { folder: (data as ProjectFolder) ?? null, error: error?.message ?? null };
}

export async function updateFolder(id: string, patch: Partial<Pick<ProjectFolder, 'name' | 'parent_id' | 'color'>>): Promise<{ error: string | null }> {
  const { error } = await supabase.from('project_folders').update(patch).eq('id', id);
  return { error: error?.message ?? null };
}

// What it holds moves one level up first, so nothing ends up lost.
export async function deleteFolder(folder: ProjectFolder): Promise<{ error: string | null }> {
  const up = folder.parent_id;
  const a = await supabase.from('projects').update({ folder_id: up }).eq('folder_id', folder.id);
  if (a.error) return { error: a.error.message };
  const b = await supabase.from('project_folders').update({ parent_id: up }).eq('parent_id', folder.id);
  if (b.error) return { error: b.error.message };
  const { error } = await supabase.from('project_folders').delete().eq('id', folder.id);
  return { error: error?.message ?? null };
}

export async function moveProject(projectId: string, folderId: string | null): Promise<{ error: string | null }> {
  const { error } = await supabase.from('projects').update({ folder_id: folderId }).eq('id', projectId);
  return { error: error?.message ?? null };
}

export async function listFavorites(): Promise<Set<string>> {
  const { data } = await supabase.from('project_favorites').select('project_id');
  return new Set((data ?? []).map((r: { project_id: string }) => r.project_id));
}

export async function setFavorite(projectId: string, on: boolean): Promise<{ error: string | null }> {
  const { error } = on
    ? await supabase.from('project_favorites').insert({ project_id: projectId })
    : await supabase.from('project_favorites').delete().eq('project_id', projectId);
  return { error: error?.message ?? null };
}

// « 2026 › Villas »
export function folderPath(folders: ProjectFolder[], id: string | null): ProjectFolder[] {
  const byId = new Map(folders.map((f) => [f.id, f]));
  const path: ProjectFolder[] = [];
  for (let f = id ? byId.get(id) : undefined, n = 0; f && n < 50; f = f.parent_id ? byId.get(f.parent_id) : undefined, n++) path.unshift(f);
  return path;
}

// Folders in tree order with their depth, for pickers.
export function folderTree(folders: ProjectFolder[]): { folder: ProjectFolder; depth: number }[] {
  const out: { folder: ProjectFolder; depth: number }[] = [];
  const ids = new Set(folders.map((f) => f.id));
  const walk = (parent: string | null, depth: number) => {
    for (const f of folders.filter((x) => (x.parent_id && ids.has(x.parent_id) ? x.parent_id : null) === parent).sort((a, b) => a.name.localeCompare(b.name, 'fr', { numeric: true }))) {
      out.push({ folder: f, depth });
      if (depth < 20) walk(f.id, depth + 1);
    }
  };
  walk(null, 0);
  return out;
}

// Next number from the ones already used: « 2026-014 » → « 2026-015 »,
// « M-99 » → « M-100 ». None yet: « 2026-001 ».
export function suggestReference(refs: (string | null)[], year = new Date().getFullYear()): string {
  const parsed = refs
    .map((r) => r?.trim().match(/^(.*?)(\d+)$/))
    .filter((m): m is RegExpMatchArray => !!m)
    .map((m) => ({ prefix: m[1], n: Number(m[2]), width: m[2].length }));
  // this year's series first, else whatever series exists
  const pool = parsed.some((p) => p.prefix.includes(String(year))) ? parsed.filter((p) => p.prefix.includes(String(year))) : parsed;
  if (!pool.length) return `${year}-001`;
  const best = pool.reduce((a, b) => (b.n > a.n ? b : a));
  return `${best.prefix}${String(best.n + 1).padStart(best.width, '0')}`;
}

// Numbers sort naturally: 2026-2 before 2026-10.
export function compareReference(a: Project, b: Project): number {
  if (!a.reference && !b.reference) return a.name.localeCompare(b.name, 'fr', { numeric: true });
  if (!a.reference) return 1;
  if (!b.reference) return -1;
  return a.reference.localeCompare(b.reference, 'fr', { numeric: true });
}

// « Dossier » in the UI — unless the company already calls its jobs
// « dossiers », then folders are « classeurs ».
export function folderWords(lang: string): { F: string; f: string; Fs: string; fs: string } {
  const alt = getWorkTerm() === 'dossier';
  if (lang === 'de') return { F: 'Ordner', f: 'Ordner', Fs: 'Ordner', fs: 'Ordner' };
  if (lang === 'it') return { F: 'Cartella', f: 'cartella', Fs: 'Cartelle', fs: 'cartelle' };
  return alt ? { F: 'Classeur', f: 'classeur', Fs: 'Classeurs', fs: 'classeurs' } : { F: 'Dossier', f: 'dossier', Fs: 'Dossiers', fs: 'dossiers' };
}
