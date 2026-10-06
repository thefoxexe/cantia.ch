import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../../lib/auth-context';
import { supabase } from '../../lib/supabase';
import { isModuleEnabled } from '../../lib/modules';
import { isOnline } from '../../lib/presence';
import { listFavorites, setFavorite } from '../../lib/projectFolders';
import { addressQueryFor, describeWeatherCode, fetchWeatherFor, type WeatherNow } from '../../lib/weather';
import { listPlanningAssignments, type PlanningAssignmentWithNames } from '../../lib/api/planning';
import { Button, Card, AppScreen } from '../../components/ui';
import { FeatureHint } from '../../components/FeatureHint';
import { useTranslation } from '../../lib/translations';
import { applyWorkTerm } from '../../lib/vocabulary';
import { breakpoints, colors, fontSize, radius, spacing } from '../../lib/theme';
import { displayType, monoType } from '../../lib/marketingTheme';
import type { DashboardTask, DashboardTaskCategory, OrganizationMember, Project } from '../../lib/types';

// Home: what matters today on the ground — my planning, the team's day,
// the tasks of each chantier and the chantiers in progress. Deliberately
// no amounts (no turnover, no unpaid invoices): money lives in Finances,
// and the home is the screen everyone in the team opens, not only the
// boss.

const WEATHER_REFRESH_MS = 20 * 60 * 1000;

const CATEGORY_COLORS: Record<DashboardTaskCategory, { fg: string; bg: string }> = {
  general: { fg: colors.textMuted, bg: colors.surfaceAlt },
  administratif: { fg: colors.primary, bg: colors.primarySoft },
  chantier: { fg: colors.accent, bg: colors.accentSoft },
  client: { fg: colors.success, bg: colors.successSoft },
  urgent: { fg: colors.danger, bg: colors.dangerSoft },
};
const CATEGORY_ORDER: DashboardTaskCategory[] = ['general', 'urgent', 'chantier', 'client', 'administratif'];

const COPY = {
  fr: {
    myDay: 'Mon planning',
    today: 'Aujourd’hui',
    week: '7 prochains jours',
    allDay: 'Journée',
    nothingToday: 'Rien de prévu aujourd’hui.',
    nothingWeek: 'Rien de prévu ces 7 prochains jours.',
    create: 'Créer',
    openPlanning: 'Ouvrir le planning',
    privateEvent: 'Rendez-vous privé',
    noProject: 'Sans chantier',
    tasks: 'Tâches',
    taskFor: 'Chantier :',
    none: 'Aucun',
    due: 'Échéance',
    dueToday: 'Aujourd’hui',
    overdue: 'En retard',
    noTasks: 'Aucune tâche ouverte. Ajoutez-en une ci-dessus.',
    projects: 'Chantiers en cours',
    seeAll: 'Tout voir',
    noProjects: 'Aucun chantier en cours.',
    onSiteToday: 'Sur place aujourd’hui',
    nobodyToday: 'Personne de prévu aujourd’hui',
    openTasks: '{{n}} tâche(s) ouverte(s)',
    team: 'L’équipe aujourd’hui',
    available: 'Pas de planning',
    online: 'En ligne',
    newProject: 'Nouveau chantier',
    newDevis: 'Nouveau devis',
    more: '+ {{n}} autre(s)',
  },
  de: {
    myDay: 'Meine Planung',
    today: 'Heute',
    week: 'Nächste 7 Tage',
    allDay: 'Ganztägig',
    nothingToday: 'Heute nichts geplant.',
    nothingWeek: 'In den nächsten 7 Tagen nichts geplant.',
    create: 'Erstellen',
    openPlanning: 'Planung öffnen',
    privateEvent: 'Privater Termin',
    noProject: 'Ohne Baustelle',
    tasks: 'Aufgaben',
    taskFor: 'Baustelle:',
    none: 'Keine',
    due: 'Fällig',
    dueToday: 'Heute',
    overdue: 'Überfällig',
    noTasks: 'Keine offenen Aufgaben. Fügen Sie oben eine hinzu.',
    projects: 'Laufende Baustellen',
    seeAll: 'Alle anzeigen',
    noProjects: 'Keine laufende Baustelle.',
    onSiteToday: 'Heute vor Ort',
    nobodyToday: 'Heute niemand eingeplant',
    openTasks: '{{n}} offene Aufgabe(n)',
    team: 'Das Team heute',
    available: 'Keine Planung',
    online: 'Online',
    newProject: 'Neue Baustelle',
    newDevis: 'Neue Offerte',
    more: '+ {{n}} weitere',
  },
  it: {
    myDay: 'La mia pianificazione',
    today: 'Oggi',
    week: 'Prossimi 7 giorni',
    allDay: 'Giornata',
    nothingToday: 'Niente in programma oggi.',
    nothingWeek: 'Niente in programma nei prossimi 7 giorni.',
    create: 'Creare',
    openPlanning: 'Aprire la pianificazione',
    privateEvent: 'Appuntamento privato',
    noProject: 'Senza cantiere',
    tasks: 'Compiti',
    taskFor: 'Cantiere:',
    none: 'Nessuno',
    due: 'Scadenza',
    dueToday: 'Oggi',
    overdue: 'In ritardo',
    noTasks: 'Nessun compito aperto. Aggiungetene uno qui sopra.',
    projects: 'Cantieri in corso',
    seeAll: 'Vedi tutto',
    noProjects: 'Nessun cantiere in corso.',
    onSiteToday: 'Sul posto oggi',
    nobodyToday: 'Nessuno previsto oggi',
    openTasks: '{{n}} compito/i aperto/i',
    team: 'Il team oggi',
    available: 'Nessuna pianificazione',
    online: 'Online',
    newProject: 'Nuovo cantiere',
    newDevis: 'Nuovo preventivo',
    more: '+ {{n}} altro/i',
  },
};

function iso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

const hhmm = (t: string | null | undefined) => (t ? t.slice(0, 5) : null);

function formatDateLong(date: Date, locale: string): string {
  const label = date.toLocaleDateString(`${locale}-CH`, { weekday: 'long', day: 'numeric', month: 'long' });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function formatDay(isoDate: string, locale: string): string {
  const d = new Date(`${isoDate}T12:00:00`);
  const label = d.toLocaleDateString(`${locale}-CH`, { weekday: 'short', day: 'numeric', month: 'short' });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export default function DashboardScreen() {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language === 'de' || i18n.language === 'it' ? i18n.language : 'fr') as keyof typeof COPY;
  const raw = COPY[lang];
  const c = useMemo(
    () => Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, applyWorkTerm(v, i18n.language)])) as typeof raw,
    [raw, i18n.language],
  );
  const { organization, user, canManageDevis, role, permissions } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const wide = width >= breakpoints.desktop;
  const isAdmin = role === 'owner' || role === 'admin';
  const trialDaysLeft = organization?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(organization.trial_ends_at).getTime() - Date.now()) / 86400000))
    : null;
  const devisVisible = isModuleEnabled(organization?.enabled_modules, 'devis') && canManageDevis;
  const planningEnabled = isModuleEnabled(organization?.enabled_modules, 'planning') && permissions.planning;
  const fullName = (user?.user_metadata?.full_name as string | undefined) || null;
  const firstName = fullName?.trim().split(' ')[0] || null;

  const today = iso(new Date());
  const [weather, setWeather] = useState<WeatherNow | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  // starred chantiers, any status, shown first
  const [favIds, setFavIds] = useState<Set<string>>(new Set());
  const [favProjects, setFavProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [events, setEvents] = useState<PlanningAssignmentWithNames[]>([]);
  const [tasks, setTasks] = useState<DashboardTask[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [range, setRange] = useState<'today' | 'week'>('today');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<DashboardTaskCategory>('general');
  const [newTaskProject, setNewTaskProject] = useState<string | null>(null);
  const [taskError, setTaskError] = useState<string | null>(null);

  useEffect(() => {
    if (!organization) return;
    const query = addressQueryFor(organization);
    if (!query) return;
    let cancelled = false;
    const loadWeather = () => fetchWeatherFor(query).then((r) => !cancelled && setWeather(r));
    loadWeather();
    const id = setInterval(loadWeather, WEATHER_REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [organization?.id, organization?.locality, organization?.address]);

  const load = useCallback(async () => {
    if (!organization) return;
    const [{ data: proj }, { data: team }, { data: openTasks }, planning] = await Promise.all([
      supabase.from('projects').select('*').eq('organization_id', organization.id).eq('status', 'active').order('updated_at', { ascending: false }).limit(30),
      supabase.from('organization_members').select('*').eq('organization_id', organization.id),
      supabase.from('dashboard_tasks').select('*').eq('organization_id', organization.id).eq('done', false).order('created_at', { ascending: false }).limit(200),
      planningEnabled ? listPlanningAssignments(organization.id, iso(new Date()), iso(addDays(new Date(), 7))).catch(() => []) : Promise.resolve([]),
    ]);
    setProjects((proj ?? []) as Project[]);
    const favs = await listFavorites();
    setFavIds(favs);
    if (favs.size) {
      const { data: fp } = await supabase.from('projects').select('*').in('id', [...favs]);
      setFavProjects(((fp ?? []) as Project[]).sort((a, b) => (a.reference ?? a.name).localeCompare(b.reference ?? b.name, 'fr', { numeric: true })));
    } else setFavProjects([]);
    setMembers((team ?? []) as OrganizationMember[]);
    setTasks((openTasks ?? []) as DashboardTask[]);
    setEvents(planning);
  }, [organization, planningEnabled]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  async function handleAddTask() {
    const title = newTaskTitle.trim();
    if (!title || !organization) return;
    setTaskError(null);
    const row: Record<string, unknown> = { organization_id: organization.id, title, category: newTaskCategory, created_by: user?.id ?? null };
    if (newTaskProject) row.project_id = newTaskProject;
    const { data, error } = await supabase.from('dashboard_tasks').insert(row).select('*').single();
    if (error) {
      setTaskError(error.message);
      return;
    }
    setNewTaskTitle('');
    setTasks((prev) => [data as DashboardTask, ...prev]);
  }

  async function handleToggleTask(task: DashboardTask) {
    setTasks((prev) => prev.filter((x) => x.id !== task.id));
    const { error } = await supabase.from('dashboard_tasks').update({ done: true, done_at: new Date().toISOString() }).eq('id', task.id);
    if (error) {
      setTaskError(error.message);
      load();
    }
  }

  const projectName = useMemo(() => Object.fromEntries(projects.map((p) => [p.id, p.name])), [projects]);
  const memberName = useMemo(() => Object.fromEntries(members.map((m) => [m.user_id, m.full_name || t('common.member')])), [members, t]);

  const myEvents = useMemo(() => {
    const end = range === 'today' ? today : iso(addDays(new Date(), 7));
    return events.filter((e) => e.member_user_id === user?.id && e.starts_on <= end && e.ends_on >= today);
  }, [events, range, today, user?.id]);

  const todayByMember = useMemo(() => {
    const map: Record<string, PlanningAssignmentWithNames[]> = {};
    for (const e of events) if (e.starts_on <= today && e.ends_on >= today) (map[e.member_user_id] ??= []).push(e);
    return map;
  }, [events, today]);

  const onSiteByProject = useMemo(() => {
    const map: Record<string, Set<string>> = {};
    for (const e of events) if (!e.masked && e.project_id && e.starts_on <= today && e.ends_on >= today) (map[e.project_id] ??= new Set()).add(e.member_user_id);
    return map;
  }, [events, today]);

  const openTasksByProject = useMemo(() => {
    const map: Record<string, number> = {};
    for (const task of tasks) if (task.project_id) map[task.project_id] = (map[task.project_id] ?? 0) + 1;
    return map;
  }, [tasks]);

  // Tasks grouped by chantier; the ones without a chantier first. Inside a
  // group: overdue / due first, then newest.
  const taskGroups = useMemo(() => {
    const groups = new Map<string, DashboardTask[]>();
    const sorted = [...tasks].sort((a, b) => {
      const da = a.due_on ?? '9999';
      const db = b.due_on ?? '9999';
      return da === db ? (a.created_at < b.created_at ? 1 : -1) : da < db ? -1 : 1;
    });
    for (const task of sorted) {
      const key = task.project_id && projectName[task.project_id] ? task.project_id : '';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(task);
    }
    return [...groups.entries()].sort(([a], [b]) => (a === '' ? -1 : b === '' ? 1 : (projectName[a] ?? '').localeCompare(projectName[b] ?? '')));
  }, [tasks, projectName]);

  const weatherInfo = weather ? describeWeatherCode(weather.code) : null;

  const planningCard = planningEnabled ? (
    <Card style={styles.card}>
      <View style={styles.cardHead}>
        <Text style={styles.cardTitle}>{c.myDay}</Text>
        <View style={styles.segment}>
          {(['today', 'week'] as const).map((r) => (
            <Pressable key={r} onPress={() => setRange(r)} style={[styles.segmentItem, range === r && styles.segmentOn]}>
              <Text style={[styles.segmentText, range === r && styles.segmentTextOn]}>{r === 'today' ? c.today : c.week}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      {myEvents.length === 0 ? (
        <View style={styles.emptyRow}>
          <Text style={styles.muted}>{range === 'today' ? c.nothingToday : c.nothingWeek}</Text>
          <Pressable onPress={() => router.push('/(app)/planning' as any)} style={styles.inlineAction}>
            <Feather name="plus" size={14} color={colors.primary} />
            <Text style={styles.link}>{c.create}</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.eventList}>
          {myEvents.map((e) => {
            const start = hhmm(e.start_time);
            const end = hhmm(e.end_time);
            const multiDay = e.starts_on !== e.ends_on;
            return (
              <Pressable key={e.id} onPress={() => router.push('/(app)/planning' as any)} style={styles.eventRow}>
                <View style={styles.eventTime}>
                  {range === 'week' ? <Text style={styles.eventDay}>{formatDay(e.starts_on < today ? today : e.starts_on, lang)}</Text> : null}
                  <Text style={styles.eventHour}>{start ? `${start}${end ? `–${end}` : ''}` : c.allDay}</Text>
                </View>
                <View style={[styles.eventBar, e.is_private && { backgroundColor: colors.textMuted }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.eventTitle} numberOfLines={1}>
                    {e.is_private ? '🔒 ' : ''}
                    {e.title || e.project_name}
                  </Text>
                  <Text style={styles.eventMeta} numberOfLines={1}>
                    {[e.project_id ? e.project_name : c.noProject, multiDay ? `${formatDay(e.starts_on, lang)} → ${formatDay(e.ends_on, lang)}` : null].filter(Boolean).join(' · ')}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}
      <Pressable onPress={() => router.push('/(app)/planning' as any)}>
        <Text style={[styles.link, { marginTop: spacing.sm }]}>{c.openPlanning} →</Text>
      </Pressable>
    </Card>
  ) : null;

  const tasksCard = (
    <Card style={styles.card}>
      <View style={styles.cardHead}>
        <Text style={styles.cardTitle}>
          {c.tasks} <Text style={styles.count}>{tasks.length}</Text>
        </Text>
        <Pressable onPress={() => router.push('/(app)/taches' as any)}>
          <Text style={styles.link}>{c.seeAll}</Text>
        </Pressable>
      </View>
      <View style={styles.taskAddRow}>
        <TextInput
          value={newTaskTitle}
          onChangeText={setNewTaskTitle}
          placeholder={t('dashboard.addTaskPlaceholder')}
          placeholderTextColor={colors.textMuted}
          style={styles.taskInput}
          onSubmitEditing={handleAddTask}
          returnKeyType="done"
        />
        <Pressable onPress={handleAddTask} style={styles.taskAddButton} hitSlop={8} accessibilityLabel={t('dashboard.addTaskPlaceholder')}>
          <Feather name="plus" size={16} color="#fff" />
        </Pressable>
      </View>
      {projects.length ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          <Text style={styles.chipLabel}>{c.taskFor}</Text>
          <Chip label={c.none} active={!newTaskProject} onPress={() => setNewTaskProject(null)} />
          {projects.slice(0, 12).map((p) => (
            <Chip key={p.id} label={p.name} active={newTaskProject === p.id} onPress={() => setNewTaskProject(p.id)} />
          ))}
        </ScrollView>
      ) : null}
      <View style={styles.chipRowWrap}>
        {CATEGORY_ORDER.map((cat) => {
          const meta = CATEGORY_COLORS[cat];
          const active = newTaskCategory === cat;
          return (
            <Pressable key={cat} onPress={() => setNewTaskCategory(cat)} style={[styles.categoryChip, { backgroundColor: active ? meta.bg : colors.surfaceAlt }]}>
              <Text style={[styles.categoryChipText, { color: active ? meta.fg : colors.textMuted }]}>{t(`common.taskCategory.${cat}`)}</Text>
            </Pressable>
          );
        })}
      </View>
      {taskError ? <Text style={styles.error}>{taskError}</Text> : null}
      {tasks.length === 0 ? (
        <Text style={[styles.muted, { marginTop: spacing.md }]}>{c.noTasks}</Text>
      ) : (
        <View style={{ marginTop: spacing.sm, gap: spacing.md }}>
          {taskGroups.map(([projectId, list]) => (
            <View key={projectId || 'none'}>
              <Pressable
                disabled={!projectId}
                onPress={() => projectId && router.push(`/(app)/chantiers/${projectId}` as any)}
                style={styles.groupHead}
              >
                <Feather name={projectId ? 'layers' : 'inbox'} size={13} color={projectId ? colors.primary : colors.textMuted} />
                <Text style={[styles.groupTitle, !projectId && { color: colors.textMuted }]} numberOfLines={1}>
                  {projectId ? projectName[projectId] : c.noProject}
                </Text>
                <Text style={styles.groupCount}>{list.length}</Text>
              </Pressable>
              {list.slice(0, 6).map((task) => {
                const meta = CATEGORY_COLORS[task.category] ?? CATEGORY_COLORS.general;
                const overdue = !!task.due_on && task.due_on < today;
                const dueToday = task.due_on === today;
                return (
                  <View key={task.id} style={styles.taskRow}>
                    <Pressable onPress={() => handleToggleTask(task)} style={styles.taskCheckbox} hitSlop={8} accessibilityRole="checkbox" accessibilityLabel={task.title} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.taskTitle} numberOfLines={2}>
                        {task.title}
                      </Text>
                      {task.due_on || task.assigned_to ? (
                        <Text style={[styles.taskMeta, overdue && { color: colors.danger }]}>
                          {[task.due_on ? (overdue ? c.overdue : dueToday ? c.dueToday : `${c.due} ${formatDay(task.due_on, lang)}`) : null, task.assigned_to ? memberName[task.assigned_to] : null]
                            .filter(Boolean)
                            .join(' · ')}
                        </Text>
                      ) : null}
                    </View>
                    <View style={[styles.categoryDot, { backgroundColor: meta.fg }]} />
                  </View>
                );
              })}
              {list.length > 6 ? <Text style={styles.moreText}>{c.more.replace('{{n}}', String(list.length - 6))}</Text> : null}
            </View>
          ))}
        </View>
      )}
    </Card>
  );

  async function toggleFavorite(p: Project) {
    const on = !favIds.has(p.id);
    setFavIds((s) => {
      const n = new Set(s);
      if (on) n.add(p.id);
      else n.delete(p.id);
      return n;
    });
    setFavProjects((list) => (on ? [...list, p] : list.filter((x) => x.id !== p.id)));
    await setFavorite(p.id, on);
  }

  const favoritesCard = favProjects.length ? (
    <Card style={styles.card}>
      <View style={styles.cardHead}>
        <Text style={styles.cardTitle}>
          <FontAwesome name="star" size={15} color="#E0A100" /> {t('explorer.favorites')}
        </Text>
      </View>
      <View style={styles.favGrid}>
        {favProjects.map((p) => (
          <Pressable key={p.id} onPress={() => router.push(`/(app)/chantiers/${p.id}` as any)} style={({ hovered }: any) => [styles.favTile, hovered && { borderColor: colors.primary }]}>
            <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
              {p.reference ? <Text style={styles.favRef}>{p.reference}</Text> : null}
              <Text style={styles.projectName} numberOfLines={1}>
                {p.name}
              </Text>
              <Text style={styles.projectMeta} numberOfLines={1}>
                {[p.client_name, p.address].filter(Boolean).join(' · ') || ' '}
              </Text>
            </View>
            <Pressable onPress={() => toggleFavorite(p)} hitSlop={8} accessibilityLabel={t('explorer.unfavorite')}>
              <FontAwesome name="star" size={16} color="#E0A100" />
            </Pressable>
          </Pressable>
        ))}
      </View>
    </Card>
  ) : null;

  const projectsCard = (
    <Card style={styles.card}>
      <View style={styles.cardHead}>
        <Text style={styles.cardTitle}>
          {c.projects} <Text style={styles.count}>{projects.length}</Text>
        </Text>
        <Pressable onPress={() => router.push('/(app)/chantiers')}>
          <Text style={styles.link}>{c.seeAll}</Text>
        </Pressable>
      </View>
      {projects.length === 0 ? (
        <Text style={styles.muted}>{c.noProjects}</Text>
      ) : (
        <View>
          {[...projects].sort((a, b) => Number(favIds.has(b.id)) - Number(favIds.has(a.id))).slice(0, 6).map((p) => {
            const onSite = [...(onSiteByProject[p.id] ?? [])].map((id) => memberName[id]).filter(Boolean);
            const open = openTasksByProject[p.id] ?? 0;
            return (
              <Pressable key={p.id} onPress={() => router.push(`/(app)/chantiers/${p.id}` as any)} style={styles.projectRow}>
                <Pressable onPress={() => toggleFavorite(p)} hitSlop={8} style={styles.projectIcon} accessibilityLabel={favIds.has(p.id) ? t('explorer.unfavorite') : t('explorer.favorite')}>
                  <FontAwesome name={favIds.has(p.id) ? 'star' : 'star-o'} size={15} color={favIds.has(p.id) ? '#E0A100' : colors.primary} />
                </Pressable>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={styles.projectName} numberOfLines={1}>
                    {p.reference ? <Text style={styles.favRef}>{p.reference}  </Text> : null}
                    {p.name}
                  </Text>
                  <Text style={styles.projectMeta} numberOfLines={1}>
                    {[p.client_name, p.address].filter(Boolean).join(' · ') || ' '}
                  </Text>
                  <View style={styles.projectTags}>
                    {planningEnabled ? (
                      <Text style={[styles.tag, onSite.length ? styles.tagOn : null]} numberOfLines={1}>
                        <Feather name="users" size={11} /> {onSite.length ? `${c.onSiteToday} : ${onSite.join(', ')}` : c.nobodyToday}
                      </Text>
                    ) : null}
                    {open ? (
                      <Text style={styles.tag}>
                        <Feather name="check-square" size={11} /> {c.openTasks.replace('{{n}}', String(open))}
                      </Text>
                    ) : null}
                  </View>
                </View>
                <Feather name="chevron-right" size={18} color={colors.textMuted} />
              </Pressable>
            );
          })}
        </View>
      )}
    </Card>
  );

  const teamCard =
    planningEnabled && members.length > 1 ? (
      <Card style={styles.card}>
        <View style={styles.cardHead}>
          <Text style={styles.cardTitle}>{c.team}</Text>
          {isAdmin ? (
            <Pressable onPress={() => router.push('/(app)/compte/equipe')}>
              <Text style={styles.link}>{t('common.manage')}</Text>
            </Pressable>
          ) : null}
        </View>
        {members.map((m) => {
          const day = todayByMember[m.user_id] ?? [];
          const label = day.length
            ? day
                .map((e) => {
                  const time = hhmm(e.start_time);
                  const what = e.masked ? c.privateEvent : e.title || (e.project_id ? e.project_name : c.noProject);
                  return time ? `${time} ${what}` : what;
                })
                .join(' · ')
            : c.available;
          return (
            <View key={m.id} style={styles.memberRow}>
              <View style={[styles.presenceDot, isOnline(m.last_seen_at) && styles.presenceDotOnline]} />
              <Text style={styles.memberName} numberOfLines={1}>
                {m.full_name || t('common.member')}
              </Text>
              <Text style={[styles.memberDay, !day.length && { color: colors.textMuted }]} numberOfLines={1}>
                {label}
              </Text>
            </View>
          );
        })}
      </Card>
    ) : null;

  return (
    <AppScreen>
      <ScrollView contentContainerStyle={[styles.container, wide && styles.containerWide]} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View style={styles.header}>
          <View style={{ flex: 1, minWidth: 220 }}>
            <Text style={styles.hello}>{firstName ? t('dashboard.helloName', { name: firstName }) : t('dashboard.hello')}</Text>
            <Text style={styles.date}>{formatDateLong(new Date(), lang)}</Text>
            <Text style={styles.org}>{organization?.name}</Text>
          </View>
          {weatherInfo && weather ? (
            <View style={styles.weather}>
              <Feather name={weatherInfo.icon} size={20} color={colors.primary} />
              <Text style={styles.weatherTemp}>{Math.round(weather.temperatureC)}°</Text>
              <Text style={styles.weatherLabel} numberOfLines={1}>
                {weatherInfo.label}
              </Text>
            </View>
          ) : null}
        </View>

        {organization?.plan_id === 'decouverte' ? (
          <Pressable onPress={() => isAdmin && router.push('/(app)/compte/facturation')} style={styles.trialBanner}>
            <Feather name="clock" size={16} color={colors.accent} />
            <Text style={styles.trialBannerText}>
              {t('dashboard.trialBanner', { count: trialDaysLeft ?? 0 })}
              {isAdmin ? t('dashboard.trialBannerAdminSuffix') : ''}
            </Text>
            {isAdmin ? <Feather name="chevron-right" size={16} color={colors.accent} /> : null}
          </Pressable>
        ) : null}

        <FeatureHint id="dashboard-welcome" icon="compass" title={t('dashboard.welcomeTitle')} text={t('dashboard.welcomeText')} />

        <View style={styles.quickRow}>
          <Button title={c.newProject} icon="plus" onPress={() => router.push('/(app)/chantiers/new')} style={{ flexGrow: 1 }} />
          {planningEnabled ? <Button title={c.create} icon="calendar" variant="secondary" onPress={() => router.push('/(app)/planning' as any)} style={{ flexGrow: 1 }} /> : null}
          {devisVisible ? <Button title={c.newDevis} icon="file-plus" variant="secondary" onPress={() => router.push('/(app)/devis/new')} style={{ flexGrow: 1 }} /> : null}
        </View>

        {favoritesCard}

        {wide ? (
          <View style={styles.columns}>
            <View style={styles.col}>
              {planningCard}
              {tasksCard}
            </View>
            <View style={styles.col}>
              {projectsCard}
              {teamCard}
            </View>
          </View>
        ) : (
          <View style={styles.col}>
            {planningCard}
            {tasksCard}
            {projectsCard}
            {teamCard}
          </View>
        )}
      </ScrollView>
    </AppScreen>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipOn]}>
      <Text style={[styles.chipText, active && styles.chipTextOn]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, paddingBottom: spacing.xxl * 2, maxWidth: 720, width: '100%', alignSelf: 'center', gap: spacing.lg },
  containerWide: { maxWidth: 1180 },
  header: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: spacing.md },
  hello: { fontSize: fontSize.md, color: colors.textMuted },
  date: { ...monoType, fontSize: 11, letterSpacing: 0.6, color: colors.primary, marginTop: 2, textTransform: 'uppercase' },
  org: { ...displayType, fontSize: fontSize.xxl, fontWeight: '800', color: colors.text },
  weather: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  weatherTemp: { fontSize: fontSize.lg, fontWeight: '800', color: colors.text, fontVariant: ['tabular-nums'] },
  weatherLabel: { fontSize: fontSize.xs, color: colors.textMuted, maxWidth: 140 },
  trialBanner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.accentSoft, borderRadius: radius.md, padding: spacing.md },
  trialBannerText: { flex: 1, fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  columns: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.lg },
  col: { flex: 1, gap: spacing.lg },
  card: { gap: spacing.xs },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, marginBottom: spacing.sm },
  cardTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  count: { ...monoType, fontSize: 12, color: colors.textMuted, fontWeight: '400' },
  link: { fontSize: fontSize.sm, fontWeight: '600', color: colors.primary },
  muted: { fontSize: fontSize.sm, color: colors.textMuted },
  error: { fontSize: fontSize.xs, color: colors.danger, marginTop: spacing.xs },
  segment: { flexDirection: 'row', backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: 2 },
  segmentItem: { paddingHorizontal: spacing.sm, paddingVertical: 5, borderRadius: radius.sm },
  segmentOn: { backgroundColor: colors.surface },
  segmentText: { fontSize: fontSize.xs, fontWeight: '600', color: colors.textMuted },
  segmentTextOn: { color: colors.text },
  emptyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, paddingVertical: spacing.sm },
  inlineAction: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  eventList: { gap: 2 },
  eventRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  eventTime: { width: 92 },
  eventDay: { fontSize: fontSize.xs, fontWeight: '700', color: colors.text },
  eventHour: { ...monoType, fontSize: 11, color: colors.textMuted },
  eventBar: { width: 3, alignSelf: 'stretch', borderRadius: 2, backgroundColor: colors.primary },
  eventTitle: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
  eventMeta: { fontSize: fontSize.xs, color: colors.textMuted },
  taskAddRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  taskInput: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 9, fontSize: fontSize.sm, color: colors.text, backgroundColor: colors.bg },
  taskAddButton: { width: 36, height: 36, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  chipRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: spacing.xs },
  chipRowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chipLabel: { fontSize: fontSize.xs, color: colors.textMuted, marginRight: 2 },
  chip: { paddingHorizontal: spacing.sm, paddingVertical: 5, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, maxWidth: 180 },
  chipOn: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  chipText: { fontSize: fontSize.xs, fontWeight: '600', color: colors.text },
  chipTextOn: { color: colors.primaryDark },
  categoryChip: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.pill },
  categoryChipText: { fontSize: fontSize.xs, fontWeight: '600' },
  groupHead: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4 },
  groupTitle: { flex: 1, fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  groupCount: { ...monoType, fontSize: 11, color: colors.textMuted },
  taskRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 7, paddingLeft: 2, borderTopWidth: 1, borderTopColor: colors.border },
  taskCheckbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surface },
  taskTitle: { fontSize: fontSize.sm, color: colors.text },
  taskMeta: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 1 },
  categoryDot: { width: 7, height: 7, borderRadius: 4 },
  moreText: { fontSize: fontSize.xs, color: colors.textMuted, paddingTop: 4, paddingLeft: 28 },
  favGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.xs },
  favTile: { flexGrow: 1, flexBasis: 220, maxWidth: 360, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  favRef: { fontSize: fontSize.xs, fontWeight: '800', color: colors.primary, fontVariant: ['tabular-nums'] },
  projectRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  projectIcon: { width: 32, height: 32, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  projectName: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  projectMeta: { fontSize: fontSize.xs, color: colors.textMuted },
  projectTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2 },
  tag: { fontSize: 11, color: colors.textMuted, backgroundColor: colors.surfaceAlt, paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.sm, overflow: 'hidden', maxWidth: '100%' },
  tagOn: { color: colors.success, backgroundColor: colors.successSoft },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 7, borderTopWidth: 1, borderTopColor: colors.border },
  presenceDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  presenceDotOnline: { backgroundColor: colors.success },
  memberName: { width: 130, fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
  memberDay: { flex: 1, fontSize: fontSize.xs, color: colors.text, textAlign: 'right' },
});
