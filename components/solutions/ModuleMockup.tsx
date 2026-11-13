import { LaptopShot } from '../site/Laptop';
import { useSiteLocale } from '../site/SiteNav';
import { APP_SCREENS, VOICE_RECORDING } from '../site/appScreens';
import { SITE_PAGES } from '../../lib/site/pages';

export type ModuleKind =
  | 'devis'
  | 'facturation'
  | 'rapports-chantier'
  | 'dictee-vocale'
  | 'planning'
  | 'rentabilite'
  | 'rh-salaires'
  | 'travaux-supplementaires'
  | 'soumissions'
  | 'tresorerie';

// The hero visual of a module page: the real screen of that very feature in
// the app, in a laptop (components/site/appScreens). The dictation page plays
// a recording of the real assistant instead.
export function ModuleMockup({ kind }: { kind: ModuleKind }) {
  const locale = useSiteLocale();
  const L = SITE_PAGES[locale].labels;
  if (kind === 'dictee-vocale') return <LaptopShot video={VOICE_RECORDING[locale]} alt={L.appScreen} />;
  return <LaptopShot source={APP_SCREENS[locale][kind]} alt={L.appScreen} priority />;
}
