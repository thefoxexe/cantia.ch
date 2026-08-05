import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../../lib/auth-context';
import { listTrames } from '../../../../lib/api/trames';
import { Button, Card, EmptyState, Screen } from '../../../../components/ui';
import { colors, fontSize, spacing } from '../../../../lib/theme';
import type { DevisTrame } from '../../../../lib/types';

export default function TramesListScreen() {
  const { organization } = useAuth();
  const router = useRouter();
  const [trames, setTrames] = useState<DevisTrame[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    if (!organization) return;
    setLoading(true);
    setTrames(await listTrames(organization.id));
    setLoading(false);
  }, [organization]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return trames;
    return trames.filter((t) => t.name.toLowerCase().includes(q));
  }, [trames, query]);

  return (
    <Screen style={{ padding: spacing.xl }}>
      <View style={styles.container}>
        <Text style={styles.sectionLabel}>Trames</Text>
        <Text style={styles.pageSubtitle}>
          Un jeu de positions réutilisable — enregistrez vos prestations types une fois, réutilisez-les dans un nouveau devis en changeant juste les
          quantités.
        </Text>
        <Button title="Nouvelle trame" icon="plus" onPress={() => router.push('/(app)/devis/trames/new')} style={{ marginBottom: spacing.lg }} />

        <View style={styles.searchRow}>
          <Feather name="search" size={16} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Rechercher une trame…"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          refreshing={loading}
          onRefresh={load}
          contentContainerStyle={{ paddingBottom: spacing.xxl, gap: spacing.md }}
          ListEmptyComponent={
            !loading ? (
              <EmptyState title="Aucune trame" subtitle="Créez votre première trame, ou enregistrez-en une depuis un devis existant." />
            ) : null
          }
          renderItem={({ item }) => (
            <Pressable onPress={() => router.push(`/(app)/devis/trames/${item.id}`)}>
              <Card style={styles.card}>
                <Text style={styles.name}>{item.name}</Text>
                <Feather name="chevron-right" size={16} color={colors.textMuted} />
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
  sectionLabel: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: spacing.sm,
  },
  pageSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
});
