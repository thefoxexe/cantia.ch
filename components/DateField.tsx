import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Button } from './ui';
import { colors, fontSize, radius, spacing } from '../lib/theme';
import { getAppLocale, useTranslation } from '../lib/translations';

interface DateFieldProps {
  label: string;
  value: string | null; // ISO "AAAA-MM-JJ", or '' / null for empty
  onChange: (iso: string | null) => void;
  placeholder?: string;
}

function isoToDate(iso: string | null): Date {
  if (!iso) return new Date();
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

function toIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function displayDate(iso: string | null): string {
  return iso ? isoToDate(iso).toLocaleDateString(`${getAppLocale()}-CH`) : '';
}

// Native (iOS/Android) date picker. The web build resolves DateField.web.tsx
// instead (Metro's platform-specific file resolution), which uses the
// browser's own <input type="date">.
export function DateField({ label, value, onChange, placeholder }: DateFieldProps) {
  const { t } = useTranslation();
  const resolvedPlaceholder = placeholder ?? t('dateField.placeholder');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [draft, setDraft] = useState<Date>(() => isoToDate(value));

  function openPicker() {
    setDraft(isoToDate(value));
    setPickerOpen(true);
  }

  // Android's "default" display is a self-dismissing native dialog: a
  // single onChange fires with the final choice (or a cancel), so it needs
  // no surrounding sheet. iOS's inline spinner instead fires onChange
  // continuously while scrolling, so it's wrapped in a sheet with an
  // explicit "Valider" to commit the draft.
  function handleAndroidChange(event: DateTimePickerEvent, selected?: Date) {
    setPickerOpen(false);
    if (event.type === 'set' && selected) onChange(toIso(selected));
  }

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.input} onPress={openPicker}>
        <Text style={value ? styles.value : styles.placeholder}>{value ? displayDate(value) : resolvedPlaceholder}</Text>
        <Feather name="calendar" size={16} color={colors.textMuted} />
      </Pressable>

      {pickerOpen && Platform.OS === 'android' ? (
        <DateTimePicker value={draft} mode="date" display="default" onChange={handleAndroidChange} />
      ) : null}

      {Platform.OS === 'ios' ? (
        <Modal visible={pickerOpen} animationType="slide" transparent onRequestClose={() => setPickerOpen(false)}>
          <View style={styles.sheetOverlay}>
            <View style={styles.sheet}>
              <DateTimePicker
                value={draft}
                mode="date"
                display="spinner"
                onChange={(_event, selected) => selected && setDraft(selected)}
              />
              <View style={styles.sheetActions}>
                <Button title={t('common.cancel')} variant="secondary" onPress={() => setPickerOpen(false)} style={{ flex: 1 }} />
                <Button
                  title={t('dateField.confirm')}
                  onPress={() => {
                    onChange(toIso(draft));
                    setPickerOpen(false);
                  }}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    fontWeight: '500',
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  value: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  placeholder: {
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    alignItems: 'center',
  },
  sheetActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    width: '100%',
  },
});
