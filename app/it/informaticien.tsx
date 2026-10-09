import { forceLocale } from '../../lib/translations';
import { TradePage } from '../../components/TradePage';

forceLocale('it');

export default function InformaticienScreenIt() {
  return <TradePage slug="informaticien" />;
}
