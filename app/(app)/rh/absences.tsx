import { useCallback, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import {
  countBusinessDays,
  createAbsence,
  deleteAbsence,
  listAbsences,
  listGhostEmployees,
  updateAbsenceStatus,
  type EmployeeRef,
} from '../../../lib/api/payroll';
import { Button, Card, EmptyState, LoadingScreen, PageHeader, Screen } from '../../../components/ui';
import { DateField } from '../../../components/DateField';
import { getAppLocale, useTranslation } from '../../../lib/translations';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import type { PayrollAbsence, PayrollAbsenceType } from '../../../lib/types';

const ABSENCE_TYPES: PayrollAbsenceType[] = [
  'vacances', 'maladie', 'accident', 'conge_paye', 'conge_non_paye', 'jour_ferie', 'militaire', 'maternite_paternite', 'autre',
];

interface EmployeeItem {
  ref: EmployeeRef;
  name: string;
}

function ownerKeyOf(a: Pick<PayrollAbsence, 'user_id' | 'ghost_employee_id'>): string {
  return (a.user_id ?? a.ghost_employee_id)!;
}

function fmtDate(d: string): string {
  return new Date(`${d}T00:00:00`).toLocaleDateString(`${getAppLocale()}-CH`, { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function AbsencesScreen() {
  const { t } = useTranslation();
  const { organization, user, canManagePayroll } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [absences, setAbsences] = useState<PayrollAbsence[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formOwnerKey, setFormOwnerKey] = useState<string | null>(null);
  const [absenceType, setAbsenceType] = useState<PayrollAbsenceType>('vacances');
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [days, setDays] = useState('');
  const [daysTouched, setDaysTouched] = useState(false);
  const [paid, setPaid] = useState(true);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const employeeByKey = useMemo(() => new Map(employees.map((e) => [e.ref.userId ?? e.ref.ghostEmployeeId!, e])), [employees]);

  const load = useCallback(async () => {
    if (!organization || !user) return;
    setLoading(true);
    setError(null);
    if (canManagePayroll) {
      const [{ data: memberRows }, ghostRows, absenceRows] = await Promise.all([
        supabase.from('organization_members').select('user_id, full_name').eq('organization_id', organization.id),
        listGhostEmployees(organization.id),
        listAbsences(organization.id),
      ]);
      setEmployees([
        ...(memberRows ?? []).map((m): EmployeeItem => ({ ref: { userId: m.user_id }, name: m.full_name || t('payrollHub.memberFallback') })),
        ...ghostRows.map((g): EmployeeItem => ({ ref: { ghostEmployeeId: g.id }, name: g.full_name })),
      ]);
      setAbsences(absenceRows);
    } else {
      const rows = await listAbsences(organization.id, { userId: user.id });
      setAbsences(rows);
    }
    setLoading(false);
  }, [organization, user, canManagePayroll, t]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  function openForm() {
    setFormOwnerKey(canManagePayroll ? (employees[0]?.ref.userId ?? employees[0]?.ref.ghostEmployeeId ?? null) : user!.id);
    setAbsenceType('vacances');
    setStartDate(null);
    setEndDate(null);
    setDays('');
    setDaysTouched(false);
    setPaid(true);
    setNote('');
    setFormError(null);
    setFormOpen(true);
  }

  // Suggests business-day count between the two dates — editable, since a
  // half-day or a different convention is always the requester's call.
  function handleDatesChange(next: { start?: string | null; end?: string | null }) {
    const s = next.start !== undefined ? next.start : startDate;
    const e = next.end !== undefined ? next.end : endDate;
    if (next.start !== undefined) setStartDate(next.start);
    if (next.end !== undefined) setEndDate(next.end);
    if (s && e && e >= s && !daysTouched) {
      setDays(String(countBusinessDays(s, e)));
    }
  }

  async function handleSubmit() {
    if (!organization || !user || !formOwnerKey || !startDate || !endDate) {
      setFormError(t('payrollAbsences.formIncomplete'));
      return;
    }
    const daysNum = Number(days.replace(',', '.'));
    if (!days.trim() || Number.isNaN(daysNum) || daysNum <= 0) {
      setFormError(t('payrollAbsences.formIncomplete'));
      return;
    }
    setSaving(true);
    setFormError(null);
    const ref: EmployeeRef = canManagePayroll && employeeByKey.get(formOwnerKey)?.ref.ghostEmployeeId
      ? { ghostEmployeeId: formOwnerKey }
      : { userId: formOwnerKey };
    const { error: err } = await createAbsence({
      organizationId: organization.id,
      ref,
      absenceType,
      startDate,
      endDate,
      days: daysNum,
      paid,
      note,
      status: canManagePayroll ? 'validee' : 'demandee',
      createdBy: user.id,
    });
    setSaving(false);
    if (err) {
      setFormError(err);
      return;
    }
    setFormOpen(false);
    load();
  }

  async function handleApprove(a: PayrollAbsence) {
    if (!user) return;
    setBusyId(a.id);
    const { error: err } = await updateAbsenceStatus(a.id, 'validee', user.id);
    setBusyId(null);
    if (err) setError(err);
    else load();
  }

  async function handleRefuse(a: PayrollAbsence) {
    if (!user) return;
    setBusyId(a.id);
    const { error: err } = await updateAbsenceStatus(a.id, 'refusee', user.id);
    setBusyId(null);
    if (err) setError(err);
    else load();
  }

  async function handleDelete(a: PayrollAbsence) {
    setBusyId(a.id);
    await deleteAbsence(a.id);
    setBusyId(null);
    load();
  }

  if (!organization || !user) return <LoadingScreen />;

  const sorted = [...absences].sort((a, b) => {
    if (a.status !== b.status) {
      const order = { demandee: 0, validee: 1, refusee: 2 };
      return order[a.status] - order[b.status];
    }
    return b.start_date.localeCompare(a.start_date);
  });

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing.xxl * 2 }}>
        <PageHeader title={t('payrollAbsences.title')} backTo="/(app)/rh" />
        <Text style={styles.pageSubtitle}>{canManagePayroll ? t('payrollAbsences.subtitleManager') : t('payrollAbsences.subtitleSelf')}</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button title={t('payrollAbsences.newRequest')} icon="plus" onPress={openForm} style={{ marginTop: spacing.md, alignSelf: 'flex-start' }} />

        {loading ? (
          <LoadingScreen />
        ) : sorted.length === 0 ? (
          <Card style={{ marginTop: spacing.lg }}>
            <EmptyState title={t('payrollAbsences.emptyTitle')} subtitle={t('payrollAbsences.emptySubtitle')} />
          </Card>
        ) : (
          <View style={{ gap: spacing.sm, marginTop: spacing.lg }}>
            {sorted.map((a) => {
              const key = ownerKeyOf(a);
              const empName = canManagePayroll ? employeeByKey.get(key)?.name ?? t('payrollHub.memberFallback') : null;
              const busy = busyId === a.id;
              return (
                <Card key={a.id} style={styles.row}>
                  <View style={{ flex: 1 }}>
                    {empName ? <Text style={styles.empName}>{empName}</Text> : null}
                    <Text style={styles.typeLabel}>{t(`payrollAbsences.type_${a.absence_type}` as any)}</Text>
                    <Text style={styles.dates}>{fmtDate(a.start_date)} → {fmtDate(a.end_date)} · {a.days} {t('payrollAbsences.daysAbbrev')}</Text>
                    {a.note ? <Text style={styles.note}>{a.note}</Text> : null}
                    <View style={styles.badgeRow}>
                      <View style={[styles.statusBadge, styles[`status_${a.status}` as 'status_demandee']]}>
                        <Text style={styles.statusBadgeText}>{t(`payrollAbsences.status_${a.status}` as any)}</Text>
                      </View>
                      {!a.paid ? <Text style={styles.unpaidTag}>{t('payrollAbsences.unpaid')}</Text> : null}
                    </View>
                  </View>
                  <View style={styles.actions}>
                    {canManagePayroll && a.status === 'demandee' ? (
                      <>
                        <Pressable onPress={() => handleApprove(a)} hitSlop={8} disabled={busy} style={styles.iconBtnGood}>
                          <Feather name="check" size={15} color={colors.success} />
                        </Pressable>
                        <Pressable onPress={() => handleRefuse(a)} hitSlop={8} disabled={busy} style={styles.iconBtnBad}>
                          <Feather name="x" size={15} color={colors.danger} />
                        </Pressable>
                      </>
                    ) : null}
                    {canManagePayroll || (a.user_id === user.id && a.status === 'demandee') ? (
                      <Pressable onPress={() => handleDelete(a)} hitSlop={8} disabled={busy}>
                        <Feather name="trash-2" size={15} color={colors.textMuted} />
                      </Pressable>
                    ) : null}
                  </View>
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>

      <Modal visible={formOpen} animationType="fade" transparent onRequestClose={() => setFormOpen(false)}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <ScrollView style={{ flex: 1 }}>
              <Text style={styles.sheetTitle}>{t('payrollAbsences.newRequest')}</Text>

              {canManagePayroll ? (
                <>
                  <Text style={styles.fieldLabel}>{t('payrollAbsences.employeeLabel')}</Text>
                  <View style={[styles.chips, { flexWrap: 'wrap' }]}>
                    {employees.map((e) => {
                      const key = e.ref.userId ?? e.ref.ghostEmployeeId!;
                      return (
                        <Pressable key={key} onPress={() => setFormOwnerKey(key)} style={[styles.chip, formOwnerKey === key && styles.chipActive]}>
                          <Text style={[styles.chipText, formOwnerKey === key && styles.chipTextActive]}>{e.name}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </>
              ) : null}

              <Text style={styles.fieldLabel}>{t('payrollAbsences.typeLabel')}</Text>
              <View style={[styles.chips, { flexWrap: 'wrap' }]}>
                {ABSENCE_TYPES.map((ty) => (
                  <Pressable key={ty} onPress={() => setAbsenceType(ty)} style={[styles.chip, absenceType === ty && styles.chipActive]}>
                    <Text style={[styles.chipText, absenceType === ty && styles.chipTextActive]}>{t(`payrollAbsences.type_${ty}` as any)}</Text>
                  </Pressable>
                ))}
              </View>

              <View style={styles.dateRow}>
                <View style={{ flex: 1 }}>
                  <DateField label={t('payrollAbsences.startDateLabel')} value={startDate} onChange={(v) => handleDatesChange({ start: v })} />
                </View>
                <View style={{ flex: 1 }}>
                  <DateField label={t('payrollAbsences.endDateLabel')} value={endDate} onChange={(v) => handleDatesChange({ end: v })} />
                </View>
              </View>

              <Text style={styles.fieldLabel}>{t('payrollAbsences.daysLabel')}</Text>
              <Text style={styles.sectionSubtitle}>{t('payrollAbsences.daysHint')}</Text>
              <TextInput
                style={styles.input}
                value={days}
                onChangeText={(v) => { setDays(v); setDaysTouched(true); }}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={colors.textMuted}
              />

              {canManagePayroll ? (
                <Pressable onPress={() => setPaid((p) => !p)} style={styles.paidRow}>
                  <View style={[styles.checkbox, paid && styles.checkboxActive]}>{paid ? <Feather name="check" size={12} color={colors.surface} /> : null}</View>
                  <Text style={styles.fieldLabel}>{t('payrollAbsences.paidLabel')}</Text>
                </Pressable>
              ) : null}

              <Text style={styles.fieldLabel}>{t('payrollAbsences.noteLabel')}</Text>
              <TextInput style={styles.input} value={note} onChangeText={setNote} placeholder={t('payrollAbsences.notePlaceholder')} placeholderTextColor={colors.textMuted} />

              {formError ? <Text style={styles.error}>{formError}</Text> : null}

              <Button title={t('payrollAbsences.submit')} icon="check" onPress={handleSubmit} loading={saving} style={{ marginTop: spacing.md }} />
              <Button title={t('payrollSlips.close')} variant="secondary" onPress={() => setFormOpen(false)} style={{ marginTop: spacing.sm }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pageSubtitle: { fontSize: fontSize.sm, color: colors.textMuted, lineHeight: 19 },
  error: { fontSize: fontSize.sm, color: colors.danger, marginTop: spacing.md },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  empName: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  typeLabel: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text, marginTop: 2 },
  dates: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  note: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2, fontStyle: 'italic' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.pill },
  status_demandee: { backgroundColor: colors.warningSoft },
  status_validee: { backgroundColor: colors.successSoft },
  status_refusee: { backgroundColor: colors.dangerSoft },
  statusBadgeText: { fontSize: 10, fontWeight: '700', color: colors.text },
  unpaidTag: { fontSize: 10, color: colors.textMuted, fontStyle: 'italic' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  iconBtnGood: { padding: spacing.xs, borderRadius: radius.sm, backgroundColor: colors.successSoft },
  iconBtnBad: { padding: spacing.xs, borderRadius: radius.sm, backgroundColor: colors.dangerSoft },
  backdrop: { flex: 1, backgroundColor: 'rgba(15, 20, 18, 0.5)', alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  sheet: { width: '100%', maxWidth: 480, maxHeight: '88%', backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.xl },
  sheetTitle: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text, marginBottom: spacing.md },
  sectionSubtitle: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2, lineHeight: 16 },
  fieldLabel: { fontSize: fontSize.sm, color: colors.textMuted, marginBottom: spacing.sm, fontWeight: '500', marginTop: spacing.md },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: fontSize.md, color: colors.text, backgroundColor: colors.surface, marginTop: spacing.xs },
  chips: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, marginBottom: spacing.xs },
  chipActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  chipText: { fontSize: fontSize.sm, color: colors.text },
  chipTextActive: { color: colors.primary, fontWeight: '600' },
  dateRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  paidRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md },
  checkbox: { width: 20, height: 20, borderRadius: radius.sm, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  checkboxActive: { backgroundColor: colors.primary, borderColor: colors.primary },
});
