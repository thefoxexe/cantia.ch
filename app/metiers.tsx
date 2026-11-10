import { Platform } from 'react-native';
import { Redirect } from 'expo-router';
import { MetiersPage } from '../components/site/InnerPages';

// cantia.ch/metiers (and /de, /it): see components/site/InnerPages.tsx.
export default function MetiersScreen() {
  if (Platform.OS !== 'web') return <Redirect href="/(auth)/login" />;
  return <MetiersPage />;
}
