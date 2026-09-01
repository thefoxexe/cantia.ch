import { TradePage } from '../components/TradePage';
import { TRADE_PAGES } from '../lib/tradeLandingPages';

export default function CouvreurScreen() {
  return <TradePage trade={TRADE_PAGES['couvreur']} />;
}
