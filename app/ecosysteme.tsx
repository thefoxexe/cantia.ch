import { Platform } from 'react-native';
import { Redirect } from 'expo-router';
import { EcosystemPage } from '../components/site/InnerPages';

// cantia.ch/ecosysteme (and /de, /it): see components/site/InnerPages.tsx.
export default function EcosystemeScreen() {
  if (Platform.OS !== 'web') return <Redirect href="/(auth)/login" />;
  return <EcosystemPage />;
}
