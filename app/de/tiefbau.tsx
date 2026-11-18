import { forceLocale } from '../../lib/translations';
import { TradePage } from '../../components/TradePage';

forceLocale('de');

export default function GenieCivilScreenDe() {
  return <TradePage slug="genie-civil" />;
}
