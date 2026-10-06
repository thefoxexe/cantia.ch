import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { AppScreen, LoadingScreen } from '../../../../../../components/ui';
import { Btn, Chip, Field, Segmented, kit, usePhone } from '../../../../../../components/admin/ledger/kit';
import { PdfPage } from '../../../../../../components/tenders/PdfPage';
import { NumberInput } from '../../../../../../components/tenders/TenderDetail';
import { fileSignedUrl, finalizeImport, loadImportJob, saveDraft, type ImportJob } from '../../../../../../lib/tenders/importer';
import { fill, useTenderCopy } from '../../../../../../lib/tenders/copy';
import { formatQuantity } from '../../../../../../lib/tenders/numbers';
import { UNIT_CHOICES, normalizeUnit, unitLabel } from '../../../../../../lib/tenders/units';
import type { DraftNode, DraftQuestion } from '../../../../../../lib/tenders/parser/types';
import type { TenderKind } from '../../../../../../lib/tenders/types';
import { colors, fontSize, radius, spacing } from '../../../../../../lib/theme';
import { displayType, monoType } from '../../../../../../lib/marketingTheme';

type EditableNode = DraftNode & { validated?: boolean; deleted?: boolean; unitOverride?: string | null };
type Filter = 'all' | 'review';
const KINDS: TenderKind[] = ['soumission', 'variante', 'complementaire', 'interne'];

export default function ImportReviewScreen() {
  const c = useTenderCopy();
  const router = useRouter();
  const { phone, wide, width } = usePhone();
  const { id: projectId, jobId } = useLocalSearchParams<{ id: string; jobId: string }>();
  const [job, setJob] = useState<ImportJob | null | undefined>(undefined);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [viewPage, setViewPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [name, setName] = useState('');
  const [kind, setKind] = useState<TenderKind>('soumission');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listRef = useRef<FlatList<EditableNode>>(null);

  useEffect(() => {
    loadImportJob(jobId).then(async (j) => {
      setJob(j);
      if (!j) return;
      if (j.tender_id) return router.replace(`/(app)/chantiers/${projectId}/metres/${j.tender_id}` as any);
      const m = j.draft?.meta;
      setName(m?.cfcCode ? `CFC ${m.cfcCode}${m.cfcLabel ? ` — ${m.cfcLabel}` : ''}` : (j.file_name ?? '').replace(/\.pdf$/i, ''));
      if (j.file_id) setPdfUrl(await fileSignedUrl(j.file_id));
    });
  }, [jobId, projectId, router]);

  // Draft edits are saved in the background (the import can be resumed).
  const update = useCallback(
    (mutate: (d: NonNullable<ImportJob['draft']>) => void) => {
      setJob((j) => {
        if (!j?.draft) return j;
        const draft = { ...j.draft, nodes: [...j.draft.nodes], answers: { ...(j.draft.answers ?? {}) } };
        mutate(draft);
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => saveDraft(j.id, draft), 800);
        return { ...j, draft };
      });
    },
    [],
  );

  const draft = job?.draft ?? null;
  const nodes = (draft?.nodes ?? []) as EditableNode[];
  const answers = draft?.answers ?? {};
  const byKey = useMemo(() => new Map(nodes.map((n) => [n.key, n])), [nodes]);

  const unitResolved = (n: EditableNode) => n.unitOverride ?? answers[`unit:${n.rawUnit ?? 'none'}`] ?? (normalizeUnit(n.rawUnit).known ? n.unit : null);
  const needsReview = (n: EditableNode) => n.nodeType === 'billable_position' && !n.deleted && !n.validated && (n.certainty !== 'certain' || !unitResolved(n));

  const billable = nodes.filter((n) => n.nodeType === 'billable_position' && !n.deleted);
  const toCheck = billable.filter(needsReview);
  const openQuestions = (draft?.questions ?? []).filter((q) => q.kind !== 'zone_label' && !answers[q.id]);
  const visible = filter === 'review' ? nodes.filter((n) => needsReview(n)) : nodes;
  const selected = selectedKey ? byKey.get(selectedKey) ?? null : null;

  const select = (n: EditableNode) => {
    setSelectedKey(n.key);
    const page = n.breakdowns[0]?.page ?? n.page;
    if (page) setViewPage(page);
  };

  const highlights = useMemo(() => {
    if (!selected) return [];
    const boxes = [selected.bbox, ...selected.breakdowns.map((b) => (b.page === viewPage ? b.bbox : null))].filter(Boolean);
    return selected.page === viewPage || selected.breakdowns.some((b) => b.page === viewPage) ? (boxes as NonNullable<DraftNode['bbox']>[]) : [];
  }, [selected, viewPage]);

  if (job === undefined) {
    return (
      <AppScreen>
        <LoadingScreen />
      </AppScreen>
    );
  }
  if (!job || !draft) {
    return (
      <AppScreen>
        <View style={{ padding: spacing.xl, gap: spacing.md }}>
          <Text style={kit.body}>{job?.error ?? c.notFound}</Text>
          <Btn label={c.back} icon="arrow-left" onPress={() => router.replace(`/(app)/chantiers/${projectId}/metre` as any)} />
        </View>
      </AppScreen>
    );
  }

  async function submit() {
    setBusy(true);
    setError(null);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    const saved = await saveDraft(job!.id, job!.draft);
    if (saved.error) {
      setBusy(false);
      return setError(saved.error);
    }
    const { tenderId, error: err } = await finalizeImport(job!.id, name.trim() || job!.file_name || 'Soumission', kind);
    setBusy(false);
    if (err || !tenderId) return setError(err ?? 'Erreur');
    router.replace(`/(app)/chantiers/${projectId}/metres/${tenderId}` as any);
  }

  const meta = draft.meta;
  const pdfWidth = wide ? Math.min(640, Math.max(420, width * 0.42)) : Math.min(width - 32, 560);

  const header = (
    <View style={{ gap: spacing.md }}>
      <View style={styles.summary}>
        <View style={{ flex: 1, minWidth: 220, gap: 4 }}>
          <Text style={kit.eyebrow}>{c.analysisDone}</Text>
          <Text style={styles.big}>{fill(c.detected, { n: billable.length })}</Text>
          <View style={kit.row}>
            <Badge icon="check" tone="ok" label={fill(c.ready, { n: billable.length - toCheck.length })} />
            <Badge icon="alert-triangle" tone="warn" label={fill(c.toCheck, { n: toCheck.length })} />
            <Badge icon="help-circle" tone="q" label={fill(c.questionsCount, { n: openQuestions.length })} />
          </View>
        </View>
        {toCheck.length ? <Btn label={fill(c.reviewN, { n: toCheck.length })} icon="search" variant="primary" onPress={() => setFilter('review')} /> : null}
      </View>

      {job.status === 'failed' && job.error ? <Text style={styles.error}>{job.error}</Text> : null}
      {(draft as { ocr?: boolean }).ocr || (job as { ai_model_version?: string | null }).ai_model_version ? (
        <View style={styles.banner}>
          <Feather name="eye" size={15} color={colors.primary} />
          <Text style={[kit.body, { flex: 1 }]}>{c.ocrBanner}</Text>
        </View>
      ) : null}

      <View style={styles.metaGrid}>
        {[
          [c.metaProject, meta.project],
          [c.metaOwner, meta.owner],
          [c.metaArchitect, meta.architect],
          [c.metaEngineer, meta.engineer],
          ['CFC', meta.cfcCode ? `${meta.cfcCode}${meta.cfcLabel ? ` — ${meta.cfcLabel}` : ''}` : null],
          [c.metaDate, meta.date ? meta.date.split('-').reverse().join('.') : null],
        ]
          .filter(([, v]) => v)
          .map(([k, v]) => (
            <View key={k as string} style={styles.metaItem}>
              <Text style={kit.hint}>{k}</Text>
              <Text style={kit.body} numberOfLines={2}>
                {v}
              </Text>
            </View>
          ))}
      </View>

      <Questions c={c} questions={draft.questions} answers={answers} nodes={nodes} onAnswer={(id, value) => update((d) => ((d.answers as Record<string, string>)[id] = value))} />

      <Segmented
        value={filter}
        options={[
          { key: 'all', label: c.filterAll },
          { key: 'review', label: c.filterReview, badge: toCheck.length },
        ]}
        onChange={setFilter}
      />
    </View>
  );

  const list = (
    <FlatList
      ref={listRef}
      data={visible}
      keyExtractor={(n) => n.key}
      initialNumToRender={50}
      windowSize={12}
      ListHeaderComponent={<View style={{ padding: phone ? spacing.lg : spacing.xl, paddingBottom: spacing.md }}>{header}</View>}
      contentContainerStyle={{ paddingBottom: 160 }}
      renderItem={({ item }) => (
        <DraftRow
          n={item}
          c={c}
          selected={item.key === selectedKey}
          unit={unitResolved(item)}
          review={needsReview(item)}
          onPress={() => select(item)}
          showNumber={filter === 'review'}
        />
      )}
    />
  );

  const editor = selected ? (
    <NodeEditor
      c={c}
      n={selected}
      unit={unitResolved(selected)}
      onChange={(patch) =>
        update((d) => {
          d.nodes = d.nodes.map((x) => (x.key === selected.key ? { ...x, ...patch } : x));
        })
      }
    />
  ) : null;

  return (
    <AppScreen>
      <View style={[styles.top, phone && { paddingHorizontal: spacing.lg }]}>
        <Pressable onPress={() => router.replace(`/(app)/chantiers/${projectId}/metre` as any)} style={styles.backBtn} hitSlop={8}>
          <Feather name="arrow-left" size={18} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={kit.eyebrow} numberOfLines={1}>
            {c.reviewTitle} · {draft.classification}
          </Text>
          <Text style={styles.title} numberOfLines={1}>
            {job.file_name}
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        {wide && pdfUrl ? (
          <View style={[styles.pdfPane, { width: pdfWidth + 48 }]}>
            <View style={styles.pdfBar}>
              <Pressable onPress={() => setViewPage((p) => Math.max(1, p - 1))} hitSlop={8} accessibilityLabel={c.prevPage}>
                <Feather name="chevron-left" size={18} color={colors.text} />
              </Pressable>
              <Text style={styles.mono}>
                {c.page} {viewPage}
                {pageCount ? ` / ${pageCount}` : ''}
              </Text>
              <Pressable onPress={() => setViewPage((p) => Math.min(pageCount || p + 1, p + 1))} hitSlop={8} accessibilityLabel={c.nextPage}>
                <Feather name="chevron-right" size={18} color={colors.text} />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={{ padding: spacing.lg, alignItems: 'center' }}>
              <PdfPage url={pdfUrl} page={viewPage} width={pdfWidth} highlights={highlights} onPageCount={setPageCount} />
            </ScrollView>
          </View>
        ) : null}
        <View style={{ flex: 1, minWidth: 0 }}>{list}</View>
        {wide && selected ? (
          <View style={styles.side}>
            <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>{editor}</ScrollView>
          </View>
        ) : null}
      </View>

      {!wide && selected ? (
        <View style={styles.mobileEditor}>
          <ScrollView style={{ maxHeight: 360 }} contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <Pressable onPress={() => setSelectedKey(null)} hitSlop={10} style={kit.close}>
                <Feather name="x" size={16} color={colors.textMuted} />
              </Pressable>
            </View>
            {editor}
          </ScrollView>
        </View>
      ) : null}

      <View style={[styles.footer, phone && { paddingHorizontal: spacing.lg }]}>
        <View style={{ flexGrow: 1, flexBasis: 240, minWidth: 0 }}>
          <TextInput style={kit.input} value={name} onChangeText={setName} placeholder={c.importName} placeholderTextColor={colors.textMuted} />
        </View>
        <View style={[kit.row, { flexShrink: 1 }]}>
          {KINDS.map((k) => (
            <Chip key={k} small label={c.kinds[k]} active={kind === k} onPress={() => setKind(k)} />
          ))}
        </View>
        <Btn label={busy ? c.importing : c.importFinal} icon="check" variant="primary" onPress={submit} disabled={busy || !billable.length} />
        {error ? <Text style={[styles.error, { flexBasis: '100%' }]}>{error}</Text> : null}
      </View>
    </AppScreen>
  );
}

function Badge({ icon, label, tone }: { icon: keyof typeof Feather.glyphMap; label: string; tone: 'ok' | 'warn' | 'q' }) {
  const fg = tone === 'ok' ? colors.success : tone === 'warn' ? '#B7791F' : colors.primary;
  const bg = tone === 'ok' ? colors.successSoft : tone === 'warn' ? '#FBF0D9' : colors.primarySoft;
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Feather name={icon} size={13} color={fg} />
      <Text style={[styles.badgeText, { color: fg }]}>{label}</Text>
    </View>
  );
}

function Questions({ c, questions, answers, nodes, onAnswer }: { c: ReturnType<typeof useTenderCopy>; questions: DraftQuestion[]; answers: Record<string, string>; nodes: EditableNode[]; onAnswer: (id: string, v: string) => void }) {
  if (!questions.length) return null;
  const units = questions.filter((q) => q.kind === 'unit');
  const zones = questions.filter((q) => q.kind === 'zone_label');
  const cls = questions.find((q) => q.kind === 'classification');
  return (
    <View style={styles.questions}>
      <Text style={kit.cardTitle}>{c.questions}</Text>
      {cls ? (
        <View style={{ gap: 6 }}>
          <Text style={kit.body}>{c.classificationQ}</Text>
          <View style={kit.row}>
            <Chip small label={c.classificationCan} active={answers[cls.id] === 'CAN'} onPress={() => onAnswer(cls.id, 'CAN')} />
            <Chip small label={c.classificationCustom} active={answers[cls.id] === 'CUSTOM'} onPress={() => onAnswer(cls.id, 'CUSTOM')} />
          </View>
        </View>
      ) : null}
      {units.map((q) => {
        const sample = nodes.find((n) => n.key === q.nodeKeys[0]);
        return (
          <View key={q.id} style={{ gap: 6 }}>
            <Text style={kit.body}>
              {q.prompt}
              {sample?.rawQuantity ? <Text style={kit.hint}>{`  ·  ${sample.displayReference ?? ''} — ${sample.rawQuantity}`}</Text> : null}
            </Text>
            <View style={kit.row}>
              {(q.choices ?? UNIT_CHOICES).map((u) => (
                <Chip key={u} small label={unitLabel(u)} active={answers[q.id] === u} onPress={() => onAnswer(q.id, u)} />
              ))}
            </View>
            <Text style={kit.hint}>{fill(c.questionUnitApply, { n: q.nodeKeys.length })}</Text>
          </View>
        );
      })}
      {zones.length ? (
        <View style={{ gap: 6 }}>
          <View style={styles.zoneGrid}>
            {zones.map((q) => (
              <View key={q.id} style={styles.zoneItem}>
                <Text style={styles.zoneCode}>{q.code}</Text>
                <ZoneInput value={answers[q.id] ?? ''} placeholder={fill(c.zoneLabel, { code: q.code ?? '' })} onCommit={(v) => onAnswer(q.id, v)} />
              </View>
            ))}
          </View>
          <Text style={kit.hint}>{c.zoneOptional}</Text>
        </View>
      ) : null}
    </View>
  );
}

function ZoneInput({ value, placeholder, onCommit }: { value: string; placeholder: string; onCommit: (v: string) => void }) {
  const [text, setText] = useState(value);
  useEffect(() => setText(value), [value]);
  return <TextInput style={[kit.input, { paddingVertical: 7, fontSize: fontSize.sm }]} value={text} onChangeText={setText} onBlur={() => text !== value && onCommit(text.trim())} placeholder={placeholder} placeholderTextColor={colors.textMuted} />;
}

function DraftRow({ n, c, selected, unit, review, onPress, showNumber }: { n: EditableNode; c: ReturnType<typeof useTenderCopy>; selected: boolean; unit: string | null; review: boolean; onPress: () => void; showNumber: boolean }) {
  const billable = n.nodeType === 'billable_position';
  const structure = !billable && ['contract', 'chapter', 'section', 'subsection'].includes(n.nodeType);
  const indent = showNumber ? 0 : Math.min(n.depth, 7) * 14;
  return (
    <Pressable onPress={onPress} style={[styles.row, selected && styles.rowSelected, n.deleted && { opacity: 0.45 }, structure && n.depth <= 1 && styles.rowChapter]}>
      <View style={{ width: 18, alignItems: 'center' }}>
        {billable ? (
          n.deleted ? (
            <Feather name="slash" size={13} color={colors.textMuted} />
          ) : review ? (
            <Feather name="alert-triangle" size={13} color="#B7791F" />
          ) : (
            <Feather name="check" size={13} color={colors.success} />
          )
        ) : null}
      </View>
      <View style={{ flex: 1, minWidth: 0, paddingLeft: indent, gap: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {n.isReserved ? <Text style={styles.r}>R</Text> : null}
          <Text style={[styles.ref, structure && { fontWeight: '800' }]} numberOfLines={1}>
            {showNumber ? n.displayReference : n.rawNumber ?? ''}
          </Text>
          <Text style={[styles.desc, structure && { fontWeight: '800' }]} numberOfLines={1}>
            {n.title}
          </Text>
        </View>
        {billable ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' }}>
            <Text style={styles.qty}>
              {n.quantity == null ? '—' : formatQuantity(n.quantity)} {unit ? unitLabel(unit) : <Text style={{ color: colors.danger }}>{n.rawUnit ? `« ${n.rawUnit} » ?` : '?'}</Text>}
            </Text>
            {n.breakdowns.length > 1 || (n.breakdowns[0] && n.breakdowns[0].code !== 'PG') ? (
              <Text style={styles.zones} numberOfLines={1}>
                {n.breakdowns.map((b) => `${b.code} ${b.quantity ?? '?'}`).join(' · ')}
              </Text>
            ) : null}
            {n.issues.map((i) => (
              <Text key={i.kind} style={styles.issue}>
                {c.issues[i.kind] ?? i.kind}
              </Text>
            ))}
            {n.page ? <Text style={kit.hint}>{fill(c.sourcePageShort, { page: n.breakdowns[0]?.page ?? n.page })}</Text> : null}
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

function NodeEditor({ c, n, unit, onChange }: { c: ReturnType<typeof useTenderCopy>; n: EditableNode; unit: string | null; onChange: (p: Partial<EditableNode>) => void }) {
  const billable = n.nodeType === 'billable_position';
  return (
    <View style={{ gap: spacing.md }}>
      <View style={kit.row}>
        {n.isReserved ? <Text style={styles.r}>R</Text> : null}
        <Text style={styles.ref}>{n.displayReference ?? n.rawNumber}</Text>
        {n.page ? <Text style={kit.hint}>{fill(c.sourcePage, { page: n.page })}</Text> : null}
      </View>
      <Field label={c.title}>
        <TextInput style={[kit.input, { minHeight: 60, textAlignVertical: 'top' }]} multiline value={n.title} onChangeText={(title) => onChange({ title })} />
      </Field>
      {billable ? (
        <>
          <Field label={c.qtyOriginal} hint={n.rawQuantity ? `Document : ${n.rawQuantity}` : undefined}>
            <NumberInput value={n.quantity} editable onCommit={(q) => onChange({ quantity: q })} style={{ width: 160 }} />
          </Field>
          <Field label={c.unit} hint={n.rawUnit ? `Document : « ${n.rawUnit} »` : undefined}>
            <View style={kit.row}>
              {UNIT_CHOICES.map((u) => (
                <Chip key={u} small label={unitLabel(u)} active={unit === u} onPress={() => onChange({ unitOverride: u })} />
              ))}
            </View>
          </Field>
          {n.breakdowns.length ? (
            <Field label={c.breakdowns}>
              <Text style={styles.zones}>{n.breakdowns.map((b) => `${b.code} ${b.quantity ?? '?'}`).join('  ·  ')}</Text>
            </Field>
          ) : null}
          {n.issues.length ? (
            <View style={{ gap: 4 }}>
              {n.issues.map((i) => (
                <Text key={i.kind} style={[kit.hint, { color: '#B7791F' }]}>
                  ⚠ {i.message}
                </Text>
              ))}
            </View>
          ) : null}
        </>
      ) : null}
      {n.rawText ? (
        <Field label={c.rawText}>
          <Text style={styles.raw}>{n.rawText}</Text>
        </Field>
      ) : null}
      <View style={kit.row}>
        {billable && !n.deleted ? <Btn label={n.validated ? c.validated : c.validate} icon="check" variant={n.validated ? 'ok' : 'secondary'} onPress={() => onChange({ validated: !n.validated })} /> : null}
        <Btn label={n.deleted ? c.restoreLine : c.removeLine} icon={n.deleted ? 'rotate-ccw' : 'slash'} variant="ghost" onPress={() => onChange({ deleted: !n.deleted })} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  title: { ...displayType, fontSize: 22, fontWeight: '800', color: colors.text },
  body: { flex: 1, flexDirection: 'row', backgroundColor: colors.surface },
  pdfPane: { backgroundColor: '#E9E4DC', borderRightWidth: 1, borderRightColor: colors.border },
  pdfBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.md, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface },
  side: { width: 360, borderLeftWidth: 1, borderLeftColor: colors.border },
  mobileEditor: { borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
  summary: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.md, padding: spacing.lg, borderRadius: radius.xl, backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border },
  big: { ...displayType, fontSize: 24, fontWeight: '800', color: colors.text },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill },
  badgeText: { fontSize: 12.5, fontWeight: '700' },
  banner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderRadius: radius.lg, backgroundColor: colors.primarySoft },
  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  metaItem: { flexGrow: 1, flexBasis: 200, minWidth: 0, gap: 2 },
  questions: { gap: spacing.md, padding: spacing.lg, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.primary + '55', backgroundColor: colors.surface },
  zoneGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  zoneItem: { flexDirection: 'row', alignItems: 'center', gap: 8, flexGrow: 1, flexBasis: 220, minWidth: 0 },
  zoneCode: { ...monoType, fontSize: 12.5, fontWeight: '800', color: colors.text, width: 64 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, paddingVertical: 8, paddingHorizontal: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowSelected: { backgroundColor: colors.primarySoft },
  rowChapter: { backgroundColor: colors.bg },
  r: { ...monoType, fontSize: 10, fontWeight: '800', color: '#fff', backgroundColor: colors.primary, paddingHorizontal: 4, borderRadius: 3, overflow: 'hidden' },
  ref: { ...monoType, fontSize: 12.5, color: colors.text },
  desc: { fontSize: fontSize.sm, color: colors.text, flex: 1 },
  qty: { ...monoType, fontSize: 12.5, fontWeight: '700', color: colors.text },
  zones: { ...monoType, fontSize: 11.5, color: colors.textMuted },
  issue: { fontSize: 11, fontWeight: '700', color: '#B7791F', backgroundColor: '#FBF0D9', paddingHorizontal: 6, paddingVertical: 1, borderRadius: radius.pill, overflow: 'hidden' },
  raw: { ...monoType, fontSize: 11.5, color: colors.textMuted, backgroundColor: colors.bg, padding: spacing.sm, borderRadius: radius.md, lineHeight: 17 },
  mono: { ...monoType, fontSize: 13, color: colors.text },
  footer: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
  error: { fontSize: fontSize.sm, color: colors.danger },
});
