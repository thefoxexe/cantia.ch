import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '../../lib/theme';

// Cantia's public profiles, shown in every site footer (cantia.ch,
// accounting.cantia.ch, partners.cantia.ch). Google Maps opens the Cantia
// business profile (Knowledge Graph id), where reviews are left.
export const SOCIAL_LINKS = [
  { label: 'Instagram', href: 'https://www.instagram.com/cantia.ch/', icon: 'logo-instagram', color: '#E1306C' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/cantiach/', icon: 'logo-linkedin', color: '#0A66C2' },
  { label: 'YouTube', href: 'https://www.youtube.com/@Cantiach', icon: 'logo-youtube', color: '#FF0000' },
  { label: 'Google Maps', href: 'https://www.google.com/search?kgmid=/g/11y0c24pg4&q=Cantia', icon: 'location-sharp', color: '#EA4335' },
] as const;

export function SocialLinks({ size = 18, style }: { size?: number; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.row, style]}>
      {SOCIAL_LINKS.map((s) => (
        <Link key={s.label} href={s.href} target="_blank" asChild>
          <Pressable style={styles.link} accessibilityLabel={s.label}>
            <Ionicons name={s.icon} size={size} color={s.color} />
          </Pressable>
        </Link>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  link: { padding: 2 },
});
