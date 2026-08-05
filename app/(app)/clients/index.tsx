import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { listClients } from '../../../lib/api/clients';
import { Button, Card, EmptyState, Screen } from '../../../components/ui';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import type { Client, ClientType } from '../../../lib/types';

type FilterKey = 'all' | ClientType;

export default function ClientsListScreen() {
  const { organization } = useAuth();
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');

  const load = useCallback(async () => {
    if (!organization) return;
    setLoading(true);
    setClients(await listClients(organization.id));
    setLoading(false);
  }, [organization]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const filtered = useMemo(() => {
    const byType = filter === 'all' ? clients : clients.filter((c) => c.type === filter);
    const q = search.trim().toLowerCase();
    if (!q) return byType;
    return byType.filter(
      (c) => c.name.toLowerCase().includes(q) || c.company_name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q),
    );
  }, [clients, filter, search]);

  const filters: { key: FilterKey; label: string }[] = [
    { key: 'all', label: 'Tous les types' },
    { key: 'particulier', label: 'Particuliers' },
    { key: 'entreprise', label: 'Entreprises' },
  ];

  return (
    <Screen style={{ padding: spacing.xl }}>
      <View style={styles.container}>
        <Button
          title="Nouveau client"
          icon="plus"
          onPress={() => router.push('/(app)/clients/new')}
          style={{ marginBottom: spacing.sm }}
        />

        <View style={styles.searchRow}>
          <Feather name="search" size={15} color={colors.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Rechercher par nom, entreprise, e-mail"
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.filterRow}>
          {filters.map((f) => (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
            >
              <Text style={[styles.filterChipText, filter === f.key && styles.filterChipTextActive]}>{f.label}</Text>
            </Pressable>
          ))}
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          refreshing={loading}
          onRefresh={load}
          contentContainerStyle={{ paddingBottom: spacing.xxl, gap: spacing.md }}
          ListEmptyComponent={
            !loading ? (
              <EmptyState title="Aucun client" subtitle="Ajoutez votre premier contact." />
            ) : null
          }
          renderItem={({ item }) => (
            <Pressable onPress={() => router.push(`/(app)/clients/${item.id}`)}>
              <Card style={styles.card}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{item.name}</Text>
                  {item.company_name ? <Text style={styles.meta}>{item.company_name}</Text> : null}
                  {item.email ? <Text style={styles.meta}>{item.email}</Text> : null}
                  {item.phone ? <Text style={styles.meta}>{item.phone}</Text> : null}
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    marginBottom: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  filterChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterChipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textMuted,
  },
  filterChipTextActive: {
    color: colors.primary,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  name: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  meta: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
});
