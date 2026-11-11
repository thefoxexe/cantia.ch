import { forceLocale } from '../../../../lib/translations';
import SubTradeScreen from '../../../metiers/service-entretien/[trade]';
import { allSubTradeSlugs } from '../../../../lib/site/subTrades';

forceLocale('it');

export default SubTradeScreen;
export function generateStaticParams() {
  return allSubTradeSlugs('services').map((trade) => ({ trade }));
}
