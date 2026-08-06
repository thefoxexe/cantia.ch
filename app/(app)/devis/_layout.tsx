import { Stack } from 'expo-router';
import { colors } from '../../../lib/theme';

export default function DevisLayout() {
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
      <Stack.Screen name="factures/[id]" options={{ title: 'Facture' }} />
      <Stack.Screen name="trames/index" options={{ headerShown: false }} />
      <Stack.Screen name="trames/new" options={{ title: 'Nouvelle trame', presentation: 'modal' }} />
      <Stack.Screen name="trames/[id]" options={{ title: 'Trame' }} />
      <Stack.Screen name="inventaire" options={{ headerShown: false }} />
    </Stack>
  );
}
