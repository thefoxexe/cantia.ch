import { Platform } from 'react-native';
import { Redirect } from 'expo-router';
import { AssistantPage } from '../components/site/SoftwarePages';

// cantia.ch/assistant (and /de, /it): see components/site/SoftwarePages.tsx.
export default function AssistantScreen() {
  if (Platform.OS !== 'web') return <Redirect href="/(auth)/login" />;
  return <AssistantPage />;
}
