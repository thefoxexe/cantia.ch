import { ScrollView } from 'react-native';
import { Screen } from '../components/ui';
import { MarketingHead } from '../components/MarketingHead';
import { MarketingFooter, MarketingNav } from '../components/MarketingChrome';
import { PricingSection } from '../components/PricingSection';
import { marketingPageTitle } from '../lib/marketingSeoTitles';
import { getAppLocale } from '../lib/translations';

// Standalone, indexable pricing page — the homepage already has a #pricing
// section (scrolled into view from the nav), but an external directory
// (Capterra, GetApp…) wants one stable URL to link as "pricing", not a hash
// anchor. Reuses PricingSection as-is (it fetches live plan data itself and
// already renders its own eyebrow/title/subtitle/FAQ-adjacent contact link),
// so this page never drifts out of sync with the real prices.
export default function TarifsPage() {
  const locale = getAppLocale();
  return (
    <Screen style={{ padding: 0 }}>
      <MarketingHead
        title={marketingPageTitle('tarifs', locale)}
        description="Les tarifs de Cantia, le logiciel suisse de gestion pour entreprises du bâtiment : devis, factures, chantiers, RH et trésorerie. Sans engagement, essai gratuit."
      />
      <MarketingNav />
      <ScrollView>
        <PricingSection />
        <MarketingFooter />
      </ScrollView>
    </Screen>
  );
}
