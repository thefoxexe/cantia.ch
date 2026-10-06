import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useProject } from '../../../../../lib/useProject';
import { AppScreen, LoadingScreen } from '../../../../../components/ui';
import { Btn, Chip, Field, Sheet, kit } from '../../../../../components/admin/ledger/kit';
import { MEASURE_COLORS, PlanCanvas, type Tool } from '../../../../../components/tenders/PlanCanvas';
import { canEditTenders } from '../../../../../lib/tenders/api';
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
  { key: 'calibrate', icon: 'sliders' },
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
  const { id, planId } = useLocalSearchParams<{ id: string; planId: string }>();
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

  const desktop = Platform.OS === 'web' && width >= 900;
  const wide = width >= 1180;

  const load = useCallback(
    async (rev?: string | null) => {
      const { data: d, error: err } = await loadPlan(planId, rev);
      if (err) setError(err);
      setData(d);
      setObjects(d?.objects ?? []);
      if (d && !rev) setRevisionId(d.plan.active_revision_id ?? d.revisions[0]?.id ?? null);
    },
    [planId],
  );

  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    if (project) canEditTenders(project.organization_id).then(setEditable);
  }, [project]);

  const page: PlanPage | null = data?.pages[pageIdx] ?? null;
  const isActiveRev = !!data && revisionId === data.plan.active_revision_id;
  const canDraw = editable && desktop && isActiveRev;
  const pageObjs = useMemo(() => objects.filter((o) => o.plan_page_id === page?.id), [objects, page?.id]);
  const selected = pageObjs.find((o) => o.id === selectedId) ?? null;

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
      const { object, error: err } = await track(createMeasure(page.id, t, pts, { color }));
      if (err || !object) return setError(err ?? 'Erreur');
      setObjects((o) => [...o, object]);
      setSelectedId(object.id);
      record({ t: 'create', id: object.id });
    },
    [page, color, track],
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
        const map: Record<string, Tool> = { v: 'select', k: 'calibrate', d: 'distance', l: 'polyline', s: 'polygon', p: 'perimeter', c: 'count' };
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
            style={[styles.tool, tool === t.key && styles.toolOn, t.key === 'calibrate' && !page?.meters_per_pt && tool !== t.key && styles.toolAttention]}
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

  const scaleBadge = (
    <Pressable onPress={() => canDraw && setCalSheet({ pts: null })} style={[styles.scaleBadge, !scale && styles.scaleBadgeWarn]}>
      <Feather name={scale ? 'check-circle' : 'alert-triangle'} size={13} color={scale ? colors.success : colors.warning} />
      <Text style={[styles.scaleText, { color: scale ? colors.success : colors.warning }]}>{scale ? `${c.scale} ${fill(c.scaleApprox, { n: scale })}` : c.notCalibrated}</Text>
    </Pressable>
  );

  const panel = (
    <PanelBox desktop={desktop}>
      {selected ? (
        <MeasureDetail
          key={selected.id}
          o={selected}
          editable={canDraw}
          onSave={async (patch) => {
            const { object, error: err } = await track(updateMeasure(selected.id, patch));
            if (err || !object) return setError(err ?? 'Erreur');
            setObjects((o) => o.map((x) => (x.id === object.id ? object : x)));
          }}
          onDelete={() => removeMeasure(selected.id)}
          onClose={() => setSelectedId(null)}
        />
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

        {toolbar}
        {canDraw ? (
          <View style={styles.help}>
            <Feather name="info" size={13} color={colors.textMuted} />
            <Text style={[kit.hint, { flex: 1 }]}>{c.toolHelp[tool]}</Text>
            {!page?.meters_per_pt && tool !== 'calibrate' ? (
              <Pressable onPress={() => setTool('calibrate')}>
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
  onSave,
  onDelete,
  onClose,
}: {
  o: MeasuredObject;
  editable: boolean;
  onSave: (patch: Partial<Pick<MeasuredObject, 'name' | 'zone' | 'note' | 'color'>>) => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const c = usePlanCopy();
  const [name, setName] = useState(o.name ?? '');
  const [zone, setZone] = useState(o.zone ?? '');
  const [note, setNote] = useState(o.note ?? '');
  const v = mainValue(o.kind, o);
  const save = (patch: Partial<Pick<MeasuredObject, 'name' | 'zone' | 'note' | 'color'>>) => editable && onSave(patch);
  return (
    <View style={styles.detail}>
      <View style={[kit.row, { justifyContent: 'space-between' }]}>
        <Text style={kit.eyebrow}>{c.kindsShort[o.kind]}</Text>
        <Pressable onPress={onClose} accessibilityLabel="Fermer">
          <Feather name="x" size={16} color={colors.textMuted} />
        </Pressable>
      </View>
      <Text style={styles.detailValue}>
        {v.value == null ? '—' : formatMeasure(v.value, o.kind === 'count' ? 0 : 2)} <Text style={styles.totalUnit}>{v.unit}</Text>
      </Text>
      <Text style={kit.hint}>
        {o.kind === 'polygon' && o.perimeter_m != null ? `${c.perimeterLabel} ${formatMeasure(o.perimeter_m)} m · ` : ''}
        {fill(c.pointsN, { n: o.geometry.length })}
      </Text>
      {editable ? (
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
      ) : (
        <Text style={kit.body}>
          {o.zone ? `${c.zone} ${o.zone}` : ''}
          {o.note ? ` · ${o.note}` : ''}
        </Text>
      )}
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
      cal = { method: 'scale', scale: s };
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
  scaleBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, height: 30, borderRadius: radius.pill, backgroundColor: colors.successSoft },
  scaleBadgeWarn: { backgroundColor: colors.warningSoft },
  scaleText: { fontSize: 12.5, fontWeight: '800' },
  body: { flex: 1, minHeight: 0, flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.border },
  canvasWrap: { flex: 1, position: 'relative', minWidth: 0, overflow: 'hidden' },
  canvasPhone: { width: '100%', position: 'relative', overflow: 'hidden' },
  zoomFloat: { position: 'absolute', right: 16, bottom: 16 },
  zoomBar: { flexDirection: 'row', alignItems: 'center', gap: 2, padding: 3, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  zoomText: { fontSize: 12.5, fontWeight: '700', color: colors.text, minWidth: 44, textAlign: 'center', fontVariant: ['tabular-nums'] },
  panel: { width: 330, flexGrow: 0, borderLeftWidth: 1, borderLeftColor: colors.border, backgroundColor: colors.surface },
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
  detailValue: { fontSize: 26, fontWeight: '800', color: colors.text, fontVariant: ['tabular-nums'] },
});
