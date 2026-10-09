import { forceLocale } from '../../lib/translations';
import { TradePage } from '../../components/TradePage';

forceLocale('de');

export default function EntrepriseNettoyageScreenDe() {
  return <TradePage slug="entreprise-nettoyage" />;
}
