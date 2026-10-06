import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { formulaDef, type MeasureMode, type ParamKey, type Params } from '../../lib/tenders/allocation';
import { formatMeasure } from '../../lib/tenders/geometry';
import { useAssignCopy } from '../../lib/tenders/assignCopy';
import { fill } from '../../lib/tenders/copy';
import { colors, fontSize, radius, spacing } from '../../lib/theme';
import { monoType } from '../../lib/marketingTheme';

// « Vous mesurez pour 241 / 235.111 » — the bar above the plan when the
// user came from a position of the métré: how to draw it, the figures the
// formula needs, what is measured so far, and the way back.

export interface Target {
  positionId: string;
  ref: string;
  title: string;
  unit: string;
  quantityOriginal: number | null;
  measured: number | null;
  count: number;
  modes: MeasureMode[];
  modeIdx: number;
  params: Params;
}

const ORDER: ParamKey[] = ['height', 'thickness', 'width', 'faces', 'rate', 'factor'];
const PH: Record<string, string> = { height: '2.60', thickness: '0.20', width: '0.60', faces: '2', rate: '85', factor: '1' };

export function TargetBar({ t, onMode, onParams, onStop, onBack }: { t: Target; onMode: (i: number) => void; onParams: (p: Params) => void; onStop: () => void; onBack?: () => void }) {
  const c = useAssignCopy();
  const mode = t.modes[t.modeIdx];
  const needs = ORDER.filter((k) => k === 'factor' || formulaDef(mode?.formula ?? '')?.params.includes(k));
  const [text, setText] = useState<Record<string, string>>(() => Object.fromEntries(needs.map((k) => [k, t.params[k] != null ? String(t.params[k]) : k === 'faces' ? '2' : ''])));
  const missing = needs.filter((k) => k !== 'factor' && k !== 'faces' && !(Number(String(text[k] ?? t.params[k] ?? '').replace(',', '.')) > 0));

  const commit = (k: ParamKey, v: string) => {
    const n = Number(v.replace(',', '.'));
    onParams({ ...t.params, [k]: v !== '' && n > 0 ? n : null });
  };

  return (
    <View style={styles.bar}>
      <View style={styles.top}>
        <Feather name="target" size={16} color={colors.primary} />
        <View style={{ flex: 1, minWidth: 220 }}>
          <Text style={styles.eyebrow}>{c.targetFor}</Text>
          <Text style={styles.title} numberOfLines={1}>
            <Text style={styles.ref}>{t.ref} </Text>
            {t.title}
          </Text>
        </View>
        <View style={styles.figures}>
          <Text style={styles.measured}>{fill(c.measuredSoFar, { q: `${t.measured == null ? '0' : formatMeasure(t.measured, 2)} ${t.unit}` })}</Text>
          <Text style={styles.small}>
            {fill(c.nMeasures, { n: t.count })}
            {t.quantityOriginal != null ? ` · ${fill(c.inDoc, { q: `${formatMeasure(t.quantityOriginal, 2)} ${t.unit}` })}` : ''}
          </Text>
        </View>
        {onBack ? (
          <Pressable onPress={onBack} style={styles.back}>
            <Feather name="check" size={14} color="#fff" />
            <Text style={styles.backText}>{c.backToTender}</Text>
          </Pressable>
        ) : null}
        <Pressable onPress={onStop} hitSlop={8} accessibilityLabel={c.stop}>
          <Feather name="x" size={18} color={colors.textMuted} />
        </Pressable>
      </View>
      <View style={styles.row}>
        {t.modes.length > 1 ? (
          <View style={styles.modes}>
            <Text style={styles.label}>{c.how}</Text>
            {t.modes.map((m, i) => (
              <Pressable key={`${m.kind}:${m.formula}`} onPress={() => onMode(i)} style={[styles.mode, i === t.modeIdx && styles.modeOn]}>
                <Text style={[styles.modeText, i === t.modeIdx && { color: '#fff' }]}>{c.modeTools[m.kind]}</Text>
                <Text style={[styles.modeSub, i === t.modeIdx && { color: '#fff' }]}>{c.formulas[m.formula]}</Text>
              </Pressable>
            ))}
          </View>
        ) : mode ? (
          <Text style={styles.label}>
            {c.modeTools[mode.kind]} · {c.formulas[mode.formula]}
          </Text>
        ) : null}
        <View style={styles.dims}>
          {needs.map((k) => (
            <View key={k} style={styles.dim}>
              <Text style={styles.label}>{c.params[k]}</Text>
              <TextInput
                style={[styles.input, missing.includes(k) && styles.inputMissing]}
                value={text[k] ?? ''}
                onChangeText={(v) => setText((s) => ({ ...s, [k]: v }))}
                onBlur={() => commit(k, text[k] ?? '')}
                onSubmitEditing={() => commit(k, text[k] ?? '')}
                keyboardType="decimal-pad"
                placeholder={PH[k]}
                placeholderTextColor={colors.textMuted}
              />
              <Text style={styles.unit}>{c.units[k]}</Text>
            </View>
          ))}
        </View>
      </View>
      <Text style={[styles.small, missing.length > 0 && { color: colors.warning, fontWeight: '700' }]}>
        {missing.length ? fill(c.needDims, { list: missing.map((m) => c.params[m].toLowerCase()).join(', ') }) : c.drawHint}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { gap: 8, marginHorizontal: spacing.lg, marginBottom: spacing.sm, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1.5, borderColor: colors.primary, backgroundColor: colors.surface },
  top: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flexWrap: 'wrap' },
  eyebrow: { fontSize: 11, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase', color: colors.primary },
  title: { fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  ref: { ...monoType, fontSize: 13.5, color: colors.textMuted },
  figures: { alignItems: 'flex-end' },
  measured: { fontSize: fontSize.md, fontWeight: '800', color: colors.success, fontVariant: ['tabular-nums'] },
  small: { fontSize: 12, color: colors.textMuted },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 34, paddingHorizontal: 12, borderRadius: radius.md, backgroundColor: colors.primary },
  backText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, flexWrap: 'wrap' },
  modes: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  mode: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  modeOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  modeText: { fontSize: 12.5, fontWeight: '800', color: colors.text },
  modeSub: { fontSize: 11, color: colors.textMuted },
  label: { fontSize: 12.5, fontWeight: '700', color: colors.textMuted },
  dims: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flexWrap: 'wrap' },
  dim: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  input: { width: 70, height: 32, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 8, fontSize: 14, fontWeight: '700', color: colors.text, backgroundColor: colors.surface, fontVariant: ['tabular-nums'] },
  inputMissing: { borderColor: colors.warning, backgroundColor: colors.warningSoft },
  unit: { fontSize: 12, fontWeight: '700', color: colors.textMuted, minWidth: 10 },
});
