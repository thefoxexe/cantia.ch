import { forceLocale } from '../../../lib/translations';
import { PlanDetailPage } from '../../../components/PlanDetailPage';

forceLocale('it');

export default function EntreprisePlanPageIt() {
  return <PlanDetailPage planId="pro" />;
}
