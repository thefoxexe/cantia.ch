import { useCallback, useMemo, useState } from 'react';
import { Modal, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
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
import { Button, Card, EmptyState, LoadingScreen, PageHeader, Screen } from '../../../components/ui';
import { DateField } from '../../../components/DateField';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import type { Plan } from '../../../lib/types';

interface PickItem {
  id: string;
  label: string;
}

const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

// Deterministic color per project (not per assignment) — same chantier
// always reads as the same color across the whole grid, so a glance at the
// calendar shows who's on what without reading every label.
const PROJECT_PALETTE = [colors.primary, colors.accent, colors.success, colors.warning, '#6B7FD7', '#B35FA3'];
function colorForProject(projectId: string): string {
  let hash = 0;
  for (let i = 0; i < projectId.length; i++) hash = (hash * 31 + projectId.charCodeAt(i)) >>> 0;
  return PROJECT_PALETTE[hash % PROJECT_PALETTE.length];
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const DAY_COL_WIDTH = 108;
const MEMBER_COL_WIDTH = 96;
const ROW_HEIGHT = 60;

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
  const { organization, user, permissions } = useAuth();
  const router = useRouter();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [assignments, setAssignments] = useState<PlanningAssignmentWithNames[]>([]);
  const [projects, setProjects] = useState<PickItem[]>([]);
  const [members, setMembers] = useState<PickItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<Plan | null>(null);

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
    const [list, { data: projectRows }, { data: memberRows }, { data: planRow }] = await Promise.all([
      listPlanningAssignments(organization.id, toIso(weekStart), toIso(weekEnd)),
      supabase.from('projects').select('id, name').eq('organization_id', organization.id).order('name'),
      supabase.from('organization_members').select('user_id, full_name').eq('organization_id', organization.id),
      supabase.from('plans').select('*').eq('id', organization.plan_id).single(),
    ]);
    setAssignments(list);
    setProjects((projectRows ?? []).map((p) => ({ id: p.id, label: p.name })));
    setMembers((memberRows ?? []).map((m) => ({ id: m.user_id, label: m.full_name || 'Membre' })));
    setPlan(planRow ?? null);
    setLoading(false);
  }, [organization, weekStart, weekEnd]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  function assignmentsForCell(day: Date, memberId: string): PlanningAssignmentWithNames[] {
    const iso = toIso(day);
    return assignments.filter((a) => a.member_user_id === memberId && a.starts_on <= iso && a.ends_on >= iso);
  }

  function openCreateForm(day?: Date, memberId?: string) {
    setEditingId(null);
    setFormProjectId(projects[0]?.id ?? null);
    setFormMemberId(memberId ?? user?.id ?? members[0]?.id ?? null);
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

  if (!permissions.planning) {
    return (
      <Screen style={{ padding: spacing.xl }}>
        <PageHeader title="Planning" backTo="/(app)" />
        <Card style={styles.upsell}>
          <Feather name="lock" size={22} color={colors.textMuted} />
          <Text style={styles.upsellTitle}>Accès non autorisé</Text>
          <Text style={styles.upsellText}>
            Vous n'avez pas accès au planning de cette entreprise. Demandez à un administrateur de vous donner accès
            depuis Équipe.
          </Text>
        </Card>
      </Screen>
    );
  }

  if (plan && !plan.has_planning) {
    return (
      <Screen style={{ padding: spacing.xl }}>
        <PageHeader title="Planning" backTo="/(app)" />
        <Card style={styles.upsell}>
          <Feather name="calendar" size={22} color={colors.accent} />
          <Text style={styles.upsellTitle}>Planning d'équipe</Text>
          <Text style={styles.upsellText}>
            Organisez qui va sur quel chantier, et quand, avec une vue calendrier par semaine partagée avec toute l'équipe.
          </Text>
          <Text style={styles.upsellText}>Disponible à partir du plan Équipe.</Text>
          <Button title="Voir les plans" variant="secondary" icon="arrow-right" onPress={() => router.push('/(app)/compte')} style={{ marginTop: spacing.md }} />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen style={{ padding: spacing.xl }}>
      <View style={styles.container}>
        <PageHeader title="Planning" backTo="/(app)" right={<Button title="Assigner" icon="plus" onPress={() => openCreateForm()} />} />
        <Text style={styles.pageSubtitle}>L'équipe de la semaine, chantier par chantier et jour par jour.</Text>

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
        ) : members.length === 0 ? (
          <EmptyState title="Aucun membre" subtitle="Invitez votre équipe pour commencer à planifier." />
        ) : (
          <ScrollView
            contentContainerStyle={{ paddingBottom: spacing.xxl * 2 }}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}
          >
            <View style={styles.gridRow}>
              {/* Member axis — stays put while the day grid scrolls horizontally. */}
              <View style={{ width: MEMBER_COL_WIDTH }}>
                <View style={styles.cornerCell} />
                {members.map((m) => (
                  <View key={m.id} style={styles.memberCell}>
                    <View style={styles.memberAvatar}>
                      <Text style={styles.memberAvatarText}>{initials(m.label)}</Text>
                    </View>
                    <Text style={styles.memberName} numberOfLines={2}>
                      {m.label}
                    </Text>
                  </View>
                ))}
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View>
                  <View style={styles.dayHeaderRow}>
                    {days.map((day) => {
                      const isToday = toIso(day) === toIso(new Date());
                      return (
                        <View key={toIso(day)} style={[styles.dayHeaderCell, isToday && styles.dayHeaderCellToday]}>
                          <Text style={[styles.dayHeaderLabel, isToday && styles.dayHeaderLabelToday]}>
                            {DAY_LABELS[(day.getDay() + 6) % 7]}
                          </Text>
                          <Text style={[styles.dayHeaderDate, isToday && styles.dayHeaderLabelToday]}>{formatShort(day)}</Text>
                        </View>
                      );
                    })}
                  </View>

                  {members.map((m) => (
                    <View key={m.id} style={styles.gridDataRow}>
                      {days.map((day) => {
                        const cellAssignments = assignmentsForCell(day, m.id);
                        const isToday = toIso(day) === toIso(new Date());
                        const iso = toIso(day);
                        return (
                          <Pressable
                            key={iso}
                            onPress={() => (cellAssignments.length > 0 ? openEditForm(cellAssignments[0]) : openCreateForm(day, m.id))}
                            style={[styles.dayCell, isToday && styles.dayCellToday]}
                          >
                            {cellAssignments.map((a) => {
                              const isStart = a.starts_on === iso;
                              const isEnd = a.ends_on === iso;
                              const showLabel = isStart || day.getTime() === weekStart.getTime();
                              return (
                                <Pressable
                                  key={a.id}
                                  onPress={() => openEditForm(a)}
                                  style={[
                                    styles.assignmentBar,
                                    { backgroundColor: colorForProject(a.project_id) },
                                    isStart ? styles.assignmentBarStart : styles.assignmentBarNoStart,
                                    isEnd ? styles.assignmentBarEnd : styles.assignmentBarNoEnd,
                                  ]}
                                >
                                  {showLabel ? (
                                    <Text style={styles.assignmentBarText} numberOfLines={1}>
                                      {a.project_name}
                                    </Text>
                                  ) : null}
                                </Pressable>
                              );
                            })}
                          </Pressable>
                        );
                      })}
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.legendRow}>
              {projects.map((p) => (
                <View key={p.id} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colorForProject(p.id) }]} />
                  <Text style={styles.legendText}>{p.label}</Text>
                </View>
              ))}
            </View>
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
  gridRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cornerCell: {
    height: 52,
  },
  memberCell: {
    height: ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingRight: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  memberAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  memberAvatarText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
  },
  memberName: {
    flex: 1,
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 14,
  },
  dayHeaderRow: {
    flexDirection: 'row',
    height: 52,
  },
  dayHeaderCell: {
    width: DAY_COL_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayHeaderCellToday: {
    backgroundColor: colors.primarySoft,
    borderTopLeftRadius: radius.sm,
    borderTopRightRadius: radius.sm,
  },
  dayHeaderLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  dayHeaderDate: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
    marginTop: 1,
  },
  dayHeaderLabelToday: {
    color: colors.primary,
  },
  gridDataRow: {
    flexDirection: 'row',
  },
  dayCell: {
    width: DAY_COL_WIDTH,
    height: ROW_HEIGHT,
    padding: 3,
    gap: 2,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: colors.border,
  },
  dayCellToday: {
    backgroundColor: colors.primarySoft,
  },
  assignmentBar: {
    height: 20,
    justifyContent: 'center',
    paddingHorizontal: 5,
    marginHorizontal: -3,
  },
  assignmentBarStart: {
    borderTopLeftRadius: radius.sm,
    borderBottomLeftRadius: radius.sm,
    marginLeft: 3,
  },
  assignmentBarNoStart: {
    marginLeft: -1,
  },
  assignmentBarEnd: {
    borderTopRightRadius: radius.sm,
    borderBottomRightRadius: radius.sm,
    marginRight: 3,
  },
  assignmentBarNoEnd: {
    marginRight: -1,
  },
  assignmentBarText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
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
