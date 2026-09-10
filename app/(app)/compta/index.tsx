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
import { downloadTextFile } from '../../../lib/downloadFile';
import { Button, Card, EmptyState, LoadingScreen, PageHeader, Screen } from '../../../components/ui';
import { getAppLocale, useTranslation } from '../../../lib/translations';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';

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

export default function AccountingScreen() {
  const { t } = useTranslation();
  const { organization } = useAuth();
  const now = useMemo(() => new Date(), []);
  const [year, setYear] = useState(now.getUTCFullYear());
  const [quarter, setQuarter] = useState(quarterOf(now));
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [snapshot, setSnapshot] = useState<FinancialSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLedger, setShowLedger] = useState(false);

  const load = useCallback(async () => {
    if (!organization) return;
    setLoading(true);
    const { start, end } = quarterBounds(year, quarter);
    const [entryRows, snap] = await Promise.all([
      getJournalEntries(organization.id, start, end),
      getFinancialSnapshot(organization.id),
    ]);
    setEntries(entryRows);
    setSnapshot(snap);
    setLoading(false);
  }, [organization, year, quarter]);

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

  function handleExport() {
    if (!entries.length) return;
    downloadTextFile(`journal-comptable-${year}-t${quarter}.csv`, journalEntriesToCsv(entries));
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
        ) : (
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

              <Button title={t('accounting.exportCsv')} icon="download" variant="secondary" onPress={handleExport} style={{ marginTop: spacing.md }} />
            </Card>
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
});
