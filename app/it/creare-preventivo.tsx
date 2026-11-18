import { forceLocale } from '../../lib/translations';
import { OfferLandingPage } from '../../components/site/OfferLandingPage';

forceLocale('it');

// The Italian quote page (lib/site/offerLanding.ts); /it/solutions/devis
// redirects here.
export default function CrearePreventivoScreen() {
  return <OfferLandingPage locale="it" />;
}
