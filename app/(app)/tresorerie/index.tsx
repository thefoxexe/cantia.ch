import { useCallback, useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import {
  addCashSnapshot,
  buildForecast,
  createExpense,
  createRecurringExpense,
  deleteExpense,
  deleteRecurringExpense,
  listExpenses,
  listRecurringExpenses,
  setRecurringExpenseActive,
  updateExpense,
  updateRecurringExpense,
  upcomingRecurringCount,
  type ExpenseInput,
  type RecurringExpenseInput,
} from '../../../lib/api/treasury';
import { Button, Card, EmptyState, Field, LoadingScreen, PageHeader, Screen, Switch } from '../../../components/ui';
import { DateField } from '../../../components/DateField';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import type { Expense, Plan, RecurringExpense, RecurringExpenseFrequency, TreasuryForecast, TreasuryForecastItem, TreasuryItemKind } from '../../../lib/types';

type IconName = keyof typeof Feather.glyphMap;

const KIND_LABELS: Record<TreasuryItemKind, string> = {
  facture: 'Facture client',
  salaire: 'Salaires',
  'sous-traitant': 'Sous-traitant',
  recurrente: 'Dépense récurrente',
};

const KIND_ICONS: Record<TreasuryItemKind, IconName> = {
  facture: 'file-text',
  salaire: 'users',
  'sous-traitant': 'briefcase',
  recurrente: 'repeat',
};

function isoToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDaysIso(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function formatDateFr(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('fr-CH', { day: 'numeric', month: 'short', year: 'numeric' });
}

function daysUntil(iso: string): number {
  const today = new Date(`${isoToday()}T00:00:00Z`).getTime();
  const target = new Date(`${iso}T00:00:00Z`).getTime();
  return Math.round((target - today) / 86400000);
}

// Reads the pre-computed cumulative timeline (already sorted ascending by
// buildForecast) instead of re-summing items, so this stays a cheap lookup.
function projectedBalanceAt(forecast: TreasuryForecast, horizonIso: string): number {
  let balance = forecast.startingBalance;
  for (const point of forecast.timeline) {
    if (point.date > horizonIso) break;
    balance = point.balance;
  }
  return balance;
}

export default function TreasuryScreen() {
  const { organization, user } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<'forecast' | 'recurring' | 'oneoff'>('forecast');
  const [loading, setLoading] = useState(true);
  const [forecast, setForecast] = useState<TreasuryForecast | null>(null);
  const [expenses, setExpenses] = useState<RecurringExpense[]>([]);
  const [oneOffExpenses, setOneOffExpenses] = useState<Expense[]>([]);
  const [plan, setPlan] = useState<Plan | null>(null);

  const [editingBalance, setEditingBalance] = useState(false);
  const [balanceInput, setBalanceInput] = useState('');
  const [savingBalance, setSavingBalance] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<RecurringExpense | null>(null);

  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [editingOneOff, setEditingOneOff] = useState<Expense | null>(null);

  // enabled_modules alone isn't a reliable gate here — an org that had
  // 'treasury' toggled on while on a plan that included it keeps that entry
  // if it later downgrades, and nothing else in this screen checked the
  // plan itself. Mirrors the same check on planning/index.tsx and rh/index.tsx.
  const load = useCallback(async () => {
    if (!organization) return;
    setLoading(true);
    const [fc, exp, oneOff, { data: planRow }] = await Promise.all([
      buildForecast(organization),
      listRecurringExpenses(organization.id),
      listExpenses(organization.id),
      supabase.from('plans').select('*').eq('id', organization.plan_id).single(),
    ]);
    setForecast(fc);
    setExpenses(exp);
    setOneOffExpenses(oneOff);
    setPlan(planRow ?? null);
    setLoading(false);
  }, [organization]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function saveBalance() {
    if (!organization) return;
    const value = Number(balanceInput.replace(',', '.'));
    if (Number.isNaN(value)) return;
    setSavingBalance(true);
    await addCashSnapshot(organization.id, value, user?.id);
    setSavingBalance(false);
    setEditingBalance(false);
    load();
  }

  function openAddExpense() {
    setEditingExpense(null);
    setModalOpen(true);
  }

  function openEditExpense(expense: RecurringExpense) {
    setEditingExpense(expense);
    setModalOpen(true);
  }

  function openAddOneOff() {
    setEditingOneOff(null);
    setExpenseModalOpen(true);
  }

  function openEditOneOff(expense: Expense) {
    setEditingOneOff(expense);
    setExpenseModalOpen(true);
  }

  const upcoming = useMemo(() => upcomingRecurringCount(expenses), [expenses]);
  const oneOffThisMonth = useMemo(() => {
    const currentMonth = isoToday().slice(0, 7);
    return oneOffExpenses.filter((e) => e.expense_date.slice(0, 7) === currentMonth).reduce((sum, e) => sum + Number(e.amount_chf), 0);
  }, [oneOffExpenses]);
  const projected30 = useMemo(() => (forecast ? projectedBalanceAt(forecast, addDaysIso(isoToday(), 30)) : 0), [forecast]);
  const projected90 = useMemo(() => (forecast ? projectedBalanceAt(forecast, addDaysIso(isoToday(), 90)) : 0), [forecast]);

  const datedItems = useMemo(() => (forecast?.items ?? []).filter((it) => it.date), [forecast]);
  const undatedItems = useMemo(() => (forecast?.items ?? []).filter((it) => !it.date), [forecast]);

  if (!organization || loading) return <LoadingScreen />;

  if (plan && !plan.has_treasury) {
    return (
      <Screen style={{ padding: spacing.xl }}>
        <PageHeader title="Trésorerie" backTo="/(app)" />
        <Card style={styles.upsell}>
          <Feather name="archive" size={22} color={colors.accent} />
          <Text style={styles.upsellTitle}>Trésorerie prévisionnelle</Text>
          <Text style={styles.upsellText}>
            Projetez votre solde à 30 et 90 jours à partir des factures, salaires, sous-traitants et dépenses
            récurrentes.
          </Text>
          <Text style={styles.upsellText}>Disponible à partir du plan Équipe.</Text>
          <Button title="Voir les plans" variant="secondary" icon="arrow-right" onPress={() => router.push('/(app)/compte')} style={{ marginTop: spacing.md }} />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl * 2 }}>
        <PageHeader title="Trésorerie" backTo="/(app)" />
        <Text style={styles.pageSubtitle}>
          Ce que vous avez, ce qui rentre, ce qui sort — sur 90 jours.
        </Text>

        <View style={styles.modeSwitch}>
          <Pressable onPress={() => setMode('forecast')} style={[styles.modeTab, mode === 'forecast' && styles.modeTabActive]}>
            <Feather name="trending-up" size={14} color={mode === 'forecast' ? colors.primary : colors.textMuted} />
            <Text style={[styles.modeTabText, mode === 'forecast' && styles.modeTabTextActive]}>Prévision</Text>
          </Pressable>
          <Pressable onPress={() => setMode('recurring')} style={[styles.modeTab, mode === 'recurring' && styles.modeTabActive]}>
            <Feather name="repeat" size={14} color={mode === 'recurring' ? colors.primary : colors.textMuted} />
            <Text style={[styles.modeTabText, mode === 'recurring' && styles.modeTabTextActive]}>Dépenses récurrentes</Text>
          </Pressable>
          <Pressable onPress={() => setMode('oneoff')} style={[styles.modeTab, mode === 'oneoff' && styles.modeTabActive]}>
            <Feather name="shopping-bag" size={14} color={mode === 'oneoff' ? colors.primary : colors.textMuted} />
            <Text style={[styles.modeTabText, mode === 'oneoff' && styles.modeTabTextActive]}>Dépenses ponctuelles</Text>
          </Pressable>
        </View>

        {mode === 'forecast' && forecast ? (
          <View style={{ gap: spacing.lg }}>
            <Card style={styles.balanceCard}>
              <View style={styles.balanceTop}>
                <View>
                  <Text style={styles.balanceLabel}>Solde actuel</Text>
                  <Text style={styles.balanceMeta}>
                    {forecast.startingBalanceRecordedAt
                      ? `Mis à jour le ${formatDateFr(forecast.startingBalanceRecordedAt.slice(0, 10))}`
                      : 'Jamais renseigné'}
                  </Text>
                </View>
                {!editingBalance ? (
                  <Pressable
                    onPress={() => {
                      setBalanceInput(String(forecast.startingBalance || ''));
                      setEditingBalance(true);
                    }}
                    hitSlop={8}
                    style={styles.balanceEditBtn}
                  >
                    <Feather name="edit-2" size={16} color={colors.primary} />
                  </Pressable>
                ) : null}
              </View>

              {editingBalance ? (
                <View style={styles.balanceEditRow}>
                  <TextInput
                    value={balanceInput}
                    onChangeText={setBalanceInput}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor={colors.textMuted}
                    style={styles.balanceInput}
                    autoFocus
                  />
                  <Button title="Enregistrer" onPress={saveBalance} loading={savingBalance} style={{ flex: 0 }} />
                  <Button title="Annuler" variant="secondary" onPress={() => setEditingBalance(false)} style={{ flex: 0 }} />
                </View>
              ) : (
                <Text style={styles.balanceValue}>CHF {forecast.startingBalance.toFixed(2)}</Text>
              )}
            </Card>

            <View style={styles.kpiRow}>
              <Card style={styles.kpiTile}>
                <Text style={styles.kpiLabel}>Projeté à 30 jours</Text>
                <Text style={[styles.kpiValue, projected30 < 0 && styles.kpiValueDanger]}>CHF {projected30.toFixed(0)}</Text>
              </Card>
              <Card style={styles.kpiTile}>
                <Text style={styles.kpiLabel}>Projeté à 90 jours</Text>
                <Text style={[styles.kpiValue, projected90 < 0 && styles.kpiValueDanger]}>CHF {projected90.toFixed(0)}</Text>
              </Card>
            </View>

            {upcoming > 0 ? (
              <Pressable onPress={() => setMode('recurring')} style={styles.banner}>
                <Feather name="bell" size={16} color={colors.warning} />
                <Text style={styles.bannerText}>
                  {upcoming} dépense{upcoming > 1 ? 's' : ''} récurrente{upcoming > 1 ? 's' : ''} arrive{upcoming > 1 ? 'nt' : ''} dans les 7 prochains jours
                </Text>
                <Feather name="chevron-right" size={16} color={colors.warning} />
              </Pressable>
            ) : null}

            <Text style={styles.sectionTitle}>Mouvements à venir</Text>
            {datedItems.length === 0 && undatedItems.length === 0 ? (
              <Card>
                <EmptyState
                  title="Rien à l'horizon"
                  subtitle="Les factures à encaisser, salaires, factures sous-traitants et dépenses récurrentes apparaîtront ici."
                />
              </Card>
            ) : (
              <View style={{ gap: spacing.sm }}>
                {datedItems.map((item, idx) => (
                  <ForecastItemRow key={`${item.kind}-${item.sourceId}-${idx}`} item={item} />
                ))}
              </View>
            )}

            {undatedItems.length > 0 ? (
              <>
                <Text style={styles.sectionTitleSmall}>Sans échéance connue</Text>
                <View style={{ gap: spacing.sm }}>
                  {undatedItems.map((item, idx) => (
                    <ForecastItemRow key={`${item.kind}-${item.sourceId}-u${idx}`} item={item} />
                  ))}
                </View>
              </>
            ) : null}

            <Text style={styles.disclaimer}>
              Les salaires affichés sont une estimation (profils mensuels + heures déjà saisies ce mois) — pas un montant garanti.
            </Text>
          </View>
        ) : null}

        {mode === 'recurring' ? (
          <View style={{ gap: spacing.lg }}>
            <Button title="Nouvelle dépense récurrente" icon="plus" onPress={openAddExpense} />
            {expenses.length === 0 ? (
              <Card>
                <EmptyState
                  title="Aucune dépense récurrente"
                  subtitle="Abonnements, assurances, loyers... ajoutez-les ici pour être prévenu avant qu'ils ne partent."
                />
              </Card>
            ) : (
              <View style={{ gap: spacing.sm }}>
                {expenses.map((exp) => (
                  <RecurringExpenseRow
                    key={exp.id}
                    expense={exp}
                    onPress={() => openEditExpense(exp)}
                    onToggleActive={async (active) => {
                      await setRecurringExpenseActive(exp.id, active);
                      load();
                    }}
                  />
                ))}
              </View>
            )}
          </View>
        ) : null}

        {mode === 'oneoff' ? (
          <View style={{ gap: spacing.lg }}>
            <Card style={styles.kpiTile}>
              <Text style={styles.kpiLabel}>Dépensé ce mois-ci</Text>
              <Text style={styles.kpiValue}>CHF {oneOffThisMonth.toFixed(0)}</Text>
            </Card>
            <Button title="Nouvelle dépense" icon="plus" onPress={openAddOneOff} />
            {oneOffExpenses.length === 0 ? (
              <Card>
                <EmptyState
                  title="Aucune dépense ponctuelle"
                  subtitle="Fournitures, outillage, frais divers hors chantier — ajoutez-les ici pour garder une trace complète."
                />
              </Card>
            ) : (
              <View style={{ gap: spacing.sm }}>
                {oneOffExpenses.map((exp) => (
                  <Pressable key={exp.id} onPress={() => openEditOneOff(exp)}>
                    <Card style={styles.expenseRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.itemLabel} numberOfLines={1}>
                          {exp.label}
                        </Text>
                        <Text style={styles.itemMeta}>
                          {[exp.category, formatDateFr(exp.expense_date)].filter(Boolean).join(' · ')}
                        </Text>
                      </View>
                      <Text style={styles.itemAmount}>CHF {Number(exp.amount_chf).toFixed(0)}</Text>
                    </Card>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        ) : null}
      </ScrollView>

      <RecurringExpenseModal
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        organizationId={organization.id}
        userId={user?.id}
        editing={editingExpense}
        onSaved={() => {
          setModalOpen(false);
          load();
        }}
      />

      <OneOffExpenseModal
        visible={expenseModalOpen}
        onClose={() => setExpenseModalOpen(false)}
        organizationId={organization.id}
        userId={user?.id}
        editing={editingOneOff}
        onSaved={() => {
          setExpenseModalOpen(false);
          load();
        }}
      />
    </Screen>
  );
}

function ForecastItemRow({ item }: { item: TreasuryForecastItem }) {
  const positive = item.amount >= 0;
  return (
    <Card style={styles.itemRow}>
      <View style={[styles.itemIcon, { backgroundColor: positive ? colors.successSoft : colors.dangerSoft }]}>
        <Feather name={KIND_ICONS[item.kind]} size={16} color={positive ? colors.success : colors.danger} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemLabel} numberOfLines={1}>
          {item.label}
        </Text>
        <View style={styles.itemMetaRow}>
          <Text style={styles.itemMeta}>{item.date ? formatDateFr(item.date) : KIND_LABELS[item.kind]}</Text>
          {item.overdue ? <Text style={styles.overdueTag}>En retard</Text> : null}
        </View>
      </View>
      <Text style={[styles.itemAmount, positive ? styles.itemAmountPositive : styles.itemAmountNegative]}>
        {positive ? '+' : ''}
        CHF {item.amount.toFixed(0)}
      </Text>
    </Card>
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
  const days = daysUntil(expense.next_due_date);
  let dueLabel = formatDateFr(expense.next_due_date);
  if (expense.active) {
    if (days < 0) dueLabel = 'En retard';
    else if (days === 0) dueLabel = "Aujourd'hui";
    else if (days <= 14) dueLabel = `Dans ${days} j`;
  }
  return (
    <Pressable onPress={onPress}>
      <Card style={[styles.expenseRow, !expense.active && styles.expenseRowInactive]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.itemLabel} numberOfLines={1}>
            {expense.label}
          </Text>
          <Text style={styles.itemMeta}>
            {[expense.category, `CHF ${expense.amount_chf.toFixed(0)} / ${expense.frequency === 'monthly' ? 'mois' : 'an'}`]
              .filter(Boolean)
              .join(' · ')}
          </Text>
        </View>
        <View style={styles.expenseRight}>
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
    if (!label.trim()) return setError('Le libellé est requis.');
    if (!nextDueDate) return setError("La date d'échéance est requise.");
    if (Number.isNaN(amountChf) || amountChf <= 0) return setError('Montant invalide.');

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
    Alert.alert('Supprimer cette dépense ?', `"${editing.label}" ne sera plus projetée dans la trésorerie.`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
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
          <ScrollView>
            <Text style={styles.sheetTitle}>{editing ? 'Modifier la dépense' : 'Nouvelle dépense récurrente'}</Text>

            <Field label="Libellé" value={label} onChangeText={setLabel} placeholder="Ex : Assurance RC, abonnement logiciel..." />
            <Field label="Catégorie (optionnel)" value={category} onChangeText={setCategory} placeholder="Ex : Assurance, Abonnement, Loyer" />
            <Field label="Montant CHF" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="0.00" />

            <Text style={styles.fieldLabel}>Fréquence</Text>
            <View style={styles.freqRow}>
              <Pressable onPress={() => setFrequency('monthly')} style={[styles.freqChip, frequency === 'monthly' && styles.freqChipActive]}>
                <Text style={[styles.freqChipText, frequency === 'monthly' && styles.freqChipTextActive]}>Mensuelle</Text>
              </Pressable>
              <Pressable onPress={() => setFrequency('yearly')} style={[styles.freqChip, frequency === 'yearly' && styles.freqChipActive]}>
                <Text style={[styles.freqChipText, frequency === 'yearly' && styles.freqChipTextActive]}>Annuelle</Text>
              </Pressable>
            </View>

            <DateField label="Prochaine échéance" value={nextDueDate} onChange={setNextDueDate} />
            <Field label="Rappel (jours avant)" value={reminderDays} onChangeText={setReminderDays} keyboardType="number-pad" placeholder="3" />
            <Field label="Notes (optionnel)" value={notes} onChangeText={setNotes} placeholder="Numéro de contrat, résiliable jusqu'au..." multiline />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Button title="Enregistrer" icon="check" onPress={handleSave} loading={saving} style={{ marginTop: spacing.md }} />
            {editing ? (
              <Button title="Supprimer" icon="trash-2" variant="danger" onPress={handleDelete} loading={saving} style={{ marginTop: spacing.sm }} />
            ) : null}
            <Button title="Annuler" variant="secondary" onPress={onClose} style={{ marginTop: spacing.sm }} />
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
  onSaved,
}: {
  visible: boolean;
  onClose: () => void;
  organizationId: string;
  userId: string | undefined;
  editing: Expense | null;
  onSaved: () => void;
}) {
  const [label, setLabel] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState<string | null>(null);
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
    setExpenseDate(editing?.expense_date ?? isoToday());
    setNotes(editing?.notes ?? '');
    setError(null);
  }

  async function handleSave() {
    const amountChf = Number(amount.replace(',', '.'));
    if (!label.trim()) return setError('Le libellé est requis.');
    if (!expenseDate) return setError('La date est requise.');
    if (Number.isNaN(amountChf) || amountChf <= 0) return setError('Montant invalide.');

    setSaving(true);
    setError(null);
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
    Alert.alert('Supprimer cette dépense ?', `"${editing.label}" sera définitivement supprimée.`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
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
          <ScrollView>
            <Text style={styles.sheetTitle}>{editing ? 'Modifier la dépense' : 'Nouvelle dépense ponctuelle'}</Text>

            <Field label="Libellé" value={label} onChangeText={setLabel} placeholder="Ex : Achat matériel, outillage..." />
            <Field label="Catégorie (optionnel)" value={category} onChangeText={setCategory} placeholder="Ex : Fournitures, Outillage, Frais" />
            <Field label="Montant CHF" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="0.00" />
            <DateField label="Date" value={expenseDate} onChange={setExpenseDate} />
            <Field label="Notes (optionnel)" value={notes} onChangeText={setNotes} placeholder="Fournisseur, référence..." multiline />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Button title="Enregistrer" icon="check" onPress={handleSave} loading={saving} style={{ marginTop: spacing.md }} />
            {editing ? (
              <Button title="Supprimer" icon="trash-2" variant="danger" onPress={handleDelete} loading={saving} style={{ marginTop: spacing.sm }} />
            ) : null}
            <Button title="Annuler" variant="secondary" onPress={onClose} style={{ marginTop: spacing.sm }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
  pageSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  modeSwitch: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: 3,
    alignSelf: 'flex-start',
    marginBottom: spacing.lg,
  },
  modeTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radius.sm,
  },
  modeTabActive: {
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  modeTabText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textMuted,
  },
  modeTabTextActive: {
    color: colors.primary,
  },
  balanceCard: {
    gap: spacing.sm,
  },
  balanceTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  balanceLabel: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textMuted,
  },
  balanceMeta: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  balanceEditBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceValue: {
    fontSize: fontSize.xxxl,
    fontWeight: '800',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  balanceEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  balanceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    backgroundColor: colors.surface,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  kpiTile: {
    flex: 1,
  },
  kpiLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: '600',
  },
  kpiValue: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.text,
    marginTop: spacing.xs,
    fontVariant: ['tabular-nums'],
  },
  kpiValueDanger: {
    color: colors.danger,
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
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  sectionTitleSmall: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  disclaimer: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    lineHeight: 18,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  itemIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemLabel: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  itemMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 2,
  },
  itemMeta: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  overdueTag: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.danger,
    backgroundColor: colors.dangerSoft,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.sm,
  },
  itemAmount: {
    fontSize: fontSize.md,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  itemAmountPositive: {
    color: colors.success,
  },
  itemAmountNegative: {
    color: colors.danger,
  },
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  expenseRowInactive: {
    opacity: 0.5,
  },
  expenseRight: {
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
  error: {
    fontSize: fontSize.sm,
    color: colors.danger,
    marginTop: spacing.sm,
  },
});
