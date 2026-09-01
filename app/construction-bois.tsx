import { TradePage } from '../components/TradePage';
import { TRADE_PAGES } from '../lib/tradeLandingPages';

export default function ConstructionBoisScreen() {
  return <TradePage trade={TRADE_PAGES['construction-bois']} />;
}
