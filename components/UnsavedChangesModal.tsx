import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from '../lib/translations';
import { colors, fontSize, radius, spacing } from '../lib/theme';

// The "you're about to lose changes" confirmation — a real centered modal
// rather than the platform Alert.alert used before (too small/easy to miss,
// and on web it renders as a plain, easy-to-dismiss browser-styled dialog).
// Driven by useUnsavedChanges' leaveModalVisible/onLeaveSave/onLeaveDiscard/
// onLeaveCancel — shown both when the in-app back arrow (PageHeader) is
// pressed with unsaved edits AND when the browser's own back button/gesture
// is used (see useUnsavedChanges' popstate interception), so there is no
// way to silently lose an edit by leaving the page.
export function UnsavedChangesModal({
  visible,
  saving,
  onSave,
  onDiscard,
  onCancel,
}: {
  visible: boolean;
  saving: boolean;
  onSave: () => void;
  onDiscard: () => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={saving ? undefined : onCancel} />
        <View style={styles.sheet}>
          <View style={styles.iconWrap}>
            <Feather name="alert-triangle" size={24} color={colors.warning} />
          </View>
          <Text style={styles.title}>{t('unsavedChanges.title')}</Text>
          <Text style={styles.body}>{t('unsavedChanges.body')}</Text>

          <Pressable onPress={onSave} style={styles.saveBtn} disabled={saving}>
            {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.saveBtnText}>{t('unsavedChanges.saveAndLeave')}</Text>}
          </Pressable>
          <Pressable onPress={onDiscard} style={styles.discardBtn} disabled={saving}>
            <Text style={styles.discardBtnText}>{t('unsavedChanges.discard')}</Text>
          </Pressable>
          <Pressable onPress={onCancel} style={styles.cancelBtn} disabled={saving}>
            <Text style={styles.cancelBtnText}>{t('unsavedChanges.cancel')}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 20, 18, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  sheet: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.warningSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  body: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  saveBtn: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  saveBtnText: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: '#fff',
  },
  discardBtn: {
    width: '100%',
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    marginBottom: spacing.sm,
  },
  discardBtnText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.danger,
  },
  cancelBtn: {
    width: '100%',
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textMuted,
  },
});
