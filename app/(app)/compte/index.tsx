import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Container, PageHeader, Screen } from '../../../components/ui';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';

type IconName = keyof typeof Feather.glyphMap;

const ITEMS: { href: string; icon: IconName; label: string; description: string }[] = [
  { href: '/(app)/compte/entreprise', icon: 'briefcase', label: 'Entreprise', description: "Coordonnées, TVA, IBAN et informations légales." },
  { href: '/(app)/compte/apparence', icon: 'droplet', label: 'Apparence', description: 'Logo, couleur de marque et mise en page des PDF.' },
  { href: '/(app)/compte/devis', icon: 'file-text', label: 'Facturation', description: 'Réglages des devis et factures.' },
  { href: '/(app)/compte/modules', icon: 'grid', label: 'Outils & modules', description: "Sections de l'application activées pour votre équipe." },
  { href: '/(app)/compte/equipe', icon: 'users', label: 'Équipe', description: 'Membres, invitations et rôles personnalisés.' },
  { href: '/(app)/compte/stockage', icon: 'hard-drive', label: 'Stockage', description: 'Espace utilisé par vos chantiers.' },
  { href: '/(app)/compte/facturation', icon: 'credit-card', label: 'Abonnement', description: 'Votre plan et vos moyens de paiement.' },
  { href: '/(app)/compte/profil', icon: 'user', label: 'Mon profil', description: 'Nom, photo et mot de passe.' },
  { href: '/(app)/compte/aide', icon: 'help-circle', label: 'Aide', description: 'Questions fréquentes et assistance.' },
];

export default function CompteIndexScreen() {
  const router = useRouter();

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl * 2 }}>
        <Container>
          <PageHeader title="Compte" backTo="/(app)" />
          <View style={styles.list}>
            {ITEMS.map((item) => (
              <Pressable
                key={item.href}
                onPress={() => router.push(item.href as any)}
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
        </Container>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
