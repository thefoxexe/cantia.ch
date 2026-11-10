import { Platform } from 'react-native';
import { Redirect } from 'expo-router';
import { SectorPage } from '../../components/site/SectorPages';

// cantia.ch/metiers/agences-evenementiel (and /de, /it): the sector page, lib/site/sectors.ts.
export default function AgencesEvenementielScreen() {
  if (Platform.OS !== 'web') return <Redirect href="/(auth)/login" />;
  return <SectorPage sector="creatifs" />;
}
