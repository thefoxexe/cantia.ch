import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '../../../lib/auth-context';
import { listMyPayrollSlips, type PayrollSlip } from '../../../lib/api/payroll';
import { generatePayslipPdf } from '../../../lib/api/pdf';
import { downloadFile } from '../../../lib/downloadFile';
import { Button, Card, EmptyState, LoadingScreen, PageHeader, Screen } from '../../../components/ui';
import { getAppLocale, useTranslation } from '../../../lib/translations';
import { colors, fontSize, spacing } from '../../../lib/theme';

function chf(n: number): string {
  return `CHF ${n.toLocaleString(`${getAppLocale()}-CH`, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function monthLabel(year: number, month: number): string {
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString(`${getAppLocale()}-CH`, { month: 'long', year: 'numeric' });
}

const STATUS_COLORS: Record<PayrollSlip['status'], string> = {
  brouillon: colors.textMuted,
  calculee: colors.primary,
  validee: colors.warning,
  payee: colors.success,
  extournee: colors.danger,
};

export default function MyPayrollSlipsScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [slips, setSlips] = useState<PayrollSlip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoading(true);
      listMyPayrollSlips()
        .then((data) => {
          if (!cancelled) setSlips(data);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
      return () => {
        cancelled = true;
      };
    }, []),
  );

  async function handleDownload(slip: PayrollSlip) {
    if (!user) return;
    setDownloadingId(slip.id);
    setError(null);
    const periodStart = `${slip.year}-${String(slip.month).padStart(2, '0')}-01`;
    const { url, error: genError } = await generatePayslipPdf({ userId: user.id }, periodStart);
    setDownloadingId(null);
    if (genError || !url) {
      setError(genError ?? t('mesFiches.downloadFailed'));
      return;
    }
    const { error: dlError } = await downloadFile(url, `${t('mesFiches.filename', { month: monthLabel(slip.year, slip.month) })}.pdf`);
    if (dlError) setError(dlError);
  }

  return (
    <Screen style={{ padding: spacing.xl }}>
      <PageHeader title={t('mesFiches.title')} backTo="/(app)/rh" />
      <Text style={styles.subtitle}>{t('mesFiches.subtitle')}</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl, gap: spacing.sm, marginTop: spacing.lg }}>
        {loading ? (
          <LoadingScreen />
        ) : slips.length === 0 ? (
          <Card><EmptyState title={t('mesFiches.emptyTitle')} subtitle={t('mesFiches.emptySubtitle')} /></Card>
        ) : (
          slips.map((slip) => (
            <Card key={slip.id} style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.period}>{monthLabel(slip.year, slip.month)}</Text>
                <View style={styles.statusRow}>
                  <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[slip.status] }]} />
                  <Text style={styles.statusText}>{t(`payrollSlips.status_${slip.status}` as any)}</Text>
                  <Text style={styles.amount}>{t('payrollSlips.netAmount', { amount: chf(slip.net) })}</Text>
                </View>
              </View>
              <Button
                title={t('mesFiches.download')}
                variant="secondary"
                icon="download"
                onPress={() => handleDownload(slip)}
                loading={downloadingId === slip.id}
              />
            </Card>
          ))
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.xs },
  error: { color: colors.danger, fontSize: fontSize.sm, marginTop: spacing.md },
  card: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  period: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 4 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: fontSize.xs, color: colors.textMuted, fontWeight: '600' },
  amount: { fontSize: fontSize.xs, color: colors.textMuted, fontVariant: ['tabular-nums'] },
});
