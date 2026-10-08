import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Button } from '../ui';
import { SectionHeader } from './Shell';
import { Panel, Segmented, Stat } from './Workspace';
import { ClientPicker, Empty, Input, LinkButton, Message, Picks, Pill, Toggle, isoToSwiss, memberName, ps, todayIso, useClientOptions, useTeam } from './ProShared';
import { useAccCopy } from '../../lib/accounting/locale';
import { fill } from '../../lib/accounting/copy';
import { formatChf, formatDate, type Me } from '../../lib/accounting/api';
import { parseSwissDate } from '../../lib/accounting/workCopy';
import { daysUntil } from '../../lib/accounting/workspace';
import {
  DEFAULT_TEMPLATES,
  WORK_KINDS,
  WORK_STATUSES,
  clientHref,
  formatMinutes,
  pro,
  refFromKey,
  type ClientRef,
  type ProcessTemplate,
  type TimeEntry,
  type WorkItem,
  type WorkKind,
  type WorkStatus,
} from '../../lib/accounting/pro';
import { parseDuration, useProCopy } from '../../lib/accounting/proCopy';
import { downloadTextFile } from '../../lib/downloadFile';
import { colors, fontSize, radius, spacing } from '../../lib/theme';

// ---------------------------------------------------------------------------
// Work: checklists per client and period.

type WorkFilter = 'open' | 'late' | 'waiting' | 'done' | 'all';

export function WorkSection({ me, client, embedded = false }: { me: Me; client?: ClientRef; embedded?: boolean }) {
  const p = useProCopy();
  const t = p.work;
  const { locale } = useAccCopy();
  const [items, setItems] = useState<WorkItem[] | null>(null);
  const [filter, setFilter] = useState<WorkFilter>('open');
  const [mine, setMine] = useState(false);
  const [composing, setComposing] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const team = useTeam();

  const load = useCallback(async () => {
    const { data, error } = await pro.workItems(client ?? {});
    if (error) setMessage({ text: error, error: true });
    setItems(data ?? []);
  }, [client?.org, client?.ext]);
  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    const m = team?.members.find((x) => x.me);
    setUserId(m?.user_id ?? null);
  }, [team]);

  const late = (w: WorkItem) => w.status !== 'done' && !!w.due_date && daysUntil(w.due_date) < 0;
  const base = (items ?? []).filter((w) => !mine || w.assigned_to === userId);
  const counts = {
    open: base.filter((w) => w.status !== 'done').length,
    late: base.filter(late).length,
    waiting: base.filter((w) => w.status === 'waiting_client').length,
    done: base.filter((w) => w.status === 'done').length,
    all: base.length,
  };
  const list = base.filter((w) => (filter === 'open' ? w.status !== 'done' : filter === 'late' ? late(w) : filter === 'waiting' ? w.status === 'waiting_client' : filter === 'done' ? w.status === 'done' : true));

  const head = (
    <View style={ps.actions}>
      <Button title={t.new} icon="plus" onPress={() => setComposing((v) => !v)} />
      {!client ? <LinkButton label={t.templatesTitle} icon="layers" onPress={() => setShowTemplates((v) => !v)} /> : null}
    </View>
  );

  return (
    <View style={st.stack}>
      {embedded ? head : <SectionHeader eyebrow={me.firm.name} title={t.title} text={t.text} right={head} />}
      {showTemplates ? <TemplatesPanel /> : null}
      {composing ? (
        <NewWorkForm
          fixed={client}
          onCancel={() => setComposing(false)}
          onCreated={() => {
            setComposing(false);
            setMessage({ text: t.created, error: false });
            load();
          }}
        />
      ) : null}
      <View style={[ps.actions, { justifyContent: 'space-between' }]}>
        <Segmented value={filter} onChange={setFilter} options={(['open', 'late', 'waiting', 'done', 'all'] as WorkFilter[]).map((k) => ({ key: k, label: t.filters[k], count: counts[k] }))} />
        {team && team.members.length > 1 ? <Toggle value={mine} onChange={setMine} label={t.mine} /> : null}
      </View>
      <Message value={message} />
      {items === null ? (
        <Text style={ps.muted}>{p.common.loading}</Text>
      ) : items.length === 0 ? (
        <Panel>
          <Empty icon="check-square" text={t.empty} />
        </Panel>
      ) : list.length === 0 ? (
        <Text style={ps.muted}>{t.emptyFilter}</Text>
      ) : (
        <View style={st.grid}>
          {list.map((w) => (
            <WorkCard key={w.id} item={w} showClient={!client} locale={locale} members={team?.members ?? []} onChanged={load} onError={(e) => setMessage({ text: e, error: true })} />
          ))}
        </View>
      )}
    </View>
  );
}

function WorkCard({
  item: w,
  showClient,
  locale,
  members,
  onChanged,
  onError,
}: {
  item: WorkItem;
  showClient: boolean;
  locale: string;
  members: { user_id: string; first_name: string | null; last_name: string | null; email: string }[];
  onChanged: () => void;
  onError: (e: string) => void;
}) {
  const p = useProCopy();
  const t = p.work;
  const router = useRouter();
  const [steps, setSteps] = useState(w.steps);
  const [status, setStatus] = useState<WorkStatus>(w.status);
  const [newStep, setNewStep] = useState('');
  const [open, setOpen] = useState(w.status !== 'done');
  const [editing, setEditing] = useState(false);
  useEffect(() => {
    setSteps(w.steps);
    setStatus(w.status);
  }, [w]);
  const done = steps.filter((s) => s.done).length;
  const isLate = status !== 'done' && !!w.due_date && daysUntil(w.due_date) < 0;
  const tone = status === 'done' ? 'success' : isLate ? 'danger' : status === 'waiting_client' ? 'warning' : status === 'review' ? 'primary' : 'neutral';

  async function toggle(id: string, value: boolean) {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, done: value } : s)));
    const { data, error } = await pro.toggleStep(id, value);
    if (error) {
      onError(error);
      onChanged();
    } else if (data) setStatus(data);
  }

  async function patch(value: Parameters<typeof pro.updateWorkItem>[1]) {
    const { error } = await pro.updateWorkItem(w.id, value);
    if (error) onError(error);
    onChanged();
  }

  async function addStep() {
    if (!newStep.trim()) return;
    const { error } = await pro.addStep(w.id, newStep.trim());
    if (error) return onError(error);
    setNewStep('');
    onChanged();
  }

  return (
    <View style={[st.workCard, status === 'done' && { opacity: 0.85 }]}>
      <Pressable onPress={() => setOpen((v) => !v)} style={st.workHead}>
        <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
          {showClient ? (
            <Pressable onPress={() => router.push(clientHref(w, 'work') as any)}>
              <Text style={st.client} numberOfLines={1}>
                {w.client_name}
              </Text>
            </Pressable>
          ) : null}
          <Text style={ps.bodyStrong} numberOfLines={2}>
            {w.title}
            {w.period_label ? ` · ${w.period_label}` : ''}
          </Text>
          <Text style={ps.small}>
            {[t.kinds[w.kind], w.due_date ? `${p.common.due} ${formatDate(w.due_date, locale)}` : null, w.assigned_name, w.minutes ? fill(t.timeSpent, { time: formatMinutes(w.minutes) }) : null].filter(Boolean).join(' · ')}
          </Text>
        </View>
        <Pill label={t.statuses[status]} tone={tone as any} />
      </Pressable>
      {steps.length ? (
        <View style={st.progressTrack}>
          <View style={[st.progressFill, { width: `${Math.round((done / steps.length) * 100)}%`, backgroundColor: status === 'done' ? colors.success : colors.primary }]} />
        </View>
      ) : null}
      <Text style={ps.small}>{fill(t.progress, { done, total: steps.length })}</Text>
      {open ? (
        <View style={{ gap: 2 }}>
          {steps.map((s) => (
            <Pressable key={s.id} onPress={() => toggle(s.id, !s.done)} style={({ hovered }: any) => [st.step, hovered && { backgroundColor: colors.bg }]}>
              <View style={[ps.check, s.done && { backgroundColor: colors.success, borderColor: colors.success }]}>{s.done ? <Feather name="check" size={12} color="#fff" /> : null}</View>
              <Text style={[ps.body, { flex: 1 }, s.done && st.stepDone]}>{s.title}</Text>
              {s.done && s.done_by_name ? <Text style={ps.small}>{s.done_by_name}</Text> : null}
            </Pressable>
          ))}
          <View style={[ps.actions, { marginTop: 4 }]}>
            <TextInput value={newStep} onChangeText={setNewStep} onSubmitEditing={addStep} placeholder={t.stepPlaceholder} placeholderTextColor={colors.textMuted} style={[ps.input, { flex: 1, minWidth: 160, paddingVertical: 6 }]} />
            <LinkButton label={t.addStep} icon="plus" onPress={addStep} disabled={!newStep.trim()} />
          </View>
          <View style={[ps.actions, { marginTop: spacing.sm }]}>
            {(['todo', 'in_progress', 'waiting_client', 'review', 'done'] as WorkStatus[]).map((k) => (
              <Pressable key={k} onPress={() => k !== status && (setStatus(k), patch({ status: k }))} style={[st.state, k === status && st.stateOn]}>
                <Text style={[st.stateText, k === status && st.stateTextOn]}>{t.statuses[k]}</Text>
              </Pressable>
            ))}
          </View>
          {editing ? (
            <WorkEdit item={w} members={members} onClose={() => setEditing(false)} onSave={(v) => (setEditing(false), patch(v))} />
          ) : (
            <View style={ps.actions}>
              <LinkButton label={p.common.edit} icon="edit-2" tone="muted" onPress={() => setEditing(true)} />
              <LinkButton label={t.cancelWork} tone="muted" onPress={() => patch({ status: 'cancelled' })} />
            </View>
          )}
        </View>
      ) : null}
    </View>
  );
}

function WorkEdit({ item, members, onClose, onSave }: { item: WorkItem; members: { user_id: string; first_name: string | null; last_name: string | null; email: string }[]; onClose: () => void; onSave: (v: { title: string; period_label: string | null; due_date: string | null; assigned_to: string | null }) => void }) {
  const p = useProCopy();
  const t = p.work;
  const [title, setTitle] = useState(item.title);
  const [period, setPeriod] = useState(item.period_label ?? '');
  const [due, setDue] = useState(isoToSwiss(item.due_date));
  const [assigned, setAssigned] = useState<string | null>(item.assigned_to);
  const [error, setError] = useState<string | null>(null);
  return (
    <View style={[ps.card, { backgroundColor: colors.bg }]}>
      <Input label={t.what} value={title} onChangeText={setTitle} maxLength={160} />
      <View style={ps.row}>
        <Input label={t.period} value={period} onChangeText={setPeriod} placeholder={t.periodPlaceholder} style={{ flexGrow: 1, flexBasis: 140 }} />
        <Input label={p.common.due} value={due} onChangeText={setDue} placeholder={p.common.datePlaceholder} style={{ flexGrow: 1, flexBasis: 140 }} />
      </View>
      {members.length > 1 ? (
        <Picks label={t.assigned} value={assigned ?? '__none'} onChange={(v) => setAssigned(v === '__none' ? null : v)} options={[{ key: '__none', label: p.common.nobody }, ...members.map((m) => ({ key: m.user_id, label: memberName(m) }))]} />
      ) : null}
      {error ? <Text style={ps.error}>{error}</Text> : null}
      <View style={ps.actions}>
        <Button
          title={p.common.save}
          onPress={() => {
            const d = parseSwissDate(due);
            if (d === undefined) return setError(p.common.invalidDate);
            onSave({ title: title.trim() || item.title, period_label: period.trim() || null, due_date: d, assigned_to: assigned });
          }}
        />
        <LinkButton label={p.common.cancel} tone="muted" onPress={onClose} />
      </View>
    </View>
  );
}

function NewWorkForm({ fixed, onCancel, onCreated }: { fixed?: ClientRef; onCancel: () => void; onCreated: () => void }) {
  const p = useProCopy();
  const t = p.work;
  const { locale } = useAccCopy();
  const options = useClientOptions();
  const team = useTeam();
  const [clientKey, setClientKey] = useState<string | null>(null);
  const [templates, setTemplates] = useState<ProcessTemplate[]>([]);
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<WorkKind>('closing');
  const [period, setPeriod] = useState(String(new Date().getFullYear() - 1));
  const [due, setDue] = useState('');
  const [assigned, setAssigned] = useState<string | null>(null);
  const [steps, setSteps] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    pro.templates().then(({ data }) => setTemplates(data ?? []));
  }, []);

  const defaults = DEFAULT_TEMPLATES[locale];
  const choices: { id: string; name: string; kind: WorkKind; steps: string[] }[] = templates.length ? templates : defaults.map((d, i) => ({ id: `default-${i}`, ...d }));

  function useTemplate(tpl: { id: string; name: string; kind: WorkKind; steps: string[] }) {
    setTemplateId(tpl.id);
    setKind(tpl.kind);
    setTitle(tpl.name);
    setSteps(tpl.steps.join('\n'));
  }

  async function create() {
    const ref = fixed ?? (clientKey ? refFromKey(clientKey) : null);
    if (!ref || title.trim().length < 2) return;
    const dueIso = parseSwissDate(due);
    if (dueIso === undefined) return setError(p.common.invalidDate);
    setBusy(true);
    setError(null);
    const { error: e } = await pro.createWorkItem(ref, {
      title: title.trim(),
      kind,
      period: period.trim() || null,
      due: dueIso,
      assigned,
      steps: steps.split('\n').map((x) => x.trim()).filter(Boolean),
      template: templateId && !templateId.startsWith('default-') ? templateId : null,
    });
    setBusy(false);
    if (e) setError(e);
    else onCreated();
  }

  return (
    <Panel title={t.new} tone="accent">
      {!fixed ? <ClientPicker value={clientKey} onChange={setClientKey} options={options} /> : null}
      <View style={{ gap: 6 }}>
        <Text style={ps.label}>{t.fromTemplate}</Text>
        <View style={ps.pickList}>
          {choices.map((tpl) => (
            <Pressable key={tpl.id} onPress={() => useTemplate(tpl)} style={[ps.pick, templateId === tpl.id && ps.pickOn]}>
              <Feather name="layers" size={12} color={templateId === tpl.id ? colors.primaryDark : colors.textMuted} />
              <Text style={[ps.pickText, templateId === tpl.id && ps.pickTextOn]}>{tpl.name}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <View style={ps.row}>
        <Input label={t.what} value={title} onChangeText={setTitle} placeholder={t.titlePlaceholder} maxLength={160} style={{ flexGrow: 2, flexBasis: 220 }} />
        <Input label={t.period} value={period} onChangeText={setPeriod} placeholder={t.periodPlaceholder} style={{ flexGrow: 1, flexBasis: 120 }} />
        <Input label={p.common.due} value={due} onChangeText={setDue} placeholder={p.common.datePlaceholder} style={{ flexGrow: 1, flexBasis: 130 }} />
      </View>
      <Picks label={t.kind} value={kind} onChange={setKind} options={WORK_KINDS.map((k) => ({ key: k, label: t.kinds[k] }))} />
      {team && team.members.length > 1 ? (
        <Picks label={t.assigned} value={assigned ?? '__none'} onChange={(v) => setAssigned(v === '__none' ? null : v)} options={[{ key: '__none', label: p.common.nobody }, ...team.members.map((m) => ({ key: m.user_id, label: memberName(m) }))]} />
      ) : null}
      <Input label={t.steps} hint={t.stepsHint} value={steps} onChangeText={setSteps} multiline />
      {error ? <Text style={ps.error}>{error}</Text> : null}
      <View style={ps.actions}>
        <Button title={t.create} icon="check" onPress={create} loading={busy} disabled={(!fixed && !clientKey) || title.trim().length < 2} />
        <LinkButton label={p.common.cancel} tone="muted" onPress={onCancel} />
      </View>
    </Panel>
  );
}

function TemplatesPanel() {
  const p = useProCopy();
  const t = p.work;
  const { locale } = useAccCopy();
  const [rows, setRows] = useState<ProcessTemplate[] | null>(null);
  const [editing, setEditing] = useState<{ id: string | null; name: string; kind: WorkKind; steps: string } | null>(null);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const load = useCallback(() => {
    pro.templates().then(({ data }) => setRows(data ?? []));
  }, []);
  useEffect(load, [load]);

  async function save() {
    if (!editing) return;
    const { error } = await pro.saveTemplate(editing.id, editing.name.trim(), editing.kind, editing.steps.split('\n').map((x) => x.trim()).filter(Boolean));
    setMessage(error ? { text: error, error: true } : { text: p.common.saved, error: false });
    if (!error) setEditing(null);
    load();
  }

  async function addDefaults() {
    for (const d of DEFAULT_TEMPLATES[locale]) await pro.saveTemplate(null, d.name, d.kind, d.steps);
    setMessage({ text: t.defaultsAdded, error: false });
    load();
  }

  return (
    <Panel
      title={t.templatesTitle}
      right={
        <View style={ps.actions}>
          {rows && rows.length === 0 ? <LinkButton label={t.useDefaults} icon="download" onPress={addDefaults} /> : null}
          <LinkButton label={t.newTemplate} icon="plus" onPress={() => setEditing({ id: null, name: '', kind: 'other', steps: '' })} />
        </View>
      }
    >
      <Text style={ps.small}>{t.templatesText}</Text>
      <Message value={message} />
      {editing ? (
        <View style={[ps.card, { backgroundColor: colors.bg }]}>
          <Input label={t.templateName} value={editing.name} onChangeText={(v) => setEditing({ ...editing, name: v })} maxLength={120} />
          <Picks label={t.kind} value={editing.kind} onChange={(v) => setEditing({ ...editing, kind: v })} options={WORK_KINDS.map((k) => ({ key: k, label: t.kinds[k] }))} />
          <Input label={t.steps} hint={t.stepsHint} value={editing.steps} onChangeText={(v) => setEditing({ ...editing, steps: v })} multiline />
          <View style={ps.actions}>
            <Button title={t.saveTemplate} onPress={save} disabled={editing.name.trim().length < 2 || !editing.steps.trim()} />
            <LinkButton label={p.common.cancel} tone="muted" onPress={() => setEditing(null)} />
          </View>
        </View>
      ) : null}
      {(rows ?? []).map((r, i) => (
        <View key={r.id} style={[st.tplRow, i > 0 && st.rowBorder]}>
          <Feather name="layers" size={15} color={colors.primary} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={ps.bodyStrong}>{r.name}</Text>
            <Text style={ps.small} numberOfLines={1}>
              {t.kinds[r.kind]} · {r.steps.length} · {r.steps.slice(0, 3).join(', ')}
              {r.steps.length > 3 ? '…' : ''}
            </Text>
          </View>
          <LinkButton label={p.common.edit} tone="muted" onPress={() => setEditing({ id: r.id, name: r.name, kind: r.kind, steps: r.steps.join('\n') })} />
          <LinkButton label={t.archiveTemplate} tone="muted" onPress={() => pro.archiveTemplate(r.id).then(load)} />
        </View>
      ))}
    </Panel>
  );
}

// ---------------------------------------------------------------------------
// Time and fees.

type TimePeriod = 'week' | 'month' | 'lastMonth' | 'year';

function timeRange(period: TimePeriod): { from: string; to: string } {
  const d = new Date();
  const iso = (x: Date) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
  if (period === 'week') {
    const day = (d.getDay() + 6) % 7;
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate() - day);
    return { from: iso(start), to: iso(new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6)) };
  }
  if (period === 'month') return { from: iso(new Date(d.getFullYear(), d.getMonth(), 1)), to: iso(new Date(d.getFullYear(), d.getMonth() + 1, 0)) };
  if (period === 'lastMonth') return { from: iso(new Date(d.getFullYear(), d.getMonth() - 1, 1)), to: iso(new Date(d.getFullYear(), d.getMonth(), 0)) };
  return { from: `${d.getFullYear()}-01-01`, to: `${d.getFullYear()}-12-31` };
}

const amountOf = (e: TimeEntry) => (e.billable && e.rate_chf != null ? Math.round((e.minutes / 60) * Number(e.rate_chf) * 100) / 100 : 0);

export function TimeSection({ me, client, embedded = false }: { me: Me; client?: ClientRef; embedded?: boolean }) {
  const p = useProCopy();
  const t = p.time;
  const { locale } = useAccCopy();
  const isAdmin = me.role === 'OWNER' || me.role === 'ADMIN';
  const [period, setPeriod] = useState<TimePeriod>('month');
  const [rows, setRows] = useState<TimeEntry[] | null>(null);
  const [group, setGroup] = useState<'client' | 'person'>('client');
  const [composing, setComposing] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const range = useMemo(() => timeRange(period), [period]);

  const load = useCallback(async () => {
    const { data, error } = await pro.timeEntries({ ...range, ...(client ?? {}) });
    if (error) setMessage({ text: error, error: true });
    setRows(data ?? []);
  }, [range.from, range.to, client?.org, client?.ext]);
  useEffect(() => {
    load();
  }, [load]);

  const totals = useMemo(() => {
    const all = rows ?? [];
    const open = all.filter((e) => e.status === 'open' && e.billable);
    return {
      minutes: all.reduce((s, e) => s + e.minutes, 0),
      openMinutes: open.reduce((s, e) => s + e.minutes, 0),
      openAmount: open.reduce((s, e) => s + amountOf(e), 0),
      billedAmount: all.filter((e) => e.status === 'billed').reduce((s, e) => s + amountOf(e), 0),
    };
  }, [rows]);

  const groups = useMemo(() => {
    const map = new Map<string, { label: string; minutes: number; open: number; amount: number; ids: string[] }>();
    for (const e of rows ?? []) {
      const key = group === 'client' ? e.client_name : e.user_name ?? '—';
      const g = map.get(key) ?? { label: key, minutes: 0, open: 0, amount: 0, ids: [] };
      g.minutes += e.minutes;
      if (e.status === 'open' && e.billable) {
        g.open += amountOf(e);
        g.ids.push(e.id);
      }
      g.amount += amountOf(e);
      map.set(key, g);
    }
    return [...map.values()].sort((a, b) => b.minutes - a.minutes);
  }, [rows, group]);

  async function markBilled(idList: string[]) {
    if (!idList.length) return;
    const { data, error } = await pro.timeAction(idList, 'billed');
    setMessage(error ? { text: error, error: true } : { text: fill(t.markedBilled, { count: data ?? 0 }), error: false });
    load();
  }

  async function exportCsv() {
    const esc = (v: string) => (/[;"\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
    const lines = [
      [t.date, p.common.client, p.time.description, t.duration, 'Minutes', t.billable, 'CHF/h', t.amount, 'Statut', 'Collaborateur'].join(';'),
      ...(rows ?? []).map((e) =>
        [isoToSwiss(e.entry_date), esc(e.client_name), esc(e.description ?? ''), formatMinutes(e.minutes), e.minutes, e.billable ? '1' : '0', e.rate_chf ?? '', amountOf(e).toFixed(2), e.status, esc(e.user_name ?? '')].join(';'),
      ),
    ];
    await downloadTextFile(`temps-${range.from}_${range.to}.csv`, '﻿' + lines.join('\r\n'));
  }

  const head = (
    <View style={ps.actions}>
      <Button title={t.new} icon="clock" onPress={() => setComposing((v) => !v)} />
      <LinkButton label={t.export} icon="download" onPress={exportCsv} disabled={!rows?.length} />
    </View>
  );

  return (
    <View style={st.stack}>
      {embedded ? head : <SectionHeader eyebrow={me.firm.name} title={t.title} text={t.text} right={head} />}
      {composing ? (
        <NewTimeForm
          fixed={client}
          onCancel={() => setComposing(false)}
          onAdded={() => {
            setMessage({ text: t.added, error: false });
            load();
          }}
        />
      ) : null}
      <Segmented value={period} onChange={setPeriod} options={(['week', 'month', 'lastMonth', 'year'] as TimePeriod[]).map((k) => ({ key: k, label: t.periods[k] }))} />
      <View style={st.stats}>
        <Stat label={t.total} value={`${formatMinutes(totals.minutes)} h`} />
        <Stat label={t.toBill} value={formatChf(totals.openAmount)} hint={`${formatMinutes(totals.openMinutes)} h`} tone={totals.openAmount > 0 ? 'warning' : undefined} />
        <Stat label={t.billed} value={formatChf(totals.billedAmount)} />
      </View>
      <Message value={message} />
      {rows === null ? <Text style={ps.muted}>{p.common.loading}</Text> : rows.length === 0 ? <Text style={ps.muted}>{t.empty}</Text> : null}
      {rows && rows.length && !client ? (
        <Panel
          right={
            <Segmented
              value={group}
              onChange={setGroup}
              options={[
                { key: 'client', label: t.byClient },
                { key: 'person', label: t.byPerson },
              ]}
            />
          }
        >
          {groups.map((g, i) => (
            <View key={g.label} style={[st.groupRow, i > 0 && st.rowBorder]}>
              <Text style={[ps.bodyStrong, { flex: 1 }]} numberOfLines={1}>
                {g.label}
              </Text>
              <Text style={[ps.mono, { width: 64, textAlign: 'right' }]}>{formatMinutes(g.minutes)}</Text>
              <Text style={[ps.mono, { width: 110, textAlign: 'right' }]}>{g.open ? formatChf(g.open) : '—'}</Text>
              {isAdmin && group === 'client' ? (
                <View style={{ width: 130, alignItems: 'flex-end' }}>{g.ids.length ? <LinkButton label={t.markBilled} icon="check" onPress={() => markBilled(g.ids)} /> : null}</View>
              ) : null}
            </View>
          ))}
        </Panel>
      ) : null}
      {rows?.length ? (
        <View style={st.table}>
          {rows.map((e, i) => (
            <TimeRow key={e.id} entry={e} first={i === 0} isAdmin={isAdmin} locale={locale} showClient={!client} onChanged={load} onError={(x) => setMessage({ text: x, error: true })} />
          ))}
        </View>
      ) : null}
      {client?.org && isAdmin ? <ClientRate org={client.org} /> : null}
    </View>
  );
}

function TimeRow({ entry: e, first, isAdmin, locale, showClient, onChanged, onError }: { entry: TimeEntry; first: boolean; isAdmin: boolean; locale: string; showClient: boolean; onChanged: () => void; onError: (e: string) => void }) {
  const p = useProCopy();
  const t = p.time;
  const editable = e.status === 'open' && (e.mine || isAdmin);
  async function act(action: 'void' | 'billed' | 'reopen') {
    const { error } = await pro.timeAction([e.id], action);
    if (error) onError(error);
    onChanged();
  }
  return (
    <View style={[st.timeRow, !first && st.rowBorder]}>
      <Text style={[ps.small, { width: 84 }]}>{formatDate(e.entry_date, locale)}</Text>
      <View style={{ flex: 1, minWidth: 160 }}>
        <Text style={ps.body} numberOfLines={1}>
          {showClient ? <Text style={{ fontWeight: '700' }}>{e.client_name} · </Text> : null}
          {e.description ?? '—'}
        </Text>
        <Text style={ps.small} numberOfLines={1}>
          {[e.user_name, e.work_title, e.billable ? (e.rate_chf != null ? `${e.rate_chf} CHF/h` : t.rateMissing) : t.notBillable].filter(Boolean).join(' · ')}
        </Text>
      </View>
      <Text style={[ps.mono, { width: 56, textAlign: 'right' }]}>{formatMinutes(e.minutes)}</Text>
      <Text style={[ps.mono, { width: 96, textAlign: 'right' }]}>{e.billable ? formatChf(amountOf(e)) : '—'}</Text>
      <View style={{ width: 120, alignItems: 'flex-end' }}>
        {e.status === 'billed' ? (
          isAdmin ? <LinkButton label={t.reopen} tone="muted" onPress={() => act('reopen')} /> : <Pill label={t.billed} tone="success" />
        ) : editable ? (
          <LinkButton label={t.void} tone="muted" onPress={() => act('void')} />
        ) : null}
      </View>
    </View>
  );
}

function NewTimeForm({ fixed, onCancel, onAdded }: { fixed?: ClientRef; onCancel: () => void; onAdded: () => void }) {
  const p = useProCopy();
  const t = p.time;
  const options = useClientOptions();
  const [clientKey, setClientKey] = useState<string | null>(null);
  const [date, setDate] = useState(isoToSwiss(todayIso()));
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');
  const [billable, setBillable] = useState(true);
  const [works, setWorks] = useState<WorkItem[]>([]);
  const [workId, setWorkId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ref = fixed ?? (clientKey ? refFromKey(clientKey) : null);

  useEffect(() => {
    setWorkId(null);
    if (!ref) return setWorks([]);
    pro.workItems(ref, false).then(({ data }) => setWorks(data ?? []));
  }, [ref?.org, ref?.ext]);

  async function add() {
    if (!ref) return;
    const minutes = parseDuration(duration);
    const iso = parseSwissDate(date);
    if (!minutes || minutes > 1440) return setError(t.invalidDuration);
    if (!iso) return setError(p.common.invalidDate);
    setBusy(true);
    setError(null);
    const { error: e } = await pro.addTime(ref, { date: iso, minutes, description: description.trim(), billable, workItem: workId });
    setBusy(false);
    if (e) return setError(e);
    setDuration('');
    setDescription('');
    onAdded();
  }

  return (
    <Panel title={t.new} tone="accent">
      {!fixed ? <ClientPicker value={clientKey} onChange={setClientKey} options={options} /> : null}
      <View style={ps.row}>
        <Input label={t.date} value={date} onChangeText={setDate} placeholder={p.common.datePlaceholder} style={{ width: 140 }} />
        <Input label={t.duration} value={duration} onChangeText={setDuration} placeholder={t.durationPlaceholder} style={{ width: 140 }} onSubmitEditing={add} />
        <Input label={t.description} value={description} onChangeText={setDescription} placeholder={t.descriptionPlaceholder} maxLength={500} style={{ flexGrow: 1, flexBasis: 240 }} onSubmitEditing={add} />
      </View>
      {works.length ? <Picks label={t.work} value={workId ?? '__none'} onChange={(v) => setWorkId(v === '__none' ? null : v)} options={[{ key: '__none', label: '—' }, ...works.map((w) => ({ key: w.id, label: w.title }))]} /> : null}
      <Toggle value={billable} onChange={setBillable} label={t.billable} />
      {error ? <Text style={ps.error}>{error}</Text> : null}
      <View style={ps.actions}>
        <Button title={p.common.add} icon="plus" onPress={add} loading={busy} disabled={!ref || !duration.trim()} />
        <LinkButton label={p.common.cancel} tone="muted" onPress={onCancel} />
      </View>
    </Panel>
  );
}

function ClientRate({ org }: { org: string }) {
  const p = useProCopy();
  const t = p.time;
  const [value, setValue] = useState('');
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  return (
    <Panel title={t.clientRate}>
      <View style={ps.row}>
        <Input label={t.clientRate} hint={t.clientRateHint} value={value} onChangeText={setValue} keyboardType="decimal-pad" style={{ width: 220 }} />
        <Button
          title={p.common.save}
          onPress={async () => {
            const n = value.trim() ? Number(value.replace(',', '.')) : null;
            if (n !== null && !(n >= 0 && n <= 2000)) return;
            const { error } = await pro.setClientRate(org, n);
            setMessage(error ? { text: error, error: true } : { text: p.common.saved, error: false });
          }}
        />
      </View>
      <Message value={message} />
    </Panel>
  );
}

const st = StyleSheet.create({
  stack: { gap: spacing.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, alignItems: 'flex-start' },
  workCard: { flexGrow: 1, flexBasis: 340, maxWidth: '100%', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm },
  workHead: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  client: { fontSize: 12, fontWeight: '800', color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.4 },
  progressTrack: { height: 6, borderRadius: 3, backgroundColor: colors.surfaceAlt, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6, paddingHorizontal: 4, borderRadius: radius.sm },
  stepDone: { color: colors.textMuted, textDecorationLine: 'line-through' },
  state: { paddingVertical: 4, paddingHorizontal: 9, borderRadius: 999, borderWidth: 1, borderColor: colors.border },
  stateOn: { backgroundColor: colors.text, borderColor: colors.text },
  stateText: { fontSize: 11.5, fontWeight: '700', color: colors.textMuted },
  stateTextOn: { color: colors.surface },
  tplRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 10 },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  groupRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 10, flexWrap: 'wrap' },
  table: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, paddingHorizontal: spacing.md },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 10, flexWrap: 'wrap' },
});

export { WORK_STATUSES };
