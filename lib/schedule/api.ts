// Planning de chantier — data access (migration 20261007160000_site_schedules).
import { supabase } from '../supabase';
import { DEFAULT_WORKDAYS, type ItemKind, type ScheduleItem, type ScheduleLink } from './calc.ts';
import { VILLA_TEMPLATE, planTemplate, type TemplateData } from './templates.ts';

export interface Schedule {
  id: string;
  organization_id: string;
  project_id: string;
  workdays: number[];
  // working-day calendar (migration 20261008120000)
  canton: string | null;
  holidays: boolean;
  days_off: string[];
}

export interface ScheduleBundle {
  schedule: Schedule;
  items: ScheduleItem[];
  links: ScheduleLink[];
}

export interface AuditRow {
  id: number;
  item_name: string | null;
  field: string;
  old_value: string | null;
  new_value: string | null;
  user_id: string | null;
  created_at: string;
}

// Base list (cahier des charges §4.3); the company adds its own.
export const BASE_TRADES = [
  'Installation de chantier', 'Terrassement', 'Maçonnerie / béton', 'Charpente', 'Couverture', 'Fenêtres / façade', 'Sanitaire', 'Chauffage',
  'Ventilation', 'Électricité', 'Plâtrerie', 'Chape', 'Carrelage', 'Peinture', 'Menuiserie', 'Aménagements extérieurs', 'Entreprise générale', 'Réception',
];

const ITEM_COLS = 'id, parent_id, kind, name, trade, company, responsible_user_id, team_size, status, progress, progress_manual, start_date, end_date, duration, fixed, baseline_start, baseline_end, actual_start, actual_end, notes, sort_order';

// Équipe plan and up, building companies only (org_has_site_schedule).
export async function hasSiteSchedule(organizationId: string): Promise<boolean> {
  const { data } = await supabase.rpc('org_has_site_schedule', { org_id: organizationId });
  return data === true;
}

export async function loadSchedule(projectId: string): Promise<ScheduleBundle | null> {
  const { data: schedule } = await supabase.from('site_schedules').select('id, organization_id, project_id, workdays, canton, holidays, days_off').eq('project_id', projectId).maybeSingle();
  if (!schedule) return null;
  const [{ data: items }, { data: links }] = await Promise.all([
    supabase.from('schedule_items').select(ITEM_COLS).eq('schedule_id', schedule.id).order('sort_order'),
    supabase.from('schedule_links').select('id, from_item, to_item').eq('schedule_id', schedule.id),
  ]);
  return { schedule: schedule as Schedule, items: (items ?? []) as ScheduleItem[], links: (links ?? []) as ScheduleLink[] };
}

export interface NewItem {
  parent_id: string | null;
  kind: ItemKind;
  name: string;
  trade?: string | null;
  duration?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  sort_order: number;
}

export async function createSchedule(organizationId: string, projectId: string, template: 'empty' | 'villa' | TemplateData, start: string): Promise<{ error: string | null }> {
  const { data: sched, error } = await supabase.from('site_schedules').insert({ organization_id: organizationId, project_id: projectId, workdays: DEFAULT_WORKDAYS }).select('id').single();
  if (error || !sched) return { error: error?.message ?? 'Création impossible' };
  if (template === 'empty') return { error: null };
  return { error: await insertTemplate(sched.id, organizationId, template === 'villa' ? VILLA_TEMPLATE : template, start) };
}

async function insertTemplate(scheduleId: string, organizationId: string, data: TemplateData, start: string): Promise<string | null> {
  const lines = planTemplate(data, start);
  const ids = new Map<string, string>();
  for (const l of lines) {
    const { data: row, error } = await supabase
      .from('schedule_items')
      .insert({
        schedule_id: scheduleId,
        organization_id: organizationId,
        parent_id: l.parent ? ids.get(l.parent) ?? null : null,
        kind: l.kind,
        name: l.name,
        trade: l.trade,
        duration: l.duration,
        start_date: l.start_date,
        end_date: l.end_date,
        status: l.start_date || l.kind === 'phase' ? 'planned' : 'todo',
        sort_order: l.sort_order,
      })
      .select('id')
      .single();
    if (error || !row) return error?.message ?? 'Modèle incomplet';
    ids.set(l.key, row.id);
  }
  const links = data.links.filter(([a, b]) => ids.has(a) && ids.has(b)).map(([a, b]) => ({ schedule_id: scheduleId, from_item: ids.get(a)!, to_item: ids.get(b)! }));
  if (!links.length) return null;
  const { error } = await supabase.from('schedule_links').insert(links);
  return error?.message ?? null;
}

// Company templates ----------------------------------------------------------
export interface ScheduleTemplate {
  id: string;
  name: string;
  description: string | null;
  data: TemplateData;
  created_by: string | null;
  updated_at: string;
}

export async function listTemplates(organizationId: string): Promise<ScheduleTemplate[]> {
  const { data } = await supabase.from('schedule_templates').select('id, name, description, data, created_by, updated_at').eq('organization_id', organizationId).order('name');
  return (data as ScheduleTemplate[]) ?? [];
}

export async function saveTemplate(organizationId: string, name: string, description: string | null, data: TemplateData): Promise<{ error: string | null }> {
  const { error } = await supabase.from('schedule_templates').insert({ organization_id: organizationId, name: name.trim(), description, data });
  return { error: error?.message ?? null };
}

export async function updateTemplate(id: string, patch: { name?: string; description?: string | null }): Promise<{ error: string | null }> {
  const { error } = await supabase.from('schedule_templates').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id);
  return { error: error?.message ?? null };
}

export async function deleteTemplate(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('schedule_templates').delete().eq('id', id);
  return { error: error?.message ?? null };
}

export async function addItem(scheduleId: string, organizationId: string, item: NewItem): Promise<{ item: ScheduleItem | null; error: string | null }> {
  const { data, error } = await supabase
    .from('schedule_items')
    .insert({ schedule_id: scheduleId, organization_id: organizationId, status: item.start_date ? 'planned' : 'todo', ...item })
    .select(ITEM_COLS)
    .single();
  return { item: (data as ScheduleItem) ?? null, error: error?.message ?? null };
}

export async function updateItem(id: string, patch: Partial<ScheduleItem>): Promise<{ item: ScheduleItem | null; error: string | null }> {
  const { data, error } = await supabase.from('schedule_items').update(patch).eq('id', id).select(ITEM_COLS).single();
  return { item: (data as ScheduleItem) ?? null, error: error?.message ?? null };
}

export async function deleteItem(id: string): Promise<string | null> {
  const { error } = await supabase.from('schedule_items').delete().eq('id', id);
  return error?.message ?? null;
}

export async function addLink(scheduleId: string, from: string, to: string): Promise<{ link: ScheduleLink | null; error: string | null }> {
  const { data, error } = await supabase.from('schedule_links').insert({ schedule_id: scheduleId, from_item: from, to_item: to }).select('id, from_item, to_item').single();
  return { link: (data as ScheduleLink) ?? null, error: error?.message ?? null };
}

export async function removeLink(id: string): Promise<string | null> {
  const { error } = await supabase.from('schedule_links').delete().eq('id', id);
  return error?.message ?? null;
}

export async function updateCalendar(scheduleId: string, patch: { workdays?: number[]; canton?: string | null; holidays?: boolean; days_off?: string[] }): Promise<string | null> {
  const { error } = await supabase.from('site_schedules').update(patch).eq('id', scheduleId);
  return error?.message ?? null;
}

// Company-wide closures (congés du bâtiment…), shared by every planning.
export async function updateClosures(organizationId: string, closures: { from: string; to: string; label: string }[]): Promise<string | null> {
  const { error } = await supabase.from('organizations').update({ closure_periods: closures }).eq('id', organizationId);
  return error?.message ?? null;
}

export async function updateWorkdays(scheduleId: string, workdays: number[]): Promise<string | null> {
  const { error } = await supabase.from('site_schedules').update({ workdays }).eq('id', scheduleId);
  return error?.message ?? null;
}

export async function listTrades(organizationId: string): Promise<string[]> {
  const { data } = await supabase.from('schedule_trades').select('name').eq('organization_id', organizationId).order('name');
  return [...new Set([...BASE_TRADES, ...(data ?? []).map((r) => r.name)])];
}

export async function addTrade(organizationId: string, name: string): Promise<void> {
  await supabase.from('schedule_trades').insert({ organization_id: organizationId, name: name.trim().slice(0, 80) });
}

export async function listAudit(scheduleId: string): Promise<AuditRow[]> {
  const { data } = await supabase.from('schedule_audit').select('id, item_name, field, old_value, new_value, user_id, created_at').eq('schedule_id', scheduleId).order('created_at', { ascending: false }).limit(200);
  return (data ?? []) as AuditRow[];
}
