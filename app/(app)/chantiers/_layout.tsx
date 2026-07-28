import { Stack } from 'expo-router';
import { colors } from '../../../lib/theme';

export default function ChantiersLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerShadowVisible: false,
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Chantiers' }} />
      <Stack.Screen name="new" options={{ title: 'Nouveau chantier', presentation: 'modal' }} />
      <Stack.Screen name="[id]/index" options={{ title: 'Chantier' }} />
      <Stack.Screen name="[id]/rapport-new" options={{ title: 'Nouveau rapport', presentation: 'modal' }} />
    </Stack>
  );
}
