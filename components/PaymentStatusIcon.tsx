import { Feather } from '@expo/vector-icons';
import { colors } from '../lib/theme';
import type { AdminOrgBillingStatus } from '../lib/types';

// Compact per-row signal for "will this org actually get charged" — only
// rendered when there's an active/trialing subscription to say anything
// about; a free/no-plan org just shows nothing here.
export function PaymentStatusIcon({ status }: { status: AdminOrgBillingStatus | undefined }) {
  if (!status || !status.subscription_status || !['active', 'trialing', 'past_due'].includes(status.subscription_status)) return null;

  if (status.will_be_charged) {
    return <Feather name="credit-card" size={15} color={colors.success} />;
  }
  return <Feather name="alert-circle" size={15} color={colors.danger} />;
}
