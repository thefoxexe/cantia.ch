import { useCallback, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import {
  buildOptionalDeductionCatalog,
  createDeductionType,
  createExpenseType,
  createWorkType,
  deleteDeductionType,
  deleteExpenseType,
  deleteWorkType,
  getSwissSocialInsuranceRates,
  listDeductionTypes,
  listExpenseTypes,
  listWorkTypes,
  OPTIONAL_EXPENSE_CATALOG,
  restoreStandardPayrollCatalog,
  updateDeductionType,
  updateExpenseType,
  updateWorkType,
} from '../../../lib/api/payroll';
import { Button, Card, Container, PageHeader, Screen, Switch } from '../../../components/ui';
import { showSavedCheckmark } from '../../../components/SaveConfirmation';
import { useTranslation } from '../../../lib/translations';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import type {
  CertificateBox,
  CertificateSubbox,
  PayrollDeductionType,
  PayrollExpenseType,
  PayrollWorkType,
  SwissSocialInsuranceRates,
} from '../../../lib/types';

const CERTIFICATE_BOX_OPTIONS: { value: CertificateBox | null; labelKey: string }[] = [
  { value: null, labelKey: 'payrollSettings.certificateBoxNone' },
  { value: 'box9', labelKey: 'payrollSettings.certificateBox9' },
  { value: 'box10_1', labelKey: 'payrollSettings.certificateBox10_1' },
  { value: 'box10_2', labelKey: 'payrollSettings.certificateBox10_2' },
  { value: 'box12', labelKey: 'payrollSettings.certificateBox12' },
  { value: 'box15', labelKey: 'payrollSettings.certificateBox15' },
];

const CERTIFICATE_SUBBOX_OPTIONS: { value: CertificateSubbox | null; labelKey: string }[] = [
  { value: null, labelKey: 'payrollSettings.certificateSubboxNone' },
  { value: '13_1_1', labelKey: 'payrollSettings.certificateSubbox13_1_1' },
  { value: '13_1_2', labelKey: 'payrollSettings.certificateSubbox13_1_2' },
  { value: '13_2_1', labelKey: 'payrollSettings.certificateSubbox13_2_1' },
  { value: '13_2_2', labelKey: 'payrollSettings.certificateSubbox13_2_2' },
  { value: '13_2_3', labelKey: 'payrollSettings.certificateSubbox13_2_3' },
  { value: '13_3', labelKey: 'payrollSettings.certificateSubbox13_3' },
];

// The two "Übrige/Autres" catch-all sub-boxes carry their own free-text
// "Art/Genre" field on the real form — every other sub-box is a fixed,
// self-explanatory category and needs no extra text.
const SUBBOX_NEEDS_ART: CertificateSubbox[] = ['13_1_2', '13_2_3'];

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
  const [certificateBox, setCertificateBox] = useState<CertificateBox | null>(null);
  const [certificateSubbox, setCertificateSubbox] = useState<CertificateSubbox | null>(null);
  const [certificateSubboxArt, setCertificateSubboxArt] = useState('');
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [rates, setRates] = useState<SwissSocialInsuranceRates | null>(null);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [catalogDeductions, setCatalogDeductions] = useState<Set<string>>(new Set());
  const [catalogExpenses, setCatalogExpenses] = useState<Set<string>>(new Set());
  const [catalogRates, setCatalogRates] = useState<Record<string, string>>({});
  const [catalogSaving, setCatalogSaving] = useState(false);

  const load = useCallback(async () => {
    if (!organization) return;
    setLoading(true);
    const [work, expense, deduction, socialRates] = await Promise.all([
      listWorkTypes(organization.id),
      listExpenseTypes(organization.id),
      listDeductionTypes(organization.id),
      getSwissSocialInsuranceRates(),
    ]);
    setWorkTypes(work);
    setExpenseTypes(expense);
    setDeductionTypes(deduction);
    setRates(socialRates);
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
    setCertificateBox(null);
    setCertificateSubbox(null);
    setCertificateSubboxArt('');
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
    setCertificateSubbox(e.certificate_subbox);
    setCertificateSubboxArt(e.certificate_subbox_art ?? '');
    setActive(e.active);
    setError(null);
  }

  function openEditDeduction(d: PayrollDeductionType) {
    setEditKind('deduction');
    setEditId(d.id);
    setLabel(d.label);
    setRate(d.default_rate_percent != null ? String(d.default_rate_percent) : '');
    setCertificateBox(d.certificate_box);
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
      const art = SUBBOX_NEEDS_ART.includes(certificateSubbox as CertificateSubbox) ? certificateSubboxArt.trim() || null : null;
      err = editId
        ? (await updateExpenseType(editId, { label, unit, rateChf: rateNum, active, certificateSubbox, certificateSubboxArt: art })).error
        : (await createExpenseType(organization.id, label, unit, rateNum, expenseTypes.length, certificateSubbox, art)).error;
    } else {
      err = editId
        ? (await updateDeductionType(editId, { label, defaultRatePercent: rateNum, active, certificateBox })).error
        : (await createDeductionType(organization.id, label, rateNum, deductionTypes.length, certificateBox)).error;
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

  // Only offers items not already present (by label) — the base 6 +
  // Kilométrage are restored silently in the background when the catalog
  // modal's selection is submitted (see handleAddCatalogSelection), so
  // they never need to appear here as choices.
  const optionalDeductionCatalog = buildOptionalDeductionCatalog(rates).filter(
    (item) => !deductionTypes.some((d) => d.label.toLowerCase() === item.label.toLowerCase()),
  );
  const optionalExpenseCatalog = OPTIONAL_EXPENSE_CATALOG.filter(
    (item) => !expenseTypes.some((e) => e.label.toLowerCase() === item.label.toLowerCase()),
  );

  function openCatalog() {
    setCatalogDeductions(new Set());
    setCatalogExpenses(new Set());
    const initialRates: Record<string, string> = {};
    for (const item of optionalDeductionCatalog) initialRates[item.key] = item.defaultRatePercent != null ? String(item.defaultRatePercent) : '';
    setCatalogRates(initialRates);
    setCatalogOpen(true);
  }

  function toggleCatalogDeduction(key: string) {
    setCatalogDeductions((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleCatalogExpense(key: string) {
    setCatalogExpenses((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function handleAddCatalogSelection() {
    if (!organization) return;
    setCatalogSaving(true);
    // Idempotent — restores whichever of the base 6 + Kilométrage this org
    // is missing (a pre-trigger org, or one that deleted some) without
    // duplicating what's already there.
    await restoreStandardPayrollCatalog(organization.id);

    let sortD = deductionTypes.length;
    for (const item of optionalDeductionCatalog) {
      if (!catalogDeductions.has(item.key)) continue;
      const rateRaw = catalogRates[item.key];
      const rateNum = rateRaw && rateRaw.trim() ? Number(rateRaw.replace(',', '.')) : null;
      await createDeductionType(organization.id, item.label, rateNum, sortD, item.certificateBox);
      sortD += 1;
    }

    let sortE = expenseTypes.length;
    for (const item of optionalExpenseCatalog) {
      if (!catalogExpenses.has(item.key)) continue;
      await createExpenseType(organization.id, item.label, item.unit, item.rateChf, sortE, item.certificateSubbox, null);
      sortE += 1;
    }

    setCatalogSaving(false);
    setCatalogOpen(false);
    await load();
    showSavedCheckmark();
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

          <Card style={{ marginTop: spacing.lg }}>
            <Text style={styles.sectionTitle}>{t('payrollSettings.catalogTitle')}</Text>
            <Text style={styles.sectionSubtitle}>{t('payrollSettings.catalogSubtitle')}</Text>
            <Button title={t('payrollSettings.catalogButton')} icon="package" variant="secondary" onPress={openCatalog} style={{ marginTop: spacing.md }} />
          </Card>

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
            <ScrollView style={{ flex: 1 }}>
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

              {editKind === 'expense' ? (
                <>
                  <Text style={styles.fieldLabel}>{t('payrollSettings.certificateSubboxLabel')}</Text>
                  <Text style={styles.sectionSubtitle}>{t('payrollSettings.certificateSubboxHint')}</Text>
                  <View style={[styles.chips, { flexWrap: 'wrap', marginTop: spacing.sm }]}>
                    {CERTIFICATE_SUBBOX_OPTIONS.map((opt) => (
                      <Pressable
                        key={opt.value ?? 'none'}
                        onPress={() => setCertificateSubbox(opt.value)}
                        style={[styles.chip, certificateSubbox === opt.value && styles.chipActive]}
                      >
                        <Text style={[styles.chipText, certificateSubbox === opt.value && styles.chipTextActive]}>{t(opt.labelKey as any)}</Text>
                      </Pressable>
                    ))}
                  </View>
                  {SUBBOX_NEEDS_ART.includes(certificateSubbox as CertificateSubbox) ? (
                    <>
                      <Text style={styles.fieldLabel}>{t('payrollSettings.certificateSubboxArtLabel')}</Text>
                      <TextInput
                        style={styles.input}
                        value={certificateSubboxArt}
                        onChangeText={setCertificateSubboxArt}
                        placeholder={t('payrollSettings.certificateSubboxArtPlaceholder')}
                        placeholderTextColor={colors.textMuted}
                      />
                    </>
                  ) : null}
                </>
              ) : null}

              {editKind === 'deduction' ? (
                <>
                  <Text style={styles.fieldLabel}>{t('payrollSettings.certificateBoxLabel')}</Text>
                  <Text style={styles.sectionSubtitle}>{t('payrollSettings.certificateBoxHint')}</Text>
                  <View style={[styles.chips, { flexWrap: 'wrap', marginTop: spacing.sm }]}>
                    {CERTIFICATE_BOX_OPTIONS.map((opt) => (
                      <Pressable
                        key={opt.value ?? 'none'}
                        onPress={() => setCertificateBox(opt.value)}
                        style={[styles.chip, certificateBox === opt.value && styles.chipActive]}
                      >
                        <Text style={[styles.chipText, certificateBox === opt.value && styles.chipTextActive]}>{t(opt.labelKey as any)}</Text>
                      </Pressable>
                    ))}
                  </View>
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

      <Modal visible={catalogOpen} animationType="fade" transparent onRequestClose={() => setCatalogOpen(false)}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <ScrollView style={{ flex: 1 }}>
              <Text style={styles.sheetTitle}>{t('payrollSettings.catalogModalTitle')}</Text>
              <Text style={[styles.sectionSubtitle, { marginBottom: spacing.lg }]}>{t('payrollSettings.catalogModalIntro')}</Text>

              {optionalDeductionCatalog.length > 0 ? (
                <>
                  <Text style={styles.fieldLabel}>{t('payrollSettings.catalogDeductionsLabel')}</Text>
                  {optionalDeductionCatalog.map((item) => (
                    <CatalogRow
                      key={item.key}
                      item={item}
                      checked={catalogDeductions.has(item.key)}
                      onToggle={() => toggleCatalogDeduction(item.key)}
                      rateValue={catalogRates[item.key] ?? ''}
                      onRateChange={(v) => setCatalogRates((prev) => ({ ...prev, [item.key]: v }))}
                      rateSuffix="%"
                    />
                  ))}
                </>
              ) : null}

              {optionalExpenseCatalog.length > 0 ? (
                <>
                  <Text style={[styles.fieldLabel, { marginTop: spacing.md }]}>{t('payrollSettings.catalogExpensesLabel')}</Text>
                  {optionalExpenseCatalog.map((item) => (
                    <CatalogRow
                      key={item.key}
                      item={{ label: item.label, hint: item.hint }}
                      checked={catalogExpenses.has(item.key)}
                      onToggle={() => toggleCatalogExpense(item.key)}
                    />
                  ))}
                </>
              ) : null}

              {optionalDeductionCatalog.length === 0 && optionalExpenseCatalog.length === 0 ? (
                <Text style={styles.emptyText}>{t('payrollSettings.catalogAllAdded')}</Text>
              ) : null}

              <Button
                title={t('payrollSettings.catalogAdd')}
                icon="check"
                onPress={handleAddCatalogSelection}
                loading={catalogSaving}
                style={{ marginTop: spacing.lg }}
              />
              <Button title={t('payrollSettings.cancel')} variant="secondary" onPress={() => setCatalogOpen(false)} style={{ marginTop: spacing.sm }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

function CatalogRow({
  item,
  checked,
  onToggle,
  rateValue,
  onRateChange,
  rateSuffix,
}: {
  item: { label: string; hint: string };
  checked: boolean;
  onToggle: () => void;
  rateValue?: string;
  onRateChange?: (v: string) => void;
  rateSuffix?: string;
}) {
  return (
    <View style={styles.catalogRowWrap}>
      <Pressable onPress={onToggle} style={styles.catalogRow}>
        <View style={[styles.catalogCheckbox, checked && styles.catalogCheckboxActive]}>
          {checked ? <Feather name="check" size={14} color={colors.surface} /> : null}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.rowLabel}>{item.label}</Text>
          <Text style={styles.catalogHint}>{item.hint}</Text>
        </View>
      </Pressable>
      {checked && onRateChange ? (
        <View style={styles.catalogRateRow}>
          <TextInput
            style={styles.catalogRateInput}
            value={rateValue}
            onChangeText={onRateChange}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={colors.textMuted}
          />
          <Text style={styles.catalogRateSuffix}>{rateSuffix}</Text>
        </View>
      ) : null}
    </View>
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
  catalogRowWrap: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  catalogRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.sm,
  },
  catalogCheckbox: {
    width: 20,
    height: 20,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  catalogCheckboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  catalogHint: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 15,
  },
  catalogRateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
    marginLeft: 20 + spacing.sm,
  },
  catalogRateInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    fontSize: fontSize.sm,
    color: colors.text,
    backgroundColor: colors.surface,
    width: 90,
  },
  catalogRateSuffix: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
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
