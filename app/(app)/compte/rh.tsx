import { useCallback, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import {
  createDeductionType,
  createExpenseType,
  createWorkType,
  deleteDeductionType,
  deleteExpenseType,
  deleteWorkType,
  listDeductionTypes,
  listExpenseTypes,
  listWorkTypes,
  updateDeductionType,
  updateExpenseType,
  updateWorkType,
} from '../../../lib/api/payroll';
import { Button, Card, Container, PageHeader, Screen, Switch } from '../../../components/ui';
import { showSavedCheckmark } from '../../../components/SaveConfirmation';
import { useTranslation } from '../../../lib/translations';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import type { PayrollDeductionType, PayrollExpenseType, PayrollWorkType } from '../../../lib/types';

type Kind = 'work' | 'expense' | 'deduction';

export default function PayrollSettingsScreen() {
  const { t } = useTranslation();
  const { organization, canManagePayroll } = useAuth();
  const [workTypes, setWorkTypes] = useState<PayrollWorkType[]>([]);
  const [expenseTypes, setExpenseTypes] = useState<PayrollExpenseType[]>([]);
  const [deductionTypes, setDeductionTypes] = useState<PayrollDeductionType[]>([]);
  const [loading, setLoading] = useState(true);

  const [editKind, setEditKind] = useState<Kind | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [label, setLabel] = useState('');
  const [rate, setRate] = useState('');
  const [unit, setUnit] = useState<'km' | 'forfait'>('forfait');
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!organization) return;
    setLoading(true);
    const [work, expense, deduction] = await Promise.all([
      listWorkTypes(organization.id),
      listExpenseTypes(organization.id),
      listDeductionTypes(organization.id),
    ]);
    setWorkTypes(work);
    setExpenseTypes(expense);
    setDeductionTypes(deduction);
    setLoading(false);
  }, [organization]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  function openAdd(kind: Kind) {
    setEditKind(kind);
    setEditId(null);
    setLabel('');
    setRate('');
    setUnit('forfait');
    setActive(true);
    setError(null);
  }

  function openEditWork(w: PayrollWorkType) {
    setEditKind('work');
    setEditId(w.id);
    setLabel(w.label);
    setRate(w.hourly_rate_chf != null ? String(w.hourly_rate_chf) : '');
    setActive(w.active);
    setError(null);
  }

  function openEditExpense(e: PayrollExpenseType) {
    setEditKind('expense');
    setEditId(e.id);
    setLabel(e.label);
    setRate(e.rate_chf != null ? String(e.rate_chf) : '');
    setUnit(e.unit);
    setActive(e.active);
    setError(null);
  }

  function openEditDeduction(d: PayrollDeductionType) {
    setEditKind('deduction');
    setEditId(d.id);
    setLabel(d.label);
    setRate(d.default_rate_percent != null ? String(d.default_rate_percent) : '');
    setActive(d.active);
    setError(null);
  }

  async function handleSave() {
    if (!organization || !editKind) return;
    if (!label.trim()) {
      setError(t('payrollSettings.nameRequired'));
      return;
    }
    setSaving(true);
    setError(null);
    const rateNum = rate.trim() ? Number(rate.replace(',', '.')) : null;

    let err: string | null = null;
    if (editKind === 'work') {
      err = editId
        ? (await updateWorkType(editId, { label, hourlyRateChf: rateNum, active })).error
        : (await createWorkType(organization.id, label, rateNum, workTypes.length)).error;
    } else if (editKind === 'expense') {
      err = editId
        ? (await updateExpenseType(editId, { label, unit, rateChf: rateNum, active })).error
        : (await createExpenseType(organization.id, label, unit, rateNum, expenseTypes.length)).error;
    } else {
      err = editId
        ? (await updateDeductionType(editId, { label, defaultRatePercent: rateNum, active })).error
        : (await createDeductionType(organization.id, label, rateNum, deductionTypes.length)).error;
    }

    setSaving(false);
    if (err) {
      setError(err);
      return;
    }
    setEditKind(null);
    load();
    showSavedCheckmark();
  }

  async function handleDelete() {
    if (!editKind || !editId) return;
    setSaving(true);
    if (editKind === 'work') await deleteWorkType(editId);
    else if (editKind === 'expense') await deleteExpenseType(editId);
    else await deleteDeductionType(editId);
    setSaving(false);
    setEditKind(null);
    load();
  }

  if (!canManagePayroll) {
    return (
      <Screen style={{ padding: spacing.xl }}>
        <PageHeader title={t('payrollSettings.title')} backTo="/(app)/compte" />
        <Card style={{ marginTop: spacing.lg }}>
          <Text style={styles.emptyText}>{t('payrollSettings.adminOnlyHint')}</Text>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl * 2 }}>
        <Container>
          <PageHeader title={t('payrollSettings.title')} backTo="/(app)/compte" />
          <Text style={styles.hint}>{t('payrollSettings.intro')}</Text>

          <TypeSection
            title={t('payrollSettings.workTypesTitle')}
            subtitle={t('payrollSettings.workTypesSubtitle')}
            loading={loading}
            rows={workTypes.map((w) => ({
              id: w.id,
              label: w.label,
              meta: w.hourly_rate_chf != null ? `CHF ${w.hourly_rate_chf.toFixed(2)}/h` : null,
              active: w.active,
              onPress: () => openEditWork(w),
            }))}
            onAdd={() => openAdd('work')}
          />

          <TypeSection
            title={t('payrollSettings.expenseTypesTitle')}
            subtitle={t('payrollSettings.expenseTypesSubtitle')}
            loading={loading}
            rows={expenseTypes.map((e) => ({
              id: e.id,
              label: e.label,
              meta: e.unit === 'km' && e.rate_chf != null ? `CHF ${e.rate_chf.toFixed(2)}/km` : t('payrollSettings.freeAmount'),
              active: e.active,
              onPress: () => openEditExpense(e),
            }))}
            onAdd={() => openAdd('expense')}
          />

          <TypeSection
            title={t('payrollSettings.deductionTypesTitle')}
            subtitle={t('payrollSettings.deductionTypesSubtitle')}
            loading={loading}
            rows={deductionTypes.map((d) => ({
              id: d.id,
              label: d.label,
              meta: d.default_rate_percent != null ? `${d.default_rate_percent}%` : null,
              active: d.active,
              onPress: () => openEditDeduction(d),
            }))}
            onAdd={() => openAdd('deduction')}
          />
        </Container>
      </ScrollView>

      <Modal visible={editKind !== null} animationType="fade" transparent onRequestClose={() => setEditKind(null)}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <ScrollView>
              <Text style={styles.sheetTitle}>
                {editId
                  ? editKind === 'work'
                    ? t('payrollSettings.modalTitleWorkEdit')
                    : editKind === 'expense'
                      ? t('payrollSettings.modalTitleExpenseEdit')
                      : t('payrollSettings.modalTitleDeductionEdit')
                  : editKind === 'work'
                    ? t('payrollSettings.modalTitleWorkAdd')
                    : editKind === 'expense'
                      ? t('payrollSettings.modalTitleExpenseAdd')
                      : t('payrollSettings.modalTitleDeductionAdd')}
              </Text>

              <Text style={styles.fieldLabel}>{t('payrollSettings.nameLabel')}</Text>
              <TextInput
                style={styles.input}
                value={label}
                onChangeText={setLabel}
                placeholder={
                  editKind === 'deduction'
                    ? t('payrollSettings.deductionNamePlaceholder')
                    : editKind === 'expense'
                      ? t('payrollSettings.expenseNamePlaceholder')
                      : t('payrollSettings.workNamePlaceholder')
                }
                placeholderTextColor={colors.textMuted}
              />

              {editKind === 'expense' ? (
                <>
                  <Text style={styles.fieldLabel}>{t('payrollSettings.amountTypeLabel')}</Text>
                  <View style={styles.chips}>
                    <Pressable onPress={() => setUnit('km')} style={[styles.chip, unit === 'km' && styles.chipActive]}>
                      <Text style={[styles.chipText, unit === 'km' && styles.chipTextActive]}>{t('payrollSettings.perKilometer')}</Text>
                    </Pressable>
                    <Pressable onPress={() => setUnit('forfait')} style={[styles.chip, unit === 'forfait' && styles.chipActive]}>
                      <Text style={[styles.chipText, unit === 'forfait' && styles.chipTextActive]}>{t('payrollSettings.freeAmount')}</Text>
                    </Pressable>
                  </View>
                </>
              ) : null}

              {editKind !== 'expense' || unit === 'km' ? (
                <>
                  <Text style={styles.fieldLabel}>
                    {editKind === 'work'
                      ? t('payrollSettings.hourlyRateLabel')
                      : editKind === 'expense'
                        ? t('payrollSettings.kmRateLabel')
                        : t('payrollSettings.defaultRateLabel')}
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={rate}
                    onChangeText={setRate}
                    keyboardType="decimal-pad"
                    placeholder={t('payrollSettings.ratePlaceholder')}
                    placeholderTextColor={colors.textMuted}
                  />
                </>
              ) : null}

              {editId ? (
                <View style={styles.activeRow}>
                  <Text style={styles.fieldLabel}>{t('payrollSettings.activeLabel')}</Text>
                  <Switch value={active} onChange={setActive} />
                </View>
              ) : null}

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Button title={t('payrollSettings.save')} icon="check" onPress={handleSave} loading={saving} style={{ marginTop: spacing.md }} />
              {editId ? (
                <Button title={t('payrollSettings.delete')} icon="trash-2" variant="danger" onPress={handleDelete} loading={saving} style={{ marginTop: spacing.sm }} />
              ) : null}
              <Button title={t('payrollSettings.cancel')} variant="secondary" onPress={() => setEditKind(null)} style={{ marginTop: spacing.sm }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

function TypeSection({
  title,
  subtitle,
  loading,
  rows,
  onAdd,
}: {
  title: string;
  subtitle: string;
  loading: boolean;
  rows: { id: string; label: string; meta: string | null; active: boolean; onPress: () => void }[];
  onAdd: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Card style={{ marginTop: spacing.lg }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionSubtitle}>{subtitle}</Text>
      {!loading && rows.length === 0 ? <Text style={styles.emptyText}>{t('payrollSettings.emptyTypes')}</Text> : null}
      <View style={{ gap: spacing.xs, marginTop: spacing.md }}>
        {rows.map((r) => (
          <Pressable key={r.id} onPress={r.onPress} style={styles.row}>
            <Text style={[styles.rowLabel, !r.active && styles.rowLabelInactive]}>{r.label}</Text>
            {r.meta ? <Text style={styles.rowMeta}>{r.meta}</Text> : null}
            {!r.active ? <Text style={styles.inactiveBadge}>{t('payrollSettings.inactive')}</Text> : null}
            <Feather name="chevron-right" size={16} color={colors.textMuted} />
          </Pressable>
        ))}
      </View>
      <Button title={t('payrollSettings.add')} icon="plus" variant="secondary" onPress={onAdd} style={{ marginTop: spacing.md }} />
    </Card>
  );
}

const styles = StyleSheet.create({
  hint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    lineHeight: 17,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: colors.text,
  },
  sectionSubtitle: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowLabel: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  rowLabelInactive: {
    color: colors.textMuted,
  },
  rowMeta: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  inactiveBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 20, 18, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  sheet: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '88%',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
  },
  sheetTitle: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  fieldLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.md,
    color: colors.text,
    backgroundColor: colors.surface,
    marginBottom: spacing.lg,
  },
  chips: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: fontSize.sm,
    color: colors.text,
  },
  chipTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  activeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  error: {
    color: colors.danger,
    fontSize: fontSize.sm,
    marginTop: spacing.sm,
  },
});
