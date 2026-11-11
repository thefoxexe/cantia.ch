import { forceLocale } from '../../../../lib/translations';
import SubTradeScreen from '../../../metiers/agences-evenementiel/[trade]';
import { allSubTradeSlugs } from '../../../../lib/site/subTrades';

forceLocale('de');

export default SubTradeScreen;
export function generateStaticParams() {
  return allSubTradeSlugs('creatifs').map((trade) => ({ trade }));
}
