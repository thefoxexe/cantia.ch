import { Platform } from 'react-native';
import { Redirect } from 'expo-router';
import { FeaturesPage } from '../components/site/SoftwarePages';

// cantia.ch/fonctionnalites (and /de, /it): see components/site/SoftwarePages.tsx.
export default function FeaturesScreen() {
  if (Platform.OS !== 'web') return <Redirect href="/(auth)/login" />;
  return <FeaturesPage />;
}
