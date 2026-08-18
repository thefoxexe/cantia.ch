import { useMemo, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { isModuleEnabled } from '../../../lib/modules';
import { helpHref } from '../../../lib/appHost';
import { Container, PageHeader, Screen } from '../../../components/ui';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';

type IconName = keyof typeof Feather.glyphMap;

// Ordered by how global/frequent a setting is, not alphabetically: core
// business settings first (entreprise/abonnement/équipe/facturation), then
// RH & Salaires — used constantly by anyone managing payroll, so it sits
// above the more occasional config screens rather than trailing behind
// personal items like Mon profil/Aide.
const ITEMS: { href: string; icon: IconName; label: string; description: string; external?: boolean }[] = [
  { href: '/(app)/compte/entreprise', icon: 'briefcase', label: 'Entreprise', description: "Coordonnées, TVA, IBAN et informations légales." },
  { href: '/(app)/compte/facturation', icon: 'credit-card', label: 'Abonnement', description: 'Votre plan et vos moyens de paiement.' },
  { href: '/(app)/compte/equipe', icon: 'users', label: 'Équipe', description: 'Membres, invitations et rôles personnalisés.' },
  { href: '/(app)/compte/devis', icon: 'file-text', label: 'Facturation', description: 'Réglages des devis et factures.' },
  { href: '/(app)/compte/modules', icon: 'grid', label: 'Outils & modules', description: "Sections de l'application activées pour votre équipe." },
  { href: '/(app)/compte/apparence', icon: 'droplet', label: 'Apparence', description: 'Logo, couleur de marque et mise en page des PDF.' },
  { href: '/(app)/compte/stockage', icon: 'hard-drive', label: 'Stockage', description: 'Espace utilisé par vos chantiers.' },
  { href: '/(app)/compte/profil', icon: 'user', label: 'Mon profil', description: 'Nom, photo et mot de passe.' },
  // Opens the real cantia.ch/aide instead of a second, in-app copy of the
  // same content — see lib/appHost.ts's helpHref().
  { href: helpHref(), icon: 'help-circle', label: 'Aide', description: 'Questions fréquentes et assistance.', external: true },
];

const RH_ITEM: { href: string; icon: IconName; label: string; description: string; external?: boolean } = {
  href: '/(app)/compte/rh',
  icon: 'dollar-sign' as IconName,
  label: 'RH & Salaires',
  description: 'Types de travail, frais et cotisations utilisés par le module RH.',
};

export default function CompteIndexScreen() {
  const router = useRouter();
  const { organization, canManagePayroll } = useAuth();
  const [query, setQuery] = useState('');
  // Only shown to whoever can actually use it — a plain employee has
  // nothing to configure here (they just pick from the lists an admin has
  // already set up), and the module might not even be enabled/on-plan.
  // Spliced in right after "Facturation" rather than appended — see the
  // ordering note on ITEMS above.
  const allItems =
    canManagePayroll && isModuleEnabled(organization?.enabled_modules, 'payroll')
      ? [...ITEMS.slice(0, 4), RH_ITEM, ...ITEMS.slice(4)]
      : ITEMS;

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allItems;
    return allItems.filter((item) => item.label.toLowerCase().includes(q) || item.description.toLowerCase().includes(q));
  }, [allItems, query]);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl * 2 }}>
        <Container>
          <PageHeader title="Compte" backTo="/(app)" />
          <View style={styles.searchBar}>
            <Feather name="search" size={16} color={colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="Rechercher un réglage…"
              placeholderTextColor={colors.textMuted}
            />
            {query ? (
              <Pressable onPress={() => setQuery('')} hitSlop={8}>
                <Feather name="x" size={16} color={colors.textMuted} />
              </Pressable>
            ) : null}
          </View>
          {items.length === 0 ? (
            <Text style={styles.empty}>Aucun réglage ne correspond à « {query} ».</Text>
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
