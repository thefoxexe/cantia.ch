import { Platform } from 'react-native';
import { Redirect } from 'expo-router';
import { SectorPage } from '../../components/site/SectorPages';

// cantia.ch/metiers/service-entretien (and /de, /it): the sector page, lib/site/sectors.ts.
export default function ServiceEntretienScreen() {
  if (Platform.OS !== 'web') return <Redirect href="/(auth)/login" />;
  return <SectorPage sector="services" />;
}
