import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { colors, fontSize, radius, spacing } from '../lib/theme';
import { useMeasuredWidth } from './charts/useMeasuredWidth';
import { ChartTooltip } from './charts/ChartTooltip';
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

function formatChf(v: number): string {
  return new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF', maximumFractionDigits: 0 }).format(v);
}
function formatCount(v: number): string {
  return v.toLocaleString('fr-CH');
}

const SERIES: { key: SeriesKey; label: string; color: string; formatValue: (v: number) => string }[] = [
  { key: 'mrr', label: 'MRR', color: colors.primary, formatValue: formatChf },
  { key: 'signups', label: 'Inscriptions', color: colors.accent, formatValue: formatCount },
  { key: 'revenue', label: 'CA encaissé', color: colors.success, formatValue: formatChf },
  { key: 'paying', label: 'Clients payants (cumulé)', color: colors.warning, formatValue: formatCount },
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

const CHART_HEIGHT = 120;

function LineSeries({ points, seriesKey, color, formatValue }: { points: AdminRevenueTimeseriesPoint[]; seriesKey: SeriesKey; color: string; formatValue: (v: number) => string }) {
  const [onLayout, width] = useMeasuredWidth();
  const field = SERIES_FIELD[seriesKey];
  const data = points.map((p) => ({ value: Number(p[field]), label: '', dateLabel: formatDayLabel(p.date) }));
  const last = points[points.length - 1];

  return (
    <View>
      <View style={styles.seriesHeader}>
        <Text style={[styles.seriesLabel, { color }]}>{SERIES.find((s) => s.key === seriesKey)?.label}</Text>
        <Text style={styles.latestValue}>{formatValue(Number(last[field]))}</Text>
      </View>
      <View onLayout={onLayout} style={{ height: CHART_HEIGHT }}>
        {width > 0 ? (
          <LineChart
            data={data as any}
            width={width}
            height={CHART_HEIGHT}
            curved
            areaChart
            color={color}
            thickness={2.5}
            startFillColor={color}
            endFillColor={color}
            startOpacity={0.2}
            endOpacity={0}
            hideDataPoints={data.length > 1}
            dataPointsRadius={3.5}
            dataPointsColor={color}
            hideAxesAndRules
            hideYAxisText
            yAxisThickness={0}
            xAxisThickness={0}
            initialSpacing={0}
            endSpacing={0}
            adjustToWidth
            disableScroll
            isAnimated
            animationDuration={350}
            pointerConfig={{
              pointerStripHeight: CHART_HEIGHT,
              pointerStripColor: colors.border,
              pointerStripWidth: 1,
              pointerColor: color,
              radius: 4,
              activatePointersInstantlyOnTouch: true,
              autoAdjustPointerLabelPosition: true,
              pointerLabelWidth: 110,
              pointerLabelHeight: 54,
              pointerLabelComponent: (items: any[]) => (
                <ChartTooltip value={items[0].value} dateLabel={items[0].dateLabel} color={color} formatValue={formatValue} />
              ),
            }}
          />
        ) : null}
      </View>
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
              <LineSeries points={filtered} seriesKey={s.key} color={s.color} formatValue={s.formatValue} />
            </View>
          ))}
          <View style={styles.axisRow}>
            <Text style={styles.axisLabel}>{formatDayLabel(filtered[0].date)}</Text>
            {filtered.length > 1 ? <Text style={styles.axisLabel}>{formatDayLabel(filtered[filtered.length - 1].date)}</Text> : null}
          </View>
          <Text style={styles.hint}>Cliquez-glissez sur une courbe pour explorer chaque jour.</Text>
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
  seriesHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  seriesLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  latestValue: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: colors.text,
    fontVariant: ['tabular-nums'],
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
  hint: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
});
