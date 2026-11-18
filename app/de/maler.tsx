import { forceLocale } from '../../lib/translations';
import { TradePage } from '../../components/TradePage';

forceLocale('de');

export default function PeintreScreenDe() {
  return <TradePage slug="peintre" />;
}
