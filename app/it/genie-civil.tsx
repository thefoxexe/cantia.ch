import { forceLocale } from '../../lib/translations';
import { TradePage } from '../../components/TradePage';

forceLocale('it');

export default function GenieCivilScreenIt() {
  return <TradePage slug="genie-civil" />;
}
