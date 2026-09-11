import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import {
  getFinancialSnapshot,
  getIncomeStatement,
  getJournalEntries,
  getLedgerByAccount,
  journalEntriesToCsv,
  type FinancialSnapshot,
  type IncomeStatement,
  type JournalEntry,
  type LedgerLine,
} from '../../../lib/api/accounting';
import { getVatReport, type VatReport, type VatReportBasis } from '../../../lib/api/factures';
import { downloadTextFile } from '../../../lib/downloadFile';
import { Button, Card, EmptyState, LoadingScreen, PageHeader, Screen } from '../../../components/ui';
import { getAppLocale, useTranslation } from '../../../lib/translations';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';

type Tab = 'overview' | 'vat';

function quarterOf(date: Date): number {
  return Math.floor(date.getUTCMonth() / 3) + 1;
}

function quarterBounds(year: number, quarter: number): { start: string; end: string } {
  const startMonth = (quarter - 1) * 3;
  const start = new Date(Date.UTC(year, startMonth, 1));
  const end = new Date(Date.UTC(year, startMonth + 3, 1));
  return { start: start.toISOString(), end: end.toISOString() };
}

function chf(n: number): string {
  return `CHF ${n.toLocaleString(`${getAppLocale()}-CH`, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function escapeCsv(value: string): string {
  return /[;"\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function buildVatReportCsv(report: VatReport, periodLabel: string, labels: {
  rate: string; turnover: string; vat: string; totalTurnover: string; totalVat: string; deductibleBase: string; deductibleVat: string; net: string;
}): string {
  const lines: string[] = [];
  lines.push(escapeCsv(periodLabel));
  lines.push('');
  lines.push([labels.rate, labels.turnover, labels.vat].map(escapeCsv).join(';'));
  for (const row of report.rows) {
    lines.push([`${row.vatRate}%`, row.turnoverExclVat.toFixed(2), row.vatAmount.toFixed(2)].map(escapeCsv).join(';'));
  }
  lines.push([labels.totalTurnover, report.totalExclVat.toFixed(2), report.totalVat.toFixed(2)].map(escapeCsv).join(';'));
  lines.push('');
  lines.push([labels.rate, labels.deductibleBase, labels.deductibleVat].map(escapeCsv).join(';'));
  for (const row of report.deductibleRows) {
    lines.push([`${row.vatRate}%`, row.turnoverExclVat.toFixed(2), row.vatAmount.toFixed(2)].map(escapeCsv).join(';'));
  }
  lines.push(['', labels.deductibleBase, report.totalDeductibleVat.toFixed(2)].map(escapeCsv).join(';'));
  lines.push('');
  lines.push([labels.net, '', report.netVatDue.toFixed(2)].map(escapeCsv).join(';'));
  return lines.join('\n');
}

export default function AccountingScreen() {
  const { t } = useTranslation();
  const { organization } = useAuth();
  const now = useMemo(() => new Date(), []);
  const [tab, setTab] = useState<Tab>('overview');
  const [year, setYear] = useState(now.getUTCFullYear());
  const [quarter, setQuarter] = useState(quarterOf(now));
  const [basis, setBasis] = useState<VatReportBasis>('invoiced');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [snapshot, setSnapshot] = useState<FinancialSnapshot | null>(null);
  const [report, setReport] = useState<VatReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLedger, setShowLedger] = useState(false);

  const load = useCallback(async () => {
    if (!organization) return;
    setLoading(true);
    const { start, end } = quarterBounds(year, quarter);
    const [entryRows, snap, vatReport] = await Promise.all([
      getJournalEntries(organization.id, start, end),
      getFinancialSnapshot(organization.id),
      getVatReport(organization.id, start, end, basis),
    ]);
    setEntries(entryRows);
    setSnapshot(snap);
    setReport(vatReport);
    setLoading(false);
  }, [organization, year, quarter, basis]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  function changeQuarter(delta: number) {
    let q = quarter + delta;
    let y = year;
    if (q < 1) {
      q = 4;
      y -= 1;
    } else if (q > 4) {
      q = 1;
      y += 1;
    }
    setQuarter(q);
    setYear(y);
  }

  function handleExportLedger() {
    if (!entries.length) return;
    downloadTextFile(`journal-comptable-${year}-t${quarter}.csv`, journalEntriesToCsv(entries));
  }

  function handleExportVat() {
    if (!report) return;
    const periodLabel = t('vatReport.quarterLabel', { quarter, year });
    const csv = buildVatReportCsv(report, periodLabel, {
      rate: t('vatReport.csvRate'),
      turnover: t('vatReport.csvTurnover'),
      vat: t('vatReport.csvVat'),
      totalTurnover: t('vatReport.totalTurnover'),
      totalVat: t('vatReport.totalVatDue'),
      deductibleBase: t('vatReport.csvDeductibleBase'),
      deductibleVat: t('vatReport.totalDeductibleVat'),
      net: t('vatReport.netVatDue'),
    });
    downloadTextFile(`tva-${year}-t${quarter}.csv`, csv);
  }

  if (!organization) return <LoadingScreen />;

  const income: IncomeStatement | null = loading ? null : getIncomeStatement(entries);
  const ledger: LedgerLine[] = loading ? [] : getLedgerByAccount(entries);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing.xxl * 2 }}>
        <PageHeader title={t('accounting.title')} backTo="/(app)" />
        <Text style={styles.pageSubtitle}>{t('accounting.subtitle')}</Text>

        <Card style={styles.disclaimer}>
          <Feather name="info" size={16} color={colors.warning} />
          <Text style={styles.disclaimerText}>{t('accounting.disclaimer')}</Text>
        </Card>

        <View style={styles.tabRow}>
          <Pressable onPress={() => setTab('overview')} style={[styles.tabChip, tab === 'overview' && styles.tabChipActive]}>
            <Text style={[styles.tabChipText, tab === 'overview' && styles.tabChipTextActive]}>{t('accounting.tabOverview')}</Text>
          </Pressable>
          <Pressable onPress={() => setTab('vat')} style={[styles.tabChip, tab === 'vat' && styles.tabChipActive]}>
            <Text style={[styles.tabChipText, tab === 'vat' && styles.tabChipTextActive]}>{t('accounting.tabVat')}</Text>
          </Pressable>
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
        ) : tab === 'overview' ? (
          <View style={{ gap: spacing.lg, marginTop: spacing.lg }}>
            <Card>
              <Text style={styles.sectionTitle}>{t('accounting.snapshotTitle')}</Text>
              <View style={styles.snapshotRow}>
                <View style={styles.snapshotItem}>
                  <Text style={styles.snapshotLabel}>{t('accounting.cashLabel')}</Text>
                  <Text style={styles.snapshotValue}>{snapshot?.cashBalance != null ? chf(snapshot.cashBalance) : t('accounting.noCashSnapshot')}</Text>
                  {snapshot?.cashRecordedAt ? (
                    <Text style={styles.snapshotHint}>{t('accounting.cashRecordedAt', { date: new Date(snapshot.cashRecordedAt).toLocaleDateString(`${getAppLocale()}-CH`) })}</Text>
                  ) : null}
                </View>
                <View style={styles.snapshotItem}>
                  <Text style={styles.snapshotLabel}>{t('accounting.receivablesLabel')}</Text>
                  <Text style={styles.snapshotValue}>{chf(snapshot?.receivables ?? 0)}</Text>
                </View>
              </View>
              <Text style={styles.snapshotFootnote}>{t('accounting.snapshotFootnote')}</Text>
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
                    <View key={c.account} style={styles.row}>
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
              <Pressable style={styles.ledgerToggle} onPress={() => setShowLedger((v) => !v)}>
                <Text style={styles.sectionTitle}>{t('accounting.ledgerTitle')}</Text>
                <Feather name={showLedger ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
              </Pressable>
              {showLedger ? (
                ledger.length === 0 ? (
                  <EmptyState title={t('accounting.emptyTitle')} subtitle={t('accounting.emptySubtitle')} />
                ) : (
                  <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
                    {ledger.map((l) => (
                      <View key={l.account} style={styles.ledgerRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.ledgerLabel}>{l.account} — {l.label}</Text>
                          <Text style={styles.ledgerMeta}>{t('accounting.debitCredit', { debit: l.debit.toFixed(2), credit: l.credit.toFixed(2) })}</Text>
                        </View>
                        <Text style={styles.ledgerBalance}>{chf(l.balance)}</Text>
                      </View>
                    ))}
                  </View>
                )
              ) : null}

              <Button title={t('accounting.exportCsv')} icon="download" variant="secondary" onPress={handleExportLedger} style={{ marginTop: spacing.md }} />
            </Card>
          </View>
        ) : (
          <View style={{ gap: spacing.md, marginTop: spacing.lg }}>
            <View style={styles.basisRow}>
              <Pressable onPress={() => setBasis('invoiced')} style={[styles.basisChip, basis === 'invoiced' && styles.basisChipActive]}>
                <Text style={[styles.basisChipText, basis === 'invoiced' && styles.basisChipTextActive]}>{t('vatReport.basisInvoiced')}</Text>
              </Pressable>
              <Pressable onPress={() => setBasis('collected')} style={[styles.basisChip, basis === 'collected' && styles.basisChipActive]}>
                <Text style={[styles.basisChipText, basis === 'collected' && styles.basisChipTextActive]}>{t('vatReport.basisCollected')}</Text>
              </Pressable>
            </View>
            <Text style={styles.basisHint}>
              {basis === 'invoiced' ? t('vatReport.basisHintInvoiced') : t('vatReport.basisHintCollected')}
            </Text>

            {!report || (report.rows.length === 0 && report.deductibleRows.length === 0) ? (
              <Card>
                <EmptyState title={t('vatReport.emptyTitle')} subtitle={t('vatReport.emptySubtitle')} />
              </Card>
            ) : (
              <>
                <Text style={styles.sectionLabel}>{t('vatReport.collectedSectionTitle')}</Text>
                {report.rows.length === 0 ? (
                  <Card><EmptyState title={t('vatReport.emptyTitle')} subtitle={t('vatReport.emptySubtitle')} /></Card>
                ) : (
                  report.rows.map((row) => (
                    <Card key={row.vatRate} style={styles.rateRow}>
                      <View style={styles.rateBadge}>
                        <Text style={styles.rateBadgeText}>{row.vatRate}%</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.rateLabel}>{t('vatReport.turnoverAtRate', { rate: row.vatRate })}</Text>
                        <Text style={styles.rateValue}>CHF {row.turnoverExclVat.toFixed(2)}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.rateLabel}>{t('vatReport.vatDue')}</Text>
                        <Text style={styles.rateValueVat}>CHF {row.vatAmount.toFixed(2)}</Text>
                      </View>
                    </Card>
                  ))
                )}

                <Text style={styles.sectionLabel}>{t('vatReport.deductibleSectionTitle')}</Text>
                <Text style={styles.basisHint}>{t('vatReport.deductibleHint')}</Text>
                {report.deductibleRows.length === 0 ? (
                  <Card><EmptyState title={t('vatReport.deductibleEmptyTitle')} subtitle={t('vatReport.deductibleEmptySubtitle')} /></Card>
                ) : (
                  report.deductibleRows.map((row) => (
                    <Card key={row.vatRate} style={styles.rateRow}>
                      <View style={styles.rateBadge}>
                        <Text style={styles.rateBadgeText}>{row.vatRate}%</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.rateLabel}>{t('vatReport.turnoverAtRate', { rate: row.vatRate })}</Text>
                        <Text style={styles.rateValue}>CHF {row.turnoverExclVat.toFixed(2)}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.rateLabel}>{t('vatReport.vatDeductible')}</Text>
                        <Text style={styles.rateValueVat}>CHF {row.vatAmount.toFixed(2)}</Text>
                      </View>
                    </Card>
                  ))
                )}

                <Card style={styles.totalCard}>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>{t('vatReport.totalTurnover')}</Text>
                    <Text style={styles.totalValue}>CHF {report.totalExclVat.toFixed(2)}</Text>
                  </View>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>{t('vatReport.totalVatDue')}</Text>
                    <Text style={styles.totalValue}>CHF {report.totalVat.toFixed(2)}</Text>
                  </View>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>{t('vatReport.totalDeductibleVat')}</Text>
                    <Text style={styles.totalValue}>− CHF {report.totalDeductibleVat.toFixed(2)}</Text>
                  </View>
                  <View style={[styles.totalRow, styles.totalRowFinal]}>
                    <Text style={styles.totalLabelFinal}>{t('vatReport.netVatDue')}</Text>
                    <Text style={[styles.totalValueFinal, report.netVatDue < 0 && styles.totalValueCredit]}>
                      CHF {report.netVatDue.toFixed(2)}
                    </Text>
                  </View>
                  {report.netVatDue < 0 ? <Text style={styles.creditHint}>{t('vatReport.creditHint')}</Text> : null}
                </Card>

                <Button title={t('vatReport.exportCsv')} icon="download" variant="secondary" onPress={handleExportVat} />
              </>
            )}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pageSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 19,
    marginBottom: spacing.lg,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.warningSoft,
    marginBottom: spacing.lg,
  },
  disclaimerText: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.text,
    lineHeight: 17,
  },
  tabRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  tabChip: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  tabChipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  tabChipText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textMuted,
  },
  tabChipTextActive: {
    color: colors.primary,
  },
  periodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  periodArrow: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodLabel: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.text,
    minWidth: 100,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: colors.text,
  },
  snapshotRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xl,
    marginTop: spacing.md,
  },
  snapshotItem: {
    minWidth: 140,
  },
  snapshotLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    fontWeight: '700',
  },
  snapshotValue: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.text,
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  snapshotHint: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  snapshotFootnote: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: spacing.md,
    lineHeight: 15,
  },
  breakdownRows: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  rowValue: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontVariant: ['tabular-nums'],
  },
  rowLabelBold: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  rowValueBold: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 2,
  },
  rowLabelFinal: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: colors.text,
  },
  rowValueFinal: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.success,
    fontVariant: ['tabular-nums'],
  },
  rowValueNegative: {
    color: colors.danger,
  },
  ledgerToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ledgerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  ledgerLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  ledgerMeta: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  ledgerBalance: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  basisRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  basisChip: {
    flex: 1,
    minWidth: 150,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  basisChipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  basisChipText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textMuted,
    textAlign: 'center',
  },
  basisChipTextActive: {
    color: colors.primary,
  },
  basisHint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.sm,
    lineHeight: 17,
  },
  sectionLabel: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: spacing.sm,
  },
  rateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rateBadge: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rateBadgeText: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: colors.primary,
  },
  rateLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  rateValue: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  rateValueVat: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.accent,
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  totalCard: {
    gap: spacing.sm,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalRowFinal: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  totalLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  totalValue: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  totalLabelFinal: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: colors.text,
  },
  totalValueFinal: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  totalValueCredit: {
    color: colors.success,
  },
  creditHint: {
    fontSize: fontSize.xs,
    color: colors.success,
    lineHeight: 16,
  },
});
