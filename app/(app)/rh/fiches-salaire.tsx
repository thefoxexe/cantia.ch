import { useCallback, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import {
  listGhostEmployees,
  listDeductionTypes,
  listProfileDeductions,
  listWageTypes,
  listProfileWageRates,
  listSlipWageLines,
  addSlipWageLine,
  deleteSlipWageLine,
  getPayrollProfile,
  listPayrollSlips,
  calculateAndSavePayrollSlip,
  validatePayrollSlip,
  markPayrollSlipPaid,
  reversePayrollSlip,
  type PayrollSlip,
  type EmployeeRef,
  type PayrollSlipWageLineWithType,
} from '../../../lib/api/payroll';
import { generatePayslipPdf } from '../../../lib/api/pdf';
import { downloadFile } from '../../../lib/downloadFile';
import { Button, Card, EmptyState, LoadingScreen, PageHeader, Screen } from '../../../components/ui';
import { getAppLocale, useTranslation } from '../../../lib/translations';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import type { PayrollWageType } from '../../../lib/types';

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
  const { organization, canManagePayroll, user } = useAuth();
  const router = useRouter();
  const now = new Date();
  const [year, setYear] = useState(now.getUTCFullYear());
  const [month, setMonth] = useState(now.getUTCMonth() + 1);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [slips, setSlips] = useState<Map<string, PayrollSlip>>(new Map());
  const [wageTypes, setWageTypes] = useState<PayrollWageType[]>([]);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [exportingKey, setExportingKey] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState<'calculate' | 'validate' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [linesFor, setLinesFor] = useState<EmployeeItem | null>(null);
  const [lines, setLines] = useState<PayrollSlipWageLineWithType[]>([]);
  const [linesLoading, setLinesLoading] = useState(false);
  const [newWageTypeId, setNewWageTypeId] = useState<string | null>(null);
  const [newAmount, setNewAmount] = useState('');
  const [newNote, setNewNote] = useState('');
  const [lineSaving, setLineSaving] = useState(false);
  const [lineError, setLineError] = useState<string | null>(null);

  function ownerKeyOf(ref: EmployeeRef): string {
    return ref.userId ?? ref.ghostEmployeeId!;
  }

  const load = useCallback(async () => {
    if (!organization || !canManagePayroll) return;
    setLoading(true);
    setError(null);
    const [{ data: memberRows }, ghostRows, slipRows, wageRows] = await Promise.all([
      supabase.from('organization_members').select('user_id, full_name').eq('organization_id', organization.id),
      listGhostEmployees(organization.id),
      listPayrollSlips(organization.id, year, month),
      listWageTypes(organization.id),
    ]);
    setEmployees([
      ...(memberRows ?? []).map((m): EmployeeItem => ({ ref: { userId: m.user_id }, name: m.full_name || t('payrollHub.memberFallback') })),
      ...ghostRows.map((g): EmployeeItem => ({ ref: { ghostEmployeeId: g.id }, name: g.full_name })),
    ]);
    setSlips(new Map(slipRows.map((s) => [s.ownerKey, s])));
    setWageTypes(wageRows);
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

  async function calculateOne(item: EmployeeItem): Promise<{ error: string | null }> {
    if (!organization) return { error: null };
    const profile = await getPayrollProfile(organization.id, item.ref);
    if (!profile) return { error: t('payrollSlips.noProfile', { name: item.name }) };
    const [deductionTypes, overrides, wageRateOverrides] = await Promise.all([
      listDeductionTypes(organization.id),
      listProfileDeductions(organization.id, item.ref),
      listProfileWageRates(organization.id, item.ref),
    ]);
    return calculateAndSavePayrollSlip(
      organization.id,
      item.ref,
      year,
      month,
      profile,
      deductionTypes,
      overrides,
      wageTypes,
      wageRateOverrides,
    );
  }

  async function handleCalculate(item: EmployeeItem) {
    const key = ownerKeyOf(item.ref);
    setBusyKey(key);
    setError(null);
    const { error: err } = await calculateOne(item);
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

  // "Calculer/Valider tout" — the user's explicit request to generate the
  // whole team's slips at once instead of clicking through every row.
  // Sequential (not Promise.all) so one failure doesn't cut off the rest,
  // and so `error` reliably reflects the last failure if several occur.
  async function handleCalculateAll() {
    setBulkBusy('calculate');
    setError(null);
    let lastError: string | null = null;
    for (const item of employees) {
      const slip = slips.get(ownerKeyOf(item.ref));
      if (slip && slip.status !== 'brouillon' && slip.status !== 'calculee') continue;
      const { error: err } = await calculateOne(item);
      if (err) lastError = err;
    }
    setBulkBusy(null);
    if (lastError) setError(lastError);
    load();
  }

  async function handleValidateAll() {
    setBulkBusy('validate');
    setError(null);
    let lastError: string | null = null;
    for (const slip of slips.values()) {
      if (slip.status !== 'calculee') continue;
      const { error: err } = await validatePayrollSlip(slip.id);
      if (err) lastError = err;
    }
    setBulkBusy(null);
    if (lastError) setError(lastError);
    load();
  }

  async function handleExportPdf(item: EmployeeItem, key: string) {
    setExportingKey(key);
    setError(null);
    const periodStart = `${year}-${String(month).padStart(2, '0')}-01`;
    const { url, error: genError } = await generatePayslipPdf(item.ref, periodStart);
    if (genError || !url) {
      setExportingKey(null);
      setError(genError ?? t('payrollSlips.pdfGenerationFailed'));
      return;
    }
    const { error: dlError } = await downloadFile(url, `${t('payrollSlips.payslipFilename', { name: item.name, month: monthLabel(year, month) })}.pdf`);
    setExportingKey(null);
    if (dlError) setError(dlError);
  }

  const manualWageTypes = wageTypes.filter((w) => w.mode === 'manual_entry' && w.active);

  async function openLines(item: EmployeeItem) {
    if (!organization) return;
    setLinesFor(item);
    setLineError(null);
    setNewWageTypeId(manualWageTypes[0]?.id ?? null);
    setNewAmount('');
    setNewNote('');
    setLinesLoading(true);
    const rows = await listSlipWageLines(organization.id, item.ref, year, month);
    setLines(rows);
    setLinesLoading(false);
  }

  async function handleAddLine() {
    if (!organization || !linesFor || !newWageTypeId) return;
    const amountNum = Number(newAmount.replace(',', '.'));
    if (!newAmount.trim() || Number.isNaN(amountNum) || amountNum === 0) {
      setLineError(t('payrollSlips.lineAmountRequired'));
      return;
    }
    setLineSaving(true);
    setLineError(null);
    const { error: err } = await addSlipWageLine({
      organizationId: organization.id,
      ref: linesFor.ref,
      year,
      month,
      wageTypeId: newWageTypeId,
      amountChf: amountNum,
      note: newNote,
      createdBy: user?.id,
    });
    setLineSaving(false);
    if (err) {
      setLineError(err);
      return;
    }
    setNewAmount('');
    setNewNote('');
    const rows = await listSlipWageLines(organization.id, linesFor.ref, year, month);
    setLines(rows);
  }

  async function handleDeleteLine(id: string) {
    if (!organization || !linesFor) return;
    setLineSaving(true);
    await deleteSlipWageLine(id);
    const rows = await listSlipWageLines(organization.id, linesFor.ref, year, month);
    setLines(rows);
    setLineSaving(false);
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
        <PageHeader title={t('payrollSlips.title')} backTo="/(app)/rh/salaires" />
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

        {employees.length > 0 ? (
          <View style={styles.bulkRow}>
            <Button
              title={t('payrollSlips.calculateAll')}
              icon="zap"
              variant="secondary"
              onPress={handleCalculateAll}
              loading={bulkBusy === 'calculate'}
              disabled={bulkBusy !== null}
            />
            <Button
              title={t('payrollSlips.validateAll')}
              icon="check-circle"
              variant="secondary"
              onPress={handleValidateAll}
              loading={bulkBusy === 'validate'}
              disabled={bulkBusy !== null}
            />
          </View>
        ) : null}

        <View style={styles.rubriquesHint}>
          <Feather name="info" size={13} color={colors.textMuted} />
          <Text style={styles.rubriquesHintText}>{t('payrollSlips.rubriquesHint')}</Text>
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
              const exporting = exportingKey === key;
              const editable = !slip || slip.status === 'brouillon' || slip.status === 'calculee';
              const canDownload = !!slip && slip.status !== 'brouillon';
              return (
                <Card key={key} style={styles.card}>
                  <Pressable
                    onPress={() => router.push({ pathname: '/(app)/rh/[userId]', params: item.ref.ghostEmployeeId ? { userId: item.ref.ghostEmployeeId, kind: 'ghost' } : { userId: item.ref.userId! } })}
                  >
                    <Text style={styles.name}>{item.name}</Text>
                    {slip ? (
                      <View style={styles.statusRow}>
                        <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[slip.status] }]} />
                        <Text style={styles.statusText}>{t(`payrollSlips.status_${slip.status}` as any)}</Text>
                        <Text style={styles.amount}>{t('payrollSlips.netAmount', { amount: chf(slip.net) })}</Text>
                        {slip.employerCost != null ? (
                          <Text style={styles.employerCost}>{t('payrollSlips.employerCostAmount', { amount: chf(slip.employerCost) })}</Text>
                        ) : null}
                      </View>
                    ) : (
                      <Text style={styles.notCalculated}>{t('payrollSlips.notCalculated')}</Text>
                    )}
                  </Pressable>
                  <View style={styles.actions}>
                    <Pressable onPress={() => openLines(item)} hitSlop={8} style={styles.linesBtn}>
                      <Feather name="plus-circle" size={15} color={colors.primary} />
                      <Text style={styles.linesBtnText}>{t('payrollSlips.lines')}</Text>
                    </Pressable>
                    {editable ? (
                      <Button title={t('payrollSlips.calculate')} variant="secondary" onPress={() => handleCalculate(item)} loading={busy} />
                    ) : null}
                    {slip?.status === 'calculee' ? (
                      <Button title={t('payrollSlips.validate')} onPress={() => handleValidate(slip, key)} loading={busy} />
                    ) : null}
                    {slip?.status === 'validee' ? (
                      <Button title={t('payrollSlips.markPaid')} onPress={() => handleMarkPaid(slip, key)} loading={busy} />
                    ) : null}
                    {canDownload ? (
                      <Pressable onPress={() => handleExportPdf(item, key)} disabled={exporting} hitSlop={8} style={styles.pdfBtn}>
                        <Feather name="download" size={14} color={colors.text} />
                      </Pressable>
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

      <Modal visible={linesFor !== null} animationType="fade" transparent onRequestClose={() => setLinesFor(null)}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <ScrollView style={{ flex: 1 }}>
              <Text style={styles.sheetTitle}>{t('payrollSlips.linesModalTitle', { name: linesFor?.name ?? '' })}</Text>
              <Text style={styles.sectionSubtitle}>{monthLabel(year, month)}</Text>

              {linesLoading ? (
                <LoadingScreen />
              ) : lines.length === 0 ? (
                <Text style={styles.emptyText}>{t('payrollSlips.linesEmpty')}</Text>
              ) : (
                <View style={{ gap: spacing.xs, marginTop: spacing.md }}>
                  {lines.map((l) => (
                    <View key={l.id} style={styles.lineRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.lineLabel}>{l.wage_type_label}</Text>
                        {l.note ? <Text style={styles.lineNote}>{l.note}</Text> : null}
                      </View>
                      <Text style={[styles.lineAmount, l.wage_type_kind === 'net_adjustment' && Number(l.amount_chf) < 0 ? styles.lineAmountNegative : null]}>
                        {chf(Number(l.amount_chf))}
                      </Text>
                      <Pressable onPress={() => handleDeleteLine(l.id)} hitSlop={8} disabled={lineSaving}>
                        <Feather name="x" size={16} color={colors.textMuted} />
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}

              <Text style={[styles.fieldLabel, { marginTop: spacing.lg }]}>{t('payrollSlips.lineTypeLabel')}</Text>
              <View style={[styles.chips, { flexWrap: 'wrap' }]}>
                {manualWageTypes.map((w) => (
                  <Pressable
                    key={w.id}
                    onPress={() => setNewWageTypeId(w.id)}
                    style={[styles.chip, newWageTypeId === w.id && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, newWageTypeId === w.id && styles.chipTextActive]}>{w.label}</Text>
                  </Pressable>
                ))}
              </View>
              {manualWageTypes.length === 0 ? <Text style={styles.emptyText}>{t('payrollSlips.noWageTypes')}</Text> : null}

              <Text style={styles.fieldLabel}>{t('payrollSlips.lineAmountLabel')}</Text>
              <Text style={styles.sectionSubtitle}>{t('payrollSlips.lineAmountHint')}</Text>
              <TextInput
                style={styles.input}
                value={newAmount}
                onChangeText={setNewAmount}
                keyboardType="numbers-and-punctuation"
                placeholder={t('payrollSlips.lineAmountPlaceholder')}
                placeholderTextColor={colors.textMuted}
              />

              <Text style={styles.fieldLabel}>{t('payrollSlips.lineNoteLabel')}</Text>
              <TextInput
                style={styles.input}
                value={newNote}
                onChangeText={setNewNote}
                placeholder={t('payrollSlips.lineNotePlaceholder')}
                placeholderTextColor={colors.textMuted}
              />

              {lineError ? <Text style={styles.error}>{lineError}</Text> : null}

              <Button
                title={t('payrollSlips.lineAdd')}
                icon="plus"
                onPress={handleAddLine}
                loading={lineSaving}
                disabled={manualWageTypes.length === 0}
                style={{ marginTop: spacing.sm }}
              />
              <Button title={t('payrollSlips.close')} variant="secondary" onPress={() => { setLinesFor(null); load(); }} style={{ marginTop: spacing.sm }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pageSubtitle: { fontSize: fontSize.sm, color: colors.textMuted, lineHeight: 19, marginBottom: spacing.lg },
  periodRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.lg },
  periodArrow: { padding: spacing.xs },
  periodLabel: { fontSize: fontSize.md, fontWeight: '800', color: colors.text, textTransform: 'capitalize' },
  bulkRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center', marginTop: spacing.lg },
  rubriquesHint: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.md, paddingHorizontal: spacing.sm },
  rubriquesHintText: { flex: 1, fontSize: fontSize.xs, color: colors.textMuted, lineHeight: 16 },
  error: { fontSize: fontSize.sm, color: colors.danger, marginTop: spacing.md },
  card: { gap: spacing.md },
  name: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 4 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: fontSize.xs, color: colors.textMuted, fontWeight: '600' },
  amount: { fontSize: fontSize.xs, color: colors.textMuted, fontVariant: ['tabular-nums'] },
  employerCost: { fontSize: fontSize.xs, color: colors.textMuted, fontVariant: ['tabular-nums'] },
  notCalculated: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 4, fontStyle: 'italic' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm },
  reverseBtn: { padding: spacing.xs },
  pdfBtn: { padding: spacing.xs, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  linesBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.md, backgroundColor: colors.primarySoft },
  linesBtnText: { fontSize: fontSize.sm, fontWeight: '700', color: colors.primary },
  backdrop: { flex: 1, backgroundColor: 'rgba(15, 20, 18, 0.5)', alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  sheet: { width: '100%', maxWidth: 460, maxHeight: '88%', backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.xl },
  sheetTitle: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text },
  sectionSubtitle: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2, lineHeight: 16 },
  emptyText: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.md },
  lineRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xs, paddingHorizontal: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  lineLabel: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
  lineNote: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  lineAmount: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text, fontVariant: ['tabular-nums'] },
  lineAmountNegative: { color: colors.danger },
  fieldLabel: { fontSize: fontSize.sm, color: colors.textMuted, marginBottom: spacing.sm, fontWeight: '500', marginTop: spacing.md },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: fontSize.md, color: colors.text, backgroundColor: colors.surface, marginTop: spacing.xs },
  chips: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, marginBottom: spacing.xs },
  chipActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  chipText: { fontSize: fontSize.sm, color: colors.text },
  chipTextActive: { color: colors.primary, fontWeight: '600' },
});
