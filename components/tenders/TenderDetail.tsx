import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Btn, Chip, Field, Segmented, kit } from '../admin/ledger/kit';
import { auditFor, type AuditEntry } from '../../lib/tenders/api';
import { checkBreakdownSum, lineAmount, quantityGap } from '../../lib/tenders/calc';
import { fill, type TenderCopy } from '../../lib/tenders/copy';
import { formatChf, formatQuantity, parseSwissNumber } from '../../lib/tenders/numbers';
import { UNIT_CHOICES, unitLabel } from '../../lib/tenders/units';
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
  onPrice: (unitPrice: number | null) => void;
  onBreakdown: (id: string, quantityManual: number | null) => void;
  onZoneLabel: (code: string, label: string) => void;
  onDelete: () => void;
}

// Number field that keeps what is being typed and commits on blur / enter.
export function NumberInput({ value, onCommit, editable, placeholder, style }: { value: number | null; onCommit: (n: number | null) => void; editable: boolean; placeholder?: string; style?: object }) {
  const [text, setText] = useState(value == null ? '' : String(value));
  useEffect(() => setText(value == null ? '' : String(value)), [value]);
  const commit = () => {
    const n = text.trim() === '' ? null : parseSwissNumber(text);
    if (text.trim() !== '' && n == null) return setText(value == null ? '' : String(value));
    if (n !== value) onCommit(n);
  };
  return (
    <TextInput
      style={[kit.input, styles.num, !editable && styles.readonly, style]}
      value={text}
      onChangeText={setText}
      onBlur={commit}
      onSubmitEditing={commit}
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

  useEffect(() => {
    setHistory(null);
    setShowHistory(false);
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

  return (
    <View style={{ gap: spacing.lg }}>
      <View style={{ gap: 6 }}>
        <View style={kit.row}>
          {node.is_reserved ? <Text style={styles.reserved}>R</Text> : null}
          {ref ? <Text style={styles.ref}>{node.can_chapter && !ref.startsWith(node.can_chapter) ? `${node.can_chapter} / ${ref}` : ref}</Text> : null}
          {node.needs_review ? <Chip small label={c.toReview} active tone="bad" icon="alert-triangle" onPress={() => {}} /> : null}
          {position?.excluded ? <Chip small label={c.excluded} active onPress={() => {}} /> : null}
        </View>
        <Field label={c.title}>
          <TextCommit value={node.title} editable={editable} onCommit={(title) => p.onNode({ title })} multiline />
        </Field>
        {node.description || editable ? (
          <Field label={c.description}>
            <TextCommit value={node.description} editable={editable} onCommit={(description) => p.onNode({ description })} multiline />
          </Field>
        ) : null}
        {node.needs_review && editable ? <Btn label={c.markValidated} icon="check" variant="ok" onPress={() => p.onNode({ needs_review: false, validated_at: new Date().toISOString() })} /> : null}
      </View>

      {position ? (
        <>
          <View style={styles.block}>
            <View style={styles.qtyRow}>
              <Text style={styles.qtyLabel}>{c.qtyOriginal}</Text>
              <Text style={styles.qtyValue}>{position.quantity_original == null ? '—' : `${formatQuantity(position.quantity_original)} ${unitLabel(position.unit)}`}</Text>
            </View>
            <Text style={kit.hint}>{c.qtyOriginalHint}</Text>
            <View style={styles.qtyRow}>
              <Text style={styles.qtyLabel}>{c.qtyMeasured}</Text>
              <Text style={styles.qtyValue}>{position.quantity_measured == null ? '—' : `${formatQuantity(position.quantity_measured)} ${unitLabel(position.unit)}`}</Text>
            </View>
            <Text style={kit.hint}>{c.qtyMeasuredHint}</Text>
            <View style={styles.qtyRow}>
              <Text style={styles.qtyLabel}>{c.qtyManual}</Text>
              <NumberInput
                value={position.quantity_manual}
                editable={editable}
                onCommit={(n) => p.onPosition({ quantity_manual: n, ...(n != null ? { quantity_selected_source: 'manual' as QuantitySource } : {}) })}
                style={{ width: 130 }}
              />
            </View>
            {position.quantity_manual != null || position.manual_note ? (
              <TextCommit value={position.manual_note} editable={editable} onCommit={(manual_note) => p.onPosition({ manual_note: manual_note || null })} placeholder={c.manualNote} />
            ) : null}
            <Field label={c.qtySelected}>
              <Segmented
                value={position.quantity_selected_source}
                options={(['original', 'measured', 'manual'] as QuantitySource[]).map((k) => ({ key: k, label: c.useSource[k] }))}
                onChange={(k) => editable && p.onPosition({ quantity_selected_source: k })}
              />
            </Field>
            <View style={styles.selected}>
              <Text style={styles.selectedValue}>
                {position.quantity_selected == null ? '—' : formatQuantity(position.quantity_selected)} <Text style={styles.selectedUnit}>{unitLabel(position.unit)}</Text>
              </Text>
              {gap ? (
                <Text style={[styles.gap, { color: gap.delta === 0 ? colors.textMuted : gap.delta > 0 ? colors.success : colors.danger }]}>
                  {gap.delta > 0 ? '+' : ''}
                  {formatQuantity(gap.delta)} {gap.percent != null ? `(${gap.percent > 0 ? '+' : ''}${gap.percent} %)` : ''}
                </Text>
              ) : null}
            </View>
          </View>

          <Field label={c.unit}>
            <View style={kit.row}>
              {Array.from(new Set([...UNIT_CHOICES, ...(position.unit && !UNIT_CHOICES.includes(position.unit) ? [position.unit] : [])])).map((u) => (
                <Chip key={u} small label={unitLabel(u)} active={position.unit === u} onPress={() => editable && p.onPosition({ unit: u })} />
              ))}
            </View>
            {position.raw_unit && position.raw_unit !== position.unit ? <Text style={kit.hint}>Document : « {position.raw_unit} »</Text> : null}
          </Field>

          {p.pricesVisible ? (
            <View style={styles.block}>
              <View style={styles.qtyRow}>
                <Text style={styles.qtyLabel}>{c.unitPrice}</Text>
                <NumberInput value={price?.unit_price ?? null} editable={editable} onCommit={p.onPrice} style={{ width: 130 }} />
              </View>
              {price?.document_unit_price != null ? <Text style={kit.hint}>Document : {formatChf(price.document_unit_price, 2)}</Text> : null}
              <View style={styles.qtyRow}>
                <Text style={styles.qtyLabel}>{c.amount}</Text>
                <Text style={styles.amount}>{amount == null ? '—' : `CHF ${formatChf(amount)}`}</Text>
              </View>
            </View>
          ) : (
            <Text style={kit.hint}>{c.priceHidden}</Text>
          )}

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
                    <NumberInput value={b.quantity_manual} editable={editable} onCommit={(n) => p.onBreakdown(b.id, n)} placeholder={c.qtyManual} style={{ width: 96 }} />
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

      <Field label={c.provenance}>
        <Text style={kit.body}>{node.source_page ? fill(c.sourcePage, { page: node.source_page }) : c.noSource}</Text>
        {node.raw_text ? <Text style={styles.raw}>{node.raw_text}</Text> : null}
      </Field>

      <View style={{ gap: spacing.sm }}>
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
      </View>

      {editable ? <Btn label={c.deleteNode} icon="trash-2" variant="bad" onPress={p.onDelete} /> : null}
    </View>
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
  ref: { ...monoType, fontSize: 13, fontWeight: '700', color: colors.text },
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
