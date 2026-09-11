import { forceLocale } from '../../../lib/translations';
import { PlanDetailPage } from '../../../components/PlanDetailPage';

forceLocale('it');

export default function EquipePlanPageIt() {
  return <PlanDetailPage planId="equipe" />;
}
