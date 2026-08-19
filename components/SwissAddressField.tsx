import { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View, type StyleProp, type TextStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { searchSwissAddress, type SwissAddressResult } from '../lib/api/swissAddress';
import { colors, fontSize, radius, spacing } from '../lib/theme';

// A "Rue et numéro" input with a live dropdown of real Swiss addresses
// (fed by the federal geo.admin.ch address search) — picking a suggestion
// fills the street AND hands the NPA/localité back to the caller via
// onSelectAddress, same idea as the NPA→localité autofill but starting
// from the street instead. Typing without picking anything still works
// exactly like a plain text field; the dropdown only ever suggests, never
// blocks free text.
export function SwissAddressField({
  label,
  value,
  onChangeText,
  onSelectAddress,
  editable = true,
  placeholder = 'Rue et numéro',
  inputStyle,
}: {
  label?: string;
  value: string;
  onChangeText: (v: string) => void;
  onSelectAddress: (addr: { street: string; postalCode: string; locality: string }) => void;
  editable?: boolean;
  placeholder?: string;
  inputStyle?: StyleProp<TextStyle>;
}) {
  const [results, setResults] = useState<SwissAddressResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChange(text: string) {
    onChangeText(text);
    setOpen(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (text.trim().length < 4) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const found = await searchSwissAddress(text.trim());
      setResults(found);
      setLoading(false);
    }, 350);
  }

  function handleSelect(r: SwissAddressResult) {
    onChangeText(r.street);
    onSelectAddress({ street: r.street, postalCode: r.postalCode, locality: r.locality });
    setResults([]);
    setOpen(false);
  }

  const showDropdown = open && focused && (loading || results.length > 0);

  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={[styles.input, focused && styles.inputFocused, !editable && styles.inputDisabled, inputStyle]}
        value={value}
        onChangeText={handleChange}
        editable={editable}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        onFocus={() => {
          setFocused(true);
          setOpen(true);
        }}
        onBlur={() => {
          // Delayed so a suggestion's onPress still registers before the
          // dropdown unmounts — a plain onBlur-close would eat the tap.
          setTimeout(() => setFocused(false), 150);
        }}
      />
      {showDropdown ? (
        <View style={styles.dropdown}>
          {loading ? (
            <View style={styles.dropdownRow}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.dropdownLoading}>Recherche…</Text>
            </View>
          ) : (
            results.map((r, i) => (
              <Pressable key={i} onPress={() => handleSelect(r)} style={({ hovered }: any) => [styles.dropdownRow, hovered && styles.dropdownRowHovered]}>
                <Feather name="map-pin" size={13} color={colors.textMuted} />
                <Text style={styles.dropdownText} numberOfLines={1}>
                  {r.label}
                </Text>
              </Pressable>
            ))
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
    zIndex: 20,
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  inputDisabled: {
    backgroundColor: colors.surfaceAlt,
    color: colors.textMuted,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  dropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  dropdownRowHovered: {
    backgroundColor: colors.surfaceAlt,
  },
  dropdownText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  dropdownLoading: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
});
