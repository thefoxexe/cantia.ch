import { forceLocale } from '../../lib/translations';
import { TradePage } from '../../components/TradePage';

forceLocale('it');

export default function MaconScreenIt() {
  return <TradePage slug="macon" />;
}
