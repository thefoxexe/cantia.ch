import { Pressable, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors, fontSize, spacing } from '../lib/theme';
import { sans } from '../lib/siteTheme';

// Back link in a Stack header (devis, facture and trame pages): always lands
// on the list it belongs to, like the « ← Chantiers » link of a chantier,
// rather than relying on browser history that a tab switch can empty.
export function StackBack({ to, label }: { to: string; label: string }) {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.replace(to as never)}
      hitSlop={8}
      accessibilityRole="link"
      style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.md }}
    >
      <Feather name="arrow-left" size={16} color={colors.textMuted} />
      <Text style={[sans, { fontSize: fontSize.sm, color: colors.textMuted, fontWeight: '500' }]}>{label}</Text>
    </Pressable>
  );
}

export const stackHeaderTitleStyle = { ...sans, fontWeight: '600' as const, fontSize: 17, color: colors.text };
