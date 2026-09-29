import { useCallback, useEffect, useMemo, useState } from 'react';
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Button, Field } from '../ui';
import { PAGE_MAX, useIsWide } from './AccountingChrome';
import { useAccCopy } from '../../lib/accounting/locale';
import { fill, MANDATES, SOFTWARE } from '../../lib/accounting/copy';
import {
  acc,
  formatChf,
  formatDate,
  partnerSummary,
  signedDocumentUrl,
  type AuditRow,
  type Dashboard,
  type DocumentRow,
  type Firm,
  type Invitation,
  type Mandant,
  type Me,
  type Team,
} from '../../lib/accounting/api';
import { openPartnerSpace } from '../../lib/api/partners';
import { displayType, monoType } from '../../lib/marketingTheme';
import { colors, fontSize, radius, spacing } from '../../lib/theme';

export const TABS = ['dashboard', 'clients', 'documents', 'team', 'partner', 'settings'] as const;
export type Tab = (typeof TABS)[number];

// The fiduciary's cockpit (accounting.cantia.ch/espace). Every figure comes
// from database functions that only return what the firm is allowed to see.
export function Cockpit({ me, initialTab, onReload }: { me: Me; initialTab?: Tab; onReload: () => void }) {
  const { copy } = useAccCopy();
  const isAdmin = me.role === 'OWNER' || me.role === 'ADMIN';
  const tabs = TABS.filter((t) => t !== 'settings' || isAdmin);
  const [tab, setTab] = useState<Tab>(initialTab && tabs.includes(initialTab) ? initialTab : 'dashboard');
  const [mandants, setMandants] = useState<Mandant[] | null>(null);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const [m, d, i] = await Promise.all([acc.mandants(), acc.dashboard(), acc.invitations()]);
    setMandants(m.data ?? []);
    setDashboard(d.data);
    setInvitations((i.data ?? []).filter((x) => x.kind === 'NEW_CLIENT'));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function run(action: () => Promise<{ error: string | null }>, success?: string) {
    setBusy(true);
    setMessage(null);
    const { error } = await action();
    setBusy(false);
    if (error) setMessage({ text: error, error: true });
    else if (success) setMessage({ text: success, error: false });
    await load();
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <View style={{ flex: 1, minWidth: 220 }}>
          <Text style={styles.eyebrow}>{me.firm.name}</Text>
          <Text style={styles.h1} role="heading" aria-level={1}>
            {fill(copy.dashboard.hello, { name: me.first_name ?? '' }).trim()}
          </Text>
        </View>
        {me.firm.status !== 'ACTIVE' ? (
          <View style={styles.warnPill}>
            <Text style={styles.warnPillText}>{me.firm.status}</Text>
          </View>
        ) : null}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
        {tabs.map((t) => (
          <Pressable key={t} onPress={() => setTab(t)} style={[styles.tab, tab === t && styles.tabActive]} accessibilityRole="tab" aria-selected={tab === t}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {copy.tabs[t]}
              {t === 'clients' && dashboard?.pending_firm ? ` (${dashboard.pending_firm})` : ''}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {message ? <Text style={message.error ? styles.error : styles.success}>{message.text}</Text> : null}

      {tab === 'dashboard' ? (
        <DashboardTab me={me} dashboard={dashboard} mandants={mandants} busy={busy} run={run} onAdded={load} goClients={() => setTab('clients')} />
      ) : tab === 'clients' ? (
        <ClientsTab me={me} mandants={mandants} invitations={invitations} busy={busy} run={run} onAdded={load} />
      ) : tab === 'documents' ? (
        <DocumentsTab mandants={mandants ?? []} />
      ) : tab === 'team' ? (
        <TeamTab me={me} />
      ) : tab === 'partner' ? (
        <PartnerTab />
      ) : (
        <SettingsTab firm={me.firm} onSaved={onReload} />
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------

function DashboardTab({
  me,
  dashboard,
  mandants,
  busy,
  run,
  onAdded,
  goClients,
}: {
  me: Me;
  dashboard: Dashboard | null;
  mandants: Mandant[] | null;
  busy: boolean;
  run: (a: () => Promise<{ error: string | null }>, s?: string) => void;
  onAdded: () => void;
  goClients: () => void;
}) {
  const { copy, locale } = useAccCopy();
  const router = useRouter();
  const d = copy.dashboard;
  const isAdmin = me.role === 'OWNER' || me.role === 'ADMIN';
  const pendingFirm = (mandants ?? []).filter((m) => m.status === 'PENDING_FIRM');
  const attention = (mandants ?? []).filter((m) => m.status === 'ACTIVE' && (m.factures_overdue ?? 0) > 0).slice(0, 5);
  if (!dashboard) return <Text style={styles.muted}>{copy.common.loading}</Text>;

  return (
    <View style={styles.stack}>
      <View style={styles.kpis}>
        <Kpi icon="briefcase" label={d.kpis.active} value={dashboard.active_clients} onPress={goClients} />
        <Kpi icon="send" label={d.kpis.invitations} value={dashboard.pending_invitations} onPress={goClients} />
        <Kpi icon="inbox" label={d.kpis.requests} value={dashboard.pending_client + dashboard.pending_firm} onPress={goClients} />
        <Kpi icon="file-text" label={d.kpis.documents} value={dashboard.documents} />
        <Kpi icon="alert-circle" label={d.kpis.overdue} value={dashboard.overdue_invoices} warn={dashboard.overdue_invoices > 0} onPress={goClients} />
      </View>
      {dashboard.open_chf > 0 ? <Text style={styles.body}>{fill(d.open, { amount: formatChf(dashboard.open_chf).replace('CHF ', '') })}</Text> : null}

      {pendingFirm.length ? (
        <View style={[styles.card, styles.highlight]}>
          <Text style={styles.cardTitle}>{d.pendingFirmTitle}</Text>
          {pendingFirm.map((m) => (
            <View key={m.access_id} style={styles.pendingRow}>
              <Text style={[styles.body, { flex: 1, minWidth: 200 }]}>{fill(d.pendingFirmText, { name: m.name })}</Text>
              {isAdmin ? (
                <View style={styles.actions}>
                  <Button title={d.accept} icon="check" onPress={() => run(() => acc.respondClient(m.access_id, true))} disabled={busy} />
                  <Button title={d.decline} variant="secondary" onPress={() => run(() => acc.respondClient(m.access_id, false))} disabled={busy} />
                </View>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}

      {mandants && mandants.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{d.emptyTitle}</Text>
          <Text style={styles.muted}>{d.emptyText}</Text>
          <AddClientForm onAdded={onAdded} />
        </View>
      ) : null}

      <View style={styles.twoCols}>
        {attention.length ? (
          <View style={[styles.card, { flex: 1, minWidth: 280 }]}>
            <Text style={styles.cardTitle}>{copy.clients.filters.attention}</Text>
            {attention.map((m) => (
              <Pressable key={m.access_id} onPress={() => router.push(`/mandant?id=${m.organization_id}` as any)} style={styles.listRow}>
                <Text style={[styles.body, { flex: 1 }]} numberOfLines={1}>
                  {m.name}
                </Text>
                <Text style={styles.danger}>{fill(copy.clients.overdue, { count: m.factures_overdue ?? 0 })}</Text>
                <Feather name="chevron-right" size={16} color={colors.textMuted} />
              </Pressable>
            ))}
          </View>
        ) : null}
        <View style={[styles.card, { flex: 1, minWidth: 280 }]}>
          <Text style={styles.cardTitle}>{d.recentDocs}</Text>
          {dashboard.recent_documents.length === 0 ? <Text style={styles.muted}>{d.noDocs}</Text> : null}
          {dashboard.recent_documents.map((doc) => (
            <Pressable key={doc.id} onPress={() => openDocument(doc.file_path)} style={styles.listRow}>
              <Feather name="paperclip" size={14} color={colors.textMuted} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.body} numberOfLines={1}>
                  {doc.file_name}
                </Text>
                <Text style={styles.small}>
                  {doc.organization_name} · {formatDate(doc.created_at, locale)}
                </Text>
              </View>
              <Feather name="download" size={15} color={colors.primary} />
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

function Kpi({ icon, label, value, warn = false, onPress }: { icon: keyof typeof Feather.glyphMap; label: string; value: number; warn?: boolean; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={styles.kpi}>
      <Feather name={icon} size={16} color={warn ? colors.danger : colors.primary} />
      <Text style={[styles.kpiValue, warn && { color: colors.danger }]}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </Pressable>
  );
}

export async function openDocument(path: string | null) {
  if (!path) return;
  const url = await signedDocumentUrl(path);
  if (!url) return;
  if (Platform.OS === 'web' && typeof window !== 'undefined') window.open(url, '_blank', 'noopener');
  else Linking.openURL(url);
}

// ---------------------------------------------------------------------------

function AddClientForm({ onAdded }: { onAdded: () => void }) {
  const { copy } = useAccCopy();
  const t = copy.addClient;
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [contact, setContact] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  async function submit() {
    if (!email.trim()) return;
    setBusy(true);
    setMessage(null);
    const { data, error } = await acc.inviteClient(email.trim(), company.trim(), contact.trim());
    setBusy(false);
    if (error) return setMessage({ text: error, error: true });
    setEmail('');
    setCompany('');
    setContact('');
    const text = data?.kind === 'request' ? t.sentRequest : `${t.sentInvitation}${data?.with_partner_code ? ` ${t.withPartner}` : ''}`;
    setMessage({ text, error: false });
    onAdded();
  }

  return (
    <View style={{ gap: spacing.sm }}>
      <Field label={t.email} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
      <View style={styles.formRow}>
        <View style={styles.formHalf}>
          <Field label={t.company} value={company} onChangeText={setCompany} />
        </View>
        <View style={styles.formHalf}>
          <Field label={t.contact} value={contact} onChangeText={setContact} />
        </View>
      </View>
      {message ? <Text style={message.error ? styles.error : styles.success}>{message.text}</Text> : null}
      <View style={styles.actions}>
        <Button title={t.submit} icon="send" onPress={submit} loading={busy} disabled={!email.trim()} />
      </View>
    </View>
  );
}

type Filter = 'all' | 'active' | 'pending' | 'attention';
type Sort = 'name' | 'activity' | 'open';

function ClientsTab({
  me,
  mandants,
  invitations,
  busy,
  run,
  onAdded,
}: {
  me: Me;
  mandants: Mandant[] | null;
  invitations: Invitation[];
  busy: boolean;
  run: (a: () => Promise<{ error: string | null }>, s?: string) => void;
  onAdded: () => void;
}) {
  const { copy, locale } = useAccCopy();
  const t = copy.clients;
  const router = useRouter();
  const wide = useIsWide(960);
  const isAdmin = me.role === 'OWNER' || me.role === 'ADMIN';
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<Sort>('name');
  const [adding, setAdding] = useState(false);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = (mandants ?? []).filter((m) => !q || m.name.toLowerCase().includes(q));
    if (filter === 'active') rows = rows.filter((m) => m.status === 'ACTIVE');
    if (filter === 'pending') rows = rows.filter((m) => m.status !== 'ACTIVE');
    if (filter === 'attention') rows = rows.filter((m) => (m.factures_overdue ?? 0) > 0 || m.subscription_status === 'past_due' || m.bexio_status === 'error');
    const by: Record<Sort, (a: Mandant, b: Mandant) => number> = {
      name: (a, b) => a.name.localeCompare(b.name),
      activity: (a, b) => (b.last_activity_at ?? '').localeCompare(a.last_activity_at ?? ''),
      open: (a, b) => (b.factures_open_chf ?? 0) - (a.factures_open_chf ?? 0),
    };
    return [...rows].sort(by[sort]);
  }, [mandants, query, filter, sort]);

  if (!mandants) return <Text style={styles.muted}>{copy.common.loading}</Text>;

  const statusLabel = (m: Mandant) => t.statuses[m.status];
  const subLabel = (s: string | null) => (t.subscription as Record<string, string>)[s ?? 'none'] ?? s ?? '—';

  return (
    <View style={styles.stack}>
      <View style={styles.toolbar}>
        <TextInput value={query} onChangeText={setQuery} placeholder={t.search} placeholderTextColor={colors.textMuted} style={[styles.input, { flex: 1, minWidth: 200 }]} />
        <Button title={t.add} icon="plus" onPress={() => setAdding((v) => !v)} />
      </View>
      {adding ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{copy.addClient.title}</Text>
          <Text style={styles.muted}>{copy.addClient.text}</Text>
          <AddClientForm onAdded={onAdded} />
        </View>
      ) : null}
      <View style={styles.toolbar}>
        <View style={styles.chips}>
          {(['all', 'active', 'pending', 'attention'] as Filter[]).map((f) => (
            <Chip key={f} label={t.filters[f]} on={filter === f} onPress={() => setFilter(f)} />
          ))}
        </View>
        <View style={styles.chips}>
          {(['name', 'activity', 'open'] as Sort[]).map((s) => (
            <Chip key={s} label={t.sort[s]} on={sort === s} onPress={() => setSort(s)} icon="bar-chart-2" />
          ))}
        </View>
      </View>

      {mandants.length === 0 ? <Text style={styles.muted}>{t.empty}</Text> : list.length === 0 ? <Text style={styles.muted}>{t.noMatch}</Text> : null}

      {wide && list.length ? (
        <View style={styles.table}>
          <View style={[styles.tr, styles.thRow]}>
            <Text style={[styles.th, { flex: 2.4 }]}>{t.columns.company}</Text>
            <Text style={[styles.th, { flex: 1.3 }]}>{t.columns.status}</Text>
            <Text style={[styles.th, { flex: 1 }]}>{t.columns.plan}</Text>
            <Text style={[styles.th, { flex: 1.1 }]}>{t.columns.activity}</Text>
            <Text style={[styles.th, styles.num, { flex: 0.8 }]}>{t.columns.documents}</Text>
            <Text style={[styles.th, styles.num, { flex: 1.5 }]}>{t.columns.invoices}</Text>
            <Text style={[styles.th, styles.num, { flex: 1.2 }]}>{t.columns.payments}</Text>
            <View style={{ width: 150 }} />
          </View>
          {list.map((m) => (
            <Pressable
              key={m.access_id}
              onPress={() => m.status === 'ACTIVE' && router.push(`/mandant?id=${m.organization_id}` as any)}
              style={({ hovered }: any) => [styles.tr, hovered && m.status === 'ACTIVE' && styles.trHover]}
            >
              <Text style={[styles.td, styles.tdStrong, { flex: 2.4 }]} numberOfLines={1}>
                {m.name}
              </Text>
              <View style={{ flex: 1.3 }}>
                <StatusBadge status={m.status} label={statusLabel(m)} />
              </View>
              <Text style={[styles.td, { flex: 1 }]} numberOfLines={1}>
                {m.plan_name ?? '—'}
                {m.status === 'ACTIVE' && m.subscription_status && m.subscription_status !== 'active' ? ` · ${subLabel(m.subscription_status)}` : ''}
              </Text>
              <Text style={[styles.td, { flex: 1.1 }]}>{formatDate(m.last_activity_at, locale)}</Text>
              <Text style={[styles.td, styles.num, { flex: 0.8 }]}>{m.documents_count ?? '—'}</Text>
              <View style={{ flex: 1.5, alignItems: 'flex-end' }}>
                <Text style={[styles.td, styles.num]}>{m.factures_open_chf != null ? formatChf(m.factures_open_chf) : '—'}</Text>
                {m.factures_overdue ? <Text style={styles.danger}>{fill(t.overdue, { count: m.factures_overdue })}</Text> : null}
              </View>
              <Text style={[styles.td, styles.num, { flex: 1.2 }]}>{m.payments_30d_chf != null ? formatChf(m.payments_30d_chf) : '—'}</Text>
              <View style={{ width: 150, alignItems: 'flex-end' }}>
                <RowAction m={m} isAdmin={isAdmin} busy={busy} run={run} />
              </View>
            </Pressable>
          ))}
        </View>
      ) : (
        list.map((m) => (
          <Pressable key={m.access_id} onPress={() => m.status === 'ACTIVE' && router.push(`/mandant?id=${m.organization_id}` as any)} style={styles.card}>
            <View style={styles.cardHead}>
              <Text style={[styles.cardTitle, { flex: 1 }]}>{m.name}</Text>
              <StatusBadge status={m.status} label={statusLabel(m)} />
            </View>
            {m.status === 'ACTIVE' ? (
              <View style={styles.metrics}>
                <Metric label={t.columns.plan} value={m.plan_name ?? '—'} />
                <Metric label={t.columns.invoices} value={m.factures_open_chf != null ? formatChf(m.factures_open_chf) : '—'} />
                <Metric label={t.columns.payments} value={m.payments_30d_chf != null ? formatChf(m.payments_30d_chf) : '—'} />
                <Metric label={t.columns.activity} value={formatDate(m.last_activity_at, locale)} />
              </View>
            ) : null}
            {m.factures_overdue ? <Text style={styles.danger}>{fill(t.overdue, { count: m.factures_overdue })}</Text> : null}
            <View style={styles.actions}>
              <RowAction m={m} isAdmin={isAdmin} busy={busy} run={run} />
            </View>
          </Pressable>
        ))
      )}

      {invitations.length ? (
        <View style={[styles.card, { marginTop: spacing.lg }]}>
          <Text style={styles.cardTitle}>{t.invitationsTitle}</Text>
          {invitations.map((i) => (
            <View key={i.id} style={styles.listRow}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.body} numberOfLines={1}>
                  {i.company_name ? `${i.company_name} · ` : ''}
                  {i.email}
                </Text>
                <Text style={styles.small}>
                  {t.invitationStatuses[i.status]} · {formatDate(i.created_at, locale)}
                  {i.partner_code ? ' · Partners' : ''}
                </Text>
              </View>
              {i.status === 'PENDING' || i.status === 'EXPIRED' ? (
                <View style={styles.actions}>
                  <Pressable onPress={() => run(() => acc.resendInvitation(i.id), copy.addClient.sentInvitation)} disabled={busy}>
                    <Text style={styles.link}>{t.resend}</Text>
                  </Pressable>
                  {isAdmin ? (
                    <Pressable onPress={() => run(() => acc.cancelInvitation(i.id))} disabled={busy}>
                      <Text style={styles.linkMuted}>{t.cancel}</Text>
                    </Pressable>
                  ) : null}
                </View>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function RowAction({ m, isAdmin, busy, run }: { m: Mandant; isAdmin: boolean; busy: boolean; run: (a: () => Promise<{ error: string | null }>, s?: string) => void }) {
  const { copy } = useAccCopy();
  if (m.status === 'ACTIVE') {
    return (
      <View style={styles.openLink}>
        <Text style={styles.link}>{copy.clients.open}</Text>
        <Feather name="arrow-right" size={14} color={colors.primary} />
      </View>
    );
  }
  if (!isAdmin) return null;
  if (m.status === 'PENDING_FIRM') {
    return (
      <View style={styles.actions}>
        <Pressable onPress={() => run(() => acc.respondClient(m.access_id, true))} disabled={busy}>
          <Text style={styles.link}>{copy.dashboard.accept}</Text>
        </Pressable>
        <Pressable onPress={() => run(() => acc.respondClient(m.access_id, false))} disabled={busy}>
          <Text style={styles.linkMuted}>{copy.dashboard.decline}</Text>
        </Pressable>
      </View>
    );
  }
  return (
    <Pressable onPress={() => run(() => acc.respondClient(m.access_id, false))} disabled={busy}>
      <Text style={styles.linkMuted}>{copy.clients.cancelRequest}</Text>
    </Pressable>
  );
}

export function StatusBadge({ status, label }: { status: string; label: string }) {
  const tone = status === 'ACTIVE' ? { bg: colors.successSoft, fg: colors.success } : status === 'PENDING_FIRM' ? { bg: colors.primarySoft, fg: colors.primary } : { bg: colors.surfaceAlt, fg: colors.textMuted };
  return (
    <View style={[styles.badge, { backgroundColor: tone.bg }]}>
      <Text style={[styles.badgeText, { color: tone.fg }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

export function Chip({ label, on, onPress, icon }: { label: string; on: boolean; onPress: () => void; icon?: keyof typeof Feather.glyphMap }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, on && styles.chipOn]} accessibilityRole="button" aria-pressed={on}>
      {icon && on ? <Feather name={icon} size={12} color={colors.surface} /> : null}
      <Text style={[styles.chipText, on && styles.chipTextOn]}>{label}</Text>
    </Pressable>
  );
}

export function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------

function DocumentsTab({ mandants }: { mandants: Mandant[] }) {
  const { copy, locale } = useAccCopy();
  const t = copy.documents;
  const active = mandants.filter((m) => m.status === 'ACTIVE');
  const [org, setOrg] = useState<string | null>(null);
  const [kind, setKind] = useState<'invoice' | 'receipt' | null>(null);
  const [query, setQuery] = useState('');
  const [rows, setRows] = useState<DocumentRow[] | null>(null);

  useEffect(() => {
    setRows(null);
    acc.documents({ org, kind }).then(({ data }) => setRows(data ?? []));
  }, [org, kind]);

  const q = query.trim().toLowerCase();
  const list = (rows ?? []).filter((r) => !q || `${r.title} ${r.organization_name}`.toLowerCase().includes(q));

  return (
    <View style={styles.stack}>
      <Text style={styles.muted}>{t.text}</Text>
      <TextInput value={query} onChangeText={setQuery} placeholder={t.search} placeholderTextColor={colors.textMuted} style={styles.input} />
      <View style={styles.chips}>
        <Chip label={t.kinds.all} on={kind === null} onPress={() => setKind(null)} />
        <Chip label={t.kinds.invoice} on={kind === 'invoice'} onPress={() => setKind('invoice')} />
        <Chip label={t.kinds.receipt} on={kind === 'receipt'} onPress={() => setKind('receipt')} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <Chip label={t.allClients} on={org === null} onPress={() => setOrg(null)} />
        {active.map((m) => (
          <Chip key={m.organization_id} label={m.name} on={org === m.organization_id} onPress={() => setOrg(m.organization_id)} />
        ))}
      </ScrollView>
      {rows === null ? <Text style={styles.muted}>{copy.common.loading}</Text> : list.length === 0 ? <Text style={styles.muted}>{t.none}</Text> : null}
      <View style={styles.cardList}>
        {list.map((r) => (
          <View key={`${r.kind}-${r.id}`} style={styles.docRow}>
            <View style={styles.docIcon}>
              <Feather name={r.kind === 'invoice' ? 'file-text' : 'paperclip'} size={16} color={colors.primary} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.body} numberOfLines={1}>
                {r.title}
              </Text>
              <Text style={styles.small}>
                {r.organization_name} · {formatDate(r.doc_date, locale)}
                {r.amount_chf != null ? ` · ${formatChf(r.amount_chf)}` : ''}
              </Text>
            </View>
            {r.file_path ? (
              <Pressable onPress={() => openDocument(r.file_path)} style={styles.openLink} accessibilityRole="button">
                <Feather name="download" size={15} color={colors.primary} />
                <Text style={styles.link}>{t.download}</Text>
              </Pressable>
            ) : (
              <Text style={styles.small}>{t.noFile}</Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------

function TeamTab({ me }: { me: Me }) {
  const { copy, locale } = useAccCopy();
  const t = copy.team;
  const isOwner = me.role === 'OWNER';
  const isAdmin = isOwner || me.role === 'ADMIN';
  const [team, setTeam] = useState<Team | null>(null);
  const [audit, setAudit] = useState<AuditRow[]>([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'MEMBER'>('MEMBER');
  const [confirm, setConfirm] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const [tm, au] = await Promise.all([acc.team(), isAdmin ? acc.audit() : Promise.resolve({ data: [] as AuditRow[], error: null })]);
    setTeam(tm.data);
    setAudit(au.data ?? []);
  }, [isAdmin]);

  useEffect(() => {
    load();
  }, [load]);

  async function run(action: () => Promise<{ error: string | null }>, success?: string) {
    setBusy(true);
    setMessage(null);
    const { error } = await action();
    setBusy(false);
    setMessage(error ? { text: error, error: true } : success ? { text: success, error: false } : null);
    await load();
  }

  if (!team) return <Text style={styles.muted}>{copy.common.loading}</Text>;

  return (
    <View style={styles.stack}>
      {message ? <Text style={message.error ? styles.error : styles.success}>{message.text}</Text> : null}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t.title}</Text>
        {team.members.map((m) => (
          <View key={m.user_id} style={styles.memberRow}>
            <View style={{ flex: 1, minWidth: 200 }}>
              <Text style={styles.body}>
                {[m.first_name, m.last_name].filter(Boolean).join(' ') || m.email}
                {m.me ? <Text style={styles.small}>{`  (${t.you})`}</Text> : null}
              </Text>
              <Text style={styles.small}>{m.email}</Text>
            </View>
            {isOwner && !m.me ? (
              <View style={styles.chips}>
                {(['OWNER', 'ADMIN', 'MEMBER'] as const).map((r) => (
                  <Chip key={r} label={t.roles[r]} on={m.role === r} onPress={() => m.role !== r && run(() => acc.setRole(m.user_id, r))} />
                ))}
              </View>
            ) : (
              <StatusBadge status={m.role === 'OWNER' ? 'ACTIVE' : 'OTHER'} label={t.roles[m.role]} />
            )}
            {(isAdmin && !m.me) || m.me ? (
              <Pressable
                onPress={() => {
                  if (confirm === m.user_id) {
                    setConfirm(null);
                    run(() => acc.removeMember(m.user_id));
                  } else setConfirm(m.user_id);
                }}
                disabled={busy}
              >
                <Text style={styles.linkDanger}>{confirm === m.user_id ? t.removeConfirm : m.me ? t.leave : t.remove}</Text>
              </Pressable>
            ) : null}
          </View>
        ))}
      </View>

      {isAdmin ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t.invite}</Text>
          <Field label={t.email} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <View style={styles.chips}>
            <Chip label={t.roles.MEMBER} on={role === 'MEMBER'} onPress={() => setRole('MEMBER')} />
            {isOwner ? <Chip label={t.roles.ADMIN} on={role === 'ADMIN'} onPress={() => setRole('ADMIN')} /> : null}
          </View>
          <View style={styles.actions}>
            <Button
              title={t.send}
              icon="send"
              disabled={!email.trim()}
              loading={busy}
              onPress={() =>
                run(async () => {
                  const r = await acc.inviteStaff(email.trim(), role);
                  if (!r.error) setEmail('');
                  return r;
                }, t.sent)
              }
            />
          </View>
          {team.invitations.length ? (
            <View style={{ gap: spacing.xs }}>
              <Text style={styles.label}>{t.pending}</Text>
              {team.invitations.map((i) => (
                <View key={i.id} style={styles.listRow}>
                  <Text style={[styles.body, { flex: 1 }]}>
                    {i.email} · {t.roles[i.role]}
                  </Text>
                  <Pressable onPress={() => run(() => acc.resendInvitation(i.id), t.sent)} disabled={busy}>
                    <Text style={styles.link}>{copy.clients.resend}</Text>
                  </Pressable>
                  <Pressable onPress={() => run(() => acc.cancelInvitation(i.id))} disabled={busy}>
                    <Text style={styles.linkMuted}>{copy.clients.cancel}</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}

      {isAdmin ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t.historyTitle}</Text>
          {audit.length === 0 ? <Text style={styles.muted}>{t.historyEmpty}</Text> : null}
          {audit.slice(0, 60).map((a) => (
            <View key={a.id} style={styles.auditRow}>
              <Text style={styles.auditDate}>{formatDate(a.created_at, locale)}</Text>
              <Text style={[styles.small, { flex: 1 }]}>
                {a.action.replace(/_/g, ' ')}
                {a.organization_name ? ` · ${a.organization_name}` : ''}
                {a.actor_name ? ` · ${a.actor_name}` : ''}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

// ---------------------------------------------------------------------------

function PartnerTab() {
  const { copy } = useAccCopy();
  const t = copy.partnerTab;
  const [summary, setSummary] = useState<Awaited<ReturnType<typeof partnerSummary>> | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    partnerSummary().then(setSummary);
  }, []);
  useEffect(load, [load]);

  if (!summary) return <Text style={styles.muted}>{copy.common.loading}</Text>;

  if (!summary.active) {
    return (
      <View style={[styles.card, styles.highlight]}>
        <Text style={styles.eyebrow}>Cantia Partners</Text>
        <Text style={styles.h2}>{t.title}</Text>
        <Text style={styles.body}>{t.inactiveText}</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={styles.actions}>
          <Button
            title={t.activate}
            icon="zap"
            loading={busy}
            onPress={async () => {
              setBusy(true);
              const { error: err } = await acc.activatePartner();
              setBusy(false);
              if (err) setError(err);
              else load();
            }}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.stack}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>Cantia Partners</Text>
        <Text style={styles.body}>{t.activeText}</Text>
        <View style={styles.kpis}>
          <Kpi icon="users" label={t.brought} value={summary.brought} />
          <View style={styles.kpi}>
            <Feather name="trending-up" size={16} color={colors.primary} />
            <Text style={styles.kpiValue}>{formatChf(summary.earned)}</Text>
            <Text style={styles.kpiLabel}>{t.earned}</Text>
          </View>
          <View style={styles.kpi}>
            <Feather name="credit-card" size={16} color={colors.success} />
            <Text style={styles.kpiValue}>{formatChf(summary.available)}</Text>
            <Text style={styles.kpiLabel}>{t.available}</Text>
          </View>
        </View>
        {summary.code ? (
          <View style={{ gap: 4 }}>
            <Text style={styles.label}>{t.code}</Text>
            <Text style={styles.mono} selectable>
              https://cantia.ch/?ref={summary.code}
            </Text>
          </View>
        ) : null}
        <View style={styles.actions}>
          <Button title={t.see} icon="external-link" variant="secondary" onPress={() => openPartnerSpace()} />
        </View>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------

function SettingsTab({ firm, onSaved }: { firm: Firm; onSaved: () => void }) {
  const { copy } = useAccCopy();
  const t = copy.onboarding;
  const [form, setForm] = useState<Firm>(firm);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const set = (key: keyof Firm) => (value: string) => setForm((f) => ({ ...f, [key]: value }));

  async function save() {
    setBusy(true);
    const { error } = await acc.updateFirm(form);
    setBusy(false);
    setMessage(error ? { text: error, error: true } : { text: copy.settings.saved, error: false });
    if (!error) onSaved();
  }

  return (
    <View style={[styles.card, { maxWidth: 680 }]}>
      <Text style={styles.cardTitle}>{copy.settings.title}</Text>
      <Field label={t.firmName} value={form.name} onChangeText={set('name')} />
      <View style={styles.formRow}>
        <View style={styles.formHalf}>
          <Field label={t.phone} value={form.phone ?? ''} onChangeText={set('phone')} />
        </View>
        <View style={styles.formHalf}>
          <Field label={t.website} value={form.website ?? ''} onChangeText={set('website')} autoCapitalize="none" />
        </View>
      </View>
      <Field label={t.address} value={form.address ?? ''} onChangeText={set('address')} />
      <View style={styles.formRow}>
        <View style={{ width: 120 }}>
          <Field label={t.postalCode} value={form.postal_code ?? ''} onChangeText={set('postal_code')} />
        </View>
        <View style={styles.formHalf}>
          <Field label={t.city} value={form.city ?? ''} onChangeText={set('city')} />
        </View>
      </View>
      <Field label={t.ide} value={form.ide_number ?? ''} onChangeText={set('ide_number')} />
      <Text style={styles.label}>{t.mandates}</Text>
      <View style={styles.chips}>
        {MANDATES.map((m) => (
          <Chip key={m} label={m} on={form.mandates_range === m} onPress={() => setForm((f) => ({ ...f, mandates_range: m }))} />
        ))}
      </View>
      <Text style={styles.label}>{t.software}</Text>
      <View style={styles.chips}>
        {SOFTWARE.map((s) => {
          const on = form.software.includes(s);
          return <Chip key={s} label={t.softwareNames[s]} on={on} onPress={() => setForm((f) => ({ ...f, software: on ? f.software.filter((x) => x !== s) : [...f.software, s] }))} />;
        })}
      </View>
      <Text style={styles.label}>{copy.settings.language}</Text>
      <View style={styles.chips}>
        {(['fr', 'de', 'it'] as const).map((l) => (
          <Chip key={l} label={l.toUpperCase()} on={form.locale === l} onPress={() => setForm((f) => ({ ...f, locale: l }))} />
        ))}
      </View>
      {message ? <Text style={message.error ? styles.error : styles.success}>{message.text}</Text> : null}
      <View style={styles.actions}>
        <Button title={copy.settings.save} onPress={save} loading={busy} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', maxWidth: PAGE_MAX, alignSelf: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.xl, gap: spacing.lg },
  head: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: spacing.md },
  eyebrow: { fontSize: 12, fontWeight: '700', color: colors.primary, textTransform: 'uppercase', letterSpacing: 1 },
  h1: { ...displayType, fontSize: 34, lineHeight: 38, fontWeight: '800', color: colors.text },
  h2: { ...displayType, fontSize: 24, lineHeight: 30, fontWeight: '800', color: colors.text },
  tabs: { gap: spacing.xs, borderBottomWidth: 1, borderBottomColor: colors.border },
  tab: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderBottomWidth: 2, borderBottomColor: 'transparent', marginBottom: -1 },
  tabActive: { borderBottomColor: colors.text },
  tabText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.textMuted },
  tabTextActive: { color: colors.text, fontWeight: '800' },
  stack: { gap: spacing.md },
  kpis: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  kpi: { flexGrow: 1, flexBasis: 160, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg, gap: 4 },
  kpiValue: { ...displayType, fontSize: 28, fontWeight: '800', color: colors.text },
  kpiLabel: { fontSize: fontSize.xs, color: colors.textMuted, fontWeight: '600' },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.xl, gap: spacing.md },
  highlight: { borderColor: colors.primary, backgroundColor: '#FFF9F3' },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flexWrap: 'wrap' },
  cardTitle: { fontSize: fontSize.lg, fontWeight: '800', color: colors.text },
  cardList: { gap: spacing.sm },
  twoCols: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  pendingRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.md },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  memberRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md },
  docIcon: { width: 34, height: 34, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  toolbar: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingVertical: 10, paddingHorizontal: 12, fontSize: fontSize.sm, color: colors.text, backgroundColor: colors.surface },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 12, backgroundColor: colors.surface },
  chipOn: { backgroundColor: colors.text, borderColor: colors.text },
  chipText: { fontSize: fontSize.xs, color: colors.text, fontWeight: '600' },
  chipTextOn: { color: colors.surface },
  table: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, overflow: 'hidden' },
  tr: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 12, paddingHorizontal: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border },
  thRow: { backgroundColor: colors.surfaceAlt, borderTopWidth: 0 },
  trHover: { backgroundColor: '#FFF9F3' },
  th: { fontSize: 11, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  td: { fontSize: fontSize.sm, color: colors.text },
  tdStrong: { fontWeight: '700' },
  num: { textAlign: 'right', ...monoType, fontSize: 12 } as any,
  badge: { alignSelf: 'flex-start', borderRadius: 999, paddingVertical: 3, paddingHorizontal: 10 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg },
  metric: { gap: 2, minWidth: 110 },
  metricLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '600' },
  metricValue: { fontSize: fontSize.sm, color: colors.text, fontWeight: '700' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.md },
  openLink: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  formRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  formHalf: { flex: 1, minWidth: 180 },
  label: { fontSize: fontSize.xs, color: colors.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  body: { fontSize: fontSize.sm, lineHeight: 20, color: colors.text },
  small: { fontSize: 12, color: colors.textMuted },
  muted: { fontSize: fontSize.sm, lineHeight: 19, color: colors.textMuted },
  mono: { ...monoType, fontSize: 13, color: colors.text },
  link: { fontSize: fontSize.sm, color: colors.primary, fontWeight: '700' },
  linkMuted: { fontSize: fontSize.sm, color: colors.textMuted, fontWeight: '600' },
  linkDanger: { fontSize: fontSize.sm, color: colors.danger, fontWeight: '600' },
  danger: { fontSize: 12, color: colors.danger, fontWeight: '700' },
  error: { fontSize: fontSize.sm, color: colors.danger },
  success: { fontSize: fontSize.sm, color: colors.success },
  warnPill: { backgroundColor: colors.dangerSoft, borderRadius: 999, paddingVertical: 4, paddingHorizontal: 12 },
  warnPillText: { fontSize: 12, fontWeight: '700', color: colors.danger },
  auditRow: { flexDirection: 'row', gap: spacing.md },
  auditDate: { fontSize: 12, color: colors.textMuted, width: 86 },
});
