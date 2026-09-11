import { useMemo, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { isModuleEnabled } from '../../../lib/modules';
import { helpHref } from '../../../lib/appHost';
import { Container, PageHeader, Screen } from '../../../components/ui';
import { useTranslation } from '../../../lib/translations';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';

type IconName = keyof typeof Feather.glyphMap;
type MenuKey = 'entreprise' | 'devis' | 'emails' | 'equipe' | 'facturation' | 'integrations' | 'modules' | 'notifications' | 'apparence' | 'stockage' | 'profil' | 'aide' | 'danger' | 'rh';

interface MenuItem {
  href: string;
  icon: IconName;
  key: MenuKey;
  external?: boolean;
}

interface MenuGroup {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: IconName;
  color: 'primary' | 'accent' | 'success';
  items: MenuItem[];
}

// Grouped instead of one long flat list — each group is a real theme
// ("everything about how the company presents itself", "which parts of
// the app are turned on"), not an alphabetical dump. Two entries
// (Équipe, Abonnement) stand on their own outside any group: they're each
// a single, self-contained concern that doesn't share a theme with
// anything else, so folding them into a group would just be padding.
// Each group also carries its own icon/color so the collapsed list reads
// at a glance instead of as a wall of identical uppercase labels.
const GROUPS: MenuGroup[] = [
  {
    id: 'general',
    titleKey: 'compteMenu.groupGeneral',
    descriptionKey: 'compteMenu.groupGeneralDesc',
    icon: 'sliders',
    color: 'primary',
    items: [
      { href: '/(app)/compte/profil', icon: 'user', key: 'profil' },
      { href: '/(app)/compte/notifications', icon: 'bell', key: 'notifications' },
      { href: helpHref(), icon: 'help-circle', key: 'aide', external: true },
      { href: '/(app)/compte/danger', icon: 'alert-triangle', key: 'danger' },
    ],
  },
  {
    id: 'entreprise',
    titleKey: 'compteMenu.groupEntreprise',
    descriptionKey: 'compteMenu.groupEntrepriseDesc',
    icon: 'briefcase',
    color: 'accent',
    items: [
      { href: '/(app)/compte/entreprise', icon: 'home', key: 'entreprise' },
      { href: '/(app)/compte/apparence', icon: 'droplet', key: 'apparence' },
      { href: '/(app)/compte/devis', icon: 'file-text', key: 'devis' },
      { href: '/(app)/compte/emails', icon: 'mail', key: 'emails' },
      { href: '/(app)/compte/stockage', icon: 'hard-drive', key: 'stockage' },
    ],
  },
  {
    id: 'modules',
    titleKey: 'compteMenu.groupModules',
    descriptionKey: 'compteMenu.groupModulesDesc',
    icon: 'grid',
    color: 'success',
    items: [
      { href: '/(app)/compte/modules', icon: 'toggle-right', key: 'modules' },
      { href: '/(app)/compte/integrations', icon: 'link', key: 'integrations' },
    ],
  },
];

const GROUP_COLORS: Record<MenuGroup['color'], { bg: string; fg: string }> = {
  primary: { bg: colors.primarySoft, fg: colors.primary },
  accent: { bg: colors.accentSoft, fg: colors.accent },
  success: { bg: colors.successSoft, fg: colors.success },
};

const RH_ITEM: MenuItem = { href: '/(app)/compte/rh', icon: 'dollar-sign', key: 'rh' };

const EQUIPE_ITEM: MenuItem = { href: '/(app)/compte/equipe', icon: 'users', key: 'equipe' };
const FACTURATION_ITEM: MenuItem = { href: '/(app)/compte/facturation', icon: 'credit-card', key: 'facturation' };

export default function CompteIndexScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { organization, canManagePayroll } = useAuth();
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // RH & Salaires only means something once payroll is on the org's plan
  // and this member is allowed to touch it — a plain employee has nothing
  // to configure there (they just pick from lists an admin already set
  // up). Spliced into the "modules" group rather than appended, so it
  // reads as "config for a module you enabled" alongside Bexio.
  const groups = useMemo(() => {
    const withRh =
      canManagePayroll && isModuleEnabled(organization?.enabled_modules, 'payroll')
        ? GROUPS.map((g) => (g.id === 'modules' ? { ...g, items: [...g.items, RH_ITEM] } : g))
        : GROUPS;
    return withRh.map((g) => ({
      ...g,
      title: t(g.titleKey as any),
      items: g.items.map((item) => ({ ...item, label: t(`compteMenu.${item.key}.label`), description: t(`compteMenu.${item.key}.description`) })),
    }));
  }, [canManagePayroll, organization?.enabled_modules, t]);

  const standaloneItems = useMemo(
    () => [EQUIPE_ITEM, FACTURATION_ITEM].map((item) => ({ ...item, label: t(`compteMenu.${item.key}.label`), description: t(`compteMenu.${item.key}.description`) })),
    [t],
  );

  const q = query.trim().toLowerCase();
  const matches = (item: { label: string; description: string }) => !q || item.label.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);

  const filteredGroups = groups.map((g) => ({ ...g, items: g.items.filter(matches) })).filter((g) => g.items.length > 0);
  const filteredStandalone = standaloneItems.filter(matches);
  const noResults = q.length > 0 && filteredGroups.length === 0 && filteredStandalone.length === 0;

  // Searching auto-reveals every group with a match — no point requiring
  // an extra tap to see the result you just searched for.
  const isOpen = (id: string) => q.length > 0 || expanded.has(id);
  function toggleGroup(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function openItem(item: { href: string; external?: boolean }) {
    if (item.external) Linking.openURL(item.href);
    else router.push(item.href as any);
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl * 2 }}>
        <Container>
          <PageHeader title={t('compteMenu.title')} backTo="/(app)" />
          <View style={styles.searchBar}>
            <Feather name="search" size={16} color={colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder={t('compteMenu.searchPlaceholder')}
              placeholderTextColor={colors.textMuted}
            />
            {query ? (
              <Pressable onPress={() => setQuery('')} hitSlop={8}>
                <Feather name="x" size={16} color={colors.textMuted} />
              </Pressable>
            ) : null}
          </View>

          {noResults ? (
            <Text style={styles.empty}>{t('compteMenu.noResults', { query })}</Text>
          ) : (
            <View style={styles.list}>
              {filteredGroups.map((group) => {
                const open = isOpen(group.id);
                const groupColor = GROUP_COLORS[group.color];
                return (
                  <View key={group.id} style={[styles.groupCard, open && styles.groupCardOpen]}>
                    <Pressable onPress={() => toggleGroup(group.id)} style={styles.groupHeader}>
                      <View style={[styles.groupIconBadge, { backgroundColor: groupColor.bg }]}>
                        <Feather name={group.icon} size={19} color={groupColor.fg} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.groupTitle}>{group.title}</Text>
                        <Text style={styles.groupDescription} numberOfLines={1}>
                          {t(group.descriptionKey as any)}
                        </Text>
                      </View>
                      <View style={[styles.chevronBadge, open && styles.chevronBadgeOpen]}>
                        <Feather name="chevron-down" size={16} color={open ? colors.primary : colors.textMuted} />
                      </View>
                    </Pressable>
                    {open ? (
                      <View style={styles.groupBody}>
                        {group.items.map((item) => (
                          <Pressable
                            key={item.href}
                            onPress={() => openItem(item)}
                            style={({ hovered }: any) => [styles.row, hovered && styles.rowHovered]}
                          >
                            <View style={styles.iconBadge}>
                              <Feather name={item.icon} size={15} color={colors.primary} />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.label}>{item.label}</Text>
                              <Text style={styles.description}>{item.description}</Text>
                            </View>
                            <Feather name="chevron-right" size={16} color={colors.textMuted} />
                          </Pressable>
                        ))}
                      </View>
                    ) : null}
                  </View>
                );
              })}

              {filteredStandalone.map((item) => (
                <Pressable
                  key={item.href}
                  onPress={() => openItem(item)}
                  style={({ hovered }: any) => [styles.standaloneRow, hovered && styles.rowHovered]}
                >
                  <View style={styles.iconBadge}>
                    <Feather name={item.icon} size={18} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>{item.label}</Text>
                    <Text style={styles.description}>{item.description}</Text>
                  </View>
                  <Feather name="chevron-right" size={18} color={colors.textMuted} />
                </Pressable>
              ))}
            </View>
          )}
        </Container>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text,
    paddingVertical: 4,
  },
  empty: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
  list: {
    gap: spacing.md,
  },
  groupCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  groupCardOpen: {
    borderColor: colors.primary,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
  },
  groupIconBadge: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupTitle: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: colors.text,
  },
  groupDescription: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 1,
  },
  chevronBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
    transform: [{ rotate: '-90deg' }],
  },
  chevronBadgeOpen: {
    backgroundColor: colors.primarySoft,
    transform: [{ rotate: '0deg' }],
  },
  groupBody: {
    backgroundColor: colors.surfaceAlt,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  rowHovered: {
    backgroundColor: colors.surface,
  },
  standaloneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  description: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
});
