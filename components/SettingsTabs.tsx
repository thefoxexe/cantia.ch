import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { colors, fontSize, radius, spacing } from '../lib/theme';

interface SettingsTab {
  key: string;
  label: string;
  href: string;
}

const TABS: SettingsTab[] = [
  { key: 'entreprise', label: 'Entreprise', href: '/(app)/compte/entreprise' },
  { key: 'apparence', label: 'Apparence', href: '/(app)/compte/apparence' },
  { key: 'devis', label: 'Facturation', href: '/(app)/compte/devis' },
  { key: 'modules', label: 'Modules', href: '/(app)/compte/modules' },
  { key: 'equipe', label: 'Équipe', href: '/(app)/compte/equipe' },
  { key: 'stockage', label: 'Stockage', href: '/(app)/compte/stockage' },
  { key: 'abonnement', label: 'Abonnement', href: '/(app)/compte/facturation' },
  { key: 'profil', label: 'Mon profil', href: '/(app)/compte/profil' },
  { key: 'aide', label: 'Aide', href: '/(app)/compte/aide' },
];

export function SettingsTabs() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll} contentContainerStyle={styles.row}>
      {TABS.map((tab) => {
        const compare = tab.href.replace('/(app)', '');
        const active = pathname === compare;
        return (
          <Pressable
            key={tab.key}
            onPress={() => router.push(tab.href as any)}
            style={[styles.pill, active && styles.pillActive]}
          >
            <Text style={[styles.pillText, active && styles.pillTextActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
  },
  pillActive: {
    backgroundColor: colors.primary,
  },
  pillText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textMuted,
  },
  pillTextActive: {
    color: '#fff',
  },
});
