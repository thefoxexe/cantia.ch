import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, radius, spacing } from '../lib/theme';
import type { AdminRevenueTimeseriesPoint } from '../lib/types';

type Period = 'today' | '7d' | 'month' | 'all';
type SeriesKey = 'signups' | 'revenue' | 'paying';
const SERIES_FIELD: Record<SeriesKey, keyof AdminRevenueTimeseriesPoint> = {
  signups: 'signups',
  revenue: 'revenue_chf',
  paying: 'paying_cumulative',
};

const PERIODS: { key: Period; label: string }[] = [
  { key: 'today', label: "Aujourd'hui" },
  { key: '7d', label: '7 jours' },
  { key: 'month', label: 'Ce mois' },
  { key: 'all', label: 'Depuis toujours' },
];

const SERIES: { key: SeriesKey; label: string; color: string }[] = [
  { key: 'signups', label: 'Inscriptions', color: colors.primary },
  { key: 'revenue', label: 'CA encaissé', color: colors.success },
  { key: 'paying', label: 'Clients payants (cumulé)', color: colors.warning },
];

function filterByPeriod(points: AdminRevenueTimeseriesPoint[], period: Period): AdminRevenueTimeseriesPoint[] {
  if (points.length === 0) return [];
  if (period === 'today') return points.slice(-1);
  if (period === '7d') return points.slice(-7);
  if (period === 'month') {
    const monthPrefix = points[points.length - 1].date.slice(0, 7);
    return points.filter((p) => p.date.startsWith(monthPrefix));
  }
  return points;
}

function formatDayLabel(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('fr-CH', { day: 'numeric', month: 'short' });
}

function Bars({ points, seriesKey, color }: { points: AdminRevenueTimeseriesPoint[]; seriesKey: SeriesKey; color: string }) {
  const field = SERIES_FIELD[seriesKey];
  const values = points.map((p) => Number(p[field]));
  const max = Math.max(1, ...values);
  return (
    <View style={styles.chartRow}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.barsTrack}>
        {points.map((p) => (
          <View key={p.date} style={styles.barSlot}>
            <View style={[styles.bar, { height: Math.max(2, (Number(p[field]) / max) * 100), backgroundColor: color }]} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

export function GrowthChart({ points }: { points: AdminRevenueTimeseriesPoint[] }) {
  const [period, setPeriod] = useState<Period>('month');
  const [active, setActive] = useState<Record<SeriesKey, boolean>>({ signups: true, revenue: true, paying: false });

  const filtered = useMemo(() => filterByPeriod(points, period), [points, period]);
  const activeSeries = SERIES.filter((s) => active[s.key]);

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
        {PERIODS.map((p) => (
          <Pressable key={p.key} style={[styles.periodChip, period === p.key && styles.periodChipActive]} onPress={() => setPeriod(p.key)}>
            <Text style={[styles.periodChipText, period === p.key && styles.periodChipTextActive]}>{p.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
        {SERIES.map((s) => {
          const on = active[s.key];
          return (
            <Pressable
              key={s.key}
              style={[styles.seriesChip, on && { backgroundColor: `${s.color}22`, borderColor: s.color }]}
              onPress={() => setActive((prev) => ({ ...prev, [s.key]: !prev[s.key] }))}
            >
              <View style={[styles.seriesDot, { backgroundColor: on ? s.color : colors.border }]} />
              <Text style={[styles.seriesChipText, on && { color: s.color }]}>{s.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {filtered.length === 0 ? (
        <Text style={styles.emptyText}>Pas encore de donnée sur cette période.</Text>
      ) : activeSeries.length === 0 ? (
        <Text style={styles.emptyText}>Choisis au moins une courbe ci-dessus.</Text>
      ) : (
        <View style={styles.chartCard}>
          {activeSeries.map((s) => (
            <View key={s.key} style={{ marginBottom: spacing.md }}>
              <Text style={[styles.seriesLabel, { color: s.color }]}>{s.label}</Text>
              <Bars points={filtered} seriesKey={s.key} color={s.color} />
            </View>
          ))}
          <View style={styles.axisRow}>
            <Text style={styles.axisLabel}>{formatDayLabel(filtered[0].date)}</Text>
            {filtered.length > 1 ? <Text style={styles.axisLabel}>{formatDayLabel(filtered[filtered.length - 1].date)}</Text> : null}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  chipRow: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  periodChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  periodChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  periodChipText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textMuted,
  },
  periodChipTextActive: {
    color: '#fff',
  },
  seriesChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  seriesDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  seriesChipText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textMuted,
  },
  chartCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.sm,
  },
  seriesLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  chartRow: {
    height: 100,
  },
  barsTrack: {
    alignItems: 'flex-end',
    gap: 3,
    height: 100,
  },
  barSlot: {
    width: 8,
    height: 100,
    justifyContent: 'flex-end',
  },
  bar: {
    width: 8,
    borderRadius: 2,
  },
  axisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  axisLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
});
