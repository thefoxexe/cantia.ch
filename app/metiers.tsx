import { Platform } from 'react-native';
import { Redirect } from 'expo-router';
import { MetiersPage } from '../components/site/SectorPages';

// cantia.ch/metiers (and /de, /it): see components/site/SectorPages.tsx.
export default function MetiersScreen() {
  if (Platform.OS !== 'web') return <Redirect href="/(auth)/login" />;
  return <MetiersPage />;
}
