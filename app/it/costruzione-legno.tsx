import { forceLocale } from '../../lib/translations';
import { TradePage } from '../../components/TradePage';

forceLocale('it');

export default function ConstructionBoisScreenIt() {
  return <TradePage slug="construction-bois" />;
}
