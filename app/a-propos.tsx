import { Platform } from 'react-native';
import { Redirect } from 'expo-router';
import { AboutPage } from '../components/site/InnerPages';

// cantia.ch/a-propos (and /de, /it), formerly /ecosysteme (301 in
// netlify.toml): see components/site/InnerPages.tsx.
export default function AProposScreen() {
  if (Platform.OS !== 'web') return <Redirect href="/(auth)/login" />;
  return <AboutPage />;
}
