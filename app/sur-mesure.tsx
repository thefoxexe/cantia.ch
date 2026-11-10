import { Platform } from 'react-native';
import { Redirect } from 'expo-router';
import { SurMesurePage } from '../components/site/InnerPages';

// cantia.ch/sur-mesure (and /de, /it): see components/site/InnerPages.tsx.
export default function SurMesureScreen() {
  if (Platform.OS !== 'web') return <Redirect href="/(auth)/login" />;
  return <SurMesurePage />;
}
