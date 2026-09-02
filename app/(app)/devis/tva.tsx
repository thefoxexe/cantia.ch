import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { getVatReport, type VatReport, type VatReportBasis } from '../../../lib/api/factures';
import { Card, EmptyState, LoadingScreen, PageHeader, Screen } from '../../../components/ui';
import { useTranslation } from '../../../lib/translations';
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

export default function VatReportScreen() {
  const { t } = useTranslation();
  const { organization } = useAuth();
  const router = useRouter();
  const now = useMemo(() => new Date(), []);
  const [year, setYear] = useState(now.getUTCFullYear());
  const [quarter, setQuarter] = useState(quarterOf(now));
  const [basis, setBasis] = useState<VatReportBasis>('invoiced');
  const [report, setReport] = useState<VatReport | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!organization) return;
    setLoading(true);
    const { start, end } = quarterBounds(year, quarter);
    const data = await getVatReport(organization.id, start, end, basis);
    setReport(data);
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

  if (!organization) return <LoadingScreen />;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing.xxl * 2 }}>
        <PageHeader title={t('vatReport.title')} backTo="/(app)/devis/factures" />
        <Text style={styles.pageSubtitle}>
          {t('vatReport.subtitle')}
        </Text>

        <View style={styles.periodRow}>
          <Pressable onPress={() => changeQuarter(-1)} hitSlop={8} style={styles.periodArrow}>
            <Feather name="chevron-left" size={18} color={colors.text} />
          </Pressable>
          <Text style={styles.periodLabel}>{t('vatReport.quarterLabel', { quarter, year })}</Text>
          <Pressable onPress={() => changeQuarter(1)} hitSlop={8} style={styles.periodArrow}>
            <Feather name="chevron-right" size={18} color={colors.text} />
          </Pressable>
        </View>

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

        {loading ? (
          <LoadingScreen />
        ) : !report || report.rows.length === 0 ? (
          <Card style={{ marginTop: spacing.lg }}>
            <EmptyState title={t('vatReport.emptyTitle')} subtitle={t('vatReport.emptySubtitle')} />
          </Card>
        ) : (
          <View style={{ gap: spacing.md, marginTop: spacing.lg }}>
            {report.rows.map((row) => (
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
            ))}

            <Card style={styles.totalCard}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>{t('vatReport.totalTurnover')}</Text>
                <Text style={styles.totalValue}>CHF {report.totalExclVat.toFixed(2)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>{t('vatReport.totalVatDue')}</Text>
                <Text style={styles.totalValue}>CHF {report.totalVat.toFixed(2)}</Text>
              </View>
              <View style={[styles.totalRow, styles.totalRowFinal]}>
                <Text style={styles.totalLabelFinal}>{t('vatReport.totalInclVat')}</Text>
                <Text style={styles.totalValueFinal}>CHF {report.totalInclVat.toFixed(2)}</Text>
              </View>
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
  periodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    marginBottom: spacing.md,
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
});
