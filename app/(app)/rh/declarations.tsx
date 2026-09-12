import { useCallback, useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import { listGhostEmployees, listPayrollSlipsForYear, type PayrollSlip } from '../../../lib/api/payroll';
import { Button, Card, EmptyState, LoadingScreen, PageHeader, Screen } from '../../../components/ui';
import { getAppLocale, useTranslation } from '../../../lib/translations';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';

interface EmployeeRow {
  key: string;
  name: string;
  gross: number;
  totalDeductions: number;
  employerCost: number;
  net: number;
  byLabel: Map<string, number>;
  monthsPresent: number;
}

function chf(n: number): string {
  return `CHF ${n.toLocaleString(`${getAppLocale()}-CH`, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export default function PayrollDeclarationsScreen() {
  const { t } = useTranslation();
  const { organization, canManagePayroll } = useAuth();

  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [slips, setSlips] = useState<PayrollSlip[]>([]);
  const [names, setNames] = useState<Map<string, string>>(new Map());

  const load = useCallback(async () => {
    if (!organization || !canManagePayroll) return;
    setLoading(true);
    const [{ data: memberRows }, ghostRows, slipRows] = await Promise.all([
      supabase.from('organization_members').select('user_id, full_name').eq('organization_id', organization.id),
      listGhostEmployees(organization.id),
      listPayrollSlipsForYear(organization.id, year),
    ]);
    const nameMap = new Map<string, string>();
    for (const m of memberRows ?? []) nameMap.set(m.user_id, m.full_name || t('payrollHub.memberFallback'));
    for (const g of ghostRows) nameMap.set(g.id, g.full_name);
    setNames(nameMap);
    setSlips(slipRows);
    setLoading(false);
  }, [organization, canManagePayroll, year, t]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const { rows, labels, totals } = useMemo(() => {
    const labelSet = new Set<string>();
    const byOwner = new Map<string, EmployeeRow>();
    for (const s of slips) {
      for (const l of s.snapshot?.lines ?? []) labelSet.add(l.label);
      let row = byOwner.get(s.ownerKey);
      if (!row) {
        row = { key: s.ownerKey, name: names.get(s.ownerKey) ?? s.ownerKey, gross: 0, totalDeductions: 0, employerCost: 0, net: 0, byLabel: new Map(), monthsPresent: 0 };
        byOwner.set(s.ownerKey, row);
      }
      row.gross = round2(row.gross + s.gross);
      row.totalDeductions = round2(row.totalDeductions + s.totalDeductions);
      row.employerCost = round2(row.employerCost + (s.employerCost ?? 0));
      row.net = round2(row.net + s.net);
      row.monthsPresent += 1;
      for (const l of s.snapshot?.lines ?? []) {
        row.byLabel.set(l.label, round2((row.byLabel.get(l.label) ?? 0) + l.amount));
      }
    }
    const rowsArr = Array.from(byOwner.values()).sort((a, b) => a.name.localeCompare(b.name));
    const labelsArr = Array.from(labelSet.values()).sort();
    const totalsRow = {
      gross: round2(rowsArr.reduce((s, r) => s + r.gross, 0)),
      totalDeductions: round2(rowsArr.reduce((s, r) => s + r.totalDeductions, 0)),
      employerCost: round2(rowsArr.reduce((s, r) => s + r.employerCost, 0)),
      net: round2(rowsArr.reduce((s, r) => s + r.net, 0)),
      byLabel: new Map(labelsArr.map((l) => [l, round2(rowsArr.reduce((s, r) => s + (r.byLabel.get(l) ?? 0), 0))])),
    };
    return { rows: rowsArr, labels: labelsArr, totals: totalsRow };
  }, [slips, names]);

  function buildCsv(): string {
    const header = ['Employé', 'Brut', ...labels, 'Cotisations totales', 'Coût employeur', 'Net', 'Mois inclus'];
    const lines = [header.join(';')];
    for (const r of rows) {
      const cells = [
        r.name,
        r.gross.toFixed(2),
        ...labels.map((l) => (r.byLabel.get(l) ?? 0).toFixed(2)),
        r.totalDeductions.toFixed(2),
        r.employerCost.toFixed(2),
        r.net.toFixed(2),
        String(r.monthsPresent),
      ];
      lines.push(cells.map((c) => c.replace(/;/g, ',')).join(';'));
    }
    const totalCells = [
      t('payrollDeclarations.totalRow'),
      totals.gross.toFixed(2),
      ...labels.map((l) => (totals.byLabel.get(l) ?? 0).toFixed(2)),
      totals.totalDeductions.toFixed(2),
      totals.employerCost.toFixed(2),
      totals.net.toFixed(2),
      '',
    ];
    lines.push(totalCells.join(';'));
    return lines.join('\n');
  }

  async function handleExport() {
    const csv = buildCsv();
    const filename = `declarations-sociales-${year}.csv`;
    if (Platform.OS === 'web') {
      const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  if (!organization) return <LoadingScreen />;

  if (!canManagePayroll) {
    return (
      <Screen>
        <ScrollView contentContainerStyle={{ padding: spacing.xl }}>
          <PageHeader title={t('payrollDeclarations.title')} backTo="/(app)/rh" />
          <Card><EmptyState title={t('payrollDeclarations.title')} subtitle={t('payrollHub.selfSubtitle')} /></Card>
        </ScrollView>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing.xxl * 2 }}>
        <PageHeader title={t('payrollDeclarations.title')} backTo="/(app)/rh" />
        <Text style={styles.pageSubtitle}>{t('payrollDeclarations.subtitle')}</Text>
        <View style={styles.disclaimerBox}>
          <Feather name="info" size={14} color={colors.textMuted} />
          <Text style={styles.disclaimerText}>{t('payrollDeclarations.disclaimer')}</Text>
        </View>

        <View style={styles.periodRow}>
          <Pressable onPress={() => setYear((y) => y - 1)} hitSlop={8} style={styles.periodArrow}>
            <Feather name="chevron-left" size={18} color={colors.text} />
          </Pressable>
          <Text style={styles.periodLabel}>{year}</Text>
          <Pressable onPress={() => setYear((y) => y + 1)} hitSlop={8} style={styles.periodArrow}>
            <Feather name="chevron-right" size={18} color={colors.text} />
          </Pressable>
        </View>

        {loading ? (
          <LoadingScreen />
        ) : rows.length === 0 ? (
          <Card><EmptyState title={t('payrollDeclarations.emptyTitle')} subtitle={t('payrollDeclarations.emptySubtitle')} /></Card>
        ) : (
          <>
            <Card style={{ marginTop: spacing.lg }}>
              <View style={styles.summaryRow}>
                <SummaryStat label={t('payrollDeclarations.totalGross')} value={chf(totals.gross)} />
                <SummaryStat label={t('payrollDeclarations.totalDeductions')} value={chf(totals.totalDeductions)} />
                <SummaryStat label={t('payrollDeclarations.totalEmployerCost')} value={chf(totals.employerCost)} />
                <SummaryStat label={t('payrollDeclarations.totalNet')} value={chf(totals.net)} accent />
              </View>
              {Platform.OS === 'web' ? (
                <Button title={t('payrollDeclarations.exportCsv')} icon="download" variant="secondary" onPress={handleExport} style={{ marginTop: spacing.md, alignSelf: 'flex-start' }} />
              ) : null}
            </Card>

            <View style={{ gap: spacing.sm, marginTop: spacing.lg }}>
              {rows.map((r) => (
                <Card key={r.key}>
                  <Text style={styles.empName}>{r.name}</Text>
                  <Text style={styles.empMeta}>{t('payrollDeclarations.monthsIncluded', { count: r.monthsPresent })}</Text>
                  <View style={styles.empRow}>
                    <EmpStat label={t('payrollDeclarations.gross')} value={r.gross} />
                    <EmpStat label={t('payrollDeclarations.deductions')} value={r.totalDeductions} />
                    <EmpStat label={t('payrollDeclarations.employerCost')} value={r.employerCost} />
                    <EmpStat label={t('payrollDeclarations.net')} value={r.net} accent />
                  </View>
                  {labels.length > 0 ? (
                    <View style={styles.labelWrap}>
                      {labels
                        .filter((l) => (r.byLabel.get(l) ?? 0) !== 0)
                        .map((l) => (
                          <View key={l} style={styles.labelChip}>
                            <Text style={styles.labelChipText}>{l}: {chf(r.byLabel.get(l) ?? 0)}</Text>
                          </View>
                        ))}
                    </View>
                  ) : null}
                </Card>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

function SummaryStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={[styles.summaryValue, accent && styles.summaryValueAccent]}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function EmpStat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={[styles.empStatValue, accent && styles.empStatValueAccent]}>{chf(value)}</Text>
      <Text style={styles.empStatLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pageSubtitle: { fontSize: fontSize.sm, color: colors.textMuted, lineHeight: 19 },
  disclaimerBox: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: spacing.sm, marginTop: spacing.sm },
  disclaimerText: { flex: 1, fontSize: fontSize.xs, color: colors.textMuted, lineHeight: 16 },
  periodRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.lg, marginTop: spacing.lg },
  periodArrow: { padding: spacing.xs },
  periodLabel: { fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  summaryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  summaryValue: { fontSize: fontSize.lg, fontWeight: '800', color: colors.text, fontVariant: ['tabular-nums'] },
  summaryValueAccent: { color: colors.primary },
  summaryLabel: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  empName: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  empMeta: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  empRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.sm },
  empStatValue: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text, fontVariant: ['tabular-nums'] },
  empStatValueAccent: { color: colors.primary },
  empStatLabel: { fontSize: 10, color: colors.textMuted, marginTop: 1 },
  labelWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.sm },
  labelChip: { backgroundColor: colors.surfaceAlt, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  labelChipText: { fontSize: 10, color: colors.textMuted },
});
