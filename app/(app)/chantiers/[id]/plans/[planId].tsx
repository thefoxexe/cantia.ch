import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useProject } from '../../../../../lib/useProject';
import { AppScreen, LoadingScreen } from '../../../../../components/ui';
import { Btn, Chip, Field, Sheet, kit } from '../../../../../components/admin/ledger/kit';
import { MEASURE_COLORS, PlanCanvas, type Tool } from '../../../../../components/tenders/PlanCanvas';
import { canEditTenders, listTenders, type TenderSummary } from '../../../../../lib/tenders/api';
import { AssignPanel, type AssignRow } from '../../../../../components/tenders/AssignPanel';
import { allocationsForObjects, createAllocations, loadTenderPositions, removeAllocation, updateAllocation, useMeasuredQuantity, type Allocation, type TenderPositions } from '../../../../../lib/tenders/allocationApi';
import { defaultElement, displayUnit, formulaDef, measureModes, paramsFromText, type Params } from '../../../../../lib/tenders/allocation';
import { TargetBar, type Target } from '../../../../../components/tenders/TargetBar';
import { unitLabel } from '../../../../../lib/tenders/units';
import { useAssignCopy } from '../../../../../lib/tenders/assignCopy';
import { distancePt, formatMeasure, impliedScale, mainValue, parseScale, type Calibration, type MeasureKind, type Point } from '../../../../../lib/tenders/geometry';
import { createMeasure, loadPlan, pageObjects, setCalibration, setMeasureDeleted, updateMeasure, updatePlan, type LoadedPlan, type MeasuredObject, type PlanPage } from '../../../../../lib/tenders/plansApi';
import { usePlanCopy } from '../../../../../lib/tenders/planCopy';
import { fill } from '../../../../../lib/tenders/copy';
import { colors, fontSize, radius, spacing } from '../../../../../lib/theme';
import { monoType } from '../../../../../lib/marketingTheme';

// « Mesurer sur plan » — desktop workspace: PDF page + SVG layer, tools in a
// bar on top, the measures of the page on the right. Every change is saved
// at once; undo / redo replays the saved actions.

type Action =
  | { t: 'create'; id: string }
  | { t: 'delete'; id: string }
  | { t: 'reshape'; id: string; before: Point[]; after: Point[] }
  | { t: 'calibrate'; pageId: string; before: Calibration | null; after: Calibration | null };

const TOOLS: { key: Tool; icon: keyof typeof Feather.glyphMap }[] = [
  { key: 'select', icon: 'mouse-pointer' },
  { key: 'distance', icon: 'minus' },
  { key: 'polyline', icon: 'activity' },
  { key: 'polygon', icon: 'square' },
  { key: 'perimeter', icon: 'hexagon' },
  { key: 'count', icon: 'hash' },
];

const KIND_ICON: Record<MeasureKind, keyof typeof Feather.glyphMap> = { distance: 'minus', polyline: 'activity', polygon: 'square', perimeter: 'hexagon', count: 'hash' };

export default function PlanMeasureScreen() {
  const c = usePlanCopy();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { id, planId, measure: focusMeasure, tender: fromTender, position: fromPosition } = useLocalSearchParams<{ id: string; planId: string; measure?: string; tender?: string; position?: string }>();
  const { project } = useProject(id);
  const [data, setData] = useState<LoadedPlan | null>(null);
  const [revisionId, setRevisionId] = useState<string | null>(null);
  const [pageIdx, setPageIdx] = useState(0);
  const [objects, setObjects] = useState<MeasuredObject[]>([]);
  const [editable, setEditable] = useState(false);
  const [tool, setTool] = useState<Tool>('select');
  const [zoom, setZoom] = useState(1);
  const [color, setColor] = useState(MEASURE_COLORS[0]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [past, setPast] = useState<Action[]>([]);
  const [future, setFuture] = useState<Action[]>([]);
  const [saving, setSaving] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [calSheet, setCalSheet] = useState<{ pts: Point[] | null } | null>(null);
  const ac = useAssignCopy();
  const [tenders, setTenders] = useState<TenderSummary[]>([]);
  const [tenderId, setTenderId] = useState<string | null>(null);
  const [tp, setTp] = useState<TenderPositions | null>(null);
  const [allocs, setAllocs] = useState<Allocation[]>([]);
  // « Vous mesurez pour… »: every new measure drawn the target's way is
  // linked to that position straight away (opened from the métré, or a
  // position kept active from the panel).
  const [target, setTarget] = useState<Omit<Target, 'measured' | 'count' | 'ref' | 'title' | 'unit' | 'quantityOriginal'> | null>(null);
  const targetDone = useRef(false);

  const desktop = Platform.OS === 'web' && width >= 900;
  const wide = width >= 1180;

  const load = useCallback(
    async (rev?: string | null) => {
      const { data: d, error: err } = await loadPlan(planId, rev);
      if (err) setError(err);
      setData(d);
      setObjects(d?.objects ?? []);
      // Opened from the métré on one measure: show its page, select it.
      const target = focusMeasure && d?.objects.find((o) => o.id === focusMeasure);
      if (target && d) {
        setPageIdx(Math.max(0, d.pages.findIndex((pg) => pg.id === target.plan_page_id)));
        setSelectedId(target.id);
      }
      if (d && !rev) setRevisionId(d.plan.active_revision_id ?? d.revisions[0]?.id ?? null);
    },
    [planId, focusMeasure],
  );

  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    if (project) canEditTenders(project.organization_id).then(setEditable);
  }, [project]);
  useEffect(() => {
    listTenders(id).then(({ tenders: list }) => {
      setTenders(list);
      setTenderId((cur) => cur ?? (fromTender && list.some((t) => t.id === fromTender) ? fromTender : (list.find((t) => t.positions > 0) ?? list[0])?.id) ?? null);
    });
  }, [id]);
  const reloadPositions = useCallback(async () => {
    if (tenderId) setTp(await loadTenderPositions(tenderId));
  }, [tenderId]);
  useEffect(() => {
    setTp(null);
    reloadPositions();
  }, [reloadPositions]);
  const objectIds = objects.map((o) => o.id).join(',');
  const reloadAllocs = useCallback(async () => {
    setAllocs(await allocationsForObjects(objectIds ? objectIds.split(',') : []));
  }, [objectIds]);
  useEffect(() => {
    reloadAllocs();
  }, [reloadAllocs]);

  // Opened from a position of the métré: set it as the target once.
  useEffect(() => {
    if (targetDone.current || !fromPosition || !tp || tp.bundle.tender.id !== fromTender) return;
    const p = tp.byId.get(fromPosition);
    if (!p) return;
    targetDone.current = true;
    startTarget(fromPosition);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tp, fromPosition, fromTender]);

  function startTarget(positionId: string, formula?: string, keep: Params = {}) {
    const p = tp?.byId.get(positionId);
    if (!p) return;
    let modes = measureModes(p);
    if (formula && !modes.some((m) => m.formula === formula)) {
      const def = formulaDef(formula);
      if (def) modes = [{ kind: def.kinds[0], element: defaultElement(def.kinds[0]), formula }, ...modes];
    }
    if (!modes.length) return setError(ac.noSuggestion);
    const modeIdx = Math.max(0, formula ? modes.findIndex((m) => m.formula === formula) : 0);
    const params: Params = { ...keep };
    for (const f of paramsFromText(p.text)) if (params[f.key] == null) params[f.key] = f.value;
    setTarget({ positionId, modes, modeIdx, params });
    setTool(modes[modeIdx].kind);
    setSelectedId(null);
  }

  const targetView: Target | null = useMemo(() => {
    if (!target) return null;
    const p = tp?.byId.get(target.positionId);
    return {
      ...target,
      ref: p?.ref ?? '',
      title: p?.title ?? '',
      unit: unitLabel(displayUnit(p?.unit ?? null, p?.text ?? '')),
      quantityOriginal: p?.quantity_original ?? null,
      measured: p?.quantity_measured ?? null,
      count: allocs.filter((a) => a.position_id === target.positionId).length,
    };
  }, [target, tp, allocs]);

  const page: PlanPage | null = data?.pages[pageIdx] ?? null;
  const isActiveRev = !!data && revisionId === data.plan.active_revision_id;
  const canDraw = editable && desktop && isActiveRev;
  const pageObjs = useMemo(() => objects.filter((o) => o.plan_page_id === page?.id), [objects, page?.id]);
  const selected = pageObjs.find((o) => o.id === selectedId) ?? null;

  // No scale read on the plan: ask for a calibration once per page.
  const askedCal = useRef(new Set<string>());
  useEffect(() => {
    if (!page || !canDraw || page.meters_per_pt != null || askedCal.current.has(page.id)) return;
    askedCal.current.add(page.id);
    setCalSheet({ pts: null });
  }, [page, canDraw]);


  const track = useCallback(async <T,>(p: Promise<T>): Promise<T> => {
    setSaving((n) => n + 1);
    try {
      return await p;
    } finally {
      setSaving((n) => n - 1);
    }
  }, []);

  const record = (a: Action) => {
    setPast((p) => [...p.slice(-99), a]);
    setFuture([]);
  };

  // ---- actions ------------------------------------------------------------
  const onComplete = useCallback(
    async (t: Tool, pts: Point[]) => {
      if (!page) return;
      if (t === 'calibrate') return setCalSheet({ pts });
      if (t === 'select') return;
      setError(null);
      const mode = target ? target.modes[target.modeIdx] : null;
      const forTarget = !!mode && formulaDef(mode.formula)!.kinds.includes(t);
      // The next wall usually has the same height: dimensions carry over.
      const previous = [...objects].reverse().find((o) => o.kind === t && o.params && Object.keys(o.params).length);
      const measureParams = forTarget ? { element: mode!.element, ...dimsOf(target!.params) } : previous?.params ?? {};
      const { object, error: err } = await track(createMeasure(page.id, t, pts, { color, params: measureParams }));
      if (err || !object) return setError(err ?? 'Erreur');
      setObjects((o) => [...o, object]);
      setSelectedId(object.id);
      record({ t: 'create', id: object.id });
      if (forTarget) {
        const first = !allocs.some((a) => a.position_id === target!.positionId);
        const { error: aErr } = await track(createAllocations([{ positionId: target!.positionId, measuredObjectId: object.id, formula: mode!.formula, params: target!.params }]));
        if (aErr) setError(aErr);
        else if (first) await track(useMeasuredQuantity([target!.positionId]));
        await Promise.all([reloadAllocs(), reloadPositions()]);
      }
    },
    [page, color, track, objects, target, allocs, reloadAllocs, reloadPositions],
  );

  const onReshape = useCallback(
    async (oid: string, pts: Point[]) => {
      const before = objects.find((o) => o.id === oid)?.geometry;
      if (!before) return;
      const { object, error: err } = await track(updateMeasure(oid, { geometry: pts }));
      if (err || !object) return setError(err ?? 'Erreur');
      setObjects((o) => o.map((x) => (x.id === oid ? object : x)));
      record({ t: 'reshape', id: oid, before, after: pts });
    },
    [objects, track],
  );

  async function removeMeasure(oid: string) {
    const { error: err } = await track(setMeasureDeleted(oid, true));
    if (err) return setError(err);
    setObjects((o) => o.filter((x) => x.id !== oid));
    setSelectedId(null);
    record({ t: 'delete', id: oid });
  }

  async function applyCalibration(cal: Calibration | null, remember = true) {
    if (!page) return;
    const before = page.calibration;
    const { page: updated, error: err } = await track(setCalibration(page.id, cal));
    if (err || !updated) return setError(err ?? 'Erreur');
    setData((d) => (d ? { ...d, pages: d.pages.map((p) => (p.id === updated.id ? updated : p)) } : d));
    const fresh = await pageObjects(page.id);
    setObjects((o) => [...o.filter((x) => x.plan_page_id !== page.id), ...fresh]);
    if (remember) record({ t: 'calibrate', pageId: page.id, before, after: cal });
  }

  async function replay(a: Action, direction: 'undo' | 'redo') {
    const back = direction === 'undo';
    if (a.t === 'create' || a.t === 'delete') {
      const deleted = (a.t === 'create') === back;
      const { object, error: err } = await track(setMeasureDeleted(a.id, deleted));
      if (err) return setError(err);
      setObjects((o) => (deleted ? o.filter((x) => x.id !== a.id) : object ? [...o.filter((x) => x.id !== a.id), object] : o));
      if (deleted && selectedId === a.id) setSelectedId(null);
    } else if (a.t === 'reshape') {
      const { object, error: err } = await track(updateMeasure(a.id, { geometry: back ? a.before : a.after }));
      if (err || !object) return setError(err ?? 'Erreur');
      setObjects((o) => o.map((x) => (x.id === a.id ? object : x)));
    } else if (a.t === 'calibrate' && page?.id === a.pageId) {
      await applyCalibration(back ? a.before : a.after, false);
    }
  }

  async function undo() {
    const a = past[past.length - 1];
    if (!a) return;
    setPast((p) => p.slice(0, -1));
    setFuture((f) => [a, ...f]);
    await replay(a, 'undo');
  }
  async function redo() {
    const a = future[0];
    if (!a) return;
    setFuture((f) => f.slice(1));
    setPast((p) => [...p, a]);
    await replay(a, 'redo');
  }

  // ⌘Z / Ctrl+Z, ⇧⌘Z / Ctrl+Y, Delete on the selected measure, tool letters.
  const keys = useRef({ undo, redo, removeMeasure, selectedId, canDraw });
  keys.current = { undo, redo, removeMeasure, selectedId, canDraw };
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
      const k = keys.current;
      if (!k.canDraw) return;
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) k.redo();
        else k.undo();
      } else if (mod && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        k.redo();
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && k.selectedId) {
        e.preventDefault();
        k.removeMeasure(k.selectedId);
      } else if (!mod) {
        const map: Record<string, Tool> = { v: 'select', d: 'distance', l: 'polyline', s: 'polygon', p: 'perimeter', c: 'count' };
        if (map[e.key.toLowerCase()]) setTool(map[e.key.toLowerCase()]);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (!data || !project) {
    return (
      <AppScreen>
        <LoadingScreen />
      </AppScreen>
    );
  }

  const scale = impliedScale(page?.meters_per_pt ?? null);
  const totals = pageTotals(pageObjs);
  const backTo = `/(app)/chantiers/${id}/metre`;

  const toolbar = canDraw ? (
    <View style={styles.toolbar}>
      <View style={styles.toolGroup}>
        {TOOLS.map((t) => (
          <Pressable
            key={t.key}
            onPress={() => setTool(t.key)}
            style={[styles.tool, tool === t.key && styles.toolOn]}
            accessibilityLabel={c.tools[t.key]}
          >
            <Feather name={t.icon} size={15} color={tool === t.key ? '#fff' : colors.text} />
            {wide || tool === t.key ? <Text style={[styles.toolText, tool === t.key && { color: '#fff' }]}>{c.tools[t.key]}</Text> : null}
          </Pressable>
        ))}
      </View>
      <View style={styles.toolGroup}>
        {MEASURE_COLORS.map((col) => (
          <Pressable key={col} onPress={() => setColor(col)} style={[styles.swatch, { backgroundColor: col }, color === col && styles.swatchOn]} accessibilityLabel={c.color} />
        ))}
      </View>
      <View style={styles.toolGroup}>
        <IconBtn icon="corner-up-left" label={c.undo} onPress={undo} disabled={!past.length} />
        <IconBtn icon="corner-up-right" label={c.redo} onPress={redo} disabled={!future.length} />
      </View>
    </View>
  ) : null;

  const zoomBar = (
    <View style={styles.zoomBar}>
      <IconBtn icon="zoom-out" label={c.zoomOut} onPress={() => setZoom((z) => Math.max(0.5, z / 1.25))} />
      <Text style={styles.zoomText}>{Math.round(zoom * 100)}%</Text>
      <IconBtn icon="zoom-in" label={c.zoomIn} onPress={() => setZoom((z) => Math.min(8, z * 1.25))} />
      <IconBtn icon="maximize" label={c.fit} onPress={() => setZoom(1)} />
    </View>
  );

  const cal = page?.calibration ?? null;
  const scaleSource = !cal ? null : cal.method === 'two_points' ? c.scaleFromDim : cal.source === 'pdf' ? c.scaleFromPdf : c.scaleTyped;
  const scaleBadge = (
    <View style={styles.scaleWrap}>
      {scale ? (
        <View style={styles.scaleBadge}>
          <Feather name="check-circle" size={13} color={colors.success} />
          <Text style={[styles.scaleText, { color: colors.success }]}>
            {c.scale} {cal?.method === 'scale' ? `1:${cal.scale}` : fill(c.scaleApprox, { n: scale })}
          </Text>
          {scaleSource ? <Text style={styles.scaleSource}>· {scaleSource}</Text> : null}
        </View>
      ) : (
        <View style={[styles.scaleBadge, styles.scaleBadgeWarn]}>
          <Feather name="alert-triangle" size={13} color={colors.warning} />
          <Text style={[styles.scaleText, { color: colors.warning }]}>{c.notCalibrated}</Text>
        </View>
      )}
      {canDraw ? <Btn label={scale ? c.changeScale : c.calibrateBtn} icon="sliders" variant={scale ? 'secondary' : 'primary'} onPress={() => setCalSheet({ pts: null })} /> : null}
    </View>
  );

  const panel = (
    <PanelBox desktop={desktop}>
      {selected ? (
        <MeasureDetail
          key={selected.id}
          o={selected}
          editable={canDraw}
          linked={allocs.filter((a) => a.measured_object_id === selected.id).length}
          onSave={async (patch) => {
            const { object, error: err } = await track(updateMeasure(selected.id, patch));
            if (err || !object) return setError(err ?? 'Erreur');
            setObjects((o) => o.map((x) => (x.id === object.id ? object : x)));
          }}
          onDelete={() => removeMeasure(selected.id)}
          onClose={() => setSelectedId(null)}
        >
          {canDraw ? (
            <AssignPanel
              measure={selected}
              calibrated={!!page?.meters_per_pt}
              tenders={tenders}
              tenderId={tenderId}
              onTender={setTenderId}
              positions={tp}
              allocations={allocs.filter((a) => a.measured_object_id === selected.id && a.tender_id === tenderId)}
              activePositionId={target?.positionId ?? null}
              onMeasureParams={async (params) => {
                const { object, error: err } = await track(updateMeasure(selected.id, { params }));
                if (err || !object) return setError(err ?? 'Erreur');
                setObjects((o) => o.map((x) => (x.id === object.id ? object : x)));
                // Links of this measure follow its new dimensions.
                const dims = Object.fromEntries(Object.entries(params).filter(([k, v]) => ['height', 'thickness', 'width', 'factor'].includes(k) && v != null)) as Params;
                const mine = allocs.filter((a) => a.measured_object_id === selected.id);
                if (mine.length) {
                  await track(Promise.all(mine.map((a) => updateAllocation(a.id, { params: { ...a.params, ...dims } }))));
                  await Promise.all([reloadAllocs(), reloadPositions()]);
                }
              }}
              onAssign={async (rows: AssignRow[], useMeasured) => {
                const { error: err } = await track(createAllocations(rows.map((r) => ({ ...r, measuredObjectId: selected.id }))));
                if (err) return err;
                if (useMeasured) await track(useMeasuredQuantity(rows.map((r) => r.positionId)));
                await Promise.all([reloadAllocs(), reloadPositions()]);
                return null;
              }}
              onRemove={async (a) => {
                const { error: err } = await track(removeAllocation(a.id));
                if (err) setError(err);
                if (target?.positionId === a.position_id && allocs.filter((x) => x.position_id === a.position_id).length <= 1) setTarget(null);
                await Promise.all([reloadAllocs(), reloadPositions()]);
              }}
              onKeepActive={(a) => {
                if (target?.positionId === a.position_id) return setTarget(null);
                startTarget(a.position_id, a.formula, a.params);
              }}
            />
          ) : null}
        </MeasureDetail>
      ) : null}
      <View style={{ gap: 6 }}>
        <Text style={kit.eyebrow}>{c.totals}</Text>
        <View style={styles.totals}>
          <Total label={c.length} value={totals.length} unit="m" />
          <Total label={c.area} value={totals.area} unit="m²" />
          <Total label={c.perimeterLabel} value={totals.perimeter} unit="m" />
          <Total label={c.countLabel} value={totals.count} unit="pce" decimals={0} />
        </View>
      </View>
      <View style={{ gap: 4 }}>
        <Text style={kit.eyebrow}>
          {c.list} · {pageObjs.length}
        </Text>
        {pageObjs.length === 0 ? <Text style={kit.hint}>{c.listEmpty}</Text> : null}
        {pageObjs.map((o) => {
          const v = mainValue(o.kind, o);
          return (
            <Pressable
              key={o.id}
              onPress={() => {
                setSelectedId(o.id);
                setTool('select');
              }}
              style={[styles.row, o.id === selectedId && styles.rowOn]}
            >
              <View style={[styles.rowDot, { backgroundColor: o.color || colors.primary }]}>
                <Feather name={KIND_ICON[o.kind]} size={11} color="#fff" />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.rowName} numberOfLines={1}>
                  {o.name}
                  {o.zone ? <Text style={kit.hint}> · {o.zone}</Text> : null}
                </Text>
                <Text style={kit.hint} numberOfLines={1}>
                  {c.kindsShort[o.kind]}
                  {o.note ? ` · ${o.note}` : ''}
                </Text>
              </View>
              {allocs.some((a) => a.measured_object_id === o.id) ? <Feather name="link" size={12} color={colors.success} /> : null}
              <Text style={styles.rowValue}>{v.value == null ? '—' : `${formatMeasure(v.value, o.kind === 'count' ? 0 : 2)} ${v.unit}`}</Text>
            </Pressable>
          );
        })}
      </View>
      {canDraw ? <Text style={[kit.hint, { marginTop: spacing.sm }]}>{c.shortcuts}</Text> : null}
    </PanelBox>
  );

  return (
    <AppScreen>
      <View style={styles.screen}>
        {/* Header */}
        <View style={styles.head}>
          <Pressable onPress={() => router.push(backTo as any)} style={styles.back} accessibilityLabel={c.back}>
            <Feather name="arrow-left" size={18} color={colors.text} />
          </Pressable>
          <View style={{ flex: 1, minWidth: 160 }}>
            <Text style={styles.title} numberOfLines={1}>
              {data.plan.number ? <Text style={styles.number}>{data.plan.number} · </Text> : null}
              {data.plan.name}
            </Text>
            <Text style={kit.hint} numberOfLines={1}>
              {saving ? c.saving : c.saved}
              {error ? <Text style={{ color: colors.danger }}> · {error}</Text> : null}
            </Text>
          </View>
          {data.revisions.length > 1 ? (
            <View style={kit.row}>
              {data.revisions.map((r) => (
                <Chip
                  key={r.id}
                  small
                  label={r.id === data.plan.active_revision_id ? `${r.label} (${c.active})` : r.label}
                  active={r.id === revisionId}
                  onPress={() => {
                    setRevisionId(r.id);
                    setPageIdx(0);
                    setSelectedId(null);
                    setPast([]);
                    setFuture([]);
                    load(r.id);
                  }}
                />
              ))}
            </View>
          ) : null}
          {data.pages.length > 1 ? (
            <View style={[kit.row, { gap: 4 }]}>
              <IconBtn icon="chevron-left" label={c.page} onPress={() => setPageIdx((i) => Math.max(0, i - 1))} disabled={pageIdx === 0} />
              <Text style={styles.zoomText}>{fill(c.pageOf, { n: pageIdx + 1, total: data.pages.length })}</Text>
              <IconBtn icon="chevron-right" label={c.page} onPress={() => setPageIdx((i) => Math.min(data.pages.length - 1, i + 1))} disabled={pageIdx >= data.pages.length - 1} />
            </View>
          ) : null}
          {scaleBadge}
        </View>

        {targetView && canDraw ? (
          <TargetBar
            key={`${targetView.positionId}:${targetView.modeIdx}`}
            t={targetView}
            onMode={(i) => {
              setTarget((tg) => (tg ? { ...tg, modeIdx: i } : tg));
              setTool(target!.modes[i].kind);
            }}
            onParams={async (params) => {
              setTarget((tg) => (tg ? { ...tg, params } : tg));
              // Links already drawn for this position follow the new figures.
              const mode = target!.modes[target!.modeIdx];
              const mine = allocs.filter((x) => x.position_id === target!.positionId && x.formula === mode.formula);
              if (mine.length) {
                await track(Promise.all(mine.map((x) => updateAllocation(x.id, { params: { ...x.params, ...params } }))));
                await Promise.all([reloadAllocs(), reloadPositions()]);
              }
            }}
            onStop={() => {
              setTarget(null);
              setTool('select');
            }}
            onBack={fromTender ? () => router.push(`/(app)/chantiers/${id}/metres/${fromTender}?position=${target!.positionId}` as any) : undefined}
          />
        ) : null}
        {toolbar}
        {canDraw && tool === 'calibrate' ? (
          <View style={[styles.help, styles.picking]}>
            <Feather name="crosshair" size={14} color={colors.slate} />
            <Text style={[styles.pickingText, { flex: 1 }]}>{c.pickingDim}</Text>
            <Btn label={c.cancelPick} variant="ghost" onPress={() => setTool('select')} />
          </View>
        ) : canDraw ? (
          <View style={styles.help}>
            <Feather name="info" size={13} color={colors.textMuted} />
            <Text style={[kit.hint, { flex: 1 }]}>{c.toolHelp[tool]}</Text>
            {!page?.meters_per_pt ? (
              <Pressable onPress={() => setCalSheet({ pts: null })}>
                <Text style={styles.link}>{c.calibrateFirst}</Text>
              </Pressable>
            ) : null}
          </View>
        ) : (
          <View style={styles.help}>
            <Feather name="eye" size={13} color={colors.textMuted} />
            <Text style={[kit.hint, { flex: 1 }]}>{!isActiveRev ? c.oldRevision : c.desktopOnly}</Text>
            {!isActiveRev && editable && revisionId ? (
              <Btn
                label={c.makeActive}
                variant="ghost"
                onPress={async () => {
                  await updatePlan(data.plan.id, { active_revision_id: revisionId });
                  load(revisionId);
                }}
              />
            ) : null}
          </View>
        )}

        <BodyBox desktop={desktop}>
          <View style={desktop ? styles.canvasWrap : [styles.canvasPhone, { height: page ? Math.min(640, Math.max(240, ((width - 24) * page.height_pt) / page.width_pt + 24)) : 320 }]}>
            {page && data.url ? (
              <PlanCanvas
                url={data.url}
                pageIndex={page.page_index}
                page={page}
                mpp={page.meters_per_pt}
                zoom={zoom}
                onZoom={setZoom}
                tool={canDraw ? tool : 'select'}
                objects={pageObjs}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onComplete={onComplete}
                onReshape={canDraw ? onReshape : () => {}}
                color={color}
                drawHint={c.escHint}
                onEscape={() => {
                  if (tool === 'calibrate') return setTool('select');
                  if (selectedId) return setSelectedId(null);
                  if (!target && tool !== 'select') setTool('select');
                }}
              />
            ) : (
              <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
            )}
            <View style={styles.zoomFloat}>{zoomBar}</View>
          </View>
          {panel}
        </BodyBox>
      </View>

      {calSheet && page ? (
        <CalibrationSheet
          page={page}
          pts={calSheet.pts}
          onPick={() => {
            setCalSheet(null);
            setTool('calibrate');
          }}
          onClose={() => {
            setCalSheet(null);
            if (tool === 'calibrate') setTool('select');
          }}
          onApply={async (cal) => {
            await applyCalibration(cal);
            setCalSheet(null);
            setTool('select');
          }}
        />
      ) : null}
    </AppScreen>
  );
}

// Desktop: plan and panel side by side, each scrolling on its own.
// Phone: one scrolling column, plan on top with a fixed height.
function BodyBox({ desktop, children }: { desktop: boolean; children: React.ReactNode }) {
  if (desktop) return <View style={styles.body}>{children}</View>;
  return (
    <ScrollView style={styles.bodyPhone} contentContainerStyle={{ flexGrow: 1 }}>
      {children}
    </ScrollView>
  );
}

function PanelBox({ desktop, children }: { desktop: boolean; children: React.ReactNode }) {
  if (desktop) {
    return (
      <ScrollView style={styles.panel} contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
        {children}
      </ScrollView>
    );
  }
  return <View style={[styles.panelBelow, { padding: spacing.lg, gap: spacing.md }]}>{children}</View>;
}

const dimsOf = (p: Params) => Object.fromEntries(Object.entries(p).filter(([k, v]) => ['height', 'thickness', 'width', 'factor'].includes(k) && v != null));

function pageTotals(objs: MeasuredObject[]) {
  let length = 0;
  let area = 0;
  let perimeter = 0;
  let count = 0;
  for (const o of objs) {
    if (o.kind === 'distance' || o.kind === 'polyline') length += o.length_m ?? 0;
    else if (o.kind === 'polygon') area += o.area_m2 ?? 0;
    else if (o.kind === 'perimeter') perimeter += o.perimeter_m ?? 0;
    else count += o.count ?? 0;
  }
  return { length, area, perimeter, count };
}

function Total({ label, value, unit, decimals = 2 }: { label: string; value: number; unit: string; decimals?: number }) {
  return (
    <View style={[styles.total, !value && { opacity: 0.5 }]}>
      <Text style={kit.hint}>{label}</Text>
      <Text style={styles.totalValue}>
        {formatMeasure(value, decimals)} <Text style={styles.totalUnit}>{unit}</Text>
      </Text>
    </View>
  );
}

function IconBtn({ icon, label, onPress, disabled }: { icon: keyof typeof Feather.glyphMap; label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.7 }, disabled && { opacity: 0.35 }]} accessibilityLabel={label}>
      <Feather name={icon} size={16} color={colors.text} />
    </Pressable>
  );
}

function MeasureDetail({
  o,
  editable,
  linked,
  children,
  onSave,
  onDelete,
  onClose,
}: {
  o: MeasuredObject;
  editable: boolean;
  linked: number;
  children?: React.ReactNode;
  onSave: (patch: Partial<Pick<MeasuredObject, 'name' | 'zone' | 'note' | 'color'>>) => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const c = usePlanCopy();
  const ac = useAssignCopy();
  const [name, setName] = useState(o.name ?? '');
  const [zone, setZone] = useState(o.zone ?? '');
  const [note, setNote] = useState(o.note ?? '');
  const [more, setMore] = useState(false);
  const v = mainValue(o.kind, o);
  const save = (patch: Partial<Pick<MeasuredObject, 'name' | 'zone' | 'note' | 'color'>>) => editable && onSave(patch);
  return (
    <View style={styles.detail}>
      <View style={[kit.row, { justifyContent: 'space-between', flexWrap: 'nowrap' }]}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={kit.eyebrow}>
            {o.name} · {c.kindsShort[o.kind]}
            {linked ? ` · ${ac.assigned.toLowerCase()} (${linked})` : ''}
          </Text>
          <Text style={styles.detailValue}>
            {v.value == null ? '—' : formatMeasure(v.value, o.kind === 'count' ? 0 : 2)} <Text style={styles.totalUnit}>{v.unit}</Text>
          </Text>
          <Text style={kit.hint}>
            {o.kind === 'polygon' && o.perimeter_m != null ? `${c.perimeterLabel} ${formatMeasure(o.perimeter_m)} m · ` : ''}
            {fill(c.pointsN, { n: o.geometry.length })}
            {o.zone ? ` · ${c.zone} ${o.zone}` : ''}
            {o.note ? ` · ${o.note}` : ''}
          </Text>
        </View>
        <Pressable onPress={onClose} accessibilityLabel="Fermer" hitSlop={8}>
          <Feather name="x" size={16} color={colors.textMuted} />
        </Pressable>
      </View>
      {children}
      {editable ? (
        <>
          <Pressable onPress={() => setMore((m) => !m)} style={styles.moreToggle}>
            <Feather name={more ? 'chevron-down' : 'chevron-right'} size={14} color={colors.textMuted} />
            <Text style={kit.hint}>{ac.details}</Text>
          </Pressable>
          {more ? (
            <>
              <View style={[kit.row, { alignItems: 'flex-start' }]}>
                <Field label={c.name} half>
                  <TextInput style={kit.input} value={name} onChangeText={setName} onBlur={() => name.trim() && name !== o.name && save({ name: name.trim().slice(0, 40) })} />
                </Field>
                <Field label={c.zone} half>
                  <TextInput style={kit.input} value={zone} onChangeText={setZone} placeholder="A-B" placeholderTextColor={colors.textMuted} onBlur={() => zone !== (o.zone ?? '') && save({ zone: zone.trim().slice(0, 40) || null })} />
                </Field>
              </View>
              <Field label={c.note}>
                <TextInput style={kit.input} value={note} onChangeText={setNote} onBlur={() => note !== (o.note ?? '') && save({ note: note.trim().slice(0, 500) || null })} />
              </Field>
              <View style={kit.row}>
                {MEASURE_COLORS.map((col) => (
                  <Pressable key={col} onPress={() => save({ color: col })} style={[styles.swatch, { backgroundColor: col }, (o.color || MEASURE_COLORS[0]) === col && styles.swatchOn]} />
                ))}
              </View>
              <Btn label={c.deleteMeasure} icon="trash-2" variant="bad" onPress={onDelete} />
            </>
          ) : null}
        </>
      ) : null}
    </View>
  );
}

function CalibrationSheet({ page, pts, onApply, onClose, onPick }: { page: PlanPage; pts: Point[] | null; onApply: (c: Calibration) => void; onClose: () => void; onPick: () => void }) {
  const c = usePlanCopy();
  const [mode, setMode] = useState<'dim' | 'scale'>(pts ? 'dim' : page.calibration?.method === 'scale' ? 'scale' : 'dim');
  const [real, setReal] = useState('');
  const [scaleText, setScaleText] = useState(page.calibration?.method === 'scale' ? `1:${page.calibration.scale}` : '1:50');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function apply() {
    setErr(null);
    let cal: Calibration | null = null;
    if (mode === 'dim') {
      const v = Number(real.replace(',', '.').replace(/[^\d.]/g, ''));
      if (!pts || !(v > 0)) return setErr(c.calInvalid);
      cal = { method: 'two_points', a: pts[0], b: pts[1], real_m: v };
    } else {
      const s = parseScale(scaleText);
      if (!s) return setErr(c.calInvalid);
      cal = { method: 'scale', scale: s, source: 'user' };
    }
    setBusy(true);
    await onApply(cal);
    setBusy(false);
  }

  return (
    <Sheet
      title={c.calTitle}
      onClose={onClose}
      footer={
        <>
          <Btn label={c.cancel} onPress={onClose} grow />
          <Btn label={c.calApply} icon="check" variant="primary" onPress={apply} disabled={busy || (mode === 'dim' && !pts)} grow />
        </>
      }
    >
      <View style={kit.row}>
        <Chip label={c.calByDim} active={mode === 'dim'} onPress={() => setMode('dim')} small icon="maximize-2" />
        <Chip label={c.calByScale} active={mode === 'scale'} onPress={() => setMode('scale')} small icon="percent" />
      </View>
      {page.calibration?.method === 'scale' && page.calibration.source === 'pdf' ? (
        <Text style={[kit.hint, { color: colors.slate }]}>{fill(c.readOnPlan, { q: page.calibration.quote ?? `1:${page.calibration.scale}` })}</Text>
      ) : !page.calibration ? (
        <Text style={[kit.hint, { color: colors.warning, fontWeight: '700' }]}>{c.calNeeded}</Text>
      ) : null}
      {mode === 'dim' ? (
        pts ? (
          <>
            <Text style={kit.hint}>{fill(c.calMeasuredPt, { n: formatMeasure(distancePt(pts[0], pts[1], page), 1) })}</Text>
            <Field label={c.calRealLength}>
              <TextInput style={kit.input} value={real} onChangeText={setReal} keyboardType="decimal-pad" placeholder="5.40" placeholderTextColor={colors.textMuted} autoFocus onSubmitEditing={apply} />
            </Field>
          </>
        ) : (
          <Btn label={c.calPickDim} icon="crosshair" variant="primary" onPress={onPick} />
        )
      ) : (
        <Field label={c.calScale} hint={c.calScaleHint}>
          <TextInput style={kit.input} value={scaleText} onChangeText={setScaleText} placeholder="1:50" placeholderTextColor={colors.textMuted} autoFocus onSubmitEditing={apply} />
        </Field>
      )}
      <Text style={kit.hint}>{c.calRemeasure}</Text>
      {err ? <Text style={{ color: colors.danger, fontSize: fontSize.sm }}>{err}</Text> : null}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, minHeight: 0 },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flexWrap: 'wrap', paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  back: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  title: { fontSize: fontSize.lg, fontWeight: '800', color: colors.text },
  number: { ...monoType, fontSize: 14, color: colors.textMuted, fontWeight: '600' },
  toolbar: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flexWrap: 'wrap', paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  toolGroup: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 3, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  tool: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 32, paddingHorizontal: 10, borderRadius: radius.md },
  toolOn: { backgroundColor: colors.primary },
  toolAttention: { backgroundColor: colors.warningSoft },
  toolText: { fontSize: 13, fontWeight: '700', color: colors.text },
  swatch: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: 'transparent', margin: 3 },
  swatchOn: { borderColor: colors.text },
  iconBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md },
  help: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  link: { fontSize: 12.5, fontWeight: '700', color: colors.warning, textDecorationLine: 'underline' },
  scaleWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  scaleSource: { fontSize: 12, fontWeight: '600', color: colors.success },
  picking: { marginHorizontal: spacing.lg, paddingVertical: 8, paddingHorizontal: 12, borderRadius: radius.lg, backgroundColor: colors.slateSoft },
  pickingText: { fontSize: 13.5, fontWeight: '700', color: colors.slate },
  scaleBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, height: 30, borderRadius: radius.pill, backgroundColor: colors.successSoft },
  scaleBadgeWarn: { backgroundColor: colors.warningSoft },
  scaleText: { fontSize: 12.5, fontWeight: '800' },
  body: { flex: 1, minHeight: 0, flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.border },
  canvasWrap: { flex: 1, position: 'relative', minWidth: 0, overflow: 'hidden' },
  canvasPhone: { width: '100%', position: 'relative', overflow: 'hidden' },
  zoomFloat: { position: 'absolute', right: 16, bottom: 16 },
  zoomBar: { flexDirection: 'row', alignItems: 'center', gap: 2, padding: 3, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  zoomText: { fontSize: 12.5, fontWeight: '700', color: colors.text, minWidth: 44, textAlign: 'center', fontVariant: ['tabular-nums'] },
  activeBanner: { position: 'absolute', left: 16, top: 12, right: 16, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.lg, backgroundColor: colors.primary, alignSelf: 'flex-start' },
  activeText: { color: '#fff', fontSize: 13, fontWeight: '700', flexShrink: 1 },
  panel: { width: 400, flexGrow: 0, borderLeftWidth: 1, borderLeftColor: colors.border, backgroundColor: colors.surface },
  panelBelow: { width: '100%', backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
  bodyPhone: { flex: 1, borderTopWidth: 1, borderTopColor: colors.border },
  totals: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  total: { flexGrow: 1, flexBasis: 130, padding: spacing.sm, borderRadius: radius.md, backgroundColor: colors.surfaceAlt, gap: 2 },
  totalValue: { fontSize: fontSize.md, fontWeight: '800', color: colors.text, fontVariant: ['tabular-nums'] },
  totalUnit: { fontSize: 12, fontWeight: '600', color: colors.textMuted },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 8, paddingHorizontal: 8, borderRadius: radius.md },
  rowOn: { backgroundColor: colors.primarySoft },
  rowDot: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  rowName: { fontSize: 13.5, fontWeight: '700', color: colors.text },
  rowValue: { fontSize: 13.5, fontWeight: '800', color: colors.text, fontVariant: ['tabular-nums'] },
  detail: { gap: spacing.sm, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.primary + '66', backgroundColor: colors.bg },
  moreToggle: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  detailValue: { fontSize: 26, fontWeight: '800', color: colors.text, fontVariant: ['tabular-nums'] },
});
