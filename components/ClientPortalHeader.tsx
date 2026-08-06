import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSize, radius, spacing } from '../lib/theme';

// Shared brand header for the public client portal pages (devis-client,
// facture-client) — these are the only screens in the app a non-customer
// (the org's own client) ever sees, so it doubles as advertising: seeing
// "Cantia" attached to a slick, secure document flow is itself the pitch.
export function ClientPortalHeader({ onMenuPress }: { onMenuPress?: () => void }) {
  return (
    <View style={styles.row}>
      <View style={styles.brand}>
        <Image source={require('../assets/logo-mark.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.brandText}>Cantia</Text>
      </View>
      {onMenuPress ? (
        <Pressable onPress={onMenuPress} style={styles.menuButton} hitSlop={8} accessibilityLabel="Mes documents">
          <Feather name="menu" size={20} color={colors.text} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logo: {
    width: 28,
    height: 28,
  },
  brandText: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.text,
  },
  menuButton: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
