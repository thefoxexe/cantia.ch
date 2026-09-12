import { useCallback, useMemo, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import {
  createDraftEntry,
  getFiscalYearForDate,
  addEntryLine,
  postEntry,
  reverseEntry,
  listAccounts,
  listJournals,
  listEntries,
  getIncomeStatement,
  getBalanceSheet,
  getTrialBalance,
  getGeneralLedger,
  getFinancialSnapshot,
  entriesToCsv,
  postPayrollMonth,
  getVatSettings,
  updateVatSettings,
  getVatReportByCode,
  getVatCodeDrilldown,
  vatWorksheetToCsv,
  buildEch0217Xml,
  type AccountingAccount,
  type AccountingJournal,
  type AccountingEntryWithLines,
  type IncomeStatement,
  type BalanceSheet,
  type TrialBalanceRow,
  type LedgerEntryRow,
  type FinancialSnapshot,
  type VatSettings,
  type VatLedgerReport,
  type VatDrilldownRow,
} from '../../../lib/api/accounting';
import { getVatReport, type VatReport, type VatReportBasis } from '../../../lib/api/factures';
import { downloadTextFile } from '../../../lib/downloadFile';
import { confirm } from '../../../lib/confirm';
import { Button, Card, EmptyState, LoadingScreen, PageHeader, Screen } from '../../../components/ui';
import { showSavedCheckmark } from '../../../components/SaveConfirmation';
import { getAppLocale, useTranslation } from '../../../lib/translations';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';

type Tab = 'apercu' | 'ecritures' | 'rapports' | 'tva';
type ReportView = 'balance' | 'grandLivre' | 'bilan';

function quarterOf(date: Date): number {
  return Math.floor(date.getUTCMonth() / 3) + 1;
}
function quarterBounds(year: number, quarter: number): { start: string; end: string } {
  const startMonth = (quarter - 1) * 3;
  const start = new Date(Date.UTC(year, startMonth, 1));
  const end = new Date(Date.UTC(year, startMonth + 3, 1));
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
}
function chf(n: number): string {
  return `CHF ${n.toLocaleString(`${getAppLocale()}-CH`, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function escapeCsv(value: string): string {
  return /[;"\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}
function buildVatReportCsv(
  report: VatReport,
  periodLabel: string,
  labels: { rate: string; turnover: string; vat: string; totalTurnover: string; totalVat: string; deductibleBase: string; deductibleVat: string; net: string },
): string {
  const lines: string[] = [];
  lines.push(escapeCsv(periodLabel));
  lines.push('');
  lines.push([labels.rate, labels.turnover, labels.vat].map(escapeCsv).join(';'));
  for (const row of report.rows) lines.push([`${row.vatRate}%`, row.turnoverExclVat.toFixed(2), row.vatAmount.toFixed(2)].map(escapeCsv).join(';'));
  lines.push([labels.totalTurnover, report.totalExclVat.toFixed(2), report.totalVat.toFixed(2)].map(escapeCsv).join(';'));
  lines.push('');
  lines.push([labels.rate, labels.deductibleBase, labels.deductibleVat].map(escapeCsv).join(';'));
  for (const row of report.deductibleRows) lines.push([`${row.vatRate}%`, row.turnoverExclVat.toFixed(2), row.vatAmount.toFixed(2)].map(escapeCsv).join(';'));
  lines.push(['', labels.deductibleBase, report.totalDeductibleVat.toFixed(2)].map(escapeCsv).join(';'));
  lines.push('');
  lines.push([labels.net, '', report.netVatDue.toFixed(2)].map(escapeCsv).join(';'));
  return lines.join('\n');
}

interface DraftLine {
  key: string;
  accountId: string | null;
  side: 'debit' | 'credit';
  amount: string;
  label: string;
}

export default function AccountingScreen() {
  const { t } = useTranslation();
  const { organization } = useAuth();
  const now = useMemo(() => new Date(), []);
  const [tab, setTab] = useState<Tab>('apercu');
  const [reportView, setReportView] = useState<ReportView>('balance');
  const [year, setYear] = useState(now.getUTCFullYear());
  const [quarter, setQuarter] = useState(quarterOf(now));
  const [basis, setBasis] = useState<VatReportBasis>('invoiced');
  const [loading, setLoading] = useState(true);

  const [accounts, setAccounts] = useState<AccountingAccount[]>([]);
  const [journals, setJournals] = useState<AccountingJournal[]>([]);
  const [entries, setEntries] = useState<AccountingEntryWithLines[]>([]);
  const [income, setIncome] = useState<IncomeStatement | null>(null);
  const [balanceSheet, setBalanceSheet] = useState<BalanceSheet | null>(null);
  const [trialBalance, setTrialBalance] = useState<TrialBalanceRow[]>([]);
  const [snapshot, setSnapshot] = useState<FinancialSnapshot | null>(null);
  const [vatReport, setVatReport] = useState<VatReport | null>(null);
  const [vatSettings, setVatSettings] = useState<VatSettings | null>(null);
  const [vatLedgerReport, setVatLedgerReport] = useState<VatLedgerReport | null>(null);
  const [expandedVatCode, setExpandedVatCode] = useState<string | null>(null);
  const [vatDrilldown, setVatDrilldown] = useState<VatDrilldownRow[]>([]);
  const [vatSettingsOpen, setVatSettingsOpen] = useState(false);
  const vatSettingsAutoOpened = useRef(false);
  const [vatSettingsSaving, setVatSettingsSaving] = useState(false);
  const [ech0217Warnings, setEch0217Warnings] = useState<string[] | null>(null);

  const [ledgerAccountId, setLedgerAccountId] = useState<string | null>(null);
  const [ledgerRows, setLedgerRows] = useState<LedgerEntryRow[]>([]);
  const [accountPickerOpen, setAccountPickerOpen] = useState(false);
  const [accountPickerFor, setAccountPickerFor] = useState<string | null>(null); // draft line key, or 'ledger'

  const [newEntryOpen, setNewEntryOpen] = useState(false);
  const [entryLabel, setEntryLabel] = useState('');
  const [entryDate, setEntryDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [entryJournalId, setEntryJournalId] = useState<string | null>(null);
  const [draftLines, setDraftLines] = useState<DraftLine[]>([
    { key: 'a', accountId: null, side: 'debit', amount: '', label: '' },
    { key: 'b', accountId: null, side: 'credit', amount: '', label: '' },
  ]);
  const [entrySaving, setEntrySaving] = useState(false);
  const [entryError, setEntryError] = useState<string | null>(null);
  const [entryActionError, setEntryActionError] = useState<string | null>(null);

  const [payrollMonth, setPayrollMonth] = useState(String(now.getUTCMonth() + 1).padStart(2, '0'));
  const [payrollYear, setPayrollYear] = useState(String(now.getUTCFullYear()));
  const [payrollPosting, setPayrollPosting] = useState(false);
  const [payrollResult, setPayrollResult] = useState<string | null>(null);

  const { start: periodStart, end: periodEnd } = quarterBounds(year, quarter);

  const load = useCallback(async () => {
    if (!organization) return;
    setLoading(true);
    const [accountRows, journalRows, entryRows, incomeStmt, snap, vat, trial, vSettings] = await Promise.all([
      listAccounts(organization.id),
      listJournals(organization.id),
      listEntries(organization.id, { periodStart, periodEnd: quarterBounds(year, quarter).end }),
      getIncomeStatement(organization.id, periodStart, periodEnd),
      getFinancialSnapshot(organization.id),
      getVatReport(organization.id, `${periodStart}T00:00:00Z`, `${periodEnd}T00:00:00Z`, basis),
      getTrialBalance(organization.id, periodStart, periodEnd),
      getVatSettings(organization.id),
    ]);
    setAccounts(accountRows);
    setJournals(journalRows);
    setEntries(entryRows);
    setIncome(incomeStmt);
    setSnapshot(snap);
    setVatReport(vat);
    setTrialBalance(trial);
    setVatSettings(vSettings);
    // Auto-expand the VAT settings accordion the first time we learn the
    // org isn't liable yet — the eCH-0217 export footnote tells the user
    // to "activate it above", which is only true if this card is open.
    if (!vSettings?.vatLiable && !vatSettingsAutoOpened.current) {
      vatSettingsAutoOpened.current = true;
      setVatSettingsOpen(true);
    }
    const vatLedger = await getVatReportByCode(organization.id, periodStart, periodEnd, vSettings?.vatRounding ?? 'aucun');
    setVatLedgerReport(vatLedger);
    setExpandedVatCode(null);
    setVatDrilldown([]);
    const bilan = await getBalanceSheet(organization.id, `${year}-01-01`, periodEnd < today() ? periodEnd : today());
    setBalanceSheet(bilan);
    if (!entryJournalId && journalRows.length) setEntryJournalId(journalRows.find((j) => j.code === 'OD')?.id ?? journalRows[0].id);
    setLoading(false);
  }, [organization, year, quarter, basis]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  function today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  function changeQuarter(delta: number) {
    let q = quarter + delta;
    let y = year;
    if (q < 1) { q = 4; y -= 1; } else if (q > 4) { q = 1; y += 1; }
    setQuarter(q);
    setYear(y);
  }

  async function loadLedger(accountId: string) {
    if (!organization) return;
    setLedgerAccountId(accountId);
    const { rows } = await getGeneralLedger(organization.id, accountId, periodStart, periodEnd);
    setLedgerRows(rows);
  }

  function handleExportEntries() {
    if (!entries.length) return;
    downloadTextFile(`ecritures-${year}-t${quarter}.csv`, entriesToCsv(entries));
  }

  function handleExportVat() {
    if (!vatReport) return;
    const periodLabel = t('vatReport.quarterLabel', { quarter, year });
    const csv = buildVatReportCsv(vatReport, periodLabel, {
      rate: t('vatReport.csvRate'), turnover: t('vatReport.csvTurnover'), vat: t('vatReport.csvVat'),
      totalTurnover: t('vatReport.totalTurnover'), totalVat: t('vatReport.totalVatDue'),
      deductibleBase: t('vatReport.csvDeductibleBase'), deductibleVat: t('vatReport.totalDeductibleVat'), net: t('vatReport.netVatDue'),
    });
    downloadTextFile(`tva-${year}-t${quarter}.csv`, csv);
  }

  function handleExportVatWorksheet() {
    if (!vatLedgerReport) return;
    const periodLabel = t('vatReport.quarterLabel', { quarter, year });
    const csv = vatWorksheetToCsv(vatLedgerReport, periodLabel, vatSettings);
    downloadTextFile(`feuille-de-travail-tva-${year}-t${quarter}.csv`, csv);
  }

  function hasValidSwissIde(ide: string | null | undefined): boolean {
    if (!ide) return false;
    return /CHE/i.test(ide) && ide.replace(/[^0-9]/g, '').length === 9;
  }

  const ech0217BlockedReason: string | null = !vatSettings || !vatSettings.vatLiable
    ? t('accounting.ech0217NotLiable')
    : vatSettings.vatMethod !== 'effective'
    ? t('accounting.ech0217NeedsEffective')
    : vatSettings.vatBasisDefault !== 'invoiced'
    ? t('accounting.ech0217NeedsInvoiced')
    : !hasValidSwissIde(organization?.ide_number)
    ? t('accounting.ech0217NeedsIde')
    : null;

  function handleExportEch0217() {
    if (!vatLedgerReport || !vatSettings || !organization) return;
    setEch0217Warnings(null);
    try {
      const { xml, warnings } = buildEch0217Xml(
        { name: organization.name, ide_number: organization.ide_number },
        periodStart,
        periodEnd,
        `TVA-${year}-T${quarter}`,
        vatSettings,
        vatLedgerReport,
      );
      downloadTextFile(`ech0217-tva-${year}-t${quarter}.xml`, xml, 'application/xml');
      if (warnings.length) setEch0217Warnings(warnings);
      else showSavedCheckmark();
    } catch (err) {
      setEch0217Warnings([err instanceof Error ? err.message : String(err)]);
    }
  }

  async function toggleVatCodeDrilldown(code: string) {
    if (!organization) return;
    if (expandedVatCode === code) {
      setExpandedVatCode(null);
      setVatDrilldown([]);
      return;
    }
    setExpandedVatCode(code);
    const rows = await getVatCodeDrilldown(organization.id, code, periodStart, periodEnd);
    setVatDrilldown(rows);
  }

  async function handleSaveVatSettings(updates: Partial<VatSettings>) {
    if (!organization) return;
    setVatSettingsSaving(true);
    const { error } = await updateVatSettings(organization.id, updates);
    setVatSettingsSaving(false);
    if (!error) {
      setVatSettings((prev) => (prev ? { ...prev, ...updates } : prev));
      load();
    }
  }

  function openNewEntry() {
    setEntryLabel('');
    setEntryDate(today());
    setDraftLines([
      { key: `${Date.now()}a`, accountId: null, side: 'debit', amount: '', label: '' },
      { key: `${Date.now()}b`, accountId: null, side: 'credit', amount: '', label: '' },
    ]);
    setEntryError(null);
    setNewEntryOpen(true);
  }
  function addDraftLine(side: 'debit' | 'credit') {
    setDraftLines((prev) => [...prev, { key: `${Date.now()}${Math.random()}`, accountId: null, side, amount: '', label: '' }]);
  }
  function removeDraftLine(key: string) {
    setDraftLines((prev) => prev.filter((l) => l.key !== key));
  }
  function updateDraftLine(key: string, patch: Partial<DraftLine>) {
    setDraftLines((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  }

  const totalDebit = draftLines.reduce((s, l) => (l.side === 'debit' ? s + (Number(l.amount.replace(',', '.')) || 0) : s), 0);
  const totalCredit = draftLines.reduce((s, l) => (l.side === 'credit' ? s + (Number(l.amount.replace(',', '.')) || 0) : s), 0);
  const isBalanced = draftLines.length >= 2 && totalDebit > 0 && Math.round(totalDebit * 100) === Math.round(totalCredit * 100) && draftLines.every((l) => l.accountId && Number(l.amount) > 0);

  async function handleSubmitEntry() {
    if (!organization || !entryJournalId || !isBalanced) return;
    setEntrySaving(true);
    setEntryError(null);
    const fiscalYear = await getFiscalYearForDate(organization.id, entryDate);
    if (!fiscalYear) {
      setEntrySaving(false);
      setEntryError(t('accounting.noFiscalYearForDate'));
      return;
    }
    const { id, error } = await createDraftEntry({
      organizationId: organization.id,
      fiscalYearId: fiscalYear.id,
      journalId: entryJournalId,
      entryDate: entryDate,
      label: entryLabel || t('accounting.manualEntryDefaultLabel'),
    });
    if (!id) {
      setEntrySaving(false);
      setEntryError(error);
      return;
    }
    for (const l of draftLines) {
      if (!l.accountId) continue;
      const amount = Number(l.amount.replace(',', '.'));
      await addEntryLine({
        entryId: id,
        accountId: l.accountId,
        debit: l.side === 'debit' ? amount : 0,
        credit: l.side === 'credit' ? amount : 0,
        label: l.label || null,
        sortOrder: draftLines.indexOf(l),
      });
    }
    const { error: postError } = await postEntry(id);
    setEntrySaving(false);
    if (postError) {
      setEntryError(postError);
      return;
    }
    setNewEntryOpen(false);
    await load();
    showSavedCheckmark();
  }

  async function handlePost(id: string) {
    setEntryActionError(null);
    const { error } = await postEntry(id);
    if (error) setEntryActionError(error);
    else load();
  }
  async function handleReverse(id: string) {
    const ok = await confirm(t('accounting.reverseConfirmTitle'), t('accounting.reverseConfirmBody'));
    if (!ok) return;
    setEntryActionError(null);
    const { error } = await reverseEntry(id);
    if (error) setEntryActionError(error);
    else load();
  }

  async function handlePostPayroll() {
    if (!organization) return;
    setPayrollPosting(true);
    setPayrollResult(null);
    const res = await postPayrollMonth(organization.id, Number(payrollYear), Number(payrollMonth));
    setPayrollPosting(false);
    if (res.error) {
      setPayrollResult(res.error);
      return;
    }
    setPayrollResult(t('accounting.payrollPostedSummary', { posted: res.posted, skipped: res.skipped }));
    if (res.errors.length) setPayrollResult((s) => `${s} — ${res.errors.join('; ')}`);
    load();
  }

  if (!organization) return <LoadingScreen />;

  const accountForPicker = accountPickerFor === 'ledger' ? null : draftLines.find((l) => l.key === accountPickerFor);
  const selectedAccountForActivePicker = accountForPicker ? accounts.find((a) => a.id === accountForPicker.accountId) : null;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing.xxl * 2 }}>
        <PageHeader title={t('accounting.title')} backTo="/(app)" />
        <Text style={styles.pageSubtitle}>{t('accounting.subtitleV2')}</Text>

        <View style={styles.tabRow}>
          {(['apercu', 'ecritures', 'rapports', 'tva'] as Tab[]).map((tKey) => (
            <Pressable key={tKey} onPress={() => setTab(tKey)} style={[styles.tabChip, tab === tKey && styles.tabChipActive]}>
              <Text style={[styles.tabChipText, tab === tKey && styles.tabChipTextActive]}>{t(`accounting.tab_${tKey}` as any)}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.periodRow}>
          <Pressable onPress={() => changeQuarter(-1)} hitSlop={8} style={styles.periodArrow}>
            <Feather name="chevron-left" size={18} color={colors.text} />
          </Pressable>
          <Text style={styles.periodLabel}>{t('accounting.quarterLabel', { quarter, year })}</Text>
          <Pressable onPress={() => changeQuarter(1)} hitSlop={8} style={styles.periodArrow}>
            <Feather name="chevron-right" size={18} color={colors.text} />
          </Pressable>
        </View>

        {loading ? (
          <LoadingScreen />
        ) : tab === 'apercu' ? (
          <View style={{ gap: spacing.lg, marginTop: spacing.lg }}>
            <Card>
              <Text style={styles.sectionTitle}>{t('accounting.snapshotTitle')}</Text>
              <View style={styles.snapshotRow}>
                <View style={styles.snapshotItem}>
                  <Text style={styles.snapshotLabel}>{t('accounting.cashLabel')}</Text>
                  <Text style={styles.snapshotValue}>{snapshot?.cashBalance != null ? chf(snapshot.cashBalance) : t('accounting.noCashSnapshot')}</Text>
                </View>
                <View style={styles.snapshotItem}>
                  <Text style={styles.snapshotLabel}>{t('accounting.receivablesLabel')}</Text>
                  <Text style={styles.snapshotValue}>{chf(snapshot?.receivables ?? 0)}</Text>
                </View>
              </View>
            </Card>

            <Card>
              <Text style={styles.sectionTitle}>{t('accounting.incomeStatementTitle')}</Text>
              {!income || (income.produits === 0 && income.totalCharges === 0) ? (
                <EmptyState title={t('accounting.emptyTitle')} subtitle={t('accounting.emptySubtitle')} />
              ) : (
                <View style={styles.breakdownRows}>
                  <View style={styles.row}>
                    <Text style={styles.rowLabelBold}>{t('accounting.produits')}</Text>
                    <Text style={styles.rowValueBold}>{chf(income.produits)}</Text>
                  </View>
                  {income.charges.map((c) => (
                    <View key={c.code} style={styles.row}>
                      <Text style={styles.rowLabel}>− {c.label}</Text>
                      <Text style={styles.rowValue}>{chf(c.amount)}</Text>
                    </View>
                  ))}
                  <View style={styles.divider} />
                  <View style={styles.row}>
                    <Text style={styles.rowLabelFinal}>{t('accounting.resultat')}</Text>
                    <Text style={[styles.rowValueFinal, income.resultat < 0 && styles.rowValueNegative]}>{chf(income.resultat)}</Text>
                  </View>
                </View>
              )}
            </Card>

            <Card>
              <Text style={styles.sectionTitle}>{t('accounting.balanceSheetTitle')}</Text>
              {!balanceSheet ? (
                <EmptyState title={t('accounting.emptyTitle')} subtitle={t('accounting.emptySubtitle')} />
              ) : (
                <View style={styles.breakdownRows}>
                  <View style={styles.row}>
                    <Text style={styles.rowLabelBold}>{t('accounting.totalActifs')}</Text>
                    <Text style={styles.rowValueBold}>{chf(balanceSheet.totalActifs)}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.rowLabelBold}>{t('accounting.totalPassifs')}</Text>
                    <Text style={styles.rowValueBold}>{chf(balanceSheet.totalPassifs)}</Text>
                  </View>
                  {Math.abs(balanceSheet.ecart) > 0.01 ? (
                    <Text style={styles.ecartWarning}>{t('accounting.bilanEcart', { amount: balanceSheet.ecart.toFixed(2) })}</Text>
                  ) : null}
                </View>
              )}
            </Card>

            <Card>
              <Text style={styles.sectionTitle}>{t('accounting.payrollPostingTitle')}</Text>
              <Text style={styles.snapshotFootnote}>{t('accounting.payrollPostingHint')}</Text>
              <View style={styles.payrollRow}>
                <TextInput style={styles.payrollInput} value={payrollMonth} onChangeText={setPayrollMonth} keyboardType="number-pad" maxLength={2} />
                <Text style={styles.payrollSlash}>/</Text>
                <TextInput style={styles.payrollInput} value={payrollYear} onChangeText={setPayrollYear} keyboardType="number-pad" maxLength={4} />
                <Button title={t('accounting.payrollPostButton')} onPress={handlePostPayroll} loading={payrollPosting} style={{ flex: 1, marginLeft: spacing.sm }} />
              </View>
              {payrollResult ? <Text style={styles.payrollResult}>{payrollResult}</Text> : null}
            </Card>
          </View>
        ) : tab === 'ecritures' ? (
          <View style={{ gap: spacing.md, marginTop: spacing.lg }}>
            <Button title={t('accounting.newEntry')} icon="plus" onPress={openNewEntry} />
            <Button title={t('accounting.exportCsv')} icon="download" variant="secondary" onPress={handleExportEntries} />
            {entryActionError ? <Text style={styles.error}>{entryActionError}</Text> : null}
            {entries.length === 0 ? (
              <Card><EmptyState title={t('accounting.emptyTitle')} subtitle={t('accounting.emptySubtitle')} /></Card>
            ) : (
              entries.map((e) => {
                // A reversal entry (created by "Extourner") is itself posted
                // as comptabilisée so it stays visible in reports — but it
                // must never be re-reversible, or a confused user chains
                // reversal-of-reversal indefinitely (each individually valid,
                // since only the ORIGINAL entry's own status is checked).
                const isReversal = e.source === 'extourne';
                return (
                <Card key={e.id} style={styles.entryCard}>
                  <View style={styles.entryHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.entryLabel}>{e.entry_number != null ? `N°${e.entry_number} — ` : ''}{e.label}</Text>
                      <Text style={styles.entryMeta}>{new Date(e.entry_date).toLocaleDateString(`${getAppLocale()}-CH`)} · {e.journal_label}</Text>
                    </View>
                    {isReversal ? (
                      <View style={[styles.statusBadge, styles.reversalBadge]}>
                        <Text style={styles.statusBadgeText}>{t('accounting.reversalBadge')}</Text>
                      </View>
                    ) : null}
                    <View style={[styles.statusBadge, statusStyle(e.status)]}>
                      <Text style={styles.statusBadgeText}>{t(`accounting.status_${e.status}` as any)}</Text>
                    </View>
                  </View>
                  <View style={styles.entryLines}>
                    {e.lines.map((l) => (
                      <View key={l.id} style={styles.entryLineRow}>
                        <Text style={styles.entryLineAccount}>{l.account_code} {l.account_label}</Text>
                        <Text style={styles.entryLineAmount}>{l.debit > 0 ? chf(l.debit) : ''}</Text>
                        <Text style={styles.entryLineAmountCredit}>{l.credit > 0 ? chf(l.credit) : ''}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={styles.entryActions}>
                    {e.status === 'brouillon' ? <Button title={t('accounting.post')} onPress={() => handlePost(e.id)} variant="secondary" /> : null}
                    {e.status === 'comptabilisee' && !isReversal ? <Button title={t('accounting.reverse')} onPress={() => handleReverse(e.id)} variant="danger" /> : null}
                  </View>
                </Card>
                );
              })
            )}
          </View>
        ) : tab === 'rapports' ? (
          <View style={{ gap: spacing.md, marginTop: spacing.lg }}>
            <View style={styles.tabRow}>
              {(['balance', 'grandLivre', 'bilan'] as ReportView[]).map((rKey) => (
                <Pressable key={rKey} onPress={() => setReportView(rKey)} style={[styles.tabChip, reportView === rKey && styles.tabChipActive]}>
                  <Text style={[styles.tabChipText, reportView === rKey && styles.tabChipTextActive]}>{t(`accounting.report_${rKey}` as any)}</Text>
                </Pressable>
              ))}
            </View>

            {reportView === 'balance' ? (
              trialBalance.length === 0 ? (
                <Card><EmptyState title={t('accounting.emptyTitle')} subtitle={t('accounting.emptySubtitle')} /></Card>
              ) : (
                <Card>
                  <View style={styles.balanceHeaderRow}>
                    <Text style={[styles.balanceHeaderCell, { flex: 2 }]}>{t('accounting.account')}</Text>
                    <Text style={styles.balanceHeaderCell}>{t('accounting.opening')}</Text>
                    <Text style={styles.balanceHeaderCell}>{t('accounting.debitCol')}</Text>
                    <Text style={styles.balanceHeaderCell}>{t('accounting.creditCol')}</Text>
                    <Text style={styles.balanceHeaderCell}>{t('accounting.closing')}</Text>
                  </View>
                  {trialBalance.map((r) => (
                    <Pressable key={r.accountId} style={styles.balanceRow} onPress={() => { setReportView('grandLivre'); loadLedger(r.accountId); }}>
                      <Text style={[styles.balanceCell, { flex: 2, fontWeight: '600' }]}>{r.code} {r.label}</Text>
                      <Text style={styles.balanceCell}>{r.openingBalance.toFixed(2)}</Text>
                      <Text style={styles.balanceCell}>{r.debitMovements.toFixed(2)}</Text>
                      <Text style={styles.balanceCell}>{r.creditMovements.toFixed(2)}</Text>
                      <Text style={styles.balanceCell}>{r.closingBalance.toFixed(2)}</Text>
                    </Pressable>
                  ))}
                </Card>
              )
            ) : reportView === 'grandLivre' ? (
              <View style={{ gap: spacing.sm }}>
                <Pressable style={styles.accountSelectTrigger} onPress={() => { setAccountPickerFor('ledger'); setAccountPickerOpen(true); }}>
                  <Feather name="book" size={16} color={colors.primary} />
                  <Text style={styles.accountSelectText}>
                    {ledgerAccountId ? accounts.find((a) => a.id === ledgerAccountId)?.label ?? t('accounting.pickAccount') : t('accounting.pickAccount')}
                  </Text>
                  <Feather name="chevron-right" size={16} color={colors.textMuted} style={{ marginLeft: 'auto' }} />
                </Pressable>
                {!ledgerAccountId ? (
                  <Card><EmptyState title={t('accounting.pickAccount')} subtitle={t('accounting.pickAccountHint')} /></Card>
                ) : ledgerRows.length === 0 ? (
                  <Card><EmptyState title={t('accounting.emptyTitle')} subtitle={t('accounting.emptySubtitle')} /></Card>
                ) : (
                  <Card>
                    {ledgerRows.map((r, idx) => (
                      <View key={idx} style={styles.ledgerRow2}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.ledgerLabel}>{r.entryNumber != null ? `N°${r.entryNumber} — ` : ''}{r.label}</Text>
                          <Text style={styles.ledgerMeta}>{new Date(r.entryDate).toLocaleDateString(`${getAppLocale()}-CH`)} · D {r.debit.toFixed(2)} / C {r.credit.toFixed(2)}</Text>
                        </View>
                        <Text style={styles.ledgerBalance}>{chf(r.runningBalance)}</Text>
                      </View>
                    ))}
                  </Card>
                )}
              </View>
            ) : (
              <Card>
                {!balanceSheet ? (
                  <EmptyState title={t('accounting.emptyTitle')} subtitle={t('accounting.emptySubtitle')} />
                ) : (
                  <View style={styles.breakdownRows}>
                    <Text style={styles.sectionLabel}>{t('accounting.totalActifs')}</Text>
                    {balanceSheet.actifs.map((l) => (
                      <View key={l.code} style={styles.row}>
                        <Text style={styles.rowLabel}>{l.code} {l.label}</Text>
                        <Text style={styles.rowValue}>{chf(l.amount)}</Text>
                      </View>
                    ))}
                    <View style={styles.row}>
                      <Text style={styles.rowLabelBold}>{t('accounting.totalActifs')}</Text>
                      <Text style={styles.rowValueBold}>{chf(balanceSheet.totalActifs)}</Text>
                    </View>
                    <View style={styles.divider} />
                    <Text style={styles.sectionLabel}>{t('accounting.totalPassifs')}</Text>
                    {balanceSheet.passifs.map((l) => (
                      <View key={l.code} style={styles.row}>
                        <Text style={styles.rowLabel}>{l.code} {l.label}</Text>
                        <Text style={styles.rowValue}>{chf(l.amount)}</Text>
                      </View>
                    ))}
                    <View style={styles.row}>
                      <Text style={styles.rowLabel}>{t('accounting.resultatExercice')}</Text>
                      <Text style={styles.rowValue}>{chf(balanceSheet.resultatExercice)}</Text>
                    </View>
                    <View style={styles.row}>
                      <Text style={styles.rowLabelBold}>{t('accounting.totalPassifs')}</Text>
                      <Text style={styles.rowValueBold}>{chf(balanceSheet.totalPassifs)}</Text>
                    </View>
                    {Math.abs(balanceSheet.ecart) > 0.01 ? (
                      <Text style={styles.ecartWarning}>{t('accounting.bilanEcart', { amount: balanceSheet.ecart.toFixed(2) })}</Text>
                    ) : null}
                  </View>
                )}
              </Card>
            )}
          </View>
        ) : (
          <View style={{ gap: spacing.md, marginTop: spacing.lg }}>
            <Card>
              <Pressable style={styles.ledgerToggle} onPress={() => setVatSettingsOpen((v) => !v)}>
                <Text style={styles.sectionTitle}>{t('accounting.vatSettingsTitle')}</Text>
                <Feather name={vatSettingsOpen ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
              </Pressable>
              {!vatSettingsOpen ? (
                <Text style={styles.snapshotFootnote}>
                  {vatSettings?.vatLiable
                    ? t('accounting.vatSettingsSummary', {
                        method: vatSettings.vatMethod === 'tdfn' ? t('accounting.vatMethodTdfn') : t('accounting.vatMethodEffective'),
                        periodicity: t(`accounting.vatPeriodicity_${vatSettings.vatPeriodicity}` as any),
                      })
                    : t('accounting.vatNotLiable')}
                </Text>
              ) : (
                <View style={{ gap: spacing.md, marginTop: spacing.md }}>
                  <View style={styles.vatSettingRow}>
                    <Text style={styles.rowLabelBold}>{t('accounting.vatLiable')}</Text>
                    <Pressable onPress={() => handleSaveVatSettings({ vatLiable: !vatSettings?.vatLiable })} style={[styles.toggleBox, vatSettings?.vatLiable && styles.toggleBoxActive]}>
                      <Text style={styles.toggleBoxText}>{vatSettings?.vatLiable ? t('accounting.yes') : t('accounting.no')}</Text>
                    </Pressable>
                  </View>

                  <Text style={styles.fieldLabel}>{t('accounting.vatMethod')}</Text>
                  <View style={styles.chips}>
                    <Pressable onPress={() => handleSaveVatSettings({ vatMethod: 'effective' })} style={[styles.chip, vatSettings?.vatMethod === 'effective' && styles.chipActive]}>
                      <Text style={[styles.chipText, vatSettings?.vatMethod === 'effective' && styles.chipTextActive]}>{t('accounting.vatMethodEffective')}</Text>
                    </Pressable>
                    <Pressable onPress={() => handleSaveVatSettings({ vatMethod: 'tdfn' })} style={[styles.chip, vatSettings?.vatMethod === 'tdfn' && styles.chipActive]}>
                      <Text style={[styles.chipText, vatSettings?.vatMethod === 'tdfn' && styles.chipTextActive]}>{t('accounting.vatMethodTdfn')}</Text>
                    </Pressable>
                  </View>

                  <Text style={styles.fieldLabel}>{t('accounting.vatBasisDefault')}</Text>
                  <View style={styles.chips}>
                    <Pressable onPress={() => handleSaveVatSettings({ vatBasisDefault: 'invoiced' })} style={[styles.chip, vatSettings?.vatBasisDefault === 'invoiced' && styles.chipActive]}>
                      <Text style={[styles.chipText, vatSettings?.vatBasisDefault === 'invoiced' && styles.chipTextActive]}>{t('vatReport.basisInvoiced')}</Text>
                    </Pressable>
                    <Pressable onPress={() => handleSaveVatSettings({ vatBasisDefault: 'collected' })} style={[styles.chip, vatSettings?.vatBasisDefault === 'collected' && styles.chipActive]}>
                      <Text style={[styles.chipText, vatSettings?.vatBasisDefault === 'collected' && styles.chipTextActive]}>{t('vatReport.basisCollected')}</Text>
                    </Pressable>
                  </View>

                  <Text style={styles.fieldLabel}>{t('accounting.vatPeriodicity')}</Text>
                  <View style={[styles.chips, { flexWrap: 'wrap' }]}>
                    {(['mensuelle', 'trimestrielle', 'semestrielle', 'annuelle'] as const).map((p) => (
                      <Pressable key={p} onPress={() => handleSaveVatSettings({ vatPeriodicity: p })} style={[styles.chip, vatSettings?.vatPeriodicity === p && styles.chipActive]}>
                        <Text style={[styles.chipText, vatSettings?.vatPeriodicity === p && styles.chipTextActive]}>{t(`accounting.vatPeriodicity_${p}` as any)}</Text>
                      </Pressable>
                    ))}
                  </View>

                  <Text style={styles.fieldLabel}>{t('accounting.vatRounding')}</Text>
                  <View style={styles.chips}>
                    <Pressable onPress={() => handleSaveVatSettings({ vatRounding: 'aucun' })} style={[styles.chip, vatSettings?.vatRounding === 'aucun' && styles.chipActive]}>
                      <Text style={[styles.chipText, vatSettings?.vatRounding === 'aucun' && styles.chipTextActive]}>{t('accounting.vatRoundingNone')}</Text>
                    </Pressable>
                    <Pressable onPress={() => handleSaveVatSettings({ vatRounding: 'cinq_centimes' })} style={[styles.chip, vatSettings?.vatRounding === 'cinq_centimes' && styles.chipActive]}>
                      <Text style={[styles.chipText, vatSettings?.vatRounding === 'cinq_centimes' && styles.chipTextActive]}>{t('accounting.vatRoundingFiveCents')}</Text>
                    </Pressable>
                  </View>
                  {vatSettingsSaving ? <Text style={styles.snapshotFootnote}>{t('accounting.saving')}</Text> : null}
                </View>
              )}
            </Card>

            <View style={styles.basisRow}>
              <Pressable onPress={() => setBasis('invoiced')} style={[styles.basisChip, basis === 'invoiced' && styles.basisChipActive]}>
                <Text style={[styles.basisChipText, basis === 'invoiced' && styles.basisChipTextActive]}>{t('vatReport.basisInvoiced')}</Text>
              </Pressable>
              <Pressable onPress={() => setBasis('collected')} style={[styles.basisChip, basis === 'collected' && styles.basisChipActive]}>
                <Text style={[styles.basisChipText, basis === 'collected' && styles.basisChipTextActive]}>{t('vatReport.basisCollected')}</Text>
              </Pressable>
            </View>
            <Text style={styles.basisHint}>{basis === 'invoiced' ? t('vatReport.basisHintInvoiced') : t('vatReport.basisHintCollected')}</Text>

            {!vatReport || (vatReport.rows.length === 0 && vatReport.deductibleRows.length === 0) ? (
              <Card><EmptyState title={t('vatReport.emptyTitle')} subtitle={t('vatReport.emptySubtitle')} /></Card>
            ) : (
              <>
                <Text style={styles.sectionLabel}>{t('vatReport.collectedSectionTitle')}</Text>
                {vatReport.rows.map((row) => (
                  <Card key={row.vatRate} style={styles.rateRow}>
                    <View style={styles.rateBadge}><Text style={styles.rateBadgeText}>{row.vatRate}%</Text></View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rateLabel}>{t('vatReport.turnoverAtRate', { rate: row.vatRate })}</Text>
                      <Text style={styles.rateValue}>CHF {row.turnoverExclVat.toFixed(2)}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.rateLabel}>{t('vatReport.vatDue')}</Text>
                      <Text style={styles.rateValueVat}>CHF {row.vatAmount.toFixed(2)}</Text>
                    </View>
                  </Card>
                ))}

                <Text style={styles.sectionLabel}>{t('vatReport.deductibleSectionTitle')}</Text>
                {vatReport.deductibleRows.map((row) => (
                  <Card key={row.vatRate} style={styles.rateRow}>
                    <View style={styles.rateBadge}><Text style={styles.rateBadgeText}>{row.vatRate}%</Text></View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rateLabel}>{t('vatReport.turnoverAtRate', { rate: row.vatRate })}</Text>
                      <Text style={styles.rateValue}>CHF {row.turnoverExclVat.toFixed(2)}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.rateLabel}>{t('vatReport.vatDeductible')}</Text>
                      <Text style={styles.rateValueVat}>CHF {row.vatAmount.toFixed(2)}</Text>
                    </View>
                  </Card>
                ))}

                <Card style={styles.totalCard}>
                  <View style={styles.totalRow}><Text style={styles.totalLabel}>{t('vatReport.totalTurnover')}</Text><Text style={styles.totalValue}>CHF {vatReport.totalExclVat.toFixed(2)}</Text></View>
                  <View style={styles.totalRow}><Text style={styles.totalLabel}>{t('vatReport.totalVatDue')}</Text><Text style={styles.totalValue}>CHF {vatReport.totalVat.toFixed(2)}</Text></View>
                  <View style={styles.totalRow}><Text style={styles.totalLabel}>{t('vatReport.totalDeductibleVat')}</Text><Text style={styles.totalValue}>− CHF {vatReport.totalDeductibleVat.toFixed(2)}</Text></View>
                  <View style={[styles.totalRow, styles.totalRowFinal]}>
                    <Text style={styles.totalLabelFinal}>{t('vatReport.netVatDue')}</Text>
                    <Text style={[styles.totalValueFinal, vatReport.netVatDue < 0 && styles.totalValueCredit]}>CHF {vatReport.netVatDue.toFixed(2)}</Text>
                  </View>
                </Card>
                <Button title={t('vatReport.exportCsv')} icon="download" variant="secondary" onPress={handleExportVat} />
              </>
            )}

            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>{t('accounting.vatLedgerTitle')}</Text>
            <Text style={styles.basisHint}>{t('accounting.vatLedgerHint')}</Text>

            {!vatLedgerReport || (vatLedgerReport.salesRows.length === 0 && vatLedgerReport.deductibleRows.length === 0) ? (
              <Card><EmptyState title={t('vatReport.emptyTitle')} subtitle={t('vatReport.emptySubtitle')} /></Card>
            ) : (
              <>
                <Text style={styles.sectionLabel}>{t('vatReport.collectedSectionTitle')}</Text>
                {vatLedgerReport.salesRows.map((row) => (
                  <Card key={row.code} style={{ padding: 0, overflow: 'hidden' }}>
                    <Pressable style={styles.vatCodeRow} onPress={() => toggleVatCodeDrilldown(row.code)}>
                      <View style={styles.vatCodeBadge}><Text style={styles.vatCodeBadgeText}>{row.code}</Text></View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.rateLabel}>{row.label}</Text>
                        <Text style={styles.rateValue}>{chf(row.base)} · {row.rate}%</Text>
                      </View>
                      <Text style={styles.rateValueVat}>{chf(row.amount)}</Text>
                      <Feather name={expandedVatCode === row.code ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textMuted} />
                    </Pressable>
                    {expandedVatCode === row.code ? (
                      <View style={styles.vatDrilldownBox}>
                        {vatDrilldown.length === 0 ? (
                          <Text style={styles.snapshotFootnote}>{t('accounting.loading')}</Text>
                        ) : (
                          vatDrilldown.map((d) => (
                            <View key={d.entryId} style={styles.vatDrilldownRow}>
                              <Text style={styles.ledgerLabel} numberOfLines={1}>{d.entryNumber != null ? `N°${d.entryNumber} — ` : ''}{d.label}</Text>
                              <Text style={styles.ledgerMeta}>{chf(d.amount)}</Text>
                            </View>
                          ))
                        )}
                      </View>
                    ) : null}
                  </Card>
                ))}

                <Text style={styles.sectionLabel}>{t('vatReport.deductibleSectionTitle')}</Text>
                {vatLedgerReport.deductibleRows.map((row) => (
                  <Card key={row.code} style={{ padding: 0, overflow: 'hidden' }}>
                    <Pressable style={styles.vatCodeRow} onPress={() => toggleVatCodeDrilldown(row.code)}>
                      <View style={styles.vatCodeBadge}><Text style={styles.vatCodeBadgeText}>{row.code}</Text></View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.rateLabel}>{row.label}</Text>
                        <Text style={styles.rateValue}>{chf(row.base)} · {row.rate}%</Text>
                      </View>
                      <Text style={styles.rateValueVat}>{chf(row.amount)}</Text>
                      <Feather name={expandedVatCode === row.code ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textMuted} />
                    </Pressable>
                    {expandedVatCode === row.code ? (
                      <View style={styles.vatDrilldownBox}>
                        {vatDrilldown.map((d) => (
                          <View key={d.entryId} style={styles.vatDrilldownRow}>
                            <Text style={styles.ledgerLabel} numberOfLines={1}>{d.entryNumber != null ? `N°${d.entryNumber} — ` : ''}{d.label}</Text>
                            <Text style={styles.ledgerMeta}>{chf(d.amount)}</Text>
                          </View>
                        ))}
                      </View>
                    ) : null}
                  </Card>
                ))}

                <Card style={styles.totalCard}>
                  <View style={styles.totalRow}><Text style={styles.totalLabel}>{t('vatReport.totalVatDue')}</Text><Text style={styles.totalValue}>{chf(vatLedgerReport.totalSalesVat)}</Text></View>
                  <View style={styles.totalRow}><Text style={styles.totalLabel}>{t('vatReport.totalDeductibleVat')}</Text><Text style={styles.totalValue}>− {chf(vatLedgerReport.totalDeductibleVat)}</Text></View>
                  <View style={[styles.totalRow, styles.totalRowFinal]}>
                    <Text style={styles.totalLabelFinal}>{t('vatReport.netVatDue')}</Text>
                    <Text style={[styles.totalValueFinal, vatLedgerReport.netVatDue < 0 && styles.totalValueCredit]}>{chf(vatLedgerReport.netVatDue)}</Text>
                  </View>
                  {vatSettings?.vatRounding === 'cinq_centimes' && vatLedgerReport.roundedNetVatDue !== vatLedgerReport.netVatDue ? (
                    <Text style={styles.snapshotFootnote}>{t('accounting.vatRoundedTo', { amount: vatLedgerReport.roundedNetVatDue.toFixed(2) })}</Text>
                  ) : null}
                </Card>
                <Button title={t('accounting.vatWorksheetExport')} icon="download" variant="secondary" onPress={handleExportVatWorksheet} />
                <Text style={styles.snapshotFootnote}>{t('accounting.vatWorksheetDisclaimer')}</Text>

                <View style={styles.divider} />
                <Text style={styles.sectionTitle}>{t('accounting.ech0217Title')}</Text>
                <Text style={styles.basisHint}>{t('accounting.ech0217Hint')}</Text>
                {ech0217BlockedReason ? (
                  <View style={{ gap: spacing.sm }}>
                    <Text style={styles.snapshotFootnote}>{ech0217BlockedReason}</Text>
                    {!vatSettings?.vatLiable ? (
                      <Button
                        title={t('accounting.openVatSettings')}
                        icon="settings"
                        variant="secondary"
                        onPress={() => setVatSettingsOpen(true)}
                        style={{ alignSelf: 'flex-start' }}
                      />
                    ) : null}
                  </View>
                ) : (
                  <Button title={t('accounting.ech0217Export')} icon="file-text" variant="secondary" onPress={handleExportEch0217} />
                )}
                {ech0217Warnings ? (
                  <View style={styles.ech0217WarningBox}>
                    {ech0217Warnings.map((w, i) => (
                      <Text key={i} style={styles.ech0217WarningText}>⚠ {w}</Text>
                    ))}
                  </View>
                ) : null}
                <Text style={styles.snapshotFootnote}>{t('accounting.ech0217Disclaimer')}</Text>
              </>
            )}
          </View>
        )}
      </ScrollView>

      {/* New manual entry modal */}
      <Modal visible={newEntryOpen} transparent animationType="fade" onRequestClose={() => setNewEntryOpen(false)}>
        <View style={styles.backdrop}>
          <View style={styles.entryModalCard}>
            <ScrollView>
              <Text style={styles.sheetTitle}>{t('accounting.newEntry')}</Text>

              <Text style={styles.fieldLabel}>{t('accounting.entryLabel')}</Text>
              <TextInput style={styles.input} value={entryLabel} onChangeText={setEntryLabel} placeholder={t('accounting.entryLabelPlaceholder')} placeholderTextColor={colors.textMuted} />

              <Text style={styles.fieldLabel}>{t('accounting.entryDate')}</Text>
              <TextInput style={styles.input} value={entryDate} onChangeText={setEntryDate} placeholder="AAAA-MM-JJ" placeholderTextColor={colors.textMuted} />

              <Text style={styles.fieldLabel}>{t('accounting.journal')}</Text>
              <View style={[styles.chips, { flexWrap: 'wrap' }]}>
                {journals.map((j) => (
                  <Pressable key={j.id} onPress={() => setEntryJournalId(j.id)} style={[styles.chip, entryJournalId === j.id && styles.chipActive]}>
                    <Text style={[styles.chipText, entryJournalId === j.id && styles.chipTextActive]}>{j.label}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.fieldLabel}>{t('accounting.lines')}</Text>
              {draftLines.map((l) => {
                const acc = accounts.find((a) => a.id === l.accountId);
                return (
                  <View key={l.key} style={styles.draftLineRow}>
                    <Pressable style={styles.draftLineAccount} onPress={() => { setAccountPickerFor(l.key); setAccountPickerOpen(true); }}>
                      <Text style={acc ? styles.draftLineAccountText : styles.draftLineAccountPlaceholder} numberOfLines={1}>
                        {acc ? `${acc.code} ${acc.label}` : t('accounting.pickAccount')}
                      </Text>
                    </Pressable>
                    <View style={styles.draftLineSideChips}>
                      <Pressable onPress={() => updateDraftLine(l.key, { side: 'debit' })} style={[styles.sideChip, l.side === 'debit' && styles.sideChipDebitActive]}>
                        <Text style={[styles.sideChipText, l.side === 'debit' && styles.sideChipTextActive]}>{t('accounting.debitCol')}</Text>
                      </Pressable>
                      <Pressable onPress={() => updateDraftLine(l.key, { side: 'credit' })} style={[styles.sideChip, l.side === 'credit' && styles.sideChipCreditActive]}>
                        <Text style={[styles.sideChipText, l.side === 'credit' && styles.sideChipTextActive]}>{t('accounting.creditCol')}</Text>
                      </Pressable>
                    </View>
                    <TextInput
                      style={styles.draftLineAmount}
                      value={l.amount}
                      onChangeText={(v) => updateDraftLine(l.key, { amount: v })}
                      keyboardType="decimal-pad"
                      placeholder="0.00"
                      placeholderTextColor={colors.textMuted}
                    />
                    {draftLines.length > 2 ? (
                      <Pressable onPress={() => removeDraftLine(l.key)} hitSlop={8}>
                        <Feather name="x" size={16} color={colors.textMuted} />
                      </Pressable>
                    ) : null}
                  </View>
                );
              })}
              <View style={styles.addLineRow}>
                <Button title={`+ ${t('accounting.debitCol')}`} variant="secondary" onPress={() => addDraftLine('debit')} style={{ flex: 1 }} />
                <Button title={`+ ${t('accounting.creditCol')}`} variant="secondary" onPress={() => addDraftLine('credit')} style={{ flex: 1 }} />
              </View>

              <View style={styles.totalsBox}>
                <Text style={styles.totalsText}>{t('accounting.debitCol')}: {totalDebit.toFixed(2)}</Text>
                <Text style={styles.totalsText}>{t('accounting.creditCol')}: {totalCredit.toFixed(2)}</Text>
                <Text style={[styles.totalsStatus, isBalanced ? styles.totalsStatusOk : styles.totalsStatusBad]}>
                  {isBalanced ? t('accounting.balanced') : t('accounting.unbalanced')}
                </Text>
              </View>

              {entryError ? <Text style={styles.error}>{entryError}</Text> : null}

              <Button title={t('accounting.postEntry')} icon="check" onPress={handleSubmitEntry} loading={entrySaving} disabled={!isBalanced} style={{ marginTop: spacing.md }} />
              <Button title={t('payrollSettings.cancel')} variant="secondary" onPress={() => setNewEntryOpen(false)} style={{ marginTop: spacing.sm }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Account picker */}
      <Modal visible={accountPickerOpen} transparent animationType="fade" onRequestClose={() => setAccountPickerOpen(false)}>
        <View style={styles.backdrop}>
          <View style={styles.pickerCard}>
            <Text style={styles.sheetTitle}>{t('accounting.pickAccount')}</Text>
            <ScrollView style={{ maxHeight: 380 }}>
              {accounts.map((a) => (
                <Pressable
                  key={a.id}
                  style={styles.pickerRow}
                  onPress={() => {
                    if (accountPickerFor === 'ledger') {
                      loadLedger(a.id);
                    } else if (accountPickerFor) {
                      updateDraftLine(accountPickerFor, { accountId: a.id });
                    }
                    setAccountPickerOpen(false);
                  }}
                >
                  <Text style={styles.pickerRowText}>{a.code} — {a.label}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Button title={t('payrollSettings.cancel')} variant="secondary" onPress={() => setAccountPickerOpen(false)} style={{ marginTop: spacing.sm }} />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

function statusStyle(status: string) {
  if (status === 'comptabilisee') return { backgroundColor: colors.successSoft };
  if (status === 'extournee') return { backgroundColor: colors.dangerSoft };
  return { backgroundColor: colors.warningSoft };
}

const styles = StyleSheet.create({
  pageSubtitle: { fontSize: fontSize.sm, color: colors.textMuted, lineHeight: 19, marginBottom: spacing.lg },
  tabRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg, flexWrap: 'wrap' },
  tabChip: { flex: 1, minWidth: 80, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  tabChipActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  tabChipText: { fontSize: fontSize.sm, fontWeight: '700', color: colors.textMuted },
  tabChipTextActive: { color: colors.primary },
  periodRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.lg },
  periodArrow: { width: 32, height: 32, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  periodLabel: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text, minWidth: 100, textAlign: 'center' },
  sectionTitle: { fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  snapshotRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xl, marginTop: spacing.md },
  snapshotItem: { minWidth: 140 },
  snapshotLabel: { fontSize: fontSize.xs, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.4, fontWeight: '700' },
  snapshotValue: { fontSize: fontSize.lg, fontWeight: '800', color: colors.text, marginTop: 2, fontVariant: ['tabular-nums'] },
  snapshotFootnote: { fontSize: 11, color: colors.textMuted, marginTop: spacing.sm, lineHeight: 15 },
  breakdownRows: { marginTop: spacing.md, gap: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  rowLabel: { fontSize: fontSize.sm, color: colors.textMuted },
  rowValue: { fontSize: fontSize.sm, color: colors.textMuted, fontVariant: ['tabular-nums'] },
  rowLabelBold: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  rowValueBold: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text, fontVariant: ['tabular-nums'] },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 2 },
  rowLabelFinal: { fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  rowValueFinal: { fontSize: fontSize.lg, fontWeight: '800', color: colors.success, fontVariant: ['tabular-nums'] },
  rowValueNegative: { color: colors.danger },
  ecartWarning: { fontSize: fontSize.xs, color: colors.danger, marginTop: spacing.xs },
  ech0217WarningBox: { backgroundColor: colors.warningSoft, borderRadius: radius.md, padding: spacing.md, gap: spacing.xs },
  ech0217WarningText: { fontSize: fontSize.xs, color: colors.warning },
  totalActifs: {},
  payrollRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md },
  payrollInput: { width: 50, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, padding: 6, textAlign: 'center', fontSize: fontSize.sm, color: colors.text },
  payrollSlash: { marginHorizontal: 4, color: colors.textMuted },
  payrollResult: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: spacing.sm, lineHeight: 16 },
  entryCard: { gap: spacing.sm },
  entryHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  entryLabel: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  entryMeta: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill },
  statusBadgeText: { fontSize: 10, fontWeight: '700', color: colors.text },
  reversalBadge: { backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
  entryLines: { gap: 4, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm },
  entryLineRow: { flexDirection: 'row', gap: spacing.sm },
  entryLineAccount: { flex: 2, fontSize: fontSize.xs, color: colors.textMuted },
  entryLineAmount: { flex: 1, fontSize: fontSize.xs, color: colors.text, textAlign: 'right', fontVariant: ['tabular-nums'] },
  entryLineAmountCredit: { flex: 1, fontSize: fontSize.xs, color: colors.text, textAlign: 'right', fontVariant: ['tabular-nums'] },
  entryActions: { flexDirection: 'row', gap: spacing.sm },
  balanceHeaderRow: { flexDirection: 'row', paddingBottom: spacing.xs, borderBottomWidth: 1, borderBottomColor: colors.border },
  balanceHeaderCell: { flex: 1, fontSize: 10, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase' },
  balanceRow: { flexDirection: 'row', paddingVertical: spacing.xs, borderBottomWidth: 1, borderBottomColor: colors.border },
  balanceCell: { flex: 1, fontSize: fontSize.xs, color: colors.text, fontVariant: ['tabular-nums'] },
  accountSelectTrigger: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md },
  accountSelectText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
  ledgerRow2: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xs, borderBottomWidth: 1, borderBottomColor: colors.border },
  ledgerLabel: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
  ledgerMeta: { fontSize: 11, color: colors.textMuted, marginTop: 1 },
  ledgerBalance: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text, fontVariant: ['tabular-nums'] },
  sectionLabel: { fontSize: fontSize.xs, fontWeight: '800', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.4, marginTop: spacing.sm },
  basisRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  basisChip: { flex: 1, minWidth: 150, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  basisChipActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  basisChipText: { fontSize: fontSize.xs, fontWeight: '700', color: colors.textMuted, textAlign: 'center' },
  basisChipTextActive: { color: colors.primary },
  basisHint: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: spacing.sm, lineHeight: 17 },
  rateRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rateBadge: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  rateBadgeText: { fontSize: fontSize.sm, fontWeight: '800', color: colors.primary },
  rateLabel: { fontSize: fontSize.xs, color: colors.textMuted },
  rateValue: { fontSize: fontSize.md, fontWeight: '700', color: colors.text, marginTop: 2, fontVariant: ['tabular-nums'] },
  rateValueVat: { fontSize: fontSize.md, fontWeight: '700', color: colors.accent, marginTop: 2, fontVariant: ['tabular-nums'] },
  totalCard: { gap: spacing.sm },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalRowFinal: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm, marginTop: spacing.xs },
  totalLabel: { fontSize: fontSize.sm, color: colors.textMuted },
  totalValue: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text, fontVariant: ['tabular-nums'] },
  totalLabelFinal: { fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  totalValueFinal: { fontSize: fontSize.lg, fontWeight: '800', color: colors.text, fontVariant: ['tabular-nums'] },
  totalValueCredit: { color: colors.success },
  backdrop: { flex: 1, backgroundColor: 'rgba(15, 20, 18, 0.5)', alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  entryModalCard: { width: '100%', maxWidth: 480, maxHeight: '90%', backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.xl },
  pickerCard: { width: '100%', maxWidth: 420, maxHeight: '80%', backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.xl },
  pickerRow: { paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  pickerRowText: { fontSize: fontSize.sm, color: colors.text },
  sheetTitle: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text, marginBottom: spacing.lg },
  fieldLabel: { fontSize: fontSize.sm, color: colors.textMuted, marginBottom: spacing.sm, marginTop: spacing.md, fontWeight: '500' },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: fontSize.md, color: colors.text, backgroundColor: colors.surface },
  chips: { flexDirection: 'row', gap: spacing.sm },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  chipActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  chipText: { fontSize: fontSize.sm, color: colors.text },
  chipTextActive: { color: colors.primary, fontWeight: '600' },
  draftLineRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm },
  draftLineAccount: { flex: 2, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 8 },
  draftLineAccountText: { fontSize: fontSize.xs, color: colors.text },
  draftLineAccountPlaceholder: { fontSize: fontSize.xs, color: colors.textMuted },
  draftLineSideChips: { flexDirection: 'row', gap: 2 },
  sideChip: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border },
  sideChipDebitActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  sideChipCreditActive: { backgroundColor: colors.accentSoft, borderColor: colors.accent },
  sideChipText: { fontSize: 10, fontWeight: '700', color: colors.textMuted },
  sideChipTextActive: { color: colors.text },
  draftLineAmount: { width: 72, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: 6, paddingVertical: 8, fontSize: fontSize.xs, color: colors.text, textAlign: 'right' },
  addLineRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  totalsBox: { marginTop: spacing.md, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.surfaceAlt, gap: 2 },
  totalsText: { fontSize: fontSize.sm, color: colors.text, fontVariant: ['tabular-nums'] },
  totalsStatus: { fontSize: fontSize.xs, fontWeight: '700', marginTop: 4 },
  totalsStatusOk: { color: colors.success },
  totalsStatusBad: { color: colors.danger },
  error: { fontSize: fontSize.sm, color: colors.danger, marginTop: spacing.sm },
  ledgerToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  vatSettingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toggleBox: { paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border },
  toggleBoxActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  toggleBoxText: { fontSize: fontSize.xs, fontWeight: '700', color: colors.text },
  vatCodeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md },
  vatCodeBadge: { width: 56, paddingVertical: 4, borderRadius: radius.sm, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  vatCodeBadgeText: { fontSize: 10, fontWeight: '800', color: colors.primary },
  vatDrilldownBox: { borderTopWidth: 1, borderTopColor: colors.border, padding: spacing.md, gap: 4 },
  vatDrilldownRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
});
