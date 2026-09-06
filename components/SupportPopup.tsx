import { Linking, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { contactHref } from '../lib/appHost';
import { openLiveChat } from '../lib/liveChat';
import { colors, fontSize, radius, spacing } from '../lib/theme';
import { useTranslation } from '../lib/translations';

const SUPPORT_PHONE = '+41784501457';
const SUPPORT_PHONE_DISPLAY = '+41 78 450 14 57';

// Shared support entry point, rendered from two independent triggers — the
// avatar menu (top right, every screen) and the desktop sidebar's own
// bottom-left icon — so both open the exact same four channels rather than
// drifting into two different popups over time.
export function SupportPopup({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useTranslation();

  function act(fn: () => void) {
    onClose();
    fn();
  }

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.card}>
          <Text style={styles.title}>{t('accountMenu.supportTitle')}</Text>
          <Text style={styles.subtitle}>{t('accountMenu.supportSubtitle')}</Text>

          <Pressable style={styles.option} onPress={() => act(() => Linking.openURL(contactHref()).catch(() => {}))}>
            <Feather name="file-text" size={16} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.optionTitle}>{t('accountMenu.formOption')}</Text>
              <Text style={styles.optionText}>{t('accountMenu.formOptionHint')}</Text>
            </View>
          </Pressable>

          <Pressable style={styles.option} onPress={() => act(openLiveChat)}>
            <Feather name="message-circle" size={16} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.optionTitle}>{t('accountMenu.chatOption')}</Text>
              <Text style={styles.optionText}>{t('accountMenu.chatOptionHint')}</Text>
            </View>
          </Pressable>

          <Pressable style={styles.option} onPress={() => act(() => Linking.openURL(`tel:${SUPPORT_PHONE}`).catch(() => {}))}>
            <Feather name="phone" size={16} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.optionTitle}>{t('accountMenu.phoneOption')}</Text>
              <Text style={styles.optionText}>{SUPPORT_PHONE_DISPLAY}</Text>
            </View>
          </Pressable>

          <Pressable style={styles.option} onPress={() => act(() => Linking.openURL('mailto:info@cantia.ch').catch(() => {}))}>
            <Feather name="mail" size={16} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.optionTitle}>{t('accountMenu.sendEmail')}</Text>
              <Text style={styles.optionText}>{t('accountMenu.sendEmailHint')}</Text>
            </View>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  card: {
    position: 'absolute',
    top: '35%',
    left: spacing.lg,
    right: spacing.lg,
    maxWidth: 380,
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  optionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  optionText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
});
