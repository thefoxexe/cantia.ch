import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../lib/auth-context';
import { supabase } from '../../lib/supabase';
import { isModuleEnabled } from '../../lib/modules';
import { isOnline } from '../../lib/presence';
import { addressQueryFor, describeWeatherCode, fetchWeatherFor, type WeatherNow } from '../../lib/weather';
import { Button, Card, EmptyState, Screen, StatusBadge } from '../../components/ui';
import { FeatureHint } from '../../components/FeatureHint';
import { colors, fontSize, radius, spacing } from '../../lib/theme';
import type { DashboardTask, DashboardTaskCategory, Devis, Facture, OrganizationMember, Project } from '../../lib/types';

type IconName = keyof typeof Feather.glyphMap;

const STATUS_LABELS: Record<string, string> = {
  active: 'Actif',
  completed: 'Terminé',
  archived: 'Archivé',
};

const WEATHER_REFRESH_MS = 20 * 60 * 1000;

const CATEGORY_META: Record<DashboardTaskCategory, { label: string; fg: string; bg: string }> = {
  general: { label: 'Général', fg: colors.textMuted, bg: colors.surfaceAlt },
  administratif: { label: 'Administratif', fg: colors.primary, bg: colors.primarySoft },
  chantier: { label: 'Chantier', fg: colors.accent, bg: colors.accentSoft },
  client: { label: 'Client', fg: colors.success, bg: colors.successSoft },
  urgent: { label: 'Urgent', fg: colors.danger, bg: colors.dangerSoft },
};

const CATEGORY_ORDER: DashboardTaskCategory[] = ['general', 'urgent', 'chantier', 'client', 'administratif'];

function formatDateFr(date: Date): string {
  const label = date.toLocaleDateString('fr-CH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('fr-CH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function DashboardScreen() {
  const { organization, user, canViewFinances, role, permissions } = useAuth();
  const router = useRouter();
  const isAdmin = role === 'owner' || role === 'admin';
  const trialDaysLeft = organization?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(organization.trial_ends_at).getTime() - Date.now()) / 86400000))
    : null;
  const devisEnabled = isModuleEnabled(organization?.enabled_modules, 'devis');
  const financeVisible = devisEnabled && canViewFinances;
  const planningEnabled = isModuleEnabled(organization?.enabled_modules, 'planning') && permissions.planning;
  const payrollEnabled = isModuleEnabled(organization?.enabled_modules, 'payroll');
  const fullName = (user?.user_metadata?.full_name as string | undefined) || null;
  const firstName = fullName?.trim().split(' ')[0] || null;

  const [now, setNow] = useState(new Date());
  const [weather, setWeather] = useState<WeatherNow | null>(null);
  const [activeProjects, setActiveProjects] = useState(0);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [recentDevis, setRecentDevis] = useState<Devis[]>([]);
  const [devisAmounts, setDevisAmounts] = useState<Record<string, number>>({});
  const [recentFactures, setRecentFactures] = useState<Facture[]>([]);
  const [factureAmounts, setFactureAmounts] = useState<Record<string, number>>({});
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [tasks, setTasks] = useState<DashboardTask[]>([]);
  const [openTaskCount, setOpenTaskCount] = useState(0);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<DashboardTaskCategory>('general');
  const [taskError, setTaskError] = useState<string | null>(null);

  // The clock ticks locally once fetched — no need to re-render every second
  // from a network call, only the calendar day/hour itself needs to advance.
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!organization) return;
    const query = addressQueryFor(organization);
    if (!query) {
      setWeather(null);
      return;
    }
    let cancelled = false;
    function load() {
      fetchWeatherFor(query!).then((result) => {
        if (!cancelled) setWeather(result);
      });
    }
    load();
    const id = setInterval(load, WEATHER_REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [organization?.id, organization?.postal_code, organization?.locality, organization?.address]);

  const load = useCallback(async () => {
    if (!organization) return;

    const [{ count: projects }, { data: recentProj }, { data: team }, { data: devisList }, { data: openTasks }] = await Promise.all([
      supabase.from('projects').select('id', { count: 'exact', head: true }).eq('organization_id', organization.id).eq('status', 'active'),
      supabase.from('projects').select('*').eq('organization_id', organization.id).order('updated_at', { ascending: false }).limit(4),
      supabase.from('organization_members').select('*').eq('organization_id', organization.id),
      financeVisible
        ? supabase.from('devis').select('*').eq('organization_id', organization.id).order('created_at', { ascending: false }).limit(3)
        : Promise.resolve({ data: [] as Devis[] }),
      supabase
        .from('dashboard_tasks')
        .select('*')
        .eq('organization_id', organization.id)
        .eq('done', false)
        .order('created_at', { ascending: false }),
    ]);

    setActiveProjects(projects ?? 0);
    setRecentProjects(recentProj ?? []);
    setMembers(team ?? []);
    setRecentDevis(devisList ?? []);
    const openList = (openTasks ?? []) as DashboardTask[];
    setOpenTaskCount(openList.length);
    setTasks(openList.slice(0, 5));

    if (devisList?.length) {
      const { data: items } = await supabase.from('devis_items').select('devis_id, quantity, unit_price').in('devis_id', devisList.map((d) => d.id));
      const totals: Record<string, number> = {};
      for (const it of items ?? []) {
        totals[it.devis_id] = (totals[it.devis_id] ?? 0) + Number(it.quantity) * Number(it.unit_price);
      }
      setDevisAmounts(totals);
    }

    if (!financeVisible) return;

    const { data: allFactures } = await supabase.from('factures').select('*').eq('organization_id', organization.id).order('created_at', { ascending: false });
    const list = allFactures ?? [];
    setRecentFactures(list.slice(0, 3));

    if (list.length) {
      const { data: items } = await supabase.from('facture_items').select('facture_id, quantity, unit_price').in('facture_id', list.map((f) => f.id));
      const subtotals: Record<string, number> = {};
      for (const it of items ?? []) {
        subtotals[it.facture_id] = (subtotals[it.facture_id] ?? 0) + Number(it.quantity) * Number(it.unit_price);
      }
      const withVat: Record<string, number> = {};
      for (const f of list) {
        withVat[f.id] = (subtotals[f.id] ?? 0) * (1 + Number(f.vat_rate) / 100);
      }
      setFactureAmounts(withVat);
    }
  }, [organization, financeVisible]);

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
    const { data, error } = await supabase
      .from('dashboard_tasks')
      .insert({ organization_id: organization.id, title, category: newTaskCategory, created_by: user?.id ?? null })
      .select('*')
      .single();
    if (error) {
      setTaskError(error.message);
      return;
    }
    setNewTaskTitle('');
    setTasks((prev) => [data as DashboardTask, ...prev].slice(0, 5));
    setOpenTaskCount((n) => n + 1);
  }

  async function handleToggleTask(task: DashboardTask) {
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    setOpenTaskCount((n) => Math.max(0, n - 1));
    const { error } = await supabase.from('dashboard_tasks').update({ done: true, done_at: new Date().toISOString() }).eq('id', task.id);
    if (error) {
      setTaskError(error.message);
      load();
    }
  }

  const shortcuts = useMemo(() => {
    const list: { key: string; label: string; icon: IconName; href: string }[] = [
      { key: 'chantiers', label: 'Chantiers', icon: 'layers', href: '/(app)/chantiers' },
    ];
    if (financeVisible) {
      list.push(
        { key: 'devis', label: 'Devis', icon: 'file-text', href: '/(app)/devis' },
        { key: 'factures', label: 'Factures', icon: 'dollar-sign', href: '/(app)/devis/factures' },
        { key: 'clients', label: 'Clients', icon: 'users', href: '/(app)/clients' },
      );
    }
    if (planningEnabled) list.push({ key: 'planning', label: 'Planning', icon: 'calendar', href: '/(app)/planning' });
    if (payrollEnabled) list.push({ key: 'rh', label: 'RH & Salaires', icon: 'clock', href: '/(app)/rh' });
    if (isAdmin) list.push({ key: 'equipe', label: 'Équipe', icon: 'user-plus', href: '/(app)/compte/equipe' });
    list.push({ key: 'parametres', label: 'Paramètres', icon: 'settings', href: '/(app)/compte' });
    return list;
  }, [financeVisible, planningEnabled, payrollEnabled, isAdmin]);

  const weatherInfo = weather ? describeWeatherCode(weather.code) : null;

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.helloRow}>
          <View>
            <Text style={styles.hello}>{firstName ? `Salut ${firstName}` : 'Salut'}</Text>
            <Text style={styles.org}>{organization?.name}</Text>
          </View>
        </View>

        {organization?.plan_id === 'decouverte' ? (
          <Pressable
            onPress={() => isAdmin && router.push('/(app)/compte/facturation')}
            style={styles.trialBanner}
          >
            <Feather name="clock" size={16} color={colors.accent} />
            <Text style={styles.trialBannerText}>
              Essai Découverte — {trialDaysLeft ?? 0} jour{(trialDaysLeft ?? 0) > 1 ? 's' : ''} restant
              {(trialDaysLeft ?? 0) > 1 ? 's' : ''}, tout est débloqué.
              {isAdmin ? ' Choisissez un plan avant la fin pour tout garder.' : ''}
            </Text>
            {isAdmin ? <Feather name="chevron-right" size={16} color={colors.accent} /> : null}
          </Pressable>
        ) : null}

        <Card style={styles.timeCard}>
          <View style={styles.timeLeft}>
            <Text style={styles.dateText}>{formatDateFr(now)}</Text>
            <Text style={styles.clockText}>{formatTime(now)}</Text>
          </View>
          {weatherInfo && weather ? (
            <View style={styles.weatherRight}>
              <Feather name={weatherInfo.icon} size={26} color={colors.primary} />
              <Text style={styles.weatherTemp}>{Math.round(weather.temperatureC)}°C</Text>
              <Text style={styles.weatherLabel} numberOfLines={1}>
                {weatherInfo.label}
              </Text>
            </View>
          ) : null}
        </Card>

        <FeatureHint
          id="dashboard-welcome"
          icon="compass"
          title="Bienvenue sur Cantia"
          text="Créez un chantier, ajoutez des rapports et des documents sur le terrain, puis générez vos devis en quelques minutes."
        />

        <View style={styles.quickRow}>
          <Button title="Nouveau chantier" icon="plus" onPress={() => router.push('/(app)/chantiers/new')} style={{ flex: 1 }} />
          {financeVisible ? (
            <Button title="Nouveau devis" icon="file-plus" variant="secondary" onPress={() => router.push('/(app)/devis/new')} style={{ flex: 1 }} />
          ) : null}
        </View>

        <Text style={styles.sectionTitle}>Raccourcis</Text>
        <View style={styles.shortcutGrid}>
          {shortcuts.map((s) => (
            <Pressable key={s.key} onPress={() => router.push(s.href as any)} style={styles.shortcutTile}>
              <View style={styles.shortcutIcon}>
                <Feather name={s.icon} size={17} color={colors.primary} />
              </View>
              <Text style={styles.shortcutLabel} numberOfLines={1}>
                {s.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Tâches</Text>
          {openTaskCount > tasks.length ? (
            <Pressable onPress={() => router.push('/(app)/taches' as any)}>
              <Text style={styles.sectionLink}>Tout voir ({openTaskCount})</Text>
            </Pressable>
          ) : null}
        </View>
        <Card style={styles.tasksCard}>
          <View style={styles.taskAddRow}>
            <TextInput
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
              placeholder="Ajouter une tâche…"
              placeholderTextColor={colors.textMuted}
              style={styles.taskInput}
              onSubmitEditing={handleAddTask}
              returnKeyType="done"
            />
            <Pressable onPress={handleAddTask} style={styles.taskAddButton} hitSlop={8}>
              <Feather name="plus" size={16} color="#fff" />
            </Pressable>
          </View>
          <View style={styles.categoryRow}>
            {CATEGORY_ORDER.map((cat) => {
              const meta = CATEGORY_META[cat];
              const active = newTaskCategory === cat;
              return (
                <Pressable
                  key={cat}
                  onPress={() => setNewTaskCategory(cat)}
                  style={[styles.categoryChip, { backgroundColor: active ? meta.bg : colors.surfaceAlt }]}
                >
                  <Text style={[styles.categoryChipText, { color: active ? meta.fg : colors.textMuted }]}>{meta.label}</Text>
                </Pressable>
              );
            })}
          </View>
          {taskError ? <Text style={styles.taskError}>{taskError}</Text> : null}
          {tasks.length === 0 ? (
            <Text style={styles.tasksEmpty}>Aucune tâche en cours. Belle journée.</Text>
          ) : (
            <View style={styles.taskList}>
              {tasks.map((task) => {
                const meta = CATEGORY_META[task.category] ?? CATEGORY_META.general;
                return (
                  <View key={task.id} style={styles.taskRow}>
                    <Pressable onPress={() => handleToggleTask(task)} style={styles.taskCheckbox} hitSlop={8} />

                    <Text style={styles.taskTitle} numberOfLines={2}>
                      {task.title}
                    </Text>
                    <View style={[styles.categoryDot, { backgroundColor: meta.fg }]} />
                  </View>
                );
              })}
            </View>
          )}
        </Card>

        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Chantiers récents</Text>
          <Pressable onPress={() => router.push('/(app)/chantiers')}>
            <Text style={styles.sectionLink}>Tout voir</Text>
          </Pressable>
        </View>
        {recentProjects.length === 0 ? (
          <Card style={styles.emptyCard}>
            <EmptyState title="Aucun chantier pour l'instant" subtitle="Créez votre premier chantier pour le voir apparaître ici." />
          </Card>
        ) : (
          <View style={styles.list}>
            {recentProjects.map((p) => (
              <Pressable key={p.id} onPress={() => router.push(`/(app)/chantiers/${p.id}` as any)}>
                <Card style={styles.recentRow}>
                  <View style={styles.recentIcon}>
                    <Feather name="layers" size={16} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.recentName} numberOfLines={1}>
                      {p.name}
                    </Text>
                    <Text style={styles.recentMeta} numberOfLines={1}>
                      {[p.client_name, STATUS_LABELS[p.status] ?? p.status].filter(Boolean).join(' · ')}
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={18} color={colors.textMuted} />
                </Card>
              </Pressable>
            ))}
          </View>
        )}

        {financeVisible && recentDevis.length > 0 ? (
          <>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Devis récents</Text>
              <Pressable onPress={() => router.push('/(app)/devis')}>
                <Text style={styles.sectionLink}>Tout voir</Text>
              </Pressable>
            </View>
            <View style={styles.list}>
              {recentDevis.map((d) => (
                <Pressable key={d.id} onPress={() => router.push(`/(app)/devis/${d.id}` as any)}>
                  <Card style={styles.docRow}>
                    <View style={{ flex: 1 }}>
                      <View style={styles.docTop}>
                        <Text style={styles.docNumber}>{d.number}</Text>
                        <StatusBadge status={d.status} />
                      </View>
                      <Text style={styles.recentMeta} numberOfLines={1}>
                        {d.client_name}
                      </Text>
                    </View>
                    <Text style={styles.docAmount}>CHF {(devisAmounts[d.id] ?? 0).toFixed(2)}</Text>
                  </Card>
                </Pressable>
              ))}
            </View>
          </>
        ) : null}

        {financeVisible && recentFactures.length > 0 ? (
          <>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Factures récentes</Text>
              <Pressable onPress={() => router.push('/(app)/devis/factures')}>
                <Text style={styles.sectionLink}>Tout voir</Text>
              </Pressable>
            </View>
            <View style={styles.list}>
              {recentFactures.map((f) => (
                <Pressable key={f.id} onPress={() => router.push(`/(app)/devis/factures/${f.id}` as any)}>
                  <Card style={styles.docRow}>
                    <View style={{ flex: 1 }}>
                      <View style={styles.docTop}>
                        <Text style={styles.docNumber}>{f.number}</Text>
                        <StatusBadge status={f.status} />
                      </View>
                      <Text style={styles.recentMeta} numberOfLines={1}>
                        {f.client_name}
                      </Text>
                    </View>
                    <Text style={styles.docAmount}>CHF {(factureAmounts[f.id] ?? 0).toFixed(2)}</Text>
                  </Card>
                </Pressable>
              ))}
            </View>
          </>
        ) : null}

        {members.length > 1 ? (
          <>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Équipe</Text>
              <Pressable onPress={() => router.push('/(app)/compte/equipe')}>
                <Text style={styles.sectionLink}>Gérer</Text>
              </Pressable>
            </View>
            <Card style={styles.teamCard}>
              <Text style={styles.teamCount}>
                {members.filter((m) => isOnline(m.last_seen_at)).length} en ligne sur {members.length}
              </Text>
              <View style={styles.teamList}>
                {members.map((m) => (
                  <View key={m.id} style={styles.teamRow}>
                    <View style={[styles.presenceDot, isOnline(m.last_seen_at) && styles.presenceDotOnline]} />
                    <Text style={styles.teamName} numberOfLines={1}>
                      {m.full_name || 'Membre'}
                    </Text>
                  </View>
                ))}
              </View>
            </Card>
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl * 2,
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  helloRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  trialBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accentSoft,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  trialBannerText: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  hello: {
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
  org: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
  },
  timeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  timeLeft: {
    gap: 2,
  },
  dateText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textMuted,
  },
  clockText: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  weatherRight: {
    alignItems: 'center',
    gap: 2,
    minWidth: 90,
  },
  weatherTemp: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  weatherLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  quickRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionLink: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.primary,
  },
  shortcutGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  shortcutTile: {
    flexGrow: 1,
    flexBasis: 100,
    maxWidth: 140,
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
  },
  shortcutIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  tasksCard: {
    gap: spacing.sm,
  },
  taskAddRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  taskInput: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
  },
  taskAddButton: {
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
  taskError: {
    fontSize: fontSize.xs,
    color: colors.danger,
  },
  tasksEmpty: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    paddingVertical: spacing.sm,
  },
  taskList: {
    gap: spacing.sm,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  taskCheckbox: {
    width: 20,
    height: 20,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskTitle: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptyCard: {
    paddingVertical: spacing.sm,
  },
  list: {
    gap: spacing.sm,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  recentIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  recentName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  recentMeta: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  docTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 2,
  },
  docNumber: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  docAmount: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  teamCard: {
    gap: spacing.md,
  },
  teamCount: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textMuted,
  },
  teamList: {
    gap: spacing.sm,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  presenceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  presenceDotOnline: {
    backgroundColor: colors.success,
  },
  teamName: {
    fontSize: fontSize.sm,
    color: colors.text,
  },
});
