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
      <Stack.Screen name="index" options={{ title: 'Devis' }} />
      <Stack.Screen name="new" options={{ title: 'Nouveau devis', presentation: 'modal' }} />
      <Stack.Screen name="[id]" options={{ title: 'Devis' }} />
      <Stack.Screen name="factures/index" options={{ title: 'Factures' }} />
      <Stack.Screen name="factures/[id]" options={{ title: 'Facture' }} />
      <Stack.Screen name="trames/index" options={{ title: 'Trames' }} />
      <Stack.Screen name="trames/new" options={{ title: 'Nouvelle trame', presentation: 'modal' }} />
      <Stack.Screen name="trames/[id]" options={{ title: 'Trame' }} />
      {/* This screen renders its own PageHeader (back arrow + title) — the
          Stack's auto header would otherwise stack a second "inventaire"
          title above it. */}
      <Stack.Screen name="inventaire" options={{ headerShown: false }} />
    </Stack>
  );
}
