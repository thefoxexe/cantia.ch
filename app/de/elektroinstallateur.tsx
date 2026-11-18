import { forceLocale } from '../../lib/translations';
import { TradePage } from '../../components/TradePage';

forceLocale('de');

export default function ElectricienScreenDe() {
  return <TradePage slug="electricien" />;
}
