import { TradePage } from '../components/TradePage';
import { TRADE_PAGES } from '../lib/tradeLandingPages';

export default function GenieCivilScreen() {
  return <TradePage trade={TRADE_PAGES['genie-civil']} />;
}
