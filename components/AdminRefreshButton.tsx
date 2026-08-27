import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSize, radius, spacing } from '../lib/theme';

// Every admin list screen used to have its own (or no) way to reload data
// short of a full page refresh — this is the one "Actualiser" control, reused
// everywhere, so it behaves identically and is never silently missing.
export function AdminRefreshButton({ onPress, loading, hasSignal }: { onPress: () => void; loading?: boolean; hasSignal?: boolean }) {
  return (
    <Pressable style={styles.button} onPress={onPress} disabled={loading}>
      {hasSignal ? <View style={styles.dot} /> : null}
      <Feather name="refresh-cw" size={14} color={colors.text} />
      <Text style={styles.text}>{loading ? 'Actualisation…' : 'Actualiser'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  text: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
});
