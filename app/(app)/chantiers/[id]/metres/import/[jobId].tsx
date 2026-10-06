import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { AppScreen, LoadingScreen } from '../../../../../../components/ui';
import { Btn, Chip, Field, Segmented, Sheet, kit } from '../../../../../../components/admin/ledger/kit';
import { PdfPage } from '../../../../../../components/tenders/PdfPage';
import { NumberInput } from '../../../../../../components/tenders/TenderDetail';
import { fileSignedUrl, finalizeImport, loadImportJob, saveDraft, type ImportJob } from '../../../../../../lib/tenders/importer';
import { fill, useTenderCopy, type TenderCopy } from '../../../../../../lib/tenders/copy';
import { formatQuantity } from '../../../../../../lib/tenders/numbers';
import { UNIT_CHOICES, normalizeUnit, unitLabel } from '../../../../../../lib/tenders/units';
import type { DraftNode, DraftQuestion } from '../../../../../../lib/tenders/parser/types';
import type { SourceBox, TenderKind } from '../../../../../../lib/tenders/types';
import { colors, fontSize, radius, spacing } from '../../../../../../lib/theme';
import { displayType, monoType } from '../../../../../../lib/marketingTheme';

type EditableNode = DraftNode & { validated?: boolean; deleted?: boolean; unitOverride?: string | null };
type Filter = 'all' | 'review';
const KINDS: TenderKind[] = ['soumission', 'variante', 'complementaire', 'interne'];
const SIDEBAR = 240; // app navigation on wide screens

// Import review: one guided path — see what was found, check the few
// uncertain points one by one next to the PDF, then create the métré.
export default function ImportReviewScreen() {
  const c = useTenderCopy();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const content = width >= 1024 ? width - SIDEBAR : width;
  const split = content >= 960; // PDF beside the panel
  const phone = width < 640;
  const { id: projectId, jobId } = useLocalSearchParams<{ id: string; jobId: string }>();
  const [job, setJob] = useState<ImportJob | null | undefined>(undefined);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [guided, setGuided] = useState(false);
  const [viewPage, setViewPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showZones, setShowZones] = useState(false);
  const [name, setName] = useState('');
  const [kind, setKind] = useState<TenderKind>('soumission');
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Draft edits are saved in the background, so the import can be resumed.
  const update = useCallback((mutate: (d: NonNullable<ImportJob['draft']>) => void) => {
    setJob((j) => {
      if (!j?.draft) return j;
      const draft = { ...j.draft, nodes: [...j.draft.nodes], answers: { ...(j.draft.answers ?? {}) } };
      mutate(draft);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => saveDraft(j.id, draft), 800);
      return { ...j, draft };
    });
  }, []);

  const draft = job?.draft ?? null;
  const nodes = (draft?.nodes ?? []) as EditableNode[];
  const answers = draft?.answers ?? {};
  const byKey = useMemo(() => new Map(nodes.map((n) => [n.key, n])), [nodes]);
  const unitResolved = (n: EditableNode) => n.unitOverride ?? answers[`unit:${n.rawUnit ?? 'none'}`] ?? (normalizeUnit(n.rawUnit).known ? n.unit : null);
  const needsReview = (n: EditableNode) => n.nodeType === 'billable_position' && !n.deleted && !n.validated && (n.certainty !== 'certain' || !unitResolved(n));
  const billable = nodes.filter((n) => n.nodeType === 'billable_position' && !n.deleted);
  const reviewList = nodes.filter((n) => n.nodeType === 'billable_position' && (n.certainty !== 'certain' || n.validated || (n.deleted && n.issues.length)));
  const toCheck = billable.filter(needsReview);
  const blocking = (draft?.questions ?? []).filter((q) => (q.kind === 'unit' || q.kind === 'classification') && !answers[q.id]);
  const zoneQs = (draft?.questions ?? []).filter((q) => q.kind === 'zone_label');
  const chapters = nodes.filter((n) => n.nodeType === 'chapter').length;
  const visible = filter === 'review' ? reviewList : nodes;
  const selected = selectedKey ? byKey.get(selectedKey) ?? null : null;

  const select = (n: EditableNode | null, opts: { guided?: boolean } = {}) => {
    setSelectedKey(n?.key ?? null);
    setGuided(!!opts.guided);
    const page = n ? n.breakdowns[0]?.page ?? n.page : null;
    if (page) setViewPage(page);
  };
  const nextToCheck = (after?: string) => {
    const list = nodes.filter((n) => needsReview(n) && n.key !== after);
    return list[0] ?? null;
  };

  const highlights = useMemo<SourceBox[]>(() => {
    if (!selected) return [];
    const boxes: (SourceBox | null)[] = [selected.page === viewPage ? selected.bbox : null, ...selected.breakdowns.map((b) => (b.page === viewPage ? b.bbox : null))];
    return boxes.filter(Boolean) as SourceBox[];
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

  const patch = (key: string, p: Partial<EditableNode>) =>
    update((d) => {
      d.nodes = d.nodes.map((x) => (x.key === key ? { ...x, ...p } : x));
    });
  const meta = draft.meta;
  const pdfWidth = split ? Math.round(Math.min(720, content * 0.48)) : Math.min(width - 24, 760);
  const pad = phone ? spacing.lg : spacing.xl;

  // ---- overview (no line selected) -------------------------------------------
  const overview = (
    <View style={{ gap: spacing.lg, padding: pad }}>
      <View style={styles.card}>
        <Text style={kit.eyebrow}>{c.rvFound}</Text>
        <View style={styles.tiles}>
          <Tile value={billable.length} label={c.rvPositions} />
          <Tile value={billable.length - toCheck.length} label={c.rvReady} tone="ok" />
          <Tile value={toCheck.length} label={c.rvToCheck} tone={toCheck.length ? 'warn' : 'ok'} />
        </View>
        <Text style={kit.hint}>
          {[draft.classification === 'CAN' ? 'CAN' : null, chapters ? fill(c.rvChapters, { n: chapters }) : null, meta.cfcCode ? `CFC ${meta.cfcCode}${meta.cfcLabel ? ` — ${meta.cfcLabel}` : ''}` : null, job.page_count ? fill(c.rvPages, { n: job.page_count }) : null]
            .filter(Boolean)
            .join('  ·  ')}
        </Text>
        {toCheck.length ? (
          <Btn label={toCheck.length === 1 ? c.rvStartOne : fill(c.rvStartN, { n: toCheck.length })} icon="arrow-right" variant="primary" onPress={() => select(nextToCheck(), { guided: true })} />
        ) : (
          <View style={styles.okLine}>
            <Feather name="check-circle" size={16} color={colors.success} />
            <Text style={[kit.body, { color: colors.success, fontWeight: '700' }]}>{c.rvAllGood}</Text>
          </View>
        )}
      </View>

      {(job as { ai_model_version?: string | null }).ai_model_version ? (
        <View style={styles.banner}>
          <Feather name="eye" size={15} color={colors.primary} />
          <Text style={[kit.body, { flex: 1 }]}>{c.ocrBanner}</Text>
        </View>
      ) : null}

      {blocking.length ? <BlockingQuestions c={c} questions={blocking} answers={answers} nodes={nodes} onAnswer={(id, v) => update((d) => ((d.answers as Record<string, string>)[id] = v))} /> : null}

      <Collapsible
        title={c.rvDocInfo}
        summary={[meta.owner?.split(',')[0], meta.architect?.split(',')[0], meta.date ? meta.date.split('-').reverse().join('.') : null].filter(Boolean).join(' · ')}
        open={showInfo}
        onToggle={() => setShowInfo((v) => !v)}
      >
        {[
          [c.metaProject, meta.project],
          [c.metaOwner, meta.owner],
          [c.metaArchitect, meta.architect],
          [c.metaEngineer, meta.engineer],
          [c.metaDate, meta.date ? meta.date.split('-').reverse().join('.') : null],
        ]
          .filter(([, v]) => v)
          .map(([k, v]) => (
            <View key={k as string} style={styles.infoRow}>
              <Text style={[kit.hint, { width: 120 }]}>{k}</Text>
              <Text style={[kit.body, { flex: 1 }]}>{v}</Text>
            </View>
          ))}
      </Collapsible>

      {zoneQs.length ? (
        <Collapsible title={fill(c.rvZones, { n: zoneQs.length })} summary={c.rvZonesHint} open={showZones} onToggle={() => setShowZones((v) => !v)}>
          {zoneQs.map((q) => (
            <View key={q.id} style={styles.infoRow}>
              <Text style={[styles.code, { width: 80 }]}>{q.code}</Text>
              <View style={{ flex: 1 }}>
                <ZoneInput value={answers[q.id] ?? ''} placeholder={fill(c.zoneLabel, { code: q.code ?? '' })} onCommit={(v) => update((d) => ((d.answers as Record<string, string>)[q.id] = v))} />
              </View>
            </View>
          ))}
        </Collapsible>
      ) : null}

      <View style={{ gap: spacing.sm }}>
        <Text style={kit.cardTitle}>{c.rvContent}</Text>
        <Segmented
          value={filter}
          options={[
            { key: 'all', label: c.filterAll },
            { key: 'review', label: c.filterReview, badge: toCheck.length },
          ]}
          onChange={setFilter}
        />
      </View>
    </View>
  );

  // ---- detail of one line ---------------------------------------------------
  const guidedIndex = selected && guided ? reviewList.findIndex((n) => n.key === selected.key) : -1;
  const detail = selected ? (
    <ScrollView contentContainerStyle={{ padding: pad, gap: spacing.lg, paddingBottom: 40 }}>
      <View style={styles.detailTop}>
        <Pressable onPress={() => select(null)} style={styles.linkBtn} hitSlop={8}>
          <Feather name="arrow-left" size={15} color={colors.primary} />
          <Text style={kit.link}>{c.rvBack}</Text>
        </Pressable>
        {guided && guidedIndex >= 0 ? <Text style={kit.hint}>{fill(c.rvPointOf, { i: guidedIndex + 1, n: reviewList.length })}</Text> : null}
      </View>
      <LineDetail
        c={c}
        n={selected}
        unit={unitResolved(selected)}
        onChange={(p) => patch(selected.key, p)}
        onShowPdf={!split && pdfUrl ? () => setPdfOpen(true) : undefined}
      />
      <View style={styles.actions}>
        {selected.nodeType === 'billable_position' && !selected.deleted ? (
          <Btn
            label={guided ? c.rvOkNext : c.rvOk}
            icon="check"
            variant="primary"
            onPress={() => {
              patch(selected.key, { validated: true });
              const next = guided ? nextToCheck(selected.key) : null;
              select(next, { guided: !!next });
            }}
          />
        ) : null}
        <Btn label={selected.deleted ? c.rvRestore : c.rvIgnore} icon={selected.deleted ? 'rotate-ccw' : 'slash'} variant="ghost" onPress={() => patch(selected.key, { deleted: !selected.deleted })} />
      </View>
    </ScrollView>
  ) : null;

  const list = (
    <FlatList
      data={visible}
      keyExtractor={(n) => n.key}
      initialNumToRender={40}
      windowSize={10}
      ListHeaderComponent={overview}
      contentContainerStyle={{ paddingBottom: 24 }}
      renderItem={({ item }) => <Row n={item} c={c} unit={unitResolved(item)} review={needsReview(item)} flat={filter === 'review'} onPress={() => select(item)} />}
    />
  );

  const pdfView = pdfUrl ? (
    <View style={{ flex: 1 }}>
      <View style={styles.pdfBar}>
        <Pressable onPress={() => setViewPage((p) => Math.max(1, p - 1))} hitSlop={10} accessibilityLabel={c.prevPage} style={styles.pageBtn}>
          <Feather name="chevron-left" size={18} color={colors.text} />
        </Pressable>
        <Text style={styles.pageText}>
          {c.page} {viewPage}
          {pageCount ? ` / ${pageCount}` : ''}
        </Text>
        <Pressable onPress={() => setViewPage((p) => Math.min(pageCount || p + 1, p + 1))} hitSlop={10} accessibilityLabel={c.nextPage} style={styles.pageBtn}>
          <Feather name="chevron-right" size={18} color={colors.text} />
        </Pressable>
        {!split ? (
          <Pressable onPress={() => setPdfOpen(false)} hitSlop={10} style={[styles.pageBtn, { position: 'absolute', right: spacing.md }]}>
            <Feather name="x" size={18} color={colors.text} />
          </Pressable>
        ) : null}
      </View>
      <ScrollView contentContainerStyle={{ padding: spacing.md, alignItems: 'center' }}>
        <PdfPage url={pdfUrl} page={viewPage} width={pdfWidth - spacing.md * 2} highlights={highlights} onPageCount={setPageCount} />
      </ScrollView>
    </View>
  ) : null;

  return (
    <AppScreen>
      <View style={[styles.top, { paddingHorizontal: pad }]}>
        <Pressable onPress={() => router.replace(`/(app)/chantiers/${projectId}/metre` as any)} style={styles.backBtn} hitSlop={8}>
          <Feather name="arrow-left" size={18} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.title} numberOfLines={1}>
            {c.rvTitle}
          </Text>
          <Text style={kit.hint} numberOfLines={1}>
            {job.file_name}
          </Text>
        </View>
        <View style={[styles.statusPill, toCheck.length ? styles.pillWarn : styles.pillOk]}>
          <Feather name={toCheck.length ? 'alert-triangle' : 'check'} size={13} color={toCheck.length ? '#9A6412' : colors.success} />
          <Text style={[styles.pillText, { color: toCheck.length ? '#9A6412' : colors.success }]}>{toCheck.length ? fill(c.rvRemaining, { n: toCheck.length }) : c.rvCheckedAll}</Text>
        </View>
      </View>

      <View style={styles.body}>
        {split && pdfView ? <View style={[styles.pdfPane, { width: pdfWidth }]}>{pdfView}</View> : null}
        <View style={{ flex: 1, minWidth: 0, backgroundColor: colors.surface }}>{selected ? detail : list}</View>
      </View>

      <View style={[styles.footer, { paddingLeft: pad, paddingRight: phone ? pad : 96 }]}>
        <Text style={[kit.hint, { flex: 1, minWidth: 140 }]} numberOfLines={2}>
          {fill(c.detected, { n: billable.length })}
          {toCheck.length ? ` · ${fill(c.rvRemaining, { n: toCheck.length })}` : ''}
        </Text>
        <Pressable onPress={() => setConfirming(true)} disabled={!billable.length} style={({ pressed }) => [styles.create, phone && { flexGrow: 1 }, !billable.length && { opacity: 0.5 }, pressed && { opacity: 0.85 }]}>
          <Feather name="check" size={16} color="#fff" />
          <Text style={styles.createText}>{c.rvCreate}</Text>
        </Pressable>
      </View>

      {confirming ? (
        <Sheet
          title={c.rvCreate}
          onClose={() => setConfirming(false)}
          footer={
            <>
              <Btn label={c.cancel} onPress={() => setConfirming(false)} grow />
              <Btn label={busy ? c.importing : fill(c.rvCreateN, { n: billable.length })} icon="check" variant="primary" onPress={submit} disabled={busy} grow />
            </>
          }
        >
          {toCheck.length ? (
            <View style={[styles.banner, { backgroundColor: '#FBF0D9' }]}>
              <Feather name="alert-triangle" size={15} color="#9A6412" />
              <Text style={[kit.body, { flex: 1 }]}>{fill(c.rvRemainingNote, { n: toCheck.length })}</Text>
            </View>
          ) : null}
          <Field label={c.rvName}>
            <TextInput style={kit.input} value={name} onChangeText={setName} autoFocus />
          </Field>
          <Field label={c.rvType}>
            <View style={kit.row}>
              {KINDS.map((k) => (
                <Chip key={k} small label={c.kinds[k]} active={kind === k} onPress={() => setKind(k)} />
              ))}
            </View>
          </Field>
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </Sheet>
      ) : null}

      {!split && pdfOpen && pdfView ? (
        <Modal visible animationType="slide" onRequestClose={() => setPdfOpen(false)}>
          <View style={{ flex: 1, backgroundColor: '#E9E4DC' }}>{pdfView}</View>
        </Modal>
      ) : null}
    </AppScreen>
  );
}

function Tile({ value, label, tone }: { value: number; label: string; tone?: 'ok' | 'warn' }) {
  const color = tone === 'ok' ? colors.success : tone === 'warn' ? '#9A6412' : colors.text;
  return (
    <View style={styles.tile}>
      <Text style={[styles.tileValue, { color }]}>{value}</Text>
      <Text style={kit.hint}>{label}</Text>
    </View>
  );
}

function Collapsible({ title, summary, open, onToggle, children }: { title: string; summary?: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <View style={styles.collapse}>
      <Pressable onPress={onToggle} style={styles.collapseHead}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.collapseTitle}>{title}</Text>
          {!open && summary ? (
            <Text style={kit.hint} numberOfLines={1}>
              {summary}
            </Text>
          ) : null}
        </View>
        <Feather name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
      </Pressable>
      {open ? <View style={{ gap: spacing.sm, paddingTop: spacing.sm }}>{children}</View> : null}
    </View>
  );
}

function BlockingQuestions({ c, questions, answers, nodes, onAnswer }: { c: TenderCopy; questions: DraftQuestion[]; answers: Record<string, string>; nodes: EditableNode[]; onAnswer: (id: string, v: string) => void }) {
  return (
    <View style={[styles.card, { borderColor: colors.primary }]}>
      <Text style={kit.cardTitle}>{c.rvAnswer}</Text>
      {questions.map((q) => {
        if (q.kind === 'classification') {
          return (
            <View key={q.id} style={{ gap: 6 }}>
              <Text style={kit.body}>{c.classificationQ}</Text>
              <View style={kit.row}>
                <Chip small label={c.classificationCan} active={answers[q.id] === 'CAN'} onPress={() => onAnswer(q.id, 'CAN')} />
                <Chip small label={c.classificationCustom} active={answers[q.id] === 'CUSTOM'} onPress={() => onAnswer(q.id, 'CUSTOM')} />
              </View>
            </View>
          );
        }
        const sample = nodes.find((n) => n.key === q.nodeKeys[0]);
        return (
          <View key={q.id} style={{ gap: 6 }}>
            <Text style={kit.body}>{q.prompt}</Text>
            {sample ? <Text style={kit.hint}>{`${sample.displayReference ?? ''} — ${sample.title}`}</Text> : null}
            <View style={kit.row}>
              {(q.choices ?? UNIT_CHOICES).map((u) => (
                <Chip key={u} small label={unitLabel(u)} active={answers[q.id] === u} onPress={() => onAnswer(q.id, u)} />
              ))}
            </View>
            <Text style={kit.hint}>{fill(c.questionUnitApply, { n: q.nodeKeys.length })}</Text>
          </View>
        );
      })}
    </View>
  );
}

function ZoneInput({ value, placeholder, onCommit }: { value: string; placeholder: string; onCommit: (v: string) => void }) {
  const [text, setText] = useState(value);
  useEffect(() => setText(value), [value]);
  return <TextInput style={[kit.input, { paddingVertical: 8, fontSize: fontSize.sm }]} value={text} onChangeText={setText} onBlur={() => text !== value && onCommit(text.trim())} placeholder={placeholder} placeholderTextColor={colors.textMuted} />;
}

function Row({ n, c, unit, review, flat, onPress }: { n: EditableNode; c: TenderCopy; unit: string | null; review: boolean; flat: boolean; onPress: () => void }) {
  const billable = n.nodeType === 'billable_position';
  const heading = !billable && (n.nodeType === 'contract' || n.nodeType === 'chapter');
  const indent = flat ? 0 : Math.min(Math.max(n.depth - 1, 0), 6) * 12;
  const ref = flat ? n.displayReference : n.positionPath ?? n.rawNumber;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, heading && styles.rowHeading, n.deleted && { opacity: 0.45 }, pressed && { backgroundColor: colors.primarySoft }]}>
      <View style={{ width: 18, paddingTop: 2, alignItems: 'center' }}>
        {billable ? n.deleted ? <Feather name="slash" size={13} color={colors.textMuted} /> : review ? <Feather name="alert-triangle" size={13} color="#B7791F" /> : <Feather name="check" size={13} color={colors.success} /> : null}
      </View>
      <View style={{ flex: 1, minWidth: 0, paddingLeft: indent, gap: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
          {n.isReserved ? <Text style={styles.r}>R</Text> : null}
          {ref ? (
            <Text style={[styles.ref, heading && { fontWeight: '800' }]} numberOfLines={1}>
              {heading && n.nodeType === 'chapter' ? `CAN ${n.rawNumber}` : ref}
            </Text>
          ) : null}
          <Text style={[styles.desc, (heading || !billable) && { fontWeight: heading ? '800' : '600' }, !billable && !heading && { color: colors.textMuted }]} numberOfLines={billable ? 2 : 1}>
            {billable ? n.description.replace(/\n/g, ' ') : n.title}
          </Text>
        </View>
        {billable ? (
          <View style={styles.rowMeta}>
            <Text style={styles.qty}>
              {n.quantity == null ? '—' : formatQuantity(n.quantity)} {unit ? unitLabel(unit) : <Text style={{ color: colors.danger }}>{n.rawUnit ? `${n.rawUnit} ?` : '?'}</Text>}
            </Text>
            {n.breakdowns.length > 1 ? <Text style={styles.zones}>{n.breakdowns.map((b) => `${b.code} ${b.quantity ?? '—'}`).join(' · ')}</Text> : null}
            {review ? n.issues.slice(0, 1).map((i) => <Text key={i.kind} style={styles.issue}>{c.issues[i.kind] ?? i.kind}</Text>) : null}
          </View>
        ) : null}
      </View>
      {billable ? <Feather name="chevron-right" size={16} color={colors.textMuted} style={{ marginTop: 2 }} /> : null}
    </Pressable>
  );
}

function LineDetail({ c, n, unit, onChange, onShowPdf }: { c: TenderCopy; n: EditableNode; unit: string | null; onChange: (p: Partial<EditableNode>) => void; onShowPdf?: () => void }) {
  const [source, setSource] = useState(false);
  useEffect(() => setSource(false), [n.key]);
  const billable = n.nodeType === 'billable_position';
  const issue = n.issues[0];
  const help = issue
    ? fill(c.rvHelp[issue.kind] ?? issue.message, { raw: n.rawText.match(/\bpar\s+\w+/i) ? ` (« ${n.rawText.match(/\bpar\s+\w+/i)![0]} »)` : '', unit: n.rawUnit ?? '' })
    : billable
      ? c.rvOk1
      : null;
  const units = Array.from(new Set([...UNIT_CHOICES, ...(unit && !UNIT_CHOICES.includes(unit) ? [unit] : [])]));
  return (
    <View style={{ gap: spacing.lg }}>
      <View style={{ gap: 6 }}>
        <View style={kit.row}>
          {n.isReserved ? <Text style={styles.r}>R</Text> : null}
          <Text style={styles.refBig}>{n.displayReference ?? n.rawNumber}</Text>
          {n.page ? (
            onShowPdf ? (
              <Pressable onPress={onShowPdf} style={styles.linkBtn}>
                <Feather name="file-text" size={14} color={colors.primary} />
                <Text style={kit.link}>
                  {c.rvShowPdf} · {fill(c.sourcePageShort, { page: n.page })}
                </Text>
              </Pressable>
            ) : (
              <Text style={kit.hint}>{fill(c.sourcePage, { page: n.page })}</Text>
            )
          ) : null}
        </View>
        <TextInput style={[kit.input, styles.titleInput]} multiline value={n.description || n.title} onChangeText={(t) => onChange({ description: t, title: t.split('\n')[0] })} />
      </View>

      {n.deleted ? (
        <View style={styles.banner}>
          <Feather name="slash" size={15} color={colors.textMuted} />
          <Text style={[kit.body, { flex: 1 }]}>{c.rvIgnored}</Text>
        </View>
      ) : help ? (
        <View style={[styles.banner, issue ? { backgroundColor: '#FBF0D9' } : { backgroundColor: colors.successSoft }]}>
          <Feather name={issue ? 'alert-triangle' : 'check-circle'} size={16} color={issue ? '#9A6412' : colors.success} />
          <Text style={[kit.body, { flex: 1 }]}>{help}</Text>
        </View>
      ) : null}

      {billable ? (
        <>
          <View style={styles.qtyRow}>
            <View style={{ gap: 4 }}>
              <Text style={kit.fieldLabel}>{c.rvQuantity}</Text>
              <NumberInput value={n.quantity} editable onCommit={(q) => onChange({ quantity: q })} placeholder={c.rvQuantityPh} style={{ width: 150 }} />
            </View>
            <View style={{ gap: 4, flex: 1, minWidth: 220 }}>
              <Text style={kit.fieldLabel}>{c.unit}</Text>
              <View style={kit.row}>
                {units.map((u) => (
                  <Chip key={u} small label={unitLabel(u)} active={unit === u} onPress={() => onChange({ unitOverride: u })} />
                ))}
              </View>
            </View>
          </View>
          {n.breakdowns.length ? (
            <View style={{ gap: 6 }}>
              <Text style={kit.fieldLabel}>{c.rvZoneTable}</Text>
              <View style={styles.table}>
                {n.breakdowns.map((b, i) => (
                  <View key={i} style={[styles.tr, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
                    <Text style={[styles.code, { flex: 1 }]}>{b.code || '—'}</Text>
                    <Text style={styles.qty}>{b.quantity == null ? c.rvNoZone : formatQuantity(b.quantity)}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </>
      ) : null}

      {n.rawText ? (
        <View style={{ gap: 6 }}>
          <Pressable onPress={() => setSource((v) => !v)} style={styles.linkBtn}>
            <Feather name={source ? 'chevron-up' : 'chevron-down'} size={14} color={colors.primary} />
            <Text style={kit.link}>{source ? c.rvHideSource : c.rvShowSource}</Text>
          </Pressable>
          {source ? <Text style={styles.raw}>{n.rawText}</Text> : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  title: { ...displayType, fontSize: 21, fontWeight: '800', color: colors.text },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill },
  pillWarn: { backgroundColor: '#FBF0D9' },
  pillOk: { backgroundColor: colors.successSoft },
  pillText: { fontSize: 12.5, fontWeight: '700' },
  body: { flex: 1, flexDirection: 'row', minHeight: 0 },
  pdfPane: { backgroundColor: '#E9E4DC', borderRightWidth: 1, borderRightColor: colors.border },
  pdfBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface },
  pageBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  pageText: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text, fontVariant: ['tabular-nums'] },
  card: { gap: spacing.md, padding: spacing.lg, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg },
  tiles: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  tile: { flexGrow: 1, flexBasis: 90, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  tileValue: { ...displayType, fontSize: 26, fontWeight: '800', fontVariant: ['tabular-nums'] },
  okLine: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  banner: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, padding: spacing.md, borderRadius: radius.lg, backgroundColor: colors.primarySoft },
  collapse: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: colors.surface },
  collapseHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  collapseTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  code: { ...monoType, fontSize: 13, fontWeight: '800', color: colors.text },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, paddingVertical: 10, paddingHorizontal: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowHeading: { backgroundColor: colors.bg },
  rowMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  r: { ...monoType, fontSize: 10, fontWeight: '800', color: '#fff', backgroundColor: colors.primary, paddingHorizontal: 4, paddingVertical: 1, borderRadius: 3, overflow: 'hidden' },
  ref: { ...monoType, fontSize: 12.5, color: colors.textMuted, flexShrink: 0 },
  refBig: { ...monoType, fontSize: 15, fontWeight: '800', color: colors.text },
  desc: { fontSize: fontSize.sm, color: colors.text, flex: 1, lineHeight: 19 },
  qty: { ...monoType, fontSize: 13, fontWeight: '700', color: colors.text, fontVariant: ['tabular-nums'] },
  zones: { ...monoType, fontSize: 11.5, color: colors.textMuted },
  issue: { fontSize: 11, fontWeight: '700', color: '#9A6412', backgroundColor: '#FBF0D9', paddingHorizontal: 7, paddingVertical: 2, borderRadius: radius.pill, overflow: 'hidden' },
  detailTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  linkBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  titleInput: { minHeight: 120, textAlignVertical: 'top', lineHeight: 21 },
  qtyRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg, alignItems: 'flex-start' },
  table: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, overflow: 'hidden' },
  tr: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: 8, backgroundColor: colors.surface },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, alignItems: 'center' },
  raw: { ...monoType, fontSize: 11.5, color: colors.textMuted, backgroundColor: colors.bg, padding: spacing.md, borderRadius: radius.md, lineHeight: 17 },
  footer: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.md, paddingVertical: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
  create: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 18, minHeight: 44, borderRadius: radius.lg, backgroundColor: colors.primary },
  createText: { fontSize: fontSize.sm, fontWeight: '800', color: '#fff' },
  error: { fontSize: fontSize.sm, color: colors.danger },
});
