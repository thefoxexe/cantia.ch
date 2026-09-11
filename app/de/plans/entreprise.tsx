import { forceLocale } from '../../../lib/translations';
import { PlanDetailPage } from '../../../components/PlanDetailPage';

forceLocale('de');

export default function EntreprisePlanPageDe() {
  return <PlanDetailPage planId="pro" />;
}
