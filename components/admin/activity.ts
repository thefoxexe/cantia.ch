import { Feather } from '@expo/vector-icons';
import { colors } from '../../lib/theme';
import type { ActivityEvent, ActivityKind } from '../../lib/api/admin';
import { CANCEL_REASON_LABELS } from '../AdminCancellationReasons';
import { PLAN_LABEL } from '../AdminEmailAudience';

// How an event of the platform reads (admin_activity_feed): its kind's icon
// and colours, its headline and the line under it. Shared by the Journal
// and the « Dernière activité » of the home page.

// Private plans that are not in the list of public plans.
const EXTRA_PLAN_LABEL: Record<string, string> = { 'solo-essai-soumissions': 'Essentiel (essai soumissions)' };

export const KINDS: { id: ActivityKind; label: string; icon: keyof typeof Feather.glyphMap; color: string; soft: string }[] = [
  { id: 'signup', label: 'Inscriptions', icon: 'user-plus', color: colors.primary, soft: colors.primarySoft },
  { id: 'company', label: 'Entreprises', icon: 'briefcase', color: colors.primary, soft: colors.primarySoft },
  { id: 'subscription', label: 'Abonnements', icon: 'credit-card', color: colors.success, soft: colors.successSoft },
  { id: 'cancel_reason', label: 'Résiliations', icon: 'message-circle', color: colors.danger, soft: colors.dangerSoft },
  { id: 'email', label: 'E-mails', icon: 'mail', color: colors.slate, soft: colors.slateSoft },
  { id: 'fiduciary', label: 'Fiduciaires', icon: 'shield', color: colors.plum, soft: colors.plumSoft },
  { id: 'partner', label: 'Partenaires', icon: 'award', color: colors.plum, soft: colors.plumSoft },
  { id: 'sync_error', label: 'Erreurs Bexio', icon: 'alert-triangle', color: colors.danger, soft: colors.dangerSoft },
  { id: 'lead', label: 'Leads du blog', icon: 'download', color: colors.moss, soft: colors.mossSoft },
  { id: 'admin', label: 'Actions admin', icon: 'tool', color: colors.textMuted, soft: colors.surfaceAlt },
];
export const KIND_BY_ID = Object.fromEntries(KINDS.map((k) => [k.id, k])) as Record<ActivityKind, (typeof KINDS)[number]>;

// Subscription events that are bad news get the red badge.
export const NEGATIVE_ACTIONS = new Set(['canceled', 'email_failed', 'scheduled_failed']);

// What a fiduciary or a partner did, in words (fiduciary_audit_log and
// partner_audit_log keep a technical action key).
export const ACTION_LABEL: Record<string, string> = {
  firm_created: 'Cabinet créé',
  firm_profile_updated: 'Profil du cabinet modifié',
  client_invited: 'Client invité',
  new_client_joined: 'Nouveau client rattaché',
  external_client_created: 'Client hors Cantia ajouté',
  external_client_updated: 'Client hors Cantia modifié',
  external_client_new_link: 'Nouveau lien envoyé à un client',
  request_created: 'Demande envoyée au client',
  request_open: 'Demande rouverte',
  request_answered: 'Demande répondue par le client',
  request_done: 'Demande terminée',
  request_cancelled: 'Demande annulée',
  request_remind: 'Client relancé',
  work_created: 'Travail créé',
  work_todo: 'Travail à faire',
  work_in_progress: 'Travail en cours',
  work_waiting_client: 'Travail en attente du client',
  work_review: 'Travail en révision',
  work_done: 'Travail terminé',
  partner_updated: 'Partenaire modifié',
  terms_set: 'Conditions de commission fixées',
};

export function dayKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export function dayLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today.getTime() - 864e5);
  if (dayKey(iso) === dayKey(today.toISOString())) return 'Aujourd’hui';
  if (dayKey(iso) === dayKey(yesterday.toISOString())) return 'Hier';
  const label = d.toLocaleDateString('fr-CH', { weekday: 'long', day: 'numeric', month: 'long', ...(d.getFullYear() !== today.getFullYear() ? { year: 'numeric' } : {}) });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function timeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString('fr-CH', { hour: '2-digit', minute: '2-digit' });
}

export function headline(e: ActivityEvent): string {
  if (e.kind === 'fiduciary' || e.kind === 'partner') return ACTION_LABEL[e.action] ?? e.action;
  return e.title;
}

// Plan ids and cancellation reason keys, in words.
export function readable(e: ActivityEvent): string | null {
  if (!e.detail) return null;
  if (e.kind === 'subscription') return e.detail.split(' → ').map((id) => PLAN_LABEL[id] ?? EXTRA_PLAN_LABEL[id] ?? id).join(' → ');
  if (e.kind === 'cancel_reason') return e.detail.replace(/^[a-z_]+/, (k) => CANCEL_REASON_LABELS[k] ?? k);
  return e.detail;
}

// The line under the headline: who it is about, then the detail.
export function subline(e: ActivityEvent): string {
  const who = e.kind === 'fiduciary' ? e.title : e.kind === 'partner' ? e.title : e.kind === 'email' ? null : e.organization_name;
  const parts = [who, e.kind === 'fiduciary' && e.organization_name ? `client : ${e.organization_name}` : null, readable(e)];
  if (e.kind === 'email' && e.organization_name) parts.push(e.organization_name);
  return parts.filter(Boolean).join(' · ');
}

