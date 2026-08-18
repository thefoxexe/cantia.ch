import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

// Standalone route root used only for the marketing-only static export (see
// scripts/build-marketing.mjs and package.json's build:marketing script).
// It deliberately skips AuthProvider and the session-redirect logic from
// app/_layout.tsx — none of the pages routed through here need a session,
// and pulling in Supabase auth would only slow down and complicate a build
// whose only job is producing plain prerendered HTML for crawlers/LLMs.
export default function MarketingRootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
