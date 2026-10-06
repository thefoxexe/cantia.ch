import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Btn, Chip, kit } from '../admin/ledger/kit';
import {
  chooseFormula,
  computeAllocation,
  defaultElement,
  displayUnit,
  elementsFor,
  formulaDef,
  paramsFromText,
  positionDimension,
  searchPositions,
  suggestPositions,
  type Element,
  type FoundParam,
  type ParamKey,
  type Params,
  type PositionLite,
} from '../../lib/tenders/allocation';
import type { Allocation, TenderPositions } from '../../lib/tenders/allocationApi';
import { formatMeasure, mainValue } from '../../lib/tenders/geometry';
import type { MeasuredObject } from '../../lib/tenders/plansApi';
import type { TenderSummary } from '../../lib/tenders/api';
import { unitLabel } from '../../lib/tenders/units';
import { useAssignCopy } from '../../lib/tenders/assignCopy';
import { fill } from '../../lib/tenders/copy';
import { colors, fontSize, radius, spacing } from '../../lib/theme';
import { monoType } from '../../lib/marketingTheme';

// « Cette mesure → ces positions » in three steps:
// 1. what was measured (wall, slab…) — ranks the positions,
// 2. its dimensions (height, thickness…) — typed once for the measure,
// 3. the positions, each with its calculation written out.

const MEASURE_DIMS: ParamKey[] = ['height', 'thickness', 'width'];

export interface AssignRow {
  positionId: string;
  formula: string;
  params: Params;
}

interface Row {
  position: PositionLite;
  formula: string;
  found: FoundParam[];
}

export function AssignPanel({
  measure,
  calibrated,
  tenders,
  tenderId,
  onTender,
  positions,
  allocations,
  activePositionId,
  onMeasureParams,
  onAssign,
  onRemove,
  onKeepActive,
}: {
  measure: MeasuredObject;
  calibrated: boolean;
  tenders: TenderSummary[];
  tenderId: string | null;
  onTender: (id: string) => void;
  positions: TenderPositions | null;
  allocations: Allocation[];
  activePositionId: string | null;
  onMeasureParams: (params: Record<string, unknown>) => void;
  onAssign: (rows: AssignRow[], useMeasured: boolean) => Promise<string | null>;
  onRemove: (a: Allocation) => void;
  onKeepActive: (a: Allocation) => void;
}) {
  const c = useAssignCopy();
  const mp = measure.params ?? {};
  const [element, setElement] = useState<Element>((mp.element as Element) ?? defaultElement(measure.kind));
  const [dims, setDims] = useState<Record<string, string>>(() => {
    const out: Record<string, string> = {};
    for (const k of [...MEASURE_DIMS, 'factor']) if (mp[k] != null) out[k] = String(mp[k]);
    return out;
  });
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [rowParams, setRowParams] = useState<Record<string, Params>>({});
  const [query, setQuery] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [useMeasured, setUseMeasured] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extra, setExtra] = useState<Row[]>([]);

  useEffect(() => {
    setChecked(new Set());
    setExtra([]);
    setQuery('');
  }, [tenderId, measure.id]);

  const dimValues: Params = useMemo(() => {
    const out: Params = {};
    for (const [k, v] of Object.entries(dims)) {
      const n = Number(String(v).replace(',', '.'));
      if (v !== '' && n > 0) out[k as ParamKey] = n;
    }
    return out;
  }, [dims]);

  const allocated = new Set(allocations.map((a) => a.position_id));
  const suggestions: Row[] = useMemo(() => {
    if (!positions) return [];
    return suggestPositions(measure.kind, element, positions.lite, 40)
      .filter((s) => !allocated.has(s.position.id))
      .map((s) => ({ position: s.position, formula: s.formula, found: s.found }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positions, element, measure.kind, allocations.length]);

  const shown = [...extra.filter((e) => !suggestions.some((s) => s.position.id === e.position.id)), ...(showAll ? suggestions : suggestions.slice(0, 6))];
  const searchResults = useMemo(() => (positions && query.trim().length >= 2 ? searchPositions(query, positions.lite, 8).filter((p) => !allocated.has(p.id)) : []), [positions, query, allocations.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const effective = (r: Row): Params => {
    const p: Params = {};
    for (const f of r.found) if (formulaDef(r.formula)?.params.includes(f.key)) p[f.key] = f.value;
    return { ...p, ...dimValues, ...(rowParams[r.position.id] ?? {}) };
  };

  // Step 2 only asks for what the positions on screen need.
  const neededDims = useMemo(() => {
    const rows = checked.size ? shown.filter((r) => checked.has(r.position.id)) : shown.slice(0, 4);
    const need = new Set<ParamKey>();
    for (const r of rows) for (const p of formulaDef(r.formula)?.params ?? []) if (MEASURE_DIMS.includes(p)) need.add(p);
    for (const k of MEASURE_DIMS) if (dims[k]) need.add(k);
    return MEASURE_DIMS.filter((k) => need.has(k));
  }, [checked, shown, dims]);

  function saveParams(next: Partial<Record<string, unknown>>) {
    const merged: Record<string, unknown> = { ...mp, element, ...next };
    for (const k of [...MEASURE_DIMS, 'factor']) {
      const raw = (next as Record<string, unknown>)[k] ?? dims[k];
      const n = Number(String(raw ?? '').replace(',', '.'));
      merged[k] = raw !== '' && raw != null && n > 0 ? n : null;
    }
    onMeasureParams(merged);
  }

  function toggle(id: string) {
    setChecked((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  function addFromSearch(p: PositionLite) {
    const formula = chooseFormula(measure.kind, positionDimension(p.unit, p.text), `${p.context} ${p.text}`, element);
    if (!formula) return;
    setExtra((e) => [{ position: p, formula, found: paramsFromText(p.text) }, ...e]);
    setChecked((s) => new Set(s).add(p.id));
    setQuery('');
  }

  const selectedRows = shown.filter((r) => checked.has(r.position.id));
  const incomplete = selectedRows.some((r) => computeAllocation(r.formula, measure, effective(r)).missing.length);

  async function assign() {
    setBusy(true);
    setError(null);
    const err = await onAssign(
      selectedRows.map((r) => ({ positionId: r.position.id, formula: r.formula, params: effective(r) })),
      useMeasured,
    );
    setBusy(false);
    if (err) return setError(err);
    setChecked(new Set());
    setExtra([]);
  }

  if (!tenders.length) {
    return (
      <View style={styles.box}>
        <Text style={styles.title}>{c.title}</Text>
        <Text style={kit.hint}>{c.noTender}</Text>
      </View>
    );
  }

  return (
    <View style={styles.box}>
      <Text style={styles.title}>{c.title}</Text>
      {tenders.length > 1 ? (
        <View style={kit.row}>
          {tenders.map((t) => (
            <Chip key={t.id} small label={t.number ? `${t.number} · ${t.name}` : t.name} active={t.id === tenderId} onPress={() => onTender(t.id)} />
          ))}
        </View>
      ) : null}

      {allocations.length ? (
        <View style={{ gap: 6 }}>
          <Text style={kit.eyebrow}>{c.assigned}</Text>
          {allocations.map((a) => {
            const p = positions?.byId.get(a.position_id);
            return (
              <View key={a.id} style={styles.done}>
                <Feather name="check-circle" size={14} color={colors.success} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.ref} numberOfLines={1}>
                    {p?.ref ?? '—'} <Text style={styles.rowTitle}>{p?.title}</Text>
                  </Text>
                  <Text style={styles.calc}>
                    {a.final_quantity == null ? '—' : `${formatMeasure(a.final_quantity, 2)} ${unitLabel(displayUnit(p?.unit ?? null, p?.text ?? ''))}`}
                    {p?.quantity_measured != null && p.quantity_measured !== a.final_quantity ? `  ·  ${fill(c.measuredTotal, { q: `${formatMeasure(p.quantity_measured, 2)} ${unitLabel(p.unit)}` })}` : ''}
                  </Text>
                </View>
                <Pressable onPress={() => onKeepActive(a)} hitSlop={6} accessibilityLabel={c.keepActive}>
                  <Feather name="target" size={15} color={activePositionId === a.position_id ? colors.primary : colors.textMuted} />
                </Pressable>
                <Pressable onPress={() => onRemove(a)} hitSlop={6} accessibilityLabel={c.remove}>
                  <Feather name="x" size={15} color={colors.textMuted} />
                </Pressable>
              </View>
            );
          })}
        </View>
      ) : null}

      {/* 1 — what */}
      <View style={styles.step}>
        <Text style={styles.stepTitle}>{c.step1}</Text>
        <View style={kit.row}>
          {elementsFor(measure.kind).map((e) => (
            <Chip
              key={e}
              small
              label={c.elements[e]}
              active={element === e}
              onPress={() => {
                setElement(e);
                saveParams({ element: e });
              }}
            />
          ))}
        </View>
      </View>

      {/* 2 — dimensions */}
      {neededDims.length ? (
        <View style={styles.step}>
          <Text style={styles.stepTitle}>{c.step2}</Text>
          <Text style={kit.hint}>{c.step2Hint}</Text>
          <View style={styles.dims}>
            {[...neededDims, 'factor' as ParamKey].map((k) => (
              <View key={k} style={styles.dim}>
                <Text style={styles.dimLabel}>{c.params[k]}</Text>
                <View style={styles.dimInputWrap}>
                  <TextInput
                    style={[styles.dimInput, k !== 'factor' && !dims[k] && styles.dimInputEmpty]}
                    value={dims[k] ?? ''}
                    onChangeText={(v) => setDims((d) => ({ ...d, [k]: v }))}
                    onBlur={() => saveParams({ [k]: dims[k] ?? '' })}
                    keyboardType="decimal-pad"
                    placeholder={k === 'factor' ? '1' : k === 'height' ? '2.60' : k === 'thickness' ? '0.20' : '0.60'}
                    placeholderTextColor={colors.textMuted}
                  />
                  <Text style={styles.dimUnit}>{c.units[k]}</Text>
                </View>
                {k === 'factor' ? <Text style={styles.dimHint}>{c.factorHint}</Text> : null}
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {/* 3 — positions */}
      <View style={styles.step}>
        <Text style={styles.stepTitle}>{c.step3}</Text>
        {!calibrated ? <Text style={[kit.hint, { color: colors.warning }]}>{c.needsScale}</Text> : <Text style={kit.hint}>{c.step3Hint}</Text>}
        {!positions ? null : shown.length === 0 ? <Text style={kit.hint}>{c.noSuggestion}</Text> : null}
        {shown.map((r) => {
          const on = checked.has(r.position.id);
          const params = effective(r);
          const res = computeAllocation(r.formula, measure, params);
          const def = formulaDef(r.formula)!;
          const unit = unitLabel(displayUnit(r.position.unit, r.position.text));
          const fromText = r.found.filter((f) => def.params.includes(f.key) && dimValues[f.key] == null && rowParams[r.position.id]?.[f.key] == null);
          return (
            <Pressable key={r.position.id} onPress={() => toggle(r.position.id)} style={[styles.row, on && styles.rowOn]}>
              <View style={[styles.check, on && styles.checkOn]}>{on ? <Feather name="check" size={12} color="#fff" /> : null}</View>
              <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
                <Text style={styles.ref} numberOfLines={1}>
                  {r.position.ref ?? '—'}
                  <Text style={styles.unitTag}>  {unit}</Text>
                </Text>
                {r.position.context ? (
                  <Text style={styles.context} numberOfLines={1}>
                    {r.position.context.split(' › ').slice(-2).join(' › ')}
                  </Text>
                ) : null}
                <Text style={styles.rowTitle} numberOfLines={2}>
                  {r.position.title}
                </Text>
                {res.missing.length ? (
                  <Text style={styles.missing}>{fill(c.missing, { list: res.missing.map((m) => c.params[m].toLowerCase()).join(', ') })}</Text>
                ) : (
                  <Text style={styles.calc}>
                    {res.steps.map((s) => (s.label === 'faces' ? `${s.value}` : s.label === 'factor' ? `${s.value}` : `${formatMeasure(s.value, 2)}${s.unit && s.unit !== '×' ? ` ${s.unit}` : ''}`)).join(' × ')}
                    {res.quantity != null ? ` = ${formatMeasure(res.quantity, 2)} ${unit}` : ''}
                  </Text>
                )}
                {fromText.length ? <Text style={styles.fromText}>{fill(c.fromText, { q: fromText.map((f) => f.quote).join(' · ') })}</Text> : null}
                {on && def.params.includes('faces') ? (
                  <View style={kit.row}>
                    {[1, 2].map((f) => (
                      <Chip key={f} small label={f === 1 ? c.faces1 : c.faces2} active={(params.faces ?? 2) === f} onPress={() => setRowParams((rp) => ({ ...rp, [r.position.id]: { ...rp[r.position.id], faces: f } }))} />
                    ))}
                  </View>
                ) : null}
                {on && def.params.includes('rate') ? (
                  <View style={[styles.dimInputWrap, { alignSelf: 'flex-start' }]}>
                    <TextInput
                      style={[styles.dimInput, { width: 70 }, params.rate == null && styles.dimInputEmpty]}
                      value={rowParams[r.position.id]?.rate != null ? String(rowParams[r.position.id]!.rate) : params.rate != null ? String(params.rate) : ''}
                      onChangeText={(v) => setRowParams((rp) => ({ ...rp, [r.position.id]: { ...rp[r.position.id], rate: Number(v.replace(',', '.')) || null } }))}
                      keyboardType="decimal-pad"
                      placeholder="85"
                      placeholderTextColor={colors.textMuted}
                    />
                    <Text style={styles.dimUnit}>kg/m³</Text>
                  </View>
                ) : null}
              </View>
            </Pressable>
          );
        })}
        {!showAll && suggestions.length > 6 ? (
          <Pressable onPress={() => setShowAll(true)}>
            <Text style={styles.link}>{fill(c.more, { n: suggestions.length - 6 })}</Text>
          </Pressable>
        ) : null}
        <View style={styles.searchWrap}>
          <Feather name="search" size={14} color={colors.textMuted} />
          <TextInput style={styles.search} value={query} onChangeText={setQuery} placeholder={c.search} placeholderTextColor={colors.textMuted} />
        </View>
        {searchResults.map((p) => {
          const ok = !!chooseFormula(measure.kind, positionDimension(p.unit, p.text), `${p.context} ${p.text}`, element);
          return (
            <Pressable key={p.id} onPress={() => ok && addFromSearch(p)} style={[styles.result, !ok && { opacity: 0.45 }]}>
              <Feather name={ok ? 'plus' : 'slash'} size={13} color={ok ? colors.primary : colors.textMuted} />
              <Text style={[kit.body, { flex: 1 }]} numberOfLines={1}>
                <Text style={styles.ref}>{p.ref} </Text>
                {p.title} · {unitLabel(displayUnit(p.unit, p.text))}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable onPress={() => setUseMeasured((v) => !v)} style={styles.toggle}>
        <View style={[styles.check, useMeasured && styles.checkOn]}>{useMeasured ? <Feather name="check" size={12} color="#fff" /> : null}</View>
        <Text style={[kit.body, { flex: 1 }]}>{c.useMeasured}</Text>
      </Pressable>
      {error ? <Text style={{ color: colors.danger, fontSize: fontSize.sm }}>{error}</Text> : null}
      <Btn
        label={selectedRows.length === 0 ? c.pickFirst : selectedRows.length === 1 ? c.assign1 : fill(c.assignN, { n: selectedRows.length })}
        icon="link"
        variant="primary"
        onPress={assign}
        disabled={busy || !selectedRows.length || incomplete}
      />
      <MeasureSummary measure={measure} />
    </View>
  );
}

function MeasureSummary({ measure }: { measure: MeasuredObject }) {
  const v = mainValue(measure.kind, measure);
  return v.value == null ? null : <Text style={[kit.hint, { textAlign: 'center' }]}>{`${measure.name ?? ''} · ${formatMeasure(v.value, measure.kind === 'count' ? 0 : 2)} ${v.unit}`}</Text>;
}

const styles = StyleSheet.create({
  box: { gap: spacing.md },
  title: { fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  step: { gap: 8, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  stepTitle: { fontSize: 13.5, fontWeight: '800', color: colors.text },
  dims: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  dim: { gap: 4, flexGrow: 1, flexBasis: 90 },
  dimLabel: { fontSize: 12, fontWeight: '700', color: colors.textMuted },
  dimHint: { fontSize: 11, color: colors.textMuted },
  dimInputWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dimInput: { flex: 1, minWidth: 56, height: 36, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 10, fontSize: 15, fontWeight: '700', color: colors.text, backgroundColor: colors.surface, fontVariant: ['tabular-nums'] },
  dimInputEmpty: { borderColor: colors.warning, backgroundColor: colors.warningSoft },
  dimUnit: { fontSize: 12.5, fontWeight: '700', color: colors.textMuted, minWidth: 14 },
  row: { flexDirection: 'row', gap: 10, padding: 10, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  rowOn: { borderColor: colors.primary, backgroundColor: colors.primarySoft + '66' },
  check: { width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginTop: 1, backgroundColor: colors.surface },
  checkOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  ref: { ...monoType, fontSize: 12.5, fontWeight: '700', color: colors.text },
  unitTag: { fontSize: 11.5, fontWeight: '700', color: colors.primary },
  context: { fontSize: 11.5, color: colors.textMuted },
  rowTitle: { fontSize: 13, fontWeight: '600', color: colors.text },
  calc: { ...monoType, fontSize: 12.5, color: colors.success, fontWeight: '700' },
  missing: { fontSize: 12.5, fontWeight: '700', color: colors.warning },
  fromText: { fontSize: 11.5, color: colors.slate, fontStyle: 'italic' },
  link: { fontSize: 13, fontWeight: '700', color: colors.primary },
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 36, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 10, backgroundColor: colors.surface },
  search: { flex: 1, fontSize: 13.5, color: colors.text, height: 34 },
  result: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6, paddingHorizontal: 4 },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  done: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 8, borderRadius: radius.md, backgroundColor: colors.successSoft },
});
