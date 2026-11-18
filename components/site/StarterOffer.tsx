import { StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Btn, Eyebrow, Hover } from './Primitives';
import { useSiteLayout } from './Sections';
import { localePrefix, useSiteLocale } from './SiteNav';
import { localHref } from '../../lib/site/localPaths';
import { sans, site } from '../../lib/siteTheme';

// The offer for new companies (3 months instead of 14 days), shown wherever a
// founder may land: home, pricing, trade pages, blog articles. Every link
// carries ?ref=<where>&cta=<variant>: the click is counted as
// starter_offer_click (lib/siteAnalytics.ts) and the request form on the offer
// page sends both with the request, so the admin sees which placement brought it.
// The conditions are those of lib/site/newCompany.ts: nothing else is promised.
export type StarterOfferVariant = 'box' | 'inline' | 'banner';

const COPY = {
  fr: {
    eyebrow: 'Nouvelle entreprise',
    title: 'Vous démarrez ? 3 mois offerts.',
    text: 'Pour les nouvelles entreprises : 3 mois d’essai au lieu de 14 jours, sans engagement, pour faire vos premiers devis et vos premières factures QR.',
    cta: 'Voir l’offre',
    inline: 'Vous créez votre entreprise ? Cantia est offert pendant 3 mois.',
  },
  de: {
    eyebrow: 'Neues Unternehmen',
    title: 'Sie gründen? 3 Monate gratis.',
    text: 'Für neue Unternehmen: 3 Monate Testphase statt 14 Tage, ohne Verpflichtung, für die ersten Offerten und QR-Rechnungen.',
    cta: 'Zum Angebot',
    inline: 'Sie gründen Ihr Unternehmen? Cantia ist 3 Monate gratis.',
  },
  it: {
    eyebrow: 'Nuova impresa',
    title: 'State iniziando? 3 mesi gratis.',
    text: 'Per le nuove imprese: 3 mesi di prova invece di 14 giorni, senza impegno, per i primi preventivi e le prime fatture QR.',
    cta: 'Vedere l’offerta',
    inline: 'State aprendo la vostra impresa? Cantia è gratuito per 3 mesi.',
  },
} as const;

export function starterOfferHref(locale: 'fr' | 'de' | 'it', ref: string, cta: string): string {
  return `${localHref(`${localePrefix(locale)}/nouvelle-entreprise`)}?ref=${encodeURIComponent(ref)}&cta=${encodeURIComponent(cta)}`;
}

export function StarterOffer({ variant = 'box', source }: { variant?: StarterOfferVariant; source: string }) {
  const locale = useSiteLocale();
  const c = COPY[locale];
  const { phone } = useSiteLayout();
  const href = starterOfferHref(locale, source, variant);

  if (variant === 'inline') {
    return (
      <Link href={href as any} asChild>
        <Hover accessibilityRole="link" base={styles.inline} hover={{ borderColor: site.copper }}>
          <Feather name="gift" size={16} color={site.copper} />
          <Text style={[sans, styles.inlineText]}>
            {c.inline} <Text style={{ color: site.copper, fontWeight: '600' }}>{c.cta}</Text>
          </Text>
          <Feather name="arrow-right" size={15} color={site.copper} />
        </Hover>
      </Link>
    );
  }

  if (variant === 'banner') {
    return (
      <Link href={href as any} asChild>
        <Hover accessibilityRole="link" base={styles.banner} hover={{ opacity: 0.9 }}>
          <Text style={[sans, styles.bannerText]} numberOfLines={phone ? 2 : 1}>
            {c.inline} <Text style={{ fontWeight: '700', textDecorationLine: 'underline' }}>{c.cta}</Text>
          </Text>
        </Hover>
      </Link>
    );
  }

  return (
    <View style={[styles.box, phone && { flexDirection: 'column', alignItems: 'flex-start', padding: 24, gap: 18 }]}>
      <View style={styles.badge}>
        <Text style={[sans, styles.badgeBig]}>3</Text>
        <Text style={[sans, styles.badgeSmall]}>{locale === 'de' ? 'Monate' : locale === 'it' ? 'mesi' : 'mois'}</Text>
      </View>
      <View style={{ flex: 1, minWidth: 0, gap: 8 }}>
        <Eyebrow color="#d9aa85">{c.eyebrow}</Eyebrow>
        <Text style={[sans, styles.boxTitle, phone && { fontSize: 24, lineHeight: 29 }]}>{c.title}</Text>
        <Text style={[sans, styles.boxText]}>{c.text}</Text>
      </View>
      <View>
        <Btn label={c.cta} href={href} small={phone} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flexDirection: 'row', alignItems: 'center', gap: 30, backgroundColor: site.ink, borderRadius: 12, paddingVertical: 32, paddingHorizontal: 36 },
  badge: { width: 92, height: 92, borderRadius: 46, borderWidth: 1, borderColor: '#d9aa85', alignItems: 'center', justifyContent: 'center' },
  badgeBig: { fontSize: 38, lineHeight: 40, color: '#f4f3e9', fontWeight: '500', letterSpacing: -1.5 },
  badgeSmall: { fontSize: 11, color: '#d9aa85', fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase' },
  boxTitle: { fontSize: 30, lineHeight: 35, color: '#f4f3e9', fontWeight: '500', letterSpacing: -1 },
  boxText: { fontSize: 13, lineHeight: 22, color: '#b2b9a7', maxWidth: 560 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: site.line, borderRadius: 8, padding: 16, backgroundColor: site.white },
  inlineText: { flex: 1, fontSize: 13, lineHeight: 20, color: site.ink, fontWeight: '500' },
  banner: { backgroundColor: site.ink, paddingVertical: 9, paddingHorizontal: 16, alignItems: 'center' },
  bannerText: { fontSize: 12, lineHeight: 17, color: '#f4f3e9', textAlign: 'center' },
});
