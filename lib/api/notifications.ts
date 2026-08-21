import { supabase } from '../supabase';
import type { Notification, NotificationPreference, NotificationType } from '../types';

export const NOTIFICATION_TYPES: { type: NotificationType; label: string; description: string }[] = [
  { type: 'devis_stale_draft', label: 'Devis en attente', description: "Un devis reste en brouillon depuis plusieurs jours sans avoir été envoyé." },
  { type: 'devis_expiring_soon', label: 'Devis bientôt échu', description: "Un devis envoyé arrive au bout de sa durée de validité." },
  { type: 'devis_accepted', label: 'Devis signé', description: "Un client a accepté et signé un devis depuis le portail client." },
  { type: 'facture_overdue', label: 'Facture en retard', description: "Une facture envoyée a dépassé son échéance de paiement." },
  { type: 'recurring_expense_due', label: 'Dépense récurrente à venir', description: "Un abonnement ou une charge récurrente arrive à échéance." },
  { type: 'extra_work_accepted', label: 'Travaux supplémentaires acceptés', description: "Un client a accepté et signé des travaux supplémentaires." },
  { type: 'feed_message', label: 'Message de chantier', description: "Quelqu'un poste un message dans le fil d'un chantier." },
];

export async function listNotifications(organizationId: string, limit = 50): Promise<Notification[]> {
  const { data } = await supabase
    .from('notifications')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function unreadCount(organizationId: string): Promise<number> {
  const { count } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .is('read_at', null);
  return count ?? 0;
}

export async function markRead(id: string): Promise<void> {
  await supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('id', id).is('read_at', null);
}

export async function markAllRead(organizationId: string): Promise<void> {
  await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('organization_id', organizationId)
    .is('read_at', null);
}

export async function deleteNotification(id: string): Promise<void> {
  await supabase.from('notifications').delete().eq('id', id);
}

// Live badge/list updates — filtered server-side to the current user's own
// rows (RLS would enforce this anyway, the filter just avoids irrelevant
// payloads reaching the client).
export function subscribeToNotifications(userId: string, onChange: () => void): () => void {
  const channel = supabase
    .channel(`notifications-${userId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, onChange)
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}

// Always returns one entry per known type — a missing row means "default"
// (in_app + push on, email off), resolved here rather than left for every
// caller to reimplement.
export async function listPreferences(organizationId: string, userId: string): Promise<Record<NotificationType, NotificationPreference | null>> {
  const { data } = await supabase.from('notification_preferences').select('*').eq('organization_id', organizationId).eq('user_id', userId);
  const byType = new Map((data ?? []).map((p) => [p.type as NotificationType, p as NotificationPreference]));
  const result = {} as Record<NotificationType, NotificationPreference | null>;
  for (const { type } of NOTIFICATION_TYPES) result[type] = byType.get(type) ?? null;
  return result;
}

export async function upsertPreference(
  organizationId: string,
  userId: string,
  type: NotificationType,
  patch: Partial<Pick<NotificationPreference, 'in_app_enabled' | 'email_enabled' | 'push_enabled'>>,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('notification_preferences')
    .upsert({ organization_id: organizationId, user_id: userId, type, ...patch }, { onConflict: 'user_id,type' });
  return { error: error?.message ?? null };
}

export async function registerPushToken(userId: string, token: string, platform: 'ios' | 'android'): Promise<void> {
  await supabase.from('push_tokens').upsert({ user_id: userId, token, platform, last_seen_at: new Date().toISOString() }, { onConflict: 'token' });
}

export function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `il y a ${days} j`;
  return new Date(iso).toLocaleDateString('fr-CH', { day: 'numeric', month: 'short' });
}
