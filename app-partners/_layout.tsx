import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { PartnersLocaleProvider } from '../lib/partners/locale';

// Route root of partners.cantia.ch (PARTNERS_BUILD=1, see app.config.js and
// scripts/build-partners.mjs). Same Supabase project and accounts as the
// app, none of the app's organization logic.
export default function PartnersRootLayout() {
  return (
    <SafeAreaProvider>
      <PartnersLocaleProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }} />
      </PartnersLocaleProvider>
    </SafeAreaProvider>
  );
}
