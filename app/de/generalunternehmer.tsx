import { forceLocale } from '../../lib/translations';
import { TradePage } from '../../components/TradePage';

forceLocale('de');

export default function EntrepriseGeneraleScreenDe() {
  return <TradePage slug="entreprise-generale" />;
}
