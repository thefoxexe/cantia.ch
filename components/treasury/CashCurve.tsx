import { useMemo, useState } from 'react';
import { Platform, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import { niceTicks, type CurvePoint } from '../../lib/treasury/curve';
import { colors, fontSize, spacing } from '../../lib/theme';

// The balance over time: past (solid), expected (dashed, same colour: same
// series), cautious — outflows only — (dashed, slate), the zero line and
// today. Hover (web) or drag (touch) shows the values of the day.

export interface CashCurveCopy {
  today: string;
  history: string;
  expected: string;
  cautious: string;
  balance: string;
}

const H = 260;
const PAD = { top: 16, right: 16, bottom: 28, left: 56 };

function chfShort(n: number): string {
  const a = Math.abs(n);
  const s = a >= 1_000_000 ? `${(a / 1_000_000).toFixed(1).replace('.0', '')}M` : a >= 1000 ? `${Math.round(a / 1000)}k` : String(Math.round(a));
  return `${n < 0 ? '−' : ''}${s}`;
}

export function chfFull(n: number): string {
  const [int, dec] = Math.abs(n).toFixed(2).split('.');
  return `${n < 0 ? '−' : ''}${int.replace(/\B(?=(\d{3})+(?!\d))/g, '’')}.${dec}`;
}

const dayMs = (iso: string) => Date.parse(`${iso}T00:00:00Z`);

export function CashCurve({
  history,
  expected,
  cautious,
  today,
  locale,
  copy,
}: {
  history: CurvePoint[];
  expected: CurvePoint[];
  cautious: CurvePoint[];
  today: string;
  locale: string;
  copy: CashCurveCopy;
}) {
  const [width, setWidth] = useState(0);
  const [hover, setHover] = useState<string | null>(null);
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const all = [...history, ...expected, ...cautious];
  const first = all.length ? all.reduce((m, p) => (p.date < m ? p.date : m), all[0].date) : today;
  const last = all.length ? all.reduce((m, p) => (p.date > m ? p.date : m), all[0].date) : today;
  const values = all.map((p) => p.balance);
  const ticks = niceTicks(Math.min(0, ...values), Math.max(0, ...values));
  const yMin = ticks[0];
  const yMax = ticks[ticks.length - 1];
  const plotW = Math.max(10, width - PAD.left - PAD.right);
  const plotH = H - PAD.top - PAD.bottom;
  const x = (iso: string) => PAD.left + ((dayMs(iso) - dayMs(first)) / Math.max(1, dayMs(last) - dayMs(first))) * plotW;
  const y = (v: number) => PAD.top + (1 - (v - yMin) / Math.max(1, yMax - yMin)) * plotH;
  const path = (pts: CurvePoint[]) => pts.map((p, i) => `${i ? 'L' : 'M'}${x(p.date).toFixed(1)},${y(p.balance).toFixed(1)}`).join(' ');
  const area = history.length > 1 ? `${path(history)} L${x(history[history.length - 1].date).toFixed(1)},${y(yMin)} L${x(history[0].date).toFixed(1)},${y(yMin)} Z` : '';

  // Month labels on the X axis: the 1st of each month in range.
  const months = useMemo(() => {
    const out: { iso: string; label: string }[] = [];
    const d = new Date(`${first}T00:00:00Z`);
    d.setUTCDate(1);
    d.setUTCMonth(d.getUTCMonth() + 1);
    while (d.toISOString().slice(0, 10) <= last) {
      const iso = d.toISOString().slice(0, 10);
      out.push({ iso, label: d.toLocaleDateString(`${locale}-CH`, { month: 'short', timeZone: 'UTC' }).replace('.', '') });
      d.setUTCMonth(d.getUTCMonth() + 1);
    }
    return out;
  }, [first, last, locale]);
  const monthStep = Math.max(1, Math.ceil(months.length / Math.max(1, Math.floor(plotW / 56))));

  const byDate = useMemo(() => {
    const m = new Map<string, { h?: number; e?: number; c?: number }>();
    for (const p of history) m.set(p.date, { ...(m.get(p.date) ?? {}), h: p.balance });
    for (const p of expected) m.set(p.date, { ...(m.get(p.date) ?? {}), e: p.balance });
    for (const p of cautious) m.set(p.date, { ...(m.get(p.date) ?? {}), c: p.balance });
    return m;
  }, [history, expected, cautious]);

  function pick(px: number) {
    if (!width) return;
    const ratio = Math.min(1, Math.max(0, (px - PAD.left) / plotW));
    const t = dayMs(first) + ratio * (dayMs(last) - dayMs(first));
    const iso = new Date(Math.round(t / 86400000) * 86400000).toISOString().slice(0, 10);
    // Snap to the closest day that has a value.
    let best: string | null = null;
    let bestD = Infinity;
    for (const k of byDate.keys()) {
      const dd = Math.abs(dayMs(k) - dayMs(iso));
      if (dd < bestD) {
        bestD = dd;
        best = k;
      }
    }
    setHover(best);
  }

  const hv = hover ? byDate.get(hover) : null;
  const hoverX = hover ? x(hover) : 0;
  const interaction =
    Platform.OS === 'web'
      ? {
          onPointerMove: (e: any) => pick(e.nativeEvent.offsetX ?? e.nativeEvent.locationX),
          onPointerLeave: () => setHover(null),
        }
      : {
          onStartShouldSetResponder: () => true,
          onMoveShouldSetResponder: () => true,
          onResponderGrant: (e: any) => pick(e.nativeEvent.locationX),
          onResponderMove: (e: any) => pick(e.nativeEvent.locationX),
          onResponderRelease: () => setHover(null),
        };

  const zeroInRange = yMin < 0 && yMax > 0;

  return (
    <View>
      <View style={styles.legend}>
        <LegendItem color={colors.primary} label={copy.history} />
        <LegendItem color={colors.primary} dashed label={copy.expected} />
        <LegendItem color={colors.slate} dashed label={copy.cautious} />
      </View>
      <View onLayout={onLayout} style={{ height: H }} {...(interaction as any)}>
        {width > 0 ? (
          <Svg width={width} height={H}>
            {ticks.map((v) => (
              <Line key={v} x1={PAD.left} x2={width - PAD.right} y1={y(v)} y2={y(v)} stroke={colors.border} strokeWidth={1} />
            ))}
            {ticks.map((v) => (
              <SvgText key={`l${v}`} x={PAD.left - 8} y={y(v) + 4} fontSize={10.5} fill={colors.textMuted} textAnchor="end">
                {chfShort(v)}
              </SvgText>
            ))}
            {months.map((m, i) =>
              i % monthStep === 0 ? (
                <SvgText key={m.iso} x={x(m.iso)} y={H - 8} fontSize={10.5} fill={colors.textMuted} textAnchor="middle">
                  {m.label}
                </SvgText>
              ) : null,
            )}
            {zeroInRange ? <Line x1={PAD.left} x2={width - PAD.right} y1={y(0)} y2={y(0)} stroke={colors.danger} strokeWidth={1} strokeDasharray="4 4" /> : null}
            {area ? <Path d={area} fill={colors.primary} fillOpacity={0.08} /> : null}
            {cautious.length > 1 ? <Path d={path(cautious)} stroke={colors.slate} strokeWidth={2} strokeDasharray="5 5" fill="none" /> : null}
            {expected.length > 1 ? <Path d={path(expected)} stroke={colors.primary} strokeWidth={2} strokeDasharray="6 4" fill="none" /> : null}
            {history.length > 1 ? <Path d={path(history)} stroke={colors.primary} strokeWidth={2} fill="none" /> : null}
            <Line x1={x(today)} x2={x(today)} y1={PAD.top} y2={H - PAD.bottom} stroke={colors.text} strokeWidth={1} strokeOpacity={0.35} />
            <SvgText x={x(today) + 4} y={PAD.top + 10} fontSize={10.5} fill={colors.text} fontWeight="600">
              {copy.today}
            </SvgText>
            {hover && hv ? (
              <>
                <Line x1={hoverX} x2={hoverX} y1={PAD.top} y2={H - PAD.bottom} stroke={colors.text} strokeWidth={1} />
                {hv.h != null ? <Circle cx={hoverX} cy={y(hv.h)} r={4.5} fill={colors.primary} stroke={colors.surface} strokeWidth={2} /> : null}
                {hv.e != null ? <Circle cx={hoverX} cy={y(hv.e)} r={4.5} fill={colors.primary} stroke={colors.surface} strokeWidth={2} /> : null}
                {hv.c != null ? <Circle cx={hoverX} cy={y(hv.c)} r={4.5} fill={colors.slate} stroke={colors.surface} strokeWidth={2} /> : null}
              </>
            ) : null}
            <Rect x={0} y={0} width={width} height={H} fill="transparent" />
          </Svg>
        ) : null}
        {hover && hv && width > 0 ? (
          <View pointerEvents="none" style={[styles.tooltip, hoverX > width / 2 ? { right: width - hoverX + 10 } : { left: hoverX + 10 }]}>
            <Text style={styles.tipDate}>
              {new Date(`${hover}T00:00:00Z`).toLocaleDateString(`${locale}-CH`, { weekday: 'short', day: 'numeric', month: 'long', timeZone: 'UTC' })}
            </Text>
            {hv.h != null ? <TipRow color={colors.primary} label={copy.history} value={hv.h} /> : null}
            {hv.e != null && hover > today ? <TipRow color={colors.primary} dashed label={copy.expected} value={hv.e} /> : null}
            {hv.c != null && hover > today ? <TipRow color={colors.slate} dashed label={copy.cautious} value={hv.c} /> : null}
            {hv.h == null && hv.e != null && hover === today ? <TipRow color={colors.primary} label={copy.balance} value={hv.e} /> : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}

function LegendItem({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <View style={styles.legendItem}>
      <Svg width={22} height={8}>
        <Line x1={1} x2={21} y1={4} y2={4} stroke={color} strokeWidth={2} strokeDasharray={dashed ? '5 3' : undefined} />
      </Svg>
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

function TipRow({ color, label, value, dashed }: { color: string; label: string; value: number; dashed?: boolean }) {
  return (
    <View style={styles.tipRow}>
      <Svg width={14} height={6}>
        <Line x1={0} x2={14} y1={3} y2={3} stroke={color} strokeWidth={2} strokeDasharray={dashed ? '4 2' : undefined} />
      </Svg>
      <Text style={styles.tipLabel}>{label}</Text>
      <Text style={[styles.tipValue, value < 0 && { color: colors.danger }]}>CHF {chfFull(value)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.sm },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendText: { fontSize: fontSize.xs, color: colors.text },
  tooltip: { position: 'absolute', top: 8, minWidth: 200, padding: spacing.sm, borderRadius: 6, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, gap: 4, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8 },
  tipDate: { fontSize: fontSize.xs, fontWeight: '700', color: colors.text },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tipLabel: { flex: 1, fontSize: fontSize.xs, color: colors.textMuted },
  tipValue: { fontSize: fontSize.xs, fontWeight: '700', color: colors.text, fontVariant: ['tabular-nums'] },
});
