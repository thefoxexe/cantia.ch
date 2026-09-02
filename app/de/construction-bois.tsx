import { forceLocale } from '../../lib/translations';
import { TradePage } from '../../components/TradePage';

forceLocale('de');

export default function ConstructionBoisScreenDe() {
  return <TradePage slug="construction-bois" />;
}
