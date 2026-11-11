import { Platform } from 'react-native';
import { Redirect } from 'expo-router';
import { ComparePage } from '../components/site/InnerPages';

// cantia.ch/comparatifs (and /de, /it): see components/site/InnerPages.tsx.
export default function ComparatifsScreen() {
  if (Platform.OS !== 'web') return <Redirect href="/(auth)/login" />;
  return <ComparePage />;
}
