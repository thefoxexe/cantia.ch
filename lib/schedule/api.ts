// Planning de chantier — data access (migration 20261007160000_site_schedules).
import { supabase } from '../supabase';
import { DEFAULT_WORKDAYS, endFromDuration, nextWorkday, addDays, type ItemKind, type ScheduleItem, type ScheduleLink } from './calc.ts';

export interface Schedule {
  id: string;
  organization_id: string;
  project_id: string;
  workdays: number[];
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
  const { data: schedule } = await supabase.from('site_schedules').select('id, organization_id, project_id, workdays').eq('project_id', projectId).maybeSingle();
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

export async function createSchedule(organizationId: string, projectId: string, template: 'empty' | 'villa', start: string): Promise<{ error: string | null }> {
  const { data: sched, error } = await supabase.from('site_schedules').insert({ organization_id: organizationId, project_id: projectId, workdays: DEFAULT_WORKDAYS }).select('id').single();
  if (error || !sched) return { error: error?.message ?? 'Création impossible' };
  if (template === 'villa') return { error: await insertTemplate(sched.id, organizationId, start) };
  return { error: null };
}

// Cahier des charges §5: villa, indicative durations, finish-to-start.
const VILLA: { phase: string; tasks: { key: string; name: string; trade: string; days: number; after: string[]; milestone?: boolean }[] }[] = [
  { phase: 'Préparation', tasks: [{ key: '1', name: 'Installation et préparation', trade: 'Installation de chantier', days: 2, after: [] }] },
  {
    phase: 'Gros œuvre',
    tasks: [
      { key: '2', name: 'Terrassement', trade: 'Terrassement', days: 5, after: ['1'] },
      { key: '3', name: 'Fondations et radier', trade: 'Maçonnerie / béton', days: 5, after: ['2'] },
      { key: '4', name: 'Murs et dalle du rez-de-chaussée', trade: 'Maçonnerie / béton', days: 10, after: ['3'] },
      { key: '5', name: 'Murs et dalle de l’étage', trade: 'Maçonnerie / béton', days: 10, after: ['4'] },
    ],
  },
  {
    phase: 'Enveloppe',
    tasks: [
      { key: '6', name: 'Charpente', trade: 'Charpente', days: 5, after: ['5'] },
      { key: '7', name: 'Couverture et mise hors d’eau', trade: 'Couverture', days: 5, after: ['6'] },
      { key: '8', name: 'Fenêtres et étanchéité extérieure', trade: 'Fenêtres / façade', days: 5, after: ['5'] },
    ],
  },
  {
    phase: 'Second œuvre',
    tasks: [
      { key: '9', name: 'Installations techniques', trade: 'Électricité', days: 10, after: ['7', '8'] },
      { key: '10', name: 'Cloisons et plâtrerie', trade: 'Plâtrerie', days: 8, after: ['9'] },
      { key: '11', name: 'Chape', trade: 'Chape', days: 3, after: ['10'] },
      { key: '12', name: 'Carrelage, peinture et finitions', trade: 'Peinture', days: 10, after: ['11'] },
    ],
  },
  { phase: 'Fin de chantier', tasks: [{ key: '13', name: 'Réception', trade: 'Réception', days: 0, after: ['12'], milestone: true }] },
];

async function insertTemplate(scheduleId: string, organizationId: string, start: string): Promise<string | null> {
  const placed = new Map<string, { id: string; end: string }>();
  let order = 0;
  for (const ph of VILLA) {
    order += 1;
    const { data: phase, error } = await supabase.from('schedule_items').insert({ schedule_id: scheduleId, organization_id: organizationId, kind: 'phase', name: ph.phase, sort_order: order * 1000 }).select('id').single();
    if (error || !phase) return error?.message ?? 'Modèle incomplet';
    for (const [i, t] of ph.tasks.entries()) {
      const after = t.after.map((k) => placed.get(k)!.end).sort().at(-1);
      const s = after ? nextWorkday(addDays(after, 1)) : nextWorkday(start);
      const e = t.milestone ? s : endFromDuration(s, t.days);
      const { data: row, error: e2 } = await supabase
        .from('schedule_items')
        .insert({ schedule_id: scheduleId, organization_id: organizationId, parent_id: phase.id, kind: t.milestone ? 'milestone' : 'task', name: t.name, trade: t.trade, duration: t.milestone ? 0 : t.days, start_date: s, end_date: e, status: 'planned', sort_order: order * 1000 + i + 1 })
        .select('id')
        .single();
      if (e2 || !row) return e2?.message ?? 'Modèle incomplet';
      placed.set(t.key, { id: row.id, end: e });
    }
  }
  const links = VILLA.flatMap((ph) => ph.tasks.flatMap((t) => t.after.map((k) => ({ schedule_id: scheduleId, from_item: placed.get(k)!.id, to_item: placed.get(t.key)!.id }))));
  const { error } = await supabase.from('schedule_links').insert(links);
  return error?.message ?? null;
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
