import { forceLocale } from '../../../../lib/translations';
import SubTradeScreen from '../../../metiers/bureaux-etudes/[trade]';
import { allSubTradeSlugs } from '../../../../lib/site/subTrades';

forceLocale('de');

export default SubTradeScreen;
export function generateStaticParams() {
  return allSubTradeSlugs('etudes').map((trade) => ({ trade }));
}
