import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../lib/auth-context';
import { supabase } from '../../lib/supabase';
import { isModuleEnabled } from '../../lib/modules';
import { isOnline } from '../../lib/presence';
import { Card, EmptyState, Screen } from '../../components/ui';
import { FeatureHint } from '../../components/FeatureHint';
import { colors, fontSize, radius, spacing } from '../../lib/theme';
import type { OrganizationMember, Project } from '../../lib/types';

type IconName = keyof typeof Feather.glyphMap;

interface Counts {
  projects: number;
  reports: number;
  devisPending: number;
}

const TILES: { key: keyof Counts; label: string; icon: IconName }[] = [
  { key: 'projects', label: 'Chantiers actifs', icon: 'layers' },
  { key: 'reports', label: 'Rapports', icon: 'file-text' },
  { key: 'devisPending', label: 'Devis en cours', icon: 'clipboard' },
];

const STATUS_LABELS: Record<string, string> = {
  active: 'Actif',
  completed: 'Terminé',
  archived: 'Archivé',
};

export default function DashboardScreen() {
  const { organization, user } = useAuth();
  const router = useRouter();
  const fullName = (user?.user_metadata?.full_name as string | undefined) || null;
  const firstName = fullName?.trim().split(' ')[0] || null;
  const [counts, setCounts] = useState<Counts>({ projects: 0, reports: 0, devisPending: 0 });
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!organization) return;
    const [{ count: projects }, { count: reports }, { count: devisPending }, { data: recent }, { data: team }] = await Promise.all([
      supabase
        .from('projects')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', organization.id)
        .eq('status', 'active'),
      supabase
        .from('reports')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', organization.id),
      supabase
        .from('devis')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', organization.id)
        .in('status', ['draft', 'sent']),
      supabase
        .from('projects')
        .select('*')
        .eq('organization_id', organization.id)
        .order('updated_at', { ascending: false })
        .limit(4),
      supabase.from('organization_members').select('*').eq('organization_id', organization.id),
    ]);
    setCounts({ projects: projects ?? 0, reports: reports ?? 0, devisPending: devisPending ?? 0 });
    setRecentProjects(recent ?? []);
    setMembers(team ?? []);
  }, [organization]);

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
          {TILES.map((tile) => (
            <Card key={tile.key} style={styles.tile}>
              <View style={styles.tileIcon}>
                <Feather name={tile.icon} size={16} color={colors.primary} />
              </View>
              <Text style={styles.tileValue}>{counts[tile.key]}</Text>
              <Text style={styles.tileLabel}>{tile.label}</Text>
            </Card>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Actions rapides</Text>
        <View style={styles.actions}>
          <QuickAction icon="plus-circle" label="Nouveau chantier" onPress={() => router.push('/(app)/chantiers/new')} />
          {isModuleEnabled(organization?.enabled_modules, 'devis') ? (
            <QuickAction icon="file-plus" label="Nouveau devis" onPress={() => router.push('/(app)/devis/new')} />
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

function QuickAction({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <Card style={styles.action}>
        <View style={styles.actionIcon}>
          <Feather name={icon} size={18} color={colors.primary} />
        </View>
        <Text style={styles.actionText}>{label}</Text>
        <Feather name="chevron-right" size={18} color={colors.textMuted} />
      </Card>
    </Pressable>
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
    marginBottom: spacing.xl,
  },
  tile: {
    flexGrow: 1,
    flexBasis: 96,
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  tileIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  tileValue: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.primary,
  },
  tileLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  actions: {
    gap: spacing.md,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  actionText: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
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
