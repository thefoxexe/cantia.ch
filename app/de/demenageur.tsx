import { forceLocale } from '../../lib/translations';
import { TradePage } from '../../components/TradePage';

forceLocale('de');

export default function DemenageurScreenDe() {
  return <TradePage slug="demenageur" />;
}
