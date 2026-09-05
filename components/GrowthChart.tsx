import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { colors, fontSize, radius, spacing } from '../lib/theme';
import { buildSmoothPath } from '../lib/chartPath';
import type { AdminRevenueTimeseriesPoint } from '../lib/types';

type Period = 'today' | '7d' | 'month' | 'all';
type SeriesKey = 'mrr' | 'signups' | 'revenue' | 'paying';
const SERIES_FIELD: Record<SeriesKey, keyof AdminRevenueTimeseriesPoint> = {
  mrr: 'mrr_chf',
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
  { key: 'mrr', label: 'MRR', color: colors.primary },
  { key: 'signups', label: 'Inscriptions', color: colors.accent },
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

// Fixed viewBox width — the real pixel width comes from the layout
// (width="100%"); this is only the coordinate space the path math runs in.
const VIEW_WIDTH = 300;
const CHART_HEIGHT = 100;

function LineSeries({ points, seriesKey, color }: { points: AdminRevenueTimeseriesPoint[]; seriesKey: SeriesKey; color: string }) {
  const field = SERIES_FIELD[seriesKey];
  const values = points.map((p) => Number(p[field]));
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = Math.max(1, max - min);
  const padY = 6;
  const usableHeight = CHART_HEIGHT - padY * 2;
  const stepX = points.length > 1 ? VIEW_WIDTH / (points.length - 1) : 0;

  const coords = values.map((v, i) => ({
    x: i * stepX,
    y: padY + usableHeight - ((v - min) / range) * usableHeight,
  }));
  const last = coords[coords.length - 1];
  const gradientId = `growth-${seriesKey}`;

  if (coords.length < 2) {
    return (
      <View style={styles.chartRow}>
        <Svg width="100%" height={CHART_HEIGHT} viewBox={`0 0 ${VIEW_WIDTH} ${CHART_HEIGHT}`}>
          <Circle cx={last.x} cy={last.y} r={3.5} fill={color} />
        </Svg>
      </View>
    );
  }

  const linePath = buildSmoothPath(coords);
  const areaPath = `${linePath} L ${last.x} ${CHART_HEIGHT} L ${coords[0].x} ${CHART_HEIGHT} Z`;

  return (
    <View style={styles.chartRow}>
      <Svg width="100%" height={CHART_HEIGHT} viewBox={`0 0 ${VIEW_WIDTH} ${CHART_HEIGHT}`} preserveAspectRatio="none">
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity={0.2} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />
        <Path d={linePath} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx={last.x} cy={last.y} r={3.5} fill={color} />
      </Svg>
    </View>
  );
}

export function GrowthChart({ points }: { points: AdminRevenueTimeseriesPoint[] }) {
  const [period, setPeriod] = useState<Period>('all');
  const [active, setActive] = useState<Record<SeriesKey, boolean>>({ mrr: true, signups: false, revenue: false, paying: false });

  const filtered = useMemo(() => filterByPeriod(points, period), [points, period]);
  const activeSeries = SERIES.filter((s) => active[s.key]);

  return (
    <View>
      {/* flexWrap rows, not horizontal ScrollViews — nested inside the
          page's outer vertical ScrollView, a horizontal scroller captured
          the touch/wheel gesture wherever it started over a chip and made
          the page feel "stuck" mid-scroll on mobile. */}
      <View style={styles.chipRow}>
        {PERIODS.map((p) => (
          <Pressable key={p.key} style={[styles.periodChip, period === p.key && styles.periodChipActive]} onPress={() => setPeriod(p.key)}>
            <Text style={[styles.periodChipText, period === p.key && styles.periodChipTextActive]}>{p.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.chipRow}>
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
      </View>

      {filtered.length === 0 ? (
        <Text style={styles.emptyText}>Pas encore de donnée sur cette période.</Text>
      ) : activeSeries.length === 0 ? (
        <Text style={styles.emptyText}>Choisis au moins une courbe ci-dessus.</Text>
      ) : (
        <View style={styles.chartCard}>
          {activeSeries.map((s) => (
            <View key={s.key} style={{ marginBottom: spacing.md }}>
              <Text style={[styles.seriesLabel, { color: s.color }]}>{s.label}</Text>
              <LineSeries points={filtered} seriesKey={s.key} color={s.color} />
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
    flexDirection: 'row',
    flexWrap: 'wrap',
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
    height: CHART_HEIGHT,
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
