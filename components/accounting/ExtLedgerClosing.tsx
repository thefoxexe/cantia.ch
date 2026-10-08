import { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Button } from '../ui';
import { Panel } from './Workspace';
import { Empty, LinkButton, Message, Pill, Toggle, isoToSwiss, ps, todayIso } from './ProShared';
import { fill } from '../../lib/accounting/copy';
import { formatChf, type Me } from '../../lib/accounting/api';
import { useAccCopy } from '../../lib/accounting/locale';
import type { ExternalClient } from '../../lib/accounting/pro';
import { ledger, type FiscalYear, type Statements, type VatReturn, type VatSummary } from '../../lib/accounting/ledger';
import { deadlineKey, ech0217Report, extVatRows, vatSetup } from '../../lib/accounting/extVat';
import { useLedgerCopy } from '../../lib/accounting/ledgerCopy';
import { FIGURE_LABELS, buildAfcForm, periodsFor, type FormLine, type VatAdjustments, type VatPeriod } from '../../lib/vat/afcForm';
import { LABELS_DE, LABELS_IT } from '../../lib/vat/figureLabels';
import { buildEch0217Xml } from '../../lib/api/accounting';
import { downloadTextFile } from '../../lib/downloadFile';
import { monoType } from '../../lib/marketingTheme';
import { colors, fontSize, radius, spacing } from '../../lib/theme';

// The VAT returns and the annual closing of a client outside Cantia
// (supabase/migrations/20261009120000_fiduciary_ledger_closing_vat.sql).

const amountText = (n: number | null | undefined) => formatChf(n).replace('CHF ', '');
const slugOf = (name: string) => name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const dayBefore = (iso: string) => {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
};
const toNumber = (s: string | undefined) => {
  const n = Number(String(s ?? '').replace(/['’\s]/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
};

// ---------------------------------------------------------------------------
// VAT returns

type PeriodState = 'filed' | 'late' | 'due' | 'open' | 'future';

export function VatView({ client, isAdmin, onChanged }: { client: ExternalClient; isAdmin: boolean; onChanged: () => void }) {
  const l = useLedgerCopy();
  const t = l.vat;
  const { locale } = useAccCopy();
  const setup = vatSetup(client.vat_method);
  const today = todayIso();
  const [year, setYear] = useState(Number(today.slice(0, 4)));
  const [returns, setReturns] = useState<VatReturn[] | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const loadReturns = useCallback(() => {
    ledger.vatReturns(client.id).then(({ data }) => setReturns(data ?? []));
  }, [client.id]);
  useEffect(loadReturns, [loadReturns]);

  const periods = useMemo(() => (setup ? periodsFor(year, setup.periodicity) : []), [setup, year]);
  const filedFor = (p: VatPeriod) => (returns ?? []).find((r) => r.status === 'filed' && r.period_start === p.start) ?? null;
  const stateOf = (p: VatPeriod): PeriodState => (filedFor(p) ? 'filed' : today > p.due ? 'late' : today > p.end ? 'due' : today >= p.start ? 'open' : 'future');

  useEffect(() => {
    if (!periods.length || returns === null) return;
    if (selected && periods.some((p) => p.key === selected)) return;
    const pick = periods.find((p) => ['late', 'due'].includes(stateOf(p))) ?? periods.find((p) => stateOf(p) === 'open') ?? periods[periods.length - 1];
    setSelected(pick.key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periods, returns]);

  if (!setup) return <Empty icon="percent" text={t.notLiable} />;
  const period = periods.find((p) => p.key === selected) ?? null;
  const tone = (s: PeriodState) => (s === 'filed' ? 'success' : s === 'late' ? 'danger' : s === 'due' ? 'warning' : s === 'open' ? 'primary' : 'neutral');
  const labels = locale === 'de' ? LABELS_DE : locale === 'it' ? LABELS_IT : FIGURE_LABELS;

  return (
    <View style={{ gap: spacing.md }}>
      <Text style={ps.small}>{t.intro}</Text>
      <View style={[ps.actions, { justifyContent: 'space-between' }]}>
        <Text style={ps.bodyStrong}>{`${t.method[setup.method]} · ${t.periodicity[setup.periodicity]}`}</Text>
        <View style={ps.actions}>
          <Pressable onPress={() => setYear((y) => y - 1)} hitSlop={8} accessibilityLabel="-1">
            <Feather name="chevron-left" size={18} color={colors.text} />
          </Pressable>
          <Text style={[ps.bodyStrong, { minWidth: 48, textAlign: 'center' }]}>{year}</Text>
          <Pressable onPress={() => setYear((y) => y + 1)} hitSlop={8} accessibilityLabel="+1">
            <Feather name="chevron-right" size={18} color={colors.text} />
          </Pressable>
        </View>
      </View>
      <View style={st.periods}>
        {periods.map((p) => {
          const s = stateOf(p);
          const on = p.key === selected;
          return (
            <Pressable key={p.key} onPress={() => setSelected(p.key)} style={[st.period, on && st.periodOn]}>
              <Text style={[ps.bodyStrong, on && { color: colors.primaryDark }]}>{p.label}</Text>
              <Text style={ps.small}>{`${isoToSwiss(p.start)} – ${isoToSwiss(p.end)}`}</Text>
              <View style={ps.actions}>
                <Pill label={t.statuses[s]} tone={tone(s)} />
                {s !== 'filed' ? <Text style={ps.small}>{fill(t.dueOn, { date: isoToSwiss(p.due) })}</Text> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
      {period ? (
        <VatPeriodPanel
          key={period.key}
          client={client}
          period={period}
          method={setup.method}
          periodicity={setup.periodicity}
          filed={filedFor(period)}
          labels={labels}
          isAdmin={isAdmin}
          onFiled={() => {
            loadReturns();
            onChanged();
          }}
        />
      ) : null}
      {returns && returns.length ? (
        <Panel title={t.history}>
          {returns.map((r) => (
            <View key={r.id} style={st.historyRow}>
              <Text style={[ps.mono, { width: 170 }]}>{`${isoToSwiss(r.period_start)} – ${isoToSwiss(r.period_end)}`}</Text>
              <Pill label={r.status === 'filed' ? t.statuses.filed : t.cancelled} tone={r.status === 'filed' ? 'success' : 'neutral'} />
              <Text style={[ps.small, { flex: 1 }]} numberOfLines={1}>
                {fill(t.filed, { date: isoToSwiss(r.filed_at.slice(0, 10)), by: r.filed_by_name ? ` · ${r.filed_by_name}` : '' })}
                {r.entry_number ? ` · ${fill(t.entry, { n: r.entry_number })}` : ''}
              </Text>
              <Text style={st.amount}>{amountText(r.payable)}</Text>
            </View>
          ))}
        </Panel>
      ) : null}
    </View>
  );
}

function VatPeriodPanel({
  client,
  period,
  method,
  periodicity,
  filed,
  labels,
  isAdmin,
  onFiled,
}: {
  client: ExternalClient;
  period: VatPeriod;
  method: 'effective' | 'tdfn';
  periodicity: 'mensuelle' | 'trimestrielle' | 'semestrielle' | 'annuelle';
  filed: VatReturn | null;
  labels: Record<string, string>;
  isAdmin: boolean;
  onFiled: () => void;
}) {
  const l = useLedgerCopy();
  const t = l.vat;
  const [summary, setSummary] = useState<VatSummary | null>(null);
  const [drafts, setDrafts] = useState(0);
  const [adj, setAdj] = useState<Record<string, string>>(() =>
    filed ? Object.fromEntries(Object.entries(filed.adjustments ?? {}).map(([k, v]) => [k, String(v)])) : {},
  );
  const [fiveCents, setFiveCents] = useState(false);
  const [book, setBook] = useState(true);
  const [lock, setLock] = useState(false);
  const [confirm, setConfirm] = useState<'file' | 'cancel' | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  useEffect(() => {
    ledger.vat(client.id, period.start, period.end).then(({ data }) => setSummary(data));
    ledger.entries(client.id, { from: period.start, to: period.end, status: 'draft', limit: 1 }).then(({ data }) => setDrafts(data?.total ?? 0));
  }, [client.id, period.start, period.end]);

  const adjustments: VatAdjustments = useMemo(() => {
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(adj)) if (toNumber(v)) out[k] = toNumber(v);
    return out as VatAdjustments;
  }, [adj]);
  const built = useMemo(() => (summary ? extVatRows(summary) : null), [summary]);
  const form = useMemo(() => (built ? buildAfcForm(built.rows, method, adjustments, fiveCents) : null), [built, method, adjustments, fiveCents]);
  if (!summary || !built || !form) return <Text style={ps.muted}>…</Text>;

  const figures: Record<string, number> = {};
  for (const line of [...form.turnover, ...form.tax, ...form.other]) figures[line.figure] = Number(line.tax ?? line.amount ?? 0);
  const ended = todayIso() > period.end;
  const dueDiff = Math.abs(Number(summary.vat_due) - form.totalTax) > 0.05;
  const inputDiff = method === 'effective' && Math.abs(Number(summary.input_tax) - form.totalInputTax) > 0.05;
  const ide = (client.ide_number ?? '').trim();

  async function downloadXml() {
    try {
      const res = buildEch0217Xml(
        { name: client.name, ide_number: ide || null },
        period.start,
        period.endExclusive,
        `cantia-${client.id.slice(0, 8)}-${deadlineKey(period.key)}`,
        { vatLiable: true, vatMethod: 'effective', vatBasisDefault: 'invoiced', vatPeriodicity: periodicity, vatLiableSince: null, vatRounding: fiveCents ? 'cinq_centimes' : 'aucun', ideNumber: ide || null },
        ech0217Report(built!.rows),
      );
      await downloadTextFile(`${slugOf(client.name)}-tva-${deadlineKey(period.key)}.xml`, res.xml, 'application/xml');
      setMessage(res.warnings.length ? { text: res.warnings.join(' '), error: true } : null);
    } catch (e) {
      setMessage({ text: e instanceof Error ? e.message : String(e), error: true });
    }
  }

  async function downloadCsv() {
    const rows = [...form!.turnover, ...form!.tax, ...form!.other].map((x) =>
      [x.figure, `"${(labels[x.figure] ?? '').replace(/"/g, '""')}"`, x.turnover != null ? x.turnover.toFixed(2) : '', x.rate != null ? String(x.rate) : '', (x.tax ?? x.amount ?? 0).toFixed(2)].join(';'),
    );
    const head = [t.cols.figure, t.cols.label, t.cols.turnover, t.cols.rate, t.cols.tax].join(';');
    await downloadTextFile(`${slugOf(client.name)}-decompte-tva-${deadlineKey(period.key)}.csv`, '﻿' + [head, ...rows].join('\r\n') + '\r\n');
  }

  async function file() {
    setBusy(true);
    setMessage(null);
    const { data, error } = await ledger.fileVatReturn(
      client.id,
      { start: period.start, end: period.end, key: deadlineKey(period.key), method, figures, adjustments: adjustments as Record<string, number>, payable: form!.payableRounded },
      book,
      lock && isAdmin,
    );
    setBusy(false);
    setConfirm(null);
    if (error) return setMessage({ text: error, error: true });
    setMessage({ text: `${t.filedDone}${data?.entry_number ? ` ${fill(t.entry, { n: data.entry_number })}.` : ''}`, error: false });
    onFiled();
  }

  async function cancel() {
    if (!filed) return;
    setBusy(true);
    const { error } = await ledger.cancelVatReturn(filed.id);
    setBusy(false);
    setConfirm(null);
    if (error) return setMessage({ text: error, error: true });
    onFiled();
  }

  const section = (title: string, lines: FormLine[]) => (
    <View style={{ gap: 2 }}>
      <Text style={[ps.label, { marginTop: spacing.sm }]}>{title}</Text>
      {lines.map((x) => {
        const value = x.tax ?? x.amount ?? 0;
        const editable = x.editable && !filed;
        return (
          <View key={x.figure} style={[st.figRow, x.subtotal && st.figSubtotal]}>
            <Text style={st.figNo}>{x.figure}</Text>
            <Text style={[ps.small, { flex: 1, color: colors.text, fontWeight: x.subtotal ? '800' : '400' }]}>{labels[x.figure] ?? ''}</Text>
            {x.turnover != null ? <Text style={[st.num, { width: 110 }]}>{amountText(x.turnover)}</Text> : <View style={{ width: 110 }} />}
            <Text style={[st.num, { width: 56 }]}>{x.rate != null ? `${x.rate} %` : ''}</Text>
            {editable ? (
              <TextInput
                value={adj[x.editable!] ?? ''}
                onChangeText={(v) => setAdj((a) => ({ ...a, [x.editable!]: v }))}
                placeholder={x.editable!.startsWith('tdfnRate') && !x.editable!.endsWith('Turnover') ? '%' : '0.00'}
                placeholderTextColor={colors.textMuted}
                keyboardType="decimal-pad"
                accessibilityLabel={t.editable}
                style={[ps.input, st.figInput]}
              />
            ) : (
              <Text style={[st.num, { width: 120, fontWeight: x.subtotal ? '800' : '400' }]}>{amountText(value)}</Text>
            )}
          </View>
        );
      })}
    </View>
  );

  return (
    <View style={{ gap: spacing.md }}>
      <View style={st.twoCols}>
        <View style={[st.col, { flexBasis: 560, flexGrow: 2 }]}>
          <Panel title={`${period.label} ${period.start.slice(0, 4)}`}>
            <View style={[st.figRow, st.figHead]}>
              <Text style={st.figNo}>{t.cols.figure}</Text>
              <Text style={[ps.label, { flex: 1 }]}>{t.cols.label}</Text>
              <Text style={[ps.label, { width: 110, textAlign: 'right' }]}>{t.cols.turnover}</Text>
              <Text style={[ps.label, { width: 56, textAlign: 'right' }]}>{t.cols.rate}</Text>
              <Text style={[ps.label, { width: 120, textAlign: 'right' }]}>{t.cols.tax}</Text>
            </View>
            {section(t.sections.turnover, form.turnover)}
            {section(t.sections.tax, form.tax)}
            {section(t.sections.other, form.other)}
          </Panel>
        </View>
        <View style={st.col}>
          <View style={[st.payable, form.payable < 0 && { borderColor: colors.success }]}>
            <Text style={ps.label}>{form.payable >= 0 ? t.payable : t.credit}</Text>
            <Text style={st.payableValue}>{formatChf(Math.abs(form.payableRounded))}</Text>
            <Text style={ps.small}>{fill(t.dueOn, { date: isoToSwiss(period.due) })}</Text>
          </View>
          <Panel title={t.checks}>
            <Check ok={!dueDiff} text={fill(t.checkDue, { booked: formatChf(summary.vat_due), form: formatChf(form.totalTax) })} />
            {method === 'effective' ? <Check ok={!inputDiff} text={fill(t.checkInput, { booked: formatChf(summary.input_tax), form: formatChf(form.totalInputTax) })} /> : null}
            {drafts ? <Check ok={false} text={fill(t.checkDrafts, { n: drafts })} /> : null}
            {!ended ? <Check ok={false} warn text={t.checkNotEnded} /> : null}
            {method === 'effective' && !/CHE/i.test(ide) ? <Check ok={false} warn text={t.checkIde} /> : null}
            {built.unknown.length ? <Check ok={false} text={fill(t.unknown, { list: built.unknown.map((u) => `${u.code} (${amountText(u.net)})`).join(', ') })} /> : null}
            {form.warnings.map((w) => (
              <Check key={w} ok={false} text={w} />
            ))}
          </Panel>
          <Toggle value={fiveCents} onChange={setFiveCents} label={t.fiveCents} />
          <View style={ps.actions}>
            {method === 'effective' ? <Button title={t.xml} icon="download" variant="secondary" onPress={downloadXml} /> : null}
            <Button title={t.csv} icon="download" variant="secondary" onPress={downloadCsv} />
          </View>
          {method === 'effective' ? <Text style={ps.small}>{t.xmlHint}</Text> : null}
          {filed ? (
            <Panel tone="accent">
              <Text style={ps.bodyStrong}>
                {fill(t.filed, { date: isoToSwiss(filed.filed_at.slice(0, 10)), by: filed.filed_by_name ? ` · ${filed.filed_by_name}` : '' })}
                {filed.entry_number ? ` · ${fill(t.entry, { n: filed.entry_number })}` : ''}
              </Text>
              <LinkButton label={confirm === 'cancel' ? t.cancelConfirm : t.cancel} icon="rotate-ccw" tone={confirm === 'cancel' ? 'danger' : 'muted'} onPress={() => (confirm === 'cancel' ? cancel() : setConfirm('cancel'))} disabled={busy} />
            </Panel>
          ) : (
            <Panel tone="accent">
              <Toggle value={book} onChange={setBook} label={t.book} />
              {isAdmin ? <Toggle value={lock} onChange={setLock} label={t.lock} /> : null}
              <Button title={confirm === 'file' ? t.fileConfirm : t.file} icon="send" onPress={() => (confirm === 'file' ? file() : setConfirm('file'))} loading={busy} />
            </Panel>
          )}
          <Message value={message} />
        </View>
      </View>
    </View>
  );
}

function Check({ ok, text, warn = false }: { ok: boolean; text: string; warn?: boolean }) {
  return (
    <View style={st.check}>
      <Feather name={ok ? 'check-circle' : warn ? 'clock' : 'alert-triangle'} size={14} color={ok ? colors.success : warn ? colors.textMuted : colors.warning} style={{ marginTop: 2 }} />
      <Text style={[ps.small, { flex: 1, color: ok ? colors.text : warn ? colors.textMuted : colors.text }]}>{text}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Annual closing

export function ClosingView({ client, me, onChanged }: { client: ExternalClient; me: Me; onChanged: () => void }) {
  const l = useLedgerCopy();
  const t = l.closing;
  const { locale } = useAccCopy();
  const isAdmin = me.role === 'OWNER' || me.role === 'ADMIN';
  const [years, setYears] = useState<FiscalYear[] | null>(null);
  const [returns, setReturns] = useState<VatReturn[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const load = useCallback(() => {
    ledger.years(client.id).then(({ data }) => {
      const list = data ?? [];
      setYears(list);
      setOpen((o) => o ?? list.find((y) => y.finished && !y.closed)?.end ?? list[0]?.end ?? null);
    });
    ledger.vatReturns(client.id).then(({ data }) => setReturns(data ?? []));
  }, [client.id]);
  useEffect(load, [load]);

  if (!years) return <Text style={ps.muted}>…</Text>;
  if (!years.length) return <Empty icon="archive" text={t.empty} />;
  const label = (y: FiscalYear) => (y.start.slice(0, 4) === y.end.slice(0, 4) ? y.end.slice(0, 4) : `${y.start.slice(0, 4)}/${y.end.slice(2, 4)}`);

  return (
    <View style={{ gap: spacing.md }}>
      <Text style={ps.small}>{t.intro}</Text>
      {years.map((y, i) => (
        <YearCard
          key={y.end}
          client={client}
          me={me}
          year={y}
          label={label(y)}
          previous={years[i + 1] ?? null}
          returns={returns}
          open={open === y.end}
          locale={locale}
          onToggle={() => setOpen((o) => (o === y.end ? null : y.end))}
          onChanged={() => {
            load();
            onChanged();
          }}
          isAdmin={isAdmin}
        />
      ))}
      {!isAdmin ? <Text style={ps.small}>{t.adminOnly}</Text> : null}
    </View>
  );
}

function YearCard({
  client,
  me,
  year: y,
  label,
  previous,
  returns,
  open,
  locale,
  isAdmin,
  onToggle,
  onChanged,
}: {
  client: ExternalClient;
  me: Me;
  year: FiscalYear;
  label: string;
  previous: FiscalYear | null;
  returns: VatReturn[];
  open: boolean;
  locale: string;
  isAdmin: boolean;
  onToggle: () => void;
  onChanged: () => void;
}) {
  const l = useLedgerCopy();
  const t = l.closing;
  const [balances, setBalances] = useState<Record<string, number> | null>(null);
  const [carry, setCarry] = useState(true);
  const [lock, setLock] = useState(isAdmin);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  useEffect(() => {
    if (!open || y.closed || !y.finished) return;
    ledger.trialBalance(client.id, y.start, y.end).then(({ data }) => {
      const out: Record<string, number> = {};
      for (const r of data ?? []) if (['2200', '1170', '1171', '9100'].includes(r.code)) out[r.code] = Number(r.closing);
      setBalances(out);
    });
  }, [open, y.closed, y.finished, y.start, y.end, client.id]);

  const setup = vatSetup(client.vat_method);
  const vatPeriods = setup
    ? [...periodsFor(Number(y.start.slice(0, 4)), setup.periodicity), ...(y.start.slice(0, 4) !== y.end.slice(0, 4) ? periodsFor(Number(y.end.slice(0, 4)), setup.periodicity) : [])].filter((p) => p.start >= y.start && p.end <= y.end)
    : [];
  const vatFiled = vatPeriods.filter((p) => returns.some((r) => r.status === 'filed' && r.period_start === p.start)).length;
  const vatOpen = balances ? ['2200', '1170', '1171'].filter((c) => Math.abs(balances[c] ?? 0) >= 0.01) : [];
  const state = y.closed ? 'closed' : y.finished ? 'toClose' : 'running';

  async function close() {
    setBusy(true);
    setMessage(null);
    const { data, error } = await ledger.closeYear(client.id, y.end, carry, lock && isAdmin);
    setBusy(false);
    setConfirm(false);
    if (error) return setMessage({ text: error, error: true });
    setMessage({ text: fill(t.done, { amount: formatChf(data?.result ?? 0), n: data?.entry_number ?? '—' }), error: false });
    onChanged();
  }
  async function reopen() {
    setBusy(true);
    const { error } = await ledger.reopenYear(client.id, y.end);
    setBusy(false);
    setConfirm(false);
    if (error) return setMessage({ text: error, error: true });
    setMessage({ text: t.reopened, error: false });
    onChanged();
  }

  return (
    <View style={[st.year, open && st.yearOpen]}>
      <Pressable onPress={onToggle} style={st.yearHead}>
        <View style={{ flex: 1, minWidth: 180, gap: 2 }}>
          <Text style={ps.h2}>{fill(t.year, { label })}</Text>
          <Text style={ps.small}>
            {`${isoToSwiss(y.start)} – ${isoToSwiss(y.end)} · ${fill(t.entries, { n: y.entries })}`}
            {!y.finished ? ` · ${fill(t.notFinished, { date: isoToSwiss(y.end) })}` : ''}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 4 }}>
          <Text style={ps.label}>{t.result}</Text>
          <Text style={[st.result, { color: Number(y.result) < 0 ? colors.danger : colors.success }]}>{formatChf(y.result)}</Text>
        </View>
        <View style={{ gap: 4, alignItems: 'flex-end' }}>
          <Pill label={t[state]} tone={state === 'closed' ? 'success' : state === 'toClose' ? 'warning' : 'neutral'} />
          {y.locked ? <Pill label={t.locked} /> : null}
        </View>
        <Feather name={open ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textMuted} />
      </Pressable>
      {open ? (
        <View style={st.yearBody}>
          {y.closed ? (
            <>
              <Text style={ps.body}>
                {fill(t.closedOn, { date: isoToSwiss((y.closed_at ?? '').slice(0, 10)), by: y.closed_by_name ? ` · ${y.closed_by_name}` : '', n: y.closing_number ?? '—' })}
              </Text>
              <View style={ps.actions}>
                <Button title={t.accounts} icon="printer" variant="secondary" onPress={() => printAnnualAccounts(client, me.firm.name, y.end, locale, l)} />
                {isAdmin ? (
                  <LinkButton label={confirm ? t.reopenConfirm : t.reopen} icon="unlock" tone={confirm ? 'danger' : 'muted'} onPress={() => (confirm ? reopen() : setConfirm(true))} disabled={busy} />
                ) : null}
              </View>
            </>
          ) : y.finished ? (
            <>
              <Text style={ps.label}>{t.checks}</Text>
              <Check ok={!y.drafts} text={y.drafts ? fill(t.drafts, { n: y.drafts }) : t.noDrafts} />
              {setup && vatPeriods.length ? <Check ok={vatFiled === vatPeriods.length} text={fill(t.vatFiled, { n: vatFiled, total: vatPeriods.length })} /> : null}
              {balances ? (
                <>
                  <Check ok={!vatOpen.length} text={vatOpen.length ? fill(t.vatAccountsOpen, { date: isoToSwiss(y.end), list: vatOpen.map((c) => `${c} ${amountText(balances[c])}`).join(', ') }) : fill(t.vatAccounts, { date: isoToSwiss(y.end) })} />
                  <Check ok={Math.abs(balances['9100'] ?? 0) < 0.01} text={Math.abs(balances['9100'] ?? 0) < 0.01 ? t.opening : fill(t.openingOpen, { amount: formatChf(balances['9100']) })} />
                </>
              ) : null}
              {previous ? <Check ok={previous.closed} text={previous.closed ? t.previous : t.previousOpen} /> : null}
              <Toggle value={carry} onChange={setCarry} label={t.carry} />
              {isAdmin ? <Toggle value={lock} onChange={setLock} label={t.lock} /> : null}
              <View style={ps.actions}>
                <Button title={confirm ? t.closeConfirm : fill(t.close, { label })} icon="archive" onPress={() => (confirm ? close() : setConfirm(true))} loading={busy} disabled={!!y.drafts} />
                <Button title={t.accounts} icon="printer" variant="secondary" onPress={() => printAnnualAccounts(client, me.firm.name, y.end, locale, l)} />
              </View>
            </>
          ) : (
            <Button title={t.accounts} icon="printer" variant="secondary" onPress={() => printAnnualAccounts(client, me.firm.name, todayIso(), locale, l)} />
          )}
          <Message value={message} />
        </View>
      ) : null}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Annual accounts: balance sheet and income statement with the previous
// year, printed (or saved as PDF) from the browser.

type LedgerCopy = ReturnType<typeof useLedgerCopy>;

export async function printAnnualAccounts(client: ExternalClient, firmName: string, to: string, locale: string, l: LedgerCopy) {
  const { data: cur } = await ledger.statements(client.id, to);
  if (!cur) return;
  const { data: prev } = await ledger.statements(client.id, dayBefore(cur.fy_start));
  const html = annualAccountsHtml(client, firmName, cur, prev && (prev.assets.length || prev.income.length || prev.expenses.length) ? prev : null, locale, l);
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const w = window.open('', '_blank');
    if (w) {
      w.document.open();
      w.document.write(html);
      w.document.close();
      w.focus();
      setTimeout(() => w.print(), 400);
      return;
    }
  }
  await downloadTextFile(`${slugOf(client.name)}-comptes-annuels-${to}.html`, html, 'text/html');
}

function annualAccountsHtml(client: ExternalClient, firmName: string, cur: Statements, prev: Statements | null, locale: string, l: LedgerCopy): string {
  const t = l.reports;
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const fmt = (n: number | undefined | null) => (n == null ? '' : amountText(n));
  const sum = (list: { amount: number }[]) => list.reduce((s, x) => s + Number(x.amount), 0);
  const table = (rows: { code: string; label: string; amount: number }[], prevRows: { code: string; label: string; amount: number }[] | null) => {
    const codes = [...new Set([...rows.map((r) => r.code), ...(prevRows ?? []).map((r) => r.code)])].sort();
    return codes
      .map((c) => {
        const a = rows.find((r) => r.code === c);
        const b = prevRows?.find((r) => r.code === c);
        return `<tr><td class="code">${esc(c)}</td><td>${esc((a ?? b)!.label)}</td><td class="n">${fmt(a?.amount ?? 0)}</td>${prev ? `<td class="n p">${fmt(b?.amount ?? 0)}</td>` : ''}</tr>`;
      })
      .join('');
  };
  const total = (label: string, a: number, b: number | null, strong = true) =>
    `<tr class="${strong ? 'total' : 'sub'}"><td></td><td>${esc(label)}</td><td class="n">${fmt(a)}</td>${prev ? `<td class="n p">${fmt(b)}</td>` : ''}</tr>`;
  const head = (title: string) =>
    `<tr class="head"><th></th><th>${esc(title)}</th><th class="n">${isoToSwiss(cur.to)}</th>${prev ? `<th class="n p">${isoToSwiss(prev.to)}</th>` : ''}</tr>`;
  const liabTotal = (s: Statements) => sum(s.liabilities) + Number(s.year_result) + Number(s.prior_results);
  const resultLabel = Number(cur.result) >= 0 ? t.profit : t.loss;
  return `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"><title>${esc(t.annualTitle)} ${esc(client.name)} ${cur.to.slice(0, 4)}</title>
<style>
  @page { size: A4; margin: 18mm 16mm; }
  body { font-family: -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #231A12; font-size: 11pt; }
  h1 { font-size: 22pt; margin: 0 0 4px; } h2 { font-size: 14pt; margin: 28px 0 8px; border-bottom: 2px solid #A95C30; padding-bottom: 4px; }
  .meta { color: #6B5D50; font-size: 10pt; } table { width: 100%; border-collapse: collapse; }
  td, th { padding: 4px 6px; border-bottom: 1px solid #EEE4D6; text-align: left; } th { font-size: 9pt; color: #6B5D50; text-transform: uppercase; letter-spacing: .04em; }
  .n { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; } .p { color: #6B5D50; } .code { width: 52px; color: #6B5D50; }
  tr.total td { font-weight: 800; border-top: 2px solid #231A12; } tr.sub td { font-style: italic; }
  footer { margin-top: 36px; font-size: 9pt; color: #6B5D50; display: flex; justify-content: space-between; }
  .brk { page-break-before: always; }
</style></head><body>
<h1>${esc(t.annualTitle)} ${cur.to.slice(0, 4)}</h1>
<div class="meta"><strong>${esc(client.name)}</strong>${client.ide_number ? ` · ${esc(client.ide_number)}` : ''}${client.city ? ` · ${esc([client.postal_code, client.city].filter(Boolean).join(' '))}` : ''}<br>${esc(fill(t.period, { from: isoToSwiss(cur.fy_start), to: isoToSwiss(cur.to) }))}</div>
<h2>${esc(fill(t.balanceSheet, { date: isoToSwiss(cur.to) }))}</h2>
<table>${head(t.assets)}${table(cur.assets, prev?.assets ?? null)}${total(t.totalAssets, sum(cur.assets), prev ? sum(prev.assets) : null)}</table>
<table style="margin-top:14px">${head(t.liabilities)}${table(cur.liabilities, prev?.liabilities ?? null)}
${Number(cur.prior_results) || (prev && Number(prev.prior_results)) ? total(t.priorResults, Number(cur.prior_results), prev ? Number(prev.prior_results) : null, false) : ''}
${Number(cur.year_result) || (prev && Number(prev.year_result)) ? total(t.yearResult, Number(cur.year_result), prev ? Number(prev.year_result) : null, false) : ''}
${total(t.totalLiabilities, liabTotal(cur), prev ? liabTotal(prev) : null)}</table>
<h2 class="brk">${esc(fill(t.income, { from: isoToSwiss(cur.from), to: isoToSwiss(cur.to) }))}</h2>
<table>${head(t.revenue)}${table(cur.income, prev?.income ?? null)}${total(t.revenue, sum(cur.income), prev ? sum(prev.income) : null)}</table>
<table style="margin-top:14px">${head(t.expenses)}${table(cur.expenses, prev?.expenses ?? null)}${total(t.expenses, sum(cur.expenses), prev ? sum(prev.expenses) : null)}</table>
<table style="margin-top:14px">${total(resultLabel, Number(cur.result), prev ? Number(prev.result) : null)}</table>
<footer><span>${esc(fill(t.printedBy, { firm: firmName }))} · Cantia Accounting</span><span>${isoToSwiss(todayIso())}</span></footer>
</body></html>`;
}

const st = StyleSheet.create({
  periods: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  period: { flexBasis: 200, flexGrow: 1, gap: 4, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  periodOn: { borderColor: colors.primary, borderWidth: 1.5, backgroundColor: colors.primarySoft },
  twoCols: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, alignItems: 'flex-start' },
  col: { flexGrow: 1, flexBasis: 300, minWidth: 0, gap: spacing.md },
  figRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: colors.border },
  figHead: { borderBottomWidth: 2, borderBottomColor: colors.text },
  figSubtotal: { backgroundColor: colors.surfaceAlt },
  figNo: { ...monoType, fontSize: 12, fontWeight: '800', width: 40, color: colors.text } as any,
  figInput: { width: 120, textAlign: 'right', paddingVertical: 5 },
  num: { ...monoType, fontSize: 12, color: colors.text, textAlign: 'right' } as any,
  payable: { gap: 4, padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1.5, borderColor: colors.primary, backgroundColor: colors.surface },
  payableValue: { ...monoType, fontSize: 30, fontWeight: '800', color: colors.text } as any,
  check: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  historyRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 6, flexWrap: 'wrap', borderTopWidth: 1, borderTopColor: colors.border },
  amount: { ...monoType, fontSize: 13, fontWeight: '700', color: colors.text, minWidth: 90, textAlign: 'right' } as any,
  year: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg },
  yearOpen: { borderColor: colors.primary },
  yearHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, padding: spacing.lg, flexWrap: 'wrap' },
  yearBody: { gap: spacing.sm, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  result: { ...monoType, fontSize: 18, fontWeight: '800' } as any,
});
