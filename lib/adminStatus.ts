import { colors } from './theme';

// Single source of truth for "what does this organization's subscription
// status mean, in plain French" — four admin screens (dashboard, entreprises,
// abonnements, fiche entreprise) used to each compute their own version of
// this inline, none of which recognized Stripe's 'trialing' status. A real
// paying-track org mid-trial (subscription_status: 'trialing', the value
// stripe-webhook writes straight from the Stripe subscription object) fell
// through every branch and showed as "Sans plan" — indistinguishable from an
// abandoned signup that never touched Stripe at all. This also covers every
// other status Stripe can send (past_due, canceled, unpaid, incomplete...),
// not just the two or three values seen in the data so far.
export type OrgStatusTone = 'success' | 'warning' | 'danger' | 'muted';

export interface OrgStatus {
  label: string;
  tone: OrgStatusTone;
}

const STRIPE_STATUS_LABELS: Record<string, OrgStatus> = {
  active: { label: 'Payant', tone: 'success' },
  trialing: { label: 'Essai', tone: 'warning' },
  past_due: { label: 'Paiement en retard', tone: 'danger' },
  unpaid: { label: 'Impayé', tone: 'danger' },
  incomplete: { label: 'Paiement incomplet', tone: 'danger' },
  incomplete_expired: { label: 'Paiement incomplet', tone: 'danger' },
  canceled: { label: 'Résilié', tone: 'muted' },
  paused: { label: 'En pause', tone: 'muted' },
};

export function getOrgStatus(org: {
  subscription_status: string | null;
  trial_ends_at: string | null;
  plan_selected: boolean;
}): OrgStatus {
  if (org.subscription_status && STRIPE_STATUS_LABELS[org.subscription_status]) {
    return STRIPE_STATUS_LABELS[org.subscription_status];
  }
  // Legacy path: an org can carry its own trial_ends_at independently of a
  // Stripe subscription_status (e.g. the 'découverte' plan's local trial,
  // which never touches Stripe at all).
  if (org.trial_ends_at && new Date(org.trial_ends_at).getTime() > Date.now()) {
    return { label: 'Essai', tone: 'warning' };
  }
  if (org.plan_selected) {
    return { label: 'Plan choisi', tone: 'muted' };
  }
  // Never picked a plan, no trial, no Stripe status at all — an org record
  // exists (someone signed up) but onboarding was abandoned before the plan
  // step. Named for what actually happened, not a vague "no plan".
  return { label: 'Inscription incomplète', tone: 'muted' };
}

export function orgStatusColor(tone: OrgStatusTone): string {
  switch (tone) {
    case 'success':
      return colors.success;
    case 'warning':
      return colors.warning;
    case 'danger':
      return colors.danger;
    default:
      return colors.textMuted;
  }
}
