import { useCallback, useMemo, useState } from 'react';
import { ScrollView, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import { duplicateDevis } from '../../../lib/api/devis';
import { confirm } from '../../../lib/confirm';
import { Button, Card, EmptyState, LoadingScreen, PageHeader, Screen, StatusBadge } from '../../../components/ui';
import { RowActionMenu } from '../../../components/RowActionMenu';
import { formatDate, useTranslation } from '../../../lib/translations';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import type { Devis } from '../../../lib/types';

// Every route under app/(app)/devis is already gated behind canViewFinances
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
      <View style={[styles.kpiIcon, { backgroundColor: tone_.bg }]}>
        <Feather name={icon} size={14} color={tone_.fg} />
      </View>
      <Text style={styles.kpiLabel}>{label}</Text>
      {!hideAmount ? <Text style={styles.kpiAmount}>CHF {(amount ?? 0).toFixed(2)}</Text> : null}
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
export default function DevisListScreen() {
  const { t } = useTranslation();
  const { organization, role } = useAuth();
  const router = useRouter();
  const [devisList, setDevisList] = useState<Devis[]>([]);
  const [totals, setTotals] = useState<Record<string, number>>({});
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [openProjectId, setOpenProjectId] = useState<string | null>(null);
  const isAdmin = role === 'owner' || role === 'admin';

  const load = useCallback(async () => {
    if (!organization) return;
    setLoading(true);
    const [{ data: d }, { data: p }] = await Promise.all([
      supabase.from('devis').select('*').eq('organization_id', organization.id).order('created_at', { ascending: false }),
      supabase.from('projects').select('id, name').eq('organization_id', organization.id),
    ]);
    const list = d ?? [];
    setDevisList(list);
    setProjects(p ?? []);

    const ids = list.map((item) => item.id);
    if (ids.length) {
      const { data: itemsData } = await supabase.from('devis_items').select('devis_id, quantity, unit_price').in('devis_id', ids);
      const byDevis: Record<string, number> = {};
      for (const it of itemsData ?? []) {
        byDevis[it.devis_id] = (byDevis[it.devis_id] ?? 0) + Number(it.quantity) * Number(it.unit_price);
      }
      const withVat: Record<string, number> = {};
      for (const item of list) {
        withVat[item.id] = (byDevis[item.id] ?? 0) * (1 + Number(item.vat_rate) / 100);
      }
      setTotals(withVat);
    } else {
      setTotals({});
    }
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

  const openProject = openProjectId ? projects.find((p) => p.id === openProjectId) ?? null : null;
  const openProjectDevis = useMemo(
    () => (openProjectId ? devisList.filter((d) => d.project_id === openProjectId) : []),
    [devisList, openProjectId],
  );

  async function handleDuplicate(id: string) {
    setActionError(null);
    const { id: newId, error } = await duplicateDevis(id);
    if (error) {
      setActionError(error);
      return;
    }
    if (newId) router.push(`/(app)/devis/${newId}`);
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
    return (
      <View style={styles.cardWrap}>
        <Pressable onPress={() => router.push(`/(app)/devis/${item.id}`)}>
          <Card style={styles.card}>
            <View style={styles.cardBody}>
              <View style={styles.row}>
                <Text style={styles.number}>{item.number}</Text>
                <StatusBadge status={item.status} />
              </View>
              <Text style={styles.client}>{item.client_name}</Text>
              <Text style={styles.meta}>{formatDate(item.created_at)}</Text>
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
    <Screen style={{ padding: spacing.xl }}>
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
            backTo="/(app)"
            right={
              isAdmin ? (
                <Pressable onPress={() => router.push('/(app)/compte/devis')} hitSlop={8}>
                  <Feather name="settings" size={18} color={colors.textMuted} />
                </Pressable>
              ) : undefined
            }
          />
        )}
        {!openProject ? <Text style={styles.pageSubtitle}>{t('devisList.subtitle')}</Text> : null}

        <Button
          title={t('devisList.newDevis')}
          icon="plus"
          onPress={() => router.push('/(app)/devis/new')}
          style={{ marginBottom: spacing.lg }}
        />

        {actionError ? <Text style={styles.actionError}>{actionError}</Text> : null}

        {loading ? (
          <LoadingScreen />
        ) : (
          <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl, gap: spacing.md }} showsVerticalScrollIndicator={false}>
            {!openProject ? (
              <View style={styles.kpiGrid}>
                <KpiTile label={t('devisList.kpiPending')} amount={kpis.sentSum} count={kpis.sentCount} tone="primary" icon="clock" />
                <KpiTile label={t('devisList.kpiAccepted')} amount={kpis.acceptedSum} tone="success" icon="check-circle" />
                <KpiTile label={t('devisList.kpiRefused')} count={kpis.refusedCount} tone="danger" icon="x-circle" hideAmount />
                <KpiTile label={t('devisList.kpiDraft')} count={kpis.draftCount} tone="muted" icon="file-text" hideAmount />
              </View>
            ) : null}
            {openProject ? (
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
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  kpiTile: {
    flexBasis: '47%',
    flexGrow: 1,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 4,
  },
  kpiIcon: {
    width: 26,
    height: 26,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  kpiLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textMuted,
  },
  kpiAmount: {
    fontSize: fontSize.lg,
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
  number: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  client: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  meta: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
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
