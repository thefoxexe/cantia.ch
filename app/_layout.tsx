import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '../lib/auth-context';
import { getPendingInvite } from '../lib/pendingInvite';
import { isAppHost, excludeAppHostFromIndexing } from '../lib/appHost';
import { registerForPushNotificationsAsync } from '../lib/notifications/registerPush';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { SaveConfirmationOverlay } from '../components/SaveConfirmation';
import '../lib/pwaInstall';

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

  // Ask for push permission once signed in — the standard place to prompt
  // is right after auth resolves, not at cold start before there's even a
  // user to attach the token to.
  useEffect(() => {
    if (session?.user) {
      registerForPushNotificationsAsync(session.user.id);
    }
  }, [session?.user]);

  // Tapping a push notification (app backgrounded/closed) navigates straight
  // to whatever it was about.
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const link = response.notification.request.content.data?.link as string | undefined;
      if (link) router.push(link as any);
    });
    return () => sub.remove();
  }, [router]);

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

  return (
    <>
      <ErrorBoundary>
        <Stack screenOptions={{ headerShown: false }} />
      </ErrorBoundary>
      <SaveConfirmationOverlay />
    </>
  );
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
