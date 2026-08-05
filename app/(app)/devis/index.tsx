import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import { duplicateDevis } from '../../../lib/api/devis';
import { confirm } from '../../../lib/confirm';
import { Button, Card, EmptyState, Screen, StatusBadge } from '../../../components/ui';
import { RowActionMenu } from '../../../components/RowActionMenu';
import { colors, fontSize, spacing } from '../../../lib/theme';
import type { Devis } from '../../../lib/types';

export default function DevisListScreen() {
  const { organization, role } = useAuth();
  const router = useRouter();
  const [devisList, setDevisList] = useState<Devis[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const isAdmin = role === 'owner' || role === 'admin';

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
    const ok = await confirm('Supprimer ce devis ?', `Le devis ${item.number ?? ''} pour ${item.client_name} sera définitivement supprimé.`);
    if (!ok) return;
    setActionError(null);
    const { error } = await supabase.from('devis').delete().eq('id', item.id);
    if (error) {
      setActionError(error.message);
      return;
    }
    load();
  }

  return (
    <Screen style={{ padding: spacing.xl }}>
      <View style={styles.container}>
        <Button
          title="Nouveau devis"
          icon="plus"
          onPress={() => router.push('/(app)/devis/new')}
          style={{ marginBottom: spacing.sm }}
        />
        <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg }}>
          <Button
            title="Factures"
            icon="dollar-sign"
            variant="secondary"
            onPress={() => router.push('/(app)/devis/factures')}
            style={{ flex: 1 }}
          />
          <Button
            title="Inventaire"
            icon="database"
            variant="secondary"
            onPress={() => router.push('/(app)/devis/inventaire')}
            style={{ flex: 1 }}
          />
        </View>

        <Text style={styles.sectionLabel}>Devis</Text>
        {actionError ? <Text style={styles.actionError}>{actionError}</Text> : null}

        <FlatList
          data={devisList}
          keyExtractor={(item) => item.id}
          refreshing={loading}
          onRefresh={load}
          contentContainerStyle={{ paddingBottom: spacing.xxl, gap: spacing.md }}
          ListEmptyComponent={
            !loading ? (
              <EmptyState title="Aucun devis" subtitle="Créez votre premier devis pour un client." />
            ) : null
          }
          renderItem={({ item }) => (
            <View style={styles.cardWrap}>
              <Pressable onPress={() => router.push(`/(app)/devis/${item.id}`)}>
                <Card style={styles.card}>
                  <View style={styles.cardBody}>
                    <View style={styles.row}>
                      <Text style={styles.number}>{item.number}</Text>
                      <StatusBadge status={item.status} />
                    </View>
                    <Text style={styles.client}>{item.client_name}</Text>
                    <Text style={styles.meta}>{new Date(item.created_at).toLocaleDateString('fr-CH')}</Text>
                  </View>
                  <Feather name="chevron-right" size={18} color={colors.textMuted} />
                </Card>
              </Pressable>
              <View style={styles.cardMenu}>
                <RowActionMenu
                  actions={[
                    { key: 'duplicate', icon: 'copy', label: 'Dupliquer', onPress: () => handleDuplicate(item.id) },
                    ...(isAdmin
                      ? [{ key: 'delete', icon: 'trash-2' as const, label: 'Supprimer', danger: true, onPress: () => handleDelete(item) }]
                      : []),
                  ]}
                />
              </View>
            </View>
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
  sectionLabel: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: spacing.sm,
  },
  actionError: {
    fontSize: fontSize.xs,
    color: colors.danger,
    marginBottom: spacing.sm,
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
});
