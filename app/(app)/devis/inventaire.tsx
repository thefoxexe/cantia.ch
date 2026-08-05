import { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { Card, EmptyState, PageHeader, Screen } from '../../../components/ui';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import { fetchCatalog, type CatalogEntry } from '../../../lib/catalog';

// Read-only browser over the org's catalog_items table — writes only ever
// happen server-side (auto-add trigger on devis_items, or the explicit
// price-update RPC triggered from devis/new.tsx's mismatch prompt).
export default function InventaireScreen() {
  const { organization } = useAuth();
  const [catalog, setCatalog] = useState<CatalogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    if (!organization) return;
    setLoading(true);
    setCatalog(await fetchCatalog(organization.id));
    setLoading(false);
  }, [organization]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const filtered = useMemo(() => {
    const sorted = [...catalog].sort((a, b) => b.count - a.count || b.lastUsedAt.localeCompare(a.lastUsedAt));
    const q = query.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter((entry) => entry.description.toLowerCase().includes(q));
  }, [catalog, query]);

  return (
    <Screen style={{ padding: spacing.xl }}>
      <View style={styles.container}>
        <PageHeader title="Inventaire" />
        <Text style={styles.pageSubtitle}>
          Les prix et unités déjà utilisés dans vos devis — Cantia les reconnaît et les suggère automatiquement.
        </Text>
        <View style={styles.searchRow}>
          <Feather name="search" size={16} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Rechercher une prestation…"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id ?? item.description}
          refreshing={loading}
          onRefresh={load}
          contentContainerStyle={{ paddingBottom: spacing.xxl, gap: spacing.md }}
          ListEmptyComponent={
            !loading ? (
              <EmptyState
                title="Aucune entrée"
                subtitle="Chaque ligne de devis que vous créez enrichit automatiquement l'inventaire."
              />
            ) : null
          }
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <View style={styles.cardMain}>
                <Text style={styles.description} numberOfLines={2}>
                  {item.description}
                </Text>
                <View style={styles.metaRow}>
                  <Text style={styles.meta}>{item.unit}</Text>
                  <Text style={styles.metaDot}>·</Text>
                  <Text style={styles.meta}>
                    Utilisé {item.count} fois{item.count > 1 ? '' : ''}
                  </Text>
                  <Text style={styles.metaDot}>·</Text>
                  <Text style={styles.meta}>{new Date(item.lastUsedAt).toLocaleDateString('fr-CH')}</Text>
                </View>
              </View>
              <Text style={styles.price}>CHF {item.unitPrice.toFixed(2)}</Text>
            </Card>
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
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
    gap: spacing.md,
  },
  cardMain: {
    flex: 1,
  },
  description: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  meta: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  metaDot: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  price: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: colors.primary,
  },
});
