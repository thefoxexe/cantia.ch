import { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import {
  createExpense,
  createTimeEntry,
  deleteExpense,
  deleteTimeEntry,
  groupHoursForExport,
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
import { Button, Card } from './ui';
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

// Same "H.MM read as literal minutes" convention throughout the Heures cell:
// "4" -> 4h, "4.45"/"4,45" -> 4h45 (i.e. 4.75) — never a decimal fraction of
// an hour, since nobody mentally converts 45 minutes to ".75" while typing.
function parseFlexibleHours(raw: string): number | null {
  const s = raw.trim();
  if (!s) return null;
  if (/^\d{1,2}$/.test(s)) {
    return Number(s);
  }
  const sepMatch = s.match(/^(\d{1,2})[.,](\d{1,2})$/);
  if (sepMatch) {
    const h = Number(sepMatch[1]);
    const m = Number(sepMatch[2].padStart(2, '0'));
    if (m > 59) return null;
    return Math.round((h + m / 60) * 100) / 100;
  }
  return null;
}

// Inverse of parseFlexibleHours — redisplays a stored decimal-hours value in
// the same "H.MM read as minutes" shape the field expects on input, so
// editing an entry round-trips instead of showing a raw decimal like "4.75".
function formatHoursForInput(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) return String(h);
  return `${h}.${String(m).padStart(2, '0')}`;
}

function defaultMonthRange(): DateRange {
  const now = new Date();
  return { start: toIso(startOfMonth(now)), end: toIso(endOfMonth(now)) };
}

// What the RH screen opens on — a single day (today), not the whole month:
// arriving on the page shouldn't dump a month of entries on screen, and
// "Aujourd'hui" is one tap away from any other range via PayrollDateFilter's
// quick chips.
function defaultTodayRange(): DateRange {
  const iso = toIso(new Date());
  return { start: iso, end: iso };
}

export { defaultMonthRange, defaultTodayRange };

// A new row saved with no explicit date picker in the grid (see below) takes
// the currently filtered day when that's a single specific date, or today
// otherwise — matching the "log what I did today" use case the grid is
// built around, without forcing a date choice on every single line.
function draftEntryDate(range: DateRange): string {
  return range.start === range.end ? range.start : toIso(new Date());
}

type EditableEntry = PayrollTimeEntryWithNames & { hoursText: string; noteText: string };

function toEditable(e: PayrollTimeEntryWithNames): EditableEntry {
  return { ...e, hoursText: formatHoursForInput(Number(e.hours)), noteText: e.note ?? '' };
}

interface DraftRow {
  projectPicked: boolean;
  projectId: string | null;
  workTypeId: string | null;
  note: string;
  hoursText: string;
}

const BLANK_DRAFT: DraftRow = { projectPicked: false, projectId: null, workTypeId: null, note: '', hoursText: '' };

// A tap-to-open dropdown anchored under its own cell (same measureInWindow +
// transparent Modal technique as AccountMenu) — the closest RN-Web/native
// cross-platform equivalent of clicking a spreadsheet cell with a dropdown
// validation list, without the weight of a full-screen picker modal.
function PickerCell({
  containerStyle,
  value,
  picked = true,
  noneLabel,
  placeholder = 'Choisir…',
  options,
  disabled = false,
  onChange,
}: {
  containerStyle: object;
  value: string | null;
  picked?: boolean;
  noneLabel: string;
  placeholder?: string;
  options: PickItem[];
  disabled?: boolean;
  onChange: (id: string | null) => void;
}) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const triggerRef = useRef<View>(null);

  function open() {
    if (disabled) return;
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      const windowWidth = Dimensions.get('window').width;
      const cardWidth = Math.max(width, 200);
      const left = Math.min(Math.max(spacing.sm, x), windowWidth - cardWidth - spacing.sm);
      setPos({ top: y + height + 4, left, width: cardWidth });
      setVisible(true);
    });
  }

  const label = !picked ? placeholder : value ? options.find((o) => o.id === value)?.label ?? '—' : noneLabel;

  return (
    <>
      <View ref={triggerRef} collapsable={false} style={containerStyle}>
        <Pressable onPress={open} style={[styles.pickerCell, disabled && styles.pickerCellDisabled]}>
          <Text style={[styles.pickerCellText, !picked && styles.pickerCellPlaceholder]} numberOfLines={1}>
            {label}
          </Text>
        </Pressable>
      </View>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <Pressable style={styles.dropdownBackdrop} onPress={() => setVisible(false)}>
          {pos ? (
            <View style={[styles.dropdownCard, { top: pos.top, left: pos.left, minWidth: pos.width }]}>
              <ScrollView style={styles.dropdownScroll} showsVerticalScrollIndicator={false}>
                <Pressable
                  onPress={() => {
                    onChange(null);
                    setVisible(false);
                  }}
                  style={styles.dropdownItem}
                >
                  <Text style={styles.dropdownItemText}>{noneLabel}</Text>
                </Pressable>
                {options.map((o) => (
                  <Pressable
                    key={o.id}
                    onPress={() => {
                      onChange(o.id);
                      setVisible(false);
                    }}
                    style={styles.dropdownItem}
                  >
                    <Text style={styles.dropdownItemText}>{o.label}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          ) : null}
        </Pressable>
      </Modal>
    </>
  );
}

// The grid-style hours/frais editor — used both for "my own hours" (self
// service, targetUserId = the signed-in user) and, unchanged, for an admin
// editing an employee's entries from the RH cockpit (targetUserId = that
// employee, writes allowed by RLS via can_manage_org_payroll). Same panel,
// same rules either way, because the RLS policies themselves treat both
// cases identically.
//
// The Heures table below is a live spreadsheet, not a modal-per-entry form:
// every row (saved or the trailing blank one) is directly editable in place.
// Filling the trailing row's Heures cell saves it and replaces it with a
// fresh blank row — so logging several chantiers in one day is just filling
// cells left to right, line after line, the way people actually think about
// a timesheet.
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
  const [entries, setEntries] = useState<EditableEntry[]>([]);
  const [expenses, setExpenses] = useState<PayrollExpenseWithNames[]>([]);
  const [loading, setLoading] = useState(true);
  const [granularity, setGranularity] = useState<ExportGranularity>('month');

  const [draft, setDraft] = useState<DraftRow>(BLANK_DRAFT);
  const [savingDraft, setSavingDraft] = useState(false);
  const [draftError, setDraftError] = useState<string | null>(null);

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
    setEntries(entryRows.map(toEditable));
    setExpenses(expenseRows);
    setLoading(false);
  }, [organizationId, targetUserId, range.start, range.end]);

  useEffect(() => {
    load();
  }, [load]);

  const workTypeOptions: PickItem[] = workTypes.map((w) => ({ id: w.id, label: w.label }));

  // Saves the trailing draft row as soon as it has a chantier decided (even
  // "Sans chantier" counts) and a valid Heures value — that's the one field
  // whose completion means "this line is done", since it's always filled
  // last in the natural chantier → type de travail → remarque → heures order
  // the columns are laid out in.
  async function commitDraft() {
    if (savingDraft || !draft.projectPicked) return;
    const hours = parseFlexibleHours(draft.hoursText);
    if (!hours || hours <= 0 || hours > 24) return;
    setSavingDraft(true);
    setDraftError(null);
    const { error } = await createTimeEntry({
      organizationId,
      projectId: draft.projectId,
      workTypeId: draft.workTypeId,
      userId: targetUserId,
      entryDate: draftEntryDate(range),
      hours,
      startTime: null,
      endTime: null,
      note: draft.note,
      createdBy: currentUserId,
    });
    setSavingDraft(false);
    if (error) {
      setDraftError(error);
      return;
    }
    setDraft(BLANK_DRAFT);
    load();
  }

  // Optimistic local patch first (so typing/picking feels instant), then
  // persists the *entire* row — updateTimeEntry replaces every column, so
  // any single-field edit has to resend the row's current full state.
  function patchEntryLocal(id: string, patch: Partial<EditableEntry>): EditableEntry | null {
    let next: EditableEntry | null = null;
    setEntries((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;
        next = { ...e, ...patch };
        return next;
      }),
    );
    return next;
  }

  async function persistEntry(e: EditableEntry) {
    const { error } = await updateTimeEntry(e.id, {
      projectId: e.project_id,
      workTypeId: e.work_type_id,
      entryDate: e.entry_date,
      hours: Number(e.hours),
      startTime: e.start_time,
      endTime: e.end_time,
      note: e.note ?? '',
    });
    if (error) load();
  }

  function onPickEntryProject(e: EditableEntry, projectId: string | null) {
    const updated = patchEntryLocal(e.id, { project_id: projectId, project_name: projects.find((p) => p.id === projectId)?.label ?? null });
    if (updated) persistEntry(updated);
  }

  function onPickEntryWorkType(e: EditableEntry, workTypeId: string | null) {
    const updated = patchEntryLocal(e.id, { work_type_id: workTypeId, work_type_label: workTypes.find((w) => w.id === workTypeId)?.label ?? null });
    if (updated) persistEntry(updated);
  }

  function onEntryHoursBlur(e: EditableEntry) {
    const hours = parseFlexibleHours(e.hoursText);
    if (!hours || hours <= 0 || hours > 24) {
      patchEntryLocal(e.id, { hoursText: formatHoursForInput(Number(e.hours)) });
      return;
    }
    if (hours === Number(e.hours)) {
      patchEntryLocal(e.id, { hoursText: formatHoursForInput(hours) });
      return;
    }
    const updated = patchEntryLocal(e.id, { hours, hoursText: formatHoursForInput(hours) });
    if (updated) persistEntry(updated);
  }

  function onEntryNoteBlur(e: EditableEntry) {
    const trimmed = e.noteText.trim();
    if (trimmed === (e.note ?? '')) return;
    const updated = patchEntryLocal(e.id, { note: trimmed || null });
    if (updated) persistEntry(updated);
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

        <View style={styles.grid}>
          <View style={styles.gridHeaderRow}>
            <Text style={[styles.gridHeaderCell, styles.colProject]}>Chantier</Text>
            <Text style={[styles.gridHeaderCell, styles.colType]}>Type de travail</Text>
            <Text style={[styles.gridHeaderCell, styles.colNote]}>Remarque</Text>
            <Text style={[styles.gridHeaderCell, styles.colHours]}>Heures</Text>
            <View style={styles.colTrash} />
          </View>

          {entries.map((e) => (
            <View key={e.id} style={styles.gridRow}>
              <PickerCell
                containerStyle={styles.colProject}
                value={e.project_id}
                noneLabel="Sans chantier"
                options={projects}
                onChange={(id) => onPickEntryProject(e, id)}
              />
              <PickerCell
                containerStyle={styles.colType}
                value={e.work_type_id}
                noneLabel="Non précisé"
                options={workTypeOptions}
                onChange={(id) => onPickEntryWorkType(e, id)}
              />
              <TextInput
                style={[styles.cellInput, styles.colNote]}
                value={e.noteText}
                onChangeText={(v) => setEntries((prev) => prev.map((x) => (x.id === e.id ? { ...x, noteText: v } : x)))}
                onBlur={() => onEntryNoteBlur(e)}
                placeholder="—"
                placeholderTextColor={colors.textMuted}
              />
              <TextInput
                style={[styles.cellInput, styles.colHours, styles.cellInputRight]}
                value={e.hoursText}
                onChangeText={(v) => setEntries((prev) => prev.map((x) => (x.id === e.id ? { ...x, hoursText: v } : x)))}
                onBlur={() => onEntryHoursBlur(e)}
                keyboardType="decimal-pad"
                returnKeyType="done"
              />
              <Pressable onPress={() => removeHours(e.id)} hitSlop={8} style={styles.colTrash}>
                <Feather name="trash-2" size={14} color={colors.textMuted} />
              </Pressable>
            </View>
          ))}

          <View style={styles.gridRow}>
            <PickerCell
              containerStyle={styles.colProject}
              value={draft.projectId}
              picked={draft.projectPicked}
              noneLabel="Sans chantier"
              placeholder="+ Sélectionner un chantier"
              options={projects}
              onChange={(id) => setDraft((d) => ({ ...d, projectId: id, projectPicked: true }))}
            />
            <PickerCell
              containerStyle={styles.colType}
              value={draft.workTypeId}
              picked={draft.projectPicked}
              disabled={!draft.projectPicked}
              noneLabel="Non précisé"
              placeholder="—"
              options={workTypeOptions}
              onChange={(id) => setDraft((d) => ({ ...d, workTypeId: id }))}
            />
            <TextInput
              style={[styles.cellInput, styles.colNote, !draft.projectPicked && styles.cellInputDisabled]}
              value={draft.note}
              onChangeText={(v) => setDraft((d) => ({ ...d, note: v }))}
              editable={draft.projectPicked}
              placeholder={draft.projectPicked ? 'Optionnel' : '—'}
              placeholderTextColor={colors.textMuted}
            />
            <TextInput
              style={[styles.cellInput, styles.colHours, styles.cellInputRight, !draft.projectPicked && styles.cellInputDisabled]}
              value={draft.hoursText}
              onChangeText={(v) => setDraft((d) => ({ ...d, hoursText: v }))}
              onBlur={commitDraft}
              editable={draft.projectPicked && !savingDraft}
              placeholder={draft.projectPicked ? 'Ex : 4.30' : '—'}
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
              returnKeyType="done"
            />
            <View style={styles.colTrash} />
          </View>
        </View>
        {draftError ? <Text style={styles.error}>{draftError}</Text> : null}
        {workTypes.length === 0 ? (
          <Text style={styles.hint}>Aucun type de travail configuré — un administrateur peut en ajouter depuis Compte → RH & Salaires.</Text>
        ) : null}

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
          <Text style={styles.hint}>Aucun frais. Ex : trajets en voiture entre chantiers.</Text>
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
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  gridHeaderCell: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
    paddingHorizontal: 4,
  },
  gridRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 4,
  },
  colProject: {
    flex: 1.3,
  },
  colType: {
    flex: 1,
  },
  colNote: {
    flex: 1.2,
  },
  colHours: {
    width: 68,
  },
  colTrash: {
    width: 22,
    alignItems: 'center',
  },
  pickerCell: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
  },
  pickerCellDisabled: {
    opacity: 0.4,
  },
  pickerCellText: {
    fontSize: fontSize.sm,
    color: colors.text,
  },
  pickerCellPlaceholder: {
    color: colors.primary,
    fontWeight: '600',
  },
  cellInput: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    fontSize: fontSize.sm,
    color: colors.text,
    borderRadius: radius.sm,
  },
  cellInputRight: {
    textAlign: 'right',
    fontWeight: '700',
  },
  cellInputDisabled: {
    color: colors.textMuted,
  },
  dropdownBackdrop: {
    flex: 1,
  },
  dropdownCard: {
    position: 'absolute',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    maxWidth: 320,
  },
  dropdownScroll: {
    maxHeight: 260,
  },
  dropdownItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  dropdownItemText: {
    fontSize: fontSize.sm,
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
    marginTop: spacing.sm,
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
