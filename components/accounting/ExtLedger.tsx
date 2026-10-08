import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Feather } from '@expo/vector-icons';
import { Button } from '../ui';
import { Panel, Segmented } from './Workspace';
import { KpiPanel } from './ProClients';
import { ClosingView, VatView, printAnnualAccounts } from './ExtLedgerClosing';
import { Empty, Input, LinkButton, Message, Picks, Pill, Toggle, isoToSwiss, ps, todayIso } from './ProShared';
import { fill } from '../../lib/accounting/copy';
import { useAccCopy } from '../../lib/accounting/locale';
import { formatChf, type Me } from '../../lib/accounting/api';
import { parseSwissDate } from '../../lib/accounting/workCopy';
import { formatBalances, formatEntries, type ExportFormat } from '../../lib/accounting/exports';
import type { ExternalClient } from '../../lib/accounting/pro';
import {
  ledger,
  ledgerRange,
  loadExtPostedEntries,
  type AccountLedger,
  type LedgerAccount,
  type LedgerEntry,
  type LedgerPeriod,
  type Statements,
  type TrialRow,
  type VatSummary,
} from '../../lib/accounting/ledger';
import {
  VAT_CODES,
  nextReference,
  openingEntry,
  parseAmount,
  parseChart,
  parseJournal,
  parseOpening,
  quickLines,
  splitDelimited,
  type AccountType,
  type LedgerEntryInput,
  type LedgerLine,
} from '../../lib/accounting/ledgerImport';
import { useLedgerCopy } from '../../lib/accounting/ledgerCopy';
import { useProCopy } from '../../lib/accounting/proCopy';
import { downloadTextFile } from '../../lib/downloadFile';
import { monoType } from '../../lib/marketingTheme';
import { colors, fontSize, radius, spacing } from '../../lib/theme';

// The books of a client outside Cantia, kept by the firm
// (supabase/migrations/20261009090000_fiduciary_ledger.sql): journal with
// quick entry and Swiss VAT, chart of accounts and general ledger, trial
// balance, balance sheet, income statement, VAT summary, indicators,
// imports from the client's old software, period locking.

type LedgerView = 'journal' | 'accounts' | 'reports' | 'vat' | 'closing' | 'kpis' | 'import' | 'settings';
const VIEWS: LedgerView[] = ['journal', 'accounts', 'reports', 'vat', 'closing', 'kpis', 'import', 'settings'];
const PERIODS: LedgerPeriod[] = ['month', 'quarter', 'fy', 'lastFy', 'all'];

const amountText = (n: number | null | undefined) => formatChf(n).replace('CHF ', '');
const slugOf = (name: string) => name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const csvCell = (v: string | number | null | undefined) => {
  const s = v == null ? '' : String(v);
  return /[;"\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const num = (s: string) => parseAmount(s) ?? 0;

export function ExtLedger({ me, client, onChanged }: { me: Me; client: ExternalClient; onChanged: () => void }) {
  const l = useLedgerCopy();
  const [view, setView] = useState<LedgerView>('journal');
  const [period, setPeriod] = useState<LedgerPeriod>('fy');
  const [accounts, setAccounts] = useState<LedgerAccount[] | null>(null);
  const [ledgerFor, setLedgerFor] = useState<string | null>(null);
  const range = useMemo(() => ledgerRange(period, client.fiscal_year_end), [period, client.fiscal_year_end]);
  const isAdmin = me.role === 'OWNER' || me.role === 'ADMIN';

  const loadAccounts = useCallback(() => {
    ledger.accounts(client.id).then(({ data }) => setAccounts(data ?? []));
  }, [client.id]);
  useEffect(() => {
    if (client.ledger_started_at) loadAccounts();
  }, [client.ledger_started_at, loadAccounts]);

  if (!client.ledger_started_at) return <LedgerStart ext={client.id} onStarted={onChanged} />;

  const showPeriod = view === 'journal' || view === 'reports' || (view === 'accounts' && ledgerFor);
  return (
    <View style={{ gap: spacing.md }}>
      <Segmented value={view} onChange={(v) => (setView(v), setLedgerFor(null))} options={VIEWS.map((v) => ({ key: v, label: l.views[v] }))} />
      {showPeriod ? (
        <View style={st.periodRow}>
          <View style={st.shrink}>
            <Segmented value={period} onChange={setPeriod} options={PERIODS.map((p) => ({ key: p, label: l.periods[p] }))} />
          </View>
          {period !== 'all' ? <Text style={ps.small}>{`${isoToSwiss(range.start)} – ${isoToSwiss(range.end)}`}</Text> : null}
        </View>
      ) : null}
      {client.ledger_locked_until && (view === 'journal' || view === 'import' || view === 'vat') ? (
        <View style={st.notice}>
          <Feather name="lock" size={13} color={colors.textMuted} />
          <Text style={ps.small}>{fill(l.journal.lockedHint, { date: isoToSwiss(client.ledger_locked_until) })}</Text>
        </View>
      ) : null}
      {view === 'journal' ? (
        <JournalView client={client} accounts={accounts ?? []} range={range} onAccountsChanged={loadAccounts} />
      ) : view === 'accounts' ? (
        ledgerFor ? (
          <AccountLedgerView ext={client.id} code={ledgerFor} range={range} name={client.name} onBack={() => setLedgerFor(null)} />
        ) : (
          <AccountsView ext={client.id} accounts={accounts} onChanged={loadAccounts} onOpen={setLedgerFor} />
        )
      ) : view === 'reports' ? (
        <ReportsView client={client} range={range} firmName={me.firm.name} />
      ) : view === 'vat' ? (
        <VatView client={client} isAdmin={isAdmin} onChanged={onChanged} />
      ) : view === 'closing' ? (
        <ClosingView client={client} me={me} onChanged={onChanged} />
      ) : view === 'kpis' ? (
        <KpiPanel ext={client.id} />
      ) : view === 'import' ? (
        <ImportView
          client={client}
          accounts={accounts ?? []}
          onImported={() => {
            loadAccounts();
            onChanged();
          }}
        />
      ) : (
        <SettingsView client={client} isAdmin={isAdmin} onChanged={onChanged} />
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------

function LedgerStart({ ext, onStarted }: { ext: string; onStarted: () => void }) {
  const l = useLedgerCopy();
  const [busy, setBusy] = useState<'chart' | 'empty' | null>(null);
  const [error, setError] = useState<string | null>(null);
  async function start(seed: boolean) {
    setBusy(seed ? 'chart' : 'empty');
    const { error: e } = await ledger.init(ext, seed);
    setBusy(null);
    if (e) setError(e);
    else onStarted();
  }
  return (
    <Panel title={l.start.title} tone="accent">
      <Text style={ps.body}>{l.start.text}</Text>
      <View style={st.startRow}>
        <View style={st.startCard}>
          <Button title={l.start.withChart} icon="book-open" onPress={() => start(true)} loading={busy === 'chart'} />
          <Text style={ps.small}>{l.start.withChartHint}</Text>
        </View>
        <View style={st.startCard}>
          <Button title={l.start.empty} icon="upload" variant="secondary" onPress={() => start(false)} loading={busy === 'empty'} />
          <Text style={ps.small}>{l.start.emptyHint}</Text>
        </View>
      </View>
      {error ? <Text style={ps.error}>{error}</Text> : null}
    </Panel>
  );
}

// ---------------------------------------------------------------------------
// Journal

function JournalView({ client, accounts, range, onAccountsChanged }: { client: ExternalClient; accounts: LedgerAccount[]; range: { start: string; end: string }; onAccountsChanged: () => void }) {
  const l = useLedgerCopy();
  const t = l.journal;
  const [rows, setRows] = useState<LedgerEntry[] | null>(null);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<'all' | 'draft'>('all');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const [composing, setComposing] = useState(false);
  const [editing, setEditing] = useState<LedgerEntry | null>(null);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const PAGE = 100;

  const load = useCallback(
    async (more = false) => {
      const { data, error } = await ledger.entries(client.id, { from: range.start, to: range.end, status, search: query, limit: PAGE, offset: more ? rows?.length ?? 0 : 0 });
      if (error) return setMessage({ text: error, error: true });
      setTotal(data?.total ?? 0);
      setRows((prev) => (more ? [...(prev ?? []), ...(data?.rows ?? [])] : data?.rows ?? []));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [client.id, range.start, range.end, status, query],
  );
  useEffect(() => {
    load(false);
  }, [load]);
  useEffect(() => {
    const h = setTimeout(() => setQuery(search.trim()), 300);
    return () => clearTimeout(h);
  }, [search]);

  return (
    <View style={{ gap: spacing.md }}>
      <View style={[ps.actions, { justifyContent: 'space-between' }]}>
        <Button
          title={t.new}
          icon="plus"
          onPress={() => {
            setEditing(null);
            setComposing((x) => !x || !!editing);
          }}
        />
        <View style={[ps.actions, { flexGrow: 1, justifyContent: 'flex-end' }]}>
          <TextInput value={search} onChangeText={setSearch} placeholder={t.search} placeholderTextColor={colors.textMuted} style={[ps.input, { flexBasis: 220, flexGrow: 1, maxWidth: 360 }]} />
          <View style={st.shrink}>
            <Segmented value={status} onChange={setStatus} options={[{ key: 'all', label: t.all }, { key: 'draft', label: t.drafts }]} />
          </View>
        </View>
      </View>
      {composing || editing ? (
        <EntryForm
          key={editing?.id ?? 'new'}
          client={client}
          accounts={accounts}
          initial={editing}
          onAccountsChanged={onAccountsChanged}
          onSaved={() => {
            if (editing) {
              setEditing(null);
              setComposing(false);
            }
            load(false);
          }}
          onCancel={() => {
            setEditing(null);
            setComposing(false);
          }}
        />
      ) : null}
      <Message value={message} />
      {rows === null ? (
        <Text style={ps.muted}>…</Text>
      ) : rows.length === 0 ? (
        <Empty icon="book" text={t.empty} />
      ) : (
        <View style={st.list}>
          {rows.map((e, i) => (
            <EntryRow
              key={e.id}
              entry={e}
              first={i === 0}
              open={open === e.id}
              locked={!!client.ledger_locked_until && e.entry_date <= client.ledger_locked_until}
              onToggle={() => setOpen((x) => (x === e.id ? null : e.id))}
              onEdit={() => {
                setComposing(false);
                setEditing(e);
              }}
              onDone={(text) => {
                setMessage(text ? { text, error: false } : null);
                load(false);
              }}
              onError={(text) => setMessage({ text, error: true })}
            />
          ))}
        </View>
      )}
      {rows && rows.length ? (
        <View style={[ps.actions, { justifyContent: 'space-between' }]}>
          <Text style={ps.small}>{fill(t.count, { n: total })}</Text>
          {rows.length < total ? <LinkButton label={t.more} icon="chevron-down" onPress={() => load(true)} /> : null}
        </View>
      ) : null}
    </View>
  );
}

function EntryRow({
  entry: e,
  first,
  open,
  locked,
  onToggle,
  onEdit,
  onDone,
  onError,
}: {
  entry: LedgerEntry;
  first: boolean;
  open: boolean;
  locked: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDone: (message: string | null) => void;
  onError: (message: string) => void;
}) {
  const l = useLedgerCopy();
  const t = l.journal;
  const [confirm, setConfirm] = useState<'reverse' | 'discard' | null>(null);
  const [reverseDate, setReverseDate] = useState('');
  const [busy, setBusy] = useState(false);
  const draft = e.status === 'draft';
  const canEdit = !locked && (draft || (!e.reverses_entry_id && !e.reversed_by_entry_id));

  async function act(action: 'post' | 'discard' | 'reverse') {
    let date: string | null = null;
    if (action === 'reverse' && reverseDate.trim()) {
      const d = parseSwissDate(reverseDate);
      if (!d) return onError(l.form.date);
      date = d;
    }
    setBusy(true);
    const { data, error } = await ledger.entryAction(e.id, action, date);
    setBusy(false);
    setConfirm(null);
    if (error) return onError(error);
    onDone(action === 'reverse' ? fill(t.reversedDone, { n: data?.entry_number ?? '' }) : action === 'post' ? fill(t.postedDone, { n: data?.entry_number ?? '' }) : null);
  }

  return (
    <View style={[st.entry, !first && st.entryBorder]}>
      <Pressable onPress={onToggle} style={({ hovered }: any) => [st.entryHead, hovered && { backgroundColor: colors.bg }]}>
        <Text style={[st.no, draft && { color: colors.warning }]}>{draft ? t.draft : e.entry_number}</Text>
        <Text style={st.date}>{isoToSwiss(e.entry_date)}</Text>
        <View style={{ flex: 1, minWidth: 140 }}>
          <Text style={ps.bodyStrong} numberOfLines={1}>
            {e.label}
          </Text>
          <Text style={ps.small} numberOfLines={1}>
            {[e.reference, e.lines.map((x) => x.account_code).filter((c, i, a) => a.indexOf(c) === i).join(' · ')].filter(Boolean).join(' · ')}
          </Text>
        </View>
        <View style={st.badges}>
          {e.changed ? <Pill label={t.changed} /> : null}
          {e.source === 'reversal' ? <Pill label={t.reversal} tone="warning" /> : null}
          {e.reversed_by_entry_id ? <Pill label={t.reversed} tone="warning" /> : null}
          {e.source === 'import' ? <Pill label={t.imported} /> : null}
          {e.source === 'opening' ? <Pill label={t.opening} tone="primary" /> : null}
        </View>
        <Text style={st.amount}>{amountText(e.amount)}</Text>
        <Feather name={open ? 'chevron-up' : 'chevron-down'} size={15} color={colors.textMuted} />
      </Pressable>
      {open ? (
        <View style={st.entryBody}>
          <View style={st.linesBox}>
            {e.lines.map((x, i) => (
              <View key={i} style={st.lineRow}>
                <Text style={[ps.mono, { width: 64 }]}>{x.account_code}</Text>
                <Text style={[ps.small, { flex: 1, minWidth: 120 }]} numberOfLines={1}>
                  {[x.account_label, x.label].filter(Boolean).join(' · ')}
                </Text>
                <Text style={[ps.mono, { color: colors.textMuted, width: 44 }]}>{x.vat_code ?? ''}</Text>
                <Text style={[st.cellNum, { width: 104 }]}>{Number(x.debit) ? amountText(x.debit) : ''}</Text>
                <Text style={[st.cellNum, { width: 104 }]}>{Number(x.credit) ? amountText(x.credit) : ''}</Text>
              </View>
            ))}
          </View>
          {e.created_by_name ? <Text style={ps.small}>{fill(t.by, { name: e.created_by_name })}</Text> : null}
          <View style={ps.actions}>
            {canEdit ? <LinkButton label={t.edit} icon="edit-2" onPress={onEdit} /> : null}
            {draft && !locked ? <LinkButton label={t.post} icon="check" onPress={() => act('post')} disabled={busy} /> : null}
            {draft ? (
              <LinkButton label={confirm === 'discard' ? t.discardConfirm : t.discard} icon="trash-2" tone={confirm === 'discard' ? 'danger' : 'muted'} onPress={() => (confirm === 'discard' ? act('discard') : setConfirm('discard'))} disabled={busy} />
            ) : null}
            {e.status === 'posted' && !e.reversed_by_entry_id && !e.reverses_entry_id ? (
              confirm === 'reverse' ? (
                <View style={ps.actions}>
                  <TextInput value={reverseDate} onChangeText={setReverseDate} placeholder={`${t.reverseDate} (${isoToSwiss(e.entry_date)})`} placeholderTextColor={colors.textMuted} style={[ps.input, { width: 230 }]} />
                  <LinkButton label={t.reverseConfirm} icon="rotate-ccw" tone="danger" onPress={() => act('reverse')} disabled={busy} />
                </View>
              ) : (
                <LinkButton label={t.reverse} icon="rotate-ccw" tone="muted" onPress={() => (setConfirm('reverse'), setReverseDate(locked ? isoToSwiss(todayIso()) : ''))} />
              )
            ) : null}
          </View>
        </View>
      ) : null}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Entry form: quick (debit / credit / amount with VAT) or split.

type EditLine = { account: string; label: string; debit: string; credit: string; vat: string };
const emptyLine = (): EditLine => ({ account: '', label: '', debit: '', credit: '', vat: '' });

function EntryForm({
  client,
  accounts,
  initial,
  onSaved,
  onCancel,
}: {
  client: ExternalClient;
  accounts: LedgerAccount[];
  initial: LedgerEntry | null;
  onAccountsChanged: () => void;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const l = useLedgerCopy();
  const pc = useProCopy();
  const t = l.form;
  const [mode, setMode] = useState<'quick' | 'split'>(initial ? 'split' : 'quick');
  const [date, setDate] = useState(isoToSwiss(initial?.entry_date ?? todayIso()));
  const [reference, setReference] = useState(initial?.reference ?? '');
  const [label, setLabel] = useState(initial?.label ?? '');
  const [debit, setDebit] = useState('');
  const [credit, setCredit] = useState('');
  const [amount, setAmount] = useState('');
  const [vat, setVat] = useState<string>('');
  const [lines, setLines] = useState<EditLine[]>(
    initial
      ? initial.lines.map((x) => ({ account: x.account_code, label: x.label ?? '', debit: Number(x.debit) ? String(x.debit) : '', credit: Number(x.credit) ? String(x.credit) : '', vat: x.vat_code ?? '' }))
      : [emptyLine(), emptyLine()],
  );
  const [busy, setBusy] = useState<'post' | 'draft' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const labelRef = useRef<TextInput>(null);
  const known = useMemo(() => new Map(accounts.map((a) => [a.code, a])), [accounts]);

  const quick = useMemo(() => {
    const a = num(amount);
    if (!debit.trim() || !credit.trim() || !a) return null;
    return quickLines({ debit: debit.trim(), credit: credit.trim(), amount: a, vat: vat || null, label: null });
  }, [debit, credit, amount, vat]);
  const splitLines: LedgerLine[] = lines
    .filter((x) => x.account.trim() && (num(x.debit) || num(x.credit)))
    .map((x) => ({ account_code: x.account.trim(), debit: num(x.debit), credit: num(x.credit), label: x.label.trim() || null, vat_code: x.vat.trim() || null }));
  const current = mode === 'quick' ? quick ?? [] : splitLines;
  const dSum = Math.round(current.reduce((s, x) => s + x.debit, 0) * 100) / 100;
  const cSum = Math.round(current.reduce((s, x) => s + x.credit, 0) * 100) / 100;
  const diff = Math.round((dSum - cSum) * 100) / 100;
  const unknown = current.map((x) => x.account_code).filter((c) => !known.has(c));
  const ready = current.length >= 2 && diff === 0 && dSum > 0 && label.trim().length > 0 && unknown.length === 0;
  const setLine = (i: number, patch: Partial<EditLine>) => setLines((x) => x.map((y, j) => (j === i ? { ...y, ...patch } : y)));

  async function save(post: boolean) {
    const iso = parseSwissDate(date);
    if (!iso) return setError(t.date);
    if (!ready) return;
    setBusy(post ? 'post' : 'draft');
    setError(null);
    const { data, error: e } = await ledger.saveEntry(client.id, initial?.id ?? null, { date: iso, label: label.trim(), reference: reference.trim() || null, lines: current }, post);
    setBusy(null);
    if (e || !data) return setError(e ?? '—');
    if (initial) return onSaved();
    setSaved(post ? fill(t.saved, { n: data.entry_number ?? '' }) : t.savedDraft);
    setReference(nextReference(reference.trim()));
    setLabel('');
    setAmount('');
    setVat('');
    setLines([emptyLine(), emptyLine()]);
    onSaved();
    labelRef.current?.focus();
  }

  const title = initial ? (initial.status === 'draft' ? t.titleDraft : fill(t.titleEdit, { n: initial.entry_number ?? '' })) : t.titleNew;
  return (
    <Panel title={title} tone="accent" right={!initial ? <Segmented value={mode} onChange={setMode} options={[{ key: 'quick', label: t.quick }, { key: 'split', label: t.split }]} /> : undefined}>
      <View style={ps.row}>
        <Input label={t.date} value={date} onChangeText={setDate} placeholder="JJ.MM.AAAA" style={{ width: 130 }} />
        <Input label={t.reference} value={reference} onChangeText={setReference} maxLength={60} style={{ width: 130 }} />
        <View style={{ flexGrow: 1, flexBasis: 260, gap: 6 }}>
          <Text style={ps.label}>{t.label}</Text>
          <TextInput ref={labelRef} value={label} onChangeText={setLabel} placeholder={t.labelPlaceholder} placeholderTextColor={colors.textMuted} maxLength={200} style={ps.input} />
        </View>
      </View>
      {mode === 'quick' ? (
        <>
          <View style={[ps.row, { alignItems: 'flex-start' }]}>
            <AccountField label={t.debit} value={debit} onChange={setDebit} accounts={accounts} />
            <AccountField label={t.credit} value={credit} onChange={setCredit} accounts={accounts} />
            <View style={{ width: 150, gap: 6 }}>
              <Text style={ps.label}>{t.amount}</Text>
              <TextInput value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor={colors.textMuted} onSubmitEditing={() => save(true)} style={[ps.input, { textAlign: 'right' }]} />
            </View>
          </View>
          <Picks label={t.vat} value={vat || '__none'} onChange={(x) => setVat(x === '__none' ? '' : x)} options={[{ key: '__none', label: t.noVat }, ...VAT_CODES.map((c) => ({ key: c, label: l.vatCodes[c] }))]} />
          {quick ? (
            <View style={{ gap: 4 }}>
              <Text style={ps.label}>{t.preview}</Text>
              <View style={st.linesBox}>
                {quick.map((x, i) => (
                  <View key={i} style={st.lineRow}>
                    <Text style={[ps.mono, { width: 64 }]}>{x.account_code}</Text>
                    <Text style={[ps.small, { flex: 1 }]} numberOfLines={1}>
                      {known.get(x.account_code)?.label ?? fill(t.unknownAccount, { code: x.account_code })}
                    </Text>
                    <Text style={[ps.mono, { color: colors.textMuted, width: 44 }]}>{x.vat_code ?? ''}</Text>
                    <Text style={[st.cellNum, { width: 104 }]}>{x.debit ? amountText(x.debit) : ''}</Text>
                    <Text style={[st.cellNum, { width: 104 }]}>{x.credit ? amountText(x.credit) : ''}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </>
      ) : (
        <View style={{ gap: 6 }}>
          {lines.map((x, i) => (
            <View key={i} style={st.lineEdit}>
              <AccountField compact value={x.account} onChange={(v) => setLine(i, { account: v })} accounts={accounts} />
              <TextInput value={x.label} onChangeText={(v) => setLine(i, { label: v })} placeholder={t.lineLabel} placeholderTextColor={colors.textMuted} style={[ps.input, { flex: 1, minWidth: 140 }]} />
              <TextInput value={x.vat} onChangeText={(v) => setLine(i, { vat: v.toUpperCase() })} placeholder={t.vatCode} placeholderTextColor={colors.textMuted} maxLength={12} style={[ps.input, { width: 92 }]} />
              <TextInput value={x.debit} onChangeText={(v) => setLine(i, { debit: v, credit: v ? '' : x.credit })} placeholder={t.lineDebit} placeholderTextColor={colors.textMuted} keyboardType="decimal-pad" style={[ps.input, { width: 110, textAlign: 'right' }]} />
              <TextInput value={x.credit} onChangeText={(v) => setLine(i, { credit: v, debit: v ? '' : x.debit })} placeholder={t.lineCredit} placeholderTextColor={colors.textMuted} keyboardType="decimal-pad" style={[ps.input, { width: 110, textAlign: 'right' }]} />
              {lines.length > 2 ? (
                <Pressable onPress={() => setLines((y) => y.filter((_, j) => j !== i))} hitSlop={6}>
                  <Feather name="x" size={15} color={colors.textMuted} />
                </Pressable>
              ) : (
                <View style={{ width: 15 }} />
              )}
            </View>
          ))}
          <View style={[ps.actions, { justifyContent: 'space-between' }]}>
            <LinkButton
              label={t.addLine}
              icon="plus"
              onPress={() =>
                setLines((y) => {
                  const rest = Math.round((y.reduce((s, z) => s + num(z.debit) - num(z.credit), 0)) * 100) / 100;
                  return [...y, { ...emptyLine(), debit: rest < 0 ? String(-rest) : '', credit: rest > 0 ? String(rest) : '' }];
                })
              }
            />
          </View>
        </View>
      )}
      <View style={[ps.actions, { justifyContent: 'space-between' }]}>
        <Text style={[ps.bodyStrong, { color: diff === 0 && dSum > 0 ? colors.success : colors.textMuted }]}>
          {dSum > 0 ? (diff === 0 ? `${t.balanced} · ${formatChf(dSum)}` : fill(t.difference, { amount: formatChf(diff) })) : ''}
        </Text>
        {unknown.length ? <Text style={[ps.small, { color: colors.danger }]}>{fill(t.unknownAccount, { code: unknown.join(', ') })}</Text> : null}
      </View>
      {initial && initial.status === 'posted' ? <Text style={ps.small}>{t.changeNote}</Text> : null}
      {error ? <Text style={ps.error}>{error}</Text> : null}
      {saved ? <Text style={ps.success}>{saved}</Text> : null}
      <View style={ps.actions}>
        <Button title={t.save} icon="check" onPress={() => save(true)} loading={busy === 'post'} disabled={!ready} />
        {!initial || initial.status === 'draft' ? <Button title={t.saveDraft} variant="secondary" onPress={() => save(false)} loading={busy === 'draft'} disabled={!ready} /> : null}
        <LinkButton label={pc.common.cancel} tone="muted" onPress={onCancel} />
        {mode === 'quick' && !initial ? <Text style={ps.small}>{t.enterHint}</Text> : null}
      </View>
    </Panel>
  );
}

function AccountField({ label, value, onChange, accounts, compact = false }: { label?: string; value: string; onChange: (v: string) => void; accounts: LedgerAccount[]; compact?: boolean }) {
  const l = useLedgerCopy();
  const [focus, setFocus] = useState(false);
  const v = value.trim();
  const exact = accounts.find((a) => a.code === v);
  const matches =
    focus && v && !exact
      ? accounts.filter((a) => a.is_active && (a.code.startsWith(v) || a.label.toLowerCase().includes(v.toLowerCase()))).slice(0, 8)
      : [];
  return (
    <View style={{ width: compact ? 200 : 240, gap: 6, zIndex: focus ? 10 : 1 }}>
      {label ? <Text style={ps.label}>{label}</Text> : null}
      <TextInput
        value={value}
        onChangeText={onChange}
        onFocus={() => setFocus(true)}
        onBlur={() => setTimeout(() => setFocus(false), 180)}
        placeholder={l.form.account}
        placeholderTextColor={colors.textMuted}
        style={[ps.input, v && !exact ? { borderColor: colors.warning } : null]}
      />
      <Text style={[ps.small, { minHeight: 17 }]} numberOfLines={1}>
        {exact ? exact.label : ''}
      </Text>
      {matches.length ? (
        <View style={st.suggest}>
          {matches.map((a) => (
            <Pressable
              key={a.code}
              onPress={() => {
                onChange(a.code);
                setFocus(false);
              }}
              style={({ hovered }: any) => [st.suggestRow, hovered && { backgroundColor: colors.bg }]}
            >
              <Text style={[ps.mono, { width: 52 }]}>{a.code}</Text>
              <Text style={[ps.small, { flex: 1, color: colors.text }]} numberOfLines={1}>
                {a.label}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Chart of accounts

function AccountsView({ ext, accounts, onChanged, onOpen }: { ext: string; accounts: LedgerAccount[] | null; onChanged: () => void; onOpen: (code: string) => void }) {
  const l = useLedgerCopy();
  const t = l.accounts;
  const [search, setSearch] = useState('');
  const [adding, setAdding] = useState(false);
  const [edit, setEdit] = useState<string | null>(null);
  if (!accounts) return <Text style={ps.muted}>…</Text>;
  const q = search.trim().toLowerCase();
  const list = accounts.filter((a) => !q || a.code.startsWith(q) || a.label.toLowerCase().includes(q));
  const groups = new Map<string, LedgerAccount[]>();
  for (const a of list) {
    const k = /^[1-9]/.test(a.code) ? a.code[0] : '?';
    groups.set(k, [...(groups.get(k) ?? []), a]);
  }
  return (
    <View style={{ gap: spacing.md }}>
      <View style={[ps.actions, { justifyContent: 'space-between' }]}>
        <TextInput value={search} onChangeText={setSearch} placeholder={t.search} placeholderTextColor={colors.textMuted} style={[ps.input, { minWidth: 220, flexGrow: 1, maxWidth: 360 }]} />
        <Button title={t.add} icon="plus" variant="secondary" onPress={() => setAdding((x) => !x)} />
      </View>
      {adding ? (
        <AccountForm
          ext={ext}
          onSaved={() => {
            setAdding(false);
            onChanged();
          }}
          onCancel={() => setAdding(false)}
        />
      ) : null}
      {accounts.length === 0 ? <Empty icon="list" text={t.empty} /> : null}
      {[...groups.entries()].map(([k, items]) => (
        <View key={k} style={{ gap: 4 }}>
          <Text style={ps.label}>{k === '?' ? t.other : `${k} · ${t.classes[k] ?? ''}`}</Text>
          <View style={st.list}>
            {items.map((a, i) =>
              edit === a.code ? (
                <View key={a.code} style={[{ padding: spacing.md }, i > 0 && st.entryBorder]}>
                  <AccountForm
                    ext={ext}
                    initial={a}
                    onSaved={() => {
                      setEdit(null);
                      onChanged();
                    }}
                    onCancel={() => setEdit(null)}
                  />
                </View>
              ) : (
                <View key={a.code} style={[st.accRow, i > 0 && st.entryBorder]}>
                  <Text style={[ps.mono, { width: 64, fontWeight: '700' }]}>{a.code}</Text>
                  <Text style={[ps.body, { flex: 1, minWidth: 140 }, !a.is_active && { color: colors.textMuted }]} numberOfLines={1}>
                    {a.label}
                  </Text>
                  <Pill label={t.types[a.type]} />
                  {!a.is_active ? <Pill label={t.inactive} tone="warning" /> : null}
                  <LinkButton label={t.ledger} icon="book-open" onPress={() => onOpen(a.code)} />
                  <Pressable onPress={() => setEdit(a.code)} hitSlop={6}>
                    <Feather name="edit-2" size={14} color={colors.textMuted} />
                  </Pressable>
                </View>
              ),
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

function AccountForm({ ext, initial, onSaved, onCancel }: { ext: string; initial?: LedgerAccount; onSaved: () => void; onCancel: () => void }) {
  const l = useLedgerCopy();
  const p = useProCopy();
  const t = l.accounts;
  const [code, setCode] = useState(initial?.code ?? '');
  const [label, setLabel] = useState(initial?.label ?? '');
  const [type, setType] = useState<AccountType | null>(initial?.type ?? null);
  const [active, setActive] = useState(initial?.is_active ?? true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const guessed: AccountType = /^1|^9/.test(code) ? 'actif' : /^2/.test(code) ? 'passif' : /^3|^7/.test(code) ? 'produit' : 'charge';
  async function save() {
    setBusy(true);
    const { error: e } = await ledger.saveAccount(ext, code.trim(), label.trim(), type ?? guessed, active);
    setBusy(false);
    if (e) setError(e);
    else onSaved();
  }
  return (
    <View style={{ gap: spacing.sm }}>
      <View style={ps.row}>
        <Input label={t.code} value={code} onChangeText={setCode} editable={!initial} maxLength={12} style={{ width: 110 }} />
        <Input label={t.label} value={label} onChangeText={setLabel} maxLength={120} style={{ flexGrow: 1, flexBasis: 240 }} />
      </View>
      <Picks label={t.type} value={type ?? guessed} onChange={setType} options={(['actif', 'passif', 'produit', 'charge'] as AccountType[]).map((x) => ({ key: x, label: t.types[x] }))} />
      {initial ? <Toggle value={active} onChange={setActive} label={t.active} /> : null}
      {error ? <Text style={ps.error}>{error}</Text> : null}
      <View style={ps.actions}>
        <Button title={p.common.save} icon="check" onPress={save} loading={busy} disabled={!code.trim() || !label.trim()} />
        <LinkButton label={p.common.cancel} tone="muted" onPress={onCancel} />
      </View>
    </View>
  );
}

function AccountLedgerView({ ext, code, range, name, onBack }: { ext: string; code: string; range: { start: string; end: string }; name: string; onBack: () => void }) {
  const l = useLedgerCopy();
  const t = l.ledgerView;
  const [data, setData] = useState<AccountLedger | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    setData(undefined);
    ledger.accountLedger(ext, code, range.start, range.end).then(({ data: d, error: e }) => {
      setData(d);
      setError(e);
    });
  }, [ext, code, range.start, range.end]);

  async function download() {
    if (!data) return;
    const csv = [
      [t.date, t.number, t.reference, t.label, t.counterpart, t.debit, t.credit, t.balance].join(';'),
      [isoToSwiss(range.start), '', '', t.opening, '', '', '', Number(data.opening).toFixed(2)].join(';'),
      ...data.rows.map((r) => [isoToSwiss(r.entry_date), r.entry_number, csvCell(r.reference), csvCell(r.label), csvCell(r.counterpart), Number(r.debit) ? Number(r.debit).toFixed(2) : '', Number(r.credit) ? Number(r.credit).toFixed(2) : '', Number(r.balance).toFixed(2)].join(';')),
    ].join('\r\n');
    await downloadTextFile(`${slugOf(name)}-grand-livre-${code}-${range.start}_${range.end}.csv`, '﻿' + csv + '\r\n');
  }

  const closing = data ? (data.rows.length ? Number(data.rows[data.rows.length - 1].balance) : Number(data.opening)) : 0;
  return (
    <View style={{ gap: spacing.md }}>
      <View style={[ps.actions, { justifyContent: 'space-between' }]}>
        <LinkButton label={t.back} icon="arrow-left" tone="muted" onPress={onBack} />
        {data ? <Button title={t.download} icon="download" variant="secondary" onPress={download} /> : null}
      </View>
      {data === undefined ? <Text style={ps.muted}>…</Text> : null}
      {error ? <Text style={ps.error}>{error}</Text> : null}
      {data ? (
        <Panel title={fill(t.title, { code: data.code, label: data.label })}>
          <View style={st.tableScroll}>
            <View style={[st.table, { minWidth: 760 }]}>
              <View style={[st.tr, st.thRow]}>
                <Text style={[st.th, { width: 84 }]}>{t.date}</Text>
                <Text style={[st.th, { width: 48 }]}>{t.number}</Text>
                <Text style={[st.th, { flex: 1 }]}>{t.label}</Text>
                <Text style={[st.th, { width: 120 }]} numberOfLines={1}>{t.counterpart}</Text>
                <Text style={[st.th, st.numCol]}>{t.debit}</Text>
                <Text style={[st.th, st.numCol]}>{t.credit}</Text>
                <Text style={[st.th, st.numCol]}>{t.balance}</Text>
              </View>
              <View style={st.tr}>
                <Text style={[st.td, { width: 84 }]}>{isoToSwiss(range.start)}</Text>
                <Text style={[st.td, { width: 48 }]} />
                <Text style={[st.td, { flex: 1, fontWeight: '700' }]}>{t.opening}</Text>
                <Text style={[st.td, { width: 120 }]} />
                <Text style={[st.cellNum, st.numCol]} />
                <Text style={[st.cellNum, st.numCol]} />
                <Text style={[st.cellNum, st.numCol, { fontWeight: '700' }]}>{amountText(data.opening)}</Text>
              </View>
              {data.rows.map((r, i) => (
                <View key={`${r.entry_id}-${i}`} style={st.tr}>
                  <Text style={[st.td, { width: 84 }]}>{isoToSwiss(r.entry_date)}</Text>
                  <Text style={[st.td, { width: 48 }]}>{r.entry_number}</Text>
                  <Text style={[st.td, { flex: 1 }]} numberOfLines={1}>
                    {[r.reference, r.label].filter(Boolean).join(' · ')}
                  </Text>
                  <Text style={[ps.mono, { width: 120 }]} numberOfLines={1}>
                    {r.counterpart ?? ''}
                  </Text>
                  <Text style={[st.cellNum, st.numCol]}>{Number(r.debit) ? amountText(r.debit) : ''}</Text>
                  <Text style={[st.cellNum, st.numCol]}>{Number(r.credit) ? amountText(r.credit) : ''}</Text>
                  <Text style={[st.cellNum, st.numCol]}>{amountText(r.balance)}</Text>
                </View>
              ))}
              <View style={[st.tr, st.thRow]}>
                <Text style={[st.td, { flex: 1, fontWeight: '800' }]}>{t.closing}</Text>
                <Text style={[st.cellNum, st.numCol, { fontWeight: '800' }]}>{amountText(closing)}</Text>
              </View>
            </View>
          </View>
          {data.rows.length === 0 ? <Text style={ps.muted}>{t.empty}</Text> : null}
        </Panel>
      ) : null}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Reports: statements, trial balance, VAT, exports.

function ReportsView({ client, range, firmName }: { client: ExternalClient; range: { start: string; end: string }; firmName: string }) {
  const l = useLedgerCopy();
  const t = l.reports;
  const { locale } = useAccCopy();
  const [data, setData] = useState<{ statements: Statements | null; previous: Statements | null; trial: TrialRow[]; vat: VatSummary | null } | null>(null);
  // "All": the statements of today's fiscal year.
  const to = range.end === '2100-12-31' ? todayIso() : range.end;
  useEffect(() => {
    setData(null);
    Promise.all([ledger.statements(client.id, to, range.start), ledger.trialBalance(client.id, range.start, range.end), ledger.vat(client.id, range.start, range.end)]).then(async ([s, tb, v]) => {
      // The previous fiscal year, for the comparison column.
      let previous: Statements | null = null;
      if (s.data) {
        const d = new Date(`${s.data.fy_start}T12:00:00Z`);
        d.setUTCDate(d.getUTCDate() - 1);
        const p = (await ledger.statements(client.id, d.toISOString().slice(0, 10))).data;
        previous = p && (p.assets.length || p.income.length || p.expenses.length) ? p : null;
      }
      setData({ statements: s.data, previous, trial: tb.data ?? [], vat: v.data });
    });
  }, [client.id, range.start, range.end, to]);
  if (!data) return <Text style={ps.muted}>…</Text>;
  const s = data.statements;
  const pv = data.previous;
  // Rows of both years (an account may exist in one only).
  const merged = (list: 'assets' | 'liabilities' | 'income' | 'expenses') => {
    const cur = s ? s[list] : [];
    const prev = pv ? pv[list] : [];
    const codes = [...new Set([...cur.map((x) => x.code), ...prev.map((x) => x.code)])].sort();
    return codes.map((code) => {
      const a = cur.find((x) => x.code === code);
      const b = prev.find((x) => x.code === code);
      return { code, label: (a ?? b)!.label, amount: Number(a?.amount ?? 0), prev: pv ? Number(b?.amount ?? 0) : undefined };
    });
  };
  const colHead = (date: string) =>
    pv ? (
      <View style={st.line}>
        <Text style={[st.lineLabel, { color: colors.textMuted }]} />
        <Text style={[ps.label, st.colHead]}>{isoToSwiss(date)}</Text>
        <Text style={[ps.label, st.colHead]}>{isoToSwiss(pv.to)}</Text>
      </View>
    ) : null;
  const empty = !data.trial.length;

  async function downloadTrial() {
    const c = t.trialCols;
    const csv = [
      [c.account, l.accounts.label, c.opening, c.debit, c.credit, c.closing].join(';'),
      ...data!.trial.map((r) => [r.code, csvCell(r.label), Number(r.opening).toFixed(2), Number(r.debit).toFixed(2), Number(r.credit).toFixed(2), Number(r.closing).toFixed(2)].join(';')),
    ].join('\r\n');
    await downloadTextFile(`${slugOf(client.name)}-balance-${range.start}_${range.end}.csv`, '﻿' + csv + '\r\n');
  }

  const sum = (list: { amount: number }[]) => list.reduce((x, y) => x + Number(y.amount), 0);
  return (
    <View style={{ gap: spacing.md }}>
      {empty ? <Empty icon="bar-chart-2" text={t.empty} /> : null}
      {s && !empty ? (
        <View style={ps.actions}>
          <Button title={t.print} icon="printer" onPress={() => printAnnualAccounts(client, firmName, to, locale, l)} />
        </View>
      ) : null}
      {s && !empty ? (
        <View style={st.twoCols}>
          <View style={st.col}>
          <Panel title={fill(t.balanceSheet, { date: isoToSwiss(s.to) })}>
            {colHead(s.to)}
            <Text style={ps.label}>{t.assets}</Text>
            {merged('assets').map((x) => (
              <Line key={x.code} label={`${x.code} ${x.label}`} value={x.amount} prev={x.prev} />
            ))}
            <Line label={t.totalAssets} value={sum(s.assets)} prev={pv ? sum(pv.assets) : undefined} strong />
            <View style={ps.divider} />
            <Text style={ps.label}>{t.liabilities}</Text>
            {merged('liabilities').map((x) => (
              <Line key={x.code} label={`${x.code} ${x.label}`} value={x.amount} prev={x.prev} />
            ))}
            {Number(s.prior_results) ? <Line label={t.priorResults} value={s.prior_results} prev={pv ? Number(pv.prior_results) : undefined} /> : null}
            {Number(s.year_result) || (pv && Number(pv.year_result)) ? <Line label={t.yearResult} value={s.year_result} prev={pv ? Number(pv.year_result) : undefined} /> : null}
            <Line
              label={t.totalLiabilities}
              value={sum(s.liabilities) + Number(s.year_result) + Number(s.prior_results)}
              prev={pv ? sum(pv.liabilities) + Number(pv.year_result) + Number(pv.prior_results) : undefined}
              strong
            />
          </Panel>
          </View>
          <View style={st.col}>
          <Panel title={fill(t.income, { from: isoToSwiss(s.from), to: isoToSwiss(s.to) })}>
            {colHead(s.to)}
            <Text style={ps.label}>{t.revenue}</Text>
            {merged('income').map((x) => (
              <Line key={x.code} label={`${x.code} ${x.label}`} value={x.amount} prev={x.prev} />
            ))}
            <Line label={t.revenue} value={sum(s.income)} prev={pv ? sum(pv.income) : undefined} strong />
            <View style={ps.divider} />
            <Text style={ps.label}>{t.expenses}</Text>
            {merged('expenses').map((x) => (
              <Line key={x.code} label={`${x.code} ${x.label}`} value={x.amount} prev={x.prev} />
            ))}
            <Line label={t.expenses} value={sum(s.expenses)} prev={pv ? sum(pv.expenses) : undefined} strong />
            <View style={ps.divider} />
            <Line label={Number(s.result) >= 0 ? t.profit : t.loss} value={s.result} prev={pv ? Number(pv.result) : undefined} strong tone={Number(s.result) < 0 ? 'danger' : 'success'} />
          </Panel>
          </View>
        </View>
      ) : null}
      {!empty ? (
        <Panel title={t.trial} right={<Button title={t.downloadTrial} icon="download" variant="secondary" onPress={downloadTrial} />}>
          <View style={st.tableScroll}>
            <View style={[st.table, { minWidth: 720 }]}>
              <View style={[st.tr, st.thRow]}>
                <Text style={[st.th, { flex: 1 }]}>{t.trialCols.account}</Text>
                <Text style={[st.th, st.numCol]}>{t.trialCols.opening}</Text>
                <Text style={[st.th, st.numCol]}>{t.trialCols.debit}</Text>
                <Text style={[st.th, st.numCol]}>{t.trialCols.credit}</Text>
                <Text style={[st.th, st.numCol]}>{t.trialCols.closing}</Text>
              </View>
              {data.trial.map((r) => (
                <View key={r.code} style={st.tr}>
                  <Text style={[st.td, { flex: 1 }]} numberOfLines={1}>
                    <Text style={{ ...monoType, fontWeight: '700' }}>{r.code}</Text> {r.label}
                  </Text>
                  <Text style={[st.cellNum, st.numCol]}>{amountText(r.opening)}</Text>
                  <Text style={[st.cellNum, st.numCol]}>{amountText(r.debit)}</Text>
                  <Text style={[st.cellNum, st.numCol]}>{amountText(r.credit)}</Text>
                  <Text style={[st.cellNum, st.numCol, { fontWeight: '700' }]}>{amountText(r.closing)}</Text>
                </View>
              ))}
              <View style={[st.tr, st.thRow]}>
                <Text style={[st.td, { flex: 1, fontWeight: '800' }]}>Total</Text>
                <Text style={[st.cellNum, st.numCol]} />
                <Text style={[st.cellNum, st.numCol, { fontWeight: '800' }]}>{amountText(data.trial.reduce((x, r) => x + Number(r.debit), 0))}</Text>
                <Text style={[st.cellNum, st.numCol, { fontWeight: '800' }]}>{amountText(data.trial.reduce((x, r) => x + Number(r.credit), 0))}</Text>
                <Text style={[st.cellNum, st.numCol]} />
              </View>
            </View>
          </View>
        </Panel>
      ) : null}
      <Panel title={t.vat}>
        <Text style={ps.small}>{t.vatText}</Text>
        {data.vat && data.vat.codes.length ? (
          <>
            {data.vat.codes.map((c) => (
              <Line key={c.vat_code} label={`${c.vat_code} ${l.vatCodes[c.vat_code] ?? ''} · ${c.lines} ${t.vatCols.lines.toLowerCase()}`} value={c.net} />
            ))}
            <View style={ps.divider} />
            <Line label={t.vatDue} value={data.vat.vat_due} />
            <Line label={t.inputTax} value={-Number(data.vat.input_tax)} />
            <Line label={t.vatNet} value={Number(data.vat.vat_due) - Number(data.vat.input_tax)} strong />
          </>
        ) : (
          <Text style={ps.muted}>{t.vatNone}</Text>
        )}
      </Panel>
      <ExtExportPanel client={client} range={range} />
    </View>
  );
}

function Line({ label, value, prev, strong = false, tone }: { label: string; value: number; prev?: number; strong?: boolean; tone?: 'danger' | 'success' }) {
  return (
    <View style={st.line}>
      <Text style={[st.lineLabel, strong && st.lineStrong]} numberOfLines={1}>
        {label}
      </Text>
      <Text style={[st.lineValue, st.colHead, strong && st.lineStrong, tone && { color: tone === 'danger' ? colors.danger : colors.success }]}>{prev !== undefined ? amountText(value) : formatChf(value)}</Text>
      {prev !== undefined ? <Text style={[st.lineValue, st.colHead, { color: colors.textMuted }, strong && st.lineStrong]}>{amountText(prev)}</Text> : null}
    </View>
  );
}

function ExtExportPanel({ client, range }: { client: ExternalClient; range: { start: string; end: string } }) {
  const l = useLedgerCopy();
  const { exportsCopy } = useExportCopy();
  const [format, setFormat] = useState<ExportFormat>(client.software === 'abacus' || client.software === 'winbiz' ? client.software : 'banana');
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const slug = slugOf(client.name);

  async function entries() {
    setBusy('entries');
    setMessage(null);
    try {
      const rows = await loadExtPostedEntries(client.id, range.start, range.end);
      if (!rows.length) return setMessage({ text: exportsCopy.none, error: true });
      const out = formatEntries(format, rows);
      await downloadTextFile(`${slug}-${format}-${range.start}_${range.end}.${out.extension}`, out.content);
      setMessage({ text: fill(exportsCopy.done, { count: rows.length }), error: false });
    } catch (e) {
      setMessage({ text: e instanceof Error ? e.message : String(e), error: true });
    } finally {
      setBusy(null);
    }
  }
  async function balances() {
    setBusy('balances');
    const { data } = await ledger.trialBalance(client.id, '1990-01-01', range.end);
    const content = formatBalances(
      format,
      (data ?? []).filter((r) => r.type === 'actif' || r.type === 'passif').map((r) => ({ code: r.code, label: r.label, balance: Number(r.closing) })),
      range.end,
    );
    await downloadTextFile(`${slug}-${format}-soldes-${range.end}.${format === 'banana' ? 'txt' : 'csv'}`, content);
    setBusy(null);
  }
  return (
    <Panel title={l.reports.exports}>
      <Segmented value={format} onChange={setFormat} options={[{ key: 'banana', label: 'Banana' }, { key: 'abacus', label: 'Abacus' }, { key: 'winbiz', label: 'Winbiz' }]} />
      <Text style={ps.small}>{exportsCopy.help[format]}</Text>
      <View style={ps.actions}>
        <Button title={exportsCopy.entries} icon="download" onPress={entries} loading={busy === 'entries'} />
        <Button title={exportsCopy.balances} icon="download" variant="secondary" onPress={balances} loading={busy === 'balances'} />
      </View>
      <Message value={message} />
    </Panel>
  );
}

// The export strings already written for Cantia clients.
function useExportCopy() {
  const p = useProCopy();
  return { exportsCopy: p.exports };
}

// ---------------------------------------------------------------------------
// Import from the client's old software.

type ImportKind = 'journal' | 'chart' | 'opening';
type Parsed =
  | { kind: 'journal'; entries: LedgerEntryInput[]; errors: { row: number; message: string }[]; skipped: number }
  | { kind: 'chart'; accounts: { code: string; label: string; type?: AccountType }[]; skipped: number }
  | { kind: 'opening'; balances: { code: string; label: string; balance: number }[]; inverted: boolean };

async function readRows(asset: { uri: string; name?: string | null }): Promise<unknown[][]> {
  const buf = await fetch(asset.uri).then((r) => r.arrayBuffer());
  const name = asset.name ?? '';
  if (/\.(xlsx|xlsm|xls|ods)$/i.test(name)) {
    const XLSX = await import('xlsx');
    const wb = XLSX.read(buf, { type: 'array', cellDates: true });
    const ws = wb.Sheets[wb.SheetNames[0]];
    return XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: '' }) as unknown[][];
  }
  let text: string;
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(buf);
  } catch {
    text = new TextDecoder('windows-1252').decode(buf);
  }
  return splitDelimited(text);
}

function ImportView({ client, accounts, onImported }: { client: ExternalClient; accounts: LedgerAccount[]; onImported: () => void }) {
  const l = useLedgerCopy();
  const t = l.import;
  const [kind, setKind] = useState<ImportKind>('journal');
  const [file, setFile] = useState<string | null>(null);
  const [parsed, setParsed] = useState<Parsed | null>(null);
  const [busy, setBusy] = useState<'read' | 'import' | null>(null);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [createAccounts, setCreateAccounts] = useState(true);
  const [post, setPost] = useState(true);
  const [openingDate, setOpeningDate] = useState(isoToSwiss(ledgerRange('fy', client.fiscal_year_end).start));
  const known = useMemo(() => new Set(accounts.map((a) => a.code)), [accounts]);

  async function pick() {
    const res = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
    if (res.canceled || !res.assets?.length) return;
    const asset = res.assets[0];
    setBusy('read');
    setMessage(null);
    setParsed(null);
    setFile(asset.name ?? null);
    try {
      const rows = await readRows(asset);
      if (kind === 'journal') {
        const p = parseJournal(rows);
        if (!p.layout) setMessage({ text: t.noHeader, error: true });
        else setParsed({ kind, entries: p.entries, errors: p.errors, skipped: p.skipped });
      } else if (kind === 'chart') {
        const p = parseChart(rows);
        setParsed({ kind, accounts: p.accounts, skipped: p.skipped });
      } else {
        const p = parseOpening(rows);
        setParsed({ kind, balances: p.balances, inverted: p.inverted });
      }
    } catch {
      setMessage({ text: t.unreadable, error: true });
    } finally {
      setBusy(null);
    }
  }

  const unknown = useMemo(() => {
    if (!parsed || parsed.kind === 'chart') return [] as string[];
    const codes = parsed.kind === 'journal' ? parsed.entries.flatMap((e) => e.lines.map((x) => x.account_code)) : [...parsed.balances.map((b) => b.code), '9100'];
    return [...new Set(codes)].filter((c) => !known.has(c)).sort();
  }, [parsed, known]);

  const opening = useMemo(() => {
    if (!parsed || parsed.kind !== 'opening') return null;
    const iso = parseSwissDate(openingDate);
    return iso ? openingEntry(parsed.balances, iso, l.import.kinds.opening) : null;
  }, [parsed, openingDate, l.import.kinds.opening]);

  async function run() {
    if (!parsed) return;
    setBusy('import');
    setMessage(null);
    if (parsed.kind === 'chart') {
      const { data, error } = await ledger.importAccounts(client.id, parsed.accounts);
      setBusy(null);
      if (error) return setMessage({ text: error, error: true });
      setMessage({ text: fill(t.done, { n: data ?? 0 }), error: false });
      setParsed(null);
      return onImported();
    }
    const list = parsed.kind === 'journal' ? parsed.entries : opening ? [opening] : [];
    let done = 0;
    for (let i = 0; i < list.length; i += 1000) {
      const { data, error } = await ledger.importEntries(client.id, list.slice(i, i + 1000), { post, createAccounts, source: parsed.kind === 'opening' ? 'opening' : 'import' });
      if (error) {
        setBusy(null);
        setMessage({ text: done ? fill(t.partial, { n: done, error }) : error, error: true });
        if (done) onImported();
        return;
      }
      done += data ?? 0;
    }
    setBusy(null);
    setMessage({ text: fill(t.done, { n: done }), error: false });
    setParsed(null);
    onImported();
  }

  const text = kind === 'journal' ? t.journalText : kind === 'chart' ? t.chartText : t.openingText;
  const canImport = !!parsed && (parsed.kind === 'chart' ? parsed.accounts.length > 0 : parsed.kind === 'journal' ? parsed.entries.length > 0 : !!opening) && (createAccounts || unknown.length === 0);
  return (
    <View style={{ gap: spacing.md }}>
      <Segmented
        value={kind}
        onChange={(k) => {
          setKind(k);
          setParsed(null);
          setMessage(null);
          setFile(null);
        }}
        options={(['journal', 'chart', 'opening'] as ImportKind[]).map((k) => ({ key: k, label: t.kinds[k] }))}
      />
      <Panel>
        <Text style={ps.small}>{text}</Text>
        <View style={ps.actions}>
          <Button title={t.pick} icon="upload" variant="secondary" onPress={pick} loading={busy === 'read'} />
          {file ? <Text style={ps.mono}>{file}</Text> : null}
        </View>
        {parsed?.kind === 'journal' ? (
          <View style={{ gap: spacing.sm }}>
            <Text style={ps.bodyStrong}>
              {fill(t.found, { entries: parsed.entries.length, lines: parsed.entries.reduce((s, e) => s + e.lines.length, 0), skipped: parsed.skipped })}
            </Text>
            {parsed.errors.length ? (
              <View style={{ gap: 2 }}>
                <Text style={[ps.small, { color: colors.danger }]}>{t.errors}</Text>
                {parsed.errors.slice(0, 8).map((e) => {
                  const [, d, c] = e.message.split(':');
                  return (
                    <Text key={e.row} style={[ps.small, { color: colors.danger }]}>
                      {fill(t.errorRow, { row: e.row, debit: d ?? '', credit: c ?? '' })}
                    </Text>
                  );
                })}
              </View>
            ) : null}
            <Text style={ps.label}>{t.preview}</Text>
            <View style={st.list}>
              {parsed.entries.slice(0, 8).map((e, i) => (
                <View key={i} style={[st.accRow, i > 0 && st.entryBorder]}>
                  <Text style={st.date}>{isoToSwiss(e.date)}</Text>
                  <Text style={[ps.mono, { width: 70 }]} numberOfLines={1}>
                    {e.reference ?? ''}
                  </Text>
                  <Text style={[ps.body, { flex: 1, minWidth: 120 }]} numberOfLines={1}>
                    {e.label}
                  </Text>
                  <Text style={[ps.mono, { color: colors.textMuted }]} numberOfLines={1}>
                    {e.lines.map((x) => x.account_code).join(' · ')}
                  </Text>
                  <Text style={[st.cellNum, { width: 110 }]}>{amountText(e.lines.reduce((s, x) => s + x.debit, 0))}</Text>
                </View>
              ))}
            </View>
            {parsed.entries.length > 8 ? <Text style={ps.small}>{fill(t.more, { n: parsed.entries.length - 8 })}</Text> : null}
          </View>
        ) : parsed?.kind === 'chart' ? (
          <View style={{ gap: spacing.sm }}>
            <Text style={ps.bodyStrong}>{fill(t.foundChart, { n: parsed.accounts.length, skipped: parsed.skipped })}</Text>
            <Text style={ps.small} numberOfLines={3}>
              {parsed.accounts.slice(0, 20).map((a) => `${a.code} ${a.label}`).join(' · ')}
            </Text>
          </View>
        ) : parsed?.kind === 'opening' ? (
          <View style={{ gap: spacing.sm }}>
            <Text style={ps.bodyStrong}>{fill(t.foundOpening, { n: parsed.balances.length })}</Text>
            {parsed.inverted ? <Text style={[ps.small, { color: colors.warning }]}>{t.inverted}</Text> : null}
            <Input label={t.openingDate} value={openingDate} onChangeText={setOpeningDate} style={{ width: 160 }} />
            {opening ? (
              <View style={st.linesBox}>
                {opening.lines.map((x, i) => (
                  <View key={i} style={st.lineRow}>
                    <Text style={[ps.mono, { width: 64 }]}>{x.account_code}</Text>
                    <Text style={[ps.small, { flex: 1 }]} numberOfLines={1}>
                      {x.account_label ?? accounts.find((a) => a.code === x.account_code)?.label ?? ''}
                    </Text>
                    <Text style={[st.cellNum, { width: 110 }]}>{x.debit ? amountText(x.debit) : ''}</Text>
                    <Text style={[st.cellNum, { width: 110 }]}>{x.credit ? amountText(x.credit) : ''}</Text>
                  </View>
                ))}
              </View>
            ) : null}
            {opening && opening.lines.some((x) => x.account_code === '9100') ? (
              <Text style={[ps.small, { color: colors.warning }]}>
                {fill(t.diff, { amount: formatChf(opening.lines.filter((x) => x.account_code === '9100').reduce((s, x) => s + x.debit + x.credit, 0)) })}
              </Text>
            ) : null}
          </View>
        ) : null}
        {parsed && parsed.kind !== 'chart' ? (
          <View style={{ gap: spacing.sm }}>
            {unknown.length ? <Text style={[ps.small, { color: colors.warning }]}>{fill(t.unknown, { n: unknown.length, list: unknown.slice(0, 12).join(', ') + (unknown.length > 12 ? '…' : '') })}</Text> : null}
            {unknown.length ? <Toggle value={createAccounts} onChange={setCreateAccounts} label={t.createAccounts} /> : null}
            <Toggle value={post} onChange={setPost} label={t.post} />
          </View>
        ) : null}
        {parsed ? (
          <View style={ps.actions}>
            <Button title={t.confirm} icon="check" onPress={run} loading={busy === 'import'} disabled={!canImport} />
          </View>
        ) : null}
        <Message value={message} />
      </Panel>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Period locking

function SettingsView({ client, isAdmin, onChanged }: { client: ExternalClient; isAdmin: boolean; onChanged: () => void }) {
  const l = useLedgerCopy();
  const t = l.settings;
  const [date, setDate] = useState(client.ledger_locked_until ? isoToSwiss(client.ledger_locked_until) : '');
  const [confirm, setConfirm] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  async function lock(until: string | null) {
    const { error } = await ledger.setLock(client.id, until);
    setConfirm(false);
    setMessage(error ? { text: error, error: true } : { text: t.done, error: false });
    if (!error) onChanged();
  }
  return (
    <Panel title={t.lockTitle}>
      <Text style={ps.small}>{t.lockText}</Text>
      <Text style={ps.bodyStrong}>{client.ledger_locked_until ? fill(t.lockedUntil, { date: isoToSwiss(client.ledger_locked_until) }) : t.notLocked}</Text>
      {isAdmin ? (
        <>
          <View style={ps.row}>
            <Input label={t.lockDate} value={date} onChangeText={setDate} placeholder="31.12.2025" style={{ width: 170 }} />
            <Button
              title={t.lock}
              icon="lock"
              onPress={() => {
                const iso = parseSwissDate(date);
                if (iso) lock(iso);
              }}
              disabled={!parseSwissDate(date)}
            />
          </View>
          {client.ledger_locked_until ? (
            <LinkButton label={confirm ? t.unlockConfirm : t.unlock} icon="unlock" tone={confirm ? 'danger' : 'muted'} onPress={() => (confirm ? lock(null) : setConfirm(true))} />
          ) : null}
        </>
      ) : (
        <Text style={ps.small}>{t.adminOnly}</Text>
      )}
      <Message value={message} />
    </Panel>
  );
}

const st = StyleSheet.create({
  periodRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.md },
  shrink: { maxWidth: '100%', flexShrink: 1 },
  notice: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingVertical: 6, paddingHorizontal: spacing.md, borderRadius: radius.md, backgroundColor: colors.surfaceAlt },
  startRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg },
  startCard: { gap: 6, flexBasis: 280, flexGrow: 1 },
  list: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, overflow: 'hidden' },
  entry: {},
  entryBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  entryHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 10, paddingHorizontal: spacing.md, flexWrap: 'wrap' },
  entryBody: { gap: spacing.sm, paddingHorizontal: spacing.md, paddingBottom: spacing.md },
  no: { ...monoType, fontSize: 12, fontWeight: '800', color: colors.text, width: 64 } as any,
  date: { ...monoType, fontSize: 12, color: colors.textMuted, width: 84 } as any,
  amount: { ...monoType, fontSize: 13, fontWeight: '700', color: colors.text, minWidth: 100, textAlign: 'right' } as any,
  badges: { flexDirection: 'row', gap: 4, flexWrap: 'wrap' },
  linesBox: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.sm, backgroundColor: colors.surface },
  lineRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 6, flexWrap: 'wrap' },
  lineEdit: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, flexWrap: 'wrap' },
  cellNum: { ...monoType, fontSize: 12, color: colors.text, textAlign: 'right' } as any,
  suggest: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface, overflow: 'hidden' },
  suggestRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 7, paddingHorizontal: spacing.sm },
  accRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 9, paddingHorizontal: spacing.md, flexWrap: 'wrap' },
  tableScroll: { width: '100%', overflowX: 'auto' } as any,
  table: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, overflow: 'hidden' },
  tr: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 7, paddingHorizontal: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  thRow: { backgroundColor: colors.surfaceAlt, borderTopWidth: 0 },
  th: { fontSize: 11, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.4 },
  td: { fontSize: fontSize.sm, color: colors.text },
  numCol: { width: 112, textAlign: 'right' },
  twoCols: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, alignItems: 'flex-start' },
  col: { flexGrow: 1, flexBasis: 340, minWidth: 0 },
  line: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md, paddingVertical: 3 },
  lineLabel: { flex: 1, fontSize: fontSize.sm, color: colors.text },
  lineValue: { ...monoType, fontSize: 12, color: colors.text } as any,
  lineStrong: { fontWeight: '800' },
  colHead: { minWidth: 96, textAlign: 'right' },
});
