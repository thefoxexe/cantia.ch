import { forceLocale } from '../../lib/translations';
import { TradePage } from '../../components/TradePage';

forceLocale('it');

export default function EntrepriseGeneraleScreenIt() {
  return <TradePage slug="entreprise-generale" />;
}
