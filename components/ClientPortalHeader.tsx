import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSize, radius, spacing } from '../lib/theme';
import { portalFonts } from '../lib/clientPortalTheme';
import { SwissCross } from './SwissCross';

// Shared brand header for the public client portal pages (devis-client,
// facture-client) — these are the only screens in the app a non-customer
// (the org's own client) ever sees, so it doubles as advertising: seeing
// "Cantia" attached to a slick, secure document flow is itself the pitch.
// The trust chip (Swiss cross + "Sécurisé") lives in the header itself
// rather than as a separate banner below, so the brand and the promise of
// security read as one unified statement instead of two stacked notices.
export function ClientPortalHeader({ onMenuPress }: { onMenuPress?: () => void }) {
  return (
    <View style={styles.row}>
      <View style={styles.brand}>
        <Image source={require('../assets/logo-mark.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.brandText}>Cantia</Text>
      </View>
      <View style={styles.right}>
        <View style={styles.trustChip}>
          <SwissCross size={12} />
          <Feather name="shield" size={12} color={colors.success} />
          <Text style={styles.trustChipText}>Sécurisé</Text>
        </View>
        {onMenuPress ? (
          <Pressable onPress={onMenuPress} style={styles.menuButton} hitSlop={8} accessibilityLabel="Mes documents">
            <Feather name="menu" size={18} color={colors.text} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    marginBottom: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logo: {
    width: 26,
    height: 26,
  },
  brandText: {
    fontFamily: portalFonts.display,
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.3,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  trustChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.successSoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  trustChipText: {
    fontFamily: portalFonts.body,
    fontSize: 11,
    fontWeight: '700',
    color: colors.success,
  },
  menuButton: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
