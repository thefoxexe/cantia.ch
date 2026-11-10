import { Stack } from 'expo-router';

// Every screen of the sign-up flow (onboarding, plan choice) draws its own
// bar with the way out (components/site/OnboardingShell).
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
