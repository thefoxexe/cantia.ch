import { Platform } from 'react-native';
import { Redirect } from 'expo-router';
import { ContactPage } from '../components/site/InnerPages';

// cantia.ch/contact (and /de, /it): see components/site/InnerPages.tsx.
export default function ContactScreen() {
  if (Platform.OS !== 'web') return <Redirect href="/(auth)/login" />;
  return <ContactPage />;
}
