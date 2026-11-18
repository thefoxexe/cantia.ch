import { forceLocale } from '../../lib/translations';
import { OfferLandingPage } from '../../components/site/OfferLandingPage';

forceLocale('de');

// The German quote page (lib/site/offerLanding.ts); /de/solutions/devis
// redirects here.
export default function OfferteErstellenScreen() {
  return <OfferLandingPage locale="de" />;
}
