import { TradePage } from '../components/TradePage';
import { TRADE_PAGES } from '../lib/tradeLandingPages';

export default function FacadierScreen() {
  return <TradePage trade={TRADE_PAGES['facadier']} />;
}
