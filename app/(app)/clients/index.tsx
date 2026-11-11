import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { listClients } from '../../../lib/api/clients';
import { listSubcontractors } from '../../../lib/api/subcontractors';
import { Card, EmptyState, HeaderAction, PageHeader, AppScreen, ChipRow } from '../../../components/ui';
import { useTranslation } from '../../../lib/translations';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import type { ClientType } from '../../../lib/types';

type ContactType = ClientType | 'sous-traitant';
type FilterKey = 'all' | ContactType;

// Clients and sous-traitants live in their own tables (devis and factures
// point at clients, chantier interventions at sous-traitants); this page
// shows them as one address book.
interface ContactRow {
  id: string;
  type: ContactType;
  name: string;
  meta: (string | null | undefined)[];
  href: string;
  search: string;
}

const FILTER_KEYS: FilterKey[] = ['all', 'particulier', 'entreprise', 'sous-traitant'];

export default function ClientsListScreen() {
  const { t } = useTranslation();
  const { organization, permissions, canManageDevis } = useAuth();
  const { width } = useWindowDimensions();
  // Two columns of contacts on a computer (the sidebar takes ~230 px).
  const twoCols = width >= 1180;
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: string }>();
  const showClients = canManageDevis;
  const showSubs = permissions.subcontractors;
  const [contacts, setContacts] = useState<ContactRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterKey>(() =>
    FILTER_KEYS.includes(params.type as FilterKey) ? (params.type as FilterKey) : showClients ? 'all' : 'sous-traitant',
  );
  // Permissions can arrive after the first render: the default chosen then
  // ("sous-traitant" for someone who can't see clients) must follow once the
  // real permissions are known, unless the URL asked for a type.
  useEffect(() => {
    if (FILTER_KEYS.includes(params.type as FilterKey)) return;
    setFilter((f) => (showClients && f === 'sous-traitant' ? 'all' : !showClients && f !== 'sous-traitant' ? 'sous-traitant' : f));
  }, [showClients, params.type]);

  const load = useCallback(async () => {
    if (!organization) return;
    setLoading(true);
    const [clients, subs] = await Promise.all([showClients ? listClients(organization.id) : [], showSubs ? listSubcontractors(organization.id) : []]);
    const rows: ContactRow[] = [
      ...clients.map((c) => ({
        id: c.id,
        type: c.type as ContactType,
        name: c.name,
        meta: [c.company_name, c.email, c.phone],
        href: `/(app)/clients/${c.id}`,
        search: [c.name, c.company_name, c.email].join(' ').toLowerCase(),
      })),
      ...subs.map((s) => ({
        id: s.id,
        type: 'sous-traitant' as const,
        name: s.company_name,
        meta: [[s.trade, s.contact_name].filter(Boolean).join(' · '), s.email, s.phone],
        href: `/(app)/sous-traitants/${s.id}`,
        search: [s.company_name, s.trade, s.contact_name, s.email].join(' ').toLowerCase(),
      })),
    ];
    setContacts(rows.sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' })));
    setLoading(false);
  }, [organization, showClients, showSubs]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const filtered = useMemo(() => {
    const byType = filter === 'all' ? contacts : contacts.filter((c) => c.type === filter);
    const q = search.trim().toLowerCase();
    return q ? byType.filter((c) => c.search.includes(q)) : byType;
  }, [contacts, filter, search]);

  const typeLabel: Record<ContactType, string> = {
    particulier: t('newClient.typeParticulier'),
    entreprise: t('newClient.typeEntreprise'),
    'sous-traitant': t('newClient.typeSubcontractor'),
  };
  const filters: { key: FilterKey; label: string }[] = [
    ...(showClients
      ? [
          { key: 'all' as const, label: t('clientsList.filterAll') },
          { key: 'particulier' as const, label: t('clientsList.filterParticulier') },
          { key: 'entreprise' as const, label: t('clientsList.filterEntreprise') },
        ]
      : []),
    ...(showSubs ? [{ key: 'sous-traitant' as const, label: t('clientsList.filterSubcontractor') }] : []),
  ];

  return (
    <AppScreen style={{ padding: spacing.xl }}>
      <View style={styles.container}>
        <PageHeader
          title={t('clientsList.title')}
          subtitle={t('clientsList.subtitle')}
          backTo="/(app)"
          right={
            <HeaderAction
              title={t('appActions.newContact')}
              onPress={() => router.push(filter === 'all' ? '/(app)/clients/new' : (`/(app)/clients/new?type=${filter}` as any))}
            />
          }
        />

        <View style={styles.searchRow}>
          <Feather name="search" size={15} color={colors.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={t('clientsList.searchPlaceholder')}
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
            autoCapitalize="none"
          />
        </View>

        {filters.length > 1 ? (
          <ChipRow style={styles.filterRow}>
            {filters.map((f) => (
              <Pressable
                key={f.key}
                onPress={() => setFilter(f.key)}
                style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
              >
                <Text style={[styles.filterChipText, filter === f.key && styles.filterChipTextActive]}>{f.label}</Text>
              </Pressable>
            ))}
          </ChipRow>
        ) : null}

        <FlatList
          key={twoCols ? 'grid' : 'list'}
          numColumns={twoCols ? 2 : 1}
          columnWrapperStyle={twoCols ? { gap: spacing.md } : undefined}
          data={filtered}
          keyExtractor={(item) => `${item.type}:${item.id}`}
          refreshing={loading}
          onRefresh={load}
          contentContainerStyle={{ paddingBottom: spacing.xxl, gap: spacing.md }}
          ListEmptyComponent={
            !loading ? (
              <EmptyState title={t('clientsList.emptyTitle')} subtitle={t('clientsList.emptySubtitle')} />
            ) : null
          }
          renderItem={({ item }) => (
            <Pressable onPress={() => router.push(item.href as any)} style={twoCols ? { flex: 1, maxWidth: '50%' } : undefined}>
              <Card style={styles.card}>
                <View style={{ flex: 1 }}>
                  <View style={styles.nameRow}>
                    <Text style={styles.name}>{item.name}</Text>
                    <View style={[styles.typeBadge, item.type === 'sous-traitant' && styles.typeBadgeSub]}>
                      <Text style={[styles.typeBadgeText, item.type === 'sous-traitant' && styles.typeBadgeTextSub]}>{typeLabel[item.type]}</Text>
                    </View>
                  </View>
                  {/* One line per contact: company, e-mail, phone. */}
                  <Text style={styles.meta} numberOfLines={1}>
                    {item.meta.filter(Boolean).join(' · ')}
                  </Text>
                </View>
                <Feather name="chevron-right" size={18} color={colors.textMuted} />
              </Card>
            </Pressable>
          )}
        />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxWidth: 1080,
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  typeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
  },
  typeBadgeSub: {
    backgroundColor: colors.primarySoft,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
  },
  typeBadgeTextSub: {
    color: colors.primary,
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
