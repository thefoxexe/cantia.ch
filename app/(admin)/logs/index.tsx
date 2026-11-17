import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Container, EmptyState, LoadingScreen } from '../../../components/ui';
import { AdminErrorBanner } from '../../../components/AdminErrorBanner';
import { AdminRefreshButton } from '../../../components/AdminRefreshButton';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import { listActivity, type ActivityEvent, type ActivityKind } from '../../../lib/api/admin';
import { KINDS, KIND_BY_ID, NEGATIVE_ACTIONS, dayKey, dayLabel, headline, subline, timeLabel } from '../../../components/admin/activity';
import { adminDisplay as displayType } from '../../../lib/adminTheme';
import { AdminPage } from '../../../components/admin/kit';

// Super Admin › Journal: everything that happens on the platform, newest
// first, grouped by day (admin_activity_feed). The chips narrow it to one
// or several kinds; « Afficher plus » loads the next 150 events.

const PAGE = 150;

export default function AdminJournal() {
  const router = useRouter();
  const [rows, setRows] = useState<ActivityEvent[]>([]);
  const [kinds, setKinds] = useState<ActivityKind[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { rows: r, error: err } = await listActivity({ limit: PAGE, kinds });
    setRows(r);
    setHasMore(r.length === PAGE);
    setError(err);
    setLoading(false);
  }, [kinds]);

  useEffect(() => {
    load();
  }, [load]);

  async function loadMore() {
    const last = rows[rows.length - 1];
    if (!last) return;
    setLoadingMore(true);
    const { rows: r, error: err } = await listActivity({ limit: PAGE, kinds, before: last.at });
    setRows((prev) => [...prev, ...r]);
    setHasMore(r.length === PAGE);
    if (err) setError(err);
    setLoadingMore(false);
  }

  function toggleKind(k: ActivityKind) {
    setKinds((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]));
  }

  // Today's count per kind, shown at the top.
  const today = useMemo(() => {
    const key = dayKey(new Date().toISOString());
    const counts = new Map<ActivityKind, number>();
    for (const e of rows) if (dayKey(e.at) === key) counts.set(e.kind, (counts.get(e.kind) ?? 0) + 1);
    return counts;
  }, [rows]);

  const groups = useMemo(() => {
    const out: { key: string; label: string; items: ActivityEvent[] }[] = [];
    for (const e of rows) {
      const key = dayKey(e.at);
      const last = out[out.length - 1];
      if (last && last.key === key) last.items.push(e);
      else out.push({ key, label: dayLabel(e.at), items: [e] });
    }
    return out;
  }, [rows]);

  return (
    // style={{ flex: 1 }}: see the other admin pages, the page does not
    // scroll on web without it.
    <AdminPage eyebrow="Pilotage" title="Journal" subtitle="Tout ce qui se passe sur Cantia : inscriptions, abonnements, e-mails, fiduciaires, partenaires, erreurs Bexio et actions admin. Le plus récent en premier." actions={<AdminRefreshButton onPress={load} loading={loading} />}>
        <View style={{ gap: spacing.lg }}>

        {today.size ? (
          <View style={styles.todayRow}>
            <Text style={styles.todayLabel}>Aujourd’hui</Text>
            {[...today.entries()].map(([k, n]) => (
              <View key={k} style={[styles.todayPill, { backgroundColor: KIND_BY_ID[k].soft }]}>
                <Feather name={KIND_BY_ID[k].icon} size={12} color={KIND_BY_ID[k].color} />
                <Text style={[styles.todayPillText, { color: KIND_BY_ID[k].color }]}>
                  {KIND_BY_ID[k].label} {n}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.chips}>
          <Pressable onPress={() => setKinds([])} style={[styles.chip, kinds.length === 0 && styles.chipActive]}>
            <Text style={[styles.chipText, kinds.length === 0 && styles.chipTextActive]}>Tout</Text>
          </Pressable>
          {KINDS.map((k) => {
            const active = kinds.includes(k.id);
            return (
              <Pressable key={k.id} onPress={() => toggleKind(k.id)} style={[styles.chip, active && styles.chipActive]}>
                <Feather name={k.icon} size={12} color={active ? colors.primary : colors.textMuted} />
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{k.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {error ? <AdminErrorBanner message={error} /> : null}

        {loading ? (
          <LoadingScreen label="Chargement…" />
        ) : rows.length === 0 ? (
          <EmptyState title="Rien pour l’instant" subtitle={kinds.length ? 'Aucun événement de ce type.' : undefined} />
        ) : (
          <View style={{ gap: spacing.lg }}>
            {groups.map((g) => (
              <View key={g.key} style={{ gap: spacing.xs }}>
                <Text style={styles.day}>{g.label}</Text>
                <View style={styles.card}>
                  {g.items.map((e, i) => {
                    const k = KIND_BY_ID[e.kind] ?? KIND_BY_ID.admin;
                    const negative = NEGATIVE_ACTIONS.has(e.action);
                    const color = negative ? colors.danger : k.color;
                    const soft = negative ? colors.dangerSoft : k.soft;
                    const sub = subline(e);
                    const canOpen = !!e.organization_id;
                    return (
                      <Pressable
                        key={`${e.at}-${e.kind}-${i}`}
                        disabled={!canOpen}
                        onPress={() => canOpen && router.push(`/(admin)/organizations/${e.organization_id}` as any)}
                        style={({ pressed }) => [styles.row, i > 0 && styles.rowBorder, pressed && canOpen && styles.rowPressed]}
                      >
                        <View style={[styles.icon, { backgroundColor: soft }]}>
                          <Feather name={k.icon} size={15} color={color} />
                        </View>
                        <View style={{ flex: 1, minWidth: 0 }}>
                          <Text style={[styles.rowTitle, negative && { color: colors.danger }]}>{headline(e)}</Text>
                          {sub ? <Text style={styles.rowSub}>{sub}</Text> : null}
                          {e.actor ? <Text style={styles.rowActor}>par {e.actor}</Text> : null}
                        </View>
                        <View style={styles.rowEnd}>
                          <Text style={styles.time}>{timeLabel(e.at)}</Text>
                          {canOpen ? <Feather name="chevron-right" size={14} color={colors.textMuted} /> : null}
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}
            {hasMore ? (
              <Pressable onPress={loadMore} disabled={loadingMore} style={styles.more}>
                <Text style={styles.moreText}>{loadingMore ? 'Chargement…' : 'Afficher plus'}</Text>
              </Pressable>
            ) : null}
          </View>
        )}
        </View>
    </AdminPage>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  title: {
    ...displayType,
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
  },
  hint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    lineHeight: 18,
    marginTop: 4,
    maxWidth: 640,
  },
  todayRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  todayLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginRight: 2,
  },
  todayPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  todayPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primarySoft,
  },
  chipText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.textMuted,
  },
  chipTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  day: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.textMuted,
    paddingHorizontal: 2,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  rowPressed: {
    backgroundColor: colors.bg,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  rowSub: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 17,
  },
  rowActor: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  rowEnd: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  time: {
    fontSize: 11.5,
    fontWeight: '600',
    color: colors.textMuted,
    fontVariant: ['tabular-nums'],
  },
  more: {
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  moreText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
});
