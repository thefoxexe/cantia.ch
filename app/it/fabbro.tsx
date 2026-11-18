import { forceLocale } from '../../lib/translations';
import { TradePage } from '../../components/TradePage';

forceLocale('it');

export default function SerrurierScreenIt() {
  return <TradePage slug="serrurier" />;
}
