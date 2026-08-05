import { useRef, useState } from 'react';
import { Dimensions, Linking, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../lib/auth-context';
import { canPromptInstall, promptInstall } from '../lib/pwaInstall';
import { colors, fontSize, radius, spacing } from '../lib/theme';

type IconName = keyof typeof Feather.glyphMap;

// Compact top-right avatar trigger, used in both the mobile top bar and the
// desktop top bar — the dropdown anchors under whichever one rendered it via
// measureInWindow (same technique as RowActionMenu) rather than a fixed
// position, since the trigger's on-screen spot differs between the two.
export function AccountMenu() {
  const router = useRouter();
  const { organization, signOut } = useAuth();
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null);
  const triggerRef = useRef<View>(null);

  function open() {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      const windowWidth = Dimensions.get('window').width;
      setPos({ top: y + height + spacing.xs, right: Math.max(spacing.md, windowWidth - (x + width)) });
      setVisible(true);
    });
  }

  function onClose() {
    setVisible(false);
  }

  function go(path: string) {
    onClose();
    router.push(path as any);
  }

  // On Chrome/Edge (desktop + Android) once the browser has decided the page
  // is installable, this shows the real native "Installer l'application"
  // dialog. Everywhere else (iOS Safari, native app builds, or before the
  // browser has fired that event) there's no such prompt to trigger, so it
  // falls back to the manual instructions screen instead.
  function handleInstall() {
    onClose();
    if (canPromptInstall()) {
      promptInstall();
      return;
    }
    router.push('/(app)/installer' as any);
  }

  return (
    <>
      <View ref={triggerRef} collapsable={false}>
        <Pressable onPress={open} style={styles.avatar} hitSlop={6}>
          <Feather name="user" size={16} color={colors.primary} />
        </Pressable>
      </View>

      <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
        <Pressable style={styles.backdrop} onPress={onClose}>
          {pos ? (
            <View style={[styles.card, { top: pos.top, right: pos.right }]}>
              <View style={styles.header}>
                <Text style={styles.orgName} numberOfLines={1}>
                  {organization?.name ?? 'Mon compte'}
                </Text>
                <Text style={styles.orgSubtitle}>Mon compte</Text>
              </View>
              <View style={styles.divider} />
              <MenuRow icon="download" label="Installer l'app" onPress={handleInstall} />
              <MenuRow icon="settings" label="Paramètres" onPress={() => go('/(app)/compte')} />
              <MenuRow
                icon="life-buoy"
                label="Contacter le support"
                onPress={() => {
                  onClose();
                  if (Platform.OS === 'web') {
                    Linking.openURL('mailto:info@cantia.ch');
                  } else {
                    Linking.openURL('mailto:info@cantia.ch').catch(() => {});
                  }
                }}
              />
              <View style={styles.divider} />
              <MenuRow
                icon="log-out"
                label="Déconnexion"
                danger
                onPress={() => {
                  onClose();
                  signOut();
                }}
              />
            </View>
          ) : null}
        </Pressable>
      </Modal>
    </>
  );
}

function MenuRow({ icon, label, onPress, danger }: { icon: IconName; label: string; onPress: () => void; danger?: boolean }) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <Feather name={icon} size={16} color={danger ? colors.danger : colors.textMuted} />
      <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdrop: {
    flex: 1,
  },
  card: {
    position: 'absolute',
    width: 232,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  orgName: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: colors.text,
  },
  orgSubtitle: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  rowLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  rowLabelDanger: {
    color: colors.danger,
  },
});
