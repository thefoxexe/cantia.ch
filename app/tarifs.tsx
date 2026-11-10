import { Platform } from 'react-native';
import { Redirect } from 'expo-router';
import { PricingPage } from '../components/site/PricingPage';

// cantia.ch/tarifs (and /de/tarifs, /it/tarifs, which force their locale):
// a stable, indexable pricing URL for directories and ads. Prices are read
// live from the plans table, see components/site/PricingPage.tsx.
export default function TarifsScreen() {
  if (Platform.OS !== 'web') return <Redirect href="/(auth)/login" />;
  return <PricingPage />;
}
