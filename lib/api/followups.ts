import { supabase } from '../supabase';
import { invokeFunction } from './functions';

// Relances de devis automatiques (plan Entreprise). Settings live in
// devis_followup_settings (one row per org, created on first save); the
// sending itself is done by the send-devis-followups edge function.

export type FollowupPreset = 'doux' | 'standard' | 'soutenu' | 'custom';

export interface FollowupSettings {
  enabled: boolean;
  preset: FollowupPreset;
  days: number[];
  min_amount: number;
  send_from_hour: number;
  send_to_hour: number;
  weekdays_only: boolean;
  attach_pdf: boolean;
  messages: string[];
}

export const FOLLOWUP_PRESETS: Record<Exclude<FollowupPreset, 'custom'>, number[]> = {
  doux: [5, 12],
  standard: [3, 7, 14],
  soutenu: [2, 5, 10],
};

export const MAX_FOLLOWUP_STEPS = 5;

export const DEFAULT_FOLLOWUP_SETTINGS: FollowupSettings = {
  enabled: false,
  preset: 'standard',
  days: FOLLOWUP_PRESETS.standard,
  min_amount: 0,
  send_from_hour: 8,
  send_to_hour: 18,
  weekdays_only: true,
  attach_pdf: true,
  messages: [],
};

export async function getFollowupSettings(organizationId: string): Promise<FollowupSettings> {
  const { data } = await supabase.from('devis_followup_settings').select('*').eq('organization_id', organizationId).maybeSingle();
  if (!data) return { ...DEFAULT_FOLLOWUP_SETTINGS };
  return {
    ...DEFAULT_FOLLOWUP_SETTINGS,
    ...data,
    min_amount: Number(data.min_amount ?? 0),
    days: (data.days as number[] | null)?.length ? (data.days as number[]) : DEFAULT_FOLLOWUP_SETTINGS.days,
    messages: (data.messages as string[] | null) ?? [],
  };
}

export async function saveFollowupSettings(
  organizationId: string,
  userId: string | undefined,
  settings: FollowupSettings,
): Promise<{ error: string | null }> {
  const days = settings.days.slice(0, MAX_FOLLOWUP_STEPS).map((d) => Math.min(90, Math.max(1, Math.round(d))));
  const { error } = await supabase.from('devis_followup_settings').upsert(
    {
      organization_id: organizationId,
      enabled: settings.enabled,
      preset: settings.preset,
      days,
      min_amount: Math.max(0, settings.min_amount || 0),
      send_from_hour: settings.send_from_hour,
      send_to_hour: settings.send_to_hour,
      weekdays_only: settings.weekdays_only,
      attach_pdf: settings.attach_pdf,
      // Trailing empty steps are dropped; an empty step keeps the standard text.
      messages: settings.messages.slice(0, days.length).map((m) => m.trim()),
      updated_by: userId ?? null,
    },
    { onConflict: 'organization_id' },
  );
  return { error: error?.message ?? null };
}

export async function setDevisFollowupsPaused(devisId: string, paused: boolean): Promise<{ error: string | null }> {
  const { error } = await supabase.from('devis').update({ followups_paused: paused }).eq('id', devisId);
  return { error: error?.message ?? null };
}

export async function sendFollowupNow(devisId: string): Promise<{ error: string | null }> {
  const { error } = await invokeFunction<{ sent: boolean }>('send-devis-followups', { devis_id: devisId });
  return { error };
}

// When the next automatic follow-up of a devis will go out (before the send
// window is applied), or null when none is left.
export function nextFollowupAt(sentAt: string | null, days: number[], followupsSent: number): Date | null {
  if (!sentAt || followupsSent >= days.length) return null;
  return new Date(new Date(sentAt).getTime() + days[followupsSent] * 24 * 60 * 60 * 1000);
}
