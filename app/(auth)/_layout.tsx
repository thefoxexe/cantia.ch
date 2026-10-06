import { Stack, usePathname } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../lib/auth-context';
import { useTranslation } from '../../lib/translations';
import { colors, fontSize, radius, spacing } from '../../lib/theme';

// Screens a signed-in user can land on before reaching the app (plan
// choice, company creation, setup…): a way out on every one of them.
const SIGNED_IN_FLOW = ['/choose-plan', '/onboarding'];

export default function AuthLayout() {
  const { session, signOut } = useAuth();
  const { t } = useTranslation();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const show = !!session && SIGNED_IN_FLOW.some((p) => pathname.startsWith(p));

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }} />
      {show ? (
        <Pressable
          onPress={signOut}
          accessibilityRole="button"
          style={({ pressed }) => [styles.signOut, { top: insets.top + spacing.md }, pressed && { opacity: 0.8 }]}
        >
          <Feather name="log-out" size={14} color={colors.text} />
          <Text style={styles.signOutText}>{t('authOnboardingHub.signOut')}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  signOut: {
    position: 'absolute',
    right: spacing.lg,
    zIndex: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  signOutText: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
});
