import { ScrollView } from 'react-native';
import { Screen } from '../components/ui';
import { MarketingHead } from '../components/MarketingHead';
import { MarketingFooter, MarketingNav } from '../components/MarketingChrome';
import { PricingSection } from '../components/PricingSection';
import { PageHero } from '../components/landing/PageHero';
import { marketingPageTitle } from '../lib/marketingSeoTitles';
import { authHref } from '../lib/appHost';
import { getAppLocale } from '../lib/translations';

// Standalone, indexable pricing page — the homepage already has a #pricing
// section (scrolled into view from the nav), but an external directory
// (Capterra, GetApp…) wants one stable URL to link as "pricing", not a hash
// anchor. This is also now the destination of the "Voir les tarifs" sitelink
// on the /logiciel-chantier Google Ads campaign, so it needs its own hero
// rather than dropping straight into the price table with no context.
// PricingSection itself is reused as-is (it fetches live plan data and
// already renders its own eyebrow/title/subtitle), so this page never
// drifts out of sync with the real prices.
export default function TarifsPage() {
  const locale = getAppLocale();
  return (
    <Screen style={{ padding: 0 }}>
      <MarketingHead
        title={marketingPageTitle('tarifs', locale)}
        description="Les tarifs de Cantia, le logiciel suisse de gestion pour entreprises du bâtiment : devis, factures, chantiers, RH et trésorerie. Sans engagement, 14 jours d’essai."
      />
      <MarketingNav />
      <ScrollView>
        <PageHero
          kicker="Tarifs · Sans engagement"
          title="Un abonnement, aucune mauvaise surprise"
          lede="Devis et factures illimités sur chaque formule, dès le premier jour : pas de quota mensuel qui se déclenche en pleine saison. 14 jours d’essai, résiliable à tout moment depuis votre compte."
          cta={{ title: 'Essayer 14 jours', href: authHref('signup') }}
          cartouche={[
            { label: 'Devis et factures', value: 'Illimités, sur toutes les formules' },
            { label: 'Essai', value: '14 jours, sans engagement' },
            { label: 'Résiliation', value: 'À tout moment, depuis votre compte' },
            { label: 'Hébergement', value: 'Zurich, Suisse' },
          ]}
        />
        <PricingSection />
        <MarketingFooter />
      </ScrollView>
    </Screen>
  );
}
