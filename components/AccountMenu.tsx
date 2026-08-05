import { Linking, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../lib/auth-context';
import { colors, fontSize, radius, spacing } from '../lib/theme';

type IconName = keyof typeof Feather.glyphMap;

export function AccountMenu({ visible, onOpen, onClose }: { visible: boolean; onOpen: () => void; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { organization, signOut } = useAuth();

  function go(path: string) {
    onClose();
    router.push(path as any);
  }

  return (
    <>
      <Pressable onPress={onOpen} style={styles.trigger} hitSlop={8}>
        <Feather name="user" size={17} color={colors.text} />
      </Pressable>

      <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
        <Pressable style={styles.backdrop} onPress={onClose}>
          <View style={[styles.card, { top: insets.top + 56 }]}>
            <View style={styles.header}>
              <Text style={styles.orgName} numberOfLines={1}>
                {organization?.name ?? 'Mon compte'}
              </Text>
              <Text style={styles.orgSubtitle}>Mon compte</Text>
            </View>
            <View style={styles.divider} />
            <MenuRow icon="download" label="Installer l'app" onPress={() => go('/(app)/installer')} />
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
  trigger: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdrop: {
    flex: 1,
  },
  card: {
    position: 'absolute',
    right: spacing.lg,
    width: 260,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
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
