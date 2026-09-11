import { forceLocale } from '../../../lib/translations';
import { PlanDetailPage } from '../../../components/PlanDetailPage';

forceLocale('de');

export default function EssentielPlanPageDe() {
  return <PlanDetailPage planId="solo" />;
}
