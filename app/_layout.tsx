import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '../lib/auth-context';
import { colors } from '../lib/theme';

function RootNavigation() {
  const { session, organization, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const segmentList = segments as string[];
    const inAuthGroup = segmentList[0] === '(auth)';
    const inAppGroup = segmentList[0] === '(app)';
    const isLanding = segmentList.length === 0;
    const subroute = segmentList[1];

    if (session && organization) {
      if (inAuthGroup || isLanding) router.replace('/(app)');
    } else if (session && !organization) {
      if (subroute !== 'onboarding') router.replace('/(auth)/onboarding');
    } else if (inAppGroup) {
      router.replace('/(auth)/login');
    }
  }, [session, organization, loading, segments, router]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

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
