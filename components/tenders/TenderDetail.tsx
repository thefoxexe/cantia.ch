import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Btn, Chip, Field, Segmented, kit } from '../admin/ledger/kit';
import { auditFor, type AuditEntry } from '../../lib/tenders/api';
import { checkBreakdownSum, lineAmount, quantityGap } from '../../lib/tenders/calc';
import { fill, type TenderCopy } from '../../lib/tenders/copy';
import { useAssignCopy } from '../../lib/tenders/assignCopy';
import { formatChf, formatQuantity, parseSwissNumber } from '../../lib/tenders/numbers';
import { UNIT_CHOICES, unitLabel } from '../../lib/tenders/units';
import type { PriceSuggestion } from '../../lib/tenders/pricing';
import type { PositionBreakdown, PositionPrice, QuantitySource, TenderNode, TenderPosition, ZoneLabel } from '../../lib/tenders/types';
import { colors, fontSize, radius, spacing } from '../../lib/theme';
import { monoType } from '../../lib/marketingTheme';

export interface DetailProps {
  c: TenderCopy;
  tenderId: string;
  node: TenderNode;
  position: TenderPosition | null;
  price: PositionPrice | null;
  breakdowns: PositionBreakdown[];
  zoneLabels: ZoneLabel[];
  editable: boolean;
  pricesVisible: boolean;
  onNode: (patch: Partial<TenderNode>) => void;
  onPosition: (patch: Partial<TenderPosition>) => void;
  onPrice: (unitPrice: number | null, source?: PositionPrice['price_source']) => void;
  suggestions?: PriceSuggestion[];
  onBreakdown: (id: string, quantityManual: number | null) => void;
  onZoneLabel: (code: string, label: string) => void;
  onDelete: () => void;
  // Plan measures feeding this position (phase E).
  measures?: { id: string; label: string; quantity: number | null; formula: string; planId: string }[];
  onOpenMeasure?: (planId: string, measureId: string) => void;
  onMeasureOnPlan?: () => void;
  // Answering a soumission: its quantities are given, only prices are filled.
  lockQuantities?: boolean;
}

// Number field that keeps what is being typed and commits on blur / enter.
export function NumberInput({ value, onCommit, editable, placeholder, style, inputRef, onSubmitNext }: { value: number | null; onCommit: (n: number | null) => void; editable: boolean; placeholder?: string; style?: object; inputRef?: (r: TextInput | null) => void; onSubmitNext?: () => void }) {
  const [text, setText] = useState(value == null ? '' : String(value));
  // Enter commits, then the blur that follows must not save it a second time.
  const last = useRef<number | null>(value);
  useEffect(() => {
    setText(value == null ? '' : String(value));
    last.current = value;
  }, [value]);
  const commit = () => {
    const n = text.trim() === '' ? null : parseSwissNumber(text);
    if (text.trim() !== '' && n == null) return setText(value == null ? '' : String(value));
    if (n === last.current) return;
    last.current = n;
    onCommit(n);
  };
  return (
    <TextInput
      style={[kit.input, styles.num, !editable && styles.readonly, style]}
      value={text}
      onChangeText={setText}
      ref={inputRef}
      onBlur={commit}
      onSubmitEditing={() => {
        commit();
        onSubmitNext?.();
      }}
      blurOnSubmit={!onSubmitNext}
      editable={editable}
      keyboardType="decimal-pad"
      placeholder={placeholder}
      placeholderTextColor={colors.textMuted}
      selectTextOnFocus
    />
  );
}

function TextCommit({ value, onCommit, editable, multiline, placeholder }: { value: string | null; onCommit: (s: string) => void; editable: boolean; multiline?: boolean; placeholder?: string }) {
  const [text, setText] = useState(value ?? '');
  useEffect(() => setText(value ?? ''), [value]);
  return (
    <TextInput
      style={[kit.input, multiline && { minHeight: 70, textAlignVertical: 'top' }, !editable && styles.readonly]}
      value={text}
      onChangeText={setText}
      onBlur={() => text !== (value ?? '') && onCommit(text)}
      editable={editable}
      multiline={multiline}
      placeholder={placeholder}
      placeholderTextColor={colors.textMuted}
    />
  );
}

export function TenderDetail(p: DetailProps) {
  const { c, node, position, price, editable } = p;
  const [history, setHistory] = useState<AuditEntry[] | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showSource, setShowSource] = useState(false);

  useEffect(() => {
    setHistory(null);
    setShowHistory(false);
    setShowSource(false);
  }, [node.id]);

  useEffect(() => {
    if (!showHistory) return;
    const ids = [node.id, position?.id, ...p.breakdowns.map((b) => b.id)].filter(Boolean) as string[];
    auditFor(p.tenderId, ids).then(setHistory);
  }, [showHistory, node.id, position?.id, p.tenderId, p.breakdowns]);

  const gap = position ? quantityGap(position.quantity_original, position.quantity_selected_source === 'original' ? null : position.quantity_selected) : null;
  const check = position && p.breakdowns.length ? checkBreakdownSum(p.breakdowns.map((b) => b.quantity_original), position.quantity_original) : null;
  const amount = position ? lineAmount(position.quantity_selected, price?.unit_price ?? null, position.excluded) : null;
  const ref = node.display_reference ?? node.raw_number;
  const zone = (code: string) => p.zoneLabels.find((z) => z.code === code)?.label ?? null;
  const u = position ? unitLabel(position.unit) : '';
  const pick = (k: QuantitySource) => editable && position && p.onPosition({ quantity_selected_source: k });

  return (
    <View style={{ gap: spacing.lg }}>
      <View style={{ gap: spacing.sm }}>
        <View style={kit.row}>
          {node.is_reserved ? <Text style={styles.reserved}>R</Text> : null}
          {ref ? <Text style={styles.ref}>{ref}</Text> : null}
          {node.source_page ? <Text style={kit.hint}>{fill(c.sourcePage, { page: node.source_page })}</Text> : null}
          {position?.excluded ? <Chip small label={c.excluded} active onPress={() => {}} /> : null}
        </View>
        {node.needs_review ? (
          <View style={styles.warn}>
            <Feather name="alert-triangle" size={15} color="#9A6412" />
            <Text style={[kit.body, { flex: 1 }]}>{c.toReview}</Text>
            {editable ? <Btn label={c.markValidated} icon="check" variant="ok" onPress={() => p.onNode({ needs_review: false, validated_at: new Date().toISOString() })} /> : null}
          </View>
        ) : null}
        <TextCommit
          value={node.description || node.title}
          editable={editable}
          multiline
          onCommit={(text) => p.onNode({ description: text, title: text.split('\n')[0] })}
        />
      </View>

      {position ? (
        <>
          {p.lockQuantities ? (
            <View style={{ gap: 6 }}>
              <Text style={kit.fieldLabel}>{c.qtySelected}</Text>
              {position.quantity_original != null ? (
                <View style={styles.qtyLocked}>
                  <Feather name="lock" size={13} color={colors.textMuted} />
                  <Text style={[styles.qtyValue, { flex: 1 }]}>{`${formatQuantity(position.quantity_original)} ${u}`}</Text>
                  <Text style={kit.hint}>{c.useSource.original}</Text>
                </View>
              ) : (
                <NumberInput
                  value={position.quantity_manual}
                  editable={editable}
                  onCommit={(n) => p.onPosition({ quantity_manual: n, quantity_selected_source: (n == null ? 'original' : 'manual') as QuantitySource })}
                  placeholder={u}
                  style={{ width: 140 }}
                />
              )}
              <Text style={kit.hint}>{position.quantity_original != null ? c.qtyLockedHint : c.qtyBlankHint}</Text>
            </View>
          ) : (
          <View style={{ gap: 6 }}>
            <Text style={kit.fieldLabel}>{c.qtySelected}</Text>
            <QtyOption active={position.quantity_selected_source === 'original'} onPress={() => pick('original')} label={c.useSource.original} hint={c.qtyOriginalHint}>
              <Text style={styles.qtyValue}>{position.quantity_original == null ? '—' : `${formatQuantity(position.quantity_original)} ${u}`}</Text>
            </QtyOption>
            <QtyOption active={position.quantity_selected_source === 'measured'} onPress={() => position.quantity_measured != null && pick('measured')} label={c.useSource.measured} hint={c.qtyMeasuredHint} disabled={position.quantity_measured == null}>
              <Text style={styles.qtyValue}>{position.quantity_measured == null ? '—' : `${formatQuantity(position.quantity_measured)} ${u}`}</Text>
            </QtyOption>
            <MeasuresOnPlan p={p} unit={u} />
            <QtyOption active={position.quantity_selected_source === 'manual'} onPress={() => position.quantity_manual != null && pick('manual')} label={c.useSource.manual}>
              <NumberInput
                value={position.quantity_manual}
                editable={editable}
                onCommit={(n) => p.onPosition({ quantity_manual: n, ...(n != null ? { quantity_selected_source: 'manual' as QuantitySource } : { quantity_selected_source: 'original' as QuantitySource }) })}
                placeholder={u}
                style={{ width: 120 }}
              />
            </QtyOption>
            {position.quantity_manual != null ? (
              <TextCommit value={position.manual_note} editable={editable} onCommit={(manual_note) => p.onPosition({ manual_note: manual_note || null })} placeholder={c.manualNote} />
            ) : null}
            {gap && gap.delta !== 0 ? (
              <Text style={[styles.gap, { color: gap.delta > 0 ? colors.success : colors.danger }]}>
                {c.colGap} : {gap.delta > 0 ? '+' : ''}
                {formatQuantity(gap.delta)} {u} {gap.percent != null ? `(${gap.percent > 0 ? '+' : ''}${gap.percent} %)` : ''}
              </Text>
            ) : null}
          </View>
          )}

          <Field label={c.unit}>
            <View style={kit.row}>
              {Array.from(new Set([...UNIT_CHOICES, ...(position.unit && !UNIT_CHOICES.includes(position.unit) ? [position.unit] : [])])).map((un) => (
                <Chip key={un} small label={unitLabel(un)} active={position.unit === un} onPress={() => editable && p.onPosition({ unit: un })} />
              ))}
            </View>
            {position.raw_unit && position.raw_unit !== position.unit ? <Text style={kit.hint}>Document : « {position.raw_unit} »</Text> : null}
          </Field>

          {p.pricesVisible ? (
            <View style={styles.priceRow}>
              <View style={{ gap: 4 }}>
                <Text style={kit.fieldLabel}>{c.unitPrice}</Text>
                <NumberInput value={price?.unit_price ?? null} editable={editable} onCommit={p.onPrice} style={{ width: 140 }} placeholder="0.00" />
                {price?.document_unit_price != null ? <Text style={kit.hint}>Document : {formatChf(price.document_unit_price, 2)}</Text> : null}
                {price?.price_source && price.unit_price != null ? <Text style={kit.hint}>{c.priceSources[price.price_source] ?? price.price_source}</Text> : null}
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4, marginLeft: 'auto' }}>
                <Text style={kit.fieldLabel}>{c.amount}</Text>
                <Text style={styles.amount}>{amount == null ? '—' : `CHF ${formatChf(amount)}`}</Text>
              </View>
            </View>
          ) : (
            <Text style={kit.hint}>{c.priceHidden}</Text>
          )}
          {p.pricesVisible && editable && p.suggestions?.length ? (
            <View style={{ gap: 6 }}>
              <Text style={kit.fieldLabel}>{c.suggestions}</Text>
              <View style={kit.row}>
                {p.suggestions.map((sg) => (
                  <Pressable key={sg.source} onPress={() => p.onPrice(sg.unitPrice, sg.source)} style={({ pressed }) => [styles.sugg, price?.unit_price === sg.unitPrice && styles.suggOn, pressed && { opacity: 0.8 }]}>
                    <Text style={styles.suggPrice}>{formatChf(sg.unitPrice)}</Text>
                    <Text style={styles.suggLabel} numberOfLines={1}>
                      {c.suggestionLabels[sg.source] ?? sg.label}
                      {sg.source === 'history_average' ? ` ${sg.label.replace(/^\D+/, '')}` : ''} · {sg.detail}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}

          {p.breakdowns.length ? (
            <Field label={c.breakdowns}>
              <View style={styles.block}>
                {p.breakdowns.map((b) => (
                  <View key={b.id} style={styles.bdRow}>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={styles.bdCode}>{b.code}</Text>
                      <ZoneLabelInput code={b.code} label={zone(b.code)} editable={editable} c={c} onCommit={(l) => p.onZoneLabel(b.code, l)} />
                    </View>
                    <Text style={styles.bdOrig}>{b.quantity_original == null ? '—' : formatQuantity(b.quantity_original)}</Text>
                    <NumberInput value={b.quantity_manual} editable={editable} onCommit={(n) => p.onBreakdown(b.id, n)} placeholder={c.useSource.manual} style={{ width: 96 }} />
                  </View>
                ))}
                {check ? (
                  <Text style={[kit.hint, { color: check.ok ? colors.success : colors.danger }]}>
                    {check.ok ? c.breakdownCheckOk : fill(c.breakdownCheckBad, { sum: formatQuantity(check.sum), total: formatQuantity(check.total ?? 0) })}
                  </Text>
                ) : null}
              </View>
            </Field>
          ) : null}

          {editable ? (
            <Pressable onPress={() => p.onPosition({ excluded: !position.excluded })} style={styles.toggle}>
              <Feather name={position.excluded ? 'check-square' : 'square'} size={17} color={position.excluded ? colors.primary : colors.textMuted} />
              <Text style={kit.body}>{c.exclude}</Text>
            </Pressable>
          ) : null}
        </>
      ) : null}

      <View style={{ gap: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md }}>
        {node.raw_text ? (
          <>
            <Pressable onPress={() => setShowSource((v) => !v)} style={kit.row}>
              <Feather name={showSource ? 'chevron-down' : 'chevron-right'} size={15} color={colors.textMuted} />
              <Text style={kit.link}>{c.rawText}</Text>
            </Pressable>
            {showSource ? <Text style={styles.raw}>{node.raw_text}</Text> : null}
          </>
        ) : (
          <Text style={kit.hint}>{c.noSource}</Text>
        )}
        <Pressable onPress={() => setShowHistory((v) => !v)} style={kit.row}>
          <Feather name={showHistory ? 'chevron-down' : 'chevron-right'} size={15} color={colors.textMuted} />
          <Text style={kit.link}>{c.history}</Text>
        </Pressable>
        {showHistory ? (
          history == null ? null : history.length === 0 ? (
            <Text style={kit.hint}>{c.historyEmpty}</Text>
          ) : (
            history.map((h) => (
              <Text key={h.id} style={kit.hint}>
                {new Date(h.at).toLocaleString('fr-CH', { dateStyle: 'short', timeStyle: 'short' })} · {c.fields[h.field] ?? h.field} : {h.old_value ?? '—'} → {h.new_value ?? '—'}
              </Text>
            ))
          )
        ) : null}
        {editable ? <Btn label={c.deleteNode} icon="trash-2" variant="ghost" onPress={p.onDelete} /> : null}
      </View>
    </View>
  );
}

function MeasuresOnPlan({ p, unit }: { p: DetailProps; unit: string }) {
  const ac = useAssignCopy();
  const list = p.measures ?? [];
  if (!list.length && !p.onMeasureOnPlan) return null;
  return (
    <View style={styles.planBox}>
      {list.length ? (
        <Text style={[kit.eyebrow, { width: '100%' }]}>
          {ac.onPlans} · {list.length}
        </Text>
      ) : (
        <Text style={[kit.hint, { width: '100%' }]}>{ac.noMeasureYet}</Text>
      )}
      {list.map((m) => (
        <Pressable key={m.id} onPress={() => p.onOpenMeasure?.(m.planId, m.id)} style={styles.planRow}>
          <Feather name="map-pin" size={13} color={colors.slate} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.planLabel} numberOfLines={1}>
              {m.label}
            </Text>
            <Text style={kit.hint} numberOfLines={1}>
              {ac.formulas[m.formula] ?? m.formula}
            </Text>
          </View>
          <Text style={styles.planQty}>{m.quantity == null ? '—' : `${formatQuantity(m.quantity)} ${unit}`}</Text>
          <Feather name="external-link" size={13} color={colors.primary} />
        </Pressable>
      ))}
      {p.onMeasureOnPlan ? <Btn label={ac.measureBtn} icon="crosshair" variant="primary" onPress={p.onMeasureOnPlan} /> : null}
    </View>
  );
}

function QtyOption({ active, onPress, label, hint, disabled, children }: { active: boolean; onPress: () => void; label: string; hint?: string; disabled?: boolean; children: React.ReactNode }) {
  return (
    <Pressable onPress={onPress} style={[styles.qtyOpt, active && styles.qtyOptOn, disabled && { opacity: 0.55 }]}>
      <View style={[styles.radio, active && styles.radioOn]}>{active ? <View style={styles.radioDot} /> : null}</View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.qtyLabel}>{label}</Text>
        {hint ? <Text style={kit.hint}>{hint}</Text> : null}
      </View>
      {children}
    </Pressable>
  );
}

function ZoneLabelInput({ code, label, editable, c, onCommit }: { code: string; label: string | null; editable: boolean; c: TenderCopy; onCommit: (l: string) => void }) {
  const [text, setText] = useState(label ?? '');
  useEffect(() => setText(label ?? ''), [label]);
  if (!editable) return label ? <Text style={kit.hint}>{label}</Text> : null;
  return (
    <TextInput
      style={styles.zoneInput}
      value={text}
      onChangeText={setText}
      onBlur={() => text !== (label ?? '') && onCommit(text)}
      placeholder={fill(c.zoneLabel, { code })}
      placeholderTextColor={colors.textMuted}
    />
  );
}

const styles = StyleSheet.create({
  qtyLocked: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.surfaceAlt },
  planBox: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, padding: spacing.sm, borderRadius: radius.md, backgroundColor: colors.slateSoft },
  planRow: { width: '100%', flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  planLabel: { fontSize: 13, fontWeight: '700', color: colors.text },
  planQty: { fontSize: 13, fontWeight: '800', color: colors.text, fontVariant: ['tabular-nums'] },
  ref: { ...monoType, fontSize: 14, fontWeight: '800', color: colors.text },
  warn: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap', padding: spacing.md, borderRadius: radius.lg, backgroundColor: '#FBF0D9' },
  qtyOpt: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  qtyOptOn: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: colors.primary },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  sugg: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, maxWidth: 260, gap: 1 },
  suggOn: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  suggPrice: { ...monoType, fontSize: 14, fontWeight: '800', color: colors.text, fontVariant: ['tabular-nums'] },
  suggLabel: { fontSize: 11.5, color: colors.textMuted },
  priceRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, padding: spacing.md, borderRadius: radius.lg, backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border },
  reserved: { ...monoType, fontSize: 11, fontWeight: '800', color: '#fff', backgroundColor: colors.primary, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' },
  block: { gap: spacing.sm, padding: spacing.md, borderRadius: radius.lg, backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border },
  qtyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  qtyLabel: { fontSize: fontSize.sm, color: colors.text, fontWeight: '600', flexShrink: 1 },
  qtyValue: { ...monoType, fontSize: 14, color: colors.text, fontVariant: ['tabular-nums'] },
  selected: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: spacing.md, flexWrap: 'wrap' },
  selectedValue: { ...monoType, fontSize: 22, fontWeight: '800', color: colors.text, fontVariant: ['tabular-nums'] },
  selectedUnit: { fontSize: 14, fontWeight: '600', color: colors.textMuted },
  gap: { ...monoType, fontSize: 13, fontWeight: '700' },
  amount: { ...monoType, fontSize: 16, fontWeight: '800', color: colors.text, fontVariant: ['tabular-nums'] },
  num: { textAlign: 'right', ...monoType, fontVariant: ['tabular-nums'], paddingVertical: 8 },
  readonly: { backgroundColor: colors.surfaceAlt, color: colors.textMuted },
  bdRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  bdCode: { ...monoType, fontSize: 12.5, fontWeight: '800', color: colors.text },
  bdOrig: { ...monoType, fontSize: 13, color: colors.textMuted, width: 70, textAlign: 'right', fontVariant: ['tabular-nums'] },
  zoneInput: { fontSize: 12, color: colors.text, paddingVertical: 2, borderBottomWidth: 1, borderBottomColor: colors.border, minWidth: 0 },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  raw: { ...monoType, fontSize: 11.5, color: colors.textMuted, backgroundColor: colors.bg, padding: spacing.sm, borderRadius: radius.md, lineHeight: 17 },
});
