import { Platform } from 'react-native';
import { Redirect } from 'expo-router';
import { FamilyPage } from '../components/site/FamilyPage';

// cantia.ch/collaborer (and /de, /it): see components/site/FamilyPage.tsx.
export default function CollaborerScreen() {
  if (Platform.OS !== 'web') return <Redirect href="/(auth)/login" />;
  return <FamilyPage family="collaborer" />;
}
