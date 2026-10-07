import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusPill, tradeColor } from './GanttView';
import { kit } from '../admin/ledger/kit';
import { shortDate, type ScheduleCopy } from '../../lib/schedule/copy';
import type { flatten, rollup, ScheduleItem } from '../../lib/schedule/calc';
import { colors, fontSize, radius, spacing } from '../../lib/theme';

// The planning on a phone: one card per line, indented under its phase.
export function PhoneList({ c, rows, rolled, onOpen }: { c: ScheduleCopy; rows: ReturnType<typeof flatten>; rolled: ReturnType<typeof rollup>; onOpen: (i: ScheduleItem) => void }) {
  return (
    <ScrollView contentContainerStyle={{ gap: 6, paddingBottom: spacing.xxl }}>
      {rows.map(({ item, depth }) => {
        const r = rolled.get(item.id);
        const phase = item.kind === 'phase';
        return (
          <Pressable key={item.id} onPress={() => onOpen(item)} style={[styles.phoneRow, phase && { backgroundColor: '#F4F1EC' }, { marginLeft: depth * 12 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {item.trade ? <View style={[styles.dot, { backgroundColor: tradeColor(item.trade) }]} /> : null}
              <Text style={[kit.body, { flex: 1, fontWeight: phase ? '800' : '600' }]} numberOfLines={2}>
                {item.kind === 'milestone' ? '◆ ' : ''}
                {item.name}
              </Text>
              {phase ? <Text style={styles.mono}>{r?.progress ?? 0} %</Text> : <StatusPill c={c} item={item} late={r?.late ?? 0} />}
            </View>
            <Text style={kit.hint}>
              {shortDate(r?.start ?? null)} → {shortDate(r?.end ?? null)}
              {item.kind === 'task' && item.duration ? ` · ${item.duration} ${c.days}` : ''}
              {item.trade ? ` · ${item.trade}` : ''}
            </Text>
            {!phase && item.kind !== 'milestone' ? (
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${item.status === 'done' ? 100 : item.progress}%`, backgroundColor: tradeColor(item.trade) }]} />
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  dot: { width: 8, height: 8, borderRadius: 4 },
  mono: { fontSize: fontSize.sm, color: colors.text, fontVariant: ['tabular-nums'] },
  phoneRow: { padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, gap: 4 },
  progressTrack: { height: 5, borderRadius: 3, backgroundColor: colors.surfaceAlt, overflow: 'hidden', marginTop: 4 },
  progressFill: { height: 5, borderRadius: 3 },
});
