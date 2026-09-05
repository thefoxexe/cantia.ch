import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fontSize, radius, spacing } from '../lib/theme';
import type { AdminDashboardStats } from '../lib/types';

// The number everyone glances past: how many of your signups actually made
// it anywhere. A stacked bar instead of three disconnected tiles, because
// the point is the *proportions* — how big is the "never finished signing
// up" slice relative to real customers — not just four counts in isolation.
// Each segment links straight to the filtered Entreprises list it describes,
// so "4 inscriptions incomplètes" is a worklist, not just a number.
export function AdminSignupFunnel({ stats }: { stats: AdminDashboardStats }) {
  const router = useRouter();
  const total = stats.organizations_count || 1;
  const paid = stats.paid_subscriptions_count;
  const trialing = stats.active_trials_count;
  const incomplete = stats.incomplete_signups_count;
  // Whatever's left over (a plan chosen but no trial/Stripe status yet —
  // an edge case in practice) still has to add up to the full bar.
  const other = Math.max(stats.organizations_count - paid - trialing - incomplete, 0);

  const segments = [
    { key: 'paid', label: 'Payant', count: paid, color: colors.success, status: 'paid' },
    { key: 'trialing', label: 'Essai', count: trialing, color: colors.warning, status: 'trialing' },
    { key: 'incomplete', label: 'Inscription incomplète', count: incomplete, color: colors.textMuted, status: 'incomplete' },
    { key: 'other', label: 'Autre', count: other, color: colors.border, status: null },
  ].filter((s) => s.count > 0);

  function goTo(status: string | null) {
    router.push((status ? `/(admin)/organizations?status=${status}` : '/(admin)/organizations') as any);
  }

  return (
    <View>
      <View style={styles.bar}>
        {segments.map((s) => (
          <View key={s.key} style={[styles.segment, { flex: s.count, backgroundColor: s.color }]} />
        ))}
      </View>
      <View style={styles.legend}>
        {segments.map((s) => (
          <Pressable key={s.key} style={styles.legendRow} onPress={() => goTo(s.status)} disabled={!s.status}>
            <View style={[styles.dot, { backgroundColor: s.color }]} />
            <Text style={styles.legendLabel}>{s.label}</Text>
            <Text style={styles.legendCount}>
              {s.count} · {Math.round((s.count / total) * 100)}%
            </Text>
            {s.status ? <Text style={styles.legendArrow}>→</Text> : null}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    height: 10,
    borderRadius: radius.pill,
    overflow: 'hidden',
    backgroundColor: colors.border,
  },
  segment: {
    height: '100%',
  },
  legend: {
    marginTop: spacing.md,
    gap: 2,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  legendCount: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  legendArrow: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
});
