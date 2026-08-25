import { useEffect, useRef, useState } from 'react';
import { Dimensions, Image, Linking, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../lib/auth-context';
import { supabase } from '../lib/supabase';
import { getSignedUrl } from '../lib/api/storage';
import { canPromptInstall, promptInstall } from '../lib/pwaInstall';
import { helpHref } from '../lib/appHost';
import { colors, fontSize, radius, spacing } from '../lib/theme';

type IconName = keyof typeof Feather.glyphMap;

// Compact top-right avatar trigger, used in both the mobile top bar and the
// desktop top bar — the dropdown anchors under whichever one rendered it via
// measureInWindow (same technique as RowActionMenu) rather than a fixed
// position, since the trigger's on-screen spot differs between the two.
export function AccountMenu() {
  const router = useRouter();
  const { user, organization, signOut, isPlatformAdmin } = useAuth();
  const [visible, setVisible] = useState(false);
  const [supportVisible, setSupportVisible] = useState(false);
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const triggerRef = useRef<View>(null);

  // Personal avatar lives on organization_members (per user+org row), not a
  // global profile table — see app/(app)/compte/profil.tsx.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!organization || !user) {
        setAvatarUrl(null);
        return;
      }
      const { data } = await supabase
        .from('organization_members')
        .select('avatar_url')
        .eq('organization_id', organization.id)
        .eq('user_id', user.id)
        .maybeSingle();
      if (cancelled) return;
      setAvatarUrl(data?.avatar_url ? await getSignedUrl(data.avatar_url) : null);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [organization, user]);

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
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
          ) : (
            <Feather name="user" size={16} color={colors.primary} />
          )}
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
              {isPlatformAdmin ? (
                <>
                  <MenuRow icon="shield" label="Administration" onPress={() => go('/(admin)')} />
                  <View style={styles.divider} />
                </>
              ) : null}
              <MenuRow icon="download" label="Installer l'app" onPress={handleInstall} />
              <MenuRow icon="settings" label="Paramètres" onPress={() => go('/(app)/compte')} />
              <MenuRow
                icon="life-buoy"
                label="Contacter le support"
                onPress={() => {
                  onClose();
                  setSupportVisible(true);
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

      <Modal visible={supportVisible} animationType="fade" transparent onRequestClose={() => setSupportVisible(false)}>
        <Pressable style={styles.backdrop} onPress={() => setSupportVisible(false)}>
          <View style={styles.supportCard}>
            <Text style={styles.supportTitle}>Contacter le support</Text>
            <Text style={styles.supportSubtitle}>Comment pouvons-nous vous aider ?</Text>
            <Pressable
              style={styles.supportOption}
              onPress={() => {
                setSupportVisible(false);
                Linking.openURL('mailto:info@cantia.ch').catch(() => {});
              }}
            >
              <Feather name="mail" size={16} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.supportOptionTitle}>Envoyer un e-mail</Text>
                <Text style={styles.supportOptionText}>info@cantia.ch — on vous répond directement.</Text>
              </View>
            </Pressable>
            <Pressable
              style={styles.supportOption}
              onPress={() => {
                setSupportVisible(false);
                Linking.openURL(helpHref()).catch(() => {});
              }}
            >
              <Feather name="book-open" size={16} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.supportOptionTitle}>Voir la documentation</Text>
                <Text style={styles.supportOptionText}>Les réponses aux questions les plus fréquentes.</Text>
              </View>
            </Pressable>
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
  avatar: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 34,
    height: 34,
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
  supportCard: {
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
  supportTitle: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: colors.text,
  },
  supportSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  supportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  supportOptionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  supportOptionText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
});
