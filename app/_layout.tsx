import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '../lib/auth-context';
import { getPendingInvite } from '../lib/pendingInvite';
import { isAppHost, excludeAppHostFromIndexing } from '../lib/appHost';

function RootNavigation() {
  const { session, organization, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  // undefined = not read from storage yet, null = no pending invite.
  const [pendingInvite, setPendingInvite] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    getPendingInvite().then(setPendingInvite);
  }, []);

  useEffect(() => {
    excludeAppHostFromIndexing();
  }, []);

  // The landing page and auth screens render immediately regardless of
  // `loading` — only the redirect decision waits for auth to resolve, so a
  // slow/hanging auth check never blocks the public pages from showing.
  useEffect(() => {
    if (loading || pendingInvite === undefined) return;
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
      // A pending invite (from visiting a /join/<token> link) takes priority
      // over the "create your own company" onboarding flow.
      if (pendingInvite) {
        if (subroute !== 'join') router.replace(`/(auth)/join/${pendingInvite}`);
      } else if (subroute !== 'onboarding') {
        router.replace('/(auth)/onboarding');
      }
    } else if (inAppGroup) {
      router.replace('/(auth)/login');
    } else if (isLanding && isAppHost()) {
      // app.cantia.ch never shows the marketing landing page — an anonymous
      // visitor there lands straight on the login screen instead.
      router.replace('/(auth)/login');
    }
  }, [session, organization, loading, pendingInvite, segments, router]);

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar style="dark" />
          <RootNavigation />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
