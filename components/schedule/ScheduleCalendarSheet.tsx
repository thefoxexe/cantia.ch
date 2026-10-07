import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Btn, Sheet, kit } from '../admin/ledger/kit';
import { DateField } from '../DateField';
import { addDays } from '../../lib/schedule/calc';
import { CANTONS, daysOff, type CalendarSettings, type Canton, type Closure } from '../../lib/schedule/holidays';
import { shortDate } from '../../lib/schedule/copy';
import type { useScheduleCopy } from '../../lib/schedule/useCopy';
import { colors, fontSize, radius, spacing } from '../../lib/theme';

// Working days, the canton's public holidays, company closures and this
// chantier's own days off — everything the duration maths skips.
export function ScheduleCalendarSheet({
  c,
  lang,
  initial,
  guessedCanton,
  editable,
  canEditClosures,
  today,
  onClose,
  onSave,
}: {
  c: ReturnType<typeof useScheduleCopy>;
  lang: 'fr' | 'de' | 'it';
  initial: CalendarSettings & { cantonSet: boolean };
  guessedCanton: Canton | null;
  editable: boolean;
  canEditClosures: boolean;
  today: string;
  onClose: () => void;
  onSave: (next: CalendarSettings, cantonSet: boolean) => Promise<string | null>;
}) {
  const [s, setS] = useState<CalendarSettings>({ ...initial, closures: [...initial.closures], extra: [...initial.extra] });
  const [cantonSet, setCantonSet] = useState(initial.cantonSet);
  const [pickCanton, setPickCanton] = useState(false);
  const [newDay, setNewDay] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const upcoming = useMemo(() => daysOff(s, today, addDays(today, 365), lang), [s, today, lang]);

  const toggleDay = (d: number) => setS((v) => ({ ...v, workdays: v.workdays.includes(d) ? v.workdays.filter((x) => x !== d) : [...v.workdays, d].sort() }));
  const setClosure = (i: number, patch: Partial<Closure>) => setS((v) => ({ ...v, closures: v.closures.map((cl, j) => (j === i ? { ...cl, ...patch } : cl)) }));

  return (
    <Sheet
      title={c.calendar}
      onClose={onClose}
      footer={
        editable ? (
          <>
            <Btn label={c.cancel} onPress={onClose} grow />
            <Btn
              label={busy ? '…' : c.save}
              icon="check"
              variant="primary"
              grow
              disabled={busy || !s.workdays.length}
              onPress={async () => {
                setBusy(true);
                setError(await onSave({ ...s, closures: s.closures.filter((cl) => cl.from && cl.to && cl.from <= cl.to) }, cantonSet));
                setBusy(false);
              }}
            />
          </>
        ) : (
          <Btn label={c.cancel} onPress={onClose} grow />
        )
      }
    >
      <Text style={kit.hint}>{c.calendarIntro}</Text>

      <Text style={kit.eyebrow}>{c.workdaysLabel}</Text>
      <View style={styles.row}>
        {c.weekdaysShort.map((label, i) => {
          const d = i + 1;
          const on = s.workdays.includes(d);
          return (
            <Pressable key={d} disabled={!editable} onPress={() => toggleDay(d)} style={[styles.day, on && styles.dayOn]}>
              <Text style={[styles.dayText, on && styles.dayTextOn]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={kit.eyebrow}>{c.cantonLabel}</Text>
      <View style={[styles.row, { alignItems: 'center' }]}>
        <Pressable disabled={!editable} onPress={() => setPickCanton((v) => !v)} style={styles.select}>
          <Text style={styles.selectText}>{s.canton ?? '—'}</Text>
          <Feather name={pickCanton ? 'chevron-up' : 'chevron-down'} size={15} color={colors.textMuted} />
        </Pressable>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Switch value={s.holidays} disabled={!editable} onValueChange={(holidays) => setS((v) => ({ ...v, holidays }))} trackColor={{ false: colors.border, true: colors.primary }} thumbColor="#fff" />
          <Text style={kit.body}>{c.holidaysOn}</Text>
        </View>
      </View>
      {!cantonSet && s.canton && s.canton === guessedCanton ? <Text style={kit.hint}>{c.cantonGuessed}</Text> : null}
      {pickCanton ? (
        <View style={styles.cantons}>
          {CANTONS.map((k) => (
            <Pressable
              key={k}
              onPress={() => {
                setS((v) => ({ ...v, canton: k }));
                setCantonSet(true);
                setPickCanton(false);
              }}
              style={[styles.canton, s.canton === k && styles.dayOn]}
            >
              <Text style={[styles.dayText, s.canton === k && styles.dayTextOn]}>{k}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      <Text style={kit.eyebrow}>{c.closuresTitle}</Text>
      <Text style={kit.hint}>{c.closuresHint}</Text>
      {s.closures.map((cl, i) => (
        <View key={i} style={styles.closure}>
          <TextInput value={cl.label} onChangeText={(label) => setClosure(i, { label })} editable={canEditClosures} style={[kit.input, { flexGrow: 1, flexBasis: 160 }]} />
          <View style={{ flexGrow: 1, flexBasis: 140 }}>
            <DateField label={c.pdfFrom} value={cl.from} onChange={(from) => setClosure(i, { from: from ?? '' })} />
          </View>
          <View style={{ flexGrow: 1, flexBasis: 140 }}>
            <DateField label={c.pdfTo} value={cl.to} onChange={(to) => setClosure(i, { to: to ?? '' })} />
          </View>
          {canEditClosures ? (
            <Pressable onPress={() => setS((v) => ({ ...v, closures: v.closures.filter((_, j) => j !== i) }))} hitSlop={6} accessibilityLabel={c.remove}>
              <Feather name="trash-2" size={16} color={colors.danger} />
            </Pressable>
          ) : null}
        </View>
      ))}
      {canEditClosures ? (
        <Pressable onPress={() => setS((v) => ({ ...v, closures: [...v.closures, { label: c.closureDefault, from: '', to: '' }] }))} style={styles.add}>
          <Feather name="plus" size={14} color={colors.primary} />
          <Text style={styles.addText}>{c.addClosure}</Text>
        </Pressable>
      ) : null}

      <Text style={kit.eyebrow}>{c.extraTitle}</Text>
      <View style={styles.row}>
        {s.extra.map((d) => (
          <View key={d} style={styles.chip}>
            <Text style={kit.body}>{shortDate(d)}</Text>
            {editable ? (
              <Pressable onPress={() => setS((v) => ({ ...v, extra: v.extra.filter((x) => x !== d) }))} hitSlop={6} accessibilityLabel={c.remove}>
                <Feather name="x" size={13} color={colors.textMuted} />
              </Pressable>
            ) : null}
          </View>
        ))}
      </View>
      {editable ? (
        <View style={[styles.row, { alignItems: 'flex-end' }]}>
          <View style={{ flexGrow: 1, flexBasis: 160 }}>
            <DateField label={c.addDay} value={newDay} onChange={setNewDay} />
          </View>
          <Btn
            label={c.addDay}
            icon="plus"
            disabled={!newDay}
            onPress={() => {
              if (newDay && !s.extra.includes(newDay)) setS((v) => ({ ...v, extra: [...v.extra, newDay].sort() }));
              setNewDay(null);
            }}
          />
        </View>
      ) : null}

      <Text style={kit.eyebrow}>{c.upcomingOff}</Text>
      <ScrollView style={{ maxHeight: 220 }}>
        {upcoming.length ? (
          upcoming.map((d) => (
            <View key={d.date} style={styles.offRow}>
              <View style={[styles.dot, { backgroundColor: d.source === 'holiday' ? colors.primary : d.source === 'closure' ? colors.warning : colors.textMuted }]} />
              <Text style={[kit.body, { width: 80 }]}>{shortDate(d.date)}</Text>
              <Text style={[kit.hint, { flex: 1 }]} numberOfLines={1}>
                {d.name || c.extraTitle}
              </Text>
            </View>
          ))
        ) : (
          <Text style={kit.hint}>{c.noDaysOff}</Text>
        )}
      </ScrollView>
      {error ? <Text style={{ color: colors.danger }}>{error}</Text> : null}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  day: { minWidth: 40, paddingHorizontal: 10, paddingVertical: 8, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center', backgroundColor: colors.surface },
  dayOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  dayText: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  dayTextOn: { color: '#fff' },
  select: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, marginRight: spacing.md },
  selectText: { fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  cantons: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, padding: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  canton: { width: 44, paddingVertical: 6, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  closure: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end', gap: spacing.sm, paddingVertical: spacing.xs },
  add: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingVertical: 4 },
  addText: { fontSize: fontSize.sm, fontWeight: '700', color: colors.primary },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border },
  offRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: colors.border },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
