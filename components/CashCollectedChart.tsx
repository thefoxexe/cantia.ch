import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { colors, fontSize, radius, spacing } from '../lib/theme';
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

const CHART_HEIGHT = 140;
const BAR_GAP = 6;
const MAX_MONTHS = 12;

export function CashCollectedChart({ points }: { points: AdminRevenueTimeseriesPoint[] }) {
  const months = useMemo(() => bucketByMonth(points).slice(-MAX_MONTHS), [points]);
  const [selected, setSelected] = useState<number | null>(null);

  const max = Math.max(...months.map((m) => m.total), 1);
  const activeIndex = selected ?? months.length - 1;
  const active = months[activeIndex];
  const prev = activeIndex > 0 ? months[activeIndex - 1] : null;
  const delta = active && prev ? active.total - prev.total : null;

  if (months.length === 0) {
    return <Text style={styles.emptyText}>Pas encore de donnée pour ce graphique.</Text>;
  }

  const barWidth = 100 / months.length;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerLabel}>{active.fullLabel}</Text>
          <Text style={styles.headerValue}>{formatChf(active.total)}</Text>
        </View>
        {delta !== null ? (
          <View style={[styles.deltaChip, delta >= 0 ? styles.deltaChipUp : styles.deltaChipDown]}>
            <Text style={[styles.deltaChipText, { color: delta >= 0 ? colors.success : colors.danger }]}>
              {delta >= 0 ? '+' : '−'}
              {formatChf(Math.abs(delta))} vs {prev!.label}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.barRow}>
        {months.map((m, i) => {
          const heightPct = Math.max(4, (m.total / max) * 100);
          const isActive = i === activeIndex;
          return (
            <Pressable
              key={m.key}
              style={[styles.barSlot, { width: `${barWidth}%` }]}
              onPress={() => setSelected(i)}
            >
              <View style={styles.barTrack}>
                <Svg width="100%" height={CHART_HEIGHT} viewBox="0 0 100 100" preserveAspectRatio="none">
                  <Rect
                    x={BAR_GAP / 2}
                    y={100 - heightPct}
                    width={100 - BAR_GAP}
                    height={heightPct}
                    rx={4}
                    fill={isActive ? colors.success : `${colors.success}55`}
                  />
                </Svg>
              </View>
              <Text style={[styles.barLabel, isActive && styles.barLabelActive]} numberOfLines={1}>
                {m.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.hint}>Touchez un mois pour voir le détail.</Text>
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
  barRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: CHART_HEIGHT,
  },
  barSlot: {
    height: '100%',
    alignItems: 'center',
  },
  barTrack: {
    flex: 1,
    width: '100%',
  },
  barLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '600',
    marginTop: spacing.xs,
    textTransform: 'capitalize',
  },
  barLabelActive: {
    color: colors.success,
    fontWeight: '800',
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
