import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Head from 'expo-router/head';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Button } from '../components/ui';
import { PAGE_MAX, useIsWide } from '../components/accounting/AccountingChrome';
import { AccShell } from '../components/accounting/Shell';
import { DeadlinesSection, InsightsPanel, NotesPanel, ProfileForm, RequestsSection } from '../components/accounting/Workspace';
import { TimeSection, WorkSection } from '../components/accounting/ProWork';
import { ApprovalsSection, ExportPanel, KpiPanel, ProposalsPanel } from '../components/accounting/ProClients';
import { ExternalMandant } from '../components/accounting/ExternalMandant';
import { useProCopy } from '../lib/accounting/proCopy';
import { useWorkCopy } from '../lib/accounting/workCopy';
import { Chip, Metric, openDocument } from '../components/accounting/Cockpit';
import { useAccCopy } from '../lib/accounting/locale';
import { fill, type Permission } from '../lib/accounting/copy';
import { acc, formatChf, formatDate, type ClientHeader, type DocumentRow, type Me } from '../lib/accounting/api';
import {
  entriesToCsv,
  getBalanceSheet,
  getIncomeStatement,
  getTrialBalance,
  getVatReportByCode,
  getVatSettings,
  listEntries,
  vatWorksheetToCsv,
  type BalanceSheet,
  type IncomeStatement,
  type VatLedgerReport,
} from '../lib/api/accounting';
import { downloadTextFile } from '../lib/downloadFile';
import { usePartnerSession } from '../lib/partners/session';
import { supabase } from '../lib/supabase';
import { displayType, monoType } from '../lib/marketingTheme';
import { colors, fontSize, radius, spacing } from '../lib/theme';

// One client of the firm (accounting.cantia.ch/mandant?id=...). A dedicated,
// light view: nothing from the construction side (photos, planning, notes,
// reports) is ever loaded here. Every query is filtered by the database
// (ACTIVE access + permission); the id in the URL grants nothing by itself.

type Section = 'overview' | 'work' | 'requests' | 'deadlines' | 'approvals' | 'time' | 'invoices' | 'payments' | 'customers' | 'accounting' | 'proposals' | 'documents' | 'quotes' | 'hours' | 'payroll' | 'integrations' | 'notes';
const SECTION_PERMISSION: Record<Section, Permission | null> = {
  overview: null,
  work: null,
  requests: null,
  deadlines: null,
  approvals: null,
  time: null,
  invoices: 'VIEW_INVOICES',
  payments: 'VIEW_PAYMENT_STATUS',
  customers: 'VIEW_CUSTOMERS',
  accounting: 'VIEW_ACCOUNTING_DOCUMENTS',
  proposals: 'VIEW_ACCOUNTING_DOCUMENTS',
  documents: null,
  quotes: 'VIEW_QUOTES',
  hours: 'VIEW_WORK_HOURS',
  payroll: 'VIEW_PAYROLL_DATA',
  integrations: 'VIEW_EXPORTS',
  notes: null,
};
const WITH_PERIOD: Section[] = ['invoices', 'payments', 'accounting', 'quotes', 'hours', 'payroll'];
type Period = 'month' | 'quarter' | 'year' | 'lastYear';

function periodRange(p: Period): { start: string; end: string } {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  if (p === 'month') return { start: iso(new Date(y, m, 1)), end: iso(new Date(y, m + 1, 0)) };
  if (p === 'quarter') {
    const q = Math.floor(m / 3) * 3;
    return { start: iso(new Date(y, q, 1)), end: iso(new Date(y, q + 3, 0)) };
  }
  if (p === 'lastYear') return { start: `${y - 1}-01-01`, end: `${y - 1}-12-31` };
  return { start: `${y}-01-01`, end: `${y}-12-31` };
}

interface InvoiceRow {
  id: string;
  number: string | null;
  client_name: string;
  created_at: string;
  due_date: string;
  status: string;
  vat_rate: number;
  pdf_path: string | null;
  total: number;
  paid: number;
}

export default function MandantPage() {
  const { copy, locale } = useAccCopy();
  const t = copy.client;
  const router = useRouter();
  const session = usePartnerSession();
  const params = useLocalSearchParams<{ id?: string; ext?: string; tab?: string }>();
  // The page is prerendered without its query string: the first client
  // render must match it (React #418), the ids are read right after.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const orgId = hydrated && typeof params.id === 'string' ? params.id : null;
  const extId = hydrated && typeof params.ext === 'string' ? params.ext : null;
  const p = useProCopy();
  const wide = useIsWide(900);
  const [me, setMe] = useState<Me | null>(null);
  const [client, setClient] = useState<ClientHeader | null | undefined>(undefined);
  const [section, setSection] = useState<Section>(params.tab && params.tab in SECTION_PERMISSION ? (params.tab as Section) : 'overview');
  const w = useWorkCopy();
  const sectionLabel = (sec: Section) =>
    sec === 'overview'
      ? w.client.overview
      : sec === 'requests'
        ? w.client.requests
        : sec === 'deadlines'
          ? w.client.deadlines
          : sec === 'notes'
            ? w.client.notes
            : sec === 'work' || sec === 'time' || sec === 'approvals' || sec === 'proposals'
              ? p.client.tabs[sec]
              : t.sections[sec];
  const [period, setPeriod] = useState<Period>('year');
  const [confirmEnd, setConfirmEnd] = useState(false);

  useEffect(() => {
    if (session === null) router.replace('/connexion');
    if (!session) return;
    acc.me().then(({ data }) => setMe(data));
    if (orgId) acc.client(orgId).then(({ data }) => setClient(data ?? null));
  }, [session, orgId, router]);

  const range = useMemo(() => periodRange(period), [period]);
  const can = (p: Permission | null) => !p || !!client?.permissions.includes(p);
  const sections = (Object.keys(SECTION_PERMISSION) as Section[]).filter((s) => {
    if (s === 'documents') return can('VIEW_INVOICES') || can('VIEW_ACCOUNTING_DOCUMENTS');
    return can(SECTION_PERMISSION[s]);
  });

  async function endMandate() {
    if (!client) return;
    const { error } = await acc.respondClient(client.access_id, false);
    if (!error) router.replace('/espace?tab=clients');
  }

  if (extId) {
    return (
      <AccShell me={me} active="clients">
        {me ? <ExternalMandant me={me} id={extId} initialTab={params.tab} /> : <Text style={styles.muted}>{copy.common.loading}</Text>}
      </AccShell>
    );
  }

  return (
    <AccShell me={me} active="clients">
      <Head>
        <title>{`${client?.name ?? t.back} · ${copy.brand}`}</title>
        <meta name="robots" content="noindex" />
      </Head>
      <View style={styles.wrap}>
        <Pressable onPress={() => router.push('/espace?tab=clients' as any)} style={styles.back}>
          <Feather name="arrow-left" size={15} color={colors.textMuted} />
          <Text style={styles.backText}>{t.back}</Text>
        </Pressable>

        {client === undefined ? (
          <Text style={styles.muted}>{copy.common.loading}</Text>
        ) : client === null ? (
          <View style={styles.card}>
            <Text style={styles.body}>{t.notFound}</Text>
          </View>
        ) : (
          <>
            <View style={styles.head}>
              <View style={{ flex: 1, minWidth: 240, gap: 4 }}>
                <Text style={styles.h1} role="heading" aria-level={1}>
                  {client.name}
                </Text>
                <Text style={styles.muted}>
                  {[
                    [client.address, [client.postal_code, client.locality].filter(Boolean).join(' ')].filter(Boolean).join(', '),
                    client.ide_number ? `${t.ide} ${client.ide_number}` : null,
                    client.email,
                    client.phone,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </Text>
                <Text style={styles.small}>
                  {client.plan_name ?? '—'}
                  {client.approved_at ? ` · ${fill(t.accessSince, { date: formatDate(client.approved_at, locale) })}` : ''}
                </Text>
              </View>
              {me && (me.role === 'OWNER' || me.role === 'ADMIN') ? (
                <Pressable
                  onPress={() => {
                    if (confirmEnd) endMandate();
                    else setConfirmEnd(true);
                  }}
                >
                  <Text style={styles.linkDanger}>{confirmEnd ? t.endMandateConfirm : t.endMandate}</Text>
                </Pressable>
              ) : null}
            </View>

            <View style={styles.permRow}>
              <Text style={styles.label}>{t.permissions}</Text>
              {client.permissions.map((p) => (
                <View key={p} style={styles.permPill}>
                  <Text style={styles.permPillText}>{copy.permissions[p]}</Text>
                </View>
              ))}
            </View>

            <View style={[styles.tabs, !wide && styles.tabsMobile]}>
              {sections.map((sec) => (
                <Pressable key={sec} onPress={() => setSection(sec)} style={[styles.tab, section === sec && styles.tabActive]} accessibilityRole="tab" aria-selected={section === sec}>
                  <Text style={[styles.tabText, section === sec && styles.tabTextActive]}>{sectionLabel(sec)}</Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.layout}>
              <View style={{ flex: 1, gap: spacing.md, minWidth: 0 }}>
                {WITH_PERIOD.includes(section) ? (
                  <View style={styles.periodRow}>
                    <Text style={styles.label}>{t.period}</Text>
                    {(['month', 'quarter', 'year', 'lastYear'] as Period[]).map((p) => (
                      <Chip key={p} label={t.periods[p]} on={period === p} onPress={() => setPeriod(p)} />
                    ))}
                  </View>
                ) : null}
                {section === 'overview' ? (
                  <View style={{ gap: spacing.lg }}>
                    {can('VIEW_ACCOUNTING_DOCUMENTS') ? <KpiPanel org={client.organization_id} compact /> : null}
                    <InsightsPanel orgId={client.organization_id} onGo={(g) => setSection(g === 'invoices' && !can('VIEW_INVOICES') ? 'overview' : g)} />
                  </View>
                ) : section === 'work' && me ? (
                  <WorkSection me={me} client={{ org: client.organization_id }} embedded />
                ) : section === 'time' && me ? (
                  <TimeSection me={me} client={{ org: client.organization_id }} embedded />
                ) : section === 'approvals' && me ? (
                  <ApprovalsSection me={me} client={{ org: client.organization_id }} embedded />
                ) : section === 'proposals' ? (
                  <ProposalsPanel org={client.organization_id} allowed={can('PROPOSE_ENTRIES')} />
                ) : section === 'requests' ? (
                  <RequestsSection mandants={[]} orgId={client.organization_id} embedded />
                ) : section === 'deadlines' ? (
                  <DeadlinesAndProfile orgId={client.organization_id} />
                ) : section === 'notes' ? (
                  <NotesPanel orgId={client.organization_id} />
                ) : section === 'invoices' ? (
                  <Invoices orgId={client.organization_id} range={range} canDownload={can('DOWNLOAD_DOCUMENTS')} />
                ) : section === 'payments' ? (
                  <Payments orgId={client.organization_id} range={range} />
                ) : section === 'customers' ? (
                  <Customers orgId={client.organization_id} />
                ) : section === 'accounting' ? (
                  <View style={{ gap: spacing.lg }}>
                    {can('VIEW_EXPORTS') ? <ExportPanel org={client.organization_id} name={client.name} range={range} /> : null}
                    <Accounting orgId={client.organization_id} name={client.name} range={range} canExport={can('VIEW_EXPORTS')} />
                  </View>
                ) : section === 'documents' ? (
                  <Documents orgId={client.organization_id} canDownload={can('DOWNLOAD_DOCUMENTS')} />
                ) : section === 'quotes' ? (
                  <Quotes orgId={client.organization_id} range={range} />
                ) : section === 'hours' ? (
                  <Hours orgId={client.organization_id} range={range} />
                ) : section === 'payroll' ? (
                  <Payroll orgId={client.organization_id} range={range} />
                ) : (
                  <Integrations orgId={client.organization_id} />
                )}
              </View>
            </View>
          </>
        )}
      </View>
    </AccShell>
  );
}

// ---------------------------------------------------------------------------
// Sections

async function loadInvoices(orgId: string, range: { start: string; end: string }): Promise<InvoiceRow[]> {
  const { data } = await supabase
    .from('factures')
    .select('id, number, client_name, created_at, due_date, status, vat_rate, pdf_path, facture_items(quantity, unit_price), facture_payments(amount)')
    .eq('organization_id', orgId)
    .neq('status', 'draft')
    .gte('created_at', `${range.start}T00:00:00`)
    .lte('created_at', `${range.end}T23:59:59`)
    .order('created_at', { ascending: false })
    .limit(1000);
  return ((data ?? []) as any[]).map((f) => {
    const net = (f.facture_items ?? []).reduce((s: number, i: { quantity: number; unit_price: number }) => s + Number(i.quantity) * Number(i.unit_price), 0);
    const total = Math.round(net * (1 + Number(f.vat_rate || 0) / 100) * 100) / 100;
    const paid = (f.facture_payments ?? []).reduce((s: number, p: { amount: number }) => s + Number(p.amount), 0);
    return { id: f.id, number: f.number, client_name: f.client_name, created_at: f.created_at, due_date: f.due_date, status: f.status, vat_rate: f.vat_rate, pdf_path: f.pdf_path, total, paid };
  });
}

function useAsync<T>(fn: () => Promise<T>, deps: unknown[]): T | null {
  const [value, setValue] = useState<T | null>(null);
  useEffect(() => {
    let alive = true;
    setValue(null);
    fn().then((v) => alive && setValue(v));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return value;
}

function Summary({ orgId, range, can }: { orgId: string; range: { start: string; end: string }; can: (p: Permission) => boolean }) {
  const { copy } = useAccCopy();
  const t = copy.client.summary;
  const invoices = useAsync(() => (can('VIEW_INVOICES') ? loadInvoices(orgId, range) : Promise.resolve([] as InvoiceRow[])), [orgId, range.start, range.end]);
  const income = useAsync<IncomeStatement | null>(() => (can('VIEW_ACCOUNTING_DOCUMENTS') ? getIncomeStatement(orgId, range.start, range.end) : Promise.resolve(null)), [orgId, range.start, range.end]);
  if (!invoices) return <Text style={styles.muted}>{copy.common.loading}</Text>;
  const today = new Date().toISOString().slice(0, 10);
  const live = invoices.filter((i) => i.status !== 'cancelled');
  const billed = live.reduce((s, i) => s + i.total, 0);
  const collected = live.reduce((s, i) => s + i.paid, 0);
  const open = live.filter((i) => i.status !== 'paid').reduce((s, i) => s + Math.max(i.total - i.paid, 0), 0);
  const overdue = live.filter((i) => i.status !== 'paid' && i.due_date < today && i.total - i.paid > 0.004).reduce((s, i) => s + (i.total - i.paid), 0);
  return (
    <View style={styles.kpis}>
      {can('VIEW_INVOICES') ? (
        <>
          <Kpi label={t.revenue} value={formatChf(billed)} />
          {can('VIEW_PAYMENT_STATUS') ? <Kpi label={t.collected} value={formatChf(collected)} /> : null}
          <Kpi label={t.open} value={formatChf(open)} />
          <Kpi label={t.overdue} value={formatChf(overdue)} warn={overdue > 0} />
        </>
      ) : null}
      {income ? <Kpi label={t.result} value={formatChf(income.resultat)} /> : null}
    </View>
  );
}

function Kpi({ label, value, warn = false }: { label: string; value: string; warn?: boolean }) {
  return (
    <View style={styles.kpi}>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={[styles.kpiValue, warn && { color: colors.danger }]}>{value}</Text>
    </View>
  );
}

function Table({ head, rows, empty, numeric = [] }: { head: string[]; rows: (string | React.ReactNode)[][]; empty: string; numeric?: number[] }) {
  if (!rows.length) return <Text style={styles.muted}>{empty}</Text>;
  return (
    <View style={styles.tableScroll}>
      <View style={styles.table}>
        <View style={[styles.tr, styles.thRow]}>
          {head.map((h, i) => (
            <Text key={i} style={[styles.th, styles.cell, numeric.includes(i) && styles.num]}>
              {h}
            </Text>
          ))}
        </View>
        {rows.map((r, ri) => (
          <View key={ri} style={styles.tr}>
            {r.map((c, i) =>
              typeof c === 'string' ? (
                <Text key={i} style={[styles.td, styles.cell, numeric.includes(i) && styles.num]} numberOfLines={1}>
                  {c}
                </Text>
              ) : (
                <View key={i} style={styles.cell}>
                  {c}
                </View>
              ),
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

function DeadlinesAndProfile({ orgId }: { orgId: string }) {
  const [version, setVersion] = useState(0);
  return (
    <View style={{ gap: spacing.lg }}>
      <DeadlinesSection key={version} orgId={orgId} embedded />
      <ProfileForm orgId={orgId} onSaved={() => setVersion((v) => v + 1)} />
    </View>
  );
}

function Invoices({ orgId, range, canDownload }: { orgId: string; range: { start: string; end: string }; canDownload: boolean }) {
  const { copy, locale } = useAccCopy();
  const t = copy.client.invoices;
  const rows = useAsync(() => loadInvoices(orgId, range), [orgId, range.start, range.end]);
  if (!rows) return <Text style={styles.muted}>{copy.common.loading}</Text>;
  const statusLabel = (s: string) => (copy.client.invoiceStatuses as Record<string, string>)[s] ?? s;
  return (
    <Table
      head={[t.number, t.client, t.date, t.due, t.total, t.paid, t.status, canDownload ? t.pdf : '']}
      numeric={[4, 5]}
      empty={t.none}
      rows={rows.map((f) => [
        f.number ?? '—',
        f.client_name,
        formatDate(f.created_at, locale),
        formatDate(f.due_date, locale),
        formatChf(f.total),
        formatChf(f.paid),
        statusLabel(f.status),
        canDownload && f.pdf_path ? (
          <Pressable onPress={() => openDocument(f.pdf_path)}>
            <Feather name="download" size={15} color={colors.primary} />
          </Pressable>
        ) : (
          ''
        ),
      ])}
    />
  );
}

function Payments({ orgId, range }: { orgId: string; range: { start: string; end: string } }) {
  const { copy, locale } = useAccCopy();
  const t = copy.client.payments;
  const rows = useAsync(async () => {
    const { data } = await supabase
      .from('facture_payments')
      .select('id, amount, paid_at, factures!inner(number, client_name, organization_id)')
      .eq('factures.organization_id', orgId)
      .gte('paid_at', range.start)
      .lte('paid_at', range.end)
      .order('paid_at', { ascending: false })
      .limit(1000);
    return (data ?? []) as any[];
  }, [orgId, range.start, range.end]);
  if (!rows) return <Text style={styles.muted}>{copy.common.loading}</Text>;
  const total = rows.reduce((s, p) => s + Number(p.amount), 0);
  return (
    <View style={{ gap: spacing.sm }}>
      {rows.length ? <Text style={styles.body}>{formatChf(total)}</Text> : null}
      <Table
        head={[t.date, t.invoice, t.amount]}
        numeric={[2]}
        empty={t.none}
        rows={rows.map((p) => [formatDate(p.paid_at, locale), `${p.factures?.number ?? '—'} · ${p.factures?.client_name ?? ''}`, formatChf(p.amount)])}
      />
    </View>
  );
}

function Customers({ orgId }: { orgId: string }) {
  const { copy } = useAccCopy();
  const t = copy.client.customers;
  const rows = useAsync(async () => {
    const { data } = await supabase.from('clients').select('id, name, company_name, email, phone, address').eq('organization_id', orgId).order('name').limit(2000);
    return (data ?? []) as any[];
  }, [orgId]);
  if (!rows) return <Text style={styles.muted}>{copy.common.loading}</Text>;
  return (
    <Table
      head={[t.name, t.email, t.phone, t.address]}
      empty={t.none}
      rows={rows.map((c) => [c.company_name ? `${c.company_name} (${c.name})` : c.name, c.email ?? '—', c.phone ?? '—', (c.address ?? '—').replace(/\n/g, ', ')])}
    />
  );
}

function Accounting({ orgId, name, range, canExport }: { orgId: string; name: string; range: { start: string; end: string }; canExport: boolean }) {
  const { copy } = useAccCopy();
  const t = copy.client.accounting;
  const [busy, setBusy] = useState<string | null>(null);
  const data = useAsync(async () => {
    const yearStart = `${range.end.slice(0, 4)}-01-01`;
    const [income, balance, vat] = await Promise.all([
      getIncomeStatement(orgId, range.start, range.end),
      getBalanceSheet(orgId, yearStart, range.end),
      getVatReportByCode(orgId, range.start, range.end).catch(() => null),
    ]);
    return { income, balance, vat } as { income: IncomeStatement; balance: BalanceSheet; vat: VatLedgerReport | null };
  }, [orgId, range.start, range.end]);

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const period = `${range.start}_${range.end}`;

  const exportEntries = useCallback(async () => {
    setBusy('entries');
    const entries = await listEntries(orgId, { periodStart: range.start, periodEnd: range.end });
    await downloadTextFile(`${slug}-ecritures-${period}.csv`, entriesToCsv(entries));
    setBusy(null);
  }, [orgId, range, slug, period]);

  const exportTrial = useCallback(async () => {
    setBusy('trial');
    const rows = await getTrialBalance(orgId, range.start, range.end);
    const csv = ['Compte;Libellé;Solde ouverture;Débit;Crédit;Solde final', ...rows.map((r) => [r.code, `"${r.label.replace(/"/g, '""')}"`, r.openingBalance, r.debitMovements, r.creditMovements, r.closingBalance].join(';'))].join('\n');
    await downloadTextFile(`${slug}-balance-${period}.csv`, csv);
    setBusy(null);
  }, [orgId, range, slug, period]);

  const exportVat = useCallback(async () => {
    if (!data?.vat) return;
    setBusy('vat');
    const settings = await getVatSettings(orgId);
    await downloadTextFile(`${slug}-tva-${period}.csv`, vatWorksheetToCsv(data.vat, `${range.start} – ${range.end}`, settings));
    setBusy(null);
  }, [orgId, range, slug, period, data]);

  if (!data) return <Text style={styles.muted}>{copy.common.loading}</Text>;
  const { income, balance, vat } = data;
  const empty = income.produitLines.length === 0 && income.charges.length === 0 && balance.actifs.length === 0;

  return (
    <View style={{ gap: spacing.md }}>
      {canExport ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t.exports}</Text>
          <View style={styles.actions}>
            <Button title={t.exportEntries} icon="download" variant="secondary" onPress={exportEntries} loading={busy === 'entries'} />
            <Button title={t.exportTrial} icon="download" variant="secondary" onPress={exportTrial} loading={busy === 'trial'} />
            {vat ? <Button title={t.exportVat} icon="download" variant="secondary" onPress={exportVat} loading={busy === 'vat'} /> : null}
          </View>
        </View>
      ) : null}
      {empty ? <Text style={styles.muted}>{t.empty}</Text> : null}
      <View style={styles.twoCols}>
        <View style={[styles.card, styles.col]}>
          <Text style={styles.cardTitle}>{t.income}</Text>
          <Line label={t.revenue} value={income.produits} strong />
          {income.produitLines.slice(0, 12).map((l) => (
            <Line key={l.code} label={`${l.code} ${l.label}`} value={l.amount} />
          ))}
          <Line label={t.expenses} value={income.totalCharges} strong />
          {income.charges.slice(0, 16).map((l) => (
            <Line key={l.code} label={`${l.code} ${l.label}`} value={l.amount} />
          ))}
          <View style={styles.divider} />
          <Line label={t.result} value={income.resultat} strong />
        </View>
        <View style={[styles.card, styles.col]}>
          <Text style={styles.cardTitle}>{t.balance}</Text>
          <Line label={t.assets} value={balance.totalActifs} strong />
          {balance.actifs.slice(0, 14).map((l) => (
            <Line key={l.code} label={`${l.code} ${l.label}`} value={l.amount} />
          ))}
          <Line label={t.liabilities} value={balance.totalPassifs} strong />
          {balance.passifs.slice(0, 14).map((l) => (
            <Line key={l.code} label={`${l.code} ${l.label}`} value={l.amount} />
          ))}
        </View>
      </View>
      {vat && (vat.salesRows.length || vat.deductibleRows.length) ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t.vat}</Text>
          {vat.salesRows.map((r) => (
            <Line key={`s-${r.code}`} label={`${r.code} ${r.label} (${r.rate} %)`} value={r.amount} />
          ))}
          {vat.deductibleRows.map((r) => (
            <Line key={`d-${r.code}`} label={`${r.code} ${r.label} (${r.rate} %)`} value={-r.amount} />
          ))}
          <View style={styles.divider} />
          <Line label={t.vatDue} value={vat.roundedNetVatDue} strong />
        </View>
      ) : null}
    </View>
  );
}

function Line({ label, value, strong = false }: { label: string; value: number; strong?: boolean }) {
  return (
    <View style={styles.line}>
      <Text style={[styles.lineLabel, strong && styles.lineStrong]} numberOfLines={1}>
        {label}
      </Text>
      <Text style={[styles.lineValue, strong && styles.lineStrong]}>{formatChf(value)}</Text>
    </View>
  );
}

function Documents({ orgId, canDownload }: { orgId: string; canDownload: boolean }) {
  const { copy, locale } = useAccCopy();
  const rows = useAsync(async () => {
    const list = (await acc.documents({ org: orgId })).data ?? ([] as DocumentRow[]);
    // Documents the client sent: opening the list marks them as seen.
    if (list.some((r) => r.kind === 'shared'))
      void supabase.from('fiduciary_shared_documents').update({ seen_at: new Date().toISOString() }).eq('organization_id', orgId).is('seen_at', null);
    return list;
  }, [orgId]);
  if (!rows) return <Text style={styles.muted}>{copy.common.loading}</Text>;
  if (!rows.length) return <Text style={styles.muted}>{copy.documents.none}</Text>;
  return (
    <View style={{ gap: spacing.sm }}>
      {rows.map((r) => (
        <View key={`${r.kind}-${r.id}`} style={styles.docRow}>
          <Feather name={r.kind === 'invoice' ? 'file-text' : r.kind === 'shared' ? 'send' : 'paperclip'} size={16} color={colors.primary} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.body} numberOfLines={1}>
              {r.title}
            </Text>
            <Text style={styles.small}>
              {formatDate(r.doc_date, locale)}
              {r.amount_chf != null ? ` · ${formatChf(r.amount_chf)}` : ''}
            </Text>
          </View>
          {(canDownload || r.kind === 'shared') && r.file_path ? (
            <Pressable onPress={() => openDocument(r.file_path)} style={styles.dl}>
              <Feather name="download" size={15} color={colors.primary} />
              <Text style={styles.link}>{copy.documents.download}</Text>
            </Pressable>
          ) : !r.file_path ? (
            <Text style={styles.small}>{copy.documents.noFile}</Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}

function Quotes({ orgId, range }: { orgId: string; range: { start: string; end: string } }) {
  const { copy, locale } = useAccCopy();
  const t = copy.client.quotes;
  const rows = useAsync(async () => {
    const { data } = await supabase
      .from('devis')
      .select('id, number, client_name, created_at, status')
      .eq('organization_id', orgId)
      .gte('created_at', `${range.start}T00:00:00`)
      .lte('created_at', `${range.end}T23:59:59`)
      .order('created_at', { ascending: false })
      .limit(1000);
    return (data ?? []) as any[];
  }, [orgId, range.start, range.end]);
  if (!rows) return <Text style={styles.muted}>{copy.common.loading}</Text>;
  return <Table head={[t.number, t.client, t.date, t.status]} empty={t.none} rows={rows.map((d) => [d.number ?? '—', d.client_name, formatDate(d.created_at, locale), d.status])} />;
}

function Hours({ orgId, range }: { orgId: string; range: { start: string; end: string } }) {
  const { copy } = useAccCopy();
  const t = copy.client.hours;
  const rows = useAsync(async () => {
    const { data } = await supabase.from('payroll_time_entries').select('entry_date, hours').eq('organization_id', orgId).gte('entry_date', range.start).lte('entry_date', range.end).limit(10000);
    const byMonth = new Map<string, number>();
    for (const e of (data ?? []) as { entry_date: string; hours: number }[]) byMonth.set(e.entry_date.slice(0, 7), (byMonth.get(e.entry_date.slice(0, 7)) ?? 0) + Number(e.hours));
    return [...byMonth.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [orgId, range.start, range.end]);
  if (!rows) return <Text style={styles.muted}>{copy.common.loading}</Text>;
  const total = rows.reduce((s, [, h]) => s + h, 0);
  return (
    <Table
      head={[t.date, t.hours]}
      numeric={[1]}
      empty={t.none}
      rows={[...rows.map(([m, h]) => [m, h.toFixed(2)]), ...(rows.length ? [[t.total, total.toFixed(2)]] : [])]}
    />
  );
}

function Payroll({ orgId, range }: { orgId: string; range: { start: string; end: string } }) {
  const { copy } = useAccCopy();
  const t = copy.client.payroll;
  const rows = useAsync(async () => {
    const [ys, ye] = [Number(range.start.slice(0, 4)), Number(range.end.slice(0, 4))];
    const { data } = await supabase.from('payroll_slips').select('year, month, status, gross_chf, net_chf').eq('organization_id', orgId).gte('year', ys).lte('year', ye).neq('status', 'extournee').limit(5000);
    const inRange = ((data ?? []) as { year: number; month: number; status: string; gross_chf: number; net_chf: number }[]).filter((s) => {
      const key = `${s.year}-${String(s.month).padStart(2, '0')}`;
      return key >= range.start.slice(0, 7) && key <= range.end.slice(0, 7);
    });
    const byMonth = new Map<string, { gross: number; net: number; count: number; statuses: Set<string> }>();
    for (const s of inRange) {
      const key = `${s.year}-${String(s.month).padStart(2, '0')}`;
      const cur = byMonth.get(key) ?? { gross: 0, net: 0, count: 0, statuses: new Set<string>() };
      cur.gross += Number(s.gross_chf);
      cur.net += Number(s.net_chf);
      cur.count += 1;
      cur.statuses.add(s.status);
      byMonth.set(key, cur);
    }
    return [...byMonth.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [orgId, range.start, range.end]);
  if (!rows) return <Text style={styles.muted}>{copy.common.loading}</Text>;
  return (
    <Table
      head={[t.period, t.status, t.gross, t.net]}
      numeric={[2, 3]}
      empty={t.none}
      rows={rows.map(([m, v]) => [`${m} (${v.count})`, [...v.statuses].join(', '), formatChf(v.gross), formatChf(v.net)])}
    />
  );
}

function Integrations({ orgId }: { orgId: string }) {
  const { copy, locale } = useAccCopy();
  const t = copy.client.integrations;
  const row = useAsync(async () => {
    const { data } = await supabase.from('integrations').select('status, last_successful_sync_at, last_error, needs_reconnect').eq('organization_id', orgId).eq('provider', 'bexio').maybeSingle();
    return { data } as { data: { status: string; last_successful_sync_at: string | null; last_error: string | null; needs_reconnect: boolean } | null };
  }, [orgId]);
  if (!row) return <Text style={styles.muted}>{copy.common.loading}</Text>;
  const bexio = row.data;
  const connected = !!bexio && bexio.status === 'connected' && !bexio.needs_reconnect;
  return (
    <View style={{ gap: spacing.md }}>
      <View style={styles.card}>
        <View style={styles.lineHead}>
          <Text style={styles.cardTitle}>{t.bexio}</Text>
          <View style={[styles.badge, { backgroundColor: connected ? colors.successSoft : colors.surfaceAlt }]}>
            <Text style={[styles.badgeText, { color: connected ? colors.success : colors.textMuted }]}>{connected ? t.connected : t.notConnected}</Text>
          </View>
        </View>
        {bexio?.last_successful_sync_at ? <Text style={styles.small}>{fill(t.lastSync, { date: formatDate(bexio.last_successful_sync_at, locale) })}</Text> : null}
        {bexio?.last_error ? <Text style={styles.error}>{fill(t.error, { error: bexio.last_error.slice(0, 200) })}</Text> : null}
      </View>
      <Text style={styles.muted}>{t.others}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', gap: spacing.lg },
  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, borderBottomWidth: 1, borderBottomColor: colors.border },
  // Phones: one line that slides sideways (plain CSS overflow, not a nested
  // scroll view, which used to stretch over the whole screen).
  tabsMobile: { flexWrap: 'nowrap', overflowX: 'auto', scrollbarWidth: 'none' } as any,
  tab: { flexShrink: 0, paddingVertical: 10, paddingHorizontal: spacing.md, borderBottomWidth: 2, borderBottomColor: 'transparent', marginBottom: -1 },
  tabActive: { borderBottomColor: colors.primary },
  tabText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.textMuted },
  tabTextActive: { color: colors.text, fontWeight: '800' },
  tableScroll: { width: '100%', overflowX: 'auto' } as any,
  navLink: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' },
  backText: { fontSize: fontSize.sm, color: colors.textMuted, fontWeight: '600' },
  head: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md },
  h1: { ...displayType, fontSize: 32, lineHeight: 36, fontWeight: '800', color: colors.text },
  permRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.xs },
  permPill: { backgroundColor: colors.successSoft, borderRadius: 999, paddingVertical: 3, paddingHorizontal: 10 },
  permPillText: { fontSize: 11, fontWeight: '700', color: colors.success },
  layout: { gap: spacing.lg },
  periodRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.xs },
  kpis: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  kpi: { flexGrow: 1, flexBasis: 170, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg, gap: 4 },
  kpiLabel: { fontSize: fontSize.xs, color: colors.textMuted, fontWeight: '600' },
  kpiValue: { ...displayType, fontSize: 22, fontWeight: '800', color: colors.text },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.xl, gap: spacing.sm },
  cardTitle: { fontSize: fontSize.lg, fontWeight: '800', color: colors.text },
  twoCols: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  col: { flex: 1, minWidth: 280 },
  line: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  lineHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  lineLabel: { flex: 1, fontSize: fontSize.sm, color: colors.text },
  lineValue: { ...monoType, fontSize: 12, color: colors.text },
  lineStrong: { fontWeight: '800' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 4 },
  table: { minWidth: '100%', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, overflow: 'hidden' },
  tr: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.border },
  thRow: { backgroundColor: colors.surfaceAlt, borderTopWidth: 0 },
  cell: { flex: 1, minWidth: 110, paddingVertical: 10, paddingHorizontal: spacing.md },
  th: { fontSize: 11, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  td: { fontSize: fontSize.sm, color: colors.text },
  num: { textAlign: 'right', ...monoType, fontSize: 12 } as any,
  docRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md },
  dl: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  badge: { borderRadius: 999, paddingVertical: 3, paddingHorizontal: 10 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  label: { fontSize: fontSize.xs, color: colors.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginRight: 4 },
  body: { fontSize: fontSize.sm, lineHeight: 20, color: colors.text },
  small: { fontSize: 12, color: colors.textMuted },
  muted: { fontSize: fontSize.sm, lineHeight: 19, color: colors.textMuted },
  link: { fontSize: fontSize.sm, color: colors.primary, fontWeight: '700' },
  linkDanger: { fontSize: fontSize.sm, color: colors.danger, fontWeight: '600' },
  error: { fontSize: fontSize.sm, color: colors.danger },
});
