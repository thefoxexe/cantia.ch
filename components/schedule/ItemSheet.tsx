import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Btn, Chip, Field, Sheet, kit } from '../admin/ledger/kit';
import { DateField } from '../DateField';
import { reconcile, wouldCycle, type ItemKind, type ItemStatus, type Rolled, type ScheduleItem, type ScheduleLink } from '../../lib/schedule/calc';
import { fill, shortDate, type ScheduleCopy } from '../../lib/schedule/copy';
import { tradeColor } from './GanttView';
import { colors, fontSize, radius, spacing } from '../../lib/theme';

export interface ItemDraft {
  kind: ItemKind;
  parent_id: string | null;
  name: string;
  trade: string | null;
  company: string | null;
  responsible_user_id: string | null;
  team_size: number | null;
  status: ItemStatus;
  progress: number;
  progress_manual: boolean;
  start_date: string | null;
  end_date: string | null;
  duration: number | null;
  fixed: boolean;
  notes: string | null;
}

const STATUSES: ItemStatus[] = ['todo', 'planned', 'in_progress', 'done', 'blocked'];

// One line of the schedule: every field of the cahier des charges §4.3.
export function ItemSheet({
  c,
  item,
  initial,
  items,
  links,
  rolled,
  trades,
  members,
  workdays,
  editable,
  onClose,
  onSave,
  onDelete,
  onDuplicate,
  onReorder,
  onAddTrade,
}: {
  c: ScheduleCopy;
  item: ScheduleItem | null; // null = new line
  initial: Partial<ItemDraft>;
  items: ScheduleItem[];
  links: ScheduleLink[];
  rolled: Map<string, Rolled>;
  trades: string[];
  members: { id: string; name: string }[];
  workdays: number[];
  editable: boolean;
  onClose: () => void;
  onSave: (draft: ItemDraft, predecessors: string[]) => Promise<string | null>;
  onDelete: () => Promise<void>;
  onDuplicate: () => void;
  onReorder: (move: 'up' | 'down' | 'indent' | 'outdent') => void;
  onAddTrade: (name: string) => void;
}) {
  const [d, setD] = useState<ItemDraft>(() => ({
    kind: item?.kind ?? initial.kind ?? 'task',
    parent_id: item?.parent_id ?? initial.parent_id ?? null,
    name: item?.name ?? '',
    trade: item?.trade ?? null,
    company: item?.company ?? null,
    responsible_user_id: item?.responsible_user_id ?? null,
    team_size: item?.team_size ?? null,
    status: item?.status ?? 'todo',
    progress: item?.progress ?? 0,
    progress_manual: item?.progress_manual ?? false,
    start_date: item?.start_date ?? initial.start_date ?? null,
    end_date: item?.end_date ?? initial.end_date ?? null,
    duration: item?.duration ?? initial.duration ?? (initial.kind === 'milestone' ? 0 : null),
    fixed: item?.fixed ?? false,
    notes: item?.notes ?? null,
  }));
  const [preds, setPreds] = useState<string[]>(() => (item ? links.filter((l) => l.to_item === item.id).map((l) => l.from_item) : []));
  const [tradeQuery, setTradeQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const set = (p: Partial<ItemDraft>) => setD((x) => ({ ...x, ...p }));
  const dates = (p: Partial<ItemDraft>, changed: 'start' | 'end' | 'duration') => setD((x) => ({ ...x, ...reconcile({ ...x, ...p }, changed, workdays) }));

  const phases = items.filter((i) => i.kind === 'phase' && i.id !== item?.id);
  const childCount = item ? countDescendants(items, item.id) : 0;
  const candidates = items.filter((i) => i.kind !== 'phase' && i.id !== item?.id);
  const isPhase = d.kind === 'phase';
  const ro = !editable;
  const r = item ? rolled.get(item.id) : undefined;
  const tradeList = useMemo(() => {
    const q = tradeQuery.trim().toLowerCase();
    return trades.filter((t) => !q || t.toLowerCase().includes(q));
  }, [trades, tradeQuery]);

  const save = async () => {
    if (!d.name.trim()) return setError(c.nameRequired);
    for (const p of preds) {
      const others = links.filter((l) => !(item && l.to_item === item.id));
      if (item && wouldCycle(others, p, item.id)) return setError(c.cycle);
    }
    setBusy(true);
    const err = await onSave({ ...d, name: d.name.trim() }, isPhase ? [] : preds);
    setBusy(false);
    if (err) setError(err);
  };

  return (
    <Sheet
      title={item ? (ro ? item.name : c.editItem) : c.newItem}
      onClose={onClose}
      footer={
        ro ? (
          <Btn label={c.cancel} onPress={onClose} grow />
        ) : confirmDelete ? (
          <>
            <Btn label={c.cancel} onPress={() => setConfirmDelete(false)} grow />
            <Btn label={c.confirmDelete} icon="trash-2" variant="bad" grow onPress={onDelete} />
          </>
        ) : (
          <>
            <Btn label={c.cancel} onPress={onClose} grow />
            <Btn label={busy ? c.saving : c.save} icon="check" variant="primary" grow disabled={busy} onPress={save} />
          </>
        )
      }
    >
      {confirmDelete ? (
        <Text style={kit.body}>{childCount ? fill(c.deletePhaseConfirm, { n: childCount }) : fill(c.deleteConfirm, { name: item?.name ?? '' })}</Text>
      ) : (
        <View style={{ gap: spacing.md }}>
          {!item ? (
            <Field label={c.type}>
              <View style={styles.chips}>
                {(['phase', 'task', 'milestone'] as ItemKind[]).map((k) => (
                  <Chip key={k} label={c.kind[k]} active={d.kind === k} onPress={() => set({ kind: k, ...(k === 'milestone' ? { duration: 0, end_date: d.start_date } : {}) })} />
                ))}
              </View>
            </Field>
          ) : null}
          <Field label={c.name}>
            <TextInput style={kit.input} value={d.name} onChangeText={(v) => set({ name: v })} editable={!ro} autoFocus={!item} />
          </Field>
          <Field label={c.parent}>
            <View style={styles.chips}>
              <Chip small label={c.topLevel} active={!d.parent_id} onPress={() => !ro && set({ parent_id: null })} />
              {phases.map((p) => (
                <Chip key={p.id} small label={p.name} active={d.parent_id === p.id} onPress={() => !ro && set({ parent_id: p.id })} />
              ))}
            </View>
          </Field>

          {isPhase ? (
            r?.start ? (
              <Text style={kit.hint}>
                {shortDate(r.start)} → {shortDate(r.end)}
              </Text>
            ) : null
          ) : (
            <View style={styles.row3}>
              <View style={{ flex: 1, minWidth: 150 }}>
                <DateField label={c.start} value={d.start_date} onChange={(v) => !ro && dates({ start_date: v }, 'start')} />
              </View>
              {d.kind === 'task' ? (
                <>
                  <View style={{ flex: 1, minWidth: 150 }}>
                    <DateField label={c.end} value={d.end_date} onChange={(v) => !ro && dates({ end_date: v }, 'end')} />
                  </View>
                  <Field label={c.duration} half>
                    <TextInput
                      style={kit.input}
                      value={d.duration == null ? '' : String(d.duration)}
                      onChangeText={(v) => {
                        const n = v.trim() === '' ? null : Math.max(1, Math.min(3650, Number(v.replace(/\D/g, '')) || 1));
                        dates({ duration: n }, 'duration');
                      }}
                      keyboardType="number-pad"
                      editable={!ro}
                    />
                  </Field>
                </>
              ) : null}
            </View>
          )}
          {item?.baseline_start && (item.baseline_start !== d.start_date || item.baseline_end !== d.end_date) ? (
            <Text style={kit.hint}>{fill(c.baseline, { start: shortDate(item.baseline_start), end: shortDate(item.baseline_end) })}</Text>
          ) : null}
          {item?.actual_start ? (
            <Text style={kit.hint}>
              {c.actual} : {shortDate(item.actual_start)} → {item.actual_end ? shortDate(item.actual_end) : '…'}
            </Text>
          ) : null}

          {!isPhase ? (
            <>
              <Field label={c.trade}>
                <View style={styles.chips}>
                  {tradeList.map((t) => (
                    <Pressable key={t} onPress={() => !ro && set({ trade: d.trade === t ? null : t })} style={[styles.trade, d.trade === t && { borderColor: tradeColor(t), backgroundColor: `${tradeColor(t)}22` }]}>
                      <View style={[styles.dot, { backgroundColor: tradeColor(t) }]} />
                      <Text style={styles.tradeText}>{t}</Text>
                    </Pressable>
                  ))}
                </View>
                {!ro ? (
                  <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'center' }}>
                    <TextInput style={[kit.input, { flex: 1 }]} value={tradeQuery} onChangeText={setTradeQuery} placeholder={c.tradeSearch} />
                    {tradeQuery.trim() && !trades.some((t) => t.toLowerCase() === tradeQuery.trim().toLowerCase()) ? (
                      <Btn
                        label={fill(c.addTrade, { name: tradeQuery.trim() })}
                        icon="plus"
                        onPress={() => {
                          onAddTrade(tradeQuery.trim());
                          set({ trade: tradeQuery.trim() });
                          setTradeQuery('');
                        }}
                      />
                    ) : null}
                  </View>
                ) : null}
              </Field>
              <View style={styles.row3}>
                <Field label={c.company} half>
                  <TextInput style={kit.input} value={d.company ?? ''} onChangeText={(v) => set({ company: v || null })} editable={!ro} />
                </Field>
                <Field label={c.team} half>
                  <TextInput style={kit.input} value={d.team_size == null ? '' : String(d.team_size)} onChangeText={(v) => set({ team_size: v.trim() === '' ? null : Math.min(999, Number(v.replace(/\D/g, '')) || 0) })} keyboardType="number-pad" editable={!ro} />
                </Field>
              </View>
            </>
          ) : null}
          <Field label={c.responsible}>
            <View style={styles.chips}>
              <Chip small label={c.nobody} active={!d.responsible_user_id} onPress={() => !ro && set({ responsible_user_id: null })} />
              {members.map((m) => (
                <Chip key={m.id} small label={m.name} active={d.responsible_user_id === m.id} onPress={() => !ro && set({ responsible_user_id: m.id })} />
              ))}
            </View>
          </Field>

          {!isPhase ? (
            <Field label={c.colStatus}>
              <View style={styles.chips}>
                {STATUSES.map((s) => (
                  <Chip key={s} small label={c.status[s]} active={d.status === s} tone={s === 'done' ? 'ok' : s === 'blocked' ? 'bad' : undefined} onPress={() => !ro && set({ status: s, ...(s === 'done' ? { progress: 100 } : {}) })} />
                ))}
              </View>
            </Field>
          ) : null}
          {d.kind !== 'milestone' ? (
            <Field label={c.progress}>
              {isPhase ? (
                <View style={styles.chips}>
                  <Chip small label={`${c.progressAuto} (${r?.progress ?? 0} %)`} active={!d.progress_manual} onPress={() => !ro && set({ progress_manual: false })} />
                  <Chip small label={c.progressManual} active={d.progress_manual} onPress={() => !ro && set({ progress_manual: true })} />
                </View>
              ) : null}
              {!isPhase || d.progress_manual ? (
                <View style={styles.chips}>
                  {[0, 25, 50, 75, 100].map((p) => (
                    <Chip key={p} small label={`${p} %`} active={d.progress === p} onPress={() => !ro && set({ progress: p, ...(p > 0 && d.status !== 'done' && !isPhase ? { status: p === 100 ? 'done' : 'in_progress' } : {}) })} />
                  ))}
                  <TextInput style={[kit.input, { width: 70 }]} value={String(d.progress)} onChangeText={(v) => set({ progress: Math.max(0, Math.min(100, Number(v.replace(/\D/g, '')) || 0)) })} keyboardType="number-pad" editable={!ro} />
                </View>
              ) : null}
            </Field>
          ) : null}

          {!isPhase ? (
            <Field label={c.predecessors}>
              <View style={styles.chips}>
                {candidates.length === 0 ? <Text style={kit.hint}>{c.noPredecessor}</Text> : null}
                {candidates.map((p) => {
                  const on = preds.includes(p.id);
                  return <Chip key={p.id} small label={p.name} active={on} onPress={() => !ro && setPreds((x) => (on ? x.filter((y) => y !== p.id) : [...x, p.id]))} />;
                })}
              </View>
            </Field>
          ) : null}
          {!isPhase ? (
            <Pressable onPress={() => !ro && set({ fixed: !d.fixed })} style={styles.check}>
              <View style={[styles.box, d.fixed && { backgroundColor: colors.primary, borderColor: colors.primary }]}>{d.fixed ? <Feather name="lock" size={11} color="#fff" /> : null}</View>
              <Text style={kit.body}>{c.fixed}</Text>
            </Pressable>
          ) : null}
          <Field label={c.notes}>
            <TextInput style={[kit.input, { minHeight: 70, textAlignVertical: 'top' }]} value={d.notes ?? ''} onChangeText={(v) => set({ notes: v || null })} multiline editable={!ro} />
          </Field>
          {error ? <Text style={{ color: colors.danger }}>{error}</Text> : null}

          {item && !ro ? (
            <View style={[styles.chips, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md }]}>
              <Btn label={c.moveUp} icon="arrow-up" variant="ghost" onPress={() => onReorder('up')} />
              <Btn label={c.moveDown} icon="arrow-down" variant="ghost" onPress={() => onReorder('down')} />
              <Btn label={c.indent} icon="corner-down-right" variant="ghost" onPress={() => onReorder('indent')} />
              {item.parent_id ? <Btn label={c.outdent} icon="corner-up-left" variant="ghost" onPress={() => onReorder('outdent')} /> : null}
              <Btn label={c.duplicate} icon="copy" variant="ghost" onPress={onDuplicate} />
              <Btn label={c.delete} icon="trash-2" variant="ghost" onPress={() => setConfirmDelete(true)} />
            </View>
          ) : null}
        </View>
      )}
    </Sheet>
  );
}

function countDescendants(items: ScheduleItem[], id: string): number {
  const kids = items.filter((i) => i.parent_id === id);
  return kids.length + kids.reduce((n, k) => n + countDescendants(items, k.id), 0);
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' },
  row3: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, alignItems: 'flex-end' },
  trade: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border },
  tradeText: { fontSize: fontSize.sm, color: colors.text },
  dot: { width: 8, height: 8, borderRadius: 4 },
  check: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  box: { width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
});
