import { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../lib/auth-context';
import {
  listNotifications,
  markAllRead,
  markRead,
  subscribeToNotifications,
  unreadCount as fetchUnreadCount,
  formatRelativeTime,
} from '../lib/api/notifications';
import { DEFAULT_NOTIFICATION_ICON, DEFAULT_NOTIFICATION_TONE, NOTIFICATION_ICON, NOTIFICATION_TONE } from './notificationMeta';
import { EmptyState } from './ui';
import { colors, fontSize, radius, spacing, breakpoints } from '../lib/theme';
import { useTranslation } from '../lib/translations';
import type { Notification } from '../lib/types';

const PREVIEW_LIMIT = 8;

// On phone widths there's no good place to anchor a popover without it
// either overflowing the screen or getting cramped — so the bell just
// opens the full notifications screen directly there, the same way most
// mobile apps handle this. The anchored dropdown preview (measureInWindow
// + absolute card, same technique as AccountMenu) only applies from
// tablet width up, where there's room for it next to the trigger.
export function NotificationBell() {
  const { t } = useTranslation();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= breakpoints.tablet;
  const { user, organization } = useAuth();
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null);
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const triggerRef = useRef<View>(null);

  const load = useCallback(async () => {
    if (!organization) return;
    const [list, count] = await Promise.all([listNotifications(organization.id, PREVIEW_LIMIT), fetchUnreadCount(organization.id)]);
    setItems(list);
    setUnread(count);
  }, [organization]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  useEffect(() => {
    if (!user) return;
    return subscribeToNotifications(user.id, load);
  }, [user, load]);

  function open() {
    if (!isDesktop) {
      router.push('/(app)/notifications');
      return;
    }
    triggerRef.current?.measureInWindow((x, y, triggerWidth, triggerHeight) => {
      const windowWidth = Dimensions.get('window').width;
      setPos({ top: y + triggerHeight + spacing.xs, right: Math.max(spacing.md, windowWidth - (x + triggerWidth)) });
      setVisible(true);
    });
  }

  function onClose() {
    setVisible(false);
  }

  async function handlePress(n: Notification) {
    onClose();
    if (!n.read_at) {
      setItems((prev) => prev.map((it) => (it.id === n.id ? { ...it, read_at: new Date().toISOString() } : it)));
      setUnread((c) => Math.max(0, c - 1));
      await markRead(n.id);
    }
    if (n.link) router.push(n.link as any);
  }

  async function handleMarkAllRead() {
    if (!organization) return;
    setItems((prev) => prev.map((it) => ({ ...it, read_at: it.read_at ?? new Date().toISOString() })));
    setUnread(0);
    await markAllRead(organization.id);
  }

  function handleSeeAll() {
    onClose();
    router.push('/(app)/notifications');
  }

  return (
    <>
      <View ref={triggerRef} collapsable={false}>
        <Pressable onPress={open} style={styles.trigger} hitSlop={6}>
          <Feather name="bell" size={17} color={colors.text} />
          {unread > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unread > 9 ? '9+' : unread}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
        <View style={styles.backdropContainer}>
          {/* A same-size Pressable sibling behind the card, not a parent
              wrapping it — a card nested inside a pressable backdrop can end
              up double-firing on some platforms (the tap reaches both the
              row and the backdrop), which is exactly what made "Tout voir"
              silently do nothing before. */}
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
          {pos ? (
            <View style={[styles.card, { top: pos.top, right: pos.right, width: Math.min(340, width - spacing.lg * 2) }]}>
              <View style={styles.header}>
                <Text style={styles.headerTitle}>{t('notificationBell.title')}</Text>
                {unread > 0 ? (
                  <Pressable onPress={handleMarkAllRead} hitSlop={6}>
                    <Text style={styles.headerAction}>{t('notificationBell.markAllRead')}</Text>
                  </Pressable>
                ) : null}
              </View>
              <View style={styles.divider} />

              {items.length === 0 ? (
                <View style={styles.empty}>
                  <EmptyState title={t('notificationBell.emptyTitle')} subtitle={t('notificationBell.emptySubtitle')} />
                </View>
              ) : (
                <ScrollView style={styles.list}>
                  {items.map((n) => {
                    const tone = NOTIFICATION_TONE[n.type] ?? DEFAULT_NOTIFICATION_TONE;
                    return (
                      <Pressable key={n.id} onPress={() => handlePress(n)} style={styles.row}>
                        {!n.read_at ? <View style={styles.unreadDot} /> : <View style={styles.unreadDotSpacer} />}
                        <View style={[styles.rowIcon, { backgroundColor: tone.bg }]}>
                          <Feather name={NOTIFICATION_ICON[n.type] ?? DEFAULT_NOTIFICATION_ICON} size={14} color={tone.fg} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.rowTitle} numberOfLines={2}>
                            {n.title}
                          </Text>
                          <Text style={styles.rowTime}>{formatRelativeTime(n.created_at)}</Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              )}

              <View style={styles.divider} />
              <Pressable onPress={handleSeeAll} style={styles.footer}>
                <Text style={styles.footerText}>{t('common.seeAll')}</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </Modal>
    </>
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
  badge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    borderRadius: 8,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.bg,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#fff',
  },
  backdropContainer: {
    flex: 1,
  },
  card: {
    position: 'absolute',
    maxHeight: 440,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: colors.text,
  },
  headerAction: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  list: {
    maxHeight: 340,
  },
  empty: {
    paddingVertical: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 6,
  },
  unreadDotSpacer: {
    width: 6,
  },
  rowIcon: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 18,
  },
  rowTime: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  footer: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  footerText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.primary,
  },
});
