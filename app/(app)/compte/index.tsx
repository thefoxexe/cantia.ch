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

// Du plus important au moins important pour faire tourner l'affaire, pas
// alphabétique : l'identité de l'entreprise (tout en dépend, y compris la
// QR-facture) d'abord, puis ce qui touche directement le chiffre d'affaires
// (devis/factures, e-mails aux clients), puis l'équipe, puis le reste
// (abonnement, modules, notifications) et enfin les réglages les plus
// personnels/occasionnels (apparence, stockage, profil, aide) en dernier.
// Labels/descriptions come from compteMenu.<key> in lib/translations —
// resolved in the component so they stay reactive to the current locale.
const ITEMS: { href: string; icon: IconName; key: MenuKey; external?: boolean }[] = [
  { href: '/(app)/compte/entreprise', icon: 'briefcase', key: 'entreprise' },
  { href: '/(app)/compte/devis', icon: 'file-text', key: 'devis' },
  { href: '/(app)/compte/emails', icon: 'mail', key: 'emails' },
  { href: '/(app)/compte/equipe', icon: 'users', key: 'equipe' },
  { href: '/(app)/compte/facturation', icon: 'credit-card', key: 'facturation' },
  // Visible to everyone regardless of plan — Bexio itself is gated inside
  // the screen (greyed out with an upgrade prompt below the Entreprise
  // plan), not by hiding the entry point, so what's missing is legible
  // rather than invisible.
  { href: '/(app)/compte/integrations', icon: 'link', key: 'integrations' },
  { href: '/(app)/compte/modules', icon: 'grid', key: 'modules' },
  { href: '/(app)/compte/notifications', icon: 'bell', key: 'notifications' },
  { href: '/(app)/compte/apparence', icon: 'droplet', key: 'apparence' },
  { href: '/(app)/compte/stockage', icon: 'hard-drive', key: 'stockage' },
  { href: '/(app)/compte/profil', icon: 'user', key: 'profil' },
  // Opens the real cantia.ch/aide instead of a second, in-app copy of the
  // same content — see lib/appHost.ts's helpHref().
  { href: helpHref(), icon: 'help-circle', key: 'aide', external: true },
  { href: '/(app)/compte/danger', icon: 'alert-triangle', key: 'danger' },
];

const RH_ITEM: { href: string; icon: IconName; key: MenuKey; external?: boolean } = {
  href: '/(app)/compte/rh',
  icon: 'dollar-sign' as IconName,
  key: 'rh',
};

export default function CompteIndexScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { organization, canManagePayroll } = useAuth();
  const [query, setQuery] = useState('');

  // Only shown to whoever can actually use it — a plain employee has
  // nothing to configure here (they just pick from the lists an admin has
  // already set up), and the module might not even be enabled/on-plan.
  // Spliced in right after "Facturation" rather than appended — found by
  // href instead of a hardcoded index so it stays correctly placed if
  // ITEMS above ever gets reordered again.
  const allItems = useMemo(() => {
    const base =
      !canManagePayroll || !isModuleEnabled(organization?.enabled_modules, 'payroll')
        ? ITEMS
        : (() => {
            const insertAt = ITEMS.findIndex((item) => item.href === '/(app)/compte/devis') + 1;
            return [...ITEMS.slice(0, insertAt), RH_ITEM, ...ITEMS.slice(insertAt)];
          })();
    return base.map((item) => ({
      ...item,
      label: t(`compteMenu.${item.key}.label`),
      description: t(`compteMenu.${item.key}.description`),
    }));
  }, [canManagePayroll, organization?.enabled_modules, t]);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allItems;
    return allItems.filter((item) => item.label.toLowerCase().includes(q) || item.description.toLowerCase().includes(q));
  }, [allItems, query]);

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
          {items.length === 0 ? (
            <Text style={styles.empty}>{t('compteMenu.noResults', { query })}</Text>
          ) : (
            <View style={styles.list}>
              {items.map((item) => (
                <Pressable
                  key={item.href}
                  onPress={() => (item.external ? Linking.openURL(item.href) : router.push(item.href as any))}
                  style={({ hovered }: any) => [styles.row, hovered && styles.rowHovered]}
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
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  rowHovered: {
    borderColor: colors.primary,
  },
  iconBadge: {
    width: 42,
    height: 42,
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
