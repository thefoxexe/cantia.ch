import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View, Modal } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import { createProjectExpense, listOrganizationProjectExpenses } from '../../../lib/api/expenses';
import {
  listExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  listRecurringExpenses,
  createRecurringExpense,
  updateRecurringExpense,
  deleteRecurringExpense,
  setRecurringExpenseActive,
  upcomingRecurringCount,
  type ExpenseInput,
  type RecurringExpenseInput,
} from '../../../lib/api/treasury';
import { scanReceipt } from '../../../lib/api/ai';
import { Button, Card, EmptyState, Field, LoadingScreen, PageHeader, Screen, Switch } from '../../../components/ui';
import { DateField } from '../../../components/DateField';
import { ReceiptScanTiles } from '../../../components/ReceiptScanTiles';
import { getAppLocale, useTranslation } from '../../../lib/translations';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import type { Expense, Plan, RecurringExpense, RecurringExpenseFrequency } from '../../../lib/types';

type Period = 'all' | 'month' | '30d';
type Tab = 'list' | 'recurring';

interface UnifiedExpense {
  id: string;
  label: string;
  amount: number;
  date: string;
  projectId: string | null;
  projectName: string | null;
}

function chf(n: number): string {
  return `CHF ${n.toLocaleString(`${getAppLocale()}-CH`, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function isoToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function startOfMonthIso(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

function formatDateFr(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(`${getAppLocale()}-CH`, { day: 'numeric', month: 'short', year: 'numeric' });
}

function daysUntil(iso: string): number {
  const today = new Date(`${isoToday()}T00:00:00Z`).getTime();
  const target = new Date(`${iso}T00:00:00Z`).getTime();
  return Math.round((target - today) / 86400000);
}

// The one place to see AND manage every expense: chantier-linked purchases
// (still created from each chantier's own Rentabilité tab — read-only here,
// tap to jump there) plus general/overhead spend and recurring charges,
// which are created, edited and deleted from here rather than from
// Trésorerie — Trésorerie stays forecast-only, reading the same
// recurring_expenses/expenses tables under the hood for its projection.
export default function DepensesScreen() {
  const { t } = useTranslation();
  const { organization, user } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('list');
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [chantierExpenses, setChantierExpenses] = useState<UnifiedExpense[]>([]);
  const [generalExpensesRaw, setGeneralExpensesRaw] = useState<Expense[]>([]);
  const [allProjects, setAllProjects] = useState<{ id: string; name: string }[]>([]);
  const [recurring, setRecurring] = useState<RecurringExpense[]>([]);
  const [period, setPeriod] = useState<Period>('month');
  const [projectFilter, setProjectFilter] = useState<'all' | 'general' | string>('all');

  const [oneOffModalOpen, setOneOffModalOpen] = useState(false);
  const [editingOneOff, setEditingOneOff] = useState<Expense | null>(null);
  const [recurringModalOpen, setRecurringModalOpen] = useState(false);
  const [editingRecurring, setEditingRecurring] = useState<RecurringExpense | null>(null);

  const load = useCallback(async () => {
    if (!organization) return;
    setLoading(true);
    const { data: planRow } = organization.plan_id
      ? await supabase.from('plans').select('*').eq('id', organization.plan_id).single()
      : { data: null };
    setPlan((planRow as Plan) ?? null);

    const p = planRow as Plan | null;
    const [projectRows, generalRows, recurringRows, projectsRows] = await Promise.all([
      p?.has_profitability ? listOrganizationProjectExpenses(organization.id) : Promise.resolve([]),
      p?.has_treasury ? listExpenses(organization.id) : Promise.resolve([]),
      p?.has_treasury ? listRecurringExpenses(organization.id) : Promise.resolve([]),
      p?.has_profitability
        ? supabase.from('projects').select('id, name').eq('organization_id', organization.id).order('name')
        : Promise.resolve({ data: [] }),
    ]);
    setChantierExpenses(
      projectRows.map((e) => ({
        id: `p-${e.id}`,
        label: e.label,
        amount: Number(e.amount),
        date: e.expense_date ?? e.created_at,
        projectId: e.project_id,
        projectName: e.projects?.name ?? null,
      })),
    );
    setGeneralExpensesRaw(generalRows);
    setRecurring(recurringRows);
    setAllProjects((projectsRows.data as { id: string; name: string }[] | null) ?? []);
    setLoading(false);
  }, [organization]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const generalExpenses: UnifiedExpense[] = useMemo(
    () =>
      generalExpensesRaw.map((e) => ({
        id: `g-${e.id}`,
        label: e.label,
        amount: Number(e.amount_chf),
        date: e.expense_date,
        projectId: null,
        projectName: null,
      })),
    [generalExpensesRaw],
  );

  const all = useMemo(
    () => [...chantierExpenses, ...generalExpenses].sort((a, b) => (a.date < b.date ? 1 : -1)),
    [chantierExpenses, generalExpenses],
  );

  const projectOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const e of chantierExpenses) {
      if (e.projectId && e.projectName && !seen.has(e.projectId)) seen.set(e.projectId, e.projectName);
    }
    return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
  }, [chantierExpenses]);

  const periodStart = period === 'month' ? startOfMonthIso() : period === '30d' ? isoDaysAgo(30) : null;
  const filtered = all.filter((e) => {
    if (periodStart && e.date.slice(0, 10) < periodStart) return false;
    if (projectFilter === 'general') return e.projectId === null;
    if (projectFilter !== 'all') return e.projectId === projectFilter;
    return true;
  });
  const total = filtered.reduce((sum, e) => sum + e.amount, 0);
  const upcoming = useMemo(() => upcomingRecurringCount(recurring), [recurring]);

  function openRow(e: UnifiedExpense) {
    if (e.projectId) {
      router.push(`/(app)/chantiers/${e.projectId}/profitability` as any);
      return;
    }
    const rawId = e.id.replace(/^g-/, '');
    const raw = generalExpensesRaw.find((g) => g.id === rawId);
    if (raw) {
      setEditingOneOff(raw);
      setOneOffModalOpen(true);
    }
  }

  function openAddOneOff() {
    setEditingOneOff(null);
    setOneOffModalOpen(true);
  }

  function openAddRecurring() {
    setEditingRecurring(null);
    setRecurringModalOpen(true);
  }

  function openEditRecurring(exp: RecurringExpense) {
    setEditingRecurring(exp);
    setRecurringModalOpen(true);
  }

  if (loading) return <LoadingScreen />;

  if (!plan?.has_profitability && !plan?.has_treasury) {
    return (
      <Screen style={{ padding: spacing.xl }}>
        <PageHeader title={t('depensesList.title')} backTo="/(app)" />
        <Card style={styles.upsell}>
          <Feather name="shopping-bag" size={22} color={colors.accent} />
          <Text style={styles.upsellTitle}>{t('depensesList.upsellTitle')}</Text>
          <Text style={styles.upsellText}>{t('depensesList.upsellText')}</Text>
          <Text style={styles.upsellText}>{t('depensesList.upsellPlanHint')}</Text>
          <Button title={t('depensesList.seePlans')} variant="secondary" icon="arrow-right" onPress={() => router.push('/(app)/compte')} style={{ marginTop: spacing.md }} />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      {/* The body (header through the expense list/recurring list) was a
          plain View with no scroll container of its own — only the two
          horizontal chip-row ScrollViews existed, and the add/edit modals'
          own ScrollViews, neither of which scrolls the page itself. Once
          the list grew past one screenful there was no way to reach the
          rest of it. padding moves from Screen to the ScrollView's
          contentContainerStyle so it scrolls with the content instead of
          staying fixed to the viewport edge, matching the pattern used
          elsewhere (e.g. tresorerie/index.tsx). */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.xl }}>
      <View style={styles.container}>
        <PageHeader title={t('depensesList.title')} backTo="/(app)" />
        <Text style={styles.pageSubtitle}>{t('depensesList.subtitle')}</Text>

        {plan.has_treasury ? (
          <View style={styles.tabSwitch}>
            <Pressable onPress={() => setTab('list')} style={[styles.tabItem, tab === 'list' && styles.tabItemActive]}>
              <Feather name="list" size={14} color={tab === 'list' ? colors.primary : colors.textMuted} />
              <Text style={[styles.tabItemText, tab === 'list' && styles.tabItemTextActive]} numberOfLines={1} ellipsizeMode="tail">
                {t('depensesList.tabAll')}
              </Text>
            </Pressable>
            <Pressable onPress={() => setTab('recurring')} style={[styles.tabItem, tab === 'recurring' && styles.tabItemActive]}>
              <Feather name="repeat" size={14} color={tab === 'recurring' ? colors.primary : colors.textMuted} />
              <Text style={[styles.tabItemText, tab === 'recurring' && styles.tabItemTextActive]} numberOfLines={1} ellipsizeMode="tail">
                {t('depensesList.tabRecurring')}
              </Text>
            </Pressable>
          </View>
        ) : null}

        {tab === 'list' ? (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {(['month', '30d', 'all'] as Period[]).map((p) => (
                <Pressable key={p} onPress={() => setPeriod(p)} style={[styles.chip, period === p && styles.chipActive]}>
                  <Text style={[styles.chipText, period === p && styles.chipTextActive]}>{t(`depensesList.period_${p}`)}</Text>
                </Pressable>
              ))}
            </ScrollView>

            {plan.has_profitability ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                <Pressable onPress={() => setProjectFilter('all')} style={[styles.chip, projectFilter === 'all' && styles.chipActive]}>
                  <Text style={[styles.chipText, projectFilter === 'all' && styles.chipTextActive]}>{t('depensesList.filterAll')}</Text>
                </Pressable>
                {plan.has_treasury ? (
                  <Pressable onPress={() => setProjectFilter('general')} style={[styles.chip, projectFilter === 'general' && styles.chipActive]}>
                    <Text style={[styles.chipText, projectFilter === 'general' && styles.chipTextActive]}>{t('depensesList.filterGeneral')}</Text>
                  </Pressable>
                ) : null}
                {projectOptions.map((p) => (
                  <Pressable key={p.id} onPress={() => setProjectFilter(p.id)} style={[styles.chip, projectFilter === p.id && styles.chipActive]}>
                    <Text style={[styles.chipText, projectFilter === p.id && styles.chipTextActive]} numberOfLines={1}>
                      {p.name}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            ) : null}

            <Card style={styles.totalCard}>
              <Text style={styles.totalLabel}>{t('depensesList.totalLabel')}</Text>
              <Text style={styles.totalValue}>{chf(total)}</Text>
              <Text style={styles.totalCount}>{t('depensesList.entryCount', { count: filtered.length })}</Text>
            </Card>

            {plan.has_treasury ? (
              <Button title={t('treasury.newExpense')} icon="plus" onPress={openAddOneOff} />
            ) : null}

            {upcoming > 0 ? (
              <Pressable onPress={() => setTab('recurring')} style={styles.banner}>
                <Feather name="bell" size={16} color={colors.warning} />
                <Text style={styles.bannerText}>{t('treasury.upcomingBanner', { count: upcoming })}</Text>
                <Feather name="chevron-right" size={16} color={colors.warning} />
              </Pressable>
            ) : null}

            {filtered.length === 0 ? (
              <EmptyState title={t('depensesList.emptyTitle')} subtitle={t('depensesList.emptySubtitle')} />
            ) : (
              <View style={{ gap: spacing.sm }}>
                {filtered.map((e) => (
                  <Pressable key={e.id} onPress={() => openRow(e)}>
                    <Card style={styles.row}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.rowLabel} numberOfLines={1}>
                          {e.label || t('depensesList.noLabel')}
                        </Text>
                        <View style={styles.rowMeta}>
                          <View style={[styles.badge, e.projectId ? styles.badgeProject : styles.badgeGeneral]}>
                            <Text style={[styles.badgeText, e.projectId ? styles.badgeTextProject : styles.badgeTextGeneral]} numberOfLines={1}>
                              {e.projectName ?? t('depensesList.filterGeneral')}
                            </Text>
                          </View>
                          <Text style={styles.rowDate}>{new Date(e.date).toLocaleDateString(`${getAppLocale()}-CH`)}</Text>
                        </View>
                      </View>
                      <Text style={styles.rowAmount}>{chf(e.amount)}</Text>
                      <Feather name="chevron-right" size={16} color={colors.textMuted} />
                    </Card>
                  </Pressable>
                ))}
              </View>
            )}
          </>
        ) : (
          <View style={{ gap: spacing.lg }}>
            <Button title={t('treasury.newRecurringExpense')} icon="plus" onPress={openAddRecurring} />
            {recurring.length === 0 ? (
              <Card>
                <EmptyState title={t('treasury.emptyRecurringTitle')} subtitle={t('treasury.emptyRecurringSubtitle')} />
              </Card>
            ) : (
              <View style={{ gap: spacing.sm }}>
                {recurring.map((exp) => (
                  <RecurringExpenseRow
                    key={exp.id}
                    expense={exp}
                    onPress={() => openEditRecurring(exp)}
                    onToggleActive={async (active) => {
                      await setRecurringExpenseActive(exp.id, active);
                      load();
                    }}
                  />
                ))}
              </View>
            )}
          </View>
        )}
      </View>
      </ScrollView>

      <OneOffExpenseModal
        visible={oneOffModalOpen}
        onClose={() => setOneOffModalOpen(false)}
        organizationId={organization?.id ?? ''}
        userId={user?.id}
        editing={editingOneOff}
        projects={plan.has_profitability ? allProjects : []}
        onSaved={() => {
          setOneOffModalOpen(false);
          load();
        }}
      />

      <RecurringExpenseModal
        visible={recurringModalOpen}
        onClose={() => setRecurringModalOpen(false)}
        organizationId={organization?.id ?? ''}
        userId={user?.id}
        editing={editingRecurring}
        onSaved={() => {
          setRecurringModalOpen(false);
          load();
        }}
      />
    </Screen>
  );
}

function RecurringExpenseRow({
  expense,
  onPress,
  onToggleActive,
}: {
  expense: RecurringExpense;
  onPress: () => void;
  onToggleActive: (active: boolean) => void;
}) {
  const { t } = useTranslation();
  const days = daysUntil(expense.next_due_date);
  let dueLabel = formatDateFr(expense.next_due_date);
  if (expense.active) {
    if (days < 0) dueLabel = t('treasury.overdue');
    else if (days === 0) dueLabel = t('treasury.today');
    else if (days <= 14) dueLabel = t('treasury.inDays', { days });
  }
  return (
    <Pressable onPress={onPress}>
      <Card style={[styles.recurringRow, !expense.active && styles.recurringRowInactive]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.rowLabel} numberOfLines={1}>
            {expense.label}
          </Text>
          <Text style={styles.rowDate}>
            {[
              expense.category,
              t('treasury.perFrequency', {
                amount: expense.amount_chf.toFixed(0),
                unit: expense.frequency === 'monthly' ? t('treasury.perMonth') : t('treasury.perYear'),
              }),
            ]
              .filter(Boolean)
              .join(' · ')}
          </Text>
        </View>
        <View style={styles.recurringRight}>
          <Text style={[styles.dueTag, days < 0 && expense.active && styles.dueTagOverdue]}>{dueLabel}</Text>
          <Switch value={expense.active} onChange={onToggleActive} />
        </View>
      </Card>
    </Pressable>
  );
}

function RecurringExpenseModal({
  visible,
  onClose,
  organizationId,
  userId,
  editing,
  onSaved,
}: {
  visible: boolean;
  onClose: () => void;
  organizationId: string;
  userId: string | undefined;
  editing: RecurringExpense | null;
  onSaved: () => void;
}) {
  const { t } = useTranslation();
  const [label, setLabel] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<RecurringExpenseFrequency>('monthly');
  const [nextDueDate, setNextDueDate] = useState<string | null>(null);
  const [reminderDays, setReminderDays] = useState('3');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initKey = `${visible}-${editing?.id ?? 'new'}`;
  const [lastInitKey, setLastInitKey] = useState('');
  if (visible && initKey !== lastInitKey) {
    setLastInitKey(initKey);
    setLabel(editing?.label ?? '');
    setCategory(editing?.category ?? '');
    setAmount(editing ? String(editing.amount_chf) : '');
    setFrequency(editing?.frequency ?? 'monthly');
    setNextDueDate(editing?.next_due_date ?? isoToday());
    setReminderDays(editing ? String(editing.reminder_days_before) : '3');
    setNotes(editing?.notes ?? '');
    setError(null);
  }

  async function handleSave() {
    const amountChf = Number(amount.replace(',', '.'));
    if (!label.trim()) return setError(t('treasury.labelRequired'));
    if (!nextDueDate) return setError(t('treasury.dueDateRequired'));
    if (Number.isNaN(amountChf) || amountChf <= 0) return setError(t('treasury.invalidAmount'));

    setSaving(true);
    setError(null);
    const input: RecurringExpenseInput = {
      label: label.trim(),
      category: category.trim() || null,
      amountChf,
      frequency,
      nextDueDate,
      reminderDaysBefore: Number(reminderDays) || 3,
      notes: notes.trim() || null,
    };
    const { error: err } = editing ? await updateRecurringExpense(editing.id, input) : await createRecurringExpense(organizationId, userId, input);
    setSaving(false);
    if (err) return setError(err);
    onSaved();
  }

  function handleDelete() {
    if (!editing) return;
    Alert.alert(t('treasury.deleteRecurringConfirmTitle'), t('treasury.deleteRecurringConfirmBody', { label: editing.label }), [
      { text: t('treasury.cancel'), style: 'cancel' },
      {
        text: t('treasury.delete'),
        style: 'destructive',
        onPress: async () => {
          setSaving(true);
          await deleteRecurringExpense(editing.id);
          setSaving(false);
          onSaved();
        },
      },
    ]);
  }

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <ScrollView style={{ flex: 1 }}>
            <Text style={styles.sheetTitle}>{editing ? t('treasury.editRecurringTitle') : t('treasury.newRecurringTitle')}</Text>

            <Field label={t('treasury.labelField')} value={label} onChangeText={setLabel} placeholder={t('treasury.labelPlaceholderRecurring')} />
            <Field label={t('treasury.categoryField')} value={category} onChangeText={setCategory} placeholder={t('treasury.categoryPlaceholderRecurring')} />
            <Field label={t('treasury.amountField')} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="0.00" />

            <Text style={styles.fieldLabel}>{t('treasury.frequencyField')}</Text>
            <View style={styles.freqRow}>
              <Pressable onPress={() => setFrequency('monthly')} style={[styles.freqChip, frequency === 'monthly' && styles.freqChipActive]}>
                <Text style={[styles.freqChipText, frequency === 'monthly' && styles.freqChipTextActive]}>{t('treasury.monthlyOption')}</Text>
              </Pressable>
              <Pressable onPress={() => setFrequency('yearly')} style={[styles.freqChip, frequency === 'yearly' && styles.freqChipActive]}>
                <Text style={[styles.freqChipText, frequency === 'yearly' && styles.freqChipTextActive]}>{t('treasury.yearlyOption')}</Text>
              </Pressable>
            </View>

            <DateField label={t('treasury.nextDueDateField')} value={nextDueDate} onChange={setNextDueDate} />
            <Field label={t('treasury.reminderDaysField')} value={reminderDays} onChangeText={setReminderDays} keyboardType="number-pad" placeholder="3" />
            <Field label={t('treasury.notesFieldOptional')} value={notes} onChangeText={setNotes} placeholder={t('treasury.notesPlaceholderRecurring')} multiline />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Button title={t('treasury.save')} icon="check" onPress={handleSave} loading={saving} style={{ marginTop: spacing.md }} />
            {editing ? (
              <Button title={t('treasury.delete')} icon="trash-2" variant="danger" onPress={handleDelete} loading={saving} style={{ marginTop: spacing.sm }} />
            ) : null}
            <Button title={t('treasury.cancel')} variant="secondary" onPress={onClose} style={{ marginTop: spacing.sm }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function OneOffExpenseModal({
  visible,
  onClose,
  organizationId,
  userId,
  editing,
  projects,
  onSaved,
}: {
  visible: boolean;
  onClose: () => void;
  organizationId: string;
  userId: string | undefined;
  editing: Expense | null;
  projects: { id: string; name: string }[];
  onSaved: () => void;
}) {
  const { t } = useTranslation();
  const [label, setLabel] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanningReceipt, setScanningReceipt] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanSuccess, setScanSuccess] = useState<string | null>(null);

  const initKey = `${visible}-${editing?.id ?? 'new'}`;
  const [lastInitKey, setLastInitKey] = useState('');
  if (visible && initKey !== lastInitKey) {
    setLastInitKey(initKey);
    setLabel(editing?.label ?? '');
    setCategory(editing?.category ?? '');
    setAmount(editing ? String(editing.amount_chf) : '');
    setExpenseDate(editing?.expense_date ?? isoToday());
    setNotes(editing?.notes ?? '');
    setSelectedProjectId(null);
    setError(null);
    setScanError(null);
    setScanSuccess(null);
  }

  // Same scan-a-receipt flow as Rentabilité's per-chantier Dépenses — a
  // photo of the ticket fills fournisseur + montant, the rest (date,
  // catégorie, notes) stays a manual touch since a receipt photo doesn't
  // carry those reliably. Uses its own scanError, separate from the
  // save-validation `error` below, so a scan result and a "libellé requis"
  // message never end up competing for the same line.
  async function processReceiptImage(uri: string) {
    setScanningReceipt(true);
    setScanError(null);
    setScanSuccess(null);
    try {
      const manipulated = await ImageManipulator.ImageManipulator.manipulate(uri).resize({ width: 1400 }).renderAsync();
      const saved = await manipulated.saveAsync({ compress: 0.6, format: ImageManipulator.SaveFormat.JPEG, base64: true });
      if (!saved.base64) {
        setScanError(t('treasury.scanFailed'));
        return;
      }
      const { receipt, error: err } = await scanReceipt(organizationId, saved.base64, 'image/jpeg');
      if (err || !receipt) {
        setScanError(err ?? t('treasury.scanFailed'));
        return;
      }
      setLabel(receipt.label);
      if (receipt.amount > 0) setAmount(String(receipt.amount));
      setScanSuccess(
        receipt.label && receipt.amount > 0
          ? t('treasury.scanSuccess', { label: receipt.label, amount: receipt.amount })
          : t('treasury.scanPartial'),
      );
    } catch (e) {
      // A thrown error (image processing, network) must still show up —
      // silently eating it here is exactly what made a failed scan look
      // like the app just did nothing.
      setScanError(e instanceof Error ? e.message : t('treasury.scanFailed'));
    } finally {
      setScanningReceipt(false);
    }
  }

  async function scanFromCamera() {
    setScanError(null);
    setScanSuccess(null);
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(t('treasury.cameraPermissionTitle'), t('treasury.cameraPermissionBody'));
        return;
      }
      const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
      if (result.canceled || !result.assets?.length) return;
      await processReceiptImage(result.assets[0].uri);
    } catch (e) {
      setScanError(e instanceof Error ? e.message : t('treasury.scanFailed'));
    }
  }

  async function scanFromGallery() {
    setScanError(null);
    setScanSuccess(null);
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(t('treasury.cameraPermissionTitle'), t('treasury.galleryPermissionBody'));
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });
      if (result.canceled || !result.assets?.length) return;
      await processReceiptImage(result.assets[0].uri);
    } catch (e) {
      setScanError(e instanceof Error ? e.message : t('treasury.scanFailed'));
    }
  }

  async function handleSave() {
    const amountChf = Number(amount.replace(',', '.'));
    if (!label.trim()) return setError(t('treasury.labelRequired'));
    if (!expenseDate) return setError(t('treasury.dateRequired'));
    if (Number.isNaN(amountChf) || amountChf <= 0) return setError(t('treasury.invalidAmount'));

    setSaving(true);
    setError(null);

    if (!editing && selectedProjectId) {
      const { error: err } = await createProjectExpense(
        organizationId,
        selectedProjectId,
        { label: label.trim(), category: category.trim() || null, amount: amountChf, expenseDate, notes: notes.trim() || null },
        userId ?? null,
      );
      setSaving(false);
      if (err) return setError(err);
      onSaved();
      return;
    }

    const input: ExpenseInput = {
      label: label.trim(),
      category: category.trim() || null,
      amountChf,
      expenseDate,
      notes: notes.trim() || null,
    };
    const { error: err } = editing ? await updateExpense(editing.id, input) : await createExpense(organizationId, userId, input);
    setSaving(false);
    if (err) return setError(err);
    onSaved();
  }

  function handleDelete() {
    if (!editing) return;
    Alert.alert(t('treasury.deleteOneOffConfirmTitle'), t('treasury.deleteOneOffConfirmBody', { label: editing.label }), [
      { text: t('treasury.cancel'), style: 'cancel' },
      {
        text: t('treasury.delete'),
        style: 'destructive',
        onPress: async () => {
          setSaving(true);
          await deleteExpense(editing.id);
          setSaving(false);
          onSaved();
        },
      },
    ]);
  }

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <ScrollView style={{ flex: 1 }}>
            <Text style={styles.sheetTitle}>{editing ? t('treasury.editOneOffTitle') : t('treasury.newOneOffTitle')}</Text>

            {editing ? null : (
              <>
                <ReceiptScanTiles
                  onCamera={scanFromCamera}
                  onGallery={scanFromGallery}
                  status={scanningReceipt ? 'scanning' : scanError ? 'error' : scanSuccess ? 'success' : 'idle'}
                  statusMessage={scanningReceipt ? t('treasury.scanInProgress') : scanError || scanSuccess || t('treasury.scanHint')}
                  cameraLabel={t('treasury.scanCamera')}
                  galleryLabel={t('treasury.scanGallery')}
                />
                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>{t('treasury.orManual')}</Text>
                  <View style={styles.dividerLine} />
                </View>
              </>
            )}

            <Field label={t('treasury.labelField')} value={label} onChangeText={setLabel} placeholder={t('treasury.labelPlaceholderOneOff')} />
            <Field label={t('treasury.categoryField')} value={category} onChangeText={setCategory} placeholder={t('treasury.categoryPlaceholderOneOff')} />
            <Field label={t('treasury.amountField')} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="0.00" />
            <DateField label={t('treasury.dateField')} value={expenseDate} onChange={setExpenseDate} />

            {!editing && projects.length > 0 ? (
              <View style={{ marginBottom: spacing.lg }}>
                <Text style={styles.fieldLabel}>{t('treasury.projectField')}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                  <Pressable
                    onPress={() => setSelectedProjectId(null)}
                    style={[styles.freqChip, { flex: 0, paddingHorizontal: spacing.md }, selectedProjectId === null && styles.freqChipActive]}
                  >
                    <Text style={[styles.freqChipText, selectedProjectId === null && styles.freqChipTextActive]}>{t('depensesList.filterGeneral')}</Text>
                  </Pressable>
                  {projects.map((p) => (
                    <Pressable
                      key={p.id}
                      onPress={() => setSelectedProjectId(p.id)}
                      style={[styles.freqChip, { flex: 0, paddingHorizontal: spacing.md }, selectedProjectId === p.id && styles.freqChipActive]}
                    >
                      <Text style={[styles.freqChipText, selectedProjectId === p.id && styles.freqChipTextActive]} numberOfLines={1}>
                        {p.name}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
                <Text style={styles.rowDate}>{t('treasury.projectFieldHint')}</Text>
              </View>
            ) : null}
            <Field label={t('treasury.notesFieldOptional')} value={notes} onChangeText={setNotes} placeholder={t('treasury.notesPlaceholderOneOff')} multiline />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Button title={t('treasury.save')} icon="check" onPress={handleSave} loading={saving} style={{ marginTop: spacing.md }} />
            {editing ? (
              <Button title={t('treasury.delete')} icon="trash-2" variant="danger" onPress={handleDelete} loading={saving} style={{ marginTop: spacing.sm }} />
            ) : null}
            <Button title={t('treasury.cancel')} variant="secondary" onPress={onClose} style={{ marginTop: spacing.sm }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  pageSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: -spacing.sm,
  },
  upsell: {
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginTop: spacing.lg,
  },
  upsellTitle: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.text,
    marginTop: spacing.sm,
  },
  upsellText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 20,
  },
  tabSwitch: {
    flexDirection: 'row',
    gap: spacing.xs,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: 3,
    width: '100%',
  },
  tabItem: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
    borderRadius: radius.sm,
  },
  tabItemActive: {
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  tabItemText: {
    flexShrink: 1,
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textMuted,
  },
  tabItemTextActive: {
    color: colors.primary,
  },
  chipRow: {
    gap: spacing.xs,
    paddingVertical: 2,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  chipText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    maxWidth: 180,
  },
  chipTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  totalCard: {
    gap: 2,
  },
  totalLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
  },
  totalCount: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.warningSoft,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  bannerText: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.warning,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rowLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  rowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    maxWidth: 160,
  },
  badgeProject: {
    backgroundColor: colors.accentSoft,
  },
  badgeGeneral: {
    backgroundColor: colors.surfaceAlt,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  badgeTextProject: {
    color: colors.accent,
  },
  badgeTextGeneral: {
    color: colors.textMuted,
  },
  rowDate: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  rowAmount: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  recurringRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  recurringRowInactive: {
    opacity: 0.5,
  },
  recurringRight: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  dueTag: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textMuted,
  },
  dueTagOverdue: {
    color: colors.danger,
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
    maxWidth: 480,
    maxHeight: '90%',
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
  freqRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  freqChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  freqChipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  freqChipText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textMuted,
  },
  freqChipTextActive: {
    color: colors.primary,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  error: {
    fontSize: fontSize.sm,
    color: colors.danger,
    marginTop: spacing.sm,
  },
});
