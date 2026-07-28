import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import { Card, EmptyState, Screen, StatusBadge } from '../../../components/ui';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import type { Project } from '../../../lib/types';

export default function ChantiersListScreen() {
  const { organization } = useAuth();
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
      <Text style={styles.pageTitle}>Chantiers</Text>

      <Pressable style={styles.newButton} onPress={() => router.push('/(app)/chantiers/new')}>
        <Text style={styles.newButtonText}>+ Nouveau chantier</Text>
      </Pressable>

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
            <Card>
              <View style={styles.row}>
                <Text style={styles.name}>{item.name}</Text>
                <StatusBadge status={item.status} />
              </View>
              {item.client_name ? <Text style={styles.meta}>Client : {item.client_name}</Text> : null}
              {item.address ? <Text style={styles.meta}>{item.address}</Text> : null}
            </Card>
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  pageTitle: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  newButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  newButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: fontSize.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
