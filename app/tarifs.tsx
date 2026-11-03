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
type Copy = {
  description: string;
  kicker: string;
  title: string;
  lede: string;
  cta: string;
  cartouche: { label: string; value: string }[];
};

// /de/tarifs and /it/tarifs render this same page (app/de/tarifs.tsx,
// app/it/tarifs.tsx force the locale); PricingSection is already translated.
const COPY: Record<'fr' | 'de' | 'it', Copy> = {
  fr: {
    description:
      'Les tarifs de Cantia, le logiciel suisse de gestion pour entreprises du bâtiment : devis, factures, chantiers, RH et trésorerie. Sans engagement, 14 jours d’essai.',
    kicker: 'Tarifs · Sans engagement',
    title: 'Un abonnement, aucune mauvaise surprise',
    lede: 'Devis et factures illimités sur chaque formule, dès le premier jour : pas de quota mensuel qui se déclenche en pleine saison. 14 jours d’essai, résiliable à tout moment depuis votre compte.',
    cta: 'Essayer 14 jours',
    cartouche: [
      { label: 'Devis et factures', value: 'Illimités, sur toutes les formules' },
      { label: 'Essai', value: '14 jours, sans engagement' },
      { label: 'Résiliation', value: 'À tout moment, depuis votre compte' },
      { label: 'Hébergement', value: 'Zurich, Suisse' },
    ],
  },
  de: {
    description:
      'Die Preise von Cantia, der Schweizer Software für Bauunternehmen: Offerten, Rechnungen, Baustellen, Personal und Liquidität. 14 Tage gratis testen.',
    kicker: 'Preise · Ohne Vertragsbindung',
    title: 'Ein Abo, keine bösen Überraschungen',
    lede: 'Unbegrenzt Offerten und Rechnungen in jedem Paket, ab dem ersten Tag: kein Monatskontingent, das mitten in der Saison greift. 14 Tage testen, jederzeit im eigenen Konto kündbar.',
    cta: '14 Tage testen',
    cartouche: [
      { label: 'Offerten und Rechnungen', value: 'Unbegrenzt, in allen Paketen' },
      { label: 'Testphase', value: '14 Tage, ohne Verpflichtung' },
      { label: 'Kündigung', value: 'Jederzeit, im eigenen Konto' },
      { label: 'Hosting', value: 'Zürich, Schweiz' },
    ],
  },
  it: {
    description:
      'I prezzi di Cantia, il software svizzero per le imprese edili: preventivi, fatture, cantieri, personale e liquidità. 14 giorni di prova gratuita.',
    kicker: 'Prezzi · Senza vincoli',
    title: 'Un abbonamento, nessuna brutta sorpresa',
    lede: 'Preventivi e fatture illimitati in ogni piano, dal primo giorno: nessuna quota mensile che scatta in piena stagione. 14 giorni di prova, disdicibile in qualsiasi momento dal suo account.',
    cta: 'Provi 14 giorni',
    cartouche: [
      { label: 'Preventivi e fatture', value: 'Illimitati, in tutti i piani' },
      { label: 'Prova', value: '14 giorni, senza impegno' },
      { label: 'Disdetta', value: 'In qualsiasi momento, dal suo account' },
      { label: 'Hosting', value: 'Zurigo, Svizzera' },
    ],
  },
};

export default function TarifsPage() {
  const locale = getAppLocale();
  const copy = COPY[locale] ?? COPY.fr;
  return (
    <Screen style={{ padding: 0 }}>
      <MarketingHead title={marketingPageTitle('tarifs', locale)} description={copy.description} />
      <MarketingNav />
      <ScrollView>
        <PageHero
          kicker={copy.kicker}
          title={copy.title}
          lede={copy.lede}
          cta={{ title: copy.cta, href: authHref('signup') }}
          cartouche={copy.cartouche}
        />
        <PricingSection />
        <MarketingFooter />
      </ScrollView>
    </Screen>
  );
}
