import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import { Card, EmptyState, Screen, StatusBadge } from '../../../components/ui';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import type { Devis } from '../../../lib/types';

export default function DevisListScreen() {
  const { organization } = useAuth();
  const router = useRouter();
  const [devisList, setDevisList] = useState<Devis[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!organization) return;
    setLoading(true);
    const { data } = await supabase
      .from('devis')
      .select('*')
      .eq('organization_id', organization.id)
      .order('created_at', { ascending: false });
    setDevisList(data ?? []);
    setLoading(false);
  }, [organization]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <Screen style={{ padding: spacing.xl }}>
      <Pressable style={styles.newButton} onPress={() => router.push('/(app)/devis/new')}>
        <Text style={styles.newButtonText}>+ Nouveau devis</Text>
      </Pressable>

      <FlatList
        data={devisList}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={load}
        contentContainerStyle={{ paddingBottom: spacing.xxl, gap: spacing.md }}
        ListEmptyComponent={
          !loading ? (
            <EmptyState title="Aucun devis" subtitle="Créez un devis à partir de vos notes de rendez-vous." />
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push(`/(app)/devis/${item.id}`)}>
            <Card>
              <View style={styles.row}>
                <Text style={styles.number}>{item.number}</Text>
                <StatusBadge status={item.status} />
              </View>
              <Text style={styles.client}>{item.client_name}</Text>
              <Text style={styles.meta}>{new Date(item.created_at).toLocaleDateString('fr-CH')}</Text>
            </Card>
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
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
});
