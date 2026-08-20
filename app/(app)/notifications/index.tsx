import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import {
  deleteNotification,
  formatRelativeTime,
  listNotifications,
  markAllRead,
  markRead,
  subscribeToNotifications,
} from '../../../lib/api/notifications';
import { NOTIFICATION_ICON, NOTIFICATION_TONE } from '../../../components/notificationMeta';
import { Button, Card, EmptyState, LoadingScreen, PageHeader, Screen } from '../../../components/ui';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import type { Notification } from '../../../lib/types';

function dayLabel(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  if (sameDay(date, today)) return "Aujourd'hui";
  if (sameDay(date, yesterday)) return 'Hier';
  return date.toLocaleDateString('fr-CH', { weekday: 'long', day: 'numeric', month: 'long' });
}

export default function NotificationsScreen() {
  const { user, organization } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(50);

  const load = useCallback(async () => {
    if (!organization) return;
    setLoading(true);
    const list = await listNotifications(organization.id, limit);
    setItems(list);
    setLoading(false);
  }, [organization, limit]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  useEffect(() => {
    if (!user) return;
    return subscribeToNotifications(user.id, load);
  }, [user, load]);

  const unreadCount = useMemo(() => items.filter((n) => !n.read_at).length, [items]);

  const groups = useMemo(() => {
    const map = new Map<string, Notification[]>();
    for (const n of items) {
      const label = dayLabel(n.created_at);
      if (!map.has(label)) map.set(label, []);
      map.get(label)!.push(n);
    }
    return Array.from(map.entries());
  }, [items]);

  async function handlePress(n: Notification) {
    if (!n.read_at) {
      setItems((prev) => prev.map((it) => (it.id === n.id ? { ...it, read_at: new Date().toISOString() } : it)));
      await markRead(n.id);
    }
    if (n.link) router.push(n.link as any);
  }

  async function handleDelete(id: string) {
    setItems((prev) => prev.filter((it) => it.id !== id));
    await deleteNotification(id);
  }

  async function handleMarkAllRead() {
    if (!organization) return;
    setItems((prev) => prev.map((it) => ({ ...it, read_at: it.read_at ?? new Date().toISOString() })));
    await markAllRead(organization.id);
  }

  if (loading && items.length === 0) return <LoadingScreen />;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl * 2 }}>
        <PageHeader
          title="Notifications"
          backTo="/(app)"
          right={
            unreadCount > 0 ? (
              <Pressable onPress={handleMarkAllRead} hitSlop={8}>
                <Text style={styles.headerAction}>Tout marquer comme lu</Text>
              </Pressable>
            ) : undefined
          }
        />

        {items.length === 0 ? (
          <Card style={{ marginTop: spacing.lg }}>
            <EmptyState title="Aucune notification" subtitle="Devis à relancer, factures en retard, messages de chantier : tout apparaîtra ici." />
          </Card>
        ) : (
          <View style={{ gap: spacing.lg, marginTop: spacing.lg }}>
            {groups.map(([label, group]) => (
              <View key={label}>
                <Text style={styles.groupLabel}>{label}</Text>
                <View style={{ gap: spacing.sm }}>
                  {group.map((n) => {
                    const tone = NOTIFICATION_TONE[n.type];
                    return (
                      <Pressable key={n.id} onPress={() => handlePress(n)}>
                        <Card style={[styles.row, !n.read_at && styles.rowUnread]}>
                          <View style={[styles.icon, { backgroundColor: tone.bg }]}>
                            <Feather name={NOTIFICATION_ICON[n.type]} size={16} color={tone.fg} />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.title} numberOfLines={2}>
                              {n.title}
                            </Text>
                            {n.body ? (
                              <Text style={styles.body} numberOfLines={2}>
                                {n.body}
                              </Text>
                            ) : null}
                            <Text style={styles.time}>{formatRelativeTime(n.created_at)}</Text>
                          </View>
                          <Pressable onPress={() => handleDelete(n.id)} hitSlop={8} style={styles.deleteBtn}>
                            <Feather name="x" size={16} color={colors.textMuted} />
                          </Pressable>
                        </Card>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}

            {items.length >= limit ? (
              <Button title="Charger plus" variant="secondary" onPress={() => setLimit((l) => l + 50)} />
            ) : null}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerAction: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.primary,
  },
  groupLabel: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  rowUnread: {
    borderColor: colors.primary,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 19,
  },
  body: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 17,
  },
  time: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  deleteBtn: {
    padding: 2,
  },
});
