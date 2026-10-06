import { useEffect, useMemo, useRef, useState } from 'react';
import { PanResponder, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Feather } from '@expo/vector-icons';
import { addDays, crossesNonWorking, daysBetween, isWorkday, type Rolled, type ScheduleItem, type ScheduleLink } from '../../lib/schedule/calc';
import { fill, shortDate, type ScheduleCopy } from '../../lib/schedule/copy';
import { colors, fontSize, radius, spacing } from '../../lib/theme';

// Planning de chantier: hierarchy on the left (name, trade, dates, duration,
// status), time on the right (one bar per line, phases spanning their tasks,
// milestones as diamonds, today line, progress inside the bar, late lines
// in red, finish → start arrows). On a computer a bar can be dragged to move
// the task and stretched by its right edge to change its length.

export type Zoom = 'day' | 'week' | 'month';
export interface GanttRow {
  item: ScheduleItem;
  depth: number;
  hasChildren: boolean;
}

const ROW = 36;
const HEAD = 48;
const DAY_PX: Record<Zoom, number> = { day: 30, week: 14, month: 4.5 };
const COLS = { name: 250, trade: 130, start: 70, end: 70, dur: 58, status: 92 };
export const TABLE_W = Object.values(COLS).reduce((a, b) => a + b, 0);

// Steady colour per corps de métier.
const PALETTE = ['#B4532A', '#2F6F8F', '#5B7F3A', '#8A5A9E', '#C08A1E', '#3E8C84', '#A0465C', '#4F6BB5', '#7A6A4F', '#2E7D5B'];
export function tradeColor(trade: string | null): string {
  if (!trade) return '#7C8A86';
  let h = 0;
  for (const ch of trade) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

export function GanttView({
  c,
  rows,
  rolled,
  links,
  zoom,
  today,
  workdays,
  showArrows,
  editable,
  collapsed,
  conflicts,
  onToggle,
  onOpen,
  onMove,
  scrollToToday,
}: {
  c: ScheduleCopy;
  rows: GanttRow[];
  rolled: Map<string, Rolled>;
  links: ScheduleLink[];
  zoom: Zoom;
  today: string;
  workdays: number[];
  showArrows: boolean;
  editable: boolean;
  collapsed: Set<string>;
  conflicts: Set<string>;
  onToggle: (id: string) => void;
  onOpen: (item: ScheduleItem) => void;
  onMove: (item: ScheduleItem, start: string, end: string, mode: 'move' | 'resize') => void;
  scrollToToday: number; // bump to scroll
}) {
  const px = DAY_PX[zoom];
  const left = useRef<ScrollView>(null);
  const right = useRef<ScrollView>(null);
  const horiz = useRef<ScrollView>(null);
  const syncing = useRef<'l' | 'r' | null>(null);

  // Time range: a week before the first date to three weeks after the last,
  // from a Monday.
  const range = useMemo(() => {
    const dates = [...rolled.values()].flatMap((r) => [r.start, r.end]).filter(Boolean) as string[];
    const first = dates.length ? dates.sort()[0] : today;
    const last = dates.length ? dates.sort().at(-1)! : addDays(today, 60);
    let start = addDays(first < today ? first : today, -7);
    while (new Date(`${start}T00:00:00Z`).getUTCDay() !== 1) start = addDays(start, -1);
    const end = addDays(last > today ? last : today, zoom === 'month' ? 60 : 21);
    return { start, days: daysBetween(start, end) + 1 };
  }, [rolled, today, zoom]);
  const width = range.days * px;
  const xOf = (date: string) => daysBetween(range.start, date) * px;

  useEffect(() => {
    horiz.current?.scrollTo({ x: Math.max(0, xOf(today) - 160), animated: false });
  }, [scrollToToday, zoom, range.start]);

  const rowIndex = useMemo(() => new Map(rows.map((r, i) => [r.item.id, i])), [rows]);

  const sync = (from: 'l' | 'r', y: number) => {
    if (syncing.current && syncing.current !== from) return;
    syncing.current = from;
    (from === 'l' ? right : left).current?.scrollTo({ y, animated: false });
    requestAnimationFrame(() => (syncing.current = null));
  };

  return (
    <View style={styles.wrap}>
      {/* left: the table */}
      <View style={{ width: TABLE_W, borderRightWidth: 1, borderRightColor: colors.border }}>
        <View style={[styles.head, { flexDirection: 'row', alignItems: 'flex-end', paddingBottom: 8 }]}>
          <Text style={[styles.th, { width: COLS.name, paddingLeft: spacing.md }]}>{c.colName}</Text>
          <Text style={[styles.th, { width: COLS.trade }]}>{c.colTrade}</Text>
          <Text style={[styles.th, { width: COLS.start }]}>{c.colStart}</Text>
          <Text style={[styles.th, { width: COLS.end }]}>{c.colEnd}</Text>
          <Text style={[styles.th, { width: COLS.dur, textAlign: 'right', paddingRight: 8 }]}>{c.colDuration}</Text>
          <Text style={[styles.th, { width: COLS.status }]}>{c.colStatus}</Text>
        </View>
        <ScrollView ref={left} scrollEventThrottle={16} onScroll={(e) => sync('l', e.nativeEvent.contentOffset.y)} showsVerticalScrollIndicator={false}>
          {rows.map(({ item, depth, hasChildren }) => {
            const r = rolled.get(item.id);
            const late = r?.late ?? 0;
            const isPhase = item.kind === 'phase';
            return (
              <Pressable key={item.id} onPress={() => onOpen(item)} style={({ hovered }: any) => [styles.row, isPhase && styles.phaseRow, hovered && { backgroundColor: colors.surfaceAlt }]}>
                <View style={{ width: COLS.name, flexDirection: 'row', alignItems: 'center', paddingLeft: spacing.sm + depth * 16, gap: 4 }}>
                  {hasChildren ? (
                    <Pressable onPress={() => onToggle(item.id)} hitSlop={8}>
                      <Feather name={collapsed.has(item.id) ? 'chevron-right' : 'chevron-down'} size={14} color={colors.textMuted} />
                    </Pressable>
                  ) : (
                    <View style={{ width: 14, alignItems: 'center' }}>{item.kind === 'milestone' ? <View style={styles.diamondSmall} /> : null}</View>
                  )}
                  <Text style={[styles.name, isPhase && { fontWeight: '800' }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  {late ? <Feather name="alert-circle" size={12} color={colors.danger} /> : null}
                  {conflicts.has(item.id) ? <Feather name="link-2" size={12} color={colors.danger} /> : null}
                </View>
                <View style={{ width: COLS.trade, flexDirection: 'row', alignItems: 'center', gap: 6, paddingRight: 6 }}>
                  {item.trade ? <View style={[styles.dot, { backgroundColor: tradeColor(item.trade) }]} /> : null}
                  <Text style={styles.cell} numberOfLines={1}>
                    {item.trade ?? ''}
                  </Text>
                </View>
                <Text style={[styles.cell, styles.mono, { width: COLS.start }]}>{shortDate(r?.start ?? null)}</Text>
                <Text style={[styles.cell, styles.mono, { width: COLS.end }, late ? { color: colors.danger, fontWeight: '700' } : null]}>{shortDate(r?.end ?? null)}</Text>
                <Text style={[styles.cell, styles.mono, { width: COLS.dur, textAlign: 'right', paddingRight: 8 }]}>{item.kind === 'task' && item.duration != null ? `${item.duration} ${c.days}` : ''}</Text>
                <View style={{ width: COLS.status, paddingRight: 8 }}>
                  {isPhase ? (
                    <Text style={[styles.cell, styles.mono]}>{r?.progress ?? 0} %</Text>
                  ) : (
                    <StatusPill c={c} item={item} late={late} />
                  )}
                </View>
              </Pressable>
            );
          })}
          <View style={{ height: 80 }} />
        </ScrollView>
      </View>

      {/* right: the time line */}
      <ScrollView ref={horiz} horizontal style={{ flex: 1 }} contentContainerStyle={{ width }}>
        <View style={{ width }}>
          <TimeHeader c={c} start={range.start} days={range.days} px={px} zoom={zoom} today={today} workdays={workdays} />
          <ScrollView ref={right} scrollEventThrottle={16} onScroll={(e) => sync('r', e.nativeEvent.contentOffset.y)}>
            <View style={{ width, height: rows.length * ROW + 80 }}>
              {/* non-working days and today */}
              {zoom !== 'month'
                ? Array.from({ length: range.days }, (_, i) => addDays(range.start, i))
                    .filter((d) => !isWorkday(d, workdays))
                    .map((d) => <View key={d} style={[styles.offDay, { left: xOf(d), width: px }]} />)
                : null}
              {rows.map((_, i) => (
                <View key={i} style={[styles.gridLine, { top: (i + 1) * ROW - 1 }]} />
              ))}
              <View style={[styles.todayLine, { left: xOf(today) + px / 2 }]} />

              {showArrows ? <Arrows rows={rows} rolled={rolled} links={links} rowIndex={rowIndex} xOf={xOf} px={px} width={width} height={rows.length * ROW} /> : null}

              {rows.map(({ item }, i) => (
                <Bar key={item.id} c={c} item={item} r={rolled.get(item.id)} top={i * ROW} xOf={xOf} px={px} zoom={zoom} workdays={workdays} editable={editable} conflict={conflicts.has(item.id)} onOpen={onOpen} onMove={onMove} />
              ))}
            </View>
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

export function StatusPill({ c, item, late }: { c: ScheduleCopy; item: ScheduleItem; late: number }) {
  const tone =
    item.status === 'done' ? { bg: colors.successSoft, fg: colors.success } : late ? { bg: colors.dangerSoft, fg: colors.danger } : item.status === 'blocked' ? { bg: colors.dangerSoft, fg: colors.danger } : item.status === 'in_progress' ? { bg: colors.primarySoft, fg: colors.primaryDark } : { bg: colors.surfaceAlt, fg: colors.textMuted };
  return (
    <View style={[styles.pill, { backgroundColor: tone.bg }]}>
      <Text style={[styles.pillText, { color: tone.fg }]} numberOfLines={1}>
        {late && item.status !== 'done' ? fill(c.daysLate, { n: late }) : item.status === 'in_progress' ? `${item.progress} %` : c.status[item.status]}
      </Text>
    </View>
  );
}

function TimeHeader({ c, start, days, px, zoom, today, workdays }: { c: ScheduleCopy; start: string; days: number; px: number; zoom: Zoom; today: string; workdays: number[] }) {
  const all = Array.from({ length: days }, (_, i) => addDays(start, i));
  const months = all.filter((d, i) => i === 0 || d.endsWith('-01'));
  const weeks = all.filter((d) => new Date(`${d}T00:00:00Z`).getUTCDay() === 1);
  const weekNo = (d: string) => {
    const t = new Date(`${d}T00:00:00Z`);
    const day = (t.getUTCDay() + 6) % 7;
    t.setUTCDate(t.getUTCDate() - day + 3);
    const firstThursday = new Date(Date.UTC(t.getUTCFullYear(), 0, 4));
    return 1 + Math.round(((t.getTime() - firstThursday.getTime()) / 86_400_000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7);
  };
  return (
    <View style={[styles.head, { width: days * px }]}>
      {months.map((m) => (
        <Text key={m} style={[styles.month, { left: daysBetween(start, m) * px + 6 }]} numberOfLines={1}>
          {c.months[Number(m.slice(5, 7)) - 1]} {m.slice(0, 4)}
        </Text>
      ))}
      {zoom === 'day'
        ? all.map((d) => (
            <Text key={d} style={[styles.dayNum, { left: daysBetween(start, d) * px, width: px }, !isWorkday(d, workdays) && { color: colors.textMuted }, d === today && { color: colors.danger, fontWeight: '800' }]}>
              {Number(d.slice(8, 10))}
            </Text>
          ))
        : null}
      {zoom === 'week'
        ? weeks.map((d) => (
            <Text key={d} style={[styles.dayNum, { left: daysBetween(start, d) * px + 3, width: 7 * px - 3, textAlign: 'left' }]} numberOfLines={1}>
              {c.weekShort}
              {weekNo(d)} · {Number(d.slice(8, 10))}.{Number(d.slice(5, 7))}
            </Text>
          ))
        : null}
      {weeks.map((d) => (
        <View key={`w${d}`} style={[styles.weekTick, { left: daysBetween(start, d) * px }]} />
      ))}
    </View>
  );
}

function Bar({
  c,
  item,
  r,
  top,
  xOf,
  px,
  zoom,
  workdays,
  editable,
  conflict,
  onOpen,
  onMove,
}: {
  c: ScheduleCopy;
  item: ScheduleItem;
  r: Rolled | undefined;
  top: number;
  xOf: (d: string) => number;
  px: number;
  zoom: Zoom;
  workdays: number[];
  editable: boolean;
  conflict: boolean;
  onOpen: (item: ScheduleItem) => void;
  onMove: (item: ScheduleItem, start: string, end: string, mode: 'move' | 'resize') => void;
}) {
  const [drag, setDrag] = useState<{ dx: number; mode: 'move' | 'resize' } | null>(null);
  const canDrag = editable && Platform.OS === 'web' && item.kind !== 'phase' && !!item.start_date;
  const responder = (mode: 'move' | 'resize') =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => canDrag,
      onMoveShouldSetPanResponder: (_, g) => canDrag && Math.abs(g.dx) > 3,
      onPanResponderMove: (_, g) => setDrag({ dx: g.dx, mode }),
      onPanResponderRelease: (_, g) => {
        setDrag(null);
        const days = Math.round(g.dx / px);
        if (Math.abs(g.dx) < 4) return onOpen(item);
        if (!days || !item.start_date) return;
        if (mode === 'move') onMove(item, addDays(item.start_date, days), addDays(item.end_date ?? item.start_date, days), 'move');
        else {
          const end = addDays(item.end_date ?? item.start_date, days);
          onMove(item, item.start_date, end < item.start_date ? item.start_date : end, 'resize');
        }
      },
      onPanResponderTerminate: () => setDrag(null),
    });
  const moveR = useMemo(() => responder('move'), [canDrag, px, item]);
  const sizeR = useMemo(() => responder('resize'), [canDrag, px, item]);

  const start = r?.start ?? item.start_date;
  const end = r?.end ?? item.end_date ?? start;
  if (!start || !end) return null;
  let x = xOf(start);
  let w = (daysBetween(start, end) + 1) * px;
  if (drag?.mode === 'move') x += drag.dx;
  if (drag?.mode === 'resize') w = Math.max(px, w + drag.dx);
  const late = r?.late ?? 0;
  const progress = r?.progress ?? 0;
  const color = tradeColor(item.trade);
  const label = zoom === 'day' && w > 90 ? null : item.name;

  if (item.kind === 'milestone') {
    return (
      <Pressable onPress={() => onOpen(item)} {...(canDrag ? moveR.panHandlers : {})} style={[styles.milestoneWrap, { top: top + 9, left: x + px / 2 - 9 }]}>
        <View style={[styles.diamond, late ? { backgroundColor: colors.danger } : item.status === 'done' ? { backgroundColor: colors.success } : null]} />
        <Text style={styles.barLabel} numberOfLines={1}>
          {item.name} · {shortDate(start)}
        </Text>
      </Pressable>
    );
  }

  if (item.kind === 'phase') {
    return (
      <Pressable onPress={() => onOpen(item)} style={[styles.phaseBar, { top: top + 13, left: x, width: w }]}>
        <View style={[styles.phaseFill, { width: `${progress}%` }]} />
        <View style={[styles.phaseCap, { left: 0 }]} />
        <View style={[styles.phaseCap, { right: 0 }]} />
      </Pressable>
    );
  }

  const baselineShift = item.baseline_start && item.baseline_end && (item.baseline_start !== item.start_date || item.baseline_end !== item.end_date);
  return (
    <>
      {baselineShift ? <View style={[styles.baseline, { top: top + ROW - 9, left: xOf(item.baseline_start!), width: (daysBetween(item.baseline_start!, item.baseline_end!) + 1) * px }]} /> : null}
      <View
        {...(canDrag ? moveR.panHandlers : {})}
        style={[
          styles.bar,
          { top: top + 7, left: x, width: w, backgroundColor: item.status === 'done' ? `${color}88` : `${color}33`, borderColor: late || conflict ? colors.danger : color },
          late > 0 || conflict ? { borderWidth: 2 } : null,
          canDrag && ({ cursor: drag ? 'grabbing' : 'grab' } as object),
          drag && { opacity: 0.8 },
        ]}
      >
        <Pressable onPress={() => !canDrag && onOpen(item)} style={StyleSheet.absoluteFill}>
          <View style={[styles.barFill, { width: `${item.status === 'done' ? 100 : progress}%`, backgroundColor: color }]} />
          {crossesNonWorking(item.start_date, item.end_date, workdays) && zoom !== 'month' ? <View style={styles.weekendMark} /> : null}
        </Pressable>
        {canDrag ? <View {...sizeR.panHandlers} style={[styles.handle, { cursor: 'ew-resize' } as object]} /> : null}
      </View>
      {label ? (
        <Text style={[styles.barLabel, { position: 'absolute', top: top + 10, left: x + w + 6 }]} numberOfLines={1}>
          {label}
          {late ? `  · ${fill(c.daysLate, { n: late })}` : ''}
        </Text>
      ) : null}
    </>
  );
}

// Finish → start: out of the end of the first bar, into the start of the next.
function Arrows({ rows, rolled, links, rowIndex, xOf, px, width, height }: { rows: GanttRow[]; rolled: Map<string, Rolled>; links: ScheduleLink[]; rowIndex: Map<string, number>; xOf: (d: string) => number; px: number; width: number; height: number }) {
  const paths: { d: string; bad: boolean; key: string; hx: number; hy: number }[] = [];
  for (const l of links) {
    const a = rowIndex.get(l.from_item);
    const b = rowIndex.get(l.to_item);
    if (a == null || b == null) continue;
    const ra = rolled.get(l.from_item);
    const rb = rolled.get(l.to_item);
    if (!ra?.end || !rb?.start) continue;
    const fromMilestone = rows[a].item.kind === 'milestone';
    const x1 = fromMilestone ? xOf(ra.end) + px / 2 + 8 : xOf(ra.end) + px;
    const y1 = a * ROW + ROW / 2;
    const x2 = rows[b].item.kind === 'milestone' ? xOf(rb.start) + px / 2 - 9 : xOf(rb.start);
    const y2 = b * ROW + ROW / 2;
    const bad = rb.start <= ra.end && !fromMilestone;
    const d = x2 - x1 >= 12 ? `M${x1} ${y1} H${x1 + 6} V${y2} H${x2 - 1}` : `M${x1} ${y1} H${x1 + 6} V${(y1 + y2) / 2} H${x2 - 8} V${y2} H${x2 - 1}`;
    paths.push({ d, bad, key: l.id, hx: x2 - 1, hy: y2 });
  }
  return (
    <Svg width={width} height={height} style={{ position: 'absolute', left: 0, top: 0 }} pointerEvents="none">
      {paths.map((p) => (
        <Path key={p.key} d={p.d} stroke={p.bad ? colors.danger : '#8A9591'} strokeWidth={1.4} fill="none" />
      ))}
      {paths.map((p) => (
        <Path key={`h${p.key}`} d={`M${p.hx} ${p.hy} l-6 -4 v8 z`} fill={p.bad ? colors.danger : '#8A9591'} />
      ))}
    </Svg>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, flexDirection: 'row', borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.surface },
  head: { height: HEAD, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface },
  th: { fontSize: 11, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  row: { height: ROW, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.border },
  phaseRow: { backgroundColor: '#F7F4EF' },
  name: { flex: 1, fontSize: fontSize.sm, color: colors.text },
  cell: { fontSize: 12.5, color: colors.text },
  mono: { fontVariant: ['tabular-nums'] },
  dot: { width: 8, height: 8, borderRadius: 4 },
  pill: { alignSelf: 'flex-start', borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 2, maxWidth: COLS.status - 8 },
  pillText: { fontSize: 11, fontWeight: '700' },
  month: { position: 'absolute', top: 6, fontSize: 12, fontWeight: '800', color: colors.text },
  dayNum: { position: 'absolute', top: 28, fontSize: 11, color: colors.text, textAlign: 'center' },
  weekTick: { position: 'absolute', top: 26, bottom: 0, width: 1, backgroundColor: colors.border },
  offDay: { position: 'absolute', top: 0, bottom: 0, backgroundColor: 'rgba(124,138,134,0.08)' },
  gridLine: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: colors.border, opacity: 0.6 },
  todayLine: { position: 'absolute', top: 0, bottom: 0, width: 2, backgroundColor: colors.danger, opacity: 0.7 },
  bar: { position: 'absolute', height: ROW - 14, borderRadius: 6, borderWidth: 1, overflow: 'hidden' },
  barFill: { position: 'absolute', left: 0, top: 0, bottom: 0, opacity: 0.85 },
  weekendMark: { position: 'absolute', right: 3, top: 3, width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(0,0,0,0.35)' },
  handle: { position: 'absolute', right: 0, top: 0, bottom: 0, width: 8 },
  baseline: { position: 'absolute', height: 3, borderRadius: 2, backgroundColor: '#B9C2BF' },
  barLabel: { fontSize: 11.5, color: colors.text, maxWidth: 260 },
  phaseBar: { position: 'absolute', height: 9, backgroundColor: '#3B4441', borderRadius: 2, overflow: 'visible' },
  phaseFill: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: colors.success, borderRadius: 2 },
  phaseCap: { position: 'absolute', top: 0, width: 4, height: 14, backgroundColor: '#3B4441' },
  milestoneWrap: { position: 'absolute', flexDirection: 'row', alignItems: 'center', gap: 8 },
  diamond: { width: 16, height: 16, transform: [{ rotate: '45deg' }], backgroundColor: '#3B4441', borderRadius: 2 },
  diamondSmall: { width: 8, height: 8, transform: [{ rotate: '45deg' }], backgroundColor: '#3B4441' },
});
