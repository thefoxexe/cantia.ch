import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Button } from '../ui';
import { SectionHeader } from './Shell';
import { useAccCopy } from '../../lib/accounting/locale';
import { fill } from '../../lib/accounting/copy';
import { useWorkCopy, parseDayMonth, parseSwissDate, formatDayMonth } from '../../lib/accounting/workCopy';
import { acc, formatChf, formatDate, signedDocumentUrl, type Dashboard, type Mandant, type Me, type Team } from '../../lib/accounting/api';
import {
  LEGAL_FORMS,
  VAT_METHODS,
  computeDeadlines,
  daysUntil,
  formatBytes,
  work,
  type ClientInsights,
  type ClientNote,
  type ClientProfile,
  type Deadline,
  type DeadlineClient,
  type DeadlineState,
  type FiduciaryRequest,
} from '../../lib/accounting/workspace';
import { Linking, Platform } from 'react-native';
import { displayType, monoType } from '../../lib/marketingTheme';
import { colors, fontSize, radius, spacing } from '../../lib/theme';

// ---------------------------------------------------------------------------
// Small building blocks shared by the workspace screens.

export function Panel({ title, right, children, tone }: { title?: string; right?: ReactNode; children: ReactNode; tone?: 'accent' }) {
  return (
    <View style={[s.panel, tone === 'accent' && s.panelAccent]}>
      {title || right ? (
        <View style={s.panelHead}>
          {title ? <Text style={s.panelTitle}>{title}</Text> : <View />}
          {right}
        </View>
      ) : null}
      {children}
    </View>
  );
}

export function Stat({ label, value, tone, onPress, hint }: { label: string; value: string; tone?: 'danger' | 'warning' | 'success'; onPress?: () => void; hint?: string }) {
  const color = tone === 'danger' ? colors.danger : tone === 'warning' ? colors.warning : tone === 'success' ? colors.success : colors.text;
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={({ hovered }: any) => [s.stat, hovered && onPress && s.statHover]}>
      <Text style={s.statLabel}>{label}</Text>
      <Text style={[s.statValue, { color }]}>{value}</Text>
      {hint ? <Text style={s.statHint}>{hint}</Text> : null}
    </Pressable>
  );
}

export function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { key: T; label: string; count?: number }[]; onChange: (v: T) => void }) {
  return (
    <View style={s.segmented}>
      {options.map((o) => {
        const on = o.key === value;
        return (
          <Pressable key={o.key} onPress={() => onChange(o.key)} style={[s.segment, on && s.segmentOn]} accessibilityRole="button" aria-pressed={on}>
            <Text style={[s.segmentText, on && s.segmentTextOn]}>{o.label}</Text>
            {o.count ? <Text style={[s.segmentCount, on && s.segmentTextOn]}>{o.count}</Text> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

function Tag({ label, tone }: { label: string; tone: 'neutral' | 'primary' | 'success' | 'warning' | 'danger' }) {
  const map = {
    neutral: { bg: colors.surfaceAlt, fg: colors.textMuted },
    primary: { bg: colors.primarySoft, fg: colors.primaryDark },
    success: { bg: colors.successSoft, fg: colors.success },
    warning: { bg: colors.warningSoft, fg: colors.warning },
    danger: { bg: colors.dangerSoft, fg: colors.danger },
  }[tone];
  return (
    <View style={[s.tag, { backgroundColor: map.bg }]}>
      <Text style={[s.tagText, { color: map.fg }]}>{label}</Text>
    </View>
  );
}

async function openFile(path: string) {
  const url = await signedDocumentUrl(path);
  if (!url) return;
  if (Platform.OS === 'web' && typeof window !== 'undefined') window.open(url, '_blank', 'noopener');
  else Linking.openURL(url);
}

function useDeadlineLabels() {
  const w = useWorkCopy();
  return useMemo(() => ({ quarter: w.deadlines.quarter, semester: w.deadlines.semester, month: (m: number) => w.deadlines.months[m] }), [w]);
}

function dueText(w: ReturnType<typeof useWorkCopy>, isoDate: string): { text: string; late: boolean; soon: boolean } {
  const d = daysUntil(isoDate);
  if (d < 0) return { text: fill(w.deadlines.lateBy, { days: -d }), late: true, soon: false };
  if (d === 0) return { text: w.deadlines.dueToday, late: false, soon: true };
  return { text: fill(w.deadlines.dueIn, { days: d }), late: false, soon: d <= 14 };
}

// ---------------------------------------------------------------------------
// Overview: what needs the firm's attention across every client.

export function OverviewSection({
  me,
  mandants,
  dashboard,
  onGo,
  onRespond,
}: {
  me: Me;
  mandants: Mandant[] | null;
  dashboard: Dashboard | null;
  onGo: (section: 'clients' | 'requests' | 'deadlines') => void;
  onRespond: (accessId: string, accept: boolean) => void;
}) {
  const { copy, locale } = useAccCopy();
  const w = useWorkCopy();
  const router = useRouter();
  const labels = useDeadlineLabels();
  const [requests, setRequests] = useState<FiduciaryRequest[] | null>(null);
  const [deadlineClients, setDeadlineClients] = useState<DeadlineClient[] | null>(null);
  const isAdmin = me.role === 'OWNER' || me.role === 'ADMIN';

  useEffect(() => {
    work.requests().then(({ data }) => setRequests(data ?? []));
    work.deadlineData().then(({ data }) => setDeadlineClients(data ?? []));
  }, []);

  const deadlines = useMemo(() => (deadlineClients ? computeDeadlines(deadlineClients, labels, new Date(), 60) : []), [deadlineClients, labels]);
  const openDeadlines = deadlines.filter((d) => d.status !== 'done');
  const in30 = openDeadlines.filter((d) => daysUntil(d.due) <= 30);
  const answered = (requests ?? []).filter((r) => r.status === 'answered');
  const openRequests = (requests ?? []).filter((r) => r.status === 'open');
  const lateRequests = openRequests.filter((r) => r.due_date && daysUntil(r.due_date) < 0);
  const pendingFirm = (mandants ?? []).filter((m) => m.status === 'PENDING_FIRM');
  const overdueClients = (mandants ?? []).filter((m) => m.status === 'ACTIVE' && (m.factures_overdue ?? 0) > 0);

  type Item = { key: string; icon: keyof typeof Feather.glyphMap; tone: 'danger' | 'warning' | 'primary' | 'success'; text: string; action?: ReactNode; onPress?: () => void };
  const items: Item[] = [
    ...pendingFirm.map((m) => ({
      key: `a-${m.access_id}`,
      icon: 'user-plus' as const,
      tone: 'primary' as const,
      text: fill(w.overview.accessRequest, { client: m.name }),
      action: isAdmin ? (
        <View style={s.rowActions}>
          <Pressable onPress={() => onRespond(m.access_id, true)}>
            <Text style={s.link}>{copy.dashboard.accept}</Text>
          </Pressable>
          <Pressable onPress={() => onRespond(m.access_id, false)}>
            <Text style={s.linkMuted}>{copy.dashboard.decline}</Text>
          </Pressable>
        </View>
      ) : undefined,
    })),
    ...answered.map((r) => ({
      key: `r-${r.id}`,
      icon: 'corner-down-left' as const,
      tone: 'success' as const,
      text: fill(w.overview.answered, { client: r.organization_name, title: r.title }),
      onPress: () => router.push(`/mandant?id=${r.organization_id}&tab=requests` as any),
    })),
    ...openDeadlines
      .filter((d) => daysUntil(d.due) < 0)
      .map((d) => ({
        key: `d-${d.key}`,
        icon: 'alert-triangle' as const,
        tone: 'danger' as const,
        text: fill(w.overview.deadlineLate, { kind: w.deadlines.kindsShort[d.kind], period: d.period_label, client: d.client }),
        onPress: () => onGo('deadlines'),
      })),
    ...lateRequests.map((r) => ({
      key: `l-${r.id}`,
      icon: 'clock' as const,
      tone: 'warning' as const,
      text: fill(w.overview.overdueRequest, { client: r.organization_name, title: r.title }),
      onPress: () => router.push(`/mandant?id=${r.organization_id}&tab=requests` as any),
    })),
    ...openDeadlines
      .filter((d) => daysUntil(d.due) >= 0 && daysUntil(d.due) <= 14)
      .map((d) => ({
        key: `s-${d.key}`,
        icon: 'calendar' as const,
        tone: 'warning' as const,
        text: fill(w.overview.deadlineSoon, { kind: w.deadlines.kindsShort[d.kind], period: d.period_label, client: d.client, days: daysUntil(d.due) }),
        onPress: () => onGo('deadlines'),
      })),
    ...overdueClients.map((m) => ({
      key: `o-${m.access_id}`,
      icon: 'alert-circle' as const,
      tone: 'danger' as const,
      text: fill(w.overview.overdueInvoices, { client: m.name, count: m.factures_overdue ?? 0, amount: formatChf(m.factures_open_chf ?? 0) }),
      onPress: () => router.push(`/mandant?id=${m.organization_id}` as any),
    })),
  ];

  const toneColor = { danger: colors.danger, warning: colors.warning, primary: colors.primary, success: colors.success };

  return (
    <View style={s.stack}>
      <SectionHeader eyebrow={me.firm.name} title={fill(w.overview.hello, { name: me.first_name ?? '' }).trim()} />

      <View style={s.stats}>
        <Stat label={w.overview.kpiClients} value={String(dashboard?.active_clients ?? '—')} onPress={() => onGo('clients')} />
        <Stat label={w.overview.kpiAnswered} value={String(answered.length)} tone={answered.length ? 'success' : undefined} onPress={() => onGo('requests')} />
        <Stat label={w.overview.kpiRequests} value={String(openRequests.length)} onPress={() => onGo('requests')} />
        <Stat label={w.overview.kpiDeadlines} value={String(in30.length)} tone={in30.some((d) => daysUntil(d.due) < 0) ? 'danger' : in30.length ? 'warning' : undefined} onPress={() => onGo('deadlines')} />
        <Stat label={w.overview.kpiOverdue} value={dashboard ? formatChf(dashboard.open_chf) : '—'} />
      </View>

      <View style={s.columns}>
        <View style={s.colMain}>
          <Panel title={w.overview.todayTitle}>
            {requests === null || deadlineClients === null ? (
              <Text style={s.muted}>{copy.common.loading}</Text>
            ) : items.length === 0 ? (
              <View style={s.emptyRow}>
                <Feather name="check-circle" size={18} color={colors.success} />
                <Text style={s.muted}>{w.overview.todayEmpty}</Text>
              </View>
            ) : (
              items.slice(0, 14).map((it, i) => (
                <Pressable key={it.key} onPress={it.onPress} disabled={!it.onPress} style={({ hovered }: any) => [s.todo, i > 0 && s.rowBorder, hovered && it.onPress && s.rowHover]}>
                  <View style={[s.todoIcon, { backgroundColor: `${toneColor[it.tone]}14` }]}>
                    <Feather name={it.icon} size={14} color={toneColor[it.tone]} />
                  </View>
                  <Text style={s.todoText}>{it.text}</Text>
                  {it.action ?? (it.onPress ? <Feather name="chevron-right" size={16} color={colors.textMuted} /> : null)}
                </Pressable>
              ))
            )}
          </Panel>
        </View>
        <View style={s.colSide}>
          <Panel
            title={w.overview.upcoming}
            right={
              <Pressable onPress={() => onGo('deadlines')}>
                <Text style={s.link}>{w.overview.seeAll}</Text>
              </Pressable>
            }
          >
            {openDeadlines.length === 0 ? <Text style={s.muted}>{w.overview.upcomingEmpty}</Text> : null}
            {openDeadlines.slice(0, 7).map((d, i) => {
              const due = dueText(w, d.due);
              return (
                <View key={d.key} style={[s.miniRow, i > 0 && s.rowBorder]}>
                  <View style={s.dateBox}>
                    <Text style={s.dateDay}>{d.due.slice(8, 10)}</Text>
                    <Text style={s.dateMonth}>{w.deadlines.monthsShort[Number(d.due.slice(5, 7)) - 1]}</Text>
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={s.body} numberOfLines={1}>
                      {w.deadlines.kindsShort[d.kind]} {d.period_label}
                    </Text>
                    <Text style={s.small} numberOfLines={1}>
                      {d.client}
                    </Text>
                  </View>
                  <Text style={[s.small, due.late && { color: colors.danger, fontWeight: '700' }, due.soon && { color: colors.warning, fontWeight: '700' }]}>{due.text}</Text>
                </View>
              );
            })}
          </Panel>
          {dashboard && dashboard.recent_documents.length ? (
            <Panel title={copy.dashboard.recentDocs}>
              {dashboard.recent_documents.slice(0, 5).map((doc, i) => (
                <Pressable key={doc.id} onPress={() => openFile(doc.file_path)} style={({ hovered }: any) => [s.miniRow, i > 0 && s.rowBorder, hovered && s.rowHover]}>
                  <Feather name="paperclip" size={14} color={colors.textMuted} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={s.body} numberOfLines={1}>
                      {doc.file_name}
                    </Text>
                    <Text style={s.small} numberOfLines={1}>
                      {doc.organization_name} · {formatDate(doc.created_at, locale)}
                    </Text>
                  </View>
                  <Feather name="download" size={14} color={colors.primary} />
                </Pressable>
              ))}
            </Panel>
          ) : null}
        </View>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Document requests (firm side). `orgId` narrows to one client (client file).

type RequestFilter = 'active' | 'answered' | 'done' | 'all';

export function RequestsSection({ mandants, orgId, embedded = false }: { mandants: Mandant[]; orgId?: string; embedded?: boolean }) {
  const { copy } = useAccCopy();
  const w = useWorkCopy();
  const t = w.requests;
  const [rows, setRows] = useState<FiduciaryRequest[] | null>(null);
  const [filter, setFilter] = useState<RequestFilter>('active');
  const [composing, setComposing] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  const load = useCallback(async () => {
    const { data } = await work.requests(orgId ?? null);
    setRows(data ?? []);
  }, [orgId]);
  useEffect(() => {
    load();
  }, [load]);

  const active = mandants.filter((m) => m.status === 'ACTIVE');
  const counts = {
    active: (rows ?? []).filter((r) => r.status === 'open' || r.status === 'answered').length,
    answered: (rows ?? []).filter((r) => r.status === 'answered').length,
    done: (rows ?? []).filter((r) => r.status === 'done').length,
    all: (rows ?? []).filter((r) => r.status !== 'cancelled').length,
  };
  const list = (rows ?? []).filter((r) =>
    filter === 'active' ? r.status === 'open' || r.status === 'answered' : filter === 'answered' ? r.status === 'answered' : filter === 'done' ? r.status === 'done' : r.status !== 'cancelled',
  );

  async function act(id: string, action: 'done' | 'cancelled' | 'open' | 'remind') {
    setMessage(null);
    const { error } = await work.updateRequest(id, action);
    setMessage(error ? { text: error, error: true } : action === 'remind' ? { text: t.reminded, error: false } : null);
    load();
  }

  const newButton = <Button title={t.new} icon="plus" onPress={() => setComposing((v) => !v)} />;

  return (
    <View style={s.stack}>
      {embedded ? (
        <View style={s.toolbar}>
          <Segmented value={filter} onChange={setFilter} options={(['active', 'answered', 'done', 'all'] as RequestFilter[]).map((k) => ({ key: k, label: t.filters[k], count: counts[k] }))} />
          {newButton}
        </View>
      ) : (
        <>
          <SectionHeader title={t.title} text={t.text} right={newButton} />
          <Segmented value={filter} onChange={setFilter} options={(['active', 'answered', 'done', 'all'] as RequestFilter[]).map((k) => ({ key: k, label: t.filters[k], count: counts[k] }))} />
        </>
      )}

      {composing ? (
        <NewRequestForm
          clients={active}
          fixedOrg={orgId}
          onCancel={() => setComposing(false)}
          onSent={() => {
            setComposing(false);
            setMessage({ text: t.sent, error: false });
            load();
          }}
        />
      ) : null}

      {message ? <Text style={message.error ? s.error : s.success}>{message.text}</Text> : null}

      {rows === null ? (
        <Text style={s.muted}>{copy.common.loading}</Text>
      ) : rows.length === 0 ? (
        <Panel>
          <View style={s.emptyBlock}>
            <Feather name="inbox" size={22} color={colors.border} />
            <Text style={s.muted}>{t.empty}</Text>
          </View>
        </Panel>
      ) : list.length === 0 ? (
        <Text style={s.muted}>{t.emptyFilter}</Text>
      ) : (
        list.map((r) => <RequestCard key={r.id} request={r} showClient={!orgId} onAction={act} />)
      )}
    </View>
  );
}

function RequestCard({ request: r, showClient, onAction }: { request: FiduciaryRequest; showClient: boolean; onAction: (id: string, a: 'done' | 'cancelled' | 'open' | 'remind') => void }) {
  const { locale } = useAccCopy();
  const w = useWorkCopy();
  const t = w.requests;
  const router = useRouter();
  const late = r.status === 'open' && !!r.due_date && daysUntil(r.due_date) < 0;
  const tone = r.status === 'answered' ? 'success' : r.status === 'done' ? 'neutral' : late ? 'danger' : 'warning';
  return (
    <View style={[s.panel, r.status === 'answered' && s.panelSuccess]}>
      <View style={s.reqHead}>
        <View style={{ flex: 1, minWidth: 220, gap: 4 }}>
          {showClient ? (
            <Pressable onPress={() => router.push(`/mandant?id=${r.organization_id}&tab=requests` as any)}>
              <Text style={s.reqClient}>{r.organization_name}</Text>
            </Pressable>
          ) : null}
          <Text style={s.reqTitle}>{r.title}</Text>
          <Text style={s.small}>
            {[fill(t.askedOn, { date: formatDate(r.created_at, locale) }), r.created_by_name ? fill(t.by, { name: r.created_by_name }) : null, r.due_date ? fill(t.dueOn, { date: formatDate(r.due_date, locale) }) : null]
              .filter(Boolean)
              .join(' · ')}
          </Text>
        </View>
        <Tag label={late ? t.late : t.status[r.status]} tone={tone} />
      </View>
      {r.details ? <Text style={s.body}>{r.details}</Text> : null}
      {r.status === 'answered' || r.status === 'done' || r.files.length ? (
        <View style={s.answer}>
          {r.answered_at ? <Text style={s.label}>{fill(t.answeredOn, { date: formatDate(r.answered_at, locale) })}</Text> : null}
          {r.client_message ? (
            <View style={s.quote}>
              <Text style={s.body}>{r.client_message}</Text>
            </View>
          ) : null}
          {r.files.length ? (
            <View style={{ gap: 6 }}>
              {r.files.map((f) => (
                <Pressable key={f.id} onPress={() => openFile(f.file_path)} style={({ hovered }: any) => [s.file, hovered && s.rowHover]}>
                  <Feather name="file" size={14} color={colors.primary} />
                  <Text style={[s.body, { flex: 1 }]} numberOfLines={1}>
                    {f.file_name}
                  </Text>
                  <Text style={s.small}>{formatBytes(f.size_bytes)}</Text>
                  <Feather name="download" size={14} color={colors.primary} />
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}
      <View style={s.rowActions}>
        {r.status === 'answered' ? <Button title={t.markDone} icon="check" onPress={() => onAction(r.id, 'done')} /> : null}
        {r.status === 'answered' || r.status === 'done' ? (
          <Pressable onPress={() => onAction(r.id, 'open')}>
            <Text style={s.linkMuted}>{t.reopen}</Text>
          </Pressable>
        ) : null}
        {r.status === 'open' ? (
          <Pressable onPress={() => onAction(r.id, 'remind')} style={s.inlineBtn}>
            <Feather name="bell" size={13} color={colors.primary} />
            <Text style={s.link}>{t.remind}</Text>
          </Pressable>
        ) : null}
        {r.status === 'open' ? (
          <Pressable onPress={() => onAction(r.id, 'cancelled')}>
            <Text style={s.linkMuted}>{t.cancel}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function NewRequestForm({ clients, fixedOrg, onCancel, onSent }: { clients: Mandant[]; fixedOrg?: string; onCancel: () => void; onSent: () => void }) {
  const w = useWorkCopy();
  const t = w.requests;
  const { copy } = useAccCopy();
  const [org, setOrg] = useState<string | null>(fixedOrg ?? (clients.length === 1 ? clients[0].organization_id : null));
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [due, setDue] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    const dueIso = parseSwissDate(due);
    if (dueIso === undefined) return setError(t.invalidDate);
    if (!org || title.trim().length < 2) return;
    setBusy(true);
    setError(null);
    const { error: err } = await work.createRequest(org, title.trim(), details.trim(), dueIso);
    setBusy(false);
    if (err) setError(err);
    else onSent();
  }

  return (
    <Panel title={t.new} tone="accent">
      {!fixedOrg ? (
        <View style={{ gap: 6 }}>
          <Text style={s.label}>{t.client}</Text>
          <View style={s.pickList}>
            {clients.map((c) => {
              const on = org === c.organization_id;
              return (
                <Pressable key={c.organization_id} onPress={() => setOrg(c.organization_id)} style={[s.pick, on && s.pickOn]}>
                  <Text style={[s.pickText, on && s.pickTextOn]}>{c.name}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}
      <View style={{ gap: 6 }}>
        <Text style={s.label}>{t.what}</Text>
        <TextInput value={title} onChangeText={setTitle} placeholder={t.whatPlaceholder} placeholderTextColor={colors.textMuted} style={s.input} maxLength={160} />
        <View style={s.pickList}>
          {t.templateItems.map((tpl) => (
            <Pressable key={tpl} onPress={() => setTitle(tpl)} style={s.suggest}>
              <Text style={s.suggestText}>{tpl}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <View style={{ gap: 6 }}>
        <Text style={s.label}>{t.details}</Text>
        <TextInput value={details} onChangeText={setDetails} placeholder={t.detailsPlaceholder} placeholderTextColor={colors.textMuted} style={[s.input, s.textarea]} multiline maxLength={2000} />
      </View>
      <View style={{ gap: 6, maxWidth: 240 }}>
        <Text style={s.label}>{t.due}</Text>
        <TextInput value={due} onChangeText={setDue} placeholder={t.duePlaceholder} placeholderTextColor={colors.textMuted} style={s.input} />
      </View>
      {error ? <Text style={s.error}>{error}</Text> : null}
      <View style={s.rowActions}>
        <Button title={t.send} icon="send" onPress={send} loading={busy} disabled={!org || title.trim().length < 2} />
        <Pressable onPress={onCancel}>
          <Text style={s.linkMuted}>{copy.clients.cancel}</Text>
        </Pressable>
      </View>
    </Panel>
  );
}

// ---------------------------------------------------------------------------
// Deadlines, across clients or for one client.

type DeadlineFilter = 'open' | 'late' | 'done' | 'all';

export function DeadlinesSection({ orgId, embedded = false }: { orgId?: string; embedded?: boolean }) {
  const { copy, locale } = useAccCopy();
  const w = useWorkCopy();
  const t = w.deadlines;
  const labels = useDeadlineLabels();
  const router = useRouter();
  const [clients, setClients] = useState<DeadlineClient[] | null>(null);
  const [filter, setFilter] = useState<DeadlineFilter>('open');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data } = await work.deadlineData();
    setClients((data ?? []).filter((c) => !orgId || c.organization_id === orgId));
  }, [orgId]);
  useEffect(() => {
    load();
  }, [load]);

  const all = useMemo(() => (clients ? computeDeadlines(clients, labels, new Date(), 400) : []), [clients, labels]);
  const counts = {
    open: all.filter((d) => d.status !== 'done').length,
    late: all.filter((d) => d.status !== 'done' && daysUntil(d.due) < 0).length,
    done: all.filter((d) => d.status === 'done').length,
    all: all.length,
  };
  const list = all.filter((d) => (filter === 'open' ? d.status !== 'done' : filter === 'late' ? d.status !== 'done' && daysUntil(d.due) < 0 : filter === 'done' ? d.status === 'done' : true));
  const unsaved = (clients ?? []).filter((c) => !c.profile.saved).length;

  async function setStatus(d: Deadline, status: DeadlineState) {
    setError(null);
    setClients((prev) =>
      prev
        ? prev.map((c) =>
            c.organization_id !== d.organization_id
              ? c
              : {
                  ...c,
                  statuses: [...c.statuses.filter((x) => !(x.kind === d.kind && x.period_key === d.period_key)), { kind: d.kind, period_key: d.period_key, status, note: null, updated_at: new Date().toISOString() }],
                },
          )
        : prev,
    );
    const { error: err } = await work.setDeadline(d.organization_id, d.kind, d.period_key, status);
    if (err) {
      setError(err);
      load();
    }
  }

  // Group by month of the due date.
  const groups = useMemo(() => {
    const map = new Map<string, Deadline[]>();
    for (const d of list) {
      const k = daysUntil(d.due) < 0 && d.status !== 'done' ? 'late' : d.due.slice(0, 7);
      map.set(k, [...(map.get(k) ?? []), d]);
    }
    return [...map.entries()].sort(([a], [b]) => (a === 'late' ? -1 : b === 'late' ? 1 : a.localeCompare(b)));
  }, [list]);

  const monthLabel = (key: string) => (key === 'late' ? t.groupLate : `${t.months[Number(key.slice(5, 7)) - 1]} ${key.slice(0, 4)}`);

  return (
    <View style={s.stack}>
      {embedded ? null : <SectionHeader title={t.title} text={t.text} />}
      <Segmented value={filter} onChange={setFilter} options={(['open', 'late', 'done', 'all'] as DeadlineFilter[]).map((k) => ({ key: k, label: t.filters[k], count: counts[k] }))} />
      {unsaved && !embedded ? (
        <View style={s.hint}>
          <Feather name="info" size={14} color={colors.slate} />
          <Text style={[s.small, { flex: 1, color: colors.slate }]}>{t.profileHint}</Text>
        </View>
      ) : null}
      {error ? <Text style={s.error}>{error}</Text> : null}
      {clients === null ? <Text style={s.muted}>{copy.common.loading}</Text> : list.length === 0 ? <Text style={s.muted}>{t.empty}</Text> : null}
      {groups.map(([key, items]) => (
        <View key={key} style={{ gap: spacing.sm }}>
          <Text style={[s.groupTitle, key === 'late' && { color: colors.danger }]}>{monthLabel(key)}</Text>
          <View style={s.table}>
            {items.map((d, i) => {
              const due = dueText(w, d.due);
              return (
                <View key={d.key} style={[s.dlRow, i > 0 && s.rowBorder]}>
                  <View style={s.dateBox}>
                    <Text style={s.dateDay}>{d.due.slice(8, 10)}</Text>
                    <Text style={s.dateMonth}>{t.monthsShort[Number(d.due.slice(5, 7)) - 1]}</Text>
                  </View>
                  <View style={{ flex: 1, minWidth: 180, gap: 2 }}>
                    <Text style={s.bodyStrong}>
                      {t.kinds[d.kind]} · {d.period_label}
                    </Text>
                    {!orgId ? (
                      <Pressable onPress={() => router.push(`/mandant?id=${d.organization_id}&tab=deadlines` as any)}>
                        <Text style={s.small}>{d.client}</Text>
                      </Pressable>
                    ) : (
                      <Text style={s.small}>{formatDate(d.due, locale)}</Text>
                    )}
                  </View>
                  <Text style={[s.small, s.dueCol, d.status !== 'done' && due.late && { color: colors.danger, fontWeight: '700' }, d.status !== 'done' && due.soon && { color: colors.warning, fontWeight: '700' }]}>
                    {d.status === 'done' ? formatDate(d.due, locale) : due.text}
                  </Text>
                  <View style={s.stateGroup}>
                    {(['todo', 'in_progress', 'done'] as DeadlineState[]).map((st) => {
                      const on = d.status === st;
                      return (
                        <Pressable key={st} onPress={() => !on && setStatus(d, st)} style={[s.state, on && (st === 'done' ? s.stateDone : st === 'in_progress' ? s.stateProgress : s.stateTodo)]} accessibilityRole="button" aria-pressed={on}>
                          {st === 'done' && on ? <Feather name="check" size={12} color={colors.success} /> : null}
                          <Text style={[s.stateText, on && s.stateTextOn]}>{t.status[st]}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Client file: profile, figures, notes.

export function ProfileForm({ orgId, onSaved }: { orgId: string; onSaved?: () => void }) {
  const w = useWorkCopy();
  const t = w.profile;
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [fye, setFye] = useState('31.12');
  const [taxDue, setTaxDue] = useState('31.03');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  useEffect(() => {
    work.profile(orgId).then(({ data }) => {
      if (!data) return;
      setProfile(data);
      setFye(formatDayMonth(data.fiscal_year_end));
      setTaxDue(formatDayMonth(data.tax_return_due));
    });
    acc.team().then(({ data }) => setTeam(data));
  }, [orgId]);

  if (!profile) return null;

  async function save() {
    const fyeValue = parseDayMonth(fye);
    const taxValue = parseDayMonth(taxDue);
    if (!fyeValue || !taxValue || !profile) return setMessage({ text: t.invalid, error: true });
    setBusy(true);
    const { error } = await work.saveProfile(orgId, { ...profile, fiscal_year_end: fyeValue, tax_return_due: taxValue });
    setBusy(false);
    setMessage(error ? { text: error, error: true } : { text: t.saved, error: false });
    if (!error) onSaved?.();
  }

  const set = (patch: Partial<ClientProfile>) => setProfile((p) => (p ? { ...p, ...patch } : p));

  return (
    <Panel title={t.title}>
      <Text style={s.small}>{t.text}</Text>
      <View style={{ gap: 6 }}>
        <Text style={s.label}>{t.vat}</Text>
        <View style={s.pickList}>
          {VAT_METHODS.map((m) => (
            <Pressable key={m} onPress={() => set({ vat_method: m })} style={[s.pick, profile.vat_method === m && s.pickOn]}>
              <Text style={[s.pickText, profile.vat_method === m && s.pickTextOn]}>{t.vatMethods[m]}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <View style={s.formRow}>
        <View style={{ gap: 6 }}>
          <Text style={s.label}>{t.legalForm}</Text>
          <View style={s.pickList}>
            {LEGAL_FORMS.map((f) => (
              <Pressable key={f} onPress={() => set({ legal_form: f })} style={[s.pick, profile.legal_form === f && s.pickOn]}>
                <Text style={[s.pickText, profile.legal_form === f && s.pickTextOn]}>{t.legalForms[f]}</Text>
              </Pressable>
            ))}
          </View>
        </View>
        <View style={{ gap: 6 }}>
          <Text style={s.label}>{t.payroll}</Text>
          <View style={s.pickList}>
            {[true, false].map((v) => (
              <Pressable key={String(v)} onPress={() => set({ has_payroll: v })} style={[s.pick, profile.has_payroll === v && s.pickOn]}>
                <Text style={[s.pickText, profile.has_payroll === v && s.pickTextOn]}>{v ? '✓' : '—'}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
      <View style={s.formRow}>
        <View style={{ gap: 6, width: 200 }}>
          <Text style={s.label}>{t.fiscalYearEnd}</Text>
          <TextInput value={fye} onChangeText={setFye} style={s.input} placeholder="31.12" placeholderTextColor={colors.textMuted} />
        </View>
        <View style={{ gap: 6, width: 260 }}>
          <Text style={s.label}>{t.taxReturnDue}</Text>
          <TextInput value={taxDue} onChangeText={setTaxDue} style={s.input} placeholder="31.03" placeholderTextColor={colors.textMuted} />
        </View>
      </View>
      {team && team.members.length > 1 ? (
        <View style={{ gap: 6 }}>
          <Text style={s.label}>{t.assigned}</Text>
          <View style={s.pickList}>
            <Pressable onPress={() => set({ assigned_to: null })} style={[s.pick, !profile.assigned_to && s.pickOn]}>
              <Text style={[s.pickText, !profile.assigned_to && s.pickTextOn]}>{t.nobody}</Text>
            </Pressable>
            {team.members.map((m) => (
              <Pressable key={m.user_id} onPress={() => set({ assigned_to: m.user_id })} style={[s.pick, profile.assigned_to === m.user_id && s.pickOn]}>
                <Text style={[s.pickText, profile.assigned_to === m.user_id && s.pickTextOn]}>{[m.first_name, m.last_name].filter(Boolean).join(' ') || m.email}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}
      {message ? <Text style={message.error ? s.error : s.success}>{message.text}</Text> : null}
      <View style={s.rowActions}>
        <Button title={t.save} onPress={save} loading={busy} />
      </View>
    </Panel>
  );
}

export function InsightsPanel({ orgId, onGo }: { orgId: string; onGo: (tab: 'requests' | 'invoices' | 'accounting') => void }) {
  const { copy, locale } = useAccCopy();
  const w = useWorkCopy();
  const t = w.client;
  const [data, setData] = useState<ClientInsights | null>(null);

  useEffect(() => {
    work.insights(orgId).then(({ data: d }) => setData(d));
  }, [orgId]);

  if (!data) return <Text style={s.muted}>{copy.common.loading}</Text>;

  const checks: { key: string; tone: 'danger' | 'warning' | 'success' | 'primary'; text: string; go?: 'requests' | 'invoices' | 'accounting' }[] = [];
  if (data.overdue_count) checks.push({ key: 'o', tone: 'danger', text: fill(t.checks.overdue, { count: data.overdue_count, amount: formatChf(data.overdue_amount ?? 0) }), go: 'invoices' });
  if (data.requests_answered) checks.push({ key: 'a', tone: 'success', text: fill(t.checks.answered, { count: data.requests_answered }), go: 'requests' });
  if (data.entries_without_receipt_90d) checks.push({ key: 'r', tone: 'warning', text: fill(t.checks.noReceipt, { count: data.entries_without_receipt_90d }), go: 'accounting' });
  if (data.entries_draft) checks.push({ key: 'd', tone: 'warning', text: fill(t.checks.drafts, { count: data.entries_draft }), go: 'accounting' });
  if (data.requests_open) checks.push({ key: 'q', tone: 'primary', text: fill(t.checks.openRequests, { count: data.requests_open }), go: 'requests' });
  if (data.last_entry_date && daysUntil(data.last_entry_date) < -45) checks.push({ key: 'e', tone: 'warning', text: fill(t.checks.noEntries, { date: formatDate(data.last_entry_date, locale) }), go: 'accounting' });
  const toneColor = { danger: colors.danger, warning: colors.warning, primary: colors.primary, success: colors.success };

  const monthly = data.monthly ?? [];
  const max = Math.max(1, ...monthly.map((m) => Number(m.amount)));

  return (
    <View style={s.stack}>
      <View style={s.stats}>
        {data.invoiced_ytd != null ? <Stat label={t.insights.invoiced} value={formatChf(data.invoiced_ytd)} /> : null}
        {data.collected_ytd != null ? <Stat label={t.insights.collected} value={formatChf(data.collected_ytd)} /> : null}
        {data.open_amount != null ? <Stat label={t.insights.open} value={formatChf(data.open_amount)} /> : null}
        {data.overdue_amount != null ? <Stat label={t.insights.overdue} value={formatChf(data.overdue_amount)} tone={data.overdue_amount > 0 ? 'danger' : undefined} /> : null}
        {data.expenses_ytd != null ? <Stat label={t.insights.expenses} value={formatChf(data.expenses_ytd)} /> : null}
      </View>
      <View style={s.columns}>
        <View style={s.colMain}>
          {monthly.length ? (
            <Panel title={t.insights.chart}>
              <View style={s.chart}>
                {monthly.map((m) => {
                  const h = Math.round((Number(m.amount) / max) * 120);
                  return (
                    <View key={m.month} style={s.barCol}>
                      <Text style={s.barValue}>{Number(m.amount) > 0 ? `${Math.round(Number(m.amount) / 1000)}k` : ''}</Text>
                      <View style={[s.bar, { height: Math.max(h, Number(m.amount) > 0 ? 3 : 1) }, Number(m.amount) === 0 && { backgroundColor: colors.border }]} />
                      <Text style={s.barLabel}>{w.deadlines.monthsShort[Number(m.month.slice(5, 7)) - 1]}</Text>
                    </View>
                  );
                })}
              </View>
            </Panel>
          ) : null}
        </View>
        <View style={s.colSide}>
          <Panel title={t.checks.title}>
            {checks.length === 0 ? (
              <View style={s.emptyRow}>
                <Feather name="check-circle" size={16} color={colors.success} />
                <Text style={s.muted}>{t.checks.none}</Text>
              </View>
            ) : (
              checks.map((c, i) => (
                <Pressable key={c.key} onPress={() => c.go && onGo(c.go)} style={({ hovered }: any) => [s.todo, i > 0 && s.rowBorder, hovered && s.rowHover]}>
                  <View style={[s.dot, { backgroundColor: toneColor[c.tone] }]} />
                  <Text style={s.todoText}>{c.text}</Text>
                  <Feather name="chevron-right" size={15} color={colors.textMuted} />
                </Pressable>
              ))
            )}
            {data.last_entry_date ? <Text style={s.small}>{`${t.insights.lastEntry} : ${formatDate(data.last_entry_date, locale)}`}</Text> : null}
          </Panel>
        </View>
      </View>
    </View>
  );
}

export function NotesPanel({ orgId }: { orgId: string }) {
  const { locale } = useAccCopy();
  const w = useWorkCopy();
  const t = w.client;
  const [notes, setNotes] = useState<ClientNote[] | null>(null);
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    work.notes(orgId).then(({ data }) => setNotes(data ?? []));
  }, [orgId]);
  useEffect(load, [load]);

  async function add() {
    if (!body.trim()) return;
    setBusy(true);
    await work.addNote(orgId, body.trim());
    setBusy(false);
    setBody('');
    load();
  }

  return (
    <Panel title={t.notes}>
      <Text style={s.small}>{t.notesText}</Text>
      <TextInput value={body} onChangeText={setBody} placeholder={t.notePlaceholder} placeholderTextColor={colors.textMuted} style={[s.input, s.textarea]} multiline maxLength={4000} />
      <View style={s.rowActions}>
        <Button title={t.addNote} onPress={add} loading={busy} disabled={!body.trim()} />
      </View>
      {notes && notes.length === 0 ? <Text style={s.muted}>{t.noNotes}</Text> : null}
      {(notes ?? []).map((n) => (
        <View key={n.id} style={s.note}>
          <View style={s.noteHead}>
            <Text style={s.small}>
              {[n.author_name, formatDate(n.created_at, locale)].filter(Boolean).join(' · ')}
            </Text>
            {n.mine ? (
              <Pressable onPress={() => work.deleteNote(n.id).then(load)}>
                <Text style={s.linkMuted}>{t.deleteNote}</Text>
              </Pressable>
            ) : null}
          </View>
          <Text style={s.body}>{n.body}</Text>
        </View>
      ))}
    </Panel>
  );
}

const s = StyleSheet.create({
  stack: { gap: spacing.lg },
  columns: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg, alignItems: 'flex-start' },
  colMain: { flexGrow: 3, flexBasis: 460, minWidth: 0, gap: spacing.lg },
  colSide: { flexGrow: 2, flexBasis: 300, minWidth: 0, gap: spacing.lg },
  panel: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md },
  panelAccent: { borderColor: colors.primary },
  panelSuccess: { borderLeftWidth: 3, borderLeftColor: colors.success },
  panelHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  panelTitle: { fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  stat: { flexGrow: 1, flexBasis: 170, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, paddingVertical: spacing.md, paddingHorizontal: spacing.lg, gap: 4 },
  statHover: { borderColor: colors.textMuted },
  statLabel: { ...monoType, fontSize: 10.5, letterSpacing: 0.4, textTransform: 'uppercase', color: colors.textMuted },
  statValue: { ...displayType, fontSize: 24, fontWeight: '800', fontVariant: ['tabular-nums'] },
  statHint: { fontSize: 12, color: colors.textMuted },
  segmented: { flexDirection: 'row', flexWrap: 'wrap', alignSelf: 'flex-start', backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: 3, gap: 2 },
  segment: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 12, borderRadius: radius.sm },
  segmentOn: { backgroundColor: colors.surface, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } },
  segmentText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.textMuted },
  segmentTextOn: { color: colors.text, fontWeight: '800' },
  segmentCount: { fontSize: 11, fontWeight: '700', color: colors.textMuted, ...monoType },
  tag: { alignSelf: 'flex-start', borderRadius: radius.sm, paddingVertical: 3, paddingHorizontal: 8 },
  tagText: { ...monoType, fontSize: 10, fontWeight: '700', letterSpacing: 0.3, textTransform: 'uppercase' },
  toolbar: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  todo: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 10 },
  todoIcon: { width: 28, height: 28, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  todoText: { flex: 1, fontSize: fontSize.sm, lineHeight: 19, color: colors.text },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  rowHover: { backgroundColor: colors.bg },
  rowActions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.md },
  emptyRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  emptyBlock: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl },
  miniRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 9 },
  dateBox: { width: 42, alignItems: 'center', paddingVertical: 4, borderRadius: radius.md, backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border },
  dateDay: { ...displayType, fontSize: 16, fontWeight: '800', color: colors.text, lineHeight: 18 },
  dateMonth: { ...monoType, fontSize: 9.5, textTransform: 'uppercase', color: colors.textMuted },
  reqHead: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md },
  reqClient: { ...monoType, fontSize: 11, letterSpacing: 0.4, textTransform: 'uppercase', color: colors.primary, fontWeight: '700' },
  reqTitle: { fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  answer: { gap: spacing.sm, backgroundColor: colors.bg, borderRadius: radius.md, padding: spacing.md },
  quote: { borderLeftWidth: 2, borderLeftColor: colors.success, paddingLeft: spacing.md },
  file: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 8, paddingHorizontal: spacing.sm, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  inlineBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  pickList: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pick: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingVertical: 7, paddingHorizontal: 12, backgroundColor: colors.surface },
  pickOn: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  pickText: { fontSize: fontSize.sm, color: colors.text, fontWeight: '600' },
  pickTextOn: { color: colors.primaryDark, fontWeight: '800' },
  suggest: { borderRadius: radius.sm, paddingVertical: 4, paddingHorizontal: 8, backgroundColor: colors.bg, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border },
  suggestText: { fontSize: 12, color: colors.textMuted },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingVertical: 10, paddingHorizontal: 12, fontSize: fontSize.sm, color: colors.text, backgroundColor: colors.surface },
  textarea: { minHeight: 80, textAlignVertical: 'top' },
  formRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg },
  hint: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.slateSoft, borderRadius: radius.md, padding: spacing.md },
  groupTitle: { ...monoType, fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase', color: colors.textMuted, fontWeight: '700' },
  table: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, overflow: 'hidden' },
  dlRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.md, paddingVertical: 12, paddingHorizontal: spacing.lg },
  dueCol: { width: 110, textAlign: 'right' },
  stateGroup: { flexDirection: 'row', borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, overflow: 'hidden' },
  state: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 6, paddingHorizontal: 10, backgroundColor: colors.surface },
  stateTodo: { backgroundColor: colors.surfaceAlt },
  stateProgress: { backgroundColor: colors.warningSoft },
  stateDone: { backgroundColor: colors.successSoft },
  stateText: { fontSize: 12, fontWeight: '600', color: colors.textMuted },
  stateTextOn: { color: colors.text, fontWeight: '800' },
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 170, paddingTop: spacing.sm },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  bar: { width: '70%', maxWidth: 28, backgroundColor: colors.primary, borderTopLeftRadius: 3, borderTopRightRadius: 3 },
  barValue: { ...monoType, fontSize: 9, color: colors.textMuted },
  barLabel: { ...monoType, fontSize: 9.5, color: colors.textMuted, textTransform: 'uppercase' },
  dot: { width: 8, height: 8, borderRadius: 4 },
  note: { gap: 4, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm },
  noteHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  label: { ...monoType, fontSize: 10.5, letterSpacing: 0.4, textTransform: 'uppercase', color: colors.textMuted, fontWeight: '700' },
  body: { fontSize: fontSize.sm, lineHeight: 20, color: colors.text },
  bodyStrong: { fontSize: fontSize.sm, lineHeight: 20, color: colors.text, fontWeight: '700' },
  small: { fontSize: 12, color: colors.textMuted },
  muted: { fontSize: fontSize.sm, lineHeight: 19, color: colors.textMuted },
  link: { fontSize: fontSize.sm, color: colors.primary, fontWeight: '700' },
  linkMuted: { fontSize: fontSize.sm, color: colors.textMuted, fontWeight: '600' },
  error: { fontSize: fontSize.sm, color: colors.danger },
  success: { fontSize: fontSize.sm, color: colors.success, fontWeight: '600' },
});
