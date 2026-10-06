import { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { AppScreen, LoadingScreen } from '../../../../components/ui';
import { Btn, Chip, Field, Sheet, kit } from '../../../../components/admin/ledger/kit';
import { DateField } from '../../../../components/DateField';
import { GanttView, StatusPill, tradeColor, type Zoom } from '../../../../components/schedule/GanttView';
import { ItemSheet, type ItemDraft } from '../../../../components/schedule/ItemSheet';
import { useAuth } from '../../../../lib/auth-context';
import { useProject } from '../../../../lib/useProject';
import { supabase } from '../../../../lib/supabase';
import { fillsSoumissions } from '../../../../lib/trades';
import { loadPdfLib } from '../../../../lib/loadPdfLib';
import { getSignedUrl } from '../../../../lib/api/storage';
import { hasSiteSchedule, listTemplates, saveTemplate, type ScheduleTemplate, addItem, addLink, addTrade, createSchedule, deleteItem, listAudit, listTrades, loadSchedule, removeLink, updateItem, type AuditRow, type ScheduleBundle } from '../../../../lib/schedule/api';
import { cascade, endFromDuration, flatten, isWorkday, nextWorkday, addDays as addD, reconcile, rollup, workdaysBetween, type Conflict, type ScheduleItem, type Shift } from '../../../../lib/schedule/calc';
import { fill, shortDate } from '../../../../lib/schedule/copy';
import { useScheduleCopy } from '../../../../lib/schedule/useCopy';
import { buildSchedulePdf } from '../../../../lib/schedule/pdf';
import { templateStats, toTemplate } from '../../../../lib/schedule/templates';
import { scheduleMspdi, scheduleSheetRows } from '../../../../lib/schedule/exports';
import { colors, fontSize, radius, spacing } from '../../../../lib/theme';

// Planning de chantier (Gantt) — cahier des charges v1.0, MVP. Building
// companies only; anyone with access to the chantier reads it, editing on
// a computer or tablet (phone: consultation).

const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function ChantierGanttScreen() {
  const c = useScheduleCopy();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { organization } = useAuth();
  const { project } = useProject(id);
  const { width } = useWindowDimensions();
  const phone = width < 700;
  // Équipe plan and up, building companies only; null while checking
  const [allowed, setAllowed] = useState<boolean | null>(null);
  useEffect(() => {
    if (organization) hasSiteSchedule(organization.id).then(setAllowed);
  }, [organization?.id]);
  const building = fillsSoumissions(organization) && allowed === true;
  const editable = building && !phone;
  const today = todayIso();

  const [bundle, setBundle] = useState<ScheduleBundle | null | undefined>(undefined);
  const [trades, setTrades] = useState<string[]>([]);
  const [members, setMembers] = useState<{ id: string; name: string }[]>([]);
  const [zoom, setZoom] = useState<Zoom>('week');
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [hideDone, setHideDone] = useState(false);
  const [lateOnly, setLateOnly] = useState(false);
  const [arrows, setArrows] = useState(true);
  const [tradeFilter, setTradeFilter] = useState<string | null>(null);
  const [toToday, setToToday] = useState(0);
  const [editing, setEditing] = useState<{ item: ScheduleItem | null; initial: Partial<ItemDraft> & { preds?: string[] } } | null>(null);
  const [proposal, setProposal] = useState<{ shifts: Shift[]; conflicts: Conflict[] } | null>(null);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [history, setHistory] = useState<AuditRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string | null>(today);
  const [creating, setCreating] = useState(false);
  // after a bar snapped right after another line: offer to link them
  const [snapped, setSnapped] = useState<{ fromId: string; fromName: string; toId: string } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [templates, setTemplates] = useState<ScheduleTemplate[]>([]);
  const [tplOpen, setTplOpen] = useState(false);

  const reload = useCallback(async () => {
    if (!id) return;
    setBundle(await loadSchedule(id));
  }, [id]);

  useEffect(() => {
    reload();
  }, [reload]);
  useEffect(() => {
    if (!organization) return;
    listTrades(organization.id).then(setTrades);
    listTemplates(organization.id).then(setTemplates);
    supabase
      .from('organization_members')
      .select('user_id, full_name')
      .eq('organization_id', organization.id)
      .then(({ data }) => setMembers((data ?? []).map((m) => ({ id: m.user_id, name: m.full_name || '—' }))));
  }, [organization?.id]);

  const items = bundle?.items ?? [];
  const links = bundle?.links ?? [];
  const workdays = bundle?.schedule.workdays ?? [1, 2, 3, 4, 5];
  const rolled = useMemo(() => rollup(items, today), [items, today]);

  // A successor that starts before its predecessor ends.
  const conflicts = useMemo(() => {
    const byId = new Map(items.map((i) => [i.id, i]));
    const out = new Set<string>();
    for (const l of links) {
      const a = byId.get(l.from_item);
      const b = byId.get(l.to_item);
      if (a?.end_date && b?.start_date && (a.kind === 'milestone' ? b.start_date < a.end_date : b.start_date <= a.end_date)) out.add(b.id);
    }
    return out;
  }, [items, links]);

  // Filters keep the phases that still hold a matching line.
  const rows = useMemo(() => {
    const keep = (i: ScheduleItem) =>
      i.kind === 'phase' ||
      ((!hideDone || i.status !== 'done') && (!lateOnly || (rolled.get(i.id)?.late ?? 0) > 0) && (!tradeFilter || i.trade === tradeFilter));
    const filtering = hideDone || lateOnly || !!tradeFilter;
    let visible = items.filter(keep);
    if (filtering) {
      const hasKept = (pid: string): boolean => visible.some((v) => v.parent_id === pid && (v.kind !== 'phase' || hasKept(v.id)));
      visible = visible.filter((v) => v.kind !== 'phase' || hasKept(v.id));
    }
    return flatten(visible, collapsed);
  }, [items, hideDone, lateOnly, tradeFilter, collapsed, rolled]);

  const usedTrades = useMemo(() => [...new Set(items.map((i) => i.trade).filter(Boolean) as string[])].sort(), [items]);

  const proposeCascade = (next: ScheduleItem[], changedIds: string[]) => {
    const r = cascade(next, links, changedIds, workdays);
    if (r.shifts.length || r.conflicts.length) setProposal(r);
  };

  const onSave = async (draft: ItemDraft, preds: string[]): Promise<string | null> => {
    if (!bundle || !organization) return 'Planning introuvable';
    const editingItem = editing?.item ?? null;
    let saved: ScheduleItem | null;
    if (editingItem) {
      const { item, error: e } = await updateItem(editingItem.id, draft);
      if (e) return e;
      saved = item;
    } else {
      const siblings = items.filter((i) => i.parent_id === draft.parent_id);
      const order = Math.max(0, ...siblings.map((s) => s.sort_order)) + 1;
      const { item, error: e } = await addItem(bundle.schedule.id, organization.id, { ...draft, sort_order: order });
      if (e) return e;
      saved = item;
    }
    if (!saved) return 'Enregistrement impossible';
    // dependencies: add the new ones, remove the dropped ones
    const current = links.filter((l) => l.to_item === saved!.id);
    for (const l of current) if (!preds.includes(l.from_item)) await removeLink(l.id);
    for (const p of preds) if (!current.some((l) => l.from_item === p)) {
      const { error: e } = await addLink(bundle.schedule.id, p, saved.id);
      if (e) return e.includes('circulaire') ? c.cycle : e;
    }
    setEditing(null);
    const fresh = await loadSchedule(id!);
    setBundle(fresh);
    if (fresh && editingItem && (editingItem.start_date !== saved.start_date || editingItem.end_date !== saved.end_date)) proposeCascade(fresh.items, [saved.id]);
    return null;
  };

  const onDrag = async (item: ScheduleItem, start: string, end: string, mode: 'move' | 'resize', after?: { id: string; name: string }) => {
    // dates land on working days: a start on a Sunday becomes Monday, an end
    // on a Saturday the Friday before
    const workStart = nextWorkday(start, workdays);
    let workEnd = end;
    for (let i = 0; i < 7 && !isWorkday(workEnd, workdays) && workEnd > workStart; i++) workEnd = addD(workEnd, -1);
    const patch =
      mode === 'move'
        ? reconcile({ kind: item.kind, start_date: workStart, end_date: null, duration: item.duration ?? (item.kind === 'milestone' ? 0 : null) }, 'start', workdays)
        : reconcile({ kind: item.kind, start_date: item.start_date ?? workStart, end_date: workEnd, duration: null }, 'end', workdays);
    if (mode === 'move' && !item.duration && item.kind !== 'milestone') patch.end_date = addD(end, workStart > start ? 1 : 0);
    const { error: e } = await updateItem(item.id, patch);
    if (e) return setError(e);
    const fresh = await loadSchedule(id!);
    setBundle(fresh);
    setNotice(null);
    setSnapped(after && !links.some((l) => l.from_item === after.id && l.to_item === item.id) ? { fromId: after.id, fromName: after.name, toId: item.id } : null);
    if (fresh) proposeCascade(fresh.items, [item.id]);
  };

  // "+" on a phase: a new task in it, right after its last line, linked.
  const addInPhase = (phase: ScheduleItem) => {
    const kids = items.filter((i) => i.parent_id === phase.id && i.kind !== 'phase').sort((a, b) => (a.end_date ?? '').localeCompare(b.end_date ?? ''));
    const last = kids.at(-1);
    const start = last?.end_date ? nextWorkday(addD(last.end_date, last.kind === 'milestone' ? 0 : 1), workdays) : rolled.get(phase.id)?.start ?? today;
    setEditing({ item: null, initial: { kind: 'task', parent_id: phase.id, start_date: start, duration: 5, end_date: endFromDuration(start, 5, workdays), preds: last ? [last.id] : [] } });
  };

  const applyCascade = async () => {
    if (!proposal) return;
    for (const s of proposal.shifts) {
      const it = items.find((i) => i.id === s.id);
      await updateItem(s.id, { start_date: s.to.start, end_date: s.to.end, ...(it?.status === 'todo' ? { status: 'planned' } : {}) });
    }
    setProposal(null);
    reload();
  };

  const reorder = async (item: ScheduleItem, move: 'up' | 'down' | 'indent' | 'outdent') => {
    const siblings = items.filter((i) => i.parent_id === item.parent_id).sort((a, b) => a.sort_order - b.sort_order);
    const idx = siblings.findIndex((s) => s.id === item.id);
    if (move === 'up' || move === 'down') {
      const other = siblings[idx + (move === 'up' ? -1 : 1)];
      if (!other) return;
      await updateItem(item.id, { sort_order: other.sort_order });
      await updateItem(other.id, { sort_order: item.sort_order });
    } else if (move === 'indent') {
      const prev = siblings[idx - 1];
      if (!prev || prev.kind !== 'phase') return setError(c.indent + ' : —');
      const last = Math.max(0, ...items.filter((i) => i.parent_id === prev.id).map((i) => i.sort_order));
      await updateItem(item.id, { parent_id: prev.id, sort_order: last + 1 });
    } else {
      const parent = items.find((i) => i.id === item.parent_id);
      if (!parent) return;
      await updateItem(item.id, { parent_id: parent.parent_id, sort_order: parent.sort_order + 0.5 });
    }
    setEditing(null);
    reload();
  };

  const duplicate = async (item: ScheduleItem) => {
    if (!bundle || !organization) return;
    const { id: _id, baseline_start, baseline_end, actual_start, actual_end, ...rest } = item;
    await addItem(bundle.schedule.id, organization.id, { ...rest, name: `${item.name} (2)`, sort_order: item.sort_order + 0.5 } as never);
    setEditing(null);
    reload();
  };

  if (!project || bundle === undefined) {
    return (
      <AppScreen>
        <LoadingScreen />
      </AppScreen>
    );
  }

  const header = (
    <View style={styles.header}>
      <Pressable onPress={() => router.replace(`/(app)/chantiers/${id}` as never)} style={styles.back} hitSlop={8}>
        <Feather name="arrow-left" size={15} color={colors.textMuted} />
        <Text style={kit.hint}>{project.name}</Text>
      </Pressable>
      <Text style={styles.title}>{c.title}</Text>
      {!editable && bundle ? <Text style={kit.hint}>{phone ? c.phoneHint : c.readOnly}</Text> : null}
    </View>
  );

  async function create(tpl: Parameters<typeof createSchedule>[2]) {
    if (!organization || !id) return;
    setCreating(true);
    const { error: e } = await createSchedule(organization.id, id, tpl, startDate ?? today);
    setCreating(false);
    if (e) setError(e);
    reload();
  }

  if (!bundle) {
    return (
      <AppScreen>
        <ScrollView contentContainerStyle={styles.page}>
          {header}
          <View style={[kit.card, { maxWidth: 620 }]}>
            <Text style={kit.cardTitle}>{c.emptyTitle}</Text>
            <Text style={kit.body}>{c.emptyText}</Text>
            {!building && allowed === false ? <Text style={[kit.body, { fontWeight: '700' }]}>{c.planNeeded}</Text> : null}
            {building ? (
              <>
                <View style={{ maxWidth: 260 }}>
                  <DateField label={c.startDate} value={startDate} onChange={setStartDate} />
                </View>
                <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
                  {(['villa', 'empty'] as const).map((tpl) => (
                    <Btn
                      key={tpl}
                      label={tpl === 'villa' ? c.createVilla : c.createEmpty}
                      icon={tpl === 'villa' ? 'layers' : 'plus'}
                      variant={tpl === 'villa' ? 'primary' : 'secondary'}
                      disabled={creating || !organization}
                      onPress={() => create(tpl)}
                    />
                  ))}
                </View>
                {templates.length ? (
                  <>
                    <Text style={kit.eyebrow}>{c.yourTemplates}</Text>
                    <View style={{ gap: 6 }}>
                      {templates.map((tp) => {
                        const st = templateStats(tp.data);
                        return (
                          <Pressable key={tp.id} disabled={creating} onPress={() => create(tp.data)} style={styles.tplRow}>
                            <Feather name="bookmark" size={16} color={colors.primary} />
                            <View style={{ flex: 1 }}>
                              <Text style={[kit.body, { fontWeight: '700' }]}>{tp.name}</Text>
                              <Text style={kit.hint}>{tp.description ? `${tp.description} · ` : ''}{fill(c.templateStats, { p: st.phases, t: st.tasks + st.milestones, d: st.days })}</Text>
                            </View>
                            <Feather name="arrow-right" size={16} color={colors.textMuted} />
                          </Pressable>
                        );
                      })}
                    </View>
                  </>
                ) : null}
              </>
            ) : null}
            {error ? <Text style={{ color: colors.danger }}>{error}</Text> : null}
          </View>
        </ScrollView>
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <View style={[styles.page, { flex: 1 }]}>
        {header}
        {phone ? (
          <>
            {Platform.OS === 'web' ? <Btn icon="download" label={c.exportAll} onPress={() => setPdfOpen(true)} /> : null}
            <PhoneList c={c} rows={rows} rolled={rolled} onOpen={(item) => setEditing({ item, initial: {} })} />
          </>
        ) : (
          <>
            <View style={styles.toolbar}>
              {editable
                ? (['phase', 'task', 'milestone'] as const).map((k) => (
                    <Btn
                      key={k}
                      icon="plus"
                      label={k === 'phase' ? c.addPhase : k === 'task' ? c.addTask : c.addMilestone}
                      variant={k === 'task' ? 'primary' : 'secondary'}
                      onPress={() => setEditing({ item: null, initial: { kind: k, start_date: k === 'phase' ? null : today } })}
                    />
                  ))
                : null}
              <View style={kit.seg}>
                {(['day', 'week', 'month'] as Zoom[]).map((z) => (
                  <Pressable key={z} onPress={() => setZoom(z)} style={[kit.segItem, zoom === z && kit.segOn]}>
                    <Text style={[kit.segText, zoom === z && kit.segTextOn]}>{z === 'day' ? c.zoomDay : z === 'week' ? c.zoomWeek : c.zoomMonth}</Text>
                  </Pressable>
                ))}
              </View>
              <Btn icon="crosshair" label={c.today} onPress={() => setToToday((n) => n + 1)} />
              <View style={{ flex: 1 }} />
              <Btn icon="clock" label={c.history} variant="ghost" onPress={async () => setHistory(await listAudit(bundle.schedule.id))} />
              {editable && items.length ? <Btn icon="bookmark" label={c.saveTemplate} variant="ghost" onPress={() => setTplOpen(true)} /> : null}
              {Platform.OS === 'web' ? <Btn icon="download" label={c.exportAll} onPress={() => setPdfOpen(true)} /> : null}
            </View>
            <View style={styles.filters}>
              <Chip small label={c.hideDone} active={hideDone} onPress={() => setHideDone((v) => !v)} />
              <Chip small label={c.lateOnly} active={lateOnly} tone={lateOnly ? 'bad' : undefined} onPress={() => setLateOnly((v) => !v)} />
              <Chip small label={c.arrows} active={arrows} onPress={() => setArrows((v) => !v)} />
              <View style={styles.sep} />
              <Chip small label={c.allTrades} active={!tradeFilter} onPress={() => setTradeFilter(null)} />
              {usedTrades.map((t) => (
                <Pressable key={t} onPress={() => setTradeFilter(tradeFilter === t ? null : t)} style={[styles.tradeChip, tradeFilter === t && { borderColor: tradeColor(t), backgroundColor: `${tradeColor(t)}22` }]}>
                  <View style={[styles.dot, { backgroundColor: tradeColor(t) }]} />
                  <Text style={styles.tradeText}>{t}</Text>
                </Pressable>
              ))}
            </View>
            {error ? (
              <Pressable onPress={() => setError(null)}>
                <Text style={{ color: colors.danger, marginBottom: spacing.sm }}>{error}</Text>
              </Pressable>
            ) : null}
            {snapped || notice ? (
              <View style={styles.snapBar}>
                <Feather name={notice ? 'check-circle' : 'corner-down-right'} size={15} color={colors.primary} />
                <Text style={[kit.body, { flex: 1 }]}>{notice ?? fill(c.snapped, { name: snapped!.fromName })}</Text>
                {snapped && !notice ? (
                  <Btn
                    label={c.linkToo}
                    icon="link"
                    variant="primary"
                    onPress={async () => {
                      const { error: e } = await addLink(bundle.schedule.id, snapped.fromId, snapped.toId);
                      if (e) setError(e.includes('circulaire') ? c.cycle : e);
                      else setNotice(fill(c.linked, { name: snapped.fromName }));
                      setSnapped(null);
                      reload();
                    }}
                  />
                ) : null}
                <Pressable onPress={() => (setSnapped(null), setNotice(null))} hitSlop={8}>
                  <Feather name="x" size={16} color={colors.textMuted} />
                </Pressable>
              </View>
            ) : null}
            <GanttView
              c={c}
              rows={rows}
              rolled={rolled}
              links={links}
              zoom={zoom}
              today={today}
              workdays={workdays}
              showArrows={arrows}
              editable={editable}
              collapsed={collapsed}
              conflicts={conflicts}
              scrollToToday={toToday}
              onToggle={(itemId) =>
                setCollapsed((s) => {
                  const n = new Set(s);
                  if (n.has(itemId)) n.delete(itemId);
                  else n.add(itemId);
                  return n;
                })
              }
              onOpen={(item) => setEditing({ item, initial: {} })}
              onMove={onDrag}
              onAddInPhase={editable ? addInPhase : undefined}
            />
          </>
        )}
      </View>

      {editing ? (
        <ItemSheet
          c={c}
          item={editing.item}
          initial={editing.initial}
          items={items}
          links={links}
          rolled={rolled}
          trades={trades}
          members={members}
          workdays={workdays}
          editable={editable}
          onClose={() => setEditing(null)}
          onSave={onSave}
          onDelete={async () => {
            if (editing.item) await deleteItem(editing.item.id);
            setEditing(null);
            reload();
          }}
          onDuplicate={() => editing.item && duplicate(editing.item)}
          onReorder={(m) => editing.item && reorder(editing.item, m)}
          onAddTrade={(name) => {
            if (!organization) return;
            addTrade(organization.id, name);
            setTrades((t) => [...new Set([...t, name])]);
          }}
        />
      ) : null}

      {proposal ? (
        <Sheet
          title={c.cascadeTitle}
          onClose={() => setProposal(null)}
          footer={
            <>
              <Btn label={c.cascadeSkip} onPress={() => setProposal(null)} grow />
              {proposal.shifts.length ? <Btn label={c.cascadeApply} icon="fast-forward" variant="primary" grow onPress={applyCascade} /> : null}
            </>
          }
        >
          {proposal.shifts.length ? (
            <>
              <Text style={[kit.body, { fontWeight: '700' }]}>{cascadeSummary(c, proposal.shifts, workdays)}</Text>
              {proposal.shifts.map((s) => (
                <View key={s.id} style={styles.shift}>
                  <Text style={[kit.body, { flex: 1 }]} numberOfLines={1}>
                    {s.name}
                  </Text>
                  <Text style={[styles.mono, { color: colors.textMuted, textDecorationLine: 'line-through' }]}>{shortDate(s.from.start)}</Text>
                  <Feather name="arrow-right" size={13} color={colors.textMuted} />
                  <Text style={[styles.mono, { fontWeight: '800' }]}>{shortDate(s.to.start)}</Text>
                </View>
              ))}
            </>
          ) : null}
          {proposal.conflicts.length ? (
            <>
              <Text style={[kit.body, { color: colors.danger }]}>{c.cascadeConflicts}</Text>
              {proposal.conflicts.map((x) => (
                <Text key={x.id} style={kit.body}>
                  • {x.name} — {fill(c.cascadeNeeds, { date: shortDate(x.needsStart) })}
                </Text>
              ))}
            </>
          ) : null}
        </Sheet>
      ) : null}

      {tplOpen && organization ? (
        <TemplateSheet
          c={c}
          defaultName={project.name}
          onClose={() => setTplOpen(false)}
          onSave={async (name, description) => {
            const { error: e } = await saveTemplate(organization.id, name, description, toTemplate(items, links, workdays));
            if (e) return e;
            setTplOpen(false);
            setNotice(fill(c.templateSaved, { name }));
            listTemplates(organization.id).then(setTemplates);
            return null;
          }}
        />
      ) : null}
      {pdfOpen ? <PdfSheet c={c} project={project.name} items={items} links={links} workdays={workdays} rolled={rolled} today={today} onClose={() => setPdfOpen(false)} /> : null}

      {history ? (
        <Sheet title={c.history} onClose={() => setHistory(null)}>
          {history.length === 0 ? <Text style={kit.hint}>{c.historyEmpty}</Text> : null}
          {history.map((h) => (
            <View key={h.id} style={styles.histRow}>
              <Text style={[kit.hint, { width: 110 }]}>{new Date(h.created_at).toLocaleString('fr-CH', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</Text>
              <Text style={[kit.body, { flex: 1 }]}>
                <Text style={{ fontWeight: '700' }}>{h.item_name ?? '—'}</Text> · {c.field[h.field as keyof typeof c.field] ?? h.field}
                {h.field !== 'created' && h.field !== 'deleted' ? ` : ${h.old_value ?? '—'} → ${h.new_value ?? '—'}` : ''}
                {members.find((m) => m.id === h.user_id) ? ` · ${members.find((m) => m.id === h.user_id)!.name}` : ''}
              </Text>
            </View>
          ))}
        </Sheet>
      ) : null}
    </AppScreen>
  );
}

// "3 tâches décalées de 2 jours ouvrables" when they all move by the same
// amount, else just the count.
function cascadeSummary(c: ReturnType<typeof useScheduleCopy>, shifts: Shift[], workdays: number[]): string {
  const deltas = new Set(shifts.map((s) => (s.to.start > s.from.start ? workdaysBetween(s.from.start, s.to.start, workdays) - 1 : 0)));
  const d = deltas.size === 1 ? [...deltas][0] : null;
  return fill(d ? c.cascadeSummaryBy : c.cascadeSummary, { n: shifts.length, d: d ?? 0 });
}

function PhoneList({ c, rows, rolled, onOpen }: { c: ReturnType<typeof useScheduleCopy>; rows: ReturnType<typeof flatten>; rolled: ReturnType<typeof rollup>; onOpen: (i: ScheduleItem) => void }) {
  return (
    <ScrollView contentContainerStyle={{ gap: 6, paddingBottom: spacing.xxl }}>
      {rows.map(({ item, depth }) => {
        const r = rolled.get(item.id);
        const phase = item.kind === 'phase';
        return (
          <Pressable key={item.id} onPress={() => onOpen(item)} style={[styles.phoneRow, phase && { backgroundColor: '#F4F1EC' }, { marginLeft: depth * 12 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {item.trade ? <View style={[styles.dot, { backgroundColor: tradeColor(item.trade) }]} /> : null}
              <Text style={[kit.body, { flex: 1, fontWeight: phase ? '800' : '600' }]} numberOfLines={2}>
                {item.kind === 'milestone' ? '◆ ' : ''}
                {item.name}
              </Text>
              {phase ? <Text style={styles.mono}>{r?.progress ?? 0} %</Text> : <StatusPill c={c} item={item} late={r?.late ?? 0} />}
            </View>
            <Text style={kit.hint}>
              {shortDate(r?.start ?? null)} → {shortDate(r?.end ?? null)}
              {item.kind === 'task' && item.duration ? ` · ${item.duration} ${c.days}` : ''}
              {item.trade ? ` · ${item.trade}` : ''}
            </Text>
            {!phase && item.kind !== 'milestone' ? (
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${item.status === 'done' ? 100 : item.progress}%`, backgroundColor: tradeColor(item.trade) }]} />
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function TemplateSheet({ c, defaultName, onClose, onSave }: { c: ReturnType<typeof useScheduleCopy>; defaultName: string; onClose: () => void; onSave: (name: string, description: string | null) => Promise<string | null> }) {
  const [name, setName] = useState(defaultName);
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <Sheet
      title={c.saveTemplate}
      onClose={onClose}
      footer={
        <>
          <Btn label={c.cancel} onPress={onClose} grow />
          <Btn
            label={busy ? '…' : c.save}
            icon="bookmark"
            variant="primary"
            grow
            disabled={busy || !name.trim()}
            onPress={async () => {
              setBusy(true);
              setError(await onSave(name.trim(), description.trim() || null));
              setBusy(false);
            }}
          />
        </>
      }
    >
      <Text style={kit.hint}>{c.saveTemplateText}</Text>
      <Field label={c.templateName}>
        <TextInput value={name} onChangeText={setName} style={kit.input} maxLength={120} autoFocus />
      </Field>
      <Field label={c.templateDesc}>
        <TextInput value={description} onChangeText={setDescription} style={kit.input} />
      </Field>
      {error ? <Text style={{ color: colors.danger }}>{error}</Text> : null}
    </Sheet>
  );
}

function save(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

// The org logo (any format the browser reads) redrawn as PNG for pdf-lib;
// null when it cannot be loaded — the PDF then carries the name only.
async function logoAsPng(path: string): Promise<Uint8Array | null> {
  try {
    const url = await getSignedUrl(path);
    if (!url) return null;
    const blob = await (await fetch(url)).blob();
    const bmp = await createImageBitmap(blob);
    const scale = Math.min(1, 600 / bmp.width, 200 / bmp.height);
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bmp.width * scale));
    canvas.height = Math.max(1, Math.round(bmp.height * scale));
    canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const png = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, 'image/png'));
    return png ? new Uint8Array(await png.arrayBuffer()) : null;
  } catch {
    return null;
  }
}

function PdfSheet({ c, project, items, links, workdays, rolled, today, onClose }: { c: ReturnType<typeof useScheduleCopy>; project: string; items: ScheduleItem[]; links: ScheduleBundle['links']; workdays: number[]; rolled: ReturnType<typeof rollup>; today: string; onClose: () => void }) {
  const dates = [...rolled.values()].flatMap((r) => [r.start, r.end]).filter(Boolean).sort() as string[];
  const [from, setFrom] = useState<string | null>(dates[0] ?? today);
  const [to, setTo] = useState<string | null>(dates.at(-1) ?? today);
  const phases = items.filter((i) => i.kind === 'phase' && !i.parent_id);
  const [picked, setPicked] = useState<Set<string>>(new Set(phases.map((p) => p.id)));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { organization } = useAuth();
  const [brand, setBrand] = useState(false);
  const [format, setFormat] = useState<'pdf' | 'xlsx' | 'xml'>('pdf');

  const download = async () => {
    if (!from || !to) return;
    setBusy(true);
    setError(null);
    try {
      // the chosen phases, and the lines outside any phase
      const inPicked = (i: ScheduleItem): boolean => {
        if (!i.parent_id) return i.kind !== 'phase' || picked.has(i.id);
        const p = items.find((x) => x.id === i.parent_id);
        return p ? inPicked(p) : true;
      };
      const kept = items.filter(inPicked);
      const rows = flatten(kept).map((r) => ({ item: r.item, depth: r.depth }));
      const base = `${c.pdfTitle} - ${project}`.replace(/[\\/:*?"<>|]+/g, ' ');
      if (format !== 'pdf') {
        const ids = new Set(kept.map((i) => i.id));
        const keptLinks = links.filter((l) => ids.has(l.from_item) && ids.has(l.to_item));
        if (format === 'xlsx') {
          const XLSX = await import('xlsx');
          const ws = XLSX.utils.aoa_to_sheet(scheduleSheetRows(kept, keptLinks, rolled, workdays), { cellDates: true, dateNF: 'm/d/yy' /* Excel's short date: dd.mm.yyyy on Swiss settings */ });
          ws['!cols'] = [{ wch: 7 }, { wch: 44 }, { wch: 8 }, { wch: 22 }, { wch: 22 }, { wch: 11 }, { wch: 11 }, { wch: 10 }, { wch: 12 }, { wch: 11 }, { wch: 12 }, { wch: 30 }];
          ws['!autofilter'] = { ref: `A1:L${rows.length + 1}` };
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'Planning');
          save(new Blob([XLSX.write(wb, { type: 'array', bookType: 'xlsx' })], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `${base}.xlsx`);
        } else {
          save(new Blob([scheduleMspdi({ project, items: kept, links: keptLinks, rolled, workdays })], { type: 'application/xml' }), `${base}.xml`);
        }
        onClose();
        return;
      }
      const pdfLib = await loadPdfLib();
      const now = new Date();
      const bytes = await buildSchedulePdf(pdfLib, {
        c,
        project,
        rows,
        rolled,
        from: from < to ? from : to,
        to: to > from ? to : from,
        today,
        generatedAt: `${now.toLocaleDateString('fr-CH')} ${now.toLocaleTimeString('fr-CH', { hour: '2-digit', minute: '2-digit' })}`,
        brand: brand && organization ? { name: organization.name, logoPng: organization.logo_url ? await logoAsPng(organization.logo_url) : null } : null,
      });
      save(new Blob([bytes as BlobPart], { type: 'application/pdf' }), `${base}.pdf`);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet
      title={c.exportAll}
      onClose={onClose}
      footer={
        <>
          <Btn label={c.cancel} onPress={onClose} grow />
          <Btn label={busy ? '…' : format === 'pdf' ? c.pdfDownload : c.fileDownload} icon="download" variant="primary" grow disabled={busy} onPress={download} />
        </>
      }
    >
      <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
        {(['pdf', 'xlsx', 'xml'] as const).map((f) => (
          <Pressable key={f} onPress={() => setFormat(f)} style={[styles.fmt, format === f && styles.fmtOn]}>
            <Feather name={f === 'pdf' ? 'file-text' : f === 'xlsx' ? 'grid' : 'git-branch'} size={15} color={format === f ? colors.primary : colors.textMuted} />
            <Text style={[kit.body, { fontWeight: '700' }]}>{f === 'pdf' ? 'PDF' : f === 'xlsx' ? 'Excel' : 'MS Project'}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={kit.hint}>{format === 'pdf' ? c.fmtHintPdf : format === 'xlsx' ? c.fmtHintExcel : c.fmtHintProject}</Text>
      {format === 'pdf' ? (
        <>
          <Text style={kit.eyebrow}>{c.pdfPeriod}</Text>
          <View style={{ flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap' }}>
            <View style={{ flex: 1, minWidth: 160 }}>
              <DateField label={c.pdfFrom} value={from} onChange={setFrom} />
            </View>
            <View style={{ flex: 1, minWidth: 160 }}>
              <DateField label={c.pdfTo} value={to} onChange={setTo} />
            </View>
          </View>
        </>
      ) : null}
      {phases.length ? (
        <>
          <Text style={kit.eyebrow}>{c.pdfPhases}</Text>
          <View style={styles.filters}>
            <Chip small label={c.pdfAll} active={picked.size === phases.length} onPress={() => setPicked(new Set(phases.map((p) => p.id)))} />
            {phases.map((p) => (
              <Chip
                key={p.id}
                small
                label={p.name}
                active={picked.has(p.id)}
                onPress={() =>
                  setPicked((s) => {
                    const n = new Set(s);
                    if (n.has(p.id)) n.delete(p.id);
                    else n.add(p.id);
                    return n;
                  })
                }
              />
            ))}
          </View>
        </>
      ) : null}
      {organization && format === 'pdf' ? (
        <Pressable onPress={() => setBrand((b) => !b)} style={styles.brandRow}>
          <View style={[styles.check, brand && styles.checkOn]}>{brand ? <Feather name="check" size={13} color="#fff" /> : null}</View>
          <View style={{ flex: 1 }}>
            <Text style={kit.body}>{c.pdfBrand}</Text>
            <Text style={kit.hint}>{c.pdfBrandHint}</Text>
          </View>
        </Pressable>
      ) : null}
      {error ? <Text style={{ color: colors.danger }}>{error}</Text> : null}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  page: { padding: spacing.lg, gap: spacing.md, width: '100%', maxWidth: 1800, alignSelf: 'center' },
  header: { gap: 4 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' },
  title: { fontSize: 26, fontWeight: '800', color: colors.text },
  toolbar: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, alignItems: 'center' },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' },
  fmt: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: spacing.md, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  fmtOn: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  tplRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: 10, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: 10, borderWidth: 1, borderColor: colors.border },
  check: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  sep: { width: 1, height: 20, backgroundColor: colors.border, marginHorizontal: 4 },
  tradeChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  tradeText: { fontSize: 12.5, color: colors.text },
  dot: { width: 8, height: 8, borderRadius: 4 },
  snapBar: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.primary, backgroundColor: colors.primarySoft },
  shift: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.border },
  mono: { fontSize: fontSize.sm, color: colors.text, fontVariant: ['tabular-nums'] },
  histRow: { flexDirection: 'row', gap: spacing.sm, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.border },
  phoneRow: { padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, gap: 4 },
  progressTrack: { height: 5, borderRadius: 3, backgroundColor: colors.surfaceAlt, overflow: 'hidden', marginTop: 4 },
  progressFill: { height: 5, borderRadius: 3 },
});
