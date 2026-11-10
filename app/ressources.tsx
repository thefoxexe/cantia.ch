import { Platform } from 'react-native';
import { Redirect } from 'expo-router';
import { ResourcesPage } from '../components/site/InnerPages';

// cantia.ch/ressources (and /de, /it): see components/site/InnerPages.tsx.
export default function RessourcesScreen() {
  if (Platform.OS !== 'web') return <Redirect href="/(auth)/login" />;
  return <ResourcesPage />;
}
