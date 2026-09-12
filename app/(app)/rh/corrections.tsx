import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import {
  applyPayrollCorrection,
  buildPayrollCorrectionPreview,
  getPayrollProfile,
  getPayrollSlip,
  listDeductionTypes,
  listGhostEmployees,
  listPayrollCorrections,
  listProfileDeductions,
  listProfileWageRates,
  listWageTypes,
  simulatePayrollPeriod,
  type EmployeeRef,
  type PayrollCorrectionPreview,
  type PayrollSlip,
} from '../../../lib/api/payroll';
import { Button, Card, EmptyState, LoadingScreen, PageHeader, Screen } from '../../../components/ui';
import { getAppLocale, useTranslation } from '../../../lib/translations';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import type { PayrollCorrection } from '../../../lib/types';

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

export default function PayrollCorrectionsScreen() {
  const { t } = useTranslation();
  const { organization, user, canManagePayroll } = useAuth();

  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [employeeKey, setEmployeeKey] = useState<string | null>(null);

  const now = new Date();
  const [sourceYear, setSourceYear] = useState(now.getUTCFullYear());
  const [sourceMonth, setSourceMonth] = useState(now.getUTCMonth() === 0 ? 12 : now.getUTCMonth());
  const [sourceSlip, setSourceSlip] = useState<PayrollSlip | null>(null);
  const [checking, setChecking] = useState(false);

  const [preview, setPreview] = useState<PayrollCorrectionPreview | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [targetYear, setTargetYear] = useState(now.getUTCFullYear());
  const [targetMonth, setTargetMonth] = useState(now.getUTCMonth() + 1);

  const [history, setHistory] = useState<PayrollCorrection[]>([]);

  const currentEmployee = employees.find((e) => (e.ref.userId ?? e.ref.ghostEmployeeId) === employeeKey) ?? null;

  const load = useCallback(async () => {
    if (!organization || !canManagePayroll) return;
    setLoading(true);
    const [{ data: memberRows }, ghostRows] = await Promise.all([
      supabase.from('organization_members').select('user_id, full_name').eq('organization_id', organization.id),
      listGhostEmployees(organization.id),
    ]);
    const list: EmployeeItem[] = [
      ...(memberRows ?? []).map((m): EmployeeItem => ({ ref: { userId: m.user_id }, name: m.full_name || t('payrollHub.memberFallback') })),
      ...ghostRows.map((g): EmployeeItem => ({ ref: { ghostEmployeeId: g.id }, name: g.full_name })),
    ];
    setEmployees(list);
    setEmployeeKey((prev) => prev ?? (list[0] ? list[0].ref.userId ?? list[0].ref.ghostEmployeeId! : null));
    setLoading(false);
  }, [organization, canManagePayroll, t]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const checkSource = useCallback(async () => {
    if (!organization || !currentEmployee) {
      setSourceSlip(null);
      return;
    }
    setChecking(true);
    setPreview(null);
    setError(null);
    const slip = await getPayrollSlip(organization.id, currentEmployee.ref, sourceYear, sourceMonth);
    setSourceSlip(slip);
    setChecking(false);
    const rows = await listPayrollCorrections(organization.id, currentEmployee.ref);
    setHistory(rows);
  }, [organization, currentEmployee, sourceYear, sourceMonth]);

  useFocusEffect(useCallback(() => { checkSource(); }, [checkSource]));

  function changeSourceMonth(delta: number) {
    let m = sourceMonth + delta;
    let y = sourceYear;
    if (m < 1) { m = 12; y -= 1; } else if (m > 12) { m = 1; y += 1; }
    setSourceMonth(m);
    setSourceYear(y);
  }

  async function handleSimulate() {
    if (!organization || !currentEmployee || !sourceSlip) return;
    setSimulating(true);
    setError(null);
    const profile = await getPayrollProfile(organization.id, currentEmployee.ref);
    if (!profile) {
      setSimulating(false);
      setError(t('payrollCorrections.noProfile'));
      return;
    }
    const [deductionTypes, overrides, wageTypes, wageRateOverrides] = await Promise.all([
      listDeductionTypes(organization.id),
      listProfileDeductions(organization.id, currentEmployee.ref),
      listWageTypes(organization.id),
      listProfileWageRates(organization.id, currentEmployee.ref),
    ]);
    const recalculated = await simulatePayrollPeriod(
      organization.id,
      currentEmployee.ref,
      sourceYear,
      sourceMonth,
      profile,
      deductionTypes,
      overrides,
      wageTypes,
      wageRateOverrides,
    );
    setPreview(buildPayrollCorrectionPreview(sourceSlip, recalculated));
    setSimulating(false);
  }

  async function handleApply() {
    if (!organization || !currentEmployee || !sourceSlip || !preview) return;
    setApplying(true);
    setError(null);
    const { error: err } = await applyPayrollCorrection(organization.id, currentEmployee.ref, sourceSlip, preview, targetYear, targetMonth);
    setApplying(false);
    if (err) {
      setError(err);
      return;
    }
    setPreview(null);
    checkSource();
  }

  if (!organization) return <LoadingScreen />;

  if (!canManagePayroll) {
    return (
      <Screen>
        <ScrollView contentContainerStyle={{ padding: spacing.xl }}>
          <PageHeader title={t('payrollCorrections.title')} backTo="/(app)/rh" />
          <Card><EmptyState title={t('payrollCorrections.title')} subtitle={t('payrollHub.selfSubtitle')} /></Card>
        </ScrollView>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing.xxl * 2 }}>
        <PageHeader title={t('payrollCorrections.title')} backTo="/(app)/rh/salaires" />
        <Text style={styles.pageSubtitle}>{t('payrollCorrections.subtitle')}</Text>

        {loading ? (
          <LoadingScreen />
        ) : (
          <>
            <Card style={{ marginTop: spacing.lg }}>
              <Text style={styles.fieldLabel}>{t('payrollAbsences.employeeLabel')}</Text>
              <View style={[styles.chips, { flexWrap: 'wrap' }]}>
                {employees.map((e) => {
                  const key = e.ref.userId ?? e.ref.ghostEmployeeId!;
                  return (
                    <Pressable key={key} onPress={() => setEmployeeKey(key)} style={[styles.chip, employeeKey === key && styles.chipActive]}>
                      <Text style={[styles.chipText, employeeKey === key && styles.chipTextActive]}>{e.name}</Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={[styles.fieldLabel, { marginTop: spacing.md }]}>{t('payrollCorrections.sourcePeriodLabel')}</Text>
              <View style={styles.periodRow}>
                <Pressable onPress={() => changeSourceMonth(-1)} hitSlop={8} style={styles.periodArrow}>
                  <Feather name="chevron-left" size={18} color={colors.text} />
                </Pressable>
                <Text style={styles.periodLabel}>{monthLabel(sourceYear, sourceMonth)}</Text>
                <Pressable onPress={() => changeSourceMonth(1)} hitSlop={8} style={styles.periodArrow}>
                  <Feather name="chevron-right" size={18} color={colors.text} />
                </Pressable>
              </View>

              {checking ? (
                <LoadingScreen />
              ) : !sourceSlip ? (
                <Text style={styles.hint}>{t('payrollCorrections.noSlip')}</Text>
              ) : sourceSlip.status !== 'validee' && sourceSlip.status !== 'payee' ? (
                <Text style={styles.hint}>{t('payrollCorrections.slipNotFinal', { status: t(`payrollSlips.status_${sourceSlip.status}` as any) })}</Text>
              ) : (
                <>
                  <Text style={styles.hint}>{t('payrollCorrections.slipFound', { net: chf(sourceSlip.net) })}</Text>
                  <Button title={t('payrollCorrections.simulate')} icon="refresh-cw" variant="secondary" onPress={handleSimulate} loading={simulating} style={{ marginTop: spacing.sm }} />
                </>
              )}

              {error ? <Text style={styles.error}>{error}</Text> : null}
            </Card>

            {preview ? (
              <Card style={{ marginTop: spacing.lg }}>
                <Text style={styles.sectionTitle}>{t('payrollCorrections.previewTitle')}</Text>
                <View style={styles.diffRow}>
                  <Text style={styles.diffLabel}>{t('payrollCorrections.diffGross')}</Text>
                  <Text style={styles.diffOld}>{chf(preview.diff.grossOld)}</Text>
                  <Feather name="arrow-right" size={12} color={colors.textMuted} />
                  <Text style={styles.diffNew}>{chf(preview.diff.grossNew)}</Text>
                </View>
                <View style={styles.diffRow}>
                  <Text style={styles.diffLabel}>{t('payrollCorrections.diffDeductions')}</Text>
                  <Text style={styles.diffOld}>{chf(preview.diff.totalDeductionsOld)}</Text>
                  <Feather name="arrow-right" size={12} color={colors.textMuted} />
                  <Text style={styles.diffNew}>{chf(preview.diff.totalDeductionsNew)}</Text>
                </View>
                <View style={styles.diffRow}>
                  <Text style={styles.diffLabel}>{t('payrollCorrections.diffNet')}</Text>
                  <Text style={styles.diffOld}>{chf(preview.diff.netOld)}</Text>
                  <Feather name="arrow-right" size={12} color={colors.textMuted} />
                  <Text style={styles.diffNew}>{chf(preview.diff.netNew)}</Text>
                </View>

                <View style={styles.netDiffBox}>
                  <Text style={styles.netDiffLabel}>{t('payrollCorrections.netDiffLabel')}</Text>
                  <Text style={[styles.netDiffValue, preview.netDiff < 0 && styles.netDiffValueNegative]}>
                    {preview.netDiff > 0 ? '+' : ''}{chf(preview.netDiff)}
                  </Text>
                </View>

                {preview.netDiff === 0 ? (
                  <Text style={styles.hint}>{t('payrollCorrections.noDiff')}</Text>
                ) : (
                  <>
                    <Text style={[styles.fieldLabel, { marginTop: spacing.md }]}>{t('payrollCorrections.targetPeriodLabel')}</Text>
                    <Text style={styles.hint}>{t('payrollCorrections.targetPeriodHint')}</Text>
                    <View style={styles.periodRow}>
                      <Pressable
                        onPress={() => { let m = targetMonth - 1, y = targetYear; if (m < 1) { m = 12; y -= 1; } setTargetMonth(m); setTargetYear(y); }}
                        hitSlop={8}
                        style={styles.periodArrow}
                      >
                        <Feather name="chevron-left" size={18} color={colors.text} />
                      </Pressable>
                      <Text style={styles.periodLabel}>{monthLabel(targetYear, targetMonth)}</Text>
                      <Pressable
                        onPress={() => { let m = targetMonth + 1, y = targetYear; if (m > 12) { m = 1; y += 1; } setTargetMonth(m); setTargetYear(y); }}
                        hitSlop={8}
                        style={styles.periodArrow}
                      >
                        <Feather name="chevron-right" size={18} color={colors.text} />
                      </Pressable>
                    </View>
                    <Button title={t('payrollCorrections.apply')} icon="check" onPress={handleApply} loading={applying} style={{ marginTop: spacing.sm }} />
                  </>
                )}
              </Card>
            ) : null}

            {history.length > 0 ? (
              <Card style={{ marginTop: spacing.lg }}>
                <Text style={styles.sectionTitle}>{t('payrollCorrections.historyTitle')}</Text>
                <View style={{ gap: spacing.xs, marginTop: spacing.sm }}>
                  {history.map((c) => (
                    <View key={c.id} style={styles.historyRow}>
                      <Text style={styles.historyText}>
                        {t('payrollCorrections.historyLine', {
                          source: monthLabel(c.source_year, c.source_month),
                          target: monthLabel(c.target_year, c.target_month),
                        })}
                      </Text>
                      <Text style={[styles.historyAmount, c.net_diff_chf < 0 && styles.netDiffValueNegative]}>
                        {c.net_diff_chf > 0 ? '+' : ''}{chf(c.net_diff_chf)}
                      </Text>
                    </View>
                  ))}
                </View>
              </Card>
            ) : null}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pageSubtitle: { fontSize: fontSize.sm, color: colors.textMuted, lineHeight: 19 },
  hint: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: spacing.sm, lineHeight: 16 },
  error: { fontSize: fontSize.sm, color: colors.danger, marginTop: spacing.sm },
  fieldLabel: { fontSize: fontSize.sm, color: colors.textMuted, marginBottom: spacing.sm, fontWeight: '500' },
  sectionTitle: { fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  chips: { flexDirection: 'row', gap: spacing.sm },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, marginBottom: spacing.xs },
  chipActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  chipText: { fontSize: fontSize.sm, color: colors.text },
  chipTextActive: { color: colors.primary, fontWeight: '600' },
  periodRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.lg, marginTop: spacing.xs, marginBottom: spacing.xs },
  periodArrow: { padding: spacing.xs },
  periodLabel: { fontSize: fontSize.sm, fontWeight: '800', color: colors.text, textTransform: 'capitalize' },
  diffRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xs },
  diffLabel: { flex: 1, fontSize: fontSize.sm, color: colors.textMuted },
  diffOld: { fontSize: fontSize.sm, color: colors.textMuted, fontVariant: ['tabular-nums'] },
  diffNew: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text, fontVariant: ['tabular-nums'] },
  netDiffBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.sm },
  netDiffLabel: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  netDiffValue: { fontSize: fontSize.lg, fontWeight: '800', color: colors.success, fontVariant: ['tabular-nums'] },
  netDiffValueNegative: { color: colors.danger },
  historyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.xs, borderBottomWidth: 1, borderBottomColor: colors.border },
  historyText: { flex: 1, fontSize: fontSize.xs, color: colors.textMuted },
  historyAmount: { fontSize: fontSize.sm, fontWeight: '700', color: colors.success, fontVariant: ['tabular-nums'] },
});
