import { useCallback, useMemo, useState } from 'react';
import { Modal, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import {
  createPlanningEvent,
  deletePlanningAssignment,
  listPlanningAssignments,
  updatePlanningEvent,
  type PlanningAssignmentWithNames,
} from '../../../lib/api/planning';
import { parseFlexibleTime } from '../../../lib/api/payroll';
import { Button, Card, EmptyState, LoadingScreen, PageHeader, AppScreen } from '../../../components/ui';
import { DateField } from '../../../components/DateField';
import { ProjectPicker } from '../../../components/ProjectPicker';
import { getAppLocale, useTranslation } from '../../../lib/translations';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import type { Plan, Project } from '../../../lib/types';

interface PickItem {
  id: string;
  label: string;
}

const DAY_LABEL_KEYS = ['dayMon', 'dayTue', 'dayWed', 'dayThu', 'dayFri', 'daySat', 'daySun'] as const;

// Deterministic color per project (not per assignment) — same chantier
// always reads as the same color across the whole grid, so a glance at the
// calendar shows who's on what without reading every label.
const PROJECT_PALETTE = [colors.primary, colors.accent, colors.success, colors.warning, '#6B7FD7', '#B35FA3'];
const NO_PROJECT_COLOR = colors.textMuted;
function colorForProject(projectId: string | null): string {
  if (!projectId) return NO_PROJECT_COLOR;
  let hash = 0;
  for (let i = 0; i < projectId.length; i++) hash = (hash * 31 + projectId.charCodeAt(i)) >>> 0;
  return PROJECT_PALETTE[hash % PROJECT_PALETTE.length];
}

const hm = (t: string | null | undefined) => (t ? t.slice(0, 5) : '');

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
  return d.toLocaleDateString(`${getAppLocale()}-CH`, { day: '2-digit', month: '2-digit' });
}

export default function PlanningScreen() {
  const { t } = useTranslation();
  const { organization, user, role, permissions } = useAuth();
  // Owner/admin plan for anyone; a member only for themself.
  const isAdmin = role === 'owner' || role === 'admin';
  const router = useRouter();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [assignments, setAssignments] = useState<PlanningAssignmentWithNames[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<PickItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<Plan | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formProject, setFormProject] = useState<Project | null>(null);
  const [showProject, setShowProject] = useState(false);
  const [formAllDay, setFormAllDay] = useState(true);
  const [formStartTime, setFormStartTime] = useState('');
  const [formEndTime, setFormEndTime] = useState('');
  const [formPrivate, setFormPrivate] = useState(false);
  const [formReadOnly, setFormReadOnly] = useState(false);
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
      supabase.from('projects').select('*').eq('organization_id', organization.id).order('name'),
      supabase.from('organization_members').select('user_id, full_name').eq('organization_id', organization.id),
      supabase.from('plans').select('*').eq('id', organization.plan_id).single(),
    ]);
    setAssignments(list);
    setProjects(projectRows ?? []);
    setMembers((memberRows ?? []).map((m) => ({ id: m.user_id, label: m.full_name || t('planning.memberFallback') })));
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

  // Own events, ones you created, or (admin) anyone's shared ones. Other
  // people's private events only come back as masked busy slots.
  function canEdit(a: PlanningAssignmentWithNames): boolean {
    if (a.masked) return false;
    if (a.member_user_id === user?.id || a.created_by === user?.id) return true;
    return isAdmin && !a.is_private;
  }

  function openCreateForm(day?: Date, memberId?: string) {
    if (memberId && !isAdmin && memberId !== user?.id) return;
    setEditingId(null);
    setFormReadOnly(false);
    setFormTitle('');
    setFormProject(null);
    setShowProject(false);
    setFormMemberId(isAdmin ? memberId ?? user?.id ?? members[0]?.id ?? null : user?.id ?? null);
    const iso = toIso(day ?? new Date());
    setFormStart(iso);
    setFormEnd(iso);
    setFormAllDay(true);
    setFormStartTime('');
    setFormEndTime('');
    setFormPrivate(false);
    setFormNote('');
    setFormError(null);
    setShowForm(true);
  }

  function openEditForm(a: PlanningAssignmentWithNames) {
    if (a.masked) return;
    const project = projects.find((p) => p.id === a.project_id) ?? null;
    setEditingId(a.id);
    setFormReadOnly(!canEdit(a));
    // Events from before titles existed: the chantier name stands in.
    setFormTitle(a.title ?? (a.project_id ? '' : a.note ?? ''));
    setFormProject(project);
    setShowProject(!!project);
    setFormMemberId(a.member_user_id);
    setFormStart(a.starts_on);
    setFormEnd(a.ends_on);
    setFormAllDay(!a.start_time);
    setFormStartTime(hm(a.start_time));
    setFormEndTime(hm(a.end_time));
    setFormPrivate(!!a.is_private);
    setFormNote(a.title || a.project_id ? a.note ?? '' : '');
    setFormError(null);
    setShowForm(true);
  }

  async function handleSubmit() {
    const title = formTitle.trim() || (formProject?.name ?? '');
    if (!title) {
      setFormError(t('planning.titleRequired'));
      return;
    }
    if (!organization || !formMemberId || !formStart || !formEnd) {
      setFormError(t('planning.memberRequired'));
      return;
    }
    if (formEnd < formStart) {
      setFormError(t('planning.endAfterStart'));
      return;
    }
    let startTime: string | null = null;
    let endTime: string | null = null;
    if (!formAllDay) {
      startTime = parseFlexibleTime(formStartTime);
      endTime = formEndTime.trim() ? parseFlexibleTime(formEndTime) : null;
      if (!startTime || (formEndTime.trim() && !endTime)) {
        setFormError(t('planning.timeInvalid'));
        return;
      }
      if (endTime && formStart === formEnd && endTime <= startTime) {
        setFormError(t('planning.endTimeAfterStart'));
        return;
      }
    }
    setSaving(true);
    setFormError(null);
    const input = {
      title,
      projectId: formProject?.id ?? null,
      memberUserId: formMemberId,
      startsOn: formStart,
      endsOn: formEnd,
      startTime,
      endTime,
      isPrivate: formPrivate,
      note: formNote,
    };
    const { error } = editingId ? await updatePlanningEvent(editingId, input) : await createPlanningEvent(organization.id, user?.id, input);
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
      <AppScreen>
        <LoadingScreen />
      </AppScreen>
    );
  }

  if (!permissions.planning) {
    return (
      <AppScreen style={{ padding: spacing.xl }}>
        <PageHeader title={t('planning.title')} backTo="/(app)" />
        <Card style={styles.upsell}>
          <Feather name="lock" size={22} color={colors.textMuted} />
          <Text style={styles.upsellTitle}>{t('planning.accessDeniedTitle')}</Text>
          <Text style={styles.upsellText}>{t('planning.accessDeniedText')}</Text>
        </Card>
      </AppScreen>
    );
  }

  if (plan && !plan.has_planning) {
    return (
      <AppScreen style={{ padding: spacing.xl }}>
        <PageHeader title={t('planning.title')} backTo="/(app)" />
        <Card style={styles.upsell}>
          <Feather name="calendar" size={22} color={colors.accent} />
          <Text style={styles.upsellTitle}>{t('planning.upsellTitle')}</Text>
          <Text style={styles.upsellText}>{t('planning.upsellText')}</Text>
          <Text style={styles.upsellText}>{t('planning.upsellPlanHint')}</Text>
          <Button title={t('planning.seePlans')} variant="secondary" icon="arrow-right" onPress={() => router.push('/(app)/compte')} style={{ marginTop: spacing.md }} />
        </Card>
      </AppScreen>
    );
  }

  return (
    <AppScreen style={{ padding: spacing.xl }}>
      <View style={styles.container}>
        <PageHeader title={t('planning.title')} backTo="/(app)" right={<Button title={t('planning.assign')} icon="plus" onPress={() => openCreateForm()} />} />
        <Text style={styles.pageSubtitle}>{t('planning.subtitle')}</Text>

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

        {members.length === 0 ? (
          <EmptyState title={t('planning.emptyMembersTitle')} subtitle={t('planning.emptyMembersSubtitle')} />
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
                            {t(`planning.${DAY_LABEL_KEYS[(day.getDay() + 6) % 7]}`)}
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
                            onPress={() => openCreateForm(day, m.id)}
                            style={[styles.dayCell, isToday && styles.dayCellToday]}
                          >
                            {cellAssignments.slice(0, cellAssignments.length > 2 ? 1 : 2).map((a) => {
                              const isStart = a.starts_on === iso;
                              const isEnd = a.ends_on === iso;
                              const showLabel = isStart || day.getTime() === weekStart.getTime();
                              const label = a.masked ? t('planning.privateBusy') : a.title || (a.project_id ? a.project_name : a.note) || t('planning.noProject');
                              const time = isStart && a.start_time ? `${hm(a.start_time)}${a.end_time && a.ends_on === a.starts_on ? `–${hm(a.end_time)}` : ''} ` : '';
                              return (
                                <Pressable
                                  key={a.id}
                                  onPress={() => openEditForm(a)}
                                  disabled={a.masked}
                                  style={[
                                    styles.assignmentBar,
                                    { backgroundColor: a.masked ? colors.border : colorForProject(a.project_id) },
                                    isStart ? styles.assignmentBarStart : styles.assignmentBarNoStart,
                                    isEnd ? styles.assignmentBarEnd : styles.assignmentBarNoEnd,
                                  ]}
                                >
                                  {showLabel ? (
                                    <View style={styles.assignmentBarInner}>
                                      {a.is_private ? <Feather name="lock" size={9} color={a.masked ? colors.textMuted : '#fff'} /> : null}
                                      <Text style={[styles.assignmentBarText, a.masked && { color: colors.textMuted }]} numberOfLines={1}>
                                        {time}
                                        {label}
                                      </Text>
                                    </View>
                                  ) : null}
                                </Pressable>
                              );
                            })}
                            {cellAssignments.length > 2 ? (
                              <Pressable onPress={() => openEditForm(cellAssignments.find((x) => !x.masked) ?? cellAssignments[1])} hitSlop={4}>
                                <Text style={styles.moreText}>+{cellAssignments.length - 1}</Text>
                              </Pressable>
                            ) : null}
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
                  <Text style={styles.legendText}>{p.name}</Text>
                </View>
              ))}
              {assignments.some((a) => !a.project_id) ? (
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: NO_PROJECT_COLOR }]} />
                  <Text style={styles.legendText}>{t('planning.noProject')}</Text>
                </View>
              ) : null}
            </View>
          </ScrollView>
        )}
      </View>

      <Modal visible={showForm} animationType="fade" transparent onRequestClose={() => setShowForm(false)}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <ScrollView style={{ flex: 1 }}>
              <Text style={styles.sheetTitle}>{editingId ? t('planning.editAssignmentTitle') : t('planning.newAssignmentTitle')}</Text>

              <Text style={styles.fieldLabel}>{t('planning.titleLabel')}</Text>
              <TextInput
                style={styles.input}
                value={formTitle}
                onChangeText={setFormTitle}
                placeholder={t('planning.titlePlaceholder')}
                placeholderTextColor={colors.textMuted}
                editable={!formReadOnly}
                autoFocus={!editingId}
              />

              {showProject ? (
                <View style={{ marginBottom: spacing.md }}>
                  <ProjectPicker organizationId={organization?.id ?? ''} selectedProject={formProject} onSelect={setFormProject} />
                  {!formReadOnly ? (
                    <Pressable
                      onPress={() => {
                        setFormProject(null);
                        setShowProject(false);
                      }}
                      hitSlop={6}
                      style={styles.smallLink}
                    >
                      <Feather name="x" size={12} color={colors.textMuted} />
                      <Text style={styles.smallLinkTextMuted}>{t('planning.unlinkProject')}</Text>
                    </Pressable>
                  ) : null}
                </View>
              ) : !formReadOnly ? (
                <Pressable onPress={() => setShowProject(true)} hitSlop={6} style={[styles.smallLink, { marginBottom: spacing.md }]}>
                  <Feather name="link-2" size={12} color={colors.primary} />
                  <Text style={styles.smallLinkText}>{t('planning.linkProject')}</Text>
                </Pressable>
              ) : null}

              {isAdmin ? (
                <>
                  <Text style={styles.fieldLabel}>{t('planning.forLabel')}</Text>
                  <View style={styles.chips}>
                    {members.map((m) => (
                      <Pressable
                        key={m.id}
                        disabled={formReadOnly}
                        onPress={() => setFormMemberId(m.id)}
                        style={[styles.chip, formMemberId === m.id && styles.chipActive]}
                      >
                        <Text style={[styles.chipText, formMemberId === m.id && styles.chipTextActive]}>{m.label}</Text>
                      </Pressable>
                    ))}
                  </View>
                </>
              ) : null}

              <Pressable disabled={formReadOnly} onPress={() => setFormAllDay((v) => !v)} style={styles.toggleRow}>
                <View style={[styles.checkbox, formAllDay && styles.checkboxOn]}>{formAllDay ? <Feather name="check" size={12} color="#fff" /> : null}</View>
                <Text style={styles.toggleText}>{t('planning.allDay')}</Text>
              </Pressable>

              <View style={styles.row2}>
                <View style={styles.row2Item}>
                  <DateField label={t('planning.startLabel')} value={formStart} onChange={(v) => {
                    setFormStart(v ?? '');
                    if (v && (!formEnd || formEnd < v)) setFormEnd(v);
                  }} />
                  {!formAllDay ? (
                    <TextInput
                      style={styles.input}
                      value={formStartTime}
                      onChangeText={setFormStartTime}
                      onBlur={() => setFormStartTime((v) => parseFlexibleTime(v) ?? v)}
                      placeholder={t('planning.timePlaceholder')}
                      placeholderTextColor={colors.textMuted}
                      accessibilityLabel={t('planning.startTime')}
                      editable={!formReadOnly}
                    />
                  ) : null}
                </View>
                <View style={styles.row2Item}>
                  <DateField label={t('planning.endLabel')} value={formEnd} onChange={(v) => setFormEnd(v ?? '')} />
                  {!formAllDay ? (
                    <TextInput
                      style={styles.input}
                      value={formEndTime}
                      onChangeText={setFormEndTime}
                      onBlur={() => setFormEndTime((v) => parseFlexibleTime(v) ?? v)}
                      placeholder="16:15"
                      placeholderTextColor={colors.textMuted}
                      accessibilityLabel={t('planning.endTime')}
                      editable={!formReadOnly}
                    />
                  ) : null}
                </View>
              </View>

              <Pressable disabled={formReadOnly} onPress={() => setFormPrivate((v) => !v)} style={styles.toggleRow}>
                <View style={[styles.checkbox, formPrivate && styles.checkboxOn]}>{formPrivate ? <Feather name="lock" size={11} color="#fff" /> : null}</View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.toggleText}>{t('planning.privateLabel')}</Text>
                  <Text style={styles.toggleHint}>{t('planning.privateHint')}</Text>
                </View>
              </Pressable>

              <Text style={styles.fieldLabel}>{t('planning.noteOptional')}</Text>
              <TextInput
                style={styles.noteInput}
                value={formNote}
                onChangeText={setFormNote}
                placeholder={t('planning.notePlaceholder')}
                placeholderTextColor={colors.textMuted}
                multiline
                editable={!formReadOnly}
              />

              {formReadOnly ? <Text style={styles.toggleHint}>{t('planning.readOnly')}</Text> : null}
              {formError ? <Text style={styles.error}>{formError}</Text> : null}

              {!formReadOnly ? (
                <Button
                  title={editingId ? t('planning.save') : t('planning.create')}
                  icon="check"
                  onPress={handleSubmit}
                  loading={saving}
                  style={{ marginTop: spacing.md }}
                />
              ) : null}
              {editingId && !formReadOnly ? (
                <Button
                  title={t('planning.delete')}
                  icon="trash-2"
                  variant="danger"
                  onPress={handleDelete}
                  loading={deleting}
                  style={{ marginTop: spacing.sm }}
                />
              ) : null}
              <Button
                title={t('planning.cancel')}
                variant="secondary"
                onPress={() => setShowForm(false)}
                style={{ marginTop: spacing.sm }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </AppScreen>
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
    // Member names fall back to the raw email when no display name is set,
    // and an email has no spaces to wrap at — without this, RN-web's default
    // CSS lets it run straight past the fixed-width member column.
    ...(Platform.OS === 'web' ? ({ overflowWrap: 'anywhere', wordBreak: 'break-word' } as any) : {}),
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
  assignmentBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  assignmentBarText: {
    flexShrink: 1,
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  moreText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    paddingLeft: 2,
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
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: fontSize.md,
    color: colors.text,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  smallLink: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    marginTop: -spacing.xs,
  },
  smallLinkText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.primary,
  },
  smallLinkTextMuted: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxOn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  toggleText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  toggleHint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 16,
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
