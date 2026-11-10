import { Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Link } from 'expo-router';
import { Hover, Wrap } from './Primitives';
import { localePrefix, useSiteLocale } from './SiteNav';
import { sans, site } from '../../lib/siteTheme';
import { SITE_COPY } from '../../lib/site/copy';
import { authHref } from '../../lib/appHost';
import { StatusLink } from '../StatusLink';

const LOGO = require('../../assets/brand/logo.png');

type FooterLink = { label: string; href: string };

// Footer of the public cantia.ch pages: brand column, then three columns
// (software, company, contact) and the legal line.
export function SiteFooter({ languageSwitcher }: { languageSwitcher?: React.ReactNode }) {
  const locale = useSiteLocale();
  const c = SITE_COPY[locale];
  const f = c.footer;
  const p = localePrefix(locale);
  const { width } = useWindowDimensions();
  const phone = width <= 760;
  const tablet = width <= 1100;

  const columns: { title: string; links: FooterLink[] }[] = [
    {
      title: f.software,
      links: [
        ...c.families.map((fam) => ({ label: fam.name, href: `${p}/${fam.slug}` })),
        { label: c.nav.assistant.name, href: `${p}/assistant` },
      ],
    },
    {
      title: f.company,
      links: [
        { label: f.tradeLink, href: `${p}/metiers` },
        { label: f.pricingLink, href: `${p}/tarifs` },
        { label: f.customLink, href: `${p}/sur-mesure` },
        { label: f.ecosystemLink, href: `https://accounting.cantia.ch${p}` },
        { label: f.devicesLink, href: `${p}/telechargement` },
      ],
    },
    {
      title: f.contact,
      links: [
        { label: f.talk, href: `${p}/contact` },
        { label: 'info@cantia.ch', href: 'mailto:info@cantia.ch' },
        { label: '+41 78 450 14 57', href: 'tel:+41784501457' },
        { label: f.help, href: `${p}/aide` },
        { label: f.login, href: authHref('login') as string },
      ],
    },
  ];

  return (
    <View style={styles.footer} role="contentinfo">
      <Wrap>
        <View style={[styles.grid, phone ? styles.gridPhone : tablet ? styles.gridTablet : null]}>
          <View style={[styles.brandCol, phone || tablet ? { width: '100%', maxWidth: '100%' } : { flex: 1.4 }]}>
            <Link href={(p || '/') as any} asChild>
              <Pressable accessibilityRole="link" accessibilityLabel="Cantia">
                <Image source={LOGO} style={{ width: 138, height: 138 * (192 / 1036) }} resizeMode="contain" />
              </Pressable>
            </Link>
            <Text style={[sans, styles.note]}>{f.tagline}</Text>
            <Text style={[sans, styles.note]}>
              {f.madeIn}
              {'\n'}
              {f.languages}
            </Text>
          </View>
          {columns.map((col) => (
            <View key={col.title} style={[phone ? { width: '100%' } : { flex: 1 }]}>
              <Text style={[sans, styles.colTitle]}>{col.title.toUpperCase()}</Text>
              {col.links.map((l) => (
                <FooterAnchor key={l.label} {...l} />
              ))}
            </View>
          ))}
        </View>

        <View style={[styles.bottom, phone && { flexDirection: 'column', alignItems: 'flex-start' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <Text style={[sans, styles.bottomText]}>© {new Date().getFullYear()} Cantia</Text>
            {languageSwitcher}
          </View>
          <View style={styles.bottomLinks}>
            <BottomLink label={f.legal} href={`${p}/mentions-legales`} />
            <BottomLink label={f.privacy} href={`${p}/confidentialite`} />
            <BottomLink label={f.terms} href={`${p}/conditions-generales`} />
            <StatusLink label={locale === 'de' ? 'Status' : locale === 'it' ? 'Stato' : 'Statut'} textStyle={[sans, styles.bottomText] as any} />
          </View>
        </View>
      </Wrap>
    </View>
  );
}

function FooterAnchor({ label, href }: FooterLink) {
  return (
    <Link href={href as any} asChild>
      <Hover accessibilityRole="link" base={styles.anchor}>
        {(hovered) => <Text style={[sans, styles.link, hovered && { color: site.copper }]}>{label}</Text>}
      </Hover>
    </Link>
  );
}

function BottomLink({ label, href }: FooterLink) {
  return (
    <Link href={href as any} asChild>
      <Hover accessibilityRole="link">
        {(hovered) => <Text style={[sans, styles.bottomText, hovered && { color: site.copper }]}>{label}</Text>}
      </Hover>
    </Link>
  );
}

const styles = StyleSheet.create({
  footer: { paddingTop: 47, paddingBottom: 22, backgroundColor: site.bg, borderTopWidth: 1, borderTopColor: site.line },
  grid: { flexDirection: 'row', gap: 40 },
  gridTablet: { flexWrap: 'wrap', rowGap: 34 },
  gridPhone: { flexDirection: 'column', gap: 30 },
  brandCol: { maxWidth: 360 },
  note: { fontSize: 11, color: '#929688', maxWidth: 230, lineHeight: 21, marginTop: 20 },
  colTitle: { fontSize: 10, letterSpacing: 0.8, fontWeight: '600', color: '#818775', marginBottom: 8 },
  anchor: { alignSelf: 'flex-start', paddingVertical: 9 / 2 + 2 },
  link: { fontSize: 11, color: '#6b7360' },
  bottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 20,
    borderTopWidth: 1,
    borderTopColor: site.line,
    paddingTop: 20,
    marginTop: 38,
  },
  bottomText: { fontSize: 9, color: '#929687' },
  bottomLinks: { flexDirection: 'row', gap: 20, flexWrap: 'wrap' },
});
