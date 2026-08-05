import { useCallback, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../lib/auth-context';
import { supabase } from '../../lib/supabase';
import { isModuleEnabled } from '../../lib/modules';
import { isOnline } from '../../lib/presence';
import { Button, Card, EmptyState, Screen, StatusBadge } from '../../components/ui';
import { FeatureHint } from '../../components/FeatureHint';
import { colors, fontSize, radius, spacing } from '../../lib/theme';
import type { Devis, Facture, OrganizationMember, Project } from '../../lib/types';

type IconName = keyof typeof Feather.glyphMap;

const STATUS_LABELS: Record<string, string> = {
  active: 'Actif',
  completed: 'Terminé',
  archived: 'Archivé',
};

const TONE_COLORS: Record<string, { fg: string; bg: string }> = {
  primary: { fg: colors.primary, bg: colors.primarySoft },
  danger: { fg: colors.danger, bg: colors.dangerSoft },
  success: { fg: colors.success, bg: colors.successSoft },
  muted: { fg: colors.textMuted, bg: colors.surfaceAlt },
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function DashboardScreen() {
  const { organization, user } = useAuth();
  const router = useRouter();
  const devisEnabled = isModuleEnabled(organization?.enabled_modules, 'devis');
  const fullName = (user?.user_metadata?.full_name as string | undefined) || null;
  const firstName = fullName?.trim().split(' ')[0] || null;

  const [activeProjects, setActiveProjects] = useState(0);
  const [devisPending, setDevisPending] = useState(0);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [recentDevis, setRecentDevis] = useState<Devis[]>([]);
  const [devisAmounts, setDevisAmounts] = useState<Record<string, number>>({});
  const [recentFactures, setRecentFactures] = useState<Facture[]>([]);
  const [factureAmounts, setFactureAmounts] = useState<Record<string, number>>({});
  const [pendingAmount, setPendingAmount] = useState(0);
  const [paidThisMonth, setPaidThisMonth] = useState(0);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!organization) return;

    const [{ count: projects }, { count: pendingDevisCount }, { data: recentProj }, { data: team }, { data: devisList }] =
      await Promise.all([
        supabase.from('projects').select('id', { count: 'exact', head: true }).eq('organization_id', organization.id).eq('status', 'active'),
        supabase.from('devis').select('id', { count: 'exact', head: true }).eq('organization_id', organization.id).in('status', ['draft', 'sent']),
        supabase.from('projects').select('*').eq('organization_id', organization.id).order('updated_at', { ascending: false }).limit(4),
        supabase.from('organization_members').select('*').eq('organization_id', organization.id),
        devisEnabled
          ? supabase.from('devis').select('*').eq('organization_id', organization.id).order('created_at', { ascending: false }).limit(3)
          : Promise.resolve({ data: [] as Devis[] }),
      ]);

    setActiveProjects(projects ?? 0);
    setDevisPending(pendingDevisCount ?? 0);
    setRecentProjects(recentProj ?? []);
    setMembers(team ?? []);
    setRecentDevis(devisList ?? []);

    if (devisList?.length) {
      const { data: items } = await supabase.from('devis_items').select('devis_id, quantity, unit_price').in('devis_id', devisList.map((d) => d.id));
      const totals: Record<string, number> = {};
      for (const it of items ?? []) {
        totals[it.devis_id] = (totals[it.devis_id] ?? 0) + Number(it.quantity) * Number(it.unit_price);
      }
      setDevisAmounts(totals);
    }

    if (!devisEnabled) return;

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
      let pending = 0;
      let paid = 0;
      const now = new Date();
      for (const f of list) {
        const amount = (subtotals[f.id] ?? 0) * (1 + Number(f.vat_rate) / 100);
        withVat[f.id] = amount;
        if (f.status === 'sent') pending += amount;
        if (f.status === 'paid' && f.paid_at) {
          const paidAt = new Date(f.paid_at);
          if (paidAt.getFullYear() === now.getFullYear() && paidAt.getMonth() === now.getMonth()) paid += amount;
        }
      }
      setFactureAmounts(withVat);
      setPendingAmount(pending);
      setPaidThisMonth(paid);
    }
  }, [organization, devisEnabled]);

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

  const tiles = useMemo(() => {
    const list: { key: string; label: string; icon: IconName; tone: keyof typeof TONE_COLORS; value: string }[] = [
      { key: 'projects', label: 'Chantiers actifs', icon: 'layers', tone: 'primary', value: String(activeProjects) },
    ];
    if (devisEnabled) {
      list.push(
        { key: 'devis', label: 'Devis en cours', icon: 'file-text', tone: 'muted', value: String(devisPending) },
        { key: 'pending', label: 'À encaisser', icon: 'clock', tone: 'danger', value: `CHF ${pendingAmount.toFixed(0)}` },
        { key: 'paid', label: 'Encaissé ce mois', icon: 'check-circle', tone: 'success', value: `CHF ${paidThisMonth.toFixed(0)}` },
      );
    }
    return list;
  }, [activeProjects, devisEnabled, devisPending, pendingAmount, paidThisMonth]);

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

        <FeatureHint
          id="dashboard-welcome"
          icon="compass"
          title="Bienvenue sur Cantia"
          text="Créez un chantier, ajoutez des rapports et des documents sur le terrain, puis générez vos devis en quelques minutes."
        />

        <View style={styles.grid}>
          {tiles.map((tile) => {
            const t = TONE_COLORS[tile.tone];
            return (
              <Card key={tile.key} style={styles.tile}>
                <View style={[styles.tileIcon, { backgroundColor: t.bg }]}>
                  <Feather name={tile.icon} size={16} color={t.fg} />
                </View>
                <Text style={styles.tileValue}>{tile.value}</Text>
                <Text style={styles.tileLabel}>{tile.label}</Text>
              </Card>
            );
          })}
        </View>

        <View style={styles.quickRow}>
          <Button title="Nouveau chantier" icon="plus" onPress={() => router.push('/(app)/chantiers/new')} style={{ flex: 1 }} />
          {devisEnabled ? (
            <Button title="Nouveau devis" icon="file-plus" variant="secondary" onPress={() => router.push('/(app)/devis/new')} style={{ flex: 1 }} />
          ) : null}
        </View>

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

        {devisEnabled && recentDevis.length > 0 ? (
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

        {devisEnabled && recentFactures.length > 0 ? (
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
  hello: {
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
  org: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  tile: {
    flexGrow: 1,
    flexBasis: 140,
    paddingVertical: spacing.lg,
  },
  tileIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  tileValue: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  tileLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
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
