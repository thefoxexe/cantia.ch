import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { listActiveAssignmentsForOrg, listSubcontractors } from '../../../lib/api/subcontractors';
import { Button, Card, EmptyState, PageHeader, AppScreen } from '../../../components/ui';
import { useTranslation } from '../../../lib/translations';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import type { Subcontractor } from '../../../lib/types';

export default function SubcontractorsListScreen() {
  const { t } = useTranslation();
  const { organization } = useAuth();
  const router = useRouter();
  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>([]);
  const [activeChantiers, setActiveChantiers] = useState<Map<string, string[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tradeFilter, setTradeFilter] = useState<string | 'all'>('all');

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

  const trades = useMemo(
    () => Array.from(new Set(subcontractors.map((s) => s.trade).filter((t): t is string => !!t))).sort(),
    [subcontractors],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return subcontractors.filter((s) => {
      if (tradeFilter !== 'all' && s.trade !== tradeFilter) return false;
      if (!q) return true;
      return (
        s.company_name.toLowerCase().includes(q) ||
        s.trade?.toLowerCase().includes(q) ||
        s.contact_name?.toLowerCase().includes(q)
      );
    });
  }, [subcontractors, search, tradeFilter]);

  return (
    <AppScreen style={{ padding: spacing.xl }}>
      <View style={styles.container}>
        <PageHeader title={t('subcontractorsList.title')} backTo="/(app)" />
        <Text style={styles.pageSubtitle}>{t('subcontractorsList.subtitle')}</Text>

        <Button
          title={t('subcontractorsList.newCompany')}
          icon="plus"
          onPress={() => router.push('/(app)/sous-traitants/new')}
          style={{ marginBottom: spacing.sm }}
        />

        <View style={styles.searchRow}>
          <Feather name="search" size={15} color={colors.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={t('subcontractorsList.searchPlaceholder')}
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
            autoCapitalize="none"
          />
        </View>

        {trades.length > 1 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tradeFilterRow}>
            <Pressable style={[styles.tradeChip, tradeFilter === 'all' && styles.tradeChipActive]} onPress={() => setTradeFilter('all')}>
              <Text style={[styles.tradeChipText, tradeFilter === 'all' && styles.tradeChipTextActive]}>{t('subcontractorsList.filterAll')}</Text>
            </Pressable>
            {trades.map((tr) => (
              <Pressable
                key={tr}
                style={[styles.tradeChip, tradeFilter === tr && styles.tradeChipActive]}
                onPress={() => setTradeFilter(tradeFilter === tr ? 'all' : tr)}
              >
                <Text style={[styles.tradeChipText, tradeFilter === tr && styles.tradeChipTextActive]}>{tr}</Text>
              </Pressable>
            ))}
          </ScrollView>
        ) : null}

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          refreshing={loading}
          onRefresh={load}
          contentContainerStyle={{ paddingBottom: spacing.xxl, gap: spacing.md }}
          ListEmptyComponent={
            !loading ? (
              <EmptyState title={t('subcontractorsList.emptyTitle')} subtitle={t('subcontractorsList.emptySubtitle')} />
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
    </AppScreen>
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
  tradeFilterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    paddingRight: spacing.md,
  },
  tradeChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  tradeChipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  tradeChipText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textMuted,
  },
  tradeChipTextActive: {
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
