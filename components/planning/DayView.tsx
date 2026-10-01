import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { PlanningAssignmentWithNames } from '../../lib/api/planning';
import { colors, fontSize, radius } from '../../lib/theme';

// One day, hour by hour, one column per person: who is where and when, so
// overlapping absences (« personne au bureau entre 14 h et 16 h ») stand out.
// All-day events sit in a band above the hours.

const HOUR_HEIGHT = 44;
const COL_WIDTH = 150;
const AXIS_WIDTH = 44;

const minutes = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + (m || 0);
};
const hm = (t: string | null | undefined) => (t ? t.slice(0, 5) : '');

interface Member {
  id: string;
  label: string;
}

export function DayView({
  dayIso,
  members,
  events,
  colorFor,
  labelFor,
  privateLabel,
  allDayLabel,
  onPressEvent,
  onCreateAt,
}: {
  dayIso: string;
  members: Member[];
  events: PlanningAssignmentWithNames[];
  colorFor: (a: PlanningAssignmentWithNames) => string;
  labelFor: (a: PlanningAssignmentWithNames) => string;
  privateLabel: string;
  allDayLabel: string;
  onPressEvent: (a: PlanningAssignmentWithNames) => void;
  onCreateAt: (memberId: string, time: string | null) => void;
}) {
  const today = events.filter((a) => a.starts_on <= dayIso && a.ends_on >= dayIso);
  // A timed event spanning several days covers this day fully except on its
  // first and last day.
  const span = (a: PlanningAssignmentWithNames): [number, number] | null => {
    if (!a.start_time) return null;
    const start = a.starts_on === dayIso ? minutes(a.start_time) : 0;
    const end = a.ends_on === dayIso ? (a.end_time ? minutes(a.end_time) : start + 60) : 24 * 60;
    return [start, Math.max(end, start + 15)];
  };
  const timed = today.filter((a) => span(a));
  const allDay = today.filter((a) => !span(a));

  let firstHour = 7;
  let lastHour = 19;
  for (const a of timed) {
    const [s, e] = span(a)!;
    firstHour = Math.min(firstHour, Math.floor(s / 60));
    lastHour = Math.max(lastHour, Math.ceil(e / 60));
  }
  const hours = Array.from({ length: lastHour - firstHour }, (_, i) => firstHour + i);
  const gridHeight = hours.length * HOUR_HEIGHT;
  const now = new Date();
  const isToday = dayIso === `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const nowTop = ((now.getHours() * 60 + now.getMinutes() - firstHour * 60) / 60) * HOUR_HEIGHT;

  // Side-by-side lanes when one person's events overlap.
  function lanes(list: PlanningAssignmentWithNames[]) {
    const sorted = [...list].sort((a, b) => span(a)![0] - span(b)![0]);
    const laneEnds: number[] = [];
    const placed = sorted.map((a) => {
      const [s, e] = span(a)!;
      let lane = laneEnds.findIndex((end) => end <= s);
      if (lane === -1) {
        lane = laneEnds.length;
        laneEnds.push(e);
      } else laneEnds[lane] = e;
      return { a, s, e, lane };
    });
    return { placed, count: Math.max(1, laneEnds.length) };
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={Platform.OS === 'web'}>
      <View>
        {/* People */}
        <View style={styles.headRow}>
          <View style={{ width: AXIS_WIDTH }} />
          {members.map((m) => (
            <View key={m.id} style={styles.headCell}>
              <Text style={styles.headText} numberOfLines={1}>
                {m.label}
              </Text>
            </View>
          ))}
        </View>

        {/* All day */}
        {allDay.length > 0 ? (
          <View style={styles.allDayRow}>
            <View style={[styles.axisCell, { width: AXIS_WIDTH }]}>
              <Text style={styles.allDayLabel}>{allDayLabel}</Text>
            </View>
            {members.map((m) => (
              <View key={m.id} style={styles.allDayCell}>
                {allDay
                  .filter((a) => a.member_user_id === m.id)
                  .map((a) => (
                    <Pressable
                      key={a.id}
                      disabled={a.masked}
                      onPress={() => onPressEvent(a)}
                      style={[styles.allDayChip, { backgroundColor: a.masked ? colors.border : colorFor(a) }]}
                    >
                      {a.is_private ? <Feather name="lock" size={9} color={a.masked ? colors.textMuted : '#fff'} /> : null}
                      <Text style={[styles.eventTitle, a.masked && { color: colors.textMuted }]} numberOfLines={1}>
                        {a.masked ? privateLabel : labelFor(a)}
                      </Text>
                    </Pressable>
                  ))}
              </View>
            ))}
          </View>
        ) : null}

        {/* Hours */}
        <View style={{ flexDirection: 'row' }}>
          <View style={{ width: AXIS_WIDTH, height: gridHeight }}>
            {hours.map((h) => (
              <Text key={h} style={[styles.hourLabel, { top: (h - firstHour) * HOUR_HEIGHT - 6 }]}>
                {String(h).padStart(2, '0')}:00
              </Text>
            ))}
          </View>
          {members.map((m) => {
            const { placed, count } = lanes(timed.filter((a) => a.member_user_id === m.id));
            return (
              <View key={m.id} style={[styles.col, { height: gridHeight }]}>
                {hours.map((h) => (
                  <Pressable
                    key={h}
                    onPress={() => onCreateAt(m.id, `${String(h).padStart(2, '0')}:00`)}
                    style={[styles.hourSlot, { top: (h - firstHour) * HOUR_HEIGHT }]}
                  />
                ))}
                {placed.map(({ a, s, e, lane }) => {
                  const top = ((s - firstHour * 60) / 60) * HOUR_HEIGHT;
                  const height = Math.max(((e - s) / 60) * HOUR_HEIGHT - 2, 18);
                  const width = (COL_WIDTH - 6) / count;
                  return (
                    <Pressable
                      key={a.id}
                      disabled={a.masked}
                      onPress={() => onPressEvent(a)}
                      style={[
                        styles.event,
                        { top, height, left: 3 + lane * width, width: width - 2, backgroundColor: a.masked ? colors.border : colorFor(a) },
                      ]}
                    >
                      <View style={styles.eventHead}>
                        {a.is_private ? <Feather name="lock" size={9} color={a.masked ? colors.textMuted : '#fff'} /> : null}
                        <Text style={[styles.eventTitle, a.masked && { color: colors.textMuted }]} numberOfLines={height > 34 ? 2 : 1}>
                          {a.masked ? privateLabel : labelFor(a)}
                        </Text>
                      </View>
                      {height > 30 ? (
                        <Text style={[styles.eventTime, a.masked && { color: colors.textMuted }]} numberOfLines={1}>
                          {a.starts_on === dayIso ? hm(a.start_time) : '…'}
                          {a.end_time ? `–${a.ends_on === dayIso ? hm(a.end_time) : '…'}` : ''}
                        </Text>
                      ) : null}
                    </Pressable>
                  );
                })}
                {isToday && nowTop > 0 && nowTop < gridHeight ? <View pointerEvents="none" style={[styles.nowLine, { top: nowTop }]} /> : null}
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headRow: { flexDirection: 'row', height: 36, alignItems: 'center' },
  headCell: { width: COL_WIDTH, paddingHorizontal: 6 },
  headText: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text, textAlign: 'center' },
  allDayRow: { flexDirection: 'row', borderTopWidth: 1, borderColor: colors.border },
  axisCell: { justifyContent: 'center', paddingRight: 4 },
  allDayLabel: { fontSize: 9, fontWeight: '700', color: colors.textMuted, textAlign: 'right', textTransform: 'uppercase' },
  allDayCell: { width: COL_WIDTH, padding: 3, gap: 2, borderLeftWidth: 1, borderColor: colors.border, minHeight: 28 },
  allDayChip: { flexDirection: 'row', alignItems: 'center', gap: 3, borderRadius: radius.sm, paddingHorizontal: 5, height: 20 },
  hourLabel: { position: 'absolute', right: 6, fontSize: 10, color: colors.textMuted, fontVariant: ['tabular-nums'] },
  col: { width: COL_WIDTH, borderLeftWidth: 1, borderColor: colors.border, position: 'relative' },
  hourSlot: { position: 'absolute', left: 0, right: 0, height: HOUR_HEIGHT, borderTopWidth: 1, borderColor: colors.border },
  event: { position: 'absolute', borderRadius: radius.sm, paddingHorizontal: 5, paddingVertical: 3, overflow: 'hidden' },
  eventHead: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  eventTitle: { flexShrink: 1, fontSize: 11, fontWeight: '700', color: '#fff' },
  eventTime: { fontSize: 10, color: 'rgba(255,255,255,0.9)', marginTop: 1, fontVariant: ['tabular-nums'] },
  nowLine: { position: 'absolute', left: 0, right: 0, height: 2, backgroundColor: colors.danger },
});
