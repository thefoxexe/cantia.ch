import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { listActiveAssignmentsForOrg, listSubcontractors } from '../../../lib/api/subcontractors';
import { Button, Card, EmptyState, PageHeader, Screen } from '../../../components/ui';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import type { Subcontractor } from '../../../lib/types';

export default function SubcontractorsListScreen() {
  const { organization } = useAuth();
  const router = useRouter();
  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>([]);
  const [activeChantiers, setActiveChantiers] = useState<Map<string, string[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    if (!organization) return;
    setLoading(true);
    const [subs, assignments] = await Promise.all([
      listSubcontractors(organization.id),
      listActiveAssignmentsForOrg(organization.id),
    ]);
    setSubcontractors(subs);
    const byCompany = new Map<string, string[]>();
    for (const a of assignments) {
      if (!a.projects?.name) continue;
      const list = byCompany.get(a.subcontractor_id) ?? [];
      list.push(a.projects.name);
      byCompany.set(a.subcontractor_id, list);
    }
    setActiveChantiers(byCompany);
    setLoading(false);
  }, [organization]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return subcontractors;
    return subcontractors.filter(
      (s) =>
        s.company_name.toLowerCase().includes(q) ||
        s.trade?.toLowerCase().includes(q) ||
        s.contact_name?.toLowerCase().includes(q),
    );
  }, [subcontractors, search]);

  return (
    <Screen style={{ padding: spacing.xl }}>
      <View style={styles.container}>
        <PageHeader title="Sous-traitants" backTo="/(app)" />
        <Text style={styles.pageSubtitle}>
          Vos entreprises sous-traitées, réutilisables d'un chantier à l'autre — interventions, assurances et
          factures reçues, au même endroit.
        </Text>

        <Button
          title="Nouvelle entreprise"
          icon="plus"
          onPress={() => router.push('/(app)/sous-traitants/new')}
          style={{ marginBottom: spacing.sm }}
        />

        <View style={styles.searchRow}>
          <Feather name="search" size={15} color={colors.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Rechercher par nom, métier, contact"
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
            autoCapitalize="none"
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
              <EmptyState title="Aucun sous-traitant" subtitle="Ajoutez la première entreprise sous-traitée." />
            ) : null
          }
          renderItem={({ item }) => {
            const chantiers = activeChantiers.get(item.id) ?? [];
            return (
              <Pressable onPress={() => router.push(`/(app)/sous-traitants/${item.id}`)}>
                <Card style={styles.card}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{item.company_name}</Text>
                    {item.trade ? <Text style={styles.meta}>{item.trade}</Text> : null}
                    {item.contact_name ? <Text style={styles.meta}>{item.contact_name}</Text> : null}
                    {chantiers.length ? (
                      <View style={styles.activeBadge}>
                        <Feather name="layers" size={11} color={colors.primary} />
                        <Text style={styles.activeBadgeText} numberOfLines={1}>
                          {chantiers.join(', ')}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  <Feather name="chevron-right" size={18} color={colors.textMuted} />
                </Card>
              </Pressable>
            );
          }}
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
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    marginBottom: spacing.lg,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text,
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
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
  },
  activeBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.primary,
    flexShrink: 1,
  },
});
