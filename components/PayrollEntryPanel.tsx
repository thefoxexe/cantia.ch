import { useCallback, useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import {
  createExpense,
  createTimeEntry,
  deleteExpense,
  deleteTimeEntry,
  groupHoursForExport,
  hoursFromRange,
  hoursToCsv,
  listExpenseTypes,
  listExpenses,
  listTimeEntries,
  listWorkTypes,
  updateTimeEntry,
  type ExportGranularity,
  type PayrollExpenseWithNames,
  type PayrollTimeEntryWithNames,
} from '../lib/api/payroll';
import { downloadTextFile } from '../lib/downloadFile';
import { Button, Card, EmptyState } from './ui';
import { DateField } from './DateField';
import { PayrollDateFilter, type DateRange } from './PayrollDateFilter';
import { colors, fontSize, radius, spacing } from '../lib/theme';
import type { PayrollExpenseType, PayrollWorkType } from '../lib/types';

interface PickItem {
  id: string;
  label: string;
}

const GRANULARITIES: { key: ExportGranularity; label: string }[] = [
  { key: 'day', label: 'Journalier' },
  { key: 'week', label: 'Hebdomadaire' },
  { key: 'month', label: 'Mensuel' },
];

function toIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

function defaultMonthRange(): DateRange {
  const now = new Date();
  return { start: toIso(startOfMonth(now)), end: toIso(endOfMonth(now)) };
}

export { defaultMonthRange };

// The grid-style hours/frais editor — used both for "my own hours" (self
// service, targetUserId = the signed-in user) and, unchanged, for an admin
// editing an employee's entries from the RH cockpit (targetUserId = that
// employee, writes allowed by RLS via can_manage_org_payroll). Same panel,
// same rules either way, because the RLS policies themselves treat both
// cases identically.
export function PayrollEntryPanel({
  organizationId,
  targetUserId,
  currentUserId,
  range,
  onRangeChange,
  showCalendar = true,
}: {
  organizationId: string;
  targetUserId: string;
  currentUserId: string;
  range: DateRange;
  onRangeChange: (r: DateRange) => void;
  showCalendar?: boolean;
}) {
  const [projects, setProjects] = useState<PickItem[]>([]);
  const [workTypes, setWorkTypes] = useState<PayrollWorkType[]>([]);
  const [expenseTypes, setExpenseTypes] = useState<PayrollExpenseType[]>([]);
  const [entries, setEntries] = useState<PayrollTimeEntryWithNames[]>([]);
  const [expenses, setExpenses] = useState<PayrollExpenseWithNames[]>([]);
  const [loading, setLoading] = useState(true);
  const [granularity, setGranularity] = useState<ExportGranularity>('month');

  const [showHoursForm, setShowHoursForm] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [hoursProjectPicked, setHoursProjectPicked] = useState(false);
  const [hoursProjectId, setHoursProjectId] = useState<string | null>(null);
  const [hoursWorkTypeId, setHoursWorkTypeId] = useState<string | null>(null);
  const [hoursDate, setHoursDate] = useState('');
  const [hoursMode, setHoursMode] = useState<'total' | 'range'>('total');
  const [hoursTotal, setHoursTotal] = useState('');
  const [hoursStart, setHoursStart] = useState('');
  const [hoursEnd, setHoursEnd] = useState('');
  const [hoursNote, setHoursNote] = useState('');
  const [hoursError, setHoursError] = useState<string | null>(null);
  const [savingHours, setSavingHours] = useState(false);

  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenseTypePicked, setExpenseTypePicked] = useState(false);
  const [expenseTypeId, setExpenseTypeId] = useState<string | null>(null);
  const [expenseProjectId, setExpenseProjectId] = useState<string | null>(null);
  const [expenseDate, setExpenseDate] = useState('');
  const [expenseQuantity, setExpenseQuantity] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseNote, setExpenseNote] = useState('');
  const [expenseError, setExpenseError] = useState<string | null>(null);
  const [savingExpense, setSavingExpense] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: projectRows }, work, expType, entryRows, expenseRows] = await Promise.all([
      supabase.from('projects').select('id, name').eq('organization_id', organizationId).order('name'),
      listWorkTypes(organizationId),
      listExpenseTypes(organizationId),
      listTimeEntries(organizationId, targetUserId, range.start, range.end),
      listExpenses(organizationId, targetUserId, range.start, range.end),
    ]);
    setProjects((projectRows ?? []).map((p) => ({ id: p.id, label: p.name })));
    setWorkTypes(work.filter((w) => w.active));
    setExpenseTypes(expType.filter((e) => e.active));
    setEntries(entryRows);
    setExpenses(expenseRows);
    setLoading(false);
  }, [organizationId, targetUserId, range.start, range.end]);

  useEffect(() => {
    load();
  }, [load]);

  function selectHoursProject(id: string | null) {
    setHoursProjectId(id);
    setHoursProjectPicked(true);
  }

  function openHoursCreate() {
    setEditingEntryId(null);
    setHoursProjectPicked(false);
    setHoursProjectId(null);
    setHoursWorkTypeId(null);
    setHoursDate(range.start);
    setHoursMode('total');
    setHoursTotal('');
    setHoursStart('');
    setHoursEnd('');
    setHoursNote('');
    setHoursError(null);
    setShowHoursForm(true);
  }

  function openHoursEdit(e: PayrollTimeEntryWithNames) {
    setEditingEntryId(e.id);
    setHoursProjectPicked(true);
    setHoursProjectId(e.project_id);
    setHoursWorkTypeId(e.work_type_id);
    setHoursDate(e.entry_date);
    if (e.start_time && e.end_time) {
      setHoursMode('range');
      setHoursStart(e.start_time.slice(0, 5));
      setHoursEnd(e.end_time.slice(0, 5));
      setHoursTotal('');
    } else {
      setHoursMode('total');
      setHoursTotal(String(e.hours));
      setHoursStart('');
      setHoursEnd('');
    }
    setHoursNote(e.note ?? '');
    setHoursError(null);
    setShowHoursForm(true);
  }

  async function submitHours() {
    if (!hoursDate) {
      setHoursError('La date est requise.');
      return;
    }
    let hours: number;
    let startTime: string | null = null;
    let endTime: string | null = null;
    if (hoursMode === 'range') {
      if (!/^\d{1,2}:\d{2}$/.test(hoursStart) || !/^\d{1,2}:\d{2}$/.test(hoursEnd)) {
        setHoursError('Indiquez un horaire valide, ex : 08:00.');
        return;
      }
      hours = hoursFromRange(hoursStart, hoursEnd);
      startTime = hoursStart;
      endTime = hoursEnd;
    } else {
      hours = Number(hoursTotal.replace(',', '.'));
      if (!hours || hours <= 0 || hours > 24) {
        setHoursError('Indiquez un nombre d’heures valide (entre 0 et 24).');
        return;
      }
    }
    setSavingHours(true);
    setHoursError(null);
    const { error } = editingEntryId
      ? await updateTimeEntry(editingEntryId, {
          projectId: hoursProjectId,
          workTypeId: hoursWorkTypeId,
          entryDate: hoursDate,
          hours,
          startTime,
          endTime,
          note: hoursNote,
        })
      : await createTimeEntry({
          organizationId,
          projectId: hoursProjectId,
          workTypeId: hoursWorkTypeId,
          userId: targetUserId,
          entryDate: hoursDate,
          hours,
          startTime,
          endTime,
          note: hoursNote,
          createdBy: currentUserId,
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

  function selectExpenseType(id: string) {
    setExpenseTypeId(id);
    setExpenseTypePicked(true);
    setExpenseQuantity('');
    setExpenseAmount('');
  }

  function openExpenseCreate() {
    setExpenseTypePicked(false);
    setExpenseTypeId(null);
    setExpenseProjectId(null);
    setExpenseDate(range.start);
    setExpenseQuantity('');
    setExpenseAmount('');
    setExpenseNote('');
    setExpenseError(null);
    setShowExpenseForm(true);
  }

  const selectedExpenseType = expenseTypes.find((t) => t.id === expenseTypeId) ?? null;

  async function submitExpense() {
    if (!expenseDate || !expenseTypeId) {
      setExpenseError('La date et le type de frais sont requis.');
      return;
    }
    let amount: number;
    let quantity: number | null = null;
    if (selectedExpenseType?.unit === 'km') {
      quantity = Number(expenseQuantity.replace(',', '.'));
      if (!quantity || quantity <= 0) {
        setExpenseError('Indiquez un nombre de kilomètres valide.');
        return;
      }
      amount = Math.round(quantity * (selectedExpenseType.rate_chf ?? 0) * 100) / 100;
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
      organizationId,
      projectId: expenseProjectId,
      expenseTypeId,
      userId: targetUserId,
      expenseDate,
      quantity,
      amountChf: amount,
      note: expenseNote,
      createdBy: currentUserId,
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
    await downloadTextFile(`heures-${range.start}.csv`, csv);
  }

  const totalHours = Math.round(entries.reduce((sum, e) => sum + Number(e.hours), 0) * 100) / 100;
  const totalExpenses = Math.round(expenses.reduce((sum, e) => sum + Number(e.amount_chf), 0) * 100) / 100;

  return (
    <View style={styles.root}>
      {showCalendar ? <PayrollDateFilter range={range} onChange={onRangeChange} /> : null}

      <Card>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Heures</Text>
          <Text style={styles.sectionTotal}>{totalHours} h</Text>
        </View>

        {!loading && entries.length === 0 ? (
          <EmptyState title="Aucune heure saisie" subtitle="Ajoutez des heures pour cette période." />
        ) : (
          <View style={styles.grid}>
            <View style={styles.gridHeaderRow}>
              <Text style={[styles.gridHeaderCell, styles.colDate]}>Date</Text>
              <Text style={[styles.gridHeaderCell, styles.colProject]}>Chantier</Text>
              <Text style={[styles.gridHeaderCell, styles.colType]}>Type de travail</Text>
              <Text style={[styles.gridHeaderCell, styles.colHours]}>Heures</Text>
            </View>
            {entries.map((e) => (
              <Pressable key={e.id} onPress={() => openHoursEdit(e)} style={styles.gridRow}>
                <Text style={[styles.gridCell, styles.colDate]}>{new Date(`${e.entry_date}T00:00:00`).toLocaleDateString('fr-CH', { day: '2-digit', month: '2-digit' })}</Text>
                <Text style={[styles.gridCell, styles.colProject]} numberOfLines={1}>{e.project_name ?? 'Sans chantier'}</Text>
                <Text style={[styles.gridCell, styles.colType]} numberOfLines={1}>{e.work_type_label ?? '—'}</Text>
                <Text style={[styles.gridCell, styles.colHours, styles.gridCellBold]}>{Number(e.hours)} h</Text>
                <Pressable onPress={() => removeHours(e.id)} hitSlop={8} style={styles.gridDelete}>
                  <Feather name="trash-2" size={14} color={colors.textMuted} />
                </Pressable>
              </Pressable>
            ))}
          </View>
        )}
        <Button title="Ajouter une ligne" icon="plus" variant="secondary" onPress={openHoursCreate} style={{ marginTop: spacing.md }} />

        <View style={styles.exportRow}>
          <View style={styles.granChips}>
            {GRANULARITIES.map((g) => (
              <Pressable key={g.key} onPress={() => setGranularity(g.key)} style={[styles.granChip, granularity === g.key && styles.granChipActive]}>
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
          <Text style={styles.sectionTitle}>Frais professionnels</Text>
          <Text style={styles.sectionTotal}>CHF {totalExpenses.toFixed(2)}</Text>
        </View>
        {!loading && expenses.length === 0 ? (
          <EmptyState title="Aucun frais" subtitle="Ex : trajets en voiture entre chantiers." />
        ) : (
          <View style={{ gap: spacing.sm }}>
            {expenses.map((e) => (
              <View key={e.id} style={styles.entryRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.entryDate}>{new Date(`${e.expense_date}T00:00:00`).toLocaleDateString('fr-CH')}</Text>
                  <Text style={styles.entryMeta}>
                    {e.expense_type_label ?? 'Frais'}
                    {e.expense_type_unit === 'km' && e.quantity ? ` · ${e.quantity} km` : ''}
                    {e.project_name ? ` · ${e.project_name}` : ''}
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
        <Button title="Ajouter un frais" icon="plus" variant="secondary" onPress={openExpenseCreate} style={{ marginTop: spacing.md }} />
      </Card>

      <Modal visible={showHoursForm} animationType="fade" transparent onRequestClose={() => setShowHoursForm(false)}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <ScrollView>
              <Text style={styles.sheetTitle}>{editingEntryId ? 'Modifier des heures' : 'Ajouter des heures'}</Text>

              <Text style={styles.fieldLabel}>1. Chantier</Text>
              <View style={styles.chips}>
                <Pressable onPress={() => selectHoursProject(null)} style={[styles.chip, hoursProjectPicked && hoursProjectId === null && styles.chipActive]}>
                  <Text style={[styles.chipText, hoursProjectPicked && hoursProjectId === null && styles.chipTextActive]}>Sans chantier</Text>
                </Pressable>
                {projects.map((p) => (
                  <Pressable key={p.id} onPress={() => selectHoursProject(p.id)} style={[styles.chip, hoursProjectId === p.id && hoursProjectPicked && styles.chipActive]}>
                    <Text style={[styles.chipText, hoursProjectId === p.id && hoursProjectPicked && styles.chipTextActive]}>{p.label}</Text>
                  </Pressable>
                ))}
              </View>

              {hoursProjectPicked ? (
                <>
                  <Text style={styles.fieldLabel}>2. Type de travail</Text>
                  {workTypes.length === 0 ? (
                    <Text style={styles.hint}>Aucun type de travail configuré — un administrateur peut en ajouter depuis Compte → RH & Salaires.</Text>
                  ) : (
                    <View style={styles.chips}>
                      <Pressable onPress={() => setHoursWorkTypeId(null)} style={[styles.chip, hoursWorkTypeId === null && styles.chipActive]}>
                        <Text style={[styles.chipText, hoursWorkTypeId === null && styles.chipTextActive]}>Non précisé</Text>
                      </Pressable>
                      {workTypes.map((w) => (
                        <Pressable key={w.id} onPress={() => setHoursWorkTypeId(w.id)} style={[styles.chip, hoursWorkTypeId === w.id && styles.chipActive]}>
                          <Text style={[styles.chipText, hoursWorkTypeId === w.id && styles.chipTextActive]}>{w.label}</Text>
                        </Pressable>
                      ))}
                    </View>
                  )}

                  <Text style={styles.fieldLabel}>3. Date et heures</Text>
                  <DateField label="Date" value={hoursDate} onChange={(v) => setHoursDate(v ?? '')} />

                  <View style={styles.chips}>
                    <Pressable onPress={() => setHoursMode('total')} style={[styles.chip, hoursMode === 'total' && styles.chipActive]}>
                      <Text style={[styles.chipText, hoursMode === 'total' && styles.chipTextActive]}>Nombre d'heures</Text>
                    </Pressable>
                    <Pressable onPress={() => setHoursMode('range')} style={[styles.chip, hoursMode === 'range' && styles.chipActive]}>
                      <Text style={[styles.chipText, hoursMode === 'range' && styles.chipTextActive]}>Horaire (de - à)</Text>
                    </Pressable>
                  </View>

                  {hoursMode === 'total' ? (
                    <TextInput
                      style={styles.numberInput}
                      value={hoursTotal}
                      onChangeText={setHoursTotal}
                      placeholder="Ex : 8"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="decimal-pad"
                    />
                  ) : (
                    <View style={styles.row2}>
                      <View style={styles.row2Item}>
                        <TextInput style={styles.numberInput} value={hoursStart} onChangeText={setHoursStart} placeholder="08:00" placeholderTextColor={colors.textMuted} />
                      </View>
                      <View style={styles.row2Item}>
                        <TextInput style={styles.numberInput} value={hoursEnd} onChangeText={setHoursEnd} placeholder="12:00" placeholderTextColor={colors.textMuted} />
                      </View>
                    </View>
                  )}
                  {hoursMode === 'range' && /^\d{1,2}:\d{2}$/.test(hoursStart) && /^\d{1,2}:\d{2}$/.test(hoursEnd) ? (
                    <Text style={styles.hint}>= {hoursFromRange(hoursStart, hoursEnd)} h</Text>
                  ) : null}

                  <Text style={styles.fieldLabel}>Note (optionnel)</Text>
                  <TextInput style={styles.noteInput} value={hoursNote} onChangeText={setHoursNote} placeholder="Ex : pose de carrelage" placeholderTextColor={colors.textMuted} multiline />

                  {hoursError ? <Text style={styles.error}>{hoursError}</Text> : null}
                  <Button title={editingEntryId ? 'Enregistrer' : 'Ajouter'} icon="check" onPress={submitHours} loading={savingHours} style={{ marginTop: spacing.md }} />
                </>
              ) : null}
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

              <Text style={styles.fieldLabel}>1. Type de frais</Text>
              {expenseTypes.length === 0 ? (
                <Text style={styles.hint}>Aucun type de frais configuré — un administrateur peut en ajouter depuis Compte → RH & Salaires.</Text>
              ) : (
                <View style={styles.chips}>
                  {expenseTypes.map((t) => (
                    <Pressable key={t.id} onPress={() => selectExpenseType(t.id)} style={[styles.chip, expenseTypeId === t.id && styles.chipActive]}>
                      <Text style={[styles.chipText, expenseTypeId === t.id && styles.chipTextActive]}>
                        {t.label}
                        {t.unit === 'km' && t.rate_chf != null ? ` (CHF ${t.rate_chf.toFixed(2)}/km)` : ''}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}

              {expenseTypePicked ? (
                <>
                  <Text style={styles.fieldLabel}>2. Chantier (optionnel)</Text>
                  <View style={styles.chips}>
                    <Pressable onPress={() => setExpenseProjectId(null)} style={[styles.chip, expenseProjectId === null && styles.chipActive]}>
                      <Text style={[styles.chipText, expenseProjectId === null && styles.chipTextActive]}>Sans chantier</Text>
                    </Pressable>
                    {projects.map((p) => (
                      <Pressable key={p.id} onPress={() => setExpenseProjectId(p.id)} style={[styles.chip, expenseProjectId === p.id && styles.chipActive]}>
                        <Text style={[styles.chipText, expenseProjectId === p.id && styles.chipTextActive]}>{p.label}</Text>
                      </Pressable>
                    ))}
                  </View>

                  <View style={styles.row2}>
                    <View style={styles.row2Item}>
                      <DateField label="Date" value={expenseDate} onChange={(v) => setExpenseDate(v ?? '')} />
                    </View>
                    <View style={styles.row2Item}>
                      <Text style={styles.fieldLabel}>{selectedExpenseType?.unit === 'km' ? 'Kilomètres' : 'Montant (CHF)'}</Text>
                      <TextInput
                        style={styles.numberInput}
                        value={selectedExpenseType?.unit === 'km' ? expenseQuantity : expenseAmount}
                        onChangeText={selectedExpenseType?.unit === 'km' ? setExpenseQuantity : setExpenseAmount}
                        placeholder={selectedExpenseType?.unit === 'km' ? 'Ex : 24' : 'Ex : 35.50'}
                        placeholderTextColor={colors.textMuted}
                        keyboardType="decimal-pad"
                      />
                    </View>
                  </View>
                  {selectedExpenseType?.unit === 'km' && expenseQuantity ? (
                    <Text style={styles.hint}>
                      = CHF {(Math.round((Number(expenseQuantity.replace(',', '.')) || 0) * (selectedExpenseType.rate_chf ?? 0) * 100) / 100).toFixed(2)}
                    </Text>
                  ) : null}

                  <Text style={styles.fieldLabel}>Note (optionnel)</Text>
                  <TextInput style={styles.noteInput} value={expenseNote} onChangeText={setExpenseNote} placeholder="Ex : trajet dépôt → chantier" placeholderTextColor={colors.textMuted} multiline />

                  {expenseError ? <Text style={styles.error}>{expenseError}</Text> : null}
                  <Button title="Ajouter" icon="check" onPress={submitExpense} loading={savingExpense} style={{ marginTop: spacing.md }} />
                </>
              ) : null}
              <Button title="Annuler" variant="secondary" onPress={() => setShowExpenseForm(false)} style={{ marginTop: spacing.sm }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.lg,
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
  sectionTotal: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: colors.primary,
  },
  grid: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  gridHeaderRow: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  gridHeaderCell: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  gridRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  gridCell: {
    fontSize: fontSize.sm,
    color: colors.text,
  },
  gridCellBold: {
    fontWeight: '700',
  },
  colDate: {
    width: 52,
  },
  colProject: {
    flex: 1.2,
    paddingRight: spacing.xs,
  },
  colType: {
    flex: 1,
    paddingRight: spacing.xs,
  },
  colHours: {
    width: 56,
    textAlign: 'right',
  },
  gridDelete: {
    marginLeft: spacing.sm,
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
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 20, 18, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  sheet: {
    width: '100%',
    maxWidth: 460,
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
    fontWeight: '700',
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
