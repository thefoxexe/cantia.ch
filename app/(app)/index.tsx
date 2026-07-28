import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuth } from '../../lib/auth-context';
import { supabase } from '../../lib/supabase';
import { Card, Screen } from '../../components/ui';
import { colors, fontSize, spacing } from '../../lib/theme';

interface Counts {
  projects: number;
  reports: number;
  devisPending: number;
}

export default function DashboardScreen() {
  const { organization, user } = useAuth();
  const router = useRouter();
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
        <Text style={styles.hello}>Bonjour 👋</Text>
        <Text style={styles.org}>{organization?.name}</Text>

        <View style={styles.grid}>
          <Card style={styles.tile}>
            <Text style={styles.tileValue}>{counts.projects}</Text>
            <Text style={styles.tileLabel}>Chantiers actifs</Text>
          </Card>
          <Card style={styles.tile}>
            <Text style={styles.tileValue}>{counts.reports}</Text>
            <Text style={styles.tileLabel}>Rapports</Text>
          </Card>
          <Card style={styles.tile}>
            <Text style={styles.tileValue}>{counts.devisPending}</Text>
            <Text style={styles.tileLabel}>Devis en cours</Text>
          </Card>
        </View>

        <Text style={styles.sectionTitle}>Actions rapides</Text>
        <View style={styles.actions}>
          <QuickAction label="+ Nouveau chantier" onPress={() => router.push('/(app)/chantiers/new')} />
          <QuickAction label="+ Nouveau devis" onPress={() => router.push('/(app)/devis/new')} />
          <QuickAction label="☁️ Ouvrir le cloud" onPress={() => router.push('/(app)/cloud')} />
        </View>
      </ScrollView>
    </Screen>
  );
}

function QuickAction({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <Card style={styles.action}>
        <Text style={styles.actionText}>{label}</Text>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl * 2,
  },
  hello: {
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
  org: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.xl,
  },
  grid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  tile: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
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
    paddingVertical: spacing.lg,
  },
  actionText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
});
