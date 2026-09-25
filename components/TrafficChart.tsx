import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { colors, fontSize, radius, spacing } from '../lib/theme';
import { buildSmoothPath } from '../lib/chartPath';
import type { AdminTrafficTimeseriesPoint } from '../lib/types';

type Period = '7d' | '30d' | '60d';
type SeriesKey = 'visits' | 'unique_visitors' | 'ads_visits' | 'signups';

const PERIODS: { key: Period; label: string; days: number }[] = [
  { key: '7d', label: '7 jours', days: 7 },
  { key: '30d', label: '30 jours', days: 30 },
  { key: '60d', label: '60 jours', days: 60 },
];

const SERIES: { key: SeriesKey; label: string; color: string }[] = [
  { key: 'visits', label: 'Visites', color: colors.primary },
  { key: 'unique_visitors', label: 'Visiteurs uniques', color: colors.accent },
  { key: 'ads_visits', label: 'Clics Google Ads', color: colors.success },
  { key: 'signups', label: 'Inscriptions', color: colors.warning },
];

const VIEW_WIDTH = 300;
const CHART_HEIGHT = 110;

function formatDayLabel(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('fr-CH', { day: 'numeric', month: 'short' });
}

function LineSeries({ points, seriesKey, color }: { points: AdminTrafficTimeseriesPoint[]; seriesKey: SeriesKey; color: string }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [layoutWidth, setLayoutWidth] = useState(VIEW_WIDTH);
  const values = points.map((p) => Number(p[seriesKey]));
  const max = Math.max(...values, 1);
  const padY = 8;
  const usableHeight = CHART_HEIGHT - padY * 2;
  const stepX = points.length > 1 ? VIEW_WIDTH / (points.length - 1) : 0;

  const coords = values.map((v, i) => ({
    x: i * stepX,
    y: padY + usableHeight - (v / max) * usableHeight,
  }));
  const last = coords[coords.length - 1];
  const gradientId = `traffic-${seriesKey}`;
  const active = hoverIndex !== null ? hoverIndex : coords.length - 1;
  const activePoint = points[active];
  const activeCoord = coords[active];

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
    <View>
      <View style={styles.seriesHeader}>
        <Text style={[styles.seriesLabel, { color }]}>{SERIES.find((s) => s.key === seriesKey)?.label}</Text>
        <Text style={styles.hoverValue}>
          {Number(activePoint[seriesKey]).toLocaleString('fr-CH')}
          <Text style={styles.hoverDate}>  ·  {formatDayLabel(activePoint.date)}</Text>
        </Text>
      </View>
      <View
        style={styles.chartRow}
        onLayout={(e) => setLayoutWidth(e.nativeEvent.layout.width)}
        // Lets a finger/mouse sweep the chart and see each day's value,
        // instead of only ever showing the last point — onLayout's width is
        // the real rendered width, cross-platform (unlike DOM offsetWidth).
        onStartShouldSetResponder={() => true}
        onResponderMove={(e) => {
          const { locationX } = e.nativeEvent;
          const ratio = Math.min(1, Math.max(0, locationX / layoutWidth));
          const idx = Math.round(ratio * (points.length - 1));
          setHoverIndex(idx);
        }}
        onResponderRelease={() => setHoverIndex(null)}
      >
        <Svg width="100%" height={CHART_HEIGHT} viewBox={`0 0 ${VIEW_WIDTH} ${CHART_HEIGHT}`} preserveAspectRatio="none">
          <Defs>
            <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={color} stopOpacity={0.22} />
              <Stop offset="1" stopColor={color} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <Path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />
          <Path d={linePath} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          {hoverIndex !== null ? (
            <Path d={`M ${activeCoord.x} 0 L ${activeCoord.x} ${CHART_HEIGHT}`} stroke={colors.border} strokeWidth={1} />
          ) : null}
          <Circle cx={activeCoord.x} cy={activeCoord.y} r={hoverIndex !== null ? 4.5 : 3.5} fill={color} />
        </Svg>
      </View>
    </View>
  );
}

export function TrafficChart({ points }: { points: AdminTrafficTimeseriesPoint[] }) {
  const [period, setPeriod] = useState<Period>('30d');
  const [active, setActive] = useState<Record<SeriesKey, boolean>>({
    visits: true,
    unique_visitors: true,
    ads_visits: false,
    signups: false,
  });

  const days = PERIODS.find((p) => p.key === period)!.days;
  const filtered = useMemo(() => points.slice(-days), [points, days]);
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
  hoverValue: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  hoverDate: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
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
