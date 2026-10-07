// Planning de chantier — read-only links (schedule_shares). The public page
// reads through the public-schedule edge function (it signs the logo).
import { supabase } from '../supabase';
import { invokeFunction } from '../api/functions';
import type { ItemKind, ItemStatus } from './calc';
import type { Closure } from './holidays';

export interface ScheduleShare {
  id: string;
  token: string;
  label: string | null;
  with_brand: boolean;
  show_notes: boolean;
  show_companies: boolean;
  expires_at: string | null;
  revoked_at: string | null;
  view_count: number;
  last_viewed_at: string | null;
  created_at: string;
}

export interface SharedSchedule {
  share: { expires_at: string | null; with_brand: boolean; label: string | null };
  project: { name: string; reference: string | null; address: string | null };
  organization: { name?: string; logo_url?: string | null; brand_color?: string | null; locale?: string | null };
  calendar: { workdays: number[]; canton: string | null; holidays: boolean; days_off: string[]; closures: Closure[] };
  items: {
    id: string;
    parent_id: string | null;
    kind: ItemKind;
    name: string;
    trade: string | null;
    company: string | null;
    status: ItemStatus;
    progress: number;
    progress_manual: boolean;
    start_date: string | null;
    end_date: string | null;
    duration: number | null;
    notes: string | null;
    sort_order: number;
  }[];
  links: { id: string; from_item: string; to_item: string }[];
  updated_at: string | null;
}

export function shareUrl(token: string): string {
  // always the public site: the person opening it has no Cantia account
  // (previews and local builds keep their own origin)
  const local = typeof window !== 'undefined' && window.location && !/(^|\.)cantia\.ch$/.test(window.location.hostname);
  const host = local ? window.location.origin : 'https://cantia.ch';
  return `${host}/planning-partage/${token}`;
}

export async function listShares(scheduleId: string): Promise<ScheduleShare[]> {
  const { data } = await supabase.from('schedule_shares').select('*').eq('schedule_id', scheduleId).is('revoked_at', null).order('created_at', { ascending: false });
  return (data ?? []) as ScheduleShare[];
}

export async function createShare(
  scheduleId: string,
  organizationId: string,
  opts: { label: string | null; days: number | null; with_brand: boolean; show_notes: boolean; show_companies: boolean },
): Promise<{ share: ScheduleShare | null; error: string | null }> {
  const expires_at = opts.days ? new Date(Date.now() + opts.days * 86_400_000).toISOString() : null;
  const { data, error } = await supabase
    .from('schedule_shares')
    .insert({ schedule_id: scheduleId, organization_id: organizationId, label: opts.label, expires_at, with_brand: opts.with_brand, show_notes: opts.show_notes, show_companies: opts.show_companies })
    .select('*')
    .single();
  return { share: (data as ScheduleShare) ?? null, error: error?.message ?? null };
}

export async function revokeShare(id: string): Promise<string | null> {
  const { error } = await supabase.from('schedule_shares').update({ revoked_at: new Date().toISOString() }).eq('id', id);
  return error?.message ?? null;
}

export async function getSharedSchedule(token: string): Promise<{ data: SharedSchedule | null; error: string | null }> {
  return invokeFunction<SharedSchedule>('public-schedule', { token });
}
