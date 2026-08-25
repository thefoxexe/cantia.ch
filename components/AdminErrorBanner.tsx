import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSize, radius, spacing } from '../lib/theme';

// A real RPC/network failure must never render identically to "no data" —
// every admin_* list screen shows this instead of silently falling back to
// an empty state, so a broken call is visible and diagnosable on the spot.
export function AdminErrorBanner({ message }: { message: string }) {
  return (
    <View style={styles.banner}>
      <Feather name="alert-triangle" size={14} color={colors.danger} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
  },
  text: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.danger,
  },
});
