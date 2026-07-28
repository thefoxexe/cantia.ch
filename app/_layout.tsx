import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '../lib/auth-context';
import { LanguageProvider } from '../lib/i18n';

function RootNavigation() {
  const { session, organization, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // The landing page and auth screens render immediately regardless of
  // `loading` — only the redirect decision waits for auth to resolve, so a
  // slow/hanging auth check never blocks the public pages from showing.
  useEffect(() => {
    if (loading) return;
    const segmentList = segments as string[];
    const inAuthGroup = segmentList[0] === '(auth)';
    const inAppGroup = segmentList[0] === '(app)';
    const isLanding = segmentList.length === 0;
    const subroute = segmentList[1];

    if (session && organization && !organization.plan_selected) {
      if (subroute !== 'choose-plan') router.replace('/(auth)/choose-plan');
    } else if (session && organization) {
      if (inAuthGroup || isLanding) router.replace('/(app)');
    } else if (session && !organization) {
      if (subroute !== 'onboarding') router.replace('/(auth)/onboarding');
    } else if (inAppGroup) {
      router.replace('/(auth)/login');
    }
  }, [session, organization, loading, segments, router]);

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <LanguageProvider>
          <AuthProvider>
            <StatusBar style="dark" />
            <RootNavigation />
          </AuthProvider>
        </LanguageProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
