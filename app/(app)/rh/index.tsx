import { useCallback, useMemo, useState } from 'react';
import { Modal, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import {
  createExpense,
  createTimeEntry,
  deleteExpense,
  deleteTimeEntry,
  groupHoursForExport,
  hoursToCsv,
  listExpenses,
  listTimeEntries,
  type ExportGranularity,
  type PayrollExpenseWithProject,
  type PayrollTimeEntryWithProject,
} from '../../../lib/api/payroll';
import { downloadTextFile } from '../../../lib/downloadFile';
import { Button, Card, EmptyState, LoadingScreen, PageHeader, Screen } from '../../../components/ui';
import { DateField } from '../../../components/DateField';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import type { Plan } from '../../../lib/types';

interface PickItem {
  id: string;
  label: string;
}

const GRANULARITIES: { key: ExportGranularity; label: string }[] = [
  { key: 'day', label: 'Journalier' },
  { key: 'week', label: 'Hebdomadaire' },
  { key: 'month', label: 'Mensuel' },
];

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

function toIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function monthLabel(d: Date): string {
  const label = d.toLocaleDateString('fr-CH', { month: 'long', year: 'numeric' });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function PayrollScreen() {
  const { organization, user, canManagePayroll } = useAuth();
  const router = useRouter();
  const [monthAnchor, setMonthAnchor] = useState(() => startOfMonth(new Date()));
  const [projects, setProjects] = useState<PickItem[]>([]);
  const [entries, setEntries] = useState<PayrollTimeEntryWithProject[]>([]);
  const [expenses, setExpenses] = useState<PayrollExpenseWithProject[]>([]);
  const [teamTotals, setTeamTotals] = useState<{ id: string; label: string; hours: number }[]>([]);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [kmRate, setKmRate] = useState(0.7);
  const [loading, setLoading] = useState(true);
  const [granularity, setGranularity] = useState<ExportGranularity>('month');

  const [showHoursForm, setShowHoursForm] = useState(false);
  const [hoursProjectId, setHoursProjectId] = useState<string | null>(null);
  const [hoursDate, setHoursDate] = useState('');
  const [hoursValue, setHoursValue] = useState('');
  const [hoursNote, setHoursNote] = useState('');
  const [hoursError, setHoursError] = useState<string | null>(null);
  const [savingHours, setSavingHours] = useState(false);

  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenseCategory, setExpenseCategory] = useState<'km' | 'autre'>('km');
  const [expenseProjectId, setExpenseProjectId] = useState<string | null>(null);
  const [expenseDate, setExpenseDate] = useState('');
  const [expenseKm, setExpenseKm] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseNote, setExpenseNote] = useState('');
  const [expenseError, setExpenseError] = useState<string | null>(null);
  const [savingExpense, setSavingExpense] = useState(false);

  const monthEnd = useMemo(() => endOfMonth(monthAnchor), [monthAnchor]);
  const rangeStart = useMemo(() => toIso(monthAnchor), [monthAnchor]);
  const rangeEnd = useMemo(() => toIso(monthEnd), [monthEnd]);

  const load = useCallback(async () => {
    if (!organization || !user) return;
    setLoading(true);
    const [{ data: projectRows }, { data: planRow }, ownEntries, ownExpenses] = await Promise.all([
      supabase.from('projects').select('id, name').eq('organization_id', organization.id).order('name'),
      supabase.from('plans').select('*').eq('id', organization.plan_id).single(),
      listTimeEntries(organization.id, user.id, rangeStart, rangeEnd),
      listExpenses(organization.id, user.id, rangeStart, rangeEnd),
    ]);
    setProjects((projectRows ?? []).map((p) => ({ id: p.id, label: p.name })));
    setPlan(planRow ?? null);
    setKmRate(organization.payroll_km_rate_chf ?? 0.7);
    setEntries(ownEntries);
    setExpenses(ownExpenses);

    if (canManagePayroll) {
      const [{ data: memberRows }, { data: allHours }] = await Promise.all([
        supabase.from('organization_members').select('user_id, full_name').eq('organization_id', organization.id),
        supabase
          .from('payroll_time_entries')
          .select('user_id, hours')
          .eq('organization_id', organization.id)
          .gte('entry_date', rangeStart)
          .lte('entry_date', rangeEnd),
      ]);
      const totals = new Map<string, number>();
      for (const row of allHours ?? []) totals.set(row.user_id, (totals.get(row.user_id) ?? 0) + Number(row.hours));
      setTeamTotals(
        (memberRows ?? []).map((m) => ({
          id: m.user_id,
          label: m.full_name || 'Membre',
          hours: Math.round((totals.get(m.user_id) ?? 0) * 100) / 100,
        })),
      );
    } else {
      setTeamTotals([]);
    }
    setLoading(false);
  }, [organization, user, canManagePayroll, rangeStart, rangeEnd]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  function openHoursForm() {
    setHoursProjectId(projects[0]?.id ?? null);
    setHoursDate(toIso(new Date()));
    setHoursValue('');
    setHoursNote('');
    setHoursError(null);
    setShowHoursForm(true);
  }

  async function submitHours() {
    if (!organization || !user || !hoursDate) {
      setHoursError('La date est requise.');
      return;
    }
    const hours = Number(hoursValue.replace(',', '.'));
    if (!hours || hours <= 0 || hours > 24) {
      setHoursError('Indiquez un nombre d’heures valide (entre 0 et 24).');
      return;
    }
    setSavingHours(true);
    setHoursError(null);
    const { error } = await createTimeEntry({
      organizationId: organization.id,
      projectId: hoursProjectId,
      userId: user.id,
      entryDate: hoursDate,
      hours,
      note: hoursNote,
      createdBy: user.id,
    });
    setSavingHours(false);
    if (error) {
      setHoursError(error);
      return;
    }
    setShowHoursForm(false);
    load();
  }

  async function removeHours(id: string) {
    await deleteTimeEntry(id);
    load();
  }

  function openExpenseForm() {
    setExpenseCategory('km');
    setExpenseProjectId(projects[0]?.id ?? null);
    setExpenseDate(toIso(new Date()));
    setExpenseKm('');
    setExpenseAmount('');
    setExpenseNote('');
    setExpenseError(null);
    setShowExpenseForm(true);
  }

  async function submitExpense() {
    if (!organization || !user || !expenseDate) {
      setExpenseError('La date est requise.');
      return;
    }
    let amount: number;
    let km: number | null = null;
    if (expenseCategory === 'km') {
      km = Number(expenseKm.replace(',', '.'));
      if (!km || km <= 0) {
        setExpenseError('Indiquez un nombre de kilomètres valide.');
        return;
      }
      amount = Math.round(km * kmRate * 100) / 100;
    } else {
      amount = Number(expenseAmount.replace(',', '.'));
      if (!amount || amount <= 0) {
        setExpenseError('Indiquez un montant valide.');
        return;
      }
    }
    setSavingExpense(true);
    setExpenseError(null);
    const { error } = await createExpense({
      organizationId: organization.id,
      projectId: expenseProjectId,
      userId: user.id,
      expenseDate,
      category: expenseCategory,
      km,
      amountChf: amount,
      note: expenseNote,
      createdBy: user.id,
    });
    setSavingExpense(false);
    if (error) {
      setExpenseError(error);
      return;
    }
    setShowExpenseForm(false);
    load();
  }

  async function removeExpense(id: string) {
    await deleteExpense(id);
    load();
  }

  async function exportHours() {
    const rows = groupHoursForExport(entries, granularity);
    const csv = hoursToCsv(rows, granularity);
    await downloadTextFile(`heures-${rangeStart}.csv`, csv);
  }

  if (loading && entries.length === 0 && projects.length === 0) {
    return (
      <Screen>
        <LoadingScreen />
      </Screen>
    );
  }

  if (plan && !plan.has_payroll) {
    return (
      <Screen style={{ padding: spacing.xl }}>
        <PageHeader title="RH & Salaires" backTo="/(app)" />
        <Card style={styles.upsell}>
          <Feather name="dollar-sign" size={22} color={colors.accent} />
          <Text style={styles.upsellTitle}>RH, heures & salaires</Text>
          <Text style={styles.upsellText}>
            Chaque employé pointe ses heures par chantier et ses frais professionnels ; la secrétaire ou
            l'administrateur gère la fiche de salaire de toute l'équipe.
          </Text>
          <Text style={styles.upsellText}>Disponible à partir du plan Équipe.</Text>
          <Button
            title="Voir les plans"
            variant="secondary"
            icon="arrow-right"
            onPress={() => router.push('/(app)/compte')}
            style={{ marginTop: spacing.md }}
          />
        </Card>
      </Screen>
    );
  }

  const totalHours = Math.round(entries.reduce((sum, e) => sum + Number(e.hours), 0) * 100) / 100;
  const totalExpenses = Math.round(expenses.reduce((sum, e) => sum + Number(e.amount_chf), 0) * 100) / 100;

  return (
    <Screen style={{ padding: spacing.xl }}>
      <View style={styles.container}>
        <PageHeader title="RH & Salaires" backTo="/(app)" />
        <Text style={styles.pageSubtitle}>Vos heures et frais professionnels, chantier par chantier.</Text>

        <View style={styles.monthNav}>
          <Pressable onPress={() => setMonthAnchor((m) => addMonths(m, -1))} hitSlop={8} style={styles.monthNavButton}>
            <Feather name="chevron-left" size={18} color={colors.text} />
          </Pressable>
          <Pressable onPress={() => setMonthAnchor(startOfMonth(new Date()))} hitSlop={8}>
            <Text style={styles.monthLabel}>{monthLabel(monthAnchor)}</Text>
          </Pressable>
          <Pressable onPress={() => setMonthAnchor((m) => addMonths(m, 1))} hitSlop={8} style={styles.monthNavButton}>
            <Feather name="chevron-right" size={18} color={colors.text} />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingBottom: spacing.xxl * 2, gap: spacing.xl }}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}
        >
          <Card>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Mes heures</Text>
              <Text style={styles.sectionTotal}>{totalHours} h</Text>
            </View>

            {entries.length === 0 ? (
              <EmptyState title="Aucune heure saisie" subtitle="Ajoutez vos heures pour ce mois." />
            ) : (
              <View style={{ gap: spacing.sm }}>
                {entries.map((e) => (
                  <View key={e.id} style={styles.entryRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.entryDate}>
                        {new Date(`${e.entry_date}T00:00:00`).toLocaleDateString('fr-CH')}
                      </Text>
                      <Text style={styles.entryMeta}>{e.project_name ?? 'Sans chantier'}{e.note ? ` · ${e.note}` : ''}</Text>
                    </View>
                    <Text style={styles.entryHours}>{Number(e.hours)} h</Text>
                    <Pressable onPress={() => removeHours(e.id)} hitSlop={8}>
                      <Feather name="trash-2" size={16} color={colors.textMuted} />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
            <Button title="Ajouter des heures" icon="plus" variant="secondary" onPress={openHoursForm} style={{ marginTop: spacing.md }} />

            <View style={styles.exportRow}>
              <View style={styles.granChips}>
                {GRANULARITIES.map((g) => (
                  <Pressable
                    key={g.key}
                    onPress={() => setGranularity(g.key)}
                    style={[styles.granChip, granularity === g.key && styles.granChipActive]}
                  >
                    <Text style={[styles.granChipText, granularity === g.key && styles.granChipTextActive]}>{g.label}</Text>
                  </Pressable>
                ))}
              </View>
              <Pressable onPress={exportHours} style={styles.exportButton} hitSlop={8}>
                <Feather name="download" size={14} color={colors.primary} />
                <Text style={styles.exportButtonText}>Exporter en CSV</Text>
              </Pressable>
            </View>
          </Card>

          <Card>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Mes frais professionnels</Text>
              <Text style={styles.sectionTotal}>CHF {totalExpenses.toFixed(2)}</Text>
            </View>
            {expenses.length === 0 ? (
              <EmptyState title="Aucun frais" subtitle="Ex : trajets en voiture entre chantiers." />
            ) : (
              <View style={{ gap: spacing.sm }}>
                {expenses.map((e) => (
                  <View key={e.id} style={styles.entryRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.entryDate}>
                        {new Date(`${e.expense_date}T00:00:00`).toLocaleDateString('fr-CH')}
                      </Text>
                      <Text style={styles.entryMeta}>
                        {e.category === 'km' ? `${e.km} km` : 'Frais'}
                        {e.project_name ? ` · ${e.project_name}` : ''}
                        {e.note ? ` · ${e.note}` : ''}
                      </Text>
                    </View>
                    <Text style={styles.entryHours}>CHF {Number(e.amount_chf).toFixed(2)}</Text>
                    <Pressable onPress={() => removeExpense(e.id)} hitSlop={8}>
                      <Feather name="trash-2" size={16} color={colors.textMuted} />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
            <Button title="Ajouter un frais" icon="plus" variant="secondary" onPress={openExpenseForm} style={{ marginTop: spacing.md }} />
          </Card>

          {canManagePayroll ? (
            <Card>
              <Text style={styles.sectionTitle}>Équipe — heures du mois</Text>
              <Text style={styles.sectionSubtitle}>
                Sélectionnez un membre pour voir sa fiche complète et gérer son salaire.
              </Text>
              <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
                {teamTotals.map((m) => (
                  <Pressable key={m.id} onPress={() => router.push(`/(app)/rh/${m.id}`)} style={styles.memberRow}>
                    <View style={styles.memberAvatar}>
                      <Text style={styles.memberAvatarText}>{initials(m.label)}</Text>
                    </View>
                    <Text style={styles.memberName}>{m.label}</Text>
                    <Text style={styles.memberHours}>{m.hours} h</Text>
                    <Feather name="chevron-right" size={16} color={colors.textMuted} />
                  </Pressable>
                ))}
              </View>
            </Card>
          ) : null}
        </ScrollView>
      </View>

      <Modal visible={showHoursForm} animationType="fade" transparent onRequestClose={() => setShowHoursForm(false)}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <ScrollView>
              <Text style={styles.sheetTitle}>Ajouter des heures</Text>

              <Text style={styles.fieldLabel}>Chantier</Text>
              <View style={styles.chips}>
                <Pressable
                  onPress={() => setHoursProjectId(null)}
                  style={[styles.chip, hoursProjectId === null && styles.chipActive]}
                >
                  <Text style={[styles.chipText, hoursProjectId === null && styles.chipTextActive]}>Sans chantier</Text>
                </Pressable>
                {projects.map((p) => (
                  <Pressable
                    key={p.id}
                    onPress={() => setHoursProjectId(p.id)}
                    style={[styles.chip, hoursProjectId === p.id && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, hoursProjectId === p.id && styles.chipTextActive]}>{p.label}</Text>
                  </Pressable>
                ))}
              </View>

              <View style={styles.row2}>
                <View style={styles.row2Item}>
                  <DateField label="Date" value={hoursDate} onChange={(v) => setHoursDate(v ?? '')} />
                </View>
                <View style={styles.row2Item}>
                  <Text style={styles.fieldLabel}>Heures</Text>
                  <TextInput
                    style={styles.numberInput}
                    value={hoursValue}
                    onChangeText={setHoursValue}
                    placeholder="Ex : 8"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              <Text style={styles.fieldLabel}>Note (optionnel)</Text>
              <TextInput
                style={styles.noteInput}
                value={hoursNote}
                onChangeText={setHoursNote}
                placeholder="Ex : pose de carrelage"
                placeholderTextColor={colors.textMuted}
                multiline
              />

              {hoursError ? <Text style={styles.error}>{hoursError}</Text> : null}

              <Button title="Ajouter" icon="check" onPress={submitHours} loading={savingHours} style={{ marginTop: spacing.md }} />
              <Button title="Annuler" variant="secondary" onPress={() => setShowHoursForm(false)} style={{ marginTop: spacing.sm }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showExpenseForm} animationType="fade" transparent onRequestClose={() => setShowExpenseForm(false)}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <ScrollView>
              <Text style={styles.sheetTitle}>Ajouter un frais</Text>

              <Text style={styles.fieldLabel}>Type</Text>
              <View style={styles.chips}>
                <Pressable
                  onPress={() => setExpenseCategory('km')}
                  style={[styles.chip, expenseCategory === 'km' && styles.chipActive]}
                >
                  <Text style={[styles.chipText, expenseCategory === 'km' && styles.chipTextActive]}>
                    Kilomètres (CHF {kmRate.toFixed(2)}/km)
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setExpenseCategory('autre')}
                  style={[styles.chip, expenseCategory === 'autre' && styles.chipActive]}
                >
                  <Text style={[styles.chipText, expenseCategory === 'autre' && styles.chipTextActive]}>Autre</Text>
                </Pressable>
              </View>

              <Text style={styles.fieldLabel}>Chantier (optionnel)</Text>
              <View style={styles.chips}>
                <Pressable
                  onPress={() => setExpenseProjectId(null)}
                  style={[styles.chip, expenseProjectId === null && styles.chipActive]}
                >
                  <Text style={[styles.chipText, expenseProjectId === null && styles.chipTextActive]}>Sans chantier</Text>
                </Pressable>
                {projects.map((p) => (
                  <Pressable
                    key={p.id}
                    onPress={() => setExpenseProjectId(p.id)}
                    style={[styles.chip, expenseProjectId === p.id && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, expenseProjectId === p.id && styles.chipTextActive]}>{p.label}</Text>
                  </Pressable>
                ))}
              </View>

              <View style={styles.row2}>
                <View style={styles.row2Item}>
                  <DateField label="Date" value={expenseDate} onChange={(v) => setExpenseDate(v ?? '')} />
                </View>
                <View style={styles.row2Item}>
                  <Text style={styles.fieldLabel}>{expenseCategory === 'km' ? 'Kilomètres' : 'Montant (CHF)'}</Text>
                  <TextInput
                    style={styles.numberInput}
                    value={expenseCategory === 'km' ? expenseKm : expenseAmount}
                    onChangeText={expenseCategory === 'km' ? setExpenseKm : setExpenseAmount}
                    placeholder={expenseCategory === 'km' ? 'Ex : 24' : 'Ex : 35.50'}
                    placeholderTextColor={colors.textMuted}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>
              {expenseCategory === 'km' && expenseKm ? (
                <Text style={styles.hint}>
                  = CHF {(Math.round((Number(expenseKm.replace(',', '.')) || 0) * kmRate * 100) / 100).toFixed(2)}
                </Text>
              ) : null}

              <Text style={styles.fieldLabel}>Note (optionnel)</Text>
              <TextInput
                style={styles.noteInput}
                value={expenseNote}
                onChangeText={setExpenseNote}
                placeholder="Ex : trajet dépôt → chantier"
                placeholderTextColor={colors.textMuted}
                multiline
              />

              {expenseError ? <Text style={styles.error}>{expenseError}</Text> : null}

              <Button title="Ajouter" icon="check" onPress={submitExpense} loading={savingExpense} style={{ marginTop: spacing.md }} />
              <Button title="Annuler" variant="secondary" onPress={() => setShowExpenseForm(false)} style={{ marginTop: spacing.sm }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
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
  pageSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  monthNavButton: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  monthLabel: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
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
  },
  sectionTotal: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: colors.primary,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  entryDate: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  entryMeta: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 1,
  },
  entryHours: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  exportRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  granChips: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  granChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  granChipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  granChipText: {
    fontSize: fontSize.xs,
    color: colors.text,
  },
  granChipTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  exportButtonText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.primary,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  memberAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatarText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
  },
  memberName: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  memberHours: {
    fontSize: fontSize.sm,
    fontWeight: '700',
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
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  row2: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  row2Item: {
    flex: 1,
  },
  numberInput: {
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
  hint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: -spacing.md,
    marginBottom: spacing.md,
  },
  noteInput: {
    minHeight: 60,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: fontSize.sm,
    color: colors.text,
    backgroundColor: colors.surface,
    textAlignVertical: 'top',
    marginBottom: spacing.md,
  },
  error: {
    color: colors.danger,
    fontSize: fontSize.sm,
    marginTop: spacing.sm,
  },
});
