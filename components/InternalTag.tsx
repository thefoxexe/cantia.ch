import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, radius, spacing } from '../lib/theme';

// Marks an organization as ours (seed/demo data, a literal "Test" org, or a
// personal/dev account) rather than a real client — admin_list_organizations
// already sorts these last; this badge makes the "why" visible at a glance.
export function InternalTag({ label }: { label: string }) {
  return (
    <View style={styles.tag}>
      <Text style={styles.tagText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.3,
  },
});
