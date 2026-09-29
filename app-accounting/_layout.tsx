import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AccountingLocaleProvider } from '../lib/accounting/locale';

// Route root of accounting.cantia.ch (ACCOUNTING_BUILD=1, see app.config.js
// and scripts/build-accounting.mjs). Same Supabase project and accounts as
// the app and Partners, none of the app's organization logic.
export default function AccountingRootLayout() {
  return (
    <SafeAreaProvider>
      <AccountingLocaleProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }} />
      </AccountingLocaleProvider>
    </SafeAreaProvider>
  );
}
