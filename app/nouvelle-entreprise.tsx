import { Platform } from 'react-native';
import { Redirect } from 'expo-router';
import { NewCompanyPage } from '../components/site/InnerPages';

// cantia.ch/nouvelle-entreprise (and /de, /it): 3 months offered to new
// companies, see components/site/InnerPages.tsx and lib/site/newCompany.ts.
export default function NewCompanyScreen() {
  if (Platform.OS !== 'web') return <Redirect href="/(auth)/login" />;
  return <NewCompanyPage />;
}
