import { useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { DateField } from './DateField';
import { colors, fontSize, radius, spacing, breakpoints } from '../lib/theme';
import { getAppLocale, useTranslation } from '../lib/translations';

export interface DateRange {
  start: string;
  end: string;
}

function toIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function startOfWeek(d: Date): Date {
  const date = new Date(d);
  const day = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - day);
  return date;
}
function addDays(d: Date, n: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + n);
  return next;
}
function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}
function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}
function monthLabel(d: Date): string {
  const label = d.toLocaleDateString(`${getAppLocale()}-CH`, { month: 'long', year: 'numeric' });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

// Quick presets + a per-platform picker: a compact editable date button on
// phones, a stacked multi-month calendar on desktop (several months in a
// row, so switching months doesn't mean losing sight of the one before).
export function PayrollDateFilter({ range, onChange }: { range: DateRange; onChange: (r: DateRange) => void }) {
  const { t } = useTranslation();
  const dayLabels = t('payrollDateFilter.dayLabels', { returnObjects: true }) as string[];
  const { width } = useWindowDimensions();
  const isDesktop = width >= breakpoints.tablet;
  const [monthsAnchor, setMonthsAnchor] = useState(() => startOfMonth(new Date()));

  const today = new Date();
  const isSingleDay = range.start === range.end;

  function setToday() {
    const iso = toIso(today);
    onChange({ start: iso, end: iso });
  }
  function setThisWeek() {
    const start = startOfWeek(today);
    onChange({ start: toIso(start), end: toIso(addDays(start, 6)) });
  }
  function setThisMonth() {
    onChange({ start: toIso(startOfMonth(today)), end: toIso(endOfMonth(today)) });
  }
  function pickDay(iso: string) {
    onChange({ start: iso, end: iso });
  }

  return (
    <View>
      <View style={styles.quickRow}>
        <QuickChip label={t('payrollDateFilter.today')} active={isSingleDay && range.start === toIso(today)} onPress={setToday} />
        <QuickChip label={t('payrollDateFilter.thisWeek')} active={range.start === toIso(startOfWeek(today)) && range.end === toIso(addDays(startOfWeek(today), 6))} onPress={setThisWeek} />
        <QuickChip label={t('payrollDateFilter.thisMonth')} active={range.start === toIso(startOfMonth(today)) && range.end === toIso(endOfMonth(today))} onPress={setThisMonth} />
      </View>

      {isDesktop ? (
        <View style={styles.calendarStack}>
          <View style={styles.calendarNav}>
            <Pressable onPress={() => setMonthsAnchor((m) => addMonths(m, -1))} hitSlop={8} style={styles.navButton}>
              <Feather name="chevron-up" size={16} color={colors.text} />
            </Pressable>
            <Text style={styles.navLabel}>{t('payrollDateFilter.navigate')}</Text>
            <Pressable onPress={() => setMonthsAnchor((m) => addMonths(m, 1))} hitSlop={8} style={styles.navButton}>
              <Feather name="chevron-down" size={16} color={colors.text} />
            </Pressable>
          </View>
          {[0, 1, 2].map((i) => (
            <MiniMonth key={i} anchor={addMonths(monthsAnchor, i)} range={range} onPickDay={pickDay} dayLabels={dayLabels} />
          ))}
        </View>
      ) : (
        <View style={styles.mobileDateButton}>
          <DateField label={t('payrollDateFilter.goToDate')} value={range.start} onChange={(v) => v && pickDay(v)} />
        </View>
      )}
    </View>
  );
}

function QuickChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.quickChip, active && styles.quickChipActive]}>
      <Text style={[styles.quickChipText, active && styles.quickChipTextActive]}>{label}</Text>
    </Pressable>
  );
}

function MiniMonth({ anchor, range, onPickDay, dayLabels }: { anchor: Date; range: DateRange; onPickDay: (iso: string) => void; dayLabels: string[] }) {
  const first = startOfMonth(anchor);
  const last = endOfMonth(anchor);
  const leading = (first.getDay() + 6) % 7;
  const days: (Date | null)[] = [...Array(leading).fill(null), ...Array.from({ length: last.getDate() }, (_, i) => new Date(anchor.getFullYear(), anchor.getMonth(), i + 1))];
  const todayIso = toIso(new Date());

  return (
    <View style={styles.miniMonth}>
      <Text style={styles.miniMonthTitle}>{monthLabel(anchor)}</Text>
      <View style={styles.miniWeekRow}>
        {dayLabels.map((d, i) => (
          <Text key={i} style={styles.miniDayLabel}>{d}</Text>
        ))}
      </View>
      <View style={styles.miniGrid}>
        {days.map((d, i) => {
          if (!d) return <View key={i} style={styles.miniCell} />;
          const iso = toIso(d);
          const inRange = iso >= range.start && iso <= range.end;
          const isToday = iso === todayIso;
          return (
            <Pressable key={i} onPress={() => onPickDay(iso)} style={styles.miniCell}>
              <View style={[styles.miniDayCircle, inRange && styles.miniDayCircleActive, isToday && !inRange && styles.miniDayCircleToday]}>
                <Text style={[styles.miniDayText, inRange && styles.miniDayTextActive]}>{d.getDate()}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  quickChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickChipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  quickChipText: {
    fontSize: fontSize.xs,
    color: colors.text,
  },
  quickChipTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  mobileDateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  calendarStack: {
    gap: spacing.lg,
    width: 220,
  },
  calendarNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navButton: {
    width: 26,
    height: 26,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  navLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  miniMonth: {
    gap: 4,
  },
  miniMonthTitle: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 2,
  },
  miniWeekRow: {
    flexDirection: 'row',
  },
  miniDayLabel: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontSize: 9,
    color: colors.textMuted,
    fontWeight: '700',
  },
  miniGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  miniCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniDayCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniDayCircleActive: {
    backgroundColor: colors.primary,
  },
  miniDayCircleToday: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  miniDayText: {
    fontSize: 10,
    color: colors.text,
  },
  miniDayTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
});
