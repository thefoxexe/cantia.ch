import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { colors, fontSize, radius, spacing } from '../lib/theme';
import { useMeasuredWidth } from './charts/useMeasuredWidth';
import { ChartTooltip } from './charts/ChartTooltip';
import type { AdminRevenueTimeseriesPoint } from '../lib/types';

interface MonthBar {
  key: string; // YYYY-MM
  label: string; // "Sept. 25"
  fullLabel: string; // "Septembre 2025"
  total: number;
}

function monthLabel(key: string, style: 'short' | 'full'): string {
  const d = new Date(`${key}-01T00:00:00Z`);
  return d.toLocaleDateString('fr-CH', style === 'short' ? { month: 'short', year: '2-digit' } : { month: 'long', year: 'numeric' });
}

// Daily revenue_chf points bucketed into calendar months — the real
// question this answers ("how much came in, month over month") lives at
// that grain; a daily bar chart over any real history is unreadable and a
// smooth daily line already covers "the trend" in GrowthChart above this.
function bucketByMonth(points: AdminRevenueTimeseriesPoint[]): MonthBar[] {
  const totals = new Map<string, number>();
  for (const p of points) {
    const key = p.date.slice(0, 7);
    totals.set(key, (totals.get(key) ?? 0) + Number(p.revenue_chf));
  }
  return Array.from(totals.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, total]) => ({ key, total, label: monthLabel(key, 'short'), fullLabel: monthLabel(key, 'full') }));
}

function formatChf(amount: number): string {
  return new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF', maximumFractionDigits: 0 }).format(amount);
}

const CHART_HEIGHT = 150;
const MAX_MONTHS = 12;

export function CashCollectedChart({ points }: { points: AdminRevenueTimeseriesPoint[] }) {
  const months = useMemo(() => bucketByMonth(points).slice(-MAX_MONTHS), [points]);
  const [onLayout, width] = useMeasuredWidth();

  const latest = months[months.length - 1];
  const previous = months.length > 1 ? months[months.length - 2] : null;
  const delta = latest && previous ? latest.total - previous.total : null;

  if (months.length === 0) {
    return <Text style={styles.emptyText}>Pas encore de donnée pour ce graphique.</Text>;
  }

  const data = months.map((m) => ({ value: m.total, label: m.label, fullLabel: m.fullLabel }));

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerLabel}>{latest.fullLabel}</Text>
          <Text style={styles.headerValue}>{formatChf(latest.total)}</Text>
        </View>
        {delta !== null ? (
          <View style={[styles.deltaChip, delta >= 0 ? styles.deltaChipUp : styles.deltaChipDown]}>
            <Text style={[styles.deltaChipText, { color: delta >= 0 ? colors.success : colors.danger }]}>
              {delta >= 0 ? '+' : '−'}
              {formatChf(Math.abs(delta))} vs {previous!.label}
            </Text>
          </View>
        ) : null}
      </View>

      <View onLayout={onLayout} style={{ height: CHART_HEIGHT + 30 }}>
        {width > 0 ? (
          <BarChart
            data={data as any}
            width={width}
            height={CHART_HEIGHT}
            barWidth={Math.min(46, width / (months.length * 2.2))}
            adjustToWidth
            disableScroll
            initialSpacing={0}
            endSpacing={0}
            barBorderTopLeftRadius={6}
            barBorderTopRightRadius={6}
            frontColor={colors.success}
            hideRules
            hideYAxisText
            yAxisThickness={0}
            xAxisThickness={0}
            xAxisLabelTextStyle={styles.barLabel}
            isAnimated
            animationDuration={350}
            pointerConfig={{
              pointerStripHeight: CHART_HEIGHT,
              pointerStripColor: colors.border,
              pointerStripWidth: 1,
              pointerColor: colors.success,
              radius: 4,
              activatePointersInstantlyOnTouch: true,
              autoAdjustPointerLabelPosition: true,
              pointerLabelWidth: 130,
              pointerLabelHeight: 54,
              pointerLabelComponent: (items: any[]) => (
                <ChartTooltip value={items[0].value} dateLabel={items[0].fullLabel} color={colors.success} formatValue={formatChf} />
              ),
            }}
          />
        ) : null}
      </View>
      <Text style={styles.hint}>Cliquez-glissez sur le graphique pour explorer chaque mois.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  headerLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'capitalize',
  },
  headerValue: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
    fontVariant: ['tabular-nums'],
    marginTop: 2,
  },
  deltaChip: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  deltaChipUp: {
    backgroundColor: colors.successSoft,
  },
  deltaChipDown: {
    backgroundColor: colors.dangerSoft,
  },
  deltaChipText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  barLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
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
  },
});
