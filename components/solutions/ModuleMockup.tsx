import { View } from 'react-native';
import { DocVisual, PhoneShot, ScreenShot, VoiceBox } from '../site/Sections';
import { useSiteLocale } from '../site/SiteNav';
import { EXPORTS } from '../site/exports';
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

// The hero visual of a module page: a real export of the app (PDF rendered
// with sample data) or a real screen of the app, never a drawn mockup.
export function ModuleMockup({ kind }: { kind: ModuleKind }) {
  const locale = useSiteLocale();
  const X = EXPORTS[locale];
  const L = SITE_PAGES[locale].labels;
  const caption = `${L.realExport} · ${L.sample}`;
  switch (kind) {
    case 'devis':
      return <DocVisual source={X.devis.source} ratio={X.devis.ratio} alt={L.docAlt.signer} caption={caption} />;
    case 'facturation':
      return <DocVisual source={X.facture.source} ratio={X.facture.ratio} alt={L.docAlt.facturer} caption={caption} />;
    case 'rapports-chantier':
      return <DocVisual source={X.rapport.source} ratio={X.rapport.ratio} alt={L.docAlt.collaborer} caption={caption} />;
    case 'planning':
      return <DocVisual source={X.planning.source} ratio={X.planning.ratio} alt={L.docAlt.organiser} caption={caption} maxHeight={900} />;
    case 'rh-salaires':
      return <DocVisual source={{ uri: '/showcase/fiche-salaire.webp' }} ratio={2021 / 1429} alt={L.appScreen} caption={caption} />;
    case 'travaux-supplementaires':
      return <DocVisual source={{ uri: '/showcase/travaux-supplementaires.webp' }} ratio={1853 / 1310} alt={L.appScreen} caption={caption} />;
    case 'dictee-vocale':
      return <VoiceBox />;
    case 'tresorerie':
      return <ScreenShot source={X.app.tres.source} ratio={X.app.tres.ratio} alt={L.treasuryAlt} />;
    case 'rentabilite':
    case 'soumissions':
    default:
      return (
        <View style={{ alignItems: 'center' }}>
          <PhoneShot source={X.app.dashMobile.source} ratio={X.app.dashMobile.ratio} width={250} maxHeight={480} alt={L.appAlt} />
        </View>
      );
  }
}
