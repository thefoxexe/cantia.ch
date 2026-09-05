import { StyleSheet, Text, View } from 'react-native';
import { fontSize, radius, spacing } from '../lib/theme';
import { getOrgStatus, orgStatusColor } from '../lib/adminStatus';

// Same pill everywhere an org's subscription status shows up (dashboard,
// entreprises, abonnements, fiche entreprise) — see lib/adminStatus.ts for
// why this used to be computed four different, inconsistent ways.
export function AdminOrgStatusPill({
  org,
}: {
  org: { subscription_status: string | null; trial_ends_at: string | null; plan_selected: boolean; is_complimentary: boolean };
}) {
  const { label, tone } = getOrgStatus(org);
  const color = orgStatusColor(tone);
  return (
    <View style={[styles.pill, { backgroundColor: `${color}22` }]}>
      <Text style={[styles.pillText, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  pillText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
});
