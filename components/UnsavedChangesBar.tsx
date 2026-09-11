import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from '../lib/translations';
import { colors, fontSize, radius, spacing } from '../lib/theme';

// Floating bar that appears at the top of the screen whenever a settings
// form has unsaved edits — the replacement for a lone "Enregistrer" button
// buried at the bottom of a long form. Deliberately anchored to the TOP of
// the content area (not the bottom): the bottom edge is already owned by
// the voice-assistant mic FAB (see VoiceAssistant.tsx, mounted once in
// app/(app)/_layout.tsx above every screen), and the two were overlapping.
// <Screen>'s content already starts below the app's top navbar (its own
// root View is the positioned ancestor this is absolute against), so
// top:0 here lands right under the navbar, not over it.
export function UnsavedChangesBar({
  visible,
  saving,
  onSave,
  onDiscard,
}: {
  visible: boolean;
  saving: boolean;
  onSave: () => void;
  onDiscard: () => void;
}) {
  const { t } = useTranslation();
  if (!visible) return null;

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <View style={styles.bar}>
        <Feather name="alert-circle" size={16} color={colors.warning} />
        <Text style={styles.text} numberOfLines={1}>
          {t('unsavedChanges.detected')}
        </Text>
        <Pressable onPress={onDiscard} style={styles.discardBtn} disabled={saving}>
          <Text style={styles.discardText}>{t('unsavedChanges.discard')}</Text>
        </Pressable>
        <Pressable onPress={onSave} style={styles.saveBtn} disabled={saving}>
          {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.saveText}>{t('common.save')}</Text>}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    zIndex: 20,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    maxWidth: 640,
    width: '100%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  text: {
    flex: 1,
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.text,
  },
  discardBtn: {
    paddingVertical: 8,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
  },
  discardText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textMuted,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 9,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    minWidth: 72,
    alignItems: 'center',
  },
  saveText: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: '#fff',
  },
});
