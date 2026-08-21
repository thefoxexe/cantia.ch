import { Feather } from '@expo/vector-icons';
import { colors } from '../lib/theme';
import type { NotificationType } from '../lib/types';

type IconName = keyof typeof Feather.glyphMap;

export const NOTIFICATION_ICON: Record<NotificationType, IconName> = {
  devis_stale_draft: 'file-text',
  devis_expiring_soon: 'clock',
  devis_accepted: 'check-circle',
  facture_overdue: 'alert-triangle',
  recurring_expense_due: 'repeat',
  extra_work_accepted: 'plus-circle',
  feed_message: 'message-circle',
};

export const NOTIFICATION_TONE: Record<NotificationType, { fg: string; bg: string }> = {
  devis_stale_draft: { fg: colors.textMuted, bg: colors.surfaceAlt },
  devis_expiring_soon: { fg: colors.warning, bg: colors.warningSoft },
  devis_accepted: { fg: colors.success, bg: colors.successSoft },
  facture_overdue: { fg: colors.danger, bg: colors.dangerSoft },
  recurring_expense_due: { fg: colors.warning, bg: colors.warningSoft },
  extra_work_accepted: { fg: colors.success, bg: colors.successSoft },
  feed_message: { fg: colors.primary, bg: colors.primarySoft },
};
