import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../../lib/auth-context';
import { supabase } from '../../../../lib/supabase';
import { Card, EmptyState, Screen, StatusBadge } from '../../../../components/ui';
import { colors, fontSize, spacing } from '../../../../lib/theme';
import type { Facture } from '../../../../lib/types';

function isOverdue(facture: Facture): boolean {
  return facture.status === 'sent' && facture.due_date < new Date().toISOString().slice(0, 10);
}

export default function FacturesListScreen() {
  const { organization } = useAuth();
  const router = useRouter();
  const [factures, setFactures] = useState<Facture[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!organization) return;
    setLoading(true);
    const { data } = await supabase
      .from('factures')
      .select('*')
      .eq('organization_id', organization.id)
      .order('created_at', { ascending: false });
    setFactures(data ?? []);
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
        <FlatList
          data={factures}
          keyExtractor={(item) => item.id}
          refreshing={loading}
          onRefresh={load}
          contentContainerStyle={{ paddingBottom: spacing.xxl, gap: spacing.md }}
          ListEmptyComponent={
            !loading ? (
              <EmptyState
                title="Aucune facture"
                subtitle="Transformez un devis accepté en facture depuis sa fiche."
              />
            ) : null
          }
          renderItem={({ item }) => (
            <Pressable onPress={() => router.push(`/(app)/devis/factures/${item.id}`)}>
              <Card style={styles.card}>
                <View style={styles.cardBody}>
                  <View style={styles.row}>
                    <Text style={styles.number}>{item.number}</Text>
                    <StatusBadge status={item.status} />
                  </View>
                  <Text style={styles.client}>{item.client_name}</Text>
                  <Text style={[styles.meta, isOverdue(item) && styles.overdue]}>
                    {isOverdue(item) ? 'En retard · ' : ''}Échéance {new Date(item.due_date).toLocaleDateString('fr-CH')}
                  </Text>
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
  overdue: {
    color: colors.danger,
    fontWeight: '600',
  },
});
