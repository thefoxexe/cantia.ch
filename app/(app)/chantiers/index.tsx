import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import { Button, Card, EmptyState, PageHeader, Screen, StatusBadge } from '../../../components/ui';
import { colors, fontSize, spacing } from '../../../lib/theme';
import type { Project } from '../../../lib/types';

export default function ChantiersListScreen() {
  const { organization, canCreateProjects } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!organization) return;
    setLoading(true);
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('organization_id', organization.id)
      .order('created_at', { ascending: false });
    setProjects(data ?? []);
    setLoading(false);
  }, [organization]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <Screen style={{ padding: spacing.xl }}>
      <View style={styles.container}>
        <PageHeader title="Chantiers" backTo="/(app)" />
        <Text style={styles.pageSubtitle}>Tous vos chantiers en cours, avec leur avancement et leur équipe.</Text>

        {canCreateProjects ? (
          <Button
            title="Nouveau chantier"
            icon="plus"
            onPress={() => router.push('/(app)/chantiers/new')}
            style={{ marginBottom: spacing.lg }}
          />
        ) : null}

        <FlatList
          data={projects}
          keyExtractor={(item) => item.id}
          refreshing={loading}
          onRefresh={load}
          contentContainerStyle={{ paddingBottom: spacing.xxl, gap: spacing.md }}
          ListEmptyComponent={
            !loading ? <EmptyState title="Aucun chantier" subtitle="Créez votre premier chantier pour commencer." /> : null
          }
          renderItem={({ item }) => (
            <Pressable onPress={() => router.push(`/(app)/chantiers/${item.id}`)}>
              <Card style={styles.card}>
                <View style={styles.cardBody}>
                  <View style={styles.row}>
                    <Text style={styles.name}>{item.name}</Text>
                    <StatusBadge status={item.status} />
                  </View>
                  {item.client_name ? <Text style={styles.meta}>Client : {item.client_name}</Text> : null}
                  {item.address ? <Text style={styles.meta}>{item.address}</Text> : null}
                </View>
                <Feather name="chevron-right" size={18} color={colors.textMuted} />
              </Card>
            </Pressable>
          )}
        />
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
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
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
  name: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    flexShrink: 1,
  },
  meta: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
});
