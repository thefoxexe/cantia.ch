import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { applyWorkTerm } from '../../../lib/vocabulary';
import { supabase } from '../../../lib/supabase';
import { confirm } from '../../../lib/confirm';
import { Card, EmptyState, LoadingScreen, PageHeader, AppScreen } from '../../../components/ui';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import type { DashboardTask, DashboardTaskCategory } from '../../../lib/types';

const CATEGORY_META: Record<DashboardTaskCategory, { label: string; fg: string; bg: string }> = {
  general: { label: 'Général', fg: colors.textMuted, bg: colors.surfaceAlt },
  administratif: { label: 'Administratif', fg: colors.primary, bg: colors.primarySoft },
  chantier: { label: 'Chantier', fg: colors.accent, bg: colors.accentSoft },
  client: { label: 'Client', fg: colors.success, bg: colors.successSoft },
  urgent: { label: 'Urgent', fg: colors.danger, bg: colors.dangerSoft },
};

const CATEGORY_ORDER: DashboardTaskCategory[] = ['general', 'urgent', 'chantier', 'client', 'administratif'];
type FilterKey = 'all' | DashboardTaskCategory;

type DueKey = 'none' | 'today' | 'tomorrow' | 'friday' | 'nextweek';
const DUE_OPTIONS: { value: DueKey; label: string }[] = [
  { value: 'none', label: 'Aucune' },
  { value: 'today', label: 'Aujourd’hui' },
  { value: 'tomorrow', label: 'Demain' },
  { value: 'friday', label: 'Vendredi' },
  { value: 'nextweek', label: 'Dans une semaine' },
];

function todayIso(): string {
  return isoOf(new Date());
}

function isoOf(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function dueDate(key: DueKey): string | null {
  const d = new Date();
  if (key === 'none') return null;
  if (key === 'tomorrow') d.setDate(d.getDate() + 1);
  if (key === 'friday') d.setDate(d.getDate() + ((5 - d.getDay() + 7) % 7));
  if (key === 'nextweek') d.setDate(d.getDate() + 7);
  return isoOf(d);
}

function formatDue(iso: string): string {
  if (iso === todayIso()) return 'Aujourd’hui';
  const label = new Date(`${iso}T12:00:00`).toLocaleDateString('fr-CH', { weekday: 'short', day: 'numeric', month: 'short' });
  return iso < todayIso() ? `En retard · ${label}` : label;
}

function OptionRow<T extends string | null>({ label, value, onChange, options }: { label: string; value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.optionRow}>
      <Text style={styles.optionLabel}>{label}</Text>
      {options.map((o) => {
        const active = value === o.value;
        return (
          <Pressable key={String(o.value)} onPress={() => onChange(o.value)} style={[styles.optionChip, active && styles.optionChipActive]}>
            <Text style={[styles.optionChipText, active && styles.optionChipTextActive]} numberOfLines={1}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export default function TachesScreen() {
  const { organization, user, role } = useAuth();
  const isAdmin = role === 'owner' || role === 'admin';
  const [tasks, setTasks] = useState<DashboardTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [showDone, setShowDone] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<DashboardTaskCategory>('general');
  const [newProject, setNewProject] = useState<string | null>(null);
  const [newDue, setNewDue] = useState<DueKey>('none');
  const [newAssignee, setNewAssignee] = useState<string | null>(null);
  const [projectFilter, setProjectFilter] = useState<string | 'all'>('all');
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [members, setMembers] = useState<{ user_id: string; full_name: string | null }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!organization) return;
    setLoading(true);
    const [{ data }, { data: proj }, { data: team }] = await Promise.all([
      supabase.from('dashboard_tasks').select('*').eq('organization_id', organization.id).order('created_at', { ascending: false }),
      supabase.from('projects').select('id, name').eq('organization_id', organization.id).eq('status', 'active').order('name'),
      supabase.from('organization_members').select('user_id, full_name').eq('organization_id', organization.id),
    ]);
    setTasks((data ?? []) as DashboardTask[]);
    setProjects(proj ?? []);
    setMembers(team ?? []);
    setLoading(false);
  }, [organization]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const matches = useCallback(
    (t: DashboardTask) => (filter === 'all' || t.category === filter) && (projectFilter === 'all' || (projectFilter === '' ? !t.project_id : t.project_id === projectFilter)),
    [filter, projectFilter],
  );
  // Open tasks: due first (earliest), then newest.
  const open = useMemo(
    () => tasks.filter((t) => !t.done && matches(t)).sort((a, b) => ((a.due_on ?? '9999') === (b.due_on ?? '9999') ? 0 : (a.due_on ?? '9999') < (b.due_on ?? '9999') ? -1 : 1)),
    [tasks, matches],
  );
  const done = useMemo(() => tasks.filter((t) => t.done && matches(t)), [tasks, matches]);
  const projectName = useMemo(() => Object.fromEntries(projects.map((p) => [p.id, p.name])), [projects]);
  const memberName = useMemo(() => Object.fromEntries(members.map((m) => [m.user_id, m.full_name || 'Membre'])), [members]);

  async function handleAdd() {
    const title = newTitle.trim();
    if (!title || !organization) return;
    setError(null);
    const { data, error: err } = await supabase
      .from('dashboard_tasks')
      .insert({
        organization_id: organization.id,
        title,
        category: newCategory,
        created_by: user?.id ?? null,
        project_id: newProject,
        due_on: dueDate(newDue),
        assigned_to: newAssignee,
      })
      .select('*')
      .single();
    if (err) {
      setError(err.message);
      return;
    }
    setNewTitle('');
    setNewDue('none');
    setTasks((prev) => [data as DashboardTask, ...prev]);
  }

  async function handleToggle(task: DashboardTask) {
    const nextDone = !task.done;
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, done: nextDone, done_at: nextDone ? new Date().toISOString() : null } : t)));
    const { error: err } = await supabase
      .from('dashboard_tasks')
      .update({ done: nextDone, done_at: nextDone ? new Date().toISOString() : null })
      .eq('id', task.id);
    if (err) {
      setError(err.message);
      load();
    }
  }

  async function handleDelete(task: DashboardTask) {
    const ok = await confirm('Supprimer cette tâche ?', task.title);
    if (!ok) return;
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    const { error: err } = await supabase.from('dashboard_tasks').delete().eq('id', task.id);
    if (err) {
      setError(err.message);
      load();
    }
  }

  function TaskRow({ task }: { task: DashboardTask }) {
    const meta = CATEGORY_META[task.category] ?? CATEGORY_META.general;
    const canDelete = isAdmin || task.created_by === user?.id;
    return (
      <Card style={styles.taskCard}>
        <Pressable onPress={() => handleToggle(task)} style={[styles.checkbox, task.done && styles.checkboxDone]} hitSlop={8}>
          {task.done ? <Feather name="check" size={12} color="#fff" /> : null}
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[styles.taskTitle, task.done && styles.taskTitleDone]}>{task.title}</Text>
          <View style={styles.metaRow}>
            <View style={[styles.categoryPill, { backgroundColor: meta.bg }]}>
              <Text style={[styles.categoryPillText, { color: meta.fg }]}>{applyWorkTerm(meta.label, 'fr')}</Text>
            </View>
            {task.project_id && projectName[task.project_id] ? (
              <Text style={styles.metaText}>
                <Feather name="layers" size={11} /> {projectName[task.project_id]}
              </Text>
            ) : null}
            {task.due_on ? (
              <Text style={[styles.metaText, !task.done && task.due_on < todayIso() && { color: colors.danger }]}>
                <Feather name="calendar" size={11} /> {formatDue(task.due_on)}
              </Text>
            ) : null}
            {task.assigned_to ? (
              <Text style={styles.metaText}>
                <Feather name="user" size={11} /> {memberName[task.assigned_to] ?? 'Membre'}
              </Text>
            ) : null}
          </View>
        </View>
        {canDelete ? (
          <Pressable onPress={() => handleDelete(task)} hitSlop={8}>
            <Feather name="trash-2" size={16} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </Card>
    );
  }

  return (
    <AppScreen style={{ padding: spacing.xl }}>
      <View style={styles.container}>
        <PageHeader title="Tâches" backTo="/(app)" />
        <Text style={styles.pageSubtitle}>La liste de tâches partagée par toute l'équipe.</Text>

        <Card style={styles.addCard}>
          <View style={styles.addRow}>
            <TextInput
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="Ajouter une tâche…"
              placeholderTextColor={colors.textMuted}
              style={styles.addInput}
              onSubmitEditing={handleAdd}
              returnKeyType="done"
            />
            <Pressable onPress={handleAdd} style={styles.addButton} hitSlop={8}>
              <Feather name="plus" size={16} color="#fff" />
            </Pressable>
          </View>
          <View style={styles.categoryRow}>
            {CATEGORY_ORDER.map((cat) => {
              const meta = CATEGORY_META[cat];
              const active = newCategory === cat;
              return (
                <Pressable
                  key={cat}
                  onPress={() => setNewCategory(cat)}
                  style={[styles.categoryChip, { backgroundColor: active ? meta.bg : colors.surfaceAlt }]}
                >
                  <Text style={[styles.categoryChipText, { color: active ? meta.fg : colors.textMuted }]}>{applyWorkTerm(meta.label, 'fr')}</Text>
                </Pressable>
              );
            })}
          </View>
          {projects.length ? (
            <OptionRow
              label={applyWorkTerm('Chantier', 'fr')}
              value={newProject}
              onChange={setNewProject}
              options={[{ value: null, label: 'Aucun' }, ...projects.map((p) => ({ value: p.id, label: p.name }))]}
            />
          ) : null}
          <OptionRow label="Échéance" value={newDue} onChange={(v) => setNewDue(v as DueKey)} options={DUE_OPTIONS} />
          {members.length > 1 ? (
            <OptionRow
              label="Pour"
              value={newAssignee}
              onChange={setNewAssignee}
              options={[{ value: null, label: 'Toute l’équipe' }, ...members.map((m) => ({ value: m.user_id, label: m.full_name || 'Membre' }))]}
            />
          ) : null}
        </Card>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.filterRow}>
          <Pressable onPress={() => setFilter('all')} style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}>
            <Text style={[styles.filterChipText, filter === 'all' && styles.filterChipTextActive]}>Toutes</Text>
          </Pressable>
          {CATEGORY_ORDER.map((cat) => (
            <Pressable key={cat} onPress={() => setFilter(cat)} style={[styles.filterChip, filter === cat && styles.filterChipActive]}>
              <Text style={[styles.filterChipText, filter === cat && styles.filterChipTextActive]}>{applyWorkTerm(CATEGORY_META[cat].label, 'fr')}</Text>
            </Pressable>
          ))}
        </View>

        {projects.length ? (
          <View style={styles.filterRow}>
            <Pressable onPress={() => setProjectFilter('all')} style={[styles.filterChip, projectFilter === 'all' && styles.filterChipActive]}>
              <Text style={[styles.filterChipText, projectFilter === 'all' && styles.filterChipTextActive]}>{applyWorkTerm('Tous les chantiers', 'fr')}</Text>
            </Pressable>
            <Pressable onPress={() => setProjectFilter('')} style={[styles.filterChip, projectFilter === '' && styles.filterChipActive]}>
              <Text style={[styles.filterChipText, projectFilter === '' && styles.filterChipTextActive]}>{applyWorkTerm('Sans chantier', 'fr')}</Text>
            </Pressable>
            {projects.map((p) => (
              <Pressable key={p.id} onPress={() => setProjectFilter(p.id)} style={[styles.filterChip, projectFilter === p.id && styles.filterChipActive]}>
                <Text style={[styles.filterChipText, projectFilter === p.id && styles.filterChipTextActive]} numberOfLines={1}>
                  {p.name}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        {loading ? (
          <LoadingScreen />
        ) : (
          <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl, gap: spacing.sm }} showsVerticalScrollIndicator={false}>
            {open.length === 0 && done.length === 0 ? (
              <EmptyState title="Aucune tâche" subtitle="Ajoutez la première tâche de l'équipe ci-dessus." />
            ) : (
              <>
                {open.map((task) => (
                  <TaskRow key={task.id} task={task} />
                ))}
                {done.length > 0 ? (
                  <>
                    <Pressable onPress={() => setShowDone((v) => !v)} style={styles.doneToggle}>
                      <Feather name={showDone ? 'chevron-down' : 'chevron-right'} size={14} color={colors.textMuted} />
                      <Text style={styles.doneToggleText}>Terminées ({done.length})</Text>
                    </Pressable>
                    {showDone ? done.map((task) => <TaskRow key={task.id} task={task} />) : null}
                  </>
                ) : null}
              </>
            )}
          </ScrollView>
        )}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm, marginTop: 4 },
  metaText: { fontSize: fontSize.xs, color: colors.textMuted },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  optionLabel: { fontSize: fontSize.xs, fontWeight: '600', color: colors.textMuted, width: 70 },
  optionChip: { paddingHorizontal: spacing.sm, paddingVertical: 5, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, maxWidth: 200 },
  optionChipActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  optionChipText: { fontSize: fontSize.xs, fontWeight: '600', color: colors.text },
  optionChipTextActive: { color: colors.primaryDark },
  container: {
    flex: 1,
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  pageSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  addCard: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  addInput: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
  },
  addButton: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  categoryChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  categoryChipText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  error: {
    fontSize: fontSize.xs,
    color: colors.danger,
    marginBottom: spacing.sm,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  filterChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterChipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textMuted,
  },
  filterChipTextActive: {
    color: colors.primary,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  taskTitle: {
    fontSize: fontSize.md,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  taskTitleDone: {
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  categoryPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  doneToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
  },
  doneToggleText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textMuted,
  },
});
