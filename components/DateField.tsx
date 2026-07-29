import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, fontSize, radius, spacing } from '../lib/theme';

interface DateFieldProps {
  label: string;
  value: string; // ISO yyyy-mm-dd, or ''
  onChange: (iso: string) => void;
}

function isoToSwiss(iso: string): string {
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return '';
  return `${d}.${m}.${y}`;
}

function swissToIso(swiss: string): string | null {
  const match = swiss.trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!match) return null;
  const [, d, m, y] = match;
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

// No date-picker package is installed, so on native this stays a plain
// text field in the JJ.MM.AAAA format used everywhere else in the app
// (fr-CH locale formatting) — the web variant uses the browser's native
// <input type="date"> instead, since that's zero-dependency there.
export function DateField({ label, value, onChange }: DateFieldProps) {
  const [text, setText] = useState(isoToSwiss(value));

  useEffect(() => {
    setText(isoToSwiss(value));
  }, [value]);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={(t) => {
          setText(t);
          const iso = swissToIso(t);
          if (iso) onChange(iso);
        }}
        placeholder="JJ.MM.AAAA"
        placeholderTextColor={colors.textMuted}
        keyboardType="numbers-and-punctuation"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  label: { fontSize: fontSize.sm, color: colors.textMuted, marginBottom: spacing.xs, fontWeight: '500' },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.md,
    color: colors.text,
    backgroundColor: colors.surface,
  },
});
