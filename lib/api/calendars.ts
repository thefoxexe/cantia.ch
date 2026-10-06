// Planning ↔ Google Calendar / Outlook (edge function calendar-sync,
// migration 20261007140000_calendar_sync). Each person connects their own.
import { Linking, Platform } from 'react-native';
import { supabase } from '../supabase';
import { invokeFunction } from './functions';

export type CalendarProvider = 'google' | 'microsoft';

export interface CalendarConnection {
  id: string;
  provider: CalendarProvider;
  account_email: string | null;
  status: 'connected' | 'error';
  last_error: string | null;
  last_synced_at: string | null;
}

export async function listMyCalendars(organizationId: string, userId: string): Promise<CalendarConnection[]> {
  const { data } = await supabase
    .from('calendar_connections')
    .select('id, provider, account_email, status, last_error, last_synced_at')
    .eq('organization_id', organizationId)
    .eq('user_id', userId);
  return (data ?? []) as CalendarConnection[];
}

// Sends the person to Google / Microsoft; they come back to the planning.
export async function connectCalendar(organizationId: string, provider: CalendarProvider): Promise<string | null> {
  const returnTo = Platform.OS === 'web' && typeof window !== 'undefined' ? `${window.location.origin}/planning` : 'https://app.cantia.ch/planning';
  const { data, error } = await invokeFunction<{ url: string }>('calendar-sync', { action: 'connect', organization_id: organizationId, provider, return_to: returnTo });
  if (error || !data?.url) return error ?? 'Connexion impossible.';
  if (Platform.OS === 'web') window.location.href = data.url;
  else await Linking.openURL(data.url);
  return null;
}

export async function disconnectCalendar(connectionId: string): Promise<string | null> {
  const { error } = await invokeFunction('calendar-sync', { action: 'disconnect', connection_id: connectionId });
  return error;
}

// Both ways, for the caller's calendars and those of the members whose
// events were just changed. Quiet: the planning works the same without it.
export async function syncCalendars(organizationId: string, userIds: string[] = []): Promise<number> {
  const { data } = await invokeFunction<{ synced: number }>('calendar-sync', { action: 'sync', organization_id: organizationId, user_ids: userIds });
  return data?.synced ?? 0;
}
