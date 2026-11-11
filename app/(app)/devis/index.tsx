import { useCallback, useMemo, useState } from 'react';
import { ScrollView, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { devisSubtotals } from '../../../lib/api/subtotals';
import { supabase } from '../../../lib/supabase';
import { confirm } from '../../../lib/confirm';
import { getBexioSyncDirectionsByLocalId, type BexioSyncDirection } from '../../../lib/api/integrations';
import { Card, EmptyState, HeaderAction, LoadingScreen, PageHeader, AppScreen, StatusBadge } from '../../../components/ui';
import { RowActionMenu } from '../../../components/RowActionMenu';
import { PageSettings } from '../../../components/PageSettings';
import { formatDate, useTranslation } from '../../../lib/translations';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import type { Devis } from '../../../lib/types';
import { formatChf as fmtChf } from '../../../lib/tenders/numbers';

// Every route under app/(app)/devis is already gated behind canManageDevis
// at the layout level (see devis/_layout.tsx) — a member without access to
// this module never reaches this screen, so the amounts shown below need no
// extra permission check of their own.

function isAcceptedThisMonth(d: Devis): boolean {
  if (d.status !== 'accepted' || !d.client_signed_at) return false;
  const now = new Date();
  const signedAt = new Date(d.client_signed_at);
  return signedAt.getFullYear() === now.getFullYear() && signedAt.getMonth() === now.getMonth();
}

const TONE_COLORS: Record<string, { fg: string; bg: string }> = {
  danger: { fg: colors.danger, bg: colors.dangerSoft },
  primary: { fg: colors.primary, bg: colors.primarySoft },
  success: { fg: colors.success, bg: colors.successSoft },
  muted: { fg: colors.textMuted, bg: colors.surfaceAlt },
};

function KpiTile({
  label,
  amount,
  count,
  tone,
  icon,
  hideAmount,
}: {
  label: string;
  amount?: number;
  count?: number;
  tone: keyof typeof TONE_COLORS;
  icon: React.ComponentProps<typeof Feather>['name'];
  hideAmount?: boolean;
}) {
  const { t: translate } = useTranslation();
  const tone_ = TONE_COLORS[tone];
  return (
    <View style={styles.kpiTile}>
      <View style={styles.kpiHead}>
        <View style={[styles.kpiIcon, { backgroundColor: tone_.bg }]}>
          <Feather name={icon} size={12} color={tone_.fg} />
        </View>
        <Text style={styles.kpiLabel} numberOfLines={1}>{label}</Text>
      </View>
      {!hideAmount ? <Text style={styles.kpiAmount}>CHF {fmtChf((amount ?? 0))}</Text> : null}
      {count !== undefined ? (
        <Text style={styles.kpiCount}>
          {translate('devisList.countSuffix', { count })}
        </Text>
      ) : null}
    </View>
  );
}

// A tree, not a flat list: devis without a chantier float loose at the top
// level, chantiers that do have devis appear as folders you tap into. This
// mirrors how the org actually thinks about its documents (by chantier)
// instead of one long undifferentiated feed.
// Last list per organization, kept while the app is open (see load()).
const devisCache = new Map<string, { list: any[]; totals: Record<string, number>; projects: { id: string; name: string }[] }>();

export default function DevisListScreen() {
  const { t } = useTranslation();
  const { organization, role } = useAuth();
  const router = useRouter();
  const [devisList, setDevisList] = useState<Devis[]>([]);
  const [totals, setTotals] = useState<Record<string, number>>({});
  const [bexioDirections, setBexioDirections] = useState<Map<string, BexioSyncDirection>>(new Map());
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [openProjectId, setOpenProjectId] = useState<string | null>(null);
  // Same tools as the Factures list: a search and a status filter. While
  // either is set the list is flat (every match, with its chantier shown on
  // the row) instead of the chantier folders.
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | Devis['status']>('all');
  const isAdmin = role === 'owner' || role === 'admin';

  const load = useCallback(async () => {
    if (!organization) return;
    // Back on the tab: last list at once, refreshed quietly.
    const cached = devisCache.get(organization.id);
    if (cached) {
      setDevisList(cached.list);
      setTotals(cached.totals);
      setProjects(cached.projects);
      setLoading(false);
    }
    const [{ data: d }, { data: p }, directions] = await Promise.all([
      supabase.from('devis').select('*').eq('organization_id', organization.id).order('created_at', { ascending: false }),
      supabase.from('projects').select('id, name').eq('organization_id', organization.id),
      getBexioSyncDirectionsByLocalId(organization.id, 'devis'),
    ]);
    const list = d ?? [];
    const subtotals = await devisSubtotals(list.map((item) => item.id));
    const withVat: Record<string, number> = {};
    for (const item of list) withVat[item.id] = (subtotals[item.id] ?? 0) * (1 + Number(item.vat_rate) / 100);
    setDevisList(list);
    setProjects(p ?? []);
    setBexioDirections(directions);
    setTotals(withVat);
    devisCache.set(organization.id, { list, totals: withVat, projects: p ?? [] });
    setLoading(false);
  }, [organization]);

  const kpis = useMemo(() => {
    let sentSum = 0;
    let sentCount = 0;
    let acceptedSum = 0;
    let refusedCount = 0;
    let draftCount = 0;
    for (const d of devisList) {
      const amount = totals[d.id] ?? 0;
      if (d.status === 'sent') {
        sentSum += amount;
        sentCount += 1;
      }
      if (isAcceptedThisMonth(d)) acceptedSum += amount;
      if (d.status === 'refused') refusedCount += 1;
      if (d.status === 'draft') draftCount += 1;
    }
    return { sentSum, sentCount, acceptedSum, refusedCount, draftCount };
  }, [devisList, totals]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const unassigned = useMemo(() => devisList.filter((d) => !d.project_id), [devisList]);
  const folders = useMemo(() => {
    const counts = new Map<string, number>();
    for (const d of devisList) {
      if (!d.project_id) continue;
      counts.set(d.project_id, (counts.get(d.project_id) ?? 0) + 1);
    }
    return projects
      .filter((p) => counts.has(p.id))
      .map((p) => ({ id: p.id, name: p.name, count: counts.get(p.id) ?? 0 }))
      .sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  }, [devisList, projects]);

  const projectNames = useMemo(() => Object.fromEntries(projects.map((p) => [p.id, p.name])) as Record<string, string>, [projects]);
  const filtering = search.trim().length > 0 || filter !== 'all';
  const filtered = useMemo(() => {
    if (!filtering) return [];
    const q = search.trim().toLowerCase();
    return devisList.filter((d) => {
      if (filter !== 'all' && d.status !== filter) return false;
      if (!q) return true;
      const hay = [d.number, d.client_name, d.project_id ? projectNames[d.project_id] : ''].join(' ').toLowerCase();
      return hay.includes(q);
    });
  }, [devisList, filter, search, filtering, projectNames]);
  const statusFilters: { key: 'all' | Devis['status']; label: string; count: number }[] = [
    { key: 'all', label: t('appActions.filterAll'), count: devisList.length },
    { key: 'draft', label: t('appActions.filterDraft'), count: devisList.filter((d) => d.status === 'draft').length },
    { key: 'ready', label: t('appActions.filterReady'), count: devisList.filter((d) => d.status === 'ready').length },
    { key: 'sent', label: t('appActions.filterSent'), count: devisList.filter((d) => d.status === 'sent').length },
    { key: 'accepted', label: t('appActions.filterAccepted'), count: devisList.filter((d) => d.status === 'accepted').length },
    { key: 'refused', label: t('appActions.filterRefused'), count: devisList.filter((d) => d.status === 'refused').length },
  ];

  const openProject = openProjectId ? projects.find((p) => p.id === openProjectId) ?? null : null;
  const openProjectDevis = useMemo(
    () => (openProjectId ? devisList.filter((d) => d.project_id === openProjectId) : []),
    [devisList, openProjectId],
  );

  function handleDuplicate(id: string) {
    router.push(`/(app)/devis/new?duplicateFromId=${id}`);
  }

  async function handleDelete(item: Devis) {
    const ok = await confirm(t('devisList.deleteConfirmTitle'), t('devisList.deleteConfirmBody', { number: item.number ?? '', client: item.client_name }));
    if (!ok) return;
    setActionError(null);
    const { error } = await supabase.from('devis').delete().eq('id', item.id);
    if (error) {
      setActionError(error.message);
      return;
    }
    load();
  }

  function DevisRow({ item }: { item: Devis }) {
    const bexioDirection = bexioDirections.get(item.id);
    return (
      <View style={styles.cardWrap}>
        <Pressable onPress={() => router.push(`/(app)/devis/${item.id}`)}>
          <Card style={styles.card}>
            <View style={styles.cardBody}>
              <View style={styles.row}>
                <View style={styles.numberGroup}>
                  <Text style={styles.number}>{item.number}</Text>
                  {bexioDirection ? (
                    <View style={styles.bexioTag}>
                      <Feather name={bexioDirection === 'pull' ? 'download' : 'upload'} size={10} color={colors.success} />
                    </View>
                  ) : null}
                </View>
                <StatusBadge status={item.status} />
              </View>
              <Text style={styles.client}>{item.client_name}</Text>
              {!openProject && item.project_id && projectNames[item.project_id] ? (
                <View style={styles.projectRow}>
                  <Feather name="layers" size={11} color={colors.textMuted} />
                  <Text style={styles.projectText}>{projectNames[item.project_id]}</Text>
                </View>
              ) : null}
              <View style={styles.metaRow}>
                <Text style={styles.meta}>{formatDate(item.created_at)}</Text>
                <Text style={styles.amount}>CHF {fmtChf(totals[item.id] ?? 0)}</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={18} color={colors.textMuted} />
          </Card>
        </Pressable>
        <View style={styles.cardMenu}>
          <RowActionMenu
            actions={[
              { key: 'duplicate', icon: 'copy', label: t('devisList.duplicate'), onPress: () => handleDuplicate(item.id) },
              ...(isAdmin
                ? [{ key: 'delete', icon: 'trash-2' as const, label: t('devisList.delete'), danger: true, onPress: () => handleDelete(item) }]
                : []),
            ]}
          />
        </View>
      </View>
    );
  }

  return (
    <AppScreen style={{ padding: spacing.xl }}>
      <View style={styles.container}>
        {openProject ? (
          <>
            <Pressable onPress={() => setOpenProjectId(null)} style={styles.backRow} hitSlop={8}>
              <Feather name="arrow-left" size={16} color={colors.textMuted} />
              <Text style={styles.backText}>{t('devisList.allDevis')}</Text>
            </Pressable>
            <PageHeader title={openProject.name} />
          </>
        ) : (
          <PageHeader
            title={t('devisList.title')}
            subtitle={t('devisList.subtitle')}
            backTo="/(app)"
            right={
              <>
                <PageSettings page="devis" />
                <HeaderAction title={t('appActions.newDevis')} onPress={() => router.push('/(app)/devis/new')} />
              </>
            }
          />
        )}

        {actionError ? <Text style={styles.actionError}>{actionError}</Text> : null}

        {loading ? (
          <LoadingScreen />
        ) : (
          <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl, gap: spacing.md }} showsVerticalScrollIndicator={false}>
            {!openProject ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.kpiGrid}>
                <KpiTile label={t('devisList.kpiPending')} amount={kpis.sentSum} count={kpis.sentCount} tone="primary" icon="clock" />
                <KpiTile label={t('devisList.kpiAccepted')} amount={kpis.acceptedSum} tone="success" icon="check-circle" />
                <KpiTile label={t('devisList.kpiRefused')} count={kpis.refusedCount} tone="danger" icon="x-circle" hideAmount />
                <KpiTile label={t('devisList.kpiDraft')} count={kpis.draftCount} tone="muted" icon="file-text" hideAmount />
              </ScrollView>
            ) : null}
            {!openProject && devisList.length > 0 ? (
              <>
                <View style={styles.searchRow}>
                  <Feather name="search" size={15} color={colors.textMuted} />
                  <TextInput
                    value={search}
                    onChangeText={setSearch}
                    placeholder={t('appActions.searchDevis')}
                    placeholderTextColor={colors.textMuted}
                    style={styles.searchInput}
                    autoCapitalize="none"
                  />
                  {search ? (
                    <Pressable onPress={() => setSearch('')} hitSlop={8}>
                      <Feather name="x" size={15} color={colors.textMuted} />
                    </Pressable>
                  ) : null}
                </View>
                <View style={styles.filterRow}>
                  {statusFilters.map((f) => (
                    <Pressable key={f.key} onPress={() => setFilter(f.key)} style={[styles.filterChip, filter === f.key && styles.filterChipActive]}>
                      <Text style={[styles.filterChipText, filter === f.key && styles.filterChipTextActive]}>
                        {f.label} · {f.count}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </>
            ) : null}
            {!openProject && filtering ? (
              filtered.length === 0 ? (
                <EmptyState title={t('appActions.noMatch')} />
              ) : (
                filtered.map((item) => <DevisRow key={item.id} item={item} />)
              )
            ) : openProject ? (
              openProjectDevis.length === 0 ? (
                <EmptyState title={t('devisList.emptyTitle')} subtitle={t('devisList.emptyProjectSubtitle')} />
              ) : (
                openProjectDevis.map((item) => <DevisRow key={item.id} item={item} />)
              )
            ) : devisList.length === 0 ? (
              <EmptyState title={t('devisList.emptyTitle')} subtitle={t('devisList.emptySubtitle')} />
            ) : (
              <>
                {unassigned.length > 0 ? (
                  <View style={{ gap: spacing.md }}>
                    <Text style={styles.sectionTitle}>{t('devisList.unassigned')}</Text>
                    {unassigned.map((item) => (
                      <DevisRow key={item.id} item={item} />
                    ))}
                  </View>
                ) : null}
                {folders.length > 0 ? (
                  <View style={{ gap: spacing.sm }}>
                    <Text style={styles.sectionTitle}>{t('devisList.projects')}</Text>
                    {folders.map((f) => (
                      <Pressable key={f.id} onPress={() => setOpenProjectId(f.id)}>
                        <Card style={styles.folderCard}>
                          <View style={styles.folderIcon}>
                            <Feather name="folder" size={18} color={colors.primary} />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.folderName}>{f.name}</Text>
                            <Text style={styles.folderCount}>{t('devisList.countSuffix', { count: f.count })}</Text>
                          </View>
                          <Feather name="chevron-right" size={18} color={colors.textMuted} />
                        </Card>
                      </Pressable>
                    ))}
                  </View>
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
  container: {
    flex: 1,
    maxWidth: 1080,
    width: '100%',
    alignSelf: 'center',
  },
  pageSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  backText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: '600',
  },
  actionError: {
    fontSize: fontSize.xs,
    color: colors.danger,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  kpiGrid: { flexGrow: 1, gap: spacing.sm },
  kpiTile: {
    minWidth: 150,
    flexGrow: 1,
    flexBasis: 0,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: 2,
  },
  kpiHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  kpiIcon: { width: 20, height: 20, borderRadius: 5, alignItems: 'center', justifyContent: 'center' },
  kpiLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textMuted,
  },
  kpiAmount: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  kpiCount: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  cardWrap: {
    position: 'relative',
  },
  cardMenu: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingRight: spacing.xxl,
  },
  cardBody: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  numberGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  number: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  bexioTag: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.successSoft,
  },
  client: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  meta: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
  },
  searchInput: { flex: 1, fontSize: fontSize.sm, color: colors.text },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  filterChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterChipActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  filterChipText: { fontSize: fontSize.xs, fontWeight: '600', color: colors.textMuted },
  filterChipTextActive: { color: colors.primary },
  projectRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  projectText: { fontSize: fontSize.xs, color: colors.textMuted },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
  amount: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text, fontVariant: ['tabular-nums'] },
  folderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  folderIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  folderName: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  folderCount: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
});
