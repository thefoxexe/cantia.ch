import { TradePage } from '../components/TradePage';
import { TRADE_PAGES } from '../lib/tradeLandingPages';

export default function TerrassierScreen() {
  return <TradePage trade={TRADE_PAGES['terrassier']} />;
}
