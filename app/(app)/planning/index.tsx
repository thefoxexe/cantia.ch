import { useCallback, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import {
  createPlanningAssignment,
  deletePlanningAssignment,
  listPlanningAssignments,
  updatePlanningAssignment,
  type PlanningAssignmentWithNames,
} from '../../../lib/api/planning';
import { Button, EmptyState, LoadingScreen, Screen } from '../../../components/ui';
import { DateField } from '../../../components/DateField';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';

interface PickItem {
  id: string;
  label: string;
}

const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

function startOfWeek(d: Date): Date {
  const date = new Date(d);
  const day = (date.getDay() + 6) % 7; // Monday = 0
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(d: Date, n: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + n);
  return next;
}

function toIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatShort(d: Date): string {
  return d.toLocaleDateString('fr-CH', { day: '2-digit', month: '2-digit' });
}

export default function PlanningScreen() {
  const { organization, user } = useAuth();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [assignments, setAssignments] = useState<PlanningAssignmentWithNames[]>([]);
  const [projects, setProjects] = useState<PickItem[]>([]);
  const [members, setMembers] = useState<PickItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formProjectId, setFormProjectId] = useState<string | null>(null);
  const [formMemberId, setFormMemberId] = useState<string | null>(null);
  const [formStart, setFormStart] = useState('');
  const [formEnd, setFormEnd] = useState('');
  const [formNote, setFormNote] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart]);
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const load = useCallback(async () => {
    if (!organization) return;
    setLoading(true);
    const [list, { data: projectRows }, { data: memberRows }] = await Promise.all([
      listPlanningAssignments(organization.id, toIso(weekStart), toIso(weekEnd)),
      supabase.from('projects').select('id, name').eq('organization_id', organization.id).order('name'),
      supabase.from('organization_members').select('user_id, full_name').eq('organization_id', organization.id),
    ]);
    setAssignments(list);
    setProjects((projectRows ?? []).map((p) => ({ id: p.id, label: p.name })));
    setMembers((memberRows ?? []).map((m) => ({ id: m.user_id, label: m.full_name || 'Membre' })));
    setLoading(false);
  }, [organization, weekStart, weekEnd]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  function assignmentsForDay(day: Date): PlanningAssignmentWithNames[] {
    const iso = toIso(day);
    return assignments.filter((a) => a.starts_on <= iso && a.ends_on >= iso);
  }

  function openCreateForm(day?: Date) {
    setEditingId(null);
    setFormProjectId(projects[0]?.id ?? null);
    setFormMemberId(user?.id ?? members[0]?.id ?? null);
    const iso = toIso(day ?? new Date());
    setFormStart(iso);
    setFormEnd(iso);
    setFormNote('');
    setFormError(null);
    setShowForm(true);
  }

  function openEditForm(a: PlanningAssignmentWithNames) {
    setEditingId(a.id);
    setFormProjectId(a.project_id);
    setFormMemberId(a.member_user_id);
    setFormStart(a.starts_on);
    setFormEnd(a.ends_on);
    setFormNote(a.note ?? '');
    setFormError(null);
    setShowForm(true);
  }

  async function handleSubmit() {
    if (!organization || !formProjectId || !formMemberId || !formStart || !formEnd) {
      setFormError('Chantier, membre et dates sont requis.');
      return;
    }
    if (formEnd < formStart) {
      setFormError('La date de fin doit être après la date de début.');
      return;
    }
    setSaving(true);
    setFormError(null);
    const { error } = editingId
      ? await updatePlanningAssignment(editingId, { startsOn: formStart, endsOn: formEnd, note: formNote })
      : await createPlanningAssignment({
          organizationId: organization.id,
          projectId: formProjectId,
          memberUserId: formMemberId,
          startsOn: formStart,
          endsOn: formEnd,
          note: formNote,
          createdBy: user?.id,
        });
    setSaving(false);
    if (error) {
      setFormError(error);
      return;
    }
    setShowForm(false);
    load();
  }

  async function handleDelete() {
    if (!editingId) return;
    setDeleting(true);
    const { error } = await deletePlanningAssignment(editingId);
    setDeleting(false);
    if (error) {
      setFormError(error);
      return;
    }
    setShowForm(false);
    load();
  }

  if (loading && assignments.length === 0 && projects.length === 0) {
    return (
      <Screen>
        <LoadingScreen />
      </Screen>
    );
  }

  return (
    <Screen style={{ padding: spacing.xl }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Planning</Text>
          <Button title="Assigner" icon="plus" onPress={() => openCreateForm()} />
        </View>

        <View style={styles.weekNav}>
          <Pressable onPress={() => setWeekStart((w) => addDays(w, -7))} hitSlop={8} style={styles.weekNavButton}>
            <Feather name="chevron-left" size={18} color={colors.text} />
          </Pressable>
          <Pressable onPress={() => setWeekStart(startOfWeek(new Date()))} hitSlop={8}>
            <Text style={styles.weekLabel}>
              {formatShort(weekStart)} – {formatShort(weekEnd)}
            </Text>
          </Pressable>
          <Pressable onPress={() => setWeekStart((w) => addDays(w, 7))} hitSlop={8} style={styles.weekNavButton}>
            <Feather name="chevron-right" size={18} color={colors.text} />
          </Pressable>
        </View>

        {projects.length === 0 ? (
          <EmptyState
            title="Aucun chantier"
            subtitle="Créez un chantier avant de planifier des affectations d'équipe."
          />
        ) : (
          <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl * 2 }}>
            {days.map((day) => {
              const dayAssignments = assignmentsForDay(day);
              const isToday = toIso(day) === toIso(new Date());
              return (
                <View key={toIso(day)} style={styles.dayRow}>
                  <View style={styles.dayHeader}>
                    <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>
                      {DAY_LABELS[(day.getDay() + 6) % 7]} {formatShort(day)}
                    </Text>
                    <Pressable onPress={() => openCreateForm(day)} hitSlop={8}>
                      <Feather name="plus-circle" size={16} color={colors.textMuted} />
                    </Pressable>
                  </View>
                  {dayAssignments.length === 0 ? (
                    <Text style={styles.emptyDay}>—</Text>
                  ) : (
                    <View style={{ gap: spacing.xs }}>
                      {dayAssignments.map((a) => (
                        <Pressable key={a.id} onPress={() => openEditForm(a)} style={styles.assignmentCard}>
                          <View style={styles.assignmentDot} />
                          <View style={{ flex: 1 }}>
                            <Text style={styles.assignmentProject}>{a.project_name}</Text>
                            <Text style={styles.assignmentMember}>{a.member_name}</Text>
                          </View>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>

      <Modal visible={showForm} animationType="fade" transparent onRequestClose={() => setShowForm(false)}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <ScrollView>
              <Text style={styles.sheetTitle}>{editingId ? "Modifier l'affectation" : 'Nouvelle affectation'}</Text>

              <Text style={styles.fieldLabel}>Chantier</Text>
              <View style={styles.chips}>
                {projects.map((p) => (
                  <Pressable
                    key={p.id}
                    onPress={() => setFormProjectId(p.id)}
                    style={[styles.chip, formProjectId === p.id && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, formProjectId === p.id && styles.chipTextActive]}>{p.label}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.fieldLabel}>Membre</Text>
              <View style={styles.chips}>
                {members.map((m) => (
                  <Pressable
                    key={m.id}
                    onPress={() => setFormMemberId(m.id)}
                    style={[styles.chip, formMemberId === m.id && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, formMemberId === m.id && styles.chipTextActive]}>{m.label}</Text>
                  </Pressable>
                ))}
              </View>

              <View style={styles.row2}>
                <View style={styles.row2Item}>
                  <DateField label="Début" value={formStart} onChange={setFormStart} />
                </View>
                <View style={styles.row2Item}>
                  <DateField label="Fin" value={formEnd} onChange={setFormEnd} />
                </View>
              </View>

              <Text style={styles.fieldLabel}>Note (optionnel)</Text>
              <TextInput
                style={styles.noteInput}
                value={formNote}
                onChangeText={setFormNote}
                placeholder="Ex : livraison matériel le matin"
                placeholderTextColor={colors.textMuted}
                multiline
              />

              {formError ? <Text style={styles.error}>{formError}</Text> : null}

              <Button
                title={editingId ? 'Enregistrer' : 'Créer'}
                icon="check"
                onPress={handleSubmit}
                loading={saving}
                style={{ marginTop: spacing.md }}
              />
              {editingId ? (
                <Button
                  title="Supprimer"
                  icon="trash-2"
                  variant="danger"
                  onPress={handleDelete}
                  loading={deleting}
                  style={{ marginTop: spacing.sm }}
                />
              ) : null}
              <Button
                title="Annuler"
                variant="secondary"
                onPress={() => setShowForm(false)}
                style={{ marginTop: spacing.sm }}
              />
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
    maxWidth: 880,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
  },
  weekNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  weekNavButton: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  weekLabel: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  dayRow: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  dayLabel: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textMuted,
  },
  dayLabelToday: {
    color: colors.primary,
  },
  emptyDay: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  assignmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    backgroundColor: colors.surface,
  },
  assignmentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  assignmentProject: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  assignmentMember: {
    fontSize: fontSize.xs,
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
