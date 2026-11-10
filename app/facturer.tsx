import { Platform } from 'react-native';
import { Redirect } from 'expo-router';
import { FamilyPage } from '../components/site/FamilyPage';

// cantia.ch/facturer (and /de, /it): see components/site/FamilyPage.tsx.
export default function FacturerScreen() {
  if (Platform.OS !== 'web') return <Redirect href="/(auth)/login" />;
  return <FamilyPage family="facturer" />;
}
