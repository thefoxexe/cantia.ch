import { useCallback, useEffect, useMemo, useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { Feather } from '@expo/vector-icons';
import { Button } from '../ui';
import { SectionHeader } from './Shell';
import { Panel, Segmented, Stat } from './Workspace';
import { openDocument } from './Cockpit';
import { ClientPicker, Empty, Input, LinkButton, Message, Picks, Pill, Toggle, copyText, invalidateClientOptions, isoToSwiss, memberName, ps, todayIso, useClientOptions, useTeam } from './ProShared';
import { useAccCopy } from '../../lib/accounting/locale';
import { fill } from '../../lib/accounting/copy';
import { acc, formatChf, formatDate, type Firm, type Me } from '../../lib/accounting/api';
import { LEGAL_FORMS, VAT_METHODS } from '../../lib/accounting/workspace';
import { parseDayMonth, parseSwissDate, formatDayMonth, useWorkCopy } from '../../lib/accounting/workCopy';
import { formatBalances, formatEntries, type ExportFormat } from '../../lib/accounting/exports';
import {
  APPROVAL_KINDS,
  SOFTWARES,
  SOFTWARE_LABEL,
  clientAccounts,
  clientHref,
  derive,
  formatMinutes,
  loadPostedEntries,
  portalUrl,
  pro,
  ratios,
  refFromKey,
  sha256Hex,
  uploadApprovalFile,
  type Approval,
  type ApprovalKind,
  type ClientRef,
  type EntryProposal,
  type ExternalClient,
  type ExternalClientInput,
  type Kpis,
  type PortfolioRow,
  type ProposalLine,
} from '../../lib/accounting/pro';
import { useProCopy } from '../../lib/accounting/proCopy';
import { getTrialBalance } from '../../lib/api/accounting';
import { downloadTextFile } from '../../lib/downloadFile';
import { displayType, monoType } from '../../lib/marketingTheme';
import { colors, fontSize, radius, spacing } from '../../lib/theme';

const CANTONS = ['AG', 'AI', 'AR', 'BE', 'BL', 'BS', 'FR', 'GE', 'GL', 'GR', 'JU', 'LU', 'NE', 'NW', 'OW', 'SG', 'SH', 'SO', 'SZ', 'TG', 'TI', 'UR', 'VD', 'VS', 'ZG', 'ZH'];

// ---------------------------------------------------------------------------
// External clients: form, list (Mandants tab), portal link.

const EMPTY_EXT: Partial<ExternalClientInput> = {
  name: '',
  legal_form: 'sarl',
  software: 'banana',
  vat_method: 'effective_quarterly',
  has_payroll: false,
  fiscal_year_end: '12-31',
  tax_return_due: '03-31',
  locale: 'fr',
};

export function ExternalClientForm({ initial, id, onSaved, onCancel }: { initial?: Partial<ExternalClientInput>; id?: string | null; onSaved: (id: string) => void; onCancel?: () => void }) {
  const p = useProCopy();
  const t = p.ext;
  const w = useWorkCopy();
  const team = useTeam();
  const [v, setV] = useState<Partial<ExternalClientInput>>({ ...EMPTY_EXT, ...(initial ?? {}) });
  const [fye, setFye] = useState(formatDayMonth(v.fiscal_year_end ?? '12-31'));
  const [taxDue, setTaxDue] = useState(formatDayMonth(v.tax_return_due ?? '03-31'));
  const [rate, setRate] = useState(v.hourly_rate != null ? String(v.hourly_rate) : '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (patch: Partial<ExternalClientInput>) => setV((x) => ({ ...x, ...patch }));

  async function save() {
    const f = parseDayMonth(fye);
    const d = parseDayMonth(taxDue);
    if (!f || !d) return setError(w.profile.invalid);
    if (!v.name?.trim()) return;
    setBusy(true);
    setError(null);
    const { data, error: e } = await pro.saveExternalClient(id ?? null, { ...v, fiscal_year_end: f, tax_return_due: d, hourly_rate: rate.trim() ? Number(rate.replace(',', '.')) : null });
    setBusy(false);
    if (e || !data) return setError(e ?? '—');
    invalidateClientOptions();
    onSaved(data);
  }

  return (
    <View style={{ gap: spacing.md }}>
      <View style={ps.row}>
        <Input label={t.name} value={v.name ?? ''} onChangeText={(x) => set({ name: x })} maxLength={160} style={{ flexGrow: 2, flexBasis: 240 }} />
        <Input label={t.contact} value={v.contact_name ?? ''} onChangeText={(x) => set({ contact_name: x })} maxLength={120} style={{ flexGrow: 1, flexBasis: 180 }} />
      </View>
      <View style={ps.row}>
        <Input label={t.email} hint={t.emailHint} value={v.email ?? ''} onChangeText={(x) => set({ email: x })} keyboardType="email-address" autoCapitalize="none" style={{ flexGrow: 2, flexBasis: 240 }} />
        <Input label={t.phone} value={v.phone ?? ''} onChangeText={(x) => set({ phone: x })} style={{ flexGrow: 1, flexBasis: 160 }} />
      </View>
      <View style={ps.row}>
        <Input label={t.address} value={v.address ?? ''} onChangeText={(x) => set({ address: x })} style={{ flexGrow: 2, flexBasis: 220 }} />
        <Input label={t.postalCode} value={v.postal_code ?? ''} onChangeText={(x) => set({ postal_code: x })} style={{ width: 90 }} />
        <Input label={t.city} value={v.city ?? ''} onChangeText={(x) => set({ city: x })} style={{ flexGrow: 1, flexBasis: 140 }} />
        <Input label={t.ide} value={v.ide_number ?? ''} onChangeText={(x) => set({ ide_number: x })} placeholder="CHE-123.456.789" style={{ flexGrow: 1, flexBasis: 170 }} />
      </View>
      <Picks label={t.software} value={v.software ?? 'other'} onChange={(x) => set({ software: x })} options={SOFTWARES.filter((s) => s !== 'none').map((s) => ({ key: s, label: s === 'other' ? '…' : SOFTWARE_LABEL[s] }))} />
      <Picks label={w.profile.legalForm} value={v.legal_form ?? 'sarl'} onChange={(x) => set({ legal_form: x })} options={LEGAL_FORMS.map((f) => ({ key: f, label: w.profile.legalForms[f] }))} />
      <Picks label={w.profile.vat} value={v.vat_method ?? 'effective_quarterly'} onChange={(x) => set({ vat_method: x })} options={VAT_METHODS.map((m) => ({ key: m, label: w.profile.vatMethods[m] }))} />
      <View style={ps.row}>
        <Toggle value={!!v.has_payroll} onChange={(x) => set({ has_payroll: x })} label={w.profile.payroll} />
      </View>
      <View style={ps.row}>
        <Input label={w.profile.fiscalYearEnd} value={fye} onChangeText={setFye} placeholder="31.12" style={{ width: 200 }} />
        <Input label={w.profile.taxReturnDue} value={taxDue} onChangeText={setTaxDue} placeholder="31.03" style={{ width: 240 }} />
        <Input label={t.rate} hint={t.rateHint} value={rate} onChangeText={setRate} keyboardType="decimal-pad" style={{ width: 180 }} />
      </View>
      {team && team.members.length > 1 ? (
        <Picks label={w.profile.assigned} value={v.assigned_to ?? '__none'} onChange={(x) => set({ assigned_to: x === '__none' ? null : x })} options={[{ key: '__none', label: p.common.nobody }, ...team.members.map((m) => ({ key: m.user_id, label: memberName(m) }))]} />
      ) : null}
      <Picks label={t.language} value={v.locale ?? 'fr'} onChange={(x) => set({ locale: x })} options={[{ key: 'fr', label: 'Français' }, { key: 'de', label: 'Deutsch' }, { key: 'it', label: 'Italiano' }]} />
      {error ? <Text style={ps.error}>{error}</Text> : null}
      <View style={ps.actions}>
        <Button title={p.common.save} icon="check" onPress={save} loading={busy} disabled={!v.name?.trim()} />
        {onCancel ? <LinkButton label={p.common.cancel} tone="muted" onPress={onCancel} /> : null}
      </View>
    </View>
  );
}

export function ExternalClientsPanel() {
  const p = useProCopy();
  const t = p.ext;
  const router = useRouter();
  const [rows, setRows] = useState<ExternalClient[] | null>(null);
  const [adding, setAdding] = useState(false);
  const [archived, setArchived] = useState(false);
  const load = useCallback(() => {
    pro.externalClients(archived).then(({ data }) => setRows(data ?? []));
  }, [archived]);
  useEffect(load, [load]);

  return (
    <Panel
      title={t.sectionTitle}
      right={
        <View style={ps.actions}>
          <Toggle value={archived} onChange={setArchived} label={t.archived} />
          <Button title={t.add} icon="plus" variant="secondary" onPress={() => setAdding((x) => !x)} />
        </View>
      }
    >
      {adding ? (
        <View style={[ps.card, ps.cardAccent]}>
          <Text style={ps.h2}>{t.addTitle}</Text>
          <Text style={ps.small}>{t.addText}</Text>
          <ExternalClientForm onSaved={(id) => router.push(`/mandant?ext=${id}` as any)} onCancel={() => setAdding(false)} />
        </View>
      ) : null}
      {rows === null ? <Text style={ps.muted}>{p.common.loading}</Text> : rows.length === 0 && !adding ? <Empty icon="briefcase" text={t.sectionEmpty} /> : null}
      {(rows ?? []).map((c, i) => (
        <Pressable key={c.id} onPress={() => router.push(`/mandant?ext=${c.id}` as any)} style={({ hovered }: any) => [cs.row, i > 0 && cs.rowBorder, hovered && { backgroundColor: colors.bg }]}>
          <View style={cs.avatar}>
            <Text style={cs.avatarText}>{c.name.slice(0, 1).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={ps.bodyStrong} numberOfLines={1}>
              {c.name}
              {c.status === 'ARCHIVED' ? ` · ${t.archived}` : ''}
            </Text>
            <Text style={ps.small} numberOfLines={1}>
              {[SOFTWARE_LABEL[c.software], c.contact_name, c.city, c.assigned_name].filter((x) => x && x !== '—').join(' · ')}
            </Text>
          </View>
          <View style={cs.badges}>
            {c.requests_answered ? <Pill label={`${c.requests_answered} ✓`} tone="success" /> : null}
            {c.requests_open || c.work_open || c.approvals_pending ? (
              <Pill label={fill(p.portfolio.pending, { requests: c.requests_open ?? 0, work: c.work_open ?? 0, sign: c.approvals_pending ?? 0 })} tone="warning" />
            ) : null}
            {c.unbilled_minutes ? <Pill label={`${formatMinutes(c.unbilled_minutes)} h`} /> : null}
          </View>
          <Feather name="chevron-right" size={16} color={colors.textMuted} />
        </Pressable>
      ))}
    </Panel>
  );
}

export function PortalLinkPanel({ client, onChanged, isAdmin }: { client: ExternalClient; onChanged: () => void; isAdmin: boolean }) {
  const p = useProCopy();
  const t = p.ext;
  const [copied, setCopied] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const url = portalUrl(client.portal_token);
  return (
    <Panel title={t.portalTitle}>
      <Text style={ps.small}>{t.portalText}</Text>
      <View style={cs.linkBox}>
        <Feather name="lock" size={14} color={colors.success} />
        <Text style={[ps.mono, { flex: 1 }]} numberOfLines={1} selectable>
          {url}
        </Text>
        <Button
          title={copied ? p.common.copied : p.common.copy}
          icon={copied ? 'check' : 'copy'}
          variant="secondary"
          onPress={async () => {
            if (await copyText(url)) {
              setCopied(true);
              setTimeout(() => setCopied(false), 2500);
            }
          }}
        />
      </View>
      {!client.email ? <Text style={[ps.small, { color: colors.warning }]}>{p.approvals.noEmail}</Text> : null}
      <Message value={message} />
      <View style={ps.actions}>
        <LinkButton
          label={confirm ? t.newLinkConfirm : t.newLink}
          icon="refresh-cw"
          tone={confirm ? 'danger' : 'muted'}
          onPress={async () => {
            if (!confirm) return setConfirm(true);
            setConfirm(false);
            const { error } = await pro.externalAction(client.id, 'new_link');
            setMessage(error ? { text: error, error: true } : { text: t.newLinkDone, error: false });
            onChanged();
          }}
        />
      </View>
    </Panel>
  );
}

// ---------------------------------------------------------------------------
// Indicators of a Cantia client.

export function KpiPanel({ org, compact = false }: { org: string; compact?: boolean }) {
  const p = useProCopy();
  const t = p.kpis;
  const { locale } = useAccCopy();
  const w = useWorkCopy();
  const [k, setK] = useState<Kpis | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    pro.kpis(org).then(({ data, error: e }) => {
      setK(data ?? null);
      setError(e);
    });
  }, [org]);
  if (k === undefined) return <Text style={ps.muted}>{p.common.loading}</Text>;
  if (!k) return error ? <Text style={ps.muted}>{t.noAccess}</Text> : null;
  const cur = derive(k.current);
  const prev = derive(k.previous);
  const r = ratios(k);
  const hasData = Number(k.current.lines ?? 0) > 0 || Number(k.balance.total_assets) !== 0;
  if (!hasData) return <Text style={ps.muted}>{t.none}</Text>;
  const vs = (a: number, b: number) => (b ? fill(t.vsPrev, { value: formatChf(b) }) : undefined);
  const months = k.monthly;
  const max = Math.max(1, ...months.map((m) => Math.abs(Number(m.revenue))), ...months.map((m) => Math.abs(Number(m.result))));

  return (
    <View style={{ gap: spacing.md }}>
      <Text style={ps.small}>{fill(t.from, { date: formatDate(k.period.to, locale) })}</Text>
      <View style={cs.stats}>
        <Stat label={t.revenue} value={formatChf(cur.revenue)} hint={vs(cur.revenue, prev.revenue)} />
        <Stat label={t.gross} value={formatChf(cur.gross)} hint={cur.grossPct != null ? fill(t.margin, { pct: cur.grossPct }) : undefined} />
        <Stat label={t.ebitda} value={formatChf(cur.ebitda)} hint={cur.ebitdaPct != null ? fill(t.margin, { pct: cur.ebitdaPct }) : undefined} tone={cur.ebitda < 0 ? 'danger' : undefined} />
        <Stat label={t.ebit} value={formatChf(cur.ebit)} hint={cur.ebitPct != null ? fill(t.margin, { pct: cur.ebitPct }) : undefined} tone={cur.ebit < 0 ? 'danger' : undefined} />
        <Stat label={t.result} value={formatChf(cur.result)} hint={vs(cur.result, prev.result)} tone={cur.result < 0 ? 'danger' : 'success'} />
      </View>
      <View style={cs.stats}>
        <Stat label={t.liquid} value={formatChf(k.balance.liquid)} tone={Number(k.balance.liquid) < 0 ? 'danger' : undefined} />
        <Stat label={t.receivables} value={formatChf(k.balance.receivables)} hint={r.dso != null ? `${t.dso} ${fill(t.days, { n: r.dso })}` : undefined} />
        <Stat label={t.quick} value={r.quick != null ? `${Math.round(r.quick * 100)} %` : '—'} tone={r.quick != null && r.quick < 1 ? 'warning' : r.quick != null ? 'success' : undefined} />
        <Stat label={t.current} value={r.current != null ? `${Math.round(r.current * 100)} %` : '—'} tone={r.current != null && r.current < 1.5 ? 'warning' : undefined} />
        <Stat label={t.equityRatio} value={r.equityPct != null ? `${r.equityPct} %` : '—'} hint={`${t.equity} ${formatChf(r.equity)}`} tone={r.equityPct != null && r.equityPct < 30 ? 'warning' : undefined} />
      </View>
      {!compact ? (
        <Panel title={t.chart}>
          <View style={cs.chart}>
            {months.map((m) => {
              const rev = Number(m.revenue);
              const res = Number(m.result);
              return (
                <View key={m.month} style={cs.barCol}>
                  <View style={cs.barArea}>
                    <View style={[cs.bar, { height: Math.max(1, Math.round((Math.abs(rev) / max) * 110)), backgroundColor: colors.primary }]} />
                    <View style={[cs.bar, { height: Math.max(1, Math.round((Math.abs(res) / max) * 110)), backgroundColor: res < 0 ? colors.danger : colors.success }]} />
                  </View>
                  <Text style={cs.barLabel}>{w.deadlines.monthsShort[Number(m.month.slice(5, 7)) - 1]}</Text>
                </View>
              );
            })}
          </View>
          <View style={ps.actions}>
            <View style={cs.legend}>
              <View style={[cs.legendDot, { backgroundColor: colors.primary }]} />
              <Text style={ps.small}>{t.revenue}</Text>
            </View>
            <View style={cs.legend}>
              <View style={[cs.legendDot, { backgroundColor: colors.success }]} />
              <Text style={ps.small}>{t.result}</Text>
            </View>
          </View>
        </Panel>
      ) : null}
      <Text style={ps.small}>{t.hint}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Portfolio (Mandants tab): every client with its figures.

export function PortfolioPanel() {
  const p = useProCopy();
  const t = p.portfolio;
  const router = useRouter();
  const [rows, setRows] = useState<PortfolioRow[] | null>(null);
  useEffect(() => {
    pro.portfolio().then(({ data }) => setRows(data ?? []));
  }, []);
  if (!rows) return <Text style={ps.muted}>{p.common.loading}</Text>;
  const cell = (k: Kpis | null, f: (k: Kpis) => string) => (k && (Number(k.current.lines ?? 0) > 0 || Number(k.balance.total_assets) !== 0) ? f(k) : '—');
  return (
    <View style={{ gap: spacing.sm }}>
      <Text style={ps.small}>{t.text}</Text>
      <View style={cs.tableScroll}>
        <View style={cs.table}>
          <View style={[cs.tr, cs.thRow]}>
            <Text style={[cs.th, { flex: 2.2 }]}>{t.columns.client}</Text>
            <Text style={[cs.th, { flex: 1 }]}>{t.columns.software}</Text>
            <Text style={[cs.th, cs.num, { flex: 1.3 }]}>{t.columns.revenue}</Text>
            <Text style={[cs.th, cs.num, { flex: 1.3 }]}>{t.columns.ebit}</Text>
            <Text style={[cs.th, cs.num, { flex: 1.3 }]}>{t.columns.liquid}</Text>
            <Text style={[cs.th, cs.num, { flex: 0.9 }]}>{t.columns.quick}</Text>
            <Text style={[cs.th, { flex: 1.6 }]}>{t.columns.open}</Text>
            <Text style={[cs.th, cs.num, { flex: 0.9 }]}>{t.columns.time}</Text>
          </View>
          {rows.map((r) => {
            const d = r.kpis ? derive(r.kpis.current) : null;
            const q = r.kpis ? ratios(r.kpis).quick : null;
            return (
              <Pressable key={r.organization_id ?? r.external_client_id} onPress={() => router.push(clientHref(r) as any)} style={({ hovered }: any) => [cs.tr, hovered && { backgroundColor: colors.bg }]}>
                <View style={{ flex: 2.2, minWidth: 0 }}>
                  <Text style={[cs.td, { fontWeight: '700' }]} numberOfLines={1}>
                    {r.name}
                  </Text>
                  {r.assigned_name ? <Text style={ps.small}>{r.assigned_name}</Text> : null}
                </View>
                <View style={{ flex: 1 }}>
                  <Pill label={SOFTWARE_LABEL[r.software] ?? '—'} tone={r.kind === 'cantia' ? 'primary' : 'neutral'} />
                </View>
                <Text style={[cs.td, cs.num, { flex: 1.3 }]}>{cell(r.kpis, () => formatChf(d!.revenue))}</Text>
                <Text style={[cs.td, cs.num, { flex: 1.3 }, d && d.ebit < 0 ? { color: colors.danger } : null]}>{cell(r.kpis, () => formatChf(d!.ebit))}</Text>
                <Text style={[cs.td, cs.num, { flex: 1.3 }]}>{cell(r.kpis, (k) => formatChf(k.balance.liquid))}</Text>
                <Text style={[cs.td, cs.num, { flex: 0.9 }, q != null && q < 1 ? { color: colors.warning } : null]}>{q != null ? `${Math.round(q * 100)} %` : '—'}</Text>
                <Text style={[cs.td, { flex: 1.6 }]} numberOfLines={1}>
                  {r.requests_open || r.work_open || r.approvals_pending ? fill(t.pending, { requests: r.requests_open, work: r.work_open, sign: r.approvals_pending }) : '—'}
                </Text>
                <Text style={[cs.td, cs.num, { flex: 0.9 }]}>{r.unbilled_minutes ? formatMinutes(r.unbilled_minutes) : '—'}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Exports to Abacus / Banana / Winbiz.

export function ExportPanel({ org, name, range }: { org: string; name: string; range: { start: string; end: string } }) {
  const p = useProCopy();
  const t = p.exports;
  const [format, setFormat] = useState<ExportFormat>('banana');
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const slug = name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  async function entries() {
    setBusy('entries');
    setMessage(null);
    try {
      const rows = await loadPostedEntries(org, range.start, range.end);
      if (!rows.length) return setMessage({ text: t.none, error: true });
      const out = formatEntries(format, rows);
      await downloadTextFile(`${slug}-${format}-${range.start}_${range.end}.${out.extension}`, out.content);
      setMessage({ text: fill(t.done, { count: rows.length }), error: false });
    } catch (e) {
      setMessage({ text: e instanceof Error ? e.message : String(e), error: true });
    } finally {
      setBusy(null);
    }
  }

  async function balances() {
    setBusy('balances');
    setMessage(null);
    const rows = await getTrialBalance(org, '1900-01-01', nextDay(range.end));
    const content = formatBalances(
      format,
      rows.filter((r) => r.type === 'actif' || r.type === 'passif').map((r) => ({ code: r.code, label: r.label, balance: r.closingBalance })),
      range.end,
    );
    await downloadTextFile(`${slug}-${format}-soldes-${range.end}.${format === 'banana' ? 'txt' : 'csv'}`, content);
    setBusy(null);
  }

  return (
    <Panel title={t.title}>
      <Text style={ps.small}>{t.text}</Text>
      <Segmented
        value={format}
        onChange={setFormat}
        options={[
          { key: 'banana', label: 'Banana' },
          { key: 'abacus', label: 'Abacus' },
          { key: 'winbiz', label: 'Winbiz' },
        ]}
      />
      <Text style={ps.small}>{t.help[format]}</Text>
      <View style={ps.actions}>
        <Button title={t.entries} icon="download" onPress={entries} loading={busy === 'entries'} />
        <Button title={t.balances} icon="download" variant="secondary" onPress={balances} loading={busy === 'balances'} />
      </View>
      <Message value={message} />
    </Panel>
  );
}

function nextDay(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Entry proposals (Cantia clients).

export function ProposalsPanel({ org, allowed }: { org: string; allowed: boolean }) {
  const p = useProCopy();
  const t = p.proposals;
  const { locale } = useAccCopy();
  const [rows, setRows] = useState<EntryProposal[] | null>(null);
  const [composing, setComposing] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const load = useCallback(() => {
    pro.proposals(org).then(({ data }) => setRows(data ?? []));
  }, [org]);
  useEffect(load, [load]);

  return (
    <View style={{ gap: spacing.md }}>
      <Text style={ps.small}>{t.text}</Text>
      {!allowed ? (
        <View style={cs.notice}>
          <Feather name="lock" size={14} color={colors.textMuted} />
          <Text style={[ps.small, { flex: 1 }]}>{t.notAllowed}</Text>
        </View>
      ) : (
        <View style={ps.actions}>
          <Button title={t.new} icon="plus" onPress={() => setComposing((x) => !x)} />
        </View>
      )}
      {composing && allowed ? (
        <ProposalForm
          org={org}
          onCancel={() => setComposing(false)}
          onSent={() => {
            setComposing(false);
            setMessage({ text: t.sent, error: false });
            load();
          }}
        />
      ) : null}
      <Message value={message} />
      {rows && rows.length === 0 ? <Text style={ps.muted}>{t.empty}</Text> : null}
      {(rows ?? []).map((r) => (
        <View key={r.id} style={ps.card}>
          <View style={cs.headRow}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={ps.bodyStrong}>{r.label}</Text>
              <Text style={ps.small}>
                {[formatDate(r.entry_date, locale), r.created_by_name ? fill(p.common.by, { name: r.created_by_name }) : null].filter(Boolean).join(' · ')}
              </Text>
            </View>
            <Pill
              label={`${t.statuses[r.status]}${r.status === 'accepted' ? ` · ${r.posted ? t.posted : t.draft}` : ''}`}
              tone={r.status === 'accepted' ? 'success' : r.status === 'rejected' ? 'danger' : 'warning'}
            />
          </View>
          {r.reason ? <Text style={ps.body}>{r.reason}</Text> : null}
          <View style={cs.lines}>
            {r.lines.map((l, i) => (
              <View key={i} style={cs.lineRow}>
                <Text style={[ps.mono, { width: 56 }]}>{l.account_code}</Text>
                <Text style={[ps.small, { flex: 1 }]} numberOfLines={1}>
                  {l.label ?? ''}
                </Text>
                <Text style={[ps.mono, { width: 100, textAlign: 'right' }]}>{Number(l.debit) ? formatChf(l.debit) : ''}</Text>
                <Text style={[ps.mono, { width: 100, textAlign: 'right' }]}>{Number(l.credit) ? formatChf(l.credit) : ''}</Text>
              </View>
            ))}
          </View>
          {r.rejection_reason ? <Text style={[ps.small, { color: colors.danger }]}>{fill(p.approvals.reason, { reason: r.rejection_reason })}</Text> : null}
          {r.status === 'pending' ? <LinkButton label={t.withdraw} tone="muted" onPress={() => pro.cancelProposal(r.id).then(load)} /> : null}
        </View>
      ))}
    </View>
  );
}

function ProposalForm({ org, onCancel, onSent }: { org: string; onCancel: () => void; onSent: () => void }) {
  const p = useProCopy();
  const t = p.proposals;
  const [accounts, setAccounts] = useState<{ code: string; label: string }[]>([]);
  const [date, setDate] = useState(isoToSwiss(todayIso()));
  const [label, setLabel] = useState('');
  const [reason, setReason] = useState('');
  const [lines, setLines] = useState<{ account: string; label: string; debit: string; credit: string }[]>([
    { account: '', label: '', debit: '', credit: '' },
    { account: '', label: '', debit: '', credit: '' },
  ]);
  const [focus, setFocus] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    clientAccounts(org).then(setAccounts);
  }, [org]);

  const num = (s: string) => Math.round(Number(s.replace(/'/g, '').replace(',', '.') || 0) * 100) / 100;
  const debit = lines.reduce((s, l) => s + num(l.debit), 0);
  const credit = lines.reduce((s, l) => s + num(l.credit), 0);
  const diff = Math.round((debit - credit) * 100) / 100;
  const setLine = (i: number, patch: Partial<(typeof lines)[number]>) => setLines((x) => x.map((l, j) => (j === i ? { ...l, ...patch } : l)));
  const accountLabel = (code: string) => accounts.find((a) => a.code === code)?.label;

  async function send() {
    const iso = parseSwissDate(date);
    if (!iso) return setError(p.common.invalidDate);
    const payload: ProposalLine[] = lines
      .filter((l) => l.account.trim() && (num(l.debit) || num(l.credit)))
      .map((l) => ({ account_code: l.account.trim(), debit: num(l.debit), credit: num(l.credit), label: l.label.trim() || null }));
    setBusy(true);
    setError(null);
    const { error: e } = await pro.createProposal(org, iso, label.trim(), reason.trim(), payload);
    setBusy(false);
    if (e) setError(e);
    else onSent();
  }

  return (
    <Panel title={t.new} tone="accent">
      <View style={ps.row}>
        <Input label={t.date} value={date} onChangeText={setDate} style={{ width: 150 }} />
        <Input label={t.label} value={label} onChangeText={setLabel} placeholder={t.labelPlaceholder} maxLength={200} style={{ flexGrow: 1, flexBasis: 260 }} />
      </View>
      <Input label={t.reason} value={reason} onChangeText={setReason} multiline maxLength={1000} />
      <View style={{ gap: 6 }}>
        {lines.map((l, i) => {
          const matches = focus === i && l.account.trim() && !accountLabel(l.account.trim())
            ? accounts.filter((a) => a.code.startsWith(l.account.trim()) || a.label.toLowerCase().includes(l.account.trim().toLowerCase())).slice(0, 6)
            : [];
          return (
            <View key={i} style={{ gap: 4 }}>
              <View style={cs.lineEdit}>
                <View style={{ width: 120 }}>
                  <TextInput value={l.account} onFocus={() => setFocus(i)} onChangeText={(x) => setLine(i, { account: x })} placeholder={t.accountPlaceholder} placeholderTextColor={colors.textMuted} style={ps.input} />
                </View>
                <Text style={[ps.small, { width: 140 }]} numberOfLines={1}>
                  {accountLabel(l.account.trim()) ?? ''}
                </Text>
                <TextInput value={l.label} onChangeText={(x) => setLine(i, { label: x })} placeholder={t.lineLabel} placeholderTextColor={colors.textMuted} style={[ps.input, { flex: 1, minWidth: 120 }]} />
                <TextInput value={l.debit} onChangeText={(x) => setLine(i, { debit: x, credit: x ? '' : l.credit })} placeholder={t.debit} placeholderTextColor={colors.textMuted} keyboardType="decimal-pad" style={[ps.input, { width: 110, textAlign: 'right' }]} />
                <TextInput value={l.credit} onChangeText={(x) => setLine(i, { credit: x, debit: x ? '' : l.debit })} placeholder={t.credit} placeholderTextColor={colors.textMuted} keyboardType="decimal-pad" style={[ps.input, { width: 110, textAlign: 'right' }]} />
                {lines.length > 2 ? (
                  <Pressable onPress={() => setLines((x) => x.filter((_, j) => j !== i))} hitSlop={6}>
                    <Feather name="x" size={15} color={colors.textMuted} />
                  </Pressable>
                ) : null}
              </View>
              {matches.length ? (
                <View style={ps.pickList}>
                  {matches.map((a) => (
                    <Pressable key={a.code} onPress={() => (setLine(i, { account: a.code }), setFocus(null))} style={ps.pick}>
                      <Text style={ps.pickText}>
                        {a.code} {a.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}
            </View>
          );
        })}
      </View>
      <View style={[ps.actions, { justifyContent: 'space-between' }]}>
        <LinkButton label={t.addLine} icon="plus" onPress={() => setLines((x) => [...x, { account: '', label: '', debit: '', credit: '' }])} />
        <Text style={[ps.bodyStrong, { color: diff === 0 && debit > 0 ? colors.success : colors.danger }]}>{diff === 0 && debit > 0 ? `${t.balanced} · ${formatChf(debit)}` : fill(t.balance, { amount: formatChf(diff) })}</Text>
      </View>
      {error ? <Text style={ps.error}>{error}</Text> : null}
      <View style={ps.actions}>
        <Button title={t.send} icon="send" onPress={send} loading={busy} disabled={diff !== 0 || debit <= 0 || label.trim().length < 2} />
        <LinkButton label={p.common.cancel} tone="muted" onPress={onCancel} />
      </View>
    </Panel>
  );
}

// ---------------------------------------------------------------------------
// Approvals: documents to validate and sign.

export function ApprovalsSection({ me, client, embedded = false }: { me: Me; client?: ClientRef; embedded?: boolean }) {
  const p = useProCopy();
  const t = p.approvals;
  const { locale } = useAccCopy();
  const router = useRouter();
  const [rows, setRows] = useState<Approval[] | null>(null);
  const [composing, setComposing] = useState(false);
  const [filter, setFilter] = useState<'pending' | 'done' | 'all'>('pending');
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const load = useCallback(() => {
    pro.approvals(client ?? {}).then(({ data, error }) => {
      if (error) setMessage({ text: error, error: true });
      setRows(data ?? []);
    });
  }, [client?.org, client?.ext]);
  useEffect(load, [load]);

  async function act(id: string, action: 'remind' | 'cancel') {
    const { error } = await pro.approvalAction(id, action);
    setMessage(error ? { text: error, error: true } : action === 'remind' ? { text: t.reminded, error: false } : null);
    load();
  }

  const list = (rows ?? []).filter((r) => (filter === 'pending' ? r.status === 'pending' : filter === 'done' ? r.status !== 'pending' : true));
  const head = <Button title={t.new} icon="edit-3" onPress={() => setComposing((x) => !x)} />;

  return (
    <View style={{ gap: spacing.lg }}>
      {embedded ? <View style={ps.actions}>{head}</View> : <SectionHeader eyebrow={me.firm.name} title={t.title} text={t.text} right={head} />}
      {composing ? (
        <ApprovalForm
          me={me}
          fixed={client}
          onCancel={() => setComposing(false)}
          onSent={() => {
            setComposing(false);
            setMessage({ text: t.sent, error: false });
            load();
          }}
        />
      ) : null}
      <Segmented
        value={filter}
        onChange={setFilter}
        options={[
          { key: 'pending', label: t.statuses.pending, count: (rows ?? []).filter((r) => r.status === 'pending').length },
          { key: 'done', label: `${t.statuses.approved} / ${t.statuses.rejected}` },
          { key: 'all', label: p.common.all },
        ]}
      />
      <Message value={message} />
      {rows === null ? <Text style={ps.muted}>{p.common.loading}</Text> : list.length === 0 ? <Text style={ps.muted}>{t.empty}</Text> : null}
      {list.map((a) => (
        <View key={a.id} style={[ps.card, a.status === 'approved' && { borderColor: colors.success }]}>
          <View style={cs.headRow}>
            <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
              {!client ? (
                <Pressable onPress={() => router.push(clientHref(a, 'approvals') as any)}>
                  <Text style={cs.clientName}>{a.client_name}</Text>
                </Pressable>
              ) : null}
              <Text style={ps.bodyStrong}>{a.title}</Text>
              <Text style={ps.small}>
                {[t.kinds[a.kind], formatDate(a.created_at, locale), a.created_by_name, a.due_date ? `${p.common.due} ${formatDate(a.due_date, locale)}` : null].filter(Boolean).join(' · ')}
              </Text>
            </View>
            <Pill label={t.statuses[a.status]} tone={a.status === 'approved' ? 'success' : a.status === 'rejected' ? 'danger' : 'warning'} />
          </View>
          {a.message ? <Text style={ps.body}>{a.message}</Text> : null}
          {a.file_path ? <LinkButton label={a.file_name ?? t.open} icon="file-text" onPress={() => openDocument(a.file_path)} /> : null}
          {a.status === 'approved' ? (
            <View style={cs.proof}>
              <Text style={ps.bodyStrong}>{fill(t.signedBy, { name: a.signer_name ?? '—', date: a.decided_at ? new Date(a.decided_at).toLocaleString(`${locale}-CH`) : '—' })}</Text>
              {a.signature_data ? <Image source={{ uri: a.signature_data }} style={cs.signature} resizeMode="contain" /> : null}
              {a.file_sha256 ? <Text style={ps.small}>{`${t.fingerprint} : ${a.file_sha256}`}</Text> : null}
              {a.decided_ip ? <Text style={ps.small}>{`${t.ip} : ${a.decided_ip}`}</Text> : null}
            </View>
          ) : null}
          {a.status === 'rejected' ? (
            <View style={cs.proof}>
              <Text style={[ps.bodyStrong, { color: colors.danger }]}>{fill(t.rejectedBy, { name: a.signer_name || '—', date: a.decided_at ? formatDate(a.decided_at, locale) : '—' })}</Text>
              {a.rejection_reason ? <Text style={ps.body}>{fill(t.reason, { reason: a.rejection_reason })}</Text> : null}
            </View>
          ) : null}
          {a.status === 'pending' ? (
            <View style={ps.actions}>
              <LinkButton label={t.remind} icon="bell" onPress={() => act(a.id, 'remind')} />
              <LinkButton label={t.cancelDoc} tone="muted" onPress={() => act(a.id, 'cancel')} />
            </View>
          ) : null}
        </View>
      ))}
    </View>
  );
}

function ApprovalForm({ me, fixed, onCancel, onSent }: { me: Me; fixed?: ClientRef; onCancel: () => void; onSent: () => void }) {
  const p = useProCopy();
  const t = p.approvals;
  const options = useClientOptions();
  const [clientKey, setClientKey] = useState<string | null>(null);
  const [kind, setKind] = useState<ApprovalKind>('annual_accounts');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [due, setDue] = useState('');
  const [file, setFile] = useState<{ name: string; data: ArrayBuffer; type: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pick() {
    const res = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'image/*'], copyToCacheDirectory: true });
    if (res.canceled || !res.assets?.length) return;
    const a = res.assets[0];
    const data = await fetch(a.uri).then((r) => r.arrayBuffer());
    if (data.byteLength > 20 * 1024 * 1024) return setError(p.portal.tooBig);
    setFile({ name: a.name ?? 'document.pdf', data, type: a.mimeType ?? 'application/pdf' });
    if (!title.trim()) setTitle((a.name ?? '').replace(/\.[a-z0-9]+$/i, ''));
  }

  async function send() {
    const ref = fixed ?? (clientKey ? refFromKey(clientKey) : null);
    if (!ref || title.trim().length < 2) return;
    const dueIso = parseSwissDate(due);
    if (dueIso === undefined) return setError(p.common.invalidDate);
    setBusy(true);
    setError(null);
    let path: string | null = null;
    let sha: string | null = null;
    if (file) {
      sha = await sha256Hex(file.data);
      const up = await uploadApprovalFile(me.firm.id, file);
      if (up.error) {
        setBusy(false);
        return setError(up.error);
      }
      path = up.path;
    }
    const { error: e } = await pro.createApproval(ref, { kind, title: title.trim(), message: message.trim(), filePath: path, fileName: file?.name ?? null, sha256: sha, due: dueIso });
    setBusy(false);
    if (e) setError(e);
    else onSent();
  }

  return (
    <Panel title={t.new} tone="accent">
      {!fixed ? <ClientPicker value={clientKey} onChange={setClientKey} options={options} /> : null}
      <Picks label={t.kind} value={kind} onChange={setKind} options={APPROVAL_KINDS.map((k) => ({ key: k, label: t.kinds[k] }))} />
      <View style={ps.row}>
        <Input label={t.docTitle} value={title} onChangeText={setTitle} placeholder={t.titlePlaceholder} maxLength={160} style={{ flexGrow: 1, flexBasis: 260 }} />
        <Input label={p.common.due} value={due} onChangeText={setDue} placeholder={p.common.datePlaceholder} style={{ width: 150 }} />
      </View>
      <Input label={t.message} value={message} onChangeText={setMessage} multiline maxLength={2000} />
      <View style={{ gap: 6 }}>
        <Text style={ps.label}>{t.file}</Text>
        <View style={ps.actions}>
          <Button title={file ? file.name : t.pickFile} icon={file ? 'file-text' : 'upload'} variant="secondary" onPress={pick} />
          {file ? <LinkButton label={p.common.remove} tone="muted" onPress={() => setFile(null)} /> : null}
        </View>
      </View>
      {error ? <Text style={ps.error}>{error}</Text> : null}
      <View style={ps.actions}>
        <Button title={t.send} icon="send" onPress={send} loading={busy} disabled={(!fixed && !clientKey) || title.trim().length < 2} />
        <LinkButton label={p.common.cancel} tone="muted" onPress={onCancel} />
      </View>
    </Panel>
  );
}

// ---------------------------------------------------------------------------
// Brand, default rate and directory (Fiduciaire settings).

async function imageToDataUrl(uri: string): Promise<string | null> {
  if (Platform.OS !== 'web') return null;
  try {
    const blob = await fetch(uri).then((r) => r.blob());
    const bmp = await createImageBitmap(blob);
    const scale = Math.min(1, 480 / bmp.width, 180 / bmp.height);
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bmp.width * scale));
    canvas.height = Math.max(1, Math.round(bmp.height * scale));
    canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const url = canvas.toDataURL('image/png');
    return url.length <= 400000 ? url : canvas.toDataURL('image/jpeg', 0.85);
  } catch {
    return null;
  }
}

type FirmPro = Firm & {
  logo_data?: string | null;
  brand_color?: string | null;
  default_hourly_rate?: number | null;
  public_directory_visible?: boolean;
  public_description?: string | null;
  public_services?: string[];
  public_languages?: string[];
  public_cantons?: string[];
  public_email?: string | null;
  accepts_new_clients?: boolean;
};

export function BrandSettings({ firm, onSaved }: { firm: Firm; onSaved: () => void }) {
  const p = useProCopy();
  const t = p.brand;
  const f = firm as FirmPro;
  const [logo, setLogo] = useState<string | null>(f.logo_data ?? null);
  const [color, setColor] = useState(f.brand_color ?? '#A95C30');
  const [rate, setRate] = useState(f.default_hourly_rate != null ? String(f.default_hourly_rate) : '');
  const [visible, setVisible] = useState(!!f.public_directory_visible);
  const [description, setDescription] = useState(f.public_description ?? '');
  const [services, setServices] = useState((f.public_services ?? []).join(', '));
  const [languages, setLanguages] = useState<string[]>(f.public_languages?.length ? f.public_languages : [f.locale]);
  const [cantons, setCantons] = useState<string[]>(f.public_cantons ?? []);
  const [email, setEmail] = useState(f.public_email ?? '');
  const [accepts, setAccepts] = useState(f.accepts_new_clients ?? true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const validColor = /^#[0-9A-Fa-f]{6}$/.test(color);

  async function pickLogo() {
    const res = await DocumentPicker.getDocumentAsync({ type: ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'], copyToCacheDirectory: true });
    if (res.canceled || !res.assets?.length) return;
    const url = await imageToDataUrl(res.assets[0].uri);
    if (url) setLogo(url);
  }

  async function save() {
    setBusy(true);
    setMessage(null);
    const n = rate.trim() ? Number(rate.replace(',', '.')) : null;
    const { error } = await pro.updateFirmProfile({
      logo_data: logo,
      brand_color: validColor ? color : null,
      default_hourly_rate: n != null && n >= 0 && n <= 2000 ? n : null,
      directory_visible: visible,
      description: description.trim() || null,
      services: services.split(',').map((x) => x.trim()).filter(Boolean),
      languages,
      cantons,
      public_email: email.trim() || null,
      accepts_new_clients: accepts,
    });
    setBusy(false);
    setMessage(error ? { text: error, error: true } : { text: p.common.saved, error: false });
    if (!error) onSaved();
  }

  const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  return (
    <View style={[ps.card, { gap: spacing.md }]}>
      <Text style={ps.h2}>{t.title}</Text>
      <Text style={ps.small}>{t.text}</Text>
      <View style={ps.row}>
        <View style={{ gap: 6 }}>
          <Text style={ps.label}>{t.logo}</Text>
          <View style={[cs.logoBox, { borderColor: validColor ? color : colors.border }]}>
            {logo ? <Image source={{ uri: logo }} style={{ width: 160, height: 60 }} resizeMode="contain" /> : <Text style={cs.logoInitial}>{firm.name.slice(0, 1)}</Text>}
          </View>
          <View style={ps.actions}>
            <LinkButton label={t.pickLogo} icon="image" onPress={pickLogo} />
            {logo ? <LinkButton label={t.removeLogo} tone="muted" onPress={() => setLogo(null)} /> : null}
          </View>
        </View>
        <View style={{ gap: 6 }}>
          <Text style={ps.label}>{t.color}</Text>
          <View style={ps.actions}>
            <View style={[cs.swatch, { backgroundColor: validColor ? color : colors.surfaceAlt }]} />
            <TextInput value={color} onChangeText={setColor} style={[ps.input, { width: 110 }]} maxLength={7} autoCapitalize="none" />
          </View>
          <View style={ps.pickList}>
            {['#A95C30', '#1F6F5C', '#1E4E8C', '#5B3E96', '#B23A48', '#2B2B2B'].map((c) => (
              <Pressable key={c} onPress={() => setColor(c)} style={[cs.swatchSmall, { backgroundColor: c }, color === c && { borderColor: colors.text, borderWidth: 2 }]} />
            ))}
          </View>
        </View>
        <Input label={p.time.defaultRate} value={rate} onChangeText={setRate} keyboardType="decimal-pad" style={{ width: 220 }} />
      </View>
      <View style={ps.divider} />
      <Toggle value={visible} onChange={setVisible} label={t.directory} />
      <Text style={ps.small}>{t.directoryHint}</Text>
      {visible ? (
        <View style={{ gap: spacing.md }}>
          <Input label={t.description} value={description} onChangeText={setDescription} multiline maxLength={600} />
          <Input label={t.services} hint={t.servicesHint} value={services} onChangeText={setServices} />
          <View style={{ gap: 6 }}>
            <Text style={ps.label}>{t.languages}</Text>
            <View style={ps.pickList}>
              {[
                ['fr', 'Français'],
                ['de', 'Deutsch'],
                ['it', 'Italiano'],
                ['en', 'English'],
              ].map(([k, l]) => (
                <Pressable key={k} onPress={() => setLanguages((x) => toggle(x, k))} style={[ps.pick, languages.includes(k) && ps.pickOn]}>
                  <Text style={[ps.pickText, languages.includes(k) && ps.pickTextOn]}>{l}</Text>
                </Pressable>
              ))}
            </View>
          </View>
          <View style={{ gap: 6 }}>
            <Text style={ps.label}>{t.cantons}</Text>
            <View style={ps.pickList}>
              {CANTONS.map((k) => (
                <Pressable key={k} onPress={() => setCantons((x) => toggle(x, k))} style={[ps.pick, { paddingHorizontal: 9 }, cantons.includes(k) && ps.pickOn]}>
                  <Text style={[ps.pickText, cantons.includes(k) && ps.pickTextOn]}>{k}</Text>
                </Pressable>
              ))}
            </View>
          </View>
          <Input label={t.publicEmail} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" style={{ maxWidth: 360 }} />
          <Toggle value={accepts} onChange={setAccepts} label={t.accepts} />
        </View>
      ) : null}
      <Message value={message} />
      <View style={ps.actions}>
        <Button title={p.common.save} icon="check" onPress={save} loading={busy} />
      </View>
    </View>
  );
}

const cs = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 10, paddingHorizontal: 4 },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  avatar: { width: 34, height: 34, borderRadius: radius.md, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: '800', color: colors.textMuted },
  badges: { flexDirection: 'row', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' },
  linkBox: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, paddingLeft: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg, flexWrap: 'wrap' },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 140, paddingTop: spacing.sm },
  barCol: { flex: 1, alignItems: 'center', gap: 4 },
  barArea: { flexDirection: 'row', alignItems: 'flex-end', gap: 2, height: 112 },
  bar: { width: 8, borderTopLeftRadius: 3, borderTopRightRadius: 3 },
  barLabel: { fontSize: 10, color: colors.textMuted },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 3 },
  tableScroll: { width: '100%', overflowX: 'auto' } as any,
  table: { minWidth: 900, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, overflow: 'hidden' },
  tr: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 10, paddingHorizontal: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  thRow: { backgroundColor: colors.surfaceAlt, borderTopWidth: 0 },
  th: { fontSize: 11, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.4 },
  td: { fontSize: fontSize.sm, color: colors.text },
  num: { textAlign: 'right', ...monoType, fontSize: 12 } as any,
  notice: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start', padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.surfaceAlt },
  headRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  lines: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.sm },
  lineRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 6 },
  lineEdit: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  clientName: { fontSize: 12, fontWeight: '800', color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.4 },
  proof: { gap: 4, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.bg },
  signature: { width: 220, height: 80, backgroundColor: '#fff', borderRadius: radius.sm },
  logoBox: { width: 200, height: 84, borderRadius: radius.md, borderWidth: 2, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  logoInitial: { ...displayType, fontSize: 32, fontWeight: '800', color: colors.textMuted },
  swatch: { width: 34, height: 34, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  swatchSmall: { width: 22, height: 22, borderRadius: 11, borderWidth: 1, borderColor: colors.border },
});

export { CANTONS };
