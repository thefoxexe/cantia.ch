import { Platform } from 'react-native';
import { Redirect } from 'expo-router';
import { AppPage } from '../components/site/InnerPages';

// cantia.ch/telechargement (and /de, /it): see components/site/InnerPages.tsx.
export default function TelechargementScreen() {
  if (Platform.OS !== 'web') return <Redirect href="/(auth)/login" />;
  return <AppPage />;
}
