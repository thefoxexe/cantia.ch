import { Platform } from 'react-native';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { SubTradePage } from '../../../components/site/SectorPages';
import { allSubTradeSlugs } from '../../../lib/site/subTrades';

// cantia.ch/metiers/bureaux-etudes/<trade> (and /de, /it): one trade of the sector,
// content in lib/site/subTrades.
export function generateStaticParams() {
  return allSubTradeSlugs('etudes').map((trade) => ({ trade }));
}

export default function SubTradeScreen() {
  const { trade } = useLocalSearchParams<{ trade: string }>();
  if (Platform.OS !== 'web') return <Redirect href="/(auth)/login" />;
  return <SubTradePage sector="etudes" slug={String(trade ?? '')} />;
}
