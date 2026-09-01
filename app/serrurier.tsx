import { TradePage } from '../components/TradePage';
import { TRADE_PAGES } from '../lib/tradeLandingPages';

export default function SerrurierScreen() {
  return <TradePage trade={TRADE_PAGES['serrurier']} />;
}
