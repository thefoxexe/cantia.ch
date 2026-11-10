import { Platform } from 'react-native';
import { Redirect } from 'expo-router';
import { FamilyPage } from '../components/site/FamilyPage';

// cantia.ch/signer (and /de, /it): see components/site/FamilyPage.tsx.
export default function SignerScreen() {
  if (Platform.OS !== 'web') return <Redirect href="/(auth)/login" />;
  return <FamilyPage family="signer" />;
}
