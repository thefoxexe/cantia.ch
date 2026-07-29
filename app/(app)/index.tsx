import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../lib/auth-context';
import { supabase } from '../../lib/supabase';
import { isModuleEnabled } from '../../lib/modules';
import { Card, Screen } from '../../components/ui';
import { FeatureHint } from '../../components/FeatureHint';
import { colors, fontSize, radius, spacing } from '../../lib/theme';

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

export default function DashboardScreen() {
  const { organization, user } = useAuth();
  const router = useRouter();
  const fullName = (user?.user_metadata?.full_name as string | undefined) || null;
  const firstName = fullName?.trim().split(' ')[0] || null;
  const [counts, setCounts] = useState<Counts>({ projects: 0, reports: 0, devisPending: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!organization) return;
    const [{ count: projects }, { count: reports }, { count: devisPending }] = await Promise.all([
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
    ]);
    setCounts({ projects: projects ?? 0, reports: reports ?? 0, devisPending: devisPending ?? 0 });
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
});
