import { StyleSheet, Text, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { Button, LoadingScreen, Screen } from '../../../components/ui';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';

// A member without the finance permission (see équipe screen) is already
// kept out of RLS-protected data on every route below, and out of the nav
// entirely (app/(app)/_layout.tsx) — this catches the remaining case of a
// stale bookmark/deep link or the back button landing here directly, with
// an explicit message instead of a confusing "empty list" or a blank
// insert-failed error.
function AccessDenied() {
  const router = useRouter();
  return (
    <Screen>
      <View style={styles.deniedWrap}>
        <View style={styles.deniedIcon}>
          <Feather name="lock" size={22} color={colors.textMuted} />
        </View>
        <Text style={styles.deniedTitle}>Accès non autorisé</Text>
        <Text style={styles.deniedText}>
          Vous n'avez pas accès aux devis et factures de cette entreprise. Demandez à un administrateur de vous
          donner accès depuis Équipe.
        </Text>
        <Button title="Retour à l'accueil" onPress={() => router.replace('/(app)')} />
      </View>
    </Screen>
  );
}

export default function DevisLayout() {
  const { canViewFinances, loading } = useAuth();
  // The membership/role fetch that determines canViewFinances is async and
  // starts out false — without this guard, landing here directly (deep
  // link, bookmark, hard refresh) flashes "Accès non autorisé" for every
  // user, owners included, until it resolves a moment later.
  if (loading) return <LoadingScreen />;
  if (!canViewFinances) return <AccessDenied />;
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerShadowVisible: false,
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      {/* These list screens render their own PageHeader (back arrow +
          title) — the Stack's auto header would otherwise stack a second
          title above it. */}
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="new" options={{ title: 'Nouveau devis', presentation: 'modal' }} />
      <Stack.Screen name="[id]" options={{ title: 'Devis' }} />
      <Stack.Screen name="factures/index" options={{ headerShown: false }} />
      <Stack.Screen name="factures/new" options={{ title: 'Nouvelle facture', presentation: 'modal' }} />
      <Stack.Screen name="factures/[id]" options={{ title: 'Facture' }} />
      <Stack.Screen name="factures/import-releve" options={{ headerShown: false }} />
      <Stack.Screen name="trames/index" options={{ headerShown: false }} />
      <Stack.Screen name="trames/new" options={{ title: 'Nouvelle trame', presentation: 'modal' }} />
      <Stack.Screen name="trames/[id]" options={{ title: 'Trame' }} />
      <Stack.Screen name="inventaire" options={{ headerShown: false }} />
      <Stack.Screen name="tva" options={{ headerShown: false }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  deniedWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  deniedIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  deniedTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  deniedText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
});
