import { Text, View, StyleSheet } from 'react-native';
import { colors, fontSize, radius, spacing } from '../lib/theme';

interface DateFieldProps {
  label: string;
  value: string; // ISO yyyy-mm-dd, or ''
  onChange: (iso: string) => void;
}

// Browser-native date input — zero-dependency and gives a proper date
// picker UI on web, where no cross-platform date-picker package is
// installed for the native side.
export function DateField({ label, value, onChange }: DateFieldProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          border: `1px solid ${colors.border}`,
          borderRadius: radius.md,
          padding: `${spacing.sm}px ${spacing.md}px`,
          fontSize: fontSize.md,
          color: colors.text,
          backgroundColor: colors.surface,
          fontFamily: 'inherit',
          width: '100%',
          boxSizing: 'border-box',
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  label: { fontSize: fontSize.sm, color: colors.textMuted, marginBottom: spacing.xs, fontWeight: '500' },
});
