import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import {
  listGhostEmployees,
  listDeductionTypes,
  listProfileDeductions,
  getPayrollProfile,
  listPayrollSlips,
  calculateAndSavePayrollSlip,
  validatePayrollSlip,
  markPayrollSlipPaid,
  reversePayrollSlip,
  type PayrollSlip,
  type EmployeeRef,
} from '../../../lib/api/payroll';
import { Button, Card, EmptyState, LoadingScreen, PageHeader, Screen } from '../../../components/ui';
import { getAppLocale, useTranslation } from '../../../lib/translations';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';

interface EmployeeItem {
  ref: EmployeeRef;
  name: string;
}

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

export default function PayrollSlipsScreen() {
  const { t } = useTranslation();
  const { organization, canManagePayroll } = useAuth();
  const router = useRouter();
  const now = new Date();
  const [year, setYear] = useState(now.getUTCFullYear());
  const [month, setMonth] = useState(now.getUTCMonth() + 1);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [slips, setSlips] = useState<Map<string, PayrollSlip>>(new Map());
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function ownerKeyOf(ref: EmployeeRef): string {
    return ref.userId ?? ref.ghostEmployeeId!;
  }

  const load = useCallback(async () => {
    if (!organization || !canManagePayroll) return;
    setLoading(true);
    setError(null);
    const [{ data: memberRows }, ghostRows, slipRows] = await Promise.all([
      supabase.from('organization_members').select('user_id, full_name').eq('organization_id', organization.id),
      listGhostEmployees(organization.id),
      listPayrollSlips(organization.id, year, month),
    ]);
    setEmployees([
      ...(memberRows ?? []).map((m): EmployeeItem => ({ ref: { userId: m.user_id }, name: m.full_name || t('payrollHub.memberFallback') })),
      ...ghostRows.map((g): EmployeeItem => ({ ref: { ghostEmployeeId: g.id }, name: g.full_name })),
    ]);
    setSlips(new Map(slipRows.map((s) => [s.ownerKey, s])));
    setLoading(false);
  }, [organization, canManagePayroll, year, month, t]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  function changeMonth(delta: number) {
    let m = month + delta;
    let y = year;
    if (m < 1) { m = 12; y -= 1; } else if (m > 12) { m = 1; y += 1; }
    setMonth(m);
    setYear(y);
  }

  async function handleCalculate(item: EmployeeItem) {
    if (!organization) return;
    const key = ownerKeyOf(item.ref);
    setBusyKey(key);
    setError(null);
    const profile = await getPayrollProfile(organization.id, item.ref);
    if (!profile) {
      setBusyKey(null);
      setError(t('payrollSlips.noProfile', { name: item.name }));
      return;
    }
    const [deductionTypes, overrides] = await Promise.all([
      listDeductionTypes(organization.id),
      listProfileDeductions(organization.id, item.ref),
    ]);
    const { error: err } = await calculateAndSavePayrollSlip(organization.id, item.ref, year, month, profile, deductionTypes, overrides);
    setBusyKey(null);
    if (err) setError(err);
    else load();
  }

  async function handleValidate(slip: PayrollSlip, key: string) {
    setBusyKey(key);
    const { error: err } = await validatePayrollSlip(slip.id);
    setBusyKey(null);
    if (err) setError(err);
    else load();
  }

  async function handleMarkPaid(slip: PayrollSlip, key: string) {
    setBusyKey(key);
    const { error: err } = await markPayrollSlipPaid(slip.id);
    setBusyKey(null);
    if (err) setError(err);
    else load();
  }

  async function handleReverse(slip: PayrollSlip, key: string) {
    setBusyKey(key);
    const { error: err } = await reversePayrollSlip(slip.id);
    setBusyKey(null);
    if (err) setError(err);
    else load();
  }

  if (!organization) return <LoadingScreen />;

  if (!canManagePayroll) {
    return (
      <Screen>
        <ScrollView contentContainerStyle={{ padding: spacing.xl }}>
          <PageHeader title={t('payrollSlips.title')} backTo="/(app)/rh" />
          <Card><EmptyState title={t('payrollSlips.title')} subtitle={t('payrollHub.selfSubtitle')} /></Card>
        </ScrollView>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing.xxl * 2 }}>
        <PageHeader title={t('payrollSlips.title')} backTo="/(app)/rh" />
        <Text style={styles.pageSubtitle}>{t('payrollSlips.subtitle')}</Text>

        <View style={styles.periodRow}>
          <Pressable onPress={() => changeMonth(-1)} hitSlop={8} style={styles.periodArrow}>
            <Feather name="chevron-left" size={18} color={colors.text} />
          </Pressable>
          <Text style={styles.periodLabel}>{monthLabel(year, month)}</Text>
          <Pressable onPress={() => changeMonth(1)} hitSlop={8} style={styles.periodArrow}>
            <Feather name="chevron-right" size={18} color={colors.text} />
          </Pressable>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {loading ? (
          <LoadingScreen />
        ) : employees.length === 0 ? (
          <Card><EmptyState title={t('payrollSlips.emptyTitle')} subtitle={t('payrollSlips.emptySubtitle')} /></Card>
        ) : (
          <View style={{ gap: spacing.sm, marginTop: spacing.lg }}>
            {employees.map((item) => {
              const key = ownerKeyOf(item.ref);
              const slip = slips.get(key);
              const busy = busyKey === key;
              return (
                <Card key={key} style={styles.row}>
                  <Pressable
                    style={{ flex: 1 }}
                    onPress={() => router.push({ pathname: '/(app)/rh/[userId]', params: item.ref.ghostEmployeeId ? { userId: item.ref.ghostEmployeeId, kind: 'ghost' } : { userId: item.ref.userId! } })}
                  >
                    <Text style={styles.name}>{item.name}</Text>
                    {slip ? (
                      <View style={styles.statusRow}>
                        <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[slip.status] }]} />
                        <Text style={styles.statusText}>{t(`payrollSlips.status_${slip.status}` as any)}</Text>
                        <Text style={styles.amount}>{chf(slip.net)}</Text>
                      </View>
                    ) : (
                      <Text style={styles.notCalculated}>{t('payrollSlips.notCalculated')}</Text>
                    )}
                  </Pressable>
                  <View style={styles.actions}>
                    {!slip || slip.status === 'brouillon' || slip.status === 'calculee' ? (
                      <Button title={t('payrollSlips.calculate')} variant="secondary" onPress={() => handleCalculate(item)} loading={busy} />
                    ) : null}
                    {slip?.status === 'calculee' ? (
                      <Button title={t('payrollSlips.validate')} onPress={() => handleValidate(slip, key)} loading={busy} />
                    ) : null}
                    {slip?.status === 'validee' ? (
                      <Button title={t('payrollSlips.markPaid')} onPress={() => handleMarkPaid(slip, key)} loading={busy} />
                    ) : null}
                    {slip && (slip.status === 'validee' || slip.status === 'payee') ? (
                      <Pressable onPress={() => handleReverse(slip, key)} hitSlop={8} style={styles.reverseBtn}>
                        <Feather name="rotate-ccw" size={14} color={colors.danger} />
                      </Pressable>
                    ) : null}
                  </View>
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pageSubtitle: { fontSize: fontSize.sm, color: colors.textMuted, lineHeight: 19, marginBottom: spacing.lg },
  periodRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.lg },
  periodArrow: { padding: spacing.xs },
  periodLabel: { fontSize: fontSize.md, fontWeight: '800', color: colors.text, textTransform: 'capitalize' },
  error: { fontSize: fontSize.sm, color: colors.danger, marginTop: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  name: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 4 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: fontSize.xs, color: colors.textMuted, fontWeight: '600' },
  amount: { fontSize: fontSize.xs, color: colors.textMuted, fontVariant: ['tabular-nums'] },
  notCalculated: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 4, fontStyle: 'italic' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  reverseBtn: { padding: spacing.xs },
});
