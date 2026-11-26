import { Platform } from 'react-native';
import { Redirect } from 'expo-router';
import { BlackFridayPage } from '../components/site/BlackFridayPage';

// cantia.ch/black-friday (and /de, /it): lifetime prices until Monday
// 30 November 2026 at midnight, see lib/site/blackFriday.ts.
export default function BlackFridayScreen() {
  if (Platform.OS !== 'web') return <Redirect href="/(auth)/login" />;
  return <BlackFridayPage />;
}
